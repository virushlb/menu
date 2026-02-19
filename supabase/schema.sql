-- MENU PRO — Supabase schema
-- Run this file in the Supabase SQL Editor.

-- Extensions
create extension if not exists pgcrypto;

-- Helpers
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('admin','viewer')),
  created_at timestamptz not null default now()
);

-- Create profile row automatically when a user signs up.
-- Bootstrap: the FIRST user ever becomes admin.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count int;
  next_role text;
begin
  select count(*) into admin_count from public.profiles where role = 'admin';
  next_role := case when admin_count = 0 then 'admin' else 'viewer' end;

  insert into public.profiles (id, email, role)
  values (new.id, new.email, next_role);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists(
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- Menu tables
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cover_image_url text,
  cover_image_path text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

-- Migrations (safe to re-run)
alter table public.categories
  add column if not exists cover_image_url text;
alter table public.categories
  add column if not exists cover_image_path text;

drop trigger if exists set_timestamp_categories on public.categories;
create trigger set_timestamp_categories
before update on public.categories
for each row execute procedure public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  tags text[] not null default '{}'::text[],
  is_featured boolean not null default false,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.products
  add column if not exists is_featured boolean not null default false;

create index if not exists idx_products_category_id on public.products(category_id);

drop trigger if exists set_timestamp_products on public.products;
create trigger set_timestamp_products
before update on public.products
for each row execute procedure public.set_updated_at();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  path text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product_id on public.product_images(product_id);

-- Restaurant settings (single row)
-- Editable from the admin dashboard to update: phone, location, hours, etc.
create table if not exists public.restaurant_settings (
  id int primary key default 1,
  name text,
  tagline text,
  currency text,
  address text,
  phone text,
  hours text,
  maps_url text,
  instagram_url text,
  about_title text,
  about_text text,
  about_image_url text,
  about_image_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

alter table public.restaurant_settings
  add column if not exists about_title text;
alter table public.restaurant_settings
  add column if not exists about_text text;
alter table public.restaurant_settings
  add column if not exists about_image_url text;
alter table public.restaurant_settings
  add column if not exists about_image_path text;

-- Enforce single-row table (id must always be 1)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'restaurant_settings_singleton'
  ) then
    alter table public.restaurant_settings
      add constraint restaurant_settings_singleton check (id = 1);
  end if;
end $$;

drop trigger if exists set_timestamp_restaurant_settings on public.restaurant_settings;
create trigger set_timestamp_restaurant_settings
before update on public.restaurant_settings
for each row execute procedure public.set_updated_at();

-- Ensure the singleton row exists
insert into public.restaurant_settings (id)
values (1)
on conflict (id) do nothing;

-- RLS
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.restaurant_settings enable row level security;

-- Profiles policies
-- Self read
drop policy if exists "Profiles: self read" on public.profiles;
create policy "Profiles: self read" on public.profiles
for select to authenticated
using (id = auth.uid());

-- Admin read all
drop policy if exists "Profiles: admin read all" on public.profiles;
create policy "Profiles: admin read all" on public.profiles
for select to authenticated
using (public.is_admin());

-- Self insert (viewer only)
drop policy if exists "Profiles: self insert" on public.profiles;
create policy "Profiles: self insert" on public.profiles
for insert to authenticated
with check (id = auth.uid() and role = 'viewer');

-- Admin update
drop policy if exists "Profiles: admin update" on public.profiles;
create policy "Profiles: admin update" on public.profiles
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Categories policies
-- Public read active
drop policy if exists "Categories: public read" on public.categories;
create policy "Categories: public read" on public.categories
for select to anon, authenticated
using (is_active = true);

-- Admin read all
drop policy if exists "Categories: admin read" on public.categories;
create policy "Categories: admin read" on public.categories
for select to authenticated
using (public.is_admin());

-- Admin write
drop policy if exists "Categories: admin insert" on public.categories;
create policy "Categories: admin insert" on public.categories
for insert to authenticated
with check (public.is_admin());

drop policy if exists "Categories: admin update" on public.categories;
create policy "Categories: admin update" on public.categories
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Categories: admin delete" on public.categories;
create policy "Categories: admin delete" on public.categories
for delete to authenticated
using (public.is_admin());

-- Products policies
-- Public read available
drop policy if exists "Products: public read" on public.products;
create policy "Products: public read" on public.products
for select to anon, authenticated
using (is_available = true);

-- Admin read all
drop policy if exists "Products: admin read" on public.products;
create policy "Products: admin read" on public.products
for select to authenticated
using (public.is_admin());

-- Admin write
drop policy if exists "Products: admin insert" on public.products;
create policy "Products: admin insert" on public.products
for insert to authenticated
with check (public.is_admin());

drop policy if exists "Products: admin update" on public.products;
create policy "Products: admin update" on public.products
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Products: admin delete" on public.products;
create policy "Products: admin delete" on public.products
for delete to authenticated
using (public.is_admin());

-- Product images policies
-- Public read images for available products
drop policy if exists "Product images: public read" on public.product_images;
create policy "Product images: public read" on public.product_images
for select to anon, authenticated
using (
  exists(
    select 1
    from public.products p
    where p.id = product_id and p.is_available = true
  )
);

-- Admin read all
drop policy if exists "Product images: admin read" on public.product_images;
create policy "Product images: admin read" on public.product_images
for select to authenticated
using (public.is_admin());

-- Admin write
drop policy if exists "Product images: admin insert" on public.product_images;
create policy "Product images: admin insert" on public.product_images
for insert to authenticated
with check (public.is_admin());

drop policy if exists "Product images: admin update" on public.product_images;
create policy "Product images: admin update" on public.product_images
for update to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Product images: admin delete" on public.product_images;
create policy "Product images: admin delete" on public.product_images
for delete to authenticated
using (public.is_admin());

-- Restaurant settings policies
drop policy if exists "Restaurant settings: public read" on public.restaurant_settings;
create policy "Restaurant settings: public read" on public.restaurant_settings
for select to anon, authenticated
using (id = 1);

drop policy if exists "Restaurant settings: admin insert" on public.restaurant_settings;
create policy "Restaurant settings: admin insert" on public.restaurant_settings
for insert to authenticated
with check (public.is_admin() and id = 1);

drop policy if exists "Restaurant settings: admin update" on public.restaurant_settings;
create policy "Restaurant settings: admin update" on public.restaurant_settings
for update to authenticated
using (public.is_admin())
with check (public.is_admin());


-- NOTE: Storage bucket + policies live in a separate file now:
--   supabase/storage_policies.sql
-- This avoids SQL Editor errors like "must be owner of table objects" on some Supabase projects.
