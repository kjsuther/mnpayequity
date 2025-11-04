/*
  # Add Role Field to User Profiles

  1. Changes
    - Add `role` column to `user_profiles` table with three possible values: 'User', 'Admin', 'IT'
    - Default role is 'User'
    - Update existing admin user to have 'Admin' role
    - Migrate existing is_admin boolean logic to role-based system

  2. Security
    - Maintain existing RLS policies
    - Role field is part of user profile and protected by existing policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE user_profiles ADD COLUMN role text NOT NULL DEFAULT 'User';
    
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_check 
      CHECK (role IN ('User', 'Admin', 'IT'));
    
    UPDATE user_profiles 
    SET role = 'Admin' 
    WHERE is_admin = true;
    
    COMMENT ON COLUMN user_profiles.role IS 'User role: User (standard), Admin (system admin), IT (technical support)';
  END IF;
END $$;