import { useState } from 'react';
import { Edit2, Trash2, Plus, Save, X, AlertCircle, Calculator, BookOpen } from 'lucide-react';
import { JobClassification } from '../lib/supabase';
import { JobEntryMethodModal } from './JobEntryMethodModal';
import { ContextualHelp } from './ContextualHelp';
import { JobDataEntryHelp } from './JobDataEntryHelp';

type JobDataEntryProps = {
  jobs: JobClassification[];
  onAddJob: (jobData: Partial<JobClassification>) => Promise<void>;
  onUpdateJob: (jobId: string, jobData: Partial<JobClassification>) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onCopyJobs?: () => void;
  onImportJobs?: () => void;
  onNoJobsToReport?: () => void;
};

export function JobDataEntry({ jobs, onAddJob, onUpdateJob, onDeleteJob, onCopyJobs, onImportJobs, onNoJobsToReport }: JobDataEntryProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isJobEntryMethodModalOpen, setIsJobEntryMethodModalOpen] = useState(false);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [formData, setFormData] = useState<Partial<JobClassification>>({
    title: '',
    males: 0,
    females: 0,
    points: 0,
    min_salary: 0,
    max_salary: 0,
    years_to_max: 0,
    years_service_pay: 0,
    exceptional_service_category: '',
    benefits_included_in_salary: 0,
    is_part_time: false,
    hours_per_week: null,
    days_per_year: null,
    additional_cash_compensation: 0,
  });

  const handleShowEntryOptions = () => {
    if (onCopyJobs || onImportJobs || onNoJobsToReport) {
      setIsJobEntryMethodModalOpen(true);
    } else {
      handleStartAdd();
    }
  };

  const handleJobEntryMethodSelect = (method: 'manual' | 'copy' | 'import' | 'none') => {
    setIsJobEntryMethodModalOpen(false);

    if (method === 'manual') {
      handleStartAdd();
    } else if (method === 'copy' && onCopyJobs) {
      onCopyJobs();
    } else if (method === 'import' && onImportJobs) {
      onImportJobs();
    } else if (method === 'none' && onNoJobsToReport) {
      onNoJobsToReport();
    }
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      title: '',
      males: 0,
      females: 0,
      points: 0,
      min_salary: 0,
      max_salary: 0,
      years_to_max: 0,
      years_service_pay: 0,
      exceptional_service_category: '',
      benefits_included_in_salary: 0,
      is_part_time: false,
      hours_per_week: null,
      days_per_year: null,
      additional_cash_compensation: 0,
    });
  };

  const handleStartEdit = (job: JobClassification) => {
    setIsAdding(false);
    setEditingId(job.id);
    setFormData({ ...job });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!formData.title?.trim()) {
      alert('Job title is required');
      return;
    }

    try {
      if (isAdding) {
        await onAddJob(formData);
      } else if (editingId) {
        await onUpdateJob(editingId, formData);
      }
      handleCancel();
    } catch (error) {
      console.error('Error saving job:', error);
      alert('Error saving job. Please try again.');
    }
  };

  const handleDelete = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job classification?')) {
      await onDeleteJob(jobId);
    }
  };

  const updateField = (field: keyof JobClassification, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-4">
      <ContextualHelp context="job-data-entry" />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Job Classifications</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFieldGuide(true)}
              className="flex items-center gap-2 px-4 py-2 border border-[#003865] text-[#003865] rounded-lg hover:bg-blue-50 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              Field Guide
            </button>
            {!isAdding && !editingId && (
              <button
                onClick={handleShowEntryOptions}
                className="flex items-center gap-2 px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Job
              </button>
            )}
          </div>
        </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Job #</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Title</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Males</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Females</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Points</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Min Sal</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Max Sal</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Yrs Max</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Yrs Srv</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Ex Srv</th>
              <th className="text-left py-2 px-2 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job, index) => (
              editingId === job.id ? (
                <tr key={job.id} className="border-b border-gray-100 bg-blue-50">
                  <td className="py-2 px-2">{job.job_number}</td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => updateField('title', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.males || 0}
                      onChange={(e) => updateField('males', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.females || 0}
                      onChange={(e) => updateField('females', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.points || 0}
                      onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.min_salary || 0}
                      onChange={(e) => updateField('min_salary', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.max_salary || 0}
                      onChange={(e) => updateField('max_salary', parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.years_to_max || 0}
                      onChange={(e) => updateField('years_to_max', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                      step="0.1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="number"
                      value={formData.years_service_pay || 0}
                      onChange={(e) => updateField('years_service_pay', parseFloat(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded"
                      min="0"
                      step="0.1"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <input
                      type="text"
                      value={formData.exceptional_service_category || ''}
                      onChange={(e) => updateField('exceptional_service_category', e.target.value)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded"
                      placeholder="e.g., LONGEVITY"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      <button
                        onClick={handleSave}
                        className="p-1 text-green-600 hover:bg-green-50 rounded"
                        title="Save"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 px-2">{job.job_number}</td>
                  <td className="py-2 px-2 font-medium">{job.title}</td>
                  <td className="py-2 px-2">{job.males}</td>
                  <td className="py-2 px-2">{job.females}</td>
                  <td className="py-2 px-2">{job.points}</td>
                  <td className="py-2 px-2">${job.min_salary.toLocaleString()}</td>
                  <td className="py-2 px-2">${job.max_salary.toLocaleString()}</td>
                  <td className="py-2 px-2">{job.years_to_max}</td>
                  <td className="py-2 px-2">{job.years_service_pay}</td>
                  <td className="py-2 px-2">{job.exceptional_service_category}</td>
                  <td className="py-2 px-2">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStartEdit(job)}
                        className="p-1 text-[#003865] hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(job.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {isAdding && (
              <tr className="border-b border-gray-100 bg-blue-50">
                <td className="py-2 px-2">New</td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => updateField('title', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Job Title"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.males || 0}
                    onChange={(e) => updateField('males', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.females || 0}
                    onChange={(e) => updateField('females', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.points || 0}
                    onChange={(e) => updateField('points', parseInt(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.min_salary || 0}
                    onChange={(e) => updateField('min_salary', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.max_salary || 0}
                    onChange={(e) => updateField('max_salary', parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.years_to_max || 0}
                    onChange={(e) => updateField('years_to_max', parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                    step="0.1"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="number"
                    value={formData.years_service_pay || 0}
                    onChange={(e) => updateField('years_service_pay', parseFloat(e.target.value) || 0)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded"
                    min="0"
                    step="0.1"
                  />
                </td>
                <td className="py-2 px-2">
                  <input
                    type="text"
                    value={formData.exceptional_service_category || ''}
                    onChange={(e) => updateField('exceptional_service_category', e.target.value)}
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    placeholder="e.g., LONGEVITY"
                  />
                </td>
                <td className="py-2 px-2">
                  <div className="flex gap-1">
                    <button
                      onClick={handleSave}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleCancel}
                      className="p-1 text-gray-600 hover:bg-gray-100 rounded"
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

        {jobs.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <p>No job classifications added yet</p>
            <p className="text-sm">Click "Add Job" to start entering job data</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-[#003865]" />
          <h4 className="font-semibold text-gray-900">Part-Time Salary Conversion Calculator</h4>
        </div>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-medium mb-1">For Hourly Part-Time Employees:</p>
            <p className="text-gray-600">Hourly wage × 173.3 = Monthly FTE salary</p>
            <p className="text-xs text-gray-500 mt-1">Example: $15/hr × 173.3 = $2,599.50/month</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-medium mb-1">For Part-Time with Single Rate:</p>
            <p className="text-gray-600">1. Monthly salary ÷ hours worked per month = hourly rate</p>
            <p className="text-gray-600">2. Hourly rate × 173.3 = Monthly FTE salary</p>
            <p className="text-xs text-gray-500 mt-1">Example: $700/mo ÷ 60 hrs = $11.67/hr → $11.67 × 173.3 = $2,022/month</p>
          </div>
          <div className="p-3 bg-gray-50 rounded">
            <p className="font-medium mb-1">For Annual Salary:</p>
            <p className="text-gray-600">Annual salary ÷ months worked = Monthly salary</p>
            <p className="text-xs text-gray-500 mt-1">Example: $36,000/year ÷ 12 = $3,000/month</p>
          </div>
        </div>
      </div>

      <JobEntryMethodModal
        isOpen={isJobEntryMethodModalOpen}
        onClose={() => setIsJobEntryMethodModalOpen(false)}
        onSelectMethod={handleJobEntryMethodSelect}
      />

      <JobDataEntryHelp
        isOpen={showFieldGuide}
        onClose={() => setShowFieldGuide(false)}
      />
    </div>
  );
}
