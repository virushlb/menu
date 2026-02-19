import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAdminMenu } from '@/hooks/useAdminMenu';
import type { Category } from '@/types/db';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { CategoryFormModal, type CategoryFormPayload } from '@/components/admin/CategoryFormModal';
import { deleteStoragePath, uploadSingleImage } from '@/lib/menuService';

function SortableRow({
  category,
  onEdit,
  onDelete,
  onToggle,
}: {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (c: Category) => void;
  onToggle: (c: Category, v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition ${
        isDragging ? 'opacity-70' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          className="mt-0.5 rounded-xl p-2 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900"
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
            {category.cover_image_url ? (
              <img src={category.cover_image_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-zinc-50 to-zinc-200" />
            )}
          </div>

          <div>
          <div className="text-sm font-semibold text-zinc-900">{category.name}</div>
          {category.description ? (
            <div className="mt-1 text-sm text-zinc-600">{category.description}</div>
          ) : (
            <div className="mt-1 text-sm text-zinc-400">No description</div>
          )}
          <div className="mt-2 text-xs text-zinc-500">Sort order: {category.sort_order}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:block text-xs font-semibold text-zinc-500">Visible</div>
        <Switch checked={category.is_active} onChange={(v) => onToggle(category, v)} />
        <Button variant="secondary" onClick={() => onEdit(category)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button variant="danger" onClick={() => onDelete(category)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const adminMenu = useAdminMenu();
  const categories = adminMenu.data?.categories ?? [];

  const [items, setItems] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    setItems([...categories].sort((a, b) => a.sort_order - b.sort_order));
  }, [categories]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const ids = useMemo(() => items.map((c) => c.id), [items]);

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = arrayMove(items, oldIndex, newIndex).map((c, idx) => ({ ...c, sort_order: idx }));
    setItems(next);

    try {
      for (const c of next) {
        const { error } = await supabase.from('categories').update({ sort_order: c.sort_order }).eq('id', c.id);
        if (error) throw error;
      }
      toast.success('Category order updated');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-menu'] }),
        queryClient.invalidateQueries({ queryKey: ['public-menu'] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not reorder');
      // Refetch to revert
      await queryClient.invalidateQueries({ queryKey: ['admin-menu'] });
    }
  };

  const upsertCategory = async (values: CategoryFormPayload) => {
    try {
      if (editing) {
        const oldPath = editing.cover_image_path;

        // If a new file is selected, upload first (so we can update DB with the new url/path).
        let nextCover: { url: string; path: string } | null = null;
        if (values.coverFile) {
          nextCover = await uploadSingleImage({
            folder: `categories/${editing.id}`,
            file: values.coverFile,
          });
        }

        const { error } = await supabase
          .from('categories')
          .update({
            name: values.name,
            description: values.description ?? null,
            is_active: values.is_active,
            ...(nextCover
              ? { cover_image_url: nextCover.url, cover_image_path: nextCover.path }
              : values.removeCover
                ? { cover_image_url: null, cover_image_path: null }
                : {}),
          })
          .eq('id', editing.id);
        if (error) throw error;

        // Cleanup old cover AFTER db update succeeds
        if (values.removeCover && oldPath) {
          await deleteStoragePath(oldPath);
        }
        if (nextCover && oldPath) {
          await deleteStoragePath(oldPath);
        }

        toast.success('Category updated');
      } else {
        const maxSort = items.reduce((m, c) => Math.max(m, c.sort_order), -1);

        // Create category first so we have an id for storing the cover image.
        const { data: created, error } = await supabase
          .from('categories')
          .insert({
            name: values.name,
            description: values.description ?? null,
            is_active: values.is_active,
            sort_order: maxSort + 1,
          })
          .select('*')
          .single();
        if (error) throw error;

        // Optional cover upload
        if (values.coverFile) {
          const nextCover = await uploadSingleImage({
            folder: `categories/${(created as any).id}`,
            file: values.coverFile,
          });

          const { error: upErr } = await supabase
            .from('categories')
            .update({
              cover_image_url: nextCover.url,
              cover_image_path: nextCover.path,
            })
            .eq('id', (created as any).id);
          if (upErr) {
            // Avoid leaving orphan file
            await deleteStoragePath(nextCover.path);
            throw upErr;
          }
        }

        toast.success('Category created');
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-menu'] }),
        queryClient.invalidateQueries({ queryKey: ['public-menu'] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not save category');
      throw e;
    }
  };

  const toggleCategory = async (c: Category, v: boolean) => {
    try {
      const { error } = await supabase.from('categories').update({ is_active: v }).eq('id', c.id);
      if (error) throw error;
      toast.success(v ? 'Category is now visible' : 'Category hidden');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-menu'] }),
        queryClient.invalidateQueries({ queryKey: ['public-menu'] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not update');
    }
  };

  const deleteCategory = async (c: Category) => {
    const ok = confirm(
      `Delete category "${c.name}"?\n\nThis will fail if products still reference it. (Recommended: hide it instead.)`
    );
    if (!ok) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', c.id);
      if (error) throw error;
      if (c.cover_image_path) {
        await deleteStoragePath(c.cover_image_path);
      }
      toast.success('Category deleted');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin-menu'] }),
        queryClient.invalidateQueries({ queryKey: ['public-menu'] }),
      ]);
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl">Categories</h1>
          <p className="mt-1 text-sm text-zinc-600">Reorder them by dragging. Toggle visibility anytime.</p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          Add category
        </Button>
      </div>

      {adminMenu.isLoading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">Loading…</div>
      ) : adminMenu.isError ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold">Could not load</div>
          <div className="mt-2 text-sm text-zinc-700">{String(adminMenu.error)}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold">No categories yet</div>
          <div className="mt-2 text-sm text-zinc-700">Create your first category to start building the menu.</div>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((c) => (
                <SortableRow
                  key={c.id}
                  category={c}
                  onEdit={(cat) => {
                    setEditing(cat);
                    setModalOpen(true);
                  }}
                  onDelete={deleteCategory}
                  onToggle={toggleCategory}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <CategoryFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSubmit={upsertCategory}
      />
    </div>
  );
}
