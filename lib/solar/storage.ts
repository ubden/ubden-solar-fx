import { getPanelSpec } from '@/lib/solar/catalog';
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_FEASIBILITY_STATE,
  DEFAULT_PROJECT_STATE,
  LEGACY_CANVAS_SCALE,
  STORAGE_KEY,
} from '@/lib/solar/defaults';
import { clamp, sanitizeNumber } from '@/lib/solar/number';
import { PanelInstance, ProjectState } from '@/lib/solar/types';

type ProjectStateDraft = {
  schemaVersion?: number;
  layout?: Partial<ProjectState['layout']>;
  constraints?: Partial<ProjectState['constraints']>;
  environment?: Partial<ProjectState['environment']>;
  engineering?: Partial<ProjectState['engineering']>;
  financial?: Partial<ProjectState['financial']>;
  camera?: Partial<ProjectState['camera']>;
  feasibility?: Partial<ProjectState['feasibility']>;
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `panel-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function mergeProjectState(partial: ProjectStateDraft): ProjectState {
  return {
    ...DEFAULT_PROJECT_STATE,
    schemaVersion: partial.schemaVersion ?? DEFAULT_PROJECT_STATE.schemaVersion,
    ...partial,
    layout: {
      ...DEFAULT_PROJECT_STATE.layout,
      ...partial.layout,
      panels: partial.layout?.panels ?? DEFAULT_PROJECT_STATE.layout.panels,
    },
    constraints: {
      ...DEFAULT_PROJECT_STATE.constraints,
      ...partial.constraints,
    },
    environment: {
      ...DEFAULT_PROJECT_STATE.environment,
      ...partial.environment,
    },
    engineering: {
      ...DEFAULT_PROJECT_STATE.engineering,
      ...partial.engineering,
    },
    financial: {
      ...DEFAULT_PROJECT_STATE.financial,
      ...partial.financial,
    },
    camera: {
      ...DEFAULT_PROJECT_STATE.camera,
      ...partial.camera,
    },
    feasibility: {
      ...DEFAULT_FEASIBILITY_STATE,
      ...partial.feasibility,
      geoLocation: {
        ...DEFAULT_FEASIBILITY_STATE.geoLocation,
        ...partial.feasibility?.geoLocation,
      },
    },
  };
}

function sanitizeOptionalNumber(value: number | undefined, min?: number, max?: number) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return undefined;
  }

  let nextValue = value;

  if (typeof min === 'number' && nextValue < min) {
    nextValue = min;
  }

  if (typeof max === 'number' && nextValue > max) {
    nextValue = max;
  }

  return nextValue;
}

function migrateLegacyState(): ProjectState {
  const panelSpecId = (localStorage.getItem('panelSize') as ProjectState['environment']['panelSpecId']) ?? 'medium';
  const spec = getPanelSpec(panelSpecId);

  const legacyPanels: PanelInstance[] = (() => {
    const raw = localStorage.getItem('panels');
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Array<{ id: string | number; x: number; y: number; rotation?: number }>;
      return parsed.map((panel) => ({
        id: String(panel.id ?? createId()),
        xM: sanitizeNumber(panel.x / LEGACY_CANVAS_SCALE, 0, 0),
        yM: sanitizeNumber(panel.y / LEGACY_CANVAS_SCALE, 0, 0),
        rotation: panel.rotation === 90 ? 90 : 0,
      }));
    } catch {
      return [];
    }
  })();

  const legacyState = mergeProjectState({
    schemaVersion: CURRENT_SCHEMA_VERSION,
    layout: {
      widthM: sanitizeNumber(Number(localStorage.getItem('layoutWidth')), DEFAULT_PROJECT_STATE.layout.widthM, 4, 100),
      heightM: sanitizeNumber(Number(localStorage.getItem('layoutHeight')), DEFAULT_PROJECT_STATE.layout.heightM, 4, 100),
      autoNestEnabled: true,
      panels: legacyPanels,
      selectedPanelId: legacyPanels[0]?.id ?? null,
    },
    environment: {
      panelSpecId,
      panelType: (localStorage.getItem('panelType') as ProjectState['environment']['panelType']) ?? 'mono',
      inverterType: (localStorage.getItem('inverterType') as ProjectState['environment']['inverterType']) ?? 'string',
      tiltDeg: sanitizeNumber(Number(localStorage.getItem('angle')), DEFAULT_PROJECT_STATE.environment.tiltDeg, 0, 90),
      azimuthDeg: sanitizeNumber(Number(localStorage.getItem('azimuth')), DEFAULT_PROJECT_STATE.environment.azimuthDeg, 0, 360),
      degradationPct: sanitizeNumber(
        Number(localStorage.getItem('degradation')),
        DEFAULT_PROJECT_STATE.environment.degradationPct,
        0,
        25,
      ),
      weatherFactorPct: sanitizeNumber(
        Number(localStorage.getItem('weather')),
        DEFAULT_PROJECT_STATE.environment.weatherFactorPct,
        0,
        100,
      ),
    },
  });

  const engineeringRaw = localStorage.getItem('engineeringParams');
  const financialRaw = localStorage.getItem('financialParams');

  if (engineeringRaw) {
    try {
      legacyState.engineering = {
        ...legacyState.engineering,
        ...JSON.parse(engineeringRaw),
      };
    } catch {
      // Ignore malformed legacy data.
    }
  }

  if (financialRaw) {
    try {
      legacyState.financial = {
        ...legacyState.financial,
        ...JSON.parse(financialRaw),
      };
    } catch {
      // Ignore malformed legacy data.
    }
  }

  legacyState.layout.panels = legacyState.layout.panels.map((panel) => ({
    ...panel,
    xM: clamp(panel.xM, legacyState.constraints.edgeGapM, legacyState.layout.widthM - spec.widthM),
    yM: clamp(panel.yM, legacyState.constraints.edgeGapM, legacyState.layout.heightM - spec.heightM),
  }));

  return sanitizeProjectState(legacyState);
}

export function sanitizeProjectState(project: ProjectState): ProjectState {
  const merged = mergeProjectState(project);

  return {
    ...merged,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    layout: {
      ...merged.layout,
      widthM: sanitizeNumber(merged.layout.widthM, DEFAULT_PROJECT_STATE.layout.widthM, 4, 100),
      heightM: sanitizeNumber(merged.layout.heightM, DEFAULT_PROJECT_STATE.layout.heightM, 4, 100),
      panels: merged.layout.panels.map((panel) => ({
        ...panel,
        xM: sanitizeNumber(panel.xM, 0, 0),
        yM: sanitizeNumber(panel.yM, 0, 0),
        rotation: panel.rotation === 90 ? 90 : 0,
      })),
    },
    constraints: {
      panelGapM: sanitizeNumber(merged.constraints.panelGapM, DEFAULT_PROJECT_STATE.constraints.panelGapM, 0, 1),
      edgeGapM: sanitizeNumber(merged.constraints.edgeGapM, DEFAULT_PROJECT_STATE.constraints.edgeGapM, 0, 2),
      gridStepM: sanitizeNumber(merged.constraints.gridStepM, DEFAULT_PROJECT_STATE.constraints.gridStepM, 0.01, 1),
    },
    environment: {
      ...merged.environment,
      tiltDeg: sanitizeNumber(merged.environment.tiltDeg, DEFAULT_PROJECT_STATE.environment.tiltDeg, 0, 90),
      azimuthDeg: sanitizeNumber(merged.environment.azimuthDeg, DEFAULT_PROJECT_STATE.environment.azimuthDeg, 0, 360),
      degradationPct: sanitizeNumber(
        merged.environment.degradationPct,
        DEFAULT_PROJECT_STATE.environment.degradationPct,
        0,
        25,
      ),
      weatherFactorPct: sanitizeNumber(
        merged.environment.weatherFactorPct,
        DEFAULT_PROJECT_STATE.environment.weatherFactorPct,
        0,
        100,
      ),
      peakSunHours: sanitizeNumber(
        merged.environment.peakSunHours,
        DEFAULT_PROJECT_STATE.environment.peakSunHours,
        0.5,
        12,
      ),
    },
    engineering: {
      tempCoeffPctPerC: sanitizeNumber(
        merged.engineering.tempCoeffPctPerC,
        DEFAULT_PROJECT_STATE.engineering.tempCoeffPctPerC,
        -1,
        0,
      ),
      soilingPct: sanitizeNumber(merged.engineering.soilingPct, DEFAULT_PROJECT_STATE.engineering.soilingPct, 0, 40),
      mismatchPct: sanitizeNumber(merged.engineering.mismatchPct, DEFAULT_PROJECT_STATE.engineering.mismatchPct, 0, 20),
      dcOhmicPct: sanitizeNumber(merged.engineering.dcOhmicPct, DEFAULT_PROJECT_STATE.engineering.dcOhmicPct, 0, 20),
      shadingPct: sanitizeNumber(merged.engineering.shadingPct, DEFAULT_PROJECT_STATE.engineering.shadingPct, 0, 70),
      inverterEfficiencyPct: sanitizeNumber(
        merged.engineering.inverterEfficiencyPct,
        DEFAULT_PROJECT_STATE.engineering.inverterEfficiencyPct,
        70,
        100,
      ),
      systemVoltage: sanitizeNumber(
        merged.engineering.systemVoltage,
        DEFAULT_PROJECT_STATE.engineering.systemVoltage,
        0,
        2000,
      ),
      operatingCurrent: sanitizeNumber(
        merged.engineering.operatingCurrent,
        DEFAULT_PROJECT_STATE.engineering.operatingCurrent,
        0,
        100,
      ),
      cellTempC: sanitizeNumber(merged.engineering.cellTempC, DEFAULT_PROJECT_STATE.engineering.cellTempC, -20, 120),
    },
    financial: {
      ...merged.financial,
      unitPrice: sanitizeNumber(merged.financial.unitPrice, DEFAULT_PROJECT_STATE.financial.unitPrice, 0, 100),
      monthlyConsumptionKWh: sanitizeNumber(
        merged.financial.monthlyConsumptionKWh,
        DEFAULT_PROJECT_STATE.financial.monthlyConsumptionKWh,
        0,
        100000,
      ),
    },
    feasibility: {
      ...merged.feasibility,
      customerName: merged.feasibility.customerName.trimStart(),
      phone: merged.feasibility.phone.trimStart(),
      addressLine: merged.feasibility.addressLine.trimStart(),
      inverterBrands: Array.from(new Set(merged.feasibility.inverterBrands.filter(Boolean))),
      inverterBrandOther: merged.feasibility.inverterBrandOther.trimStart(),
      panelBrands: Array.from(new Set(merged.feasibility.panelBrands.filter(Boolean))),
      panelBrandOther: merged.feasibility.panelBrandOther.trimStart(),
      turnkeyPriceMin: sanitizeOptionalNumber(merged.feasibility.turnkeyPriceMin, 0),
      turnkeyPriceMax: sanitizeOptionalNumber(merged.feasibility.turnkeyPriceMax, 0),
      notes: merged.feasibility.notes.trimStart(),
      geoLocation: {
        ...merged.feasibility.geoLocation,
        latitude: sanitizeOptionalNumber(merged.feasibility.geoLocation.latitude, -90, 90),
        longitude: sanitizeOptionalNumber(merged.feasibility.geoLocation.longitude, -180, 180),
        accuracyMeters: sanitizeOptionalNumber(merged.feasibility.geoLocation.accuracyMeters, 0),
      },
    },
  };
}

function migrateStoredProjectState(project: ProjectStateDraft): ProjectState {
  return sanitizeProjectState({
    ...mergeProjectState(project),
    schemaVersion: CURRENT_SCHEMA_VERSION,
  });
}

export function loadProjectState(): ProjectState {
  if (typeof window === 'undefined') {
    return DEFAULT_PROJECT_STATE;
  }

  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored) {
    try {
      const parsed = JSON.parse(stored) as ProjectStateDraft;
      if (typeof parsed.schemaVersion !== 'number' || parsed.schemaVersion < CURRENT_SCHEMA_VERSION) {
        const migrated = migrateStoredProjectState(parsed);
        saveProjectState(migrated);
        return migrated;
      }

      return sanitizeProjectState(parsed as ProjectState);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  const migrated = migrateLegacyState();
  saveProjectState(migrated);
  return migrated;
}

export function saveProjectState(project: ProjectState) {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(
      sanitizeProjectState({
        ...project,
        schemaVersion: CURRENT_SCHEMA_VERSION,
      }),
    ),
  );
}
