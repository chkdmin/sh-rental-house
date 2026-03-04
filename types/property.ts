export interface SubwayStation {
  name: string;
  walkTime: number;
  lineNames: string[];
}

export interface Priority {
  value: string;
  priority: number;
}

export interface Juso {
  siNm: string;
  sggNm: string;
  emdNm: string;
  bdNm: string;
  roadAddr: string;
  jibunAddr: string;
}

export interface Property {
  id: string;
  danjiName: string;
  roadAddress: string;
  juso: Juso;
  buildingType: string;
  architecture: string;
  deposit: number;
  monthlyRent: number;
  exclusiveArea: number;
  totalArea: number;
  latitude: number;
  longitude: number;
  numberOfSupply: number;
  completionDate: string | null;
  applicationStartDate: string | null;
  applicationEndDate: string | null;
  applicationUrl: string;
  inquiryConsultation: string;
  buildingImageUrls: string[];
  nearSubwayStations: SubwayStation[];
  priorities: Priority[];
  accumulatedCallCount: number;
  accumulatedJjimCount: number;
  residencePeriod: number;
  discountRate: number;
  minConvertibleDeposit: number;
  maxConvertibleDeposit: number;
  depositConversionRate: number;
  monthlyRentConversionRate: number;
  maintenanceCost: number | null;
}

export interface PropertyListResponse {
  data: Property[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOptions {
  gugun: string[];
  buildingType: string[];
  architecture: string[];
  depositRange: { min: number; max: number };
  monthlyRentRange: { min: number; max: number };
  areaRange: { min: number; max: number };
}

export interface PropertyFilters {
  gugun?: string[];
  buildingType?: string[];
  architecture?: string[];
  minDeposit?: number;
  maxDeposit?: number;
  minMonthlyRent?: number;
  maxMonthlyRent?: number;
  minArea?: number;
  maxArea?: number;
  sort?: 'deposit_asc' | 'deposit_desc' | 'rent_asc' | 'rent_desc' | 'area_asc' | 'area_desc' | 'popular' | 'supply_desc';
  page?: number;
  limit?: number;
}
