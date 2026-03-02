'use client';

import { BatteryCharging, SlidersHorizontal, Wallet } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { FinancialSummary, ProjectState, YieldResult } from '@/lib/solar/types';

interface ControlSidebarProps {
  project: ProjectState;
  results: YieldResult;
  financialSummary: FinancialSummary;
  onLayoutFieldChange: (key: 'widthM' | 'heightM', value: number) => void;
  onEnvironmentFieldChange: (key: 'panelType' | 'inverterType', value: string | number) => void;
  onFinancialFieldChange: (key: 'unitPrice' | 'currency' | 'monthlyConsumptionKWh', value: string | number) => void;
}

interface RangeFieldProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  sliderMin?: number;
  sliderMax?: number;
  suffix?: string;
  decimals?: number;
  onChange: (value: number) => void;
}

function formatValue(value: number, decimals = 0) {
  return Number.isFinite(value) ? value.toFixed(decimals) : '0';
}

function RangeField({
  label,
  value,
  step = 1,
  min,
  max,
  sliderMin,
  sliderMax,
  suffix,
  decimals = 0,
  onChange,
}: RangeFieldProps) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const rangeMin = typeof sliderMin === 'number' ? sliderMin : min ?? 0;
  const rangeMax = typeof sliderMax === 'number' ? sliderMax : max ?? 100;

  return (
    <label className="rounded-[22px] border border-border/80 bg-white/72 p-4 dark:bg-slate-950/45">
      <div className="flex items-start justify-between gap-3">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">{label}</span>
        <span className="rounded-full border border-border/80 bg-black/5 px-3 py-1 text-sm font-medium dark:bg-white/5">
          {formatValue(safeValue, decimals)} {suffix ?? ''}
        </span>
      </div>

      <input
        type="range"
        value={safeValue}
        step={step}
        min={rangeMin}
        max={rangeMax}
        onChange={(event) => onChange(Number(event.target.value))}
        className="field-slider mt-4"
      />

      <div className="mt-3 flex items-center gap-3">
        <span className="min-w-12 text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--muted-text)]">
          {formatValue(rangeMin, decimals)}
          {suffix}
        </span>
        <input
          type="number"
          value={safeValue}
          step={step}
          min={min}
          max={max}
          onChange={(event) => onChange(Number(event.target.value))}
          className="field-input !py-2 text-right"
        />
        <span className="min-w-12 text-right text-[11px] font-mono uppercase tracking-[0.14em] text-[color:var(--muted-text)]">
          {formatValue(rangeMax, decimals)}
          {suffix}
        </span>
      </div>
    </label>
  );
}

export function ControlSidebar({
  project,
  results,
  financialSummary,
  onLayoutFieldChange,
  onEnvironmentFieldChange,
  onFinancialFieldChange,
}: ControlSidebarProps) {
  const { t } = useLanguage();

  return (
    <aside className="flex flex-col gap-4 xl:sticky xl:top-[92px]">
      <section className="glass-card p-5">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
              {t('sidebar.layout_label')}
            </p>
            <h2 className="font-display text-xl font-semibold">{t('sidebar.layout_title')}</h2>
          </div>
        </div>

        <div className="grid gap-3">
          <RangeField
            label={t('fields.layout_width')}
            value={project.layout.widthM}
            step={0.5}
            min={4}
            max={100}
            sliderMin={4}
            sliderMax={60}
            suffix="m"
            decimals={1}
            onChange={(value) => onLayoutFieldChange('widthM', value)}
          />
          <RangeField
            label={t('fields.layout_height')}
            value={project.layout.heightM}
            step={0.5}
            min={4}
            max={100}
            sliderMin={4}
            sliderMax={60}
            suffix="m"
            decimals={1}
            onChange={(value) => onLayoutFieldChange('heightM', value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2 rounded-[22px] border border-border/80 bg-white/72 p-4 dark:bg-slate-950/45">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
                {t('fields.panel_type')}
              </span>
              <select
                value={project.environment.panelType}
                onChange={(event) => onEnvironmentFieldChange('panelType', event.target.value)}
                className="field-input"
              >
                <option value="mono">{t('panel.mono')}</option>
                <option value="poly">{t('panel.poly')}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 rounded-[22px] border border-border/80 bg-white/72 p-4 dark:bg-slate-950/45">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
                {t('fields.inverter_type')}
              </span>
              <select
                value={project.environment.inverterType}
                onChange={(event) => onEnvironmentFieldChange('inverterType', event.target.value)}
                className="field-input"
              >
                <option value="string">{t('inverter.string')}</option>
                <option value="micro">{t('inverter.micro')}</option>
                <option value="hybrid">{t('inverter.hybrid')}</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      <details className="glass-card group p-5" open>
        <summary className="flex cursor-pointer list-none items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
              <Wallet size={18} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                {t('sidebar.financial_label')}
              </p>
              <h3 className="font-display text-lg font-semibold">{t('sidebar.financial_title')}</h3>
            </div>
          </div>
          <span className="text-xs text-[color:var(--muted-text)] group-open:rotate-180">⌄</span>
        </summary>

        <div className="mt-4 grid gap-3">
          <RangeField
            label={t('fields.unit_price')}
            value={project.financial.unitPrice}
            step={0.01}
            min={0}
            max={100}
            sliderMin={0}
            sliderMax={2}
            suffix={project.financial.currency}
            decimals={2}
            onChange={(value) => onFinancialFieldChange('unitPrice', value)}
          />
          <label className="flex flex-col gap-2 rounded-[22px] border border-border/80 bg-white/72 p-4 dark:bg-slate-950/45">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
              {t('fields.currency')}
            </span>
            <select
              value={project.financial.currency}
              onChange={(event) => onFinancialFieldChange('currency', event.target.value)}
              className="field-input"
            >
              <option value="$">$ USD</option>
              <option value="€">€ EUR</option>
              <option value="₺">₺ TRY</option>
            </select>
          </label>
          <RangeField
            label={t('fields.monthly_consumption')}
            value={project.financial.monthlyConsumptionKWh}
            step={10}
            min={0}
            max={100000}
            sliderMin={0}
            sliderMax={3000}
            suffix="kWh"
            decimals={0}
            onChange={(value) => onFinancialFieldChange('monthlyConsumptionKWh', value)}
          />
        </div>
      </details>

      <section className="glass-card border-border/70 bg-linear-to-br from-slate-950 to-slate-900 p-5 text-white">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-amber-300">
            <BatteryCharging size={18} />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-white/60">
              {t('sidebar.summary_label')}
            </p>
            <h3 className="font-display text-lg font-semibold">{t('sidebar.summary_title')}</h3>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-white/65">{t('summary.year_one_factor')}</span>
            <strong>{(results.degradationYearOneFactor * 100).toFixed(1)}%</strong>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-white/65">{t('summary.coverage')}</span>
            <strong>{financialSummary.coveragePct.toFixed(1)}%</strong>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <span className="text-white/65">{t('summary.annual_savings')}</span>
            <strong>
              {financialSummary.annualSavings.toFixed(0)} {project.financial.currency}
            </strong>
          </div>
        </div>
      </section>
    </aside>
  );
}
