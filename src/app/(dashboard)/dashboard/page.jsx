'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, Cpu, BellRing, LayoutDashboard, Activity, AlertTriangle } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import useTargetLabels from '@/hooks/useTargetLabels';
import { metricService } from '@/api/services/metric.service';
import { deviceService } from '@/api/services/device.service';
import { readingService } from '@/api/services/reading.service';
import { alertEventService } from '@/api/services/alert.service';

const listOf = (r) => (Array.isArray(r?.data?.data) ? r.data.data : []);

// A device / reading is "stale" if we haven't heard from it recently. 3× the
// metric's expected frequency is the same tolerance the backend staleness cron
// uses; default to 5 min when a metric has no declared frequency.
const staleMs = (freqSeconds) => Math.max((freqSeconds || 300) * 3, 300) * 1000;

// timestamp (ms) → "2 min ago" / "3 h ago" / "5 d ago"
function ago(ts) {
  if (!ts) return null;
  const s = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.floor(h / 24)} d ago`;
}

const tsOf = (v) => v?.timestamp ?? (v?.ISODate ? new Date(v.ISODate).getTime() : null);

const SEV = {
  CRITICAL: { color: 'var(--danger, #dc2626)', label: 'Critical' },
  WARNING:  { color: 'var(--warning, #d97706)', label: 'Warning' },
  INFO:     { color: 'var(--accent)', label: 'Info' },
};

export default function Overview() {
  const router = useRouter();
  const { metricLabel } = useTargetLabels();

  const [metrics, setMetrics] = useState([]);
  const [devices, setDevices] = useState([]);
  const [readings, setReadings] = useState([]); // latest per metric, across account
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      metricService.getAll().then(listOf).catch(() => []),
      deviceService.getAll().then(listOf).catch(() => []),
      readingService.latest().then(listOf).catch(() => []),
      alertEventService.getAll({ status: 'OPEN' }).then(listOf).catch(() => []),
    ]).then(([m, d, r, a]) => {
      if (cancelled) return;
      setMetrics(m);
      setDevices(d);
      setReadings(r);
      setAlerts(a);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const metricById = useMemo(() => {
    const map = new Map();
    metrics.forEach((m) => map.set(m.metricId, m));
    return map;
  }, [metrics]);

  // One card per metric that has a latest reading, newest data first.
  const liveReadings = useMemo(() => {
    return readings
      .map((r) => {
        const metric = metricById.get(r.metricId);
        if (!metric) return null;
        const ts = tsOf(r.recordedAt);
        const stale = ts != null && Date.now() - ts > staleMs(metric.frequencySeconds);
        const value = r.boolValue != null ? (r.boolValue ? 'On' : 'Off') : r.value;
        return { metricId: r.metricId, metric, value, unit: metric.unit, ts, stale };
      })
      .filter(Boolean)
      .sort((a, b) => (b.ts || 0) - (a.ts || 0));
  }, [readings, metricById]);

  const devicesOnline = useMemo(() => {
    return devices.filter((d) => {
      const ts = tsOf(d.lastSeenAt);
      return d.status === 'ACTIVE' && ts != null && Date.now() - ts < staleMs(null);
    }).length;
  }, [devices]);

  const recentAlerts = useMemo(
    () => [...alerts].sort((a, b) => (tsOf(b.firedAt) || 0) - (tsOf(a.firedAt) || 0)).slice(0, 5),
    [alerts],
  );

  const tiles = [
    {
      key: 'devices', label: 'Devices online', icon: Cpu, path: '/devices',
      value: loading ? '—' : `${devicesOnline}/${devices.length}`,
      tone: !loading && devices.length && devicesOnline < devices.length ? 'warn' : 'normal',
    },
    {
      key: 'alerts', label: 'Open alerts', icon: BellRing, path: '/alerts',
      value: loading ? '—' : alerts.length,
      tone: !loading && alerts.length > 0 ? 'danger' : 'normal',
    },
    {
      key: 'metrics', label: 'Metrics tracked', icon: SlidersHorizontal, path: '/metrics',
      value: loading ? '—' : metrics.length, tone: 'normal',
    },
  ];

  const toneColor = (tone) =>
    tone === 'danger' ? 'var(--danger, #dc2626)' : tone === 'warn' ? 'var(--warning, #d97706)' : 'var(--text-primary)';

  return (
    <PageWrapper title="Remote Monitoring" description="Live condition monitoring across assets & locations">
      {/* Status tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {tiles.map((t) => (
          <Card key={t.key} hoverable className="cursor-pointer" onClick={() => router.push(t.path)}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t.label}</div>
                <div className="text-3xl font-bold mt-1" style={{ color: toneColor(t.tone) }}>{t.value}</div>
              </div>
              <t.icon size={28} style={{ color: 'var(--accent)' }} />
            </div>
          </Card>
        ))}
      </div>

      {/* Live readings */}
      <div>
        <div className="flex items-center gap-2 mb-3 mt-2">
          <Activity size={18} style={{ color: 'var(--accent)' }} />
          <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Live readings</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Card key={i}><div className="h-16 animate-pulse rounded" style={{ background: 'var(--bg-hover, rgba(0,0,0,0.04))' }} /></Card>
            ))}
          </div>
        ) : liveReadings.length === 0 ? (
          <Card>
            <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              <Activity size={26} className="mx-auto mb-2" style={{ opacity: 0.5 }} />
              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>No readings yet</div>
              <div className="text-sm mt-1">
                Add a metric and connect a device, then readings will appear here as they arrive.
              </div>
              <button
                className="mt-3 text-sm underline"
                style={{ color: 'var(--accent)' }}
                onClick={() => router.push('/metrics')}
              >
                Set up metrics →
              </button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {liveReadings.map((r) => (
              <Card key={r.metricId} hoverable className="cursor-pointer" onClick={() => router.push('/dashboards')}>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold tabular-nums" style={{ color: 'var(--text-primary)' }}>
                    {typeof r.value === 'number' ? r.value.toLocaleString() : r.value}
                  </span>
                  {r.unit && <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{r.unit}</span>}
                </div>
                <div className="text-sm mt-1 truncate" style={{ color: 'var(--text-secondary)' }} title={metricLabel(r.metric)}>
                  {metricLabel(r.metric)}
                </div>
                <div
                  className="text-xs mt-2 flex items-center gap-1"
                  style={{ color: r.stale ? 'var(--warning, #d97706)' : 'var(--text-tertiary)' }}
                >
                  {r.stale && <AlertTriangle size={12} />}
                  {ago(r.ts) || 'no data'}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent alerts */}
      {!loading && recentAlerts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BellRing size={18} style={{ color: 'var(--danger, #dc2626)' }} />
              <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Recent alerts</h2>
            </div>
            <button className="text-sm underline" style={{ color: 'var(--accent)' }} onClick={() => router.push('/alerts')}>
              View all →
            </button>
          </div>
          <Card noPadding>
            {recentAlerts.map((a, i) => {
              const metric = metricById.get(a.metricId);
              const sev = SEV[a.severity] || SEV.INFO;
              return (
                <div
                  key={a.eventId}
                  className="flex items-center gap-3 cursor-pointer px-5 py-3"
                  style={{ borderTop: i ? '1px solid var(--border-primary)' : 'none' }}
                  onClick={() => router.push('/alerts')}
                >
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded shrink-0"
                    style={{ color: sev.color, background: 'color-mix(in srgb, currentColor 12%, transparent)' }}
                  >
                    {sev.label}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                      {metric ? metricLabel(metric) : a.metricId}
                    </div>
                    <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {a.operator === 'STALE'
                        ? 'No readings received (stale)'
                        : `Value ${a.value} ${a.operator} threshold ${a.threshold}`}
                    </div>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: 'var(--text-tertiary)' }}>{ago(tsOf(a.firedAt))}</span>
                </div>
              );
            })}
          </Card>
        </div>
      )}

      {/* Build-a-dashboard CTA */}
      <Card hoverable className="cursor-pointer" onClick={() => router.push('/dashboards')}>
        <div className="flex items-center gap-3">
          <LayoutDashboard size={22} style={{ color: 'var(--accent)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--text-primary)' }}>Build a readings dashboard</div>
            <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Chart sensor readings over time — multi-metric line/area, ranges, and more.</div>
          </div>
        </div>
      </Card>
    </PageWrapper>
  );
}
