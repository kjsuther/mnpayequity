import { supabase } from './supabase';
import { analyzeCompliance } from './complianceAnalysis';
import { generateCertificatePDF } from './certificateGenerator';

export async function processAutoApproval(reportId: string): Promise<boolean> {
  try {
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('id', reportId)
      .single();

    if (reportError || !report) {
      console.error('Error fetching report:', reportError);
      return false;
    }

    const { data: jurisdiction, error: jurisdictionError } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('id', report.jurisdiction_id)
      .single();

    if (jurisdictionError || !jurisdiction) {
      console.error('Error fetching jurisdiction:', jurisdictionError);
      return false;
    }

    const { data: jobs, error: jobsError } = await supabase
      .from('job_classifications')
      .select('*')
      .eq('report_id', reportId);

    if (jobsError || !jobs || jobs.length === 0) {
      console.error('Error fetching jobs:', jobsError);
      return false;
    }

    const complianceResult = analyzeCompliance(jobs);

    if (complianceResult.requiresManualReview) {
      await supabase.from('reports').update({
        approval_status: 'pending',
        requires_manual_review: true,
      }).eq('id', reportId);

      await supabase.from('approval_history').insert({
        report_id: reportId,
        jurisdiction_id: report.jurisdiction_id,
        action_type: 'manual_review_required',
        previous_status: 'draft',
        new_status: 'pending',
        reason: 'Three or fewer male classes - Alternative Analysis required',
      });

      await sendStaffNotificationEmail(report, 'Manual review required');

      return false;
    }

    if (complianceResult.isCompliant) {
      const certificateData = await generateCertificatePDF(report, jurisdiction);

      await supabase.from('compliance_certificates').insert({
        report_id: reportId,
        jurisdiction_id: report.jurisdiction_id,
        report_year: report.report_year,
        certificate_data: certificateData,
        file_name: `${jurisdiction.name.replace(/\s+/g, '_')}_Certificate_${report.report_year}.pdf`,
        generated_by: 'Auto-Approval System',
      });

      await supabase.from('reports').update({
        approval_status: 'auto_approved',
        approved_by: 'Auto-Approval System',
        approved_at: new Date().toISOString(),
        auto_approved: true,
        case_status: 'In Compliance',
        compliance_status: 'In Compliance',
        certificate_generated_at: new Date().toISOString(),
      }).eq('id', reportId);

      await supabase.from('approval_history').insert({
        report_id: reportId,
        jurisdiction_id: report.jurisdiction_id,
        action_type: 'auto_approved',
        previous_status: 'draft',
        new_status: 'auto_approved',
        approved_by: 'Auto-Approval System',
        reason: 'Passed all compliance tests',
      });

      await sendApprovalNotificationEmail(report, certificateData);

      return true;
    } else {
      await supabase.from('reports').update({
        approval_status: 'pending',
        case_status: 'Out of Compliance',
        compliance_status: 'Out of Compliance',
      }).eq('id', reportId);

      await supabase.from('approval_history').insert({
        report_id: reportId,
        jurisdiction_id: report.jurisdiction_id,
        action_type: 'failed_tests',
        previous_status: 'draft',
        new_status: 'pending',
        reason: 'Failed one or more compliance tests',
      });

      await sendStaffNotificationEmail(report, 'Failed compliance tests - manual review needed');

      return false;
    }
  } catch (error) {
    console.error('Error in auto-approval process:', error);
    return false;
  }
}

async function sendApprovalNotificationEmail(report: any, certificateData: string) {
  try {
    const { data: jurisdiction } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('id', report.jurisdiction_id)
      .single();

    if (!jurisdiction) return;

    const { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('jurisdiction_id', report.jurisdiction_id);

    if (!contacts || contacts.length === 0) return;

    for (const contact of contacts) {
      await supabase.from('email_log').insert({
        email_type: 'approval_notification',
        report_year: report.report_year,
        jurisdiction_id: report.jurisdiction_id,
        recipient_email: contact.email,
        recipient_name: contact.name,
        subject: `Pay Equity Report Approved - ${jurisdiction.name} - ${report.report_year}`,
        body: `
Dear ${contact.name},

Congratulations! Your pay equity report for ${report.report_year} has been automatically approved.

Jurisdiction: ${jurisdiction.name}
Report Year: ${report.report_year}
Case Number: ${report.case_number}
Status: In Compliance

Your compliance certificate is attached to this email. Please download and post it in a prominent location accessible to all employees for at least 90 days as required by Minnesota law.

If you have any questions, please contact the Pay Equity Unit at (651) 259-3824 or payequity.mmb@state.mn.us.

Thank you for your compliance with the Minnesota Local Government Pay Equity Act.

Sincerely,
Minnesota Management and Budget
Pay Equity Unit
        `.trim(),
        sent_at: new Date().toISOString(),
        sent_by: 'Auto-Approval System',
        delivery_status: 'sent',
      });
    }
  } catch (error) {
    console.error('Error sending approval notification:', error);
  }
}

async function sendStaffNotificationEmail(report: any, reason: string) {
  try {
    const { data: jurisdiction } = await supabase
      .from('jurisdictions')
      .select('*')
      .eq('id', report.jurisdiction_id)
      .single();

    if (!jurisdiction) return;

    await supabase.from('email_log').insert({
      email_type: 'staff_notification',
      report_year: report.report_year,
      jurisdiction_id: report.jurisdiction_id,
      recipient_email: 'payequity.mmb@state.mn.us',
      recipient_name: 'Pay Equity Staff',
      subject: `Case Submitted for Approval - ${jurisdiction.name}`,
      body: `
A new case has been submitted for approval:

Jurisdiction: ${jurisdiction.name}
Jurisdiction ID: ${jurisdiction.jurisdiction_id}
Report Year: ${report.report_year}
Case Number: ${report.case_number}
Submission Date: ${new Date(report.submitted_at).toLocaleString()}

Status: ${reason}

Please review this case in the approval dashboard.
      `.trim(),
      sent_at: new Date().toISOString(),
      sent_by: 'Auto-Approval System',
      delivery_status: 'sent',
    });
  } catch (error) {
    console.error('Error sending staff notification:', error);
  }
}
