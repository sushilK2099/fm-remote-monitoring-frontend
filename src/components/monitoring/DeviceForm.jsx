'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { deviceService } from '@/api/services/device.service';
import { metricService } from '@/api/services/metric.service';
import useTargetLabels from '@/hooks/useTargetLabels';

const TRANSPORT_OPTIONS = [
  { value: 'HTTP', label: 'HTTP push' },
  { value: 'MQTT', label: 'MQTT' },
];

// Broker address shown to the user as a hint (set VITE_MQTT_BROKER_HINT per env).
const MQTT_BROKER_HINT = process.env.NEXT_PUBLIC_MQTT_BROKER_HINT || 'mqtt(s)://<your-broker-host>:8883';
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
];

export default function DeviceForm({ device, onClose, onSaved }) {
  const isEdit = !!device;
  const [deviceName, setDeviceName] = useState(device?.deviceName || '');
  const [transport, setTransport] = useState(device?.transport || 'HTTP');
  const [status, setStatus] = useState(device?.status || 'ACTIVE');
  const [channelMap, setChannelMap] = useState(device?.channelMap?.length ? device.channelMap : [{ channelKey: '', metricId: '' }]);
  const [metrics, setMetrics] = useState([]);
  const [saving, setSaving] = useState(false);
  const { metricLabel } = useTargetLabels();

  useEffect(() => {
    metricService.getAll({ status: 'ACTIVE' })
      .then((res) => setMetrics(res.data.data || []))
      .catch(() => {});
  }, []);

  const metricOptions = [
    { value: '', label: 'Select metric…' },
    ...metrics.map((m) => ({ value: m.metricId, label: metricLabel(m) })),
  ];

  const setChannel = (i, key, val) => {
    setChannelMap((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: val } : c)));
  };
  const addChannel = () => setChannelMap((prev) => [...prev, { channelKey: '', metricId: '' }]);
  const removeChannel = (i) => setChannelMap((prev) => prev.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    if (!deviceName.trim()) return toast.error('Device name is required');

    // A half-filled row (only channelKey OR only metric) is almost always a mistake —
    // surface it instead of silently dropping it at save.
    const partial = channelMap.find((c) => (c.channelKey.trim() && !c.metricId) || (!c.channelKey.trim() && c.metricId));
    if (partial) {
      return toast.error('Each channel needs both a channel key and a metric (or remove the empty row)');
    }
    const cleaned = channelMap.filter((c) => c.channelKey.trim() && c.metricId);
    setSaving(true);
    try {
      const payload = { deviceName: deviceName.trim(), transport, status, channelMap: cleaned };
      const res = isEdit
        ? await deviceService.update(device.deviceId, payload)
        : await deviceService.create(payload);
      toast.success(isEdit ? 'Device updated' : 'Device created');
      onSaved(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Device' : 'Add Device'} size="lg"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      }>
      <form onSubmit={submit} className="space-y-4">
        <Input label="Device name" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} placeholder="Gateway 1" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Transport" options={TRANSPORT_OPTIONS} value={transport} onChange={(e) => setTransport(e.target.value)} />
          {isEdit && <Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(e) => setStatus(e.target.value)} />}
        </div>

        {transport === 'MQTT' && (
          <div className="rounded-lg border p-4"
            style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)' }}>
            <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>MQTT connection</div>
            <dl className="space-y-2.5 text-sm">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Broker</dt>
                <dd className="min-w-0"><code className="op-code">{MQTT_BROKER_HINT}</code></dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Topic</dt>
                <dd className="min-w-0"><code className="op-code">fm/readings/{isEdit ? device.deviceId : '<deviceId>'}</code></dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Payload</dt>
                <dd className="min-w-0"><code className="op-code">{'{ "temp1": 55, "humid1": 40, "_ts"?: "ISO-8601" }'}</code></dd>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Auth</dt>
                <dd className="min-w-0" style={{ color: 'var(--text-secondary)' }}>username = the device ID · password = the API key shown at creation</dd>
              </div>
            </dl>
            <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              One topic per device — publish a single JSON object whose keys are your channel keys.
              {!isEdit && ' The exact topic and key appear after you save.'}
            </p>
          </div>
        )}

        <div>
          <label className="block font-medium mb-2" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Channel map — bind each device channel (e.g. temp1) to a metric
          </label>
          <div className="space-y-3">
            {channelMap.map((c, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-40">
                  <Input placeholder="temp1" value={c.channelKey} onChange={(e) => setChannel(i, 'channelKey', e.target.value)} />
                </div>
                <div className="flex-1">
                  <Select options={metricOptions} value={c.metricId} onChange={(e) => setChannel(i, 'metricId', e.target.value)} />
                  {c.metricId && (
                    <p className="mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      → {metricLabel(metrics.find((m) => m.metricId === c.metricId)) || c.metricId}
                    </p>
                  )}
                </div>
                <button type="button" className="mt-2" onClick={() => removeChannel(i)} title="Remove"><X size={16} /></button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addChannel}><Plus size={14} /> Add channel</Button>
        </div>
      </form>
    </Modal>
  );
}
