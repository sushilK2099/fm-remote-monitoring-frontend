'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';

export default function Drawer({ isOpen, onClose, title, footer, children, width = 440 }) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
          <motion.div
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(20,22,27,.32)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          />
          <motion.div
            style={{
              position: 'absolute', top: 0, right: 0, height: '100%', width, maxWidth: '92vw',
              background: 'var(--bg-card)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div style={{ height: 58, flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 22px', borderBottom: '1px solid var(--border-primary)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--text-primary)' }}>{title}</div>
              <span onClick={onClose} style={{ cursor: 'pointer', color: 'var(--text-tertiary)', display: 'inline-flex' }}><X size={18} /></span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 22 }}>{children}</div>
            {footer && (
              <div style={{ flex: 'none', display: 'flex', gap: 10, padding: '16px 22px', borderTop: '1px solid var(--border-primary)' }}>
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
