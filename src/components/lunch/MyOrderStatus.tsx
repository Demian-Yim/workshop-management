'use client';

import { cn } from '@/lib/utils';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import Button from '@/components/ui/button';
import type { MenuOrder } from '@/types/restaurant';

interface MyOrderStatusProps {
  order: MenuOrder | null;
  onEdit?: () => void;
  className?: string;
}

export default function MyOrderStatus({ order, onEdit, className }: MyOrderStatusProps) {
  if (!order) {
    return (
      <div className={cn('text-center text-slate-400 py-6', className)}>
        아직 주문하지 않았습니다
      </div>
    );
  }

  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-slate-900">내 주문</h4>
          <Badge variant="success">제출 완료</Badge>
        </div>
      </CardHeader>
      <CardBody className="p-4 space-y-2">
        <p className="text-xs text-slate-500">{order.restaurantName}</p>

        <ul className="space-y-1">
          {order.items.map((item) => (
            <li key={item.menuItemId} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">{item.menuItemName}</span>
              <span className="text-indigo-600 font-medium">{item.quantity}개</span>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400">합계 {totalQuantity}개</span>
          {onEdit && (
            <Button size="sm" variant="ghost" onClick={onEdit}>
              수정
            </Button>
          )}
        </div>

        {order.note && (
          <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
            메모: {order.note}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
