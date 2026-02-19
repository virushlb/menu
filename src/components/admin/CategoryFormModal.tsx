import React, { useEffect } from 'react';
import { Dialog } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Switch } from '@/components/ui/Switch';
import { cn } from '@/lib/utils';
import type { Category } from '@/types/db';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof schema>;

export type CategoryFormPayload = FormValues & {
  coverFile: File | null;
  removeCover: boolean;
};

export function CategoryFormModal({
  open,
  onClose,
  initial,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initial?: Category | null;
  onSubmit: (values: CategoryFormPayload) => Promise<void>;
}) {
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverPreview, setCoverPreview] = React.useState<string | null>(null);
  const [removeCover, setRemoveCover] = React.useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      is_active: initial?.is_active ?? true,
    },
  });

  useEffect(() => {
    reset({
      name: initial?.name ?? '',
      description: initial?.description ?? '',
      is_active: initial?.is_active ?? true,
    });

    // Reset cover state
    setRemoveCover(false);
    setCoverFile(null);
    setCoverPreview(initial?.cover_image_url ?? null);
  }, [initial, reset, open]);

  useEffect(() => {
    return () => {
      // Cleanup blob URLs
      if (coverPreview && coverPreview.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview);
      }
    };
  }, [coverPreview]);

  const isActive = watch('is_active');

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
                className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-soft"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Dialog.Title className="text-base font-semibold">
                      {initial ? 'Edit category' : 'Add category'}
                    </Dialog.Title>
                    <div className="mt-1 text-sm text-zinc-600">Used to group products on the menu.</div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full p-2 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form
                  className="mt-6 space-y-4"
                  onSubmit={handleSubmit(async (values) => {
                    await onSubmit({
                      ...values,
                      coverFile,
                      removeCover,
                    });
                    onClose();
                  })}
                >
                  <div>
                    <div className="mb-1 text-xs font-semibold text-zinc-600">Name</div>
                    <Input placeholder="Starters" {...register('name')} />
                    {errors.name ? (
                      <div className="mt-1 text-xs text-red-600">{errors.name.message}</div>
                    ) : null}
                  </div>

                  <div>
                    <div className="mb-1 text-xs font-semibold text-zinc-600">Description (optional)</div>
                    <Textarea placeholder="Small bites to begin…" {...register('description')} />
                  </div>

                  {/* Cover image */}
                  <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold">Category cover image</div>
                        <div className="mt-1 text-xs text-zinc-600">
                          Optional. Used as a section banner on the public menu.
                        </div>
                      </div>

                      <label
                        className={cn(
                          'inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                          'bg-zinc-900 text-white hover:bg-zinc-800'
                        )}
                      >
                        <ImagePlus className="h-4 w-4" />
                        Choose image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            if (!f) return;
                            // Cleanup previous blob preview
                            if (coverPreview && coverPreview.startsWith('blob:')) {
                              URL.revokeObjectURL(coverPreview);
                            }
                            setCoverFile(f);
                            setRemoveCover(false);
                            setCoverPreview(URL.createObjectURL(f));
                            e.currentTarget.value = '';
                          }}
                        />
                      </label>
                    </div>

                    {coverPreview ? (
                      <div className="mt-4">
                        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                          <img src={coverPreview} alt="" className="h-40 w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => {
                              if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
                              setCoverPreview(null);
                              setCoverFile(null);
                              // If editing and there was an existing cover, mark for removal
                              if (initial?.cover_image_url) setRemoveCover(true);
                            }}
                            className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-xl bg-white/85 px-3 py-2 text-sm font-medium text-red-700 shadow-sm backdrop-blur transition hover:bg-white"
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </button>
                        </div>
                        {removeCover ? (
                          <div className="mt-2 text-xs text-amber-700">
                            Cover will be removed when you save.
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                        No cover image. (Optional)
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                    <div>
                      <div className="text-sm font-medium">Visible on menu</div>
                      <div className="mt-1 text-xs text-zinc-600">
                        If disabled, this category is hidden from the public menu.
                      </div>
                    </div>
                    <Switch checked={isActive} onChange={(v) => setValue('is_active', v)} />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving…' : 'Save'}
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
