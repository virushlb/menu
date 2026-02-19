-- MENU PRO — Option A (Fine Dining) migration
-- Use this ONLY if you already ran an older Menu Pro schema and just want to add the new fields.
-- Safe to re-run.

-- Categories: cover image banner
alter table public.categories
  add column if not exists cover_image_url text;

alter table public.categories
  add column if not exists cover_image_path text;

-- Products: featured / chef's picks
alter table public.products
  add column if not exists is_featured boolean not null default false;

-- Restaurant settings: story section
alter table public.restaurant_settings
  add column if not exists about_title text;

alter table public.restaurant_settings
  add column if not exists about_text text;

alter table public.restaurant_settings
  add column if not exists about_image_url text;

alter table public.restaurant_settings
  add column if not exists about_image_path text;
