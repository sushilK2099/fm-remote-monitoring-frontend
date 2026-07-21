'use client';
import { Search } from 'lucide-react';
import { clsx } from 'clsx';

export default function SearchInput({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={clsx('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--text-tertiary)' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-colors focus:border-primary-500"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
      />
    </div>
  );
}
