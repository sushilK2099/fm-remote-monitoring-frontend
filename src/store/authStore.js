'use client';
import { create } from 'zustand';

function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('maint_user') || 'null'); } catch { return null; }
}

export const useAuthStore = create((set) => ({
  user: getStoredUser(),
  isAuthenticated: !!getStoredUser(),
  permissions: [],
  isSuperAdmin: false,

  setAuth: (user) => {
    if (typeof window !== 'undefined') localStorage.setItem('maint_user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  setPermissions: ({ permissions, isSuperAdmin }) => {
    set({ permissions: permissions || [], isSuperAdmin: !!isSuperAdmin });
  },

  logout: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('maint_user');
    set({ user: null, isAuthenticated: false, permissions: [], isSuperAdmin: false });
  },
}));
