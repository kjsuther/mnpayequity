import { useState } from 'react';
import { X, FileEdit, Copy, Upload, FileX } from 'lucide-react';

type JobEntryMethodModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectMethod: (method: 'manual' | 'copy' | 'import' | 'none') => void;
};

export function JobEntryMethodModal({ isOpen, onClose, onSelectMethod }: JobEntryMethodModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<'manual' | 'copy' | 'import' | 'none' | null>(null);

  const handleSubmit = () => {
    if (selectedMethod) {
      onSelectMethod(selectedMethod);
      setSelectedMethod(null);
    }
  };

  const handleClose = () => {
    setSelectedMethod(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-[#003865]">Add Jobs - Select Entry Method</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 mb-6">How would you like to add job classifications to this case?</p>

          <div className="space-y-3">
            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="jobEntryMethod"
                value="manual"
                checked={selectedMethod === 'manual'}
                onChange={() => setSelectedMethod('manual')}
                className="mt-1 w-5 h-5 text-[#003865] focus:ring-[#003865] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileEdit className="w-6 h-6 text-[#003865] group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900">Enter Jobs On Line</h3>
                </div>
                <p className="text-sm text-gray-600">Manually enter job classifications one at a time</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="jobEntryMethod"
                value="copy"
                checked={selectedMethod === 'copy'}
                onChange={() => setSelectedMethod('copy')}
                className="mt-1 w-5 h-5 text-[#003865] focus:ring-[#003865] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Copy className="w-6 h-6 text-[#003865] group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900">Copy Jobs From Existing Case Above</h3>
                </div>
                <p className="text-sm text-gray-600">Copy job data from a previous year's report</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="jobEntryMethod"
                value="import"
                checked={selectedMethod === 'import'}
                onChange={() => setSelectedMethod('import')}
                className="mt-1 w-5 h-5 text-[#003865] focus:ring-[#003865] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Upload className="w-6 h-6 text-[#003865] group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900">Import Jobs From Excel</h3>
                </div>
                <p className="text-sm text-gray-600">Upload an Excel file with job classifications</p>
              </div>
            </label>

            <label className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all cursor-pointer group">
              <input
                type="radio"
                name="jobEntryMethod"
                value="none"
                checked={selectedMethod === 'none'}
                onChange={() => setSelectedMethod('none')}
                className="mt-1 w-5 h-5 text-[#003865] focus:ring-[#003865] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <FileX className="w-6 h-6 text-[#003865] group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold text-gray-900">No Jobs Meet Requirement To Report</h3>
                </div>
                <p className="text-sm text-gray-600">No employee works more than 67 days per year or 14 hours per week</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedMethod}
            className="px-4 py-2 bg-[#003865] text-white rounded-md hover:bg-[#004a7f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
