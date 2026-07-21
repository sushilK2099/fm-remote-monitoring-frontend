import { Plus } from 'lucide-react';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PageHeader({ title, subtitle, actionLabel, onAction, titleSize = 'var(--h1)', section, sectionHref, breadcrumbLabel, count }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <Breadcrumb section={section} sectionHref={sectionHref} current={breadcrumbLabel || title} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ fontSize: titleSize, fontWeight: 600, color: 'var(--heading-color)' }}>{title}</div>
            {count != null && (
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, padding: '2px 9px', borderRadius: 20, backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                {count}
              </span>
            )}
          </div>
          {subtitle && <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 3 }}>{subtitle}</div>}
        </div>
        {actionLabel && (
          <button
            onClick={onAction}
            style={{
              height: 36, padding: '0 16px', background: 'var(--accent)', color: '#fff', border: 'none',
              borderRadius: 8, fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer', display: 'flex',
              alignItems: 'center', gap: 7, whiteSpace: 'nowrap', flex: 'none',
            }}
          >
            <Plus size={15} strokeWidth={2.2} />
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
