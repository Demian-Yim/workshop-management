'use client';

import { cn } from '@/lib/utils';
import KakaoMap from './KakaoMap';
import RestaurantCard from './RestaurantCard';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  selectedId: string | null;
  onSelect: (restaurantId: string) => void;
  className?: string;
}

export default function RestaurantSelector({
  restaurants,
  selectedId,
  onSelect,
  className,
}: RestaurantSelectorProps) {
  const markers = restaurants.map((r) => ({
    id: r.id,
    latitude: r.latitude,
    longitude: r.longitude,
    title: r.name,
  }));

  const centerRestaurant = restaurants.find((r) => r.id === selectedId) || restaurants[0];

  if (restaurants.length === 0) {
    return (
      <div className={cn('text-center text-slate-400 py-8', className)}>
        선택 가능한 식당이 없습니다
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <KakaoMap
        latitude={centerRestaurant?.latitude}
        longitude={centerRestaurant?.longitude}
        markers={markers}
        className="h-48"
      />

      <div className="grid gap-3">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            selected={selectedId === restaurant.id}
            onSelect={() => onSelect(restaurant.id)}
          />
        ))}
      </div>
    </div>
  );
}
