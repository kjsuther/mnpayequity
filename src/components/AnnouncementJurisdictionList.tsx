import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Mail, CheckSquare, Square } from 'lucide-react';
import { supabase, type Jurisdiction, type Contact } from '../lib/supabase';
import { EmailComposer } from './EmailComposer';

type AnnouncementJurisdictionListProps = {
  selectedYear: number;
  onBack: () => void;
};

type JurisdictionWithContact = {
  jurisdiction: Jurisdiction;
  contact: Contact | null;
};

export function AnnouncementJurisdictionList({
  selectedYear,
  onBack,
}: AnnouncementJurisdictionListProps) {
  const [jurisdictions, setJurisdictions] = useState<JurisdictionWithContact[]>([]);
  const [filteredJurisdictions, setFilteredJurisdictions] = useState<JurisdictionWithContact[]>([]);
  const [selectedJurisdictions, setSelectedJurisdictions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    loadJurisdictions();
  }, [selectedYear]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredJurisdictions(jurisdictions);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredJurisdictions(
        jurisdictions.filter(
          (jc) =>
            jc.jurisdiction.name.toLowerCase().includes(term) ||
            jc.jurisdiction.jurisdiction_id.toLowerCase().includes(term) ||
            jc.contact?.name.toLowerCase().includes(term) ||
            jc.contact?.email.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, jurisdictions]);

  async function loadJurisdictions() {
    try {
      setLoading(true);

      const { data: jurisdictionsData, error: jurisdictionsError } = await supabase
        .from('jurisdictions')
        .select('*')
        .eq('next_report_year', selectedYear)
        .order('name');

      if (jurisdictionsError) throw jurisdictionsError;

      const jurisdictionsWithContacts: JurisdictionWithContact[] = [];

      for (const jurisdiction of jurisdictionsData || []) {
        const { data: contacts, error: contactsError } = await supabase
          .from('contacts')
          .select('*')
          .eq('jurisdiction_id', jurisdiction.id)
          .eq('is_primary', true)
          .maybeSingle();

        if (contactsError) {
          console.error('Error loading contact:', contactsError);
        }

        jurisdictionsWithContacts.push({
          jurisdiction,
          contact: contacts || null,
        });
      }

      setJurisdictions(jurisdictionsWithContacts);
      setFilteredJurisdictions(jurisdictionsWithContacts);

      const allIds = new Set(jurisdictionsWithContacts.map((jc) => jc.jurisdiction.id));
      setSelectedJurisdictions(allIds);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
      alert('Error loading jurisdictions. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelectAll() {
    if (selectedJurisdictions.size === filteredJurisdictions.length) {
      setSelectedJurisdictions(new Set());
    } else {
      const allIds = new Set(filteredJurisdictions.map((jc) => jc.jurisdiction.id));
      setSelectedJurisdictions(allIds);
    }
  }

  function toggleJurisdiction(jurisdictionId: string) {
    const newSelected = new Set(selectedJurisdictions);
    if (newSelected.has(jurisdictionId)) {
      newSelected.delete(jurisdictionId);
    } else {
      newSelected.add(jurisdictionId);
    }
    setSelectedJurisdictions(newSelected);
  }

  function handleProceedToComposer() {
    if (selectedJurisdictions.size === 0) {
      alert('Please select at least one jurisdiction to send emails to.');
      return;
    }
    setShowComposer(true);
  }

  if (showComposer) {
    const selectedJurisdictionsData = jurisdictions.filter((jc) =>
      selectedJurisdictions.has(jc.jurisdiction.id)
    );

    return (
      <EmailComposer
        emailType="announcement"
        reportYear={selectedYear}
        selectedJurisdictions={selectedJurisdictionsData}
        onBack={() => setShowComposer(false)}
        onCancel={onBack}
      />
    );
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
          <h1 className="text-2xl font-bold text-gray-900">Announcement Jurisdiction List</h1>
          <p className="text-sm text-gray-600">
            Reports for the following {jurisdictions.length} jurisdiction{jurisdictions.length !== 1 ? 's' : ''} are due for year {selectedYear}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-4">
            Please fill out the subject and message body for your email announcement. You can unselect a jurisdiction by unchecking the box in front of the ID.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jurisdictions by name, ID, or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 text-sm font-medium text-[#003865] hover:text-[#004d7a] transition-colors"
          >
            {selectedJurisdictions.size === filteredJurisdictions.length ? (
              <CheckSquare className="w-5 h-5" />
            ) : (
              <Square className="w-5 h-5" />
            )}
            Select All
          </button>
          <span className="text-sm text-gray-600">
            {selectedJurisdictions.size} of {filteredJurisdictions.length} selected
          </span>
        </div>

        {filteredJurisdictions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Mail className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">No jurisdictions found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Select</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Primary Contact</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                </tr>
              </thead>
              <tbody>
                {filteredJurisdictions.map((jc) => (
                  <tr
                    key={jc.jurisdiction.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <button
                        onClick={() => toggleJurisdiction(jc.jurisdiction.id)}
                        className="text-[#003865] hover:text-[#004d7a] transition-colors"
                      >
                        {selectedJurisdictions.has(jc.jurisdiction.id) ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {jc.jurisdiction.jurisdiction_id}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium">
                      {jc.jurisdiction.name}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {jc.jurisdiction.jurisdiction_type}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {jc.contact?.name || (
                        <span className="text-yellow-600">No primary contact</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {jc.contact?.email || (
                        <span className="text-yellow-600">No email</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleProceedToComposer}
            disabled={selectedJurisdictions.size === 0}
            className="flex items-center gap-2 px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Mail className="w-4 h-4" />
            Compose Email ({selectedJurisdictions.size})
          </button>
        </div>
      </div>
    </div>
  );
}
