-- Add group_id to study sessions
ALTER TABLE public.study_sessions
ADD COLUMN group_id UUID REFERENCES public.study_groups(id) ON DELETE SET NULL;

-- Update RLS policies for study sessions
DROP POLICY IF EXISTS "Enable read access for own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Enable insert access for own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Enable update access for own sessions" ON public.study_sessions;
DROP POLICY IF EXISTS "Enable delete access for own sessions" ON public.study_sessions;

-- Create new policies that allow access to group members
CREATE POLICY "Enable read access for own and group sessions" ON public.study_sessions
FOR SELECT USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.study_group_members
    WHERE study_group_members.group_id = study_sessions.group_id
    AND study_group_members.user_id = auth.uid()
    AND study_group_members.status = 'active'
  )
);

CREATE POLICY "Enable insert access for own sessions" ON public.study_sessions
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for own sessions" ON public.study_sessions
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete access for own sessions" ON public.study_sessions
FOR DELETE USING (auth.uid() = user_id);
