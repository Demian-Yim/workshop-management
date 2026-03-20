'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useLunchVotes } from '@/hooks/useLunchVotes';
import { useRestaurants } from '@/hooks/useRestaurants';
import { useMenuOrders } from '@/hooks/useMenuOrders';
import { generateId } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RestaurantSearch from '@/components/lunch/RestaurantSearch';
import RestaurantCard from '@/components/lunch/RestaurantCard';
import MenuEditor from '@/components/lunch/MenuEditor';
import OrderSummaryPanel from '@/components/lunch/OrderSummaryPanel';
import type { KakaoPlaceResult } from '@/types/restaurant';

const COLORS = ['#6366F1', '#F59E0B', '#22C55E', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316'];

export default function FacilitatorLunchPage() {
  const { courseId, sessionId, participantName } = useSessionStore();
  const { poll, voteCounts, totalVotes } = useLunchVotes();
  const {
    restaurants,
    config,
    addRestaurant,
    updateMenuItems,
    removeRestaurant,
    updateOrderConfig,
  } = useRestaurants();
  const { orderSummaries, orders } = useMenuOrders();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const [activeTab, setActiveTab] = useState<'vote' | 'order'>('vote');
  const [editingMenuFor, setEditingMenuFor] = useState<string | null>(null);

  // Poll creation state
  const [pollOptions, setPollOptions] = useState<{ name: string; description: string }[]>([
    { name: '', description: '' },
  ]);
  const [creating, setCreating] = useState(false);

  const addPollOption = () => setPollOptions([...pollOptions, { name: '', description: '' }]);
  const removePollOption = (index: number) => setPollOptions(pollOptions.filter((_, i) => i !== index));
  const updatePollOption = (index: number, field: 'name' | 'description', value: string) => {
    setPollOptions(pollOptions.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const createPoll = async () => {
    if (!basePath) return;
    const validItems = pollOptions.filter((m) => m.name.trim());
    if (validItems.length < 2) return;
    setCreating(true);
    try {
      await setDoc(doc(db, `${basePath}/lunchPoll`, 'current'), {
        title: '오늘의 점심 메뉴',
        options: validItems.map((m) => ({
          id: generateId(),
          name: m.name.trim(),
          description: m.description.trim(),
          imageUrl: null,
        })),
        isOpen: true,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error(err);
    }
    setCreating(false);
  };

  const togglePoll = async () => {
    if (!basePath || !poll) return;
    await updateDoc(doc(db, `${basePath}/lunchPoll`, 'current'), { isOpen: !poll.isOpen });
  };

  const handleAddRestaurant = async (place: KakaoPlaceResult) => {
    await addRestaurant(place, [], participantName || '');
  };

  const chartData = poll?.options?.map((opt) => ({
    name: opt.name,
    votes: voteCounts[opt.id] || 0,
  })) || [];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-6">점심 관리</h1>

      <div className="flex gap-1 bg-slate-700/50 rounded-lg p-0.5 mb-8 w-fit">
        {[
          { id: 'vote', label: '투표' },
          { id: 'order', label: '식당 주문' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'vote' | 'order')}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-slate-600 shadow text-white font-semibold'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'vote' ? (
        <>
          {!poll ? (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-xl">
              <h2 className="text-lg font-semibold text-slate-200 mb-4">메뉴 옵션 설정</h2>
              <div className="space-y-3">
                {pollOptions.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updatePollOption(index, 'name', e.target.value)}
                      placeholder={`메뉴 ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none"
                    />
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updatePollOption(index, 'description', e.target.value)}
                      placeholder="설명 (선택)"
                      className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none"
                    />
                    {pollOptions.length > 1 && (
                      <button onClick={() => removePollOption(index)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-4">
                <button onClick={addPollOption} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition">+ 메뉴 추가</button>
                <button
                  onClick={createPoll}
                  disabled={creating || pollOptions.filter((m) => m.name.trim()).length < 2}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
                >
                  {creating ? '생성 중...' : '투표 시작'}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-200">실시간 투표 결과</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">{totalVotes}명 투표</span>
                    <button
                      onClick={togglePoll}
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                        poll.isOpen ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                      }`}
                    >
                      {poll.isOpen ? '투표 마감' : '투표 재개'}
                    </button>
                  </div>
                </div>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} />
                      <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#E2E8F0' }}
                        itemStyle={{ color: '#818CF8' }}
                      />
                      <Bar dataKey="votes" radius={[6, 6, 0, 0]}>
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h2 className="text-lg font-semibold text-slate-200 mb-4">메뉴별 현황</h2>
                <div className="space-y-4">
                  {poll.options?.map((opt, idx) => {
                    const count = voteCounts[opt.id] || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    return (
                      <div key={opt.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-slate-200 font-medium">{opt.name}</span>
                          <span className="text-slate-400">{count}표 ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-4">
                          <div
                            className="h-4 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-200">주문 설정</h2>
                <p className="text-sm text-slate-400 mt-1">
                  {orders.length}명 주문 완료 · 식당 {restaurants.length}곳 등록
                </p>
              </div>
              <button
                onClick={() => updateOrderConfig({ isOpen: !config?.isOpen })}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  config?.isOpen ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
                }`}
              >
                {config?.isOpen ? '주문 마감' : '주문 열기'}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">식당 검색</h2>
            <RestaurantSearch onSelect={handleAddRestaurant} />
          </div>

          {restaurants.length > 0 && (
            <div className="bg-white rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                등록된 식당 ({restaurants.length})
              </h2>
              <div className="space-y-3">
                {restaurants.map((restaurant) => (
                  <div key={restaurant.id}>
                    <RestaurantCard
                      restaurant={restaurant}
                      showActions
                      onEditMenu={() =>
                        setEditingMenuFor(
                          editingMenuFor === restaurant.id ? null : restaurant.id
                        )
                      }
                      onRemove={() => removeRestaurant(restaurant.id)}
                    />
                    {editingMenuFor === restaurant.id && (
                      <div className="mt-2 pl-4 border-l-2 border-blue-200">
                        <MenuEditor
                          menuItems={restaurant.menuItems}
                          onChange={(items) => updateMenuItems(restaurant.id, items)}
                          placeUrl={restaurant.placeUrl}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl p-6">
            <OrderSummaryPanel
              summaries={orderSummaries}
              totalOrders={orders.length}
            />
          </div>
        </div>
      )}
    </div>
  );
}
