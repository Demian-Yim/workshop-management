'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { KakaoMap, KakaoMarker } from '@/types/kakao-maps';

interface UseKakaoMapOptions {
  latitude?: number;
  longitude?: number;
  level?: number;
}

interface MarkerData {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
}

interface UseKakaoMapResult {
  mapRef: React.RefObject<HTMLDivElement | null>;
  map: KakaoMap | null;
  isLoaded: boolean;
  error: string | null;
  addMarker: (data: MarkerData) => void;
  clearMarkers: () => void;
  setCenter: (latitude: number, longitude: number) => void;
  addMarkerWithInfoWindow: (data: MarkerData, content: string) => void;
}

const KAKAO_SDK_URL = 'https://dapi.kakao.com/v2/maps/sdk.js';

function loadKakaoSDK(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao?.maps) {
      resolve();
      return;
    }

    const existingScript = document.querySelector(
      `script[src^="${KAKAO_SDK_URL}"]`
    );
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        window.kakao!.maps.load(() => resolve());
      });
      return;
    }

    const script = document.createElement('script');
    script.src = `${KAKAO_SDK_URL}?appkey=${apiKey}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao!.maps.load(() => resolve());
    };
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

export function useKakaoMap(options: UseKakaoMapOptions = {}): UseKakaoMapResult {
  const { latitude = 37.5665, longitude = 126.978, level = 3 } = options;

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<KakaoMap | null>(null);
  const markersRef = useRef<KakaoMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY;
    if (!apiKey) {
      setError('카카오맵 API 키가 설정되지 않았습니다');
      return;
    }

    let cancelled = false;

    loadKakaoSDK(apiKey)
      .then(() => {
        if (cancelled || !mapRef.current) return;

        const mapOption = {
          center: new window.kakao!.maps.LatLng(latitude, longitude),
          level,
        };
        const map = new window.kakao!.maps.Map(mapRef.current, mapOption);
        mapInstanceRef.current = map;
        setIsLoaded(true);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, level]);

  const addMarker = useCallback((data: MarkerData) => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;

    const position = new window.kakao.maps.LatLng(data.latitude, data.longitude);
    const marker = new window.kakao.maps.Marker({
      map,
      position,
      title: data.title,
    });
    markersRef.current.push(marker);
  }, []);

  const addMarkerWithInfoWindow = useCallback(
    (data: MarkerData, content: string) => {
      const map = mapInstanceRef.current;
      if (!map || !window.kakao?.maps) return;

      const position = new window.kakao.maps.LatLng(data.latitude, data.longitude);
      const marker = new window.kakao.maps.Marker({
        map,
        position,
        title: data.title,
      });

      const infoWindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;">${content}</div>`,
      });

      window.kakao.maps.event.addListener(marker, 'click', () => {
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    },
    []
  );

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];
  }, []);

  const setCenter = useCallback((lat: number, lng: number) => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;
    map.setCenter(new window.kakao.maps.LatLng(lat, lng));
  }, []);

  return {
    mapRef,
    map: mapInstanceRef.current,
    isLoaded,
    error,
    addMarker,
    clearMarkers,
    setCenter,
    addMarkerWithInfoWindow,
  };
}
