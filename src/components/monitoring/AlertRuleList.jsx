'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { alertRuleService } from '@/api/services/alert.service';
import { metricService } from '@/api/services/metric.service';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import AlertRuleForm from './AlertRuleForm';

const OP_LABEL = { GT: '>', GTE: '≥', LT: '<', LTE: '≤', EQ: '=', NEQ: '≠' };

export default function AlertRuleList() {
  const [data, setData] = useState([]);
  const [metricsById, setMetricsById] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editRule, setEditRule] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [rulesRes, metricsRes] = await Promise.all([
        alertRuleService.getAll(),
        metricService.getAll(),
      ]);
      setData(rulesRes.data.data || []);
      const map = {};
      (metricsRes.data.data || []).forEach((m) => { map[m.metricId] = m; });
      setMetricsById(map);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load alert rules');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await alertRuleService.delete(deleteId);
      toast.success('Rule deleted');
      setDeleteId(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    { accessorKey: 'metricId', header: 'Metric', cell: ({ row }) => metricsById[row.original.metricId]?.name || row.original.metricId },
    {
      id: 'condition', header: 'Condition',
      cell: ({ row }) => {
        const m = metricsById[row.original.metricId];
        return `${OP_LABEL[row.original.operator]} ${row.original.threshold}${m?.unit ? ' ' + m.unit : ''}`;
      },
    },
    { accessorKey: 'severity', header: 'Severity' },
    { accessorKey: 'cooldownSeconds', header: 'Cooldown (s)' },
    { accessorKey: 'enabled', header: 'Enabled', cell: ({ row }) => (row.original.enabled ? 'Yes' : 'No') },
    {
      id: 'actions', header: '', cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <button title="Edit" onClick={() => { setEditRule(row.original); setShowForm(true); }}><Pencil size={16} /></button>
          <button title="Delete" onClick={() => setDeleteId(row.original.ruleId)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Alert Rules"
      description="Email an alert when a reading crosses a threshold"
      actions={<Button onClick={() => { setEditRule(null); setShowForm(true); }}><Plus size={16} /> Add Rule</Button>}>
      <Card>
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </Card>

      {showForm && (
        <AlertRuleForm rule={editRule} metrics={Object.values(metricsById)}
          onClose={() => { setShowForm(false); setEditRule(null); }}
          onSaved={() => { setShowForm(false); setEditRule(null); fetchData(); }} />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete alert rule?"
        message="No more emails will be sent for this threshold."
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </PageWrapper>
  );
}
