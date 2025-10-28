import { FileDown, FileText, TrendingUp, CheckSquare } from 'lucide-react';
import { Report, JobClassification, ImplementationReport, Jurisdiction } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';

type ReportExportMenuProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  complianceResult: ComplianceResult | null;
  implementationData: ImplementationReport | null;
  onNavigateToReport: (reportType: 'jobDataEntry' | 'compliance' | 'predictedPay' | 'implementation') => void;
};

export function ReportExportMenu({
  report,
  jurisdiction,
  jobs,
  complianceResult,
  implementationData,
  onNavigateToReport,
}: ReportExportMenuProps) {
  const generateJobDataCSV = () => {
    if (jobs.length === 0) {
      alert('No job data to export');
      return;
    }

    const headers = [
      'Job #',
      'Title',
      'Males',
      'Females',
      'Points',
      'Min Salary',
      'Max Salary',
      'Years to Max',
      'Years Service Pay',
      'Exceptional Service Category',
    ];

    const rows = jobs.map(job => [
      job.job_number,
      job.title,
      job.males,
      job.females,
      job.points,
      job.min_salary,
      job.max_salary,
      job.years_to_max,
      job.years_service_pay,
      job.exceptional_service_category,
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jurisdiction.name}_${report.report_year}_Jobs.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateComplianceReport = () => {
    if (!complianceResult) {
      alert('Please run compliance analysis first');
      return;
    }

    const reportContent = `
PAY EQUITY COMPLIANCE REPORT
${jurisdiction.name}
Report Year: ${report.report_year}
Case: ${report.case_number} - ${report.case_description}
Generated: ${new Date().toLocaleDateString()}

========================================

JURISDICTION INFORMATION
Name: ${jurisdiction.name}
Type: ${jurisdiction.jurisdiction_type}
Address: ${jurisdiction.address}
City: ${jurisdiction.city}, ${jurisdiction.state} ${jurisdiction.zipcode}
Phone: ${jurisdiction.phone}

========================================

COMPLIANCE SUMMARY
Status: ${complianceResult.isCompliant ? 'IN COMPLIANCE' : complianceResult.requiresManualReview ? 'MANUAL REVIEW REQUIRED' : 'OUT OF COMPLIANCE'}
Total Job Classes: ${complianceResult.totalJobs}
Male-Dominated Classes: ${complianceResult.maleJobs}
Female-Dominated Classes: ${complianceResult.femaleJobs}

${complianceResult.message}

========================================

${!complianceResult.requiresManualReview && complianceResult.salaryRangeTest ? `
SALARY RANGE TEST (III)
Status: ${complianceResult.salaryRangeTest.passed ? 'PASSED' : 'FAILED'}
Threshold: ${(complianceResult.salaryRangeTest.threshold * 100).toFixed(2)}%
Result: ${(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%

Male Average Years to Max: ${complianceResult.salaryRangeTest.maleAverage.toFixed(2)}
Female Average Years to Max: ${complianceResult.salaryRangeTest.femaleAverage.toFixed(2)}

========================================
` : ''}

${!complianceResult.requiresManualReview && complianceResult.exceptionalServiceTest ? `
EXCEPTIONAL SERVICE PAY TEST (IV)
Status: ${complianceResult.exceptionalServiceTest.passed ? 'PASSED' : 'FAILED'}
Threshold: ${(complianceResult.exceptionalServiceTest.threshold * 100).toFixed(2)}%
Result: ${(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}%

Male Classes with Exceptional Service: ${complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%
Female Classes with Exceptional Service: ${complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%

========================================
` : ''}

JOB CLASSIFICATIONS
${jobs.map(job => `
Job #${job.job_number}: ${job.title}
  Males: ${job.males} | Females: ${job.females} | Points: ${job.points}
  Salary Range: $${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}
  Years to Max: ${job.years_to_max} | Years Service Pay: ${job.years_service_pay}
  Exceptional Service: ${job.exceptional_service_category || 'None'}
`).join('\n')}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jurisdiction.name}_${report.report_year}_Compliance_Report.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateImplementationReport = () => {
    if (!implementationData) {
      alert('Please complete the implementation form first');
      return;
    }

    const reportContent = `
PAY EQUITY IMPLEMENTATION REPORT
${jurisdiction.name}
Report Year: ${report.report_year}
Case: ${report.case_number} - ${report.case_description}
Generated: ${new Date().toLocaleDateString()}

========================================

PART A: JURISDICTION IDENTIFICATION

Jurisdiction: ${jurisdiction.name}
Type: ${jurisdiction.jurisdiction_type}
Address: ${jurisdiction.address}, ${jurisdiction.city}, ${jurisdiction.state} ${jurisdiction.zipcode}
Phone: ${jurisdiction.phone}

========================================

PART B: OFFICIAL VERIFICATION

1. Job Evaluation System
   System: ${implementationData.evaluation_system}
   Description: ${implementationData.evaluation_description}

2. Health Insurance Benefits
   Status: ${implementationData.health_benefits_evaluated}
   ${implementationData.health_benefits_description ? `Description: ${implementationData.health_benefits_description}` : ''}

3. Official Notice Posting
   Posted at: ${implementationData.notice_location}

   Approved by: ${implementationData.approved_by_body}
   Chief Elected Official: ${implementationData.chief_elected_official}
   Title: ${implementationData.official_title}

   Approval Confirmed: ${implementationData.approval_confirmed ? 'YES' : 'NO'}

========================================

PART C: TOTAL PAYROLL

Total Annual Payroll: $${implementationData.total_payroll ? implementationData.total_payroll.toLocaleString() : '0'}
(for calendar year ended December 31)

========================================

SUBMISSION INFORMATION

Report Status: ${report.case_status}
Compliance Status: ${report.compliance_status}
${report.submitted_at ? `Submitted: ${new Date(report.submitted_at).toLocaleString()}` : 'Not yet submitted'}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jurisdiction.name}_${report.report_year}_Implementation_Report.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generatePredictedPay = () => {
    if (!complianceResult || !complianceResult.salaryRangeTest) {
      alert('Please run compliance analysis first');
      return;
    }

    const maleJobs = jobs.filter(job => job.males > 0 && job.females === 0);
    const femaleJobs = jobs.filter(job => job.females > 0 && job.males === 0);

    let reportContent = `
PREDICTED PAY EQUITY ADJUSTMENTS
${jurisdiction.name}
Report Year: ${report.report_year}
Generated: ${new Date().toLocaleDateString()}

========================================

This report shows projected salary equity adjustments needed to achieve
compliance with Minnesota Pay Equity Law requirements.

========================================

CURRENT STATUS
${complianceResult.isCompliant ? 'Your jurisdiction is currently IN COMPLIANCE.' : 'Your jurisdiction needs to make adjustments to achieve compliance.'}

Salary Range Test Result: ${(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%
Required Threshold: ${(complianceResult.salaryRangeTest.threshold * 100).toFixed(2)}%

========================================

MALE-DOMINATED JOB CLASSES
${maleJobs.map(job => `
${job.title}
  Current Years to Max: ${job.years_to_max}
  Salary Range: $${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}
`).join('\n')}

========================================

FEMALE-DOMINATED JOB CLASSES
${femaleJobs.map(job => `
${job.title}
  Current Years to Max: ${job.years_to_max}
  Salary Range: $${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}
`).join('\n')}

========================================

RECOMMENDATIONS
${complianceResult.isCompliant
  ? 'Continue to monitor salary ranges and ensure ongoing compliance.'
  : `To achieve compliance, consider:
1. Reviewing and adjusting years to maximum salary for affected classes
2. Ensuring female-dominated classes reach maximum salary in comparable timeframes
3. Evaluating exceptional service pay distribution across all classes`}
`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${jurisdiction.name}_${report.report_year}_Predicted_Pay.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileDown className="w-5 h-5" />
        Export Reports
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => onNavigateToReport('jobDataEntry')}
          disabled={jobs.length === 0}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
        >
          <FileText className="w-8 h-8 text-[#003865]" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Job Data Entry List</h4>
            <p className="text-sm text-gray-600">View and export job classifications</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateToReport('compliance')}
          disabled={!complianceResult}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
        >
          <CheckSquare className="w-8 h-8 text-[#003865]" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Compliance Report</h4>
            <p className="text-sm text-gray-600">View and export compliance analysis</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateToReport('predictedPay')}
          disabled={!complianceResult}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
        >
          <TrendingUp className="w-8 h-8 text-[#003865]" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Predicted Pay Report</h4>
            <p className="text-sm text-gray-600">View and export equity adjustments</p>
          </div>
        </button>

        <button
          onClick={() => onNavigateToReport('implementation')}
          disabled={!implementationData}
          className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white"
        >
          <FileText className="w-8 h-8 text-[#003865]" />
          <div className="text-left">
            <h4 className="font-semibold text-gray-900">Implementation Report</h4>
            <p className="text-sm text-gray-600">View and export official verification</p>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          Click on a report to view it in detail. You can export each report to PDF from the report page.
        </p>
      </div>
    </div>
  );
}
