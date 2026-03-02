'use client';

import { BatteryCharging, Gauge, ShieldAlert, SlidersHorizontal, Wallet } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { FinancialSummary, ProjectState, YieldResult } from '@/lib/solar/types';

interface ControlSidebarProps {
  project: ProjectState;
  results: YieldResult;
  financialSummary: FinancialSummary;
  onLayoutFieldChange: (key: 'widthM' | 'heightM', value: number) => void;
  onEnvironmentFieldChange: (
    key: 'panelType' | 'inverterType' | 'tiltDeg' | 'azimuthDeg' | 'degradationPct' | 'weatherFactorPct' | 'peakSunHours',
    value: string | number,
  ) => void;
  onEngineeringFieldChange: (
    key:
      | 'systemVoltage'
      | 'operatingCurrent'
      | 'cellTempC'
      | 'tempCoeffPctPerC'
      | 'soilingPct'
      | 'mismatchPct'
      | 'dcOhmicPct'
      | 'shadingPct'
      | 'inverterEfficiencyPct',
    value: number,
  ) => void;
  onFinancialFieldChange: (key: 'unitPrice' | 'currency' | 'monthlyConsumptionKWh', value: string | number) => void;
}

interface NumberFieldProps {
  label: string;
  value: number;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

function NumberField({ label, value, step = 1, min, max, suffix, onChange }: NumberFieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
        {label}
      </span>
      <div className="relative">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(event) => onChange(Number(event.target.value))}
          className="field-input pr-11"
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 inline-flex items-center text-xs text-[color:var(--muted-text)]">
            {suffix}
          </span>
        ) : null}
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
  onEngineeringFieldChange,
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

        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label={t('fields.layout_width')}
            value={project.layout.widthM}
            step={0.5}
            min={4}
            suffix="m"
            onChange={(value) => onLayoutFieldChange('widthM', value)}
          />
          <NumberField
            label={t('fields.layout_height')}
            value={project.layout.heightM}
            step={0.5}
            min={4}
            suffix="m"
            onChange={(value) => onLayoutFieldChange('heightM', value)}
          />
        </div>

        <div className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
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
            <label className="flex flex-col gap-2">
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

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.tilt')}
              value={project.environment.tiltDeg}
              min={0}
              max={90}
              suffix="°"
              onChange={(value) => onEnvironmentFieldChange('tiltDeg', value)}
            />
            <NumberField
              label={t('fields.azimuth')}
              value={project.environment.azimuthDeg}
              min={0}
              max={360}
              suffix="°"
              onChange={(value) => onEnvironmentFieldChange('azimuthDeg', value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.weather_factor')}
              value={project.environment.weatherFactorPct}
              min={0}
              max={100}
              suffix="%"
              onChange={(value) => onEnvironmentFieldChange('weatherFactorPct', value)}
            />
            <NumberField
              label={t('fields.peak_sun_hours')}
              value={project.environment.peakSunHours}
              step={0.1}
              min={0.5}
              max={12}
              suffix="h"
              onChange={(value) => onEnvironmentFieldChange('peakSunHours', value)}
            />
          </div>

          <NumberField
            label={t('fields.degradation')}
            value={project.environment.degradationPct}
            step={0.1}
            min={0}
            max={25}
            suffix="%"
            onChange={(value) => onEnvironmentFieldChange('degradationPct', value)}
          />
        </div>
      </section>

      <details className="glass-card group p-5" open>
        <summary className="flex cursor-pointer list-none items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent/12 text-accent">
              <Gauge size={18} />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
                {t('sidebar.engineering_label')}
              </p>
              <h3 className="font-display text-lg font-semibold">{t('sidebar.engineering_title')}</h3>
            </div>
          </div>
          <span className="text-xs text-[color:var(--muted-text)] group-open:rotate-180">⌄</span>
        </summary>

        <div className="mt-4 grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.system_voltage')}
              value={project.engineering.systemVoltage}
              min={0}
              max={2000}
              suffix="V"
              onChange={(value) => onEngineeringFieldChange('systemVoltage', value)}
            />
            <NumberField
              label={t('fields.operating_current')}
              value={project.engineering.operatingCurrent}
              step={0.1}
              min={0}
              max={100}
              suffix="A"
              onChange={(value) => onEngineeringFieldChange('operatingCurrent', value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.cell_temp')}
              value={project.engineering.cellTempC}
              step={0.1}
              min={-20}
              max={120}
              suffix="°C"
              onChange={(value) => onEngineeringFieldChange('cellTempC', value)}
            />
            <NumberField
              label={t('fields.temp_coeff')}
              value={project.engineering.tempCoeffPctPerC}
              step={0.01}
              min={-1}
              max={0}
              suffix="%/°C"
              onChange={(value) => onEngineeringFieldChange('tempCoeffPctPerC', value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.soiling')}
              value={project.engineering.soilingPct}
              step={0.1}
              min={0}
              max={40}
              suffix="%"
              onChange={(value) => onEngineeringFieldChange('soilingPct', value)}
            />
            <NumberField
              label={t('fields.mismatch')}
              value={project.engineering.mismatchPct}
              step={0.1}
              min={0}
              max={20}
              suffix="%"
              onChange={(value) => onEngineeringFieldChange('mismatchPct', value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.dc_ohmic')}
              value={project.engineering.dcOhmicPct}
              step={0.1}
              min={0}
              max={20}
              suffix="%"
              onChange={(value) => onEngineeringFieldChange('dcOhmicPct', value)}
            />
            <NumberField
              label={t('fields.shading')}
              value={project.engineering.shadingPct}
              step={0.1}
              min={0}
              max={70}
              suffix="%"
              onChange={(value) => onEngineeringFieldChange('shadingPct', value)}
            />
          </div>
          <NumberField
            label={t('fields.inverter_efficiency')}
            value={project.engineering.inverterEfficiencyPct}
            step={0.1}
            min={70}
            max={100}
            suffix="%"
            onChange={(value) => onEngineeringFieldChange('inverterEfficiencyPct', value)}
          />
        </div>
      </details>

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
          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label={t('fields.unit_price')}
              value={project.financial.unitPrice}
              step={0.01}
              min={0}
              suffix={project.financial.currency}
              onChange={(value) => onFinancialFieldChange('unitPrice', value)}
            />
            <label className="flex flex-col gap-2">
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
          </div>
          <NumberField
            label={t('fields.monthly_consumption')}
            value={project.financial.monthlyConsumptionKWh}
            step={1}
            min={0}
            suffix="kWh"
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

      {results.invalidPanelIds.length > 0 || results.electricalConsistencyPct < 80 ? (
        <section className="glass-card border-amber-400/35 bg-amber-500/10 p-5">
          <div className="mb-3 flex items-center gap-3 text-amber-700 dark:text-amber-300">
            <ShieldAlert size={18} />
            <h3 className="font-display text-lg font-semibold">{t('warnings.title')}</h3>
          </div>
          <ul className="space-y-2 text-sm text-[color:var(--text)]">
            {results.invalidPanelIds.length > 0 ? (
              <li>{t('warnings.invalid_panels', { count: String(results.invalidPanelIds.length) })}</li>
            ) : null}
            {results.electricalConsistencyPct < 80 ? (
              <li>
                {t('warnings.electrical_mismatch', {
                  mismatch: results.electricalMismatchPct.toFixed(1),
                  ref: results.electricalReferenceKW.toFixed(2),
                })}
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
    </aside>
  );
}
