-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone." on profiles;
drop policy if exists "Users can insert their own profile." on profiles;
drop policy if exists "Users can update their own profile." on profiles;

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies
create policy "Enable read access for authenticated users"
  on public.profiles for select
  using (auth.role() = 'authenticated');

create policy "Enable insert access for users based on user_id"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Enable update access for users based on user_id"
  on public.profiles for update
  using (auth.uid() = id);

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.profiles to authenticated;

-- If you have sequences for any columns
grant usage, select on all sequences in schema public to authenticated;
