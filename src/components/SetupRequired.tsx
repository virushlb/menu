import React from 'react';

export function SetupRequired() {
  return (
    <div className="min-h-screen bg-grid">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-serif text-4xl">Supabase setup required</h1>
        <p className="mt-4 text-zinc-700">
          This project is ready — it just needs your Supabase project credentials.
        </p>
        <ol className="mt-6 list-decimal space-y-3 pl-6 text-zinc-800">
          <li>Create a Supabase project.</li>
          <li>Run the SQL file in <code className="rounded bg-zinc-100 px-2 py-0.5">/supabase/schema.sql</code>.</li>
          <li>
            Create a storage bucket named <code className="rounded bg-zinc-100 px-2 py-0.5">menu-images</code> and set it to public.
            <span className="block text-sm text-zinc-600">
              Then run <code className="rounded bg-zinc-100 px-2 py-0.5">/supabase/storage_policies.sql</code> (or add the policies from the Storage UI).
            </span>
          </li>
          <li>Copy your <strong>Project URL</strong> and <strong>Anon Key</strong> into a <code className="rounded bg-zinc-100 px-2 py-0.5">.env</code> file.</li>
        </ol>
        <pre className="mt-6 overflow-auto rounded-xl bg-zinc-900 p-4 text-sm text-zinc-100">
{`VITE_SUPABASE_URL=\nVITE_SUPABASE_ANON_KEY=\n`}
        </pre>
        <p className="mt-6 text-zinc-700">
          After that, restart the dev server.
        </p>
      </div>
    </div>
  );
}
