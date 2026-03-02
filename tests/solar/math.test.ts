import { describe, expect, it } from 'vitest';

import { DEFAULT_PROJECT_STATE } from '@/lib/solar/defaults';
import { calculateFinancialSummary, calculateYield, getMetricExplanationMap, getMetricState } from '@/lib/solar/math';

describe('deterministic yield model', () => {
  it('uses tilt, azimuth, temperature, and multiplicative losses', () => {
    const project = {
      ...DEFAULT_PROJECT_STATE,
      layout: {
        ...DEFAULT_PROJECT_STATE.layout,
        panels: [
          { id: 'panel-a', xM: 0.2, yM: 0.2, rotation: 0 as const },
          { id: 'panel-b', xM: 2.4, yM: 0.2, rotation: 0 as const },
        ],
      },
      environment: {
        ...DEFAULT_PROJECT_STATE.environment,
        panelSpecId: 'medium' as const,
        tiltDeg: 30,
        azimuthDeg: 180,
        weatherFactorPct: 92,
        peakSunHours: 5.5,
        degradationPct: 0.8,
      },
      engineering: {
        ...DEFAULT_PROJECT_STATE.engineering,
        cellTempC: 38,
        tempCoeffPctPerC: -0.34,
        soilingPct: 2,
        mismatchPct: 1.5,
        dcOhmicPct: 1,
        shadingPct: 3,
        inverterEfficiencyPct: 97.5,
      },
    };

    const result = calculateYield(project);

    expect(result.dcNameplateKWp).toBe(1.1);
    expect(result.dailyEnergyKWh).toBeGreaterThan(4);
    expect(result.dailyEnergyKWh).toBeLessThan(6);
    expect(result.tempFactor).toBeLessThan(1);
    expect(result.lossFactor).toBeLessThan(1);
    expect(result.degradationYearOneFactor).toBeCloseTo(0.992, 3);
  });

  it('calculates financial summary from deterministic production', () => {
    const project = {
      ...DEFAULT_PROJECT_STATE,
      layout: {
        ...DEFAULT_PROJECT_STATE.layout,
        panels: [{ id: 'panel-a', xM: 0.2, yM: 0.2, rotation: 0 as const }],
      },
      financial: {
        ...DEFAULT_PROJECT_STATE.financial,
        unitPrice: 0.22,
        monthlyConsumptionKWh: 320,
      },
    };

    const yieldResult = calculateYield(project);
    const summary = calculateFinancialSummary(project, yieldResult);

    expect(summary.dailySavings).toBeGreaterThan(0);
    expect(summary.annualSavings).toBeGreaterThan(summary.dailySavings);
    expect(summary.coveragePct).toBeGreaterThan(0);
  });

  it('marks metrics as empty when no panels are placed', () => {
    const result = calculateYield(DEFAULT_PROJECT_STATE);
    const explanations = getMetricExplanationMap(DEFAULT_PROJECT_STATE, result);

    expect(getMetricState(DEFAULT_PROJECT_STATE, result)).toBe('empty');
    expect(explanations.dailyEnergy.state).toBe('empty');
    expect(explanations.monthlySavings.state).toBe('empty');
    expect(explanations.fillFactor.state).toBe('empty');
  });

  it('marks metrics as warning when production is forced to zero by inputs', () => {
    const project = {
      ...DEFAULT_PROJECT_STATE,
      layout: {
        ...DEFAULT_PROJECT_STATE.layout,
        panels: [{ id: 'panel-a', xM: 0.2, yM: 0.2, rotation: 0 as const }],
      },
      environment: {
        ...DEFAULT_PROJECT_STATE.environment,
        weatherFactorPct: 0,
      },
    };

    const result = calculateYield(project);
    const explanations = getMetricExplanationMap(project, result);

    expect(getMetricState(project, result)).toBe('warning');
    expect(explanations.dailyEnergy.warning).toContain('Hava faktörü 0');
    expect(explanations.monthlySavings.state).toBe('warning');
  });
});
