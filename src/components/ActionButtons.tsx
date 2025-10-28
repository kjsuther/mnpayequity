import { Plus, Save, Download, FileText } from 'lucide-react';

interface ActionButtonsProps {
  onAddJurisdiction: () => void;
  onModifyJurisdiction: () => void;
  onExportContacts: () => void;
  onEnterJobs: () => void;
  hasJurisdiction: boolean;
}

export function ActionButtons({
  onAddJurisdiction,
  onModifyJurisdiction,
  onExportContacts,
  onEnterJobs,
  hasJurisdiction,
}: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-wrap gap-4">
        <button
          onClick={onAddJurisdiction}
          className="flex items-center gap-2 px-6 py-3 bg-[#78BE21] text-white rounded hover:bg-[#6ba91d] transition-colors font-medium"
        >
          <Plus size={18} />
          Add New Jurisdiction
        </button>

        <button
          onClick={onModifyJurisdiction}
          disabled={!hasJurisdiction}
          className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white rounded hover:bg-[#004a7f] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          Modify Jurisdiction
        </button>

        <button
          onClick={onExportContacts}
          disabled={!hasJurisdiction}
          className="flex items-center gap-2 px-6 py-3 bg-[#008EAA] text-white rounded hover:bg-[#007a95] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Download size={18} />
          Export Jurisdiction Contacts
        </button>

        <button
          onClick={onEnterJobs}
          disabled={!hasJurisdiction}
          className="flex items-center gap-2 px-6 py-3 bg-[#FF8200] text-white rounded hover:bg-[#e67500] transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <FileText size={18} />
          Enter Jobs / View Reports
        </button>
      </div>
    </div>
  );
}
