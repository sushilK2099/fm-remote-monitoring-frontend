import { LayoutGrid, LayoutDashboard, Gauge, Cpu, BellRing, SlidersHorizontal } from 'lucide-react';

export const navigationConfig = {
  workspace: [
    { label: 'Overview',   path: '/dashboard',  icon: LayoutGrid },
    { label: 'Dashboards', path: '/dashboards', icon: LayoutDashboard, permission: 'remote_monitoring.readings.view' },
  ],
  monitoring: {
    label: 'Monitoring',
    children: [
      { label: 'Metrics', path: '/metrics', icon: SlidersHorizontal, permission: 'remote_monitoring.metrics.view' },
      { label: 'Devices', path: '/devices', icon: Cpu, countKey: 'devices', permission: 'remote_monitoring.devices.view' },
    ],
  },
  alerts: {
    label: 'Alerts',
    children: [
      { label: 'Alert Rules', path: '/alert-rules', icon: Gauge,    permission: 'remote_monitoring.alerts.view' },
      { label: 'Alerts',      path: '/alerts',       icon: BellRing, countKey: 'alerts', permission: 'remote_monitoring.alerts.view' },
    ],
  },
};

export const MODULES = {
  '/dashboard':   { title: 'Overview',    search: false },
  '/dashboards':  { title: 'Dashboards',  search: false },
  '/metrics':     { title: 'Metrics',     search: false },
  '/devices':     { title: 'Devices',     search: false },
  '/alert-rules': { title: 'Alert Rules', search: false },
  '/alerts':      { title: 'Alerts',      search: false },
};

export function moduleForPath(pathname) {
  const key = Object.keys(MODULES).filter((p) => pathname === p || pathname.startsWith(p + '/')).sort((a, b) => b.length - a.length)[0];
  return key ? { title: MODULES[key].title, search: MODULES[key].search } : { title: 'Remote Monitoring', search: false };
}
