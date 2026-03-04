import { Property, PropertyFilters, FilterOptions } from '@/types/property';
import fs from 'fs';
import path from 'path';

let cachedData: Property[] | null = null;

function loadRawData(): Record<string, unknown>[] {
  const filePath = path.join(process.cwd(), 'data', 'properties.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw);
}

function mapToProperty(raw: Record<string, unknown>): Property {
  const juso = raw.juso as Record<string, string> | null;
  const nearSubwayStations = (raw.nearSubwayStations as Array<{
    name: string;
    walkTime: number;
    lineNames: string[];
  }>) || [];
  const priorities = (raw.priorities as Array<{
    value: string;
    priority: number;
  }>) || [];

  return {
    id: raw.id as string,
    danjiName: (raw.danjiName as string) || '',
    roadAddress: (raw.roadAddress as string) || '',
    juso: {
      siNm: juso?.siNm || '',
      sggNm: juso?.sggNm || '',
      emdNm: juso?.emdNm || '',
      bdNm: juso?.bdNm || '',
      roadAddr: juso?.roadAddr || '',
      jibunAddr: juso?.jibunAddr || '',
    },
    buildingType: (raw.buildingType as string) || '',
    architecture: (raw.architecture as string) || '',
    deposit: (raw.deposit as number) || 0,
    monthlyRent: (raw.monthlyRent as number) || 0,
    exclusiveArea: (raw.exclusiveArea as number) || 0,
    totalArea: (raw.totalArea as number) || 0,
    latitude: (raw.latitude as number) || 0,
    longitude: (raw.longitude as number) || 0,
    numberOfSupply: (raw.numberOfSupply as number) || 0,
    completionDate: (raw.completionDate as string) || null,
    applicationStartDate: (raw.applicationStartDate as string) || null,
    applicationEndDate: (raw.applicationEndDate as string) || null,
    applicationUrl: (raw.applicationUrl as string) || '',
    inquiryConsultation: (raw.inquiryConsultation as string) || '',
    buildingImageUrls: (raw.buildingImageUrls as string[]) || [],
    nearSubwayStations,
    priorities,
    accumulatedCallCount: (raw.accumulatedCallCount as number) || 0,
    accumulatedJjimCount: (raw.accumulatedJjimCount as number) || 0,
    residencePeriod: (raw.residencePeriod as number) || 0,
    discountRate: (raw.discountRate as number) || 0,
    minConvertibleDeposit: (raw.minConvertibleDeposit as number) || 0,
    maxConvertibleDeposit: (raw.maxConvertibleDeposit as number) || 0,
    depositConversionRate: (raw.depositConversionRate as number) || 0,
    monthlyRentConversionRate: (raw.monthlyRentConversionRate as number) || 0,
    maintenanceCost: raw.maintenanceCost != null ? (raw.maintenanceCost as number) : null,
  };
}

export function getAllProperties(): Property[] {
  if (cachedData) return cachedData;
  const rawData = loadRawData();
  cachedData = rawData.map(mapToProperty);
  return cachedData;
}

export function getFilterOptions(): FilterOptions {
  const data = getAllProperties();

  const gugunSet = new Set<string>();
  const buildingTypeSet = new Set<string>();
  const architectureSet = new Set<string>();
  let minDeposit = Infinity;
  let maxDeposit = -Infinity;
  let minRent = Infinity;
  let maxRent = -Infinity;
  let minArea = Infinity;
  let maxArea = -Infinity;

  for (const p of data) {
    if (p.juso.sggNm) gugunSet.add(p.juso.sggNm);
    if (p.buildingType) buildingTypeSet.add(p.buildingType);
    if (p.architecture) architectureSet.add(p.architecture);
    if (p.deposit < minDeposit) minDeposit = p.deposit;
    if (p.deposit > maxDeposit) maxDeposit = p.deposit;
    if (p.monthlyRent < minRent) minRent = p.monthlyRent;
    if (p.monthlyRent > maxRent) maxRent = p.monthlyRent;
    if (p.exclusiveArea < minArea) minArea = p.exclusiveArea;
    if (p.exclusiveArea > maxArea) maxArea = p.exclusiveArea;
  }

  return {
    gugun: [...gugunSet].sort(),
    buildingType: [...buildingTypeSet].sort(),
    architecture: [...architectureSet].sort(),
    depositRange: {
      min: minDeposit === Infinity ? 0 : minDeposit,
      max: maxDeposit === -Infinity ? 0 : maxDeposit,
    },
    monthlyRentRange: {
      min: minRent === Infinity ? 0 : minRent,
      max: maxRent === -Infinity ? 0 : maxRent,
    },
    areaRange: {
      min: minArea === Infinity ? 0 : minArea,
      max: maxArea === -Infinity ? 0 : maxArea,
    },
  };
}

export function filterAndSortProperties(filters: PropertyFilters): {
  data: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  let data = [...getAllProperties()];

  // Filter
  if (filters.gugun && filters.gugun.length > 0) {
    data = data.filter(p => filters.gugun!.includes(p.juso.sggNm));
  }
  if (filters.buildingType && filters.buildingType.length > 0) {
    data = data.filter(p => filters.buildingType!.includes(p.buildingType));
  }
  if (filters.architecture && filters.architecture.length > 0) {
    data = data.filter(p => filters.architecture!.includes(p.architecture));
  }
  if (filters.minDeposit !== undefined) {
    const minWon = filters.minDeposit * 10000;
    data = data.filter(p => p.deposit >= minWon);
  }
  if (filters.maxDeposit !== undefined) {
    const maxWon = filters.maxDeposit * 10000;
    data = data.filter(p => p.deposit <= maxWon);
  }
  if (filters.minMonthlyRent !== undefined) {
    const minWon = filters.minMonthlyRent * 10000;
    data = data.filter(p => p.monthlyRent >= minWon);
  }
  if (filters.maxMonthlyRent !== undefined) {
    const maxWon = filters.maxMonthlyRent * 10000;
    data = data.filter(p => p.monthlyRent <= maxWon);
  }
  if (filters.minArea !== undefined) {
    data = data.filter(p => p.exclusiveArea >= filters.minArea!);
  }
  if (filters.maxArea !== undefined) {
    data = data.filter(p => p.exclusiveArea <= filters.maxArea!);
  }

  // Sort
  switch (filters.sort) {
    case 'deposit_asc':
      data.sort((a, b) => a.deposit - b.deposit);
      break;
    case 'deposit_desc':
      data.sort((a, b) => b.deposit - a.deposit);
      break;
    case 'rent_asc':
      data.sort((a, b) => a.monthlyRent - b.monthlyRent);
      break;
    case 'rent_desc':
      data.sort((a, b) => b.monthlyRent - a.monthlyRent);
      break;
    case 'area_asc':
      data.sort((a, b) => a.exclusiveArea - b.exclusiveArea);
      break;
    case 'area_desc':
      data.sort((a, b) => b.exclusiveArea - a.exclusiveArea);
      break;
    case 'popular':
      data.sort((a, b) => b.accumulatedCallCount - a.accumulatedCallCount);
      break;
    case 'supply_desc':
      data.sort((a, b) => b.numberOfSupply - a.numberOfSupply);
      break;
    default:
      // Default: by accumulatedCallCount desc (popular first)
      data.sort((a, b) => b.accumulatedCallCount - a.accumulatedCallCount);
  }

  const total = data.length;
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;
  const paginated = data.slice(offset, offset + limit);

  return { data: paginated, total, page, limit, totalPages };
}

export function getPropertyById(id: string): Property | undefined {
  return getAllProperties().find(p => p.id === id);
}

export function getMapMarkers(filters: PropertyFilters): Property[] {
  let data = getAllProperties();

  if (filters.gugun && filters.gugun.length > 0) {
    data = data.filter(p => filters.gugun!.includes(p.juso.sggNm));
  }
  if (filters.buildingType && filters.buildingType.length > 0) {
    data = data.filter(p => filters.buildingType!.includes(p.buildingType));
  }
  if (filters.architecture && filters.architecture.length > 0) {
    data = data.filter(p => filters.architecture!.includes(p.architecture));
  }
  if (filters.minDeposit !== undefined) {
    const minWon = filters.minDeposit * 10000;
    data = data.filter(p => p.deposit >= minWon);
  }
  if (filters.maxDeposit !== undefined) {
    const maxWon = filters.maxDeposit * 10000;
    data = data.filter(p => p.deposit <= maxWon);
  }
  if (filters.minMonthlyRent !== undefined) {
    const minWon = filters.minMonthlyRent * 10000;
    data = data.filter(p => p.monthlyRent >= minWon);
  }
  if (filters.maxMonthlyRent !== undefined) {
    const maxWon = filters.maxMonthlyRent * 10000;
    data = data.filter(p => p.monthlyRent <= maxWon);
  }
  if (filters.minArea !== undefined) {
    data = data.filter(p => p.exclusiveArea >= filters.minArea!);
  }
  if (filters.maxArea !== undefined) {
    data = data.filter(p => p.exclusiveArea <= filters.maxArea!);
  }

  return data.filter(p => p.latitude && p.longitude);
}
