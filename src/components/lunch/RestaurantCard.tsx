'use client';

import { MapPin, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardBody } from '@/components/ui/card';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { Restaurant } from '@/types/restaurant';

interface RestaurantCardProps {
  restaurant: Restaurant;
  selected?: boolean;
  onSelect?: () => void;
  onEditMenu?: () => void;
  onRemove?: () => void;
  showActions?: boolean;
  className?: string;
}

/** 카테고리 문자열에서 마지막 세그먼트를 반환 (e.g. "음식점 > 한식" → "한식") */
function parseCategory(categoryName: string): string {
  const parts = categoryName.split(' > ');
  return parts[parts.length - 1] ?? categoryName;
}

/** 미터 거리 문자열을 표시용 문자열로 변환 (> 999m → "X.Xkm") */
function formatDistance(distance: string): string {
  const meters = parseInt(distance, 10);
  if (isNaN(meters)) return `${distance}m`;
  if (meters > 999) return `${(meters / 1000).toFixed(1)}km`;
  return `${meters}m`;
}

export default function RestaurantCard({
  restaurant,
  selected,
  onSelect,
  onEditMenu,
  onRemove,
  showActions = false,
  className,
}: RestaurantCardProps) {
  const menuCount = restaurant.menuItems?.length || 0;
  const categoryLabel = restaurant.categoryName
    ? parseCategory(restaurant.categoryName)
    : null;
  const distanceLabel = restaurant.distance
    ? formatDistance(restaurant.distance)
    : null;

  return (
    <Card
      hoverable
      className={cn(
        selected && 'ring-2 ring-blue-500 border-blue-300',
        className
      )}
      onClick={onSelect}
    >
      <CardBody className="p-0">
        <div className="flex">
          {/* 선택 시 좌측 색상 스트라이프 */}
          <div
            className={cn(
              'w-1 rounded-l-xl flex-shrink-0 transition-colors',
              selected ? 'bg-blue-500' : 'bg-transparent'
            )}
          />
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-slate-900 text-sm truncate">
                    {restaurant.name}
                  </h3>
                  {restaurant.placeUrl && (
                    <a
                      href={restaurant.placeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-blue-500 transition-colors flex-shrink-0"
                      aria-label="카카오맵에서 보기"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                {/* 카테고리 뱃지 */}
                {categoryLabel && (
                  <span className="inline-block mt-1 text-xs bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-md">
                    {categoryLabel}
                  </span>
                )}

                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {restaurant.address}
                </p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  {restaurant.phone && (
                    <p className="text-xs text-slate-400">{restaurant.phone}</p>
                  )}
                  {/* 거리 표시 */}
                  {distanceLabel && (
                    <span className="flex items-center gap-0.5 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                      {distanceLabel}
                    </span>
                  )}
                </div>
              </div>
              <Badge variant={menuCount > 0 ? 'success' : 'warning'}>
                {menuCount > 0 ? `메뉴 ${menuCount}개` : '메뉴 없음'}
              </Badge>
            </div>

            {menuCount > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {restaurant.menuItems.slice(0, 5).map((item) => (
                  <span
                    key={item.id}
                    className="inline-block text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    {item.name}
                    {item.price != null && (
                      <span className="text-slate-400 ml-1">
                        {item.price.toLocaleString()}원
                      </span>
                    )}
                  </span>
                ))}
                {menuCount > 5 && (
                  <span className="text-xs text-slate-400">+{menuCount - 5}개</span>
                )}
              </div>
            )}

            {showActions && (
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" onClick={onEditMenu}>
                  메뉴 편집
                </Button>
                <Button size="sm" variant="ghost" onClick={onRemove}>
                  삭제
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
