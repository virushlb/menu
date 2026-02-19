import { useQuery } from '@tanstack/react-query';
import { isSupabaseConfigured, supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/providers/AuthProvider';
import type { Profile } from '@/types/db';

export function useProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: Boolean(user?.id) && isSupabaseConfigured,
    queryFn: async (): Promise<Profile | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      // If profile doesn't exist (edge case), try to create a viewer profile for this user.
      if (!data) {
        const { data: created, error: createErr } = await supabase
          .from('profiles')
          .insert({ id: user.id, email: user.email ?? null, role: 'viewer' })
          .select('*')
          .single();
        if (createErr) throw createErr;
        return created as Profile;
      }

      return data as Profile;
    },
    staleTime: 30_000,
  });
}

export function useIsAdmin() {
  const q = useProfile();
  const isAdmin = q.data?.role === 'admin';
  return { ...q, isAdmin };
}
