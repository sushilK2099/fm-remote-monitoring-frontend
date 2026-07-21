'use client';
import { Loader2 } from 'lucide-react';

export default function Loader({ fullPage = false, className = '' }) {
  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Loader2 className={`h-8 w-8 animate-spin text-primary-600 ${className}`} />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className={`h-6 w-6 animate-spin text-primary-600 ${className}`} />
    </div>
  );
}
