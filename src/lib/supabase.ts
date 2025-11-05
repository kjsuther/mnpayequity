import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Jurisdiction = {
  id: string;
  jurisdiction_id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  phone: string;
  fax: string;
  jurisdiction_type: string;
  next_report_year: number | null;
  follow_up_type: string;
  follow_up_date: string | null;
  created_at: string;
  updated_at: string;
};

export type Contact = {
  id: string;
  jurisdiction_id: string;
  name: string;
  title: string;
  is_primary: boolean;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

export type Report = {
  id: string;
  jurisdiction_id: string;
  report_year: number;
  case_number: number;
  case_description: string;
  case_status: 'Private' | 'Shared' | 'Submitted' | 'In Compliance' | 'Out of Compliance';
  compliance_status: string;
  submitted_at: string | null;
  alternative_analysis_notes: string | null;
  significant_changes_explanation: string | null;
  requires_manual_review: boolean;
  created_at: string;
  updated_at: string;
};

export type JobClassification = {
  id: string;
  report_id: string;
  job_number: number;
  title: string;
  males: number;
  females: number;
  nonbinary: number;
  points: number;
  min_salary: number;
  max_salary: number;
  years_to_max: number;
  years_service_pay: number;
  exceptional_service_category: string;
  benefits_included_in_salary: number;
  is_part_time: boolean;
  hours_per_week: number | null;
  days_per_year: number | null;
  additional_cash_compensation: number;
  created_at: string;
  updated_at: string;
};

export type ImplementationReport = {
  id: string;
  report_id: string;
  evaluation_system: string;
  evaluation_description: string;
  health_benefits_evaluated: string;
  health_benefits_description: string;
  notice_location: string;
  approved_by_body: string;
  chief_elected_official: string;
  official_title: string;
  approval_confirmed: boolean;
  total_payroll: number | null;
  created_at: string;
  updated_at: string;
};

export type SubmissionChecklist = {
  id: string;
  report_id: string;
  job_evaluation_complete: boolean;
  jobs_data_entered: boolean;
  benefits_evaluated: boolean;
  compliance_reviewed: boolean;
  implementation_form_complete: boolean;
  governing_body_approved: boolean;
  total_payroll_entered: boolean;
  official_notice_posted: boolean;
  all_validations_passed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AuditLog = {
  id: string;
  jurisdiction_id: string;
  report_id: string | null;
  action_type: string;
  table_name: string;
  record_id: string | null;
  old_values: any;
  new_values: any;
  user_email: string | null;
  created_at: string;
};

export type BenefitsWorksheet = {
  id: string;
  report_id: string;
  lowest_points: number;
  highest_points: number;
  point_range: number;
  comparable_value_range: number;
  trigger_detected: boolean;
  trigger_explanation: string | null;
  benefits_data: any;
  created_at: string;
  updated_at: string;
};

export type EmailTemplate = {
  id: string;
  name: string;
  type: 'announcement' | 'fail_to_report';
  subject: string;
  body: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type EmailLog = {
  id: string;
  email_type: string;
  report_year: number;
  jurisdiction_id: string;
  recipient_email: string;
  recipient_name: string;
  subject: string;
  body: string;
  sent_at: string;
  sent_by: string | null;
  delivery_status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  created_at: string;
};

export type EmailDraft = {
  id: string;
  email_type: string;
  report_year: number;
  subject: string;
  body: string;
  selected_jurisdictions: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Note = {
  id: string;
  jurisdiction_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};
