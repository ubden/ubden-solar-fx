'use client';

import { startTransition, useEffect, useState } from 'react';

import { AppNavbar } from '@/components/solar/AppNavbar';
import { ControlSidebar } from '@/components/solar/ControlSidebar';
import { EnergyChartCard } from '@/components/solar/EnergyChartCard';
import { MetricsStrip } from '@/components/solar/MetricsStrip';
import { WorkspacePanel } from '@/components/solar/WorkspacePanel';
import { useLanguage } from '@/context/LanguageContext';
import { getPanelSpec } from '@/lib/solar/catalog';
import { DEFAULT_PROJECT_STATE } from '@/lib/solar/defaults';
import { exportProjectCsv } from '@/lib/solar/export';
import { findFirstAvailablePlacement, resolvePlacementAttempt } from '@/lib/solar/layout';
import { calculateFinancialSummary, calculateYield, createGenerationCurve } from '@/lib/solar/math';
import { loadProjectState, sanitizeProjectState, saveProjectState } from '@/lib/solar/storage';
import { PanelInstance, ProjectState, Rotation } from '@/lib/solar/types';

function createPanelId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `panel-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export function SolarPortalPage() {
  const { t } = useLanguage();
  const [project, setProject] = useState<ProjectState>(DEFAULT_PROJECT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [layoutNotice, setLayoutNotice] = useState<string | null>(null);

  useEffect(() => {
    const stored = loadProjectState();
    setProject(stored);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    saveProjectState(project);
  }, [hydrated, project]);

  const panelSpec = getPanelSpec(project.environment.panelSpecId);
  const results = calculateYield(project);
  const financialSummary = calculateFinancialSummary(project, results);
  const curve = createGenerationCurve(results);

  function commitProject(next: ProjectState | ((current: ProjectState) => ProjectState)) {
    setProject((current) => sanitizeProjectState(typeof next === 'function' ? next(current) : next));
  }

  function updateLayoutField(key: 'widthM' | 'heightM', value: number) {
    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        [key]: value,
      },
    }));
  }

  function updateConstraintField(key: 'panelGapM' | 'edgeGapM', value: number) {
    commitProject((current) => ({
      ...current,
      constraints: {
        ...current.constraints,
        [key]: value,
      },
    }));
  }

  function updateEnvironmentField(
    key:
      | 'panelType'
      | 'inverterType'
      | 'tiltDeg'
      | 'azimuthDeg'
      | 'degradationPct'
      | 'weatherFactorPct'
      | 'peakSunHours',
    value: string | number,
  ) {
    commitProject((current) => ({
      ...current,
      environment: {
        ...current.environment,
        [key]: value,
      },
    }));
  }

  function updateEngineeringField(
    key:
      | 'systemVoltage'
      | 'operatingCurrent'
      | 'cellTempC'
      | 'tempCoeffPctPerC'
      | 'soilingPct'
      | 'mismatchPct'
      | 'dcOhmicPct'
      | 'shadingPct'
      | 'inverterEfficiencyPct',
    value: number,
  ) {
    commitProject((current) => ({
      ...current,
      engineering: {
        ...current.engineering,
        [key]: value,
      },
    }));
  }

  function updateFinancialField(key: 'unitPrice' | 'currency' | 'monthlyConsumptionKWh', value: string | number) {
    commitProject((current) => ({
      ...current,
      financial: {
        ...current.financial,
        [key]: value,
      },
    }));
  }

  function setWorkspaceMode(mode: ProjectState['environment']['workspaceMode']) {
    startTransition(() => {
      commitProject((current) => ({
        ...current,
        environment: {
          ...current.environment,
          workspaceMode: mode,
        },
      }));
    });
  }

  function setCameraPreset(preset: ProjectState['camera']['preset']) {
    commitProject((current) => ({
      ...current,
      camera: {
        preset,
      },
    }));
  }

  function setSelectedPanel(selectedPanelId: string | null) {
    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        selectedPanelId,
      },
    }));
  }

  function addPanel() {
    const placement = findFirstAvailablePlacement(project.layout, panelSpec, project.constraints, 0);

    if (!placement) {
      setLayoutNotice(t('notices.layout_full'));
      return;
    }

    const nextPanel: PanelInstance = {
      id: createPanelId(),
      xM: placement.xM,
      yM: placement.yM,
      rotation: 0,
    };

    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        panels: [...current.layout.panels, nextPanel],
        selectedPanelId: nextPanel.id,
      },
    }));
    setLayoutNotice(project.layout.autoNestEnabled ? t('notices.auto_nested') : t('notices.panel_added'));
  }

  function movePanel(panelId: string, xM: number, yM: number) {
    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        panels: current.layout.panels.map((panel) => (panel.id === panelId ? { ...panel, xM, yM } : panel)),
      },
    }));
  }

  function rotateSelectedPanel() {
    const selectedPanel = project.layout.panels.find((panel) => panel.id === project.layout.selectedPanelId);

    if (!selectedPanel) {
      setLayoutNotice(t('notices.select_panel'));
      return;
    }

    const nextRotation: Rotation = selectedPanel.rotation === 90 ? 0 : 90;
    const attempt = resolvePlacementAttempt(
      selectedPanel.id,
      selectedPanel.xM,
      selectedPanel.yM,
      nextRotation,
      project.layout,
      panelSpec,
      project.constraints,
    );

    if (!attempt.valid) {
      const fallbackLayout = {
        ...project.layout,
        panels: project.layout.panels.filter((panel) => panel.id !== selectedPanel.id),
      };
      const fallback = findFirstAvailablePlacement(fallbackLayout, panelSpec, project.constraints, nextRotation);
      if (!fallback) {
        setLayoutNotice(t('notices.rotation_blocked'));
        return;
      }

      commitProject((current) => ({
        ...current,
        layout: {
          ...current.layout,
          panels: current.layout.panels.map((panel) =>
            panel.id === selectedPanel.id
              ? { ...panel, rotation: nextRotation, xM: fallback.xM, yM: fallback.yM }
              : panel,
          ),
        },
      }));
      setLayoutNotice(t('notices.rotation_relocated'));
      return;
    }

    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        panels: current.layout.panels.map((panel) =>
          panel.id === selectedPanel.id
            ? { ...panel, rotation: nextRotation, xM: attempt.xM, yM: attempt.yM }
            : panel,
        ),
      },
    }));
    setLayoutNotice(t('notices.rotation_ok'));
  }

  function deleteSelectedPanel() {
    if (!project.layout.selectedPanelId) {
      setLayoutNotice(t('notices.select_panel'));
      return;
    }

    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        panels: current.layout.panels.filter((panel) => panel.id !== current.layout.selectedPanelId),
        selectedPanelId: null,
      },
    }));
    setLayoutNotice(t('notices.panel_deleted'));
  }

  function clearPanels() {
    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        panels: [],
        selectedPanelId: null,
      },
    }));
    setLayoutNotice(t('notices.layout_cleared'));
  }

  function toggleAutoNest(enabled: boolean) {
    commitProject((current) => ({
      ...current,
      layout: {
        ...current.layout,
        autoNestEnabled: enabled,
      },
    }));
  }

  function changePanelPreset(panelSpecId: ProjectState['environment']['panelSpecId']) {
    commitProject((current) => ({
      ...current,
      environment: {
        ...current.environment,
        panelSpecId,
      },
    }));
  }

  function exportProject() {
    exportProjectCsv(project);
    setLayoutNotice(t('notices.exported'));
  }

  return (
    <div className="min-h-screen bg-app-surface">
      <AppNavbar />

      <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 md:px-8 lg:py-6">
        <MetricsStrip results={results} financialSummary={financialSummary} />

        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <ControlSidebar
            project={project}
            results={results}
            financialSummary={financialSummary}
            onLayoutFieldChange={updateLayoutField}
            onEnvironmentFieldChange={updateEnvironmentField}
            onEngineeringFieldChange={updateEngineeringField}
            onFinancialFieldChange={updateFinancialField}
          />

          <div className="flex flex-col gap-5">
            <WorkspacePanel
              project={project}
              panelSpec={panelSpec}
              results={results}
              layoutNotice={layoutNotice}
              onPanelPresetChange={changePanelPreset}
              onConstraintFieldChange={updateConstraintField}
              onWorkspaceModeChange={setWorkspaceMode}
              onToggleAutoNest={toggleAutoNest}
              onAddPanel={addPanel}
              onExport={exportProject}
              onClearPanels={clearPanels}
              onRotateSelected={rotateSelectedPanel}
              onDeleteSelected={deleteSelectedPanel}
              onSelectPanel={setSelectedPanel}
              onMovePanel={movePanel}
              onCameraPreset={setCameraPreset}
            />
            <EnergyChartCard curve={curve} results={results} />
          </div>
        </div>
      </main>
    </div>
  );
}
