'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { generateId } from '@/lib/utils';
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import type { MenuItem } from '@/types/restaurant';

interface MenuEditorProps {
  menuItems: MenuItem[];
  onChange: (items: MenuItem[]) => void;
  placeUrl?: string;
  className?: string;
}

export default function MenuEditor({
  menuItems,
  onChange,
  placeUrl,
  className,
}: MenuEditorProps) {
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const fetchMenuFromKakao = useCallback(async () => {
    if (!placeUrl) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/kakao/menu?placeUrl=${encodeURIComponent(placeUrl)}`
      );
      const data = await response.json();
      if (data.menuItems?.length > 0) {
        const fetched: MenuItem[] = data.menuItems.map(
          (m: { name: string; price: string; description: string }) => ({
            id: generateId(),
            name: m.name,
            price: parsePrice(m.price),
            description: m.description,
            isPopular: false,
          })
        );
        onChange([...menuItems, ...fetched]);
      }
    } catch {
      // 크롤링 실패 시 무시
    } finally {
      setLoading(false);
    }
  }, [placeUrl, menuItems, onChange]);

  const addItem = () => {
    if (!newName.trim()) return;
    const item: MenuItem = {
      id: generateId(),
      name: newName.trim(),
      price: newPrice ? parseInt(newPrice, 10) : null,
      description: '',
      isPopular: false,
    };
    onChange([...menuItems, item]);
    setNewName('');
    setNewPrice('');
  };

  const removeItem = (id: string) => {
    onChange(menuItems.filter((item) => item.id !== id));
  };

  const togglePopular = (id: string) => {
    onChange(
      menuItems.map((item) =>
        item.id === id ? { ...item, isPopular: !item.isPopular } : item
      )
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {placeUrl && (
        <Button
          size="sm"
          variant="secondary"
          onClick={fetchMenuFromKakao}
          loading={loading}
        >
          카카오에서 메뉴 자동 불러오기
        </Button>
      )}

      {menuItems.length > 0 && (
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2"
            >
              <button
                type="button"
                onClick={() => togglePopular(item.id)}
                className={cn(
                  'text-sm',
                  item.isPopular ? 'text-amber-500' : 'text-slate-300'
                )}
                title={item.isPopular ? '인기 해제' : '인기 표시'}
              >
                ★
              </button>
              <span className="flex-1 text-sm text-slate-900">{item.name}</span>
              {item.price != null && (
                <span className="text-xs text-slate-500">
                  {item.price.toLocaleString()}원
                </span>
              )}
              <button
                type="button"
                onClick={() => removeItem(item.id)}
                className="text-slate-400 hover:text-red-500 text-sm transition-colors"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="메뉴 이름"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <Input
          value={newPrice}
          onChange={(e) => setNewPrice(e.target.value.replace(/\D/g, ''))}
          placeholder="가격"
          className="w-28"
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <Button size="md" onClick={addItem} disabled={!newName.trim()}>
          추가
        </Button>
      </div>
    </div>
  );
}

function parsePrice(priceStr: string): number | null {
  if (!priceStr) return null;
  const num = parseInt(priceStr.replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? null : num;
}
