import { FileText, Eye, Trash2, Plus } from 'lucide-react';
import { Report } from '../lib/supabase';

type ReportListProps = {
  reports: Report[];
  onViewReport: (report: Report) => void;
  onDeleteReport: (reportId: string) => void;
  onAddReport: () => void;
};

export function ReportList({
  reports,
  onViewReport,
  onDeleteReport,
  onAddReport,
}: ReportListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'In Compliance':
        return 'bg-green-100 text-green-800';
      case 'Out of Compliance':
        return 'bg-red-100 text-red-800';
      case 'Shared':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#003865]" />
          <h2 className="text-lg font-semibold text-gray-900">Pay Equity Reports</h2>
        </div>
        <button
          onClick={onAddReport}
          className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors relative z-10"
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add New Case
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No reports found</p>
          <p className="text-sm">Click "Add New Case" to create your first pay equity report</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Report Year</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Case ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Case Description</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Case Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr
                  key={report.id}
                  onClick={() => onViewReport(report)}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{report.report_year}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{report.case_number}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{report.case_description}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.case_status)}`}>
                      {report.case_status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReport(report);
                        }}
                        className="p-1.5 text-[#003865] hover:bg-blue-50 rounded transition-colors"
                        title="View/Edit Report"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {report.case_status === 'Private' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
                              onDeleteReport(report.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
