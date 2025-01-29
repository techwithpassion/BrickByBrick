-- Drop everything and start fresh
DROP TRIGGER IF EXISTS on_study_group_created ON public.study_groups;
DROP FUNCTION IF EXISTS public.handle_new_study_group();
DROP TABLE IF EXISTS public.study_group_members CASCADE;
DROP TABLE IF EXISTS public.study_groups CASCADE;

-- Create study groups table with correct columns
CREATE TABLE public.study_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_name VARCHAR(255) NOT NULL,
    group_description TEXT,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create study group members table
CREATE TABLE public.study_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (member_role IN ('admin', 'member')),
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(group_id, user_id)
);

-- Enable RLS
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
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
        OR created_by = auth.uid()
    );

CREATE POLICY "Enable insert access for groups"
    ON public.study_groups FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for owned groups"
    ON public.study_groups FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

CREATE POLICY "Enable delete access for owned groups"
    ON public.study_groups FOR DELETE
    TO authenticated
    USING (auth.uid() = created_by);

-- Study group members policies
CREATE POLICY "Enable read access for group members"
    ON public.study_group_members FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.study_groups
            WHERE id = group_id
            AND (
                created_by = auth.uid()
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
    VALUES (NEW.id, NEW.created_by, 'admin', 'active');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_study_group_created
    AFTER INSERT ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_study_group();

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_study_groups_updated_at
    BEFORE UPDATE ON public.study_groups
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_study_group_members_updated_at
    BEFORE UPDATE ON public.study_group_members
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
