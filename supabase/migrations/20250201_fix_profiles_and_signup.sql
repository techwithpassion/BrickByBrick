-- Modify profiles table to make fields optional
ALTER TABLE public.profiles 
  ALTER COLUMN name DROP NOT NULL,
  ALTER COLUMN course DROP NOT NULL;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_name TEXT;
BEGIN
  -- Extract username from email
  default_name := split_part(NEW.email, '@', 1);

  -- Create a profile for the new user
  INSERT INTO public.profiles (id, email, name, course)
  VALUES (
    NEW.id,
    NEW.email,
    default_name,
    'Not specified'
  );

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

-- Ensure proper permissions
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable update access for users based on user_id" ON public.profiles;

-- Create simpler policies
CREATE POLICY "Enable read access for all users"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for users based on email"
  ON public.profiles FOR UPDATE
  USING (auth.email() = email);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Create separate function for initializing other user data
CREATE OR REPLACE FUNCTION public.initialize_user_data(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Initialize user_streaks
  INSERT INTO public.user_streaks (user_id)
  VALUES (user_id)
  ON CONFLICT DO NOTHING;

  -- Initialize daily_activity
  INSERT INTO public.daily_activity (user_id, date)
  VALUES (user_id, CURRENT_DATE)
  ON CONFLICT DO NOTHING;

  -- Initialize user_settings
  INSERT INTO public.user_settings (user_id)
  VALUES (user_id)
  ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in initialize_user_data: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle successful signup
CREATE OR REPLACE FUNCTION public.handle_successful_signup()
RETURNS TRIGGER AS $$
BEGIN
  -- Initialize other user data
  PERFORM public.initialize_user_data(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_successful_signup: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for successful signup
CREATE TRIGGER on_successful_signup
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_successful_signup();
