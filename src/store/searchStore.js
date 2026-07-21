'use client';
import { create } from 'zustand';

const useSearchStore = create((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  clear: () => set({ query: '' }),
}));

export default useSearchStore;
