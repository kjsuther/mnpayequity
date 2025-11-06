/*
  # Create User Profiles and Authentication System

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key) - Unique identifier for each profile
      - `user_id` (uuid, foreign key) - References auth.users, unique per user
      - `email` (text) - User's email address for quick lookup
      - `jurisdiction_id` (text) - Jurisdiction ID this user belongs to (null for admin)
      - `is_admin` (boolean) - Whether user has admin privileges
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on user_profiles table
    - Users can view their own profile
    - Only admins can view all profiles
    - Only admins can modify profiles
    
  3. Seed Data
    - Create admin user profile for admin@admin.com
    - Create test user profile for test@minneapolis.gov linked to Minneapolis
    
  4. Notes
    - is_admin flag grants full system access to all jurisdictions
    - Regular users have jurisdiction_id set to restrict access
    - Admin users have jurisdiction_id null to indicate all access
    - Email stored for quick profile lookups without joining auth.users
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  email text NOT NULL,
  jurisdiction_id text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_jurisdiction_id ON user_profiles(jurisdiction_id);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles table
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  );

CREATE POLICY "Admins can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  );

CREATE POLICY "Admins can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  );

-- Note: Seed data for admin and test users will be inserted after auth users are created
-- This requires manual insertion via Supabase auth.users or through the signup flow
