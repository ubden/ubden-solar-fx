import { getPanelSpec } from '@/lib/solar/catalog';
import { getSelectedBrandLabels } from '@/lib/solar/feasibility-config';
import {
  FeasibilityReportSnapshot,
  FinancialSummary,
  MetricComputedState,
  MetricExplanationMap,
  PanelCatalogItem,
  PanelInstance,
  ProjectState,
  YieldResult,
} from '@/lib/solar/types';
import { getPanelFootprint, validateLayout } from '@/lib/solar/layout';
import { clamp, roundTo } from '@/lib/solar/number';

const DEG_TO_RAD = Math.PI / 180;
const ELECTRICAL_WARNING_THRESHOLD = 70;

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

function getBaseMetricWarning(project: ProjectState, yieldResult: YieldResult) {
  if (yieldResult.panelCount === 0) {
    return 'Panel yerleşimi yok. Hesapların dolması için önce panel ekleyin veya oto nesting kullanın.';
  }

  if (project.environment.weatherFactorPct <= 0) {
    return 'Hava faktörü 0 olduğu için üretim sıfıra düşüyor.';
  }

  if (project.environment.peakSunHours <= 0) {
    return 'Pik güneş saati 0 olduğu için günlük enerji hesaplanamıyor.';
  }

  if (yieldResult.lossFactor <= 0) {
    return 'Kayıp katsayısı 0 olduğu için üretim sıfıra düşüyor.';
  }

  if (yieldResult.dailyEnergyKWh <= 0) {
    return 'Panel var ancak mevcut mühendislik girdileriyle üretim 0 hesaplanıyor.';
  }

  return undefined;
}

function getElectricalWarning(project: ProjectState, yieldResult: YieldResult) {
  if (yieldResult.panelCount === 0) {
    return 'Panel yerleşimi olmadığı için elektriksel tutarlılık referansı oluşturulmadı.';
  }

  if (project.engineering.systemVoltage <= 0 || project.engineering.operatingCurrent <= 0) {
    return 'Gerilim veya akım girdisi 0 olduğu için elektriksel referans anlamsız kalıyor.';
  }

  if (yieldResult.electricalConsistencyPct < ELECTRICAL_WARNING_THRESHOLD) {
    return `Kurulu DC güç ile elektriksel referans arasında %${yieldResult.electricalMismatchPct.toFixed(1)} sapma var.`;
  }

  return undefined;
}

export function getMetricState(project: ProjectState, yieldResult: YieldResult): MetricComputedState {
  if (yieldResult.panelCount === 0) {
    return 'empty';
  }

  return getBaseMetricWarning(project, yieldResult) ? 'warning' : 'ready';
}

export function getMetricExplanationMap(project: ProjectState, yieldResult: YieldResult): MetricExplanationMap {
  const baseState = getMetricState(project, yieldResult);
  const baseWarning = getBaseMetricWarning(project, yieldResult);
  const electricalWarning = getElectricalWarning(project, yieldResult);
  const electricalState: MetricComputedState = yieldResult.panelCount === 0 ? 'empty' : electricalWarning ? 'warning' : 'ready';

  return {
    dailyEnergy: {
      state: baseState,
      description: 'Sistemin bir günde optimum koşullarda üreteceği tahmini enerji.',
      hint:
        yieldResult.panelCount > 0
          ? `${yieldResult.panelCount} panel | ${yieldResult.dcNameplateKWp.toFixed(2)} kWp`
          : 'Önce panel ekleyin veya otomatik yerleşim kullanın.',
      warning: baseWarning,
    },
    annualEnergy: {
      state: baseState,
      description: 'Günlük üretimin yıllık projeksiyonu.',
      hint:
        yieldResult.panelCount > 0
          ? `1. yıl faktör ${yieldResult.degradationYearOneFactor.toFixed(3)} | hava ${yieldResult.weatherFactor.toFixed(2)}`
          : 'Panel yerleşimi olmadığı için yıllık projeksiyon beklemede.',
      warning: baseWarning,
    },
    fillFactor: {
      state: yieldResult.panelCount === 0 ? 'empty' : 'ready',
      description: 'Kullanılabilir alanın ne kadarının panellerle kaplandığı.',
      hint:
        yieldResult.panelCount > 0
          ? `${yieldResult.usedAreaM2.toFixed(1)} / ${yieldResult.usableAreaM2.toFixed(1)} m²`
          : 'Panel eklenmediği için doluluk oranı oluşmadı.',
    },
    electricalConsistency: {
      state: electricalState,
      description: 'Kurulu panel gücü ile girilen elektriksel referansın uyumu.',
      hint:
        yieldResult.panelCount > 0
          ? `${yieldResult.electricalReferenceKW.toFixed(2)} kW referans`
          : 'Elektriksel model, kurulu panel gücü oluşunca değerlenir.',
      warning: electricalWarning,
    },
    monthlySavings: {
      state: baseState,
      description: 'Aylık üretimin birim fiyatla çarpımından doğan yaklaşık ekonomik değer.',
      hint:
        yieldResult.panelCount > 0
          ? `${(yieldResult.dailyEnergyKWh * 30).toFixed(1)} kWh/ay eşdeğeri`
          : 'Tasarruf hesabının dolması için panel yerleşimi gerekir.',
      warning: baseWarning,
    },
    coverage: {
      state: baseState,
      description: 'Üretimin aylık tüketimin ne kadarını karşıladığı.',
      hint:
        project.financial.monthlyConsumptionKWh > 0
          ? `${project.financial.monthlyConsumptionKWh.toFixed(0)} kWh/ay tüketime göre`
          : 'Aylık tüketim girilmediği için kapsama oranı referanssız.',
      warning: baseWarning,
    },
    annualSavings: {
      state: baseState,
      description: 'Yıllık üretim üstünden hesaplanan tahmini ekonomik değer.',
      hint:
        yieldResult.panelCount > 0
          ? `${yieldResult.annualEnergyKWh.toFixed(0)} kWh/yıl projeksiyonu`
          : 'Yıllık tasarruf, panel yerleşimi olmadan hesaplanamaz.',
      warning: baseWarning,
    },
  };
}

export function getReportSummary(
  project: ProjectState,
  yieldResult: YieldResult,
  financialSummary: FinancialSummary,
): FeasibilityReportSnapshot {
  const inverterBrands = getSelectedBrandLabels(
    project.feasibility.inverterBrands,
    project.feasibility.inverterBrandOther,
  );
  const panelBrands = getSelectedBrandLabels(project.feasibility.panelBrands, project.feasibility.panelBrandOther);
  const metricStates = getMetricExplanationMap(project, yieldResult);

  return {
    generatedAt: new Date().toISOString(),
    customer: {
      customerName: project.feasibility.customerName,
      phone: project.feasibility.phone,
      addressLine: project.feasibility.addressLine,
      geoLocation: project.feasibility.geoLocation,
    },
    quote: {
      min: project.feasibility.turnkeyPriceMin,
      max: project.feasibility.turnkeyPriceMax,
      currency: project.feasibility.priceCurrency,
      mode: project.feasibility.quoteMode,
      note: project.feasibility.notes,
    },
    inverterBrands,
    panelBrands,
    metricStates: {
      dailyEnergy: metricStates.dailyEnergy.state,
      annualEnergy: metricStates.annualEnergy.state,
      fillFactor: metricStates.fillFactor.state,
      electricalConsistency: metricStates.electricalConsistency.state,
      monthlySavings: metricStates.monthlySavings.state,
      coverage: metricStates.coverage.state,
      annualSavings: metricStates.annualSavings.state,
    },
    overview: [
      { label: 'Günlük Enerji', value: `${yieldResult.dailyEnergyKWh.toFixed(1)} kWh/gün` },
      { label: 'Yıllık Enerji', value: `${yieldResult.annualEnergyKWh.toFixed(0)} kWh/yıl` },
      { label: 'Doluluk Oranı', value: `${yieldResult.fillFactor.toFixed(1)}%` },
      { label: 'Elektriksel Tutarlılık', value: `${yieldResult.electricalConsistencyPct.toFixed(1)}%` },
      { label: 'Aylık Tasarruf', value: `${financialSummary.monthlySavings.toFixed(0)} ${project.financial.currency}` },
      { label: 'Tüketim Karşılama', value: `${financialSummary.coveragePct.toFixed(1)}%` },
      { label: 'Yıllık Tasarruf', value: `${financialSummary.annualSavings.toFixed(0)} ${project.financial.currency}` },
    ],
    engineering: [
      { label: 'Eğim / Azimut', value: `${project.environment.tiltDeg.toFixed(0)}° / ${project.environment.azimuthDeg.toFixed(0)}°` },
      { label: 'Hava Faktörü', value: `${project.environment.weatherFactorPct.toFixed(0)}%` },
      { label: 'Bozulma', value: `${project.environment.degradationPct.toFixed(2)}%` },
      { label: 'Hücre Sıcaklığı', value: `${project.engineering.cellTempC.toFixed(1)}°C` },
      { label: 'Sistem Gerilimi', value: `${project.engineering.systemVoltage.toFixed(0)} V` },
      { label: 'Çalışma Akımı', value: `${project.engineering.operatingCurrent.toFixed(1)} A` },
    ],
    financial: [
      { label: 'Birim Fiyat', value: `${project.financial.unitPrice.toFixed(2)} ${project.financial.currency}/kWh` },
      { label: 'Aylık Tüketim', value: `${project.financial.monthlyConsumptionKWh.toFixed(0)} kWh` },
      { label: 'Günlük Tasarruf', value: `${financialSummary.dailySavings.toFixed(2)} ${project.financial.currency}` },
      { label: 'Yıllık Tasarruf', value: `${financialSummary.annualSavings.toFixed(2)} ${project.financial.currency}` },
    ],
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
