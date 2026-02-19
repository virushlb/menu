import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Clock, Instagram, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRestaurantBrand } from '@/hooks/useRestaurantBrand';

export function PublicLayout() {
  const { brand } = useRestaurantBrand();

  return (
    <div className="min-h-screen bg-restaurant text-zinc-900">
      {/* Minimal header (kept simple so it feels like a real menu, not an app) */}
      <header className="sticky top-0 z-30 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link to="/menu" className="group">
            <div className="font-serif text-xl tracking-tight text-zinc-900">
              {brand.name}
            </div>
            <div className="text-xs text-zinc-600 transition group-hover:text-zinc-800">
              {brand.tagline}
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <NavLink
              to="/menu"
              className={({ isActive }) =>
                cn(
                  'rounded-xl px-3 py-2 text-sm font-medium transition',
                  isActive
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:bg-zinc-100'
                )
              }
            >
              Menu
            </NavLink>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Simple footer */}
      <footer className="border-t border-zinc-200/70 bg-white/50">
        <div className="mx-auto max-w-5xl px-5 py-10 text-sm text-zinc-700">
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <div className="font-serif text-xl text-zinc-900">{brand.name}</div>
              <div className="mt-1 text-sm text-zinc-600">{brand.tagline}</div>
              <div className="mt-4 text-xs text-zinc-500">
                © {new Date().getFullYear()} • Menu-only website (no online ordering)
              </div>
            </div>

            <div className="grid gap-3 sm:justify-self-end">
              <a
                href={brand.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900"
              >
                <MapPin className="h-4 w-4" />
                <span>{brand.address}</span>
              </a>
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900"
              >
                <Phone className="h-4 w-4" />
                <span>{brand.phone}</span>
              </a>
              <div className="inline-flex items-center gap-2 text-zinc-700">
                <Clock className="h-4 w-4" />
                <span>{brand.hours}</span>
              </div>
              {brand.instagramUrl ? (
                <a
                  href={brand.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-zinc-700 hover:text-zinc-900"
                >
                  <Instagram className="h-4 w-4" />
                  <span>Instagram</span>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
