'use client';

import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import { MathUtils } from 'three';

import { getPanelSpec } from '@/lib/solar/catalog';
import { getPanelFootprint } from '@/lib/solar/layout';
import { ProjectState } from '@/lib/solar/types';

interface ReportLayoutReview3DProps {
  project: ProjectState;
  invalidPanelIds: string[];
}

function ReportSolarPanel({
  project,
  invalid,
  panel,
}: {
  project: ProjectState;
  invalid: boolean;
  panel: ProjectState['layout']['panels'][number];
}) {
  const panelSpec = getPanelSpec(panel.panelSpecId);
  const footprint = getPanelFootprint(panelSpec, panel.rotation);
  const tiltRad = useMemo(() => MathUtils.degToRad(project.environment.tiltDeg), [project.environment.tiltDeg]);

  return (
    <group position={[panel.xM + footprint.widthM / 2, 0.09, panel.yM + footprint.heightM / 2]} rotation={[0, panel.rotation === 90 ? Math.PI / 2 : 0, 0]}>
      <group rotation={[-tiltRad, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[footprint.widthM + 0.06, 0.06, footprint.heightM + 0.06]} />
          <meshStandardMaterial color={invalid ? '#991b1b' : '#a7b1bc'} metalness={0.9} roughness={0.36} />
        </mesh>
        <mesh position={[0, 0.028, 0]} castShadow>
          <boxGeometry args={[footprint.widthM - 0.03, 0.02, footprint.heightM - 0.03]} />
          <meshStandardMaterial color={project.environment.panelType === 'mono' ? '#09111c' : '#14376b'} metalness={0.1} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[footprint.widthM - 0.08, 0.008, footprint.heightM - 0.08]} />
          <meshPhysicalMaterial color="#89b6ff" transmission={0.4} roughness={0.16} thickness={0.18} transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

export function ReportLayoutReview3D({ project, invalidPanelIds }: ReportLayoutReview3DProps) {
  const centerX = project.layout.widthM / 2;
  const centerZ = project.layout.heightM / 2;
  const dominant = Math.max(project.layout.widthM, project.layout.heightM, 6);

  return (
    <div className="h-[420px] overflow-hidden rounded-[30px] border border-slate-200 bg-slate-100">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, preserveDrawingBuffer: true }}
        camera={{ position: [centerX, dominant * 3.1, centerZ + 0.001], fov: 24, near: 0.1, far: dominant * 40 }}
        onCreated={({ camera }) => {
          camera.lookAt(centerX, 0, centerZ);
        }}
      >
        <color attach="background" args={['#eef4f8']} />
        <ambientLight intensity={1.25} />
        <hemisphereLight intensity={0.45} color="#ffffff" groundColor="#afbdca" />
        <directionalLight castShadow intensity={1.1} position={[centerX, dominant * 3.6, centerZ]} shadow-mapSize-width={2048} shadow-mapSize-height={2048} />

        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0, centerZ]}>
          <planeGeometry args={[project.layout.widthM + 3, project.layout.heightM + 3]} />
          <meshStandardMaterial color="#dce6ee" roughness={0.98} metalness={0.02} />
        </mesh>
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[centerX, 0.01, centerZ]}>
          <planeGeometry args={[project.layout.widthM, project.layout.heightM]} />
          <meshStandardMaterial color="#ffffff" roughness={0.94} metalness={0.04} />
        </mesh>

        {project.layout.panels.map((panel) => (
          <ReportSolarPanel
            key={panel.id}
            project={project}
            invalid={invalidPanelIds.includes(panel.id)}
            panel={panel}
          />
        ))}

        <gridHelper args={[Math.max(project.layout.widthM, project.layout.heightM) + 3, Math.round(Math.max(project.layout.widthM, project.layout.heightM) * 2)]} position={[centerX, 0.02, centerZ]} />
      </Canvas>
    </div>
  );
}
