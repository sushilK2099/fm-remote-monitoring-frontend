'use client';
import Button from './Button';

export default function Pagination({ page, totalPages, pageSize, from, to, total, onPageChange, onPageSizeChange }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3">
      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Showing {from} to {to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="text-xs px-2 py-1.5 rounded-lg border outline-none"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
        >
          {[10, 25, 50].map((n) => <option key={n} value={n}>{n} / page</option>)}
        </select>
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        <span className="text-xs px-2" style={{ color: 'var(--text-secondary)' }}>{page} / {totalPages || 1}</span>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
