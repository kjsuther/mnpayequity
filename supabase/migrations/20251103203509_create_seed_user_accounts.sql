/*
  # Create Seed User Accounts

  1. Purpose
    - Create admin user account profile (user must be created via Supabase Auth first)
    - Create test user account profile (user must be created via Supabase Auth first)
    
  2. Users to Create
    - Admin: admin@admin.com with is_admin=true, jurisdiction_id=null
    - Test User: test@minneapolis.gov with is_admin=false, jurisdiction_id='12345'
    
  3. Notes
    - This migration only creates the user_profiles entries
    - Actual auth.users entries must be created through Supabase Auth signup
    - Passwords: Admin123456 for admin, Test123456 for test user
    - These profiles will be linked once users sign up through the application
*/

-- Note: User profiles will be created automatically on first login through the application
-- This is a placeholder migration to document the intended seed accounts
-- The actual user creation happens through Supabase Auth API

-- Create a function to automatically create user profiles on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, jurisdiction_id, is_admin)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'jurisdiction_id',
    CASE 
      WHEN NEW.email = 'admin@admin.com' THEN true
      ELSE false
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to run on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
