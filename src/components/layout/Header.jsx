'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Search, MapPin, ChevronDown } from 'lucide-react';
import useSearchStore from '@/store/searchStore';
import useSiteStore from '@/store/siteStore';
import useMetaStore from '@/store/metaStore';
import { moduleForPath } from '@/config/navigation';
import useClickOutside from '@/hooks/useClickOutside';

export default function Header() {
  const pathname = usePathname();
  const { query, setQuery } = useSearchStore();
  const { sites, selectedSiteId, setSelectedSiteId, loaded, setSites } = useSiteStore();
  const showSiteSelector = sites.length > 1;
  const counts = useMetaStore((s) => s.counts);
  const fetchCounts = useMetaStore((s) => s.fetchCounts);

  const mod = moduleForPath(pathname);

  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);
  useClickOutside(notifRef, () => setNotifOpen(false), notifOpen);

  useEffect(() => {
    // Monitoring is account-scoped, not site-scoped — no site switcher.
    if (!loaded) setSites({ isSuperAdmin: false, sites: [] });
  }, [loaded, setSites]);

  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  useEffect(() => { setQuery(''); }, [mod.title, setQuery]);

  return (
    <header style={{ height: 'var(--header-height)', flex: 'none', background: 'var(--bg-header)', borderBottom: '1px solid var(--border-primary)', display: 'flex', alignItems: 'center', padding: '0 44px 0 28px', gap: 22 }}>
      <div style={{ flex: 1 }} />

      {mod.search && (
        <div style={{ position: 'relative', width: 260 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', display: 'inline-flex' }}><Search size={15} /></span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search work orders…"
            style={{ width: '100%', height: 34, padding: '0 12px 0 32px', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)', outline: 'none', color: 'var(--text-primary)' }}
          />
        </div>
      )}

      {showSiteSelector && (
        <>
          <div style={{ height: 24, width: 1, background: 'var(--border-primary)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: 180 }}>
            <MapPin size={13} style={{ position: 'absolute', left: 8, color: 'var(--text-tertiary)', flexShrink: 0, pointerEvents: 'none' }} />
            <select
              value={selectedSiteId || ''}
              onChange={(e) => setSelectedSiteId(e.target.value || null)}
              style={{ width: '100%', minWidth: 0, appearance: 'none', height: 34, padding: '0 24px 0 28px', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', fontSize: 'var(--text-sm)', fontWeight: 500, background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', cursor: 'pointer', textOverflow: 'ellipsis' }}
            >
              <option value="">All sites</option>
              {sites.map((s) => <option key={s.locationId} value={s.locationId}>{s.locationName}</option>)}
            </select>
            <ChevronDown size={12} style={{ position: 'absolute', right: 8, color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
          </div>
        </>
      )}

      <div style={{ height: 24, width: 1, background: 'var(--border-primary)' }} />
      <div ref={notifRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen((v) => !v)}
          style={{ position: 'relative', display: 'inline-flex', color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
        >
          <Bell size={18} />
          {counts.rules > 0 && (
            <span style={{ position: 'absolute', top: -3, right: -3, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', border: '1.5px solid var(--bg-header)' }} />
          )}
        </button>

        <AnimatePresence>
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -6 }}
              transition={{ duration: 0.14, ease: 'easeOut' }}
              style={{
                position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: 280, transformOrigin: 'top right',
                background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-card)', zIndex: 50, overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-primary)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--text-primary)' }}>
                Notifications
              </div>
              <div style={{ padding: '14px', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {counts.rules > 0
                  ? `You have ${counts.rules} notification rule${counts.rules === 1 ? '' : 's'} configured.`
                  : 'No notification rules configured yet.'}
              </div>
              <Link
                href="/notifications"
                onClick={() => setNotifOpen(false)}
                style={{ display: 'block', textAlign: 'center', padding: '10px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--accent)', textDecoration: 'none', borderTop: '1px solid var(--border-primary)' }}
              >
                Manage notification rules →
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
