import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import type { Category, Product, ProductImage } from '@/types/db';

export type AdminMenuData = {
  categories: Category[];
  products: Product[];
  images: ProductImage[];
};

export function useAdminMenu() {
  return useQuery({
    queryKey: ['admin-menu'],
    enabled: isSupabaseConfigured,
    queryFn: async (): Promise<AdminMenuData> => {
      const [{ data: categories, error: catErr }, { data: products, error: prodErr }] =
        await Promise.all([
          supabase
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true }),
          supabase
            .from('products')
            .select('*')
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true }),
        ]);

      if (catErr) throw catErr;
      if (prodErr) throw prodErr;

      const productIds = (products ?? []).map((p) => p.id);
      const { data: images, error: imgErr } = productIds.length
        ? await supabase
            .from('product_images')
            .select('*')
            .in('product_id', productIds)
            .order('sort_order', { ascending: true })
            .order('created_at', { ascending: true })
        : { data: [], error: null };

      if (imgErr) throw imgErr;

      return {
        categories: (categories ?? []) as Category[],
        products: (products ?? []) as Product[],
        images: (images ?? []) as ProductImage[],
      };
    },
    staleTime: 5_000,
  });
}
