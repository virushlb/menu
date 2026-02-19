import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useIsAdmin } from '@/hooks/useProfile';

export function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  const profileQuery = useIsAdmin();

  if (authLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-soft">
          <div className="text-sm font-medium">Loading…</div>
          <div className="mt-1 text-xs text-zinc-600">Checking your session</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  }

  if (profileQuery.isLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center">
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-4 shadow-soft">
          <div className="text-sm font-medium">Loading…</div>
          <div className="mt-1 text-xs text-zinc-600">Loading your admin profile</div>
        </div>
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-base font-semibold">Could not load your profile</div>
          <div className="mt-2 text-sm text-zinc-700">
            {String(profileQuery.error)}
          </div>
        </div>
      </div>
    );
  }

  if (!profileQuery.isAdmin) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-6">
        <div className="max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-base font-semibold">Not authorized</div>
          <div className="mt-2 text-sm text-zinc-700">
            Your account is signed in, but it does not have the <code>admin</code> role.
          </div>
          <div className="mt-4 text-sm text-zinc-600">
            Tip: The <strong>first account you create</strong> becomes admin automatically (see
            <code className="mx-1 rounded bg-zinc-100 px-1.5 py-0.5">schema.sql</code>).
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
