'use client';

import FilterPanel from '@/components/Filters/FilterPanel';
import PropertyDetailModal from '@/components/PropertyDetail/PropertyDetailModal';
import PropertyList from '@/components/PropertyList/PropertyList';
import { useFavorites } from '@/hooks/useFavorites';
import { FilterOptions, Property, PropertyFilters, PropertyListResponse } from '@/types/property';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const KakaoMap = dynamic(() => import('@/components/Map/KakaoMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
      <div className="text-gray-400 flex flex-col items-center gap-2">
        <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 7m0 13V7m0 0L9 4" /></svg>
        <span>지도를 불러오는 중...</span>
      </div>
    </div>
  ),
});

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [properties, setProperties] = useState<Property[]>([]);
  const [mapProperties, setMapProperties] = useState<Property[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedMapPropertyId, setSelectedMapPropertyId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'list' | 'map'>('list');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const { favorites, isFavorite, toggleFavorite, count: favoritesCount } = useFavorites();

  const getFiltersFromUrl = useCallback((): PropertyFilters => {
    return {
      gugun: searchParams.get('gugun')?.split(',').filter(Boolean) || [],
      buildingType: searchParams.get('buildingType')?.split(',').filter(Boolean) || [],
      architecture: searchParams.get('architecture')?.split(',').filter(Boolean) || [],
      minDeposit: searchParams.get('minDeposit') ? parseInt(searchParams.get('minDeposit')!, 10) : undefined,
      maxDeposit: searchParams.get('maxDeposit') ? parseInt(searchParams.get('maxDeposit')!, 10) : undefined,
      minMonthlyRent: searchParams.get('minMonthlyRent') ? parseInt(searchParams.get('minMonthlyRent')!, 10) : undefined,
      maxMonthlyRent: searchParams.get('maxMonthlyRent') ? parseInt(searchParams.get('maxMonthlyRent')!, 10) : undefined,
      minArea: searchParams.get('minArea') ? parseFloat(searchParams.get('minArea')!) : undefined,
      maxArea: searchParams.get('maxArea') ? parseFloat(searchParams.get('maxArea')!) : undefined,
      sort: (searchParams.get('sort') as PropertyFilters['sort']) || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<PropertyFilters>(getFiltersFromUrl);

  const updateUrl = useCallback((newFilters: PropertyFilters) => {
    const params = new URLSearchParams();

    if (newFilters.gugun && newFilters.gugun.length > 0) params.set('gugun', newFilters.gugun.join(','));
    if (newFilters.buildingType && newFilters.buildingType.length > 0) params.set('buildingType', newFilters.buildingType.join(','));
    if (newFilters.architecture && newFilters.architecture.length > 0) params.set('architecture', newFilters.architecture.join(','));
    if (newFilters.minDeposit !== undefined) params.set('minDeposit', String(newFilters.minDeposit));
    if (newFilters.maxDeposit !== undefined) params.set('maxDeposit', String(newFilters.maxDeposit));
    if (newFilters.minMonthlyRent !== undefined) params.set('minMonthlyRent', String(newFilters.minMonthlyRent));
    if (newFilters.maxMonthlyRent !== undefined) params.set('maxMonthlyRent', String(newFilters.maxMonthlyRent));
    if (newFilters.minArea !== undefined) params.set('minArea', String(newFilters.minArea));
    if (newFilters.maxArea !== undefined) params.set('maxArea', String(newFilters.maxArea));
    if (newFilters.sort) params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));

    const queryString = params.toString();
    router.push(queryString ? `?${queryString}` : '/', { scroll: false });
  }, [router]);

  // 필터 옵션 로드
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const res = await fetch('/api/filters');
        if (res.ok) setFilterOptions(await res.json());
      } catch (error) {
        console.error('Failed to load filter options:', error);
      }
    }
    loadFilterOptions();
  }, []);

  const createSearchParams = useCallback((f: PropertyFilters) => {
    const params = new URLSearchParams();
    if (f.gugun && f.gugun.length > 0) params.set('gugun', f.gugun.join(','));
    if (f.buildingType && f.buildingType.length > 0) params.set('buildingType', f.buildingType.join(','));
    if (f.architecture && f.architecture.length > 0) params.set('architecture', f.architecture.join(','));
    if (f.minDeposit !== undefined) params.set('minDeposit', String(f.minDeposit));
    if (f.maxDeposit !== undefined) params.set('maxDeposit', String(f.maxDeposit));
    if (f.minMonthlyRent !== undefined) params.set('minMonthlyRent', String(f.minMonthlyRent));
    if (f.maxMonthlyRent !== undefined) params.set('maxMonthlyRent', String(f.maxMonthlyRent));
    if (f.minArea !== undefined) params.set('minArea', String(f.minArea));
    if (f.maxArea !== undefined) params.set('maxArea', String(f.maxArea));
    return params;
  }, []);

  // 리스트 데이터 로드
  useEffect(() => {
    async function loadProperties() {
      setIsLoading(true);
      try {
        const params = createSearchParams(filters);
        if (filters.sort) params.set('sort', filters.sort);
        params.set('page', String(filters.page || 1));
        params.set('limit', String(filters.limit || 20));

        const res = await fetch(`/api/properties?${params.toString()}`);
        if (res.ok) {
          const data: PropertyListResponse = await res.json();
          setProperties(data.data);
          setTotal(data.total);
          setTotalPages(data.totalPages);
        }
      } catch (error) {
        console.error('Failed to load properties:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadProperties();
  }, [filters, createSearchParams]);

  // 지도 마커 로드
  useEffect(() => {
    async function loadMapMarkers() {
      try {
        const params = createSearchParams(filters);
        const res = await fetch(`/api/properties/markers?${params.toString()}`);
        if (res.ok) {
          const response = await res.json();
          setMapProperties(response.data);
        }
      } catch (error) {
        console.error('Failed to load map markers:', error);
      }
    }
    loadMapMarkers();
  }, [
    filters.gugun,
    filters.buildingType,
    filters.architecture,
    filters.minDeposit,
    filters.maxDeposit,
    filters.minMonthlyRent,
    filters.maxMonthlyRent,
    filters.minArea,
    filters.maxArea,
    createSearchParams,
  ]);

  const handleFiltersChange = useCallback((newFilters: PropertyFilters) => {
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [updateUrl]);

  const handlePageChange = useCallback((page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateUrl(newFilters);
  }, [filters, updateUrl]);

  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property);
  }, []);

  const handleMapClick = useCallback((property: Property) => {
    setSelectedMapPropertyId(property.id);
    setActiveTab('map');
  }, []);

  const handleFavoritesToggle = useCallback(() => {
    setShowFavoritesOnly(prev => !prev);
  }, []);

  const displayProperties = showFavoritesOnly
    ? properties.filter(p => favorites.includes(p.id))
    : properties;

  const displayMapProperties = showFavoritesOnly
    ? mapProperties.filter(p => favorites.includes(p.id))
    : mapProperties;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background font-sans text-foreground">
      {/* 헤더 */}
      <header className="bg-primary text-white shadow-lg shrink-0 z-20 relative">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight">SH 매입임대</h1>
              <p className="text-xs text-blue-100 font-light mt-0.5 opacity-80">서울주택도시공사 매입임대주택 매물 검색</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://www.i-sh.co.kr/main/lay2/program/S1T294C295/www/brd/m_241/view.do?seq=301067"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-white/90"
            >
              <span>공고 원문</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </div>
      </header>

      {/* 모바일 탭 */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white shrink-0 shadow-sm z-10">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-3 text-sm font-medium transition-all relative ${activeTab === 'list' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          매물 목록
          {activeTab === 'list' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-4 rounded-t-full" />}
        </button>
        <button
          onClick={() => setActiveTab('map')}
          className={`flex-1 py-3 text-sm font-medium transition-all relative ${activeTab === 'map' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
        >
          지도
          {activeTab === 'map' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary mx-4 rounded-t-full" />}
        </button>
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className={`px-6 py-3 text-sm font-medium border-l border-gray-100 flex items-center gap-1 ${isFilterOpen ? 'text-primary bg-primary/5' : 'text-gray-600'}`}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
          필터
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* 좌측: 필터 (데스크탑) */}
        <div className="hidden lg:flex flex-col w-[320px] shrink-0 border-r border-gray-200 bg-white z-10">
          <FilterPanel filterOptions={filterOptions} filters={filters} onFiltersChange={handleFiltersChange} onFavoritesToggle={handleFavoritesToggle} showFavoritesOnly={showFavoritesOnly} favoritesCount={favoritesCount} />
        </div>

        {/* 모바일 필터 오버레이 */}
        {isFilterOpen && (
          <div className="lg:hidden absolute inset-0 z-30 bg-white">
            <FilterPanel filterOptions={filterOptions} filters={filters} onFiltersChange={handleFiltersChange} onFavoritesToggle={handleFavoritesToggle} showFavoritesOnly={showFavoritesOnly} favoritesCount={favoritesCount} />
            <button onClick={() => setIsFilterOpen(false)} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-full shadow-lg text-sm font-medium">
              필터 닫기
            </button>
          </div>
        )}

        {/* 리스트 패널 */}
        <div className={`flex-col bg-muted/30 transition-all duration-300 ease-in-out ${
          activeTab === 'list'
            ? 'flex w-full lg:w-[450px] xl:w-[500px] shrink-0 border-r border-gray-200 z-0'
            : 'hidden lg:flex w-[450px] xl:w-[500px] shrink-0 border-r border-gray-200 z-0'
        }`}>
          <PropertyList
            properties={displayProperties}
            isLoading={isLoading}
            total={showFavoritesOnly ? displayProperties.length : total}
            page={filters.page || 1}
            totalPages={showFavoritesOnly ? 1 : totalPages}
            onPageChange={handlePageChange}
            isFavorite={isFavorite}
            onFavoriteToggle={toggleFavorite}
            onPropertyClick={handlePropertyClick}
            onMapClick={handleMapClick}
          />
        </div>

        {/* 우측: 지도 */}
        <div className={`flex-1 relative ${activeTab === 'map' ? 'flex' : 'hidden lg:flex'}`}>
          <KakaoMap
            properties={displayMapProperties}
            selectedPropertyId={selectedMapPropertyId}
            onPropertySelect={handlePropertyClick}
            className="w-full h-full"
            isVisible={activeTab === 'map'}
          />
          <div className="absolute top-4 left-4 z-[1] bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg border border-white/50 hidden md:block">
            <p className="text-xs font-medium text-gray-500">지도에서 매물을 클릭하여 상세정보를 확인하세요</p>
          </div>
        </div>
      </div>

      {/* 상세 모달 */}
      {selectedProperty && (
        <PropertyDetailModal property={selectedProperty} onClose={() => setSelectedProperty(null)} />
      )}
    </div>
  );
}
