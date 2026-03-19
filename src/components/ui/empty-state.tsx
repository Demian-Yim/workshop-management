'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 animate-fade-in', className)}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
