-- Add task_id to study_sessions if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'study_sessions' 
        AND column_name = 'task_id'
    ) THEN
        ALTER TABLE public.study_sessions 
        ADD COLUMN task_id uuid REFERENCES public.tasks(id) ON DELETE CASCADE;

        -- Add index for the new column
        CREATE INDEX IF NOT EXISTS study_sessions_task_id_idx ON public.study_sessions(task_id);
    END IF;
END $$;
