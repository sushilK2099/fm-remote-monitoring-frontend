'use client';
import Link from 'next/link';
import { useOrgStore } from '@/store/orgStore';

export default function Breadcrumb({ section, sectionHref, current }) {
  const org = useOrgStore((s) => s.org);
  const crumbs = [
    { label: org?.name || 'Account' },
    section && { label: section, href: sectionHref },
    { label: current },
  ].filter(Boolean);

  return (
    <nav className="flex items-center flex-wrap gap-1.5 mb-1.5" aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        const style = { fontSize: 'var(--text-xs)', color: isLast ? 'var(--text-secondary)' : 'var(--text-tertiary)', fontWeight: isLast ? 600 : 500 };
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span style={{ color: 'var(--text-tertiary)' }}>/</span>}
            {crumb.href ? (
              <Link href={crumb.href} style={{ ...style, textDecoration: 'none' }} className="hover:underline">{crumb.label}</Link>
            ) : (
              <span style={style}>{crumb.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
