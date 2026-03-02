'use client';

import { MutableRefObject, useMemo } from 'react';

import { getPanelSpec } from '@/lib/solar/catalog';
import { ReportLayoutReview3D } from '@/components/solar/report/ReportLayoutReview3D';
import { TechnicalLayoutFigure } from '@/components/solar/report/TechnicalLayoutFigure';
import { REPORT_PAGE_DESCRIPTORS, getQuoteSummary } from '@/lib/solar/report/build-report-pages';
import { REPORT_DISCLAIMER, REPORT_SECTION_COPY, REPORT_WATERMARK } from '@/lib/solar/report/report-copy';
import {
  FeasibilityReportSnapshot,
  FinancialSummary,
  MetricDefinition,
  ProjectState,
  YieldResult,
} from '@/lib/solar/types';

interface FeasibilityReportPagesProps {
  pageRefs: MutableRefObject<Array<HTMLDivElement | null>>;
  project: ProjectState;
  results: YieldResult;
  financialSummary: FinancialSummary;
  curve: Array<{ time: string; power: number }>;
  metrics: MetricDefinition[];
  snapshot: FeasibilityReportSnapshot;
}

function ReportFooter() {
  return (
    <div className="mt-auto border-t border-slate-200 pt-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.24em] text-slate-500">{REPORT_WATERMARK}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{REPORT_DISCLAIMER}</p>
    </div>
  );
}

function MetricTone({ state }: { state: MetricDefinition['state'] }) {
  if (state === 'warning') {
    return 'border-amber-300 bg-amber-50';
  }

  if (state === 'empty') {
    return 'border-slate-200 bg-slate-50';
  }

  return 'border-emerald-200 bg-emerald-50';
}

function ReportChart({ curve }: { curve: Array<{ time: string; power: number }> }) {
  const geometry = useMemo(() => {
    const width = 680;
    const height = 260;
    const padding = { top: 18, right: 16, bottom: 36, left: 42 };
    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;
    const peakPower = Math.max(...curve.map((entry) => entry.power), 1);
    const points = curve.map((entry, index) => {
      const x = padding.left + (innerWidth * index) / Math.max(curve.length - 1, 1);
      const y = padding.top + innerHeight - (entry.power / peakPower) * innerHeight;
      return { ...entry, x, y };
    });
    const linePath = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
    const areaPath = `${linePath} L ${points.at(-1)?.x ?? padding.left} ${padding.top + innerHeight} L ${points[0]?.x ?? padding.left} ${padding.top + innerHeight} Z`;

    return { width, height, padding, peakPower, points, linePath, areaPath };
  }, [curve]);

  return (
    <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="w-full rounded-[24px] border border-slate-200 bg-white">
      <defs>
        <linearGradient id="report-curve-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {Array.from({ length: 5 }, (_, index) => {
        const value = (geometry.peakPower / 4) * (4 - index);
        const y = geometry.padding.top + ((geometry.height - geometry.padding.top - geometry.padding.bottom) / 4) * index;

        return (
          <g key={index}>
            <line x1={geometry.padding.left} y1={y} x2={geometry.width - geometry.padding.right} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />
            <text x={geometry.padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fontFamily="monospace" fill="#64748b">
              {value.toFixed(1)}
            </text>
          </g>
        );
      })}

      <path d={geometry.areaPath} fill="url(#report-curve-fill)" />
      <path d={geometry.linePath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {geometry.points.map((point) => (
        <g key={point.time}>
          <circle cx={point.x} cy={point.y} r="3.5" fill="#f59e0b" />
          <text x={point.x} y={geometry.height - 10} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="#64748b">
            {point.time}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BrandList({ title, values }: { title: string; values: string[] }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4">
      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">{title}</p>
      <p className="mt-3 text-sm leading-6 text-slate-700">{values.length > 0 ? values.join(', ') : 'Belirtilmedi'}</p>
    </div>
  );
}

export function FeasibilityReportPages({
  pageRefs,
  project,
  results,
  financialSummary,
  curve,
  metrics,
  snapshot,
}: FeasibilityReportPagesProps) {
  const quoteSummary = getQuoteSummary(snapshot);
  const panelMixSummary = useMemo(
    () =>
      Object.entries(
        project.layout.panels.reduce<Record<string, number>>((accumulator, panel) => {
          accumulator[panel.panelSpecId] = (accumulator[panel.panelSpecId] ?? 0) + 1;
          return accumulator;
        }, {}),
      )
        .map(([panelSpecId, count]) => `${getPanelSpec(panelSpecId as typeof project.environment.panelSpecId).label} x${count}`)
        .join(' | '),
    [project.environment.panelSpecId, project.layout.panels],
  );

  return (
    <div className="pointer-events-none absolute -left-[200vw] top-0 z-[-1] flex flex-col gap-8">
      {REPORT_PAGE_DESCRIPTORS.map((page, index) => {
        const baseClasses =
          page.orientation === 'landscape'
            ? 'h-[794px] w-[1123px]'
            : 'h-[1123px] w-[794px]';

        return (
          <div
            key={page.id}
            ref={(node) => {
              pageRefs.current[index] = node;
            }}
            data-orientation={page.orientation}
            className={`${baseClasses} flex flex-col overflow-hidden rounded-[36px] bg-white p-10 text-slate-900 shadow-[0_24px_80px_rgba(15,23,42,0.08)]`}
          >
            {page.id === 'cover' ? (
              <>
                <div className="rounded-[28px] bg-[linear-gradient(135deg,#fff8eb_0%,#ffffff_48%,#eff6ff_100%)] p-8">
                  <p className="text-[11px] font-mono uppercase tracking-[0.32em] text-amber-600">Ubden Solar FX</p>
                  <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">{REPORT_SECTION_COPY.coverTitle}</h1>
                  <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">{REPORT_SECTION_COPY.coverSubtitle}</p>
                </div>

                <div className="mt-8 grid gap-5 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-6 py-5">
                      <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">Müşteri</p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight">{snapshot.customer.customerName || 'Belirtilmedi'}</h2>
                    <div className="mt-5 space-y-3 text-sm text-slate-700">
                      <p>Telefon: {snapshot.customer.phone || 'Belirtilmedi'}</p>
                      <p>Adres: {snapshot.customer.addressLine || 'Belirtilmedi'}</p>
                      <p>
                        Konum:{' '}
                        {snapshot.customer.geoLocation.status === 'success' &&
                        typeof snapshot.customer.geoLocation.latitude === 'number' &&
                        typeof snapshot.customer.geoLocation.longitude === 'number'
                          ? `${snapshot.customer.geoLocation.latitude.toFixed(5)}, ${snapshot.customer.geoLocation.longitude.toFixed(5)}`
                          : 'Belirtilmedi'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5">
                    <BrandList title="İnverter Markaları" values={snapshot.inverterBrands} />
                    <BrandList title="Panel Markaları" values={snapshot.panelBrands} />
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2">
                  <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-5">
                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">Teklif Yapısı</p>
                    <p className="mt-3 text-lg font-medium">{snapshot.quote.mode === 'separate_quote' ? 'Fiyat teklifi ayrıca verilecek' : 'Anahtar teslim fiyat aralığı'}</p>
                    <p className="mt-2 text-sm text-slate-600">{quoteSummary}</p>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white px-6 py-5">
                    <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-slate-500">Rapor Notları</p>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{snapshot.quote.note || 'Ek not belirtilmedi.'}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-4">
                  {snapshot.overview.slice(0, 4).map((item) => (
                    <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50 px-5 py-4">
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
                    </div>
                  ))}
                </div>

                <ReportFooter />
              </>
            ) : null}

            {page.id === 'metrics' ? (
              <>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500">Teknik Özet</p>
                  
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{REPORT_SECTION_COPY.metricsTitle}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{REPORT_SECTION_COPY.metricsSubtitle}</p>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {metrics.map((metric) => (
                    <div key={metric.id} className={`rounded-[24px] border px-5 py-5 ${MetricTone({ state: metric.state })}`}>
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">{metric.label}</p>
                      <p className="mt-3 text-3xl font-semibold tracking-tight">{metric.value}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-700">{metric.description}</p>
                      <p className="mt-3 text-xs leading-5 text-slate-500">{metric.warning ?? metric.hint}</p>
                    </div>
                  ))}
                </div>

                <ReportFooter />
              </>
            ) : null}

            {page.id === 'system' ? (
              <>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500">Sistem ve Grafik</p>
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{REPORT_SECTION_COPY.systemTitle}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{REPORT_SECTION_COPY.systemSubtitle}</p>
                </div>

                <div className="mt-8 grid gap-4 xl:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Yerleşim ve Ekipman</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      <p>Yerleşim boyutu: {project.layout.widthM.toFixed(2)} x {project.layout.heightM.toFixed(2)} m</p>
                      <p>Panel karması: {panelMixSummary || 'Belirtilmedi'}</p>
                      <p>Panel sayısı: {results.panelCount}</p>
                      <p>Panel tipi: {project.environment.panelType}</p>
                      <p>İnverter tipi: {project.environment.inverterType}</p>
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Elektrik Modeli / Mühendislik Kısıtları</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      {snapshot.engineering.map((item) => (
                        <p key={item.label}>
                          {item.label}: {item.value}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4">
                    <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Ticari Katman / Finansal Girdiler</p>
                    <div className="mt-4 space-y-2 text-sm text-slate-700">
                      {snapshot.financial.map((item) => (
                        <p key={item.label}>
                          {item.label}: {item.value}
                        </p>
                      ))}
                      <p>Aylık tasarruf: {financialSummary.monthlySavings.toFixed(2)} {project.financial.currency}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                  <p className="mb-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">Üretim Eğrisi / Günlük Güç Profili</p>
                  <ReportChart curve={curve} />
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    Bu grafik gün içi göreceli güç profilini gösterir; gerçek üretim saha, sıcaklık, gölge ve işletme koşullarına göre değişebilir.
                  </p>
                </div>

                <ReportFooter />
              </>
            ) : null}

            {page.id === 'layout' ? (
              <>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500">2D Teknik Çizim</p>
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{REPORT_SECTION_COPY.layoutTitle}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{REPORT_SECTION_COPY.layoutSubtitle}</p>
                </div>

                <div className="mt-8 flex-1">
                  <TechnicalLayoutFigure project={project} />
                </div>

                <ReportFooter />
              </>
            ) : null}

            {page.id === 'review' ? (
              <>
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-slate-500">3D İnceleme</p>
                  <h2 className="mt-2 font-display text-4xl font-semibold tracking-tight">{REPORT_SECTION_COPY.reviewTitle}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{REPORT_SECTION_COPY.reviewSubtitle}</p>
                </div>

                <div className="mt-8">
                  <ReportLayoutReview3D project={project} invalidPanelIds={results.invalidPanelIds} />
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {snapshot.overview.slice(4).map((item) => (
                    <div key={item.label} className="rounded-[24px] border border-slate-200 bg-slate-50 px-5 py-4">
                      <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                      <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
                    </div>
                  ))}
                </div>

                <ReportFooter />
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
