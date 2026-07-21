'use client';

export default function SegmentedToggle({ options, value, onChange, fullWidth = false, height = 40 }) {
  return (
    <div style={{ display: 'flex', border: '1px solid var(--border-strong)', borderRadius: 8, overflow: 'hidden', height }}>
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <span
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{
              flex: fullWidth ? 1 : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              background: active ? 'var(--row-selected)' : 'var(--bg-primary)',
              borderLeft: i > 0 ? '1px solid var(--border-primary)' : 'none',
            }}
          >
            {o.label}
          </span>
        );
      })}
    </div>
  );
}
