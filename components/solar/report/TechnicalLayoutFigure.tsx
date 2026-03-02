'use client';

import { getPanelSpec } from '@/lib/solar/catalog';
import { getPanelFootprint } from '@/lib/solar/layout';
import { ProjectState } from '@/lib/solar/types';

interface TechnicalLayoutFigureProps {
  project: ProjectState;
}

export function TechnicalLayoutFigure({ project }: TechnicalLayoutFigureProps) {
  const viewBoxWidth = 1080;
  const viewBoxHeight = 680;
  const frameX = 100;
  const frameY = 72;
  const frameWidth = 840;
  const frameHeight = 480;
  const scale = Math.min(frameWidth / Math.max(project.layout.widthM, 1), frameHeight / Math.max(project.layout.heightM, 1));
  const layoutWidth = project.layout.widthM * scale;
  const layoutHeight = project.layout.heightM * scale;
  const originX = frameX + (frameWidth - layoutWidth) / 2;
  const originY = frameY + (frameHeight - layoutHeight) / 2;
  const usableX = originX + project.constraints.edgeGapM * scale;
  const usableY = originY + project.constraints.edgeGapM * scale;
  const usableWidth = Math.max(layoutWidth - project.constraints.edgeGapM * scale * 2, 0);
  const usableHeight = Math.max(layoutHeight - project.constraints.edgeGapM * scale * 2, 0);
  const panelMixSummary = Object.entries(
    project.layout.panels.reduce<Record<string, number>>((accumulator, panel) => {
      accumulator[panel.panelSpecId] = (accumulator[panel.panelSpecId] ?? 0) + 1;
      return accumulator;
    }, {}),
  )
    .map(([panelSpecId, count]) => `${getPanelSpec(panelSpecId as typeof project.environment.panelSpecId).label} x${count}`)
    .join(' | ');

  return (
    <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="h-full w-full rounded-[28px] border border-slate-200 bg-white">
      <defs>
        <pattern id="technical-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e7edf3" strokeWidth="1" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={viewBoxWidth} height={viewBoxHeight} fill="#f7fafc" />
      <rect x={frameX} y={frameY} width={frameWidth} height={frameHeight} rx="28" fill="#ffffff" stroke="#d6e0ea" />
      <rect x={originX} y={originY} width={layoutWidth} height={layoutHeight} fill="url(#technical-grid)" stroke="#0f172a" strokeWidth="2.2" />
      <rect
        x={usableX}
        y={usableY}
        width={usableWidth}
        height={usableHeight}
        fill="rgba(245,158,11,0.05)"
        stroke="#f59e0b"
        strokeWidth="1.6"
        strokeDasharray="8 8"
      />

      {project.layout.panels.map((panel, index) => {
        const panelSpec = getPanelSpec(panel.panelSpecId);
        const footprint = getPanelFootprint(panelSpec, panel.rotation);
        const x = originX + panel.xM * scale;
        const y = originY + panel.yM * scale;
        const width = footprint.widthM * scale;
        const height = footprint.heightM * scale;

        return (
          <g key={panel.id}>
            <rect x={x} y={y} width={width} height={height} rx="10" fill="#0f172a" stroke="#8ab7ff" strokeWidth="1.6" />
            <rect x={x + 8} y={y + 8} width={Math.max(width - 16, 0)} height={Math.max(height - 16, 0)} rx="6" fill="#14233a" stroke="#1e3355" strokeWidth="1" />
            <text x={x + 12} y={y + 22} fontSize="12" fontFamily="monospace" fill="#dbeafe">
              #{index + 1}
            </text>
            <text x={x + width - 12} y={y + height - 10} textAnchor="end" fontSize="11" fontFamily="monospace" fill="#bfdbfe">
              {footprint.widthM.toFixed(2)} x {footprint.heightM.toFixed(2)} m
            </text>
          </g>
        );
      })}

      <g stroke="#475569" strokeWidth="2">
        <line x1={originX} y1={originY + layoutHeight + 42} x2={originX + layoutWidth} y2={originY + layoutHeight + 42} />
        <line x1={originX} y1={originY + layoutHeight + 34} x2={originX} y2={originY + layoutHeight + 50} />
        <line x1={originX + layoutWidth} y1={originY + layoutHeight + 34} x2={originX + layoutWidth} y2={originY + layoutHeight + 50} />
        <line x1={originX - 42} y1={originY} x2={originX - 42} y2={originY + layoutHeight} />
        <line x1={originX - 50} y1={originY} x2={originX - 34} y2={originY} />
        <line x1={originX - 50} y1={originY + layoutHeight} x2={originX - 34} y2={originY + layoutHeight} />
      </g>

      <text x={originX + layoutWidth / 2} y={originY + layoutHeight + 70} textAnchor="middle" fontSize="16" fontFamily="monospace" fill="#334155">
        Yerleşim Genişliği: {project.layout.widthM.toFixed(2)} m
      </text>
      <text
        x={originX - 70}
        y={originY + layoutHeight / 2}
        transform={`rotate(-90 ${originX - 70} ${originY + layoutHeight / 2})`}
        textAnchor="middle"
        fontSize="16"
        fontFamily="monospace"
        fill="#334155"
      >
        Yerleşim Yüksekliği: {project.layout.heightM.toFixed(2)} m
      </text>

      <text x={frameX} y={frameY - 24} fontSize="18" fontWeight="600" fill="#0f172a">
        Teknik Yerleşim Çizimi
      </text>
      <text x={frameX} y={frameY - 4} fontSize="12" fill="#64748b">
        Panel karması {panelMixSummary || 'Belirtilmedi'} | Panel sayısı {project.layout.panels.length} | Kenar payı {project.constraints.edgeGapM.toFixed(2)} m
      </text>
    </svg>
  );
}
