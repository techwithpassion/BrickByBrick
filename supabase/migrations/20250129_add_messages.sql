-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    group_id UUID REFERENCES public.study_groups(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow users to read messages from groups they are members of
CREATE POLICY "Enable read access for group members" ON public.messages
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.study_group_members
        WHERE study_group_members.group_id = messages.group_id
        AND study_group_members.user_id = auth.uid()
        AND study_group_members.status = 'active'
    )
);

-- Allow users to send messages to groups they are members of
CREATE POLICY "Enable insert access for group members" ON public.messages
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.study_group_members
        WHERE study_group_members.group_id = messages.group_id
        AND study_group_members.user_id = auth.uid()
        AND study_group_members.status = 'active'
    )
);

-- Allow users to update their own messages
CREATE POLICY "Enable update access for message owners" ON public.messages
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own messages
CREATE POLICY "Enable delete access for message owners" ON public.messages
FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
