'use client';

import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Canvas, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import { BufferGeometry, Float32BufferAttribute, LineBasicMaterial, MathUtils, PerspectiveCamera as PerspectiveCameraImpl, Vector3 } from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

import { getPanelSpec } from '@/lib/solar/catalog';
import { getPanelFootprint } from '@/lib/solar/layout';
import { ProjectState } from '@/lib/solar/types';

interface LayoutReview3DProps {
  project: ProjectState;
  invalidPanelIds: string[];
  onBackgroundClick: () => void;
}

function createCellGridGeometry(width: number, height: number, cols: number, rows: number) {
  const positions: number[] = [];

  for (let col = 1; col < cols; col += 1) {
    const x = -width / 2 + (width / cols) * col;
    positions.push(x, 0, -height / 2, x, 0, height / 2);
  }

  for (let row = 1; row < rows; row += 1) {
    const z = -height / 2 + (height / rows) * row;
    positions.push(-width / 2, 0, z, width / 2, 0, z);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return geometry;
}

function SolarPanelMesh({
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
  const tiltRad = MathUtils.degToRad(project.environment.tiltDeg);
  const lineGeometry = useMemo(
    () => createCellGridGeometry(footprint.widthM - 0.14, footprint.heightM - 0.14, panelSpec.cellColumns, panelSpec.cellRows),
    [footprint.heightM, footprint.widthM, panelSpec.cellColumns, panelSpec.cellRows],
  );
  const lineMaterial = useMemo(() => new LineBasicMaterial({ color: invalid ? '#ff6b6b' : '#b8d0ff', transparent: true, opacity: 0.45 }), [invalid]);

  useEffect(() => {
    return () => {
      lineGeometry.dispose();
      lineMaterial.dispose();
    };
  }, [lineGeometry, lineMaterial]);

  return (
    <group position={[panel.xM + footprint.widthM / 2, 0.09, panel.yM + footprint.heightM / 2]} rotation={[0, panel.rotation === 90 ? Math.PI / 2 : 0, 0]}>
      <group rotation={[-tiltRad, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[footprint.widthM + 0.06, 0.06, footprint.heightM + 0.06]} />
          <meshStandardMaterial color={invalid ? '#7f1d1d' : '#a8b3bf'} metalness={0.92} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.025, 0]} castShadow>
          <boxGeometry args={[footprint.widthM - 0.03, 0.02, footprint.heightM - 0.03]} />
          <meshStandardMaterial color={project.environment.panelType === 'mono' ? '#0b1220' : '#123a7c'} metalness={0.12} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.038, 0]}>
          <boxGeometry args={[footprint.widthM - 0.08, 0.007, footprint.heightM - 0.08]} />
          <meshPhysicalMaterial color="#99c7ff" transmission={0.44} roughness={0.18} thickness={0.2} transparent opacity={0.42} />
        </mesh>
        <lineSegments geometry={lineGeometry} material={lineMaterial} position={[0, 0.042, 0]} />
      </group>
    </group>
  );
}

function SceneContent({ project, invalidPanelIds }: Omit<LayoutReview3DProps, 'onBackgroundClick'>) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    const perspectiveCamera = camera as PerspectiveCameraImpl;
    const center = new Vector3(project.layout.widthM / 2, 0, project.layout.heightM / 2);
    const dominantSize = Math.max(project.layout.widthM, project.layout.heightM, 6);
    const distance = dominantSize * 1.55 + 2.5;
    const nextPosition = new Vector3(center.x + distance * 0.9, dominantSize * 0.95, center.z + distance * 0.9);

    if (project.camera.preset === 'top') {
      nextPosition.set(center.x, dominantSize * 2.2 + 4, center.z + 0.001);
    }

    if (project.camera.preset === 'front') {
      nextPosition.set(center.x, dominantSize * 0.8, center.z + distance);
    }

    if (project.camera.preset === 'fit' || project.camera.preset === 'reset') {
      nextPosition.set(center.x + distance, dominantSize, center.z + distance);
    }

    perspectiveCamera.position.copy(nextPosition);
    perspectiveCamera.near = 0.1;
    perspectiveCamera.far = dominantSize * 30;
    perspectiveCamera.updateProjectionMatrix();

    if (controlsRef.current) {
      controlsRef.current.target.copy(center);
      controlsRef.current.update();
    }
  }, [camera, project.camera.preset, project.layout.heightM, project.layout.widthM]);

  return (
    <>
      <color attach="background" args={['#edf3f8']} />
      <ambientLight intensity={1.2} />
      <hemisphereLight intensity={0.55} color="#ffffff" groundColor="#aab7c6" />
      <directionalLight
        castShadow
        intensity={1.25}
        position={[project.layout.widthM * 0.3 + 5, 12, project.layout.heightM * 0.2 + 5]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={42} />

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[project.layout.widthM / 2, 0, project.layout.heightM / 2]}>
        <planeGeometry args={[project.layout.widthM + 3, project.layout.heightM + 3]} />
        <meshStandardMaterial color="#d6e2ea" roughness={0.98} metalness={0.02} />
      </mesh>

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[project.layout.widthM / 2, 0.01, project.layout.heightM / 2]}>
        <planeGeometry args={[project.layout.widthM, project.layout.heightM]} />
        <meshStandardMaterial color="#ffffff" roughness={0.94} metalness={0.04} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[project.layout.widthM / 2, 0.012, project.layout.heightM / 2]}>
        <ringGeometry args={[Math.max(Math.min(project.layout.widthM, project.layout.heightM) / 2 - 0.02, 0.01), Math.max(Math.min(project.layout.widthM, project.layout.heightM) / 2, 0.02), 64]} />
        <meshBasicMaterial color="#ffd26f" transparent opacity={0.12} />
      </mesh>

      <group position={[project.layout.widthM / 2, 0.016, project.layout.heightM / 2]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Math.max(project.layout.widthM - project.constraints.edgeGapM * 2, 0.01), Math.max(project.layout.heightM - project.constraints.edgeGapM * 2, 0.01)]} />
          <meshBasicMaterial color="#f59e0b" transparent opacity={0.05} />
        </mesh>
      </group>

      {project.layout.panels.map((panel) => (
        <SolarPanelMesh
          key={panel.id}
          project={project}
          invalid={invalidPanelIds.includes(panel.id)}
          panel={panel}
        />
      ))}

      <gridHelper
        args={[Math.max(project.layout.widthM, project.layout.heightM) + 3, Math.round(Math.max(project.layout.widthM, project.layout.heightM) * 2)]}
        position={[project.layout.widthM / 2, 0.02, project.layout.heightM / 2]}
      />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2}
        maxDistance={Math.max(project.layout.widthM, project.layout.heightM) * 8}
        minDistance={2}
        zoomToCursor
      />
    </>
  );
}

export default function LayoutReview3D({ project, invalidPanelIds, onBackgroundClick }: LayoutReview3DProps) {
  return (
    <div className="h-[680px] overflow-hidden rounded-[28px] border border-border/80 bg-slate-200/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] dark:bg-slate-900/80">
      <Canvas shadows dpr={[1, 1.8]} onPointerMissed={onBackgroundClick}>
        <SceneContent project={project} invalidPanelIds={invalidPanelIds} />
      </Canvas>
    </div>
  );
}
