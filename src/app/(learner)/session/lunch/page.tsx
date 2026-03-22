'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Vote } from 'lucide-react';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useLunchVotes } from '@/hooks/useLunchVotes';
import { useRealtimeDocument } from '@/hooks/useRealtimeDocument';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuOrders } from '@/hooks/useMenuOrders';
import Tabs from '@/components/ui/tabs';
import RestaurantSelector from '@/components/lunch/RestaurantSelector';
import MenuOrderForm from '@/components/lunch/MenuOrderForm';
import MyOrderStatus from '@/components/lunch/MyOrderStatus';
import { SkeletonList } from '@/components/ui/skeleton';
import EmptyState from '@/components/ui/empty-state';
import type { LunchVote } from '@/types/lunch';
import type { OrderItem } from '@/types/restaurant';
import { toast } from '@/components/ui/toast';

const TABS = [
  { id: 'vote', label: '투표' },
  { id: 'order', label: '메뉴 주문' },
];

export default function LunchPage() {
  const { courseId, sessionId, participantId, participantName } = useSessionStore();
  const { poll, voteCounts, totalVotes, loading } = useLunchVotes();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const { data: myVote } = useRealtimeDocument<LunchVote>(
    basePath && participantId ? `${basePath}/lunchVotes/${participantId}` : '',
    !!(basePath && participantId)
  );

  const { restaurants, config } = useRestaurants();
  const { myOrder, submitOrder, loading: ordersLoading } = useMenuOrders();

  const [activeTab, setActiveTab] = useState('vote');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId) ?? null;

  const handleVote = async (optionId: string) => {
    if (!basePath || !participantId) return;
    try {
      await setDoc(doc(db, `${basePath}/lunchVotes`, participantId), {
        optionId,
        participantName,
        votedAt: myVote?.votedAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
      toast.error('투표에 실패했습니다');
    }
  };

  const handleSubmitOrder = async (items: OrderItem[], note: string) => {
    if (!selectedRestaurant) return;
    setSubmitting(true);
    try {
      await submitOrder(selectedRestaurant.id, selectedRestaurant.name, items, note);
      setSelectedRestaurantId(null);
    } catch (err) {
      console.error(err);
      toast.error('주문에 실패했습니다');
    }
    setSubmitting(false);
  };

  if (loading) return <SkeletonList count={3} />;

  return (
    <div className="space-y-4 animate-fade-in">
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'vote' ? (
        <>
          {!poll ? (
            <EmptyState
              icon={Vote}
              title="점심메뉴 투표"
              description="아직 투표가 열리지 않았습니다"
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{poll.title || '점심메뉴 투표'}</h2>
                <span className="text-xs text-slate-500">{totalVotes}명 투표</span>
              </div>

              {!poll.isOpen && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-amber-700">투표가 마감되었습니다</p>
                </div>
              )}

              <div className="space-y-3">
                {poll.options?.map((option) => {
                  const count = voteCounts[option.id] || 0;
                  const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                  const isSelected = myVote?.optionId === option.id;

                  return (
                    <button
                      key={option.id}
                      onClick={() => poll.isOpen && handleVote(option.id)}
                      disabled={!poll.isOpen}
                      className={`w-full text-left bg-white rounded-xl p-4 shadow-sm border-2 transition ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                      } ${!poll.isOpen ? 'cursor-default' : ''}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{option.name}</span>
                          {isSelected && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">선택됨</span>}
                        </div>
                        <span className="text-sm font-medium text-slate-500">{count}표 ({percentage}%)</span>
                      </div>
                      {option.description && (
                        <p className="text-xs text-slate-500 mb-2">{option.description}</p>
                      )}
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {myVote && poll.isOpen && (
                <p className="text-center text-xs text-slate-400">다른 메뉴를 탭하면 투표가 변경됩니다</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          {!config?.isOpen ? (
            <EmptyState
              icon={Vote}
              title="메뉴 주문"
              description="아직 주문이 열리지 않았습니다"
            />
          ) : myOrder && !selectedRestaurantId ? (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-4">내 주문</h2>
              <MyOrderStatus
                order={myOrder}
                onEdit={() => setSelectedRestaurantId(myOrder.restaurantId)}
              />
            </div>
          ) : (
            <>
              {!selectedRestaurant ? (
                <>
                  <h2 className="text-lg font-bold text-slate-900">식당 선택</h2>
                  <RestaurantSelector
                    restaurants={restaurants}
                    selectedId={selectedRestaurantId}
                    onSelect={setSelectedRestaurantId}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedRestaurantId(null)}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      ← 식당 목록
                    </button>
                  </div>
                  <MenuOrderForm
                    restaurant={selectedRestaurant}
                    onSubmit={handleSubmitOrder}
                    loading={submitting}
                  />
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
