import { useState, useEffect } from 'react';
import { ArrowLeft, Mail, AlertTriangle, Calendar } from 'lucide-react';
import { supabase, type Jurisdiction, type Report } from '../lib/supabase';
import { AnnouncementJurisdictionList } from './AnnouncementJurisdictionList';
import { FailToReportJurisdictionList } from './FailToReportJurisdictionList';

type SendEmailProps = {
  onBack: () => void;
};

type EmailView = 'select' | 'announcement' | 'fail_to_report';

export function SendEmail({ onBack }: SendEmailProps) {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [currentView, setCurrentView] = useState<EmailView>('select');
  const [jurisdictionCounts, setJurisdictionCounts] = useState({
    announcement: 0,
    failToReport: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      loadJurisdictionCounts();
    }
  }, [selectedYear]);

  async function loadAvailableYears() {
    try {
      const { data: reports, error } = await supabase
        .from('reports')
        .select('report_year');

      if (error) throw error;

      const { data: jurisdictions, error: jurisdictionsError } = await supabase
        .from('jurisdictions')
        .select('next_report_year');

      if (jurisdictionsError) throw jurisdictionsError;

      const years = new Set<number>();
      const currentYear = new Date().getFullYear();

      for (let i = -2; i <= 2; i++) {
        years.add(currentYear + i);
      }

      reports?.forEach((r) => r.report_year && years.add(r.report_year));
      jurisdictions?.forEach((j) => j.next_report_year && years.add(j.next_report_year));

      const sortedYears = Array.from(years).sort((a, b) => b - a);
      setAvailableYears(sortedYears);
    } catch (error) {
      console.error('Error loading years:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadJurisdictionCounts() {
    try {
      const { data: jurisdictions, error: jurisdictionsError } = await supabase
        .from('jurisdictions')
        .select('id, next_report_year');

      if (jurisdictionsError) throw jurisdictionsError;

      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('jurisdiction_id, report_year, case_status')
        .eq('report_year', selectedYear);

      if (reportsError) throw reportsError;

      const jurisdictionsWithReports = new Set(
        reports?.filter((r) => r.case_status === 'Submitted').map((r) => r.jurisdiction_id) || []
      );

      const jurisdictionsForYear = jurisdictions?.filter(
        (j) => j.next_report_year === selectedYear
      ) || [];

      const failToReportCount = jurisdictionsForYear.filter(
        (j) => !jurisdictionsWithReports.has(j.id)
      ).length;

      setJurisdictionCounts({
        announcement: jurisdictionsForYear.length,
        failToReport: failToReportCount,
      });
    } catch (error) {
      console.error('Error loading jurisdiction counts:', error);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003865]"></div>
        </div>
      </div>
    );
  }

  if (currentView === 'announcement') {
    return (
      <AnnouncementJurisdictionList
        selectedYear={selectedYear}
        onBack={() => setCurrentView('select')}
      />
    );
  }

  if (currentView === 'fail_to_report') {
    return (
      <FailToReportJurisdictionList
        selectedYear={selectedYear}
        onBack={() => setCurrentView('select')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Send Email</h1>
          <p className="text-sm text-gray-600">
            Send report reminders and compliance notices to jurisdictions
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4" />
            Select Report Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Choose the report year for which you want to send communications
          </p>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Email Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setCurrentView('announcement')}
              className="flex flex-col items-start p-6 border-2 border-gray-200 rounded-lg hover:border-[#003865] hover:bg-blue-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Mail className="w-6 h-6 text-[#003865]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Announcement Reminders
                  </h3>
                  <p className="text-sm text-gray-600">
                    {jurisdictionCounts.announcement} jurisdiction{jurisdictionCounts.announcement !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Send reminders to jurisdictions that have reports due for {selectedYear}.
                Select which jurisdictions to notify about upcoming deadlines.
              </p>
            </button>

            <button
              onClick={() => setCurrentView('fail_to_report')}
              className="flex flex-col items-start p-6 border-2 border-gray-200 rounded-lg hover:border-red-500 hover:bg-red-50 transition-all group text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Fail to Report Notices
                  </h3>
                  <p className="text-sm text-gray-600">
                    {jurisdictionCounts.failToReport} jurisdiction{jurisdictionCounts.failToReport !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Send official notices to jurisdictions that have not submitted reports for {selectedYear}.
                These are compliance warnings.
              </p>
            </button>
          </div>
        </div>

        {jurisdictionCounts.announcement === 0 && jurisdictionCounts.failToReport === 0 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              No jurisdictions found with reports due or missing for {selectedYear}.
              Try selecting a different year.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">About Email Communications</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Emails are sent to the primary contact for each jurisdiction</li>
          <li>You can customize the subject and message before sending</li>
          <li>All email communications are logged for compliance tracking</li>
          <li>Fail to Report notices are official compliance warnings</li>
        </ul>
      </div>
    </div>
  );
}
