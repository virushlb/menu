import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import type { RestaurantSettings } from '@/types/db';

/**
 * Loads the single restaurant settings row (id=1).
 * Public can read it, only admin can update it.
 */
export function useRestaurantSettings() {
  return useQuery({
    queryKey: ['restaurant-settings'],
    enabled: isSupabaseConfigured,
    queryFn: async (): Promise<RestaurantSettings | null> => {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle();

      if (error) throw error;
      return (data ?? null) as RestaurantSettings | null;
    },
    staleTime: 30_000,
  });
}
