import { ArrowLeft, FileDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Report, JobClassification, Jurisdiction } from '../lib/supabase';
import { ComplianceResult } from '../lib/complianceAnalysis';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 15;

    try {
      const response = await fetch('/MMB_logo copy copy copy.jpg');
      const blob = await response.blob();
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          doc.addImage(base64data, 'JPEG', 15, yPosition, 105, 26);
          resolve();
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    yPosition = 64;
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Pay Equity Compliance Report', 15, yPosition);

    yPosition += 22;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(jurisdiction.name, 15, yPosition);
    yPosition += 15;
    doc.setFontSize(9);
    doc.text(`Report Year: ${report.report_year}`, 15, yPosition);
    yPosition += 10;
    doc.text(`Case: ${report.case_number} - ${report.case_description}`, 15, yPosition);
    yPosition += 10;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 15, yPosition);
    yPosition += 25;

    doc.setFillColor(245, 245, 245);
    doc.rect(15, yPosition - 10, pageWidth - 30, 70, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Jurisdiction Information', 20, yPosition + 5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${jurisdiction.name}`, 20, yPosition + 20);
    doc.text(`Type: ${jurisdiction.jurisdiction_type}`, 320, yPosition + 20);
    doc.text(`Address: ${jurisdiction.address}`, 20, yPosition + 33);
    doc.text(`City: ${jurisdiction.city}, ${jurisdiction.state} ${jurisdiction.zipcode}`, 320, yPosition + 33);
    doc.text(`Phone: ${jurisdiction.phone}`, 20, yPosition + 46);
    yPosition += 85;

    const statusColor = complianceResult.isCompliant ? [209, 250, 229] :
                        complianceResult.requiresManualReview ? [254, 243, 199] : [254, 226, 226];
    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(15, yPosition - 5, pageWidth - 30, 25, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const lines = doc.splitTextToSize(complianceResult.message, pageWidth - 50);
    doc.text(lines, 20, yPosition + 8);
    yPosition += 35;

    const section1Start = yPosition;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('I. GENERAL JOB CLASS INFORMATION', 25, section1Start + 18);

    autoTable(doc, {
      startY: yPosition + 25,
      margin: { left: 25, right: 25 },
      head: [['', 'Male Classes', 'Female Classes', 'Balanced Classes', 'All Job Classes']],
      body: [
        ['# Job Classes',
         complianceResult.generalInfo.maleClasses.toString(),
         complianceResult.generalInfo.femaleClasses.toString(),
         complianceResult.generalInfo.balancedClasses.toString(),
         complianceResult.generalInfo.totalClasses.toString()],
        ['# Employees',
         complianceResult.generalInfo.maleEmployees.toString(),
         complianceResult.generalInfo.femaleEmployees.toString(),
         complianceResult.generalInfo.balancedEmployees.toString(),
         complianceResult.generalInfo.totalEmployees.toString()],
        ['Avg.Max Monthly Pay Per Employee',
         `$${formatCurrency(complianceResult.generalInfo.avgMaxPayMale)}`,
         `$${formatCurrency(complianceResult.generalInfo.avgMaxPayFemale)}`,
         `$${formatCurrency(complianceResult.generalInfo.avgMaxPayBalanced)}`,
         `$${formatCurrency(complianceResult.generalInfo.avgMaxPayAll)}`]
      ],
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 5 },
      headStyles: { fillColor: [249, 250, 251], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 180 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' }
      }
    });

    const section1End = (doc as any).lastAutoTable.finalY + 10;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.rect(20, section1Start, pageWidth - 40, section1End - section1Start, 'S');

    yPosition = section1End + 10;

    if (!complianceResult.requiresManualReview && complianceResult.statisticalTest) {
      if (yPosition > 600) {
        doc.addPage();
        yPosition = 30;
      }

      const section2Start = yPosition;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('II. STATISTICAL ANALYSIS TEST', 25, yPosition + 18);

      doc.setFontSize(10);
      doc.text(`A. UNDERPAYMENT RATIO = ${complianceResult.statisticalTest.underpaymentRatio.toFixed(2)}% *`, 30, yPosition + 38);

      autoTable(doc, {
        startY: yPosition + 48,
        margin: { left: 50, right: 50 },
        head: [['', 'Male Classes', 'Female Classes']],
        body: [
          ['a. # at or above Predicted Pay',
           (complianceResult.statisticalTest.maleTotalClasses - complianceResult.statisticalTest.maleClassesBelowPredicted).toString(),
           (complianceResult.statisticalTest.femaleTotalClasses - complianceResult.statisticalTest.femaleClassesBelowPredicted).toString()],
          ['b. # Below Predicted Pay',
           complianceResult.statisticalTest.maleClassesBelowPredicted.toString(),
           complianceResult.statisticalTest.femaleClassesBelowPredicted.toString()],
          ['c. TOTAL',
           complianceResult.statisticalTest.maleTotalClasses.toString(),
           complianceResult.statisticalTest.femaleTotalClasses.toString()],
          ['d. % Below Predicted Pay (b divided by c = d)',
           `${complianceResult.statisticalTest.malePercentBelowPredicted.toFixed(2)}%`,
           `${complianceResult.statisticalTest.femalePercentBelowPredicted.toFixed(2)}%`]
        ],
        theme: 'plain',
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [249, 250, 251], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
        columnStyles: {
          0: { cellWidth: 200 },
          1: { halign: 'center' },
          2: { halign: 'center' }
        }
      });

      let testYPos = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('*(Result is % of male classes below predicted pay divided by % of female classes below predicted pay.)', 50, testYPos);

      testYPos += 15;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('B. T-test Results', 25, testYPos);

      testYPos += 12;
      doc.setFillColor(249, 250, 251);
      doc.rect(50, testYPos - 8, pageWidth - 100, 18, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Degrees of Freedom (DF) = ${complianceResult.statisticalTest.tTestDF}`, 55, testYPos + 4);
      doc.text(`Value of T = ${complianceResult.statisticalTest.tTestValue.toFixed(3)}`, 320, testYPos + 4);

      testYPos += 22;
      doc.setFontSize(8);
      doc.text(`a. Avg.diff.in pay from predicted pay for male jobs = $${complianceResult.statisticalTest.avgDiffMale.toFixed(2)}`, 50, testYPos);
      testYPos += 10;
      doc.text(`b. Avg.diff.in pay from predicted pay for female jobs = $${complianceResult.statisticalTest.avgDiffFemale.toFixed(2)}`, 50, testYPos);

      const section2End = testYPos + 10;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(20, section2Start, pageWidth - 40, section2End - section2Start, 'S');

      yPosition = section2End + 10;
    }

    if (!complianceResult.requiresManualReview && complianceResult.salaryRangeTest) {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 30;
      }

      const section3Start = yPosition;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`III. SALARY RANGE TEST = ${(complianceResult.salaryRangeTest.ratio * 100).toFixed(2)}% (Result is A divided by B)`, 25, yPosition + 18);

      if (complianceResult.salaryRangeTest.passed) {
        doc.setTextColor(16, 185, 129);
        doc.text('Passed', pageWidth - 70, yPosition + 18);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('Failed', pageWidth - 70, yPosition + 18);
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`A. Avg.# of years to max salary for male jobs = ${complianceResult.salaryRangeTest.maleAverage.toFixed(2)}`, 30, yPosition + 38);
      doc.text(`B. Avg.# of years to max salary for female jobs = ${complianceResult.salaryRangeTest.femaleAverage.toFixed(2)}`, 30, yPosition + 52);

      const section3End = yPosition + 62;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(20, section3Start, pageWidth - 40, section3End - section3Start, 'S');

      yPosition = section3End + 10;
    }

    if (!complianceResult.requiresManualReview && complianceResult.exceptionalServiceTest) {
      if (yPosition > 650) {
        doc.addPage();
        yPosition = 30;
      }

      const section4Start = yPosition;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`IV. EXCEPTIONAL SERVICE PAY TEST = ${(complianceResult.exceptionalServiceTest.ratio * 100).toFixed(2)}% (Result is B divided by A)`, 25, yPosition + 18);

      if (complianceResult.exceptionalServiceTest.passed) {
        doc.setTextColor(16, 185, 129);
        doc.text('Passed', pageWidth - 70, yPosition + 18);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('Failed', pageWidth - 70, yPosition + 18);
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`A. % of male classes receiving ESP = ${complianceResult.exceptionalServiceTest.malePercentage.toFixed(2)}%`, 30, yPosition + 38);
      doc.text(`B. % of female classes receiving ESP = ${complianceResult.exceptionalServiceTest.femalePercentage.toFixed(2)}%`, 30, yPosition + 52);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.text('*(If 20% or less, test result will be 0.00)', 30, yPosition + 65);

      const section4End = yPosition + 75;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.rect(20, section4Start, pageWidth - 40, section4End - section4Start, 'S');

      yPosition = section4End + 10;
    }

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
