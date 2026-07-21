'use client';
import { motion } from 'motion/react';
import Breadcrumb from '@/components/ui/Breadcrumb';

export default function PageWrapper({ title, titleBadge, description, actions, section, sectionHref, breadcrumbLabel, children }) {
  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={{ paddingBottom: 28, borderBottom: '1px solid var(--border-primary)' }}
      >
        <div>
          <Breadcrumb section={section} sectionHref={sectionHref} current={breadcrumbLabel || title} />
          <div className="flex items-center flex-wrap gap-2.5">
            <h1 style={{ fontSize: 'var(--h1)', fontWeight: 600, color: 'var(--heading-color)' }}>{title}</h1>
            {titleBadge}
          </div>
          {description && <p style={{ fontSize: 'var(--text-sm)', marginTop: 4, color: 'var(--text-tertiary)' }}>{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </motion.div>
      {children}
    </div>
  );
}
