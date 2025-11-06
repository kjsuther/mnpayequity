import { X } from 'lucide-react';
import { Report } from '../lib/supabase';

type FilteredReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reports: Report[];
  title: string;
  onViewReport: (report: Report) => void;
};

export function FilteredReportModal({
  isOpen,
  onClose,
  reports,
  title,
  onViewReport,
}: FilteredReportModalProps) {
  if (!isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-green-100 text-green-800';
      case 'Shared':
        return 'bg-yellow-100 text-yellow-800';
      case 'Private':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (status: string | null) => {
    switch (status) {
      case 'In Compliance':
        return 'bg-green-100 text-green-800';
      case 'Out of Compliance':
        return 'bg-red-100 text-red-800';
      case 'Manual Review Required':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg font-medium">No reports found</p>
              <p className="text-sm">There are no reports matching this filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => {
                    onViewReport(report);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-[#003865] transition-colors text-left group"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 group-hover:text-[#003865] transition-colors">
                      {report.report_year} - Case {report.case_number}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{report.case_description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.case_status)}`}>
                        {report.case_status}
                      </span>
                      {report.compliance_status && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getComplianceColor(report.compliance_status)}`}>
                          {report.compliance_status}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-[#003865] group-hover:translate-x-1 transition-transform ml-4">
                    →
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
