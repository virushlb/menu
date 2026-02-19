import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useRestaurantBrand } from '@/hooks/useRestaurantBrand';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { cn } from '@/lib/utils';
import { deleteStoragePath, uploadSingleImage } from '@/lib/menuService';

const schema = z.object({
  name: z.string().optional(),
  tagline: z.string().optional(),
  currency: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  about_title: z.string().optional(),
  about_text: z.string().optional(),
  maps_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  instagram_url: z
    .string()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

function toNullable(v: string | undefined) {
  const t = (v ?? '').trim();
  return t.length ? t : null;
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settingsQuery = useRestaurantSettings();
  const { brand } = useRestaurantBrand();

  const [aboutFile, setAboutFile] = React.useState<File | null>(null);
  const [aboutPreview, setAboutPreview] = React.useState<string | null>(null);
  const [removeAboutImage, setRemoveAboutImage] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      tagline: '',
      currency: '',
      address: '',
      phone: '',
      hours: '',
      about_title: '',
      about_text: '',
      maps_url: '',
      instagram_url: '',
    },
  });

  useEffect(() => {
    const s = settingsQuery.data;
    reset({
      name: s?.name ?? '',
      tagline: s?.tagline ?? '',
      currency: s?.currency ?? '',
      address: s?.address ?? '',
      phone: s?.phone ?? '',
      hours: s?.hours ?? '',
      about_title: s?.about_title ?? '',
      about_text: s?.about_text ?? '',
      maps_url: s?.maps_url ?? '',
      instagram_url: s?.instagram_url ?? '',
    });

    setRemoveAboutImage(false);
    setAboutFile(null);
    setAboutPreview(s?.about_image_url ?? null);
  }, [settingsQuery.data, reset]);

  useEffect(() => {
    return () => {
      if (aboutPreview && aboutPreview.startsWith('blob:')) {
        URL.revokeObjectURL(aboutPreview);
      }
    };
  }, [aboutPreview]);

  const save = async (values: FormValues) => {
    try {
      const current = settingsQuery.data;
      const oldAboutPath = current?.about_image_path ?? null;

      // Optional about image upload/removal
      let aboutUpload: { url: string; path: string } | null = null;
      if (aboutFile) {
        aboutUpload = await uploadSingleImage({
          folder: 'branding/about',
          file: aboutFile,
        });
      }

      const payload = {
        id: 1,
        name: toNullable(values.name),
        tagline: toNullable(values.tagline),
        currency: toNullable(values.currency),
        address: toNullable(values.address),
        phone: toNullable(values.phone),
        hours: toNullable(values.hours),
        maps_url: toNullable(values.maps_url),
        instagram_url: toNullable(values.instagram_url),

        about_title: toNullable(values.about_title),
        about_text: toNullable(values.about_text),
        ...(aboutUpload
          ? { about_image_url: aboutUpload.url, about_image_path: aboutUpload.path }
          : removeAboutImage
            ? { about_image_url: null, about_image_path: null }
            : {}),
      };

      const { error } = await supabase
        .from('restaurant_settings')
        .upsert(payload, { onConflict: 'id' });

      if (error) throw error;

      // Cleanup previous about image after DB update succeeds
      if (aboutUpload && oldAboutPath) {
        await deleteStoragePath(oldAboutPath);
      }
      if (removeAboutImage && oldAboutPath) {
        await deleteStoragePath(oldAboutPath);
      }

      toast.success('Settings saved');
      await queryClient.invalidateQueries({ queryKey: ['restaurant-settings'] });
    } catch (e: any) {
      toast.error(e?.message ?? 'Could not save settings');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl">Restaurant settings</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Edit the public details (phone, location, hours). The menu stays “view only” — no ordering.
        </p>
      </div>

      {settingsQuery.isLoading ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">Loading…</div>
      ) : settingsQuery.isError ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-soft">
          <div className="text-sm font-semibold">Could not load settings</div>
          <div className="mt-2 text-sm text-zinc-700">{String(settingsQuery.error)}</div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit(save)}
            className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">Restaurant name</div>
                <Input placeholder={brand.name} {...register('name')} />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">Tagline</div>
                <Textarea
                  rows={2}
                  placeholder={brand.tagline}
                  {...register('tagline')}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">About section title (optional)</div>
                <Input placeholder={brand.aboutTitle} {...register('about_title')} />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">About text (optional)</div>
                <Textarea
                  rows={5}
                  placeholder={brand.aboutText}
                  {...register('about_text')}
                />
                <div className="mt-1 text-xs text-zinc-500">
                  This appears on the public menu page as the restaurant story.
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">About photo (optional)</div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm font-semibold">Image</div>
                      <div className="mt-1 text-xs text-zinc-600">Used next to the story section.</div>
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
                          if (aboutPreview && aboutPreview.startsWith('blob:')) {
                            URL.revokeObjectURL(aboutPreview);
                          }
                          setAboutFile(f);
                          setRemoveAboutImage(false);
                          setAboutPreview(URL.createObjectURL(f));
                          e.currentTarget.value = '';
                        }}
                      />
                    </label>
                  </div>

                  {aboutPreview ? (
                    <div className="mt-4">
                      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                        <img src={aboutPreview} alt="" className="h-44 w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => {
                            if (aboutPreview.startsWith('blob:')) URL.revokeObjectURL(aboutPreview);
                            setAboutPreview(null);
                            setAboutFile(null);
                            if (settingsQuery.data?.about_image_url) setRemoveAboutImage(true);
                          }}
                          className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-xl bg-white/85 px-3 py-2 text-sm font-medium text-red-700 shadow-sm backdrop-blur transition hover:bg-white"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      </div>
                      {removeAboutImage ? (
                        <div className="mt-2 text-xs text-amber-700">
                          Image will be removed when you save.
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
                      No about image.
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold text-zinc-600">Phone</div>
                <Input placeholder={brand.phone} {...register('phone')} />
              </div>

              <div>
                <div className="mb-1 text-xs font-semibold text-zinc-600">Hours</div>
                <Input placeholder={brand.hours} {...register('hours')} />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">Location / Address</div>
                <Textarea
                  rows={2}
                  placeholder={brand.address}
                  {...register('address')}
                />
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">Google Maps link</div>
                <Input placeholder={brand.mapsUrl} {...register('maps_url')} />
                {errors.maps_url ? (
                  <div className="mt-1 text-xs text-red-600">{errors.maps_url.message}</div>
                ) : null}
                <div className="mt-1 text-xs text-zinc-500">
                  Tip: open Google Maps → Share → Copy link.
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">Instagram link (optional)</div>
                <Input placeholder="https://instagram.com/yourpage" {...register('instagram_url')} />
                {errors.instagram_url ? (
                  <div className="mt-1 text-xs text-red-600">{errors.instagram_url.message}</div>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <div className="mb-1 text-xs font-semibold text-zinc-600">Currency (optional)</div>
                <Input placeholder={brand.currency} {...register('currency')} />
                <div className="mt-1 text-xs text-zinc-500">Example: USD, EUR, LBP</div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => reset()}
                disabled={isSubmitting}
              >
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save settings'}
              </Button>
            </div>
          </form>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-soft">
            <div className="text-xs font-semibold tracking-widest text-zinc-500">PREVIEW</div>
            <div className="mt-3 font-serif text-2xl text-zinc-900">{brand.name}</div>
            <div className="mt-1 text-sm text-zinc-600">{brand.tagline}</div>

            <div className="mt-4">
              <div className="text-xs font-semibold tracking-wide text-zinc-500">
                {brand.aboutTitle}
              </div>
              <div className="mt-2 text-sm text-zinc-700 whitespace-pre-line">
                {brand.aboutText}
              </div>
            </div>

            <div className="mt-5 space-y-2 text-sm text-zinc-700">
              <div>
                <span className="text-zinc-500">Phone:</span> {brand.phone}
              </div>
              <div>
                <span className="text-zinc-500">Hours:</span> {brand.hours}
              </div>
              <div>
                <span className="text-zinc-500">Location:</span> {brand.address}
              </div>
            </div>

            <div className="mt-5 text-xs text-zinc-500">
              The public site does not show any admin button. Access admin by typing <code>/admin</code>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
