import React, { useEffect, useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, ImagePlus, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';
import type { Category, Product, ProductImage, UUID } from '@/types/db';
import { deleteProductImage, reorderProductImages, uploadProductImages } from '@/lib/menuService';
import { supabase } from '@/lib/supabaseClient';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  price: z.coerce.number().positive('Price must be positive'),
  category_id: z.string().min(1, 'Choose a category'),
  tags: z.string().optional(),
  is_featured: z.boolean().default(false),
  is_available: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

type NewFile = {
  id: string;
  file: File;
  previewUrl: string;
};

function SortableImage({
  image,
  onRemove,
}: {
  image: ProductImage;
  onRemove: (img: ProductImage) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-zinc-200 bg-white',
        isDragging && 'opacity-70'
      )}
    >
      <img src={image.url} alt="" className="h-28 w-full object-cover" />

      <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
        <button
          className="rounded-xl bg-white/80 p-2 text-zinc-700 shadow-sm backdrop-blur transition hover:bg-white"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={() => onRemove(image)}
          className="rounded-xl bg-white/80 p-2 text-red-700 shadow-sm backdrop-blur transition hover:bg-white"
          aria-label="Remove image"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="absolute bottom-2 left-2 rounded-full bg-white/80 px-2 py-1 text-xs text-zinc-700 shadow-sm backdrop-blur">
        {image.sort_order + 1}
      </div>
    </div>
  );
}

export function ProductFormModal({
  open,
  onClose,
  categories,
  initial,
  initialImages,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  initial?: Product | null;
  initialImages?: ProductImage[];
  onSaved: () => Promise<void>;
}) {
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [newFiles, setNewFiles] = useState<NewFile[]>([]);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      category_id: initial?.category_id ?? (categories[0]?.id ?? ''),
      tags: (initial?.tags ?? []).join(', '),
      is_featured: initial?.is_featured ?? false,
      is_available: initial?.is_available ?? true,
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      price: initial?.price ?? 0,
      category_id: initial?.category_id ?? (categories[0]?.id ?? ''),
      tags: (initial?.tags ?? []).join(', '),
      is_featured: initial?.is_featured ?? false,
      is_available: initial?.is_available ?? true,
    });

    setExistingImages([...(initialImages ?? [])].sort((a, b) => a.sort_order - b.sort_order));
    // Cleanup previews for new files
    setNewFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      return [];
    });
  }, [initial, initialImages, categories, reset, open]);

  const isAvailable = watch('is_available');
  const isFeatured = watch('is_featured');
  const totalImages = existingImages.length + newFiles.length;
  const remainingSlots = Math.max(0, 5 - totalImages);

  const existingIds = useMemo(() => existingImages.map((img) => img.id), [existingImages]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = existingImages.findIndex((i) => i.id === active.id);
    const newIndex = existingImages.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(existingImages, oldIndex, newIndex).map((img, idx) => ({
      ...img,
      sort_order: idx,
    }));
    setExistingImages(next);
  };

  const removeExisting = async (img: ProductImage) => {
    const ok = confirm('Remove this photo? This will delete it from storage too.');
    if (!ok) return;

    try {
      const res = await deleteProductImage({ id: img.id, path: img.path });
      const next = existingImages.filter((x) => x.id !== img.id).map((x, idx) => ({ ...x, sort_order: idx }));
      setExistingImages(next);
      if (initial?.id) {
        await reorderProductImages({ productId: initial.id, orderedIds: next.map((x) => x.id) });
      }
      if (res.storageError) {
        toast.error(`Photo removed, but storage cleanup failed: ${res.storageError.message}`);
      } else {
        toast.success('Photo removed');
      }
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not remove');
    }
  };

  const removeNewFile = (id: string) => {
    setNewFiles((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;

    if (remainingSlots <= 0) {
      toast.error('Max 5 photos per product');
      return;
    }

    const toAdd = list.slice(0, remainingSlots).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    if (list.length > remainingSlots) {
      toast('Only the first few photos were added (max 5 total).');
    }

    setNewFiles((prev) => [...prev, ...toAdd]);
  };

  const submit = async (values: FormValues) => {
    setSaving(true);
    try {
      // 1) Upsert product
      const tags = (values.tags ?? '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8);

      let productId: UUID;

      if (initial) {
        productId = initial.id;
        const { error } = await supabase
          .from('products')
          .update({
            name: values.name,
            description: values.description ?? null,
            price: values.price,
            category_id: values.category_id,
            tags,
            is_featured: values.is_featured,
            is_available: values.is_available,
          })
          .eq('id', initial.id);
        if (error) throw error;
      } else {

        const { data: last, error: lastErr } = await supabase
          .from('products')
          .select('sort_order')
          .eq('category_id', values.category_id)
          .order('sort_order', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (lastErr) throw lastErr;
        const nextSort = ((last as any)?.sort_order ?? -1) + 1;

        const { data: created, error } = await supabase
          .from('products')
          .insert({
            name: values.name,
            description: values.description ?? null,
            price: values.price,
            category_id: values.category_id,
            tags,
            is_featured: values.is_featured,
            is_available: values.is_available,
            sort_order: nextSort,
          })
          .select('*')
          .single();
        if (error) throw error;
        productId = (created as any).id as UUID;
      }

      // 2) Persist image reorder (existing only)
      if (initial && existingImages.length > 1) {
        await reorderProductImages({ productId, orderedIds: existingImages.map((img) => img.id) });
      }

      // 3) Upload new images
      if (newFiles.length) {
        if (existingImages.length + newFiles.length > 5) {
          toast.error('Max 5 photos per product');
          return;
        }

        await uploadProductImages({
          productId,
          files: newFiles.map((f) => f.file),
          startSortOrder: existingImages.length,
          onProgress: ({ uploaded, total, fileName }) => {
            toast.loading(`Uploading ${uploaded}/${total}: ${fileName}`, { id: 'upload' });
          },
        });
        toast.dismiss('upload');
      }

      toast.success(initial ? 'Product updated' : 'Product created');
      await onSaved();
      onClose();
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <Dialog as="div" className="relative z-50" open={open} onClose={onClose}>
          <motion.div
            className="fixed inset-0 bg-black/55"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center px-4 py-10">
              <Dialog.Panel
                as={motion.div}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                className="w-full max-w-3xl rounded-3xl bg-white p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-base font-semibold">
                      {initial ? 'Edit product' : 'Add product'}
                    </Dialog.Title>
                    <div className="mt-1 text-sm text-zinc-600">
                      Photos: max 5. You can remove photos while editing.
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form className="mt-6 space-y-6" onSubmit={handleSubmit(submit)}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs font-semibold text-zinc-600">Name</div>
                      <Input placeholder="Truffle Fries" {...register('name')} />
                      {errors.name ? (
                        <div className="mt-1 text-xs text-red-600">{errors.name.message}</div>
                      ) : null}
                    </div>

                    <div>
                      <div className="mb-1 text-xs font-semibold text-zinc-600">Category</div>
                      <select
                        className="h-10 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm focus:border-zinc-400 focus:outline-none"
                        {...register('category_id')}
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      {errors.category_id ? (
                        <div className="mt-1 text-xs text-red-600">{errors.category_id.message}</div>
                      ) : null}
                    </div>

                    <div>
                      <div className="mb-1 text-xs font-semibold text-zinc-600">Price</div>
                      <Input type="number" step="0.01" placeholder="12.00" {...register('price')} />
                      {errors.price ? (
                        <div className="mt-1 text-xs text-red-600">{errors.price.message}</div>
                      ) : null}
                    </div>

                    <div>
                      <div className="mb-1 text-xs font-semibold text-zinc-600">Tags (optional)</div>
                      <Input placeholder="Vegan, Spicy, New" {...register('tags')} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-semibold text-zinc-600">Description (optional)</div>
                    <Textarea placeholder="Crispy fries with truffle oil…" {...register('description')} />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div>
                      <div className="text-sm font-medium">Available</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        If disabled, the product is hidden from the public menu.
                      </div>
                    </div>
                    <Switch checked={isAvailable} onChange={(v) => setValue('is_available', v)} />
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-4">
                    <div>
                      <div className="text-sm font-medium">Featured (Chef’s pick)</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        Featured items appear in the “Chef’s picks” section on the public menu.
                      </div>
                    </div>
                    <Switch checked={isFeatured} onChange={(v) => setValue('is_featured', v)} />
                  </div>

                  {/* Images */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">Photos</div>
                        <div className="mt-1 text-xs text-zinc-600">
                          {totalImages}/5 used • {remainingSlots} slot(s) left
                        </div>
                      </div>

                      <label className={cn('inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                        remainingSlots ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                      )}>
                        <ImagePlus className="h-4 w-4" />
                        Add photos
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          disabled={!remainingSlots}
                          onChange={(e) => {
                            handleFiles(e.target.files);
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {existingImages.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 text-xs font-semibold text-zinc-500">Existing photos</div>
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                          <SortableContext items={existingIds} strategy={verticalListSortingStrategy}>
                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                              {existingImages.map((img) => (
                                <SortableImage key={img.id} image={img} onRemove={removeExisting} />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                        <div className="mt-2 text-xs text-zinc-500">
                          Drag photos to reorder.
                        </div>
                      </div>
                    )}

                    {newFiles.length > 0 && (
                      <div className="mt-4">
                        <div className="mb-2 text-xs font-semibold text-zinc-500">New photos (will upload on save)</div>
                        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                          {newFiles.map((f) => (
                            <div
                              key={f.id}
                              className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white"
                            >
                              <img src={f.previewUrl} alt="" className="h-28 w-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeNewFile(f.id)}
                                className="absolute right-2 top-2 rounded-xl bg-white/80 p-2 text-red-700 shadow-sm backdrop-blur transition hover:bg-white"
                                aria-label="Remove selected image"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {totalImages === 0 && (
                      <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                        Add up to 5 photos to make your menu feel premium.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </div>
          </div>
        </Dialog>
      )}
    </AnimatePresence>
  );
}
