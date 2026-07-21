'use client';
import { create } from 'zustand';

const STORAGE_KEY = 'maintenance-sidebar-open';

const useSidebarStore = create((set, get) => ({
  isOpen: true,

  setOpen: (isOpen) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(isOpen));
    }
    set({ isOpen });
  },

  toggle: () => get().setOpen(!get().isOpen),

  initSidebar: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) set({ isOpen: JSON.parse(stored) });
  },
}));

export default useSidebarStore;
