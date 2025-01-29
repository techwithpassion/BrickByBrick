-- Create user_streaks table
CREATE TABLE IF NOT EXISTS public.user_streaks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    current_streak integer DEFAULT 0,
    longest_streak integer DEFAULT 0,
    last_study_date date,
    streak_start_date date,
    total_study_days integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create daily_activity table for tracking daily study stats
CREATE TABLE IF NOT EXISTS public.daily_activity (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date date NOT NULL,
    total_minutes integer DEFAULT 0,
    tasks_completed integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS user_streaks_user_id_idx ON public.user_streaks(user_id);
CREATE INDEX IF NOT EXISTS daily_activity_user_id_date_idx ON public.daily_activity(user_id, date);

-- Add RLS policies for user_streaks
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own streaks"
ON public.user_streaks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own streaks"
ON public.user_streaks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streaks"
ON public.user_streaks FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add RLS policies for daily_activity
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own daily activity"
ON public.daily_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily activity"
ON public.daily_activity FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily activity"
ON public.daily_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to update streaks
CREATE OR REPLACE FUNCTION public.update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_activity_date date;
    streak_record RECORD;
BEGIN
    -- Get or create user streak record
    SELECT * INTO streak_record
    FROM public.user_streaks
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
        INSERT INTO public.user_streaks (user_id, current_streak, last_study_date)
        VALUES (NEW.user_id, 1, NEW.date)
        RETURNING * INTO streak_record;
        RETURN NEW;
    END IF;

    -- If this is the first activity of the day
    IF NEW.date > streak_record.last_study_date THEN
        -- Check if the streak continues
        IF NEW.date = streak_record.last_study_date + INTERVAL '1 day' THEN
            -- Increment streak
            UPDATE public.user_streaks
            SET 
                current_streak = current_streak + 1,
                longest_streak = GREATEST(current_streak + 1, longest_streak),
                last_study_date = NEW.date,
                total_study_days = total_study_days + 1,
                updated_at = now()
            WHERE user_id = NEW.user_id;
        ELSE
            -- Break the streak and start new
            UPDATE public.user_streaks
            SET 
                current_streak = 1,
                last_study_date = NEW.date,
                streak_start_date = NEW.date,
                total_study_days = total_study_days + 1,
                updated_at = now()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update streaks on new activity
CREATE OR REPLACE TRIGGER update_streak_on_activity
    AFTER INSERT OR UPDATE
    ON public.daily_activity
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_streak();
