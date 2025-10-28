import { ArrowLeft, FileDown, CheckCircle, XCircle } from 'lucide-react';
import { Report, Jurisdiction, ImplementationReport } from '../lib/supabase';
import jsPDF from 'jspdf';
import { addLogoToPDF, addPageNumbers } from '../lib/pdfGenerator';

type ImplementationReportPageProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  implementationData: ImplementationReport;
  onBack: () => void;
};

export function ImplementationReportPage({ report, jurisdiction, implementationData, onBack }: ImplementationReportPageProps) {
  async function exportToPDF() {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    let yPosition = 30;

    await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

    yPosition = 35;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PAY EQUITY IMPLEMENTATION REPORT', 15, yPosition);

    yPosition += 20;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(jurisdiction.name, 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Report Year: ${report.report_year}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Case: ${report.case_number} - ${report.case_description}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, yPosition);
    yPosition += 25;

    doc.setFont('helvetica', 'bold');
    doc.text('PART A: JURISDICTION IDENTIFICATION', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.text(`Jurisdiction: ${jurisdiction.name}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Type: ${jurisdiction.jurisdiction_type}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Address: ${jurisdiction.address}, ${jurisdiction.city}, ${jurisdiction.state} ${jurisdiction.zipcode}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Phone: ${jurisdiction.phone}`, 15, yPosition);
    yPosition += 25;

    doc.setFont('helvetica', 'bold');
    doc.text('PART B: OFFICIAL VERIFICATION', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.text('1. Job Evaluation System', 15, yPosition);
    yPosition += 12;
    doc.text(`   System: ${implementationData.evaluation_system || 'Not specified'}`, 15, yPosition);
    yPosition += 12;

    if (implementationData.evaluation_description) {
      const evalLines = doc.splitTextToSize(`   Description: ${implementationData.evaluation_description}`, 550);
      doc.text(evalLines, 15, yPosition);
      yPosition += evalLines.length * 12 + 5;
    }
    yPosition += 10;

    doc.text('2. Health Insurance Benefits', 15, yPosition);
    yPosition += 12;
    doc.text(`   Status: ${implementationData.health_benefits_evaluated || 'Not specified'}`, 15, yPosition);
    yPosition += 12;

    if (implementationData.health_benefits_description) {
      const healthLines = doc.splitTextToSize(`   Description: ${implementationData.health_benefits_description}`, 550);
      doc.text(healthLines, 15, yPosition);
      yPosition += healthLines.length * 12 + 5;
    }
    yPosition += 10;

    doc.text('3. Official Notice Posting', 15, yPosition);
    yPosition += 12;
    doc.text(`   Posted at: ${implementationData.notice_location || 'Not specified'}`, 15, yPosition);
    yPosition += 15;
    doc.text(`   Approved by: ${implementationData.approved_by_body || 'Not specified'}`, 15, yPosition);
    yPosition += 12;
    doc.text(`   Chief Elected Official: ${implementationData.chief_elected_official || 'Not specified'}`, 15, yPosition);
    yPosition += 12;
    doc.text(`   Title: ${implementationData.official_title || 'Not specified'}`, 15, yPosition);
    yPosition += 15;
    doc.text(`   Approval Confirmed: ${implementationData.approval_confirmed ? 'YES' : 'NO'}`, 15, yPosition);
    yPosition += 25;

    if (yPosition > 650) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('PART C: TOTAL PAYROLL', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    const payroll = implementationData.total_payroll ? `$${implementationData.total_payroll.toLocaleString()}` : '$0';
    doc.text(`Total Annual Payroll: ${payroll}`, 15, yPosition);
    yPosition += 12;
    doc.text('(for calendar year ended December 31)', 15, yPosition);
    yPosition += 25;

    doc.setFont('helvetica', 'bold');
    doc.text('SUBMISSION INFORMATION', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.text(`Report Status: ${report.case_status}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Compliance Status: ${report.compliance_status || 'Not determined'}`, 15, yPosition);
    yPosition += 12;

    if (report.submitted_at) {
      doc.text(`Submitted: ${new Date(report.submitted_at).toLocaleString()}`, 15, yPosition);
    } else {
      doc.text('Submitted: Not yet submitted', 15, yPosition);
    }

    addPageNumbers(doc);

    doc.save(`${jurisdiction.name}_${report.report_year}_Implementation_Report.pdf`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Reports
        </button>
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 px-6 py-3 bg-[#003865] text-white rounded-lg hover:bg-[#004d7a] transition-colors font-medium"
        >
          <FileDown className="w-5 h-5" />
          Export to PDF
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="mb-6">
          <img src="/MMB_logo copy copy copy.jpg" alt="Management and Budget" className="h-12 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pay Equity Implementation Report</h1>
          <div className="text-gray-600 space-y-1">
            <p className="text-lg font-semibold">{jurisdiction.name}</p>
            <p>Report Year: {report.report_year}</p>
            <p>Case: {report.case_number} - {report.case_description}</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Part A: Jurisdiction Identification</h2>
          <div className="space-y-2 text-gray-700">
            <p><span className="font-semibold">Jurisdiction:</span> {jurisdiction.name}</p>
            <p><span className="font-semibold">Type:</span> {jurisdiction.jurisdiction_type}</p>
            <p><span className="font-semibold">Address:</span> {jurisdiction.address}, {jurisdiction.city}, {jurisdiction.state} {jurisdiction.zipcode}</p>
            <p><span className="font-semibold">Phone:</span> {jurisdiction.phone}</p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Part B: Official Verification</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Job Evaluation System</h3>
              <div className="ml-4 space-y-1 text-gray-700">
                <p><span className="font-semibold">System:</span> {implementationData.evaluation_system || 'Not specified'}</p>
                {implementationData.evaluation_description && (
                  <p><span className="font-semibold">Description:</span> {implementationData.evaluation_description}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Health Insurance Benefits</h3>
              <div className="ml-4 space-y-1 text-gray-700">
                <p><span className="font-semibold">Status:</span> {implementationData.health_benefits_evaluated || 'Not specified'}</p>
                {implementationData.health_benefits_description && (
                  <p><span className="font-semibold">Description:</span> {implementationData.health_benefits_description}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Official Notice Posting</h3>
              <div className="ml-4 space-y-1 text-gray-700">
                <p><span className="font-semibold">Posted at:</span> {implementationData.notice_location || 'Not specified'}</p>
                <p><span className="font-semibold">Approved by:</span> {implementationData.approved_by_body || 'Not specified'}</p>
                <p><span className="font-semibold">Chief Elected Official:</span> {implementationData.chief_elected_official || 'Not specified'}</p>
                <p><span className="font-semibold">Title:</span> {implementationData.official_title || 'Not specified'}</p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold">Approval Confirmed:</span>
                  {implementationData.approval_confirmed ? (
                    <span className="flex items-center gap-1 text-green-700">
                      <CheckCircle className="w-4 h-4" /> YES
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-700">
                      <XCircle className="w-4 h-4" /> NO
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 bg-green-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Part C: Total Payroll</h2>
          <div className="space-y-2 text-gray-700">
            <p className="text-2xl font-bold">
              ${implementationData.total_payroll ? implementationData.total_payroll.toLocaleString() : '0'}
            </p>
            <p className="text-sm text-gray-600">(for calendar year ended December 31)</p>
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submission Information</h2>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">Report Status:</span>{' '}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                report.case_status === 'Submitted'
                  ? 'bg-green-100 text-green-800'
                  : report.case_status === 'Shared'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {report.case_status}
              </span>
            </p>
            <p><span className="font-semibold">Compliance Status:</span> {report.compliance_status || 'Not determined'}</p>
            {report.submitted_at ? (
              <p><span className="font-semibold">Submitted:</span> {new Date(report.submitted_at).toLocaleString()}</p>
            ) : (
              <p><span className="font-semibold">Submitted:</span> Not yet submitted</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
