import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Plus, Download, Eye, FileEdit, RotateCcw } from 'lucide-react';
import { supabase, type Jurisdiction, type Report, type JobClassification } from '../lib/supabase';
import { EditCaseDescriptionModal } from './EditCaseDescriptionModal';
import { AddJobModal } from './AddJobModal';

type JobsPageProps = {
  jurisdiction: Jurisdiction;
  onBack: () => void;
};

export function JobsPage({ jurisdiction, onBack }: JobsPageProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [jobs, setJobs] = useState<JobClassification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingJob, setEditingJob] = useState<Partial<JobClassification>>({});
  const [isEditCaseModalOpen, setIsEditCaseModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);

  useEffect(() => {
    loadReports();
  }, [jurisdiction.id]);

  useEffect(() => {
    if (selectedReport) {
      loadJobs(selectedReport.id);
    }
  }, [selectedReport]);

  async function loadReports() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('jurisdiction_id', jurisdiction.id)
        .order('report_year', { ascending: false })
        .order('case_number', { ascending: true });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      alert('Error loading reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadJobs(reportId: string) {
    try {
      const { data, error } = await supabase
        .from('job_classifications')
        .select('*')
        .eq('report_id', reportId)
        .order('job_number');

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error loading jobs:', error);
      alert('Error loading jobs. Please try again.');
    }
  }

  function handleViewJobs(report: Report) {
    setSelectedReport(report);
  }

  function handleBackToCaseList() {
    setSelectedReport(null);
    setJobs([]);
    setEditingJobId(null);
  }

  async function handleExportJobs(report: Report) {
    try {
      const { data, error } = await supabase
        .from('job_classifications')
        .select('*')
        .eq('report_id', report.id)
        .order('job_number');

      if (error) throw error;

      if (!data || data.length === 0) {
        alert('No jobs to export for this case.');
        return;
      }

      const csv = [
        ['Job Nbr', 'Title', 'Males', 'Females', 'Points', 'Min Sal', 'Max Sal', 'Yrs To Max', 'Yrs Srv', 'Exceptional Srv'],
        ...data.map((job) => [
          job.job_number,
          job.title,
          job.males,
          job.females,
          job.points,
          job.min_salary.toFixed(2),
          job.max_salary.toFixed(2),
          job.years_to_max.toFixed(2),
          job.years_service_pay.toFixed(2),
          job.exceptional_service_category || '0.00',
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${jurisdiction.name}_${report.report_year}_case_${report.case_number}_jobs.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting jobs:', error);
      alert('Error exporting jobs. Please try again.');
    }
  }

  function handleEditCaseDesc(report: Report) {
    setEditingReport(report);
    setIsEditCaseModalOpen(true);
  }

  async function handleSaveCaseDesc(description: string) {
    if (!editingReport) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ case_description: description, updated_at: new Date().toISOString() })
        .eq('id', editingReport.id);

      if (error) throw error;

      alert('Case description updated successfully!');
      await loadReports();
      setIsEditCaseModalOpen(false);
      setEditingReport(null);
    } catch (error) {
      console.error('Error updating case description:', error);
      alert('Error updating case description. Please try again.');
    }
  }

  async function handleDeleteCase(report: Report) {
    const jobCount = await getJobCount(report.id);
    const message = jobCount > 0
      ? `This will delete the case and all ${jobCount} job(s). Continue?`
      : 'This will delete the case. Continue?';

    if (!confirm(message)) return;

    try {
      const { error: jobsError } = await supabase
        .from('job_classifications')
        .delete()
        .eq('report_id', report.id);

      if (jobsError) throw jobsError;

      const { error: reportError } = await supabase
        .from('reports')
        .delete()
        .eq('id', report.id);

      if (reportError) throw reportError;

      alert('Case and jobs deleted successfully!');
      await loadReports();
    } catch (error) {
      console.error('Error deleting case:', error);
      alert('Error deleting case. Please try again.');
    }
  }

  async function getJobCount(reportId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('job_classifications')
        .select('*', { count: 'exact', head: true })
        .eq('report_id', reportId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error counting jobs:', error);
      return 0;
    }
  }

  async function handleRevertToPrivate(report: Report) {
    if (!confirm('Revert this case to Private (MMB Only)?')) return;

    try {
      const { error } = await supabase
        .from('reports')
        .update({ case_status: 'Private', updated_at: new Date().toISOString() })
        .eq('id', report.id);

      if (error) throw error;

      alert('Case reverted to Private successfully!');
      await loadReports();
    } catch (error) {
      console.error('Error reverting case:', error);
      alert('Error reverting case. Please try again.');
    }
  }

  function handleEditJob(job: JobClassification) {
    setEditingJobId(job.id);
    setEditingJob({ ...job });
  }

  function handleCancelEditJob() {
    setEditingJobId(null);
    setEditingJob({});
  }

  async function handleSaveJob() {
    if (!editingJobId || !editingJob) return;

    try {
      const { error } = await supabase
        .from('job_classifications')
        .update({
          title: editingJob.title,
          males: editingJob.males,
          females: editingJob.females,
          points: editingJob.points,
          min_salary: editingJob.min_salary,
          max_salary: editingJob.max_salary,
          years_to_max: editingJob.years_to_max,
          years_service_pay: editingJob.years_service_pay,
          exceptional_service_category: editingJob.exceptional_service_category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editingJobId);

      if (error) throw error;

      alert('Job updated successfully!');
      await loadJobs(selectedReport!.id);
      setEditingJobId(null);
      setEditingJob({});
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job. Please try again.');
    }
  }

  async function handleDeleteJob(jobId: string) {
    if (!confirm('Delete this job?')) return;

    try {
      const { error } = await supabase
        .from('job_classifications')
        .delete()
        .eq('id', jobId);

      if (error) throw error;

      alert('Job deleted successfully!');
      await loadJobs(selectedReport!.id);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job. Please try again.');
    }
  }

  function handleJobFieldChange(field: keyof JobClassification, value: string | number) {
    setEditingJob((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function getNextJobNumber(): number {
    if (jobs.length === 0) return 1;
    return Math.max(...jobs.map(j => j.job_number)) + 1;
  }

  async function handleAddJob(newJob: Partial<JobClassification>) {
    if (!selectedReport) return;

    try {
      const { error } = await supabase
        .from('job_classifications')
        .insert([{
          report_id: selectedReport.id,
          job_number: newJob.job_number || getNextJobNumber(),
          title: newJob.title || '',
          males: newJob.males || 0,
          females: newJob.females || 0,
          nonbinary: newJob.nonbinary || 0,
          points: newJob.points || 0,
          min_salary: newJob.min_salary || 0,
          max_salary: newJob.max_salary || 0,
          years_to_max: newJob.years_to_max || 0,
          years_service_pay: newJob.years_service_pay || 0,
          exceptional_service_category: newJob.exceptional_service_category || '',
          benefits_included_in_salary: 0,
          is_part_time: false,
          hours_per_week: null,
          days_per_year: null,
          additional_cash_compensation: 0,
        }]);

      if (error) throw error;

      alert('Job added successfully!');
      await loadJobs(selectedReport.id);
      setIsAddJobModalOpen(false);
    } catch (error) {
      console.error('Error adding job:', error);
      alert('Error adding job. Please try again.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865]"></div>
      </div>
    );
  }

  if (selectedReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToCaseList}
            className="flex items-center gap-2 px-4 py-2 text-[#003865] hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Case List
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#003865]">
                  {jurisdiction.name}
                </h2>
                <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1\">
                    <span className="font-medium\">Report Year:</span> {selectedReport.report_year}
                  </span>
                  <span className="text-gray-300\">•</span>
                  <span className="flex items-center gap-1\">
                    <span className="font-medium\">Case:</span> #{selectedReport.case_number}
                  </span>
                  <span className="text-gray-300\">•</span>
                  <span className="flex items-center gap-1\">
                    <span className="font-medium\">{selectedReport.case_description}</span>
                  </span>
                </div>
              </div>
              <div className="text-right\">
                <div className="text-sm text-gray-500\">Total Jobs</div>
                <div className="text-2xl font-bold text-[#003865]\">{jobs.length}</div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#003865] to-[#004a7f] text-white">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Job Title</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Males</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Females</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Points</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Min Salary</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Max Salary</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Yrs Max</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Yrs Srv</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Exc Srv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {jobs.map((job, index) => (
                  <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                    {editingJobId === job.id ? (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={handleSaveJob}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs font-medium"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditJob}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{job.job_number}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editingJob.title || ''}
                            onChange={(e) => handleJobFieldChange('title', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editingJob.males || 0}
                            onChange={(e) => handleJobFieldChange('males', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editingJob.females || 0}
                            onChange={(e) => handleJobFieldChange('females', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={editingJob.points || 0}
                            onChange={(e) => handleJobFieldChange('points', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editingJob.min_salary || 0}
                            onChange={(e) => handleJobFieldChange('min_salary', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-right focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editingJob.max_salary || 0}
                            onChange={(e) => handleJobFieldChange('max_salary', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-right focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editingJob.years_to_max || 0}
                            onChange={(e) => handleJobFieldChange('years_to_max', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={editingJob.years_service_pay || 0}
                            onChange={(e) => handleJobFieldChange('years_service_pay', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={editingJob.exceptional_service_category || ''}
                            onChange={(e) => handleJobFieldChange('exceptional_service_category', e.target.value)}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                          />
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditJob(job)}
                              className="text-blue-600 hover:text-blue-800"
                              title="Edit Job"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteJob(job.id)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete Job"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{job.job_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{job.title}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{job.males}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{job.females}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{job.points}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">${job.min_salary.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">${job.max_salary.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{job.years_to_max.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{job.years_service_pay.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-600">{job.exceptional_service_category || '0.00'}</td>
                      </>
                    )}
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={11} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-gray-400">
                          <FileEdit size={48} />
                        </div>
                        <p className="text-gray-500 font-medium">No jobs in this case</p>
                        <p className="text-sm text-gray-400">Add a job classification to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsAddJobModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#78BE21] text-white rounded-lg hover:bg-[#6ba51c] transition-colors text-sm font-medium shadow-sm"
            >
              <Plus size={18} />
              Add New Job
            </button>
          </div>
        </div>

        <AddJobModal
          isOpen={isAddJobModalOpen}
          reportId={selectedReport.id}
          nextJobNumber={getNextJobNumber()}
          onClose={() => setIsAddJobModalOpen(false)}
          onSave={handleAddJob}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-[#003865] hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-[#003865]">
            {jurisdiction.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Jurisdiction ID: {jurisdiction.jurisdiction_id} • {reports.length} {reports.length === 1 ? 'case' : 'cases'} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#003865] to-[#004a7f] text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Actions</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Case</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report, index) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewJobs(report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#003865] text-white rounded-md hover:bg-[#004a7f] transition-colors text-sm"
                      >
                        <Eye size={14} />
                        View
                      </button>
                      <button
                        onClick={() => handleExportJobs(report)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                      >
                        <Download size={14} />
                        Export
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{report.report_year}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{report.case_number}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{report.case_description}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      report.case_status === 'Private' ? 'bg-gray-100 text-gray-700' :
                      report.case_status === 'Submitted' ? 'bg-blue-100 text-blue-700' :
                      report.case_status === 'In Compliance' ? 'bg-green-100 text-green-700' :
                      report.case_status === 'Out of Compliance' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.case_status === 'Private' ? 'Private (MMB Only)' : report.case_status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditCaseDesc(report)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                        title="Edit Description"
                      >
                        <FileEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCase(report)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                        title="Delete Case"
                      >
                        <Trash2 size={16} />
                      </button>
                      {report.case_status !== 'Private' && (
                        <button
                          onClick={() => handleRevertToPrivate(report)}
                          className="flex items-center gap-1 text-gray-600 hover:text-gray-800 text-sm"
                          title="Revert to Private"
                        >
                          <RotateCcw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="text-gray-400">
                        <FileEdit size={48} />
                      </div>
                      <p className="text-gray-500 font-medium">No cases found</p>
                      <p className="text-sm text-gray-400">Create a new case to get started</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#78BE21] text-white rounded-lg hover:bg-[#6ba51c] transition-colors text-sm font-medium">
            <Plus size={18} />
            Add New Case
          </button>
        </div>
      </div>

      <EditCaseDescriptionModal
        isOpen={isEditCaseModalOpen}
        report={editingReport}
        onClose={() => {
          setIsEditCaseModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveCaseDesc}
      />
    </div>
  );
}
