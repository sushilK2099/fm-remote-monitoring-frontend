export default function OperoLogo({ size = 26, wordSize = 16, subLabel = 'Maintenance', collapsed = false }) {
  const inner = Math.round(size * 0.54);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div
        style={{
          width: size, height: size, borderRadius: Math.round(size * 0.27),
          background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none',
          boxShadow: size >= 32 ? '0 2px 6px rgba(37,99,235,.32)' : 'none',
        }}
      >
        <svg width={inner} height={inner} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{ fontSize: wordSize, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>Opero</span>
          {subLabel && <span style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--text-tertiary)' }}>{subLabel}</span>}
        </div>
      )}
    </div>
  );
}
