-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a profile for the new user
  INSERT INTO public.profiles (id, name, email, course)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'course', 'Not specified')
  );

  -- Initialize user_streaks
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  -- Initialize daily_activity for today
  INSERT INTO public.daily_activity (user_id, date)
  VALUES (NEW.id, CURRENT_DATE)
  ON CONFLICT DO NOTHING;

  -- Initialize user_settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for handling new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.user_streaks TO authenticated;
GRANT ALL ON public.daily_activity TO authenticated;
GRANT ALL ON public.user_settings TO authenticated;
