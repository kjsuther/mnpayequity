/*
  # Allow Anonymous Read Access to Jurisdictions for Login

  1. Changes
    - Add RLS policy to allow anonymous users to read jurisdictions
    - This is needed so users can select their jurisdiction during login/registration
    - Only SELECT access is granted, no modifications allowed

  2. Security
    - Anonymous users can only read jurisdiction data (name, ID)
    - No write, update, or delete access for anonymous users
    - Authenticated users still follow existing access rules
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'jurisdictions' 
    AND policyname = 'Anonymous users can view jurisdictions for login'
  ) THEN
    CREATE POLICY "Anonymous users can view jurisdictions for login"
      ON jurisdictions
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;