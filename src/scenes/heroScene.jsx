import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { SphereGeometry } from "three";
import { backgroundBlurriness } from "three/src/nodes/TSL.js";
import { useRef, useMemo, useEffect, useState } from "react";
import Container from "../components/ui/container";
import { createNoise2D } from "simplex-noise";
import * as THREE from "three";
import { OrbitControls, Line } from "@react-three/drei";
import { Button } from "../components/ui/button";
import { PencilSparkles } from "lucide-react";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Noise,
  Vignette,
  Scanline,
} from "@react-three/postprocessing";
import { ScanlineEffect } from "postprocessing";

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
      enablePan={false}
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

function getTerrainHeight(
  noise2D,
  x,
  z,
  width = 10,
  depth = 10,
  heightScale = 0.7,
) {
  const nx = x / width + 0.5;
  const nz = z / depth + 0.5;
  return (
    (noise2D(nx * 2, nz * 2) * 0.6 +
      noise2D(nx * 5, nz * 5) * 0.3 +
      noise2D(nx * 10, nz * 10) * 0.1) *
    heightScale
  );
}

function generateTerrainGeometry(noise2D, { segments = 30 } = {}) {
  const positions = [];
  const indices = [];

  for (let z = 0; z <= segments; z++) {
    for (let x = 0; x <= segments; x++) {
      const xPos = (x / segments - 0.5) * width;
      const zPos = (z / segments - 0.5) * depth;

      // layered noise for more natural-looking terrain
      const y = getTerrainHeight(
        noise2D,
        xPos,
        zPos,
        width,
        depth,
        heightScale,
      );

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

function generateBuildings(
  noise2D,
  {
    count = 30,
    area = 9, // spread across roughly the terrain width
    minHeight = 0.3,
    maxHeight = 3,
  } = {},
) {
  const buildings = [];

  let attempts = 0;
  while (buildings.length < count && attempts < count * 10) {
    attempts++;
    const x = (Math.random() - 0.5) * area;
    const z = (Math.random() - 0.5) * area;

    // use noise to cluster buildings like settlements instead of pure random scatter
    const density = noise2D(x * 0.4, z * 0.3);
    if (density < 0.1) continue; // skip "empty" areas, creates natural clustering

    const height = minHeight + Math.random() * (maxHeight - minHeight);
    const width = 0.3 + Math.random() * 0.4;
    const depth = 0.3 + Math.random() * 0.4;

    buildings.push({ x, z, height, width, depth, delay: Math.random() * 1.5 });
  }

  return buildings;
}

function Buildings({ buildings, noise2D }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startTime = useRef(performance.now());

  const opacityArray = useMemo(
    () => new Float32Array(buildings.length),
    [buildings.length],
  );

  useEffect(() => {
    if (!meshRef.current) return;

    meshRef.current.geometry.setAttribute(
      "instanceOpacity",
      new THREE.InstancedBufferAttribute(opacityArray, 1),
    );
  }, [opacityArray]);

  useFrame(() => {
    if (!meshRef.current) return;

    const elapsed = (performance.now() - startTime.current) / 1000;

    buildings.forEach((b, i) => {
      const growStart = 1.5 + b.delay;
      const growDuration = 0.6;

      const t = THREE.MathUtils.clamp(
        (elapsed - growStart) / growDuration,
        0,
        1,
      );

      const eased = 1 - Math.pow(1 - t, 3);

      // Fade in with growth
      opacityArray[i] = eased;

      const groundY = getTerrainHeight
        ? getTerrainHeight(noise2D, b.x, b.z)
        : 0;

      const currentHeight = b.height * eased;

      dummy.position.set(b.x, groundY + currentHeight / 4, b.z);

      dummy.scale.set(b.width, Math.max(currentHeight, 0.001), b.depth);

      dummy.updateMatrix();

      meshRef.current.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.geometry.attributes.instanceOpacity.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, buildings.length]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />

      <meshStandardMaterial
        color="#007a55"
        emissive="#41ffc6"
        emissiveIntensity={0.25}
        transparent
        onBeforeCompile={(shader) => {
          shader.vertexShader =
            `
            attribute float instanceOpacity;
            varying float vInstanceOpacity;
            varying float vHeight;
            ` + shader.vertexShader;

          shader.vertexShader = shader.vertexShader.replace(
            "#include <begin_vertex>",
            `
              #include <begin_vertex>
              
              vInstanceOpacity = instanceOpacity;
              vHeight = position.y;
              `,
          );

          shader.fragmentShader =
            `
            varying float vInstanceOpacity;
            varying float vHeight;
            ` + shader.fragmentShader;

          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
              #include <dithering_fragment>
              float fadeBottom = smoothstep(-0.2, 0.15, vHeight);

              gl_FragColor.a *= vInstanceOpacity * fadeBottom * 0.75;
              `,
          );
        }}
      />
    </instancedMesh>
  );
}

function Terrain({ noise2D }) {
  const meshRef = useRef();
  const startTime = useRef(null);

  const { geometry, targetHeights } = useMemo(() => {
    const { positions, indices } = generateTerrainGeometry(noise2D);
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
  }, [noise2D]);

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
    <>
      <mesh geometry={geometry}>
        <meshBasicMaterial color="#fffff3" />
      </mesh>

      <mesh geometry={geometry} position={[0, 0.01, 0]}>
        <meshBasicMaterial color="#555555" wireframe />
      </mesh>
    </>
  );
}

function generateRoads(
  buildings,
  noise2D,
  { roadCount = 7, samplesPerRoad = 20 } = {},
) {
  if (buildings.length < 2) return [];
  const roads = [];

  for (let i = 0; i < roadCount; i++) {
    const a = buildings[Math.floor(Math.random() * buildings.length)];
    const b = buildings[Math.floor(Math.random() * buildings.length)];
    if (a === b) continue;

    // slight lateral offset so the road isn't a dead-straight line
    const midX = (a.x + b.x) / 2 + (Math.random() - 0.5) * 3;
    const midZ = (a.z + b.z) / 2 + (Math.random() - 0.5) * 3;

    // build a rough 2D path (X/Z only) through a control point, using a flat CatmullRom in the plane
    const flatCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(a.x, 0, a.z),
      new THREE.Vector3(midX, 0, midZ),
      new THREE.Vector3(b.x, 0, b.z),
    ]);

    // now densely resample that XZ path and attach real terrain height at EACH point
    const points = [];
    for (let s = 0; s <= samplesPerRoad; s++) {
      const t = s / samplesPerRoad;
      const p = flatCurve.getPointAt(t);
      const y = getTerrainHeight(noise2D, p.x, p.z) + 0.05;
      points.push(new THREE.Vector3(p.x, y, p.z));
    }

    roads.push(new THREE.CatmullRomCurve3(points));
  }

  return roads;
}

function TrafficParticles({ roads, particlesPerRoad = 2 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const startTime = useRef(null);

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
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;

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

  {
    /* 5e8fea*/
  }
  return (
    <instancedMesh ref={meshRef} args={[null, null, particles.length]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#71cfab" toneMapped={false} />
    </instancedMesh>
  );
}

{
  /*2dd4a2*/
}
function Roads({ roads, color = "#3e78ce", maxOpacity = 0.9 }) {
  const lineRefs = useRef([]);
  const startTime = useRef(null);

  const roadPoints = useMemo(
    () => roads.map((curve) => curve.getPoints(50)),
    [roads],
  );
  const delays = useMemo(
    () => roads.map(() => 1.6 + Math.random() * 0.6),
    [roads],
  );

  useFrame((state) => {
    if (startTime.current === null) startTime.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startTime.current;
    const fadeDuration = 0.8;

    lineRefs.current.forEach((line, i) => {
      if (!line) return;

      const t = Math.min(Math.max((elapsed - delays[i]) / fadeDuration, 0), 1);
      line.material.opacity = t * maxOpacity;

      // animate dash offset to create a traveling pulse along the road
      line.material.uniforms.dashOffset.value -= 0.005;
    });
  });

  return (
    <>
      {roadPoints.map((points, i) => (
        <Line
          key={i}
          ref={(el) => (lineRefs.current[i] = el)}
          points={points}
          color={color}
          lineWidth={4}
          transparent
          opacity={0}
          dashed
          dashScale={2}
          dashSize={0.4}
          gapSize={0.6}
        />
      ))}
    </>
  );
}

function SceneContent() {
  const noise2D = useMemo(() => createNoise2D(), []);

  const buildings = useMemo(() => generateBuildings(noise2D), [noise2D]);
  const roads = useMemo(
    () => generateRoads(buildings, noise2D),
    [buildings, noise2D],
  );

  return (
    <>
      <Terrain noise2D={noise2D} />
      <Roads roads={roads} />
      <Buildings buildings={buildings} noise2D={noise2D} />
      <TrafficParticles roads={roads} />
    </>
  );
}

function RotatingScene({ children }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
    }
  });

  return (
    <group ref={groupRef} rotation={[13, 0, 0]}>
      {children}
    </group>
  );
}

export default function HeroScene() {
  const [seed, setSeed] = useState(0);
  return (
    <Container>
      <div id="canvas-container" className="relative">
        <Canvas
          style={{ width: "100%", height: "100vh" }}
          camera={{
            position: [0, 2, 40],
            fov: 20,
          }}
          gl={{
            toneMapping: THREE.NoToneMapping,
          }}
        >
          <color attach="background" args={[0xfffff3]} />
          <Controls />
          <CameraOffset />
          <ambientLight intensity={1} />
          <RotatingScene>
            <SceneContent key={seed} />
          </RotatingScene>
          <EffectComposer>
            <Bloom
              intensity={0.9}
              luminanceThreshold={0.5}
              luminanceSmoothing={3}
            />
            <Scanline />
          </EffectComposer>
        </Canvas>
        <Button
          variant="outline"
          className=" absolute top-245 right-0 w-fit px-4 py-6  pointer-events-auto border-2 border-emerald-700"
          onClick={() => setSeed((s) => s + 1)}
        >
          <PencilSparkles className="size-6 text-emerald-700" />
          <p className="text-base text-emerald-700 px-2">BUILD A NEW CITY!</p>
        </Button>
      </div>
    </Container>
  );
}
