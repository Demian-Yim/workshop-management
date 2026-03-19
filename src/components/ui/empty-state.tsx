'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  dark?: boolean;
}

export default function EmptyState({ icon: Icon, title, description, action, className, dark }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 animate-fade-in', className)}>
      <div className={cn(
        'inline-flex items-center justify-center w-16 h-16 rounded-full mb-4',
        dark ? 'bg-slate-700/50' : 'bg-slate-100'
      )}>
        <Icon className={cn('w-8 h-8', dark ? 'text-slate-400' : 'text-slate-400')} />
      </div>
      <h3 className={cn('text-lg font-bold mb-2', dark ? 'text-slate-200' : 'text-slate-900')}>{title}</h3>
      {description && (
        <p className={cn('text-sm mb-4', dark ? 'text-slate-400' : 'text-slate-500')}>{description}</p>
      )}
      {action}
    </div>
  );
}
