'use client';

import { useEffect, useMemo, useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useElementSize } from '@/hooks/use-element-size';
import { YieldResult } from '@/lib/solar/types';

interface EnergyChartCardProps {
  curve: Array<{ time: string; power: number }>;
  results: YieldResult;
}

export function EnergyChartCard({ curve, results }: EnergyChartCardProps) {
  const { t } = useLanguage();
  const [isMounted, setIsMounted] = useState(false);
  const { ref: chartRef, size } = useElementSize<HTMLDivElement>();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const chartGeometry = useMemo(() => {
    const width = Math.max(size.width, 0);
    const height = Math.max(size.height, 0);
    const padding = { top: 16, right: 16, bottom: 34, left: 42 };
    const innerWidth = Math.max(width - padding.left - padding.right, 1);
    const innerHeight = Math.max(height - padding.top - padding.bottom, 1);
    const peakPower = Math.max(...curve.map((entry) => entry.power), 1);

    const points = curve.map((entry, index) => {
      const x = padding.left + (innerWidth * index) / Math.max(curve.length - 1, 1);
      const y = padding.top + innerHeight - (entry.power / peakPower) * innerHeight;
      return { ...entry, x, y };
    });

    if (points.length === 0) {
      return null;
    }

    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
      .join(' ');
    const areaPath = `${linePath} L ${points.at(-1)!.x.toFixed(2)} ${(padding.top + innerHeight).toFixed(2)} L ${points[0].x.toFixed(2)} ${(padding.top + innerHeight).toFixed(2)} Z`;
    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const value = (peakPower / 4) * (4 - index);
      const y = padding.top + (innerHeight / 4) * index;
      return { value, y };
    });

    return { width, height, padding, points, linePath, areaPath, yTicks };
  }, [curve, size.height, size.width]);

  return (
    <section className="glass-card overflow-hidden border-border/70 bg-white/85 p-5 dark:bg-slate-950/70">
      <div className="mb-5 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[color:var(--muted-text)]">
            {t('chart.label')}
          </p>
          <h2 className="font-display text-2xl font-semibold tracking-tight">{t('chart.title')}</h2>
        </div>
        <div className="rounded-2xl border border-border/80 bg-black/3 px-4 py-2 text-sm text-[color:var(--muted-text)] dark:bg-white/5">
          {t('chart.summary', {
            peak: results.dcNameplateKWp.toFixed(2),
            weather: results.weatherFactor.toFixed(2),
            loss: results.lossFactor.toFixed(2),
          })}
        </div>
      </div>

      <div ref={chartRef} className="h-[300px]">
        {isMounted && chartGeometry ? (
          <svg width={chartGeometry.width} height={chartGeometry.height} className="h-full w-full">
            <defs>
              <linearGradient id="solarCurve" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.42" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {chartGeometry.yTicks.map((tick) => (
              <g key={tick.y}>
                <line
                  x1={chartGeometry.padding.left}
                  y1={tick.y}
                  x2={chartGeometry.width - chartGeometry.padding.right}
                  y2={tick.y}
                  stroke="var(--grid-line)"
                  strokeDasharray="4 6"
                />
                <text
                  x={chartGeometry.padding.left - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  fill="var(--muted-text)"
                  fontSize="11"
                  fontFamily="var(--font-mono-ui)"
                >
                  {tick.value.toFixed(1)}
                </text>
              </g>
            ))}

            <path d={chartGeometry.areaPath} fill="url(#solarCurve)" />
            <path d={chartGeometry.linePath} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />

            {chartGeometry.points.map((point) => (
              <g key={point.time}>
                <circle cx={point.x} cy={point.y} r="3.5" fill="var(--accent)" />
                <text
                  x={point.x}
                  y={chartGeometry.height - 8}
                  textAnchor="middle"
                  fill="var(--muted-text)"
                  fontSize="11"
                  fontFamily="var(--font-mono-ui)"
                >
                  {point.time}
                </text>
              </g>
            ))}
          </svg>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border/70 text-sm text-[color:var(--muted-text)]">
            {t('chart.placeholder')}
          </div>
        )}
      </div>
    </section>
  );
}
