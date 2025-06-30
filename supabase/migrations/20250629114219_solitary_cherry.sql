/*
  # LinkedIn Recruiter Application Schema

  1. New Tables
    - `profiles` - User profiles with authentication
    - `searches` - Job search history with input and generated tags
    - `linkedin_profiles` - Found LinkedIn profiles from searches
    - `search_profiles` - Junction table linking searches to profiles

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Users can only access their own searches and profiles

  3. Features
    - Complete search history tracking
    - LinkedIn profile storage and management
    - User-specific data isolation
    - Optimized queries with proper indexing
*/

-- Create profiles table for user data
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create searches table for job search history
CREATE TABLE IF NOT EXISTS searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  input_text text NOT NULL,
  input_type text NOT NULL CHECK (input_type IN ('job_description', 'linkedin_url')),
  job_description text,
  generated_tags text[] DEFAULT '{}',
  linkedin_job_id text,
  search_query text,
  total_profiles_found integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create linkedin_profiles table for storing found profiles
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_url text UNIQUE NOT NULL,
  profile_name text,
  profile_title text,
  profile_snippet text,
  profile_data jsonb DEFAULT '{}',
  first_found_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now()
);

-- Create junction table for search-profile relationships
CREATE TABLE IF NOT EXISTS search_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid REFERENCES searches(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  position_in_results integer,
  created_at timestamptz DEFAULT now(),
  UNIQUE(search_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Searches policies
CREATE POLICY "Users can read own searches"
  ON searches
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own searches"
  ON searches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own searches"
  ON searches
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- LinkedIn profiles policies (users can read profiles from their searches)
CREATE POLICY "Users can read linkedin profiles from their searches"
  ON linkedin_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM search_profiles sp
      JOIN searches s ON sp.search_id = s.id
      WHERE sp.profile_id = linkedin_profiles.id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert linkedin profiles"
  ON linkedin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update linkedin profiles"
  ON linkedin_profiles
  FOR UPDATE
  TO authenticated
  WITH CHECK (true);

-- Search profiles policies
CREATE POLICY "Users can read own search profiles"
  ON search_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM searches s
      WHERE s.id = search_profiles.search_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert search profiles"
  ON search_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM searches s
      WHERE s.id = search_profiles.search_id
      AND s.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_user_id ON searches(user_id);
CREATE INDEX IF NOT EXISTS idx_searches_created_at ON searches(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_url ON linkedin_profiles(profile_url);
CREATE INDEX IF NOT EXISTS idx_search_profiles_search_id ON search_profiles(search_id);
CREATE INDEX IF NOT EXISTS idx_search_profiles_profile_id ON search_profiles(profile_id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();