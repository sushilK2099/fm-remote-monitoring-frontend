'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

const MQTT_BROKER_HINT = process.env.NEXT_PUBLIC_MQTT_BROKER_HINT || 'mqtt(s)://<your-broker-host>:8883';

// Shows a device's plaintext API key ONCE. It is never retrievable again.
export default function ApiKeyDialog({ data, onClose }) {
  const [copied, setCopied] = useState(false);
  const isMqtt = data.transport === 'MQTT';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(data.apiKey);
      setCopied(true);
      toast.success('Copied');
    } catch {
      toast.error('Copy failed — select and copy manually');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Device API Key" size="md"
      footer={<Button onClick={onClose}>Done</Button>}>
      <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
        Copy this key now for <strong>{data.deviceId}</strong>. It is shown only once and
        cannot be retrieved later.
        {isMqtt
          ? ' Use it as the MQTT connection password (username = the device ID).'
          : <> Send it as the <code>x-device-key</code> header when the device posts to <code>/ingest</code>.</>}
      </p>
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-lg border px-3 py-2 text-xs break-all"
          style={{ backgroundColor: 'var(--bg-input)' }}>{data.apiKey}</code>
        <Button variant="outline" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</Button>
      </div>

      {isMqtt && (
        <div className="mt-3 rounded-lg border p-4"
          style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-input)' }}>
          <div className="text-sm font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>MQTT connection</div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Broker</dt>
              <dd className="min-w-0"><code className="op-code">{MQTT_BROKER_HINT}</code></dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Topic</dt>
              <dd className="min-w-0"><code className="op-code">fm/readings/{data.deviceId}</code></dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Payload</dt>
              <dd className="min-w-0"><code className="op-code">{'{ "temp1": 55, "humid1": 40, "_ts"?: "ISO-8601" }'}</code></dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Username</dt>
              <dd className="min-w-0"><code className="op-code">{data.deviceId}</code></dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <dt className="w-20 shrink-0 font-medium" style={{ color: 'var(--text-tertiary)' }}>Password</dt>
              <dd className="min-w-0" style={{ color: 'var(--text-secondary)' }}>the key above</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs" style={{ color: 'var(--text-tertiary)' }}>
            Publish one JSON object to the device topic — its keys are your channel keys.
          </p>
        </div>
      )}
    </Modal>
  );
}
