-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_study_group_created ON public.study_groups;
DROP FUNCTION IF EXISTS public.handle_new_study_group();

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for member groups" ON public.study_groups;
DROP POLICY IF EXISTS "Enable insert access for groups" ON public.study_groups;
DROP POLICY IF EXISTS "Enable update access for owned groups" ON public.study_groups;
DROP POLICY IF EXISTS "Enable delete access for owned groups" ON public.study_groups;

DROP POLICY IF EXISTS "Enable read access for group members" ON public.study_group_members;
DROP POLICY IF EXISTS "Enable join access for users" ON public.study_group_members;
DROP POLICY IF EXISTS "Enable leave access for users" ON public.study_group_members;

-- Drop and recreate study group members table
DROP TABLE IF EXISTS public.study_group_members CASCADE;

CREATE TABLE IF NOT EXISTS public.study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (member_role IN ('admin', 'member')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Study groups policies
CREATE POLICY "Enable read access for member groups"
    ON public.study_groups FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_group_members
            WHERE group_id = id
            AND user_id = auth.uid()
            AND status = 'active'
        )
        OR owner_id = auth.uid()
    );

CREATE POLICY "Enable insert access for groups"
    ON public.study_groups FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Enable update access for owned groups"
    ON public.study_groups FOR UPDATE
    TO authenticated
    USING (auth.uid() = owner_id);

CREATE POLICY "Enable delete access for owned groups"
    ON public.study_groups FOR DELETE
    TO authenticated
    USING (auth.uid() = owner_id);

-- Study group members policies
CREATE POLICY "Enable read access for group members"
    ON public.study_group_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_groups
            WHERE id = group_id
            AND (
                owner_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.study_group_members
                    WHERE group_id = id
                    AND user_id = auth.uid()
                    AND status = 'active'
                )
            )
        )
    );

CREATE POLICY "Enable join access for users"
    ON public.study_group_members FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        AND NOT EXISTS (
            SELECT 1 FROM public.study_group_members
            WHERE group_id = study_group_members.group_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable leave access for users"
    ON public.study_group_members FOR DELETE
    TO authenticated
    USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_role ON public.study_group_members(member_role);
CREATE INDEX IF NOT EXISTS idx_study_group_members_status ON public.study_group_members(status);

-- Add creator as admin member when creating a group
CREATE OR REPLACE FUNCTION public.handle_new_study_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.study_group_members (group_id, user_id, member_role, status)
    VALUES (NEW.id, NEW.owner_id, 'admin', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_group_created
    AFTER INSERT ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_study_group();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
