'use client';
import { useMemo } from 'react';
import PostCard from './PostCard';
import type { Post } from '@/types/board';

interface Team {
  id: string;
  name: string;
  color?: string | null;
}

interface TeamColumnBoardProps {
  posts: Post[];
  teams: Team[];
  currentUserId?: string;
  onToggleLike?: (postId: string) => void;
  onOpenComments?: (postId: string) => void;
  dark?: boolean;
}

const TEAM_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6',
];

export default function TeamColumnBoard({
  posts,
  teams,
  currentUserId,
  onToggleLike,
  onOpenComments,
  dark,
}: TeamColumnBoardProps) {
  const postsByTeam = useMemo(() => {
    const map = new Map<string, Post[]>();
    for (const team of teams) map.set(team.id, []);
    // Unassigned bucket
    map.set('__none__', []);
    for (const post of posts) {
      const key = post.teamId ?? '__none__';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(post);
    }
    return map;
  }, [posts, teams]);

  const columns = useMemo(() => {
    const cols = teams.map((team, i) => ({
      id: team.id,
      name: team.name,
      color: team.color ?? TEAM_COLORS[i % TEAM_COLORS.length],
      posts: postsByTeam.get(team.id) ?? [],
    }));
    return cols;
  }, [teams, postsByTeam]);

  if (columns.length === 0) {
    return (
      <div className={`text-center py-12 ${dark ? 'text-slate-400' : 'text-slate-500'}`}>
        팀이 배정되면 칼럼이 표시됩니다
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 items-start">
      {columns.map((col) => (
        <div
          key={col.id}
          className={`flex-shrink-0 w-72 rounded-2xl ${dark ? 'bg-slate-800/60' : 'bg-slate-50'} p-3`}
        >
          {/* Column header */}
          <div className="flex items-center gap-2 mb-3 px-1">
            <span
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: col.color }}
            />
            <span className={`text-sm font-bold ${dark ? 'text-white' : 'text-slate-700'}`}>
              {col.name}
            </span>
            <span className={`ml-auto text-xs font-medium ${dark ? 'text-slate-400' : 'text-slate-400'}`}>
              {col.posts.length}
            </span>
          </div>

          {/* Posts */}
          <div className="space-y-3">
            {col.posts.length === 0 ? (
              <div className={`text-center py-8 text-xs ${dark ? 'text-slate-500' : 'text-slate-400'}`}>
                아직 게시글 없음
              </div>
            ) : (
              col.posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUserId={currentUserId}
                  onToggleLike={onToggleLike}
                  onOpenComments={onOpenComments}
                  dark={dark}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
