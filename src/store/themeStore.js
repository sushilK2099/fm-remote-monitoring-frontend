'use client';
import { create } from 'zustand';
import { defaultTheme, generateColorShades } from '@/config/theme';

const useThemeStore = create((set, get) => ({
  mode: defaultTheme.mode,
  primaryColor: defaultTheme.primaryColor,
  secondaryColor: defaultTheme.secondaryColor,
  logoUrl: null,

  setMode: (mode) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maintenance-theme-mode', mode);
      if (mode === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ mode });
  },

  toggleMode: () => {
    const newMode = get().mode === 'light' ? 'dark' : 'light';
    get().setMode(newMode);
  },

  setPrimaryColor: (color) => {
    if (typeof window !== 'undefined') {
      const shades = generateColorShades(color);
      Object.entries(shades).forEach(([shade, value]) => {
        document.documentElement.style.setProperty(`--theme-primary-${shade}`, value);
      });
    }
    set({ primaryColor: color });
  },

  setSecondaryColor: (color) => {
    if (typeof window !== 'undefined') {
      const shades = generateColorShades(color);
      Object.entries(shades).forEach(([shade, value]) => {
        document.documentElement.style.setProperty(`--theme-secondary-${shade}`, value);
      });
    }
    set({ secondaryColor: color });
  },

  initTheme: () => {
    if (typeof window === 'undefined') return;
    const mode = localStorage.getItem('maintenance-theme-mode') || defaultTheme.mode;
    get().setMode(mode);
    get().setPrimaryColor(defaultTheme.primaryColor);
    get().setSecondaryColor(defaultTheme.secondaryColor);
  },

  applyBranding: (branding = {}) => {
    if (!branding || typeof window === 'undefined') return;
    const { setPrimaryColor, setSecondaryColor } = get();
    if (branding.primaryColor)   setPrimaryColor(branding.primaryColor);
    if (branding.secondaryColor) setSecondaryColor(branding.secondaryColor);
    if (branding.appName) document.title = branding.appName;
    if (branding.faviconUrl) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) { link = document.createElement('link'); link.rel = 'icon'; document.head.appendChild(link); }
      link.href = branding.faviconUrl;
    }
    set({ logoUrl: branding.logoUrl || null });
  },
}));

export default useThemeStore;
