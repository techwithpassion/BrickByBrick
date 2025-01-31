-- Function to initialize user data
CREATE OR REPLACE FUNCTION public.initialize_user_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Initialize user_streaks
    INSERT INTO public.user_streaks (user_id)
    VALUES (NEW.id)
    ON CONFLICT DO NOTHING;

    -- Initialize daily_activity for today
    INSERT INTO public.daily_activity (user_id, date)
    VALUES (NEW.id, CURRENT_DATE)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to initialize user data on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.initialize_user_data();

-- Initialize data for existing user directly
INSERT INTO public.user_streaks (user_id)
VALUES ('ad9e885f-e4f4-409f-84b4-5ce0b21a6450')
ON CONFLICT DO NOTHING;

INSERT INTO public.daily_activity (user_id, date)
VALUES ('ad9e885f-e4f4-409f-84b4-5ce0b21a6450', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.initialize_user_data TO authenticated;
