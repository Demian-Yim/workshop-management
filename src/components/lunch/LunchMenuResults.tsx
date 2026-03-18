'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { LunchMenuOption } from '@/types/lunch';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#6d28d9'];

interface LunchMenuResultsProps {
  options: LunchMenuOption[];
  voteCounts: Record<string, number>;
  totalVotes: number;
}

export default function LunchMenuResults({ options, voteCounts, totalVotes }: LunchMenuResultsProps) {
  const data = options.map((opt) => ({
    name: opt.name,
    votes: voteCounts[opt.id] || 0,
  }));

  return (
    <div>
      <div className="mb-4 text-center">
        <p className="text-slate-400 text-sm">총 {totalVotes}명 투표</p>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis type="number" stroke="#94a3b8" />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" width={80} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
          />
          <Bar dataKey="votes" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
