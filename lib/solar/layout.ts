import { LayoutFootprint, LayoutSpec, PanelCatalogItem, PanelInstance, PlacementConstraints, PlacementResult, Rotation } from '@/lib/solar/types';
import { clamp, roundTo } from '@/lib/solar/number';

function dedupeAndSort(values: number[]): number[] {
  return [...new Set(values.map((value) => roundTo(value, 3)))].sort((a, b) => a - b);
}

export function getPanelFootprint(spec: PanelCatalogItem, rotation: Rotation): LayoutFootprint {
  if (rotation === 90) {
    return { widthM: spec.heightM, heightM: spec.widthM };
  }

  return { widthM: spec.widthM, heightM: spec.heightM };
}

export function getPanelRect(panel: PanelInstance, spec: PanelCatalogItem) {
  const footprint = getPanelFootprint(spec, panel.rotation);
  return {
    xM: panel.xM,
    yM: panel.yM,
    widthM: footprint.widthM,
    heightM: footprint.heightM,
  };
}

function isWithinBounds(
  xM: number,
  yM: number,
  footprint: LayoutFootprint,
  layout: LayoutSpec,
  constraints: PlacementConstraints,
) {
  return (
    xM >= constraints.edgeGapM &&
    yM >= constraints.edgeGapM &&
    xM + footprint.widthM <= layout.widthM - constraints.edgeGapM &&
    yM + footprint.heightM <= layout.heightM - constraints.edgeGapM
  );
}

export function hasCollision(
  panelId: string | null,
  xM: number,
  yM: number,
  footprint: LayoutFootprint,
  panels: PanelInstance[],
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
) {
  return panels.some((panel) => {
    if (panel.id === panelId) {
      return false;
    }

    const other = getPanelRect(panel, spec);
    return (
      xM < other.xM + other.widthM + constraints.panelGapM &&
      xM + footprint.widthM + constraints.panelGapM > other.xM &&
      yM < other.yM + other.heightM + constraints.panelGapM &&
      yM + footprint.heightM + constraints.panelGapM > other.yM
    );
  });
}

export function isPlacementValid(
  panelId: string | null,
  xM: number,
  yM: number,
  rotation: Rotation,
  layout: LayoutSpec,
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
) {
  const footprint = getPanelFootprint(spec, rotation);
  return (
    isWithinBounds(xM, yM, footprint, layout, constraints) &&
    !hasCollision(panelId, xM, yM, footprint, layout.panels, spec, constraints)
  );
}

export function clampPlacement(
  xM: number,
  yM: number,
  rotation: Rotation,
  layout: LayoutSpec,
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
) {
  const footprint = getPanelFootprint(spec, rotation);

  return {
    xM: clamp(xM, constraints.edgeGapM, layout.widthM - constraints.edgeGapM - footprint.widthM),
    yM: clamp(yM, constraints.edgeGapM, layout.heightM - constraints.edgeGapM - footprint.heightM),
  };
}

function getCandidateAxisValues(
  target: number,
  footprintSize: number,
  layoutSize: number,
  others: { start: number; size: number }[],
  constraints: PlacementConstraints,
) {
  const gridSnap = roundTo(Math.round(target / constraints.gridStepM) * constraints.gridStepM, 3);
  const min = constraints.edgeGapM;
  const max = layoutSize - constraints.edgeGapM - footprintSize;
  const values = [
    clamp(target, min, max),
    clamp(gridSnap, min, max),
    min,
    max,
  ];

  others.forEach((other) => {
    values.push(other.start);
    values.push(other.start + other.size - footprintSize);
    values.push(other.start - footprintSize - constraints.panelGapM);
    values.push(other.start + other.size + constraints.panelGapM);
  });

  return dedupeAndSort(values);
}

function getDistance(aX: number, aY: number, bX: number, bY: number) {
  return Math.hypot(aX - bX, aY - bY);
}

export function resolvePlacementAttempt(
  panelId: string,
  targetX: number,
  targetY: number,
  rotation: Rotation,
  layout: LayoutSpec,
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
): PlacementResult {
  const footprint = getPanelFootprint(spec, rotation);
  const otherPanels = layout.panels.filter((panel) => panel.id !== panelId).map((panel) => ({
    rect: getPanelRect(panel, spec),
  }));
  const xCandidates = getCandidateAxisValues(
    targetX,
    footprint.widthM,
    layout.widthM,
    otherPanels.map(({ rect }) => ({ start: rect.xM, size: rect.widthM })),
    constraints,
  );
  const yCandidates = getCandidateAxisValues(
    targetY,
    footprint.heightM,
    layout.heightM,
    otherPanels.map(({ rect }) => ({ start: rect.yM, size: rect.heightM })),
    constraints,
  );

  const snapThreshold = Math.max(constraints.gridStepM * 2.5, 0.12);
  const preferredCandidates: PlacementResult[] = [];

  xCandidates.forEach((xM) => {
    yCandidates.forEach((yM) => {
      const distance = getDistance(xM, yM, targetX, targetY);
      if (distance > snapThreshold) {
        return;
      }

      if (isPlacementValid(panelId, xM, yM, rotation, layout, spec, constraints)) {
        preferredCandidates.push({ xM, yM, valid: true });
      }
    });
  });

  preferredCandidates.sort(
    (left, right) => getDistance(left.xM, left.yM, targetX, targetY) - getDistance(right.xM, right.yM, targetX, targetY),
  );

  if (preferredCandidates.length > 0) {
    return preferredCandidates[0];
  }

  const clamped = clampPlacement(targetX, targetY, rotation, layout, spec, constraints);

  return {
    ...clamped,
    valid: isPlacementValid(panelId, clamped.xM, clamped.yM, rotation, layout, spec, constraints),
  };
}

function getBottomLeftCandidates(
  rotation: Rotation,
  layout: LayoutSpec,
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
) {
  const footprint = getPanelFootprint(spec, rotation);
  const xCandidates = [
    constraints.edgeGapM,
    ...layout.panels.map((panel) => {
      const rect = getPanelRect(panel, spec);
      return rect.xM + rect.widthM + constraints.panelGapM;
    }),
  ];
  const yCandidates = [
    constraints.edgeGapM,
    ...layout.panels.map((panel) => {
      const rect = getPanelRect(panel, spec);
      return rect.yM + rect.heightM + constraints.panelGapM;
    }),
  ];

  return {
    footprint,
    xCandidates: dedupeAndSort(xCandidates).filter(
      (value) => value + footprint.widthM <= layout.widthM - constraints.edgeGapM + 0.0001,
    ),
    yCandidates: dedupeAndSort(yCandidates).filter(
      (value) => value + footprint.heightM <= layout.heightM - constraints.edgeGapM + 0.0001,
    ),
  };
}

export function findFirstAvailablePlacement(
  layout: LayoutSpec,
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
  rotation: Rotation = 0,
): PlacementResult | null {
  const { xCandidates, yCandidates } = getBottomLeftCandidates(rotation, layout, spec, constraints);

  for (const yM of yCandidates) {
    for (const xM of xCandidates) {
      if (isPlacementValid(null, xM, yM, rotation, layout, spec, constraints)) {
        return { xM, yM, valid: true };
      }
    }
  }

  return null;
}

export function validateLayout(
  layout: LayoutSpec,
  spec: PanelCatalogItem,
  constraints: PlacementConstraints,
) {
  const invalidPanelIds = layout.panels
    .filter((panel) => !isPlacementValid(panel.id, panel.xM, panel.yM, panel.rotation, layout, spec, constraints))
    .map((panel) => panel.id);

  const totalAreaM2 = layout.widthM * layout.heightM;
  const usableWidthM = Math.max(layout.widthM - constraints.edgeGapM * 2, 0);
  const usableHeightM = Math.max(layout.heightM - constraints.edgeGapM * 2, 0);
  const usableAreaM2 = usableWidthM * usableHeightM;
  const usedAreaM2 = roundTo(
    layout.panels.reduce((sum, panel) => {
      const footprint = getPanelFootprint(spec, panel.rotation);
      return sum + footprint.widthM * footprint.heightM;
    }, 0),
    2,
  );

  return {
    invalidPanelIds,
    fillFactor: usableAreaM2 > 0 ? roundTo((usedAreaM2 / usableAreaM2) * 100, 1) : 0,
    usableAreaRatio: totalAreaM2 > 0 ? roundTo((usableAreaM2 / totalAreaM2) * 100, 1) : 0,
    usedAreaM2,
    usableAreaM2: roundTo(usableAreaM2, 2),
  };
}
