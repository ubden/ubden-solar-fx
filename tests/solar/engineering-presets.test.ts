import { describe, expect, it } from 'vitest';

import { DEFAULT_PROJECT_STATE } from '@/lib/solar/defaults';
import { applyEngineeringTemplate, resetTechnicalInputsToDefaults } from '@/lib/solar/engineering-presets';

describe('engineering presets', () => {
  it('applies a national technical template to environment and engineering fields', () => {
    const project = applyEngineeringTemplate(DEFAULT_PROJECT_STATE, 'tr-central');

    expect(project.environment.profileTemplateId).toBe('tr-central');
    expect(project.environment.peakSunHours).toBe(5.7);
    expect(project.environment.weatherFactorPct).toBe(88);
    expect(project.engineering.cellTempC).toBe(44);
    expect(project.engineering.systemVoltage).toBe(840);
  });

  it('resets technical inputs back to default values', () => {
    const customized = applyEngineeringTemplate(
      {
        ...DEFAULT_PROJECT_STATE,
        environment: {
          ...DEFAULT_PROJECT_STATE.environment,
          tiltDeg: 18,
          weatherFactorPct: 20,
        },
        engineering: {
          ...DEFAULT_PROJECT_STATE.engineering,
          cellTempC: 67,
          shadingPct: 18,
        },
      },
      'us-southwest',
    );

    const reset = resetTechnicalInputsToDefaults(customized);

    expect(reset.environment.profileTemplateId).toBe('manual');
    expect(reset.environment.tiltDeg).toBe(DEFAULT_PROJECT_STATE.environment.tiltDeg);
    expect(reset.environment.weatherFactorPct).toBe(DEFAULT_PROJECT_STATE.environment.weatherFactorPct);
    expect(reset.engineering).toEqual(DEFAULT_PROJECT_STATE.engineering);
  });
});
