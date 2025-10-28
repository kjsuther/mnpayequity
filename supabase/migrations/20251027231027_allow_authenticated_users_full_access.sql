/*
  # Allow Authenticated Users Full Access

  1. Changes
    - Drop restrictive RLS policies that limit by jurisdiction_id
    - Create new policies that allow all authenticated users to access all data
    - This is appropriate for an admin system where users manage multiple jurisdictions
  
  2. Security
    - Users must be authenticated to access data
    - Once authenticated, they can view and manage all jurisdictions
*/

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can view their jurisdiction" ON jurisdictions;
DROP POLICY IF EXISTS "Authenticated users can update their jurisdiction" ON jurisdictions;
DROP POLICY IF EXISTS "Authenticated users can view contacts for their jurisdiction" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts for their jurisdiction" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update contacts for their jurisdiction" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts for their jurisdiction" ON contacts;

-- Create new policies for jurisdictions (all authenticated users)
CREATE POLICY "Authenticated users can view all jurisdictions"
  ON jurisdictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jurisdictions"
  ON jurisdictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all jurisdictions"
  ON jurisdictions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete jurisdictions"
  ON jurisdictions FOR DELETE
  TO authenticated
  USING (true);

-- Create new policies for contacts (all authenticated users)
CREATE POLICY "Authenticated users can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update all contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);
