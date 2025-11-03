import { useEffect, useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { JurisdictionSearch } from './JurisdictionSearch';
import { JurisdictionForm } from './JurisdictionForm';
import { ContactList } from './ContactList';
import { ContactModal } from './ContactModal';
import { AddJurisdictionModal } from './AddJurisdictionModal';
import { ActionButtons } from './ActionButtons';
import { ReportManagement } from './ReportManagement';
import { Dashboard } from './Dashboard';
import { ChangePassword } from './ChangePassword';
import { SendEmail } from './SendEmail';
import { Notes } from './Notes';
import { ComplianceResults } from './ComplianceResults';
import { JobsPage } from './JobsPage';
import { TestResultsPage } from './TestResultsPage';
import { JobDataEntryListPage } from './JobDataEntryListPage';
import { ComplianceReportPage } from './ComplianceReportPage';
import { PredictedPayReportPage } from './PredictedPayReportPage';
import { ImplementationReportPage } from './ImplementationReportPage';
import { WelcomeTutorial } from './WelcomeTutorial';
import { HelpCenter } from './HelpCenter';
import { DataGatheringGuide } from './DataGatheringGuide';
import { supabase, type Jurisdiction, type Contact, type Report, type JobClassification, type ImplementationReport } from '../lib/supabase';
import { analyzeCompliance, type ComplianceResult } from '../lib/complianceAnalysis';

export function MainApp() {
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [currentJurisdiction, setCurrentJurisdiction] = useState<Jurisdiction | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'reports' | 'changePassword' | 'sendEmail' | 'jobs' | 'testResults' | 'jurisdictionLookup' | 'notes' | 'reportView' | 'dataGuide'>('home');
  const [reportViewType, setReportViewType] = useState<'jobDataEntry' | 'compliance' | 'predictedPay' | 'implementation' | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isAddJurisdictionModalOpen, setIsAddJurisdictionModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobClassification[]>([]);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [implementationData, setImplementationData] = useState<ImplementationReport | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);

  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('payEquityTutorialCompleted');
    if (!tutorialCompleted) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    loadJurisdictions();
  }, []);

  useEffect(() => {
    if (currentJurisdiction) {
      loadContacts(currentJurisdiction.id);
      loadReports(currentJurisdiction.id);
    } else {
      setContacts([]);
      setReports([]);
    }
  }, [currentJurisdiction]);

  useEffect(() => {
    if (selectedReport) {
      loadJobs(selectedReport.id);
      loadImplementationData(selectedReport.id);
    } else {
      setJobs([]);
      setComplianceResult(null);
      setImplementationData(null);
    }
  }, [selectedReport]);

  useEffect(() => {
    if (jobs.length > 0 && selectedReport) {
      const result = analyzeCompliance(jobs);
      setComplianceResult(result);
    }
  }, [jobs, selectedReport]);

  async function loadReports(jurisdictionId: string) {
    try {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .eq('jurisdiction_id', jurisdictionId)
        .order('report_year', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
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

  async function loadJurisdictions() {
    try {
      const { data, error } = await supabase
        .from('jurisdictions')
        .select('*')
        .order('name');

      if (error) throw error;

      setJurisdictions(data || []);

      if (data && data.length > 0) {
        setCurrentJurisdiction(data[0]);
      }
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
      alert('Error loading jurisdictions. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  async function loadContacts(jurisdictionId: string) {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('jurisdiction_id', jurisdictionId)
        .order('is_primary', { ascending: false })
        .order('name');

      if (error) throw error;

      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  }

  function handleJurisdictionChange(jurisdiction: Jurisdiction) {
    setCurrentJurisdiction(jurisdiction);
  }

  function handleJurisdictionFieldChange(field: keyof Jurisdiction, value: string | number) {
    if (!currentJurisdiction) return;

    setCurrentJurisdiction({
      ...currentJurisdiction,
      [field]: value,
    });
  }

  async function handleModifyJurisdiction() {
    if (!currentJurisdiction) return;

    try {
      const { error } = await supabase
        .from('jurisdictions')
        .update({
          jurisdiction_id: currentJurisdiction.jurisdiction_id,
          name: currentJurisdiction.name,
          address: currentJurisdiction.address,
          city: currentJurisdiction.city,
          state: currentJurisdiction.state,
          zipcode: currentJurisdiction.zipcode,
          phone: currentJurisdiction.phone,
          fax: currentJurisdiction.fax,
          jurisdiction_type: currentJurisdiction.jurisdiction_type,
          next_report_year: currentJurisdiction.next_report_year,
          follow_up_type: currentJurisdiction.follow_up_type,
          follow_up_date: currentJurisdiction.follow_up_date,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentJurisdiction.id);

      if (error) throw error;

      alert('Jurisdiction updated successfully!');
      await loadJurisdictions();
    } catch (error) {
      console.error('Error updating jurisdiction:', error);
      alert('Error updating jurisdiction. Please try again.');
    }
  }

  function handleAddJurisdiction() {
    setIsAddJurisdictionModalOpen(true);
  }

  async function handleSaveJurisdiction(jurisdictionData: Partial<Jurisdiction>) {
    try {
      const { data, error } = await supabase
        .from('jurisdictions')
        .insert([
          {
            jurisdiction_id: jurisdictionData.jurisdiction_id,
            name: jurisdictionData.name,
            address: jurisdictionData.address || '',
            city: jurisdictionData.city || '',
            state: jurisdictionData.state || 'MN',
            zipcode: jurisdictionData.zipcode || '',
            phone: jurisdictionData.phone || '',
            fax: jurisdictionData.fax || '',
            jurisdiction_type: jurisdictionData.jurisdiction_type || '',
            next_report_year: jurisdictionData.next_report_year || null,
            follow_up_type: jurisdictionData.follow_up_type || '',
            follow_up_date: jurisdictionData.follow_up_date || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      alert('Jurisdiction added successfully!');
      await loadJurisdictions();
      if (data) {
        setCurrentJurisdiction(data);
      }
    } catch (error) {
      console.error('Error adding jurisdiction:', error);
      alert('Error adding jurisdiction. Please try again.');
      throw error;
    }
  }

  function handleExportContacts() {
    if (!currentJurisdiction || contacts.length === 0) {
      alert('No contacts to export');
      return;
    }

    const csv = [
      ['Name', 'Title', 'Primary', 'Email', 'Phone'],
      ...contacts.map((c) => [
        c.name,
        c.title,
        c.is_primary ? 'Yes' : 'No',
        c.email,
        c.phone,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentJurisdiction.name}_contacts.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  function handleAddContact() {
    if (!currentJurisdiction) {
      alert('Please select a jurisdiction first');
      return;
    }
    setEditingContact(null);
    setIsContactModalOpen(true);
  }

  function handleEditContact(contact: Contact) {
    setEditingContact(contact);
    setIsContactModalOpen(true);
  }

  async function handleSaveContact(contactData: Partial<Contact>) {
    if (!currentJurisdiction) return;

    try {
      if (editingContact) {
        const { error } = await supabase
          .from('contacts')
          .update({
            name: contactData.name,
            title: contactData.title,
            email: contactData.email,
            phone: contactData.phone,
            is_primary: contactData.is_primary,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingContact.id);

        if (error) throw error;
        alert('Contact updated successfully!');
      } else {
        const { error } = await supabase
          .from('contacts')
          .insert([
            {
              jurisdiction_id: currentJurisdiction.id,
              name: contactData.name || '',
              title: contactData.title || '',
              email: contactData.email || '',
              phone: contactData.phone || '',
              is_primary: contactData.is_primary || false,
            },
          ]);

        if (error) throw error;
        alert('Contact added successfully!');
      }

      await loadContacts(currentJurisdiction.id);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('Error saving contact. Please try again.');
    }
  }

  async function handleDeleteContact(contactId: string) {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;

      alert('Contact deleted successfully!');
      if (currentJurisdiction) {
        await loadContacts(currentJurisdiction.id);
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('Error deleting contact. Please try again.');
    }
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

  function handleNavigate(view: 'home' | 'dashboard' | 'reports' | 'changePassword' | 'sendEmail' | 'jobs' | 'testResults' | 'jurisdictionLookup' | 'notes' | 'reportView' | 'dataGuide') {
    if (view === 'jobs') {
      if (!currentJurisdiction) {
        alert('Please select a jurisdiction first.');
        setCurrentView('home');
        return;
      }
      setCurrentView(view);
      return;
    }
    if (view === 'testResults') {
      if (!currentJurisdiction) {
        alert('Please select a jurisdiction first.');
        setCurrentView('home');
        return;
      }
      setCurrentView(view);
      return;
    }
    if (view === 'jurisdictionLookup') {
      setCurrentView('home');
      return;
    }
    setCurrentView(view);
  }

  function handleNavigateToReportView(reportType: 'jobDataEntry' | 'compliance' | 'predictedPay' | 'implementation') {
    console.log('Navigating to report view:', reportType);
    console.log('Current state:', {
      currentJurisdiction: currentJurisdiction?.name,
      selectedReport: selectedReport?.id,
      jobsCount: jobs.length,
      hasComplianceResult: !!complianceResult,
      hasImplementationData: !!implementationData
    });
    setReportViewType(reportType);
    setCurrentView('reportView');
  }

  function handleBackFromReportView() {
    setReportViewType(null);
    setCurrentView('reports');
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        hasActiveReport={!!selectedReport}
        hasActiveJurisdiction={!!currentJurisdiction}
        onShowHelp={() => setShowHelpCenter(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-6 w-full">
        {currentView === 'changePassword' ? (
          <ChangePassword onBack={() => setCurrentView('home')} />
        ) : currentView === 'sendEmail' ? (
          <SendEmail onBack={() => setCurrentView('home')} />
        ) : currentView === 'notes' && currentJurisdiction ? (
          <Notes jurisdiction={currentJurisdiction} onBack={() => setCurrentView('home')} />
        ) : currentView === 'jobs' && currentJurisdiction ? (
          <JobsPage jurisdiction={currentJurisdiction} onBack={() => setCurrentView('home')} />
        ) : currentView === 'testResults' && currentJurisdiction ? (
          <TestResultsPage
            jurisdiction={currentJurisdiction}
            onBack={() => setCurrentView('home')}
          />
        ) : currentView === 'dataGuide' ? (
          <DataGatheringGuide onBack={() => setCurrentView('home')} />
        ) : currentView === 'dashboard' && currentJurisdiction ? (
          <Dashboard
            jurisdiction={currentJurisdiction}
            reports={reports}
            onManageReports={() => setCurrentView('reports')}
            onViewReport={(report) => {
              setSelectedReport(report);
              setCurrentView('reports');
            }}
            onShowDataGuide={() => setCurrentView('dataGuide')}
          />
        ) : currentView === 'reports' && currentJurisdiction ? (
          <ReportManagement
            jurisdiction={currentJurisdiction}
            selectedReport={selectedReport}
            onBack={() => {
              setSelectedReport(null);
              setCurrentView('home');
            }}
            onNavigateToReportView={handleNavigateToReportView}
            onReportSelect={(report) => setSelectedReport(report)}
          />
        ) : currentView === 'reportView' && currentJurisdiction && selectedReport && reportViewType ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {reportViewType === 'jobDataEntry' && jobs.length > 0 ? (
              <JobDataEntryListPage
                report={selectedReport}
                jurisdiction={currentJurisdiction}
                jobs={jobs}
                onBack={handleBackFromReportView}
              />
            ) : reportViewType === 'compliance' && complianceResult ? (
              <ComplianceReportPage
                report={selectedReport}
                jurisdiction={currentJurisdiction}
                jobs={jobs}
                complianceResult={complianceResult}
                onBack={handleBackFromReportView}
              />
            ) : reportViewType === 'predictedPay' && complianceResult ? (
              <PredictedPayReportPage
                report={selectedReport}
                jurisdiction={currentJurisdiction}
                jobs={jobs}
                complianceResult={complianceResult}
                onBack={handleBackFromReportView}
              />
            ) : reportViewType === 'implementation' && implementationData ? (
              <ImplementationReportPage
                report={selectedReport}
                jurisdiction={currentJurisdiction}
                implementationData={implementationData}
                onBack={handleBackFromReportView}
              />
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Report Not Available</h2>
                <p className="text-gray-600 mb-4">
                  {reportViewType === 'jobDataEntry' && jobs.length === 0 && 'No job data available. Please add jobs first.'}
                  {reportViewType === 'compliance' && !complianceResult && 'No compliance analysis available. Please run compliance analysis first.'}
                  {reportViewType === 'predictedPay' && !complianceResult && 'No compliance analysis available. Please run compliance analysis first.'}
                  {reportViewType === 'implementation' && !implementationData && 'No implementation data available. Please complete the implementation form first.'}
                </p>
                <button
                  onClick={handleBackFromReportView}
                  className="px-4 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
                >
                  Back to Reports
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <JurisdictionSearch
              jurisdictions={jurisdictions}
              currentJurisdiction={currentJurisdiction}
              onJurisdictionChange={handleJurisdictionChange}
            />

            <JurisdictionForm
              jurisdiction={currentJurisdiction}
              onChange={handleJurisdictionFieldChange}
            />

            <ContactList
              contacts={contacts}
              onAddContact={handleAddContact}
              onEditContact={handleEditContact}
              onDeleteContact={handleDeleteContact}
            />

            <ActionButtons
              onAddJurisdiction={handleAddJurisdiction}
              onModifyJurisdiction={handleModifyJurisdiction}
              onExportContacts={handleExportContacts}
              onEnterJobs={() => setCurrentView('reports')}
              hasJurisdiction={!!currentJurisdiction}
            />
          </>
        )}
      </main>

      <Footer />

      <ContactModal
        isOpen={isContactModalOpen}
        contact={editingContact}
        jurisdictionId={currentJurisdiction?.id || ''}
        onClose={() => setIsContactModalOpen(false)}
        onSave={handleSaveContact}
      />

      <AddJurisdictionModal
        isOpen={isAddJurisdictionModalOpen}
        onClose={() => setIsAddJurisdictionModalOpen(false)}
        onSave={handleSaveJurisdiction}
      />

      <WelcomeTutorial
        isOpen={showTutorial}
        onClose={() => {
          setShowTutorial(false);
          localStorage.setItem('payEquityTutorialCompleted', 'true');
        }}
      />

      <HelpCenter
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
        context={currentView}
      />
    </div>
  );
}
