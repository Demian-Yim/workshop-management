'use client';

import { cn } from '@/lib/utils';
import { Card, CardHeader, CardBody } from '@/components/ui/card';
import Badge from '@/components/ui/badge';
import type { OrderSummary } from '@/types/restaurant';

interface OrderSummaryPanelProps {
  summaries: OrderSummary[];
  totalOrders: number;
  className?: string;
}

export default function OrderSummaryPanel({
  summaries,
  totalOrders,
  className,
}: OrderSummaryPanelProps) {
  if (summaries.length === 0) {
    return (
      <div className={cn('text-center text-slate-400 py-8', className)}>
        아직 주문이 없습니다
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-900">주문 취합 현황</h3>
        <Badge variant="info">총 {totalOrders}건</Badge>
      </div>

      {summaries.map((summary) => (
        <Card key={summary.restaurantId}>
          <CardHeader className="py-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm text-slate-900">
                {summary.restaurantName}
              </h4>
              <Badge variant="default">{summary.totalOrders}명 주문</Badge>
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-2 font-medium text-slate-500">메뉴</th>
                  <th className="text-center px-4 py-2 font-medium text-slate-500 w-20">수량</th>
                  <th className="text-left px-4 py-2 font-medium text-slate-500">주문자</th>
                </tr>
              </thead>
              <tbody>
                {summary.items.map((item) => (
                  <tr key={item.menuItemName} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 text-slate-900">{item.menuItemName}</td>
                    <td className="px-4 py-2 text-center font-semibold text-blue-600">
                      {item.totalQuantity}
                    </td>
                    <td className="px-4 py-2 text-slate-500 text-xs">
                      {item.orderers.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
