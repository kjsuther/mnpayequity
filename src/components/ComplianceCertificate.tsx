import { useState } from 'react';
import { Download, Printer, CheckCircle, Calendar, MapPin, FileText } from 'lucide-react';
import { Report, Jurisdiction } from '../lib/supabase';
import jsPDF from 'jspdf';

type ComplianceCertificateProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  onBack: () => void;
};

export function ComplianceCertificate({ report, jurisdiction, onBack }: ComplianceCertificateProps) {
  const [showInstructions, setShowInstructions] = useState(true);

  const generateCertificate = () => {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPos = 80;

    doc.setFillColor(0, 56, 101);
    doc.rect(0, 0, pageWidth, 60, 'F');

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('PAY EQUITY COMPLIANCE CERTIFICATE', pageWidth / 2, 40, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    yPos = 100;

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(jurisdiction.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 30;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const certText = [
      `This is to certify that ${jurisdiction.name} has completed its annual pay equity`,
      `report for the year ${report.report_year} in accordance with the Minnesota Local Government`,
      `Pay Equity Act (Minnesota Statutes 471.991 - 471.999).`,
    ];

    certText.forEach((line) => {
      doc.text(line, pageWidth / 2, yPos, { align: 'center' });
      yPos += 18;
    });

    yPos += 30;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(60, yPos, pageWidth - 120, 180, 'S');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('REPORT DETAILS', 80, yPos + 25);

    doc.setFont('helvetica', 'normal');
    yPos += 45;

    const details = [
      `Reporting Year: ${report.report_year}`,
      `Case Number: ${report.case_number}`,
      `Case Description: ${report.case_description}`,
      `Submission Date: ${new Date(report.submitted_at || '').toLocaleDateString()}`,
      `Compliance Status: ${report.compliance_status}`,
      ``,
      `This report was approved by ${jurisdiction.jurisdiction_type}`,
    ];

    details.forEach((line) => {
      doc.text(line, 80, yPos);
      yPos += 16;
    });

    yPos = pageHeight - 200;

    doc.setFillColor(240, 240, 240);
    doc.rect(60, yPos, pageWidth - 120, 120, 'F');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('POSTING REQUIREMENTS', 80, yPos + 20);

    doc.setFont('helvetica', 'normal');
    const postingReqs = [
      'This certificate must be posted in a prominent location accessible to all employees',
      'for a period of at least 90 days following submission of the pay equity report.',
      '',
      'Suitable posting locations include employee break rooms, time clock areas,',
      'bulletin boards, or main office entrances.',
    ];

    yPos += 35;
    postingReqs.forEach((line) => {
      doc.text(line, 80, yPos);
      yPos += 12;
    });

    yPos = pageHeight - 40;
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Certificate generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    doc.text('Minnesota Management and Budget - Pay Equity Compliance', pageWidth / 2, yPos + 12, { align: 'center' });

    doc.save(`${jurisdiction.name.replace(/\s+/g, '_')}_Pay_Equity_Certificate_${report.report_year}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="text-[#003865] hover:text-[#004d7a] transition-colors"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Report Successfully Submitted</h1>
          <p className="text-gray-600">
            Your pay equity report for {report.report_year} has been submitted on{' '}
            {new Date(report.submitted_at || '').toLocaleDateString()}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={generateCertificate}
            className="flex items-center justify-center gap-3 p-6 border-2 border-[#003865] rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-6 h-6 text-[#003865]" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Download Certificate</div>
              <div className="text-sm text-gray-600">Save as PDF</div>
            </div>
          </button>

          <button
            onClick={() => {
              generateCertificate();
              window.print();
            }}
            className="flex items-center justify-center gap-3 p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-6 h-6 text-gray-600" />
            <div className="text-left">
              <div className="font-semibold text-gray-900">Print Certificate</div>
              <div className="text-sm text-gray-600">Print directly</div>
            </div>
          </button>
        </div>

        {showInstructions && (
          <div className="space-y-6">
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Official Notice Posting Requirements</h2>
              <p className="text-gray-700 mb-4">
                Minnesota law requires that you post an official notice of your pay equity compliance for at least 90 days.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-5 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-blue-900">Where to Post</h3>
                </div>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>• Main employee entrance</li>
                  <li>• Break rooms or lunch areas</li>
                  <li>• Time clock locations</li>
                  <li>• Employee bulletin boards</li>
                  <li>• HR office areas</li>
                </ul>
                <p className="text-sm text-blue-700 mt-3 italic">
                  Choose a location where all employees will see it
                </p>
              </div>

              <div className="p-5 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-purple-900">How Long</h3>
                </div>
                <p className="text-sm text-purple-800 mb-3">
                  The notice must remain posted for a minimum of <strong>90 consecutive days</strong> starting from the date you post it.
                </p>
                <div className="bg-purple-100 p-3 rounded text-sm text-purple-800">
                  <p className="font-medium mb-1">Recommended:</p>
                  <p>Post until: {new Date(new Date(report.submitted_at || '').getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="p-5 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-green-900">What to Post</h3>
                </div>
                <p className="text-sm text-green-800 mb-3">
                  Post the compliance certificate you downloaded above. It includes all required information:
                </p>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✓ Jurisdiction name</li>
                  <li>✓ Reporting year</li>
                  <li>✓ Submission date</li>
                  <li>✓ Compliance status</li>
                </ul>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
              <h3 className="font-semibold text-amber-900 mb-3">Important Reminders</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">
                    1
                  </div>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Document the Posting</p>
                    <p>Take a photo of the posted notice with a date stamp for your records.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">
                    2
                  </div>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Set a Calendar Reminder</p>
                    <p>Mark your calendar for when the 90-day period ends so you know when you can remove the notice.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">
                    3
                  </div>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Protect the Notice</p>
                    <p>Consider laminating the certificate or placing it in a protective cover to prevent damage.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-amber-200 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm">
                    4
                  </div>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">Employee Questions</p>
                    <p>Direct employees with questions about pay equity to your HR department or the posted contact information.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Next Steps After Posting</h3>
              <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                <li>Download and post the compliance certificate immediately</li>
                <li>Keep a copy of the report and certificate in your official records</li>
                <li>Monitor the posting location to ensure the notice remains visible for 90 days</li>
                <li>Begin planning for next year's report (due by January 31)</li>
                <li>Address any compliance issues identified in this year's report</li>
                <li>Review and update job classifications as positions change</li>
              </ol>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-3">
                If you have questions about posting requirements or pay equity compliance, contact:
              </p>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Pay Equity Unit</strong></p>
                <p>Minnesota Management and Budget</p>
                <p>Phone: 651-259-3824</p>
                <p>Email: payequity.mmb@state.mn.us</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
