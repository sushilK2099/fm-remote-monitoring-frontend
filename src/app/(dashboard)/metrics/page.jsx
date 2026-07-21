'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Box, MapPin, SlidersHorizontal } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import EmptyState from '@/components/ui/EmptyState';
import useTargetLabels from '@/hooks/useTargetLabels';
import { metricService } from '@/api/services/metric.service';
import MetricsPanel from '@/components/monitoring/MetricsPanel';

// Metric definitions live in this module but attach to a masters asset/location.
// A target dropdown in the header selects which asset/location to view; its MetricsPanel
// (metric cards + live chart + add-in-context) fills the width below.
// "Add metric" navigates to the dedicated /metrics/new page.
export default function MetricsPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { label } = useTargetLabels();

  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // { key, targetType, targetId, label }
  const [viewType, setViewType] = useState('ASSET'); // which type the header target dropdown lists

  // After /metrics/new redirects back with ?targetType&targetId, focus that target.
  const returnType = params.get('targetType');
  const returnId = params.get('targetId');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await metricService.getAll();
      setMetrics(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // One entry per target (asset/location) that has ≥1 metric, with a metric count.
  const targets = useMemo(() => {
    const byTarget = new Map();
    for (const m of metrics) {
      const key = `${m.targetType}:${m.targetId}`;
      if (!byTarget.has(key)) {
        byTarget.set(key, { key, targetType: m.targetType, targetId: m.targetId, label: label(m.targetType, m.targetId), count: 0 });
      }
      byTarget.get(key).count += 1;
    }
    return [...byTarget.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [metrics, label]);

  // Keep a selection: prefer the target passed back from /metrics/new, else keep the current
  // one, else default to the first. Re-resolves as labels load.
  useEffect(() => {
    if (loading) return;
    if (targets.length === 0) { setSelected(null); return; }
    setSelected((cur) => {
      const fromReturn = returnType && returnId && targets.find((t) => t.key === `${returnType}:${returnId}`);
      const match = cur && targets.find((t) => t.key === `${cur.targetType}:${cur.targetId}`);
      const next = fromReturn || match || targets[0];
      setViewType(next.targetType); // keep the type dropdown aligned with the active target
      return next;
    });
  }, [loading, targets, returnType, returnId]);

  // Header target picker: first choose the type, then the target of that type.
  const typeOptions = [
    { value: 'ASSET', label: 'Asset' },
    { value: 'LOCATION', label: 'Location' },
  ];
  const targetsOfType = targets.filter((t) => t.targetType === viewType);
  const targetSelectOptions = targetsOfType.length
    ? targetsOfType.map((t) => ({ value: t.key, label: `${t.label} (${t.count})` }))
    : [{ value: '', label: `No ${viewType === 'ASSET' ? 'assets' : 'locations'} with metrics` }];

  const onChangeViewType = (type) => {
    setViewType(type);
    const first = targets.find((t) => t.targetType === type);
    setSelected(first || null); // jump to the first target of the new type (or clear)
  };

  const onSelectTarget = (key) => {
    const t = targets.find((x) => x.key === key);
    if (t) setSelected(t);
  };

  return (
    <PageWrapper
      title="Metrics"
      description="Measurable attributes tracked on your assets & locations"
      actions={
        <div className="flex items-center gap-2">
          {targets.length > 0 && (
            <>
              <div className="w-36">
                <Select
                  options={typeOptions}
                  value={viewType}
                  onChange={(e) => onChangeViewType(e.target.value)}
                />
              </div>
              <div className="w-56 max-w-[50vw]">
                <Select
                  options={targetSelectOptions}
                  value={selected?.key || ''}
                  onChange={(e) => onSelectTarget(e.target.value)}
                  disabled={targetsOfType.length === 0}
                />
              </div>
            </>
          )}
          <Button onClick={() => router.push('/metrics/new')}>
            <Plus size={16} /> Add metric
          </Button>
        </div>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <div key={i} className="op-skeleton rounded-xl" style={{ height: 116 }} />)}
          </div>
          <div className="op-skeleton rounded-xl" style={{ height: 280 }} />
        </div>
      ) : metrics.length === 0 ? (
        <Card>
          <EmptyState
            icon={SlidersHorizontal}
            title="No metrics yet"
            description="A metric is a measurable attribute (e.g. Temperature, Humidity) tracked on an asset or location. Add one to start collecting readings."
            actionLabel="Add your first metric"
            onAction={() => router.push('/metrics/new')}
          />
        </Card>
      ) : (
        // Detail spans full width; the target dropdown lives in the page header (see actions).
        // MetricsPanel renders its own tiles/chart in bare containers (no outer Card = no card-in-card).
        selected ? (
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-4">
              {selected.targetType === 'ASSET'
                ? <Box size={18} style={{ color: 'var(--accent)' }} />
                : <MapPin size={18} style={{ color: 'var(--accent)' }} />}
              <h2 className="text-lg font-semibold truncate" style={{ color: 'var(--heading-color)' }} title={selected.label}>
                {selected.label}
              </h2>
            </div>
            <MetricsPanel
              key={`${selected.targetType}:${selected.targetId}`}
              targetType={selected.targetType}
              targetId={selected.targetId}
              onChange={load}
              embedded
            />
          </div>
        ) : (
          <Card>
            <div className="text-sm py-10 text-center" style={{ color: 'var(--text-secondary)' }}>
              Select a target to see its metrics and charts.
            </div>
          </Card>
        )
      )}
    </PageWrapper>
  );
}
