import { supabase, STORAGE_BUCKET } from '@/lib/supabaseClient';
import type { ProductImage, UUID } from '@/types/db';

// We support both Supabase Storage objects (bucket paths like `products/...`) and
// external image URLs (e.g. Unsplash) for demo/portfolio content.
// External images should NOT be deleted from Storage.
function isExternalPath(path: string) {
  return (
    path.startsWith('http://') ||
    path.startsWith('https://') ||
    path.startsWith('external:')
  );
}

function sanitizeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9._-]/g, '');
}

export async function uploadSingleImage(args: {
  folder: string;
  file: File;
}): Promise<{ url: string; path: string }> {
  const { folder, file } = args;

  const ext = file.name.split('.').pop() || 'jpg';
  const safe = sanitizeFileName(file.name);
  const rand = crypto.randomUUID();
  const path = `${folder}/${rand}-${safe || 'image'}.${ext}`;

  const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl, path };
}

export async function deleteStoragePath(path: string) {
  if (!path) return;
  if (isExternalPath(path)) return;
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
}

export async function uploadProductImages(args: {
  productId: UUID;
  files: File[];
  startSortOrder: number;
  onProgress?: (p: { uploaded: number; total: number; fileName: string }) => void;
}): Promise<ProductImage[]> {
  const { productId, files, startSortOrder, onProgress } = args;

  const inserted: ProductImage[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop() || 'jpg';
    const safe = sanitizeFileName(file.name);
    const rand = crypto.randomUUID();
    const path = `products/${productId}/${rand}-${safe || 'image'}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl = urlData.publicUrl;

    const { data: imageRow, error: insertError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        url: publicUrl,
        path,
        sort_order: startSortOrder + i,
      })
      .select('*')
      .single();

    if (insertError) {
      // Cleanup uploaded file if DB insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([path]);
      throw insertError;
    }

    inserted.push(imageRow as ProductImage);
    onProgress?.({ uploaded: i + 1, total: files.length, fileName: file.name });
  }

  return inserted;
}

export async function deleteProductImage(image: Pick<ProductImage, 'id' | 'path'>) {
  // Delete the db row first (so UI updates even if storage delete fails).
  const { error: dbErr } = await supabase.from('product_images').delete().eq('id', image.id);
  if (dbErr) throw dbErr;

  // Then remove the file from storage.
  const { error: storageErr } = isExternalPath(image.path)
    ? { error: null }
    : await supabase.storage.from(STORAGE_BUCKET).remove([image.path]);

  return { storageError: storageErr ?? null };
}

export async function reorderProductImages(args: { productId: UUID; orderedIds: UUID[] }) {
  // Update sort_order based on the new order.
  // This uses multiple updates; for large lists you'd do an RPC, but max is 5 images.
  const updates = args.orderedIds.map((id, idx) => ({ id, sort_order: idx }));

  for (const u of updates) {
    const { error } = await supabase
      .from('product_images')
      .update({ sort_order: u.sort_order })
      .eq('id', u.id);
    if (error) throw error;
  }
}
