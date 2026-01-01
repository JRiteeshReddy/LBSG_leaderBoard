import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Ban {
  id: string;
  user_id: string;
  banned_by: string;
  reason?: string;
  is_permanent: boolean;
  expires_at?: string;
  created_at: string;
}

export function useBans() {
  return useQuery({
    queryKey: ['bans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bans')
        .select(`
          *,
          banned_user:profiles!bans_user_id_fkey(username),
          banned_by_user:profiles!bans_banned_by_fkey(username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useIsUserBanned(userId?: string) {
  return useQuery({
    queryKey: ['is-banned', userId],
    queryFn: async () => {
      if (!userId) return false;
      
      const { data, error } = await supabase
        .from('bans')
        .select('id, expires_at, is_permanent')
        .eq('user_id', userId);
      
      if (error) throw error;
      if (!data || data.length === 0) return false;
      
      // Check if any ban is still active
      const now = new Date();
      return data.some(ban => {
        if (ban.is_permanent) return true;
        if (ban.expires_at && new Date(ban.expires_at) > now) return true;
        return false;
      });
    },
    enabled: !!userId,
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      user_id,
      reason,
      is_permanent = false,
      duration_hours,
    }: {
      user_id: string;
      reason?: string;
      is_permanent?: boolean;
      duration_hours?: number;
    }) => {
      const expires_at = is_permanent 
        ? null 
        : duration_hours 
          ? new Date(Date.now() + duration_hours * 60 * 60 * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // Default 24h
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase.from('bans').insert({
        user_id,
        banned_by: user.id,
        reason,
        is_permanent,
        expires_at,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bans'] });
      queryClient.invalidateQueries({ queryKey: ['is-banned'] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banId: string) => {
      const { error } = await supabase.from('bans').delete().eq('id', banId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bans'] });
      queryClient.invalidateQueries({ queryKey: ['is-banned'] });
    },
  });
}
