import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

type LabScene = "pac" | "solaire" | "bois" | "maison";
type FocusMode = "all" | "frigo" | "hydro" | "toiture" | "station" | "foyer" | "conduit" | "enveloppe" | "vmc";
type Shot = { pos: [number, number, number]; look: [number, number, number] };

type Viewer3DProps = {
  onExplored?: () => void;
};

type LoopSpec = { w: number; h: number; r: number; tube: number };

const FRIGO: LoopSpec = { w: 3.5, h: 2.45, r: 0.38, tube: 0.055 };
const HYDRO: LoopSpec = { w: 2.45, h: 2.7, r: 0.32, tube: 0.05 };
const HYDRO_X = 6.15;

const LEGEND = [
  {
    title: "Évaporateur",
    color: "#38bdf8",
    text: "Basse pression : le fluide absorbe la chaleur de l'air extérieur. Les molécules y restent froides, en bleu.",
  },
  {
    title: "Compresseur",
    color: "#e8c872",
    text: "Il élève pression et température. C'est le poste électrique de la PAC, en coupure spécialisée NF C 15-100.",
  },
  {
    title: "Condenseur",
    color: "#fb7185",
    text: "Le fluide chaud cède ses calories à l'eau de chauffage. Molécules rouges, haute pression.",
  },
  {
    title: "Détendeur",
    color: "#cbd5e1",
    text: "La chute de pression refroidit le fluide avant son retour vers l'évaporateur.",
  },
  {
    title: "Filtre à boues magnétique",
    color: "#f87171",
    text: "Sur le retour, en amont de la PAC (DTU 65.16). Il protège l'échangeur après désembouage.",
  },
  {
    title: "Soupape 3 bar",
    color: "#d97706",
    text: "Sécurité du circuit chauffage. Aucune vanne entre elle et le générateur. Le sanitaire du CET est à 7 bar.",
  },
  {
    title: "Vase d'expansion",
    color: "#fda4af",
    text: "Il absorbe la dilatation. Gonflage ≈ pression statique + 0,2 à 0,3 bar, raccordé sur le retour.",
  },
  {
    title: "CET 250 L",
    color: "#e2e8f0",
    text: "Cuve isolée du chauffe-eau thermodynamique (BAR-TH-148). Le sanitaire est protégé à 7 bar, pas par la soupape chauffage.",
  },
  {
    title: "Split air/air",
    color: "#94a3b8",
    text: "Unité intérieure : condensats en pente continue. Ce n'est pas la fiche BAR-TH-104, réservée à l'air/eau.",
  },
];

const SCENE_CAMERAS: Record<LabScene, Partial<Record<FocusMode, Shot>> & { all: Shot }> = {
  pac: {
    all: { pos: [0.7, 2.55, 15.4], look: [0.5, 0.25, 0] },
    frigo: { pos: [0.15, 0.85, 6.3], look: [0, 0.05, 0] },
    hydro: { pos: [HYDRO_X, 0.85, 7.6], look: [HYDRO_X, 0.15, 0] },
  },
  solaire: {
    all: { pos: [0.2, 2.4, 9.4], look: [0.1, 0.7, 0] },
    toiture: { pos: [-0.2, 2.8, 5.2], look: [0, 1.5, -0.4] },
    station: { pos: [2.4, 1.1, 4.2], look: [2.3, 0.2, 0] },
  },
  bois: {
    all: { pos: [0.4, 1.5, 6.2], look: [0, 0.7, 0] },
    foyer: { pos: [0.15, 0.7, 3.4], look: [0, 0.45, 0] },
    conduit: { pos: [0.8, 2.4, 3.6], look: [0.15, 1.8, 0] },
  },
  maison: {
    all: { pos: [3.2, 2.3, 8.2], look: [0.2, 0.8, 0] },
    enveloppe: { pos: [2.2, 1.4, 4.6], look: [0, 0.8, 0] },
    vmc: { pos: [0.2, 2.6, 4.2], look: [0, 1.7, 0] },
  },
};

const LAB_COPY: Record<
  LabScene,
  {
    kicker: string;
    intro: string;
    focuses: { id: FocusMode; label: string }[];
    chips: { label: string; color: string }[];
    legend: { title: string; color: string; text: string }[];
  }
> = {
  pac: {
    kicker: "VUE 1 · PAC & CET",
    intro: "Coupe du cycle frigorifique, cuve CET 250 L, groupe sanitaire 7 bar et hydraulique DTU 65.16.",
    focuses: [
      { id: "all", label: "Ensemble" },
      { id: "frigo", label: "Cycle frigo" },
      { id: "hydro", label: "Hydraulique" },
    ],
    chips: [
      { label: "Fluide froid", color: "#38bdf8" },
      { label: "Fluide chaud", color: "#fb7185" },
    ],
    legend: LEGEND,
  },
  solaire: {
    kicker: "VUE 2 · PV & CESI",
    intro: "Toiture mixte : modules photovoltaïques, capteurs thermiques, onduleur et station solaire au glycol.",
    focuses: [
      { id: "all", label: "Ensemble" },
      { id: "toiture", label: "Toiture" },
      { id: "station", label: "Station" },
    ],
    chips: [
      { label: "Courant DC / AC", color: "#e8c872" },
      { label: "Glycol caloporteur", color: "#84cc16" },
    ],
    legend: [
      { title: "Modules PV", color: "#1d4ed8", text: "Champ DC en toiture. Tension présente de jour même si l'AC est coupé (NF C 15-100, C 15-712-1)." },
      { title: "Capteurs CESI", color: "#b45309", text: "Solaire thermique BAR-TH-101. Le circuit est glycolé, pas rempli d'eau sanitaire." },
      { title: "Onduleur et coffrets", color: "#e8c872", text: "Coffret DC (sectionneur, parafoudre) séparé du coffret AC et de la coupure d'urgence." },
      { title: "Station solaire", color: "#84cc16", text: "Circulateur, vase d'expansion solaire et soupape du glycol. Le groupe 7 bar reste sur le ballon sanitaire." },
    ],
  },
  bois: {
    kicker: "VUE 3 · QUALIBOIS",
    intro: "Poêle à granulés en écorché : réservoir, vis sans fin, bougie, flamme et conduit double paroi DTU 24.1.",
    focuses: [
      { id: "all", label: "Ensemble" },
      { id: "foyer", label: "Foyer" },
      { id: "conduit", label: "Conduit" },
    ],
    chips: [
      { label: "Flamme foyer", color: "#f97316" },
      { label: "Air comburant", color: "#7dd3fc" },
    ],
    legend: [
      { title: "Réservoir et vis", color: "#e8c872", text: "La vis dose les granulés secs. Un bourrage ne se force pas." },
      { title: "Bougie et foyer", color: "#f97316", text: "La bougie enflamme le flux d'air. Grillée, elle empêche le démarrage même si la vis tourne." },
      { title: "Conduit double paroi", color: "#94a3b8", text: "DTU 24.1 : classe de température, résistance au feu de cheminée et écart au feu." },
      { title: "Air comburant", color: "#7dd3fc", text: "Arrivée dédiée, distincte des fumées et de la VMC." },
    ],
  },
  maison: {
    kicker: "VUE 4 · BAR-TH-164",
    intro: "Maison écorchée : sarking, couches de mur ITE, menuiserie et flux d'air de la VMC Hygro B.",
    focuses: [
      { id: "all", label: "Ensemble" },
      { id: "enveloppe", label: "Enveloppe" },
      { id: "vmc", label: "VMC" },
    ],
    chips: [
      { label: "Isolant", color: "#fbbf24" },
      { label: "Air extrait", color: "#22d3ee" },
    ],
    legend: [
      { title: "Sarking", color: "#fbbf24", text: "Isolant continu au-dessus des chevrons. Les combles perdus sur plancher sont l'autre famille de toiture." },
      { title: "ITE", color: "#f59e0b", text: "Couche extérieure qui traite les ponts de plancher si les retours sont faits. L'ITI se coordonne dedans." },
      { title: "Menuiserie", color: "#e8c872", text: "Repère du bouquet : Uw ≤ 1,3, dormant repris par l'isolant pour supprimer le pont de tableau." },
      { title: "VMC Hygro B", color: "#22d3ee", text: "Débits modulés après étanchéité. Le test d'étanchéité mesure les fuites, il ne ventile pas." },
    ],
  },
};

class LoopCurve extends THREE.Curve<THREE.Vector3> {
  width: number;
  height: number;
  radius: number;

  constructor(width: number, height: number, radius: number) {
    super();
    this.width = width;
    this.height = height;
    this.radius = radius;
  }

  override getPoint(t: number, optionalTarget = new THREE.Vector3()) {
    const { width, height, radius } = this;
    const straightW = Math.max(0.01, width - 2 * radius);
    const straightH = Math.max(0.01, height - 2 * radius);
    const arc = (Math.PI * radius) / 2;
    const perimeter = 2 * straightW + 2 * straightH + 4 * arc;
    let distance = (((t % 1) + 1) % 1) * perimeter;
    const x0 = -width / 2;
    const x1 = width / 2;
    const y0 = -height / 2;
    const y1 = height / 2;

    if (distance <= straightW) return optionalTarget.set(x0 + radius + distance, y0, 0);
    distance -= straightW;
    if (distance <= arc) {
      const angle = -Math.PI / 2 + distance / radius;
      return optionalTarget.set(x1 - radius + Math.cos(angle) * radius, y0 + radius + Math.sin(angle) * radius, 0);
    }
    distance -= arc;
    if (distance <= straightH) return optionalTarget.set(x1, y0 + radius + distance, 0);
    distance -= straightH;
    if (distance <= arc) {
      const angle = distance / radius;
      return optionalTarget.set(x1 - radius + Math.cos(angle) * radius, y1 - radius + Math.sin(angle) * radius, 0);
    }
    distance -= arc;
    if (distance <= straightW) return optionalTarget.set(x1 - radius - distance, y1, 0);
    distance -= straightW;
    if (distance <= arc) {
      const angle = Math.PI / 2 + distance / radius;
      return optionalTarget.set(x0 + radius + Math.cos(angle) * radius, y1 - radius + Math.sin(angle) * radius, 0);
    }
    distance -= arc;
    if (distance <= straightH) return optionalTarget.set(x0, y1 - radius - distance, 0);
    distance -= straightH;
    const angle = Math.PI + distance / radius;
    return optionalTarget.set(x0 + radius + Math.cos(angle) * radius, y0 + radius + Math.sin(angle) * radius, 0);
  }
}

function makeLabel(text: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 160;
  const context = canvas.getContext("2d");
  if (!context) return new THREE.Sprite();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "600 62px Segoe UI, sans-serif";
  context.fillStyle = "#f8e7b0";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = "rgba(0,0,0,0.85)";
  context.shadowBlur = 16;
  context.fillText(text, 512, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(2.15, 0.34, 1);
  sprite.renderOrder = 2;
  return sprite;
}

function addPipeLoop(parent: THREE.Object3D, spec: LoopSpec, material: THREE.Material) {
  const { w, h, r, tube } = spec;
  const straightW = w - 2 * r;
  const straightH = h - 2 * r;
  const y0 = -h / 2;
  const y1 = h / 2;
  const x0 = -w / 2;
  const x1 = w / 2;
  const horizontal = new THREE.CylinderGeometry(tube, tube, straightW, 18);
  const vertical = new THREE.CylinderGeometry(tube, tube, straightH, 18);
  const elbowGeo = new THREE.TorusGeometry(r, tube, 14, 20, Math.PI / 2);

  const bottom = new THREE.Mesh(horizontal, material);
  bottom.rotation.z = Math.PI / 2;
  bottom.position.y = y0;
  parent.add(bottom);

  const top = new THREE.Mesh(horizontal, material);
  top.rotation.z = Math.PI / 2;
  top.position.y = y1;
  parent.add(top);

  const right = new THREE.Mesh(vertical, material);
  right.position.x = x1;
  parent.add(right);

  const left = new THREE.Mesh(vertical, material);
  left.position.x = x0;
  parent.add(left);

  const corners: Array<[number, number, number]> = [
    [x1 - r, y0 + r, -Math.PI / 2],
    [x1 - r, y1 - r, 0],
    [x0 + r, y1 - r, Math.PI / 2],
    [x0 + r, y0 + r, Math.PI],
  ];
  for (const [x, y, rotation] of corners) {
    const elbow = new THREE.Mesh(elbowGeo, material);
    elbow.position.set(x, y, 0);
    elbow.rotation.z = rotation;
    parent.add(elbow);
  }
}

function addFlowArrows(parent: THREE.Object3D, curve: LoopCurve, marks: number[]) {
  const point = new THREE.Vector3();
  const tangent = new THREE.Vector3();
  for (const t of marks) {
    curve.getPoint(t, point);
    curve.getTangent(t, tangent);
    parent.add(new THREE.ArrowHelper(tangent.normalize(), point.clone(), 0.28, 0xe8c872, 0.1, 0.055));
  }
}

function temperatureColor(t: number, cold: THREE.Color, hot: THREE.Color, target: THREE.Color) {
  if (t < 0.25) return target.copy(cold);
  if (t < 0.48) return target.copy(cold).lerp(hot, (t - 0.25) / 0.23);
  if (t < 0.75) return target.copy(hot);
  return target.copy(hot).lerp(cold, (t - 0.75) / 0.25);
}

export default function Viewer3D({ onExplored }: Viewer3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const focusRef = useRef<FocusMode>("all");
  const spinRef = useRef(false);
  const exploredRef = useRef(onExplored);
  const [lab, setLab] = useState<LabScene>("pac");
  const [focus, setFocus] = useState<FocusMode>("all");
  const [spin, setSpin] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);
  const copy = LAB_COPY[lab];

  exploredRef.current = onExplored;

  useEffect(() => {
    focusRef.current = focus;
  }, [focus]);

  useEffect(() => {
    spinRef.current = spin;
  }, [spin]);

  function chooseLab(next: LabScene) {
    focusRef.current = "all";
    setFocus("all");
    setLab(next);
  }

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    exploredRef.current?.();

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true });
    } catch {
      setWebglError("WebGL est indisponible sur ce navigateur.");
      return;
    }
    if (!renderer.getContext()) {
      renderer.dispose();
      setWebglError("WebGL est indisponible sur ce navigateur.");
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b12);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    const cameras = SCENE_CAMERAS[lab];
    const initial = cameras.all;
    camera.position.set(...initial.pos);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.target.set(...initial.look);
    controls.minDistance = 2.4;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI / 1.7;

    scene.add(new THREE.AmbientLight(0x93c5fd, 0.45));
    const hemi = new THREE.HemisphereLight(0x38bdf8, 0x111827, 0.55);
    scene.add(hemi);
    const key = new THREE.DirectionalLight(0xfff4d6, 1.45);
    key.position.set(6, 9, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x38bdf8, 0.45);
    rim.position.set(-6, 2, -4);
    scene.add(rim);
    const coldLight = new THREE.PointLight(0x38bdf8, 6, 8);
    coldLight.position.set(0, -1.1, 1.2);
    scene.add(coldLight);
    const hotLight = new THREE.PointLight(0xfb7185, 6, 8);
    hotLight.position.set(0, 1.2, 1.2);
    scene.add(hotLight);

    const grid = new THREE.GridHelper(16, 24, 0x1e293b, 0x111827);
    grid.position.y = -2.15;
    scene.add(grid);

    const pipeMat = new THREE.MeshStandardMaterial({ color: 0xdbe4ee, metalness: 0.82, roughness: 0.22 });
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x7dd3fc,
      metalness: 0.65,
      roughness: 0.28,
      emissive: 0x0369a1,
      emissiveIntensity: 0.25,
    });

    let fan: THREE.Object3D | null = null;
    let wheel: THREE.Object3D | null = null;
    let frigoCurve: LoopCurve | null = null;
    let hydroCurve: LoopCurve | null = null;
    let frigoParticles: THREE.Mesh[] = [];
    let hydroParticles: THREE.Mesh[] = [];
    const tickers: Array<(elapsed: number) => void> = [];

    if (lab === "pac") {
      const frigo = new THREE.Group();
      scene.add(frigo);
      addCutaway(frigo);
      addPipeLoop(frigo, FRIGO, pipeMat);
      frigoCurve = new LoopCurve(FRIGO.w, FRIGO.h, FRIGO.r);
      addFlowArrows(frigo, frigoCurve, [0.12, 0.37, 0.62, 0.87]);
      addEvaporator(frigo, -FRIGO.h / 2);
      addCondenser(frigo, FRIGO.h / 2);
      fan = addCompressor(frigo, FRIGO.w / 2);
      addDetendeur(frigo, -FRIGO.w / 2);
      addCetAndSplit(scene);

      const hydro = new THREE.Group();
      hydro.position.x = HYDRO_X;
      scene.add(hydro);
      addPipeLoop(hydro, HYDRO, waterMat);
      hydroCurve = new LoopCurve(HYDRO.w, HYDRO.h, HYDRO.r);
      addFlowArrows(hydro, hydroCurve, [0.14, 0.4, 0.66, 0.9]);
      addMagneticFilter(hydro, -HYDRO.w / 2);
      addSafetyValve(hydro, HYDRO.w / 2);
      addExpansionVessel(hydro, HYDRO.h / 2 + 0.62);
      wheel = addCirculator(hydro, -HYDRO.h / 2);
      frigoParticles = createParticles(frigo, 26, true);
      hydroParticles = createParticles(hydro, 16, false);
    } else if (lab === "solaire") {
      tickers.push(buildSolaire(scene));
    } else if (lab === "bois") {
      tickers.push(buildBois(scene));
    } else {
      tickers.push(buildMaison(scene));
    }

    const cold = new THREE.Color(0x38bdf8);
    const hot = new THREE.Color(0xfb7185);
    const temp = new THREE.Color();
    const point = new THREE.Vector3();

    let pointerInside = false;
    const onEnter = () => {
      pointerInside = true;
    };
    const onLeave = () => {
      pointerInside = false;
    };
    host.addEventListener("pointerenter", onEnter);
    host.addEventListener("pointerleave", onLeave);

    const resize = () => {
      const width = host.clientWidth;
      const height = host.clientHeight;
      if (width === 0 || height === 0) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let applied: FocusMode | null = null;
    const lerp = {
      t: 1,
      from: new THREE.Vector3(),
      to: new THREE.Vector3(),
      lookFrom: new THREE.Vector3(),
      lookTo: new THREE.Vector3(),
    };

    let alive = true;
    let frameId = 0;
    let flow = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      if (!alive) return;
      frameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      flow = (flow + dt * 0.055) % 1;
      if (fan) fan.rotation.z += dt * 2.2;
      if (wheel) wheel.rotation.z -= dt * 1.6;
      tickers.forEach((tick) => tick(clock.elapsedTime));

      if (frigoCurve) {
        frigoParticles.forEach((particle, index) => {
          const t = (flow + index / frigoParticles.length) % 1;
          frigoCurve?.getPoint(t, point);
          particle.position.copy(point);
          particle.position.z += 0.02;
          const material = particle.material as THREE.MeshStandardMaterial;
          temperatureColor(t, cold, hot, temp);
          material.color.copy(temp);
          material.emissive.copy(temp);
          const scale = 0.85 + 0.18 * Math.sin(clock.elapsedTime * 4 + index);
          particle.scale.setScalar(scale);
        });
      }

      if (hydroCurve) {
        hydroParticles.forEach((particle, index) => {
          const t = (flow * 0.85 + index / hydroParticles.length) % 1;
          hydroCurve?.getPoint(t, point);
          particle.position.copy(point);
          particle.position.z += 0.02;
          const scale = 0.8 + 0.15 * Math.sin(clock.elapsedTime * 3 + index);
          particle.scale.setScalar(scale);
        });
      }

      const mode = focusRef.current;
      if (mode !== applied) {
        applied = mode;
        const destination = cameras[mode] ?? cameras.all;
        lerp.from.copy(camera.position);
        lerp.to.set(...destination.pos);
        lerp.lookFrom.copy(controls.target);
        lerp.lookTo.set(...destination.look);
        lerp.t = 0;
      }
      if (lerp.t < 1) {
        lerp.t = Math.min(1, lerp.t + 0.045);
        const eased = 1 - (1 - lerp.t) ** 3;
        camera.position.lerpVectors(lerp.from, lerp.to, eased);
        controls.target.lerpVectors(lerp.lookFrom, lerp.lookTo, eased);
      }

      controls.autoRotate = spinRef.current && !pointerInside && lerp.t >= 1;
      controls.autoRotateSpeed = 0.7;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      host.removeEventListener("pointerenter", onEnter);
      host.removeEventListener("pointerleave", onLeave);
      controls.dispose();
      disposeScene(scene);
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [lab]);

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#070b12]">
        <div className="pointer-events-none absolute left-4 top-4 z-10 max-w-xs">
          <p className="text-xs font-semibold tracking-[0.18em] text-[#e8c872]">{copy.kicker}</p>
          <p className="mt-1 text-sm text-slate-300">Glisser pour pivoter · molette pour zoomer</p>
        </div>
        <div className="absolute inset-x-4 top-16 z-10 flex flex-wrap gap-2 pr-2 sm:top-4 sm:right-4 sm:left-auto sm:max-w-[28rem] sm:justify-end">
          {(
            [
              ["pac", "PAC & CET"],
              ["solaire", "PV & CESI"],
              ["bois", "Qualibois"],
              ["maison", "Maison"],
            ] as const
          ).map(([id, label]) => (
            <FocusButton key={id} active={lab === id} onClick={() => chooseLab(id)}>
              {label}
            </FocusButton>
          ))}
        </div>
        <div className="absolute bottom-14 right-4 z-10 flex flex-wrap justify-end gap-2">
          {copy.focuses.map((item) => (
            <FocusButton key={item.id} active={focus === item.id} onClick={() => setFocus(item.id)}>
              {item.label}
            </FocusButton>
          ))}
          <FocusButton active={spin} onClick={() => setSpin((value) => !value)}>
            {spin ? "Stop rotation" : "Rotation auto"}
          </FocusButton>
        </div>
        {webglError ? (
          <p className="flex h-[620px] items-center justify-center px-6 text-center text-slate-300">{webglError}</p>
        ) : (
          <div ref={hostRef} className="h-[620px] w-full" style={{ touchAction: "none" }} />
        )}
        <div className="flex flex-wrap gap-4 border-t border-white/10 px-4 py-3 text-xs text-slate-400">
          {copy.chips.map((chip) => (
            <span key={chip.label} className="inline-flex items-center gap-2">
              <i className="h-2.5 w-2.5 rounded-full" style={{ background: chip.color }} /> {chip.label}
            </span>
          ))}
        </div>
      </div>
      <aside className="max-h-[680px] overflow-auto rounded-3xl border border-white/10 bg-white/[0.03] p-4">
        <h2 className="text-sm font-semibold tracking-[0.16em] text-[#e8c872]">LIRE LA COUPE</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">{copy.intro}</p>
        <ul className="mt-4 space-y-3">
          {copy.legend.map((item) => (
            <li key={item.title} className="border-t border-white/5 pt-3">
              <p className="text-sm font-medium text-white">
                <i className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: item.color }} />
                {item.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.text}</p>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  );
}

function FocusButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-medium ${
        active ? "bg-[#e8c872] text-[#1a1203]" : "bg-black/50 text-slate-100 ring-1 ring-white/15"
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}

function addCutaway(parent: THREE.Object3D) {
  const glass = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.08,
    roughness: 0.08,
    metalness: 0.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.28 });
  const depth = 1.6;
  const width = 4.85;
  const height = 3.7;
  const back = new THREE.Mesh(new THREE.PlaneGeometry(width, height), glass);
  back.position.z = -depth / 2;
  parent.add(back);

  const sideGeo = new THREE.PlaneGeometry(depth, height);
  const left = new THREE.Mesh(sideGeo, glass);
  left.position.x = -width / 2;
  left.rotation.y = Math.PI / 2;
  parent.add(left);
  const right = new THREE.Mesh(sideGeo, glass);
  right.position.x = width / 2;
  right.rotation.y = -Math.PI / 2;
  parent.add(right);

  const slab = new THREE.PlaneGeometry(width, depth);
  const top = new THREE.Mesh(slab, glass);
  top.position.y = height / 2;
  top.rotation.x = Math.PI / 2;
  parent.add(top);
  const bottom = new THREE.Mesh(slab, glass);
  bottom.position.y = -height / 2;
  bottom.rotation.x = -Math.PI / 2;
  parent.add(bottom);

  const trim = 0.03;
  const frontZ = depth / 2;
  const barH = new THREE.BoxGeometry(width, trim, trim);
  const barV = new THREE.BoxGeometry(trim, height, trim);
  const bars: Array<[THREE.BufferGeometry, number, number]> = [
    [barH, 0, height / 2],
    [barH, 0, -height / 2],
    [barV, -width / 2, 0],
    [barV, width / 2, 0],
  ];
  for (const [geometry, x, y] of bars) {
    const bar = new THREE.Mesh(geometry, gold);
    bar.position.set(x, y, frontZ);
    parent.add(bar);
  }
}

function addEvaporator(parent: THREE.Object3D, y: number) {
  const group = new THREE.Group();
  group.position.set(0, y, 0.08);
  const material = new THREE.MeshStandardMaterial({
    color: 0x7dd3fc,
    metalness: 0.55,
    roughness: 0.25,
    emissive: 0x0284c7,
    emissiveIntensity: 0.55,
  });
  for (let index = 0; index < 16; index += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.58, 0.58), material);
    fin.position.x = (index - 7.5) * 0.09;
    group.add(fin);
  }
  const label = makeLabel("Évaporateur");
  label.position.set(0, 0.58, 0.85);
  group.add(label);
  parent.add(group);
}

function addCondenser(parent: THREE.Object3D, y: number) {
  const group = new THREE.Group();
  group.position.set(0, y, 0.08);
  const material = new THREE.MeshStandardMaterial({
    color: 0xfb7185,
    metalness: 0.45,
    roughness: 0.3,
    emissive: 0x9f1239,
    emissiveIntensity: 0.45,
  });
  for (let index = 0; index < 16; index += 1) {
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.58, 0.58), material);
    fin.position.x = (index - 7.5) * 0.09;
    group.add(fin);
  }
  const label = makeLabel("Condenseur");
  label.position.set(0, 0.58, 0.85);
  group.add(label);
  parent.add(group);
}

function addCompressor(parent: THREE.Object3D, x: number) {
  const group = new THREE.Group();
  group.position.set(x, 0, 0.12);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.36, 0.74, 28),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.72, roughness: 0.28, emissive: 0x1e293b, emissiveIntensity: 0.35 }),
  );
  group.add(body);
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.22 }),
  );
  dome.position.y = 0.37;
  group.add(dome);
  const fan = new THREE.Mesh(
    new THREE.TorusGeometry(0.2, 0.028, 8, 18),
    new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.8, roughness: 0.25 }),
  );
  fan.rotation.x = Math.PI / 2;
  fan.position.set(0, 0.48, 0);
  group.add(fan);
  const label = makeLabel("Compresseur");
  label.position.set(0.15, 0.95, 0.75);
  group.add(label);
  parent.add(group);
  return fan;
}

function addDetendeur(parent: THREE.Object3D, x: number) {
  const group = new THREE.Group();
  group.position.set(x, 0, 0.1);
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.11, 0.46, 16),
    new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 }),
  );
  body.rotation.z = Math.PI / 2;
  group.add(body);
  const orifice = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.7, roughness: 0.3 }),
  );
  group.add(orifice);
  const wheel = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.04, 16),
    new THREE.MeshStandardMaterial({ color: 0xb91c1c, metalness: 0.4, roughness: 0.45 }),
  );
  wheel.position.z = 0.16;
  group.add(wheel);
  const label = makeLabel("Détendeur");
  label.position.set(0.95, 0.42, 0.85);
  group.add(label);
  parent.add(group);
}

function addMagneticFilter(parent: THREE.Object3D, x: number) {
  const group = new THREE.Group();
  group.position.set(x, 0, 0.28);
  group.add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.22, 0.22, 0.86, 24),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.35 }),
    ),
  );
  const magnet = new THREE.Mesh(
    new THREE.TorusGeometry(0.15, 0.045, 10, 22),
    new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0x991b1b,
      emissiveIntensity: 0.45,
      metalness: 0.45,
      roughness: 0.4,
    }),
  );
  magnet.rotation.x = Math.PI / 2;
  group.add(magnet);
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.15, 0.12, 16),
    new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.75, roughness: 0.25 }),
  );
  cap.position.y = 0.48;
  group.add(cap);
  const label = makeLabel("Filtre à boues");
  label.position.set(0, 0.82, 0.45);
  group.add(label);
  parent.add(group);
}

function addSafetyValve(parent: THREE.Object3D, x: number) {
  const group = new THREE.Group();
  group.position.set(x, 0.2, 0.26);
  group.add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.13, 0.36, 16),
      new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.75, roughness: 0.3 }),
    ),
  );
  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.08, 16),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.35, roughness: 0.45 }),
  );
  cap.position.y = 0.22;
  group.add(cap);
  const discharge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 0.42, 10),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7, roughness: 0.3 }),
  );
  discharge.rotation.z = Math.PI / 2;
  discharge.position.set(0.26, 0.05, 0);
  group.add(discharge);
  const label = makeLabel("Soupape 3 bar");
  label.position.set(0.2, 0.62, 0.4);
  group.add(label);
  parent.add(group);
}

function addExpansionVessel(parent: THREE.Object3D, y: number) {
  const group = new THREE.Group();
  group.position.set(0, y, 0.12);
  group.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.4, 28, 20),
      new THREE.MeshStandardMaterial({
        color: 0xfb7185,
        metalness: 0.45,
        roughness: 0.38,
        emissive: 0x9f1239,
        emissiveIntensity: 0.18,
      }),
    ),
  );
  const membrane = new THREE.Mesh(
    new THREE.TorusGeometry(0.38, 0.022, 8, 28),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.6, roughness: 0.3 }),
  );
  membrane.rotation.x = Math.PI / 2;
  group.add(membrane);
  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.055, 0.38, 12),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.75, roughness: 0.25 }),
  );
  neck.position.y = -0.5;
  group.add(neck);
  const label = makeLabel("Vase d'expansion");
  label.position.set(1.35, 0.05, 0.45);
  group.add(label);
  parent.add(group);
}

function addCirculator(parent: THREE.Object3D, y: number) {
  const group = new THREE.Group();
  group.position.set(0.45, y, 0.22);
  group.add(
    new THREE.Mesh(
      new THREE.TorusGeometry(0.18, 0.06, 10, 20),
      new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.55, roughness: 0.35 }),
    ),
  );
  const wheel = new THREE.Mesh(
    new THREE.TorusGeometry(0.1, 0.012, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.7, roughness: 0.3 }),
  );
  group.add(wheel);
  const label = makeLabel("Circulateur");
  label.position.set(0, -0.42, 0.35);
  group.add(label);
  parent.add(group);
  return wheel;
}

function createParticles(parent: THREE.Object3D, count: number, colored: boolean) {
  const geometry = new THREE.SphereGeometry(0.055, 12, 10);
  const particles: THREE.Mesh[] = [];
  for (let index = 0; index < count; index += 1) {
    const material = new THREE.MeshStandardMaterial({
      color: colored ? 0x38bdf8 : 0x67e8f9,
      emissive: colored ? 0x38bdf8 : 0x0891b2,
      emissiveIntensity: 0.85,
      roughness: 0.25,
      metalness: 0.15,
    });
    const mesh = new THREE.Mesh(geometry, material);
    parent.add(mesh);
    particles.push(mesh);
  }
  return particles;
}

function disposeScene(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  scene.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.geometry) geometries.add(mesh.geometry);
    const material = mesh.material;
    if (Array.isArray(material)) material.forEach((item) => materials.add(item));
    else if (material) materials.add(material);
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => {
    const textured = material as THREE.MeshStandardMaterial;
    if (textured.map) textured.map.dispose();
    material.dispose();
  });
}

function addCetAndSplit(scene: THREE.Scene) {
  const cet = new THREE.Group();
  cet.position.set(-4.6, -0.15, 0);
  cet.add(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.52, 0.52, 1.65, 28),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.4, roughness: 0.42 }),
    ),
  );
  const jacket = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.6, 1.45, 24, 1, true, 0, Math.PI),
    new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.85, side: THREE.DoubleSide }),
  );
  jacket.rotation.y = -0.4;
  cet.add(jacket);
  const compressor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.18, 0.28, 16),
    new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.7, roughness: 0.3 }),
  );
  compressor.position.y = 1.02;
  cet.add(compressor);
  const safety = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.08, 0.22, 12),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, metalness: 0.35, roughness: 0.4 }),
  );
  safety.rotation.z = Math.PI / 2;
  safety.position.set(0.72, -0.35, 0.1);
  cet.add(safety);
  const cetLabel = makeLabel("CET 250 L");
  cetLabel.position.set(0, 1.4, 0.2);
  cet.add(cetLabel);
  const barLabel = makeLabel("Groupe 7 bar");
  barLabel.position.set(1.2, -0.05, 0.2);
  cet.add(barLabel);
  scene.add(cet);

  const split = new THREE.Group();
  split.position.set(-4.6, 1.45, 0.15);
  split.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 0.28, 0.2),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.55, roughness: 0.35 }),
    ),
  );
  const splitLabel = makeLabel("Split air/air");
  splitLabel.position.y = 0.38;
  split.add(splitLabel);
  scene.add(split);
}

function buildSolaire(scene: THREE.Scene) {
  const roof = new THREE.Group();
  roof.rotation.x = -0.42;
  roof.position.set(-1.1, 1.55, -0.2);
  scene.add(roof);
  const pvMat = new THREE.MeshStandardMaterial({
    color: 0x1e3a8a,
    metalness: 0.45,
    roughness: 0.25,
    emissive: 0x1d4ed8,
    emissiveIntensity: 0.25,
  });
  for (let index = 0; index < 6; index += 1) {
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.04, 0.85), pvMat);
    panel.position.set((index % 3) * 0.58 - 0.58, 0.04, Math.floor(index / 3) * 0.92 - 0.4);
    roof.add(panel);
  }
  const collectorMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, metalness: 0.4, roughness: 0.45, emissive: 0x7c2d12, emissiveIntensity: 0.2 });
  for (let index = 0; index < 2; index += 1) {
    const collector = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 1.7), collectorMat);
    collector.position.set(1.35, 0.05, index * 0.15 - 0.1);
    roof.add(collector);
  }
  const pvLabel = makeLabel("Modules PV");
  pvLabel.position.set(-0.3, 0.45, 0);
  roof.add(pvLabel);
  const cesiLabel = makeLabel("Capteurs CESI");
  cesiLabel.position.set(1.35, 0.5, 0.2);
  roof.add(cesiLabel);

  const gear = new THREE.Group();
  gear.position.set(2.35, 0.15, 0);
  scene.add(gear);
  gear.add(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.72, 0.16), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.35 })));
  const dcBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.12), new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.5, roughness: 0.4 }));
  dcBox.position.set(-0.48, 0.05, 0);
  gear.add(dcBox);
  const acBox = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.42, 0.12), new THREE.MeshStandardMaterial({ color: 0x0ea5e9, metalness: 0.45, roughness: 0.4 }));
  acBox.position.set(0.48, 0.05, 0);
  gear.add(acBox);
  const ondLabel = makeLabel("Onduleur");
  ondLabel.position.set(0, 0.62, 0.1);
  gear.add(ondLabel);
  const dcLabel = makeLabel("Coffret DC");
  dcLabel.position.set(-0.7, 0.45, 0.1);
  gear.add(dcLabel);

  const station = new THREE.Group();
  station.position.set(2.15, -1.05, 0.35);
  scene.add(station);
  station.add(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.9, 20), new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.35, roughness: 0.45 })));
  const glycolVessel = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 18, 14),
    new THREE.MeshStandardMaterial({ color: 0x84cc16, emissive: 0x3f6212, emissiveIntensity: 0.25, metalness: 0.3, roughness: 0.45 }),
  );
  glycolVessel.position.set(-0.55, 0.35, 0);
  station.add(glycolVessel);
  station.add(new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16), new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.5, roughness: 0.35 })));
  const stationLabel = makeLabel("Station solaire");
  stationLabel.position.set(0, 0.75, 0.2);
  station.add(stationLabel);
  const tankLabel = makeLabel("Ballon bi-énergie");
  tankLabel.position.set(0.15, -0.7, 0.2);
  station.add(tankLabel);

  const loop = new THREE.Group();
  loop.position.set(0.4, 0.15, 0.55);
  const spec = { w: 2.4, h: 1.5, r: 0.22, tube: 0.035 };
  addPipeLoop(loop, spec, new THREE.MeshStandardMaterial({ color: 0x84cc16, metalness: 0.45, roughness: 0.35, emissive: 0x3f6212, emissiveIntensity: 0.2 }));
  scene.add(loop);
  const curve = new LoopCurve(spec.w, spec.h, spec.r);
  const particles = createParticles(loop, 14, false);
  particles.forEach((particle) => {
    const material = particle.material as THREE.MeshStandardMaterial;
    material.color.set(0xa3e635);
    material.emissive.set(0x65a30d);
  });
  const point = new THREE.Vector3();
  return (elapsed: number) => {
    particles.forEach((particle, index) => {
      curve.getPoint((elapsed * 0.06 + index / particles.length) % 1, point);
      particle.position.copy(point);
    });
  };
}

function buildBois(scene: THREE.Scene) {
  const stove = new THREE.Group();
  scene.add(stove);
  stove.add(
    new THREE.Mesh(
      new THREE.BoxGeometry(1.15, 1.25, 0.72),
      new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        metalness: 0.35,
        roughness: 0.45,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      }),
    ),
  );
  const hopper = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.4), new THREE.MeshStandardMaterial({ color: 0x44403c, metalness: 0.35, roughness: 0.55 }));
  hopper.position.set(-0.22, 0.55, 0);
  stove.add(hopper);
  const hopperLabel = makeLabel("Réservoir");
  hopperLabel.position.set(-0.22, 1.05, 0.2);
  stove.add(hopperLabel);

  const auger = new THREE.Group();
  auger.rotation.z = Math.PI / 2;
  auger.position.set(0.05, 0.12, 0.12);
  const gold = new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.7, roughness: 0.3 });
  for (let index = 0; index < 7; index += 1) {
    const flight = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.012, 6, 12), gold);
    flight.position.y = index * 0.045 - 0.12;
    flight.rotation.y = index * 0.7;
    auger.add(flight);
  }
  stove.add(auger);
  const augerLabel = makeLabel("Vis sans fin");
  augerLabel.position.set(0.15, -0.35, 0.35);
  stove.add(augerLabel);

  const flameMat = new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.1, roughness: 0.4 });
  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.34, 10), flameMat);
  flame.position.set(0.32, 0.08, 0.16);
  stove.add(flame);
  const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xfecaca, emissive: 0xf87171, emissiveIntensity: 0.4 }));
  candle.position.set(0.32, -0.02, 0.28);
  stove.add(candle);
  const candleLabel = makeLabel("Bougie");
  candleLabel.position.set(0.85, 0.05, 0.2);
  stove.add(candleLabel);

  const flueMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.7, roughness: 0.3 });
  const flue = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 1.7, 16), flueMat);
  flue.position.set(0.12, 1.55, 0);
  stove.add(flue);
  const liner = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.7, 12), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.7 }));
  liner.position.copy(flue.position);
  stove.add(liner);
  const flueLabel = makeLabel("Double paroi");
  flueLabel.position.set(0.85, 1.9, 0.1);
  stove.add(flueLabel);

  const air = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 0.85, 10),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x0284c7, emissiveIntensity: 0.25, metalness: 0.4, roughness: 0.35 }),
  );
  air.rotation.z = Math.PI / 2;
  air.position.set(-0.85, -0.25, 0);
  stove.add(air);
  const airLabel = makeLabel("Air comburant");
  airLabel.position.set(-0.7, -0.6, 0.15);
  stove.add(airLabel);

  return (elapsed: number) => {
    auger.rotation.y = elapsed * 2;
    flame.scale.y = 0.72 + 0.38 * Math.abs(Math.sin(elapsed * 9));
    flameMat.emissiveIntensity = 0.7 + 0.6 * Math.abs(Math.sin(elapsed * 11));
  };
}

function buildMaison(scene: THREE.Scene) {
  const house = new THREE.Group();
  scene.add(house);
  house.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 2.2), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })));
  const wall = new THREE.Group();
  wall.position.set(0, 0.85, -0.4);
  house.add(wall);
  wall.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 0.12), new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.85 })));
  const insulation = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 0.28), new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.9 }));
  insulation.position.z = 0.2;
  wall.add(insulation);
  const plaster = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.5, 0.06), new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 }));
  plaster.position.z = 0.38;
  wall.add(plaster);
  const iteLabel = makeLabel("ITE + mur");
  iteLabel.position.set(0, 0.95, 0.55);
  wall.add(iteLabel);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 0.08), new THREE.MeshStandardMaterial({ color: 0xe8c872, metalness: 0.6, roughness: 0.3 }));
  frame.position.set(0.7, 0.15, 0.46);
  wall.add(frame);
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.68, 0.03),
    new THREE.MeshStandardMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.45, roughness: 0.05 }),
  );
  glass.position.set(0.7, 0.15, 0.5);
  wall.add(glass);
  const windowLabel = makeLabel("Uw ≤ 1,3");
  windowLabel.position.set(0.7, -0.5, 0.5);
  wall.add(windowLabel);

  const roof = new THREE.Group();
  roof.position.set(0, 1.85, -0.2);
  roof.rotation.x = -0.35;
  house.add(roof);
  roof.add(new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.08, 2.3), new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 0.8 })));
  const sarking = new THREE.Mesh(new THREE.BoxGeometry(3.1, 0.22, 2.3), new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.9 }));
  sarking.position.y = 0.16;
  roof.add(sarking);
  const tiles = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 2.4), new THREE.MeshStandardMaterial({ color: 0x7f1d1d, roughness: 0.75 }));
  tiles.position.y = 0.3;
  roof.add(tiles);
  const roofLabel = makeLabel("Sarking");
  roofLabel.position.set(-0.8, 0.55, 0.2);
  roof.add(roofLabel);

  const vmc = new THREE.Group();
  vmc.position.set(-0.9, 1.55, 0.15);
  house.add(vmc);
  vmc.add(new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.28, 0.28), new THREE.MeshStandardMaterial({ color: 0x0e7490, metalness: 0.4, roughness: 0.4 })));
  const vmcLabel = makeLabel("VMC Hygro B");
  vmcLabel.position.set(0, 0.4, 0.1);
  vmc.add(vmcLabel);
  const ductMat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, emissive: 0x0891b2, emissiveIntensity: 0.2, metalness: 0.4, roughness: 0.35 });
  const duct = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.1, 8), ductMat);
  duct.position.set(0.15, -0.45, 0.1);
  vmc.add(duct);

  const particles = createParticles(vmc, 8, false);
  const point = new THREE.Vector3();
  return (elapsed: number) => {
    particles.forEach((particle, index) => {
      const t = (elapsed * 0.25 + index / particles.length) % 1;
      point.set(0.15, 0.1 - t * 1.1, 0.1);
      particle.position.copy(point);
    });
  };
}
