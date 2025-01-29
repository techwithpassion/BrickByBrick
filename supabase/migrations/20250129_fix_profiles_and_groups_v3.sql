-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- Add RLS policies for profiles
CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- Recreate study groups table with correct schema
DROP TABLE IF EXISTS public.study_groups CASCADE;

CREATE TABLE IF NOT EXISTS public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;

-- Study groups policies
CREATE POLICY "Anyone can view study groups"
    ON public.study_groups FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create study groups"
    ON public.study_groups FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group admins can update study groups"
    ON public.study_groups FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_group_members
            WHERE group_id = id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND status = 'active'
        )
    );

CREATE POLICY "Group admins can delete study groups"
    ON public.study_groups FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_group_members
            WHERE group_id = id
            AND user_id = auth.uid()
            AND role = 'admin'
            AND status = 'active'
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON public.study_groups(created_by);
