-- Create timer_presets table
CREATE TABLE IF NOT EXISTS public.timer_presets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    duration_minutes integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Add index
CREATE INDEX IF NOT EXISTS timer_presets_user_id_idx ON public.timer_presets(user_id);

-- Enable RLS
ALTER TABLE public.timer_presets ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own timer presets"
    ON public.timer_presets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timer presets"
    ON public.timer_presets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timer presets"
    ON public.timer_presets FOR DELETE
    USING (auth.uid() = user_id);
