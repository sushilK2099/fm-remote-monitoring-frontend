'use client';
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronDown, LogOut, Moon, Sun } from 'lucide-react';
import { navigationConfig } from '@/config/navigation';
import { useAuthStore } from '@/store/authStore';
import useMetaStore from '@/store/metaStore';
import useSidebarStore from '@/store/sidebarStore';
import useSiteStore from '@/store/siteStore';
import useThemeStore from '@/store/themeStore';
import { authService } from '@/api/services/auth.service';
import useClickOutside from '@/hooks/useClickOutside';
import OperoLogo from '@/components/shared/OperoLogo';

function initials(user) {
  const s = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || '';
  return s.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U';
}

const isActive = (pathname, path) =>
  pathname === path || pathname.startsWith(path + '/');

export default function Sidebar() {
  const pathname = usePathname();
  const { user, permissions, isSuperAdmin, logout } = useAuthStore();
  const counts = useMetaStore((s) => s.counts);
  const { isOpen, toggle } = useSidebarStore();
  const { mode, toggleMode } = useThemeStore();
  const { clear: clearSite } = useSiteStore();
  const collapsed = !isOpen;

  const [openSections, setOpenSections] = useState({ workspace: true, monitoring: true, alerts: true });
  const toggleSection = (key) => setOpenSections((s) => ({ ...s, [key]: !s[key] }));

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  useClickOutside(accountRef, () => setAccountOpen(false), accountOpen);

  const onLogout = async () => {
    try { await authService.logout(); } catch { /* ignore */ }
    logout();
    clearSite();
    window.location.href = '/mnt/login';
  };

  const fullName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : (user?.email || 'User');

  const canSee = (item) => !item.permission || isSuperAdmin || permissions.includes(item.permission);

  return (
    <motion.aside
      className="flex flex-col shrink-0"
      animate={{ width: collapsed ? 92 : 260 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{
        position: 'relative',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-primary)',
        overflow: 'visible',
      }}
    >
      <button
        onClick={toggle}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        style={{
          position: 'absolute', top: 22, right: -14, width: 28, height: 28, borderRadius: '50%',
          background: 'var(--bg-card)', border: '1px solid var(--border-primary)', boxShadow: 'var(--shadow-card)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-tertiary)',
          zIndex: 30,
        }}
      >
        <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2, ease: 'easeInOut' }} style={{ display: 'flex' }}>
          <ChevronLeft size={15} />
        </motion.div>
      </button>

      <div style={{ height: 'var(--header-height)', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', padding: collapsed ? '0 12px' : '0 16px', borderBottom: '1px solid var(--border-primary)' }}>
        <OperoLogo collapsed={collapsed} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '14px 8px' : '14px 10px' }}>
        <Section label="Workspace" collapsed={collapsed} open={openSections.workspace} onToggle={() => toggleSection('workspace')}>
          {navigationConfig.workspace.filter(canSee).map((item) => (
            <NavItem key={item.path} item={item} active={isActive(pathname, item.path)} collapsed={collapsed} />
          ))}
        </Section>
        <Section label="Monitoring" collapsed={collapsed} open={openSections.monitoring} onToggle={() => toggleSection('monitoring')}>
          {navigationConfig.monitoring.children.filter(canSee).map((item) => (
            <NavItem key={item.path} item={item} count={counts[item.countKey]} active={isActive(pathname, item.path)} collapsed={collapsed} />
          ))}
        </Section>
        <Section label="Alerts" collapsed={collapsed} open={openSections.alerts} onToggle={() => toggleSection('alerts')}>
          {navigationConfig.alerts.children.filter(canSee).map((item) => (
            <NavItem key={item.path} item={item} count={counts[item.countKey]} active={isActive(pathname, item.path)} collapsed={collapsed} />
          ))}
        </Section>
      </div>

      <div style={{ borderTop: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', gap: 8, padding: collapsed ? '10px 8px' : '10px 12px' }}>
          <div ref={accountRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setAccountOpen((v) => !v)}
              style={{ display: 'inline-flex', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-xs)', fontWeight: 700, flexShrink: 0 }}>
                {initials(user)}
              </div>
            </button>

            <AnimatePresence>
              {accountOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.97, y: 6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 6 }}
                  transition={{ duration: 0.14, ease: 'easeOut' }}
                  style={{
                    position: 'absolute', bottom: 'calc(100% + 10px)', left: 0, width: 220, transformOrigin: 'bottom left',
                    background: 'var(--bg-card)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-card)', zIndex: 50, padding: 6,
                  }}
                >
                  <div style={{ padding: '8px 10px' }}>
                    <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--heading-color)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</div>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
                    <div style={{ fontSize: 'var(--text-base)', color: 'var(--text-tertiary)', marginTop: 2 }}>{isSuperAdmin ? 'Maintenance Admin' : 'Member'}</div>
                  </div>
                  <div style={{ height: 1, background: 'var(--border-primary)', margin: '4px 0' }} />
                  <button
                    onClick={onLogout}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, width: '100%', padding: '8px 10px', borderRadius: 'var(--radius)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', textAlign: 'left' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--nav-hover-bg)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
                  >
                    <LogOut size={15} /> Sign out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!collapsed && (
            <button
              onClick={toggleMode}
              title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ display: 'inline-flex', flexShrink: 0, color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none', padding: 8, borderRadius: 'var(--radius-sm)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--nav-hover-bg)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

function Section({ label, collapsed, open, onToggle, children }) {
  return (
    <div style={{ marginBottom: 4 }}>
      {!collapsed && (
        <button
          onClick={onToggle}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            background: 'none', border: 'none', cursor: 'pointer', padding: '16px 8px 8px',
          }}
        >
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.07em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{label}</span>
          <motion.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.15, ease: 'easeInOut' }} style={{ display: 'flex' }}>
            <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} />
          </motion.div>
        </button>
      )}
      {collapsed ? (
        children
      ) : (
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
              style={{ overflow: 'hidden' }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

function NavItem({ item, count, active, collapsed }) {
  const Icon = item.icon;
  const itemRef = useRef(null);
  const [tooltipPos, setTooltipPos] = useState(null);

  const showTooltip = () => {
    if (!collapsed || !itemRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    setTooltipPos({ top: rect.top + rect.height / 2, left: rect.right + 10 });
  };
  const hideTooltip = () => setTooltipPos(null);

  return (
    <div
      ref={itemRef}
      style={{ position: 'relative' }}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      <Link href={item.path} className="op-nav-link" style={{
        display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: 9, padding: collapsed ? '9px' : '7px 9px', borderRadius: 'var(--radius)',
        marginBottom: 1, fontSize: 'var(--text-base)', fontWeight: active ? 600 : 500,
        color: active ? 'var(--accent)' : 'var(--text-secondary)',
        background: active ? 'var(--row-selected)' : 'transparent', textDecoration: 'none',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--nav-hover-bg)'; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
      >
        {Icon && <Icon size={16} style={{ flex: 'none', color: active ? 'var(--accent)' : 'var(--text-muted)', opacity: active ? 1 : 0.7 }} />}
        {!collapsed && <span>{item.label}</span>}
        {!collapsed && count != null && (
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: active ? 'var(--accent)' : 'var(--text-tertiary)', background: active ? 'var(--accent-tint)' : 'var(--bg-tertiary)', padding: '1px 7px', borderRadius: 10 }}>{count}</span>
        )}
      </Link>
      {collapsed && tooltipPos && createPortal(
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.12 }}
          style={{
            position: 'fixed', top: tooltipPos.top, left: tooltipPos.left, transform: 'translateY(-50%)',
            whiteSpace: 'nowrap', padding: '5px 10px', borderRadius: 'var(--radius-sm)',
            background: 'var(--text-primary)', color: 'var(--bg-primary)', fontSize: 'var(--text-sm)', fontWeight: 600,
            pointerEvents: 'none', zIndex: 100,
          }}
        >
          {item.label}{count != null ? ` (${count})` : ''}
        </motion.span>,
        document.body
      )}
    </div>
  );
}
