import jsPDF from 'jspdf';
import { Report, Jurisdiction, supabase } from './supabase';

export async function generateCertificatePDF(
  report: Report,
  jurisdiction: Jurisdiction
): Promise<string> {
  const doc = new jsPDF('portrait', 'pt', 'letter');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPos = 80;

  const { data: commissionerData } = await supabase
    .from('system_config')
    .select('config_value')
    .eq('config_key', 'commissioner_name')
    .maybeSingle();

  const commissionerName = commissionerData?.config_value || 'Pay Equity Commissioner';

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
  doc.rect(60, yPos, pageWidth - 120, 200, 'S');

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
    `Approved by: ${commissionerName}`,
    `Approval Date: ${new Date(report.approved_at || '').toLocaleDateString()}`,
  ];

  details.forEach((line) => {
    doc.text(line, 80, yPos);
    yPos += 18;
  });

  yPos = pageHeight - 220;

  doc.setFillColor(240, 240, 240);
  doc.rect(60, yPos, pageWidth - 120, 140, 'F');

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
    '',
    'Questions about pay equity compliance should be directed to your HR department',
    'or the Minnesota Management and Budget Pay Equity Unit at (651) 259-3824.',
  ];

  yPos += 35;
  postingReqs.forEach((line) => {
    doc.text(line, 80, yPos);
    yPos += 12;
  });

  yPos = pageHeight - 40;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Certificate generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    yPos,
    { align: 'center' }
  );
  doc.text(
    'Minnesota Management and Budget - Pay Equity Compliance',
    pageWidth / 2,
    yPos + 12,
    { align: 'center' }
  );

  return doc.output('dataurlstring');
}
