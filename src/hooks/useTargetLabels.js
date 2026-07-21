import { useEffect, useMemo, useState } from 'react';
import { locationService } from '@/api/services/location.service';
import { assetService } from '@/api/services/asset.service';

/**
 * Resolves a monitoring target (ASSET / LOCATION) to a readable label WITHOUT
 * storing anything: it loads all locations + assets once and builds the label
 * in memory. Locations become their full path ("Main > Site1 > Floor1") by
 * walking parentId — so a rename/move is reflected immediately, no backfill.
 *
 * Usage:
 *   const { label, loading } = useTargetLabels();
 *   label('LOCATION', locId);           // "Main > Site1 > Floor1"
 *   metricLabel(metric);                // "Temperature — Main > Site1 > Floor1"
 */
export default function useTargetLabels() {
  const [locations, setLocations] = useState(null); // null = loading
  const [assets, setAssets] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      locationService.getAll({}).catch(() => ({ data: { data: [] } })),
      assetService.getAll({}).catch(() => ({ data: { data: [] } })),
    ]).then(([locRes, assetRes]) => {
      if (cancelled) return;
      setLocations(locRes.data.data || []);
      setAssets(assetRes.data.data || []);
    });
    return () => { cancelled = true; };
  }, []);

  const locById = useMemo(() => {
    const m = {};
    (locations || []).forEach((l) => { m[l.locationId] = l; });
    return m;
  }, [locations]);

  const assetById = useMemo(() => {
    const m = {};
    (assets || []).forEach((a) => { m[a.assetId] = a; });
    return m;
  }, [assets]);

  // Build "Main > Site1 > Floor1" by walking parentId. Guards against cycles.
  const locationPath = useMemo(() => (locationId) => {
    const chain = [];
    let current = locById[locationId];
    const seen = new Set();
    while (current && !seen.has(current.locationId)) {
      seen.add(current.locationId);
      chain.unshift(current.locationName);
      current = current.parentId ? locById[current.parentId] : null;
    }
    return chain.length ? chain.join(' > ') : locationId;
  }, [locById]);

  const label = useMemo(() => (targetType, targetId) => {
    if (!targetId) return '—';
    if (targetType === 'LOCATION') return locationPath(targetId);
    if (targetType === 'ASSET') return assetById[targetId]?.assetName || targetId;
    return targetId;
  }, [locationPath, assetById]);

  // "Temperature — Main > Site1 > Floor1"
  const metricLabel = useMemo(() => (metric) => {
    if (!metric) return '';
    return `${metric.name} — ${label(metric.targetType, metric.targetId)}`;
  }, [label]);

  return { label, metricLabel, loading: locations === null || assets === null };
}
