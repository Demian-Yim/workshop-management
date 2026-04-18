'use client';
import { cn } from '@/lib/utils';
import { HTMLAttributes, CSSProperties } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: 'default' | 'brand' | 'soft';
  bgImage?: string;
}

export function Card({ className, hoverable, variant = 'default', bgImage, style, children, ...props }: CardProps) {
  const variants = {
    default: 'bg-white border border-slate-200 shadow-[var(--shadow-sm)]',
    brand: 'bg-brand-gradient border-0 text-white shadow-[var(--shadow-brand)]',
    soft: 'bg-brand-gradient-soft border border-indigo-100 shadow-[var(--shadow-sm)]',
  };

  const bgStyle: CSSProperties = bgImage
    ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center', ...style }
    : style ?? {};

  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] overflow-hidden',
        variants[variant],
        hoverable && 'hover:shadow-[var(--shadow-md)] hover:border-slate-300 transition-all duration-200 cursor-pointer',
        className
      )}
      style={bgStyle}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-slate-100', className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-t border-slate-100 bg-slate-50', className)} {...props}>
      {children}
    </div>
  );
}
