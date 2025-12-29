-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create enum for run status
CREATE TYPE public.run_status AS ENUM ('pending', 'approved', 'rejected');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create gamemodes table
CREATE TABLE public.gamemodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create categories table (sub-categories within gamemodes)
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gamemode_id UUID REFERENCES public.gamemodes(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  rules TEXT,
  timing_method TEXT DEFAULT 'RTA',
  difficulty TEXT DEFAULT 'Medium',
  estimated_time TEXT,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (gamemode_id, slug)
);

-- Create runs table
CREATE TABLE public.runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  time_ms BIGINT NOT NULL,
  youtube_url TEXT NOT NULL,
  notes TEXT,
  status run_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  is_world_record BOOLEAN NOT NULL DEFAULT false,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamemodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.runs ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Profiles policies
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies (only admins can manage roles)
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR user_id = auth.uid());

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Gamemodes policies (public read, admin write)
CREATE POLICY "Anyone can view gamemodes"
  ON public.gamemodes FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage gamemodes"
  ON public.gamemodes FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Categories policies (public read, admin write)
CREATE POLICY "Anyone can view categories"
  ON public.categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Runs policies
CREATE POLICY "Anyone can view approved runs"
  ON public.runs FOR SELECT
  USING (status = 'approved' OR user_id = auth.uid() OR public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Authenticated users can submit runs"
  ON public.runs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pending runs"
  ON public.runs FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending');

CREATE POLICY "Moderators can update runs"
  ON public.runs FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'moderator') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete runs"
  ON public.runs FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || LEFT(NEW.id::text, 8)));
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger for profile updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial gamemodes
INSERT INTO public.gamemodes (name, slug, description, icon, display_order) VALUES
  ('PvP & Minigames', 'pvp-minigames', 'Competitive player versus player and minigame challenges', 'Swords', 1),
  ('Custom Challenges', 'custom-challenges', 'Unique server-specific challenge runs', 'Trophy', 2),
  ('Survival Challenges', 'survival-challenges', 'Survival-based speedrun challenges', 'Heart', 3);

-- Insert sample categories
INSERT INTO public.categories (gamemode_id, name, slug, description, rules, timing_method, difficulty, estimated_time, display_order)
SELECT id, 'Any%', 'any-percent', 'Complete the challenge as fast as possible by any means', 'Timer starts when you enter the arena. Timer ends when victory is announced.', 'RTA', 'Medium', '5-15 min', 1
FROM public.gamemodes WHERE slug = 'pvp-minigames';

INSERT INTO public.categories (gamemode_id, name, slug, description, rules, timing_method, difficulty, estimated_time, display_order)
SELECT id, 'No Deaths', 'no-deaths', 'Complete without dying once', 'Same as Any% but run is invalid if you die at any point.', 'RTA', 'Hard', '10-20 min', 2
FROM public.gamemodes WHERE slug = 'pvp-minigames';

INSERT INTO public.categories (gamemode_id, name, slug, description, rules, timing_method, difficulty, estimated_time, display_order)
SELECT id, 'Any%', 'any-percent', 'Complete the custom challenge as fast as possible', 'Timer starts at spawn. Timer ends when challenge complete message appears.', 'RTA', 'Medium', '10-30 min', 1
FROM public.gamemodes WHERE slug = 'custom-challenges';

INSERT INTO public.categories (gamemode_id, name, slug, description, rules, timing_method, difficulty, estimated_time, display_order)
SELECT id, 'Any%', 'any-percent', 'Complete survival challenge as fast as possible', 'Timer starts when world loads. Timer ends on challenge completion.', 'RTA', 'Medium', '30-60 min', 1
FROM public.gamemodes WHERE slug = 'survival-challenges';

INSERT INTO public.categories (gamemode_id, name, slug, description, rules, timing_method, difficulty, estimated_time, display_order)
SELECT id, 'Hardcore', 'hardcore', 'Complete on hardcore difficulty', 'Same timing as Any%. Must be on hardcore difficulty.', 'RTA', 'Extreme', '45-90 min', 2
FROM public.gamemodes WHERE slug = 'survival-challenges';