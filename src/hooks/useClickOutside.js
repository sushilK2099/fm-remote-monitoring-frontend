'use client';
import { useEffect } from 'react';

export default function useClickOutside(ref, onOutside, active = true) {
  useEffect(() => {
    if (!active) return;
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) onOutside();
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [ref, onOutside, active]);
}
