'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { metricService } from '@/api/services/metric.service';
import { roleService } from '@/api/services/role.service';

const DTYPE_OPTIONS = [
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
];
const MODE_OPTIONS = [
  { value: 'MANUAL', label: 'Manual entry' },
  { value: 'AUTOMATIC', label: 'Automatic (IoT device)' },
];

// targetType: 'ASSET' | 'LOCATION'; targetId: the asset/location id.
export default function MetricForm({ metric, targetType, targetId, onClose, onSaved }) {
  const isEdit = !!metric;
  const [name, setName] = useState(metric?.name || '');
  const [unit, setUnit] = useState(metric?.unit || '');
  const [dataType, setDataType] = useState(metric?.dataType || 'NUMBER');
  const [readingMode, setReadingMode] = useState(metric?.readingMode || 'MANUAL');
  const [frequencySeconds, setFrequencySeconds] = useState(metric?.frequencySeconds ?? '');
  const [min, setMin] = useState(metric?.min ?? '');
  const [max, setMax] = useState(metric?.max ?? '');
  const [responsibleRoleId, setResponsibleRoleId] = useState(metric?.responsibleRoleId || '');
  const [roleOptions, setRoleOptions] = useState([]);
  const [saving, setSaving] = useState(false);

  // Account roles for the "responsible" dropdown (manual metrics only).
  useEffect(() => {
    roleService.getAll({})
      .then((res) => {
        const roles = res.data.data || res.data || [];
        setRoleOptions(roles.map((r) => ({ value: r.roleId, label: r.name })));
      })
      .catch(() => {});
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      const payload = {
        targetType, targetId,
        name: name.trim(), unit: unit.trim() || null, dataType, readingMode,
        // Only meaningful for manual metrics; cleared server-side for automatic.
        responsibleRoleId: readingMode === 'MANUAL' ? (responsibleRoleId || null) : null,
        frequencySeconds: frequencySeconds === '' ? null : Number(frequencySeconds),
        min: min === '' ? null : Number(min),
        max: max === '' ? null : Number(max),
      };
      if (isEdit) await metricService.update(metric.metricId, payload);
      else await metricService.create(payload);
      toast.success(isEdit ? 'Metric updated' : 'Metric created');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isEdit ? 'Edit Metric' : 'Add Metric'} size="lg"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </div>
      }>
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Temperature" />
          <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="°C" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select label="Data type" options={DTYPE_OPTIONS} value={dataType} onChange={(e) => setDataType(e.target.value)} />
          <Select label="Reading mode" options={MODE_OPTIONS} value={readingMode} onChange={(e) => setReadingMode(e.target.value)} />
        </div>
        {readingMode === 'MANUAL' && (
          <Select label="Responsible role (who logs readings)"
            options={[{ value: '', label: '— unassigned —' }, ...roleOptions]}
            value={responsibleRoleId}
            onChange={(e) => setResponsibleRoleId(e.target.value)} />
        )}
        <div className="grid grid-cols-3 gap-4">
          <Input label="Frequency (s)" type="number" value={frequencySeconds} onChange={(e) => setFrequencySeconds(e.target.value)} placeholder="60" />
          <Input label="Min (chart)" type="number" value={min} onChange={(e) => setMin(e.target.value)} />
          <Input label="Max (chart)" type="number" value={max} onChange={(e) => setMax(e.target.value)} />
        </div>
      </form>
    </Modal>
  );
}
