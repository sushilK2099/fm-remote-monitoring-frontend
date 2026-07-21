'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { authService } from '@/api/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { useOrgStore } from '@/store/orgStore';
import useThemeStore from '@/store/themeStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const org = useOrgStore((s) => s.org);
  const logoUrl = useThemeStore((s) => s.logoUrl);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) { setError('Email and password are required'); return; }
    setError('');
    setIsLoading(true);
    try {
      await authService.login({ email: email.trim(), password });
      const meRes = await authService.me();
      setAuth(meRes.data.data || meRes.data);
      router.push('/dashboard');
    } catch (err) {
      setError(err?.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center mb-4 overflow-hidden">
            {logoUrl
              ? <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
              : <Layers className="h-6 w-6 text-white" />
            }
          </div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {org?.name || 'FM Maintenance'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-tertiary)' }}>
            Sign in to your account
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border p-6 shadow-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
