export default function Toggle({ checked, onChange }) {
  return (
    <span
      onClick={() => onChange(!checked)}
      style={{ display: 'inline-flex', width: 34, height: 20, borderRadius: 20, background: checked ? 'var(--accent)' : 'var(--border-strong)', cursor: 'pointer', padding: 2, transition: 'background .15s', flexShrink: 0 }}
    >
      <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', transform: checked ? 'translateX(14px)' : 'translateX(0)', transition: 'transform .15s' }} />
    </span>
  );
}
