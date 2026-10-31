import { useEffect, useRef, useState } from "react";
import { downloadPremiumPdf } from "../pdf/premiumDocument";

type MachineId = "daikin-altherma-3" | "atlantic-alfea" | "cet-250";
type StepId = 0 | 1 | 2 | 3;
type Phase = "idle" | "live" | "analyzing" | "ready" | "unknown";

type MachineCode = {
  code: string;
  title: string;
  step: StepId;
  lamp: "orange" | "red";
  symptom: string;
  action: string;
};

type Machine = {
  id: MachineId;
  demo: string;
  brand: string;
  series: string;
  fluid: string;
  charge: string;
  power: string;
  voltage: string;
  sanitaire: string;
  chauffage: string;
  serial: string;
  codes: MachineCode[];
  dtu: string[];
  fgaz: string[];
};

const PAC_STEPS: { id: StepId; title: string; text: string }[] = [
  { id: 0, title: "Test alimentation", text: "Tension au bornier, différentiel, terre, et dialogue entre l'unité et la régulation." },
  { id: 1, title: "Test circulateur", text: "Alimentation, sens et démarrage du circulateur. Sans débit, le compresseur ne reste pas en marche." },
  { id: 2, title: "Contrôle filtre à tamis", text: "Filtre sur le retour, isoler, nettoyer, rouvrir. Un tamis colmaté donne le même symptôme qu'un circulateur mort." },
  { id: 3, title: "Mesure des pressions", text: "Chauffage : soupape 3 bar, vase et manomètre. Sanitaire : groupe 7 bar, jamais la soupape chauffage sur l'eau chaude." },
];

const CET_STEPS: { id: StepId; title: string; text: string }[] = [
  { id: 0, title: "Test alimentation", text: "230 V, terre, et thermostat. Un CET 250 L ne se dépannne pas comme une PAC air/eau de chauffage." },
  { id: 1, title: "Test ventilateur", text: "Reprise d'air et soufflage. Un ventilateur bloqué fait cycler le compresseur sans chauffer la cuve." },
  { id: 2, title: "Filtre et évaporateur", text: "Filtre à air encrassé ou évaporateur givré. Nettoyer avant de toucher au fluide." },
  { id: 3, title: "Groupe 7 bar", text: "Groupe de sécurité sanitaire à 7 bar, écoulement libre. Il n'y a pas de soupape chauffage 3 bar sur l'eau sanitaire." },
];

const MACHINES: Machine[] = [
  {
    id: "daikin-altherma-3",
    demo: "Plaque Démo Daikin Altherma 3 (R32 - 8 kW)",
    brand: "Daikin",
    series: "Altherma 3 — 8 kW",
    fluid: "R32 (A2L)",
    charge: "1,50 kg",
    power: "8 kW calorifiques",
    voltage: "230 V monophasé",
    sanitaire: "7 bar si ballon ECS raccordé",
    chauffage: "3 bar — soupape DTU 65.16",
    serial: "DEMO-DAI-AL3-8-R32",
    codes: [
      {
        code: "7H",
        title: "Débit d'eau insuffisant",
        step: 1,
        lamp: "red",
        symptom: "Le débit chute, le compresseur s'arrête. La PAC protège l'échangeur.",
        action: "Contrôler le circulateur, puis le filtre à tamis sur le retour. Purger, ouvrir les vannes, et vérifier que la loi d'eau n'est pas en cause tant que le débit n'est pas revenu.",
      },
      {
        code: "U4",
        title: "Défaut de communication",
        step: 0,
        lamp: "orange",
        symptom: "L'unité intérieure ne dialogue plus avec l'extérieure.",
        action: "Vérifier l'alimentation des deux unités, la polarité du bus et le connecteur. Ne pas remplacer une carte avant d'avoir mesuré le câble.",
      },
      {
        code: "A5",
        title: "Protection antigel",
        step: 3,
        lamp: "red",
        symptom: "Température d'eau trop basse ou circulateur arrêté par grand froid.",
        action: "Rétablir le débit et la pression chauffage (soupape 3 bar, vase). L'antigel électrique ne compense pas un circuit vide. Ne pas ouvrir le circuit frigorifique pour ce code.",
      },
    ],
    dtu: [
      "Filtre à boues magnétique sur le retour, en amont de l'échangeur.",
      "Soupape chauffage tarée à 3 bar, vase gonflé à la pression statique + 0,2 à 0,3 bar, vase isolé du réseau.",
      "Désembouage du réseau existant avant le remplacement du générateur.",
    ],
    fgaz: [
      "R32 : fluide A2L, légèrement inflammable. Pas de flamme ni de point chaud dans le local pendant une intervention sur le circuit.",
      "Ne pas rejeter le fluide à l'atmosphère. Toute manipulation du circuit exige une attestation de capacité.",
      "Ne pas recharger à l'aveugle. La charge de cette fiche est celle de la plaque démo, pas une pesée du chantier.",
    ],
  },
  {
    id: "atlantic-alfea",
    demo: "Plaque Démo Atlantic Alféa Excellia (R410A - 11 kW)",
    brand: "Atlantic",
    series: "Alféa Excellia — 11 kW",
    fluid: "R410A",
    charge: "2,10 kg",
    power: "11 kW calorifiques",
    voltage: "400 V triphasé",
    sanitaire: "7 bar sur le ballon sanitaire",
    chauffage: "3 bar — soupape DTU 65.16",
    serial: "DEMO-ATL-EXC-11-R410A",
    codes: [
      {
        code: "227",
        title: "Débit d'eau insuffisant",
        step: 1,
        lamp: "red",
        symptom: "Débit chauffage sous le seuil. La PAC refuse de rester en production.",
        action: "Même conduite que le 7H Daikin : circulateur, filtre à tamis, vannes, purge. Le code est un repère de formation : la notice du numéro de série tranche.",
      },
      {
        code: "369",
        title: "Haute pression",
        step: 3,
        lamp: "red",
        symptom: "Le condenseur ne cède plus ses calories à l'eau.",
        action: "Chercher d'abord l'eau : débit, filtre, vanne fermée. Ne pas desserrer un raccord frigorifique sous pression. R410A se manipule avec attestation, sans rejet.",
      },
      {
        code: "370",
        title: "Sonde de température",
        step: 0,
        lamp: "orange",
        symptom: "Valeur de sonde ouverte ou hors courbe.",
        action: "Mesurer la sonde déconnectée et comparer à la courbe de la notice. Un défaut de mesure ne se corrige pas en ajoutant du fluide.",
      },
    ],
    dtu: [
      "Réseau triphasé : ordre des phases et protection adaptés à 11 kW.",
      "Soupape 3 bar, disconnecteur, pot à boues sur le retour.",
      "Le groupe 7 bar reste sur le sanitaire. Il ne protège pas le chauffage.",
    ],
    fgaz: [
      "R410A : hautes pressions de service. Aucun raccord ne s'ouvre à chaud.",
      "Fuite : consigner, chercher sous azote, tirer au vide, peser. Pas d'appoint au jugé.",
      "Charge affichée : 2,10 kg sur la plaque démo. La plaque rivetée sur l'appareil réel fait foi.",
    ],
  },
  {
    id: "cet-250",
    demo: "Plaque Démo Ballon Thermodynamique CET (250 L)",
    brand: "CET",
    series: "Ballon thermodynamique 250 L",
    fluid: "R290",
    charge: "0,150 kg",
    power: "Puissance reprise sur air, cuve 250 L",
    voltage: "230 V monophasé",
    sanitaire: "7 bar — groupe de sécurité",
    chauffage: "Sans objet — pas de circuit chauffage",
    serial: "DEMO-CET-250-R290",
    codes: [
      {
        code: "AIR",
        title: "Débit d'air insuffisant",
        step: 1,
        lamp: "orange",
        symptom: "Le ventilateur tourne mal, l'évaporateur givre, l'eau ne monte plus.",
        action: "Dégager la reprise, nettoyer le filtre, contrôler le ventilateur. Ne pas ouvrir le circuit R290 dans un local fermé.",
      },
      {
        code: "SECU",
        title: "Groupe de sécurité",
        step: 3,
        lamp: "red",
        symptom: "Écoulement permanent ou groupe bloqué. Risque de surpression sanitaire.",
        action: "Manœuvrer le groupe 7 bar, vérifier l'écoulement libre et la pression du réseau. Un goutte-à-goutte à la chauffe peut être normal. Un jet continu ne l'est pas.",
      },
      {
        code: "SONDE",
        title: "Sonde de cuve",
        step: 0,
        lamp: "orange",
        symptom: "La régulation fige une température absurde ou refuse de partir.",
        action: "Mesurer la sonde hors connecteur. La résistance doit suivre la température de l'eau, pas une valeur ouverte.",
      },
    ],
    dtu: [
      "Groupe de sécurité sanitaire taré à 7 bar, siphon et évacuation libre.",
      "Ce ballon n'utilise pas la soupape chauffage 3 bar du DTU 65.16.",
      "En chaufferie mixte, ne pas raccorder la vidange du groupe sur une soupape de chauffage.",
    ],
    fgaz: [
      "R290 : hydrocarbure inflammable, charge faible. Pas de flamme, local ventilé, pas de rejet.",
      "Ce n'est ni du R32 ni du R410A. Confondre le fluide mène à un mauvais outillage et à un danger.",
      "Charge démo : 0,150 kg. Lire la plaque de l'appareil avant toute intervention sur le circuit.",
    ],
  },
];

const QR_PREFIX = "energia:";

function machineById(id: string | null): Machine | null {
  return MACHINES.find((item) => item.id === id) ?? null;
}

function matchText(value: string): Machine | null {
  const text = value.toLowerCase();
  if (text.includes(`${QR_PREFIX}daikin`) || text.includes("daikin") || text.includes("altherma")) return MACHINES[0];
  if (text.includes(`${QR_PREFIX}atlantic`) || text.includes("alfea") || text.includes("excellia") || text.includes("atlantic")) return MACHINES[1];
  if (text.includes(`${QR_PREFIX}cet`) || text.includes("thermodynamique") || text.includes("ballon")) return MACHINES[2];
  return null;
}

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };

function createDetector(): Detector | null {
  const host = window as Window & {
    BarcodeDetector?: new (options?: { formats?: string[] }) => Detector;
  };
  if (!host.BarcodeDetector) return null;
  try {
    return new host.BarcodeDetector({ formats: ["qr_code"] });
  } catch {
    return null;
  }
}

function downloadSheet(machine: Machine, code: MachineCode | null) {
  downloadPremiumPdf({
    fileName: `fiche-sav-${machine.serial}.pdf`,
    title: "Fiche d'intervention SAV",
    indicators: [
      { label: "Public visé", value: "Technicien en formation" },
      { label: "Durée officielle", value: "Fiche d'intervention" },
      { label: "Tarif HT & TTC", value: "Document de formation" },
      { label: "Modalité", value: `${machine.brand} · ${machine.fluid}` },
    ],
    lead: `${machine.demo}. La notice du numéro de série fait foi. Les charges de cette fiche sont celles du référentiel de démonstration.`,
    modules: [
      {
        title: "Identité machine",
        points: [
          `Marque : ${machine.brand}. Série : ${machine.series}.`,
          `N° démo : ${machine.serial}.`,
          `Fluide : ${machine.fluid}. Charge plaque démo : ${machine.charge}.`,
          `Puissance : ${machine.power}. Pression sanitaire : ${machine.sanitaire}. Pression chauffage : ${machine.chauffage}.`,
        ],
      },
      {
        title: "Code retenu",
        points: [
          code ? `${code.code} — ${code.title}. ${code.action}` : "Aucun code. Contrôle périodique : filtres, pressions, écoulement du groupe, paramètres de loi d'eau.",
        ],
      },
      { title: "DTU 65.16", points: machine.dtu },
      { title: "Consignes F-Gaz", points: machine.fgaz },
    ],
    notes: ["Technicien : ____________________", "Date : ______________", "Visa client : ____________________"],
    footnote: "Ne pas rejeter de fluide frigorigène. Ne pas démarrer une manipulation de circuit sans attestation d'aptitude et sans attestation de capacité de l'entreprise.",
  });
}

type MachineScannerProps = {
  onActiveChange: (active: boolean) => void;
};

export default function MachineScanner({ onActiveChange }: MachineScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanTimer = useRef<number>(0);
  const photoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const waitRef = useRef(0);
  const [phase, setPhase] = useState<Phase>("idle");
  const [torch, setTorch] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [machine, setMachine] = useState<Machine | null>(null);
  const [codeId, setCodeId] = useState<string | null>(null);
  const [reached, setReached] = useState<StepId>(0);

  const code = machine?.codes.find((item) => item.code === codeId) ?? null;
  const steps = machine?.id === "cet-250" ? CET_STEPS : PAC_STEPS;

  useEffect(() => {
    onActiveChange(Boolean(machine));
  }, [machine, onActiveChange]);

  useEffect(() => {
    return () => {
      window.clearInterval(scanTimer.current);
      window.clearTimeout(waitRef.current);
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  function stopCamera() {
    window.clearInterval(scanTimer.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setTorch(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  function identify(found: Machine | null, image: string | null) {
    setPreview(image);
    setPhase("analyzing");
    window.clearTimeout(waitRef.current);
    waitRef.current = window.setTimeout(() => {
      if (!found) {
        setMachine(null);
        setCodeId(null);
        setPhase("unknown");
        return;
      }
      setMachine(found);
      setCodeId(null);
      setReached(0);
      setPhase("ready");
    }, 1400);
  }

  async function startCamera() {
    setCameraError("");
    stopCamera();
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Ce navigateur ne donne pas accès à la caméra. Utilisez une plaque démo ou la galerie.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "environment" } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase("live");
      const detector = createDetector();
      if (!detector || !videoRef.current) return;
      scanTimer.current = window.setInterval(() => {
        const video = videoRef.current;
        if (!video || video.readyState < 2) return;
        detector.detect(video).then((codes) => {
          const hit = codes.map((item) => matchText(item.rawValue)).find(Boolean);
          if (!hit) return;
          stopCamera();
          identify(hit, null);
        }).catch(() => undefined);
      }, 700);
    } catch {
      setCameraError("Caméra refusée ou absente. Les plaques démo restent disponibles hors ligne.");
      setPhase("idle");
    }
  }

  async function toggleTorch() {
    const track = streamRef.current?.getVideoTracks()[0];
    if (!track) return;
    const next = !torch;
    try {
      await track.applyConstraints({ advanced: [{ torch: next }] } as MediaTrackConstraints);
      setTorch(next);
    } catch {
      setCameraError("Le flash de cette caméra ne se commande pas depuis le navigateur.");
    }
  }

  function captureFrame() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(video, 0, 0);
    const image = canvas.toDataURL("image/jpeg", 0.8);
    stopCamera();
    const detector = createDetector();
    if (!detector) {
      identify(null, image);
      return;
    }
    detector.detect(canvas).then((codes) => {
      const hit = codes.map((item) => matchText(item.rawValue)).find(Boolean) ?? null;
      identify(hit, image);
    }).catch(() => identify(null, image));
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const fromName = matchText(file.name);
    const image = new Image();
    image.onload = () => {
      const detector = createDetector();
      if (!detector) {
        identify(fromName, url);
        return;
      }
      detector.detect(image).then((codes) => {
        const hit = codes.map((item) => matchText(item.rawValue)).find(Boolean) ?? fromName;
        identify(hit, url);
      }).catch(() => identify(fromName, url));
    };
    image.onerror = () => identify(fromName, url);
    image.src = url;
  }

  function leave() {
    stopCamera();
    setMachine(null);
    setCodeId(null);
    setPreview(null);
    setPhase("idle");
  }

  function openCode(next: MachineCode) {
    setCodeId(next.code);
    setReached(next.step);
  }

  return (
    <section className="space-y-4 rounded-3xl border border-[#e8c872]/30 bg-[#0b1018] p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-[#e8c872]">LECTURE DE PLAQUE</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Scanner la machine</h3>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${phase === "ready" ? "bg-emerald-500/20 text-emerald-200" : phase === "analyzing" ? "bg-amber-500/20 text-amber-100" : phase === "unknown" ? "bg-red-500/20 text-red-100" : "bg-white/10 text-slate-300"}`}>
          <span className={`h-2.5 w-2.5 rounded-full ${phase === "ready" ? "bg-emerald-400" : phase === "analyzing" ? "bg-amber-400" : phase === "unknown" ? "bg-red-400" : "bg-slate-500"}`} />
          {phase === "ready" ? "Machine identifiée" : phase === "analyzing" ? "Analyse" : phase === "unknown" ? "Hors référentiel" : phase === "live" ? "Visée active" : "En attente"}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={startCamera} className="min-h-16 rounded-2xl bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-3 text-left text-base font-semibold text-[#1a1203]">
          Scanner la plaque en direct
          <span className="mt-1 block text-xs font-medium text-[#3b2a08]">Caméra arrière, cadre de visée QR ou plaque alu</span>
        </button>
        <button type="button" onClick={() => photoRef.current?.click()} className="min-h-16 rounded-2xl border border-[#e8c872]/50 bg-white/5 px-4 py-3 text-left text-base font-semibold text-white">
          Prendre une photo / Galerie
          <span className="mt-1 block text-xs font-medium text-slate-400">Appareil photo, ou une image déjà dans le téléphone</span>
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => galleryRef.current?.click()} className="rounded-full border border-white/15 px-3 py-2 text-sm text-slate-200">
          Ouvrir la galerie
        </button>
        {MACHINES.map((item) => (
          <button key={item.id} type="button" onClick={() => { stopCamera(); identify(item, null); }} className="rounded-full border border-white/15 px-3 py-2 text-left text-sm text-slate-100">
            {item.demo}
          </button>
        ))}
      </div>
      <input ref={photoRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
      <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />

      {cameraError ? <p className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-100">{cameraError}</p> : null}

      {phase === "live" ? (
        <div className="relative overflow-hidden rounded-2xl border border-[#e8c872]/40 bg-black">
          <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted />
          <div className="pointer-events-none absolute inset-8 rounded-xl border-2 border-[#e8c872]/80" />
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2 bg-black/70 p-3">
            <button type="button" onClick={captureFrame} className="rounded-full bg-[#e8c872] px-4 py-2 text-sm font-semibold text-[#1a1203]">
              Capturer le cadre
            </button>
            <button type="button" onClick={toggleTorch} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
              {torch ? "Couper le flash" : "Flash"}
            </button>
            <button type="button" onClick={() => { stopCamera(); setPhase("idle"); }} className="rounded-full border border-white/20 px-4 py-2 text-sm text-white">
              Fermer
            </button>
          </div>
        </div>
      ) : null}

      {phase === "analyzing" ? (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-100">Lecture de la plaque…</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 animate-pulse rounded-full bg-[#e8c872]" />
          </div>
        </div>
      ) : null}

      {phase === "unknown" ? (
        <div className="rounded-2xl border border-red-400/40 bg-red-500/10 p-4 text-sm leading-relaxed text-red-100">
          Aucune plaque du référentiel n&apos;a été lue sur cette image. La charge en kg n&apos;est pas estimée : une mauvaise masse de fluide est un danger. Choisissez une plaque démo, ou un QR <span className="font-semibold">energia:daikin</span>, <span className="font-semibold">energia:atlantic</span>, <span className="font-semibold">energia:cet</span>.
          {preview ? <img src={preview} alt="Cadre capturé" className="mt-3 max-h-40 rounded-xl object-cover" /> : null}
        </div>
      ) : null}

      {machine && phase === "ready" ? (
        <div className="space-y-4">
          <article className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.16em] text-emerald-200">FICHE D&apos;IDENTITÉ TECHNIQUE</p>
                <h4 className="mt-1 text-2xl font-semibold text-white">{machine.brand}</h4>
                <p className="text-sm text-slate-200">{machine.series}</p>
              </div>
              <button type="button" onClick={leave} className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-slate-200">
                Quitter le mode machine
              </button>
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["Fluide", machine.fluid],
                  ["Charge plaque démo", machine.charge],
                  ["Puissance", machine.power],
                  ["Tension", machine.voltage],
                  ["Sanitaire", machine.sanitaire],
                  ["Chauffage", machine.chauffage],
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-black/30 px-3 py-2">
                  <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
                  <dd className="text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-xs leading-relaxed text-slate-400">
              N° {machine.serial}. Valeurs du référentiel de démonstration. Sur chantier, la plaque rivetée et la notice priment sur cet écran.
            </p>
            {preview ? <img src={preview} alt="Plaque capturée" className="mt-3 max-h-36 rounded-xl object-cover" /> : null}
          </article>

          <div>
            <p className="text-sm font-semibold text-white">Codes de ce modèle</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {machine.codes.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => openCode(item)}
                  className={`rounded-full px-3 py-2 text-sm font-semibold ${codeId === item.code ? "bg-red-500 text-white" : "bg-white/10 text-slate-100"}`}
                >
                  {item.code} — {item.title}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <ol className="space-y-2">
              {steps.map((step) => {
                const blocked = code ? step.id > code.step : false;
                const alert = code?.step === step.id;
                const done = !alert && step.id <= reached && !blocked;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => setReached(step.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left disabled:opacity-40 ${alert ? "border-red-400 bg-red-500/20" : done ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-black/30"}`}
                    >
                      <span className={`mt-0.5 h-3 w-3 shrink-0 rounded-full ${alert ? "bg-red-400" : done ? "bg-emerald-400" : "bg-slate-600"}`} />
                      <span>
                        <span className="block text-sm font-semibold text-white">Étape {step.id} — {step.title}</span>
                        <span className="mt-1 block text-sm text-slate-300">{step.text}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <aside className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs tracking-[0.14em] text-[#e8c872]">MODE DÉPANNAGE DIRECT</p>
              {code ? (
                <>
                  <h4 className="mt-2 text-lg font-semibold text-white">{code.code} — {code.title}</h4>
                  <p className="mt-2 text-sm text-slate-300">{code.symptom}</p>
                  <p className="mt-2 text-sm text-white">{code.action}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-300">Parcours nominal. Choisissez un code pour figer le GRAFCET sur l&apos;étape qui échoue.</p>
              )}
              <h5 className="mt-4 text-sm font-semibold text-[#e8c872]">DTU 65.16</h5>
              <ul className="mt-1 space-y-1 text-sm text-slate-300">
                {machine.dtu.map((line) => <li key={line}>{line}</li>)}
              </ul>
              <h5 className="mt-4 text-sm font-semibold text-amber-200">F-Gaz</h5>
              <ul className="mt-1 space-y-1 text-sm text-slate-300">
                {machine.fgaz.map((line) => <li key={line}>{line}</li>)}
              </ul>
            </aside>
          </div>

          <button
            type="button"
            onClick={() => downloadSheet(machine, code)}
            className="w-full rounded-2xl bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-3 text-sm font-semibold text-[#1a1203] sm:w-auto"
          >
            Générer la Fiche d&apos;Intervention SAV & Entretien Annuel (PDF)
          </button>
        </div>
      ) : null}
    </section>
  );
}
