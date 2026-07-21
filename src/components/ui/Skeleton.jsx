export default function Skeleton({ variant = 'line', className = '' }) {
  if (variant === 'card') {
    return (
      <div className="rounded-xl border p-5 space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
        <div className="op-skeleton h-4 w-1/3" />
        <div className="op-skeleton h-4 w-2/3" />
        <div className="op-skeleton h-4 w-1/2" />
      </div>
    );
  }
  if (variant === 'table') {
    return (
      <div className="space-y-2 p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-10 rounded" style={{ backgroundColor: 'var(--bg-tertiary)' }} />
        ))}
      </div>
    );
  }
  return <div className={`op-skeleton h-4 ${className}`} />;
}
