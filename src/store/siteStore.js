'use client';
import { create } from 'zustand';

function getStoredSiteId() {
  if (typeof window === 'undefined') return null;
  try { return localStorage.getItem('maint_selected_site') || null; } catch { return null; }
}

const useSiteStore = create((set, get) => ({
  sites: [],           // [{ locationId, locationName }]
  selectedSiteId: getStoredSiteId(),
  isSuperAdmin: false,
  loaded: false,

  setSites: ({ sites, isSuperAdmin }) => {
    const stored = get().selectedSiteId;
    // Auto-select if only one site; validate stored selection still exists
    let selectedSiteId = stored;
    if (sites.length === 1) {
      selectedSiteId = sites[0].locationId;
    } else if (stored && !sites.find((s) => s.locationId === stored)) {
      selectedSiteId = sites[0]?.locationId || null;
    }
    if (typeof window !== 'undefined') {
      if (selectedSiteId) localStorage.setItem('maint_selected_site', selectedSiteId);
      else localStorage.removeItem('maint_selected_site');
    }
    set({ sites, isSuperAdmin, selectedSiteId, loaded: true });
  },

  setSelectedSiteId: (locationId) => {
    if (typeof window !== 'undefined') {
      if (locationId) localStorage.setItem('maint_selected_site', locationId);
      else localStorage.removeItem('maint_selected_site');
    }
    set({ selectedSiteId: locationId });
  },

  clear: () => {
    if (typeof window !== 'undefined') localStorage.removeItem('maint_selected_site');
    set({ sites: [], selectedSiteId: null, isSuperAdmin: false, loaded: false });
  },
}));

export default useSiteStore;
