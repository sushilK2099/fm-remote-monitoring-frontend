'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, KeyRound } from 'lucide-react';
import { deviceService } from '@/api/services/device.service';
import PageWrapper from '@/components/layout/PageWrapper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import DataTable from '@/components/ui/DataTable';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import DeviceForm from './DeviceForm';
import ApiKeyDialog from './ApiKeyDialog';
import { NEW_DEVICE_KEY } from '@/config/constants';

export default function DeviceList() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDevice, setEditDevice] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newKey, setNewKey] = useState(null); // { deviceId, apiKey }

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await deviceService.getAll();
      setData(res.data.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load devices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // A device just created on /devices/new stashes its one-time key here — surface it once.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(NEW_DEVICE_KEY);
      if (raw) { setNewKey(JSON.parse(raw)); sessionStorage.removeItem(NEW_DEVICE_KEY); }
    } catch { /* ignore */ }
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deviceService.delete(deleteId);
      toast.success('Device deleted');
      setDeleteId(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRegenerate = async (row) => {
    try {
      const res = await deviceService.regenerateKey(row.deviceId);
      setNewKey({ deviceId: row.deviceId, apiKey: res.data.data.apiKey, transport: row.transport });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Regenerate failed');
    }
  };

  const handleSaved = (result) => {
    setShowForm(false);
    setEditDevice(null);
    // A freshly created device returns its plaintext key once.
    if (result?.apiKey) setNewKey({ deviceId: result.deviceId, apiKey: result.apiKey, transport: result.transport });
    fetchData();
  };

  const columns = [
    { accessorKey: 'deviceId', header: 'Device ID' },
    { accessorKey: 'deviceName', header: 'Name' },
    { accessorKey: 'transport', header: 'Transport' },
    { accessorKey: 'channelMap', header: 'Channels', cell: ({ row }) => (row.original.channelMap || []).length },
    { accessorKey: 'status', header: 'Status' },
    {
      id: 'actions', header: '', cell: ({ row }) => (
        <div className="flex items-center gap-2 justify-end">
          <button title="Regenerate key" onClick={() => handleRegenerate(row.original)}><KeyRound size={16} /></button>
          <button title="Edit" onClick={() => { setEditDevice(row.original); setShowForm(true); }}><Pencil size={16} /></button>
          <button title="Delete" onClick={() => setDeleteId(row.original.deviceId)}><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <PageWrapper title="Monitoring Devices"
      description="IoT devices that push automatic readings"
      actions={<Button onClick={() => router.push('/devices/new')}><Plus size={16} /> Add Device</Button>}>
      <Card>
        <DataTable columns={columns} data={data} isLoading={isLoading} />
      </Card>

      {showForm && (
        <DeviceForm device={editDevice} onClose={() => { setShowForm(false); setEditDevice(null); }} onSaved={handleSaved} />
      )}

      {newKey && <ApiKeyDialog data={newKey} onClose={() => setNewKey(null)} />}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete device?"
        message="Readings already ingested are kept. The device can no longer authenticate."
        confirmText="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteId(null)}
      />
    </PageWrapper>
  );
}
