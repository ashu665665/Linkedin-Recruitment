/*
  # Fix user profile creation trigger

  1. Database Functions
    - Create or replace the `create_user_profile` function that automatically creates a profile when a new user signs up
    - The function extracts `full_name` from the user's metadata and creates a profile record

  2. Triggers
    - Create a trigger that calls the function whenever a new user is inserted into `auth.users`

  3. Security
    - Ensure the function has proper permissions to insert into the profiles table
*/

-- Create or replace the function to create user profiles
CREATE OR REPLACE FUNCTION public.create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_profile();