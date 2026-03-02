'use client';

import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

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
        {isMounted && size.width > 0 && size.height > 0 ? (
          <AreaChart width={size.width} height={size.height} data={curve}>
            <defs>
              <linearGradient id="solarCurve" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.45} />
                <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--grid-line)" vertical={false} />
            <XAxis
              dataKey="time"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-text)', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--muted-text)', fontSize: 11 }}
              unit=" kW"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '16px',
                borderColor: 'var(--border)',
                background: 'color-mix(in srgb, var(--card-bg) 92%, transparent)',
              }}
            />
            <Area
              type="monotone"
              dataKey="power"
              stroke="var(--accent)"
              strokeWidth={2}
              fill="url(#solarCurve)"
            />
          </AreaChart>
        ) : (
          <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-border/70 text-sm text-[color:var(--muted-text)]">
            {t('chart.placeholder')}
          </div>
        )}
      </div>
    </section>
  );
}
