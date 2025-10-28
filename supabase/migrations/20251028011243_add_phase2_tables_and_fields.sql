/*
  # Phase 2 Tables and Fields for Pay Equity Reporting

  ## New Tables
  
  1. `submission_checklists`
    - Tracks validation requirements before report submission
    - Links to reports table
    - Contains boolean fields for each validation step
    - Stores validation timestamps
  
  2. `audit_logs`
    - Tracks all changes to reports, jobs, and implementation data
    - Records user actions with timestamps
    - Stores old and new values for changes
  
  3. `benefits_worksheets`
    - Stores health insurance benefits calculations
    - Links to reports table
    - Contains employer contribution amounts by class
    - Tracks comparable value ranges and disadvantage triggers
  
  ## Enhanced Fields
  
  - Add alternative_analysis_notes to reports table
  - Add benefits_included_in_salary to job_classifications
  - Add significant_changes_explanation to reports

  ## Security
  - Enable RLS on all new tables
  - Add policies for authenticated users to manage their jurisdiction data
*/

-- Create submission_checklists table
CREATE TABLE IF NOT EXISTS submission_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  job_evaluation_complete boolean DEFAULT false,
  jobs_data_entered boolean DEFAULT false,
  benefits_evaluated boolean DEFAULT false,
  compliance_reviewed boolean DEFAULT false,
  implementation_form_complete boolean DEFAULT false,
  governing_body_approved boolean DEFAULT false,
  total_payroll_entered boolean DEFAULT false,
  official_notice_posted boolean DEFAULT false,
  all_validations_passed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE submission_checklists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage submission checklists"
  ON submission_checklists
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_id uuid REFERENCES reports(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  table_name text NOT NULL,
  record_id uuid,
  old_values jsonb,
  new_values jsonb,
  user_email text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view audit logs for their jurisdiction"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert audit logs"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create benefits_worksheets table
CREATE TABLE IF NOT EXISTS benefits_worksheets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  lowest_points integer NOT NULL DEFAULT 0,
  highest_points integer NOT NULL DEFAULT 0,
  point_range integer NOT NULL DEFAULT 0,
  comparable_value_range integer NOT NULL DEFAULT 0,
  trigger_detected boolean DEFAULT false,
  trigger_explanation text,
  benefits_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE benefits_worksheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage benefits worksheets"
  ON benefits_worksheets
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Add new fields to existing tables
DO $$
BEGIN
  -- Add alternative_analysis_notes to reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'alternative_analysis_notes'
  ) THEN
    ALTER TABLE reports ADD COLUMN alternative_analysis_notes text;
  END IF;

  -- Add significant_changes_explanation to reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'significant_changes_explanation'
  ) THEN
    ALTER TABLE reports ADD COLUMN significant_changes_explanation text;
  END IF;

  -- Add requires_manual_review to reports
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'requires_manual_review'
  ) THEN
    ALTER TABLE reports ADD COLUMN requires_manual_review boolean DEFAULT false;
  END IF;

  -- Add benefits_included_in_salary to job_classifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_classifications' AND column_name = 'benefits_included_in_salary'
  ) THEN
    ALTER TABLE job_classifications ADD COLUMN benefits_included_in_salary numeric(10,2) DEFAULT 0;
  END IF;

  -- Add is_part_time to job_classifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_classifications' AND column_name = 'is_part_time'
  ) THEN
    ALTER TABLE job_classifications ADD COLUMN is_part_time boolean DEFAULT false;
  END IF;

  -- Add hours_per_week to job_classifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_classifications' AND column_name = 'hours_per_week'
  ) THEN
    ALTER TABLE job_classifications ADD COLUMN hours_per_week numeric(5,2);
  END IF;

  -- Add days_per_year to job_classifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_classifications' AND column_name = 'days_per_year'
  ) THEN
    ALTER TABLE job_classifications ADD COLUMN days_per_year integer;
  END IF;

  -- Add additional_cash_compensation to job_classifications
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_classifications' AND column_name = 'additional_cash_compensation'
  ) THEN
    ALTER TABLE job_classifications ADD COLUMN additional_cash_compensation numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_submission_checklists_report_id ON submission_checklists(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_jurisdiction_id ON audit_logs(jurisdiction_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_report_id ON audit_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_benefits_worksheets_report_id ON benefits_worksheets(report_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);