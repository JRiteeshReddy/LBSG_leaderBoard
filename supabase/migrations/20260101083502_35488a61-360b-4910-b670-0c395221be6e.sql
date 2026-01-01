-- Allow users to see their own ban status
CREATE POLICY "Users can view their own bans"
ON public.bans
FOR SELECT
USING (user_id = auth.uid());