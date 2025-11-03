import { useState, useEffect } from 'react';
import { Save, Send } from 'lucide-react';
import { ImplementationReport, Report, Jurisdiction, JobClassification } from '../lib/supabase';
import { SubmissionChecklist } from './SubmissionChecklist';
import { ContextualHelp } from './ContextualHelp';

type ImplementationFormProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  implementationData: ImplementationReport | null;
  onSave: (data: Partial<ImplementationReport>) => Promise<void>;
  onSubmit: () => Promise<void>;
};

export function ImplementationForm({
  report,
  jurisdiction,
  jobs,
  implementationData,
  onSave,
  onSubmit,
}: ImplementationFormProps) {
  const [formData, setFormData] = useState<Partial<ImplementationReport>>({
    evaluation_system: '',
    evaluation_description: '',
    health_benefits_evaluated: '',
    health_benefits_description: '',
    notice_location: '',
    approved_by_body: '',
    chief_elected_official: '',
    official_title: '',
    approval_confirmed: false,
    total_payroll: null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    if (implementationData) {
      setFormData(implementationData);
    }
  }, [implementationData]);

  const updateField = (field: keyof ImplementationReport, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      alert('Changes saved successfully');
    } catch (error) {
      alert('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShowChecklist = () => {
    setShowChecklist(true);
  };

  const handleProceedToSubmit = async () => {
    setShowChecklist(false);

    const confirmed = confirm(
      'Are you sure you want to submit this report? Once submitted, it cannot be edited.'
    );

    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      await onSubmit();
      alert('Report submitted successfully!');
    } catch (error) {
      alert('Error submitting report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSubmitted = report.case_status === 'Submitted';

  return (
    <div className="space-y-6">
      <ContextualHelp context="implementation-form" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-8">
        <div className="border-b border-gray-200 pb-4">
          <h2 className="text-2xl font-bold text-gray-900">Pay Equity Implementation Form</h2>
          <p className="text-sm text-gray-600 mt-1">
            Information entered on this page is not submitted until you click "Sign and Submit"
          </p>
        </div>

      {/* Part A: Jurisdiction Identification */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Part A: Jurisdiction Identification
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm">
            <span className="font-medium">Jurisdiction:</span> {jurisdiction.name}
          </p>
          <p className="text-sm">
            <span className="font-medium">Type:</span> {jurisdiction.jurisdiction_type}
          </p>
          <p className="text-sm">
            <span className="font-medium">Address:</span> {jurisdiction.address}, {jurisdiction.city}, {jurisdiction.state} {jurisdiction.zipcode}
          </p>
        </div>
      </div>

      {/* Part B: Official Verification */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Part B: Official Verification
        </h3>

        {/* Section 1: Job Evaluation System */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            1. The job evaluation system used measured skill, effort, responsibility and working conditions
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select a system
            </label>
            <select
              value={formData.evaluation_system || ''}
              onChange={(e) => updateField('evaluation_system', e.target.value)}
              disabled={isSubmitted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Select a system --</option>
              <option value="Hay System">Hay System</option>
              <option value="Point Factor">Point Factor</option>
              <option value="Classification">Classification</option>
              <option value="Ranking">Ranking</option>
              <option value="Market Pricing">Market Pricing</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Describe the system (max 240 characters)
            </label>
            <textarea
              value={formData.evaluation_description || ''}
              onChange={(e) => updateField('evaluation_description', e.target.value.slice(0, 240))}
              disabled={isSubmitted}
              maxLength={240}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
              placeholder="Describe your job evaluation system..."
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.evaluation_description || '').length}/240 characters
            </p>
          </div>
        </div>

        {/* Section 2: Health Insurance Benefits */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            2. Health Insurance benefits for male and female classes of comparable value have been evaluated
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select a description
            </label>
            <select
              value={formData.health_benefits_evaluated || ''}
              onChange={(e) => updateField('health_benefits_evaluated', e.target.value)}
              disabled={isSubmitted}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">-- Select a description --</option>
              <option value="All employees receive equal benefits">All employees receive equal benefits</option>
              <option value="Benefits evaluated and equalized">Benefits evaluated and equalized</option>
              <option value="No health insurance offered">No health insurance offered</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {formData.health_benefits_evaluated === 'Other' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Please describe
              </label>
              <textarea
                value={formData.health_benefits_description || ''}
                onChange={(e) => updateField('health_benefits_description', e.target.value)}
                disabled={isSubmitted}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
              />
            </div>
          )}
        </div>

        {/* Section 3: Official Notice Posting */}
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">
            3. An official notice has been posted at:
          </h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prominent location (max 60 characters)
            </label>
            <input
              type="text"
              value={formData.notice_location || ''}
              onChange={(e) => updateField('notice_location', e.target.value.slice(0, 60))}
              disabled={isSubmitted}
              maxLength={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
              placeholder="e.g., City Hall Main Entrance"
            />
            <p className="text-xs text-gray-500 mt-1">
              {(formData.notice_location || '').length}/60 characters
            </p>
          </div>

          <p className="text-sm text-gray-700 mt-4">The report was approved by:</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Governing body (max 60 characters)
              </label>
              <input
                type="text"
                value={formData.approved_by_body || ''}
                onChange={(e) => updateField('approved_by_body', e.target.value.slice(0, 60))}
                disabled={isSubmitted}
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
                placeholder="e.g., City Council"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title (max 60 characters)
              </label>
              <input
                type="text"
                value={formData.official_title || ''}
                onChange={(e) => updateField('official_title', e.target.value.slice(0, 60))}
                disabled={isSubmitted}
                maxLength={60}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
                placeholder="e.g., Mayor"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chief elected official (max 60 characters)
            </label>
            <input
              type="text"
              value={formData.chief_elected_official || ''}
              onChange={(e) => updateField('chief_elected_official', e.target.value.slice(0, 60))}
              disabled={isSubmitted}
              maxLength={60}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.approval_confirmed || false}
                onChange={(e) => updateField('approval_confirmed', e.target.checked)}
                disabled={isSubmitted}
                className="mt-1 w-4 h-4 text-[#003865] border-gray-300 rounded focus:ring-[#003865] disabled:opacity-50"
              />
              <span className="text-sm text-blue-900">
                Checking this box indicates the following:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Signature of chief elected official</li>
                  <li>Approval by governing body</li>
                  <li>All information is complete and accurate</li>
                  <li>All employees over which the jurisdiction has final budgetary authority are included</li>
                </ul>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Part C: Total Payroll */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
          Part C: Total Payroll
        </h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total annual payroll for the calendar year just ended December 31
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2.5 text-gray-500">$</span>
            <input
              type="number"
              value={formData.total_payroll || ''}
              onChange={(e) => updateField('total_payroll', parseFloat(e.target.value) || null)}
              disabled={isSubmitted}
              min="0"
              step="0.01"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent disabled:bg-gray-100"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {!isSubmitted && (
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={isSaving || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-5 h-5" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            onClick={handleShowChecklist}
            disabled={isSaving || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Send className="w-5 h-5" />
            {isSubmitting ? 'Submitting...' : 'Sign and Submit'}
          </button>
        </div>
      )}

      {isSubmitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-green-800 font-medium">
            This report has been submitted and can no longer be edited.
          </p>
          <p className="text-sm text-green-700 mt-1">
            Submitted on: {new Date(report.submitted_at || '').toLocaleDateString()}
          </p>
        </div>
      )}

        {showChecklist && (
          <SubmissionChecklist
            jobs={jobs}
            implementationData={formData}
            onClose={() => setShowChecklist(false)}
            onProceedToSubmit={handleProceedToSubmit}
          />
        )}
      </div>
    </div>
  );
}
