import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BRAND, ADMIN } from '@/config/branding';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function AdminLoginPage() {
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from || '/admin/products';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const submit = async () => {
    setLoading(true);
    try {
      const action = mode === 'signin' ? signIn : signUp;
      const res = await action({ email, password });
      if (!res.ok) {
        toast.error(res.error ?? 'Something went wrong');
        return;
      }
      if (mode === 'signup' && res.needsEmailConfirmation) {
        toast.success('Account created — check your email to confirm, then sign in.');
        setMode('signin');
        return;
      }
      toast.success(mode === 'signin' ? 'Welcome back' : 'Account created');
      navigate(from, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-grid">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 py-16 md:grid-cols-2 md:items-center">
        <div>
          <div className="font-serif text-4xl">{BRAND.name}</div>
          <div className="mt-2 text-zinc-600">Admin dashboard</div>

          <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
            <div className="text-sm font-semibold">What you can manage</div>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-zinc-700">
              <li>Categories (add / edit / reorder / hide)</li>
              <li>Products (add / edit / delete / availability)</li>
              <li>Up to 5 photos per product (upload, reorder, remove)</li>
            </ul>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-zinc-900">
                {mode === 'signin' ? 'Sign in' : 'Create admin account'}
              </div>
              <div className="mt-1 text-xs text-zinc-600">
                {mode === 'signin'
                  ? 'Use your admin credentials'
                  : 'First account becomes admin automatically'}
              </div>
            </div>

            {ADMIN.enableSignup && (
              <button
                className="text-sm font-medium text-zinc-700 underline decoration-zinc-300 underline-offset-4 hover:text-zinc-900"
                onClick={() => setMode((m) => (m === 'signin' ? 'signup' : 'signin'))}
              >
                {mode === 'signin' ? 'Create account' : 'Back to sign in'}
              </button>
            )}
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <div className="mb-1 text-xs font-semibold text-zinc-600">Email</div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="admin@client.com"
                autoComplete="email"
              />
            </div>
            <div>
              <div className="mb-1 text-xs font-semibold text-zinc-600">Password</div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="••••••••"
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>

            <Button
              className="w-full"
              onClick={submit}
              disabled={loading || !email.trim() || password.length < 6}
            >
              {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>

            <div className="text-xs text-zinc-500">
              Tip: You can disable sign-up by setting{' '}
              <code className="rounded bg-zinc-100 px-1.5 py-0.5">VITE_ENABLE_ADMIN_SIGNUP=false</code>
              .
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
