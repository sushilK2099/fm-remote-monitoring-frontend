export const MAINTENANCE_STATUS_OPTIONS = [
  { value: 'SCHEDULED',  label: 'Scheduled' },
  { value: 'STARTED',    label: 'Started' },
  { value: 'SUCCESS',    label: 'Success' },
  { value: 'FAILED',     label: 'Failed' },
  { value: 'CANCELLED',  label: 'Cancelled' },
];

export const MAINTENANCE_TYPE_OPTIONS = [
  { value: 'CORRECTIVE', label: 'Corrective' },
  { value: 'PREVENTIVE', label: 'Preventive' },
];

export const MAINTENANCE_PRIORITY_OPTIONS = [
  { value: 'LOW',      label: 'Low' },
  { value: 'MEDIUM',   label: 'Medium' },
  { value: 'HIGH',     label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export const MAINTENANCE_TARGET_OPTIONS = [
  { value: 'LOCATION', label: 'Location' },
  { value: 'ASSET',    label: 'Asset' },
];

// Recipients for phase-entry notifications. MUST stay in sync with the backend
// catalog in fm-maintainance-backend/app/helpers/notifyRecipients.js (that file is
// the authoritative validator). `needsEmail` recipients require a literal address.
export const NOTIFY_RECIPIENTS = [
  { value: 'Assigned Technician',   needsEmail: false },
  { value: 'Request Creator',       needsEmail: false },
  { value: 'Assigned Vendor',       needsEmail: false },
  { value: 'Site Manager',          needsEmail: false },
  { value: 'Asset / Location Head', needsEmail: false },
  { value: 'Account Admin',         needsEmail: false },
  { value: 'Custom email',          needsEmail: true  },
];

export const MAINTENANCE_PERMISSIONS = [
  { key: 'maintenance.maintenance.view',   label: 'View Requests',   description: 'See all maintenance requests for assigned sites' },
  { key: 'maintenance.maintenance.create', label: 'Create Requests', description: 'Submit new maintenance requests' },
  { key: 'maintenance.maintenance.update', label: 'Update Requests', description: 'Start, complete, cancel, and comment on requests' },
  { key: 'maintenance.maintenance.delete', label: 'Delete Requests', description: 'Delete scheduled or cancelled requests' },
  { key: 'maintenance.admin.manage',       label: 'Admin Panel',     description: 'Manage maintenance roles and user assignments' },
];

// ─── Opero vocabulary ────────────────────────────────────────────────────────
export const TYPE_LABEL = { CORRECTIVE: 'Corrective', PREVENTIVE: 'Preventive' };
export const TYPE_PILL  = { CORRECTIVE: 'amber', PREVENTIVE: 'teal' };

export const STATUS_LABEL = {
  SCHEDULED: 'Scheduled', STARTED: 'In Progress', ON_HOLD: 'On Hold',
  OVERDUE: 'Overdue', SUCCESS: 'Completed', FAILED: 'Cancelled', CANCELLED: 'Cancelled',
};
export const STATUS_PILL = {
  SCHEDULED: 'blue', STARTED: 'amber', ON_HOLD: 'gray',
  OVERDUE: 'red', SUCCESS: 'green', FAILED: 'gray', CANCELLED: 'gray',
};

export const PRIORITY_LABEL = { LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', CRITICAL: 'Critical' };
export const PRIORITY_DOT = { CRITICAL: '#C53434', HIGH: '#D9912B', MEDIUM: '#2563EB', LOW: '#C7CAD1' };

export const PRIORITY_FORM_OPTIONS = [
  { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }, { value: 'CRITICAL', label: 'Critical' },
];

export const RECURRENCE_OPTIONS = [
  { value: 'One-time', label: 'One-time' },
  { value: 'Every 30 days', label: 'Every 30 days' },
  { value: 'Every 60 days', label: 'Every 60 days' },
  { value: 'Every 90 days', label: 'Every 90 days' },
  { value: 'Every 180 days', label: 'Every 180 days' },
  { value: 'Every 365 days', label: 'Every 365 days' },
];

export const STATUS_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'SCHEDULED', label: 'Scheduled' },
  { key: 'STARTED', label: 'In progress' },
  { key: 'ON_HOLD', label: 'On hold' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'SUCCESS', label: 'Completed' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export const NOTIF_EVENT_OPTIONS = [
  'Scheduled', 'Vendor assigned', 'Started', 'Comment added', 'On hold', 'Completed', 'Cancelled', 'Overdue',
].map((v) => ({ value: v, label: v }));

export const NOTIF_RECIPIENT_OPTIONS = [
  'Site Manager', 'Asset / Location Head', 'Assigned Vendor', 'Account Admin', 'Custom email',
].map((v) => ({ value: v, label: v }));

export const NOTIF_CHANNEL_OPTIONS = [
  { value: 'Email', label: 'Email' },
  { value: 'SMS', label: 'SMS' },
  { value: 'In-app', label: 'In-app' },
];
export const CHANNEL_PILL = { Email: 'blue', SMS: 'teal', 'In-app': 'gray' };

export const MAINTENANCE_CATEGORIES = [
  { value: 'hvac',        label: 'HVAC' },
  { value: 'electrical',  label: 'Electrical' },
  { value: 'plumbing',    label: 'Plumbing' },
  { value: 'fire-safety', label: 'Fire Safety' },
  { value: 'elevator',    label: 'Elevator' },
  { value: 'furniture',   label: 'Furniture' },
  { value: 'it-equipment', label: 'IT Equipment' },
  { value: 'security',    label: 'Security' },
  { value: 'cleaning',    label: 'Cleaning' },
  { value: 'other',       label: 'Other' },
];

// sessionStorage key: a device created on /devices/new stashes its one-time plaintext API
// key here, then /devices reads + clears it to show the ApiKeyDialog once (kept out of the URL).
export const NEW_DEVICE_KEY = 'rm.newDeviceKey';
