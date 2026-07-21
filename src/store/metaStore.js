'use client';
import { create } from 'zustand';
import { deviceService } from '@/api/services/device.service';
import { alertEventService } from '@/api/services/alert.service';

const len = (res) => (Array.isArray(res?.data?.data) ? res.data.data.length : 0);

const useMetaStore = create((set) => ({
  counts: { devices: 0, alerts: 0 },

  fetchCounts: async () => {
    const [devices, alerts] = await Promise.all([
      deviceService.getAll().then(len).catch(() => 0),
      alertEventService.getAll({ status: 'OPEN' }).then(len).catch(() => 0),
    ]);
    set({ counts: { devices, alerts } });
  },

  setCount: (key, value) => set((s) => ({ counts: { ...s.counts, [key]: value } })),
}));

export default useMetaStore;
