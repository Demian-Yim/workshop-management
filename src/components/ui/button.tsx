'use client';
import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'brand' | 'secondary' | 'danger' | 'ghost' | 'admin';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[var(--brand-500)] hover:bg-[var(--brand-600)] text-white shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-brand)]',
      brand: 'bg-brand-gradient text-white shadow-[var(--shadow-brand)] hover:opacity-90',
      secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700',
      danger: 'bg-red-600 hover:bg-red-700 text-white',
      ghost: 'hover:bg-slate-100 text-slate-600',
      admin: 'bg-purple-600 hover:bg-purple-700 text-white shadow-[var(--shadow-sm)]',
      fab: 'bg-brand-gradient text-white shadow-[var(--shadow-brand)] hover:opacity-90 rounded-full !p-0 w-14 h-14',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
      md: 'px-4 py-2 text-sm rounded-[var(--radius-md)]',
      lg: 'px-6 py-3 text-base rounded-[var(--radius-lg)]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'font-semibold transition-all duration-200 inline-flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
export default Button;
