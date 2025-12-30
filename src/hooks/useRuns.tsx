import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Run {
  id: string;
  user_id: string;
  category_id: string;
  time_ms: number;
  youtube_url: string;
  notes: string | null;
  status: 'pending' | 'approved' | 'rejected';
  verified_by: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  is_world_record: boolean;
  submitted_at: string;
  profiles?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
    metric_type: 'time' | 'count' | 'score';
    gamemodes?: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export function useLeaderboard(categoryId: string, metricType: string = 'time', limit = 100) {
  return useQuery({
    queryKey: ['leaderboard', categoryId, metricType, limit],
    queryFn: async () => {
      // For time-based metrics, lower is better (ascending)
      // For count/score metrics, higher is better (descending)
      const ascending = metricType === 'time';
      
      const { data: runs, error } = await supabase
        .from('runs')
        .select('*')
        .eq('category_id', categoryId)
        .eq('status', 'approved')
        .order('time_ms', { ascending })
        .limit(limit);
      
      if (error) throw error;
      
      // Fetch profiles separately
      const userIds = [...new Set(runs.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return runs.map(run => ({
        ...run,
        profiles: profileMap.get(run.user_id) || null,
      })) as Run[];
    },
    enabled: !!categoryId,
  });
}

export function useRecentRuns(limit = 10) {
  return useQuery({
    queryKey: ['recent-runs', limit],
    queryFn: async () => {
      const { data: runs, error } = await supabase
        .from('runs')
        .select('*, categories(id, name, slug, metric_type, gamemodes(id, name, slug))')
        .eq('status', 'approved')
        .order('submitted_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      
      const userIds = [...new Set(runs.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return runs.map(run => ({
        ...run,
        profiles: profileMap.get(run.user_id) || null,
      })) as Run[];
    },
  });
}

export function useUserRuns(userId: string) {
  return useQuery({
    queryKey: ['user-runs', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('runs')
        .select(`
          *,
          categories(id, name, slug, metric_type, gamemodes(id, name, slug))
        `)
        .eq('user_id', userId)
        .order('submitted_at', { ascending: false });
      
      if (error) throw error;
      return data as Run[];
    },
    enabled: !!userId,
  });
}

export function usePendingRuns() {
  return useQuery({
    queryKey: ['pending-runs'],
    queryFn: async () => {
      const { data: runs, error } = await supabase
        .from('runs')
        .select('*, categories(id, name, slug, metric_type, gamemodes(id, name, slug))')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true });
      
      if (error) throw error;
      
      const userIds = [...new Set(runs.map(r => r.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      return runs.map(run => ({
        ...run,
        profiles: profileMap.get(run.user_id) || null,
      })) as Run[];
    },
  });
}

export function useSubmitRun() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (run: {
      category_id: string;
      time_ms: number;
      youtube_url: string;
      notes?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('runs')
        .insert({
          ...run,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-runs'] });
      queryClient.invalidateQueries({ queryKey: ['recent-runs'] });
    },
  });
}

export function useVerifyRun() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      runId, 
      status, 
      rejectionReason 
    }: { 
      runId: string; 
      status: 'approved' | 'rejected';
      rejectionReason?: string;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('runs')
        .update({
          status,
          verified_by: user.id,
          verified_at: new Date().toISOString(),
          rejection_reason: rejectionReason || null,
        })
        .eq('id', runId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-runs'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['recent-runs'] });
    },
  });
}

// Format time in milliseconds to readable format
export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = ms % 1000;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

// Format value based on metric type
export function formatValue(value: number, metricType: string): string {
  if (metricType === 'time') {
    return formatTime(value);
  }
  // For count and score, just format as a number
  return value.toLocaleString();
}

// Parse time string to milliseconds
export function parseTime(timeStr: string): number {
  const parts = timeStr.split(':').map(p => parseFloat(p));
  if (parts.length === 3) {
    return Math.floor((parts[0] * 3600 + parts[1] * 60 + parts[2]) * 1000);
  } else if (parts.length === 2) {
    return Math.floor((parts[0] * 60 + parts[1]) * 1000);
  }
  return Math.floor(parts[0] * 1000);
}

// Parse any value based on metric type
export function parseValue(valueStr: string, metricType: string): number {
  if (metricType === 'time') {
    return parseTime(valueStr);
  }
  // For count and score, parse as integer
  return parseInt(valueStr.replace(/,/g, ''), 10) || 0;
}

// Get metric label
export function getMetricLabel(metricType: string): string {
  switch (metricType) {
    case 'time':
      return 'Time';
    case 'count':
      return 'Count';
    case 'score':
      return 'Score';
    default:
      return 'Value';
  }
}

// Get metric placeholder
export function getMetricPlaceholder(metricType: string): string {
  switch (metricType) {
    case 'time':
      return 'e.g., 5:23.456 or 1:05:23.456';
    case 'count':
      return 'e.g., 25';
    case 'score':
      return 'e.g., 10000';
    default:
      return 'Enter value';
  }
}

// Get metric help text
export function getMetricHelpText(metricType: string): string {
  switch (metricType) {
    case 'time':
      return 'Format: MM:SS.mmm or H:MM:SS.mmm (lower is better)';
    case 'count':
      return 'Enter the count value (higher is better)';
    case 'score':
      return 'Enter your score (higher is better)';
    default:
      return '';
  }
}
