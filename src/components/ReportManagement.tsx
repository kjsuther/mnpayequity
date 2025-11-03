import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { supabase, Report, JobClassification, Jurisdiction, ImplementationReport } from '../lib/supabase';
import { ReportList } from './ReportList';
import { AddReportModal } from './AddReportModal';
import { JobEntryOptions } from './JobEntryOptions';
import { JobDataEntry } from './JobDataEntry';
import { CopyJobsModal } from './CopyJobsModal';
import { ImportJobsModal } from './ImportJobsModal';
import { ComplianceResults } from './ComplianceResults';
import { ImplementationForm } from './ImplementationForm';
import { ReportExportMenu } from './ReportExportMenu';
import { SuccessModal } from './SuccessModal';
import { ReportNotes } from './ReportNotes';
import { analyzeCompliance, ComplianceResult } from '../lib/complianceAnalysis';

type ReportManagementProps = {
  jurisdiction: Jurisdiction;
  selectedReport?: Report | null;
  onBack: () => void;
  onNavigateToReportView?: (reportType: 'jobDataEntry' | 'compliance' | 'predictedPay' | 'implementation') => void;
  onReportSelect?: (report: Report | null) => void;
};

export function ReportManagement({ jurisdiction, selectedReport, onBack, onNavigateToReportView, onReportSelect }: ReportManagementProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [jobs, setJobs] = useState<JobClassification[]>([]);
  const [implementationData, setImplementationData] = useState<ImplementationReport | null>(null);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [currentView, setCurrentView] = useState<'jobs' | 'compliance' | 'implementation' | 'notes'>('jobs');
  const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
  const [isCopyJobsModalOpen, setIsCopyJobsModalOpen] = useState(false);
  const [isImportJobsModalOpen, setIsImportJobsModalOpen] = useState(false);
  const [showJobOptions, setShowJobOptions] = useState(false);
  const [entryMethod, setEntryMethod] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadReports();
  }, [jurisdiction.id]);

  useEffect(() => {
    if (selectedReport) {
      setCurrentReport(selectedReport);
    }
  }, [selectedReport]);

  useEffect(() => {
    if (currentReport) {
      loadJobs(currentReport.id);
      loadImplementationData(currentReport.id);
      setShowJobOptions(false);
      setEntryMethod(null);
      setCurrentView('jobs');
    }
  }, [currentReport]);

  async function loadReports() {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('jurisdiction_id', jurisdiction.id)
        .order('report_year', { ascending: false })
        .order('case_number', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
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

      if (!data || data.length === 0) {
        setShowJobOptions(true);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  }

  async function loadImplementationData(reportId: string) {
    try {
      const { data, error } = await supabase
        .from('implementation_reports')
        .select('*')
        .eq('report_id', reportId)
        .maybeSingle();

      if (error) throw error;
      setImplementationData(data);
    } catch (error) {
      console.error('Error loading implementation data:', error);
    }
  }

  async function handleAddReport(reportData: { report_year: number; case_description: string; case_status: string }) {
    try {
      const { data: existingReports } = await supabase
        .from('reports')
        .select('case_number')
        .eq('jurisdiction_id', jurisdiction.id)
        .eq('report_year', reportData.report_year)
        .order('case_number', { ascending: false })
        .limit(1);

      const nextCaseNumber = existingReports && existingReports.length > 0
        ? existingReports[0].case_number + 1
        : 1;

      const { data, error } = await supabase
        .from('reports')
        .insert([
          {
            jurisdiction_id: jurisdiction.id,
            report_year: reportData.report_year,
            case_number: nextCaseNumber,
            case_description: reportData.case_description,
            case_status: reportData.case_status,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      await loadReports();
      if (data) {
        setCurrentReport(data);
        if (onReportSelect) {
          onReportSelect(data);
        }
      }
    } catch (error) {
      console.error('Error creating report:', error);
      throw error;
    }
  }

  async function handleDeleteReport(reportId: string) {
    try {
      const { error } = await supabase
        .from('reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      await loadReports();
      if (currentReport?.id === reportId) {
        setCurrentReport(null);
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Error deleting report. Please try again.');
    }
  }

  async function handleAddJob(jobData: Partial<JobClassification>) {
    if (!currentReport) return;

    try {
      const nextJobNumber = jobs.length > 0
        ? Math.max(...jobs.map(j => j.job_number)) + 1
        : 1;

      const { error } = await supabase
        .from('job_classifications')
        .insert([
          {
            report_id: currentReport.id,
            job_number: nextJobNumber,
            ...jobData,
          },
        ]);

      if (error) throw error;
      await loadJobs(currentReport.id);
    } catch (error) {
      console.error('Error adding job:', error);
      throw error;
    }
  }

  async function handleUpdateJob(jobId: string, jobData: Partial<JobClassification>) {
    try {
      const { error } = await supabase
        .from('job_classifications')
        .update({
          ...jobData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (error) throw error;
      if (currentReport) {
        await loadJobs(currentReport.id);
      }
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }

  async function handleDeleteJob(jobId: string) {
    try {
      const { error } = await supabase
        .from('job_classifications')
        .delete()
        .eq('id', jobId);

      if (error) throw error;
      if (currentReport) {
        await loadJobs(currentReport.id);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }

  function handleViewReport(report: Report) {
    setCurrentReport(report);
    if (onReportSelect) {
      onReportSelect(report);
    }
  }

  function handleBackToList() {
    setCurrentReport(null);
    setShowJobOptions(false);
    setEntryMethod(null);
    if (onReportSelect) {
      onReportSelect(null);
    }
  }

  function handleEntryMethod(method: string) {
    setEntryMethod(method);
    setShowJobOptions(false);

    if (method === 'copy') {
      setIsCopyJobsModalOpen(true);
    } else if (method === 'import') {
      setIsImportJobsModalOpen(true);
    } else if (method === 'none') {
      const confirmed = confirm(
        'This option indicates that your jurisdiction has no employees who work 67 days or more per year AND at least 14 hours per week (100 days for students).\n\nYou will proceed directly to the Implementation Form.\n\nContinue?'
      );
      if (confirmed) {
        setCurrentView('implementation');
      } else {
        setShowJobOptions(true);
      }
    }
  }

  async function handleCopyJobs(sourceReportId: string) {
    if (!currentReport) return;

    try {
      const { data: sourceJobs, error: fetchError } = await supabase
        .from('job_classifications')
        .select('*')
        .eq('report_id', sourceReportId)
        .order('job_number');

      if (fetchError) throw fetchError;

      if (sourceJobs && sourceJobs.length > 0) {
        const jobsToInsert = sourceJobs.map((job, index) => ({
          report_id: currentReport.id,
          job_number: index + 1,
          title: job.title,
          males: job.males,
          females: job.females,
          nonbinary: job.nonbinary || 0,
          points: job.points,
          min_salary: job.min_salary,
          max_salary: job.max_salary,
          years_to_max: job.years_to_max,
          years_service_pay: job.years_service_pay,
          exceptional_service_category: job.exceptional_service_category,
          benefits_included_in_salary: job.benefits_included_in_salary || 0,
          is_part_time: job.is_part_time || false,
          hours_per_week: job.hours_per_week,
          days_per_year: job.days_per_year,
          additional_cash_compensation: job.additional_cash_compensation || 0,
        }));

        const { error: insertError } = await supabase
          .from('job_classifications')
          .insert(jobsToInsert);

        if (insertError) throw insertError;

        await loadJobs(currentReport.id);
        setEntryMethod('manual');
        setCurrentView('jobs');

        setSuccessMessage(`Successfully copied ${sourceJobs.length} job classification${sourceJobs.length === 1 ? '' : 's'}`);
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Error copying jobs:', error);
      throw error;
    }
  }

  async function handleImportJobs(jobs: any[]) {
    if (!currentReport) return;

    try {
      const jobsToInsert = jobs.map((job) => ({
        report_id: currentReport.id,
        ...job,
      }));

      const { error } = await supabase
        .from('job_classifications')
        .insert(jobsToInsert);

      if (error) throw error;

      await loadJobs(currentReport.id);
      alert(`Successfully imported ${jobs.length} job classifications`);
    } catch (error) {
      console.error('Error importing jobs:', error);
      throw error;
    }
  }

  function handleSeeResults() {
    if (jobs.length === 0) {
      alert('Please add job classifications before viewing results');
      return;
    }

    const result = analyzeCompliance(jobs);
    setComplianceResult(result);
    setCurrentView('compliance');
  }

  function handleProceedToImplementation() {
    setCurrentView('implementation');
  }

  async function handleSaveImplementation(data: Partial<ImplementationReport>) {
    if (!currentReport) return;

    try {
      if (implementationData) {
        const { error } = await supabase
          .from('implementation_reports')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('report_id', currentReport.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('implementation_reports')
          .insert([
            {
              report_id: currentReport.id,
              ...data,
            },
          ]);

        if (error) throw error;
      }

      await loadImplementationData(currentReport.id);
    } catch (error) {
      console.error('Error saving implementation data:', error);
      throw error;
    }
  }

  async function handleSubmitReport() {
    if (!currentReport || !implementationData) return;

    try {
      const complianceStatus = complianceResult?.isCompliant
        ? 'In Compliance'
        : complianceResult?.requiresManualReview
        ? 'Manual Review Required'
        : 'Out of Compliance';

      const { error } = await supabase
        .from('reports')
        .update({
          case_status: 'Submitted',
          compliance_status: complianceStatus,
          submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentReport.id);

      if (error) throw error;

      await loadReports();
      setCurrentReport(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      throw error;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={currentReport ? handleBackToList : onBack}
          className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          {currentReport ? 'Back to Reports' : 'Back to Jurisdiction'}
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{jurisdiction.name}</h2>
          {currentReport && (
            <p className="text-sm text-gray-600">
              {currentReport.report_year} - Case {currentReport.case_number}: {currentReport.case_description}
            </p>
          )}
        </div>
      </div>

      {!currentReport ? (
        <ReportList
          reports={reports}
          onViewReport={handleViewReport}
          onDeleteReport={handleDeleteReport}
          onAddReport={() => setIsAddReportModalOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2">
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentView('jobs')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentView === 'jobs'
                    ? 'bg-[#003865] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Job Data Entry
              </button>
              <button
                onClick={() => {
                  if (jobs.length === 0) {
                    alert('Please add job classifications first');
                    return;
                  }
                  if (!complianceResult) {
                    const result = analyzeCompliance(jobs);
                    setComplianceResult(result);
                  }
                  setCurrentView('compliance');
                }}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentView === 'compliance'
                    ? 'bg-[#003865] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Compliance Results
              </button>
              <button
                onClick={() => setCurrentView('implementation')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentView === 'implementation'
                    ? 'bg-[#003865] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Implementation Form
              </button>
              <button
                onClick={() => setCurrentView('notes')}
                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                  currentView === 'notes'
                    ? 'bg-[#003865] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Notes
              </button>
            </div>
          </div>

          {currentView === 'jobs' && (
            <>
              {showJobOptions ? (
                <JobEntryOptions
                  onEnterOnline={() => handleEntryMethod('manual')}
                  onCopyFrom={() => handleEntryMethod('copy')}
                  onImport={() => handleEntryMethod('import')}
                  onNoJobs={() => handleEntryMethod('none')}
                />
              ) : entryMethod === 'manual' || jobs.length > 0 ? (
                <>
                  <JobDataEntry
                    jobs={jobs}
                    onAddJob={handleAddJob}
                    onUpdateJob={handleUpdateJob}
                    onDeleteJob={handleDeleteJob}
                    onCopyJobs={() => setIsCopyJobsModalOpen(true)}
                    onImportJobs={() => setIsImportJobsModalOpen(true)}
                    onNoJobsToReport={() => handleEntryMethod('none')}
                  />
                  {jobs.length > 0 && currentReport.case_status !== 'Submitted' && (
                    <div className="flex justify-end">
                      <button
                        onClick={handleSeeResults}
                        className="px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
                      >
                        See Results
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
                  <p className="text-gray-600 mb-4">Select a method to enter job data</p>
                  <button
                    onClick={() => setShowJobOptions(true)}
                    className="px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
                  >
                    Choose Entry Method
                  </button>
                </div>
              )}
            </>
          )}

          {currentView === 'compliance' && complianceResult && (
            <ComplianceResults
              results={complianceResult}
              onBack={() => setCurrentView('jobs')}
              reportYear={currentReport.report_year}
              showBackButton={false}
              onProceedToImplementation={handleProceedToImplementation}
            />
          )}

          {currentView === 'implementation' && (
            <ImplementationForm
              report={currentReport}
              jurisdiction={jurisdiction}
              jobs={jobs}
              implementationData={implementationData}
              onSave={handleSaveImplementation}
              onSubmit={handleSubmitReport}
            />
          )}

          {currentView === 'notes' && (
            <ReportNotes reportId={currentReport.id} />
          )}

          {currentReport && jobs.length > 0 && onNavigateToReportView && (
            <ReportExportMenu
              report={currentReport}
              jurisdiction={jurisdiction}
              jobs={jobs}
              complianceResult={complianceResult}
              implementationData={implementationData}
              onNavigateToReport={onNavigateToReportView}
            />
          )}
        </div>
      )}

      <AddReportModal
        isOpen={isAddReportModalOpen}
        onClose={() => setIsAddReportModalOpen(false)}
        onSave={handleAddReport}
      />

      {currentReport && (
        <>
          <CopyJobsModal
            isOpen={isCopyJobsModalOpen}
            currentReportId={currentReport.id}
            jurisdictionId={jurisdiction.id}
            onClose={() => setIsCopyJobsModalOpen(false)}
            onCopy={handleCopyJobs}
          />

          <ImportJobsModal
            isOpen={isImportJobsModalOpen}
            onClose={() => setIsImportJobsModalOpen(false)}
            onImport={handleImportJobs}
          />
        </>
      )}

      <SuccessModal
        isOpen={showSuccessModal}
        message={successMessage}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}
