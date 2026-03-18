'use client';
import { useState } from 'react';
import { doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useSessionStore } from '@/hooks/useSession';
import { useLunchVotes } from '@/hooks/useLunchVotes';
import { generateId } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366F1', '#F59E0B', '#22C55E', '#EF4444', '#EC4899', '#06B6D4', '#8B5CF6', '#F97316'];

export default function FacilitatorLunchPage() {
  const { courseId, sessionId } = useSessionStore();
  const { poll, voteCounts, totalVotes } = useLunchVotes();
  const basePath = courseId && sessionId ? `courses/${courseId}/sessions/${sessionId}` : '';

  const [menuItems, setMenuItems] = useState<{ name: string; description: string }[]>([
    { name: '', description: '' },
  ]);
  const [creating, setCreating] = useState(false);

  const addMenuItem = () => setMenuItems([...menuItems, { name: '', description: '' }]);
  const removeMenuItem = (index: number) => setMenuItems(menuItems.filter((_, i) => i !== index));
  const updateMenuItem = (index: number, field: 'name' | 'description', value: string) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const createPoll = async () => {
    if (!basePath) return;
    const validItems = menuItems.filter((m) => m.name.trim());
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

  const chartData = poll?.options?.map((opt) => ({
    name: opt.name,
    votes: voteCounts[opt.id] || 0,
  })) || [];

  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-white mb-8">점심메뉴 투표</h1>

      {!poll ? (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 max-w-xl">
          <h2 className="text-lg font-semibold text-slate-200 mb-4">메뉴 옵션 설정</h2>
          <div className="space-y-3">
            {menuItems.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateMenuItem(index, 'name', e.target.value)}
                  placeholder={`메뉴 ${index + 1}`}
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateMenuItem(index, 'description', e.target.value)}
                  placeholder="설명 (선택)"
                  className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 outline-none"
                />
                {menuItems.length > 1 && (
                  <button onClick={() => removeMenuItem(index)} className="text-red-400 hover:text-red-300 px-2">✕</button>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={addMenuItem} className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-600 transition">+ 메뉴 추가</button>
            <button
              onClick={createPoll}
              disabled={creating || menuItems.filter((m) => m.name.trim()).length < 2}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 text-white font-semibold rounded-lg transition"
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
    </div>
  );
}
