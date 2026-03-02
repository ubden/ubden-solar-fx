'use client';

import { BatteryCharging, Gauge, Layers3, PiggyBank, PlugZap, SunMedium, Zap } from 'lucide-react';

import { MetricDefinition } from '@/lib/solar/types';

interface MetricsStripProps {
  metrics: MetricDefinition[];
}

const metricIcons = {
  dailyEnergy: SunMedium,
  annualEnergy: Zap,
  fillFactor: Layers3,
  electricalConsistency: Gauge,
  monthlySavings: BatteryCharging,
  coverage: PlugZap,
  annualSavings: PiggyBank,
};

function getStateTone(state: MetricDefinition['state']) {
  if (state === 'warning') {
    return 'border-amber-300/80 from-amber-50 to-white';
  }

  if (state === 'empty') {
    return 'border-border/70 from-slate-50 to-white';
  }

  return 'border-emerald-300/60 from-white to-emerald-50';
}

export function MetricsStrip({ metrics }: MetricsStripProps) {
  return (
    <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
      {metrics.map((metric) => {
        const Icon = metricIcons[metric.id];
        const helperLine = metric.warning ?? metric.hint;

        return (
          <article
            key={metric.id}
            className={[
              'glass-card relative overflow-hidden px-5 py-4',
              `bg-linear-to-br ${getStateTone(metric.state)}`,
            ].join(' ')}
          >
            <div
              className={[
                'absolute inset-x-0 top-0 h-1',
                metric.state === 'warning'
                  ? 'bg-linear-to-r from-amber-500 to-orange-300'
                  : metric.state === 'empty'
                    ? 'bg-linear-to-r from-slate-300 to-slate-200'
                    : 'bg-linear-to-r from-emerald-400 to-accent',
              ].join(' ')}
            />
            <div className="mb-4 flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                {metric.label}
              </span>
              <Icon size={16} className="text-accent" />
            </div>
            <div className="font-display text-3xl font-semibold tracking-tight">{metric.value}</div>
            <p className="mt-2 text-sm text-[color:var(--text)]">{metric.description}</p>
            <p className="mt-2 text-sm text-[color:var(--muted-text)]">{helperLine}</p>
          </article>
        );
      })}
    </section>
  );
}
