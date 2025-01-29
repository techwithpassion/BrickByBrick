-- Drop everything related to study groups
DROP TRIGGER IF EXISTS on_study_group_created ON public.study_groups;
DROP FUNCTION IF EXISTS public.handle_new_study_group();
DROP TABLE IF EXISTS public.study_group_members CASCADE;
DROP TABLE IF EXISTS public.study_groups CASCADE;
DROP TYPE IF EXISTS public.group_role;
DROP TYPE IF EXISTS public.member_status;

-- Create study groups table
CREATE TABLE public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Create study group members table
CREATE TABLE public.study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;

-- Study groups policies
DROP POLICY IF EXISTS "Anyone can view study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Users can create study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Group admins can update study groups" ON public.study_groups;
DROP POLICY IF EXISTS "Group admins can delete study groups" ON public.study_groups;

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

-- Study group members policies
DROP POLICY IF EXISTS "Users can view group members" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can join groups" ON public.study_group_members;
DROP POLICY IF EXISTS "Users can manage their own membership" ON public.study_group_members;
DROP POLICY IF EXISTS "Group admins can manage members" ON public.study_group_members;

CREATE POLICY "Users can view group members"
    ON public.study_group_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can join groups"
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

CREATE POLICY "Users can manage their own membership"
    ON public.study_group_members FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Group admins can manage members"
    ON public.study_group_members FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_group_members admin
            WHERE admin.group_id = study_group_members.group_id
            AND admin.user_id = auth.uid()
            AND admin.role = 'admin'
            AND admin.status = 'active'
        )
    );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_study_groups_created_by ON public.study_groups(created_by);
CREATE INDEX IF NOT EXISTS idx_study_group_members_group_id ON public.study_group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_user_id ON public.study_group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_study_group_members_role ON public.study_group_members(role);
CREATE INDEX IF NOT EXISTS idx_study_group_members_status ON public.study_group_members(status);

-- Add creator as admin member when creating a group
CREATE OR REPLACE FUNCTION public.handle_new_study_group()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.study_group_members (group_id, user_id, role, status)
    VALUES (NEW.id, NEW.created_by, 'admin', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_group_created
    AFTER INSERT ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_study_group();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
