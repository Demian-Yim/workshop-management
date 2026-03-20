'use client';

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

  return (
    <Card
      hoverable
      className={cn(
        selected && 'ring-2 ring-blue-500 border-blue-300',
        className
      )}
      onClick={onSelect}
    >
      <CardBody className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-slate-900 text-sm truncate">
              {restaurant.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {restaurant.address}
            </p>
            {restaurant.phone && (
              <p className="text-xs text-slate-400 mt-0.5">{restaurant.phone}</p>
            )}
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
      </CardBody>
    </Card>
  );
}
