'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/button';
import Badge from '@/components/ui/badge';
import type { Restaurant, OrderItem } from '@/types/restaurant';

interface MenuOrderFormProps {
  restaurant: Restaurant;
  onSubmit: (items: OrderItem[], note: string) => void;
  loading?: boolean;
  className?: string;
}

export default function MenuOrderForm({
  restaurant,
  onSubmit,
  loading,
  className,
}: MenuOrderFormProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [note, setNote] = useState('');

  const updateQuantity = useCallback((menuItemId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[menuItemId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [menuItemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [menuItemId]: next };
    });
  }, []);

  const selectedItems = useMemo((): OrderItem[] => {
    return Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([menuItemId, quantity]) => {
        const menuItem = restaurant.menuItems.find((m) => m.id === menuItemId);
        return {
          menuItemId,
          menuItemName: menuItem?.name || '',
          quantity,
        };
      });
  }, [quantities, restaurant.menuItems]);

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;
    onSubmit(selectedItems, note);
  };

  const popularItems = restaurant.menuItems.filter((m) => m.isPopular);
  const regularItems = restaurant.menuItems.filter((m) => !m.isPopular);

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-semibold text-slate-900">{restaurant.name} 메뉴</h3>

      {popularItems.length > 0 && (
        <div>
          <p className="text-xs font-medium text-amber-600 mb-2">인기 메뉴</p>
          <div className="space-y-2">
            {popularItems.map((item) => (
              <MenuItemRow
                key={item.id}
                name={item.name}
                price={item.price}
                quantity={quantities[item.id] || 0}
                onIncrease={() => updateQuantity(item.id, 1)}
                onDecrease={() => updateQuantity(item.id, -1)}
              />
            ))}
          </div>
        </div>
      )}

      {regularItems.length > 0 && (
        <div>
          {popularItems.length > 0 && (
            <p className="text-xs font-medium text-slate-500 mb-2">전체 메뉴</p>
          )}
          <div className="space-y-2">
            {regularItems.map((item) => (
              <MenuItemRow
                key={item.id}
                name={item.name}
                price={item.price}
                quantity={quantities[item.id] || 0}
                onIncrease={() => updateQuantity(item.id, 1)}
                onDecrease={() => updateQuantity(item.id, -1)}
              />
            ))}
          </div>
        </div>
      )}

      {restaurant.menuItems.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">
          등록된 메뉴가 없습니다
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          메모 (선택)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="알레르기, 특이사항 등..."
          rows={2}
          className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {selectedItems.length > 0
            ? `${selectedItems.reduce((sum, i) => sum + i.quantity, 0)}개 선택`
            : '메뉴를 선택해주세요'}
        </span>
        <Button
          onClick={handleSubmit}
          disabled={selectedItems.length === 0}
          loading={loading}
        >
          주문 제출
        </Button>
      </div>
    </div>
  );
}

function MenuItemRow({
  name,
  price,
  quantity,
  onIncrease,
  onDecrease,
}: {
  name: string;
  price: number | null;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-3 py-2">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-slate-900">{name}</span>
        {price != null && (
          <span className="text-xs text-slate-400 ml-2">
            {price.toLocaleString()}원
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onDecrease}
          disabled={quantity === 0}
          className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-sm font-bold disabled:opacity-30 hover:bg-slate-300 transition-colors"
        >
          -
        </button>
        <span className={cn('w-6 text-center text-sm font-semibold', quantity > 0 ? 'text-blue-600' : 'text-slate-300')}>
          {quantity}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold hover:bg-blue-200 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
