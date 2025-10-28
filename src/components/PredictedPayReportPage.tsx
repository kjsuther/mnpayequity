import { ArrowLeft, FileDown, TrendingUp } from 'lucide-react';
import { Report, JobClassification, Jurisdiction } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';
import jsPDF from 'jspdf';
import { addLogoToPDF, addPageNumbers } from '../lib/pdfGenerator';

type PredictedPayReportPageProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  complianceResult: ComplianceResult;
  onBack: () => void;
};

export function PredictedPayReportPage({ report, jurisdiction, jobs, complianceResult, onBack }: PredictedPayReportPageProps) {
  const maleJobs = jobs.filter(job => job.males > 0 && job.females === 0);
  const femaleJobs = jobs.filter(job => job.females > 0 && job.males === 0);

  async function exportToPDF() {
    const doc = new jsPDF('portrait', 'pt', 'letter');
    let yPosition = 30;

    await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

    yPosition = 35;
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PREDICTED PAY EQUITY ADJUSTMENTS', 15, yPosition);

    yPosition += 20;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(jurisdiction.name, 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Report Year: ${report.report_year}`, 15, yPosition);
    yPosition += 12;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, yPosition);
    yPosition += 25;

    const introLines = doc.splitTextToSize(
      'This report shows projected salary equity adjustments needed to achieve compliance with Minnesota Pay Equity Law requirements.',
      550
    );
    doc.text(introLines, 15, yPosition);
    yPosition += introLines.length * 12 + 20;

    doc.setFont('helvetica', 'bold');
    doc.text('CURRENT STATUS', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    const statusText = complianceResult.isCompliant
      ? 'Your jurisdiction is currently IN COMPLIANCE.'
      : 'Your jurisdiction needs to make adjustments to achieve compliance.';
    doc.text(statusText, 15, yPosition);
    yPosition += 20;

    if (complianceResult.salaryRangeTest) {
      doc.text(`Salary Range Test Result: ${(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%`, 15, yPosition);
      yPosition += 12;
      doc.text(`Required Threshold: ${(complianceResult.salaryRangeTest.threshold * 100).toFixed(2)}%`, 15, yPosition);
      yPosition += 25;
    }

    doc.setFont('helvetica', 'bold');
    doc.text('MALE-DOMINATED JOB CLASSES', 15, yPosition);
    yPosition += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    maleJobs.forEach((job) => {
      if (yPosition > 730) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(job.title, 15, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`  Current Years to Max: ${job.years_to_max}`, 15, yPosition);
      yPosition += 10;
      doc.text(`  Salary Range: $${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`, 15, yPosition);
      yPosition += 15;
    });

    if (yPosition > 650) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FEMALE-DOMINATED JOB CLASSES', 15, yPosition);
    yPosition += 15;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    femaleJobs.forEach((job) => {
      if (yPosition > 730) {
        doc.addPage();
        yPosition = 30;
      }

      doc.setFont('helvetica', 'bold');
      doc.text(job.title, 15, yPosition);
      yPosition += 10;

      doc.setFont('helvetica', 'normal');
      doc.text(`  Current Years to Max: ${job.years_to_max}`, 15, yPosition);
      yPosition += 10;
      doc.text(`  Salary Range: $${job.min_salary.toLocaleString()} - $${job.max_salary.toLocaleString()}`, 15, yPosition);
      yPosition += 15;
    });

    if (yPosition > 650) {
      doc.addPage();
      yPosition = 30;
    }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RECOMMENDATIONS', 15, yPosition);
    yPosition += 15;

    doc.setFont('helvetica', 'normal');
    const recommendations = complianceResult.isCompliant
      ? 'Continue to monitor salary ranges and ensure ongoing compliance.'
      : `To achieve compliance, consider:\n1. Reviewing and adjusting years to maximum salary for affected classes\n2. Ensuring female-dominated classes reach maximum salary in comparable timeframes\n3. Evaluating exceptional service pay distribution across all classes`;

    const recLines = doc.splitTextToSize(recommendations, 550);
    doc.text(recLines, 15, yPosition);

    addPageNumbers(doc);

    doc.save(`${jurisdiction.name}_${report.report_year}_Predicted_Pay.pdf`);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Predicted Pay Equity Adjustments</h1>
          <div className="text-gray-600 space-y-1">
            <p className="text-lg font-semibold">{jurisdiction.name}</p>
            <p>Report Year: {report.report_year}</p>
            <p>Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg">
          <p className="text-gray-700">
            This report shows projected salary equity adjustments needed to achieve compliance with Minnesota Pay Equity Law requirements.
          </p>
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#003865]" />
            Current Status
          </h2>
          <div className="space-y-3">
            <p className={`text-lg font-semibold ${complianceResult.isCompliant ? 'text-green-700' : 'text-yellow-700'}`}>
              {complianceResult.isCompliant
                ? 'Your jurisdiction is currently IN COMPLIANCE.'
                : 'Your jurisdiction needs to make adjustments to achieve compliance.'}
            </p>
            {complianceResult.salaryRangeTest && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <span className="font-semibold">Salary Range Test Result:</span> {(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}%
                </div>
                <div>
                  <span className="font-semibold">Required Threshold:</span> {(complianceResult.salaryRangeTest.threshold * 100).toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Male-Dominated Job Classes</h2>
          {maleJobs.length > 0 ? (
            <div className="space-y-4">
              {maleJobs.map((job) => (
                <div key={job.id} className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Current Years to Max: {job.years_to_max}</p>
                    <p>Salary Range: ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No male-dominated job classes found.</p>
          )}
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Female-Dominated Job Classes</h2>
          {femaleJobs.length > 0 ? (
            <div className="space-y-4">
              {femaleJobs.map((job) => (
                <div key={job.id} className="p-4 bg-pink-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>Current Years to Max: {job.years_to_max}</p>
                    <p>Salary Range: ${job.min_salary.toLocaleString()} - ${job.max_salary.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No female-dominated job classes found.</p>
          )}
        </div>

        <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-500">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recommendations</h2>
          {complianceResult.isCompliant ? (
            <p className="text-gray-700">Continue to monitor salary ranges and ensure ongoing compliance.</p>
          ) : (
            <div className="text-gray-700 space-y-2">
              <p>To achieve compliance, consider:</p>
              <ul className="list-decimal list-inside space-y-1 ml-4">
                <li>Reviewing and adjusting years to maximum salary for affected classes</li>
                <li>Ensuring female-dominated classes reach maximum salary in comparable timeframes</li>
                <li>Evaluating exceptional service pay distribution across all classes</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
