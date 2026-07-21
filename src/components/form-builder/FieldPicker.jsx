'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { FIELD_TYPES } from './constants';

const TABS = [
  { key: 'fields', label: 'Fields' },
  { key: 'group',  label: 'Field Group' },
];

export default function FieldPicker({ onAdd }) {
  const [tab, setTab]       = useState('fields');
  const [search, setSearch] = useState('');

  const filtered = FIELD_TYPES.filter(
    (f) => f.group === tab && f.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{
      width: 240, flexShrink: 0, borderRight: '1px solid var(--border-primary)',
      background: 'var(--bg-card)', display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 16px 12px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--heading-color)', marginBottom: 2 }}>Add Field</div>
        <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 12 }}>
          Click the field below to add it to the form.
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: '7px 10px 7px 28px', fontSize: 14,
              border: '1px solid var(--border-primary)', borderRadius: 'var(--radius)',
              background: 'var(--bg-input)', color: 'var(--text-primary)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-primary)', padding: '0 16px' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSearch(''); }}
            style={{
              flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none',
              borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent',
              color: tab === t.key ? 'var(--accent)' : 'var(--text-secondary)',
              marginBottom: -1, transition: 'color 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Field list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {filtered.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 14, color: 'var(--text-tertiary)' }}>
            No fields match "{search}"
          </div>
        )}
        {filtered.map((f) => {
          const Icon = f.icon;
          return (
            <button
              key={f.type}
              onClick={() => onAdd(f.type)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px', background: 'none', border: 'none',
                cursor: 'pointer', textAlign: 'left', fontSize: 14,
                color: 'var(--text-primary)', transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
            >
              <Icon size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
