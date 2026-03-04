'use client';

import { DepositMode, getAdjustedValues } from '@/lib/depositConversion';
import { Property } from '@/types/property';

interface PropertyCardProps {
  property: Property;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
  onClick: () => void;
  onMapClick?: () => void;
  depositMode?: DepositMode;
}

function formatDeposit(won: number): string {
  const man = Math.round(won / 10000);
  if (man >= 10000) {
    const eok = Math.floor(man / 10000);
    const remainder = man % 10000;
    return remainder > 0 ? `${eok}억 ${remainder.toLocaleString()}만` : `${eok}억`;
  }
  return `${man.toLocaleString()}만`;
}

function formatRent(won: number): string {
  const man = won / 10000;
  if (man >= 1) {
    return `${man % 1 === 0 ? man.toFixed(0) : man.toFixed(1)}만`;
  }
  return `${won.toLocaleString()}`;
}

export default function PropertyCard({
  property,
  isFavorite,
  onFavoriteToggle,
  onClick,
  onMapClick,
  depositMode = 'default',
}: PropertyCardProps) {
  const adjusted = getAdjustedValues(property, depositMode);
  const isConverted = depositMode !== 'default';

  const thumbnailUrl = property.buildingImageUrls && property.buildingImageUrls.length > 0
    ? property.buildingImageUrls[0]
    : '/placeholder-house.svg';

  const nearestStation = property.nearSubwayStations?.[0];

  return (
    <div
      className="group bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
      onClick={onClick}
    >
      {/* 이미지 */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbnailUrl}
          alt={property.danjiName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder-house.svg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

        {/* 배지 */}
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-medium rounded-md shadow-sm">
            {property.buildingType}
          </span>
          <span className="px-2 py-1 bg-primary/80 backdrop-blur-md text-white text-xs font-medium rounded-md shadow-sm">
            {property.architecture}
          </span>
        </div>

        {/* 즐겨찾기 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavoriteToggle(property.id);
          }}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all transform hover:scale-110 active:scale-95"
        >
          <svg
            className={`w-5 h-5 transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        {/* 주소 */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-xs font-medium opacity-90 truncate flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {property.juso.sggNm} {property.juso.emdNm}
          </p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 truncate text-lg mb-2 group-hover:text-primary transition-colors">
          {property.danjiName}
        </h3>

        {/* 가격 */}
        <div className="mb-4 space-y-1">
          <div>
            <span className="text-xs text-gray-500">보증금{isConverted && <span className="text-primary ml-1">(전환)</span>}</span>
            <p className="text-xl font-extrabold text-primary">
              {formatDeposit(adjusted.deposit)}<span className="text-sm font-normal text-gray-500 ml-1">원</span>
            </p>
          </div>
          <div>
            <span className="text-xs text-gray-500">월세{isConverted && <span className="text-primary ml-1">(전환)</span>}</span>
            <p className="text-lg font-bold text-secondary">
              {formatRent(adjusted.monthlyRent)}<span className="text-sm font-normal text-gray-500 ml-1">원</span>
            </p>
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">전용면적</span>
            <span className="font-medium">{property.exclusiveArea.toFixed(1)}m2</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">공급세대</span>
            <span className="font-medium">{property.numberOfSupply}세대</span>
          </div>
          {nearestStation && (
            <div className="flex flex-col col-span-2">
              <span className="text-xs text-gray-400">근처 지하철</span>
              <span className="font-medium text-gray-900">
                {nearestStation.name} ({nearestStation.lineNames.join('/')}) 도보 {nearestStation.walkTime}분
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto pt-2 flex gap-2">
          {onMapClick && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMapClick();
              }}
              className="flex-1 py-2 text-sm font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                <line x1="8" y1="2" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="22" />
              </svg>
              지도 위치
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
