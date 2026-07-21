'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, X, ArrowLeft, Check, Radio, Cable } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import useTargetLabels from '@/hooks/useTargetLabels';
import { deviceService } from '@/api/services/device.service';
import { metricService } from '@/api/services/metric.service';
import { NEW_DEVICE_KEY } from '@/config/constants';

// Broker address shown as a hint (set NEXT_PUBLIC_MQTT_BROKER_HINT per env).
const MQTT_BROKER_HINT = process.env.NEXT_PUBLIC_MQTT_BROKER_HINT || 'mqtt(s)://<your-broker-host>:8883';

// Dedicated "Add device" page (replaces the add-device modal). Editing still uses the modal.
export default function NewDevicePage() {
  const router = useRouter();
  const { metricLabel } = useTargetLabels();

  const [deviceName, setDeviceName] = useState('');
  const [transport, setTransport] = useState('HTTP');
  const [channelMap, setChannelMap] = useState([{ channelKey: '', metricId: '' }]);
  const [metrics, setMetrics] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    metricService.getAll({ status: 'ACTIVE' })
      .then((res) => setMetrics(res.data.data || []))
      .catch(() => {});
  }, []);

  const metricOptions = useMemo(() => [
    { value: '', label: 'Select metric…' },
    ...metrics.map((m) => ({ value: m.metricId, label: metricLabel(m) })),
  ], [metrics, metricLabel]);

  const setChannel = (i, key, val) => setChannelMap((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));
  const addChannel = () => setChannelMap((prev) => [...prev, { channelKey: '', metricId: '' }]);
  const removeChannel = (i) => setChannelMap((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const submit = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return toast.error('Device name is required');

    // A half-filled row (only channelKey OR only metric) is almost always a mistake.
    const partial = channelMap.find((c) => (c.channelKey.trim() && !c.metricId) || (!c.channelKey.trim() && c.metricId));
    if (partial) return toast.error('Each channel needs both a channel key and a metric (or remove the empty row)');

    const cleaned = channelMap.filter((c) => c.channelKey.trim() && c.metricId);
    setSaving(true);
    try {
      const res = await deviceService.create({ deviceName: deviceName.trim(), transport, status: 'ACTIVE', channelMap: cleaned });
      const created = res.data.data;
      toast.success('Device created');
      // Stash the one-time plaintext key for /devices to surface, then leave.
      if (created?.apiKey) {
        try {
          sessionStorage.setItem(NEW_DEVICE_KEY, JSON.stringify({
            deviceId: created.deviceId, apiKey: created.apiKey, transport: created.transport,
          }));
        } catch { /* private mode etc. — the dialog just won't show */ }
      }
      router.push('/devices');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Add device"
      section="Monitoring Devices"
      sectionHref="/devices"
      description="Register an IoT device that pushes automatic readings."
    >
      <div className="mx-auto w-full max-w-2xl">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4" onClick={() => router.push('/devices')} disabled={saving}>
          <ArrowLeft size={16} /> Back
        </Button>
        <form onSubmit={submit} className="space-y-6">
        {/* Section: Device */}
        <Card>
          <SectionHeader step={1} title="Device" subtitle="Name it and choose how it delivers readings." />
          <div className="space-y-4">
            <Input label="Device name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Gateway 1" autoFocus />

            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Transport</label>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModeCard
                  active={transport === 'HTTP'} onClick={() => setTransport('HTTP')}
                  icon={Cable} title="HTTP push"
                  desc="The device POSTs readings to the ingest endpoint."
                />
                <ModeCard
                  active={transport === 'MQTT'} onClick={() => setTransport('MQTT')}
                  icon={Radio} title="MQTT"
                  desc="The device publishes readings to the broker."
                />
              </div>
            </div>

            {transport === 'MQTT' && (
              <div className="rounded-lg border p-4"
                style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-hover)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Radio size={15} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>MQTT connection</span>
                </div>
                <dl className="space-y-2.5 text-sm">
                  <ConnRow label="Broker"><code className="op-code">{MQTT_BROKER_HINT}</code></ConnRow>
                  <ConnRow label="Topic"><code className="op-code">fm/readings/&lt;deviceId&gt;</code></ConnRow>
                  <ConnRow label="Payload"><code className="op-code">{'{ "temp1": 55, "humid1": 40, "_ts"?: "ISO-8601" }'}</code></ConnRow>
                  <ConnRow label="Username"><code className="op-code">&lt;the device ID&gt;</code></ConnRow>
                  <ConnRow label="Password"><span style={{ color: 'var(--text-secondary)' }}>the API key shown after saving</span></ConnRow>
                </dl>
                <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  One topic per device — publish a single JSON object whose keys are your channel keys.
                  Optional <code className="op-code">_ts</code> sets the reading time for all channels. The exact topic and key appear after you save.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Section: Channel map */}
        <Card>
          <SectionHeader step={2} title="Channel map" subtitle="Bind each device channel (e.g. temp1) to a metric." />
          <div className="space-y-3">
            {channelMap.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-40 shrink-0">
                  <Input placeholder="temp1" value={c.channelKey} onChange={(e) => setChannel(i, 'channelKey', e.target.value)} />
                </div>
                <div className="flex-1 min-w-0">
                  <Select options={metricOptions} value={c.metricId} onChange={(e) => setChannel(i, 'metricId', e.target.value)} />
                  {c.metricId && (
                    <p className="mt-1 text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {metricLabel(metrics.find((m) => m.metricId === c.metricId)) || c.metricId}
                    </p>
                  )}
                </div>
                <button
                  type="button" className="op-icon-btn op-icon-btn-danger mt-1.5" title="Remove channel"
                  onClick={() => removeChannel(i)} disabled={channelMap.length === 1}
                  style={channelMap.length === 1 ? { opacity: 0.4, cursor: 'not-allowed' } : undefined}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={addChannel}>
            <Plus size={14} /> Add channel
          </Button>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2 mt-1 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <Button variant="outline" type="button" onClick={() => router.push('/devices')} disabled={saving}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {!saving && <Check size={16} />} Create device
          </Button>
        </div>
        </form>
      </div>
    </PageWrapper>
  );
}

// One "Label: value" row in the MQTT connection box — fixed-width label, value wraps/breaks.
function ConnRow({ label, children }) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>{label}</dt>
      <dd className="min-w-0 break-all">{children}</dd>
    </div>
  );
}

function SectionHeader({ step, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
        style={{ backgroundColor: 'var(--accent-tint)', color: 'var(--accent)' }}
      >
        {step}
      </span>
      <div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</div>
        <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{subtitle}</div>
      </div>
    </div>
  );
}

function ModeCard({ active, onClick, icon: Icon, title, desc }) {
  return (
    <button
      type="button" onClick={onClick}
      className="flex items-start gap-3 rounded-lg border p-3 text-left transition-all"
      style={{
        borderColor: active ? 'var(--accent)' : 'var(--border-primary)',
        backgroundColor: active ? 'var(--accent-tint)' : 'var(--bg-card)',
        boxShadow: active ? '0 0 0 3px var(--accent-tint)' : 'none',
      }}
    >
      <Icon size={18} className="mt-0.5 shrink-0" style={{ color: active ? 'var(--accent)' : 'var(--text-secondary)' }} />
      <div className="min-w-0">
        <div className="text-sm font-medium" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>{title}</div>
        <div className="text-xs mt-0.5" style={{ color: 'var(--text-tertiary)' }}>{desc}</div>
      </div>
    </button>
  );
}
