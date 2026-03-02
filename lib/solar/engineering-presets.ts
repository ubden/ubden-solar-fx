import { DEFAULT_PROJECT_STATE } from '@/lib/solar/defaults';
import { EngineeringTemplateId, ProjectState } from '@/lib/solar/types';

type TemplateEnvironmentFields = Pick<
  ProjectState['environment'],
  'profileTemplateId' | 'tiltDeg' | 'azimuthDeg' | 'weatherFactorPct' | 'peakSunHours' | 'degradationPct'
>;

type TemplateEngineeringFields = Pick<
  ProjectState['engineering'],
  | 'systemVoltage'
  | 'operatingCurrent'
  | 'cellTempC'
  | 'tempCoeffPctPerC'
  | 'soilingPct'
  | 'mismatchPct'
  | 'dcOhmicPct'
  | 'shadingPct'
  | 'inverterEfficiencyPct'
>;

export interface EngineeringTemplate {
  id: Exclude<EngineeringTemplateId, 'manual'>;
  label: string;
  description: string;
  environment: TemplateEnvironmentFields;
  engineering: TemplateEngineeringFields;
}

export const ENGINEERING_TEMPLATES: EngineeringTemplate[] = [
  {
    id: 'tr-central',
    label: 'Türkiye / İç Anadolu',
    description: 'Yüksek güneşlenme, sıcak hücre sıcaklığı ve dengeli kayıp varsayımları.',
    environment: {
      profileTemplateId: 'tr-central',
      tiltDeg: 30,
      azimuthDeg: 180,
      weatherFactorPct: 88,
      peakSunHours: 5.7,
      degradationPct: 0.55,
    },
    engineering: {
      systemVoltage: 840,
      operatingCurrent: 12.4,
      cellTempC: 44,
      tempCoeffPctPerC: -0.35,
      soilingPct: 3,
      mismatchPct: 1.5,
      dcOhmicPct: 1.2,
      shadingPct: 3,
      inverterEfficiencyPct: 97.6,
    },
  },
  {
    id: 'de-central',
    label: 'Almanya / Orta Avrupa',
    description: 'Daha düşük güneşlenme, serin hücre sıcaklığı ve düşük kirlenme örneği.',
    environment: {
      profileTemplateId: 'de-central',
      tiltDeg: 35,
      azimuthDeg: 180,
      weatherFactorPct: 72,
      peakSunHours: 3.4,
      degradationPct: 0.45,
    },
    engineering: {
      systemVoltage: 780,
      operatingCurrent: 12,
      cellTempC: 33,
      tempCoeffPctPerC: -0.34,
      soilingPct: 2,
      mismatchPct: 1.3,
      dcOhmicPct: 1.1,
      shadingPct: 2,
      inverterEfficiencyPct: 97.9,
    },
  },
  {
    id: 'es-mediterranean',
    label: 'İspanya / Akdeniz',
    description: 'Akdeniz iklimi için yüksek üretim, orta sıcaklık ve düşük gölgeleme örneği.',
    environment: {
      profileTemplateId: 'es-mediterranean',
      tiltDeg: 28,
      azimuthDeg: 180,
      weatherFactorPct: 91,
      peakSunHours: 5.9,
      degradationPct: 0.5,
    },
    engineering: {
      systemVoltage: 820,
      operatingCurrent: 12.2,
      cellTempC: 41,
      tempCoeffPctPerC: -0.34,
      soilingPct: 2.2,
      mismatchPct: 1.4,
      dcOhmicPct: 1,
      shadingPct: 2.5,
      inverterEfficiencyPct: 98,
    },
  },
  {
    id: 'us-southwest',
    label: 'ABD / Güneybatı',
    description: 'Çok yüksek güneşlenme, sıcak hücre sıcaklığı ve daha yüksek kirlenme örneği.',
    environment: {
      profileTemplateId: 'us-southwest',
      tiltDeg: 25,
      azimuthDeg: 180,
      weatherFactorPct: 94,
      peakSunHours: 6.8,
      degradationPct: 0.55,
    },
    engineering: {
      systemVoltage: 900,
      operatingCurrent: 13.1,
      cellTempC: 48,
      tempCoeffPctPerC: -0.35,
      soilingPct: 4.2,
      mismatchPct: 1.6,
      dcOhmicPct: 1.3,
      shadingPct: 2,
      inverterEfficiencyPct: 97.4,
    },
  },
];

export function getEngineeringTemplate(templateId: EngineeringTemplateId) {
  return ENGINEERING_TEMPLATES.find((template) => template.id === templateId);
}

export function applyEngineeringTemplate(project: ProjectState, templateId: Exclude<EngineeringTemplateId, 'manual'>): ProjectState {
  const template = getEngineeringTemplate(templateId);

  if (!template) {
    return project;
  }

  return {
    ...project,
    environment: {
      ...project.environment,
      ...template.environment,
    },
    engineering: {
      ...project.engineering,
      ...template.engineering,
    },
  };
}

export function resetTechnicalInputsToDefaults(project: ProjectState): ProjectState {
  return {
    ...project,
    environment: {
      ...project.environment,
      profileTemplateId: 'manual',
      tiltDeg: DEFAULT_PROJECT_STATE.environment.tiltDeg,
      azimuthDeg: DEFAULT_PROJECT_STATE.environment.azimuthDeg,
      weatherFactorPct: DEFAULT_PROJECT_STATE.environment.weatherFactorPct,
      peakSunHours: DEFAULT_PROJECT_STATE.environment.peakSunHours,
      degradationPct: DEFAULT_PROJECT_STATE.environment.degradationPct,
    },
    engineering: {
      ...DEFAULT_PROJECT_STATE.engineering,
    },
  };
}
