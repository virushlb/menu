import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-grid px-6">
      <div className="max-w-md rounded-3xl border border-zinc-200 bg-white p-8 shadow-soft">
        <div className="font-serif text-3xl">404</div>
        <div className="mt-2 text-sm text-zinc-700">This page doesn’t exist.</div>
        <div className="mt-6 flex gap-2">
          <Link to="/menu">
            <Button>Go to menu</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
