/*
  # Update RLS Policies for Jurisdiction-Based Access Control

  1. Changes
    - Drop all existing open policies on jurisdictions, contacts, reports, and related tables
    - Create new jurisdiction-based filtering policies
    - Add admin bypass conditions for users with is_admin = true
    - Ensure regular users can only access data for their assigned jurisdiction
    
  2. Security
    - Regular users: Can only view/modify data for their assigned jurisdiction
    - Admin users: Can view/modify all data across all jurisdictions
    - Uses user_profiles table to determine user's jurisdiction and admin status
    
  3. Policy Pattern
    - Check user_profiles for is_admin flag
    - If admin, allow full access
    - If not admin, filter by user's jurisdiction_id from user_profiles
*/

-- Drop existing broad access policies for jurisdictions
DROP POLICY IF EXISTS "Authenticated users can view all jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Authenticated users can insert jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Authenticated users can update all jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Authenticated users can delete jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can view all jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can insert jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can update jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Users can delete jurisdictions" ON jurisdictions;

-- Drop existing broad access policies for contacts
DROP POLICY IF EXISTS "Authenticated users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can update all contacts" ON contacts;
DROP POLICY IF EXISTS "Authenticated users can delete contacts" ON contacts;
DROP POLICY IF EXISTS "Users can view all contacts" ON contacts;
DROP POLICY IF EXISTS "Users can insert contacts" ON contacts;
DROP POLICY IF EXISTS "Users can update contacts" ON contacts;
DROP POLICY IF EXISTS "Users can delete contacts" ON contacts;

-- Drop existing broad access policies for reports
DROP POLICY IF EXISTS "Users can view all reports" ON reports;
DROP POLICY IF EXISTS "Users can insert reports" ON reports;
DROP POLICY IF EXISTS "Users can update reports" ON reports;
DROP POLICY IF EXISTS "Users can delete reports" ON reports;

-- Drop existing broad access policies for job_classifications
DROP POLICY IF EXISTS "Users can view all job classifications" ON job_classifications;
DROP POLICY IF EXISTS "Users can insert job classifications" ON job_classifications;
DROP POLICY IF EXISTS "Users can update job classifications" ON job_classifications;
DROP POLICY IF EXISTS "Users can delete job classifications" ON job_classifications;

-- Drop existing broad access policies for implementation_reports
DROP POLICY IF EXISTS "Users can view all implementation reports" ON implementation_reports;
DROP POLICY IF EXISTS "Users can insert implementation reports" ON implementation_reports;
DROP POLICY IF EXISTS "Users can update implementation reports" ON implementation_reports;
DROP POLICY IF EXISTS "Users can delete implementation reports" ON implementation_reports;

-- NEW JURISDICTION-BASED POLICIES FOR JURISDICTIONS TABLE

CREATE POLICY "Users can view jurisdictions based on access"
  ON jurisdictions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.is_admin = true OR up.jurisdiction_id = jurisdictions.jurisdiction_id)
    )
  );

CREATE POLICY "Admins can insert jurisdictions"
  ON jurisdictions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  );

CREATE POLICY "Users can update jurisdictions based on access"
  ON jurisdictions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.is_admin = true OR up.jurisdiction_id = jurisdictions.jurisdiction_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.is_admin = true OR up.jurisdiction_id = jurisdictions.jurisdiction_id)
    )
  );

CREATE POLICY "Admins can delete jurisdictions"
  ON jurisdictions FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND up.is_admin = true
    )
  );

-- NEW JURISDICTION-BASED POLICIES FOR CONTACTS TABLE

CREATE POLICY "Users can view contacts based on jurisdiction access"
  ON contacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = contacts.jurisdiction_id
    )
  );

CREATE POLICY "Users can insert contacts based on jurisdiction access"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = contacts.jurisdiction_id
    )
  );

CREATE POLICY "Users can update contacts based on jurisdiction access"
  ON contacts FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = contacts.jurisdiction_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = contacts.jurisdiction_id
    )
  );

CREATE POLICY "Users can delete contacts based on jurisdiction access"
  ON contacts FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = contacts.jurisdiction_id
    )
  );

-- NEW JURISDICTION-BASED POLICIES FOR REPORTS TABLE

CREATE POLICY "Users can view reports based on jurisdiction access"
  ON reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = reports.jurisdiction_id
    )
  );

CREATE POLICY "Users can insert reports based on jurisdiction access"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = reports.jurisdiction_id
    )
  );

CREATE POLICY "Users can update reports based on jurisdiction access"
  ON reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = reports.jurisdiction_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = reports.jurisdiction_id
    )
  );

CREATE POLICY "Users can delete reports based on jurisdiction access"
  ON reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      WHERE up.user_id = auth.uid()
      AND j.id = reports.jurisdiction_id
    )
  );

-- NEW JURISDICTION-BASED POLICIES FOR JOB_CLASSIFICATIONS TABLE

CREATE POLICY "Users can view job classifications based on jurisdiction access"
  ON job_classifications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = job_classifications.report_id
    )
  );

CREATE POLICY "Users can insert job classifications based on jurisdiction access"
  ON job_classifications FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = job_classifications.report_id
    )
  );

CREATE POLICY "Users can update job classifications based on jurisdiction access"
  ON job_classifications FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = job_classifications.report_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = job_classifications.report_id
    )
  );

CREATE POLICY "Users can delete job classifications based on jurisdiction access"
  ON job_classifications FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = job_classifications.report_id
    )
  );

-- NEW JURISDICTION-BASED POLICIES FOR IMPLEMENTATION_REPORTS TABLE

CREATE POLICY "Users can view implementation reports based on jurisdiction access"
  ON implementation_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = implementation_reports.report_id
    )
  );

CREATE POLICY "Users can insert implementation reports based on jurisdiction access"
  ON implementation_reports FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = implementation_reports.report_id
    )
  );

CREATE POLICY "Users can update implementation reports based on jurisdiction access"
  ON implementation_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = implementation_reports.report_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = implementation_reports.report_id
    )
  );

CREATE POLICY "Users can delete implementation reports based on jurisdiction access"
  ON implementation_reports FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      INNER JOIN jurisdictions j ON (up.is_admin = true OR up.jurisdiction_id = j.jurisdiction_id)
      INNER JOIN reports r ON r.jurisdiction_id = j.id
      WHERE up.user_id = auth.uid()
      AND r.id = implementation_reports.report_id
    )
  );
