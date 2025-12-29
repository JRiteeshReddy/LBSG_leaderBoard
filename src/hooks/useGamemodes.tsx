import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  gamemode_id: string;
  name: string;
  slug: string;
  description: string | null;
  rules: string | null;
  timing_method: string | null;
  difficulty: string | null;
  estimated_time: string | null;
  display_order: number;
  created_at: string;
}

export interface Gamemode {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  display_order: number;
  created_at: string;
  categories?: Category[];
}

export function useGamemodes() {
  return useQuery({
    queryKey: ['gamemodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gamemodes')
        .select('*, categories(*)')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as Gamemode[];
    },
  });
}

export function useGamemode(slug: string) {
  return useQuery({
    queryKey: ['gamemode', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gamemodes')
        .select('*, categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Gamemode | null;
    },
    enabled: !!slug,
  });
}

export function useCategory(gamemodeSlug: string, categorySlug: string) {
  return useQuery({
    queryKey: ['category', gamemodeSlug, categorySlug],
    queryFn: async () => {
      const { data: gamemode, error: gamemodeError } = await supabase
        .from('gamemodes')
        .select('id')
        .eq('slug', gamemodeSlug)
        .maybeSingle();
      
      if (gamemodeError) throw gamemodeError;
      if (!gamemode) return null;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('gamemode_id', gamemode.id)
        .eq('slug', categorySlug)
        .maybeSingle();
      
      if (error) throw error;
      return data as Category | null;
    },
    enabled: !!gamemodeSlug && !!categorySlug,
  });
}
