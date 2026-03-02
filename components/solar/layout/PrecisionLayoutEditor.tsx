'use client';

import { useEffect, useRef, useState } from 'react';

import { useElementSize } from '@/hooks/use-element-size';
import { getPanelSpec } from '@/lib/solar/catalog';
import { getPanelFootprint, resolvePlacementAttempt } from '@/lib/solar/layout';
import { LayoutSpec, PanelInstance, PlacementConstraints } from '@/lib/solar/types';

interface DragState {
  panelId: string;
  startClientX: number;
  startClientY: number;
  originXM: number;
  originYM: number;
  previewXM: number;
  previewYM: number;
  valid: boolean;
}

interface PrecisionLayoutEditorProps {
  layout: LayoutSpec;
  constraints: PlacementConstraints;
  invalidPanelIds: string[];
  selectedPanelId: string | null;
  onSelectPanel: (panelId: string | null) => void;
  onMovePanel: (panelId: string, xM: number, yM: number) => void;
}

function getPanelPreview(panel: PanelInstance, dragState: DragState | null) {
  if (dragState?.panelId !== panel.id) {
    return {
      xM: panel.xM,
      yM: panel.yM,
      valid: true,
    };
  }

  return {
    xM: dragState.previewXM,
    yM: dragState.previewYM,
    valid: dragState.valid,
  };
}

export function PrecisionLayoutEditor({
  layout,
  constraints,
  invalidPanelIds,
  selectedPanelId,
  onSelectPanel,
  onMovePanel,
}: PrecisionLayoutEditorProps) {
  const { ref: containerRef, size } = useElementSize<HTMLDivElement>();
  const dragRef = useRef<DragState | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);

  const paddingPx = 44;
  const availableWidth = Math.max(size.width - paddingPx * 2, 200);
  const availableHeight = Math.max(size.height - paddingPx * 2, 200);
  const pixelsPerMeter = Math.max(Math.min(availableWidth / layout.widthM, availableHeight / layout.heightM), 6);
  const canvasWidth = layout.widthM * pixelsPerMeter;
  const canvasHeight = layout.heightM * pixelsPerMeter;
  const edgeInset = constraints.edgeGapM * pixelsPerMeter;
  const gridSize = Math.max(constraints.gridStepM * pixelsPerMeter, 6);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const current = dragRef.current;

      if (!current) {
        return;
      }

      const deltaXM = (event.clientX - current.startClientX) / pixelsPerMeter;
      const deltaYM = (event.clientY - current.startClientY) / pixelsPerMeter;
      const movingPanel = layout.panels.find((panel) => panel.id === current.panelId);
      const movingSpec = getPanelSpec(movingPanel?.panelSpecId ?? 'medium');
      const attempted = resolvePlacementAttempt(
        current.panelId,
        current.originXM + deltaXM,
        current.originYM + deltaYM,
        movingPanel?.rotation ?? 0,
        layout,
        movingSpec,
        constraints,
      );
      const nextState = {
        ...current,
        previewXM: attempted.xM,
        previewYM: attempted.yM,
        valid: attempted.valid,
      };

      dragRef.current = nextState;
      setDragState(nextState);
    }

    function handlePointerUp() {
      const current = dragRef.current;

      if (current?.valid) {
        onMovePanel(current.panelId, current.previewXM, current.previewYM);
      }

      dragRef.current = null;
      setDragState(null);
    }

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [constraints, layout, onMovePanel, pixelsPerMeter]);

  return (
    <div ref={containerRef} className="relative h-[680px] min-h-[520px] rounded-[28px] border border-border/80 bg-slate-950/4 p-5 dark:bg-white/3">
      <div className="absolute left-5 top-5 text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
        {layout.widthM.toFixed(1)}m x {layout.heightM.toFixed(1)}m
      </div>
      <div className="absolute right-5 top-5 text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
        gap {constraints.panelGapM.toFixed(2)}m / edge {constraints.edgeGapM.toFixed(2)}m
      </div>

      <div className="flex h-full items-center justify-center">
        <div
          className="relative rounded-[24px] border border-slate-900/10 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.12)] dark:border-white/10 dark:bg-slate-950"
          style={{ width: canvasWidth, height: canvasHeight }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              onSelectPanel(null);
            }
          }}
        >
          <div
            className="absolute inset-0 rounded-[24px]"
            style={{
              backgroundImage: `
                linear-gradient(to right, color-mix(in srgb, var(--grid-line) 58%, transparent) 1px, transparent 1px),
                linear-gradient(to bottom, color-mix(in srgb, var(--grid-line) 58%, transparent) 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />

          <div
            className="pointer-events-none absolute rounded-[18px] border border-dashed border-accent/55"
            style={{
              left: edgeInset,
              top: edgeInset,
              width: Math.max(canvasWidth - edgeInset * 2, 0),
              height: Math.max(canvasHeight - edgeInset * 2, 0),
            }}
          />

          {layout.panels.map((panel, index) => {
            const panelSpec = getPanelSpec(panel.panelSpecId);
            const footprint = getPanelFootprint(panelSpec, panel.rotation);
            const preview = getPanelPreview(panel, dragState);
            const widthPx = footprint.widthM * pixelsPerMeter;
            const heightPx = footprint.heightM * pixelsPerMeter;
            const leftPx = preview.xM * pixelsPerMeter;
            const topPx = preview.yM * pixelsPerMeter;
            const isSelected = selectedPanelId === panel.id;
            const isInvalid = invalidPanelIds.includes(panel.id) || (dragState?.panelId === panel.id && !preview.valid);

            return (
              <button
                key={panel.id}
                type="button"
                className={[
                  'absolute overflow-hidden rounded-xl border text-left transition',
                  isSelected ? 'ring-2 ring-accent/70' : '',
                  isInvalid
                    ? 'border-red-500/80 bg-red-500/16 shadow-[0_0_0_1px_rgba(239,68,68,0.25)]'
                    : 'border-slate-700/80 bg-linear-to-br from-slate-950 to-slate-800 shadow-[0_18px_36px_rgba(15,23,42,0.22)]',
                ].join(' ')}
                style={{
                  left: leftPx,
                  top: topPx,
                  width: widthPx,
                  height: heightPx,
                }}
                onPointerDown={(event) => {
                  if (event.button !== 0) {
                    return;
                  }

                  event.preventDefault();
                  event.stopPropagation();
                  onSelectPanel(panel.id);
                  const nextState: DragState = {
                    panelId: panel.id,
                    startClientX: event.clientX,
                    startClientY: event.clientY,
                    originXM: panel.xM,
                    originYM: panel.yM,
                    previewXM: panel.xM,
                    previewYM: panel.yM,
                    valid: true,
                  };
                  dragRef.current = nextState;
                  setDragState(nextState);
                }}
              >
                <div
                  className="absolute inset-0 opacity-90"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: `${Math.max(widthPx / panelSpec.cellColumns, 8)}px ${Math.max(heightPx / panelSpec.cellRows, 8)}px`,
                  }}
                />
                <div className="absolute inset-x-0 top-0 h-2 bg-linear-to-r from-slate-300 via-white to-slate-300 opacity-45" />
                <div className="absolute inset-x-0 bottom-0 h-3 bg-linear-to-r from-slate-950/90 to-slate-700/80" />
                <div className="absolute left-2 top-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.14em] text-white/70">
                  <span>#{index + 1}</span>
                  <span>{panelSpec.label}</span>
                  <span>{panel.rotation}°</span>
                </div>
                <div className="absolute bottom-2 right-2 rounded-full bg-white/10 px-2 py-1 text-[10px] font-mono uppercase tracking-[0.14em] text-white/80">
                  {footprint.widthM.toFixed(2)} x {footprint.heightM.toFixed(2)} m
                </div>
              </button>
            );
          })}

          {layout.panels.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center">
              <div className="rounded-full border border-dashed border-border/80 px-4 py-2 text-[11px] font-mono uppercase tracking-[0.24em] text-[color:var(--muted-text)]">
                precision mode
              </div>
              <h3 className="font-display text-3xl font-semibold tracking-tight">Start packing the array</h3>
              <p className="max-w-md text-sm text-[color:var(--muted-text)]">
                Panels snap to the grid, respect edge clearance, and reject overlaps using real dimensions.
              </p>
            </div>
          ) : null}

          <div className="pointer-events-none absolute bottom-4 left-4 rounded-full border border-border/80 bg-black/5 px-3 py-1 text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)] dark:bg-white/5">
            origin 0 / 0
          </div>
        </div>
      </div>
    </div>
  );
}
