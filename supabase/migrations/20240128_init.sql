-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.study_sessions;
DROP TABLE IF EXISTS public.study_group_members;
DROP TABLE IF EXISTS public.study_groups;
DROP TABLE IF EXISTS public.subjects;
DROP TABLE IF EXISTS public.notifications;

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(255) NOT NULL,
    notification_title TEXT NOT NULL,
    notification_message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subjects table
CREATE TABLE public.subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_name VARCHAR(255) NOT NULL,
    subject_description TEXT,
    subject_color VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create study groups tables
CREATE TABLE public.study_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_name VARCHAR(255) NOT NULL,
    group_description TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.study_group_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(group_id, user_id)
);

-- Create study sessions table
CREATE TABLE public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    session_start_time TIMESTAMPTZ NOT NULL,
    session_end_time TIMESTAMPTZ,
    session_duration INTEGER,
    session_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
-- Notifications
CREATE POLICY "Enable read access for own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for own notifications" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

-- Subjects
CREATE POLICY "Enable read access for own subjects" ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for own subjects" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for own subjects" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for own subjects" ON public.subjects FOR DELETE USING (auth.uid() = user_id);

-- Study Groups
CREATE POLICY "Enable read access for member groups" ON public.study_groups FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.study_group_members WHERE group_id = id AND user_id = auth.uid())
);
CREATE POLICY "Enable insert access for groups" ON public.study_groups FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Enable update access for owned groups" ON public.study_groups FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Enable delete access for owned groups" ON public.study_groups FOR DELETE USING (owner_id = auth.uid());

-- Study Group Members
CREATE POLICY "Enable read access for group members" ON public.study_group_members FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.study_group_members sgm WHERE sgm.group_id = group_id AND sgm.user_id = auth.uid())
);
CREATE POLICY "Enable join access for users" ON public.study_group_members FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Enable leave access for users" ON public.study_group_members FOR DELETE USING (user_id = auth.uid());

-- Study Sessions
CREATE POLICY "Enable read access for own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Enable insert access for own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Enable update access for own sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Enable delete access for own sessions" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at triggers for all tables
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.study_groups FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.study_sessions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
