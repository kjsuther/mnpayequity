import { useState, useEffect } from 'react';
import { ArrowLeft, Send, Eye, Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase, type Jurisdiction, type Contact, type EmailTemplate } from '../lib/supabase';

type JurisdictionWithContact = {
  jurisdiction: Jurisdiction;
  contact: Contact | null;
};

type EmailComposerProps = {
  emailType: 'announcement' | 'fail_to_report';
  reportYear: number;
  selectedJurisdictions: JurisdictionWithContact[];
  onBack: () => void;
  onCancel: () => void;
};

export function EmailComposer({
  emailType,
  reportYear,
  selectedJurisdictions,
  onBack,
  onCancel,
}: EmailComposerProps) {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewJurisdiction, setPreviewJurisdiction] = useState<JurisdictionWithContact | null>(
    null
  );
  const [sendComplete, setSendComplete] = useState(false);

  useEffect(() => {
    loadTemplate();
  }, [emailType]);

  async function loadTemplate() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .eq('type', emailType)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setTemplate(data);
        setSubject(data.subject.replace('{{year}}', reportYear.toString()));
        setBody(data.body);
      }
    } catch (error) {
      console.error('Error loading template:', error);
    } finally {
      setLoading(false);
    }
  }

  function replaceMergeFields(text: string, jc: JurisdictionWithContact): string {
    return text
      .replace(/\{\{year\}\}/g, reportYear.toString())
      .replace(/\{\{jurisdiction_name\}\}/g, jc.jurisdiction.name)
      .replace(/\{\{contact_name\}\}/g, jc.contact?.name || 'Contact')
      .replace(/\{\{jurisdiction_id\}\}/g, jc.jurisdiction.jurisdiction_id);
  }

  function handlePreview() {
    if (selectedJurisdictions.length > 0) {
      setPreviewJurisdiction(selectedJurisdictions[0]);
      setShowPreview(true);
    }
  }

  async function handleSendEmails() {
    if (!subject.trim() || !body.trim()) {
      alert('Please fill in both subject and message body.');
      return;
    }

    const jurisdictionsWithoutEmail = selectedJurisdictions.filter((jc) => !jc.contact?.email);

    if (jurisdictionsWithoutEmail.length > 0) {
      const names = jurisdictionsWithoutEmail.map((jc) => jc.jurisdiction.name).join(', ');
      if (
        !confirm(
          `The following jurisdictions do not have a primary contact email: ${names}\n\nDo you want to proceed with sending emails to the remaining jurisdictions?`
        )
      ) {
        return;
      }
    }

    const validJurisdictions = selectedJurisdictions.filter((jc) => jc.contact?.email);

    if (validJurisdictions.length === 0) {
      alert('No jurisdictions with valid email addresses to send to.');
      return;
    }

    if (
      !confirm(
        `You are about to send ${emailType === 'announcement' ? 'announcement reminders' : 'fail to report notices'} to ${validJurisdictions.length} jurisdiction${validJurisdictions.length !== 1 ? 's' : ''}.\n\nAre you sure you want to proceed?`
      )
    ) {
      return;
    }

    try {
      setSending(true);

      const emailLogs = validJurisdictions.map((jc) => ({
        email_type: emailType,
        report_year: reportYear,
        jurisdiction_id: jc.jurisdiction.id,
        recipient_email: jc.contact!.email,
        recipient_name: jc.contact!.name,
        subject: replaceMergeFields(subject, jc),
        body: replaceMergeFields(body, jc),
        delivery_status: 'sent' as const,
        sent_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('email_logs').insert(emailLogs);

      if (error) throw error;

      setSendComplete(true);
    } catch (error) {
      console.error('Error sending emails:', error);
      alert('Error sending emails. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (sendComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Emails Sent Successfully</h2>
            <p className="text-gray-600 mb-6">
              {selectedJurisdictions.filter((jc) => jc.contact?.email).length} email
              {selectedJurisdictions.filter((jc) => jc.contact?.email).length !== 1 ? 's have' : ' has'} been sent
              and logged for compliance tracking.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onCancel}
                className="px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
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

  if (showPreview && previewJurisdiction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Preview</h1>
            <p className="text-sm text-gray-600">
              Preview for {previewJurisdiction.jurisdiction.name}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="mb-4 pb-4 border-b border-gray-200">
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
              <span className="font-semibold text-gray-700">To:</span>
              <span className="text-gray-900">
                {previewJurisdiction.contact?.email || 'No email'}
              </span>
              <span className="font-semibold text-gray-700">Subject:</span>
              <span className="text-gray-900">
                {replaceMergeFields(subject, previewJurisdiction)}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900">
              {replaceMergeFields(body, previewJurisdiction)}
            </pre>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              This is a preview for the first selected jurisdiction. The actual emails will be
              personalized for each recipient.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            onClick={() => setShowPreview(false)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Edit
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Compose Email</h1>
          <p className="text-sm text-gray-600">
            {emailType === 'announcement' ? 'Report Announcement' : 'Fail to Report Notice'} for{' '}
            {reportYear}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Recipients</h3>
            <p className="text-sm text-blue-800 mt-1">
              This email will be sent to {selectedJurisdictions.length} jurisdiction
              {selectedJurisdictions.length !== 1 ? 's' : ''}. Each email will be personalized with
              the jurisdiction's information.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Line <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use merge fields: {'{'}
              {'{'}year{'}'} {'{'}
              {'{'}jurisdiction_name{'}'} {'{'}
              {'{'}contact_name{'}'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Body <span className="text-red-500">*</span>
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Enter email message"
              rows={12}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003865] focus:border-transparent font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Available merge fields: {'{'}
              {'{'}year{'}'}, {'{'}
              {'{'}jurisdiction_name{'}'}, {'{'}
              {'{'}contact_name{'}'}
            </p>
          </div>
        </div>

        {selectedJurisdictions.filter((jc) => !jc.contact?.email).length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {selectedJurisdictions.filter((jc) => !jc.contact?.email).length} jurisdiction
                  {selectedJurisdictions.filter((jc) => !jc.contact?.email).length !== 1 ? 's do' : ' does'} not
                  have a primary contact email and will be skipped.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePreview}
            className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button
            onClick={handleSendEmails}
            disabled={sending || !subject.trim() || !body.trim()}
            className="flex items-center gap-2 px-6 py-2 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Emails ({selectedJurisdictions.filter((jc) => jc.contact?.email).length})
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
