export default function Card({ children, header, className = '', noPadding = false, hoverable = false, ...rest }) {
  return (
    <div
      className={`border ${hoverable ? 'op-card-hover' : ''} ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}
      {...rest}
    >
      {header && (
        <div className="border-b" style={{ borderColor: 'var(--border-primary)', padding: '21px' }}>
          {header}
        </div>
      )}
      <div style={noPadding ? undefined : { padding: '21px' }}>{children}</div>
    </div>
  );
}
