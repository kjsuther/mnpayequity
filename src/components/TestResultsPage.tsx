import { useState, useEffect } from 'react';
import { ArrowLeft, Play, FileText, Printer } from 'lucide-react';
import { supabase, Jurisdiction, Report, JobClassification, Contact } from '../lib/supabase';
import { analyzeCompliance, ComplianceResult } from '../lib/complianceAnalysis';
import { ComplianceResults } from './ComplianceResults';

type TestResultsPageProps = {
  jurisdiction: Jurisdiction;
  onBack: () => void;
};

export function TestResultsPage({ jurisdiction, onBack }: TestResultsPageProps) {
  const [reportYears, setReportYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [casesForYear, setCasesForYear] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [jobs, setJobs] = useState<JobClassification[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReportYears();
    loadContacts();
  }, [jurisdiction.id]);

  useEffect(() => {
    if (selectedYear) {
      loadCasesForYear(selectedYear);
    } else {
      setCasesForYear([]);
      setSelectedReport(null);
    }
  }, [selectedYear]);

  async function loadReportYears() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('reports')
        .select('report_year')
        .eq('jurisdiction_id', jurisdiction.id)
        .order('report_year', { ascending: false });

      if (error) throw error;

      const uniqueYears = Array.from(new Set(data?.map(r => r.report_year) || []));
      setReportYears(uniqueYears);
    } catch (error) {
      console.error('Error loading report years:', error);
      setError('Failed to load report years. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCasesForYear(year: number) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('jurisdiction_id', jurisdiction.id)
        .eq('report_year', year)
        .order('case_number', { ascending: true });

      if (error) throw error;
      setCasesForYear(data || []);
    } catch (error) {
      console.error('Error loading cases:', error);
      setError('Failed to load cases. Please try again.');
    }
  }

  async function loadContacts() {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('jurisdiction_id', jurisdiction.id)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  async function handleRunEvaluation() {
    if (!selectedReport) return;

    try {
      setAnalyzing(true);
      setError(null);

      const { data, error } = await supabase
        .from('job_classifications')
        .select('*')
        .eq('report_id', selectedReport.id)
        .order('job_number');

      if (error) throw error;

      if (!data || data.length === 0) {
        setError('No job classifications found for this report. Please add jobs first.');
        setAnalyzing(false);
        return;
      }

      setJobs(data);
      const result = analyzeCompliance(data);
      setComplianceResult(result);
    } catch (error) {
      console.error('Error running evaluation:', error);
      setError('Failed to run compliance evaluation. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  }

  function handleViewAnotherCase() {
    setSelectedYear(null);
    setSelectedReport(null);
    setComplianceResult(null);
    setJobs([]);
    setError(null);
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003865] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8 print:hidden">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#003865]">Test Results</h1>
            <p className="text-sm text-gray-600 mt-1">{jurisdiction.name}</p>
          </div>
        </div>

        {!complianceResult ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#E8F4F8] rounded-full mb-4">
                  <FileText className="w-10 h-10 text-[#003865]" />
                </div>
                <h2 className="text-2xl font-bold text-[#003865] mb-2">
                  Compliance Evaluation Test
                </h2>
                <p className="text-gray-700">
                  Please select a report year and a case to run the compliance evaluation test
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label htmlFor="reportYear" className="block text-sm font-semibold text-[#003865] mb-2">
                    Report Year
                  </label>
                  <select
                    id="reportYear"
                    value={selectedYear || ''}
                    onChange={(e) => {
                      const year = e.target.value ? parseInt(e.target.value) : null;
                      setSelectedYear(year);
                      setSelectedReport(null);
                      setError(null);
                    }}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-[#003865] transition-all text-gray-900 hover:border-gray-400"
                  >
                    <option value="">Select a report year</option>
                    {reportYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="case" className="block text-sm font-semibold text-[#003865] mb-2">
                    Case
                  </label>
                  <select
                    id="case"
                    value={selectedReport?.id || ''}
                    onChange={(e) => {
                      const report = casesForYear.find(r => r.id === e.target.value);
                      setSelectedReport(report || null);
                      setError(null);
                    }}
                    disabled={!selectedYear || casesForYear.length === 0}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-[#003865] transition-all text-gray-900 hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500 disabled:hover:border-gray-300"
                  >
                    <option value="">
                      {!selectedYear
                        ? 'Please select a report year first'
                        : casesForYear.length === 0
                        ? 'No cases available for this year'
                        : 'Select a case'
                      }
                    </option>
                    {casesForYear.map((report) => (
                      <option key={report.id} value={report.id}>
                        Case {report.case_number}: {report.case_description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleRunEvaluation}
                    disabled={!selectedReport || analyzing}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#003865] text-white font-semibold rounded-lg hover:bg-[#004d7a] transition-all shadow-md hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500 disabled:shadow-none"
                  >
                    {analyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Running Evaluation...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Run Compliance Evaluation
                      </>
                    )}
                  </button>
                </div>
              </div>

              {reportYears.length === 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    No reports found for this jurisdiction. Please create a report first from the Reports page.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#003865] mb-1">Compliance Report</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="font-medium">Jurisdiction:</span>
                  <span>{jurisdiction.name}</span>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Report Year:</span>
                    <span>{selectedReport?.report_year}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Case:</span>
                    <span>#{selectedReport?.case_number} - {selectedReport?.case_status}</span>
                  </div>
                </div>
              </div>

              {contacts.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-[#003865] mb-3">Contact Information</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-300 bg-gray-50">
                          <th className="text-left py-3 px-3 font-bold text-[#003865]">Name</th>
                          <th className="text-left py-3 px-3 font-bold text-[#003865]">Title</th>
                          <th className="text-left py-3 px-3 font-bold text-[#003865]">Phone</th>
                          <th className="text-left py-3 px-3 font-bold text-[#003865]">Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {contacts.map((contact) => (
                          <tr key={contact.id} className="border-b border-gray-100">
                            <td className="py-2 px-3 text-gray-900">{contact.name}</td>
                            <td className="py-2 px-3 text-gray-700">{contact.title}</td>
                            <td className="py-2 px-3 text-gray-700">{contact.phone}</td>
                            <td className="py-2 px-3 text-gray-700">{contact.email}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 leading-relaxed">
                  The statistical analysis, salary range and exceptional service pay test results are shown below.
                  Part I is general information from your pay equity Report data. Parts II, III and IV give you the test results.
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  For more detail on each test, refer to the guidebook.
                </p>
              </div>
            </div>

            <ComplianceResults
              results={complianceResult}
              onBack={handleViewAnotherCase}
              reportYear={selectedReport?.report_year || 0}
              showBackButton={false}
              jobs={jobs}
            />

            <div className="flex justify-center gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white font-semibold rounded-lg hover:bg-[#004d7a] transition-all shadow-md hover:shadow-lg"
              >
                <Printer className="w-5 h-5" />
                Print Report
              </button>
              <button
                onClick={handleViewAnotherCase}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all shadow-md hover:shadow-lg"
              >
                View Another Case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
