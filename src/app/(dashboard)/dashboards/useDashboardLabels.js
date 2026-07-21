'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { masterDataService } from '@/api/services/masterData.service';
import { metricService } from '@/api/services/metric.service';
import useTargetLabels from '@/hooks/useTargetLabels';

// Resolves dimension VALUES (raw IDs) to human-readable labels for dashboard panels.
// Fetches the account's locations + users ONCE (batch, like useMasters) and exposes a
// resolveLabel(field, value) that panels apply to their category axis.
//
// Reuses the existing conventions:
//   - location: walk parentId chain → "Site › Building › Floor" (see useMasters.locPath)
//   - assignee: `${firstName} ${lastName}` (see maintenance/new/page.jsx, admin/page.jsx)
//   - other dimensions (status/type/priority/...) pass through unchanged.
export default function useDashboardLabels() {
  const [locations, setLocations] = useState([]);
  const [users, setUsers] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  // Reused for target-qualified metric labels ("Temperature — building 1").
  const { metricLabel: targetMetricLabel } = useTargetLabels();

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      masterDataService.getLocations().then((r) => r?.data?.data || []).catch(() => []),
      masterDataService.getUsers().then((r) => r?.data?.data || []).catch(() => []),
      metricService.getAll().then((r) => r?.data?.data || []).catch(() => []),
    ]).then(([l, u, m]) => {
      setLocations(l);
      setUsers(u);
      setMetrics(m);
      setLoading(false);
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // Build id→object maps once per data change (avoids O(n) find per cell).
  const locById = useMemo(() => {
    const m = new Map();
    for (const l of locations) m.set(l.locationId, l);
    return m;
  }, [locations]);

  const userById = useMemo(() => {
    const m = new Map();
    for (const u of users) m.set(u.userId, u);
    return m;
  }, [users]);

  const metricById = useMemo(() => {
    const m = new Map();
    for (const mt of metrics) m.set(mt.metricId, mt);
    return m;
  }, [metrics]);

  const locPath = useCallback((id) => {
    const parts = [];
    let cur = locById.get(id);
    let guard = 0;
    while (cur && guard < 12) {
      parts.unshift(cur.locationName);
      cur = cur.parentId ? locById.get(cur.parentId) : null;
      guard += 1;
    }
    return parts.join(' › ');
  }, [locById]);

  const userName = useCallback((id) => {
    const u = userById.get(id);
    if (!u) return null;
    return `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email || null;
  }, [userById]);

  // Metric legend label — target-qualified ("Temperature — building 1") so same-named
  // metrics on different assets/locations are distinguishable. Falls back to name (unit).
  const metricName = useCallback((id) => {
    const mt = metricById.get(id);
    if (!mt) return null;
    return targetMetricLabel(mt) || (mt.unit ? `${mt.name} (${mt.unit})` : mt.name);
  }, [metricById, targetMetricLabel]);

  // field = the dimension field name from the QuerySpec (e.g. 'locationId', 'assignedTo').
  // Returns the original value unchanged when there's no mapping (status/type/etc) or the
  // id isn't found yet (lists still loading) — never blanks out a value.
  const resolveLabel = useCallback((field, value) => {
    if (value == null || value === '') return value;
    if (field === 'locationId') return locPath(value) || value;
    if (field === 'assignedTo')  return userName(value) || value;
    if (field === 'metricId')    return metricName(value) || value;
    return value;
  }, [locPath, userName, metricName]);

  return { loading, reload, resolveLabel, metrics };
}
