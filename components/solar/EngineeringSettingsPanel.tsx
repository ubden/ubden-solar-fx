'use client';

import { Gauge, RefreshCcw, ShieldAlert, WandSparkles } from 'lucide-react';

import { useLanguage } from '@/context/LanguageContext';
import { ENGINEERING_TEMPLATES } from '@/lib/solar/engineering-presets';
import { EngineeringTemplateId, ProjectState, YieldResult } from '@/lib/solar/types';

interface EngineeringSettingsPanelProps {
  project: ProjectState;
  results: YieldResult;
  onEnvironmentFieldChange: (
    key:
      | 'tiltDeg'
      | 'azimuthDeg'
      | 'degradationPct'
      | 'weatherFactorPct'
      | 'peakSunHours'
      | 'profileTemplateId',
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
  onApplyEngineeringTemplate: (templateId: Exclude<EngineeringTemplateId, 'manual'>) => void;
  onResetTechnicalDefaults: () => void;
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

function TemplateCard({
  active,
  label,
  description,
  onClick,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-[22px] border px-4 py-4 text-left transition',
        active
          ? 'border-accent bg-amber-50 shadow-[0_8px_24px_rgba(245,158,11,0.12)] dark:bg-amber-500/12'
          : 'border-border/80 bg-white/70 hover:border-accent/60 dark:bg-slate-950/40',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {active ? <span className="rounded-full bg-accent px-2 py-1 text-[10px] font-mono uppercase tracking-[0.18em] text-slate-950">Aktif</span> : null}
      </div>
      <p className="mt-2 text-xs leading-5 text-[color:var(--muted-text)]">{description}</p>
    </button>
  );
}

export function EngineeringSettingsPanel({
  project,
  results,
  onEnvironmentFieldChange,
  onEngineeringFieldChange,
  onApplyEngineeringTemplate,
  onResetTechnicalDefaults,
}: EngineeringSettingsPanelProps) {
  const { t } = useLanguage();
  const zeroProductionWarning = results.panelCount > 0 && results.dailyEnergyKWh <= 0;

  return (
    <section className="glass-card overflow-hidden border-border/70 bg-white/88 dark:bg-slate-950/72">
      <div className="border-b border-border/80 bg-linear-to-r from-white via-white to-amber-50/60 px-4 py-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/80 md:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/12 text-accent">
            <Gauge size={20} />
          </div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[color:var(--muted-text)]">
              {t('sidebar.engineering_label')}
            </p>
            <h2 className="font-display text-2xl font-semibold tracking-tight">{t('sidebar.engineering_title')}</h2>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-4 md:p-5">
        <div className="rounded-[24px] border border-border/80 bg-white/70 p-5 dark:bg-slate-950/45">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <WandSparkles size={16} className="text-accent" />
              <div>
                <p className="text-sm font-medium">Ulusal teknik profil örnekleri</p>
                <p className="text-xs text-[color:var(--muted-text)]">
                  Örnek saha varsayımlarını tek tıkla yükleyin. Manuel düzenleme yaptığınızda profil manuel moda döner.
                </p>
              </div>
            </div>
            <button type="button" onClick={onResetTechnicalDefaults} className="action-button-secondary !px-4 !py-2">
              <RefreshCcw size={15} />
              Varsayılanı Yükle
            </button>
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {ENGINEERING_TEMPLATES.map((template) => (
              <TemplateCard
                key={template.id}
                active={project.environment.profileTemplateId === template.id}
                label={template.label}
                description={template.description}
                onClick={() => onApplyEngineeringTemplate(template.id)}
              />
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <RangeField
            label={t('fields.tilt')}
            value={project.environment.tiltDeg}
            min={0}
            max={90}
            suffix="°"
            decimals={0}
            onChange={(value) => onEnvironmentFieldChange('tiltDeg', value)}
          />
          <RangeField
            label={t('fields.azimuth')}
            value={project.environment.azimuthDeg}
            min={0}
            max={360}
            sliderMin={90}
            sliderMax={270}
            suffix="°"
            decimals={0}
            onChange={(value) => onEnvironmentFieldChange('azimuthDeg', value)}
          />
          <RangeField
            label={t('fields.weather_factor')}
            value={project.environment.weatherFactorPct}
            min={0}
            max={100}
            suffix="%"
            decimals={0}
            onChange={(value) => onEnvironmentFieldChange('weatherFactorPct', value)}
          />
          <RangeField
            label={t('fields.peak_sun_hours')}
            value={project.environment.peakSunHours}
            step={0.1}
            min={0.5}
            max={12}
            sliderMin={2}
            sliderMax={8}
            suffix="h"
            decimals={1}
            onChange={(value) => onEnvironmentFieldChange('peakSunHours', value)}
          />
          <RangeField
            label={t('fields.degradation')}
            value={project.environment.degradationPct}
            step={0.05}
            min={0}
            max={25}
            sliderMin={0}
            sliderMax={2}
            suffix="%"
            decimals={2}
            onChange={(value) => onEnvironmentFieldChange('degradationPct', value)}
          />
          <RangeField
            label={t('fields.system_voltage')}
            value={project.engineering.systemVoltage}
            step={10}
            min={0}
            max={2000}
            sliderMin={300}
            sliderMax={1200}
            suffix="V"
            decimals={0}
            onChange={(value) => onEngineeringFieldChange('systemVoltage', value)}
          />
          <RangeField
            label={t('fields.operating_current')}
            value={project.engineering.operatingCurrent}
            step={0.1}
            min={0}
            max={100}
            sliderMin={0}
            sliderMax={25}
            suffix="A"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('operatingCurrent', value)}
          />
          <RangeField
            label={t('fields.cell_temp')}
            value={project.engineering.cellTempC}
            step={0.5}
            min={-20}
            max={120}
            sliderMin={10}
            sliderMax={70}
            suffix="°C"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('cellTempC', value)}
          />
          <RangeField
            label={t('fields.temp_coeff')}
            value={project.engineering.tempCoeffPctPerC}
            step={0.01}
            min={-1}
            max={0}
            sliderMin={-0.6}
            sliderMax={-0.2}
            suffix="%/°C"
            decimals={2}
            onChange={(value) => onEngineeringFieldChange('tempCoeffPctPerC', value)}
          />
          <RangeField
            label={t('fields.soiling')}
            value={project.engineering.soilingPct}
            step={0.1}
            min={0}
            max={40}
            sliderMin={0}
            sliderMax={12}
            suffix="%"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('soilingPct', value)}
          />
          <RangeField
            label={t('fields.mismatch')}
            value={project.engineering.mismatchPct}
            step={0.1}
            min={0}
            max={20}
            sliderMin={0}
            sliderMax={8}
            suffix="%"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('mismatchPct', value)}
          />
          <RangeField
            label={t('fields.dc_ohmic')}
            value={project.engineering.dcOhmicPct}
            step={0.1}
            min={0}
            max={20}
            sliderMin={0}
            sliderMax={8}
            suffix="%"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('dcOhmicPct', value)}
          />
          <RangeField
            label={t('fields.shading')}
            value={project.engineering.shadingPct}
            step={0.1}
            min={0}
            max={70}
            sliderMin={0}
            sliderMax={25}
            suffix="%"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('shadingPct', value)}
          />
          <RangeField
            label={t('fields.inverter_efficiency')}
            value={project.engineering.inverterEfficiencyPct}
            step={0.1}
            min={70}
            max={100}
            sliderMin={92}
            sliderMax={100}
            suffix="%"
            decimals={1}
            onChange={(value) => onEngineeringFieldChange('inverterEfficiencyPct', value)}
          />
        </div>

        {zeroProductionWarning || results.invalidPanelIds.length > 0 || results.electricalConsistencyPct < 80 ? (
          <section className="rounded-[24px] border border-amber-400/35 bg-amber-500/10 p-5">
            <div className="mb-3 flex items-center gap-3 text-amber-700 dark:text-amber-300">
              <ShieldAlert size={18} />
              <h3 className="font-display text-lg font-semibold">{t('warnings.title')}</h3>
            </div>
            <ul className="space-y-2 text-sm text-[color:var(--text)]">
              {zeroProductionWarning ? (
                <li>Panel var ancak mevcut mühendislik girdileriyle üretim 0 hesaplanıyor. Varsayılan teknik profili yükleyin veya örnek ülke şablonlarından birini uygulayın.</li>
              ) : null}
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

            {zeroProductionWarning ? (
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={onResetTechnicalDefaults} className="action-button-secondary !px-4 !py-2">
                  <RefreshCcw size={15} />
                  Varsayılan teknik profil
                </button>
                <button
                  type="button"
                  onClick={() => onApplyEngineeringTemplate('tr-central')}
                  className="action-button-secondary !px-4 !py-2"
                >
                  <WandSparkles size={15} />
                  Türkiye örneğini uygula
                </button>
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </section>
  );
}
