import {
  STATUS_LABEL, STATUS_PILL, TYPE_LABEL, TYPE_PILL, PRIORITY_LABEL, PRIORITY_DOT,
} from '@/config/constants';

export const statusLabel = (s) => STATUS_LABEL[s] || s || '—';
export const statusPill = (s) => STATUS_PILL[s] || 'gray';
export const typeLabel = (t) => TYPE_LABEL[t] || t || '—';
export const typePill = (t) => TYPE_PILL[t] || 'gray';
export const priorityLabel = (p) => PRIORITY_LABEL[p] || p || '—';
export const priorityDot = (p) => PRIORITY_DOT[p] || PRIORITY_DOT.LOW;

const LOG_MAP = {
  CREATED:         { label: 'Scheduled',       icon: 'calendar', kind: 'blue' },
  SCHEDULED:       { label: 'Scheduled',       icon: 'calendar', kind: 'blue' },
  ASSIGNED:        { label: 'Assigned',        icon: 'user',     kind: 'gray' },
  VENDOR_ASSIGNED: { label: 'Vendor assigned', icon: 'truck',    kind: 'gray' },
  STARTED:         { label: 'Started',         icon: 'play',     kind: 'amber' },
  HOLD:            { label: 'Put on hold',     icon: 'pause',    kind: 'gray' },
  RESUMED:         { label: 'Resumed',         icon: 'play',     kind: 'amber' },
  OVERDUE:         { label: 'Overdue',         icon: 'alert',    kind: 'red' },
  COMPLETED:       { label: 'Completed',       icon: 'check',    kind: 'green' },
  FAILED:          { label: 'Marked failed',   icon: 'x',        kind: 'red' },
  CANCELLED:       { label: 'Cancelled',       icon: 'x',        kind: 'gray' },
  COMMENT:         { label: 'Comment',         icon: 'message',  kind: 'gray' },
  PHASE_CHANGED:   { label: 'Phase changed',   icon: 'calendar', kind: 'gray' },
};
export const logMeta = (action) => LOG_MAP[action] || { label: action, icon: 'calendar', kind: 'gray' };

export function actionsForStatus(status) {
  switch (status) {
    case 'SCHEDULED':
    case 'OVERDUE':
      return ['start', 'edit', 'cancel'];
    case 'STARTED':
      return ['complete', 'hold', 'cancel'];
    case 'ON_HOLD':
      return ['resume', 'cancel'];
    default:
      return ['edit_terminal'];
  }
}

export const isTerminal = (status) => ['SUCCESS', 'FAILED', 'CANCELLED'].includes(status);
export const isOpen = (status) => ['SCHEDULED', 'STARTED', 'ON_HOLD', 'OVERDUE'].includes(status);
