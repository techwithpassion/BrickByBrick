-- Drop existing policies if they exist
DO $$ 
BEGIN
    -- Study sessions policies
    DROP POLICY IF EXISTS "Users can view their own study sessions" ON public.study_sessions;
    DROP POLICY IF EXISTS "Users can insert their own study sessions" ON public.study_sessions;
    DROP POLICY IF EXISTS "Users can update their own study sessions" ON public.study_sessions;
    DROP POLICY IF EXISTS "Users can delete their own study sessions" ON public.study_sessions;
    
    -- Tasks policies
    DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
    DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;
    
    -- Task times policies
    DROP POLICY IF EXISTS "Users can view their own task times" ON public.task_times;
    DROP POLICY IF EXISTS "Users can insert their own task times" ON public.task_times;
    
    -- Test scores policies
    DROP POLICY IF EXISTS "Users can view their own test scores" ON public.test_scores;
    DROP POLICY IF EXISTS "Users can insert their own test scores" ON public.test_scores;
    
    -- Test days policies
    DROP POLICY IF EXISTS "Users can view their own test days" ON public.test_days;
    DROP POLICY IF EXISTS "Users can insert their own test days" ON public.test_days;
    DROP POLICY IF EXISTS "Users can delete their own test days" ON public.test_days;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS public.test_days CASCADE;
DROP TABLE IF EXISTS public.test_scores CASCADE;
DROP TABLE IF EXISTS public.task_times CASCADE;
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;

-- Create tables first
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    description text,
    due_date date,
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE,
    session_start_time timestamp with time zone DEFAULT now(),
    session_end_time timestamp with time zone,
    session_duration integer NOT NULL, -- Duration in minutes
    session_notes text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.task_times (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    time_spent integer NOT NULL, -- Duration in minutes
    completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    subjects jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_scores (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    subject text NOT NULL,
    score numeric NOT NULL,
    max_score numeric NOT NULL,
    test_date date NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.test_days (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id uuid REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    subject text NOT NULL,
    test_date date NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS study_sessions_user_id_idx ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS study_sessions_task_id_idx ON public.study_sessions(task_id);
CREATE INDEX IF NOT EXISTS study_sessions_start_time_idx ON public.study_sessions(session_start_time);
CREATE INDEX IF NOT EXISTS tasks_user_id_idx ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS tasks_completed_idx ON public.tasks(completed);
CREATE INDEX IF NOT EXISTS tasks_created_at_idx ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS task_times_user_id_idx ON public.task_times(user_id);
CREATE INDEX IF NOT EXISTS task_times_task_id_idx ON public.task_times(task_id);
CREATE INDEX IF NOT EXISTS test_scores_user_id_idx ON public.test_scores(user_id);
CREATE INDEX IF NOT EXISTS test_scores_course_id_idx ON public.test_scores(course_id);
CREATE INDEX IF NOT EXISTS test_days_user_id_idx ON public.test_days(user_id);
CREATE INDEX IF NOT EXISTS test_days_course_id_idx ON public.test_days(course_id);
CREATE INDEX IF NOT EXISTS test_days_test_date_idx ON public.test_days(test_date);

-- Enable RLS
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_times ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_days ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own study sessions"
    ON public.study_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study sessions"
    ON public.study_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study sessions"
    ON public.study_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study sessions"
    ON public.study_sessions FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks"
    ON public.tasks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
    ON public.tasks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
    ON public.tasks FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
    ON public.tasks FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own task times"
    ON public.task_times FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own task times"
    ON public.task_times FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test scores"
    ON public.test_scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test scores"
    ON public.test_scores FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test days"
    ON public.test_days FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test days"
    ON public.test_days FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own test days"
    ON public.test_days FOR DELETE
    USING (auth.uid() = user_id);

-- Insert default courses with subjects
INSERT INTO public.courses (name, subjects) VALUES
    ('JEE', '["Physics", "Chemistry", "Mathematics"]'::jsonb),
    ('NEET', '["Physics", "Chemistry", "Biology"]'::jsonb),
    ('UPSC', '["General Studies", "CSAT", "Optional Subject"]'::jsonb),
    ('GATE', '["Engineering Mathematics", "Core Subjects", "General Aptitude"]'::jsonb),
    ('CA', '["Accounts", "Cost & Management Accounting", "Taxation", "Law", "Auditing"]'::jsonb)
ON CONFLICT DO NOTHING;
