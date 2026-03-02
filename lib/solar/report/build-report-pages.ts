import { FeasibilityReportSnapshot } from '@/lib/solar/types';

export type ReportOrientation = 'portrait' | 'landscape';

export interface ReportPageDescriptor {
  id: string;
  orientation: ReportOrientation;
}

export const REPORT_PAGE_DESCRIPTORS: ReportPageDescriptor[] = [
  { id: 'cover', orientation: 'portrait' },
  { id: 'metrics', orientation: 'portrait' },
  { id: 'system', orientation: 'portrait' },
  { id: 'layout', orientation: 'landscape' },
  { id: 'review', orientation: 'portrait' },
];

export function buildReportFilename(snapshot: FeasibilityReportSnapshot) {
  const customerSlug = snapshot.customer.customerName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const baseName = customerSlug || 'musteri';
  return `ubden-solar-fx-fizibilite-${baseName}.pdf`;
}

export function getQuoteSummary(snapshot: FeasibilityReportSnapshot) {
  if (snapshot.quote.mode === 'separate_quote') {
    return 'Fiyat teklifi ayrıca verilecek.';
  }

  if (typeof snapshot.quote.min === 'number' && typeof snapshot.quote.max === 'number') {
    return `${snapshot.quote.min.toFixed(0)} - ${snapshot.quote.max.toFixed(0)} ${snapshot.quote.currency}`;
  }

  return 'Belirtilmedi';
}
