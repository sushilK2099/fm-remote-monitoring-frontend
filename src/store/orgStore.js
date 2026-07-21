'use client';
import { create } from 'zustand';

export const useOrgStore = create((set) => ({
  org: null,
  orgStatus: 'idle', // 'idle' | 'loading' | 'found' | 'not_found' | 'inactive'

  setOrg: (org) => set({ org, orgStatus: 'found' }),
  setOrgStatus: (orgStatus) => set({ orgStatus }),
}));
