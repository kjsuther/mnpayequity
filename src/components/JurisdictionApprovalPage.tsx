import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Filter, Search, History, Mail, AlertCircle } from 'lucide-react';
import { supabase, type Jurisdiction, type Contact, type JurisdictionStatusHistory } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type JurisdictionApprovalPageProps = {
  onBack: () => void;
};

type JurisdictionWithContact = {
  jurisdiction: Jurisdiction;
  contact: Contact | null;
  history: JurisdictionStatusHistory[];
};

type FilterType = 'all' | 'pending' | 'approved' | 'rejected';

export function JurisdictionApprovalPage({ onBack }: JurisdictionApprovalPageProps) {
  const { userProfile } = useAuth();
  const [jurisdictions, setJurisdictions] = useState<JurisdictionWithContact[]>([]);
  const [filteredJurisdictions, setFilteredJurisdictions] = useState<JurisdictionWithContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterType>('pending');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<JurisdictionWithContact | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadJurisdictions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jurisdictions, searchTerm, statusFilter]);

  async function loadJurisdictions() {
    try {
      setLoading(true);
      const { data: jurisdictionsData, error: jurisdictionsError } = await supabase
        .from('jurisdictions')
        .select('*')
        .order('name');

      if (jurisdictionsError) throw jurisdictionsError;

      const jurisdictionsWithDetails: JurisdictionWithContact[] = [];

      for (const jurisdiction of jurisdictionsData || []) {
        const { data: contact } = await supabase
          .from('contacts')
          .select('*')
          .eq('jurisdiction_id', jurisdiction.id)
          .eq('is_primary', true)
          .maybeSingle();

        const { data: history } = await supabase
          .from('jurisdiction_status_history')
          .select('*')
          .eq('jurisdiction_id', jurisdiction.id)
          .order('created_at', { ascending: false });

        jurisdictionsWithDetails.push({
          jurisdiction,
          contact: contact || null,
          history: history || [],
        });
      }

      setJurisdictions(jurisdictionsWithDetails);
    } catch (error) {
      console.error('Error loading jurisdictions:', error);
      setError('Failed to load jurisdictions. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = jurisdictions;

    if (statusFilter !== 'all') {
      filtered = filtered.filter((jc) => jc.jurisdiction.approval_status === statusFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (jc) =>
          jc.jurisdiction.name.toLowerCase().includes(term) ||
          jc.jurisdiction.jurisdiction_id.toLowerCase().includes(term) ||
          jc.contact?.name.toLowerCase().includes(term) ||
          jc.contact?.email.toLowerCase().includes(term)
      );
    }

    setFilteredJurisdictions(filtered);
  }

  async function handleApprove(jurisdiction: JurisdictionWithContact) {
    setSelectedJurisdiction(jurisdiction);
    setStatusNotes('');
    setShowApprovalModal(true);
  }

  async function handleReject(jurisdiction: JurisdictionWithContact) {
    setSelectedJurisdiction(jurisdiction);
    setRejectionReason('');
    setStatusNotes('');
    setShowRejectionModal(true);
  }

  async function confirmApproval() {
    if (!selectedJurisdiction || !userProfile) return;

    setProcessing(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('jurisdictions')
        .update({
          approval_status: 'approved',
          approved_by: userProfile.email,
          approved_at: new Date().toISOString(),
          rejection_reason: null,
          status_notes: statusNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedJurisdiction.jurisdiction.id);

      if (updateError) throw updateError;

      if (selectedJurisdiction.contact?.email) {
        await sendApprovalEmail(selectedJurisdiction);
      }

      setSuccess(`${selectedJurisdiction.jurisdiction.name} has been approved successfully!`);
      setShowApprovalModal(false);
      await loadJurisdictions();

      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error approving jurisdiction:', error);
      setError(error.message || 'Failed to approve jurisdiction. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function confirmRejection() {
    if (!selectedJurisdiction || !userProfile || !rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from('jurisdictions')
        .update({
          approval_status: 'rejected',
          approved_by: userProfile.email,
          approved_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
          status_notes: statusNotes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedJurisdiction.jurisdiction.id);

      if (updateError) throw updateError;

      if (selectedJurisdiction.contact?.email) {
        await sendRejectionEmail(selectedJurisdiction);
      }

      setSuccess(`${selectedJurisdiction.jurisdiction.name} status updated.`);
      setShowRejectionModal(false);
      await loadJurisdictions();

      setTimeout(() => setSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error rejecting jurisdiction:', error);
      setError(error.message || 'Failed to update jurisdiction status. Please try again.');
    } finally {
      setProcessing(false);
    }
  }

  async function sendApprovalEmail(jurisdictionWithContact: JurisdictionWithContact) {
    if (!jurisdictionWithContact.contact?.email || !userProfile) return;

    try {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'jurisdiction_approved')
        .eq('is_active', true)
        .maybeSingle();

      if (!template) {
        console.warn('No approval email template found');
        return;
      }

      const subject = template.subject
        .replace('{{jurisdiction_name}}', jurisdictionWithContact.jurisdiction.name)
        .replace('{{jurisdiction_id}}', jurisdictionWithContact.jurisdiction.jurisdiction_id);

      const body = template.body
        .replace(/{{contact_name}}/g, jurisdictionWithContact.contact.name)
        .replace(/{{jurisdiction_name}}/g, jurisdictionWithContact.jurisdiction.name)
        .replace(/{{jurisdiction_id}}/g, jurisdictionWithContact.jurisdiction.jurisdiction_id)
        .replace(/{{notes}}/g, statusNotes || '');

      await supabase.from('email_logs').insert({
        email_type: 'jurisdiction_approved',
        report_year: new Date().getFullYear(),
        jurisdiction_id: jurisdictionWithContact.jurisdiction.id,
        recipient_email: jurisdictionWithContact.contact.email,
        recipient_name: jurisdictionWithContact.contact.name,
        subject,
        body,
        sent_by: userProfile.email,
        delivery_status: 'sent',
      });
    } catch (error) {
      console.error('Error logging approval email:', error);
    }
  }

  async function sendRejectionEmail(jurisdictionWithContact: JurisdictionWithContact) {
    if (!jurisdictionWithContact.contact?.email || !userProfile) return;

    try {
      const { data: template } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', 'jurisdiction_rejected')
        .eq('is_active', true)
        .maybeSingle();

      if (!template) {
        console.warn('No rejection email template found');
        return;
      }

      const subject = template.subject
        .replace('{{jurisdiction_name}}', jurisdictionWithContact.jurisdiction.name)
        .replace('{{jurisdiction_id}}', jurisdictionWithContact.jurisdiction.jurisdiction_id);

      const body = template.body
        .replace(/{{contact_name}}/g, jurisdictionWithContact.contact.name)
        .replace(/{{jurisdiction_name}}/g, jurisdictionWithContact.jurisdiction.name)
        .replace(/{{jurisdiction_id}}/g, jurisdictionWithContact.jurisdiction.jurisdiction_id)
        .replace(/{{rejection_reason}}/g, rejectionReason)
        .replace(/{{notes}}/g, statusNotes || '');

      await supabase.from('email_logs').insert({
        email_type: 'jurisdiction_rejected',
        report_year: new Date().getFullYear(),
        jurisdiction_id: jurisdictionWithContact.jurisdiction.id,
        recipient_email: jurisdictionWithContact.contact.email,
        recipient_name: jurisdictionWithContact.contact.name,
        subject,
        body,
        sent_by: userProfile.email,
        delivery_status: 'sent',
      });
    } catch (error) {
      console.error('Error logging rejection email:', error);
    }
  }

  function handleViewHistory(jurisdiction: JurisdictionWithContact) {
    setSelectedJurisdiction(jurisdiction);
    setShowHistoryModal(true);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            <CheckCircle size={12} />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
            <XCircle size={12} />
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
            <Clock size={12} />
            Pending
          </span>
        );
      default:
        return null;
    }
  };

  const pendingCount = jurisdictions.filter((j) => j.jurisdiction.approval_status === 'pending').length;
  const approvedCount = jurisdictions.filter((j) => j.jurisdiction.approval_status === 'approved').length;
  const rejectedCount = jurisdictions.filter((j) => j.jurisdiction.approval_status === 'rejected').length;

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-[#003865] hover:text-[#78BE21] transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Jurisdiction Approval Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              Review and approve or reject jurisdiction applications
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-6 mt-6 flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mx-6 mt-6 flex items-start gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-green-800">{success}</span>
          </div>
        )}

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-800 font-medium">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-800 font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-900">{approvedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-800 font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-red-900">{rejectedCount}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, ID, contact..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterType)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jurisdiction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJurisdictions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No jurisdictions found
                    </td>
                  </tr>
                ) : (
                  filteredJurisdictions.map((jc) => (
                    <tr key={jc.jurisdiction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{jc.jurisdiction.name}</div>
                          <div className="text-sm text-gray-500">ID: {jc.jurisdiction.jurisdiction_id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {jc.jurisdiction.jurisdiction_type}
                      </td>
                      <td className="px-6 py-4">
                        {jc.contact ? (
                          <div>
                            <div className="text-sm text-gray-900">{jc.contact.name}</div>
                            <div className="text-sm text-gray-500">{jc.contact.email}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No contact</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(jc.jurisdiction.approval_status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {jc.jurisdiction.approval_status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApprove(jc)}
                                className="text-green-600 hover:text-green-800 transition-colors"
                                title="Approve"
                              >
                                <CheckCircle size={18} />
                              </button>
                              <button
                                onClick={() => handleReject(jc)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Reject"
                              >
                                <XCircle size={18} />
                              </button>
                            </>
                          )}
                          {jc.history.length > 0 && (
                            <button
                              onClick={() => handleViewHistory(jc)}
                              className="text-[#003865] hover:text-[#78BE21] transition-colors"
                              title="View History"
                            >
                              <History size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showApprovalModal && selectedJurisdiction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-semibold text-gray-900">Approve Jurisdiction</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to approve <strong>{selectedJurisdiction.jurisdiction.name}</strong>?
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  placeholder="Add any notes for this approval..."
                />
              </div>

              {selectedJurisdiction.contact?.email && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    An approval notification will be sent to {selectedJurisdiction.contact.email}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowApprovalModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showRejectionModal && selectedJurisdiction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center gap-3 p-6 border-b border-gray-200">
              <XCircle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-semibold text-gray-900">Update Jurisdiction Status</h3>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Update status for <strong>{selectedJurisdiction.jurisdiction.name}</strong>
              </p>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  placeholder="Explain why this requires attention..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
                  placeholder="Add any additional notes..."
                />
              </div>

              {selectedJurisdiction.contact?.email && (
                <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    A notification will be sent to {selectedJurisdiction.contact.email}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRejectionModal(false)}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRejection}
                  disabled={processing || !rejectionReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showHistoryModal && selectedJurisdiction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <History className="w-6 h-6 text-[#003865]" />
                <h3 className="text-xl font-semibold text-gray-900">Status History</h3>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900">{selectedJurisdiction.jurisdiction.name}</h4>
                <p className="text-sm text-gray-600">ID: {selectedJurisdiction.jurisdiction.jurisdiction_id}</p>
              </div>

              <div className="space-y-4">
                {selectedJurisdiction.history.map((record, index) => (
                  <div key={record.id} className="border-l-4 border-[#003865] pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      {record.new_status === 'approved' && (
                        <CheckCircle size={16} className="text-green-600" />
                      )}
                      {record.new_status === 'rejected' && <XCircle size={16} className="text-red-600" />}
                      {record.new_status === 'pending' && <Clock size={16} className="text-yellow-600" />}
                      <span className="font-medium text-gray-900 capitalize">
                        {record.old_status ? `${record.old_status} → ${record.new_status}` : record.new_status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Changed by: <span className="font-medium">{record.changed_by}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.created_at).toLocaleString()}
                    </p>
                    {record.change_reason && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Reason:</strong> {record.change_reason}
                      </p>
                    )}
                    {record.notes && (
                      <p className="text-sm text-gray-700 mt-1">
                        <strong>Notes:</strong> {record.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
