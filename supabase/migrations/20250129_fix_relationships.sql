-- Drop existing foreign key constraints
ALTER TABLE IF EXISTS public.study_group_members 
DROP CONSTRAINT IF EXISTS study_group_members_user_id_fkey;

ALTER TABLE IF EXISTS public.messages 
DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

-- Add foreign key constraints with correct references
ALTER TABLE public.study_group_members
ADD CONSTRAINT study_group_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages
ADD CONSTRAINT messages_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
