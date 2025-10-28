import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase, Report } from '../lib/supabase';

type CopyJobsModalProps = {
  isOpen: boolean;
  currentReportId: string;
  jurisdictionId: string;
  onClose: () => void;
  onCopy: (sourceReportId: string) => Promise<void>;
};

export function CopyJobsModal({
  isOpen,
  currentReportId,
  jurisdictionId,
  onClose,
  onCopy,
}: CopyJobsModalProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReportId, setSelectedReportId] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen, jurisdictionId]);

  async function loadReports() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('jurisdiction_id', jurisdictionId)
        .neq('id', currentReportId)
        .order('report_year', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  }

  const handleCopy = async () => {
    if (!selectedReportId) {
      alert('Please select a report to copy from');
      return;
    }

    setIsCopying(true);
    try {
      await onCopy(selectedReportId);
      onClose();
    } catch (error) {
      console.error('Error copying jobs:', error);
      alert('Error copying jobs. Please try again.');
    } finally {
      setIsCopying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Copy Jobs from Existing Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {reports.length === 0 ? (
            <p className="text-center text-gray-600 py-4">
              No previous reports available to copy from
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Report to Copy From
                </label>
                <select
                  value={selectedReportId}
                  onChange={(e) => setSelectedReportId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                >
                  <option value="">-- Select a Report --</option>
                  {reports.map((report) => (
                    <option key={report.id} value={report.id}>
                      {report.report_year} - Case {report.case_number}: {report.case_description}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  All job classifications from the selected report will be copied to the current report.
                  You can edit them after copying.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isCopying}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCopy}
                  className="flex-1 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCopying || !selectedReportId}
                >
                  {isCopying ? 'Copying...' : 'Copy Jobs'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
