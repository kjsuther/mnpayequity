import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export async function addLogoToPDF(doc: jsPDF, logoPath: string) {
  try {
    const response = await fetch(logoPath);
    const blob = await response.blob();
    const reader = new FileReader();

    return new Promise<void>((resolve) => {
      reader.onloadend = () => {
        const base64data = reader.result as string;
        doc.addImage(base64data, 'JPEG', 15, 10, 60, 15);
        resolve();
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error loading logo:', error);
  }
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function addPageNumbers(doc: jsPDF, text?: string) {
  const pageCount = doc.getNumberOfPages();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100);

    const pageText = `Page ${i} of ${pageCount}`;
    const pageWidth = doc.internal.pageSize.width;
    const textWidth = doc.getTextWidth(pageText);
    doc.text(pageText, pageWidth - textWidth - 15, doc.internal.pageSize.height - 10);

    if (text) {
      doc.text(text, 15, doc.internal.pageSize.height - 10);
    }
  }
}

export function addReportHeader(
  doc: jsPDF,
  title: string,
  caseInfo: string,
  jurisdictionName: string,
  lgid?: string,
  yPosition: number = 35
) {
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);

  const pageWidth = doc.internal.pageSize.width;
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, yPosition);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  doc.text(`Case: ${caseInfo}`, 15, yPosition + 7);

  const jurisdictionWidth = doc.getTextWidth(jurisdictionName);
  doc.text(jurisdictionName, (pageWidth - jurisdictionWidth) / 2, yPosition + 7);

  if (lgid) {
    const lgidText = `LGID: ${lgid}`;
    const lgidWidth = doc.getTextWidth(lgidText);
    doc.text(lgidText, pageWidth - lgidWidth - 15, yPosition + 7);
  }

  return yPosition + 15;
}

export function getClassType(males: number, females: number): string {
  const total = males + females;
  if (total === 0) return 'N/A';

  const malePercentage = (males / total) * 100;
  const femalePercentage = (females / total) * 100;

  if (malePercentage >= 70) return 'M';
  if (femalePercentage >= 70) return 'F';
  return 'B';
}
