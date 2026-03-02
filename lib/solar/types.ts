export type PanelSizeId = 'small' | 'medium' | 'large';
export type PanelType = 'mono' | 'poly';
export type InverterType = 'string' | 'micro' | 'hybrid';
export type WorkspaceMode = 'precision' | 'review3d';
export type CameraPreset = 'fit' | 'top' | 'front' | 'iso' | 'reset';
export type CurrencySymbol = '$' | '€' | '₺';
export type Rotation = 0 | 90;

export interface PanelCatalogItem {
  id: PanelSizeId;
  label: string;
  labelKey: string;
  widthM: number;
  heightM: number;
  wattsStc: number;
  cellColumns: number;
  cellRows: number;
}

export interface PanelInstance {
  id: string;
  xM: number;
  yM: number;
  rotation: Rotation;
}

export interface LayoutSpec {
  widthM: number;
  heightM: number;
  autoNestEnabled: boolean;
  panels: PanelInstance[];
  selectedPanelId: string | null;
}

export interface PlacementConstraints {
  panelGapM: number;
  edgeGapM: number;
  gridStepM: number;
}

export interface EnvironmentSettings {
  panelSpecId: PanelSizeId;
  panelType: PanelType;
  inverterType: InverterType;
  tiltDeg: number;
  azimuthDeg: number;
  degradationPct: number;
  weatherFactorPct: number;
  peakSunHours: number;
  workspaceMode: WorkspaceMode;
}

export interface EngineeringSettings {
  tempCoeffPctPerC: number;
  soilingPct: number;
  mismatchPct: number;
  dcOhmicPct: number;
  shadingPct: number;
  inverterEfficiencyPct: number;
  systemVoltage: number;
  operatingCurrent: number;
  cellTempC: number;
}

export interface FinancialSettings {
  unitPrice: number;
  currency: CurrencySymbol;
  monthlyConsumptionKWh: number;
}

export interface CameraViewState {
  preset: CameraPreset;
}

export interface ProjectState {
  layout: LayoutSpec;
  constraints: PlacementConstraints;
  environment: EnvironmentSettings;
  engineering: EngineeringSettings;
  financial: FinancialSettings;
  camera: CameraViewState;
}

export interface LayoutFootprint {
  widthM: number;
  heightM: number;
}

export interface PlacementResult {
  xM: number;
  yM: number;
  valid: boolean;
}

export interface LayoutValidationResult {
  invalidPanelIds: string[];
  fillFactor: number;
  usableAreaRatio: number;
  usedAreaM2: number;
  usableAreaM2: number;
}

export interface YieldResult extends LayoutValidationResult {
  panelCount: number;
  dcNameplateKWp: number;
  tiltFactor: number;
  azimuthFactor: number;
  tempFactor: number;
  weatherFactor: number;
  lossFactor: number;
  degradationYearOneFactor: number;
  dailyEnergyKWh: number;
  annualEnergyKWh: number;
  electricalReferenceKW: number;
  electricalConsistencyPct: number;
  electricalMismatchPct: number;
}

export interface FinancialSummary {
  dailySavings: number;
  annualSavings: number;
  monthlySavings: number;
  coveragePct: number;
}
