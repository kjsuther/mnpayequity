import { ArrowLeft, FileDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Report, JobClassification, Jurisdiction } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';
import jsPDF from 'jspdf';
import { addLogoToPDF, addPageNumbers, formatCurrency, formatNumber } from '../lib/pdfGenerator';

type ComplianceReportPageProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  complianceResult: ComplianceResult;
  onBack: () => void;
};

export function ComplianceReportPage({ report, jurisdiction, jobs, complianceResult, onBack }: ComplianceReportPageProps) {
  async function exportToPDF() {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    let yPosition = 30;

    await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

    yPosition = 35;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PAY EQUITY COMPLIANCE REPORT', 15, yPosition);

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
    doc.text('JURISDICTION INFORMATION', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${jurisdiction.name}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Type: ${jurisdiction.jurisdiction_type}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Address: ${jurisdiction.address}`, 15, yPosition);
    yPosition += 12;
    doc.text(`City: ${jurisdiction.city}, ${jurisdiction.state} ${jurisdiction.zipcode}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Phone: ${jurisdiction.phone}`, 15, yPosition);
    yPosition += 25;

    doc.setFont('helvetica', 'bold');
    doc.text('COMPLIANCE SUMMARY', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    const status = complianceResult.isCompliant ? 'IN COMPLIANCE' : complianceResult.requiresManualReview ? 'MANUAL REVIEW REQUIRED' : 'OUT OF COMPLIANCE';
    doc.text(`Status: ${status}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Total Job Classes: ${complianceResult.totalJobs}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Male-Dominated Classes: ${complianceResult.maleJobs}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Female-Dominated Classes: ${complianceResult.femaleJobs}`, 15, yPosition);
    yPosition += 15;

    const lines = doc.splitTextToSize(complianceResult.message, 550);
    doc.text(lines, 15, yPosition);
    yPosition += lines.length * 12 + 15;

    if (!complianceResult.requiresManualReview && complianceResult.salaryRangeTest) {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('SALARY RANGE TEST (III)', 15, yPosition);
      yPosition += 15;

      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${complianceResult.salaryRangeTest.passed ? 'PASSED' : 'FAILED'}`, 15, yPosition);
      yPosition += 12;
      doc.text(`Threshold: ${(complianceResult.salaryRangeTest.threshold * 100).toFixed(2)}%`, 15, yPosition);
      yPosition += 12;
      doc.text(`Result: ${(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%`, 15, yPosition);
      yPosition += 15;
      doc.text(`Male Average Years to Max: ${complianceResult.salaryRangeTest.maleAverage.toFixed(2)}`, 15, yPosition);
      yPosition += 12;
      doc.text(`Female Average Years to Max: ${complianceResult.salaryRangeTest.femaleAverage.toFixed(2)}`, 15, yPosition);
      yPosition += 25;
    }

    if (!complianceResult.requiresManualReview && complianceResult.exceptionalServiceTest) {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text('EXCEPTIONAL SERVICE PAY TEST (IV)', 15, yPosition);
      yPosition += 15;

      doc.setFont('helvetica', 'normal');
      doc.text(`Status: ${complianceResult.exceptionalServiceTest.passed ? 'PASSED' : 'FAILED'}`, 15, yPosition);
      yPosition += 12;
      doc.text(`Threshold: ${(complianceResult.exceptionalServiceTest.threshold * 100).toFixed(2)}%`, 15, yPosition);
      yPosition += 12;
      doc.text(`Result: ${(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}%`, 15, yPosition);
      yPosition += 15;
      doc.text(`Male Classes with Exceptional Service: ${complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%`, 15, yPosition);
      yPosition += 12;
      doc.text(`Female Classes with Exceptional Service: ${complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%`, 15, yPosition);
      yPosition += 25;
    }

    if (yPosition > 650) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('JOB CLASSIFICATIONS', 15, yPosition);
    yPosition += 15;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    jobs.forEach((job) => {
      if (yPosition > 730) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(`Job #${job.job_number}: ${job.title}`, 15, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`  Males: ${job.males} | Females: ${job.females} | Points: ${job.points}`, 15, yPosition);
      yPosition += 10;
      doc.text(`  Salary Range: $${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`, 15, yPosition);
      yPosition += 10;
      doc.text(`  Years to Max: ${job.years_to_max} | Years Service Pay: ${job.years_service_pay}`, 15, yPosition);
      yPosition += 10;
      doc.text(`  Exceptional Service: ${job.exceptional_service_category || 'None'}`, 15, yPosition);
      yPosition += 15;
    });

    addPageNumbers(doc);

    doc.save(`${jurisdiction.name}_${report.report_year}_Compliance_Report.pdf`);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pay Equity Compliance Report</h1>
          <div className="text-gray-600 space-y-1">
            <p className="text-lg font-semibold">{jurisdiction.name}</p>
            <p>Report Year: {report.report_year}</p>
            <p>Case: {report.case_number} - {report.case_description}</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Jurisdiction Information</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Name:</span> {jurisdiction.name}
            </div>
            <div>
              <span className="font-semibold">Type:</span> {jurisdiction.jurisdiction_type}
            </div>
            <div>
              <span className="font-semibold">Address:</span> {jurisdiction.address}
            </div>
            <div>
              <span className="font-semibold">City:</span> {jurisdiction.city}, {jurisdiction.state} {jurisdiction.zipcode}
            </div>
            <div>
              <span className="font-semibold">Phone:</span> {jurisdiction.phone}
            </div>
          </div>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            {complianceResult.isCompliant ? (
              <CheckCircle className="w-6 h-6 text-green-600" />
            ) : complianceResult.requiresManualReview ? (
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            ) : (
              <XCircle className="w-6 h-6 text-red-600" />
            )}
            Compliance Summary
          </h2>
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Status:</span>{' '}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                complianceResult.isCompliant ? 'bg-green-100 text-green-800' :
                complianceResult.requiresManualReview ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {complianceResult.isCompliant ? 'IN COMPLIANCE' : complianceResult.requiresManualReview ? 'MANUAL REVIEW REQUIRED' : 'OUT OF COMPLIANCE'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-semibold">Total Job Classes:</span> {complianceResult.totalJobs}
              </div>
              <div>
                <span className="font-semibold">Male-Dominated:</span> {complianceResult.maleJobs}
              </div>
              <div>
                <span className="font-semibold">Female-Dominated:</span> {complianceResult.femaleJobs}
              </div>
            </div>
            <p className="mt-4 text-gray-700">{complianceResult.message}</p>
          </div>
        </div>

        {!complianceResult.requiresManualReview && complianceResult.salaryRangeTest && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Salary Range Test (III)</h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  complianceResult.salaryRangeTest.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {complianceResult.salaryRangeTest.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Threshold:</span> {(complianceResult.salaryRangeTest.threshold * 100).toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">Result:</span> {(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">Male Average Years to Max:</span> {complianceResult.salaryRangeTest.maleAverage.toFixed(2)}
                </div>
                <div>
                  <span className="font-semibold">Female Average Years to Max:</span> {complianceResult.salaryRangeTest.femaleAverage.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {!complianceResult.requiresManualReview && complianceResult.exceptionalServiceTest && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Exceptional Service Pay Test (IV)</h2>
            <div className="space-y-3">
              <div>
                <span className="font-semibold">Status:</span>{' '}
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  complianceResult.exceptionalServiceTest.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {complianceResult.exceptionalServiceTest.passed ? 'PASSED' : 'FAILED'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Threshold:</span> {(complianceResult.exceptionalServiceTest.threshold * 100).toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">Result:</span> {(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">Male Classes with Exceptional Service:</span> {complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">Female Classes with Exceptional Service:</span> {complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Job Classifications</h2>
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Job #{job.job_number}: {job.title}</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Males: {job.males} | Females: {job.females} | Points: {job.points}</p>
                  <p>Salary Range: ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}</p>
                  <p>Years to Max: {job.years_to_max} | Years Service Pay: {job.years_service_pay}</p>
                  <p>Exceptional Service: {job.exceptional_service_category || 'None'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
