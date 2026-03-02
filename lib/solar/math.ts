import { getPanelSpec } from '@/lib/solar/catalog';
import { FinancialSummary, PanelCatalogItem, PanelInstance, ProjectState, YieldResult } from '@/lib/solar/types';
import { getPanelFootprint, validateLayout } from '@/lib/solar/layout';
import { clamp, roundTo } from '@/lib/solar/number';

const DEG_TO_RAD = Math.PI / 180;

function getTotalPanelArea(panels: PanelInstance[], spec: PanelCatalogItem): number {
  return panels.reduce((sum, panel) => {
    const footprint = getPanelFootprint(spec, panel.rotation);
    return sum + footprint.widthM * footprint.heightM;
  }, 0);
}

export function calculateYield(project: ProjectState): YieldResult {
  const spec = getPanelSpec(project.environment.panelSpecId);
  const panelCount = project.layout.panels.length;
  const validation = validateLayout(project.layout, spec, project.constraints);

  const dcNameplateKWp = (panelCount * spec.wattsStc) / 1000;
  const tiltFactor = clamp(Math.cos((project.environment.tiltDeg - 30) * DEG_TO_RAD), 0, 1);
  const azimuthDeviation = Math.min(Math.abs(project.environment.azimuthDeg - 180), 180);
  const azimuthFactor = clamp(Math.cos(azimuthDeviation * DEG_TO_RAD), 0, 1);
  const tempFactor = clamp(
    1 + (project.engineering.tempCoeffPctPerC / 100) * (project.engineering.cellTempC - 25),
    0,
    1.1,
  );
  const weatherFactor = clamp(project.environment.weatherFactorPct / 100, 0, 1);
  const soilingFactor = 1 - clamp(project.engineering.soilingPct / 100, 0, 0.95);
  const mismatchFactor = 1 - clamp(project.engineering.mismatchPct / 100, 0, 0.95);
  const dcOhmicFactor = 1 - clamp(project.engineering.dcOhmicPct / 100, 0, 0.95);
  const shadingFactor = 1 - clamp(project.engineering.shadingPct / 100, 0, 0.95);
  const inverterFactor = clamp(project.engineering.inverterEfficiencyPct / 100, 0, 1);
  const lossFactor = soilingFactor * mismatchFactor * dcOhmicFactor * shadingFactor * inverterFactor;
  const degradationYearOneFactor = 1 - clamp(project.environment.degradationPct / 100, 0, 0.25);
  const dailyEnergyKWh =
    dcNameplateKWp *
    project.environment.peakSunHours *
    weatherFactor *
    tiltFactor *
    azimuthFactor *
    tempFactor *
    lossFactor;
  const annualEnergyKWh = dailyEnergyKWh * 365;

  const electricalReferenceKW = (project.engineering.systemVoltage * project.engineering.operatingCurrent) / 1000;
  const electricalMismatchPct =
    dcNameplateKWp > 0 ? (Math.abs(electricalReferenceKW - dcNameplateKWp) / dcNameplateKWp) * 100 : 0;
  const electricalConsistencyPct = clamp(100 - electricalMismatchPct, 0, 100);

  return {
    ...validation,
    panelCount,
    dcNameplateKWp: roundTo(dcNameplateKWp, 2),
    tiltFactor: roundTo(tiltFactor, 3),
    azimuthFactor: roundTo(azimuthFactor, 3),
    tempFactor: roundTo(tempFactor, 3),
    weatherFactor: roundTo(weatherFactor, 3),
    lossFactor: roundTo(lossFactor, 3),
    degradationYearOneFactor: roundTo(degradationYearOneFactor, 3),
    dailyEnergyKWh: roundTo(dailyEnergyKWh, 2),
    annualEnergyKWh: roundTo(annualEnergyKWh, 0),
    electricalReferenceKW: roundTo(electricalReferenceKW, 2),
    electricalConsistencyPct: roundTo(electricalConsistencyPct, 1),
    electricalMismatchPct: roundTo(electricalMismatchPct, 1),
  };
}

export function calculateFinancialSummary(project: ProjectState, yieldResult: YieldResult): FinancialSummary {
  const dailySavings = yieldResult.dailyEnergyKWh * project.financial.unitPrice;
  const annualSavings = yieldResult.annualEnergyKWh * project.financial.unitPrice;
  const monthlySavings = annualSavings / 12;
  const monthlyProduction = yieldResult.dailyEnergyKWh * 30;
  const coveragePct =
    project.financial.monthlyConsumptionKWh > 0
      ? clamp((monthlyProduction / project.financial.monthlyConsumptionKWh) * 100, 0, 1000)
      : 0;

  return {
    dailySavings: roundTo(dailySavings, 2),
    annualSavings: roundTo(annualSavings, 2),
    monthlySavings: roundTo(monthlySavings, 2),
    coveragePct: roundTo(coveragePct, 1),
  };
}

export function createGenerationCurve(yieldResult: YieldResult) {
  const profile = [
    { label: '06:00', multiplier: 0 },
    { label: '08:00', multiplier: 0.18 },
    { label: '10:00', multiplier: 0.55 },
    { label: '12:00', multiplier: 1 },
    { label: '14:00', multiplier: 0.88 },
    { label: '16:00', multiplier: 0.48 },
    { label: '18:00', multiplier: 0.15 },
    { label: '20:00', multiplier: 0 },
  ];
  const peakPower = yieldResult.dcNameplateKWp * yieldResult.tempFactor * yieldResult.lossFactor;

  return profile.map((entry) => ({
    time: entry.label,
    power: roundTo(peakPower * entry.multiplier, 2),
  }));
}

export function getProjectPanelArea(project: ProjectState): number {
  const spec = getPanelSpec(project.environment.panelSpecId);
  return roundTo(getTotalPanelArea(project.layout.panels, spec), 2);
}
