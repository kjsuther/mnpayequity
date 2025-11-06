import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, Filter } from 'lucide-react';
import { supabase, Report, Jurisdiction, ComplianceCertificate } from '../lib/supabase';
import { CaseApprovalModal } from './CaseApprovalModal';

type ReportWithJurisdiction = Report & {
  jurisdiction: Jurisdiction;
};

export function ApprovalDashboard() {
  const [reports, setReports] = useState<ReportWithJurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedReport, setSelectedReport] = useState<ReportWithJurisdiction | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, [filter]);

  async function loadReports() {
    try {
      setLoading(true);
      let query = supabase
        .from('reports')
        .select(`
          *,
          jurisdiction:jurisdictions(*)
        `)
        .eq('case_status', 'Submitted')
        .order('submitted_at', { ascending: false });

      if (filter === 'pending') {
        query = query.in('approval_status', ['pending', 'draft']);
      } else if (filter === 'approved') {
        query = query.in('approval_status', ['approved', 'auto_approved']);
      } else if (filter === 'rejected') {
        query = query.eq('approval_status', 'rejected');
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = (data || []).map((report: any) => ({
        ...report,
        jurisdiction: report.jurisdiction,
      }));

      setReports(formattedData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(report: Report) {
    if (report.approval_status === 'approved' || report.approval_status === 'auto_approved') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
          <CheckCircle className="w-4 h-4" />
          {report.auto_approved ? 'Auto-Approved' : 'Approved'}
        </span>
      );
    } else if (report.approval_status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-800 text-sm font-medium rounded-full">
          <XCircle className="w-4 h-4" />
          Rejected
        </span>
      );
    } else if (report.requires_manual_review) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
          <AlertCircle className="w-4 h-4" />
          Manual Review Required
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
          <Clock className="w-4 h-4" />
          Pending Review
        </span>
      );
    }
  }

  function getComplianceIndicator(report: Report) {
    if (report.compliance_status === 'In Compliance') {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          Passed All Tests
        </span>
      );
    } else if (report.compliance_status === 'Out of Compliance') {
      return (
        <span className="inline-flex items-center gap-1.5 text-rose-600 text-sm font-medium">
          <XCircle className="w-4 h-4" />
          Failed Tests
        </span>
      );
    } else if (report.requires_manual_review) {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-600 text-sm font-medium">
          <AlertCircle className="w-4 h-4" />
          Needs Review
        </span>
      );
    }
    return null;
  }

  function handleReviewCase(report: ReportWithJurisdiction) {
    setSelectedReport(report);
    setShowApprovalModal(true);
  }

  function handleModalClose() {
    setShowApprovalModal(false);
    setSelectedReport(null);
    loadReports();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#003865] mb-2">Case Approval Dashboard</h1>
          <p className="text-gray-600">Review and approve submitted pay equity reports</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filter:</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'pending'
                    ? 'bg-[#003865] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending Review
              </button>
              <button
                onClick={() => setFilter('approved')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'approved'
                    ? 'bg-[#003865] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setFilter('rejected')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'rejected'
                    ? 'bg-[#003865] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-[#003865] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Submissions
              </button>
            </div>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600">
              {filter === 'pending'
                ? 'There are no pending submissions requiring review.'
                : `No ${filter} submissions to display.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[#003865] mb-1">
                          {report.jurisdiction.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {report.jurisdiction.city}, {report.jurisdiction.state}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        {getStatusBadge(report)}
                        {getComplianceIndicator(report)}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Report Year</p>
                        <p className="font-semibold text-gray-900">{report.report_year}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Case Number</p>
                        <p className="font-semibold text-gray-900">#{report.case_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Submitted</p>
                        <p className="font-semibold text-gray-900">
                          {report.submitted_at
                            ? new Date(report.submitted_at).toLocaleDateString()
                            : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Jurisdiction Type</p>
                        <p className="font-semibold text-gray-900">
                          {report.jurisdiction.jurisdiction_type}
                        </p>
                      </div>
                    </div>

                    {report.case_description && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Description:</span> {report.case_description}
                        </p>
                      </div>
                    )}

                    {report.approved_at && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm">
                        <p className="text-gray-700">
                          <span className="font-medium">Approved on:</span>{' '}
                          {new Date(report.approved_at).toLocaleDateString()} at{' '}
                          {new Date(report.approved_at).toLocaleTimeString()}
                          {report.approved_by && (
                            <span className="ml-2">
                              by <span className="font-medium">{report.approved_by}</span>
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {report.rejection_reason && (
                      <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm">
                        <p className="text-rose-800">
                          <span className="font-medium">Rejection Reason:</span>{' '}
                          {report.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleReviewCase(report)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium whitespace-nowrap"
                    >
                      <Eye className="w-4 h-4" />
                      Review Case
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showApprovalModal && selectedReport && (
          <CaseApprovalModal
            report={selectedReport}
            jurisdiction={selectedReport.jurisdiction}
            onClose={handleModalClose}
          />
        )}
      </div>
    </div>
  );
}
