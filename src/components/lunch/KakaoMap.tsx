'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useKakaoMap } from '@/hooks/useKakaoMap';

interface KakaoMapProps {
  latitude?: number;
  longitude?: number;
  markers?: {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
  }[];
  className?: string;
  onMarkerClick?: (id: string) => void;
}

export default function KakaoMap({
  latitude,
  longitude,
  markers = [],
  className,
  onMarkerClick,
}: KakaoMapProps) {
  const { mapRef, isLoaded, error, clearMarkers, addMarkerWithInfoWindow, setCenter } =
    useKakaoMap({
      latitude: latitude || 37.5665,
      longitude: longitude || 126.978,
    });

  useEffect(() => {
    if (!isLoaded) return;
    clearMarkers();
    markers.forEach((m) => {
      addMarkerWithInfoWindow(m, m.title);
    });
  }, [isLoaded, markers, clearMarkers, addMarkerWithInfoWindow]);

  useEffect(() => {
    if (isLoaded && latitude && longitude) {
      setCenter(latitude, longitude);
    }
  }, [isLoaded, latitude, longitude, setCenter]);

  if (error) {
    return (
      <div className={cn('flex items-center justify-center bg-slate-100 rounded-xl text-slate-500 text-sm', className)}>
        {error}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className={cn('w-full h-64 rounded-xl overflow-hidden bg-slate-100', className)}
    />
  );
}
