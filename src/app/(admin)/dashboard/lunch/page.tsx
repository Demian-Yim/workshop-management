'use client';

import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuOrders } from '@/hooks/useMenuOrders';
import OrderSummaryPanel from '@/components/lunch/OrderSummaryPanel';
import Badge from '@/components/ui/badge';

export default function AdminLunchPage() {
  const { restaurants, config, loading: restaurantsLoading } = useRestaurants();
  const { orders, orderSummaries, loading: ordersLoading } = useMenuOrders();

  const loading = restaurantsLoading || ordersLoading;

  if (loading) {
    return <div className="text-center py-12 text-slate-400">로딩 중...</div>;
  }

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">점심 주문 관리</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">등록된 식당</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{restaurants.length}</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">총 주문</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">{orders.length}건</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">주문 상태</p>
            <Badge variant={config?.isOpen ? 'success' : 'default'}>
              {config?.isOpen ? '접수 중' : '마감'}
            </Badge>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {config?.isOpen ? '주문 접수 중' : '주문 마감됨'}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <OrderSummaryPanel
          summaries={orderSummaries}
          totalOrders={orders.length}
        />
      </div>

      {orders.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">개별 주문 내역</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{order.participantName}</span>
                  <span className="text-xs text-slate-400">{order.restaurantName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.items.map((item) => (
                    <span
                      key={item.menuItemId}
                      className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      {item.menuItemName} x{item.quantity}
                    </span>
                  ))}
                </div>
                {order.note && (
                  <p className="text-xs text-slate-400 mt-1">메모: {order.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
