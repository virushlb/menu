import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, MenuSquare, Settings, Tags } from 'lucide-react';
import { BRAND } from '@/config/branding';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 sm:px-6">
        <aside className="hidden w-64 shrink-0 sm:block">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-soft">
            <div className="font-serif text-xl">{BRAND.name}</div>
            <div className="mt-1 text-xs text-zinc-600">Admin dashboard</div>

            <div className="mt-6 space-y-1">
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                  )
                }
              >
                <MenuSquare className="h-4 w-4" />
                Products
              </NavLink>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                  )
                }
              >
                <Tags className="h-4 w-4" />
                Categories
              </NavLink>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition',
                    isActive ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                  )
                }
              >
                <Settings className="h-4 w-4" />
                Settings
              </NavLink>
            </div>

            <div className="mt-6 border-t border-zinc-200 pt-4">
              <div className="text-xs text-zinc-500">Signed in as</div>
              <div className="truncate text-sm font-medium text-zinc-800">{user?.email}</div>

              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={async () => {
                  await signOut();
                  navigate('/admin/login');
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between sm:hidden">
            <div>
              <div className="font-serif text-xl">{BRAND.name}</div>
              <div className="text-xs text-zinc-600">Admin dashboard</div>
            </div>
            <Button
              variant="secondary"
              onClick={async () => {
                await signOut();
                navigate('/admin/login');
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
