'use client';

import { useMemo, useCallback } from 'react';
import { orderBy } from 'firebase/firestore';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useRealtimeDocument } from './useRealtimeDocument';
import { useSessionStore } from './useSession';
import { setDocument, deleteDocument } from '@/lib/firebase/firestore';
import { generateId } from '@/lib/utils';
import type { Restaurant, MenuItem, LunchOrderConfig, KakaoPlaceResult } from '@/types/restaurant';
import type { DocumentData } from 'firebase/firestore';

export function useRestaurants() {
  const { courseId, sessionId } = useSessionStore();

  const basePath =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}`
      : '';

  const { data: restaurants, loading: restaurantsLoading } =
    useRealtimeCollection<Restaurant>(
      basePath ? `${basePath}/restaurants` : '',
      [orderBy('createdAt', 'desc')],
      !!basePath
    );

  const { data: config, loading: configLoading } =
    useRealtimeDocument<LunchOrderConfig>(
      basePath ? `${basePath}/lunchOrderConfig/current` : '',
      !!basePath
    );

  const selectedRestaurants = useMemo(() => {
    if (!config?.selectedRestaurantIds?.length) return [];
    return restaurants.filter((r) =>
      config.selectedRestaurantIds.includes(r.id)
    );
  }, [restaurants, config]);

  const addRestaurant = useCallback(
    async (place: KakaoPlaceResult, menuItems: MenuItem[], addedBy: string) => {
      if (!basePath) return;

      const id = generateId();
      const restaurant: DocumentData = {
        id,
        kakaoPlaceId: place.id,
        name: place.place_name,
        address: place.road_address_name || place.address_name,
        phone: place.phone,
        latitude: parseFloat(place.y),
        longitude: parseFloat(place.x),
        placeUrl: place.place_url,
        menuItems,
        addedBy,
      };

      await setDocument(`${basePath}/restaurants/${id}`, restaurant);
    },
    [basePath]
  );

  const updateMenuItems = useCallback(
    async (restaurantId: string, menuItems: MenuItem[]) => {
      if (!basePath) return;
      await setDocument(`${basePath}/restaurants/${restaurantId}`, { menuItems });
    },
    [basePath]
  );

  const removeRestaurant = useCallback(
    async (restaurantId: string) => {
      if (!basePath) return;
      await deleteDocument(`${basePath}/restaurants/${restaurantId}`);
    },
    [basePath]
  );

  const updateOrderConfig = useCallback(
    async (updates: Partial<LunchOrderConfig>) => {
      if (!basePath) return;
      const current = config || { isOpen: false, selectedRestaurantIds: [], deadline: null };
      await setDocument(`${basePath}/lunchOrderConfig/current`, {
        ...current,
        ...updates,
      });
    },
    [basePath, config]
  );

  return {
    restaurants,
    selectedRestaurants,
    config,
    loading: restaurantsLoading || configLoading,
    addRestaurant,
    updateMenuItems,
    removeRestaurant,
    updateOrderConfig,
  };
}
