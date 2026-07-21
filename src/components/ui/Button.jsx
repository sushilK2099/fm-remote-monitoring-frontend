'use client';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 border border-primary-600',
  outline: 'bg-transparent border hover:bg-[var(--bg-hover)]',
  ghost: 'bg-transparent border-transparent hover:bg-[var(--bg-hover)]',
  danger: 'bg-red-600 text-white hover:bg-red-700 border border-red-600',
};

const sizes = {
  sm: 'px-2.5 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-5 py-2.5 text-base gap-2',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97]',
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        variant === 'outline' && 'border-[var(--border-primary)]',
        variant === 'ghost' && 'border-transparent',
        className
      )}
      style={variant === 'outline' || variant === 'ghost' ? { color: 'var(--text-primary)' } : undefined}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
