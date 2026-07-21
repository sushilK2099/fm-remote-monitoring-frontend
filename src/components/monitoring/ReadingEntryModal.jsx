'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { readingService } from '@/api/services/reading.service';

// Manual reading entry for one metric.
export default function ReadingEntryModal({ metric, onClose, onSaved }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (value === '' || isNaN(Number(value))) return toast.error('Enter a numeric value');
    setSaving(true);
    try {
      await readingService.create({ metricId: metric.metricId, value: Number(value) });
      toast.success('Reading recorded');
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Enter reading — ${metric.name}`} size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : 'Record'}</Button>
        </div>
      }>
      <form onSubmit={submit}>
        <Input label={`Value${metric.unit ? ' (' + metric.unit + ')' : ''}`} type="number"
          value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
      </form>
    </Modal>
  );
}
