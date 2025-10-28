/*
  # Update RLS Policies for Authenticated Users

  1. Changes
    - Drop existing policies that allow anon access
    - Create new policies that require authentication
    - Users can only access data for their jurisdiction
  
  2. Security
    - Policies now require users to be authenticated
    - Users can only see/modify data associated with their jurisdiction_id
    - Admin users (if needed) can be added later with different policies
*/

-- Drop existing policies for jurisdictions
DROP POLICY IF EXISTS "Anyone can view all jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Anyone can insert jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Anyone can update jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Anyone can delete jurisdictions" ON jurisdictions;

-- Drop existing policies for contacts
DROP POLICY IF EXISTS "Anyone can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can update contacts" ON contacts;
DROP POLICY IF EXISTS "Anyone can delete contacts" ON contacts;

-- Create new policies for jurisdictions table (authenticated users only)
CREATE POLICY "Authenticated users can view their jurisdiction"
  ON jurisdictions FOR SELECT
  TO authenticated
  USING (
    jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
  );

CREATE POLICY "Authenticated users can update their jurisdiction"
  ON jurisdictions FOR UPDATE
  TO authenticated
  USING (
    jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
  )
  WITH CHECK (
    jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
  );

-- Create new policies for contacts table (authenticated users only)
CREATE POLICY "Authenticated users can view contacts for their jurisdiction"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jurisdictions
      WHERE jurisdictions.id = contacts.jurisdiction_id
      AND jurisdictions.jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
    )
  );

CREATE POLICY "Authenticated users can insert contacts for their jurisdiction"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jurisdictions
      WHERE jurisdictions.id = contacts.jurisdiction_id
      AND jurisdictions.jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
    )
  );

CREATE POLICY "Authenticated users can update contacts for their jurisdiction"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jurisdictions
      WHERE jurisdictions.id = contacts.jurisdiction_id
      AND jurisdictions.jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM jurisdictions
      WHERE jurisdictions.id = contacts.jurisdiction_id
      AND jurisdictions.jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
    )
  );

CREATE POLICY "Authenticated users can delete contacts for their jurisdiction"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM jurisdictions
      WHERE jurisdictions.id = contacts.jurisdiction_id
      AND jurisdictions.jurisdiction_id = (auth.jwt() -> 'user_metadata' ->> 'jurisdiction_id')
    )
  );
