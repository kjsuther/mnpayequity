/*
  # Update RLS Policies for Anonymous Access

  1. Changes
    - Drop existing policies that require authentication
    - Create new policies that allow anon access
    - Enable both authenticated and anon users to perform CRUD operations
  
  2. Security
    - Policies now use `TO anon, authenticated` instead of just `TO authenticated`
    - This allows the app to work with the anon key without requiring login
*/

-- Drop existing policies for jurisdictions
DROP POLICY IF EXISTS "Users can view all jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can insert jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can update jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can delete jurisdictions" ON jurisdictions;

-- Drop existing policies for contacts
DROP POLICY IF EXISTS "Users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;

-- Create new policies for jurisdictions table (anon + authenticated access)
CREATE POLICY "Anyone can view all jurisdictions"
  ON jurisdictions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert jurisdictions"
  ON jurisdictions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update jurisdictions"
  ON jurisdictions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete jurisdictions"
  ON jurisdictions FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create new policies for contacts table (anon + authenticated access)
CREATE POLICY "Anyone can view all contacts"
  ON contacts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert contacts"
  ON contacts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update contacts"
  ON contacts FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete contacts"
  ON contacts FOR DELETE
  TO anon, authenticated
  USING (true);
