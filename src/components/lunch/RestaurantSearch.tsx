'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useKakaoSearch } from '@/hooks/useKakaoSearch';
import Input from '@/components/ui/input';
import type { KakaoPlaceResult } from '@/types/restaurant';

interface RestaurantSearchProps {
  onSelect: (place: KakaoPlaceResult) => void;
  className?: string;
}

export default function RestaurantSearch({ onSelect, className }: RestaurantSearchProps) {
  const [query, setQuery] = useState('');
  const { results, loading, error, search, clear } = useKakaoSearch(400);

  const handleChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      search(value);
    } else {
      clear();
    }
  };

  const handleSelect = (place: KakaoPlaceResult) => {
    onSelect(place);
    setQuery('');
    clear();
  };

  return (
    <div className={cn('relative', className)}>
      <Input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="식당/카페 이름으로 검색..."
        label="식당 검색"
        maxLength={100}
      />

      {loading && (
        <div className="absolute right-3 top-9 text-slate-400">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {results.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                onClick={() => handleSelect(place)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
              >
                <p className="font-medium text-sm text-slate-900">{place.place_name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {place.road_address_name || place.address_name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  {place.category_name && (
                    <span className="text-xs text-blue-600">{place.category_name}</span>
                  )}
                  {place.phone && (
                    <span className="text-xs text-slate-400">{place.phone}</span>
                  )}
                  {place.distance && (
                    <span className="text-xs text-slate-400">{place.distance}m</span>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
