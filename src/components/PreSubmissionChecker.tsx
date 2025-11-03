import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { Report, JobClassification, Contact, Jurisdiction, ImplementationReport } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';

type PreSubmissionCheckerProps = {
  report: Report;
  jobs: JobClassification[];
  jurisdiction: Jurisdiction;
  contacts: Contact[];
  complianceResult: ComplianceResult | null;
  implementationData: ImplementationReport | null;
  onClose: () => void;
};

type CheckItem = {
  id: string;
  category: string;
  requirement: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  guidance?: string;
};

export function PreSubmissionChecker({
  report,
  jobs,
  jurisdiction,
  contacts,
  complianceResult,
  implementationData,
  onClose
}: PreSubmissionCheckerProps) {
  const [checks, setChecks] = useState<CheckItem[]>([]);

  useEffect(() => {
    runChecks();
  }, []);

  const runChecks = () => {
    const checkResults: CheckItem[] = [];

    checkResults.push({
      id: 'jurisdiction-info',
      category: 'Jurisdiction Information',
      requirement: 'Complete jurisdiction details',
      status: jurisdiction.name && jurisdiction.jurisdiction_id && jurisdiction.city && jurisdiction.state ? 'pass' : 'fail',
      message: jurisdiction.name && jurisdiction.jurisdiction_id && jurisdiction.city && jurisdiction.state
        ? 'Jurisdiction information is complete'
        : 'Missing required jurisdiction information',
      guidance: 'Verify jurisdiction name, ID, address, city, and state are all filled in'
    });

    checkResults.push({
      id: 'primary-contact',
      category: 'Contact Information',
      requirement: 'At least one primary contact',
      status: contacts.some(c => c.is_primary) ? 'pass' : 'fail',
      message: contacts.some(c => c.is_primary)
        ? 'Primary contact is designated'
        : 'No primary contact designated',
      guidance: 'Designate at least one contact as primary with complete contact information'
    });

    checkResults.push({
      id: 'contact-details',
      category: 'Contact Information',
      requirement: 'Complete contact details',
      status: contacts.every(c => c.name && c.email) ? 'pass' : 'warning',
      message: contacts.every(c => c.name && c.email)
        ? 'All contacts have complete information'
        : 'Some contacts are missing name or email',
      guidance: 'Ensure all contacts have at minimum name and email address'
    });

    checkResults.push({
      id: 'report-year',
      category: 'Report Information',
      requirement: 'Valid report year',
      status: report.report_year >= 2000 && report.report_year <= new Date().getFullYear() + 1 ? 'pass' : 'fail',
      message: `Report year is ${report.report_year}`,
      guidance: 'Report year should be current or previous year'
    });

    checkResults.push({
      id: 'case-description',
      category: 'Report Information',
      requirement: 'Case description provided',
      status: report.case_description && report.case_description.trim().length > 0 ? 'pass' : 'warning',
      message: report.case_description && report.case_description.trim().length > 0
        ? 'Case description is provided'
        : 'Case description is missing or empty',
      guidance: 'Provide a brief description of this case/report'
    });

    checkResults.push({
      id: 'minimum-jobs',
      category: 'Job Classifications',
      requirement: 'Minimum 2 female-dominated job classes',
      status: jobs.filter(j => j.females > 0 && j.males === 0).length >= 2 ? 'pass' : 'fail',
      message: `${jobs.filter(j => j.females > 0 && j.males === 0).length} female-dominated job classes`,
      guidance: 'Minnesota law requires at least 2 female-dominated job classes for reporting'
    });

    checkResults.push({
      id: 'job-points',
      category: 'Job Classifications',
      requirement: 'All jobs have point values',
      status: jobs.every(j => j.points > 0) ? 'pass' : 'fail',
      message: jobs.every(j => j.points > 0)
        ? 'All jobs have point values assigned'
        : `${jobs.filter(j => j.points === 0).length} jobs missing point values`,
      guidance: 'Every job must have a point value assigned using an approved evaluation system'
    });

    checkResults.push({
      id: 'salary-data',
      category: 'Job Classifications',
      requirement: 'All jobs have salary data',
      status: jobs.every(j => j.min_salary > 0 && j.max_salary > 0) ? 'pass' : 'fail',
      message: jobs.every(j => j.min_salary > 0 && j.max_salary > 0)
        ? 'All jobs have salary information'
        : `${jobs.filter(j => j.min_salary === 0 || j.max_salary === 0).length} jobs missing salary data`,
      guidance: 'Enter monthly salary amounts for minimum and maximum pay for each job'
    });

    checkResults.push({
      id: 'salary-range',
      category: 'Job Classifications',
      requirement: 'Max salary >= Min salary',
      status: jobs.every(j => j.max_salary >= j.min_salary) ? 'pass' : 'fail',
      message: jobs.every(j => j.max_salary >= j.min_salary)
        ? 'All salary ranges are valid'
        : `${jobs.filter(j => j.max_salary < j.min_salary).length} jobs have invalid salary ranges`,
      guidance: 'Maximum salary must be greater than or equal to minimum salary'
    });

    checkResults.push({
      id: 'employee-counts',
      category: 'Job Classifications',
      requirement: 'All jobs have employee counts',
      status: jobs.every(j => (j.males + j.females + (j.nonbinary || 0)) > 0) ? 'pass' : 'warning',
      message: jobs.every(j => (j.males + j.females + (j.nonbinary || 0)) > 0)
        ? 'All jobs have employee counts'
        : `${jobs.filter(j => (j.males + j.females + (j.nonbinary || 0)) === 0).length} jobs have no employees`,
      guidance: 'Every job should have at least one employee. Remove jobs with zero employees.'
    });

    checkResults.push({
      id: 'years-to-max',
      category: 'Job Classifications',
      requirement: 'Years to maximum salary provided',
      status: jobs.every(j => j.years_to_max >= 0) ? 'pass' : 'warning',
      message: jobs.every(j => j.years_to_max >= 0)
        ? 'All jobs have years to max specified'
        : 'Some jobs missing years to maximum salary',
      guidance: 'Enter the number of years it takes to reach maximum salary for each position'
    });

    if (complianceResult) {
      checkResults.push({
        id: 'compliance-test',
        category: 'Compliance Status',
        requirement: 'Compliance test completed',
        status: 'pass',
        message: 'Compliance analysis has been run',
        guidance: 'Review test results before submission'
      });

      checkResults.push({
        id: 'compliance-status',
        category: 'Compliance Status',
        requirement: 'Compliance status',
        status: complianceResult.isCompliant ? 'pass' : 'warning',
        message: complianceResult.isCompliant
          ? 'Jurisdiction is in compliance'
          : 'Jurisdiction is out of compliance',
        guidance: complianceResult.isCompliant
          ? 'You may proceed with submission'
          : 'You must submit an implementation plan with this report'
      });

      if (!complianceResult.isCompliant && !implementationData) {
        checkResults.push({
          id: 'implementation-plan',
          category: 'Compliance Status',
          requirement: 'Implementation plan required',
          status: 'fail',
          message: 'Implementation plan is missing',
          guidance: 'Out-of-compliance jurisdictions must submit an implementation plan detailing corrective actions'
        });
      }

      if (!complianceResult.isCompliant && implementationData) {
        checkResults.push({
          id: 'implementation-plan-exists',
          category: 'Compliance Status',
          requirement: 'Implementation plan submitted',
          status: 'pass',
          message: 'Implementation plan is complete',
          guidance: 'Review implementation plan details before final submission'
        });
      }
    } else {
      checkResults.push({
        id: 'compliance-test-required',
        category: 'Compliance Status',
        requirement: 'Compliance test must be run',
        status: 'fail',
        message: 'Compliance analysis has not been completed',
        guidance: 'Run the compliance evaluation test before submitting your report'
      });
    }

    checkResults.push({
      id: 'deadline',
      category: 'Submission Timing',
      requirement: 'Submission deadline',
      status: new Date().getMonth() === 0 ? 'warning' : 'pass',
      message: new Date().getMonth() === 0
        ? 'Reports are due by January 31st'
        : 'Plan ahead for January 31st deadline',
      guidance: 'Annual pay equity reports must be submitted by January 31st'
    });

    setChecks(checkResults);
  };

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const totalChecks = checks.length;
  const readyToSubmit = failCount === 0;

  const categories = Array.from(new Set(checks.map(c => c.category)));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                readyToSubmit ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {readyToSubmit ? (
                  <CheckCircle className="w-6 h-6 text-white" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pre-Submission Validation</h2>
                <p className="text-sm text-gray-600">
                  {report.report_year} - Case {report.case_number}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Checks</h3>
              <p className="text-2xl font-bold text-gray-900">{totalChecks}</p>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-green-700 mb-2">Passed</h3>
              <p className="text-2xl font-bold text-green-700">{passCount}</p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-700 mb-2">Warnings</h3>
              <p className="text-2xl font-bold text-yellow-700">{warningCount}</p>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-red-700 mb-2">Failed</h3>
              <p className="text-2xl font-bold text-red-700">{failCount}</p>
            </div>
          </div>

          {readyToSubmit ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Ready for Submission</p>
                  <p className="text-sm text-green-800 mt-1">
                    All critical requirements have been met. Review warnings if any, then proceed with submission.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Not Ready for Submission</p>
                  <p className="text-sm text-red-800 mt-1">
                    {failCount} critical requirement{failCount !== 1 ? 's' : ''} must be addressed before you can submit this report.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {categories.map(category => (
              <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">{category}</h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {checks.filter(c => c.category === category).map(check => (
                    <div key={check.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {check.status === 'pass' && (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          )}
                          {check.status === 'warning' && (
                            <AlertTriangle className="w-5 h-5 text-yellow-500" />
                          )}
                          {check.status === 'fail' && (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{check.requirement}</h4>
                          <p className="text-sm text-gray-700 mt-1">{check.message}</p>
                          {check.guidance && check.status !== 'pass' && (
                            <p className="text-sm text-gray-600 mt-2 italic">
                              💡 {check.guidance}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Official Submission Requirements</p>
                <p className="mb-2">
                  For complete submission instructions and requirements, review the official guide:
                </p>
                <a
                  href="https://mn.gov/mmb-stat/pay-equity/Instructions%20for%20submitting%20a%20local%20government%20pay%20equity%20report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 hover:text-blue-800 underline"
                >
                  Instructions for Submitting a Local Government Pay Equity Report
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {readyToSubmit
                ? 'All critical requirements met. Review warnings and proceed when ready.'
                : 'Address all failed items before submission.'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
            >
              Close Checker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
