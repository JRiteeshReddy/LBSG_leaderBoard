-- Create bans table for tracking user bans
CREATE TABLE public.bans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by uuid NOT NULL REFERENCES auth.users(id),
  reason text,
  is_permanent boolean NOT NULL DEFAULT false,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on bans
ALTER TABLE public.bans ENABLE ROW LEVEL SECURITY;

-- Policies for bans table
CREATE POLICY "Mods and devs can view all bans"
ON public.bans FOR SELECT
USING (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Mods can create temporary bans"
ON public.bans FOR INSERT
WITH CHECK (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Devs can delete bans"
ON public.bans FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Create announcements table
CREATE TABLE public.announcements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on announcements
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Policies for announcements
CREATE POLICY "Anyone can view announcements"
ON public.announcements FOR SELECT
USING (true);

CREATE POLICY "Devs can manage announcements"
ON public.announcements FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create activity_logs table for tracking all activities
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  performed_by uuid NOT NULL REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only devs can view activity logs
CREATE POLICY "Devs can view all activity logs"
ON public.activity_logs FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Mods and devs can insert logs
CREATE POLICY "Mods and devs can insert logs"
ON public.activity_logs FOR INSERT
WITH CHECK (has_role(auth.uid(), 'moderator') OR has_role(auth.uid(), 'admin'));

-- Create trigger for announcements updated_at
CREATE TRIGGER update_announcements_updated_at
BEFORE UPDATE ON public.announcements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster log queries
CREATE INDEX idx_activity_logs_category ON public.activity_logs(category);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_bans_user_id ON public.bans(user_id);
CREATE INDEX idx_bans_expires_at ON public.bans(expires_at);