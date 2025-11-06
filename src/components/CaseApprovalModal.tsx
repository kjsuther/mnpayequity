import { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, FileText, Download } from 'lucide-react';
import { supabase, Report, Jurisdiction, JobClassification, Contact, ComplianceCertificate } from '../lib/supabase';
import { analyzeCompliance, ComplianceResult } from '../lib/complianceAnalysis';
import { ComplianceResults } from './ComplianceResults';
import { generateCertificatePDF } from '../lib/certificateGenerator';
import { SuccessModal } from './SuccessModal';

type CaseApprovalModalProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  onClose: () => void;
};

export function CaseApprovalModal({ report, jurisdiction, onClose }: CaseApprovalModalProps) {
  const [jobs, setJobs] = useState<JobClassification[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [certificate, setCertificate] = useState<ComplianceCertificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalReason, setApprovalReason] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedApprovalType, setSelectedApprovalType] = useState('');
  const [selectedRejectionType, setSelectedRejectionType] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [report.id]);

  async function loadData() {
    try {
      setLoading(true);

      const [jobsResult, contactsResult, certResult] = await Promise.all([
        supabase
          .from('job_classifications')
          .select('*')
          .eq('report_id', report.id)
          .order('job_number'),
        supabase
          .from('contacts')
          .select('*')
          .eq('jurisdiction_id', jurisdiction.id)
          .order('is_primary', { ascending: false }),
        supabase
          .from('compliance_certificates')
          .select('*')
          .eq('report_id', report.id)
          .maybeSingle(),
      ]);

      if (jobsResult.error) throw jobsResult.error;
      if (contactsResult.error) throw contactsResult.error;

      setJobs(jobsResult.data || []);
      setContacts(contactsResult.data || []);
      setCertificate(certResult.data);

      if (jobsResult.data && jobsResult.data.length > 0) {
        const result = analyzeCompliance(jobsResult.data);
        setComplianceResult(result);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!selectedApprovalType) {
      setErrorMessage('Please select an approval reason');
      setShowErrorModal(true);
      return;
    }

    try {
      setProcessing(true);

      const userEmail = (await supabase.auth.getUser()).data.user?.email || 'System';

      await supabase.from('reports').update({
        approval_status: 'approved',
        approved_by: userEmail,
        approved_at: new Date().toISOString(),
        case_status: 'In Compliance',
      }).eq('id', report.id);

      await supabase.from('approval_history').insert({
        report_id: report.id,
        jurisdiction_id: jurisdiction.id,
        action_type: 'approved',
        previous_status: report.approval_status,
        new_status: 'approved',
        approved_by: userEmail,
        reason: selectedApprovalType,
        notes: approvalReason,
      });

      if (!certificate) {
        const certificateData = await generateCertificatePDF(report, jurisdiction);
        await supabase.from('compliance_certificates').insert({
          report_id: report.id,
          jurisdiction_id: jurisdiction.id,
          report_year: report.report_year,
          certificate_data: certificateData,
          file_name: `${jurisdiction.name.replace(/\s+/g, '_')}_Certificate_${report.report_year}.pdf`,
          generated_by: userEmail,
        });

        await supabase.from('reports').update({
          certificate_generated_at: new Date().toISOString(),
        }).eq('id', report.id);
      }

      setSuccessMessage('Case approved successfully! Certificate has been generated.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error approving case:', error);
      setErrorMessage('Error approving case. Please try again.');
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!selectedRejectionType) {
      setErrorMessage('Please select a rejection reason');
      setShowErrorModal(true);
      return;
    }

    if (!rejectionReason.trim()) {
      setErrorMessage('Please provide details about the rejection');
      setShowErrorModal(true);
      return;
    }

    try {
      setProcessing(true);

      const userEmail = (await supabase.auth.getUser()).data.user?.email || 'System';

      await supabase.from('reports').update({
        approval_status: 'rejected',
        approved_by: userEmail,
        approved_at: new Date().toISOString(),
        rejection_reason: `${selectedRejectionType}: ${rejectionReason}`,
        case_status: 'Out of Compliance',
      }).eq('id', report.id);

      await supabase.from('approval_history').insert({
        report_id: report.id,
        jurisdiction_id: jurisdiction.id,
        action_type: 'rejected',
        previous_status: report.approval_status,
        new_status: 'rejected',
        approved_by: userEmail,
        reason: selectedRejectionType,
        notes: rejectionReason,
      });

      setSuccessMessage('Case has been marked as not in compliance.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error rejecting case:', error);
      setErrorMessage('Error rejecting case. Please try again.');
      setShowErrorModal(true);
    } finally {
      setProcessing(false);
    }
  }

  async function handleDownloadCertificate() {
    if (!certificate) return;

    const link = document.createElement('a');
    link.href = certificate.certificate_data;
    link.download = certificate.file_name;
    link.click();
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading case details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#003865]">Review Case Submission</h2>
              <p className="text-sm text-gray-600 mt-1">
                {jurisdiction.name} - Report Year {report.report_year}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-blue-700 mb-1">Case Number</p>
                <p className="font-semibold text-blue-900">#{report.case_number}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Submitted</p>
                <p className="font-semibold text-blue-900">
                  {report.submitted_at ? new Date(report.submitted_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Jobs Count</p>
                <p className="font-semibold text-blue-900">{jobs.length}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 mb-1">Contacts</p>
                <p className="font-semibold text-blue-900">{contacts.length}</p>
              </div>
            </div>
          </div>

          {complianceResult && (
            <ComplianceResults
              results={complianceResult}
              onBack={() => {}}
              reportYear={report.report_year}
              showBackButton={false}
              jobs={jobs}
            />
          )}

          {certificate && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-600" />
                  <div>
                    <p className="font-semibold text-emerald-900">Certificate Generated</p>
                    <p className="text-sm text-emerald-700">
                      {new Date(certificate.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDownloadCertificate}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            </div>
          )}

          {report.approval_status === 'pending' || report.approval_status === 'draft' ? (
            <div className="space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Approval Actions</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-emerald-900">Mark In Compliance</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-2">
                          Reason for Approval
                        </label>
                        <select
                          value={selectedApprovalType}
                          onChange={(e) => setSelectedApprovalType(e.target.value)}
                          className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Select reason...</option>
                          <option value="Passed All Tests">Passed All Tests</option>
                          <option value="Alternative Analysis Approved">Alternative Analysis Approved</option>
                          <option value="Manual Review Passed">Manual Review Passed</option>
                          <option value="Corrective Action Completed">Corrective Action Completed</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-emerald-900 mb-2">
                          Additional Notes (Optional)
                        </label>
                        <textarea
                          value={approvalReason}
                          onChange={(e) => setApprovalReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Add any additional notes about this approval..."
                        />
                      </div>

                      <button
                        onClick={handleApprove}
                        disabled={processing || !selectedApprovalType}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        <CheckCircle className="w-5 h-5" />
                        {processing ? 'Processing...' : 'Approve Case'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-rose-600 rounded-full flex items-center justify-center">
                        <XCircle className="w-6 h-6 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-rose-900">Mark Not In Compliance</h4>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">
                          Reason for Rejection
                        </label>
                        <select
                          value={selectedRejectionType}
                          onChange={(e) => setSelectedRejectionType(e.target.value)}
                          className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                        >
                          <option value="">Select reason...</option>
                          <option value="Failed Statistical Analysis Test">Failed Statistical Analysis Test</option>
                          <option value="Failed Salary Range Test">Failed Salary Range Test</option>
                          <option value="Failed Exceptional Service Pay Test">Failed Exceptional Service Pay Test</option>
                          <option value="Incomplete Data">Incomplete Data</option>
                          <option value="Invalid Job Classifications">Invalid Job Classifications</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">
                          Explanation Required
                        </label>
                        <textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                          placeholder="Provide details about why this case is not in compliance..."
                        />
                      </div>

                      <button
                        onClick={handleReject}
                        disabled={processing || !selectedRejectionType || !rejectionReason.trim()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed font-medium"
                      >
                        <XCircle className="w-5 h-5" />
                        {processing ? 'Processing...' : 'Reject Case'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-gray-700 font-medium">
                This case has already been reviewed and {report.approval_status}.
              </p>
            </div>
          )}
        </div>
      </div>

      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
      />

      {showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                <XCircle className="w-16 h-16 text-rose-500" />
              </div>
              <p className="text-lg text-gray-900 mb-6">{errorMessage}</p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="px-6 py-2 bg-[#D4A574] text-white rounded-lg hover:bg-[#c49563] transition-colors font-medium"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
