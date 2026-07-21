'use client';
import { useEffect } from 'react';
import { masterApi } from '@/api/axios';
import { useOrgStore } from '@/store/orgStore';

export default function OrgGuard({ children }) {
  const { orgStatus, setOrg, setOrgStatus } = useOrgStore();

  useEffect(() => {
    setOrgStatus('loading');
    masterApi.get('/account/current')
      .then((res) => setOrg(res.data.data))
      .catch((err) => {
        const status = err.response?.status;
        setOrgStatus(status === 403 ? 'inactive' : 'not_found');
      });
  }, []);

  if (orgStatus === 'idle' || orgStatus === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="h-8 w-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orgStatus === 'not_found') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Organisation not found</p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>The subdomain you visited does not match any registered organisation.</p>
        </div>
      </div>
    );
  }

  if (orgStatus === 'inactive') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="text-center">
          <p className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Organisation inactive</p>
          <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>This organisation account has been deactivated.</p>
        </div>
      </div>
    );
  }

  return children;
}
