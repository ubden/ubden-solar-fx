import { ProjectState } from '@/lib/solar/types';

export const STORAGE_KEY = 'ubden-solar-fx:v2';
export const LEGACY_CANVAS_SCALE = 40;

export const DEFAULT_PROJECT_STATE: ProjectState = {
  layout: {
    widthM: 10,
    heightM: 10,
    autoNestEnabled: true,
    panels: [],
    selectedPanelId: null,
  },
  constraints: {
    panelGapM: 0.12,
    edgeGapM: 0.2,
    gridStepM: 0.05,
  },
  environment: {
    panelSpecId: 'medium',
    panelType: 'mono',
    inverterType: 'string',
    tiltDeg: 30,
    azimuthDeg: 180,
    degradationPct: 0.5,
    weatherFactorPct: 90,
    peakSunHours: 5.5,
    workspaceMode: 'precision',
  },
  engineering: {
    tempCoeffPctPerC: -0.35,
    soilingPct: 2,
    mismatchPct: 1.5,
    dcOhmicPct: 1,
    shadingPct: 3,
    inverterEfficiencyPct: 97.5,
    systemVoltage: 840,
    operatingCurrent: 12.4,
    cellTempC: 42.5,
  },
  financial: {
    unitPrice: 0.15,
    currency: '$',
    monthlyConsumptionKWh: 450,
  },
  camera: {
    preset: 'fit',
  },
};
