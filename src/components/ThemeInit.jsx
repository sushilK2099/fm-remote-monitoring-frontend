'use client';
import { useEffect } from 'react';
import useThemeStore from '@/store/themeStore';
import useSidebarStore from '@/store/sidebarStore';
import { masterApi } from '@/api/axios';

export default function ThemeInit() {
  useEffect(() => {
    useThemeStore.getState().initTheme();
    useSidebarStore.getState().initSidebar();

    masterApi.get('/account/current')
      .then((res) => {
        const branding = res.data?.data?.branding;
        useThemeStore.getState().applyBranding(branding);
      })
      .catch(() => {});
  }, []);
  return null;
}
