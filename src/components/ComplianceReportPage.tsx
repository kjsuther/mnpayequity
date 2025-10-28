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

        <div className={`mb-6 p-5 rounded-xl ${
          complianceResult.isCompliant
            ? 'bg-emerald-50 border border-emerald-200'
            : complianceResult.requiresManualReview
            ? 'bg-amber-50 border border-amber-200'
            : 'bg-rose-50 border border-rose-200'
        }`}>
          <p className={`text-sm leading-relaxed ${
            complianceResult.isCompliant
              ? 'text-emerald-800'
              : complianceResult.requiresManualReview
              ? 'text-amber-800'
              : 'text-rose-800'
          }`}>
            {complianceResult.message}
          </p>
        </div>

        <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">I. GENERAL JOB CLASS INFORMATION</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300 bg-gray-50">
                  <th className="text-left py-3 px-4"></th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Male Classes</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Female Classes</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">Balanced Classes</th>
                  <th className="text-center py-3 px-4 font-bold text-gray-700">All Job Classes</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-700"># Job Classes</td>
                  <td className="text-center py-3 px-4 text-gray-900">{complianceResult.generalInfo.maleClasses}</td>
                  <td className="text-center py-3 px-4 text-gray-900">{complianceResult.generalInfo.femaleClasses}</td>
                  <td className="text-center py-3 px-4 text-gray-900">{complianceResult.generalInfo.balancedClasses}</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900">{complianceResult.generalInfo.totalClasses}</td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-700"># Employees</td>
                  <td className="text-center py-3 px-4 text-gray-900">{complianceResult.generalInfo.maleEmployees}</td>
                  <td className="text-center py-3 px-4 text-gray-900">{complianceResult.generalInfo.femaleEmployees}</td>
                  <td className="text-center py-3 px-4 text-gray-900">{complianceResult.generalInfo.balancedEmployees}</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900">{complianceResult.generalInfo.totalEmployees}</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-700">Avg.Max Monthly Pay Per Employee</td>
                  <td className="text-center py-3 px-4 text-gray-900">${complianceResult.generalInfo.avgMaxPayMale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-center py-3 px-4 text-gray-900">${complianceResult.generalInfo.avgMaxPayFemale.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-center py-3 px-4 text-gray-900">${complianceResult.generalInfo.avgMaxPayBalanced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-center py-3 px-4 font-bold text-gray-900">${complianceResult.generalInfo.avgMaxPayAll.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {!complianceResult.requiresManualReview && complianceResult.statisticalTest && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6">II. STATISTICAL ANALYSIS TEST</h2>

            <div className="mb-6">
              <h3 className="font-bold text-gray-800 mb-3">A. UNDERPAYMENT RATIO = {complianceResult.statisticalTest.underpaymentRatio.toFixed(2)}% *</h3>
              <div className="ml-6 space-y-2 text-sm">
                <div className="grid grid-cols-3 gap-6">
                  <div></div>
                  <div className="font-bold text-center text-gray-800">Male Classes</div>
                  <div className="font-bold text-center text-gray-800">Female Classes</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">a. # at or above Predicted Pay</div>
                  <div className="text-center text-gray-900">{complianceResult.statisticalTest.maleTotalClasses - complianceResult.statisticalTest.maleClassesBelowPredicted}</div>
                  <div className="text-center text-gray-900">{complianceResult.statisticalTest.femaleTotalClasses - complianceResult.statisticalTest.femaleClassesBelowPredicted}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">b. # Below Predicted Pay</div>
                  <div className="text-center text-gray-900">{complianceResult.statisticalTest.maleClassesBelowPredicted}</div>
                  <div className="text-center text-gray-900">{complianceResult.statisticalTest.femaleClassesBelowPredicted}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">c. TOTAL</div>
                  <div className="text-center text-gray-900">{complianceResult.statisticalTest.maleTotalClasses}</div>
                  <div className="text-center text-gray-900">{complianceResult.statisticalTest.femaleTotalClasses}</div>
                </div>
                <div className="grid grid-cols-3 gap-6 py-2">
                  <div className="text-gray-700">d. % Below Predicted Pay (b divided by c = d)</div>
                  <div className="text-center font-semibold text-gray-900">{complianceResult.statisticalTest.malePercentBelowPredicted.toFixed(2)}%</div>
                  <div className="text-center font-semibold text-gray-900">{complianceResult.statisticalTest.femalePercentBelowPredicted.toFixed(2)}%</div>
                </div>
                <div className="text-xs text-gray-600 mt-3 italic">
                  *(Result is % of male classes below predicted pay divided by % of female classes below predicted pay.)
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-3">B. T-test Results</h3>
              <div className="ml-6 space-y-3 text-sm">
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-4 text-gray-900">
                    <div><span className="font-medium">Degrees of Freedom (DF)</span> = {complianceResult.statisticalTest.tTestDF}</div>
                    <div><span className="font-medium">Value of T</span> = {complianceResult.statisticalTest.tTestValue.toFixed(3)}</div>
                  </div>
                </div>
                <div className="text-gray-700">
                  a. Avg.diff.in pay from predicted pay for male jobs = <span className="font-medium text-gray-900">${complianceResult.statisticalTest.avgDiffMale.toFixed(2)}</span>
                </div>
                <div className="text-gray-700">
                  b. Avg.diff.in pay from predicted pay for female jobs = <span className="font-medium text-gray-900">${complianceResult.statisticalTest.avgDiffFemale.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!complianceResult.requiresManualReview && complianceResult.salaryRangeTest && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">III. SALARY RANGE TEST = {(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}% (Result is A divided by B)</h2>
              {complianceResult.salaryRangeTest.passed ? (
                <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  Passed
                </span>
              ) : (
                <span className="flex items-center gap-2 text-rose-600 text-sm font-bold px-3 py-1.5 bg-rose-50 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  Failed
                </span>
              )}
            </div>
            <div className="space-y-3 text-sm ml-6">
              <p className="text-gray-700">
                A. Avg.# of years to max salary for male jobs = <span className="font-semibold text-gray-900">{complianceResult.salaryRangeTest.maleAverage.toFixed(2)}</span>
              </p>
              <p className="text-gray-700">
                B. Avg.# of years to max salary for female jobs = <span className="font-semibold text-gray-900">{complianceResult.salaryRangeTest.femaleAverage.toFixed(2)}</span>
              </p>
            </div>
          </div>
        )}

        {!complianceResult.requiresManualReview && complianceResult.exceptionalServiceTest && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">IV. EXCEPTIONAL SERVICE PAY TEST = {(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}% (Result is B divided by A)</h2>
              {complianceResult.exceptionalServiceTest.passed ? (
                <span className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-3 py-1.5 bg-emerald-50 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  Passed
                </span>
              ) : (
                <span className="flex items-center gap-2 text-rose-600 text-sm font-bold px-3 py-1.5 bg-rose-50 rounded-lg">
                  <XCircle className="w-5 h-5" />
                  Failed
                </span>
              )}
            </div>
            <div className="space-y-3 text-sm ml-6">
              <p className="text-gray-700">
                A. % of male classes receiving ESP = <span className="font-semibold text-gray-900">{complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%</span>
              </p>
              <p className="text-gray-700">
                B. % of female classes receiving ESP = <span className="font-semibold text-gray-900">{complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%</span>
              </p>
              <p className="text-xs text-gray-600 mt-3 italic">
                *(If 20% or less, test result will be 0.00)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
