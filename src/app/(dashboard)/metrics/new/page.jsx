'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import { Box, MapPin, ArrowLeft, Hand, Zap, Check } from 'lucide-react';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import useTargetLabels from '@/hooks/useTargetLabels';
import { metricService } from '@/api/services/metric.service';
import { assetService } from '@/api/services/asset.service';
import { locationService } from '@/api/services/location.service';
import { roleService } from '@/api/services/role.service';

const DTYPE_OPTIONS = [
  { value: 'NUMBER', label: 'Number' },
  { value: 'BOOLEAN', label: 'Boolean' },
];

// Dedicated "Add metric" page (replaces the old two-step target-picker + form modals).
// Optional query ?targetType=ASSET&targetId=... prefills and locks the target — used by the
// in-context "Add metric" button on a selected target's panel.
export default function NewMetricPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { label } = useTargetLabels();

  const lockedType = params.get('targetType');
  const lockedId = params.get('targetId');
  const targetLocked = !!(lockedType && lockedId);

  // Target
  const [targetType, setTargetType] = useState(lockedType || 'ASSET');
  const [targetId, setTargetId] = useState(lockedId || '');
  const [assets, setAssets] = useState([]);
  const [locations, setLocations] = useState([]);

  // Metric details
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [dataType, setDataType] = useState('NUMBER');
  const [readingMode, setReadingMode] = useState('MANUAL');
  const [frequencySeconds, setFrequencySeconds] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [responsibleRoleId, setResponsibleRoleId] = useState('');
  const [roleOptions, setRoleOptions] = useState([]);

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    assetService.getAll({}).then((r) => setAssets(r.data.data || [])).catch(() => {});
    locationService.getAll({}).then((r) => setLocations(r.data.data || [])).catch(() => {});
    roleService.getAll({})
      .then((res) => {
        const roles = res.data.data || res.data || [];
        setRoleOptions(roles.map((r) => ({ value: r.roleId, label: r.name })));
      })
      .catch(() => {});
  }, []);

  const targetOptions = useMemo(() => (targetType === 'ASSET'
    ? [{ value: '', label: 'Select an asset…' }, ...assets.map((a) => ({ value: a.assetId, label: a.assetName }))]
    : [{ value: '', label: 'Select a location…' }, ...locations.map((l) => ({ value: l.locationId, label: l.locationName }))]),
  [targetType, assets, locations]);

  const submit = async (e) => {
    e.preventDefault();
    if (!targetId) return toast.error('Pick an asset or location first');
    if (!name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      await metricService.create({
        targetType, targetId,
        name: name.trim(), unit: unit.trim() || null, dataType, readingMode,
        responsibleRoleId: readingMode === 'MANUAL' ? (responsibleRoleId || null) : null,
        frequencySeconds: frequencySeconds === '' ? null : Number(frequencySeconds),
        min: min === '' ? null : Number(min),
        max: max === '' ? null : Number(max),
      });
      toast.success('Metric created');
      // Return to the metrics page focused on the target we just added to.
      router.push(`/metrics?targetType=${targetType}&targetId=${targetId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
      setSaving(false);
    }
  };

  return (
    <PageWrapper
      title="Add metric"
      section="Metrics"
      sectionHref="/metrics"
      description="Define a measurable attribute to track on an asset or location."
    >
      <div className="mx-auto w-full max-w-2xl">
        <Button variant="ghost" size="sm" className="-ml-2 mb-4" onClick={() => router.push('/metrics')} disabled={saving}>
          <ArrowLeft size={16} /> Back
        </Button>
        <form onSubmit={submit} className="space-y-6">
        {/* Section: Target */}
        <Card>
          <SectionHeader
            step={1}
            title="Target"
            subtitle="Where is this metric measured?"
          />
          {targetLocked ? (
            <div
              className="flex items-center gap-2.5 rounded-lg border px-3.5 py-3"
              style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-hover)' }}
            >
              {targetType === 'ASSET'
                ? <Box size={16} style={{ color: 'var(--accent)' }} />
                : <MapPin size={16} style={{ color: 'var(--accent)' }} />}
              <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {label(targetType, targetId)}
              </span>
              <span className="op-pill op-pill-gray ml-auto">{targetType === 'ASSET' ? 'Asset' : 'Location'}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Target type"
                options={[{ value: 'ASSET', label: 'Asset' }, { value: 'LOCATION', label: 'Location' }]}
                value={targetType}
                onChange={(e) => { setTargetType(e.target.value); setTargetId(''); }}
              />
              <Select
                label={targetType === 'ASSET' ? 'Asset' : 'Location'}
                options={targetOptions}
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
              />
            </div>
          )}
        </Card>

        {/* Section: Metric details */}
        <Card>
          <SectionHeader
            step={2}
            title="Metric details"
            subtitle="What it's called and how it's read."
          />
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Temperature" autoFocus={!targetLocked ? false : true} />
              <Input label="Unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="°C" />
            </div>

            {/* Reading mode as clear choice cards instead of a bare dropdown */}
            <div>
              <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>Reading mode</label>
              <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModeCard
                  active={readingMode === 'MANUAL'}
                  onClick={() => setReadingMode('MANUAL')}
                  icon={Hand}
                  title="Manual entry"
                  desc="A responsible person logs readings by hand."
                />
                <ModeCard
                  active={readingMode === 'AUTOMATIC'}
                  onClick={() => setReadingMode('AUTOMATIC')}
                  icon={Zap}
                  title="Automatic"
                  desc="An IoT device pushes readings on a schedule."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select label="Data type" options={DTYPE_OPTIONS} value={dataType} onChange={(e) => setDataType(e.target.value)} />
              {readingMode === 'MANUAL' ? (
                <Select
                  label="Responsible role (who logs readings)"
                  options={[{ value: '', label: '— unassigned —' }, ...roleOptions]}
                  value={responsibleRoleId}
                  onChange={(e) => setResponsibleRoleId(e.target.value)}
                />
              ) : (
                <Input
                  label="Frequency (seconds)"
                  type="number"
                  value={frequencySeconds}
                  onChange={(e) => setFrequencySeconds(e.target.value)}
                  placeholder="60"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Min (chart axis)" type="number" value={min} onChange={(e) => setMin(e.target.value)} placeholder="optional" />
              <Input label="Max (chart axis)" type="number" value={max} onChange={(e) => setMax(e.target.value)} placeholder="optional" />
            </div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-2 pt-2 mt-1 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <Button variant="outline" type="button" onClick={() => router.push('/metrics')} disabled={saving}>Cancel</Button>
          <Button type="submit" isLoading={saving}>
            {!saving && <Check size={16} />} Create metric
          </Button>
        </div>
        </form>
      </div>
    </PageWrapper>
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
      type="button"
      onClick={onClick}
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
