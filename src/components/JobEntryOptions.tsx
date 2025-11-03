import { FileEdit, Copy, Upload, FileX, Info } from 'lucide-react';

type JobEntryOptionsProps = {
  onEnterOnline: () => void;
  onCopyFrom: () => void;
  onImport: () => void;
  onNoJobs: () => void;
};

export function JobEntryOptions({
  onEnterOnline,
  onCopyFrom,
  onImport,
  onNoJobs,
}: JobEntryOptionsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">How would you like to enter job data?</h3>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Choose the method that works best for you:</p>
            <ul className="space-y-1 text-blue-700">
              <li>• <strong>Enter Online:</strong> Best for new jurisdictions or those with few job classes</li>
              <li>• <strong>Copy from Previous:</strong> Fastest if job structure hasn't changed much</li>
              <li>• <strong>Import Excel:</strong> Efficient for large numbers of jobs with existing data</li>
              <li>• <strong>No Jobs:</strong> Select if no employees meet reporting requirements</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onEnterOnline}
          className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
        >
          <FileEdit className="w-12 h-12 text-[#003865] group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-1">Enter Jobs On-Line</h4>
            <p className="text-sm text-gray-600">Manually enter job classifications one at a time</p>
          </div>
        </button>

        <button
          onClick={onCopyFrom}
          className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
        >
          <Copy className="w-12 h-12 text-[#003865] group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-1">Copy Jobs from Existing Case</h4>
            <p className="text-sm text-gray-600">Copy job data from a previous year's report</p>
          </div>
        </button>

        <button
          onClick={onImport}
          className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
        >
          <Upload className="w-12 h-12 text-[#003865] group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-1">Import Jobs from Excel</h4>
            <p className="text-sm text-gray-600">Upload an Excel file with job classifications</p>
          </div>
        </button>

        <button
          onClick={onNoJobs}
          className="flex flex-col items-center gap-3 p-6 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group"
        >
          <FileX className="w-12 h-12 text-[#003865] group-hover:scale-110 transition-transform" />
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-1">No Jobs Meet Requirement to Report</h4>
            <p className="text-sm text-gray-600">No employee works more than 67 days per year or 14 hours per week</p>
          </div>
        </button>
      </div>
    </div>
  );
}
