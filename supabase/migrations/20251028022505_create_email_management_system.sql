/*
  # Email Management System for Jurisdiction Communications

  ## New Tables
  
  ### `email_templates`
  - `id` (uuid, primary key)
  - `name` (text) - Template name for identification
  - `type` (text) - 'announcement' or 'fail_to_report'
  - `subject` (text) - Default email subject line
  - `body` (text) - Email body template with merge fields
  - `is_active` (boolean) - Whether template is currently in use
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `email_logs`
  - `id` (uuid, primary key)
  - `email_type` (text) - Type of email sent
  - `report_year` (integer) - Year for which email was sent
  - `jurisdiction_id` (uuid, foreign key to jurisdictions)
  - `recipient_email` (text) - Email address of recipient
  - `recipient_name` (text) - Name of recipient
  - `subject` (text) - Email subject line used
  - `body` (text) - Email body content sent
  - `sent_at` (timestamptz) - When email was sent
  - `sent_by` (text) - User who sent the email
  - `delivery_status` (text) - 'sent', 'failed', 'pending'
  - `error_message` (text) - Error details if delivery failed
  - `created_at` (timestamptz)

  ### `email_drafts`
  - `id` (uuid, primary key)
  - `email_type` (text) - Type of email
  - `report_year` (integer) - Year for email
  - `subject` (text) - Draft subject
  - `body` (text) - Draft body
  - `selected_jurisdictions` (jsonb) - Array of jurisdiction IDs
  - `created_by` (text) - User who created draft
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their emails
  - Add policies for reading email logs and templates

  ## Initial Data
  - Insert default email templates for announcements and fail-to-report notices
*/

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('announcement', 'fail_to_report')),
  subject text NOT NULL,
  body text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email templates"
  ON email_templates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email templates"
  ON email_templates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update email templates"
  ON email_templates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type text NOT NULL,
  report_year integer NOT NULL,
  jurisdiction_id uuid REFERENCES jurisdictions(id) ON DELETE CASCADE,
  recipient_email text NOT NULL,
  recipient_name text NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  sent_at timestamptz DEFAULT now(),
  sent_by text,
  delivery_status text DEFAULT 'pending' CHECK (delivery_status IN ('sent', 'failed', 'pending')),
  error_message text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update email logs"
  ON email_logs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create email_drafts table
CREATE TABLE IF NOT EXISTS email_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email_type text NOT NULL,
  report_year integer NOT NULL,
  subject text NOT NULL,
  body text NOT NULL,
  selected_jurisdictions jsonb DEFAULT '[]'::jsonb,
  created_by text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE email_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read email drafts"
  ON email_drafts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert email drafts"
  ON email_drafts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update email drafts"
  ON email_drafts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete email drafts"
  ON email_drafts FOR DELETE
  TO authenticated
  USING (true);

-- Insert default email templates
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE type = 'announcement') THEN
    INSERT INTO email_templates (name, type, subject, body) VALUES
    (
      'Annual Report Announcement',
      'announcement',
      'Pay Equity Report Due for {{year}}',
      'Dear {{contact_name}},

This is a reminder that the Pay Equity Report for {{jurisdiction_name}} is due for the year {{year}}.

Please ensure that you complete and submit your report by the deadline. If you need assistance or have questions about the reporting process, please contact us.

Your report should include:
- Updated job classifications
- Salary information for all positions
- Benefits evaluation
- Compliance analysis

To access the reporting system, please visit the MN Pay Equity Management System.

Thank you for your continued commitment to pay equity.

Best regards,
Minnesota Management and Budget'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE type = 'fail_to_report') THEN
    INSERT INTO email_templates (name, type, subject, body) VALUES
    (
      'Fail to Report Notice',
      'fail_to_report',
      'NOTICE: Missing Pay Equity Report for {{year}} - {{jurisdiction_name}}',
      'Dear {{contact_name}},

Our records indicate that {{jurisdiction_name}} has not submitted the required Pay Equity Report for the year {{year}}.

This is an official notice that your jurisdiction is not in compliance with Minnesota''s Local Government Pay Equity Act. Failure to submit the required report may result in:

- Loss of state aid
- Legal compliance issues
- Additional follow-up from the state

IMMEDIATE ACTION REQUIRED:
Please submit your Pay Equity Report as soon as possible. If you have already submitted the report or believe this notice was sent in error, please contact us immediately.

For assistance with completing your report or accessing the reporting system, please reach out to our office.

This is an official compliance notice.

Sincerely,
Minnesota Management and Budget
Pay Equity Compliance Division'
    );
  END IF;
END $$;