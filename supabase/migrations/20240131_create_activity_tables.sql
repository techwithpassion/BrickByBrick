-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id)
);

-- Create daily_activity table
CREATE TABLE IF NOT EXISTS public.daily_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    tasks_completed INT DEFAULT 0,
    tasks_added INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    UNIQUE(user_id, date)
);

-- Set up RLS (Row Level Security)
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can insert their own streaks" ON public.user_streaks;
DROP POLICY IF EXISTS "Users can update their own streaks" ON public.user_streaks;

DROP POLICY IF EXISTS "Users can view their own activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Users can insert their own activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Users can update their own activity" ON public.daily_activity;

-- Create policies for user_streaks
CREATE POLICY "Users can view their own streaks"
    ON public.user_streaks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
    ON public.user_streaks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
    ON public.user_streaks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policies for daily_activity
CREATE POLICY "Users can view their own activity"
    ON public.daily_activity FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity"
    ON public.daily_activity FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity"
    ON public.daily_activity FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS handle_user_streaks_updated_at ON public.user_streaks;
DROP TRIGGER IF EXISTS handle_daily_activity_updated_at ON public.daily_activity;

-- Create triggers for updated_at (using existing handle_updated_at function)
CREATE TRIGGER handle_user_streaks_updated_at
    BEFORE UPDATE ON public.user_streaks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_daily_activity_updated_at
    BEFORE UPDATE ON public.daily_activity
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id ON public.daily_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON public.daily_activity(date);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_date ON public.daily_activity(user_id, date);
