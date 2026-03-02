import { getPanelSpec } from '@/lib/solar/catalog';
import { calculateYield } from '@/lib/solar/math';
import { ProjectState } from '@/lib/solar/types';

function quoteCsv(value: string | number) {
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

export function exportProjectCsv(project: ProjectState) {
  const spec = getPanelSpec(project.environment.panelSpecId);
  const results = calculateYield(project);
  const rows: Array<[string, string | number]> = [
    ['Panel preset', spec.label],
    ['Panel dimensions (m)', `${spec.widthM} x ${spec.heightM}`],
    ['Panel wattage (W)', spec.wattsStc],
    ['Panel count', results.panelCount],
    ['Layout width (m)', project.layout.widthM],
    ['Layout height (m)', project.layout.heightM],
    ['Panel gap (m)', project.constraints.panelGapM],
    ['Edge gap (m)', project.constraints.edgeGapM],
    ['Auto nest', project.layout.autoNestEnabled ? 'On' : 'Off'],
    ['Tilt (deg)', project.environment.tiltDeg],
    ['Azimuth (deg)', project.environment.azimuthDeg],
    ['Weather factor (%)', project.environment.weatherFactorPct],
    ['Peak sun hours', project.environment.peakSunHours],
    ['Degradation (%)', project.environment.degradationPct],
    ['Cell temperature (C)', project.engineering.cellTempC],
    ['Temp coefficient (%/C)', project.engineering.tempCoeffPctPerC],
    ['Soiling loss (%)', project.engineering.soilingPct],
    ['Mismatch loss (%)', project.engineering.mismatchPct],
    ['DC ohmic loss (%)', project.engineering.dcOhmicPct],
    ['Shading loss (%)', project.engineering.shadingPct],
    ['Inverter efficiency (%)', project.engineering.inverterEfficiencyPct],
    ['System voltage (V)', project.engineering.systemVoltage],
    ['Operating current (A)', project.engineering.operatingCurrent],
    ['DC nameplate (kWp)', results.dcNameplateKWp],
    ['Daily energy (kWh)', results.dailyEnergyKWh],
    ['Annual energy (kWh)', results.annualEnergyKWh],
    ['Fill factor (%)', results.fillFactor],
    ['Usable area ratio (%)', results.usableAreaRatio],
    ['Electrical consistency (%)', results.electricalConsistencyPct],
    ['Monthly consumption (kWh)', project.financial.monthlyConsumptionKWh],
    ['Unit price', project.financial.unitPrice],
    ['Currency', project.financial.currency],
  ];

  project.layout.panels.forEach((panel, index) => {
    rows.push([`Panel ${index + 1}`, `${panel.id} @ (${panel.xM.toFixed(3)}m, ${panel.yM.toFixed(3)}m), rot=${panel.rotation}`]);
  });

  const csvContent = rows.map(([key, value]) => `${quoteCsv(key)},${quoteCsv(value)}`).join('\n');
  const uri = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
  const link = document.createElement('a');
  link.href = uri;
  link.download = `ubden_solar_project_${Date.now()}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
