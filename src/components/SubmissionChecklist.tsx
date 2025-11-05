import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { JobClassification, ImplementationReport } from '../lib/supabase';

type SubmissionChecklistProps = {
  jobs: JobClassification[];
  implementationData: ImplementationReport | null;
  onClose: () => void;
  onProceedToSubmit: () => void;
};

type ChecklistItem = {
  label: string;
  passed: boolean;
  critical: boolean;
  details?: string;
};

export function SubmissionChecklist({
  jobs,
  implementationData,
  onClose,
  onProceedToSubmit,
}: SubmissionChecklistProps) {
  const checklistItems: ChecklistItem[] = [
    {
      label: 'At least one job entered OR "No Jobs" option selected',
      passed: jobs.length > 0,
      critical: true,
      details: jobs.length === 0 ? 'No job classifications have been entered' : `${jobs.length} job(s) entered`,
    },
    {
      label: 'All jobs have required fields completed',
      passed: jobs.every(job =>
        job.title?.trim() &&
        job.points > 0 &&
        (job.males > 0 || job.females > 0)
      ),
      critical: true,
      details: jobs.some(job => !job.title?.trim()) ? 'Some jobs are missing titles' :
               jobs.some(job => job.points === 0) ? 'Some jobs have 0 points' :
               jobs.some(job => job.males === 0 && job.females === 0) ? 'Some jobs have no employees' : 'All required fields complete',
    },
    {
      label: 'Job evaluation system specified',
      passed: Boolean(implementationData?.evaluation_system?.trim()),
      critical: true,
      details: implementationData?.evaluation_system || 'Not specified',
    },
    {
      label: 'Job evaluation system described',
      passed: Boolean(implementationData?.evaluation_description?.trim()),
      critical: true,
      details: implementationData?.evaluation_description ? `${implementationData.evaluation_description.length}/240 characters` : 'No description provided',
    },
    {
      label: 'Health insurance benefits evaluated',
      passed: Boolean(implementationData?.health_benefits_evaluated?.trim()),
      critical: true,
      details: implementationData?.health_benefits_evaluated || 'Not evaluated',
    },
    {
      label: 'Official notice posting location specified',
      passed: Boolean(implementationData?.notice_location?.trim()),
      critical: true,
      details: implementationData?.notice_location || 'Not specified',
    },
    {
      label: 'Governing body approval recorded',
      passed: Boolean(implementationData?.approved_by_body?.trim()),
      critical: true,
      details: implementationData?.approved_by_body || 'Not recorded',
    },
    {
      label: 'Chief elected official name provided',
      passed: Boolean(implementationData?.chief_elected_official?.trim()),
      critical: true,
      details: implementationData?.chief_elected_official || 'Not provided',
    },
    {
      label: 'Official title provided',
      passed: Boolean(implementationData?.official_title?.trim()),
      critical: true,
      details: implementationData?.official_title || 'Not provided',
    },
    {
      label: 'Approval checkbox confirmed',
      passed: Boolean(implementationData?.approval_confirmed),
      critical: true,
      details: implementationData?.approval_confirmed ? 'Confirmed' : 'Not confirmed',
    },
    {
      label: 'Total annual payroll entered',
      passed: Boolean(implementationData?.total_payroll && implementationData.total_payroll > 0),
      critical: true,
      details: implementationData?.total_payroll
        ? `$${implementationData.total_payroll.toLocaleString()}`
        : 'Not entered',
    },
  ];

  const criticalItemsFailed = checklistItems.filter(item => item.critical && !item.passed);
  const canSubmit = criticalItemsFailed.length === 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <h2 className="text-2xl font-semibold text-gray-900">Pre-Submission Validation</h2>
          <p className="text-sm text-gray-600 mt-1">
            Review the checklist below before submitting your report
          </p>
        </div>

        <div className="p-6 space-y-4">
          {!canSubmit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 mb-1">Cannot Submit</h3>
                  <p className="text-sm text-red-800">
                    {criticalItemsFailed.length} critical item{criticalItemsFailed.length !== 1 ? 's' : ''} must be completed before you can submit your report.
                  </p>
                </div>
              </div>
            </div>
          )}

          {canSubmit && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">Ready to Submit</h3>
                  <p className="text-sm text-green-800">
                    All required items are complete. You may proceed with submission.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
              Required Items
            </h3>
            {checklistItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-lg border ${
                  item.passed
                    ? 'bg-green-50 border-green-200'
                    : item.critical
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}
              >
                {item.passed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-medium ${
                    item.passed ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {item.label}
                  </p>
                  {item.details && (
                    <p className={`text-sm mt-1 ${
                      item.passed ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {item.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <h4 className="font-semibold text-blue-900 mb-2">Important Reminders:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Once submitted, the report cannot be edited</li>
              <li>• Reports must be received by January 31st to remain in compliance</li>
              <li>• All data should reflect information as of December 31st of the previous year</li>
              <li>• You will receive a confirmation email upon successful submission</li>
              <li>• The official notice must be posted for 90 days after submission</li>
            </ul>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
          >
            {canSubmit ? 'Review Report' : 'Back to Report'}
          </button>
          <button
            onClick={onProceedToSubmit}
            disabled={!canSubmit}
            className="flex-1 px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {canSubmit ? 'Proceed to Submit' : 'Complete Required Items'}
          </button>
        </div>
      </div>
    </div>
  );
}
