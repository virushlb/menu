-- MENU PRO — Supabase Storage policies
--
-- 1) Create a storage bucket named: menu-images
--    - Storage → Buckets → New bucket
--    - Set it to PUBLIC
--
-- 2) Run this SQL in the Supabase SQL Editor.
--    IMPORTANT:
--    If you get: "must be owner of table objects"
--    switch the SQL Editor "Run as role" to `postgres` (or the highest role you have),
--    OR create the policies from the Storage UI instead.

alter table storage.objects enable row level security;

drop policy if exists "Menu images: public read" on storage.objects;
create policy "Menu images: public read" on storage.objects
for select
using (bucket_id = 'menu-images');

drop policy if exists "Menu images: admin upload" on storage.objects;
create policy "Menu images: admin upload" on storage.objects
for insert to authenticated
with check (bucket_id = 'menu-images' and public.is_admin());

drop policy if exists "Menu images: admin update" on storage.objects;
create policy "Menu images: admin update" on storage.objects
for update to authenticated
using (bucket_id = 'menu-images' and public.is_admin())
with check (bucket_id = 'menu-images' and public.is_admin());

drop policy if exists "Menu images: admin delete" on storage.objects;
create policy "Menu images: admin delete" on storage.objects
for delete to authenticated
using (bucket_id = 'menu-images' and public.is_admin());
