/*
  # Add Case Approval Workflow System

  ## Overview
  This migration enhances the case submission and approval workflow by adding fields and tables
  to support automatic approval, manual review, certificate storage, and approval tracking.

  ## Changes Made

  ### 1. Reports Table Updates
  - Add `approval_status` field to track submission state (pending, approved, rejected, auto_approved)
  - Add `approved_by` field to store the staff member who approved the case
  - Add `approved_at` timestamp for audit purposes
  - Add `rejection_reason` field for storing explanations when cases are not approved
  - Add `certificate_generated_at` timestamp for tracking when certificate was created
  - Add `auto_approved` boolean to distinguish automatic vs manual approvals

  ### 2. Certificates Table
  - Create new `compliance_certificates` table to store generated PDF certificates
  - Link certificates to specific report records
  - Store certificate metadata and file path/URL

  ### 3. Approval History Table
  - Create `approval_history` table to track all approval actions and status changes
  - Maintain complete audit trail of approval decisions
  - Track who made changes and when

  ### 4. System Configuration Table
  - Create `system_config` table for system-wide settings
  - Store commissioner name and other configurable values

  ## Security
  - Enable RLS on all new tables
  - Add policies for authenticated users to manage approvals
  - Restrict access based on user roles where appropriate
*/

-- Add new fields to reports table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE reports ADD COLUMN approval_status text DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE reports ADD COLUMN approved_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE reports ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE reports ADD COLUMN rejection_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'certificate_generated_at'
  ) THEN
    ALTER TABLE reports ADD COLUMN certificate_generated_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'auto_approved'
  ) THEN
    ALTER TABLE reports ADD COLUMN auto_approved boolean DEFAULT false;
  END IF;
END $$;

-- Create compliance_certificates table
CREATE TABLE IF NOT EXISTS compliance_certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  report_year integer NOT NULL,
  certificate_data text NOT NULL,
  file_name text NOT NULL,
  generated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view certificates"
  ON compliance_certificates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create certificates"
  ON compliance_certificates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update certificates"
  ON compliance_certificates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create approval_history table
CREATE TABLE IF NOT EXISTS approval_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  previous_status text,
  new_status text NOT NULL,
  approved_by text,
  reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view approval history"
  ON approval_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create approval history"
  ON approval_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create system_config table
CREATE TABLE IF NOT EXISTS system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  description text,
  updated_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view system config"
  ON system_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update system config"
  ON system_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can insert system config"
  ON system_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default system configuration
INSERT INTO system_config (config_key, config_value, description)
VALUES 
  ('commissioner_name', 'Dominique Murray', 'Name of the Pay Equity Commissioner for certificates')
ON CONFLICT (config_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_reports_approval_status ON reports(approval_status);
CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON reports(submitted_at);
CREATE INDEX IF NOT EXISTS idx_certificates_report_id ON compliance_certificates(report_id);
CREATE INDEX IF NOT EXISTS idx_approval_history_report_id ON approval_history(report_id);

-- Add comment to explain approval_status values
COMMENT ON COLUMN reports.approval_status IS 'Status values: draft, pending, approved, rejected, auto_approved';
