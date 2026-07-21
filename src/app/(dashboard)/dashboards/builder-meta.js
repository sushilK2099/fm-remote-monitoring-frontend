// UI-side mirror of the backend entityMetadata catalog. Drives the config drawer's
// field/agg/viz choices. The backend (entityMetadata.js) is the authoritative validator —
// this only builds valid specs in the UI. Remote monitoring has ONE entity: sensor readings.

export const ENTITIES = [
  { value: 'readings', label: 'Sensor Readings' },
];

const TIME_BUCKETS = ['minute', 'hour', 'day'];

// field → { label, kind, aggs?, transforms? } — mirrors backend entityMetadata.
export const FIELDS = {
  readings: {
    recordedAt: { label: 'Time',   kind: 'dimension', transforms: TIME_BUCKETS },
    metricId:   { label: 'Metric', kind: 'dimension' },
    targetId:   { label: 'Target', kind: 'dimension' },
    value:      { label: 'Value',  kind: 'measure', aggs: ['avg', 'min', 'max', 'last'] },
  },
};

export const COUNT_MEASURE = { field: '*', agg: 'count', label: 'Count of records' };

export const VIZ_OPTIONS = [
  { value: 'bar',    label: 'Bar chart' },
  { value: 'hbar',   label: 'Horizontal bar' },
  { value: 'line',   label: 'Line chart' },
  { value: 'area',   label: 'Area chart' },
  { value: 'pie',    label: 'Pie chart' },
  { value: 'donut',  label: 'Donut chart' },
  { value: 'radial', label: 'Radial bar' },
  { value: 'table',  label: 'Table' },
  { value: 'stat',   label: 'Single stat' },
];

// Time-series readings support the chronological chart types (line/area/bar) + table +
// a "latest value" stat tile; pie/donut/radial are meaningless for a time axis.
const VIZ_BY_ENTITY = {
  readings: ['line', 'area', 'bar', 'table', 'stat'],
};
export function vizFor(entity) {
  const allowed = VIZ_BY_ENTITY[entity];
  return allowed ? VIZ_OPTIONS.filter((v) => allowed.includes(v.value)) : VIZ_OPTIONS;
}

// `readings` has no synthetic "count" measure — its only measure is `value`.
const NO_COUNT_ENTITIES = new Set(['readings']);
export function supportsCount(entity) {
  return !NO_COUNT_ENTITIES.has(entity);
}

// The measure a fresh panel defaults to: count where available, else the first field measure.
export function defaultMeasure(entity) {
  if (supportsCount(entity)) return { kind: 'count', field: '', agg: '' };
  const first = measureFields(entity)[0];
  return first
    ? { kind: 'field', field: first.value, agg: (first.aggs && first.aggs[0]) || 'avg' }
    : { kind: 'count', field: '', agg: '' };
}

export function dimensionFields(entity) {
  const f = FIELDS[entity] || {};
  return Object.entries(f).filter(([, m]) => m.kind === 'dimension').map(([k, m]) => ({ value: k, label: m.label, transforms: m.transforms }));
}

export function measureFields(entity) {
  const f = FIELDS[entity] || {};
  return Object.entries(f).filter(([, m]) => m.kind === 'measure').map(([k, m]) => ({ value: k, label: m.label, aggs: m.aggs }));
}

// ─── Filters ────────────────────────────────────────────────────────────────
const DIM_OPS  = ['eq', 'ne', 'in', 'nin'];
const NUM_OPS  = ['eq', 'ne', 'gt', 'gte', 'lt', 'lte'];
const DATE_OPS = ['gt', 'gte', 'lt', 'lte'];

export const OP_LABELS = {
  eq: 'is', ne: 'is not', in: 'is any of', nin: 'is none of',
  gt: '>', gte: '≥', lt: '<', lte: '≤',
};

// field → { label, ops, input, options? }. `input:'metric'` → a metric dropdown in the drawer.
const FILTERABLE = {
  readings: {
    metricId:   { label: 'Metric',    ops: DIM_OPS,  input: 'metric' },
    targetId:   { label: 'Target ID', ops: DIM_OPS,  input: 'text' },
    recordedAt: { label: 'Time',      ops: DATE_OPS, input: 'date' },
    value:      { label: 'Value',     ops: NUM_OPS,  input: 'number' },
  },
};

export function filterableFields(entity) {
  const f = FILTERABLE[entity] || {};
  return Object.entries(f).map(([k, m]) => ({ value: k, label: m.label }));
}

export function filterMeta(entity, field) {
  return (FILTERABLE[entity] || {})[field] || null;
}
