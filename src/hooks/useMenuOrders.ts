'use client';

import { useMemo, useCallback } from 'react';
import { useRealtimeCollection } from './useRealtimeCollection';
import { useSessionStore } from './useSession';
import { setDocument } from '@/lib/firebase/firestore';
import type { MenuOrder, OrderItem, OrderSummary, OrderSummaryItem } from '@/types/restaurant';

export function useMenuOrders() {
  const { courseId, sessionId, participantName } = useSessionStore();

  const basePath =
    courseId && sessionId
      ? `courses/${courseId}/sessions/${sessionId}`
      : '';

  const { data: orders, loading } = useRealtimeCollection<MenuOrder>(
    basePath ? `${basePath}/menuOrders` : '',
    [],
    !!basePath
  );

  const myOrder = useMemo(
    () => orders.find((o) => o.participantName === participantName) ?? null,
    [orders, participantName]
  );

  const orderSummaries = useMemo((): OrderSummary[] => {
    const byRestaurant = new Map<
      string,
      { restaurantName: string; itemMap: Map<string, OrderSummaryItem>; orderCount: number }
    >();

    orders.forEach((order) => {
      let group = byRestaurant.get(order.restaurantId);
      if (!group) {
        group = {
          restaurantName: order.restaurantName,
          itemMap: new Map(),
          orderCount: 0,
        };
        byRestaurant.set(order.restaurantId, group);
      }
      group.orderCount += 1;

      order.items.forEach((item) => {
        const existing = group!.itemMap.get(item.menuItemName);
        if (existing) {
          group!.itemMap.set(item.menuItemName, {
            ...existing,
            totalQuantity: existing.totalQuantity + item.quantity,
            orderers: [...existing.orderers, order.participantName],
          });
        } else {
          group!.itemMap.set(item.menuItemName, {
            menuItemName: item.menuItemName,
            totalQuantity: item.quantity,
            orderers: [order.participantName],
          });
        }
      });
    });

    return Array.from(byRestaurant.entries()).map(([restaurantId, group]) => ({
      restaurantId,
      restaurantName: group.restaurantName,
      items: Array.from(group.itemMap.values()),
      totalOrders: group.orderCount,
    }));
  }, [orders]);

  const submitOrder = useCallback(
    async (
      restaurantId: string,
      restaurantName: string,
      items: OrderItem[],
      note: string
    ) => {
      if (!basePath || !participantName) return;

      const order: Omit<MenuOrder, 'id'> = {
        participantName,
        restaurantId,
        restaurantName,
        items,
        note,
        createdAt: new Date() as any,
        updatedAt: new Date() as any,
      };

      await setDocument(`${basePath}/menuOrders/${participantName}`, order);
    },
    [basePath, participantName]
  );

  return {
    orders,
    myOrder,
    orderSummaries,
    loading,
    submitOrder,
  };
}
