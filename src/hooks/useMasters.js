'use client';
import { useEffect, useState, useCallback } from 'react';
import { masterDataService } from '@/api/services/masterData.service';

export default function useMasters() {
  const [locations, setLocations] = useState([]);
  const [assets, setAssets] = useState([]);
  const [vendors] = useState([]);   // vendors are not used in monitoring
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      masterDataService.getLocations().then((r) => r?.data?.data || []).catch(() => []),
      masterDataService.getAssets().then((r) => r?.data?.data || []).catch(() => []),
    ]).then(([l, a]) => {
      setLocations(l); setAssets(a); setLoading(false);
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const locById = (id) => locations.find((l) => l.locationId === id);
  const locName = (id) => locById(id)?.locationName || '—';
  const assetById = (id) => assets.find((a) => a.assetId === id);
  const assetName = (id) => assetById(id)?.assetName || '—';
  const vendorName = (id) => vendors.find((v) => v.vendorId === id)?.name || (id ? '—' : 'In-house');

  const locPath = (id) => {
    const parts = [];
    let cur = locById(id);
    let guard = 0;
    while (cur && guard < 12) {
      parts.unshift(cur.locationName);
      cur = cur.parentId ? locById(cur.parentId) : null;
      guard += 1;
    }
    return parts.join(' › ') || '—';
  };

  return { locations, assets, vendors, loading, reload, locName, assetName, vendorName, locById, assetById, locPath };
}
