'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, PenLine, Zap, Hand, LineChart as LineChartIcon } from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import Button from '@/components/ui/Button';
import Pill from '@/components/ui/Pill';
import SegmentedToggle from '@/components/ui/SegmentedToggle';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { metricService } from '@/api/services/metric.service';
import { readingService } from '@/api/services/reading.service';
import { roleService } from '@/api/services/role.service';
import MetricForm from './MetricForm';
import ReadingEntryModal from './ReadingEntryModal';

// Chart time-range presets. Each picks a sensible bucket + x-axis label format so the
// series stays readable (≈24-30 points) whether it's a day or a month.
const HOUR = 3600 * 1000;
const RANGES = {
  '24h': { label: '24h', ms: 24 * HOUR,      bucket: 'hour',  fmt: (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
  '7d':  { label: '7d',  ms: 7 * 24 * HOUR,  bucket: 'hour',  fmt: (d) => d.toLocaleString([], { weekday: 'short', hour: '2-digit' }) },
  '30d': { label: '30d', ms: 30 * 24 * HOUR, bucket: 'day',   fmt: (d) => d.toLocaleDateString([], { month: 'short', day: 'numeric' }) },
};
const RANGE_KEYS = ['24h', '7d', '30d'];
const RANGE_OPTIONS = RANGE_KEYS.map((k) => ({ value: k, label: RANGES[k].label }));

// Compact "time ago" for the last-reading line ("3m ago", "2h ago", "5d ago").
function timeAgo(date) {
  const d = new Date(date);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (!isFinite(s)) return null;
  if (s < 60) return 'just now';
  const m = Math.round(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60); if (h < 24) return `${h}h ago`;
  const dd = Math.round(h / 24); if (dd < 30) return `${dd}d ago`;
  return d.toLocaleDateString();
}

// Embed on Asset/Location detail pages.
// Props: targetType ('ASSET' | 'LOCATION'), targetId (assetId/locationId).
// `embedded` (default false): host page already shows a header/title for the target, so the
// panel renders only a right-aligned "Add metric" action instead of its own "Monitoring" title.
// Non-embedded (asset/location detail pages): panel shows the full "Monitoring" header.
export default function MetricsPanel({ targetType, targetId, onChange, embedded = false }) {
  const [metrics, setMetrics] = useState([]);
  const [roleNames, setRoleNames] = useState({});     // roleId → name (for responsible display)
  const [latest, setLatest] = useState({});           // metricId → { value, recordedAt }
  const [series, setSeries] = useState([]);           // chart rows for selectedMetric
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [rangeKey, setRangeKey] = useState('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editMetric, setEditMetric] = useState(null);
  const [entryMetric, setEntryMetric] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const [mRes, lRes] = await Promise.all([
        metricService.getAll({ targetType, targetId }),
        readingService.latest({ targetType, targetId }),
      ]);
      const list = mRes.data.data || [];
      setMetrics(list);
      const map = {};
      (lRes.data.data || []).forEach((r) => { map[r.metricId] = r; });
      setLatest(map);
      if (!selectedMetric && list.length) setSelectedMetric(list[0]);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load metrics');
    } finally {
      setIsLoading(false);
    }
  }, [targetType, targetId, selectedMetric]);

  useEffect(() => { fetchMetrics(); }, [targetType, targetId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Role names for the "responsible" line on manual metric cards.
  useEffect(() => {
    roleService.getAll({})
      .then((res) => {
        const map = {};
        (res.data.data || res.data || []).forEach((r) => { map[r.roleId] = r.name; });
        setRoleNames(map);
      })
      .catch(() => {});
  }, []);

  // Load the chart series for the selected metric over the chosen time range.
  useEffect(() => {
    if (!selectedMetric) { setSeries([]); return; }
    const range = RANGES[rangeKey];
    const to = new Date();
    const from = new Date(to.getTime() - range.ms);
    setChartLoading(true);
    readingService.query({
      metricIds: [selectedMetric.metricId],
      from: from.toISOString(), to: to.toISOString(),
      bucket: range.bucket, agg: 'avg',
    })
      .then((res) => {
        const rows = (res.data.data || []).map((r) => ({
          t: range.fmt(new Date(r.bucket)),
          value: r.value,
        }));
        setSeries(rows);
      })
      .catch(() => setSeries([]))
      .finally(() => setChartLoading(false));
  }, [selectedMetric, rangeKey]);

  const handleDelete = async () => {
    try {
      await metricService.delete(deleteId);
      toast.success('Metric deleted');
      setDeleteId(null);
      if (selectedMetric?.metricId === deleteId) setSelectedMetric(null);
      fetchMetrics();
      onChange?.();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    }
  };

  // The target is already known here, so adding opens the inline MetricForm modal
  // (straight to the fields, no target picker). The dedicated /metrics/new page is only
  // for adding when no target is selected yet (Metrics page header / empty state).
  const handleAdd = () => { setEditMetric(null); setShowForm(true); };

  return (
    <div className="space-y-5">
      <div className={embedded ? 'flex items-center justify-end' : 'flex items-center justify-between'}>
        {!embedded && <h3 className="text-base font-semibold" style={{ color: 'var(--heading-color)' }}>Monitoring</h3>}
        <Button size="sm" variant={embedded ? 'outline' : 'primary'} onClick={handleAdd}>
          <Plus size={14} /> Add metric
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="op-skeleton rounded-xl" style={{ height: 116 }} />
          ))}
        </div>
      ) : metrics.length === 0 ? (
        <div
          className="rounded-xl border border-dashed px-6 py-10 text-center"
          style={{ borderColor: 'var(--border-strong)', color: 'var(--text-secondary)' }}
        >
          <LineChartIcon size={28} className="mx-auto mb-3" style={{ color: 'var(--text-tertiary)' }} />
          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No metrics on this target yet</p>
          <p className="text-sm mt-1">Add a measurable attribute (e.g. Temperature) to start monitoring.</p>
          <Button size="sm" variant="outline" className="mt-4 mx-auto" onClick={handleAdd}>
            <Plus size={14} /> Add metric
          </Button>
        </div>
      ) : (
        <>
          {/* Metric stat tiles — click to chart; actions reveal on hover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {metrics.map((m) => {
              const l = latest[m.metricId];
              const active = selectedMetric?.metricId === m.metricId;
              const isManual = m.readingMode === 'MANUAL';
              const recordedAt = l?.recordedAt?.ISODate;
              return (
                <div
                  key={m.metricId}
                  onClick={() => setSelectedMetric(m)}
                  className="group relative cursor-pointer rounded-xl border p-4 transition-all"
                  style={{
                    backgroundColor: active ? 'var(--accent-tint)' : 'var(--bg-card)',
                    borderColor: active ? 'var(--accent)' : 'var(--border-primary)',
                    boxShadow: active ? '0 0 0 3px var(--accent-tint)' : 'var(--shadow-card)',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }}>
                        {isManual ? <Hand size={12} /> : <Zap size={12} />}
                        <span className="truncate">{m.name}</span>
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-3xl font-semibold leading-none tabular-nums" style={{ color: 'var(--text-primary)' }}>
                          {l?.value != null ? l.value : '—'}
                        </span>
                        {m.unit && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{m.unit}</span>}
                      </div>
                    </div>
                    {/* Actions: hidden until hover to keep the tile calm */}
                    <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                      {isManual && (
                        <button className="op-icon-btn" title="Enter reading" onClick={(e) => { e.stopPropagation(); setEntryMetric(m); }}><PenLine size={15} /></button>
                      )}
                      <button className="op-icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); setEditMetric(m); setShowForm(true); }}><Pencil size={15} /></button>
                      <button className="op-icon-btn op-icon-btn-danger" title="Delete" onClick={(e) => { e.stopPropagation(); setDeleteId(m.metricId); }}><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <Pill kind={isManual ? 'violet' : 'blue'} small>{isManual ? 'Manual' : 'Automatic'}</Pill>
                    <span className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {recordedAt ? timeAgo(recordedAt) : 'no readings'}
                    </span>
                  </div>
                  {isManual && m.responsibleRoleId && (
                    <div className="mt-1.5 text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                      Responsible: {roleNames[m.responsibleRoleId] || m.responsibleRoleId}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedMetric && (
            <div className="rounded-xl border p-4" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-card)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {selectedMetric.name}
                    {selectedMetric.unit && <span className="font-normal" style={{ color: 'var(--text-secondary)' }}> ({selectedMetric.unit})</span>}
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
                    {RANGES[rangeKey].bucket === 'day' ? 'Daily' : 'Hourly'} average over the last {RANGES[rangeKey].label}
                  </div>
                </div>
                <SegmentedToggle options={RANGE_OPTIONS} value={rangeKey} onChange={setRangeKey} height={32} />
              </div>
              {chartLoading ? (
                <div className="op-skeleton rounded-lg" style={{ width: '100%', height: 240 }} />
              ) : series.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center rounded-lg border border-dashed text-center"
                  style={{ height: 240, borderColor: 'var(--border-primary)', color: 'var(--text-secondary)' }}
                >
                  <LineChartIcon size={22} className="mb-2" style={{ color: 'var(--text-tertiary)' }} />
                  <p className="text-sm">No readings in the last {RANGES[rangeKey].label}.</p>
                </div>
              ) : (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer>
                    <AreaChart data={series} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
                      <defs>
                        <linearGradient id="metricFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.25} />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
                      <XAxis
                        dataKey="t" tickLine={false} axisLine={false}
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} minTickGap={24}
                      />
                      <YAxis
                        tickLine={false} axisLine={false} width={44}
                        tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }}
                        domain={[selectedMetric.min ?? 'auto', selectedMetric.max ?? 'auto']}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-strong)',
                          borderRadius: 8, fontSize: 12, boxShadow: 'var(--shadow-card)',
                        }}
                        labelStyle={{ color: 'var(--text-secondary)' }}
                        itemStyle={{ color: 'var(--text-primary)' }}
                        formatter={(v) => [`${v}${selectedMetric.unit ? ' ' + selectedMetric.unit : ''}`, selectedMetric.name]}
                      />
                      <Area type="monotone" dataKey="value" stroke="var(--accent)" strokeWidth={2} fill="url(#metricFill)" dot={false} activeDot={{ r: 4 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {showForm && (
        <MetricForm metric={editMetric} targetType={targetType} targetId={targetId}
          onClose={() => { setShowForm(false); setEditMetric(null); }}
          onSaved={() => { setShowForm(false); setEditMetric(null); fetchMetrics(); onChange?.(); }} />
      )}

      {entryMetric && (
        <ReadingEntryModal metric={entryMetric}
          onClose={() => setEntryMetric(null)}
          onSaved={() => { setEntryMetric(null); fetchMetrics(); }} />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete metric?"
        message="Historical readings for this metric are kept but no longer shown."
        confirmText="Delete"
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </div>
  );
}
