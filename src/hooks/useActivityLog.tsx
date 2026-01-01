import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ActivityLog {
  id: string;
  action_type: string;
  category: string;
  description: string;
  performed_by: string;
  target_user_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export function useActivityLogs(category?: string) {
  return useQuery({
    queryKey: ['activity-logs', category],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select(`
          *,
          performer:profiles!activity_logs_performed_by_fkey(username),
          target:profiles!activity_logs_target_user_id_fkey(username)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useLogActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      action_type,
      category,
      description,
      target_user_id,
      metadata = {},
    }: {
      action_type: string;
      category: string;
      description: string;
      target_user_id?: string;
      metadata?: Record<string, any>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      const { error } = await supabase.from('activity_logs').insert({
        action_type,
        category,
        description,
        performed_by: user.id,
        target_user_id,
        metadata,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-logs'] });
    },
  });
}
