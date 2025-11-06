import { useState } from 'react';
import { X } from 'lucide-react';
import type { JobClassification } from '../lib/supabase';

type AddJobModalProps = {
  isOpen: boolean;
  reportId: string;
  nextJobNumber: number;
  onClose: () => void;
  onSave: (job: Partial<JobClassification>) => void;
};

export function AddJobModal({ isOpen, reportId, nextJobNumber, onClose, onSave }: AddJobModalProps) {
  const [job, setJob] = useState<Partial<JobClassification>>({
    report_id: reportId,
    job_number: nextJobNumber,
    title: '',
    males: 0,
    females: 0,
    points: 0,
    min_salary: 0,
    max_salary: 0,
    years_to_max: 0,
    years_service_pay: 0,
    exceptional_service_category: '',
  });

  function handleSave() {
    if (!job.title?.trim()) {
      alert('Job title is required');
      return;
    }
    onSave(job);
    setJob({
      report_id: reportId,
      job_number: nextJobNumber + 1,
      title: '',
      males: 0,
      females: 0,
      points: 0,
      min_salary: 0,
      max_salary: 0,
      years_to_max: 0,
      years_service_pay: 0,
      exceptional_service_category: '',
    });
  }

  function handleFieldChange(field: keyof JobClassification, value: string | number) {
    setJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-[#003865]">Add New Job</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Number
              </label>
              <input
                type="number"
                value={job.job_number || nextJobNumber}
                onChange={(e) => handleFieldChange('job_number', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={job.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
                placeholder="Enter job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Males
              </label>
              <input
                type="number"
                value={job.males || 0}
                onChange={(e) => handleFieldChange('males', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Females
              </label>
              <input
                type="number"
                value={job.females || 0}
                onChange={(e) => handleFieldChange('females', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Points
              </label>
              <input
                type="number"
                value={job.points || 0}
                onChange={(e) => handleFieldChange('points', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Salary
              </label>
              <input
                type="number"
                step="0.01"
                value={job.min_salary || 0}
                onChange={(e) => handleFieldChange('min_salary', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Salary
              </label>
              <input
                type="number"
                step="0.01"
                value={job.max_salary || 0}
                onChange={(e) => handleFieldChange('max_salary', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years To Max
              </label>
              <input
                type="number"
                step="0.01"
                value={job.years_to_max || 0}
                onChange={(e) => handleFieldChange('years_to_max', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years Service Pay
              </label>
              <input
                type="number"
                step="0.01"
                value={job.years_service_pay || 0}
                onChange={(e) => handleFieldChange('years_service_pay', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exceptional Service
              </label>
              <input
                type="text"
                value={job.exceptional_service_category || ''}
                onChange={(e) => handleFieldChange('exceptional_service_category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#003865]"
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
            Add Job
          </button>
        </div>
      </div>
    </div>
  );
}
