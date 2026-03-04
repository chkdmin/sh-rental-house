'use client';

import { DepositMode } from '@/lib/depositConversion';
import { FilterOptions, PropertyFilters } from '@/types/property';
import { useCallback, useEffect, useState } from 'react';

interface FilterPanelProps {
  filterOptions: FilterOptions | null;
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  onFavoritesToggle?: () => void;
  showFavoritesOnly?: boolean;
  favoritesCount?: number;
  depositMode?: DepositMode;
  onDepositModeChange?: (mode: DepositMode) => void;
}

export default function FilterPanel({
  filterOptions,
  filters,
  onFiltersChange,
  onFavoritesToggle,
  showFavoritesOnly = false,
  favoritesCount = 0,
  depositMode = 'default',
  onDepositModeChange,
}: FilterPanelProps) {
  const [localFilters, setLocalFilters] = useState<PropertyFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = useCallback((newFilters: Partial<PropertyFilters>) => {
    const updated = { ...localFilters, ...newFilters, page: 1 };
    setLocalFilters(updated);
    onFiltersChange(updated);
  }, [localFilters, onFiltersChange]);

  const toggleGugun = (gugun: string) => {
    const current = localFilters.gugun || [];
    const newGugun = current.includes(gugun)
      ? current.filter(g => g !== gugun)
      : [...current, gugun];
    handleFilterChange({ gugun: newGugun });
  };

  const toggleBuildingType = (type: string) => {
    const current = localFilters.buildingType || [];
    const newTypes = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type];
    handleFilterChange({ buildingType: newTypes });
  };

  const toggleArchitecture = (arch: string) => {
    const current = localFilters.architecture || [];
    const newArch = current.includes(arch)
      ? current.filter(a => a !== arch)
      : [...current, arch];
    handleFilterChange({ architecture: newArch });
  };

  const handleDepositChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (type === 'min') {
      handleFilterChange({ minDeposit: numValue });
    } else {
      handleFilterChange({ maxDeposit: numValue });
    }
  };

  const handleRentChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (type === 'min') {
      handleFilterChange({ minMonthlyRent: numValue });
    } else {
      handleFilterChange({ maxMonthlyRent: numValue });
    }
  };

  const handleAreaChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value);
    if (type === 'min') {
      handleFilterChange({ minArea: numValue });
    } else {
      handleFilterChange({ maxArea: numValue });
    }
  };

  const handleSortChange = (sort: PropertyFilters['sort']) => {
    handleFilterChange({ sort });
  };

  const resetFilters = () => {
    const reset: PropertyFilters = {
      gugun: [],
      buildingType: [],
      architecture: [],
      minDeposit: undefined,
      maxDeposit: undefined,
      minMonthlyRent: undefined,
      maxMonthlyRent: undefined,
      minArea: undefined,
      maxArea: undefined,
      sort: undefined,
      page: 1,
      limit: 20,
    };
    setLocalFilters(reset);
    onFiltersChange(reset);
  };

  const removeFilterChip = (type: string, value: string) => {
    if (type === 'gugun') toggleGugun(value);
    else if (type === 'buildingType') toggleBuildingType(value);
    else if (type === 'architecture') toggleArchitecture(value);
    else if (type === 'minDeposit') handleFilterChange({ minDeposit: undefined });
    else if (type === 'maxDeposit') handleFilterChange({ maxDeposit: undefined });
    else if (type === 'minMonthlyRent') handleFilterChange({ minMonthlyRent: undefined });
    else if (type === 'maxMonthlyRent') handleFilterChange({ maxMonthlyRent: undefined });
    else if (type === 'minArea') handleFilterChange({ minArea: undefined });
    else if (type === 'maxArea') handleFilterChange({ maxArea: undefined });
  };

  const selectedGugun = localFilters.gugun || [];
  const selectedBuildingType = localFilters.buildingType || [];
  const selectedArchitecture = localFilters.architecture || [];
  const hasActiveFilters =
    selectedGugun.length > 0 ||
    selectedBuildingType.length > 0 ||
    selectedArchitecture.length > 0 ||
    localFilters.minDeposit !== undefined ||
    localFilters.maxDeposit !== undefined ||
    localFilters.minMonthlyRent !== undefined ||
    localFilters.maxMonthlyRent !== undefined ||
    localFilters.minArea !== undefined ||
    localFilters.maxArea !== undefined;

  return (
    <div className="bg-white border-b lg:border-r lg:border-b-0 flex flex-col h-full">
      <div className="p-5 flex-1 overflow-y-auto custom-scrollbar space-y-8">

        {/* 즐겨찾기 */}
        {onFavoritesToggle && (
          <div
            onClick={onFavoritesToggle}
            className={`cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 flex items-center justify-between group ${
              showFavoritesOnly
                ? 'bg-amber-50 border-amber-300 shadow-sm'
                : 'bg-white border-gray-100 hover:border-amber-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${showFavoritesOnly ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 group-hover:bg-amber-50 group-hover:text-amber-500'} transition-colors`}>
                <svg className="w-5 h-5" fill={showFavoritesOnly ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <span className={`font-bold ${showFavoritesOnly ? 'text-amber-900' : 'text-gray-600'}`}>즐겨찾기 모아보기</span>
            </div>
            <span className={`text-sm font-semibold px-2 py-1 rounded-md ${showFavoritesOnly ? 'bg-amber-200 text-amber-900' : 'bg-gray-100 text-gray-500'}`}>
              {favoritesCount}
            </span>
          </div>
        )}

        {/* 활성 필터 칩 */}
        {hasActiveFilters && (
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">적용된 필터</h3>
              <button onClick={resetFilters} className="text-xs text-red-500 hover:underline">모두 지우기</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedGugun.map(g => (
                <span key={g} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {g}
                  <button onClick={() => removeFilterChip('gugun', g)} className="ml-1 hover:text-primary-dark">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </span>
              ))}
              {selectedBuildingType.map(t => (
                <span key={t} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                  {t}
                  <button onClick={() => removeFilterChip('buildingType', t)} className="ml-1 hover:text-blue-900">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </span>
              ))}
              {selectedArchitecture.map(a => (
                <span key={a} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                  {a}
                  <button onClick={() => removeFilterChip('architecture', a)} className="ml-1 hover:text-green-900">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 보증금 전환 설정 */}
        {onDepositModeChange && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              보증금/월세 전환
            </label>
            <p className="text-xs text-gray-500 -mt-1">보증금을 높이면 월세가 낮아지고, 보증금을 낮추면 월세가 높아집니다.</p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => onDepositModeChange('min')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border text-center ${
                  depositMode === 'min'
                    ? 'bg-green-50 text-green-700 border-green-300 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold">최소 보증금</div>
                <div className="text-[10px] mt-0.5 opacity-70">월세↑</div>
              </button>
              <button
                onClick={() => onDepositModeChange('default')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border text-center ${
                  depositMode === 'default'
                    ? 'bg-primary/10 text-primary border-primary/30 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold">기본</div>
                <div className="text-[10px] mt-0.5 opacity-70">공고 기준</div>
              </button>
              <button
                onClick={() => onDepositModeChange('max')}
                className={`py-2.5 px-2 rounded-xl text-xs font-medium transition-all border text-center ${
                  depositMode === 'max'
                    ? 'bg-blue-50 text-blue-700 border-blue-300 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-bold">최대 보증금</div>
                <div className="text-[10px] mt-0.5 opacity-70">월세↓</div>
              </button>
            </div>
          </div>
        )}

        {/* 정렬 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900">정렬 기준</label>
          <div className="relative">
            <select
              value={localFilters.sort || ''}
              onChange={(e) => handleSortChange(e.target.value as PropertyFilters['sort'])}
              className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer hover:border-gray-300"
            >
              <option value="">인기순</option>
              <option value="deposit_asc">보증금 낮은순</option>
              <option value="deposit_desc">보증금 높은순</option>
              <option value="rent_asc">월세 낮은순</option>
              <option value="rent_desc">월세 높은순</option>
              <option value="area_asc">면적 작은순</option>
              <option value="area_desc">면적 큰순</option>
              <option value="supply_desc">공급 많은순</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* 구 선택 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900 flex justify-between">
            자치구
            <span className="text-xs font-normal text-gray-500">다중 선택 가능</span>
          </label>
          <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-1">
              {filterOptions?.gugun.map((gugun) => (
                <div
                  key={gugun}
                  className={`flex items-center px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${selectedGugun.includes(gugun) ? 'bg-primary/5' : 'hover:bg-gray-50'}`}
                  onClick={() => toggleGugun(gugun)}
                >
                  <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${selectedGugun.includes(gugun) ? 'bg-primary border-primary' : 'border-gray-300 bg-white'}`}>
                    {selectedGugun.includes(gugun) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${selectedGugun.includes(gugun) ? 'font-bold text-primary' : 'text-gray-700'}`}>{gugun}</span>
                </div>
              ))}
              {(!filterOptions?.gugun || filterOptions.gugun.length === 0) && (
                <div className="p-8 text-center text-gray-400 text-sm">로딩 중...</div>
              )}
            </div>
          </div>
        </div>

        {/* 건물유형 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900">건물유형</label>
          <div className="flex flex-wrap gap-2">
            {filterOptions?.buildingType.map((type) => (
              <button
                key={type}
                onClick={() => toggleBuildingType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  selectedBuildingType.includes(type)
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 구조 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900">구조</label>
          <div className="flex flex-wrap gap-2">
            {filterOptions?.architecture.map((arch) => (
              <button
                key={arch}
                onClick={() => toggleArchitecture(arch)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                  selectedArchitecture.includes(arch)
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {arch}
              </button>
            ))}
          </div>
        </div>

        {/* 보증금 범위 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900">보증금 (만원)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="최소"
                value={localFilters.minDeposit ?? ''}
                onChange={(e) => handleDepositChange('min', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
            </div>
            <span className="text-gray-300">-</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="최대"
                value={localFilters.maxDeposit ?? ''}
                onChange={(e) => handleDepositChange('max', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
            </div>
          </div>
          {filterOptions && (
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Min: {Math.round(filterOptions.depositRange.min / 10000).toLocaleString()}만</span>
              <span>Max: {Math.round(filterOptions.depositRange.max / 10000).toLocaleString()}만</span>
            </div>
          )}
        </div>

        {/* 월세 범위 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900">월세 (만원)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="최소"
                value={localFilters.minMonthlyRent ?? ''}
                onChange={(e) => handleRentChange('min', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
            </div>
            <span className="text-gray-300">-</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="최대"
                value={localFilters.maxMonthlyRent ?? ''}
                onChange={(e) => handleRentChange('max', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">만</span>
            </div>
          </div>
          {filterOptions && (
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Min: {Math.round(filterOptions.monthlyRentRange.min / 10000).toLocaleString()}만</span>
              <span>Max: {Math.round(filterOptions.monthlyRentRange.max / 10000).toLocaleString()}만</span>
            </div>
          )}
        </div>

        {/* 면적 범위 */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-gray-900">전용면적 (m2)</label>
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="최소"
                value={localFilters.minArea ?? ''}
                onChange={(e) => handleAreaChange('min', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">m2</span>
            </div>
            <span className="text-gray-300">-</span>
            <div className="relative flex-1">
              <input
                type="number"
                placeholder="최대"
                value={localFilters.maxArea ?? ''}
                onChange={(e) => handleAreaChange('max', e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-right pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">m2</span>
            </div>
          </div>
          {filterOptions && (
            <div className="flex justify-between text-xs text-gray-400 px-1">
              <span>Min: {filterOptions.areaRange.min.toFixed(0)}</span>
              <span>Max: {filterOptions.areaRange.max.toFixed(0)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 bg-white">
        <button
          onClick={resetFilters}
          className="w-full py-3.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          필터 초기화
        </button>
      </div>
    </div>
  );
}
