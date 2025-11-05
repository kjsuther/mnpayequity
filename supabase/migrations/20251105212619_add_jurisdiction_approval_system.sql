/*
  # Jurisdiction Approval and Status Management System

  ## New Tables and Columns

  ### Updates to `jurisdictions` table
  - `approval_status` (text) - Status of jurisdiction: 'pending', 'approved', 'rejected'
  - `approved_by` (text) - Email of admin who approved/rejected
  - `approved_at` (timestamptz) - Timestamp of approval/rejection
  - `rejection_reason` (text) - Reason for rejection if applicable
  - `status_notes` (text) - Additional notes about the status

  ### `jurisdiction_status_history` table
  - `id` (uuid, primary key) - Unique identifier
  - `jurisdiction_id` (uuid, foreign key) - References jurisdictions table
  - `old_status` (text) - Previous approval status
  - `new_status` (text) - New approval status
  - `changed_by` (text) - Email of user who made the change
  - `change_reason` (text) - Reason for status change
  - `notes` (text) - Additional notes
  - `created_at` (timestamptz) - When change occurred

  ## Email Templates
  - Add templates for jurisdiction approval notifications
  - Add templates for jurisdiction rejection notifications
  - Add template for admin notification on failed reports

  ## Security
  - Enable RLS on jurisdiction_status_history table
  - Add policies for authenticated users to read history
  - Only admins can modify approval status
  
  ## Notes
  - Default approval_status is 'approved' for existing jurisdictions
  - All status changes are logged automatically
  - Email notifications are integrated with existing email_templates system
*/

-- Add approval status fields to jurisdictions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jurisdictions' AND column_name = 'approval_status'
  ) THEN
    ALTER TABLE jurisdictions ADD COLUMN approval_status text DEFAULT 'approved' CHECK (approval_status IN ('pending', 'approved', 'rejected'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jurisdictions' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE jurisdictions ADD COLUMN approved_by text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jurisdictions' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE jurisdictions ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jurisdictions' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE jurisdictions ADD COLUMN rejection_reason text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'jurisdictions' AND column_name = 'status_notes'
  ) THEN
    ALTER TABLE jurisdictions ADD COLUMN status_notes text;
  END IF;
END $$;

-- Create jurisdiction_status_history table
CREATE TABLE IF NOT EXISTS jurisdiction_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  jurisdiction_id uuid NOT NULL REFERENCES jurisdictions(id) ON DELETE CASCADE,
  old_status text,
  new_status text NOT NULL,
  changed_by text NOT NULL,
  change_reason text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_jurisdiction_status_history_jurisdiction_id 
  ON jurisdiction_status_history(jurisdiction_id);

CREATE INDEX IF NOT EXISTS idx_jurisdiction_status_history_created_at 
  ON jurisdiction_status_history(created_at DESC);

-- Enable RLS on jurisdiction_status_history
ALTER TABLE jurisdiction_status_history ENABLE ROW LEVEL SECURITY;

-- Policies for jurisdiction_status_history table
CREATE POLICY "Authenticated users can view jurisdiction status history"
  ON jurisdiction_status_history FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert jurisdiction status history"
  ON jurisdiction_status_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Add email templates for approval/rejection notifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE type = 'jurisdiction_approved') THEN
    ALTER TABLE email_templates DROP CONSTRAINT IF EXISTS email_templates_type_check;
    ALTER TABLE email_templates ADD CONSTRAINT email_templates_type_check 
      CHECK (type IN ('announcement', 'fail_to_report', 'jurisdiction_approved', 'jurisdiction_rejected', 'admin_fail_notification'));
    
    INSERT INTO email_templates (name, type, subject, body) VALUES
    (
      'Jurisdiction Approval Notification',
      'jurisdiction_approved',
      'Your Jurisdiction Has Been Approved - {{jurisdiction_name}}',
      'Dear {{contact_name}},

We are pleased to inform you that {{jurisdiction_name}} (ID: {{jurisdiction_id}}) has been approved for pay equity reporting.

You now have full access to the Minnesota Pay Equity Management System and can begin:
- Creating pay equity reports
- Entering job classifications
- Running compliance analyses
- Submitting official reports

To access the system, please visit the MN Pay Equity Management System and log in with your credentials.

{{#if notes}}
Additional Notes:
{{notes}}
{{/if}}

If you have any questions or need assistance getting started, please contact us.

Welcome to the Pay Equity Reporting System!

Best regards,
Minnesota Management and Budget
Pay Equity Division'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE type = 'jurisdiction_rejected') THEN
    INSERT INTO email_templates (name, type, subject, body) VALUES
    (
      'Jurisdiction Application Status',
      'jurisdiction_rejected',
      'Jurisdiction Application Update - {{jurisdiction_name}}',
      'Dear {{contact_name}},

Thank you for your application to register {{jurisdiction_name}} (ID: {{jurisdiction_id}}) in the Minnesota Pay Equity Management System.

After review, we need additional information or corrections before we can approve your jurisdiction.

Reason:
{{rejection_reason}}

{{#if notes}}
Additional Information:
{{notes}}
{{/if}}

Next Steps:
Please review the information provided and make any necessary corrections. Once you have addressed the items mentioned above, please resubmit or contact us for assistance.

If you have questions or need clarification, please reach out to our office.

Sincerely,
Minnesota Management and Budget
Pay Equity Division'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM email_templates WHERE type = 'admin_fail_notification') THEN
    INSERT INTO email_templates (name, type, subject, body) VALUES
    (
      'Admin Notification - Jurisdiction Failed to Report',
      'admin_fail_notification',
      'Admin Alert: Jurisdictions Failed to Report for {{year}}',
      'Minnesota Pay Equity Administration,

This is an automated notification that {{failed_count}} jurisdiction(s) have failed to submit their required pay equity reports for year {{year}}.

Failed Jurisdictions:
{{#each failed_jurisdictions}}
- {{name}} (ID: {{jurisdiction_id}}) - Due: {{next_report_year}}
{{/each}}

Action Required:
1. Review the list of non-compliant jurisdictions
2. Send fail-to-report notices through the system
3. Follow up with jurisdictions as needed
4. Document compliance actions taken

You can access the fail-to-report management system to send official notices.

This is an automated administrative notification.

Minnesota Pay Equity Management System'
    );
  END IF;
END $$;

-- Function to automatically log jurisdiction status changes
CREATE OR REPLACE FUNCTION log_jurisdiction_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.approval_status IS DISTINCT FROM NEW.approval_status) THEN
    INSERT INTO jurisdiction_status_history (
      jurisdiction_id,
      old_status,
      new_status,
      changed_by,
      change_reason,
      notes
    ) VALUES (
      NEW.id,
      OLD.approval_status,
      NEW.approval_status,
      NEW.approved_by,
      NEW.rejection_reason,
      NEW.status_notes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic status change logging
DROP TRIGGER IF EXISTS jurisdiction_status_change_trigger ON jurisdictions;
CREATE TRIGGER jurisdiction_status_change_trigger
  AFTER UPDATE ON jurisdictions
  FOR EACH ROW
  EXECUTE FUNCTION log_jurisdiction_status_change();