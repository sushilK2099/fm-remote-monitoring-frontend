'use client';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react';
import { locationService } from '@/api/services/location.service';
import { cn } from '@/utils/cn';

/**
 * Cascading location picker.
 * Props:
 *   value    – current locationId string (controlled)
 *   onChange – called with the selected locationId
 *   label    – field label
 *   error    – validation error message
 */
export default function LocationHierarchyPicker({ value, onChange, label, error }) {
  const [levels, setLevels] = useState([{ options: [], selectedId: null, loading: true }]);

  const UNINIT = useRef(Symbol()).current;
  const cascadeValueRef = useRef(UNINIT);

  async function rebuildCascade(leafId, cancelled) {
    const chain = [];
    let currentId = leafId;
    while (currentId) {
      try {
        const res = await locationService.getById(currentId);
        const loc = res.data.data || res.data;
        if (!loc || cancelled.v) return;
        chain.unshift(loc);
        currentId = loc.parentId || null;
      } catch { break; }
    }
    if (cancelled.v) return;

    const newLevels = [];
    for (let i = 0; i < chain.length; i++) {
      const item = chain[i];
      try {
        const res = item.parentId
          ? await locationService.getChildren(item.parentId)
          : await locationService.getRoots();
        if (cancelled.v) return;
        newLevels.push({ options: res.data.data || [], selectedId: item.locationId, loading: false });
      } catch {
        newLevels.push({ options: [], selectedId: item.locationId, loading: false });
      }
    }

    try {
      const childRes = await locationService.getChildren(leafId);
      if (!cancelled.v && (childRes.data.data || []).length > 0) {
        newLevels.push({ options: childRes.data.data, selectedId: null, loading: false });
      }
    } catch { /* no children */ }

    if (!cancelled.v) {
      cascadeValueRef.current = leafId;
      setLevels(newLevels.length ? newLevels : [{ options: [], selectedId: null, loading: false }]);
    }
  }

  async function loadRoots(cancelled) {
    try {
      const res = await locationService.getRoots();
      if (!cancelled.v) {
        cascadeValueRef.current = null;
        setLevels([{ options: res.data.data || [], selectedId: null, loading: false }]);
      }
    } catch {
      if (!cancelled.v) setLevels([{ options: [], selectedId: null, loading: false }]);
    }
  }

  useEffect(() => {
    if (value === cascadeValueRef.current) return;
    const cancelled = { v: false };
    if (value) {
      setLevels([{ options: [], selectedId: null, loading: true }]);
      rebuildCascade(value, cancelled);
    } else {
      setLevels([{ options: [], selectedId: null, loading: true }]);
      loadRoots(cancelled);
    }
    return () => { cancelled.v = true; };
  }, [value]);

  const handleSelect = async (levelIndex, locationId) => {
    setLevels((prev) =>
      prev.slice(0, levelIndex + 1).map((l, i) =>
        i === levelIndex ? { ...l, selectedId: locationId } : l
      )
    );
    cascadeValueRef.current = locationId || null;
    onChange?.(locationId || null);
    if (!locationId) return;
    try {
      const res = await locationService.getChildren(locationId);
      const children = res.data.data || [];
      if (children.length > 0) {
        setLevels((prev) => {
          if (!prev[levelIndex] || prev[levelIndex].selectedId !== locationId) return prev;
          return [...prev, { options: children, selectedId: null, loading: false }];
        });
      }
    } catch { /* no children */ }
  };

  const breadcrumb = levels
    .filter((l) => l.selectedId)
    .map((l) => l.options.find((o) => o.locationId === l.selectedId)?.locationName ?? l.selectedId);

  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </label>
      )}

      {breadcrumb.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap text-xs px-1" style={{ color: 'var(--text-tertiary)' }}>
          <MapPin className="h-3 w-3 shrink-0" />
          {breadcrumb.map((name, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span style={{ color: i === breadcrumb.length - 1 ? 'var(--text-primary)' : undefined }}>{name}</span>
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {levels.map((level, i) => (
          <div key={i} className="relative">
            <select
              disabled={level.loading}
              value={level.selectedId ?? ''}
              onChange={(e) => handleSelect(i, e.target.value || null)}
              className={cn(
                'w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed',
                error && i === 0 && 'border-red-500 focus:ring-red-500 focus:border-red-500'
              )}
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: (error && i === 0) ? undefined : 'var(--border-primary)',
                color: 'var(--text-primary)',
              }}
            >
              <option value="">
                {level.loading ? 'Loading…' : i === 0 ? 'Select top-level location' : 'Select child location (optional)'}
              </option>
              {level.options.map((loc) => (
                <option key={loc.locationId} value={loc.locationId}>
                  {loc.locationName}{loc.type ? ` (${loc.type})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
              style={{ color: 'var(--text-tertiary)' }}
            />
          </div>
        ))}
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
