import { useState } from 'react';
import { FileText, AlertCircle, CheckCircle, Calendar, BookOpen, ClipboardCheck } from 'lucide-react';
import { Report, Jurisdiction } from '../lib/supabase';

type DashboardProps = {
  jurisdiction: Jurisdiction;
  reports: Report[];
  onManageReports: () => void;
  onViewReport: (report: Report) => void;
  onShowDataGuide: () => void;
};

export function Dashboard({ jurisdiction, reports, onManageReports, onViewReport, onShowDataGuide }: DashboardProps) {
  const submittedReports = reports.filter(r => r.case_status === 'Submitted');
  const draftReports = reports.filter(r => r.case_status === 'Private' || r.case_status === 'Shared');
  const compliantReports = reports.filter(r => r.compliance_status === 'In Compliance');
  const outOfComplianceReports = reports.filter(r => r.compliance_status === 'Out of Compliance');

  const currentYear = new Date().getFullYear();
  const nextReportYear = jurisdiction.next_report_year || currentYear;
  const hasCurrentYearReport = reports.some(r => r.report_year === currentYear);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-[#003865] to-[#004d7a] rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-2 text-white">Welcome to Pay Equity Reporting</h2>
        <p className="text-lg text-white opacity-90">{jurisdiction.name}</p>
        <p className="text-sm text-white opacity-75 mt-1">{jurisdiction.jurisdiction_type}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Total Cases</h3>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{reports.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Submitted</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{submittedReports.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Drafts</h3>
            <AlertCircle className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{draftReports.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">In Compliance</h3>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{compliantReports.length}</p>
        </div>
      </div>

      {!hasCurrentYearReport && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Report Reminder</h3>
              <p className="text-sm text-yellow-700 mt-1">
                You haven't created a report for {currentYear} yet. Consider creating one to stay on track with your pay equity reporting requirements.
              </p>
            </div>
          </div>
        </div>
      )}

      {outOfComplianceReports.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg overflow-hidden">
          {outOfComplianceReports.length === 1 ? (
            <button
              onClick={() => onViewReport(outOfComplianceReports[0])}
              className="w-full p-4 text-left hover:bg-red-100 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Action Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have 1 report out of compliance. Click to review and take necessary action to address pay equity gaps.
                  </p>
                  <p className="text-sm text-red-800 font-medium mt-2">
                    {outOfComplianceReports[0].report_year} - Case {outOfComplianceReports[0].case_number}: {outOfComplianceReports[0].case_description}
                  </p>
                </div>
                <div className="text-red-600 group-hover:translate-x-1 transition-transform">
                  →
                </div>
              </div>
            </button>
          ) : (
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Action Required</h3>
                  <p className="text-sm text-red-700 mt-1">
                    You have {outOfComplianceReports.length} reports out of compliance. Click on any report below to review and take action.
                  </p>
                </div>
              </div>
              <div className="ml-8 space-y-2">
                {outOfComplianceReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => onViewReport(report)}
                    className="w-full text-left px-3 py-2 bg-white border border-red-200 rounded hover:bg-red-50 hover:border-red-300 transition-colors group flex items-center justify-between"
                  >
                    <span className="text-sm text-red-800 font-medium">
                      {report.report_year} - Case {report.case_number}: {report.case_description}
                    </span>
                    <span className="text-red-600 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button
            onClick={onManageReports}
            className="w-full flex items-center justify-between px-4 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
          >
            <span className="font-medium">Manage Pay Equity Reports</span>
            <FileText className="w-5 h-5" />
          </button>
          <button
            onClick={onShowDataGuide}
            className="w-full flex items-center justify-between px-4 py-3 border-2 border-[#003865] text-[#003865] rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span className="font-medium">Data Gathering Checklist</span>
            <ClipboardCheck className="w-5 h-5" />
          </button>
        </div>
      </div>

      {reports.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                onClick={() => onViewReport(report)}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {report.report_year} - Case {report.case_number}
                  </p>
                  <p className="text-sm text-gray-600">{report.case_description}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-medium rounded-full ${
                    report.case_status === 'Submitted'
                      ? 'bg-green-100 text-green-800'
                      : report.case_status === 'Shared'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {report.case_status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">About Pay Equity Reporting</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>
            Minnesota's Local Government Pay Equity Act requires jurisdictions to ensure equitable compensation
            between female-dominated and male-dominated job classes of comparable work value.
          </p>
          <p>
            This system helps you manage jurisdiction information, enter job classifications, analyze compliance,
            and submit official implementation reports to the State of Minnesota.
          </p>
        </div>
      </div>
    </div>
  );
}
