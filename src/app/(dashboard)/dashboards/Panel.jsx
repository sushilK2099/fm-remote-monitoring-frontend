'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, RadialBarChart, RadialBar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { RefreshCw, Settings2, Trash2, AlertCircle } from 'lucide-react';
import { dashboardService } from '@/api/services/dashboard.service';
import Loader from '@/components/ui/Loader';

// House easing/timing (matches PageWrapper/Drawer conventions).
const EASE = [0.22, 1, 0.36, 1];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

// The output key a panel's single measure produces (count → 'count', else '<field>_<agg>').
function measureKey(panel) {
  const m = panel.query?.measures?.[0];
  if (!m) return 'count';
  return m.agg === 'count' ? 'count' : `${m.field}_${m.agg}`;
}

// The dimension field name (the group-by key that becomes the category axis).
function dimKey(panel) {
  return panel.query?.dimensions?.[0]?.field || null;
}

// Format a measure value: integers as-is, floats to at most 2 decimals, with thousands separators.
function fmtNum(v) {
  if (typeof v !== 'number' || !isFinite(v)) return v;
  return Number.isInteger(v)
    ? v.toLocaleString()
    : v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// Format a date-bucketed dimension value ($dateTrunc returns an ISO string) by the bucket unit.
function formatDateBucket(value, transform) {
  const d = new Date(value);
  if (isNaN(d.getTime())) return String(value);
  // Sub-day buckets need time-of-day; day+ buckets are date-only.
  if (transform === 'minute') return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  if (transform === 'hour')   return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit' });
  const opts =
    transform === 'year'    ? { year: 'numeric' } :
    transform === 'quarter' ? { year: 'numeric', month: 'short' } :
    transform === 'month'   ? { year: 'numeric', month: 'short' } :
    transform === 'week'    ? { month: 'short', day: 'numeric' } :
                              { month: 'short', day: 'numeric' }; // day
  return d.toLocaleDateString(undefined, opts);
}

// Relative range presets for time-series (readings) panels → milliseconds back from now.
const RANGE_MS = { '24h': 24 * 3600e3, '7d': 7 * 24 * 3600e3, '30d': 30 * 24 * 3600e3 };

// Expand a panel's relative `range` into concrete recordedAt from/to filters at query time,
// so a readings panel shows a rolling recent window instead of unbounded history. Any
// range='all' (or a non-readings panel) passes the query through unchanged. Existing
// recordedAt range filters are replaced so the picker is the single source of the window.
function buildQuery(panel) {
  const q = panel.query;
  if (!q || q.entity !== 'readings') return q;
  const range = panel.range || '24h';
  if (range === 'all' || !RANGE_MS[range]) return q;
  const to = new Date();
  const from = new Date(to.getTime() - RANGE_MS[range]);
  const filters = (q.filters || []).filter(
    (f) => !(f.field === 'recordedAt' && ['gt', 'gte', 'lt', 'lte'].includes(f.op)),
  );
  filters.push({ field: 'recordedAt', op: 'gte', value: from.toISOString() });
  filters.push({ field: 'recordedAt', op: 'lte', value: to.toISOString() });
  return { ...q, filters };
}

// Pivot rows on a second dimension so each dim2 value becomes its own series.
// Shared by the 2-dimension bar / line / area charts. Returns:
//   { data: [{ name, <series1>: n, <series2>: n, ... }], seriesKeys: [...] }
// `labelFor(field, transform, raw)` maps a raw value to its display label.
function pivotSeries(rows, d1, d2, mKey, labelFor) {
  const seriesLabel = (r) => (labelFor ? labelFor(d2.field, d2.transform, r[d2.field]) : String(r[d2.field] ?? '—'));
  const seriesKeys = [...new Set(rows.map(seriesLabel))];
  const byCat = new Map();
  for (const r of rows) {
    const cat = labelFor ? labelFor(d1.field, d1.transform, r[d1.field]) : String(r[d1.field] ?? '—');
    const s = seriesLabel(r);
    if (!byCat.has(cat)) byCat.set(cat, { name: cat });
    byCat.get(cat)[s] = Number(r[mKey] ?? 0);
  }
  return { data: [...byCat.values()], seriesKeys };
}

export default function Panel({ panel, onEdit, onDelete, onBarModeChange, editable = true, resolveLabel }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const barMode = panel.barMode === 'stacked' ? 'stacked' : 'grouped';

  const load = useCallback(async () => {
    if (!panel.query?.measures?.length) { setRows([]); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await dashboardService.runQuery(buildQuery(panel));
      setRows(res.data?.data || []);
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Query failed');
    } finally {
      setLoading(false);
    }
  }, [panel.query, panel.range]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);

  const mKey = measureKey(panel);
  const dims = panel.query?.dimensions || [];
  const dKey = dimKey(panel);
  const dimTransform = dims[0]?.transform;

  // Turn a raw dimension value into a readable label (date bucket / resolved id / passthrough).
  const labelFor = (field, transform, raw) => {
    if (raw == null || raw === '') return '—';
    if (transform) return formatDateBucket(raw, transform);
    return String(resolveLabel ? resolveLabel(field, raw) : raw);
  };

  // Single-dimension chart data { name, value } — used by line/pie/area/donut/radial/stat
  // and by bar when there is 0 or 1 dimension.
  const chartData = rows.map((r) => ({
    name: dKey == null ? 'Total' : labelFor(dKey, dimTransform, r[dKey]),
    value: Number(r[mKey] ?? 0),
    raw: r,
  }));

  const twoDimBar = panel.viz === 'bar' && dims.length === 2;

  return (
    <div
      className="h-full flex flex-col border overflow-hidden"
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-primary)' }}>
        <div
          className={editable ? 'panel-drag-handle text-sm font-semibold cursor-grab active:cursor-grabbing select-none flex-1 min-w-0 truncate' : 'text-sm font-semibold flex-1 min-w-0 truncate'}
          style={{ color: 'var(--text-primary)' }}
        >
          {panel.title || 'Untitled panel'}
        </div>
        <div className="flex items-center gap-2 pl-2" style={{ color: 'var(--text-tertiary)' }}>
          {editable && twoDimBar && onBarModeChange && (
            <button
              onClick={() => onBarModeChange(barMode === 'grouped' ? 'stacked' : 'grouped')}
              title="Toggle grouped / stacked"
              className="text-[10px] font-medium px-1.5 py-0.5 rounded border cursor-pointer hover:opacity-70"
              style={{ borderColor: 'var(--border-primary)' }}
            >
              {barMode === 'grouped' ? 'Grouped' : 'Stacked'}
            </button>
          )}
          <motion.button onClick={load} title="Refresh" className="cursor-pointer hover:opacity-70" whileTap={{ scale: 0.85 }}>
            <motion.span style={{ display: 'inline-flex' }} animate={loading ? { rotate: 360 } : { rotate: 0 }}
              transition={loading ? { repeat: Infinity, duration: 0.8, ease: 'linear' } : { duration: 0.2 }}>
              <RefreshCw size={15} />
            </motion.span>
          </motion.button>
          {editable && <motion.button onClick={onEdit} title="Configure" className="cursor-pointer hover:opacity-70" whileTap={{ scale: 0.85 }}><Settings2 size={15} /></motion.button>}
          {editable && <motion.button onClick={onDelete} title="Remove" className="cursor-pointer hover:opacity-70" whileHover={{ color: '#ef4444' }} whileTap={{ scale: 0.85 }}><Trash2 size={15} /></motion.button>}
        </div>
      </div>

      <div className="p-3 flex-1" style={{ minHeight: 0 }}>
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.div key="loading" className="h-full flex items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <Loader />
            </motion.div>
          ) : error ? (
            <motion.div key="error" className="h-full flex flex-col items-center justify-center gap-2 text-center px-4" style={{ color: 'var(--text-tertiary)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              <AlertCircle size={20} className="text-red-500" />
              <div className="text-xs">{error}</div>
            </motion.div>
          ) : !chartData.length ? (
            <motion.div key="empty" className="h-full flex items-center justify-center text-xs" style={{ color: 'var(--text-tertiary)' }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              No data
            </motion.div>
          ) : (
            <motion.div key="chart" className="h-full"
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
              <PanelChart viz={panel.viz} data={chartData} entity={panel.query?.entity}
                rows={rows} dims={dims} mKey={mKey} barMode={barMode} labelFor={labelFor} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function PanelChart({ viz, data, entity, rows = [], dims = [], mKey = 'count', barMode = 'grouped', labelFor }) {
  if (viz === 'stat') {
    // Readings are time-series: a SUM of temperature buckets is meaningless — show the
    // latest bucket's value (the current reading). Other entities keep the count/sum total.
    if (entity === 'readings') {
      const last = data[data.length - 1];               // data is chronological
      return (
        <div className="h-full flex flex-col items-center justify-center gap-1">
          <div className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{last ? fmtNum(last.value) : '—'}</div>
          {last && <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>latest · {last.name}</div>}
        </div>
      );
    }
    const total = data.reduce((n, d) => n + d.value, 0);
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-4xl font-bold" style={{ color: 'var(--text-primary)' }}>{fmtNum(total)}</div>
      </div>
    );
  }

  // Table: one column per dimension (any N) + the measure column.
  if (viz === 'table') {
    const cols = dims.length ? dims : [{ field: '__none__' }];
    return (
      <div className="h-full overflow-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
              {dims.map((d) => (
                <th key={d.field} className="py-1.5 pr-3 text-left font-semibold" style={{ color: 'var(--text-tertiary)' }}>{d.field}</th>
              ))}
              <th className="py-1.5 text-right font-semibold" style={{ color: 'var(--text-tertiary)' }}>{mKey}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b" style={{ borderColor: 'var(--border-primary)' }}>
                {dims.map((d) => (
                  <td key={d.field} className="py-1.5 pr-3" style={{ color: 'var(--text-secondary)' }}>
                    {labelFor ? labelFor(d.field, d.transform, r[d.field]) : String(r[d.field] ?? '—')}
                  </td>
                ))}
                {!dims.length && <td className="py-1.5 pr-3" style={{ color: 'var(--text-secondary)' }}>Total</td>}
                <td className="py-1.5 text-right font-medium" style={{ color: 'var(--text-primary)' }}>{fmtNum(Number(r[mKey] ?? 0))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Two-dimension bar: pivot rows so dim2 values become series (grouped or stacked).
  if (viz === 'bar' && dims.length === 2) {
    const { data: pivoted, seriesKeys } = pivotSeries(rows, dims[0], dims[1], mKey, labelFor);
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={pivoted} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 4 }} />
          {seriesKeys.map((s, i) => (
            <Bar key={s} dataKey={s} fill={PIE_COLORS[i % PIE_COLORS.length]}
              stackId={barMode === 'stacked' ? 'stack' : undefined}
              radius={barMode === 'stacked' ? 0 : [3, 3, 0, 0]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (viz === 'pie' || viz === 'donut') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        {/* cy pulled up + smaller radius to leave room for the bottom legend */}
        <PieChart margin={{ top: 4, bottom: 4, left: 4, right: 4 }}>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="45%"
            outerRadius="72%" innerRadius={viz === 'donut' ? '45%' : 0} paddingAngle={viz === 'donut' ? 2 : 0}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={9}
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 4 }}
          />
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (viz === 'radial') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart data={data} cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={12}>
          <RadialBar dataKey="value" background cornerRadius={6}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </RadialBar>
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Legend iconType="circle" iconSize={9} layout="vertical" verticalAlign="middle" align="right"
            wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)' }} />
        </RadialBarChart>
      </ResponsiveContainer>
    );
  }

  if (viz === 'line') {
    // Two dimensions → one line per second-dimension value (e.g. per metric).
    if (dims.length === 2) {
      const { data: pivoted, seriesKeys } = pivotSeries(rows, dims[0], dims[1], mKey, labelFor);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={pivoted} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmtNum(v)} />
            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 4 }} />
            {seriesKeys.map((s, i) => (
              <Line key={s} type="monotone" dataKey={s} stroke={PIE_COLORS[i % PIE_COLORS.length]} strokeWidth={2} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (viz === 'area') {
    // Two dimensions → one area per second-dimension value.
    if (dims.length === 2) {
      const { data: pivoted, seriesKeys } = pivotSeries(rows, dims[0], dims[1], mKey, labelFor);
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={pivoted} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v) => fmtNum(v)} />
            <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 11, color: 'var(--text-secondary)', paddingTop: 4 }} />
            {seriesKeys.map((s, i) => {
              const c = PIE_COLORS[i % PIE_COLORS.length];
              return <Area key={s} type="monotone" dataKey={s} stroke={c} strokeWidth={2} fill={c} fillOpacity={0.12} connectNulls />;
            })}
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    return (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#areaFill)" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (viz === 'hbar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
          <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
          <Tooltip formatter={(v) => fmtNum(v)} />
          <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  // default: bar
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
        <Tooltip formatter={(v) => fmtNum(v)} />
        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
