'use client';

import { DepositMode, getAdjustedValues } from '@/lib/depositConversion';
import { loadKakaoMapScript } from '@/lib/kakaoMap';
import { Property } from '@/types/property';
import { useCallback, useEffect, useRef, useState } from 'react';

interface MarkerData {
  marker: kakao.maps.Marker;
  customOverlay: kakao.maps.CustomOverlay;
  property: Property;
}

interface GroupedMarkerData {
  marker: kakao.maps.Marker;
  customOverlay: kakao.maps.CustomOverlay;
  properties: Property[];
  coordKey: string;
}

interface KakaoMapProps {
  properties: Property[];
  selectedPropertyId?: string | null;
  onPropertySelect?: (property: Property) => void;
  className?: string;
  isVisible?: boolean;
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
  if (man >= 1) return `${man % 1 === 0 ? man.toFixed(0) : man.toFixed(1)}만`;
  return `${won.toLocaleString()}`;
}

export default function KakaoMap({
  properties,
  selectedPropertyId,
  onPropertySelect,
  className = '',
  isVisible = true,
  depositMode = 'default',
}: KakaoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<kakao.maps.Map | null>(null);
  const markersRef = useRef<MarkerData[]>([]);
  const groupedMarkersRef = useRef<GroupedMarkerData[]>([]);
  const clustererRef = useRef<kakao.maps.MarkerClusterer | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeOverlayRef = useRef<kakao.maps.CustomOverlay | null>(null);

  // 지도 초기화
  useEffect(() => {
    let mounted = true;

    async function initMap() {
      try {
        await loadKakaoMapScript();
        if (!mounted || !mapContainerRef.current) return;

        const { kakao } = window;
        const center = new kakao.maps.LatLng(37.5665, 126.9780);
        const map = new kakao.maps.Map(mapContainerRef.current, { center, level: 8 });
        mapRef.current = map;

        clustererRef.current = new kakao.maps.MarkerClusterer({
          map,
          averageCenter: true,
          minLevel: 6,
          gridSize: 60,
          disableClickZoom: false,
          styles: [
            { width: '44px', height: '44px', background: '#0F4C5C', borderRadius: '50%', color: '#fff', textAlign: 'center', lineHeight: '44px', fontWeight: '700', fontSize: '14px' },
            { width: '54px', height: '54px', background: '#E36414', borderRadius: '50%', color: '#fff', textAlign: 'center', lineHeight: '54px', fontWeight: '700', fontSize: '15px' },
            { width: '64px', height: '64px', background: '#C2410C', borderRadius: '50%', color: '#fff', textAlign: 'center', lineHeight: '64px', fontWeight: '700', fontSize: '16px' },
          ],
          calculator: [10, 50],
        });

        const zoomControl = new kakao.maps.ZoomControl();
        map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

        kakao.maps.event.addListener(map, 'click', () => {
          if (activeOverlayRef.current) {
            activeOverlayRef.current.setMap(null);
            activeOverlayRef.current = null;
          }
        });

        setIsLoaded(true);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '지도를 불러오는데 실패했습니다.';
        setError(errorMessage);
      }
    }

    initMap();
    return () => { mounted = false; };
  }, []);

  // 마커 생성
  const createMarker = useCallback((property: Property): MarkerData | null => {
    if (!mapRef.current || !property.latitude || !property.longitude) return null;

    const { kakao } = window;
    const position = new kakao.maps.LatLng(property.latitude, property.longitude);

    const markerImageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#E36414" stroke="white" stroke-width="1.5">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        <circle cx="12" cy="9" r="2.5" fill="white"/>
      </svg>
    `)}`;
    const markerImage = new kakao.maps.MarkerImage(
      markerImageSrc,
      new kakao.maps.Size(36, 36),
      { offset: new kakao.maps.Point(18, 36) }
    );

    const marker = new kakao.maps.Marker({ position, title: property.danjiName, image: markerImage });

    const content = document.createElement('div');
    content.style.cssText = `background:white;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.18);padding:16px;width:320px;font-family:var(--font-sans);position:absolute;bottom:42px;left:50%;transform:translateX(-50%);border:1px solid #e5e7eb;cursor:pointer;z-index:100;transition:transform 0.2s;`;
    content.onmouseenter = () => { content.style.transform = 'translateX(-50%) scale(1.02)'; };
    content.onmouseleave = () => { content.style.transform = 'translateX(-50%) scale(1)'; };
    content.onclick = () => { onPropertySelect?.(property); };

    content.innerHTML = `
      <div style="font-size:14px;color:#374151;margin-bottom:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        ${property.danjiName} <span style="color:#9CA3AF;font-size:12px;">${property.juso.sggNm} ${property.juso.emdNm}</span>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:10px;">
        <div>
          <span style="font-size:12px;color:#6b7280;">보증금</span>
          <div style="font-weight:800;font-size:20px;color:#0F4C5C;">${formatDeposit(getAdjustedValues(property, depositMode).deposit)}<span style="font-size:13px;font-weight:normal;color:#6b7280;">원</span></div>
        </div>
        <div style="text-align:right;">
          <span style="font-size:12px;color:#6b7280;">월세</span>
          <div style="font-weight:700;font-size:17px;color:#E36414;">${formatRent(getAdjustedValues(property, depositMode).monthlyRent)}<span style="font-size:13px;font-weight:normal;color:#6b7280;">원</span></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid #f3f4f6;">
        <span style="font-size:13px;color:#6b7280;">${property.exclusiveArea.toFixed(1)}m2 / ${property.buildingType} / ${property.numberOfSupply}세대</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </div>
      <div style="position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid white;filter:drop-shadow(0 2px 1px rgba(0,0,0,0.05));"></div>
    `;

    const customOverlay = new kakao.maps.CustomOverlay({ content, position, clickable: true, xAnchor: 0.5, yAnchor: 1, zIndex: 3 });

    kakao.maps.event.addListener(marker, 'click', () => {
      if (activeOverlayRef.current) activeOverlayRef.current.setMap(null);
      customOverlay.setMap(mapRef.current);
      activeOverlayRef.current = customOverlay;
    });

    return { marker, customOverlay, property };
  }, [onPropertySelect, depositMode]);

  // 그룹 마커 생성
  const createGroupMarker = useCallback((coordKey: string, groupProperties: Property[]): GroupedMarkerData | null => {
    if (!mapRef.current || groupProperties.length === 0) return null;

    const { kakao } = window;
    const first = groupProperties[0];
    const position = new kakao.maps.LatLng(first.latitude!, first.longitude!);
    const count = groupProperties.length;

    const markerImageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48" width="40" height="48">
        <path d="M20 2C12.27 2 6 8.27 6 16c0 8.4 14 28 14 28s14-19.6 14-28c0-7.73-6.27-14-14-14z" fill="#E36414" stroke="white" stroke-width="2"/>
        <circle cx="20" cy="16" r="10" fill="white"/>
        <text x="20" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#E36414">${count}</text>
      </svg>
    `)}`;
    const markerImage = new kakao.maps.MarkerImage(markerImageSrc, new kakao.maps.Size(40, 48), { offset: new kakao.maps.Point(20, 48) });
    const marker = new kakao.maps.Marker({ position, title: `${count}개 매물`, image: markerImage });

    const content = document.createElement('div');
    content.style.cssText = `background:white;border-radius:14px;box-shadow:0 4px 24px rgba(0,0,0,0.18);padding:16px;width:320px;max-height:380px;overflow-y:auto;font-family:var(--font-sans);position:absolute;bottom:54px;left:50%;transform:translateX(-50%);border:1px solid #e5e7eb;z-index:100;`;

    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #e5e7eb;';
    header.innerHTML = `
      <div style="font-size:14px;color:#374151;margin-bottom:6px;">${first.juso.sggNm} ${first.juso.emdNm}</div>
      <div style="font-weight:700;font-size:15px;color:#0F4C5C;">${count}개 매물</div>
    `;
    content.appendChild(header);

    groupProperties.forEach((property, index) => {
      const item = document.createElement('div');
      item.style.cssText = `padding:12px 10px;cursor:pointer;border-radius:8px;transition:background 0.15s;${index < groupProperties.length - 1 ? 'border-bottom:1px solid #f3f4f6;' : ''}`;
      item.onmouseenter = () => { item.style.background = '#f9fafb'; };
      item.onmouseleave = () => { item.style.background = 'transparent'; };
      item.onclick = (e) => { e.stopPropagation(); onPropertySelect?.(property); };

      item.innerHTML = `
        <div style="font-weight:600;font-size:14px;color:#111827;margin-bottom:4px;">${property.danjiName}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <span style="font-weight:700;font-size:15px;color:#0F4C5C;">${formatDeposit(getAdjustedValues(property, depositMode).deposit)}원</span>
          <span style="font-size:14px;color:#E36414;font-weight:600;">${formatRent(getAdjustedValues(property, depositMode).monthlyRent)}원</span>
        </div>
        <div style="font-size:12px;color:#6b7280;margin-top:2px;">${property.exclusiveArea.toFixed(1)}m2 / ${property.buildingType}</div>
      `;
      content.appendChild(item);
    });

    const tail = document.createElement('div');
    tail.style.cssText = `position:absolute;bottom:-8px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid white;filter:drop-shadow(0 2px 1px rgba(0,0,0,0.05));`;
    content.appendChild(tail);

    const customOverlay = new kakao.maps.CustomOverlay({ content, position, clickable: true, xAnchor: 0.5, yAnchor: 1, zIndex: 3 });

    kakao.maps.event.addListener(marker, 'click', () => {
      if (activeOverlayRef.current) activeOverlayRef.current.setMap(null);
      customOverlay.setMap(mapRef.current);
      activeOverlayRef.current = customOverlay;
    });

    return { marker, customOverlay, properties: groupProperties, coordKey };
  }, [onPropertySelect, depositMode]);

  // 마커 업데이트
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !clustererRef.current) return;

    clustererRef.current.clear();
    if (activeOverlayRef.current) {
      activeOverlayRef.current.setMap(null);
      activeOverlayRef.current = null;
    }

    markersRef.current = [];
    groupedMarkersRef.current = [];

    const validProperties = properties.filter(p => p.latitude && p.longitude);
    const coordGroups = new Map<string, Property[]>();
    validProperties.forEach(property => {
      const key = `${property.latitude!.toFixed(6)}_${property.longitude!.toFixed(6)}`;
      if (!coordGroups.has(key)) coordGroups.set(key, []);
      coordGroups.get(key)!.push(property);
    });

    const allMarkers: kakao.maps.Marker[] = [];

    coordGroups.forEach((group, coordKey) => {
      if (group.length === 1) {
        const markerData = createMarker(group[0]);
        if (markerData) {
          markersRef.current.push(markerData);
          allMarkers.push(markerData.marker);
        }
      } else {
        const groupData = createGroupMarker(coordKey, group);
        if (groupData) {
          groupedMarkersRef.current.push(groupData);
          allMarkers.push(groupData.marker);
          group.forEach(p => {
            markersRef.current.push({ marker: groupData.marker, customOverlay: groupData.customOverlay, property: p });
          });
        }
      }
    });

    clustererRef.current.addMarkers(allMarkers);

    if (allMarkers.length > 0 && !selectedPropertyId) {
      const bounds = new window.kakao.maps.LatLngBounds();
      allMarkers.forEach(m => bounds.extend(m.getPosition()));
      mapRef.current.setBounds(bounds);
    }
  }, [isLoaded, properties, createMarker, createGroupMarker]);

  // 선택된 매물로 이동
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !selectedPropertyId) return;

    let targetPosition: kakao.maps.LatLng | null = null;
    const targetMarkerData = markersRef.current.find(m => m.property.id === selectedPropertyId);

    if (!targetMarkerData) {
      const target = properties.find(p => p.id === selectedPropertyId);
      if (target?.latitude && target?.longitude) {
        targetPosition = new window.kakao.maps.LatLng(target.latitude, target.longitude);
      }
    } else {
      targetPosition = targetMarkerData.marker.getPosition();
    }

    if (targetPosition) {
      const map = mapRef.current;
      map.panTo(targetPosition);
      if (map.getLevel() > 3) map.setLevel(3, { animate: true });
      if (activeOverlayRef.current) activeOverlayRef.current.setMap(null);
      if (targetMarkerData) {
        targetMarkerData.customOverlay.setMap(map);
        activeOverlayRef.current = targetMarkerData.customOverlay;
      }
    }
  }, [isLoaded, selectedPropertyId]);

  // 탭 전환 시 relayout
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !isVisible) return;
    const timer = setTimeout(() => {
      const map = mapRef.current;
      if (!map) return;
      map.relayout();
      if (markersRef.current.length > 0 && !selectedPropertyId) {
        const bounds = new window.kakao.maps.LatLngBounds();
        const unique = new Set(markersRef.current.map(m => m.marker));
        unique.forEach(m => bounds.extend(m.getPosition()));
        map.setBounds(bounds);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [isLoaded, isVisible]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 ${className}`}>
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-gray-500">지도를 불러오는 중...</div>
        </div>
      )}
    </div>
  );
}
