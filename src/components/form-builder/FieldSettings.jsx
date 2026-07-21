'use client';
import React, { useState, useMemo } from 'react';
import { Trash2, ChevronLeft } from 'lucide-react';
import { FIELD_TYPES, DEFAULT_CONDITIONAL_SUBFIELD } from './constants';

function Label({ children }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </label>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
        border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
        background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
      }}
    />
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>
      <span>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36, height: 20, borderRadius: 10, position: 'relative',
          background: checked ? 'var(--accent)' : 'var(--border-primary)',
          transition: 'background 0.2s', flexShrink: 0,
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: checked ? 18 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
        }} />
      </div>
    </label>
  );
}

function Row({ children }) {
  return <div style={{ marginBottom: 14 }}>{children}</div>;
}

// ─── Per-field settings panels ────────────────────────────────────────────────

// Common fields: label, mandatory, hidden, width
function CommonSettings({ comp, onChange }) {
  return (
    <>
      <Row>
        <Label>Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="Field label" />
      </Row>
      <Row>
        <Label>Placeholder</Label>
        <TextInput value={comp.config?.placeholder ?? ''} onChange={(v) => onChange('config.placeholder', v)} placeholder="Placeholder text" />
      </Row>
      <Row>
        <Label>Help Text</Label>
        <TextInput value={comp.config?.helpText ?? ''} onChange={(v) => onChange('config.helpText', v)} placeholder="Helper text shown below the field" />
      </Row>
      <Row>
        <Toggle checked={comp.mandatory} onChange={(v) => onChange('mandatory', v)} label="Required" />
      </Row>
      <Row>
        <Toggle checked={comp.hidden ?? false} onChange={(v) => onChange('hidden', v)} label="Hidden by default" />
      </Row>
      <Row>
        <Label>Width</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {['full', 'half', 'third'].map((w) => (
            <button
              key={w}
              onClick={() => onChange('width', w)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 13, fontWeight: 600,
                borderRadius: 'var(--radius-sm)', border: '1px solid ' + (comp.width === w ? 'var(--accent)' : 'var(--border-primary)'),
                background: comp.width === w ? 'var(--accent)' : 'var(--bg-secondary)',
                color: comp.width === w ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
              }}
            >
              {w}
            </button>
          ))}
        </div>
      </Row>
    </>
  );
}

function RadioGroup({ value, options, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt) => (
        <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>
          <div
            onClick={() => onChange(opt.value)}
            style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              border: `2px solid ${value === opt.value ? 'var(--accent)' : 'var(--border-primary)'}`,
              background: value === opt.value ? 'var(--accent)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {value === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
          </div>
          {opt.label}
        </label>
      ))}
    </div>
  );
}

function SectionHeader({ children }) {
  return (
    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 12, marginTop: 4 }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ borderTop: '1px solid var(--border-primary)', margin: '14px 0' }} />;
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: 'var(--text-primary)' }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 16, height: 16, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${checked ? 'var(--accent)' : 'var(--border-primary)'}`,
          background: checked ? 'var(--accent)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      {label}
    </label>
  );
}

function NumInput({ label, value, onChange, placeholder }) {
  return (
    <div style={{ flex: 1 }}>
      <Label>{label}</Label>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        placeholder={placeholder}
        min={0}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
          border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
          background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
        }}
      />
    </div>
  );
}

function CheckboxGroup({ label, options, values = [], onChange }) {
  const toggle = (val) => {
    const next = values.includes(val) ? values.filter((v) => v !== val) : [...values, val];
    onChange(next);
  };
  return (
    <Row>
      <Label>{label}</Label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
        {options.map((opt) => (
          <Checkbox
            key={opt}
            checked={values.includes(opt)}
            onChange={() => toggle(opt)}
            label={opt}
          />
        ))}
      </div>
    </Row>
  );
}

const VALIDATION_PRESETS = [
  { value: 'none',         label: 'None' },
  { value: 'email',        label: 'Email',        hint: 'name@domain.com' },
  { value: 'phone',        label: 'Phone',        hint: '+91XXXXXXXXXX or 10-digit' },
  { value: 'url',          label: 'URL',          hint: 'https://...' },
  { value: 'regex',        label: 'Custom Regex', hint: '' },
];

const INPUT_CHAR_TYPES = [
  { value: 'text',         label: 'Text' },
  { value: 'numbers',      label: 'Numbers only' },
  { value: 'alphanumeric', label: 'Alphanumeric' },
];

function TextSettings({ comp, onChange }) {
  const inputMode      = comp.config?.inputMode ?? 'manual';
  const charType       = comp.config?.charType ?? 'text';
  const validPreset    = comp.config?.validation?.type ?? 'none';
  const customPattern  = comp.config?.validation?.pattern ?? '';

  // When a preset is chosen that implies a char type, lock charType automatically
  const presetLocked = validPreset === 'email' || validPreset === 'url';

  const handlePreset = (v) => {
    if (v === 'none') {
      onChange('config.validation', null);
    } else {
      onChange('config.validation', { type: v, pattern: v === 'regex' ? customPattern : '' });
    }
    // email/url → force text mode
    if (v === 'email' || v === 'url') onChange('config.charType', 'text');
    // phone → force numbers mode
    if (v === 'phone') onChange('config.charType', 'numbers');
  };

  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />

      <Divider />
      <SectionHeader>Input Mode</SectionHeader>
      <Row>
        <RadioGroup
          value={inputMode}
          onChange={(v) => onChange('config.inputMode', v)}
          options={[
            { value: 'manual',    label: 'Entered manually by user' },
            { value: 'prefilled', label: 'Prefilled' },
          ]}
        />
      </Row>
      {inputMode === 'prefilled' && (
        <Row>
          <Label>Prefill Logic</Label>
          <textarea
            value={comp.config?.prefillLogic ?? ''}
            onChange={(e) => onChange('config.prefillLogic', e.target.value)}
            placeholder="Paste expression or code here..."
            rows={4}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 10px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', resize: 'vertical',
              background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
              fontFamily: 'monospace',
            }}
          />
        </Row>
      )}

      <Divider />
      <SectionHeader>Character Type</SectionHeader>
      <Row>
        <div style={{ display: 'flex', gap: 6 }}>
          {INPUT_CHAR_TYPES.map((t) => (
            <button
              key={t.value}
              disabled={presetLocked && t.value !== 'text'}
              onClick={() => onChange('config.charType', t.value)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 13, fontWeight: 600, borderRadius: 'var(--radius-sm)',
                border: '1px solid ' + (charType === t.value ? 'var(--accent)' : 'var(--border-primary)'),
                background: charType === t.value ? 'var(--accent)' : 'var(--bg-secondary)',
                color: charType === t.value ? '#fff' : 'var(--text-secondary)',
                cursor: (presetLocked && t.value !== 'text') ? 'not-allowed' : 'pointer',
                opacity: (presetLocked && t.value !== 'text') ? 0.4 : 1,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </Row>

      <Divider />
      <SectionHeader>Validation</SectionHeader>
      <Row>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {VALIDATION_PRESETS.map((p) => (
            <label key={p.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
              <div
                onClick={() => handlePreset(p.value)}
                style={{
                  width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  border: `2px solid ${validPreset === p.value ? 'var(--accent)' : 'var(--border-primary)'}`,
                  background: validPreset === p.value ? 'var(--accent)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {validPreset === p.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
              </div>
              <div>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>{p.label}</div>
                {p.hint && <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{p.hint}</div>}
              </div>
            </label>
          ))}
        </div>
      </Row>
      {validPreset === 'regex' && (
        <Row>
          <Label>Pattern</Label>
          <input
            value={customPattern}
            onChange={(e) => onChange('config.validation', { type: 'regex', pattern: e.target.value })}
            placeholder="e.g. ^[A-Z]{3}\d{4}$"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', outline: 'none',
              background: 'var(--bg-input)', color: 'var(--text-primary)', fontFamily: 'monospace',
            }}
          />
          <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Enter a valid JavaScript regex without slashes
          </div>
        </Row>
      )}

      <Divider />
      <SectionHeader>Character Limit</SectionHeader>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <NumInput label="Minimum" value={comp.config?.minLength} onChange={(v) => onChange('config.minLength', v)} placeholder="00" />
        <NumInput label="Maximum" value={comp.config?.maxLength} onChange={(v) => onChange('config.maxLength', v)} placeholder="000" />
      </div>
    </>
  );
}

function NumberSettings({ comp, onChange }) {
  const allowDecimals = comp.config?.allowDecimals ?? false;
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />

      <Divider />
      <SectionHeader>Value Range</SectionHeader>
      <div style={{ display: 'flex', gap: 10 }}>
        <NumInput label="Minimum" value={comp.config?.min} onChange={(v) => onChange('config.min', v)} placeholder="0" />
        <NumInput label="Maximum" value={comp.config?.max} onChange={(v) => onChange('config.max', v)} placeholder="—" />
      </div>

      <Divider />
      <SectionHeader>Decimals</SectionHeader>
      <Row>
        <Checkbox
          checked={allowDecimals}
          onChange={(v) => onChange('config.allowDecimals', v)}
          label="Allow decimal values"
        />
      </Row>
      {allowDecimals && (
        <Row>
          <NumInput
            label="Max decimal places"
            value={comp.config?.decimalPlaces}
            onChange={(v) => onChange('config.decimalPlaces', v)}
            placeholder="2"
          />
        </Row>
      )}

      <Divider />
      <SectionHeader>Display</SectionHeader>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Label>Prefix</Label>
          <input
            value={comp.config?.prefix ?? ''}
            onChange={(e) => onChange('config.prefix', e.target.value)}
            placeholder="e.g. ₹"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
              background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Label>Suffix</Label>
          <input
            value={comp.config?.suffix ?? ''}
            onChange={(e) => onChange('config.suffix', e.target.value)}
            placeholder="e.g. kg"
            style={{
              width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
              background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
      </div>
    </>
  );
}

function HeadingSettings({ comp, onChange }) {
  return (
    <>
      <Row>
        <Label>Content</Label>
        <TextInput value={comp.config?.content ?? ''} onChange={(v) => onChange('config.content', v)} placeholder="Heading text" />
      </Row>
      <Row>
        <Label>Level</Label>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1, 2, 3].map((l) => (
            <button
              key={l}
              onClick={() => onChange('config.level', l)}
              style={{
                flex: 1, padding: '5px 0', fontSize: 14, fontWeight: 700,
                borderRadius: 'var(--radius-sm)', border: '1px solid ' + ((comp.config?.level ?? 1) === l ? 'var(--accent)' : 'var(--border-primary)'),
                background: (comp.config?.level ?? 1) === l ? 'var(--accent)' : 'var(--bg-secondary)',
                color: (comp.config?.level ?? 1) === l ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              H{l}
            </button>
          ))}
        </div>
      </Row>
      <Row>
        <Toggle checked={comp.hidden ?? false} onChange={(v) => onChange('hidden', v)} label="Hidden by default" />
      </Row>
    </>
  );
}

function ParagraphSettings({ comp, onChange }) {
  return (
    <Row>
      <Label>Content</Label>
      <textarea
        value={comp.config?.content ?? ''}
        onChange={(e) => onChange('config.content', e.target.value)}
        placeholder="Paragraph text"
        rows={4}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
          border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', resize: 'vertical',
          background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
        }}
      />
    </Row>
  );
}

function SeparatorSettings({ comp, onChange }) {
  return (
    <Row>
      <Label>Label (optional)</Label>
      <TextInput value={comp.displayLable ?? ''} onChange={(v) => onChange('displayLable', v)} placeholder="Section divider label" />
    </Row>
  );
}

function TextAreaSettings({ comp, onChange }) {
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Character Limit</SectionHeader>
      <div style={{ display: 'flex', gap: 10 }}>
        <NumInput label="Minimum" value={comp.config?.minLength} onChange={(v) => onChange('config.minLength', v)} placeholder="00" />
        <NumInput label="Maximum" value={comp.config?.maxLength} onChange={(v) => onChange('config.maxLength', v)} placeholder="000" />
      </div>
    </>
  );
}

function FileUploadSettings({ comp, onChange }) {
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Input</SectionHeader>
      <CheckboxGroup
        label="Type of File"
        options={['Document', 'Image', 'Video']}
        values={comp.config?.fileTypes ?? []}
        onChange={(v) => onChange('config.fileTypes', v)}
      />
      <CheckboxGroup
        label="Allowed Format"
        options={['JPG', 'JPEG', 'PNG', 'EPS', 'GIF', 'SVG', 'WebP']}
        values={comp.config?.allowedFormats ?? []}
        onChange={(v) => onChange('config.allowedFormats', v)}
      />
      <Divider />
      <SectionHeader>File Limit</SectionHeader>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <NumInput label="Min files" value={comp.config?.minFiles} onChange={(v) => onChange('config.minFiles', v)} placeholder="00" />
        <NumInput label="Max files" value={comp.config?.maxFiles} onChange={(v) => onChange('config.maxFiles', v)} placeholder="000" />
      </div>
      <SectionHeader>File Size Limit in MB</SectionHeader>
      <div style={{ display: 'flex', gap: 10 }}>
        <NumInput label="Minimum" value={comp.config?.minSizeMB} onChange={(v) => onChange('config.minSizeMB', v)} placeholder="00" />
        <NumInput label="Maximum" value={comp.config?.maxSizeMB} onChange={(v) => onChange('config.maxSizeMB', v)} placeholder="000" />
      </div>
    </>
  );
}

function ImageSettings({ comp, onChange }) {
  return (
    <>
      <Row>
        <Label>Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="Profile Picture" />
      </Row>
      <Row>
        <Label>Description</Label>
        <textarea
          value={comp.config?.helpText ?? ''}
          onChange={(e) => onChange('config.helpText', e.target.value)}
          placeholder="Enter Description"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
            border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', resize: 'vertical',
            background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </Row>
      <Row>
        <Toggle checked={comp.mandatory} onChange={(v) => onChange('mandatory', v)} label="Required" />
      </Row>
      <Divider />
      <SectionHeader>Input</SectionHeader>
      <CheckboxGroup
        label="Allowed Format"
        options={['JPG', 'JPEG', 'PNG', 'EPS', 'GIF', 'SVG', 'WebP']}
        values={comp.config?.allowedFormats ?? []}
        onChange={(v) => onChange('config.allowedFormats', v)}
      />
      <Divider />
      <SectionHeader>File Size Limit in MB</SectionHeader>
      <div style={{ display: 'flex', gap: 10 }}>
        <NumInput label="Minimum" value={comp.config?.minSizeMB} onChange={(v) => onChange('config.minSizeMB', v)} placeholder="00" />
        <NumInput label="Maximum" value={comp.config?.maxSizeMB} onChange={(v) => onChange('config.maxSizeMB', v)} placeholder="000" />
      </div>
    </>
  );
}

function DateSettings({ comp, onChange }) {
  const allowFuture = comp.config?.allowFuture ?? false;
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Input</SectionHeader>
      <Row>
        <Checkbox
          checked={allowFuture}
          onChange={(v) => onChange('config.allowFuture', v)}
          label="Allowed to enter future date"
        />
      </Row>
      {allowFuture && (
        <NumInput label="Days in future allowed" value={comp.config?.futureDays} onChange={(v) => onChange('config.futureDays', v)} placeholder="00" />
      )}
    </>
  );
}

function TimeSettings({ comp, onChange }) {
  const allowFuture = comp.config?.allowFuture ?? false;
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Input</SectionHeader>
      <Row>
        <Checkbox
          checked={allowFuture}
          onChange={(v) => onChange('config.allowFuture', v)}
          label="Allowed to enter future time"
        />
      </Row>
      {allowFuture && (
        <div style={{ display: 'flex', gap: 10 }}>
          <NumInput label="Hours" value={comp.config?.futureHours} onChange={(v) => onChange('config.futureHours', v)} placeholder="00" />
          <NumInput label="Mins"  value={comp.config?.futureMins}  onChange={(v) => onChange('config.futureMins',  v)} placeholder="000" />
        </div>
      )}
    </>
  );
}

function DateTimeSettings({ comp, onChange }) {
  const allowFuture = comp.config?.allowFuture ?? false;
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Input</SectionHeader>
      <Row>
        <Checkbox
          checked={allowFuture}
          onChange={(v) => onChange('config.allowFuture', v)}
          label="Allowed to enter future date and time"
        />
      </Row>
      {allowFuture && (
        <div style={{ display: 'flex', gap: 10 }}>
          <NumInput label="Days"  value={comp.config?.futureDays}  onChange={(v) => onChange('config.futureDays',  v)} placeholder="00" />
          <NumInput label="Hours" value={comp.config?.futureHours} onChange={(v) => onChange('config.futureHours', v)} placeholder="000" />
        </div>
      )}
    </>
  );
}

const MASTER_OPTIONS = [
  { value: 'locations', label: 'Locations' },
  { value: 'assets',    label: 'Assets' },
  { value: 'users',     label: 'Users' },
];

function buildRelMap(relationships) {
  const map = {};
  for (const r of (relationships || [])) {
    if (!map[r.sourceCollection]) map[r.sourceCollection] = [];
    map[r.sourceCollection].push({ target: r.targetCollection, param: r.filterParam, label: r.label });
  }
  return map;
}

const LOCATION_MASTER_OPTIONS = [
  { value: 'locations', label: 'All Locations' },
  { value: 'sites',     label: 'Sites only' },
  { value: 'floors',    label: 'Floors only' },
  { value: 'rooms',     label: 'Rooms only' },
];

const ASSET_MASTER_OPTIONS = [
  { value: 'assets',      label: 'All Assets' },
  { value: 'equipment',   label: 'Equipment only' },
  { value: 'vehicles',    label: 'Vehicles only' },
];

function MasterSourceSelect({ value, options, onChange }) {
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%', padding: '7px 30px 7px 10px', fontSize: 14, borderRadius: 'var(--radius)',
          border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
          color: value ? 'var(--text-primary)' : 'var(--text-muted)',
          outline: 'none', appearance: 'none', cursor: 'pointer',
        }}
      >
        <option value="">Select source</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function LocationSettings({ comp, onChange }) {
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Data Source</SectionHeader>
      <Row>
        <Label>Load locations from</Label>
        <MasterSourceSelect
          value={comp.config?.masterSource ?? 'locations'}
          options={LOCATION_MASTER_OPTIONS}
          onChange={(v) => onChange('config.masterSource', v)}
        />
      </Row>
      <Row>
        <Checkbox
          checked={comp.config?.multiSelect ?? false}
          onChange={(v) => onChange('config.multiSelect', v)}
          label="Allow selecting multiple locations"
        />
      </Row>
    </>
  );
}

function AssetSettings({ comp, onChange }) {
  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Data Source</SectionHeader>
      <Row>
        <Label>Load assets from</Label>
        <MasterSourceSelect
          value={comp.config?.masterSource ?? 'assets'}
          options={ASSET_MASTER_OPTIONS}
          onChange={(v) => onChange('config.masterSource', v)}
        />
      </Row>
      <Row>
        <Checkbox
          checked={comp.config?.multiSelect ?? false}
          onChange={(v) => onChange('config.multiSelect', v)}
          label="Allow selecting multiple assets"
        />
      </Row>
    </>
  );
}

function DropdownSettings({ comp, onChange }) {
  const menuSource  = comp.config?.menuSource ?? 'custom';
  const customVals  = comp.config?.customValues ?? [];
  const [draft, setDraft] = useState('');

  const addValue = () => {
    const v = draft.trim();
    if (!v || customVals.includes(v)) return;
    onChange('config.customValues', [...customVals, v]);
    setDraft('');
  };

  const removeValue = (val) => {
    onChange('config.customValues', customVals.filter((v) => v !== val));
  };

  return (
    <>
      <CommonSettings comp={comp} onChange={onChange} />
      <Divider />
      <SectionHeader>Menu items</SectionHeader>
      <Row>
        <RadioGroup
          value={menuSource}
          onChange={(v) => onChange('config.menuSource', v)}
          options={[
            { value: 'custom',  label: 'Custom values' },
            { value: 'masters', label: 'Come From Masters' },
          ]}
        />
      </Row>
      {menuSource === 'custom' && (
        <>
          <SectionHeader>Custom Values</SectionHeader>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addValue()}
              placeholder="Enter Custom Value"
              style={{
                flex: 1, padding: '7px 10px', fontSize: 14, borderRadius: 'var(--radius)', outline: 'none',
                border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={addValue}
              style={{
                padding: '7px 12px', fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius)', cursor: 'pointer',
                border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)',
                whiteSpace: 'nowrap',
              }}
            >
              + Add
            </button>
          </div>
          {customVals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
              {customVals.map((val) => (
                <div key={val} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)',
                  fontSize: 14, color: 'var(--text-primary)',
                }}>
                  <span>{val}</span>
                  <button onClick={() => removeValue(val)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {menuSource === 'masters' && (
        <>
          <SectionHeader>Select Master</SectionHeader>
          <Row>
            <div style={{ position: 'relative' }}>
              <select
                value={comp.config?.masterSource ?? ''}
                onChange={(e) => onChange('config.masterSource', e.target.value)}
                style={{
                  width: '100%', padding: '7px 30px 7px 10px', fontSize: 14, borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                  color: comp.config?.masterSource ? 'var(--text-primary)' : 'var(--text-muted)',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select Master</option>
                {MASTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Row>
        </>
      )}
      <Divider />
      <Row>
        <Checkbox
          checked={comp.config?.multiSelect ?? false}
          onChange={(v) => onChange('config.multiSelect', v)}
          label="Allowed to select multiple values"
        />
      </Row>
    </>
  );
}

function ButtonSettings({ comp, onChange }) {
  return (
    <>
      <Row>
        <Label>Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="Enter Label" />
      </Row>
    </>
  );
}

function CheckboxGroupSettings({ comp, onChange }) {
  const [draft, setDraft] = useState('');
  const items = comp.config?.checkboxes ?? [];
  const orientation = comp.config?.orientation ?? 'horizontal';

  const addItem = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange('config.checkboxes', [...items, v]);
    setDraft('');
  };

  const removeItem = (val) => onChange('config.checkboxes', items.filter((v) => v !== val));

  return (
    <>
      <Row>
        <Label>Primary Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="Enter Label" />
      </Row>
      <Row>
        <Toggle checked={comp.mandatory} onChange={(v) => onChange('mandatory', v)} label="Required" />
      </Row>
      <Divider />
      <SectionHeader>Checkboxes</SectionHeader>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Enter Checkbox Title"
          style={{
            flex: 1, padding: '7px 10px', fontSize: 14, borderRadius: 'var(--radius)', outline: 'none',
            border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)',
          }}
        />
      </div>
      <button
        onClick={addItem}
        style={{
          width: '100%', padding: '7px 0', fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius)',
          border: '1px dashed var(--border-primary)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        + Add Checkbox
      </button>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
          {items.map((val) => (
            <div key={val} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)',
              fontSize: 14, color: 'var(--text-primary)',
            }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid var(--border-primary)', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{val}</span>
              <button onClick={() => removeItem(val)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <Divider />
      <SectionHeader>Orientation</SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { value: 'horizontal', label: 'Horizontal', desc: 'Checkboxes next to primary label' },
          { value: 'vertical',   label: 'Vertical',   desc: 'Checkboxes below primary label' },
        ].map((opt) => (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
            <div
              onClick={() => onChange('config.orientation', opt.value)}
              style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2, cursor: 'pointer',
                border: `2px solid ${orientation === opt.value ? 'var(--accent)' : 'var(--border-primary)'}`,
                background: orientation === opt.value ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {orientation === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </>
  );
}

function RadioGroupSettings({ comp, onChange }) {
  const [draft, setDraft] = useState('');
  const items = comp.config?.options ?? [];
  const orientation = comp.config?.orientation ?? 'horizontal';

  const addItem = () => {
    const v = draft.trim();
    if (!v || items.includes(v)) return;
    onChange('config.options', [...items, v]);
    setDraft('');
  };

  const removeItem = (val) => onChange('config.options', items.filter((v) => v !== val));

  return (
    <>
      <Row>
        <Label>Primary Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="Enter Label" />
      </Row>
      <Row>
        <Toggle checked={comp.mandatory} onChange={(v) => onChange('mandatory', v)} label="Required" />
      </Row>
      <Divider />
      <SectionHeader>Radio Buttons</SectionHeader>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Enter Radio Button Title"
          style={{
            flex: 1, padding: '7px 10px', fontSize: 14, borderRadius: 'var(--radius)', outline: 'none',
            border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)',
          }}
        />
      </div>
      <button
        onClick={addItem}
        style={{
          width: '100%', padding: '7px 0', fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius)',
          border: '1px dashed var(--border-primary)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        + Add Radio Button
      </button>
      {items.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 14 }}>
          {items.map((val) => (
            <div key={val} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)',
              fontSize: 14, color: 'var(--text-primary)',
            }}>
              <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--border-primary)', flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{val}</span>
              <button onClick={() => removeItem(val)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, lineHeight: 1 }}>×</button>
            </div>
          ))}
        </div>
      )}
      <Divider />
      <SectionHeader>Orientation</SectionHeader>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { value: 'horizontal', label: 'Horizontal', desc: 'Radio buttons next to primary label' },
          { value: 'vertical',   label: 'Vertical',   desc: 'Radio buttons below primary label' },
        ].map((opt) => (
          <label key={opt.value} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer' }}>
            <div
              onClick={() => onChange('config.orientation', opt.value)}
              style={{
                width: 16, height: 16, borderRadius: '50%', flexShrink: 0, marginTop: 2, cursor: 'pointer',
                border: `2px solid ${orientation === opt.value ? 'var(--accent)' : 'var(--border-primary)'}`,
                background: orientation === opt.value ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {orientation === opt.value && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{opt.label}</div>
              <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </>
  );
}

function TocSettings({ comp, onChange }) {
  return (
    <>
      <Row>
        <Label>Primary Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="I have read and agree to the Terms and Conditions" />
      </Row>
      <Row>
        <Label>Terms Content</Label>
        <textarea
          value={comp.config?.content ?? ''}
          onChange={(e) => onChange('config.content', e.target.value)}
          placeholder="Paste your terms and conditions text here…"
          rows={6}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
            border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', resize: 'vertical',
            background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </Row>
      <Row>
        <Toggle checked={comp.mandatory} onChange={(v) => onChange('mandatory', v)} label="Required" />
      </Row>
    </>
  );
}

function SimpleChoiceSettings({ comp, onChange }) {
  return (
    <>
      <Row>
        <Label>Primary Label</Label>
        <TextInput value={comp.displayLable} onChange={(v) => onChange('displayLable', v)} placeholder="Enter Label" />
      </Row>
      <Row>
        <Toggle checked={comp.mandatory} onChange={(v) => onChange('mandatory', v)} label="Required" />
      </Row>
    </>
  );
}

function SubfieldDropdownConfig({ sub, onSubChangeBatch, onSubChange, onRemove, canRemove, prevSubfields, relMap }) {
  const [draft, setDraft] = useState('');
  const menuSource  = sub.menuSource ?? 'custom';
  const customVals  = sub.customValues ?? [];

  const masterParents = (prevSubfields ?? []).filter(
    (s) => s.menuSource === 'masters' && s.masterSource && (relMap[s.masterSource]?.length > 0)
  );

  const parentSub = masterParents.find((s) => s.fieldId === sub.dependsOn);
  const availableRelationships = parentSub
    ? (relMap[parentSub.masterSource] ?? [])
    : [];

  const addVal = () => {
    const v = draft.trim();
    if (!v || customVals.includes(v)) return;
    onSubChange('customValues', [...customVals, v]);
    setDraft('');
  };

  return (
    <div style={{
      border: '1px solid var(--border-primary)', borderRadius: 8,
      padding: '12px 12px 8px', marginBottom: 10, background: 'var(--bg-secondary)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {sub.label || 'Untitled Dropdown'}
        </span>
        {canRemove && (
          <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2 }}>
            <Trash2 size={13} />
          </button>
        )}
      </div>
      <div style={{ marginBottom: 8 }}>
        <Label>Label</Label>
        <TextInput value={sub.label} onChange={(v) => onSubChange('label', v)} placeholder="Enter Label" />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Label>Placeholder</Label>
        <TextInput value={sub.placeholder} onChange={(v) => onSubChange('placeholder', v)} placeholder="Enter Placeholder" />
      </div>
      <div style={{ marginBottom: 8 }}>
        <Label>Menu items</Label>
        <RadioGroup
          value={menuSource}
          onChange={(v) => onSubChange('menuSource', v)}
          options={[
            { value: 'custom',  label: 'Custom values' },
            { value: 'masters', label: 'Come From Masters' },
          ]}
        />
      </div>
      {menuSource === 'custom' && (
        <>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addVal()}
              placeholder="Enter Custom Value"
              style={{
                flex: 1, padding: '6px 9px', fontSize: 14, borderRadius: 'var(--radius-sm)', outline: 'none',
                border: '1px solid var(--border-primary)', background: 'var(--bg-input)', color: 'var(--text-primary)',
              }}
            />
            <button onClick={addVal} style={{
              padding: '6px 10px', fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer',
              border: '1px solid var(--accent)', background: 'transparent', color: 'var(--accent)', whiteSpace: 'nowrap',
            }}>+ Add</button>
          </div>
          {customVals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 6 }}>
              {customVals.map((val) => (
                <div key={val} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '4px 8px', borderRadius: 5, background: 'var(--bg-tertiary)',
                  fontSize: 14, color: 'var(--text-primary)',
                }}>
                  <span>{val}</span>
                  <button onClick={() => onSubChange('customValues', customVals.filter((v) => v !== val))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2, lineHeight: 1 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {menuSource === 'masters' && (
        <>
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <select
              value={sub.masterSource ?? ''}
              onChange={(e) => onSubChangeBatch({ masterSource: e.target.value, dependsOn: null })}
              style={{
                width: '100%', padding: '6px 28px 6px 9px', fontSize: 14, borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                color: sub.masterSource ? 'var(--text-primary)' : 'var(--text-muted)',
                outline: 'none', appearance: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select Master</option>
              {MASTER_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {masterParents.length > 0 && (
            <div style={{ marginBottom: 6 }}>
              <Label>Depends on (optional)</Label>
              <div style={{ position: 'relative' }}>
                <select
                  value={sub.dependsOn ?? ''}
                  onChange={(e) => {
                    const parentId = e.target.value || null;
                    const parent = parentId ? masterParents.find((s) => s.fieldId === parentId) : null;
                    const rels = parent ? (relMap[parent.masterSource] ?? []) : [];
                    onSubChangeBatch({
                      dependsOn:    parentId,
                      masterSource: rels.length === 1 ? rels[0].target : sub.masterSource,
                    });
                  }}
                  style={{
                    width: '100%', padding: '6px 28px 6px 9px', fontSize: 14, borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                    color: sub.dependsOn ? 'var(--text-primary)' : 'var(--text-muted)',
                    outline: 'none', appearance: 'none', cursor: 'pointer',
                  }}
                >
                  <option value="">None (load all)</option>
                  {masterParents.map((s) => (
                    <option key={s.fieldId} value={s.fieldId}>
                      {s.label || 'Untitled'} ({s.masterSource})
                    </option>
                  ))}
                </select>
                <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 12 12" fill="none">
                  <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              {sub.dependsOn && availableRelationships.length > 1 && (
                <div style={{ marginTop: 6 }}>
                  <Label>Fetch as</Label>
                  <div style={{ position: 'relative' }}>
                    <select
                      value={sub.masterSource ?? ''}
                      onChange={(e) => onSubChange('masterSource', e.target.value)}
                      style={{
                        width: '100%', padding: '6px 28px 6px 9px', fontSize: 14, borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                        color: sub.masterSource ? 'var(--text-primary)' : 'var(--text-muted)',
                        outline: 'none', appearance: 'none', cursor: 'pointer',
                      }}
                    >
                      <option value="">Select relationship</option>
                      {availableRelationships.map((r) => (
                        <option key={r.target + r.param} value={r.target}>{r.label}</option>
                      ))}
                    </select>
                    <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 12 12" fill="none">
                      <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
              {sub.dependsOn && availableRelationships.length === 1 && (
                <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 4 }}>
                  Will fetch: {availableRelationships[0].label}
                </div>
              )}
            </div>
          )}
        </>
      )}
      <Checkbox
        checked={sub.multiSelect ?? false}
        onChange={(v) => onSubChange('multiSelect', v)}
        label="Allowed to select multiple values"
      />
    </div>
  );
}

function ConditionalSettings({ comp, onChange, relMap }) {
  const subfields = comp.config?.fields ?? [];

  const updateSub = (idx, key, value) => {
    const next = subfields.map((s, i) => i === idx ? { ...s, [key]: value } : s);
    onChange('config.fields', next);
  };

  const updateSubBatch = (idx, patch) => {
    const next = subfields.map((s, i) => i === idx ? { ...s, ...patch } : s);
    onChange('config.fields', next);
  };

  const addSub = () => {
    onChange('config.fields', [...subfields, DEFAULT_CONDITIONAL_SUBFIELD()]);
  };

  const removeSub = (idx) => {
    onChange('config.fields', subfields.filter((_, i) => i !== idx));
  };

  return (
    <>
      <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 12 }}>
        Each dropdown depends on the selection above it. Configure each in order.
      </div>
      {subfields.map((sub, idx) => (
        <SubfieldDropdownConfig
          key={sub.fieldId}
          sub={sub}
          onSubChange={(key, val) => updateSub(idx, key, val)}
          onSubChangeBatch={(patch) => updateSubBatch(idx, patch)}
          onRemove={() => removeSub(idx)}
          canRemove={subfields.length > 1}
          prevSubfields={subfields.slice(0, idx)}
          relMap={relMap || {}}
        />
      ))}
      {subfields.length === 0 && (
        <div style={{ fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: 10 }}>
          No dropdowns yet. Add one below.
        </div>
      )}
      <button
        onClick={addSub}
        style={{
          width: '100%', padding: '7px 0', fontSize: 14, fontWeight: 600, borderRadius: 'var(--radius)',
          border: '1px dashed var(--border-primary)', background: 'transparent',
          color: 'var(--text-secondary)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
        }}
      >
        + Add Dropdown
      </button>
    </>
  );
}

const TABLE_INPUT_TYPES = [
  { value: 'text',     label: 'Text' },
  { value: 'number',   label: 'Number' },
  { value: 'date',     label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
];

function TableColumnFieldSettings({ col, onColChange, onBack }) {
  return (
    <>
      <button
        onClick={onBack}
        style={{
          display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
          cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 600,
          padding: '0 0 12px 0',
        }}
      >
        <ChevronLeft size={14} /> Back to Table Settings
      </button>
      <Row>
        <Label>Label</Label>
        <TextInput value={col.label ?? ''} onChange={(v) => onColChange('label', v)} placeholder="Enter Label" />
      </Row>
      <Row>
        <Label>Placeholder</Label>
        <TextInput value={col.placeholder ?? ''} onChange={(v) => onColChange('placeholder', v)} placeholder="Enter Placeholder" />
      </Row>
      <Row>
        <Toggle checked={col.mandatory ?? false} onChange={(v) => onColChange('mandatory', v)} label="Required" />
      </Row>
      <Divider />
      <SectionHeader>Character Limit</SectionHeader>
      <div style={{ display: 'flex', gap: 10 }}>
        <NumInput label="Minimum" value={col.minLength} onChange={(v) => onColChange('minLength', v)} placeholder="00" />
        <NumInput label="Maximum" value={col.maxLength} onChange={(v) => onColChange('maxLength', v)} placeholder="000" />
      </div>
    </>
  );
}

function TableSettings({ comp, onChange }) {
  const [editingColIdx, setEditingColIdx] = useState(null);
  const config   = comp.config ?? {};
  const cols     = config.columns ?? [];
  const rows     = config.rows ?? 1;
  const dupRow   = config.duplicateRow ?? false;
  const btnTitle = config.buttonTitle ?? '';

  const updateCol = (idx, key, val) => {
    const next = cols.map((c, i) => i === idx ? { ...c, [key]: val } : c);
    onChange('config.columns', next);
  };

  if (editingColIdx !== null && cols[editingColIdx]) {
    return (
      <TableColumnFieldSettings
        col={cols[editingColIdx]}
        onColChange={(key, val) => updateCol(editingColIdx, key, val)}
        onBack={() => setEditingColIdx(null)}
      />
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <Label>Columns</Label>
          <input
            type="number" min={1} max={10}
            value={cols.length || 1}
            onChange={(e) => {
              const n = Math.max(1, Math.min(10, Number(e.target.value)));
              const next = Array.from({ length: n }, (_, i) => cols[i] ?? {
                id: `col_${i}`, header: '', inputType: 'text', label: '', placeholder: '', mandatory: false, inputMode: 'manual',
              });
              onChange('config.columns', next);
            }}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
              background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <Label>Rows</Label>
          <input
            type="number" min={1}
            value={rows}
            onChange={(e) => onChange('config.rows', Math.max(1, Number(e.target.value)))}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
              background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
            }}
          />
        </div>
      </div>
      <Row>
        <Checkbox
          checked={dupRow}
          onChange={(v) => onChange('config.duplicateRow', v)}
          label="Button to duplicate row"
        />
      </Row>
      {dupRow && (
        <Row>
          <Label>Button Title</Label>
          <TextInput value={btnTitle} onChange={(v) => onChange('config.buttonTitle', v)} placeholder="Button Title" />
        </Row>
      )}
      <Divider />
      {cols.map((col, idx) => (
        <div key={col.id ?? idx} style={{ marginBottom: 12 }}>
          <SectionHeader>Column {idx + 1}</SectionHeader>
          <Row>
            <Label>Column Header</Label>
            <TextInput value={col.header ?? ''} onChange={(v) => updateCol(idx, 'header', v)} placeholder="Enter Header" />
          </Row>
          <Row>
            <Label>Input Type</Label>
            <div style={{ position: 'relative' }}>
              <select
                value={col.inputType ?? ''}
                onChange={(e) => updateCol(idx, 'inputType', e.target.value)}
                style={{
                  width: '100%', padding: '7px 28px 7px 10px', fontSize: 14, borderRadius: 'var(--radius)',
                  border: '1px solid var(--border-primary)', background: 'var(--bg-input)',
                  color: col.inputType ? 'var(--text-primary)' : 'var(--text-muted)',
                  outline: 'none', appearance: 'none', cursor: 'pointer',
                }}
              >
                <option value="">Select Type</option>
                {TABLE_INPUT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <svg style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Row>
          <button
            onClick={() => setEditingColIdx(idx)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '8px 12px', borderRadius: 'var(--radius)', border: '1px solid var(--border-primary)',
              background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 14,
              color: 'var(--text-secondary)', fontWeight: 500,
            }}
          >
            <span>View Input Settings</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 3l4 4-4 4" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      ))}
    </>
  );
}

function SETTINGS_MAP(comp, onChange, relMap) {
  switch (comp.type) {
    case 'text':           return <TextSettings          comp={comp} onChange={onChange} />;
    case 'textarea':       return <TextAreaSettings      comp={comp} onChange={onChange} />;
    case 'number':         return <NumberSettings        comp={comp} onChange={onChange} />;
    case 'file':           return <FileUploadSettings    comp={comp} onChange={onChange} />;
    case 'image':          return <ImageSettings         comp={comp} onChange={onChange} />;
    case 'date':           return <DateSettings          comp={comp} onChange={onChange} />;
    case 'time':           return <TimeSettings          comp={comp} onChange={onChange} />;
    case 'datetime':       return <DateTimeSettings      comp={comp} onChange={onChange} />;
    case 'dropdown':       return <DropdownSettings      comp={comp} onChange={onChange} />;
    case 'location':       return <LocationSettings      comp={comp} onChange={onChange} />;
    case 'asset':          return <AssetSettings         comp={comp} onChange={onChange} />;
    case 'checkbox':
    case 'radio':
    case 'toggle':         return <SimpleChoiceSettings  comp={comp} onChange={onChange} />;
    case 'checkbox_group': return <CheckboxGroupSettings comp={comp} onChange={onChange} />;
    case 'radio_group':    return <RadioGroupSettings    comp={comp} onChange={onChange} />;
    case 'toc':            return <TocSettings           comp={comp} onChange={onChange} />;
    case 'conditional':    return <ConditionalSettings   comp={comp} onChange={onChange} relMap={relMap || {}} />;
    case 'table':          return <TableSettings         comp={comp} onChange={onChange} />;
    case 'button':         return <ButtonSettings        comp={comp} onChange={onChange} />;
    case 'heading':        return <HeadingSettings       comp={comp} onChange={onChange} />;
    case 'paragraph':      return <ParagraphSettings     comp={comp} onChange={onChange} />;
    case 'separator':      return <SeparatorSettings     comp={comp} onChange={onChange} />;
    default:               return <CommonSettings        comp={comp} onChange={onChange} />;
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', gap: 10 }}>
      <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
        <circle cx="36" cy="34" r="24" fill="var(--bg-tertiary)" />
        <circle cx="36" cy="34" r="14" fill="var(--bg-secondary)" />
        <circle cx="36" cy="34" r="6"  fill="var(--border-primary)" />
        <line x1="14" y1="14" x2="8"  y2="8"  stroke="var(--border-primary)" strokeWidth="2" strokeLinecap="round" />
        <line x1="58" y1="14" x2="64" y2="8"  stroke="var(--border-primary)" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="58" x2="36" y2="64" stroke="var(--border-primary)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="52" cy="52" r="10" fill="var(--bg-tertiary)" stroke="var(--border-primary)" strokeWidth="1.5" />
        <line x1="49" y1="55" x2="55" y2="49" stroke="var(--border-primary)" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="55" y1="55" x2="49" y2="49" stroke="var(--border-primary)" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Select a field</div>
      <div style={{ fontSize: 14, color: 'var(--text-tertiary)', textAlign: 'center' }}>Select any field to change its settings</div>
    </div>
  );
}

function SubmitSettings({ submitLabel, successMessage, onSettingsChange }) {
  return (
    <>
      <Row>
        <Label>Button Label</Label>
        <TextInput
          value={submitLabel ?? ''}
          onChange={(v) => onSettingsChange('submitLabel', v)}
          placeholder="Submit"
        />
      </Row>
      <Row>
        <Label>Success Message</Label>
        <textarea
          value={successMessage ?? ''}
          onChange={(e) => onSettingsChange('successMessage', e.target.value)}
          placeholder="Form submitted successfully"
          rows={3}
          style={{
            width: '100%', boxSizing: 'border-box', padding: '7px 10px', fontSize: 14,
            border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)', resize: 'vertical',
            background: 'var(--bg-input)', color: 'var(--text-primary)', outline: 'none',
          }}
        />
      </Row>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function FieldSettings({
  steps, activeStepIdx, selectedCompId, selectedSubmit,
  allStepsOnSinglePage, onToggleAllSteps,
  submitLabel, successMessage, onSettingsChange,
  onComponentChange, onDeleteComponent,
  relationships,
}) {
  const relMap = useMemo(() => buildRelMap(relationships), [relationships]);
  const step = steps[activeStepIdx];

  // Find selected component in the active step
  const comp = selectedCompId
    ? (step?.stepComponents ?? []).find((c) => c.displayFiledName === selectedCompId) ?? null
    : null;

  // Field change handler with dot-notation config support
  const handleChange = (path, value) => {
    if (!comp) return;
    if (path.startsWith('config.')) {
      const key = path.slice(7);
      onComponentChange(activeStepIdx, comp.displayFiledName, 'config', { ...(comp.config || {}), [key]: value });
    } else {
      onComponentChange(activeStepIdx, comp.displayFiledName, path, value);
    }
  };

  const showingComp   = !!comp;
  const showingSubmit = !comp && !!selectedSubmit;

  const panelTitle = showingComp
    ? (comp.type === 'button' ? 'Button Settings' : comp.type === 'table' ? 'Table Settings' : 'Field Settings')
    : showingSubmit
    ? 'Submit Button'
    : 'Field Settings';

  return (
    <div style={{
      width: 320, flexShrink: 0, borderLeft: '1px solid var(--border-primary)',
      background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Steps Settings */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-primary)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 10 }}>Steps Settings</div>
        <Row>
          <Toggle
            checked={allStepsOnSinglePage}
            onChange={onToggleAllSteps}
            label="All steps on single page"
          />
        </Row>
      </div>

      {/* Panel header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 16px', borderBottom: '1px solid var(--border-primary)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)' }}>{panelTitle}</div>
        {showingComp && !comp.systemField && (
          <button
            onClick={() => onDeleteComponent(activeStepIdx, comp.displayFiledName)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', fontSize: 13, fontWeight: 600, borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: '1px solid #fca5a5', background: '#fef2f2', color: '#ef4444' }}
          >
            <Trash2 size={12} /> Delete
          </button>
        )}
        {showingComp && comp.systemField && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            System Field
          </span>
        )}
        {showingSubmit && (
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-muted)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)', border: '1px solid var(--border-primary)' }}>
            System Field
          </span>
        )}
      </div>

      {/* Settings body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {showingComp
          ? SETTINGS_MAP(comp, handleChange, relMap)
          : showingSubmit
          ? <SubmitSettings submitLabel={submitLabel} successMessage={successMessage} onSettingsChange={onSettingsChange} />
          : <EmptyState />
        }
      </div>
    </div>
  );
}
