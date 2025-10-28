import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Report } from '../lib/supabase';

type EditCaseDescriptionModalProps = {
  isOpen: boolean;
  report: Report | null;
  onClose: () => void;
  onSave: (description: string) => void;
};

export function EditCaseDescriptionModal({ isOpen, report, onClose, onSave }: EditCaseDescriptionModalProps) {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (report) {
      setDescription(report.case_description);
    }
  }, [report]);

  function handleSave() {
    if (!description.trim()) {
      alert('Case description cannot be empty');
      return;
    }
    onSave(description);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#003865]">Edit Case Description</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Case Description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
                placeholder="Enter case description"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#003865] text-white rounded-md hover:bg-[#004a7f] transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
