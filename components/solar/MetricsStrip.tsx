'use client';

import { BatteryCharging, Gauge, Layers3, SunMedium, Zap } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { FinancialSummary, YieldResult } from '@/lib/solar/types';

interface MetricsStripProps {
  results: YieldResult;
  financialSummary: FinancialSummary;
}

const metricIcons = {
  daily: SunMedium,
  annual: Zap,
  fill: Layers3,
  electric: Gauge,
  savings: BatteryCharging,
};

export function MetricsStrip({ results, financialSummary }: MetricsStripProps) {
  const { t } = useLanguage();
  const metrics = [
    {
      key: 'daily',
      label: t('metrics.daily_energy'),
      value: `${results.dailyEnergyKWh.toFixed(1)} kWh`,
      hint: t('metrics.daily_hint'),
    },
    {
      key: 'annual',
      label: t('metrics.annual_energy'),
      value: `${results.annualEnergyKWh.toFixed(0)} kWh`,
      hint: t('metrics.annual_hint'),
    },
    {
      key: 'fill',
      label: t('metrics.fill_factor'),
      value: `${results.fillFactor.toFixed(1)}%`,
      hint: `${results.usedAreaM2.toFixed(1)} / ${results.usableAreaM2.toFixed(1)} m²`,
    },
    {
      key: 'electric',
      label: t('metrics.electrical_consistency'),
      value: `${results.electricalConsistencyPct.toFixed(1)}%`,
      hint: `${results.electricalReferenceKW.toFixed(2)} kW ref`,
    },
    {
      key: 'savings',
      label: t('metrics.monthly_savings'),
      value: `${financialSummary.monthlySavings.toFixed(0)} / mo`,
      hint: `${financialSummary.coveragePct.toFixed(1)}% ${t('metrics.coverage')}`,
    },
  ] as const;

  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.key];

        return (
          <article
            key={metric.key}
            className="glass-card relative overflow-hidden border-border/70 bg-linear-to-br from-white to-slate-50 px-5 py-4 dark:from-slate-950 dark:to-slate-900"
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent to-amber-300" />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                {metric.label}
              </span>
              <Icon size={16} className="text-accent" />
            </div>
            <div className="font-display text-3xl font-semibold tracking-tight">{metric.value}</div>
            <p className="mt-2 text-sm text-[color:var(--muted-text)]">{metric.hint}</p>
          </article>
        );
      })}
    </section>
  );
}
