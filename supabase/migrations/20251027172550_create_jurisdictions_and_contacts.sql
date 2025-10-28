/*
  # Create Pay Equity Management System Database Schema

  1. New Tables
    - `jurisdictions`
      - `id` (uuid, primary key) - Unique identifier for each jurisdiction
      - `jurisdiction_id` (text) - Business jurisdiction ID (e.g., "12345")
      - `name` (text) - Jurisdiction name
      - `address` (text) - Street address
      - `city` (text) - City name
      - `state` (text) - State abbreviation (default 'MN')
      - `zipcode` (text) - Zip code
      - `phone` (text) - Phone number
      - `fax` (text) - Fax number
      - `jurisdiction_type` (text) - Type of jurisdiction (e.g., "City", "County", "School District")
      - `next_report_year` (integer) - Next reporting year
      - `follow_up_type` (text) - Type of follow up needed
      - `follow_up_date` (date) - Date for follow up
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

    - `contacts`
      - `id` (uuid, primary key) - Unique identifier for each contact
      - `jurisdiction_id` (uuid, foreign key) - References jurisdictions table
      - `name` (text) - Contact full name
      - `title` (text) - Job title/role
      - `is_primary` (boolean) - Whether this is the primary contact
      - `email` (text) - Email address
      - `phone` (text) - Phone number
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to perform CRUD operations
    
  3. Notes
    - Using text fields for flexibility in phone/fax formatting
    - jurisdiction_id is the business ID, not the primary key
    - Only one primary contact recommended per jurisdiction
    - Foreign key constraint ensures data integrity between tables
*/

-- Create jurisdictions table
CREATE TABLE IF NOT EXISTS jurisdictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  address text DEFAULT '',
  city text DEFAULT '',
  state text DEFAULT 'MN',
  zipcode text DEFAULT '',
  phone text DEFAULT '',
  fax text DEFAULT '',
  jurisdiction_type text DEFAULT '',
  next_report_year integer,
  follow_up_type text DEFAULT '',
  follow_up_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  title text DEFAULT '',
  is_primary boolean DEFAULT false,
  email text DEFAULT '',
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_jurisdiction_id ON contacts(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_jurisdictions_jurisdiction_id ON jurisdictions(jurisdiction_id);

-- Enable Row Level Security
ALTER TABLE jurisdictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policies for jurisdictions table
CREATE POLICY "Users can view all jurisdictions"
  ON jurisdictions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert jurisdictions"
  ON jurisdictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update jurisdictions"
  ON jurisdictions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete jurisdictions"
  ON jurisdictions FOR DELETE
  TO authenticated
  USING (true);

-- Policies for contacts table
CREATE POLICY "Users can view all contacts"
  ON contacts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert contacts"
  ON contacts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update contacts"
  ON contacts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete contacts"
  ON contacts FOR DELETE
  TO authenticated
  USING (true);

-- Insert sample data for demonstration
INSERT INTO jurisdictions (jurisdiction_id, name, address, city, state, zipcode, phone, fax, jurisdiction_type, next_report_year, follow_up_type, follow_up_date)
VALUES 
  ('12345', 'Minneapolis', '350 South 5th Street', 'Minneapolis', 'MN', '55415', '612-673-3000', '612-673-3100', 'City', 2024, 'Annual Review', '2024-12-31'),
  ('67890', 'Saint Paul', '390 City Hall', 'Saint Paul', 'MN', '55102', '651-266-8500', '651-266-8510', 'City', 2024, 'Quarterly Check', '2024-09-30')
ON CONFLICT (jurisdiction_id) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (jurisdiction_id, name, title, is_primary, email, phone)
SELECT 
  j.id,
  'John Smith',
  'HR Director',
  true,
  'john.smith@minneapolis.gov',
  '612-673-2000'
FROM jurisdictions j
WHERE j.jurisdiction_id = '12345'
ON CONFLICT DO NOTHING;

INSERT INTO contacts (jurisdiction_id, name, title, is_primary, email, phone)
SELECT 
  j.id,
  'Jane Doe',
  'Compensation Analyst',
  false,
  'jane.doe@minneapolis.gov',
  '612-673-2001'
FROM jurisdictions j
WHERE j.jurisdiction_id = '12345'
ON CONFLICT DO NOTHING;

INSERT INTO contacts (jurisdiction_id, name, title, is_primary, email, phone)
SELECT 
  j.id,
  'Michael Johnson',
  'City HR Manager',
  true,
  'michael.johnson@stpaul.gov',
  '651-266-8600'
FROM jurisdictions j
WHERE j.jurisdiction_id = '67890'
ON CONFLICT DO NOTHING;