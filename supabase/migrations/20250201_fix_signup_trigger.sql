-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_name TEXT;
BEGIN
  -- Extract username from email or use provided full_name
  default_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1)
  );

  -- Create a profile for the new user
  INSERT INTO public.profiles (id, email, name, course)
  VALUES (
    NEW.id,
    NEW.email,
    default_name,
    COALESCE(NEW.raw_user_meta_data->>'course', 'Not specified')
  );

  -- Initialize user_streaks
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  -- Initialize daily_activity
  INSERT INTO public.daily_activity (user_id, date)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT DO NOTHING;

  -- Initialize user_settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for handling new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
