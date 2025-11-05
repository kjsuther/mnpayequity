import { ArrowLeft, FileDown } from 'lucide-react';
import { Report, JobClassification, Jurisdiction } from '../lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addLogoToPDF, addPageNumbers, addReportHeader, formatCurrency, formatNumber, getClassType } from '../lib/pdfGenerator';

type JobDataEntryListPageProps = {
  report: Report;
  jurisdiction: Jurisdiction;
  jobs: JobClassification[];
  onBack: () => void;
};

export function JobDataEntryListPage({ report, jurisdiction, jobs, onBack }: JobDataEntryListPageProps) {
  const maleJobs = jobs.filter(job => job.males > 0 && job.females === 0);
  const femaleJobs = jobs.filter(job => job.females > 0 && job.males === 0);
  const balancedJobs = jobs.filter(job => job.males > 0 && job.females > 0);

  async function exportToPDF() {
    const doc = new jsPDF('landscape', 'pt', 'letter');

    await addLogoToPDF(doc, '/MMB_logo copy copy copy.jpg');

    const yPosition = addReportHeader(
      doc,
      'Job Class Data Entry Verification List',
      `${report.case_number} ${jurisdiction.name} ${report.case_description}`,
      jurisdiction.name,
      jurisdiction.jurisdiction_id.toString()
    );

    const tableData = jobs.map(job => [
      job.job_number.toString(),
      job.title,
      job.males.toString(),
      job.females.toString(),
      getClassType(job.males, job.females),
      job.points.toString(),
      formatCurrency(job.min_salary),
      formatCurrency(job.max_salary),
      formatNumber(job.years_to_max),
      formatNumber(job.years_service_pay),
      job.exceptional_service_category || '',
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [[
        'Job Nbr',
        'Class Title',
        'Nbr\nMales',
        'Nbr\nFemales',
        'Class\nType',
        'Jobs\nPoints',
        'Min Mo\nSalary',
        'Max Mo Salary',
        'Yrs to Max Salary',
        'Yrs of\nService',
        'Exceptional Service Pay'
      ]],
      body: tableData,
      theme: 'plain',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        halign: 'left',
        lineColor: [0, 0, 0],
        lineWidth: 0.5,
      },
      columnStyles: {
        0: { halign: 'right', cellWidth: 35 },
        1: { halign: 'left', cellWidth: 140 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 35 },
        5: { halign: 'center', cellWidth: 35 },
        6: { halign: 'right', cellWidth: 35 },
        7: { halign: 'right', cellWidth: 55 },
        8: { halign: 'right', cellWidth: 65 },
        9: { halign: 'right', cellWidth: 75 },
        10: { halign: 'right', cellWidth: 50 },
        11: { halign: 'left', cellWidth: 105 },
      },
      didDrawPage: (data) => {
        if (data.pageNumber > 1) {
          doc.addImage(doc.internal.pages[1], 'JPEG', 15, 10, 60, 15);
        }
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Job Number Count: ${jobs.length}`, 15, finalY);

    const currentDate = new Date().toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    addPageNumbers(doc, currentDate);

    doc.save(`${jurisdiction.name}_${report.report_year}_Job_Data_Entry_List.pdf`);
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Class Data Entry Verification List</h1>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Case: {report.case_number} {jurisdiction.name} {report.case_description}</span>
            <span>LGID: {jurisdiction.jurisdiction_id}</span>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Male-Dominated</p>
            <p className="text-2xl font-bold text-gray-900">{maleJobs.length}</p>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Female-Dominated</p>
            <p className="text-2xl font-bold text-gray-900">{femaleJobs.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-gray-300">
                <th className="text-left py-2 px-2 font-semibold">Job Nbr</th>
                <th className="text-left py-2 px-2 font-semibold">Class Title</th>
                <th className="text-right py-2 px-2 font-semibold">Nbr Males</th>
                <th className="text-right py-2 px-2 font-semibold">Nbr Females</th>
                <th className="text-center py-2 px-2 font-semibold">Class Type</th>
                <th className="text-right py-2 px-2 font-semibold">Jobs Points</th>
                <th className="text-right py-2 px-2 font-semibold">Min Mo Salary</th>
                <th className="text-right py-2 px-2 font-semibold">Max Mo Salary</th>
                <th className="text-right py-2 px-2 font-semibold">Yrs to Max</th>
                <th className="text-right py-2 px-2 font-semibold">Yrs of Service</th>
                <th className="text-left py-2 px-2 font-semibold">Exceptional Service Pay</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job, index) => (
                <tr key={job.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-2 text-right border-b border-gray-200">{job.job_number}</td>
                  <td className="py-2 px-2 border-b border-gray-200">{job.title}</td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">{job.males}</td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">{job.females}</td>
                  <td className="py-2 px-2 text-center border-b border-gray-200">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      getClassType(job.males, job.females) === 'M' ? 'bg-blue-100 text-blue-800' :
                      getClassType(job.males, job.females) === 'F' ? 'bg-pink-100 text-pink-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getClassType(job.males, job.females)}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">{job.points}</td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">${formatCurrency(job.min_salary)}</td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">${formatCurrency(job.max_salary)}</td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">{formatNumber(job.years_to_max)}</td>
                  <td className="py-2 px-2 text-right border-b border-gray-200">{formatNumber(job.years_service_pay)}</td>
                  <td className="py-2 px-2 border-b border-gray-200">{job.exceptional_service_category || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-300">
          <p className="font-semibold text-gray-900">Job Number Count: {jobs.length}</p>
        </div>
      </div>
    </div>
  );
}
