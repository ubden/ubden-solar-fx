'use client';

import dynamic from 'next/dynamic';
import { BoxSelect, Camera, Download, FileBadge2, Layers2, Plus, RefreshCcw, RotateCw, Trash2 } from 'lucide-react';

import { PrecisionLayoutEditor } from '@/components/solar/layout/PrecisionLayoutEditor';
import { useLanguage } from '@/context/LanguageContext';
import { PanelCatalogItem, ProjectState, WorkspaceMode, YieldResult } from '@/lib/solar/types';

const LayoutReview3D = dynamic(() => import('@/components/solar/layout/LayoutReview3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[680px] items-center justify-center rounded-[28px] border border-border/80 bg-black/5 text-sm text-[color:var(--muted-text)] dark:bg-white/5">
      Loading 3D review scene...
    </div>
  ),
});

interface WorkspacePanelProps {
  project: ProjectState;
  panelSpec: PanelCatalogItem;
  results: YieldResult;
  layoutNotice: string | null;
  onPanelPresetChange: (panelSpecId: PanelCatalogItem['id']) => void;
  onConstraintFieldChange: (key: 'panelGapM' | 'edgeGapM', value: number) => void;
  onWorkspaceModeChange: (mode: WorkspaceMode) => void;
  onToggleAutoNest: (enabled: boolean) => void;
  onAddPanel: () => void;
  onExport: () => void;
  onClearPanels: () => void;
  onRotateSelected: () => void;
  onDeleteSelected: () => void;
  onOpenFeasibility: () => void;
  onSelectPanel: (panelId: string | null) => void;
  onMovePanel: (panelId: string, xM: number, yM: number) => void;
  onCameraPreset: (preset: ProjectState['camera']['preset']) => void;
}

function ToolbarNumberField({
  label,
  value,
  suffix,
  step,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  step?: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-border/80 bg-white/80 px-3 py-2 text-sm dark:bg-slate-950/60">
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-20 bg-transparent text-right font-medium outline-none"
      />
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">{suffix}</span>
    </label>
  );
}

export function WorkspacePanel({
  project,
  panelSpec,
  results,
  layoutNotice,
  onPanelPresetChange,
  onConstraintFieldChange,
  onWorkspaceModeChange,
  onToggleAutoNest,
  onAddPanel,
  onExport,
  onClearPanels,
  onRotateSelected,
  onDeleteSelected,
  onOpenFeasibility,
  onSelectPanel,
  onMovePanel,
  onCameraPreset,
}: WorkspacePanelProps) {
  const { t } = useLanguage();
  const selectedCount = project.layout.selectedPanelId ? 1 : 0;

  return (
    <section className="glass-card overflow-hidden border-border/70 bg-white/88 dark:bg-slate-950/72">
      <div className="border-b border-border/80 bg-linear-to-r from-white via-white to-amber-50/60 px-4 py-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900/80 md:px-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-[11px] font-mono uppercase tracking-[0.28em] text-[color:var(--muted-text)]">
              {t('workspace.label')}
            </p>
            <h2 className="font-display text-3xl font-semibold tracking-tight">{t('workspace.title')}</h2>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['small', 'medium', 'large'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => onPanelPresetChange(preset)}
                className={[
                  'rounded-full border px-4 py-2 text-sm transition',
                  project.environment.panelSpecId === preset
                    ? 'border-accent bg-accent text-slate-950'
                    : 'border-border/80 bg-white/80 hover:border-accent hover:text-accent dark:bg-slate-950/60',
                ].join(' ')}
              >
                {t(`panel.${preset}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:flex-wrap xl:items-center">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onWorkspaceModeChange('precision')}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
                project.environment.workspaceMode === 'precision'
                  ? 'border-accent bg-accent text-slate-950'
                  : 'border-border/80 bg-white/80 hover:border-accent hover:text-accent dark:bg-slate-950/60',
              ].join(' ')}
            >
              <Layers2 size={16} />
              {t('workspace.precision')}
            </button>
            <button
              onClick={() => onWorkspaceModeChange('review3d')}
              className={[
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
                project.environment.workspaceMode === 'review3d'
                  ? 'border-accent bg-accent text-slate-950'
                  : 'border-border/80 bg-white/80 hover:border-accent hover:text-accent dark:bg-slate-950/60',
              ].join(' ')}
            >
              <Camera size={16} />
              {t('workspace.review')}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <ToolbarNumberField
              label={t('workspace.panel_gap')}
              value={project.constraints.panelGapM}
              step={0.01}
              min={0}
              max={1}
              suffix="m"
              onChange={(value) => onConstraintFieldChange('panelGapM', value)}
            />
            <ToolbarNumberField
              label={t('workspace.edge_gap')}
              value={project.constraints.edgeGapM}
              step={0.01}
              min={0}
              max={2}
              suffix="m"
              onChange={(value) => onConstraintFieldChange('edgeGapM', value)}
            />
            <label className="inline-flex items-center gap-3 rounded-2xl border border-border/80 bg-white/80 px-3 py-2 text-sm dark:bg-slate-950/60">
              <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[color:var(--muted-text)]">
                {t('workspace.auto_nest')}
              </span>
              <button
                onClick={() => onToggleAutoNest(!project.layout.autoNestEnabled)}
                className={[
                  'relative h-7 w-12 rounded-full transition',
                  project.layout.autoNestEnabled ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700',
                ].join(' ')}
              >
                <span
                  className={[
                    'absolute top-1 h-5 w-5 rounded-full bg-white shadow transition',
                    project.layout.autoNestEnabled ? 'left-6' : 'left-1',
                  ].join(' ')}
                />
              </button>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 xl:ml-auto">
            <button onClick={onAddPanel} className="action-button-primary">
              <Plus size={16} />
              {t('actions.add_panel')}
            </button>
            <button
              onClick={onRotateSelected}
              className="action-button-secondary"
              disabled={!project.layout.selectedPanelId}
            >
              <RotateCw size={16} />
              {t('actions.rotate')}
            </button>
            <button
              onClick={onDeleteSelected}
              className="action-button-secondary"
              disabled={!project.layout.selectedPanelId}
            >
              <Trash2 size={16} />
              {t('actions.delete')}
            </button>
            <button onClick={onClearPanels} className="action-button-secondary">
              <RefreshCcw size={16} />
              {t('actions.clear')}
            </button>
            <button onClick={onExport} className="action-button-secondary">
              <Download size={16} />
              {t('actions.export')}
            </button>
            <button onClick={onOpenFeasibility} className="action-button-secondary">
              <FileBadge2 size={16} />
              {t('actions.feasibility')}
            </button>
          </div>
        </div>

        {project.environment.workspaceMode === 'review3d' ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {(['fit', 'iso', 'top', 'front', 'reset'] as const).map((preset) => (
              <button key={preset} onClick={() => onCameraPreset(preset)} className="action-button-secondary">
                <BoxSelect size={15} />
                {t(`camera.${preset}`)}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[color:var(--muted-text)]">
          <span>{panelSpec.label}</span>
          <span>{panelSpec.widthM.toFixed(2)}m x {panelSpec.heightM.toFixed(2)}m</span>
          <span>{panelSpec.wattsStc}W STC</span>
          <span>{project.layout.panels.length} {t('workspace.panels')}</span>
          <span>{selectedCount} {t('workspace.selected')}</span>
          <span>{results.invalidPanelIds.length} {t('workspace.invalid')}</span>
        </div>

        {layoutNotice ? (
          <div className="mt-4 rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-[color:var(--text)]">
            {layoutNotice}
          </div>
        ) : null}
      </div>

      <div className="p-4 md:p-5">
        {project.environment.workspaceMode === 'precision' ? (
          <PrecisionLayoutEditor
            layout={project.layout}
            constraints={project.constraints}
            panelSpec={panelSpec}
            invalidPanelIds={results.invalidPanelIds}
            selectedPanelId={project.layout.selectedPanelId}
            onSelectPanel={onSelectPanel}
            onMovePanel={onMovePanel}
          />
        ) : (
          <LayoutReview3D
            project={project}
            panelSpec={panelSpec}
            invalidPanelIds={results.invalidPanelIds}
            onBackgroundClick={() => onSelectPanel(null)}
          />
        )}
      </div>
    </section>
  );
}
