import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Phone, Search } from 'lucide-react';
import { CategoryNav } from '@/components/public/CategoryNav';
import { MenuItemRow } from '@/components/public/MenuItemRow';
import { ProductModal } from '@/components/public/ProductModal';
import { Input } from '@/components/ui/Input';
import { useRestaurantBrand } from '@/hooks/useRestaurantBrand';
import { usePublicMenu } from '@/hooks/usePublicMenu';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import type { Category, Product, ProductImage } from '@/types/db';

const CITY_VIBES_IMAGES = [
  {
    url: 'https://images.unsplash.com/photo-1681157946239-fc080036b18a?auto=format&fit=crop&w=1600&q=80',
    alt: 'Beirut streets',
  },
  {
    url: 'https://images.unsplash.com/photo-1717541378810-d06940c7e97b?auto=format&fit=crop&w=1600&q=80',
    alt: 'Beirut coastline',
  },
  {
    url: 'https://images.unsplash.com/photo-1642105245501-5becd6f24501?auto=format&fit=crop&w=1600&q=80',
    alt: 'Cafe ambience',
  },
  {
    url: 'https://images.unsplash.com/photo-1743674453093-592bed88018e?auto=format&fit=crop&w=1600&q=80',
    alt: 'Lebanese mezze',
  },
];

function buildImageMap(images: ProductImage[]) {
  const map = new Map<string, ProductImage[]>();
  for (const img of images) {
    const arr = map.get(img.product_id) ?? [];
    arr.push(img);
    map.set(img.product_id, arr);
  }
  for (const [k, arr] of map) {
    arr.sort((a, b) => a.sort_order - b.sort_order);
    map.set(k, arr);
  }
  return map;
}

export function MenuPage() {
  const menuQuery = usePublicMenu();
  const { brand, settingsQuery } = useRestaurantBrand();
  const [search, setSearch] = useState('');

  const [selected, setSelected] = useState<{ product: Product; images: ProductImage[] } | null>(null);

  const normalized = search.trim().toLowerCase();

  const { categories, products, images } = menuQuery.data ?? {
    categories: [] as Category[],
    products: [] as Product[],
    images: [] as ProductImage[],
  };

  const imagesByProduct = useMemo(() => buildImageMap(images), [images]);

  const filteredProducts = useMemo(() => {
    if (!normalized) return products;
    return products.filter((p) => {
      const hay = `${p.name} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase();
      return hay.includes(normalized);
    });
  }, [products, normalized]);

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>();
    for (const p of filteredProducts) {
      const arr = map.get(p.category_id) ?? [];
      arr.push(p);
      map.set(p.category_id, arr);
    }
    for (const [k, arr] of map) {
      arr.sort((a, b) => a.sort_order - b.sort_order);
      map.set(k, arr);
    }
    return map;
  }, [filteredProducts]);

  const visibleCategories = useMemo(() => {
    return categories.filter((c) => (productsByCategory.get(c.id) ?? []).length > 0);
  }, [categories, productsByCategory]);

  const featuredProducts = useMemo(() => {
    return products
      .filter((p) => p.is_featured)
      .slice()
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  }, [products]);

  const sectionIds = useMemo(() => visibleCategories.map((c) => `cat-${c.id}`), [visibleCategories]);
  const activeSectionId = useScrollSpy(sectionIds);

  const jumpTo = (categoryId: string) => {
    const el = document.getElementById(`cat-${categoryId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const s = settingsQuery.data;
  const hasStory = Boolean((s?.about_title ?? "").trim() || (s?.about_text ?? "").trim() || (s?.about_image_url ?? "").trim());

  return (
    <div className="mx-auto max-w-5xl px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        className="paper-surface grain overflow-hidden rounded-3xl border border-zinc-200/70 bg-white/80 shadow-soft"
      >
        <div className="p-6 sm:p-10">
          {/* Menu header (simple, menu-like) */}
          <div className="text-center">
            <div className="text-xs font-semibold tracking-[0.22em] text-zinc-500">MENU</div>
            <h1 className="mt-2 font-serif text-4xl tracking-tight text-zinc-900 sm:text-6xl">
              {brand.name}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-600 sm:text-base">
              {brand.tagline}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-zinc-700">
              <a
                href={brand.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-2 hover:bg-white"
              >
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{brand.address}</span>
              </a>
              <a
                href={`tel:${brand.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-2 hover:bg-white"
              >
                <Phone className="h-4 w-4" />
                <span className="font-medium">{brand.phone}</span>
              </a>
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-4 py-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">{brand.hours}</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-zinc-500">Menu only — no online ordering.</div>

            {/* City vibes strip (keeps the page feeling full even before content is added) */}
            <div className="mt-7">
              <div className="text-[10px] font-semibold tracking-[0.22em] text-zinc-500">
                CITY VIBES • BEIRUT
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {CITY_VIBES_IMAGES.map((img) => (
                  <img
                    key={img.url}
                    src={img.url}
                    alt={img.alt}
                    className="h-24 w-full rounded-2xl border border-zinc-200 object-cover shadow-sm sm:h-28"
                    loading="lazy"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 h-px w-full bg-zinc-200/80" />

          {/* Search */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Menu</h2>
              <p className="mt-2 text-sm text-zinc-600">
                Tap any item for photos and details.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search dishes…"
                className="pl-9 bg-white"
              />
            </div>
          </div>

          {/* Category quick jump */}
          {visibleCategories.length > 1 ? (
            <div className="mt-4">
              <CategoryNav categories={visibleCategories} activeSectionId={activeSectionId} onJump={jumpTo} />
            </div>
          ) : null}

          {/* Featured (menu-style, no cards) */}
          {!normalized && featuredProducts.length > 0 && !menuQuery.isLoading && !menuQuery.isError ? (
            <section className="mt-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="text-xs font-semibold tracking-[0.22em] text-zinc-500">CHEF’S PICKS</div>
                  <div className="mt-2 font-serif text-xl">Featured</div>
                  <div className="mt-1 text-sm text-zinc-600">A short list of signature items.</div>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-200 bg-white/70">
                {featuredProducts.slice(0, 8).map((p, idx) => {
                  const imgs = imagesByProduct.get(p.id) ?? [];
                  const isLast = idx === Math.min(featuredProducts.length, 8) - 1;
                  return (
                    <div
                      key={p.id}
                      className={isLast ? '' : 'border-b border-dashed border-zinc-200/80'}
                    >
                      <MenuItemRow
                        product={p}
                        images={imgs}
                        currency={brand.currency}
                        featured
                        onClick={() => setSelected({ product: p, images: imgs })}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {/* Menu content */}
          {menuQuery.isLoading ? (
            <div className="mt-8 space-y-6">
              <div className="h-8 w-40 rounded-lg skeleton" />
              <div className="space-y-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl border border-zinc-200 bg-white/70 skeleton" />
                ))}
              </div>
            </div>
          ) : menuQuery.isError ? (
            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-base font-semibold">Could not load the menu</div>
              <div className="mt-2 text-sm text-zinc-700">{String(menuQuery.error)}</div>
            </div>
          ) : visibleCategories.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6">
              <div className="text-base font-semibold">No items found</div>
              <div className="mt-2 text-sm text-zinc-700">
                {normalized ? 'Try a different search term.' : 'Add categories and products from the admin dashboard.'}
              </div>
            </div>
          ) : (
            <div className="mt-8 space-y-10">
              {visibleCategories.map((category) => {
                const catProducts = productsByCategory.get(category.id) ?? [];
                return (
                  <section key={category.id} id={`cat-${category.id}`} className="scroll-mt-28">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <h3 className="font-serif text-2xl text-zinc-900">{category.name}</h3>
                        {category.description ? (
                          <p className="mt-1 text-sm text-zinc-600">{category.description}</p>
                        ) : null}
                      </div>

                      {/* Optional category image (kept small so it stays menu-like) */}
                      {category.cover_image_url ? (
                        <img
                          src={category.cover_image_url}
                          alt={category.name}
                          className="hidden h-16 w-24 rounded-2xl border border-zinc-200 object-cover shadow-sm sm:block"
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="mt-4 h-px w-full bg-zinc-200/80" />

                    <div className="mt-3 rounded-2xl border border-zinc-200 bg-white/70">
                      {catProducts.map((p, idx) => {
                        const imgs = imagesByProduct.get(p.id) ?? [];
                        const isLast = idx === catProducts.length - 1;
                        return (
                          <div
                            key={p.id}
                            className={isLast ? '' : 'border-b border-dashed border-zinc-200/80'}
                          >
                            <MenuItemRow
                              product={p}
                              images={imgs}
                              currency={brand.currency}
                              onClick={() => setSelected({ product: p, images: imgs })}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              {/* Story / About (kept subtle, optional) */}
              {hasStory ? (
                <motion.section
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 360, damping: 30 }}
                  className="mt-10 rounded-3xl border border-zinc-200 bg-white/70 p-6"
                >
                  <div className="grid gap-5 sm:grid-cols-[1fr_220px] sm:items-start">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.22em] text-zinc-500">OUR STORY</div>
                      <h4 className="mt-2 font-serif text-2xl text-zinc-900">
                        {brand.aboutTitle || 'About'}
                      </h4>
                      {brand.aboutText ? (
                        <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-700">
                          {brand.aboutText}
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-zinc-600">Add your story from Admin → Settings.</p>
                      )}
                    </div>

                    {brand.aboutImageUrl ? (
                      <img
                        src={brand.aboutImageUrl}
                        alt="Restaurant"
                        className="h-40 w-full rounded-2xl border border-zinc-200 object-cover shadow-sm"
                        loading="lazy"
                      />
                    ) : null}
                  </div>
                </motion.section>
              ) : null}
            </div>
          )}

          <div className="mt-10 text-center text-xs text-zinc-500">
            Prices & availability may change.
          </div>
        </div>
      </motion.div>

      {selected && (
        <ProductModal
          open={Boolean(selected)}
          onClose={() => setSelected(null)}
          product={selected.product}
          images={selected.images}
          currency={brand.currency}
        />
      )}
    </div>
  );
}
