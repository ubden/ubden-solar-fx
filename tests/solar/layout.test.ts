import { describe, expect, it } from 'vitest';

import { getPanelSpec } from '@/lib/solar/catalog';
import { DEFAULT_PROJECT_STATE } from '@/lib/solar/defaults';
import { findFirstAvailablePlacement, isPlacementValid, resolvePlacementAttempt } from '@/lib/solar/layout';

describe('layout engine', () => {
  it('finds deterministic non-overlapping placements', () => {
    const spec = getPanelSpec('medium');
    const first = findFirstAvailablePlacement(DEFAULT_PROJECT_STATE.layout, spec, DEFAULT_PROJECT_STATE.constraints);

    expect(first).not.toBeNull();
    expect(first?.xM).toBe(DEFAULT_PROJECT_STATE.constraints.edgeGapM);
    expect(first?.yM).toBe(DEFAULT_PROJECT_STATE.constraints.edgeGapM);

    const layoutWithOne = {
      ...DEFAULT_PROJECT_STATE.layout,
      panels: [
        {
          id: 'panel-a',
          xM: first!.xM,
          yM: first!.yM,
          rotation: 0 as const,
        },
      ],
    };
    const second = findFirstAvailablePlacement(layoutWithOne, spec, DEFAULT_PROJECT_STATE.constraints);

    expect(second).not.toBeNull();
    expect(second?.xM).toBeGreaterThan(first!.xM);
    expect(isPlacementValid(null, second!.xM, second!.yM, 0, layoutWithOne, spec, DEFAULT_PROJECT_STATE.constraints)).toBe(true);
  });

  it('rejects overlaps and snaps to the nearest valid position', () => {
    const spec = getPanelSpec('small');
    const layout = {
      ...DEFAULT_PROJECT_STATE.layout,
      panels: [
        { id: 'panel-a', xM: 0.2, yM: 0.2, rotation: 0 as const },
        { id: 'panel-b', xM: 2.1, yM: 0.2, rotation: 0 as const },
      ],
    };

    const attempt = resolvePlacementAttempt('panel-b', 0.5, 0.25, 0, layout, spec, DEFAULT_PROJECT_STATE.constraints);

    expect(attempt.valid).toBe(false);

    const safeAttempt = resolvePlacementAttempt('panel-b', 2.2, 0.2, 0, layout, spec, DEFAULT_PROJECT_STATE.constraints);
    expect(safeAttempt.valid).toBe(true);
    expect(safeAttempt.xM).toBeGreaterThanOrEqual(2.1);
  });
});
