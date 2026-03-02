import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

import { ReportOrientation } from '@/lib/solar/report/build-report-pages';

export interface ReportPageCapture {
  element: HTMLElement;
  orientation: ReportOrientation;
}

function getPageFormat(orientation: ReportOrientation) {
  return orientation === 'landscape' ? { width: 297, height: 210 } : { width: 210, height: 297 };
}

async function waitForRenderSettling() {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready;
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });

  await new Promise((resolve) => setTimeout(resolve, 240));
}

export async function generateFeasibilityPdf(pages: ReportPageCapture[], fileName: string) {
  if (pages.length === 0) {
    throw new Error('Report pages were not rendered.');
  }

  await waitForRenderSettling();

  const firstPage = pages[0];
  const pdf = new jsPDF({
    orientation: firstPage.orientation,
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  for (const [index, page] of pages.entries()) {
    const format = getPageFormat(page.orientation);
    const image = await toPng(page.element, {
      cacheBust: true,
      backgroundColor: '#ffffff',
      pixelRatio: Math.max(window.devicePixelRatio, 2),
    });

    if (index > 0) {
      pdf.addPage('a4', page.orientation);
    }

    pdf.setPage(index + 1);
    pdf.addImage(image, 'PNG', 0, 0, format.width, format.height, undefined, 'FAST');
  }

  pdf.save(fileName);
}
