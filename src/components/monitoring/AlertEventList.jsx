'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { alertEventService } from '@/api/services/alert.service';
import { metricService } from '@/api/services/metric.service';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import DataTable from '@/components/ui/DataTable';
import Select from '@/components/ui/Select';
import useTargetLabels from '@/hooks/useTargetLabels';

const OP_LABEL = { GT: '>', GTE: '≥', LT: '<', LTE: '≤', EQ: '=', NEQ: '≠' };
const STATUS_FILTER = [
  { value: '', label: 'All' },
  { value: 'OPEN', label: 'Open' },
  { value: 'ACKNOWLEDGED', label: 'Acknowledged' },
];

export default function AlertEventList() {
  const [data, setData] = useState([]);
  const [metricsById, setMetricsById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('OPEN');
  const { label } = useTargetLabels();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await alertEventService.getAll(params);
      setData(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load alerts');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Metrics map to resolve metricId → name + targetType (events don't carry targetType).
  useEffect(() => {
    metricService.getAll()
      .then((res) => {
        const m = {};
        (res.data.data || []).forEach((x) => { m[x.metricId] = x; });
        setMetricsById(m);
      })
      .catch(() => {});
  }, []);

  const acknowledge = async (eventId) => {
    try {
      await alertEventService.acknowledge(eventId);
      toast.success('Acknowledged');
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Acknowledge failed');
    }
  };

  const columns = [
    { accessorKey: 'firedAt', header: 'Fired', cell: ({ row }) => row.original.firedAt?.ISODate ? new Date(row.original.firedAt.ISODate).toLocaleString() : '-' },
    { accessorKey: 'metricId', header: 'Metric', cell: ({ row }) => metricsById[row.original.metricId]?.name || row.original.metricId },
    { accessorKey: 'targetId', header: 'Target', cell: ({ row }) => label(metricsById[row.original.metricId]?.targetType, row.original.targetId) },
    { id: 'breach', header: 'Condition', cell: ({ row }) => (
        row.original.operator === 'STALE'
          ? `No readings for ${Math.round((row.original.value || 0) / 60)} min (expected ≤ ${Math.round((row.original.threshold || 0) / 60)} min)`
          : `${row.original.value} ${OP_LABEL[row.original.operator] || row.original.operator} ${row.original.threshold}`
      ) },
    { accessorKey: 'severity', header: 'Severity' },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions', header: '', cell: ({ row }) => (
        row.original.status === 'OPEN'
          ? <div className="flex justify-end"><button title="Acknowledge" onClick={() => acknowledge(row.original.eventId)}><Check size={16} /></button></div>
          : null
      ),
    },
  ];

  return (
    <PageWrapper title="Alerts"
      description="Threshold breaches"
      actions={<div className="w-48"><Select options={STATUS_FILTER} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} /></div>}>
      <Card>
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </Card>
    </PageWrapper>
  );
}
