-- =========================================================
-- Demo seed data (Beirut vibes)
--
-- This file inserts a complete demo menu with external image URLs.
-- Safe to run multiple times (fixed UUIDs + upserts).
-- =========================================================

begin;

insert into public.restaurant_settings
  (id, restaurant_name, tagline, phone, address, opening_hours, currency, instagram_url, about_title, about_text, about_image_url, about_image_path)
values
  (1, 'Beirut Vibes', 'Mezze • Manakish • Charcoal Grill', '+961 01 234 567', 'Hamra, Beirut, Lebanon', 'Daily • 11:00 – 23:00', 'USD', 'https://instagram.com/', 'A little Beirut, on every table', 'From late-night streets to seaside sunsets—this menu is inspired by Beirut’s café culture: bright mezze, warm breads, and charcoal grill classics.

Everything here is built for sharing. Add your own items from the admin dashboard and make it yours.', 'https://images.unsplash.com/photo-1642105245501-5becd6f24501?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1642105245501-5becd6f24501')
on conflict (id) do update set
  restaurant_name = excluded.restaurant_name,
  tagline = excluded.tagline,
  phone = excluded.phone,
  address = excluded.address,
  opening_hours = excluded.opening_hours,
  currency = excluded.currency,
  instagram_url = excluded.instagram_url,
  about_title = excluded.about_title,
  about_text = excluded.about_text,
  about_image_url = excluded.about_image_url,
  about_image_path = excluded.about_image_path;

insert into public.categories
  (id, name, description, sort_order, is_active, cover_image_url, cover_image_path)
values
  ('3535b6f0-2264-4acd-8a9f-80110cb3a70f'::uuid, 'Mezze', 'Cold & hot plates made for sharing—fresh, bright, and classic Beirut flavors.', 1, true, 'https://images.unsplash.com/photo-1743674453093-592bed88018e?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1743674453093-592bed88018e'),
  ('44dda2ea-75c9-46cd-8187-cdb93fad95be'::uuid, 'Oven & Manakish', 'Baked to order: manoushe, sfeeha and warm breads straight from the oven.', 2, true, 'https://images.unsplash.com/photo-1653982960203-c8361d7bed96?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1653982960203-c8361d7bed96'),
  ('5ba129ec-a19d-4956-bf0c-afeb02d9e576'::uuid, 'Charcoal Grill', 'Charcoal-grilled skewers & plates with smoky, citrusy marinades.', 3, true, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1555939594-58d7cb561ad1'),
  ('7345192d-fb58-499c-8d7b-a7fc25f2708c'::uuid, 'Sweets', 'A sweet finish—pistachio, rose water, and bakery classics.', 4, true, 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1598110750624-207050c4f28c'),
  ('00b350fc-a023-44c1-a6bd-11c94693fef4'::uuid, 'Drinks', 'Coffee, fresh citrus, and Beirut-style refreshers.', 5, true, 'https://images.unsplash.com/photo-1696957024709-0e3e7df73aaf?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1696957024709-0e3e7df73aaf')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active,
  cover_image_url = excluded.cover_image_url,
  cover_image_path = excluded.cover_image_path;

insert into public.products
  (id, category_id, name, description, price, tags, is_featured, is_available, sort_order)
values
  ('80f45b95-87aa-4552-bc04-bb42b3481b0e'::uuid, '3535b6f0-2264-4acd-8a9f-80110cb3a70f'::uuid, 'Hummus Beiruti', 'Creamy chickpeas, tahini, extra virgin olive oil.', 6.50, ARRAY['Vegan', 'Signature'], true, true, 1),
  ('2a047b6d-b274-4b09-8c79-bc2afffeb72e'::uuid, '3535b6f0-2264-4acd-8a9f-80110cb3a70f'::uuid, 'Tabbouleh', 'Parsley, bulgur, tomato, mint, lemon.', 7.00, ARRAY['Vegan', 'Fresh'], false, true, 2),
  ('cdad51fc-fee7-4733-b580-e9de8dc38456'::uuid, '3535b6f0-2264-4acd-8a9f-80110cb3a70f'::uuid, 'Sambousek', 'Crispy pastry filled with cheese & herbs.', 7.50, ARRAY['Vegetarian'], false, true, 3),
  ('d703ff45-e114-4d4d-bb3a-258970eba381'::uuid, '3535b6f0-2264-4acd-8a9f-80110cb3a70f'::uuid, 'Batata Harra', 'Spicy potatoes, garlic, cilantro, lemon.', 6.75, ARRAY['Spicy', 'Vegan'], false, true, 4),
  ('50a44629-0776-47b7-8299-c4696453576d'::uuid, '44dda2ea-75c9-46cd-8187-cdb93fad95be'::uuid, 'Manoushe Zaatar', 'Warm flatbread with zaatar & olive oil.', 4.50, ARRAY['Vegetarian', 'Classic'], true, true, 1),
  ('97964240-54df-4cf4-afd9-901afb3c8eb3'::uuid, '44dda2ea-75c9-46cd-8187-cdb93fad95be'::uuid, 'Manoushe Jebneh', 'Cheese manoushe, baked fresh.', 5.25, ARRAY['Vegetarian'], false, true, 2),
  ('d3ed33f9-4efc-4104-a3bf-cf5fa2d31799'::uuid, '44dda2ea-75c9-46cd-8187-cdb93fad95be'::uuid, 'Sfeeha', 'Open meat pies with warm spices.', 6.25, ARRAY['House'], false, true, 3),
  ('eba6a8a7-de75-49c5-b154-40b4ffc2abf2'::uuid, '44dda2ea-75c9-46cd-8187-cdb93fad95be'::uuid, 'Fatayer Sabanekh', 'Spinach turnovers with sumac & onion.', 5.75, ARRAY['Vegan'], false, true, 4),
  ('7a6dc343-3520-4927-bcd6-9ba2f4fb2372'::uuid, '5ba129ec-a19d-4956-bf0c-afeb02d9e576'::uuid, 'Shish Taouk', 'Charcoal-grilled chicken skewers.', 14.50, ARRAY['Gluten-Free'], true, true, 1),
  ('75fbb047-ef13-4510-b149-522c54d8d343'::uuid, '5ba129ec-a19d-4956-bf0c-afeb02d9e576'::uuid, 'Kafta Meshwi', 'Grilled beef kafta, parsley & onion.', 15.00, ARRAY['Gluten-Free', 'Signature'], false, true, 2),
  ('7a317658-6add-4779-8478-01e0baeb0ad3'::uuid, '5ba129ec-a19d-4956-bf0c-afeb02d9e576'::uuid, 'Mixed Grill', 'Taouk, kafta, lamb, grilled veggies.', 22.00, ARRAY['For Sharing'], true, true, 3),
  ('6aee9ba2-7ea0-4c72-8b33-1e3aaeb3b9fc'::uuid, '5ba129ec-a19d-4956-bf0c-afeb02d9e576'::uuid, 'Chicken Shawarma Plate', 'Marinated chicken, garlic sauce, pickles.', 13.50, ARRAY['House'], false, true, 4),
  ('a9f79563-3a65-48ae-9714-3351ed7197e3'::uuid, '7345192d-fb58-499c-8d7b-a7fc25f2708c'::uuid, 'Baklava Selection', 'Assorted pistachio baklava, rose syrup.', 8.00, ARRAY['Signature'], true, true, 1),
  ('94d72a13-e155-48a1-8fc5-a756a4717514'::uuid, '7345192d-fb58-499c-8d7b-a7fc25f2708c'::uuid, 'Knafeh', 'Warm cheese dessert, orange blossom syrup.', 9.00, ARRAY['Classic'], false, true, 2),
  ('e4c8e273-5baa-4c11-b59f-ab9abda5be76'::uuid, '7345192d-fb58-499c-8d7b-a7fc25f2708c'::uuid, 'Maamoul', 'Date & walnut cookies, dusted sugar.', 6.50, ARRAY['New'], false, true, 3),
  ('d31c6b43-8d5a-42d0-8404-694bb2b0a301'::uuid, '7345192d-fb58-499c-8d7b-a7fc25f2708c'::uuid, 'Muhallabia', 'Milk pudding, pistachio, rose water.', 6.25, ARRAY['Gluten-Free', 'Vegetarian'], false, true, 4),
  ('d4710510-3cbc-414d-8e0d-54e947bb8afd'::uuid, '00b350fc-a023-44c1-a6bd-11c94693fef4'::uuid, 'Lebanese Coffee', 'Bold coffee, cardamom aroma.', 3.50, ARRAY['Hot'], true, true, 1),
  ('44f200d8-64a7-4d53-b160-506ac928011e'::uuid, '00b350fc-a023-44c1-a6bd-11c94693fef4'::uuid, 'Mint Lemonade', 'Fresh lemon, mint, crushed ice.', 4.75, ARRAY['Cold', 'Fresh'], true, true, 2),
  ('c68fea28-6f0d-419f-a37e-d5bc6f8210f1'::uuid, '00b350fc-a023-44c1-a6bd-11c94693fef4'::uuid, 'Jallab', 'Date molasses, rose water, pine nuts.', 5.00, ARRAY['Traditional'], false, true, 3),
  ('3482f907-06d1-4863-a38c-be50eb749f46'::uuid, '00b350fc-a023-44c1-a6bd-11c94693fef4'::uuid, 'Ayran', 'Chilled yogurt drink, lightly salted.', 4.25, ARRAY['Cold'], false, true, 4)
on conflict (id) do update set
  category_id = excluded.category_id,
  name = excluded.name,
  description = excluded.description,
  price = excluded.price,
  tags = excluded.tags,
  is_featured = excluded.is_featured,
  is_available = excluded.is_available,
  sort_order = excluded.sort_order;

insert into public.product_images
  (id, product_id, url, path, alt_text, sort_order)
values
  ('c6b9638b-39fe-499b-8beb-34857a1b34a4'::uuid, '80f45b95-87aa-4552-bc04-bb42b3481b0e'::uuid, 'https://images.unsplash.com/photo-1697126248475-a537cc5cce28?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1697126248475-a537cc5cce28', 'Hummus with olive oil', 0),
  ('b7c9b78a-96f5-4445-ad11-3ab9d60d7d02'::uuid, '80f45b95-87aa-4552-bc04-bb42b3481b0e'::uuid, 'https://images.unsplash.com/photo-1743674453093-592bed88018e?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1743674453093-592bed88018e', 'Mezze platter', 1),
  ('c62326a0-0634-4d3c-ab95-5f72af72051d'::uuid, '2a047b6d-b274-4b09-8c79-bc2afffeb72e'::uuid, 'https://images.unsplash.com/photo-1647714013867-f62bc1cc2039?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1647714013867-f62bc1cc2039', 'Tabbouleh salad', 0),
  ('e59485de-fa14-48ad-bc45-348e26ed3cac'::uuid, 'cdad51fc-fee7-4733-b580-e9de8dc38456'::uuid, 'https://images.unsplash.com/photo-1743674453093-592bed88018e?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1743674453093-592bed88018e', 'Sambousek & mezze', 0),
  ('2f31ce5b-6c07-4a4a-88ca-a9f2b6ab7b38'::uuid, 'd703ff45-e114-4d4d-bb3a-258970eba381'::uuid, 'https://images.unsplash.com/photo-1743674453093-592bed88018e?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1743674453093-592bed88018e', 'Spicy potatoes', 0),
  ('9671f528-4bd4-4f0b-8812-fd5a78d05f4e'::uuid, '50a44629-0776-47b7-8299-c4696453576d'::uuid, 'https://images.unsplash.com/photo-1640625314547-aee9a7696589?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1640625314547-aee9a7696589', 'Fresh baked flatbread', 0),
  ('0e332722-2dd7-4642-a91b-210de06e6d05'::uuid, '97964240-54df-4cf4-afd9-901afb3c8eb3'::uuid, 'https://images.unsplash.com/photo-1574448857443-dc1d7e9c4dad?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1574448857443-dc1d7e9c4dad', 'Fresh bread from the oven', 0),
  ('134ac1d4-1a40-4343-85f4-d9807df86dff'::uuid, 'd3ed33f9-4efc-4104-a3bf-cf5fa2d31799'::uuid, 'https://images.unsplash.com/photo-1684225160346-3a19b269155b?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1684225160346-3a19b269155b', 'Sfeeha (meat pies)', 0),
  ('3463210c-83af-4182-8581-24a19ac3aebe'::uuid, 'eba6a8a7-de75-49c5-b154-40b4ffc2abf2'::uuid, 'https://images.unsplash.com/photo-1622275316656-2cf4703db5aa?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1622275316656-2cf4703db5aa', 'Fresh baked pastries', 0),
  ('7b002429-f684-433d-acaf-7f46d6494368'::uuid, '7a6dc343-3520-4927-bcd6-9ba2f4fb2372'::uuid, 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1599487488170-d11ec9c172f0', 'Chicken skewers on the grill', 0),
  ('e5086ea7-2c90-4a8d-988f-c2644701af54'::uuid, '75fbb047-ef13-4510-b149-522c54d8d343'::uuid, 'https://images.unsplash.com/photo-1532636875304-0c89119d9b4d?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1532636875304-0c89119d9b4d', 'Grilled kafta plate', 0),
  ('8719ad95-a5fc-4712-8851-bf87945b0ba6'::uuid, '7a317658-6add-4779-8478-01e0baeb0ad3'::uuid, 'https://images.unsplash.com/photo-1633436375795-12b3b339712f?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1633436375795-12b3b339712f', 'Mixed grilled meats', 0),
  ('40efa29a-1d98-4c04-8c96-f6221e570b6d'::uuid, '7a317658-6add-4779-8478-01e0baeb0ad3'::uuid, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1555939594-58d7cb561ad1', 'Grilled platter', 1),
  ('324d57c4-4c4f-49d0-a01a-467fd257ceca'::uuid, '6aee9ba2-7ea0-4c72-8b33-1e3aaeb3b9fc'::uuid, 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1529006557810-274b9b2fc783', 'Shawarma wrap', 0),
  ('f4eabf16-40a2-4072-9287-0b8fdbf1f8d1'::uuid, 'a9f79563-3a65-48ae-9714-3351ed7197e3'::uuid, 'https://images.unsplash.com/photo-1598110750624-207050c4f28c?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1598110750624-207050c4f28c', 'Baklava rolls', 0),
  ('552a63ef-cb27-4d6f-b8f4-5109da61a41e'::uuid, '94d72a13-e155-48a1-8fc5-a756a4717514'::uuid, 'https://images.unsplash.com/photo-1722691292950-d2a2c501b159?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1722691292950-d2a2c501b159', 'Pistachio dessert', 0),
  ('ad222387-aa3a-427f-ad20-3c0ea7059a6a'::uuid, 'e4c8e273-5baa-4c11-b59f-ab9abda5be76'::uuid, 'https://images.unsplash.com/photo-1684873878361-52ea727733db?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1684873878361-52ea727733db', 'Assorted cookies', 0),
  ('b3191f88-5625-4e23-a0bc-d8531f8c4644'::uuid, 'd31c6b43-8d5a-42d0-8404-694bb2b0a301'::uuid, 'https://images.unsplash.com/photo-1722691292950-d2a2c501b159?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1722691292950-d2a2c501b159', 'Creamy pudding with pistachio', 0),
  ('176d6944-a695-4ab4-b18d-84dcd99381c0'::uuid, 'd4710510-3cbc-414d-8e0d-54e947bb8afd'::uuid, 'https://images.unsplash.com/photo-1527515545081-5db817172677?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1527515545081-5db817172677', 'Lebanese coffee', 0),
  ('a7e5ce44-09f6-4488-9b2e-c60af40c09e2'::uuid, '44f200d8-64a7-4d53-b160-506ac928011e'::uuid, 'https://images.unsplash.com/photo-1696957024709-0e3e7df73aaf?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1696957024709-0e3e7df73aaf', 'Mint lemonade', 0),
  ('ef0f493d-f117-4f3e-a548-81081616b8f5'::uuid, 'c68fea28-6f0d-419f-a37e-d5bc6f8210f1'::uuid, 'https://images.unsplash.com/photo-1696957024709-0e3e7df73aaf?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1696957024709-0e3e7df73aaf', 'Cold drink', 0),
  ('1a579e34-e2ec-47d1-9d75-01c13aa6f9c7'::uuid, '3482f907-06d1-4863-a38c-be50eb749f46'::uuid, 'https://images.unsplash.com/photo-1696957024709-0e3e7df73aaf?auto=format&fit=crop&w=1600&q=80', 'external:unsplash:1696957024709-0e3e7df73aaf', 'Chilled drink', 0)
on conflict (id) do update set
  product_id = excluded.product_id,
  url = excluded.url,
  path = excluded.path,
  alt_text = excluded.alt_text,
  sort_order = excluded.sort_order;

commit;
