'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Toggle from '@/components/ui/Toggle';
import useTargetLabels from '@/hooks/useTargetLabels';

const VALUE_OP_OPTIONS = [
  { value: '',    label: 'No value filter' },
  { value: 'gt',  label: 'greater than (>)' },
  { value: 'gte', label: 'greater or equal (≥)' },
  { value: 'lt',  label: 'less than (<)' },
  { value: 'lte', label: 'less or equal (≤)' },
];

// Purpose-built readings panel builder. Plain-language form (Metrics / Show / Group time /
// Chart / Range) that assembles the QuerySpec the executor + Panel.jsx expect. No generic
// entity/dimension/measure jargon — this module only charts sensor readings.

const SHOW_OPTIONS = [
  { value: 'avg',  label: 'Average value' },
  { value: 'max',  label: 'Highest value' },
  { value: 'min',  label: 'Lowest value' },
  { value: 'last', label: 'Latest value' },
];
const BUCKET_OPTIONS = [
  { value: 'hour',   label: 'Hourly' },
  { value: 'minute', label: 'By minute' },
  { value: 'day',    label: 'Daily' },
];
const CHART_OPTIONS = [
  { value: 'line',  label: 'Line' },
  { value: 'area',  label: 'Area' },
  { value: 'bar',   label: 'Bar' },
  { value: 'table', label: 'Table' },
  { value: 'stat',  label: 'Single number' },
];
const RANGE_OPTIONS = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d',  label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
];

// ── form state ⇄ panel (QuerySpec) ──────────────────────────────────────────

// Build a panel from the friendly form. Multiple metrics (or group-by-target) → extra
// group dimension so each becomes its own series. 'stat' doesn't need a time bucket.
function toPanel({ title, metricIds, show, bucket, chart, range, groupByTarget, valueOp, valueThreshold }) {
  const wantsTime = chart !== 'stat';
  const dimensions = [];
  if (wantsTime) dimensions.push({ field: 'recordedAt', transform: bucket || 'hour' });
  if (metricIds.length > 1) dimensions.push({ field: 'metricId' });
  if (groupByTarget) dimensions.push({ field: 'targetId' });

  const filters = metricIds.length ? [{ field: 'metricId', op: 'in', value: metricIds }] : [];
  // Optional value threshold (advanced).
  if (valueOp && valueThreshold !== '' && valueThreshold != null && !isNaN(Number(valueThreshold))) {
    filters.push({ field: 'value', op: valueOp, value: Number(valueThreshold) });
  }

  return {
    title: title || 'Untitled panel',
    viz: chart,
    range: range || '24h',
    query: {
      entity: 'readings',
      dimensions: dimensions.slice(0, 3),   // compiler caps at 3
      measures: [{ field: 'value', agg: show || 'avg' }],
      filters,
    },
    layout: {},
  };
}

// Derive form state from an existing panel (edit) or a fresh one.
function fromPanel(panel, allMetricIds) {
  const q = panel?.query || {};
  const metricFilter = (q.filters || []).find((f) => f.field === 'metricId');
  let metricIds = metricFilter
    ? (Array.isArray(metricFilter.value) ? metricFilter.value : [metricFilter.value]).filter(Boolean)
    : [];
  // Fresh panel: auto-select all metrics when there are only a few, so it shows data.
  if (!panel && !metricIds.length && allMetricIds.length && allMetricIds.length <= 3) {
    metricIds = [...allMetricIds];
  }
  const timeDim = (q.dimensions || []).find((d) => d.field === 'recordedAt');
  const measure = q.measures?.[0];
  const valueFilter = (q.filters || []).find((f) => f.field === 'value');
  return {
    title: panel?.title || '',
    metricIds,
    show: measure?.field === 'value' ? measure.agg : 'avg',
    bucket: timeDim?.transform || 'hour',
    chart: panel?.viz || 'line',
    range: panel?.range || '24h',
    groupByTarget: (q.dimensions || []).some((d) => d.field === 'targetId'),
    valueOp: valueFilter?.op || '',
    valueThreshold: valueFilter ? String(valueFilter.value) : '',
  };
}

export default function PanelConfigDrawer({ isOpen, onClose, onSave, initialPanel, metrics = [] }) {
  const { metricLabel } = useTargetLabels();
  const allMetricIds = metrics.map((m) => m.metricId);
  const [form, setForm] = useState(() => fromPanel(initialPanel, allMetricIds));
  // Open advanced automatically if an existing panel already uses an advanced option.
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    const f = fromPanel(initialPanel, metrics.map((m) => m.metricId));
    setForm(f);
    setAdvancedOpen(!!(f.groupByTarget || f.valueOp));
  }, [initialPanel, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleMetric = (id) => setForm((f) => {
    const s = new Set(f.metricIds);
    s.has(id) ? s.delete(id) : s.add(id);
    return { ...f, metricIds: [...s] };
  });

  const canSave = form.metricIds.length > 0;
  const isStat = form.chart === 'stat';

  const footer = (
    <div className="flex justify-end gap-2 w-full">
      <Button variant="outline" onClick={onClose}>Cancel</Button>
      <Button disabled={!canSave} onClick={() => onSave(toPanel(form))}>Save panel</Button>
    </div>
  );

  const labelCls = 'text-xs font-semibold uppercase tracking-wide mb-1.5';

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={initialPanel ? 'Edit panel' : 'Add panel'} footer={footer} width={460}>
      <div className="flex flex-col gap-5">
        <Input label="Panel title" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Chiller temperature" />

        {/* Metrics */}
        <div>
          <div className={labelCls} style={{ color: 'var(--text-tertiary)' }}>Sensors to chart</div>
          {!metrics.length ? (
            <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>No metrics defined yet. Add one under Metrics first.</div>
          ) : (
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-primary)', maxHeight: 200, overflowY: 'auto' }}>
              {metrics.map((m) => {
                const on = form.metricIds.includes(m.metricId);
                return (
                  <button key={m.metricId} type="button" onClick={() => toggleMetric(m.metricId)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer transition-colors"
                    style={{ background: on ? 'var(--accent-tint)' : 'transparent', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-primary)' }}>
                    <span className="shrink-0 inline-flex items-center justify-center rounded"
                      style={{ width: 16, height: 16, border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border-primary)'}`, background: on ? 'var(--accent)' : 'transparent', color: '#fff' }}>
                      {on && <Check size={12} />}
                    </span>
                    <span className="truncate">{metricLabel(m) || m.name}</span>
                  </button>
                );
              })}
            </div>
          )}
          {!canSave && metrics.length > 0 && (
            <div className="text-xs mt-1.5" style={{ color: '#f59e0b' }}>Pick at least one sensor.</div>
          )}
          {form.metricIds.length > 1 && (
            <div className="text-xs mt-1.5" style={{ color: 'var(--text-tertiary)' }}>Each sensor is drawn as its own series.</div>
          )}
        </div>

        {/* Show (aggregation) */}
        <Select label="Show" value={form.show} onChange={(e) => set('show', e.target.value)} options={SHOW_OPTIONS} />

        {/* Group time by — irrelevant for a single-number stat */}
        {!isStat && (
          <Select label="Group time by" value={form.bucket} onChange={(e) => set('bucket', e.target.value)} options={BUCKET_OPTIONS} />
        )}

        {/* Chart type */}
        <Select label="Chart" value={form.chart} onChange={(e) => set('chart', e.target.value)} options={CHART_OPTIONS} />

        {/* Time range */}
        <Select label="Time range" value={form.range} onChange={(e) => set('range', e.target.value)} options={RANGE_OPTIONS} />

        {/* Advanced options — collapsed by default */}
        <div className="border-t pt-3" style={{ borderColor: 'var(--border-primary)' }}>
          <button type="button" onClick={() => setAdvancedOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide cursor-pointer hover:opacity-70"
            style={{ color: 'var(--text-tertiary)' }}>
            {advancedOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            Advanced options
          </button>

          {advancedOpen && (
            <div className="flex flex-col gap-4 mt-3">
              {/* Group by target */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm" style={{ color: 'var(--text-primary)' }}>Split by asset / location</div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>A separate series per target (compare locations/assets).</div>
                </div>
                <Toggle checked={form.groupByTarget} onChange={(v) => set('groupByTarget', v)} />
              </div>

              {/* Value threshold filter */}
              <div>
                <div className="text-sm mb-1.5" style={{ color: 'var(--text-primary)' }}>Only readings where value…</div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Select value={form.valueOp} onChange={(e) => set('valueOp', e.target.value)} options={VALUE_OP_OPTIONS} />
                  </div>
                  {form.valueOp && (
                    <div style={{ width: 110 }}>
                      <Input type="number" placeholder="value" value={form.valueThreshold}
                        onChange={(e) => set('valueThreshold', e.target.value)} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
