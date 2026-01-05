import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CreateGamemodeData {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

interface CreateCategoryData {
  gamemode_id: string;
  name: string;
  slug: string;
  description?: string;
  rules?: string;
  metric_type?: 'time' | 'count' | 'score';
  timing_method?: string;
  difficulty?: string;
  estimated_time?: string;
}

interface UpdateGamemodeData {
  id: string;
  name?: string;
  description?: string;
  icon?: string;
}

interface UpdateCategoryData {
  id: string;
  name?: string;
  description?: string;
  rules?: string;
  metric_type?: 'time' | 'count' | 'score';
  timing_method?: string;
  difficulty?: string;
  estimated_time?: string;
}

export function useCreateGamemode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateGamemodeData) => {
      const { data: result, error } = await supabase
        .from('gamemodes')
        .insert({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          icon: data.icon || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamemodes'] });
    },
  });
}

export function useUpdateGamemode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateGamemodeData) => {
      const { data: result, error } = await supabase
        .from('gamemodes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamemodes'] });
    },
  });
}

export function useDeleteGamemode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('gamemodes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamemodes'] });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const { data: result, error } = await supabase
        .from('categories')
        .insert({
          gamemode_id: data.gamemode_id,
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          rules: data.rules || null,
          metric_type: data.metric_type || 'time',
          timing_method: data.timing_method || 'RTA',
          difficulty: data.difficulty || 'Medium',
          estimated_time: data.estimated_time || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamemodes'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCategoryData) => {
      const { data: result, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamemodes'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gamemodes'] });
    },
  });
}
