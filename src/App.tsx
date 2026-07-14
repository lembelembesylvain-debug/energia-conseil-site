import { motion, useInView, animate } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import {
  getNormeForYear,
  getDPEIncoherenceMessage,
  getEligibilityStatus,
  estimateAnnualSavingsFromNormes,
  estimateFactureFromNormes,
} from "./lib/calculators/normes-thermiques";

/** Freemium : masque les détails financiers avancés et affiche le bloc conversion Premium */
const FREEMIUM = true;

type TabId = "calculateur" | "audit";

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const TRAVAUX_PRESETS: Record<string, number> = {
  essentiel: 25000,
  performance: 43000,
  performancePlus: 55000,
  excellence: 67500,
};

function goCheckout() {
  window.location.href = "#";
}

// --- Types & calculateur inline (autonome pour Vite/Bolt) ---
type MaPrimeRenovCategory = "BLEU" | "JAUNE" | "VIOLET" | "ROSE";
type DPEClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type Region = "IDF" | "OTHER";

type CalculationResult = {
  totalAides: number;
  resteACharge: number;
  economiesAnnuelles: number;
  maPrimeRenov: { category: MaPrimeRenovCategory };
};

const MPR_THRESHOLDS: Record<
  Region,
  Record<number, { bleu: number; jaune: number; violet: number }> & {
    perAdditional: { bleu: number; jaune: number; violet: number };
  }
> = {
  IDF: {
    1: { bleu: 24031, jaune: 29253, violet: 40851 },
    2: { bleu: 35270, jaune: 42933, violet: 60051 },
    3: { bleu: 42357, jaune: 51564, violet: 71846 },
    4: { bleu: 49455, jaune: 60208, violet: 84562 },
    5: { bleu: 56580, jaune: 68877, violet: 96817 },
    perAdditional: { bleu: 7116, jaune: 8663, violet: 12257 },
  },
  OTHER: {
    1: { bleu: 17363, jaune: 22259, violet: 31185 },
    2: { bleu: 25393, jaune: 32553, violet: 45842 },
    3: { bleu: 30540, jaune: 39148, violet: 55196 },
    4: { bleu: 35676, jaune: 45743, violet: 64550 },
    5: { bleu: 40802, jaune: 52338, violet: 73904 },
    perAdditional: { bleu: 5126, jaune: 6595, violet: 9354 },
  },
};

function getMaPrimeRenovCategory(
  income: number,
  householdSize: number,
  region: Region,
): MaPrimeRenovCategory {
  const thresholds = MPR_THRESHOLDS[region];
  const size = Math.min(Math.max(householdSize, 1), 5);
  let limit = thresholds[size];
  if (householdSize > 5) {
    const extra = householdSize - 5;
    limit = {
      bleu: thresholds[5].bleu + extra * thresholds.perAdditional.bleu,
      jaune: thresholds[5].jaune + extra * thresholds.perAdditional.jaune,
      violet: thresholds[5].violet + extra * thresholds.perAdditional.violet,
    };
  }
  if (income <= limit.bleu) return "BLEU";
  if (income <= limit.jaune) return "JAUNE";
  if (income <= limit.violet) return "VIOLET";
  return "ROSE";
}

function sumWorksCost(works: Record<string, { estimatedCost?: number } | undefined>): number {
  return Object.values(works).reduce(
    (total, item) => total + (item?.estimatedCost ?? 0),
    0,
  );
}

function calculateEnergyAids(
  household: {
    income: number;
    householdSize: number;
    region: Region;
  },
  logement: {
    surface: number;
    constructionYear: number;
    dpeActuel: DPEClass;
    dpeVise: DPEClass;
    annualConsumption?: number;
  },
  works: Record<string, { estimatedCost?: number } | undefined>,
  isParcoursAccompagne = false,
): CalculationResult {
  const coutTotalTravaux = sumWorksCost(works);
  const category = getMaPrimeRenovCategory(
    household.income,
    household.householdSize,
    household.region,
  );

  const parcoursRates: Record<MaPrimeRenovCategory, number> = {
    BLEU: 0.8,
    JAUNE: 0.6,
    VIOLET: 0.45,
    ROSE: 0.1,
  };
  const parcoursMax: Record<MaPrimeRenovCategory, number> = {
    BLEU: 32000,
    JAUNE: 24000,
    VIOLET: 18000,
    ROSE: 4000,
  };

  const mpr = isParcoursAccompagne
    ? Math.min(coutTotalTravaux * parcoursRates[category], parcoursMax[category])
    : Math.min(coutTotalTravaux * 0.35, parcoursMax[category]);

  const cee = Math.round(coutTotalTravaux * 0.12);
  const tvaEconomise = Math.round(coutTotalTravaux * (0.2 / 1.055) * 0.145);
  const totalAides = Math.min(
    Math.round(mpr + cee + tvaEconomise),
    Math.round(coutTotalTravaux * 0.95),
  );
  const resteACharge = Math.max(0, coutTotalTravaux - totalAides);

  const economiesAnnuelles = estimateAnnualSavingsFromNormes(
    logement.surface,
    logement.constructionYear,
    logement.dpeActuel,
    logement.dpeVise,
    logement.annualConsumption,
  );

  return {
    totalAides,
    resteACharge,
    economiesAnnuelles,
    maPrimeRenov: { category },
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function useCountUp(
  target: number,
  options: { suffix?: string; prefix?: string } = {},
) {
  const { suffix = "", prefix = "" } = options;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1] as const,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return {
    ref,
    text: `${prefix}${display.toLocaleString("fr-FR")}${suffix}`,
  };
}

function FadeSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

type LandingViewProps = { onStartAudit: () => void; };

const glassCard =
  "rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_8px_32px_rgba(16,185,129,0.12)]";

const gradientTitle =
  "bg-gradient-to-r from-white via-slate-100 to-emerald-400 bg-clip-text text-transparent";

const ctaButton =
  "animate-pulse-cta inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 px-8 py-4 text-lg font-bold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:brightness-110 hover:shadow-[0_0_28px_rgba(16,185,129,0.45)]";

const THERMAL_COLORS = {
  roof: 0xff2222,
  walls: 0xff8c42,
  windows: 0x991b1b,
  floor: 0x2563eb,
  door: 0x4a3728,
  chimney: 0x8b4513,
} as const;

function createThermalHouse(): THREE.Group {
  const house = new THREE.Group();
  const wallH = 2.4;
  const width = 4.2;
  const depth = 3.6;
  const wallT = 0.12;
  const pitch = 38 * (Math.PI / 180);
  const ridgeH = (depth / 2) * Math.tan(pitch);
  const slopeLen = depth / 2 / Math.cos(pitch) + 0.15;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.15, depth + 0.3),
    new THREE.MeshStandardMaterial({
      color: THERMAL_COLORS.floor,
      roughness: 0.75,
      metalness: 0.05,
      emissive: 0x0a1628,
      emissiveIntensity: 0.15,
    }),
  );
  floor.position.y = 0.075;
  floor.receiveShadow = true;
  floor.userData.heatSource = false;
  house.add(floor);

  const wallDefs: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [0, wallH / 2 + 0.15, -(depth / 2 + wallT / 2)], size: [width + wallT * 2, wallH, wallT] },
    { pos: [0, wallH / 2 + 0.15, depth / 2 + wallT / 2], size: [width + wallT * 2, wallH, wallT] },
    { pos: [width / 2 + wallT / 2, wallH / 2 + 0.15, 0], size: [wallT, wallH, depth + wallT * 2] },
    { pos: [-width / 2 - wallT / 2, wallH / 2 + 0.15, 0], size: [wallT, wallH, depth + wallT * 2] },
  ];

  wallDefs.forEach(({ pos, size }) => {
    const wall = new THREE.Mesh(
      new THREE.BoxGeometry(...size),
      new THREE.MeshStandardMaterial({
        color: THERMAL_COLORS.walls,
        roughness: 0.82,
        metalness: 0.04,
        emissive: 0x331400,
        emissiveIntensity: 0.2,
      }),
    );
    wall.position.set(...pos);
    wall.castShadow = true;
    wall.receiveShadow = true;
    wall.userData.heatSource = true;
    house.add(wall);
  });

  const roofMat = new THREE.MeshStandardMaterial({
    color: THERMAL_COLORS.roof,
    side: THREE.DoubleSide,
    roughness: 0.55,
    metalness: 0.08,
    emissive: 0x440000,
    emissiveIntensity: 0.35,
  });

  const roofFront = new THREE.Mesh(new THREE.PlaneGeometry(slopeLen, width + 0.35), roofMat);
  roofFront.rotation.order = "YXZ";
  roofFront.rotation.y = Math.PI / 2;
  roofFront.rotation.x = pitch;
  roofFront.position.set(-depth / 4, wallH + 0.15 + ridgeH / 2, 0);
  roofFront.castShadow = true;
  roofFront.userData.heatSource = true;
  house.add(roofFront);

  const roofBack = roofFront.clone();
  roofBack.rotation.y = -Math.PI / 2;
  roofBack.rotation.x = pitch;
  roofBack.position.set(depth / 4, wallH + 0.15 + ridgeH / 2, 0);
  roofBack.userData.heatSource = true;
  house.add(roofBack);

  const ridge = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, 0.08, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.7 }),
  );
  ridge.position.set(0, wallH + 0.15 + ridgeH, 0);
  house.add(ridge);

  const chimneyBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 0.9, 0.35),
    new THREE.MeshStandardMaterial({ color: THERMAL_COLORS.chimney, roughness: 0.85 }),
  );
  chimneyBase.position.set(1.1, wallH + 0.15 + ridgeH * 0.55, 0.4);
  chimneyBase.castShadow = true;
  house.add(chimneyBase);

  const chimneyTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.1, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.35 }),
  );
  chimneyTop.position.set(1.1, wallH + 0.15 + ridgeH * 0.55 + 0.5, 0.4);
  house.add(chimneyTop);

  const windowMat = new THREE.MeshStandardMaterial({
    color: THERMAL_COLORS.windows,
    roughness: 0.15,
    metalness: 0.25,
    emissive: 0x330000,
    emissiveIntensity: 0.45,
    transparent: true,
    opacity: 0.92,
  });

  const windowDefs: { pos: [number, number, number]; size: [number, number, number]; rotY?: number }[] = [
    { pos: [-1.1, 1.35, -(depth / 2 + wallT + 0.01)], size: [0.75, 0.95, 0.04] },
    { pos: [0.55, 1.35, -(depth / 2 + wallT + 0.01)], size: [0.75, 0.95, 0.04] },
    { pos: [1.35, 1.35, -(depth / 2 + wallT + 0.01)], size: [0.55, 0.95, 0.04] },
    { pos: [0, 2.05, -(depth / 2 + wallT + 0.01)], size: [0.65, 0.75, 0.04] },
    { pos: [width / 2 + wallT + 0.01, 1.35, 0.6], size: [0.04, 0.85, 0.65], rotY: Math.PI / 2 },
    { pos: [-0.8, 1.35, depth / 2 + wallT + 0.01], size: [0.65, 0.85, 0.04], rotY: Math.PI },
  ];

  windowDefs.forEach(({ pos, size, rotY = 0 }) => {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(size[0] + 0.08, size[1] + 0.08, size[2] + 0.04),
      new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.8 }),
    );
    frame.position.set(...pos);
    frame.rotation.y = rotY;
    house.add(frame);

    const win = new THREE.Mesh(new THREE.BoxGeometry(...size), windowMat.clone());
    win.position.set(...pos);
    win.rotation.y = rotY;
    win.userData.heatSource = true;
    house.add(win);
  });

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 1.35, 0.05),
    new THREE.MeshStandardMaterial({ color: THERMAL_COLORS.door, roughness: 0.85 }),
  );
  door.position.set(-0.15, 0.82, -(depth / 2 + wallT + 0.02));
  door.castShadow = true;
  house.add(door);

  const doorFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.78, 1.48, 0.06),
    new THREE.MeshStandardMaterial({ color: 0xf5f5dc, roughness: 0.75 }),
  );
  doorFrame.position.set(-0.15, 0.89, -(depth / 2 + wallT + 0.015));
  house.add(doorFrame);

  return house;
}

function createHeatParticles(count: number): {
  points: THREE.Points;
  velocities: Float32Array;
  origins: Float32Array;
} {
  const positions = new Float32Array(count * 3);
  const velocities = new Float32Array(count * 3);
  const origins = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const isRoof = Math.random() > 0.45;
    let x: number;
    let y: number;
    let z: number;

    if (isRoof) {
      x = (Math.random() - 0.5) * 3.8;
      y = 3.1 + Math.random() * 0.6;
      z = (Math.random() - 0.5) * 3.2;
    } else {
      const wall = Math.floor(Math.random() * 4);
      y = 0.5 + Math.random() * 2.2;
      if (wall === 0) {
        x = (Math.random() - 0.5) * 3.8;
        z = -1.86;
      } else if (wall === 1) {
        x = (Math.random() - 0.5) * 3.8;
        z = 1.86;
      } else if (wall === 2) {
        x = 2.16;
        z = (Math.random() - 0.5) * 3.2;
      } else {
        x = -2.16;
        z = (Math.random() - 0.5) * 3.2;
      }
    }

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    origins[i * 3] = x;
    origins[i * 3 + 1] = y;
    origins[i * 3 + 2] = z;
    velocities[i * 3] = (Math.random() - 0.5) * 0.008;
    velocities[i * 3 + 1] = 0.012 + Math.random() * 0.018;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = Math.random();
    colors[i * 3] = 1;
    colors[i * 3 + 1] = 0.25 + t * 0.45;
    colors[i * 3 + 2] = 0.05 + t * 0.1;
  }
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.07,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    sizeAttenuation: true,
  });

  return {
    points: new THREE.Points(geometry, material),
    velocities,
    origins,
  };
}

function ThermalHouse3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1a);
    scene.fog = new THREE.FogExp2(0x0a0f1a, 0.045);

    const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
    camera.position.set(5.5, 3.8, 6.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(0, 1.6, 0);
    controls.minDistance = 4;
    controls.maxDistance = 14;
    controls.maxPolarAngle = Math.PI / 2.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.65;

    const ambient = new THREE.AmbientLight(0x1e293b, 0.55);
    scene.add(ambient);

    const hemi = new THREE.HemisphereLight(0x10b981, 0x0f172a, 0.35);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xffeedd, 1.1);
    keyLight.position.set(6, 10, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 30;
    keyLight.shadow.camera.left = -8;
    keyLight.shadow.camera.right = 8;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.35);
    rimLight.position.set(-4, 3, -5);
    scene.add(rimLight);

    const house = createThermalHouse();
    scene.add(house);

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(8, 48),
      new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.95,
        metalness: 0,
        transparent: true,
        opacity: 0.6,
      }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const grid = new THREE.GridHelper(10, 20, 0x10b981, 0x1e293b);
    grid.position.y = 0.01;
    (grid.material as THREE.Material).opacity = 0.12;
    (grid.material as THREE.Material).transparent = true;
    scene.add(grid);

    const { points: heatParticles, velocities, origins } = createHeatParticles(320);
    scene.add(heatParticles);

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    const onPointerEnter = () => {
      controls.autoRotate = false;
    };
    const onPointerLeave = () => {
      controls.autoRotate = true;
    };
    host.addEventListener("pointerenter", onPointerEnter);
    host.addEventListener("pointerleave", onPointerLeave);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const pos = heatParticles.geometry.attributes.position.array as Float32Array;

      for (let i = 0; i < pos.length / 3; i++) {
        pos[i * 3] += velocities[i * 3] + Math.sin(clock.elapsedTime * 2 + i) * 0.001;
        pos[i * 3 + 1] += velocities[i * 3 + 1] * (1 + dt * 8);
        pos[i * 3 + 2] += velocities[i * 3 + 2] + Math.cos(clock.elapsedTime * 1.5 + i) * 0.001;

        if (pos[i * 3 + 1] > 5.2) {
          pos[i * 3] = origins[i * 3] + (Math.random() - 0.5) * 0.15;
          pos[i * 3 + 1] = origins[i * 3 + 1];
          pos[i * 3 + 2] = origins[i * 3 + 2] + (Math.random() - 0.5) * 0.15;
        }
      }
      heatParticles.geometry.attributes.position.needsUpdate = true;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      ro.disconnect();
      host.removeEventListener("pointerenter", onPointerEnter);
      host.removeEventListener("pointerleave", onPointerLeave);
      controls.dispose();
      heatParticles.geometry.dispose();
      (heatParticles.material as THREE.Material).dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (host.contains(renderer.domElement)) {
        host.removeChild(renderer.domElement);
      }
    };
  }, []);

  const badges = [
    { label: "DPE F → A", top: "18%", left: "6%", delay: "0s" },
    { label: "Aides : 90%", top: "12%", right: "4%", delay: "0.5s" },
    { label: "Gain : +390€/mois", bottom: "28%", left: "4%", delay: "1s" },
    { label: "CO₂ : -5.8t", bottom: "18%", right: "6%", delay: "1.5s" },
  ];

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/80 shadow-[0_0_60px_rgba(16,185,129,0.15)] backdrop-blur-md lg:aspect-square lg:min-h-[420px]"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage: `
            linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/60 px-4 py-2.5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          <span className="text-xs font-semibold tracking-wider text-emerald-400/90">
            SCAN IA — ENERGIA
          </span>
        </div>
        <span className="animate-scan-pulse font-mono text-[10px] text-emerald-500/70">
          ● LIVE
        </span>
      </div>

      <div
        ref={canvasHostRef}
        className="absolute inset-0 z-0 cursor-grab pt-10 active:cursor-grabbing [&>canvas]:!h-full [&>canvas]:!w-full"
        aria-label="Modélisation 3D thermique interactive — faites glisser pour pivoter la maison"
        role="img"
      />

      {badges.map((badge) => (
        <div
          key={badge.label}
          className="animate-float-badge pointer-events-none absolute z-10 rounded-lg border border-emerald-500/30 bg-slate-900/90 px-2.5 py-1.5 text-[10px] font-semibold text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.2)] backdrop-blur-sm sm:px-3 sm:py-2 sm:text-xs"
          style={{
            top: badge.top,
            left: badge.left,
            right: badge.right,
            bottom: badge.bottom,
            animationDelay: badge.delay,
          }}
        >
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
          {badge.label}
        </div>
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 border-t border-slate-800/60 bg-slate-950/70 px-4 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between font-mono text-[10px] text-slate-500">
          <span>Analyse thermique… 94%</span>
          <span className="text-emerald-500/80">IA v3.2</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-emerald-600 to-teal-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
        </div>
      </div>
    </div>
  );
}

function LandingView({ onStartAudit }: LandingViewProps) {
  const surface = useCountUp(164, { suffix: " m²" });
  const gain = useCountUp(390, { prefix: "+", suffix: " €" });
  const taux = useCountUp(90, { suffix: "%" });

  const mprProfiles = [
    { name: "Bleu", revenus: "Très modestes", taux: "90%", badge: "bg-blue-500/20 text-blue-300 border-blue-400/40 shadow-[0_0_12px_rgba(59,130,246,0.25)]" },
    { name: "Jaune", revenus: "Modestes", taux: "70%", badge: "bg-yellow-500/20 text-yellow-300 border-yellow-400/40 shadow-[0_0_12px_rgba(234,179,8,0.25)]" },
    { name: "Violet", revenus: "Intermédiaires", taux: "55%", badge: "bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.25)]" },
    { name: "Rose", revenus: "Aisés", taux: "35%", badge: "bg-pink-500/20 text-pink-300 border-pink-400/40 shadow-[0_0_12px_rgba(236,72,153,0.25)]" },
  ];

  const testimonials = [
    {
      name: "M. DUPONT — Lyon (69)",
      initials: "MD",
      quote: "Passé de DPE G à A en 12 semaines. Je gagne 420€/mois net. L'équipe ENERGIA a tout géré !",
    },
    {
      name: "Mme MARTIN — Saint-Étienne (42)",
      initials: "MM",
      quote: "Zéro apport, zéro stress. Les aides ont tout couvert. Je recommande à 100%.",
    },
    {
      name: "M. BERNARD — Grenoble (38)",
      initials: "MB",
      quote: "L'audit IA m'a bluffé. 85 pages ultra-précises livrées en 24h. Projet signé la semaine suivante.",
    },
  ];

  return (
    <div className="relative overflow-x-hidden bg-slate-950 text-slate-200">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
      >
        <div className="absolute left-1/4 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#0f766e]/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] translate-x-1/2 rounded-full bg-[#10b981]/15 blur-[100px]" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-900/10 blur-[80px]" />
      </div>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="#"
            className="flex items-center gap-1.5 text-lg font-bold tracking-tight sm:text-xl"
          >
            <span className="text-emerald-400" aria-hidden>⚡</span>
            <span className={gradientTitle}>ENERGIA CONSEIL IA®</span>
          </a>

          <nav
            className="hidden items-center gap-6 text-sm font-medium text-slate-400 md:flex"
            aria-label="Navigation principale"
          >
            {[
              ["#", "Accueil"],
              ["#comment-ca-marche", "Comment ça marche"],
              ["#aides-2026", "Aides 2026"],
              ["#contact", "Nous contacter"],
            ].map(([href, label]) => (
              <a
                key={label}
                href={href}
                className="transition hover:text-emerald-400"
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={onStartAudit}
            className="animate-pulse-cta shrink-0 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(16,185,129,0.3)] transition hover:brightness-110 sm:px-5 sm:text-base"
          >
            Démarrer mon Audit Gratuit
          </button>
        </div>
      </header>

      <section className="relative pt-24 sm:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-12">
          <motion.div initial="hidden" animate="visible" className="flex flex-col">
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 backdrop-blur-sm"
            >
              <span>🏆</span>
              <span>N°1 de la Rénovation Globale en Auvergne-Rhône-Alpes</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className={`text-balance text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem] ${gradientTitle}`}
            >
              Transformez votre passoire thermique en maison A+ et économisez 584 €/mois
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400 sm:text-xl"
            >
              Notre IA analyse votre logement, calcule vos aides MaPrimeRénov'
              2026 et génère votre audit complet en 30 min. Zéro apport. Zéro stress.
            </motion.p>

            <motion.div custom={3} variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              {[
                "✅ Audit IA en 30 minutes",
                "🛡️ Décennale MIC LUNPIB2604975",
                "💰 Zéro apport possible",
              ].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-slate-700/80 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 backdrop-blur-sm"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

            <motion.div custom={4} variants={fadeUp} className="mt-10">
              <button type="button" onClick={onStartAudit} className={`${ctaButton} sm:px-10 sm:py-5 sm:text-xl`}>
                🚀 Démarrer mon Audit Gratuit
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto w-full max-w-md lg:max-w-none"
          >
            <ThermalHouse3D />
          </motion.div>
        </div>
      </section>

      <FadeSection className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {[
            { ref: surface.ref, icon: "🏠", value: surface.text, label: "Surface moyenne rénovée" },
            { ref: gain.ref, icon: "💰", value: gain.text, label: "Gain net mensuel moyen" },
            { ref: taux.ref, icon: "⚡", value: taux.text, label: "Taux d'aides Profil Bleu" },
            { ref: null, icon: "⭐", value: "F→A", label: "Saut énergétique moyen", prefix: "DPE " },
          ].map((stat) => (
            <div
              key={stat.label}
              ref={stat.ref ?? undefined}
              className={`${glassCard} p-5 text-center sm:p-6`}
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-900/60 text-lg shadow-[0_0_16px_rgba(16,185,129,0.2)]">
                {stat.icon}
              </div>
              <p className="mt-4 text-2xl font-extrabold tracking-tight text-emerald-400 sm:text-3xl lg:text-4xl">
                {"prefix" in stat ? stat.prefix : null}
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-medium text-slate-500 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeSection>

      <FadeSection id="comment-ca-marche" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className={`text-center text-3xl font-bold tracking-tight sm:text-4xl ${gradientTitle}`}>
            Comment ça marche
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-400">
            Trois étapes simples pour transformer votre logement
          </p>

          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              { icon: "📋", title: "Je remplis le formulaire (5 min)", desc: "Nom, adresse, surface, DPE, revenus." },
              { icon: "🤖", title: "L'IA analyse mon logement (25 min)", desc: "Calcul des aides, simulation financière, recommandations techniques." },
              { icon: "📄", title: "Je reçois mon Audit Complet (48h)", desc: "85 pages personnalisées avec votre plan de financement Zéro Apport." },
            ].map((step, i) => (
              <motion.article
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className={`group ${glassCard} p-8`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-900/70 text-2xl shadow-[0_0_20px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/20">
                  {step.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-white">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-slate-400">{step.desc}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button type="button" onClick={onStartAudit} className={ctaButton}>
              Commencer maintenant →
            </button>
          </div>
        </div>
      </FadeSection>

      <FadeSection className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className={`text-center text-3xl font-bold tracking-tight sm:text-4xl ${gradientTitle}`}>
            Les 3 piliers ENERGIA
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {[
              { icon: "🏠", title: "L'Isolation", stat: "-40% de déperditions" },
              { icon: "🌡️", title: "La PAC", stat: "-60% de facture chauffage" },
              { icon: "☀️", title: "Le Solaire", stat: "Facture résiduelle 208€/an" },
            ].map((pillar, i) => (
              <motion.article
                key={pillar.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`${glassCard} p-8 text-center`}
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-900/70 text-3xl shadow-[0_0_24px_rgba(16,185,129,0.3)] ring-1 ring-emerald-500/25">
                  {pillar.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-white">{pillar.title}</h3>
                <p className="mt-3 text-2xl font-extrabold text-emerald-400">{pillar.stat}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection id="aides-2026" className="scroll-mt-24">
        <div className="border-y border-amber-500/20 bg-amber-500/5 px-4 py-6 backdrop-blur-sm sm:px-6 lg:px-8">
          <p className="mx-auto max-w-4xl text-center text-sm font-medium leading-relaxed text-amber-200/90 sm:text-base">
            ⚡ <strong className="text-amber-100">ATTENTION :</strong> Les passoires thermiques (DPE F et G)
            ont jusqu'au <strong>31 décembre 2026</strong> pour accéder au parcours par geste.
            À partir de 2027, seul le Parcours Accompagné sera disponible.
          </p>
        </div>

        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className={`text-center text-3xl font-bold tracking-tight sm:text-4xl ${gradientTitle}`}>
              Profils MaPrimeRénov' 2026
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-amber-400/80">
              Aides financières 2026 (estimation à titre indicatif). Montants définitifs après instruction ANAH et CEE.
            </p>

            <div className={`mt-10 overflow-hidden rounded-2xl ${glassCard} hover:translate-y-0`}>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[320px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-800/80 bg-slate-900/80">
                      <th className="px-5 py-4 text-sm font-semibold text-slate-300">Profil</th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-300">Revenus</th>
                      <th className="px-5 py-4 text-sm font-semibold text-slate-300">Taux MPR</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm sm:text-base">
                    {mprProfiles.map((row, i) => (
                      <tr
                        key={row.name}
                        className={`border-b border-slate-800/60 transition hover:bg-slate-800/30 ${i % 2 === 0 ? "bg-slate-900/40" : "bg-slate-950/40"}`}
                      >
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold sm:text-sm ${row.badge}`}>
                            {row.name}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-400">{row.revenus}</td>
                        <td className="px-5 py-4 font-bold text-emerald-400">{row.taux}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={onStartAudit}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-8 py-3.5 font-semibold text-emerald-300 transition hover:border-emerald-400/60 hover:bg-emerald-500/20 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
              >
                Calculer mes aides →
              </button>
            </div>
          </div>
        </div>
      </FadeSection>

      <FadeSection className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className={`text-center text-3xl font-bold tracking-tight sm:text-4xl ${gradientTitle}`}>
            Ils nous font confiance
          </h2>
          <div className="mt-14 grid gap-6 md:grid-cols-3 md:gap-8">
            {testimonials.map((t, i) => (
              <motion.article
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className={`${glassCard} p-8`}
              >
                <div className="animate-star-glow text-lg tracking-wider text-amber-400" aria-hidden>
                  ★★★★★
                </div>
                <blockquote className="mt-4 leading-relaxed text-slate-300 italic">
                  « {t.quote} »
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-sm font-bold text-white shadow-[0_0_16px_rgba(16,185,129,0.35)] ring-2 ring-emerald-500/30">
                    {t.initials}
                  </div>
                  <p className="font-bold text-white">{t.name}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </FadeSection>

      <FadeSection className="px-4 py-24 sm:px-6 lg:px-8" id="cta-final">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 px-6 py-16 text-center shadow-[0_0_60px_rgba(16,185,129,0.15)] sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" aria-hidden />
          <h2 className={`relative text-balance text-3xl font-extrabold sm:text-4xl md:text-5xl ${gradientTitle}`}>
            Votre maison mérite le meilleur.
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg text-slate-400">
            Rejoignez les propriétaires qui ont choisi l'autonomie énergétique.
          </p>
          <button
            type="button"
            onClick={onStartAudit}
            className="relative mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-bold text-emerald-700 shadow-[0_0_30px_rgba(255,255,255,0.15)] transition hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] sm:text-xl"
          >
            🚀 Démarrer mon Audit Gratuit
          </button>
        </div>
      </FadeSection>

      <footer
        id="contact"
        className="scroll-mt-24 border-t border-slate-800/80 bg-slate-950/90 px-4 py-14 text-slate-400 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div>
              <p className={`text-xl font-bold ${gradientTitle}`}>⚡ ENERGIA CONSEIL IA®</p>
              <address className="mt-4 not-italic text-sm leading-relaxed">
                16 Rue Cuvier, 69006 Lyon
                <br />
                SIRET : 941 819 427 00019
                <br />
                <a href="mailto:contact@energia-conseil-ia.com" className="transition hover:text-emerald-400">
                  contact@energia-conseil-ia.com
                </a>
                <br />
                <a href="tel:+33610596898" className="transition hover:text-emerald-400">
                  06 10 59 68 98
                </a>
              </address>
            </div>

            <div className="text-sm">
              <p className="font-semibold text-white">Informations légales</p>
              <ul className="mt-3 space-y-2">
                {["CGV", "Mentions Légales", "Politique de confidentialité"].map((link) => (
                  <li key={link}>
                    <a href="#" className="transition hover:text-emerald-400">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-slate-800/80 pt-8 text-center text-sm">
            <p className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-emerald-300/80">
              Partenaire ANAH France Rénov' | Marque déposée INPI N°5213845
            </p>
            <p className="mt-4 text-slate-600">
              © {new Date().getFullYear()} ENERGIA-CONSEIL IA® — Tous droits réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function dpeIndex(dpe: DPEClass): number {
  return "ABCDEFG".indexOf(dpe);
}

function buildWorks(totalCost: number) {
  const roof = Math.round(totalCost * 0.12);
  const walls = Math.round(totalCost * 0.28);
  const windows = Math.round(totalCost * 0.1);
  const vmc = Math.round(totalCost * 0.06);
  const pac = Math.round(totalCost * 0.32);
  const ballon = Math.round(totalCost * 0.07);
  const remainder = totalCost - roof - walls - windows - vmc - pac - ballon;

  return {
    roofInsulation: { type: "combles", surface: 80, rValue: 8, estimatedCost: roof },
    iti: { type: "iti", surface: 100, rValue: 3.7, estimatedCost: walls + Math.max(0, remainder) },
    windows: { type: "fenetres", quantity: 8, estimatedCost: windows },
    vmcDoubleFlux: { type: "vmc_df", estimatedCost: vmc },
    heatPumpAirWater: { type: "pac", cop: 4.5, estimatedCost: pac },
    thermodynamicWaterHeater: { type: "ballon", estimatedCost: ballon },
  };
}

function estimateMonthlyLoan(resteACharge: number, years = 15): number {
  if (resteACharge <= 0) return 0;
  return Math.round(resteACharge / (years * 12));
}

function estimateGainNetMensuel(
  economiesMois: number,
  mensualite: number,
): number {
  return Math.round(economiesMois - mensualite);
}

function buildProjection30Ans(
  resteACharge: number,
  economiesAnnuelles: number,
): { year: number; cumul: number }[] {
  const rows: { year: number; cumul: number }[] = [];
  let cumul = -resteACharge;
  for (let year = 1; year <= 30; year += 1) {
    cumul += economiesAnnuelles;
    rows.push({ year, cumul });
  }
  return rows;
}

function AuditPremiumBlock({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="rounded-2xl border-4 border-emerald-600 bg-emerald-50 p-6 md:p-8 shadow-lg">
      <h3 className="text-xl md:text-2xl font-bold text-emerald-900 mb-3">
        🚀 Passez au niveau supérieur !
      </h3>
      <p className="text-emerald-800 font-medium mb-4">
        Débloquez l'analyse complète de votre projet :
      </p>
      <ul className="space-y-2 text-emerald-900 text-sm md:text-base mb-2">
        <li>✅ Votre plan de financement détaillé sur 30 ans</li>
        <li>✅ Le ROI précis de votre batterie solaire</li>
        <li>✅ Tous les détails des aides au centime près</li>
        <li>✅ Votre Rapport d'Audit IA complet de 85 pages</li>
      </ul>
      <p className="text-emerald-700 text-sm italic mb-1">
        (Envoyé par email sous 5 minutes après paiement)
      </p>
      <button type="button" onClick={onCheckout} className="big-green-button">
        Je veux mon Audit IA Premium (199 €)
      </button>
    </div>
  );
}

function PlanFinancementCourtierTable({
  montantTravaux,
  resteACharge,
  economiesAnnuelles,
}: {
  montantTravaux: number;
  resteACharge: number;
  economiesAnnuelles: number;
}) {
  const mensualite = estimateMonthlyLoan(montantTravaux);
  const economiesMois = Math.round(economiesAnnuelles / 12);
  const gainNet = estimateGainNetMensuel(economiesMois, mensualite);

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        💳 Plan de Financement Courtier
      </h3>
      <p className="text-xs text-amber-700 mb-3">
        Aides financières 2026 (estimation à titre indicatif). Montants définitifs
        après instruction ANAH et CEE.
      </p>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="py-2 text-gray-600">Montant financé (FABIEN)</td>
            <td className="py-2 text-right font-semibold">{fmt(montantTravaux)}</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Mensualité estimée (15 ans)</td>
            <td className="py-2 text-right font-semibold text-teal-700">
              {fmt(mensualite)}/mois
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Économies chauffage/mois</td>
            <td className="py-2 text-right font-semibold text-emerald-700">
              +{fmt(economiesMois)}/mois
            </td>
          </tr>
          <tr className="bg-emerald-50">
            <td className="py-3 font-bold text-emerald-900">Gain net mensuel</td>
            <td className="py-3 text-right font-bold text-emerald-800">
              {gainNet >= 0 ? "+" : ""}
              {fmt(gainNet)}/mois
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Projection30AnsTable({
  resteACharge,
  economiesAnnuelles,
}: {
  resteACharge: number;
  economiesAnnuelles: number;
}) {
  const rows = buildProjection30Ans(resteACharge, economiesAnnuelles);
  const breakeven = rows.find((r) => r.cumul >= 0)?.year;

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        📈 Projection sur 30 ans
      </h3>
      {breakeven ? (
        <p className="text-sm text-emerald-700 mb-3">
          Rentabilité estimée à <strong>{breakeven} ans</strong>
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[280px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4">Année</th>
              <th className="py-2 text-right">Bénéfice net cumulé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[5, 10, 15, 20, 25, 30].map((year) => {
              const row = rows[year - 1];
              return (
                <tr key={year}>
                  <td className="py-2 text-gray-600">An {year}</td>
                  <td
                    className={`py-2 text-right font-medium ${
                      row.cumul >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {fmt(row.cumul)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ROIBatterieBlock({ roiBatterieAns }: { roiBatterieAns: number }) {
  const alerte = roiBatterieAns > 12;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">🔋 ROI Batterie</h3>
        <p className="text-2xl font-bold text-amber-800">
          {roiBatterieAns.toFixed(1)} ans
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Retour sur investissement batterie LFP 7 kWh (option solaire)
        </p>
      </div>
      {alerte ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-red-800 text-sm">
          ⚠️ <strong>Alerte :</strong> le ROI batterie dépasse 12 ans — l'analyse
          Premium détaille les scénarios avec et sans stockage pour optimiser votre
          rentabilité.
        </div>
      ) : null}
    </div>
  );
}

type AuditSimulatorViewProps = { onBack: () => void; };

function AuditSimulatorView({ onBack }: AuditSimulatorViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("calculateur");
  const [calculated, setCalculated] = useState(false);

  const [surface, setSurface] = useState(100);
  const [anneeConstruction, setAnneeConstruction] = useState(1985);
  const [consommationReelle, setConsommationReelle] = useState<number | "">("");
  const [revenus, setRevenus] = useState(25000);
  const [personnes, setPersonnes] = useState(2);
  const [region, setRegion] = useState<Region>("OTHER");
  const [dpeActuel, setDpeActuel] = useState<DPEClass>("F");
  const [dpeVise, setDpeVise] = useState<DPEClass>("B");
  const [presetTravaux, setPresetTravaux] = useState("performancePlus");

  const montantTravaux = TRAVAUX_PRESETS[presetTravaux] ?? 55000;

  const eligibility = getEligibilityStatus(anneeConstruction);
  const dpeIncoherentMessage = getDPEIncoherenceMessage(dpeActuel, anneeConstruction);
  const norme = getNormeForYear(anneeConstruction);
  const normeBadge = `🏗️ Norme applicable : ${norme.norme} (construction ${anneeConstruction})`;
  const annualConsumption =
    consommationReelle === "" ? undefined : Number(consommationReelle);

  const result: CalculationResult | null = useMemo(() => {
    if (!calculated || eligibility.status === "blocked") return null;
    return calculateEnergyAids(
      {
        income: revenus,
        householdSize: personnes,
        region,
      },
      {
        surface,
        constructionYear: anneeConstruction,
        dpeActuel,
        dpeVise,
        annualConsumption,
      },
      buildWorks(montantTravaux),
      true,
    );
  }, [
    calculated,
    eligibility.status,
    revenus,
    personnes,
    region,
    surface,
    anneeConstruction,
    dpeActuel,
    dpeVise,
    montantTravaux,
    annualConsumption,
  ]);

  const factureAvant = estimateFactureFromNormes(
    surface,
    anneeConstruction,
    dpeActuel,
    annualConsumption,
  );
  const factureApres = estimateFactureFromNormes(
    surface,
    anneeConstruction,
    dpeVise,
    annualConsumption,
    dpeActuel,
  );
  const economiesAnnuelles =
    result?.economiesAnnuelles ?? Math.max(0, factureAvant - factureApres);
  const resteACharge = result?.resteACharge ?? montantTravaux;
  const totalAides = result?.totalAides ?? 0;
  const roiBatterieAns = 14.5;

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    if (eligibility.status === "blocked") return;
    setCalculated(true);
    setActiveTab("audit");
  };

  if (eligibility.status === "blocked") {
    return (
      <main className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-950 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-8">
            <button
              type="button"
              onClick={onBack}
              className="mb-4 inline-block text-sm text-emerald-200/90 underline-offset-2 hover:text-white hover:underline"
            >
              ← Retour à l'accueil
            </button>
            <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase mb-1">
              ENERGIA-CONSEIL IA®
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Simulateur rénovation énergétique 2026
            </h1>
          </header>
          <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-8 text-center shadow-xl">
            <p className="text-lg font-semibold text-red-800 leading-relaxed">
              {eligibility.message}
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-6 px-6 py-3 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </main>
    );
  }

  const tabs: { id: TabId; label: string }[] = [
    { id: "calculateur", label: "Calculateur" },
    { id: "audit", label: "Audit Énergétique" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-block text-sm text-emerald-200/90 underline-offset-2 hover:text-white hover:underline"
          >
            ← Retour à l'accueil
          </button>
          <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase mb-1">
            ENERGIA-CONSEIL IA®
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Simulateur rénovation énergétique 2026
          </h1>
          <p className="text-teal-100/90 mt-2 text-sm md:text-base">
            Estimation gratuite · Audit complet Premium 199 €
          </p>
        </header>

        <div
          className="flex rounded-xl bg-white/10 p-1 mb-6 backdrop-blur-sm"
          role="tablist"
          aria-label="Sections simulateur"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              disabled={tab.id === "audit" && !calculated}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-emerald-900 shadow-md"
                  : "text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "calculateur" ? (
          <section
            role="tabpanel"
            className="rounded-2xl bg-white p-6 md:p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Vos informations
            </h2>
            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Surface (m²)
                  </span>
                  <input
                    type="number"
                    min={20}
                    max={500}
                    value={surface}
                    onChange={(e) => setSurface(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Année de construction
                  </span>
                  <input
                    type="number"
                    min={1800}
                    max={new Date().getFullYear()}
                    value={anneeConstruction}
                    onChange={(e) => setAnneeConstruction(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                  <p className="mt-1 text-xs text-teal-700">{normeBadge}</p>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Consommation réelle annuelle (kWh) — optionnel
                </span>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={consommationReelle}
                  onChange={(e) =>
                    setConsommationReelle(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  placeholder={`Par défaut : ${norme.consoDefaut} kWh/m²/an (${Math.round(norme.consoDefaut * surface)} kWh/an)`}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>

              {dpeIncoherentMessage ? (
                <div className="rounded-lg border border-amber-400 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {dpeIncoherentMessage}
                </div>
              ) : null}

              {eligibility.status === "warning" && eligibility.message ? (
                <div className="rounded-lg border border-orange-400 bg-orange-50 px-4 py-3 text-sm text-orange-900">
                  {eligibility.message}
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Revenus annuels (€)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={revenus}
                    onChange={(e) => setRevenus(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Personnes au foyer
                  </span>
                  <select
                    value={personnes}
                    onChange={(e) => setPersonnes(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} personne{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">Région</span>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as Region)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 md:max-w-xs"
                >
                  <option value="OTHER">Hors Île-de-France</option>
                  <option value="IDF">Île-de-France</option>
                </select>
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    DPE actuel
                  </span>
                  <select
                    value={dpeActuel}
                    onChange={(e) => setDpeActuel(e.target.value as DPEClass)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {(["G", "F", "E", "D", "C"] as DPEClass[]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    DPE visé
                  </span>
                  <select
                    value={dpeVise}
                    onChange={(e) => setDpeVise(e.target.value as DPEClass)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {(["D", "C", "B", "A"] as DPEClass[]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Bouquet de travaux
                </span>
                <select
                  value={presetTravaux}
                  onChange={(e) => setPresetTravaux(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <option value="essentiel">Essentiel — 25 000 €</option>
                  <option value="performance">Performance — 43 000 €</option>
                  <option value="performancePlus">Performance+ — 55 000 €</option>
                  <option value="excellence">Excellence — 67 500 €</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:shadow-lg transition-shadow"
              >
                📈 Calculer mon audit gratuit
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "audit" && result ? (
          <section role="tabpanel" className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300/50 p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ⚡ Synthèse de votre audit (aperçu gratuit)
              </h2>

              <div className="rounded-xl border border-teal-300 bg-white/90 p-4 mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-2">
                  Profil énergétique
                </h3>
                <span className="inline-flex items-center rounded-full bg-teal-100 border border-teal-300 px-3 py-1.5 text-sm font-medium text-teal-900">
                  {normeBadge}
                </span>
                {dpeIncoherentMessage ? (
                  <p className="mt-3 text-sm text-amber-800">{dpeIncoherentMessage}</p>
                ) : null}
                {eligibility.status === "warning" && eligibility.message ? (
                  <p className="mt-3 text-sm text-orange-800">{eligibility.message}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Travaux TTC</p>
                  <p className="font-bold text-gray-900">{fmt(montantTravaux)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Aides estimées</p>
                  <p className="font-bold text-emerald-700">{fmt(totalAides)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Reste à charge</p>
                  <p className="font-bold text-teal-800">{fmt(resteACharge)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Profil MPR</p>
                  <p className="font-bold text-gray-900">
                    {result.maPrimeRenov.category}
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Aides financières 2026 (estimation à titre indicatif). Aides à valider
                selon revenus réels du client. Montants définitifs après instruction
                ANAH et CEE.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl bg-white/70 p-4 text-center">
                  <p className="text-xs text-gray-500">Facture AVANT</p>
                  <p className="text-lg font-bold text-amber-700">
                    {fmt(factureAvant)}/an
                  </p>
                  <p className="text-xs text-gray-500">DPE {dpeActuel}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4 text-center">
                  <p className="text-xs text-gray-500">Facture APRÈS</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {fmt(factureApres)}/an
                  </p>
                  <p className="text-xs text-gray-500">DPE {dpeVise}</p>
                </div>
              </div>

              <p className="text-center text-emerald-800 font-semibold">
                Gain DPE : {dpeActuel} → {dpeVise} (
                {Math.max(0, dpeIndex(dpeActuel) - dpeIndex(dpeVise))} classe
                {Math.max(0, dpeIndex(dpeActuel) - dpeIndex(dpeVise)) > 1 ? "s" : ""})
                · Économies ~{fmt(economiesAnnuelles)}/an
              </p>
            </div>

            {FREEMIUM ? (
              <AuditPremiumBlock onCheckout={goCheckout} />
            ) : (
              <div className="space-y-6">
                <PlanFinancementCourtierTable
                  montantTravaux={montantTravaux}
                  resteACharge={resteACharge}
                  economiesAnnuelles={economiesAnnuelles}
                />
                <Projection30AnsTable
                  resteACharge={resteACharge}
                  economiesAnnuelles={economiesAnnuelles}
                />
                <ROIBatterieBlock roiBatterieAns={roiBatterieAns} />
              </div>
            )}

            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  🍒
                </span>
                <div>
                  <h3 className="text-xl font-bold">Cerise sur le gâteau</h3>
                  <p className="text-amber-200 text-sm">
                    Option Solaire Haute Performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: "☀️", title: "DualSun Bifacial", sub: "6 kWc · +30 % production" },
                  { icon: "⚡", title: "Enphase IQ8", sub: "Micro-onduleurs · anti-ombrage" },
                  { icon: "🔋", title: "Batterie LFP 7 kWh", sub: "Autoconsommation optimisée" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl bg-white/10 border border-white/10 p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>

              {FREEMIUM ? (
                <div className="rounded-xl bg-emerald-900/40 border border-emerald-500/40 p-4 text-emerald-100 text-sm leading-relaxed">
                  L'analyse complète de rentabilité de votre option solaire, avec
                  projections financières et ROI détaillé, est disponible dans votre{" "}
                  <strong className="text-white">Audit IA Premium</strong>.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-slate-300 mb-1">ROI sur 30 ans (solaire)</p>
                    <p className="text-2xl font-bold text-emerald-400">8,2 ans</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-slate-300 mb-1">Gain net solaire/mois</p>
                    <p className="text-2xl font-bold text-emerald-400">+196 €</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 md:col-span-2">
                    <p className="text-slate-300 mb-1">Mensualité option solaire</p>
                    <p className="text-xl font-bold">~89 €/mois (Éco-PTZ complémentaire)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pb-8">
              <button
                type="button"
                onClick={goCheckout}
                className="big-green-button max-w-lg mx-auto text-base md:text-lg"
              >
                Je veux mon Audit IA complet (40-60 pages) sous 48h — 199 €
              </button>
              <p className="text-teal-100/70 text-xs mt-4">
                Paiement sécurisé Stripe · Remboursé si travaux {'>'} 10 000 €
              </p>
            </div>
          </section>
        ) : null}

        {activeTab === "audit" && !result ? (
          <div className="rounded-2xl bg-white/10 p-8 text-center text-white">
            <p>Complétez d'abord le calculateur pour voir votre audit.</p>
            <button
              type="button"
              onClick={() => setActiveTab("calculateur")}
              className="mt-4 text-emerald-200 underline hover:text-white"
            >
              Retour au calculateur
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function App() {
  const [showSimulator, setShowSimulator] = useState(false);

  if (showSimulator) {
    return <AuditSimulatorView onBack={() => setShowSimulator(false)} />;
  }

  return <LandingView onStartAudit={() => setShowSimulator(true)} />;
}
