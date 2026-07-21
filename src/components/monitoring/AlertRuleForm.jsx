'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { alertRuleService } from '@/api/services/alert.service';
import useTargetLabels from '@/hooks/useTargetLabels';

const OP_OPTIONS = [
  { value: 'GT', label: 'greater than (>)' },
  { value: 'GTE', label: 'greater or equal (≥)' },
  { value: 'LT', label: 'less than (<)' },
  { value: 'LTE', label: 'less or equal (≤)' },
  { value: 'EQ', label: 'equal (=)' },
  { value: 'NEQ', label: 'not equal (≠)' },
];
const SEVERITY_OPTIONS = [
  { value: 'INFO', label: 'Info' },
  { value: 'WARNING', label: 'Warning' },
  { value: 'CRITICAL', label: 'Critical' },
];
const RECIPIENT_TYPES = [
  { value: 'EMAIL', label: 'Email address' },
  { value: 'USER', label: 'User ID' },
  { value: 'ROLE', label: 'Role' },
];

export default function AlertRuleForm({ rule, metrics = [], onClose, onSaved }) {
  const isEdit = !!rule;
  const [metricId, setMetricId] = useState(rule?.metricId || (metrics[0]?.metricId || ''));
  const [operator, setOperator] = useState(rule?.operator || 'GT');
  const [threshold, setThreshold] = useState(rule?.threshold ?? '');
  const [severity, setSeverity] = useState(rule?.severity || 'WARNING');
  const [cooldownSeconds, setCooldownSeconds] = useState(rule?.cooldownSeconds ?? 300);
  const [enabled, setEnabled] = useState(rule?.enabled !== false);
  const [recipients, setRecipients] = useState(rule?.recipients?.length ? rule.recipients : [{ type: 'EMAIL', email: '' }]);
  const [saving, setSaving] = useState(false);
  const { metricLabel } = useTargetLabels();

  const metricOptions = metrics.map((m) => ({ value: m.metricId, label: metricLabel(m) }));

  const setRecip = (i, key, val) => setRecipients((prev) => prev.map((r, idx) => (idx === i ? { ...r, [key]: val } : r)));
  const addRecip = () => setRecipients((prev) => [...prev, { type: 'EMAIL', email: '' }]);
  const removeRecip = (i) => setRecipients((prev) => prev.filter((_, idx) => idx !== i));

  const recipValueField = (type) => (type === 'EMAIL' ? 'email' : type === 'USER' ? 'userId' : 'roleId');

  const submit = async (e) => {
    e.preventDefault();
    if (!metricId) return toast.error('Select a metric');
    if (threshold === '' || isNaN(Number(threshold))) return toast.error('Threshold is required');

    const cleanedRecipients = recipients
      .map((r) => ({ type: r.type, [recipValueField(r.type)]: r[recipValueField(r.type)] }))
      .filter((r) => r[recipValueField(r.type)]);

    setSaving(true);
    try {
      const payload = {
        metricId, operator, threshold: Number(threshold), severity,
        cooldownSeconds: Number(cooldownSeconds), enabled, recipients: cleanedRecipients,
      };
      if (isEdit) await alertRuleService.update(rule.ruleId, payload);
      else await alertRuleService.create(payload);
      toast.success(isEdit ? 'Rule updated' : 'Rule created');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Alert Rule' : 'Add Alert Rule'} size="lg"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      }>
      <form onSubmit={submit} className="space-y-4">
        <Select label="Metric" options={metricOptions} value={metricId} onChange={(e) => setMetricId(e.target.value)} />
        <div className="grid grid-cols-3 gap-4">
          <Select label="Operator" options={OP_OPTIONS} value={operator} onChange={(e) => setOperator(e.target.value)} />
          <Input label="Threshold" type="number" value={threshold} onChange={(e) => setThreshold(e.target.value)} />
          <Select label="Severity" options={SEVERITY_OPTIONS} value={severity} onChange={(e) => setSeverity(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Cooldown (seconds)" type="number" value={cooldownSeconds} onChange={(e) => setCooldownSeconds(e.target.value)} />
          <Select label="Enabled" options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]}
            value={String(enabled)} onChange={(e) => setEnabled(e.target.value === 'true')} />
        </div>

        <div>
          <label className="block font-medium mb-2" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Recipients</label>
          <div className="space-y-2">
            {recipients.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-40"><Select options={RECIPIENT_TYPES} value={r.type} onChange={(e) => setRecip(i, 'type', e.target.value)} /></div>
                <Input className="flex-1"
                  placeholder={r.type === 'EMAIL' ? 'ops@example.com' : r.type === 'USER' ? 'user id' : 'role name'}
                  value={r[recipValueField(r.type)] || ''}
                  onChange={(e) => setRecip(i, recipValueField(r.type), e.target.value)} />
                <button type="button" onClick={() => removeRecip(i)} title="Remove"><X size={16} /></button>
              </div>
            ))}
          </div>
          <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRecip}><Plus size={14} /> Add recipient</Button>
        </div>
      </form>
    </Modal>
  );
}
