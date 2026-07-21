'use client';
import { forwardRef } from 'react';
import { clsx } from 'clsx';

const Select = forwardRef(function Select({ label, error, options = [], className, ...props }, ref) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={clsx(
          'w-full px-3 py-2 text-sm rounded-lg border outline-none transition-colors cursor-pointer',
          'focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
          error ? 'border-red-400' : 'border-[var(--border-primary)]',
          className
        )}
        style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-primary)' }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
});

export default Select;
