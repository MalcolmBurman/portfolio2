import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SphereGeometry } from "three";
import { backgroundBlurriness } from "three/src/nodes/TSL.js";
import { useRef, useMemo, useEffect, useState } from "react";
import Container from "../components/ui/container";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";

const noise2D = createNoise2D();
const width = 10;
const depth = 10;
const heightScale = 0.7;

function Controls() {
  const controls = useRef();
  const { camera } = useThree();

  const [returning, setReturning] = useState(false);

  const defaultPosition = new THREE.Vector3(0, 0, 40);
  const defaultTarget = new THREE.Vector3(0, 0, 0);

  useFrame(() => {
    if (returning) {
      camera.position.lerp(defaultPosition, 0.005);
      controls.current.target.lerp(defaultTarget, 0.005);
      controls.current.update();

      if (camera.position.distanceTo(defaultPosition) < 0.01) {
        setReturning(false);
      }
    }
  });

  return (
    <OrbitControls
      ref={controls}
      enableZoom={false}
      onStart={() => setReturning(false)}
      onEnd={() => setReturning(true)}
    />
  );
}

function CameraOffset() {
  const { camera, size } = useThree();

  useEffect(() => {
    camera.setViewOffset(
      size.width,
      size.height,
      -500, // x offset
      0, // y offset
      size.width,
      size.height,
    );

    return () => camera.clearViewOffset();
  }, [camera, size]);

  return null;
}

function generateTerrainGeometry({ segments = 35 } = {}) {
  const positions = [];
  const indices = [];

  for (let z = 0; z <= segments; z++) {
    for (let x = 0; x <= segments; x++) {
      const xPos = (x / segments - 0.5) * width;
      const zPos = (z / segments - 0.5) * depth;

      // layered noise for more natural-looking terrain
      const nx = x / segments;
      const nz = z / segments;
      const y =
        (noise2D(nx * 2, nz * 2) * 0.6 +
          noise2D(nx * 5, nz * 5) * 0.3 +
          noise2D(nx * 10, nz * 10) * 0.1) *
        heightScale;

      positions.push(xPos, y, zPos);
    }
  }

  for (let z = 0; z < segments; z++) {
    for (let x = 0; x < segments; x++) {
      const a = z * (segments + 1) + x;
      const b = a + 1;
      const c = a + (segments + 1);
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  return { positions, indices, segments };
}

function getTerrainHeight(x, z) {
  const nx = x / width + 0.5;
  const nz = z / depth + 0.5;
  return (
    (noise2D(nx * 2, nz * 2) * 0.6 +
      noise2D(nx * 5, nz * 5) * 0.3 +
      noise2D(nx * 10, nz * 10) * 0.1) *
    heightScale
  );
}

function generateBuildings({
  count = 30,
  area = 9, // spread across roughly the terrain width
  minHeight = 0.3,
  maxHeight = 3,
} = {}) {
  const buildings = [];

  let attempts = 0;
  while (buildings.length < count && attempts < count * 10) {
    attempts++;
    const x = (Math.random() - 0.5) * area;
    const z = (Math.random() - 0.5) * area;

    // use noise to cluster buildings like settlements instead of pure random scatter
    const density = noise2D(x * 0.4, z * 0.1);
    if (density < 0.1) continue; // skip "empty" areas, creates natural clustering

    const height = minHeight + Math.random() * (maxHeight - minHeight);
    const width = 0.3 + Math.random() * 0.4;
    const depth = 0.3 + Math.random() * 0.4;

    buildings.push({ x, z, height, width, depth, delay: Math.random() * 1.5 });
  }

  return buildings;
}

function Buildings({ terrainHeightAt }) {
  const meshRef = useRef();
  const buildings = useMemo(() => generateBuildings(), []);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startTime = useRef(performance.now());

  useEffect(() => {
    if (!meshRef.current) return;
    // set a base color per instance if you want variation later
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const elapsed = (performance.now() - startTime.current) / 1000;

    buildings.forEach((b, i) => {
      const growStart = 1.5 + b.delay; // wait for terrain intro first
      const growDuration = 0.6;
      const t = THREE.MathUtils.clamp(
        (elapsed - growStart) / growDuration,
        0,
        1,
      );
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

      const groundY = terrainHeightAt ? terrainHeightAt(b.x, b.z) : 0;
      const currentHeight = b.height * eased;

      dummy.position.set(b.x, groundY + currentHeight / 4, b.z);
      dummy.scale.set(b.width, Math.max(currentHeight, 0.001), b.depth);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[null, null, generateBuildings().length]}
    >
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial
        color="#007a55"
        emissive="#41ffc6"
        emissiveIntensity={0.25}
        transparent
        opacity={0.9}
      />
    </instancedMesh>
  );
}

function Terrain() {
  const meshRef = useRef();
  const startTime = useRef(null);

  const { geometry, targetHeights } = useMemo(() => {
    const { positions, indices } = generateTerrainGeometry();
    const geo = new THREE.BufferGeometry();

    // store target (full) heights, then flatten y to 0 for the start state
    const targetHeights = [];
    for (let i = 0; i < positions.length; i += 3) {
      targetHeights.push(positions[i + 1]); // the y value
      positions[i + 1] = 0; // flatten
    }

    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geo.setIndex(indices);
    geo.computeVertexNormals();

    return { geometry: geo, targetHeights };
  }, []);

  useFrame((state) => {
    if (startTime.current === null)
      startTime.current = state.clock.elapsedTime + 0.5;
    const elapsed = state.clock.elapsedTime - startTime.current;

    const duration = 1.5;
    const t = THREE.MathUtils.clamp(elapsed / duration, 0, 1);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic

    const posAttr = geometry.attributes.position;
    for (let i = 0; i < targetHeights.length; i++) {
      posAttr.setY(i, targetHeights[i] * eased);
    }
    posAttr.needsUpdate = true;

    if (t >= 1) {
      geometry.computeVertexNormals(); // final normals recalc once settled
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial color="#555555" wireframe />
    </mesh>
  );
}

function generateRoads(buildings, terrainHeightAt, { roadCount = 12 } = {}) {
  if (buildings.length < 2) return [];

  const roads = [];

  for (let i = 0; i < roadCount; i++) {
    const a = buildings[Math.floor(Math.random() * buildings.length)];
    const b = buildings[Math.floor(Math.random() * buildings.length)];
    if (a === b) continue;

    // midpoint with slight random offset, so the road isn't a dead-straight line
    const midX = (a.x + b.x) / 4 + (Math.random() - 0.5) * 3;
    const midZ = (a.z + b.z) / 2 + (Math.random() - 0.5) * 3;

    const points = [a, { x: midX, z: midZ }, b].map(
      (p) => new THREE.Vector3(p.x, terrainHeightAt(p.x, p.z) + 0.03, p.z),
    );

    const curve = new THREE.CatmullRomCurve3(points);
    roads.push(curve);
  }

  return roads;
}

function TrafficParticles({ roads, particlesPerRoad = 4 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    const list = [];
    roads.forEach((curve, roadIndex) => {
      for (let i = 0; i < particlesPerRoad; i++) {
        list.push({
          roadIndex,
          offset: 0, // always start at the road's beginning (a building)
          speed: 0.05 + Math.random() * 0.2,
          startDelay: 2.2 + Math.random() * 2, // staggered "leave the house" times
          started: false,
        });
      }
    });
    return list;
  }, [roads, particlesPerRoad]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const elapsed = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      const active = elapsed > p.startDelay;

      if (active) {
        p.offset = (p.offset + p.speed * delta) % 1;
      }

      const curve = roads[p.roadIndex];
      const point = curve.getPointAt(p.offset);

      dummy.position.copy(point);
      dummy.scale.setScalar(active ? 0.08 : 0); // invisible until it "leaves"
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, particles.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#5e8fea" toneMapped={false} />
    </instancedMesh>
  );
}

function RotatingScene() {
  const groupRef = useRef();
  const buildings = useMemo(() => generateBuildings(), []);
  const roads = useMemo(
    () => generateRoads(buildings, getTerrainHeight),
    [buildings],
  );

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} rotation={[13, 0, 0]}>
      <Terrain />
      <Buildings buildings={buildings} terrainHeightAt={getTerrainHeight} />
      <TrafficParticles roads={roads} />
    </group>
  );
}

export default function HeroScene() {
  return (
    <Container>
      <div id="canvas-container">
        <Canvas
          style={{ width: "100%", height: "100vh" }}
          camera={{
            position: [0, 2, 40],
            fov: 20,
          }}
        >
          <color attach="background" args={[0xfffff3]} />
          <Controls enableZoom={false} />
          <ambientLight intensity={0.6} />
          <CameraOffset />
          <RotatingScene />
        </Canvas>
      </div>
    </Container>
  );
}
