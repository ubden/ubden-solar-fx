'use client';

import { startTransition, useEffect, useMemo, useRef, useState } from 'react';

import { AppNavbar } from '@/components/solar/AppNavbar';
import { ControlSidebar } from '@/components/solar/ControlSidebar';
import { EnergyChartCard } from '@/components/solar/EnergyChartCard';
import { EngineeringSettingsPanel } from '@/components/solar/EngineeringSettingsPanel';
import { FeasibilityModal } from '@/components/solar/feasibility/FeasibilityModal';
import { FeasibilityReportPages } from '@/components/solar/feasibility/FeasibilityReportPages';
import { MetricsStrip } from '@/components/solar/MetricsStrip';
import { WorkspacePanel } from '@/components/solar/WorkspacePanel';
import { useLanguage } from '@/context/LanguageContext';
import { getPanelSpec } from '@/lib/solar/catalog';
import { DEFAULT_PROJECT_STATE } from '@/lib/solar/defaults';
import { applyEngineeringTemplate, getEngineeringTemplate, resetTechnicalInputsToDefaults } from '@/lib/solar/engineering-presets';
import { exportProjectCsv } from '@/lib/solar/export';
import { hasFeasibilityErrors, validateFeasibilityForm } from '@/lib/solar/feasibility-config';
import { findFirstAvailablePlacement, resolvePlacementAttempt } from '@/lib/solar/layout';
import {
  calculateFinancialSummary,
  calculateYield,
  createGenerationCurve,
  getMetricExplanationMap,
  getReportSummary,
} from '@/lib/solar/math';
import { REPORT_PAGE_DESCRIPTORS, buildReportFilename } from '@/lib/solar/report/build-report-pages';
import { generateFeasibilityPdf as generateFeasibilityDocument } from '@/lib/solar/report/generate-feasibility-pdf';
import { loadProjectState, sanitizeProjectState, saveProjectState } from '@/lib/solar/storage';
import { MetricDefinition, PanelInstance, ProjectState, Rotation } from '@/lib/solar/types';

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
  const [isFeasibilityModalOpen, setIsFeasibilityModalOpen] = useState(false);
  const [isGeneratingFeasibility, setIsGeneratingFeasibility] = useState(false);
  const [feasibilityErrors, setFeasibilityErrors] = useState<ReturnType<typeof validateFeasibilityForm>>({});
  const reportPageRefs = useRef<Array<HTMLDivElement | null>>([]);

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
  const metricExplanations = useMemo(() => getMetricExplanationMap(project, results), [project, results]);
  const metrics = useMemo<MetricDefinition[]>(
    () => [
      {
        id: 'dailyEnergy',
        label: t('metrics.daily_energy'),
        value: metricExplanations.dailyEnergy.state === 'empty' ? t('metrics.pending') : `${results.dailyEnergyKWh.toFixed(1)} kWh`,
        description: metricExplanations.dailyEnergy.description,
        hint: metricExplanations.dailyEnergy.hint,
        warning: metricExplanations.dailyEnergy.warning,
        state: metricExplanations.dailyEnergy.state,
      },
      {
        id: 'annualEnergy',
        label: t('metrics.annual_energy'),
        value: metricExplanations.annualEnergy.state === 'empty' ? t('metrics.pending') : `${results.annualEnergyKWh.toFixed(0)} kWh`,
        description: metricExplanations.annualEnergy.description,
        hint: metricExplanations.annualEnergy.hint,
        warning: metricExplanations.annualEnergy.warning,
        state: metricExplanations.annualEnergy.state,
      },
      {
        id: 'fillFactor',
        label: t('metrics.fill_factor'),
        value: metricExplanations.fillFactor.state === 'empty' ? t('metrics.pending') : `${results.fillFactor.toFixed(1)}%`,
        description: metricExplanations.fillFactor.description,
        hint: metricExplanations.fillFactor.hint,
        warning: metricExplanations.fillFactor.warning,
        state: metricExplanations.fillFactor.state,
      },
      {
        id: 'electricalConsistency',
        label: t('metrics.electrical_consistency'),
        value:
          metricExplanations.electricalConsistency.state === 'empty'
            ? t('metrics.pending')
            : `${results.electricalConsistencyPct.toFixed(1)}%`,
        description: metricExplanations.electricalConsistency.description,
        hint: metricExplanations.electricalConsistency.hint,
        warning: metricExplanations.electricalConsistency.warning,
        state: metricExplanations.electricalConsistency.state,
      },
      {
        id: 'monthlySavings',
        label: t('metrics.monthly_savings'),
        value:
          metricExplanations.monthlySavings.state === 'empty'
            ? t('metrics.pending')
            : `${financialSummary.monthlySavings.toFixed(0)} ${project.financial.currency}/ay`,
        description: metricExplanations.monthlySavings.description,
        hint: metricExplanations.monthlySavings.hint,
        warning: metricExplanations.monthlySavings.warning,
        state: metricExplanations.monthlySavings.state,
      },
      {
        id: 'coverage',
        label: t('metrics.coverage_title'),
        value: metricExplanations.coverage.state === 'empty' ? t('metrics.pending') : `${financialSummary.coveragePct.toFixed(1)}%`,
        description: metricExplanations.coverage.description,
        hint: metricExplanations.coverage.hint,
        warning: metricExplanations.coverage.warning,
        state: metricExplanations.coverage.state,
      },
      {
        id: 'annualSavings',
        label: t('metrics.annual_savings'),
        value:
          metricExplanations.annualSavings.state === 'empty'
            ? t('metrics.pending')
            : `${financialSummary.annualSavings.toFixed(0)} ${project.financial.currency}/yil`,
        description: metricExplanations.annualSavings.description,
        hint: metricExplanations.annualSavings.hint,
        warning: metricExplanations.annualSavings.warning,
        state: metricExplanations.annualSavings.state,
      },
    ],
    [financialSummary.annualSavings, financialSummary.coveragePct, financialSummary.monthlySavings, metricExplanations, project.financial.currency, results.annualEnergyKWh, results.dailyEnergyKWh, results.electricalConsistencyPct, results.fillFactor, t],
  );
  const reportSnapshot = useMemo(
    () => getReportSummary(project, results, financialSummary),
    [financialSummary, project, results],
  );

  function commitProject(next: ProjectState | ((current: ProjectState) => ProjectState)) {
    setProject((current) => sanitizeProjectState(typeof next === 'function' ? next(current) : next));
  }

  function clearFeasibilityError(key: keyof ReturnType<typeof validateFeasibilityForm>) {
    setFeasibilityErrors((current) => ({ ...current, [key]: undefined }));
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
      | 'peakSunHours'
      | 'profileTemplateId',
    value: string | number,
  ) {
    commitProject((current) => ({
      ...current,
      environment: {
        ...current.environment,
        profileTemplateId: key === 'profileTemplateId' ? current.environment.profileTemplateId : 'manual',
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
      environment: {
        ...current.environment,
        profileTemplateId: 'manual',
      },
      engineering: {
        ...current.engineering,
        [key]: value,
      },
    }));
  }

  function applyTechnicalTemplate(templateId: Exclude<ProjectState['environment']['profileTemplateId'], 'manual'>) {
    const template = getEngineeringTemplate(templateId);

    if (!template) {
      return;
    }

    commitProject((current) => applyEngineeringTemplate(current, templateId));
    setLayoutNotice(`${template.label} teknik profili uygulandı.`);
  }

  function resetTechnicalDefaults() {
    commitProject((current) => resetTechnicalInputsToDefaults(current));
    setLayoutNotice('Teknik girdiler varsayılan değerlere sıfırlandı.');
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
      panelSpecId: project.environment.panelSpecId,
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

    const selectedSpec = getPanelSpec(selectedPanel.panelSpecId);
    const nextRotation: Rotation = selectedPanel.rotation === 90 ? 0 : 90;
    const attempt = resolvePlacementAttempt(
      selectedPanel.id,
      selectedPanel.xM,
      selectedPanel.yM,
      nextRotation,
      project.layout,
      selectedSpec,
      project.constraints,
    );

    if (!attempt.valid) {
      const fallbackLayout = {
        ...project.layout,
        panels: project.layout.panels.filter((panel) => panel.id !== selectedPanel.id),
      };
      const fallback = findFirstAvailablePlacement(fallbackLayout, selectedSpec, project.constraints, nextRotation);
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

  function openFeasibilityModal() {
    setFeasibilityErrors({});
    setIsFeasibilityModalOpen(true);
  }

  function closeFeasibilityModal() {
    if (isGeneratingFeasibility) {
      return;
    }

    setIsFeasibilityModalOpen(false);
  }

  function updateFeasibilityTextField(
    key: 'customerName' | 'phone' | 'addressLine' | 'notes' | 'inverterBrandOther' | 'panelBrandOther',
    value: string,
  ) {
    commitProject((current) => ({
      ...current,
      feasibility: {
        ...current.feasibility,
        [key]: value,
      },
    }));

    if (key === 'customerName' || key === 'phone' || key === 'addressLine' || key === 'inverterBrandOther' || key === 'panelBrandOther') {
      clearFeasibilityError(key);
    }
  }

  function updateFeasibilityQuoteMode(value: ProjectState['feasibility']['quoteMode']) {
    commitProject((current) => ({
      ...current,
      feasibility: {
        ...current.feasibility,
        quoteMode: value,
      },
    }));
    setFeasibilityErrors((current) => ({
      ...current,
      turnkeyPriceMin: undefined,
      turnkeyPriceMax: undefined,
    }));
  }

  function updateFeasibilityPrice(
    key: 'turnkeyPriceMin' | 'turnkeyPriceMax',
    value: number | undefined,
  ) {
    commitProject((current) => ({
      ...current,
      feasibility: {
        ...current.feasibility,
        [key]: value,
      },
    }));
    clearFeasibilityError(key);
  }

  function updateFeasibilityCurrency(value: ProjectState['feasibility']['priceCurrency']) {
    commitProject((current) => ({
      ...current,
      feasibility: {
        ...current.feasibility,
        priceCurrency: value,
      },
    }));
  }

  function toggleFeasibilityBrand(group: 'inverterBrands' | 'panelBrands', brandId: string) {
    commitProject((current) => {
      const nextValues = current.feasibility[group].includes(brandId)
        ? current.feasibility[group].filter((entry) => entry !== brandId)
        : [...current.feasibility[group], brandId];

      return {
        ...current,
        feasibility: {
          ...current.feasibility,
          [group]: nextValues,
        },
      };
    });

    if (group === 'inverterBrands') {
      clearFeasibilityError('inverterBrandOther');
    } else {
      clearFeasibilityError('panelBrandOther');
    }
  }

  function requestCustomerLocation() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setLayoutNotice('Tarayici geolocation destegi bulunamadi.');
      commitProject((current) => ({
        ...current,
        feasibility: {
          ...current.feasibility,
          geoLocation: {
            status: 'error',
            errorMessage: 'Tarayici geolocation destegi bulunamadi.',
          },
        },
      }));
      return;
    }

    commitProject((current) => ({
      ...current,
      feasibility: {
        ...current.feasibility,
        geoLocation: {
          status: 'fetching',
        },
      },
    }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        commitProject((current) => ({
          ...current,
          feasibility: {
            ...current.feasibility,
            geoLocation: {
              status: 'success',
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracyMeters: position.coords.accuracy,
              capturedAt: new Date().toISOString(),
            },
          },
        }));
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? 'Konum izni reddedildi.'
            : 'Konum bilgisi alınamadı.';

        commitProject((current) => ({
          ...current,
          feasibility: {
            ...current.feasibility,
            geoLocation: {
              status: 'error',
              errorMessage: message,
            },
          },
        }));
        setLayoutNotice(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      },
    );
  }

  async function generateFeasibilityPdf() {
    const nextErrors = validateFeasibilityForm(project.feasibility);
    setFeasibilityErrors(nextErrors);

    if (hasFeasibilityErrors(nextErrors)) {
      return;
    }

    try {
      setIsGeneratingFeasibility(true);

      const pages = REPORT_PAGE_DESCRIPTORS.map((descriptor, index) => {
        const element = reportPageRefs.current[index];
        if (!element) {
          throw new Error(`Missing report page: ${descriptor.id}`);
        }

        return {
          element,
          orientation: descriptor.orientation,
        };
      });

      await generateFeasibilityDocument(pages, buildReportFilename(reportSnapshot));

      commitProject((current) => ({
        ...current,
        feasibility: {
          ...current.feasibility,
          lastGeneratedAt: new Date().toISOString(),
        },
      }));
      setLayoutNotice(t('notices.report_generated'));
    } catch (error) {
      console.error(error);
      setLayoutNotice(t('notices.report_failed'));
    } finally {
      setIsGeneratingFeasibility(false);
    }
  }

  const shouldRenderReportPages = isFeasibilityModalOpen || isGeneratingFeasibility;

  return (
    <div className="min-h-screen bg-app-surface">
      <AppNavbar />

      <main className="mx-auto flex max-w-[1600px] flex-col gap-5 px-4 py-5 md:px-8 lg:py-6">
        <MetricsStrip metrics={metrics} />

        <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          <ControlSidebar
            project={project}
            results={results}
            financialSummary={financialSummary}
            onLayoutFieldChange={updateLayoutField}
            onEnvironmentFieldChange={updateEnvironmentField}
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
              onOpenFeasibility={openFeasibilityModal}
              onSelectPanel={setSelectedPanel}
              onMovePanel={movePanel}
              onCameraPreset={setCameraPreset}
            />
            <EngineeringSettingsPanel
              project={project}
              results={results}
              onEnvironmentFieldChange={updateEnvironmentField}
              onEngineeringFieldChange={updateEngineeringField}
              onApplyEngineeringTemplate={applyTechnicalTemplate}
              onResetTechnicalDefaults={resetTechnicalDefaults}
            />
            <EnergyChartCard curve={curve} results={results} chartMetric={metrics[0]} />
          </div>
        </div>
      </main>

      <FeasibilityModal
        open={isFeasibilityModalOpen}
        form={project.feasibility}
        errors={feasibilityErrors}
        isGenerating={isGeneratingFeasibility}
        onClose={closeFeasibilityModal}
        onTextChange={updateFeasibilityTextField}
        onQuoteModeChange={updateFeasibilityQuoteMode}
        onPriceChange={updateFeasibilityPrice}
        onCurrencyChange={updateFeasibilityCurrency}
        onBrandToggle={toggleFeasibilityBrand}
        onRequestLocation={requestCustomerLocation}
        onGeneratePdf={generateFeasibilityPdf}
      />

      {shouldRenderReportPages ? (
        <FeasibilityReportPages
          pageRefs={reportPageRefs}
          project={project}
          results={results}
          financialSummary={financialSummary}
          curve={curve}
          metrics={metrics}
          snapshot={reportSnapshot}
        />
      ) : null}
    </div>
  );
}
