const configs = {
  SUCCESS:      { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80',  label: 'Success'      },
  FAILED:       { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  label: 'Failed'       },
  SCHEDULED:    { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa',  label: 'Scheduled'    },
  STARTED:      { bg: 'rgba(249,115,22,0.12)',  color: '#fb923c',  label: 'In Progress'  },
  OVERDUE:      { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  label: 'Overdue'      },
  ON_HOLD:      { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8',  label: 'On Hold'      },
  CANCELLED:    { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8',  label: 'Cancelled'    },
  ACTIVE:       { bg: 'rgba(34,197,94,0.12)',   color: '#4ade80',  label: 'Active'       },
  INACTIVE:     { bg: 'rgba(239,68,68,0.12)',   color: '#f87171',  label: 'Inactive'     },
  PENDING:      { bg: 'rgba(234,179,8,0.12)',   color: '#facc15',  label: 'Pending'      },
  CHECKED_IN:   { bg: 'rgba(59,130,246,0.12)',  color: '#60a5fa',  label: 'Checked In'   },
  CHECKED_OUT:  { bg: 'rgba(139,92,246,0.12)',  color: '#a78bfa',  label: 'Checked Out'  },
};

const DEFAULT_CONFIG = { bg: 'rgba(148,163,184,0.12)', color: '#94a3b8', label: null };

export function getStatusConfig(status) {
  return configs[status] || { ...DEFAULT_CONFIG, label: status };
}

export default function StatusBadge({ status, dot = false }) {
  const cfg = getStatusConfig(status);
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block' }} />}
      {cfg.label}
    </span>
  );
}
