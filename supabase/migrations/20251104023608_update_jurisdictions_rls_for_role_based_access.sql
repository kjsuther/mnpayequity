/*
  # Update Jurisdictions RLS for Role-Based Access

  1. Changes
    - Update SELECT policy to check for role field (Admin and IT see all)
    - Update other policies to use role-based access
    - Maintain backward compatibility with is_admin field

  2. Security
    - Admin and IT roles can access all jurisdictions
    - User role can only access their assigned jurisdiction
    - All policies remain restrictive by default
*/

DROP POLICY IF EXISTS "Users can view jurisdictions based on access" ON jurisdictions;
DROP POLICY IF EXISTS "Users can update jurisdictions based on access" ON jurisdictions;
DROP POLICY IF EXISTS "Admins can insert jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Admins can delete jurisdictions" ON jurisdictions;

CREATE POLICY "Users can view jurisdictions based on role"
  ON jurisdictions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (
        up.role IN ('Admin', 'IT')
        OR up.is_admin = true
        OR up.jurisdiction_id = jurisdictions.jurisdiction_id
      )
    )
  );

CREATE POLICY "Admins and IT can update jurisdictions"
  ON jurisdictions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.role IN ('Admin', 'IT') OR up.is_admin = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.role IN ('Admin', 'IT') OR up.is_admin = true)
    )
  );

CREATE POLICY "Admins and IT can insert jurisdictions"
  ON jurisdictions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.role IN ('Admin', 'IT') OR up.is_admin = true)
    )
  );

CREATE POLICY "Admins and IT can delete jurisdictions"
  ON jurisdictions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.user_id = auth.uid()
      AND (up.role IN ('Admin', 'IT') OR up.is_admin = true)
    )
  );