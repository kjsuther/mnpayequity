import { useState } from 'react';
import { X } from 'lucide-react';

type AddReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reportData: { report_year: number; case_description: string; case_status: string }) => Promise<void>;
};

export function AddReportModal({ isOpen, onClose, onSave }: AddReportModalProps) {
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [caseDescription, setCaseDescription] = useState('');
  const [caseStatus, setCaseStatus] = useState<'Private' | 'Shared'>('Private');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseDescription.trim()) {
      alert('Please enter a case description');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        report_year: reportYear,
        case_description: caseDescription.trim(),
        case_status: caseStatus,
      });
      setReportYear(new Date().getFullYear());
      setCaseDescription('');
      setCaseStatus('Private');
      onClose();
    } catch (error) {
      console.error('Error saving report:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const suggestedDescription = `${reportYear} DATA`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Report</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Year
            </label>
            <input
              type="number"
              value={reportYear}
              onChange={(e) => setReportYear(parseInt(e.target.value) || new Date().getFullYear())}
              min={2000}
              max={2100}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Case Description
            </label>
            <input
              type="text"
              value={caseDescription}
              onChange={(e) => setCaseDescription(e.target.value)}
              placeholder={suggestedDescription}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Suggested format: {suggestedDescription}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Case Status
            </label>
            <select
              value={caseStatus}
              onChange={(e) => setCaseStatus(e.target.value as 'Private' | 'Shared')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            >
              <option value="Private">Private</option>
              <option value="Shared">Shared</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Shared: Both jurisdiction and State Pay Equity Coordinator can view the jobs<br />
              Private: Only the jurisdiction can view the jobs
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
