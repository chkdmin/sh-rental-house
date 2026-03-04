'use client';

import { DepositMode, getAdjustedValues } from '@/lib/depositConversion';
import { Property } from '@/types/property';
import { useState } from 'react';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function PropertyDetailModal({ property, onClose, depositMode = 'default' }: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const adjusted = getAdjustedValues(property, depositMode);
  const isConverted = depositMode !== 'default';

  const images = property.buildingImageUrls && property.buildingImageUrls.length > 0
    ? property.buildingImageUrls
    : ['/placeholder-house.svg'];

  const handlePrevImage = () => {
    setCurrentImageIndex(prev => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10 shrink-0">
          <h2 className="text-lg font-bold text-gray-900 truncate pr-4">{property.danjiName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Image Gallery */}
          <div className="relative bg-black group aspect-video">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[currentImageIndex]}
              alt={`${property.danjiName} ${currentImageIndex + 1}`}
              className="w-full h-full object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-house.svg'; }}
            />
            {images.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={handleNextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* 가격 정보 */}
            <div className="text-center space-y-2">
              {isConverted && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full mb-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  {depositMode === 'min' ? '최소 보증금' : '최대 보증금'} 전환 적용
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500 block">보증금</span>
                <p className="text-4xl font-extrabold text-primary tracking-tight">
                  {formatDeposit(adjusted.deposit)}<span className="text-xl text-gray-500 font-normal ml-1">원</span>
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 block">월세</span>
                <p className="text-2xl font-bold text-secondary">
                  {formatRent(adjusted.monthlyRent)}<span className="text-lg text-gray-500 font-normal ml-1">원</span>
                </p>
              </div>
            </div>

            {/* 기본 정보 그리드 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">전용면적</span>
                <p className="text-lg font-bold text-gray-900">{property.exclusiveArea.toFixed(2)}m2</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">건물유형</span>
                <p className="text-lg font-bold text-gray-900">{property.buildingType} / {property.architecture}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">공급세대</span>
                <p className="text-lg font-bold text-gray-900">{property.numberOfSupply}세대</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">거주기간</span>
                <p className="text-lg font-bold text-gray-900">{property.residencePeriod}년</p>
              </div>
            </div>

            {/* 전환 보증금 정보 */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                보증금/월세 전환 정보
              </h3>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">전환 보증금 범위</span>
                  <span className="font-semibold text-gray-900">{formatDeposit(property.minConvertibleDeposit)} ~ {formatDeposit(property.maxConvertibleDeposit)}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">할인율</span>
                  <span className="font-semibold text-green-700">{(property.discountRate * 100).toFixed(0)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">월세전환율</span>
                  <span className="font-semibold text-gray-900">{(property.monthlyRentConversionRate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">보증금전환율</span>
                  <span className="font-semibold text-gray-900">{(property.depositConversionRate * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* 청약 일정 */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                청약 일정
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">신청 기간</span>
                  <span className="font-semibold text-gray-900">{formatDate(property.applicationStartDate)} ~ {formatDate(property.applicationEndDate)}</span>
                </div>
                {property.completionDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">준공일</span>
                    <span className="font-semibold text-gray-900">{formatDate(property.completionDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 지하철역 */}
            {property.nearSubwayStations && property.nearSubwayStations.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  근처 지하철역
                </h3>
                <div className="space-y-2">
                  {property.nearSubwayStations.map((station, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{station.name}</span>
                        <span className="text-xs text-gray-500">({station.lineNames.join(', ')})</span>
                      </div>
                      <span className="text-sm font-medium text-primary">도보 {station.walkTime}분</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 입주 순위 */}
            {property.priorities && property.priorities.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  입주 순위
                </h3>
                <div className="space-y-2">
                  {property.priorities.map((p, i) => (
                    <div key={i} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-md shrink-0">{p.priority}순위</span>
                      <span className="text-sm text-gray-700">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 위치 정보 */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                위치 정보
              </h3>
              <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm">
                {property.roadAddress}
              </p>
            </div>

            {/* 문의 */}
            <div className="text-center text-sm text-gray-500">
              문의: {property.inquiryConsultation}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-white shrink-0">
          <a
            href={property.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-secondary hover:bg-secondary-light text-white text-center py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
          >
            <span>신청 페이지 바로가기</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
