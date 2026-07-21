'use client';
import { useState, useRef, useCallback } from 'react';
import { Plus, Trash2, GripVertical, Calendar, Clock, CalendarClock, Paperclip, MapPin, Package } from 'lucide-react';
import { FIELD_TYPES } from './constants';

function fieldLabel(type) {
  return FIELD_TYPES.find((f) => f.type === type)?.label ?? type;
}

const TEXT_INPUT_TYPES = new Set(['text', 'number', 'textarea']);
const DATE_TIME_META = {
  date:     { placeholder: 'DD MMM YYYY',          Icon: Calendar },
  time:     { placeholder: 'HH:MM AM',              Icon: Clock },
  datetime: { placeholder: 'DD MMM YYYY, HH:MM AM', Icon: CalendarClock },
};

function ChevronDown({ size = 14, style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={style}>
      <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Field preview renderers ──────────────────────────────────────────────────

function FieldPreview({ comp }) {
  const label = comp.displayLable || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Untitled {fieldLabel(comp.type)}</span>;
  const required = comp.mandatory;
  const type = comp.type;

  if (type === 'separator') {
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
          {comp.displayLable && (
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {comp.displayLable}
            </span>
          )}
          <div style={{ flex: 1, height: 1, background: 'var(--border-primary)' }} />
        </div>
      </div>
    );
  }

  if (TEXT_INPUT_TYPES.has(type)) {
    const isTextarea = type === 'textarea';
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: isTextarea ? 'flex-start' : 'center', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0, paddingTop: isTextarea ? 6 : 0 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{
          flex: 1, height: isTextarea ? 64 : 32, borderRadius: 6, border: '1px solid var(--border-primary)',
          background: 'var(--bg-secondary)', display: 'flex', alignItems: 'flex-start',
          padding: '8px 10px', minWidth: 0,
        }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {comp.config?.placeholder || 'Placeholder'}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'location') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, minWidth: 0 }}>
          <MapPin size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select location…</span>
        </div>
      </div>
    );
  }

  if (type === 'asset') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, minWidth: 0 }}>
          <Package size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Select asset…</span>
        </div>
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
          </div>
          {comp.config?.helpText
            ? <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 2 }}>{comp.config.helpText}</div>
            : <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2, fontStyle: 'italic' }}>Description goes here...</div>
          }
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: 8, flexShrink: 0,
          border: '1.5px dashed var(--border-primary)', background: 'var(--bg-secondary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: 20, color: 'var(--text-muted)', lineHeight: 1 }}>+</span>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    const cols     = comp.config?.columns ?? [];
    const rows     = comp.config?.rows ?? 1;
    const dupRow   = comp.config?.duplicateRow ?? false;
    const btnTitle = comp.config?.buttonTitle || 'Button Title';
    const colCount = cols.length || 3;
    return (
      <div style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <div style={{ border: '1px solid var(--border-primary)', borderRadius: 8, overflow: 'hidden', minWidth: colCount * 120 }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-primary)' }}>
            {Array.from({ length: colCount }, (_, i) => (
              <div key={i} style={{
                padding: '6px 10px', fontSize: 12.5, fontWeight: 600, color: 'var(--text-secondary)',
                borderRight: i < colCount - 1 ? '1px solid var(--border-primary)' : 'none',
              }}>
                {cols[i]?.header || `Column ${i + 1} Header`}
              </div>
            ))}
          </div>
          {Array.from({ length: rows }, (_, r) => (
            <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, borderBottom: r < rows - 1 ? '1px solid var(--border-primary)' : 'none' }}>
              {Array.from({ length: colCount }, (_, i) => (
                <div key={i} style={{ padding: '6px 10px', borderRight: i < colCount - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                  {cols[i]?.inputType === 'checkbox' ? (
                    <div style={{ width: 14, height: 14, borderRadius: 3, border: '1.5px solid var(--border-primary)', background: 'var(--bg-secondary)' }} />
                  ) : (
                    <div style={{ height: 24, borderRadius: 4, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 6px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{cols[i]?.placeholder || `Input ${i + 1}`}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
        {dupRow && (
          <div style={{ marginTop: 8 }}>
            <button style={{ padding: '6px 14px', fontSize: 14, fontWeight: 600, borderRadius: 6, border: '1.5px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'default' }}>
              {btnTitle}
            </button>
          </div>
        )}
      </div>
    );
  }

  if (type === 'conditional') {
    const subfields = comp.config?.fields ?? [];
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        {subfields.length === 0 ? (
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>No dropdowns configured yet</span>
        ) : subfields.map((sub, idx) => (
          <div key={sub.fieldId} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: idx < subfields.length - 1 ? 6 : 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {sub.label || <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Untitled</span>}
            </div>
            <div style={{ flex: 1, height: 30, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 10px', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{sub.placeholder || 'Select...'}</span>
              <ChevronDown size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'toc') {
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>Terms and Conditions</div>
        <div style={{ width: '100%', minHeight: 60, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', padding: '8px 10px', marginBottom: 8, fontSize: 14, color: 'var(--text-muted)', fontStyle: 'italic' }}>
          {comp.config?.content || 'Paste terms and conditions here...'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 13, height: 13, borderRadius: 3, border: '1.5px solid var(--border-primary)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {comp.displayLable || 'I have read and agree to the Terms and Conditions'}
            {required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
          </span>
        </div>
      </div>
    );
  }

  if (type === 'radio_group') {
    const items = comp.config?.options ?? [];
    const isHorizontal = (comp.config?.orientation ?? 'horizontal') === 'horizontal';
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', flexWrap: 'wrap', gap: isHorizontal ? '6px 14px' : 5 }}>
          {items.length === 0
            ? <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>No options added yet</span>
            : items.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 13, height: 13, borderRadius: '50%', border: '1.5px solid var(--border-primary)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  if (type === 'checkbox_group') {
    const items = comp.config?.checkboxes ?? [];
    const isHorizontal = (comp.config?.orientation ?? 'horizontal') === 'horizontal';
    return (
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: isHorizontal ? 'row' : 'column', flexWrap: 'wrap', gap: isHorizontal ? '6px 14px' : 5 }}>
          {items.length === 0
            ? <span style={{ fontSize: 12.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>No checkboxes added yet</span>
            : items.map((item) => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 13, height: 13, borderRadius: 3, border: '1.5px solid var(--border-primary)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))
          }
        </div>
      </div>
    );
  }

  if (type === 'checkbox') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: '2px solid var(--border-primary)', background: 'var(--bg-secondary)' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
      </div>
    );
  }

  if (type === 'radio') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: '2px solid var(--border-primary)', background: 'var(--bg-secondary)' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
      </div>
    );
  }

  if (type === 'toggle') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <div style={{ width: 32, height: 18, borderRadius: 9, flexShrink: 0, background: 'var(--border-primary)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 2, left: 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
      </div>
    );
  }

  if (type === 'dropdown') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 10px', justifyContent: 'space-between', minWidth: 0 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{comp.config?.placeholder || 'Placeholder'}</span>
          <ChevronDown size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    );
  }

  if (type === 'file') {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 6, minWidth: 0 }}>
          <Paperclip size={13} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>Choose from computer</span>
        </div>
      </div>
    );
  }

  if (DATE_TIME_META[type]) {
    const { placeholder: fmt, Icon } = DATE_TIME_META[type];
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
        </div>
        <div style={{ flex: 1, height: 32, borderRadius: 6, border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', padding: '0 10px', justifyContent: 'space-between', minWidth: 0 }}>
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{fmt}</span>
          <Icon size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {label}{required && <span style={{ color: '#ef4444', marginLeft: 2 }}>*</span>}
      </div>
      <div style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginTop: 1 }}>{fieldLabel(type)}</div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
      <rect x="3" y="6" width="8" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5 6V4.5a2 2 0 0 1 4 0V6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function IconBtn({ children, onClick, disabled, danger, title }) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 26, height: 26, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-primary)',
        background: 'var(--bg-secondary)', cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: disabled ? 'var(--text-muted)' : danger ? '#ef4444' : 'var(--text-secondary)',
        opacity: disabled ? 0.4 : 1, transition: 'background 0.1s',
      }}
    >
      {children}
    </button>
  );
}

// ─── Component card ───────────────────────────────────────────────────────────

function ComponentCard({ comp, isSelected, onSelect, onDelete, onDragStart, onDragOver, onDrop, onDragEnd, isDragOver }) {
  const isSystem = !!comp.systemField;
  const isButton = comp.type === 'button';

  const borderColor = isDragOver || isSelected ? 'var(--accent)' : 'var(--border-primary)';
  const sharedStyle = {
    borderTop:    `1.5px solid ${borderColor}`,
    borderRight:  `1.5px solid ${borderColor}`,
    borderBottom: `1.5px solid ${borderColor}`,
    borderLeft:   isSelected ? '3px solid var(--accent)' : `1.5px solid ${isDragOver ? 'var(--accent)' : 'var(--border-primary)'}`,
    borderRadius: 'var(--radius-lg)',
    padding:      isSelected ? '10px 14px 10px 12px' : '10px 14px',
    marginBottom: 8,
    background:   isSelected ? 'var(--accent-tint)' : 'var(--bg-card)',
    cursor:       'grab',
    transition:   'border-color 0.15s, background 0.15s, opacity 0.15s, box-shadow 0.15s',
    display:      'flex',
    alignItems:   'center',
    gap:          10,
    opacity:      isDragOver ? 0.5 : 1,
    boxShadow:    isSelected ? '0 0 0 2px rgba(59,130,246,0.2), var(--shadow-card)' : 'var(--shadow-card)',
  };

  if (isButton) {
    return (
      <div
        draggable={!isSystem}
        onDragStart={!isSystem ? onDragStart : undefined}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onDragEnd={!isSystem ? onDragEnd : undefined}
        style={{ marginBottom: 8, opacity: isDragOver ? 0.5 : 1 }}
      >
        <div onClick={() => onSelect(comp.displayFiledName)} style={sharedStyle}>
          {isSystem ? <LockIcon /> : <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />}
          <button style={{ flex: 1, padding: '8px 0', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em', borderRadius: 'var(--radius)', border: '1.5px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'default', pointerEvents: 'none', textTransform: 'uppercase' }}>
            {comp.displayLable || 'BUTTON'}
          </button>
          {!isSystem && (
            <div onClick={(e) => e.stopPropagation()}>
              <IconBtn title="Delete" onClick={onDelete} danger><Trash2 size={13} /></IconBtn>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={!isSystem}
      onDragStart={!isSystem ? onDragStart : undefined}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={!isSystem ? onDragEnd : undefined}
      onClick={() => onSelect(comp.displayFiledName)}
      style={{ ...sharedStyle, cursor: isSystem ? 'pointer' : 'grab' }}
    >
      {isSystem
        ? <LockIcon />
        : <GripVertical size={14} style={{ color: 'var(--text-muted)', flexShrink: 0, cursor: 'grab' }} />
      }
      <FieldPreview comp={comp} />
      {isSystem ? (
        <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          System
        </span>
      ) : (
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          <IconBtn title="Delete" onClick={onDelete} danger><Trash2 size={13} /></IconBtn>
        </div>
      )}
    </div>
  );
}

// ─── Main StepCanvas ──────────────────────────────────────────────────────────

export default function StepCanvas({
  steps, activeStepIdx, selectedCompId, selectedSubmit,
  onSelectStep, onAddStep, onStepTitleChange, onStepDescChange,
  onSelectComponent, onReorderComponent, onMoveComponent, onDeleteComponent,
  onDeleteStep, onSelectSubmit,
}) {
  const step = steps[activeStepIdx];

  const dragSrc = useRef(null); // { stepIdx, compId }
  const [dragOverId,     setDragOverId]     = useState(null);
  const [dragOverTab,    setDragOverTab]    = useState(null);
  const [confirmingIdx,  setConfirmingIdx]  = useState(null); // step awaiting delete confirm

  const handleDragStart = useCallback((stepIdx, compId) => {
    dragSrc.current = { stepIdx, compId };
  }, []);

  const handleDragOver = useCallback((id) => {
    setDragOverId(id);
  }, []);

  const handleDrop = useCallback((dstStepIdx, dstCompId) => {
    const src = dragSrc.current;
    setDragOverId(null);
    if (!src) return;
    if (src.stepIdx !== dstStepIdx) {
      onMoveComponent(src.stepIdx, src.compId, dstStepIdx, dstCompId ?? null);
    } else if (dstCompId && src.compId !== dstCompId) {
      onReorderComponent(src.stepIdx, src.compId, dstCompId);
    }
  }, [onReorderComponent, onMoveComponent]);

  const handleTabDrop = useCallback((dstStepIdx) => {
    const src = dragSrc.current;
    setDragOverId(null);
    setDragOverTab(null);
    if (!src || src.stepIdx === dstStepIdx) return;
    onMoveComponent(src.stepIdx, src.compId, dstStepIdx);
    onSelectStep(dstStepIdx);
  }, [onMoveComponent, onSelectStep]);

  const handleDragEnd = useCallback(() => {
    setTimeout(() => {
      dragSrc.current = null;
      setDragOverId(null);
      setDragOverTab(null);
    }, 50);
  }, []);

  const handleTabDragEnter = useCallback((i) => {
    if (!dragSrc.current) return;
    setDragOverTab(i);
  }, []);

  const handleTabDragLeave = useCallback((e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverTab(null);
  }, []);

  if (!step) return null;

  const components = step.stepComponents ?? [];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      {/* Step tabs */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '12px 20px', borderBottom: '1px solid var(--border-primary)',
        background: 'var(--bg-card)', flexWrap: 'wrap',
      }}>
        {steps.map((s, i) => {
          const isActive    = activeStepIdx === i;
          const isDragOver  = dragOverTab === i;
          const canDelete   = i > 0 && onDeleteStep;
          const confirming  = confirmingIdx === i;

          if (confirming) {
            return (
              <div key={s.stepId} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 7, fontSize: 14, fontWeight: 600,
                border: '1.5px solid #ef4444',
                background: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
              }}>
                <span style={{ fontSize: 14, color: '#ef4444', whiteSpace: 'nowrap' }}>Delete?</span>
                <button
                  onClick={() => { setConfirmingIdx(null); onDeleteStep(i); }}
                  style={{ padding: '2px 8px', borderRadius: 5, border: 'none', background: '#ef4444', color: '#fff', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}
                >
                  Yes
                </button>
                <button
                  onClick={() => setConfirmingIdx(null)}
                  style={{ padding: '2px 8px', borderRadius: 5, border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', fontSize: 12.5, fontWeight: 600, cursor: 'pointer' }}
                >
                  No
                </button>
              </div>
            );
          }

          return (
            <div
              key={s.stepId}
              style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
            >
              <button
                onClick={() => onSelectStep(i)}
                onDragEnter={() => handleTabDragEnter(i)}
                onDragLeave={handleTabDragLeave}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); handleTabDrop(i); }}
                style={{
                  padding: canDelete ? '5px 28px 5px 14px' : '5px 14px',
                  borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600,
                  border: '1.5px solid ' + (isDragOver ? '#f59e0b' : isActive ? 'var(--accent)' : 'var(--border-primary)'),
                  background: isDragOver ? 'rgba(245,158,11,0.12)' : isActive ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: isDragOver ? '#f59e0b' : isActive ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {s.stepName || `Step ${i + 1}`}
              </button>
              {canDelete && (
                <span
                  title="Remove step"
                  onClick={(e) => { e.stopPropagation(); setConfirmingIdx(i); }}
                  style={{
                    position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)',
                    width: 16, height: 16, borderRadius: 4,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    color: isActive ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)',
                    fontSize: 14, lineHeight: 1,
                    transition: 'color 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = isActive ? '#fff' : '#ef4444'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = isActive ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)'; }}
                >
                  ×
                </span>
              )}
            </div>
          );
        })}
        <button
          onClick={onAddStep}
          style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '5px 12px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600,
            border: '1.5px dashed var(--border-primary)', background: 'none',
            color: 'var(--text-secondary)', cursor: 'pointer',
          }}
        >
          <Plus size={13} /> Add New Step
        </button>
      </div>

      {/* Canvas body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {/* Step title + description */}
        <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', background: 'var(--bg-card)', padding: '14px 16px', marginBottom: 20, boxShadow: 'var(--shadow-card)' }}>
          <input
            value={step.stepName ?? ''}
            onChange={(e) => onStepTitleChange(activeStepIdx, e.target.value)}
            placeholder="Enter Step Title"
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14.5, fontWeight: 600, color: 'var(--heading-color)', background: 'transparent', marginBottom: 6 }}
          />
          <input
            value={step.stepDescription ?? ''}
            onChange={(e) => onStepDescChange(activeStepIdx, e.target.value)}
            placeholder="Enter step description"
            style={{ width: '100%', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-secondary)', background: 'transparent' }}
          />
        </div>

        {/* Flat stepComponents list */}
        {components.length === 0 && (
          <div
            onDragOver={(e) => { e.preventDefault(); handleDragOver('__empty__'); }}
            onDrop={(e) => { e.preventDefault(); handleDrop(activeStepIdx, null); }}
            style={{
              border: `2px dashed ${dragOverId === '__empty__' ? 'var(--accent)' : 'var(--border-primary)'}`,
              borderRadius: 'var(--radius)', padding: '28px 16px', textAlign: 'center',
              color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 8,
              transition: 'border-color 0.15s',
            }}
          >
            Click a field from the left panel to add it here
          </div>
        )}

        {components.map((comp) => (
          <ComponentCard
            key={comp.displayFiledName}
            comp={comp}
            isSelected={selectedCompId === comp.displayFiledName}
            isDragOver={dragOverId === comp.displayFiledName}
            onSelect={onSelectComponent}
            onDelete={() => onDeleteComponent(activeStepIdx, comp.displayFiledName)}
            onDragStart={() => handleDragStart(activeStepIdx, comp.displayFiledName)}
            onDragOver={(e) => { e.preventDefault(); handleDragOver(comp.displayFiledName); }}
            onDrop={(e) => { e.preventDefault(); handleDrop(activeStepIdx, comp.displayFiledName); }}
            onDragEnd={handleDragEnd}
          />
        ))}

        {/* Submit button card */}
        <div
          onClick={onSelectSubmit}
          style={{
            marginTop: 16,
            borderTop:    `1.5px solid ${selectedSubmit ? 'var(--accent)' : 'var(--border-primary)'}`,
            borderRight:  `1.5px solid ${selectedSubmit ? 'var(--accent)' : 'var(--border-primary)'}`,
            borderBottom: `1.5px solid ${selectedSubmit ? 'var(--accent)' : 'var(--border-primary)'}`,
            borderLeft:   `1.5px solid ${selectedSubmit ? 'var(--accent)' : 'var(--border-primary)'}`,
            borderRadius: 'var(--radius-lg)', padding: '12px 16px', boxShadow: 'var(--shadow-card)',
            background: selectedSubmit ? 'var(--row-selected)' : 'var(--bg-card)',
            cursor: 'pointer', transition: 'border-color 0.15s, background 0.15s',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          <LockIcon />
          <button style={{
            flex: 1, padding: '9px 0', fontSize: 14, fontWeight: 700, letterSpacing: '0.04em',
            borderRadius: 'var(--radius)', border: '1.5px solid var(--border-primary)',
            background: 'var(--accent)', color: '#fff',
            cursor: 'default', pointerEvents: 'none',
          }}>
            SUBMIT
          </button>
          <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', flexShrink: 0, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            System
          </span>
        </div>
      </div>
    </div>
  );
}
