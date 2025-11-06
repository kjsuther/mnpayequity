/*
  # Fix Infinite Recursion in RLS Policies

  1. Changes
    - Remove circular dependencies in RLS policies
    - Simplify policies to avoid querying the same table within its own policy
    - Use security definer functions to break recursion chains

  2. Security
    - Maintain same access control logic
    - Prevent infinite recursion errors
    - Keep policies restrictive and role-based
*/

CREATE OR REPLACE FUNCTION is_admin_or_it()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND (role IN ('Admin', 'IT') OR is_admin = true)
  );
$$;

CREATE OR REPLACE FUNCTION get_user_jurisdiction()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT jurisdiction_id FROM user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM user_profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;

CREATE POLICY "Users can view profiles based on role"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR is_admin_or_it()
  );

CREATE POLICY "Admins and IT can update profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_it())
  WITH CHECK (is_admin_or_it());

CREATE POLICY "Admins and IT can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_it());

CREATE POLICY "Admins and IT can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (is_admin_or_it());

DROP POLICY IF EXISTS "Users can view jurisdictions based on role" ON jurisdictions;
DROP POLICY IF EXISTS "Admins and IT can update jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Admins and IT can insert jurisdictions" ON jurisdictions;
DROP POLICY IF EXISTS "Admins and IT can delete jurisdictions" ON jurisdictions;

CREATE POLICY "Users can view jurisdictions based on role"
  ON jurisdictions
  FOR SELECT
  TO authenticated
  USING (
    is_admin_or_it()
    OR jurisdiction_id = get_user_jurisdiction()
  );

CREATE POLICY "Admins and IT can update jurisdictions"
  ON jurisdictions
  FOR UPDATE
  TO authenticated
  USING (is_admin_or_it())
  WITH CHECK (is_admin_or_it());

CREATE POLICY "Admins and IT can insert jurisdictions"
  ON jurisdictions
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin_or_it());

CREATE POLICY "Admins and IT can delete jurisdictions"
  ON jurisdictions
  FOR DELETE
  TO authenticated
  USING (is_admin_or_it());