'use client';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Loader from '@/components/ui/Loader';
import PageTransition from '@/components/PageTransition';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/api/services/auth.service';
import { masterApi } from '@/api/axios';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '/rm';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, setAuth, permissions, setPermissions } = useAuthStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Account-level (global) permissions — no locationId needed. For a super admin this
    // returns isSuperAdmin:true + all permission keys.
    const loadPerms = () => masterApi.get('/my-role-permissions')
      .then((res) => setPermissions(res.data.data || {}))
      .catch(() => {});

    if (isAuthenticated) {
      setChecking(false);
      if (!permissions.length) loadPerms();
      return;
    }
    authService.me()
      .then((res) => {
        setAuth(res.data.data || res.data);
        setChecking(false);
        loadPerms();
      })
      .catch(() => {
        window.location.href = `${BASE_PATH}/login`;
      });
  }, []);

  if (checking) {
    return <Loader fullPage />;
  }

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div style={{ display: 'contents' }} className="layout-sidebar-wrapper"><Sidebar /></div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden print:block print:overflow-visible">
        <div style={{ display: 'contents' }} className="layout-header-wrapper"><Header /></div>
        <main className="flex-1 flex flex-col min-h-0 overflow-y-auto print:block print:overflow-visible print:min-h-0">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </div>
  );
}
