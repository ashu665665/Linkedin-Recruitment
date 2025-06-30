/*
  # Restructure Database Schema

  1. Schema Changes
    - Remove search_profiles junction table
    - Simplify linkedin_profiles table to only have id, profile_url, profile_name, and search_id
    - Add direct foreign key relationship from linkedin_profiles to searches

  2. Data Migration
    - Migrate existing data before dropping tables
    - Preserve existing relationships

  3. Security
    - Update RLS policies for the new structure
    - Ensure users can only access their own data
*/

-- First, create a temporary table to store existing data relationships
CREATE TEMP TABLE temp_profile_search_mapping AS
SELECT 
  lp.id as profile_id,
  lp.profile_url,
  lp.profile_name,
  sp.search_id,
  sp.position_in_results
FROM linkedin_profiles lp
JOIN search_profiles sp ON lp.id = sp.profile_id;

-- Drop existing policies and constraints
DROP POLICY IF EXISTS "Users can read linkedin profiles from their searches" ON linkedin_profiles;
DROP POLICY IF EXISTS "Authenticated users can insert linkedin profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can insert linkedin profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can update linkedin profiles" ON linkedin_profiles;
DROP POLICY IF EXISTS "Users can read own search profiles" ON search_profiles;
DROP POLICY IF EXISTS "Users can insert search profiles" ON search_profiles;

-- Drop the search_profiles table
DROP TABLE IF EXISTS search_profiles CASCADE;

-- Recreate linkedin_profiles table with new structure
DROP TABLE IF EXISTS linkedin_profiles CASCADE;

CREATE TABLE linkedin_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_url text NOT NULL,
  profile_name text,
  search_id uuid REFERENCES searches(id) ON DELETE CASCADE NOT NULL,
  position_in_results integer,
  created_at timestamptz DEFAULT now()
);

-- Migrate data back to the new structure
INSERT INTO linkedin_profiles (profile_url, profile_name, search_id, position_in_results)
SELECT 
  profile_url,
  profile_name,
  search_id,
  position_in_results
FROM temp_profile_search_mapping;

-- Enable RLS on linkedin_profiles
ALTER TABLE linkedin_profiles ENABLE ROW LEVEL SECURITY;

-- Create new RLS policies for linkedin_profiles
CREATE POLICY "Users can read linkedin profiles from their searches"
  ON linkedin_profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM searches s
      WHERE s.id = linkedin_profiles.search_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert linkedin profiles"
  ON linkedin_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM searches s
      WHERE s.id = linkedin_profiles.search_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update linkedin profiles"
  ON linkedin_profiles
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM searches s
      WHERE s.id = linkedin_profiles.search_id
      AND s.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_search_id ON linkedin_profiles(search_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_profiles_url ON linkedin_profiles(profile_url);

-- Drop the temporary table
DROP TABLE temp_profile_search_mapping;