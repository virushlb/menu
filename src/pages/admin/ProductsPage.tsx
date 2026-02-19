import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, ImageOff, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminMenu } from '@/hooks/useAdminMenu';
import { supabase, STORAGE_BUCKET } from '@/lib/supabaseClient';
import type { Category, Product, ProductImage } from '@/types/db';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Switch } from '@/components/ui/Switch';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { BRAND } from '@/config/branding';
import { formatPrice } from '@/lib/format';

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

export function ProductsPage() {
  const queryClient = useQueryClient();
  const adminMenu = useAdminMenu();

  const categories = adminMenu.data?.categories ?? [];
  const products = adminMenu.data?.products ?? [];
  const images = adminMenu.data?.images ?? [];

  const imagesByProduct = useMemo(() => buildImageMap(images), [images]);
  const categoriesById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const normalized = search.trim().toLowerCase();

  const filtered = useMemo(() => {
    return products
      .filter((p) => (categoryFilter === 'all' ? true : p.category_id === categoryFilter))
      .filter((p) => (featuredOnly ? p.is_featured : true))
      .filter((p) => {
        if (!normalized) return true;
        const hay = `${p.name} ${p.description ?? ''} ${(p.tags ?? []).join(' ')}`.toLowerCase();
        return hay.includes(normalized);
      })
      .sort((a, b) => {
        if (a.category_id !== b.category_id) return a.category_id.localeCompare(b.category_id);
        return a.sort_order - b.sort_order;
      });
  }, [products, normalized, categoryFilter]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setModalOpen(true);
  };

  const refresh = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-menu'] }),
      queryClient.invalidateQueries({ queryKey: ['public-menu'] }),
    ]);
  };

  const toggleAvailability = async (p: Product, v: boolean) => {
    try {
      const { error } = await supabase.from('products').update({ is_available: v }).eq('id', p.id);
      if (error) throw error;
      toast.success(v ? 'Product is visible' : 'Product hidden');
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not update');
    }
  };

  const deleteProduct = async (p: Product) => {
    const ok = confirm(
      `Delete product "${p.name}"?\n\nThis will remove it from the menu. Images will also be removed from storage.`
    );
    if (!ok) return;

    try {
      const imgs = imagesByProduct.get(p.id) ?? [];
      const paths = imgs.map((i) => i.path).filter(Boolean);
      if (paths.length) {
        const { error: storageErr } = await supabase.storage.from(STORAGE_BUCKET).remove(paths);
        if (storageErr) {
          // Warn but still proceed with db delete
          toast.error(`Storage cleanup warning: ${storageErr.message}`);
        }
      }

      const { error } = await supabase.from('products').delete().eq('id', p.id);
      if (error) throw error;
      toast.success('Product deleted');
      await refresh();
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not delete');
    }
  };

  const initialImages = editing ? imagesByProduct.get(editing.id) ?? [] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Products</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Manage menu items. Upload up to 5 photos per product.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add product
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-[1fr_260px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>

        <select
          className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm focus:border-zinc-400 focus:outline-none"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All categories</option>
          {categories
            .slice()
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}{c.is_active ? '' : ' (hidden)'}
              </option>
            ))}
        </select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div>
          <div className="text-sm font-semibold text-zinc-900">Quick filters</div>
          <div className="mt-1 text-xs text-zinc-600">Show featured items only (Chef’s picks).</div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs font-semibold text-zinc-500">Featured only</div>
          <Switch checked={featuredOnly} onChange={setFeaturedOnly} />
        </div>
      </div>

      {adminMenu.isLoading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">Loading…</div>
      ) : adminMenu.isError ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold">Could not load</div>
          <div className="mt-2 text-sm text-zinc-700">{String(adminMenu.error)}</div>
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold">No categories</div>
          <div className="mt-2 text-sm text-zinc-700">
            Create at least one category first, then you can add products.
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold">No products found</div>
          <div className="mt-2 text-sm text-zinc-700">Try changing the filters or add a new product.</div>
        </div>
      ) : (
        <motion.div
          layout
          className="grid gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          {filtered.map((p) => {
            const cover = (imagesByProduct.get(p.id) ?? [])[0]?.url;
            const cat = categoriesById.get(p.category_id);
            return (
              <div
                key={p.id}
                className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                    {cover ? (
                      <img src={cover} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-zinc-400">
                        <ImageOff className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex min-w-0 items-center gap-2">
                        {p.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">
                            <Star className="h-3.5 w-3.5" />
                            Featured
                          </span>
                        ) : null}
                        <div className="truncate text-sm font-semibold text-zinc-900">{p.name}</div>
                      </div>
                      <div className="text-sm font-semibold text-zinc-900">
                        {formatPrice(p.price, BRAND.currency)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-zinc-500">
                      Category: <span className="font-medium text-zinc-700">{cat?.name ?? '—'}</span>
                    </div>
                    {p.description ? (
                      <div className="mt-1 clamp-2 text-sm text-zinc-600">{p.description}</div>
                    ) : (
                      <div className="mt-1 text-sm text-zinc-400">No description</div>
                    )}
                    <div className="mt-2 text-xs text-zinc-500">
                      Photos: {(imagesByProduct.get(p.id) ?? []).length}/5
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <div className="mr-2 text-xs font-semibold text-zinc-500">Visible</div>
                  <Switch checked={p.is_available} onChange={(v) => toggleAvailability(p, v)} />
                  <Button variant="secondary" onClick={() => openEdit(p)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => deleteProduct(p)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      <ProductFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        categories={categories.sort((a, b) => a.sort_order - b.sort_order)}
        initial={editing}
        initialImages={initialImages}
        onSaved={refresh}
      />
    </div>
  );
}
