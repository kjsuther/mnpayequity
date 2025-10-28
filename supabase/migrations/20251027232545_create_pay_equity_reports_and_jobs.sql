/*
  # Create Pay Equity Reports and Job Classifications Schema

  1. New Tables
    - `reports`
      - `id` (uuid, primary key) - Unique identifier for each report
      - `jurisdiction_id` (uuid, foreign key) - References jurisdictions table
      - `report_year` (integer) - Year the report is for (e.g., 2024)
      - `case_number` (integer) - Case number for the year
      - `case_description` (text) - Description following "YYYY DATA" format
      - `case_status` (text) - Status: Private, Shared, Submitted, In Compliance, Out of Compliance
      - `compliance_status` (text) - Detailed compliance result
      - `submitted_at` (timestamptz) - When report was officially submitted
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

    - `job_classifications`
      - `id` (uuid, primary key) - Unique identifier for each job
      - `report_id` (uuid, foreign key) - References reports table
      - `job_number` (integer) - Sequential job number within report
      - `title` (text) - Job title/classification name
      - `males` (integer) - Number of male employees
      - `females` (integer) - Number of female employees
      - `points` (integer) - Job evaluation points
      - `min_salary` (numeric) - Minimum salary for classification
      - `max_salary` (numeric) - Maximum salary for classification
      - `years_to_max` (numeric) - Years to reach maximum salary
      - `years_service_pay` (numeric) - Years of service pay
      - `exceptional_service_category` (text) - Category: LONGEVITY, PERFORMANCE, etc.
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

    - `implementation_reports`
      - `id` (uuid, primary key) - Unique identifier
      - `report_id` (uuid, foreign key) - References reports table (one-to-one)
      - `evaluation_system` (text) - Job evaluation system used
      - `evaluation_description` (text) - Description of evaluation system (max 240 chars)
      - `health_benefits_evaluated` (text) - Health insurance benefits evaluation status
      - `health_benefits_description` (text) - Description of benefits evaluation
      - `notice_location` (text) - Where official notice was posted (max 60 chars)
      - `approved_by_body` (text) - Governing body that approved (max 60 chars)
      - `chief_elected_official` (text) - Name of chief elected official (max 60 chars)
      - `official_title` (text) - Title of official (max 60 chars)
      - `approval_confirmed` (boolean) - Checkbox confirmation
      - `total_payroll` (numeric) - Annual payroll for previous calendar year
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record last update timestamp

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users to perform CRUD operations
    - Cascade deletes to maintain referential integrity
    
  3. Notes
    - Reports are scoped to jurisdictions with foreign key constraints
    - Job classifications belong to specific reports
    - Implementation reports have one-to-one relationship with reports
    - Case status tracks workflow progress from draft to submission
    - Compliance status stores analysis results
*/

-- Create reports table
CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  case_number integer NOT NULL DEFAULT 1,
  case_description text NOT NULL DEFAULT '',
  case_status text DEFAULT 'Private',
  compliance_status text DEFAULT '',
  submitted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(jurisdiction_id, report_year, case_number)
);

-- Create job_classifications table
CREATE TABLE IF NOT EXISTS job_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  job_number integer NOT NULL,
  title text NOT NULL DEFAULT '',
  males integer DEFAULT 0,
  females integer DEFAULT 0,
  points integer DEFAULT 0,
  min_salary numeric(10,2) DEFAULT 0,
  max_salary numeric(10,2) DEFAULT 0,
  years_to_max numeric(4,2) DEFAULT 0,
  years_service_pay numeric(4,2) DEFAULT 0,
  exceptional_service_category text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(report_id, job_number)
);

-- Create implementation_reports table
CREATE TABLE IF NOT EXISTS implementation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  evaluation_system text DEFAULT '',
  evaluation_description text DEFAULT '',
  health_benefits_evaluated text DEFAULT '',
  health_benefits_description text DEFAULT '',
  notice_location text DEFAULT '',
  approved_by_body text DEFAULT '',
  chief_elected_official text DEFAULT '',
  official_title text DEFAULT '',
  approval_confirmed boolean DEFAULT false,
  total_payroll numeric(15,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_reports_jurisdiction_id ON reports(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_reports_report_year ON reports(report_year);
CREATE INDEX IF NOT EXISTS idx_job_classifications_report_id ON job_classifications(report_id);
CREATE INDEX IF NOT EXISTS idx_implementation_reports_report_id ON implementation_reports(report_id);

-- Enable Row Level Security
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE implementation_reports ENABLE ROW LEVEL SECURITY;

-- Policies for reports table
CREATE POLICY "Users can view all reports"
  ON reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert reports"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update reports"
  ON reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete reports"
  ON reports FOR DELETE
  TO authenticated
  USING (true);

-- Policies for job_classifications table
CREATE POLICY "Users can view all job classifications"
  ON job_classifications FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert job classifications"
  ON job_classifications FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update job classifications"
  ON job_classifications FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete job classifications"
  ON job_classifications FOR DELETE
  TO authenticated
  USING (true);

-- Policies for implementation_reports table
CREATE POLICY "Users can view all implementation reports"
  ON implementation_reports FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert implementation reports"
  ON implementation_reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update implementation reports"
  ON implementation_reports FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete implementation reports"
  ON implementation_reports FOR DELETE
  TO authenticated
  USING (true);