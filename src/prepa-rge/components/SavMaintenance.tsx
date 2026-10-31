import { useMemo, useState } from "react";
import { FILIERES, type FiliereId } from "../data/rgeQuestions";
import MachineScanner from "./MachineScanner";

type StepId = 0 | 1 | 2 | 3;

type Fault = {
  id: string;
  filiere: FiliereId;
  title: string;
  step: StepId;
  symptom: string;
  solution: string;
};

type FaultCode = {
  brand: string;
  code: string;
  filiere: FiliereId;
  meaning: string;
  check: string;
};

type CheckItem = {
  filiere: FiliereId;
  title: string;
  detail: string;
};

const STEPS: { id: StepId; title: string; text: string }[] = [
  { id: 0, title: "Étape 0 — Alimentation électrique", text: "Tension, disjoncteur, différentiel, terre, et présence de la commande." },
  { id: 1, title: "Étape 1 — Débit / Pression", text: "Débit d'eau, pression, fluide, tirage ou isolement selon la filière." },
  { id: 2, title: "Étape 2 — Démarrage", text: "Ordre de marche, organe de sécurité, allumage ou couplage onduleur." },
  { id: 3, title: "Étape 3 — Régulation", text: "Sondes, loi d'eau, consigne solaire ou hygro, et stabilité du régime." },
];

const FAULTS: Fault[] = [
  {
    id: "fuite-frigo",
    filiere: "qualipac",
    title: "Fuite frigorigène",
    step: 1,
    symptom: "Le compresseur part puis s'arrête. La basse pression ne tient pas. Givre localisé ou huile au dudgeon.",
    solution:
      "Ne pas recharger à l'aveugle. Consigner, rechercher la fuite sous azote, reprendre le dudgeon ou le raccord, tirer au vide et peser l'appoint selon la notice. Le fluide ne se rejette pas à l'atmosphère. Contrôler ensuite le filtre déshydrateur si le circuit a pris l'air.",
  },
  {
    id: "sonde-coupee",
    filiere: "qualipac",
    title: "Sonde coupée",
    step: 3,
    symptom: "Défaut sonde départ d'eau ou extérieure. La loi d'eau fige une température absurde ou la PAC refuse de réguler.",
    solution:
      "Mesurer la continuité et la résistance de la sonde à la température du moment, connecteur débranché, et comparer à la courbe de la notice. Reprendre le câble coupé ou remplacer la sonde. Ne pas changer le compresseur pour un défaut de mesure.",
  },
  {
    id: "isolement-pv",
    filiere: "qualipv",
    title: "Défaut d'isolement PV",
    step: 0,
    symptom: "L'onduleur refuse de coupler. Alarme d'isolement entre le champ DC et la terre.",
    solution:
      "Le champ reste sous tension de jour. Ouvrir le sectionneur DC, ne pas shunter le contrôle. Chercher un connecteur humide, un câble pincé ou un cadre mal relié, puis mesurer l'isolement selon la procédure du fabricant. Le parafoudre DC se contrôle à part : un voyant rouge n'est pas un détail.",
  },
  {
    id: "surchauffe-solaire",
    filiere: "qualipv",
    title: "Surchauffe solaire (stagnation)",
    step: 3,
    symptom: "Capteurs très chauds, circulateur arrêté, pression glycol qui grimpe, vapeur possible en toiture.",
    solution:
      "Ne pas ouvrir un circuit brûlant. Laisser redescendre la température. Vérifier vase solaire, soupape du circuit glycol, clapet anti-retour et sonde de bas de ballon. L'appoint du ballon bi-énergie ne doit pas masquer une absence de circulation. Reprendre le taux de glycol après refroidissement.",
  },
  {
    id: "bougie-grains",
    filiere: "qualibois",
    title: "Bougie granulés grillée",
    step: 2,
    symptom: "La vis tourne, les granulés tombent, pas de flamme. Défaut d'allumage après plusieurs tentatives.",
    solution:
      "Couper les tentatives : le creuset se remplit d'imbrûlés. Contrôler l'alimentation de la bougie, sa résistance, et le flux d'air d'allumage. Remplacer la bougie, vider le creuset, vérifier des granulés secs. Le conduit et l'arrivée d'air comburant se contrôlent dans la même visite.",
  },
  {
    id: "vmc-arretee",
    filiere: "renovation",
    title: "VMC arrêtée après étanchéité",
    step: 2,
    symptom: "Maison nouvellement étanche, buée sur les vitrages Uw ≤ 1,3, odeur d'air vicié. Le caisson Hygro B ne tourne plus.",
    solution:
      "Rétablir l'alimentation du caisson et les débits (cuisine, salle de bains, WC) avant de chercher une infiltration. Une enveloppe étanche sans extraction enferme l'humidité. Contrôler bouches, gaines pincées et entrées d'air des menuiseries. Le test d'étanchéité ne remplace pas ces débits.",
  },
];

const CODES: FaultCode[] = [
  { brand: "Daikin", code: "U4", filiere: "qualipac", meaning: "Défaut de communication entre unité intérieure et extérieure.", check: "Câblage de communication, polarité, et alimentation des deux unités avant de condamner une carte." },
  { brand: "Daikin", code: "U0", filiere: "qualipac", meaning: "Manque de fluide frigorigène.", check: "Recherche de fuite, pas un appoint systématique. Tirage au vide et pesée après réparation." },
  { brand: "Daikin", code: "J3", filiere: "qualipac", meaning: "Sonde de refoulement compresseur hors plage ou coupée.", check: "Connecteur et résistance de sonde. Ne pas confondre avec un manque d'eau." },
  { brand: "Atlantic", code: "370", filiere: "qualipac", meaning: "Défaut de sonde de température sur les gammes Alfea courantes.", check: "Identifier la sonde citée par la notice du modèle, mesurer, remplacer si la valeur est ouverte." },
  { brand: "Atlantic", code: "04", filiere: "qualipac", meaning: "Débit d'eau insuffisant ou circulateur à l'arrêt, selon la gamme.", check: "Filtre à boues, vannes ouvertes, purge, sens et alimentation du circulateur." },
  { brand: "Atlantic", code: "09", filiere: "qualipac", meaning: "Sonde extérieure ou départ incohérente sur plusieurs régulations.", check: "Continuité du câble en façade et valeur ohmique. La loi d'eau ne se règle pas sur une sonde morte." },
  { brand: "Enphase", code: "Grid Gone", filiere: "qualipv", meaning: "Réseau AC absent ou hors gabarit : l'onduleur découple.", check: "Tension au tableau, disjoncteur de production, et consigne de découplage. Pas un défaut de module tant que l'AC n'est pas revenu." },
  { brand: "Enphase", code: "DC Resistance Low", filiere: "qualipv", meaning: "Isolement DC trop faible vers la terre.", check: "Sectionneur ouvert, connecteurs et câbles. Ne pas inhiber le contrôle d'isolement." },
  { brand: "SMA", code: "3501", filiere: "qualipv", meaning: "Défaut d'isolement sur de nombreux onduleurs de la gamme.", check: "Même logique : champ DC dangereux de jour, recherche du défaut à la terre, parafoudre à inspecter." },
  { brand: "DualSun / CESI", code: "STAG", filiere: "qualipv", meaning: "Repère pédagogique de stagnation capteurs : circulation arrêtée et température haute.", check: "Vase solaire, soupape glycol, sondes de différentiel. Intervention à froid." },
  { brand: "Palazzetti", code: "ALLUM", filiere: "qualibois", meaning: "Échec d'allumage granulés.", check: "Bougie, air d'allumage, granulés dans le creuset, vis non bloquée." },
  { brand: "MCZ", code: "BOUGIE", filiere: "qualibois", meaning: "Bougie absente, coupée ou hors résistance.", check: "Mesure hors tension, remplacement, pas de shunts." },
  { brand: "ÖkoFEN", code: "VIS", filiere: "qualibois", meaning: "Défaut d'entraînement de vis ou trémie vide.", check: "Granulés secs, bourrage, sécurité de la vis. Ne pas forcer le moteur." },
  { brand: "Aldes", code: "DEBIT", filiere: "renovation", meaning: "Caisson Hygro en défaut ou débits non atteints.", check: "Alimentation, filtres, gaines écrasées, bouches ouvertes." },
  { brand: "Atlantic VMC", code: "FILTRE", filiere: "renovation", meaning: "Encrassement filtre double flux ou hygro, débit effondré.", check: "Remplacement du filtre, pas une augmentation de consigne pour compenser." },
];

const CHECKLIST: CheckItem[] = [
  { filiere: "qualipac", title: "Entretien PAC tous les 2 ans", detail: "Systèmes thermodynamiques de 4 à 70 kW : décret n°2020-912. Attestation, étanchéité du circuit, filtres, et paramètres de loi d'eau." },
  { filiere: "qualipac", title: "Groupe de sécurité du CET", detail: "Tarage 7 bar, manœuvre, écoulement libre. Ce n'est pas la soupape chauffage 3 bar du DTU 65.16." },
  { filiere: "qualipac", title: "Filtre à boues et pression vase", detail: "Nettoyage du pot magnétique sur le retour. Gonflage du vase isolé du réseau : pression statique + 0,2 à 0,3 bar." },
  { filiere: "qualipv", title: "Contrôle des parafoudres PV", detail: "Voyant des parafoudres DC et AC (guide C 15-712-1). Un module hors service se remplace, il ne se shunte pas." },
  { filiere: "qualipv", title: "Production et serrages", detail: "Comparer les kWh au productible attendu. Serrages AC, terre des cadres, connecteurs de même famille." },
  { filiere: "qualipv", title: "Station solaire CESI", detail: "Pression glycol à froid, vase solaire, anode ou protection du ballon bi-énergie, et propreté des capteurs (BAR-TH-101)." },
  { filiere: "qualibois", title: "Ramonage deux fois par an", detail: "Dont une fois pendant la période de chauffe. Le DTU 24.1 ne dispense pas le conduit double paroi." },
  { filiere: "qualibois", title: "Écart au feu et air comburant", detail: "Distance de la désignation du conduit (ex. G50). Arrivée d'air dédiée, jamais sur une bouche de VMC." },
  { filiere: "qualibois", title: "Bougie, vis, granulés", detail: "Creuset propre, vis libre, granulés secs. Une bougie grillée se remplace avant une nouvelle série d'allumages." },
  { filiere: "renovation", title: "Débits VMC Hygro B", detail: "Cuisine, salle de bains, WC après la mise en étanchéité. Bouches et entrées d'air des menuiseries Uw ≤ 1,3." },
  { filiere: "renovation", title: "Test d'étanchéité à l'air", detail: "Mesure sous écart de pression de l'enveloppe du bouquet BAR-TH-164. Il ne remplace pas la ventilation." },
  { filiere: "renovation", title: "Ponts et retours d'isolant", detail: "Sarking ou combles, ITE/ITI, tableaux de menuiseries. Un pont laissé annule une partie du gain de classes." },
];

type SavMaintenanceProps = {
  filiere: FiliereId;
  onFiliereChange: (filiere: FiliereId) => void;
};

export default function SavMaintenance({ filiere, onFiliereChange }: SavMaintenanceProps) {
  const [reached, setReached] = useState<StepId>(0);
  const [faultId, setFaultId] = useState<string | null>(null);
  const [machineMode, setMachineMode] = useState(false);
  const [query, setQuery] = useState("");
  const [done, setDone] = useState<Record<string, boolean>>({});

  const faults = FAULTS.filter((item) => item.filiere === filiere);
  const fault = faults.find((item) => item.id === faultId) ?? null;
  const meta = FILIERES.find((item) => item.id === filiere) ?? FILIERES[0];
  const checks = CHECKLIST.filter((item) => item.filiere === filiere);

  const codes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return CODES.filter((item) => {
      if (needle.length === 0) return item.filiere === filiere;
      const blob = `${item.brand} ${item.code} ${item.meaning}`.toLowerCase();
      return blob.includes(needle);
    });
  }, [filiere, query]);

  function selectFiliere(next: FiliereId) {
    onFiliereChange(next);
    setReached(0);
    setFaultId(null);
  }

  function openStep(step: StepId) {
    if (fault && step > fault.step) return;
    setReached(step);
  }

  function simulate() {
    const pool = faults.filter((item) => item.id !== faultId);
    const pick = pool[Math.floor(Math.random() * pool.length)] ?? faults[0];
    if (!pick) return;
    setFaultId(pick.id);
    setReached(pick.step);
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-[#e8c872]">SAV, DÉPANNAGE & LOGIQUE GRAFCET</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Diagnostic pas à pas</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          Scannez une plaque, ou ouvrez une plaque démo, pour passer en mode dépannage machine. Le GRAFCET de filière
          reste disponible tant qu&apos;aucune machine n&apos;est identifiée. Les codes sont des repères de formation : la notice
          du numéro de série fait foi.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {FILIERES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => selectFiliere(item.id)}
            className={`rounded-full px-3 py-1.5 text-sm ${filiere === item.id ? "bg-[#e8c872] text-[#1a1203]" : "bg-white/5 text-slate-200"}`}
          >
            {item.title}
          </button>
        ))}
      </div>

      <MachineScanner onActiveChange={setMachineMode} />

      {machineMode ? (
        <p className="rounded-2xl border border-[#e8c872]/30 bg-[#e8c872]/10 px-4 py-3 text-sm text-[#f5e6b8]">
          Mode dépannage direct actif. Le GRAFCET de filière est en pause jusqu&apos;à la sortie de la fiche machine.
        </p>
      ) : (
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-white">GRAFCET · {meta.title}</h3>
            <div className="flex gap-2">
              <button type="button" onClick={simulate} className="rounded-full bg-red-500/90 px-4 py-2 text-sm font-semibold text-white">
                Simuler une panne
              </button>
              <button
                type="button"
                onClick={() => {
                  setFaultId(null);
                  setReached(0);
                }}
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200"
              >
                Réarmer
              </button>
            </div>
          </div>
          <ol className="mt-6 space-y-3">
            {STEPS.map((step, index) => {
              const blocked = fault ? step.id > fault.step : false;
              const alert = fault?.step === step.id;
              const validated = !alert && step.id <= reached && !blocked;
              return (
                <li key={step.id}>
                  <button
                    type="button"
                    disabled={blocked}
                    onClick={() => openStep(step.id)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left ${
                      alert
                        ? "border-red-400 bg-red-500/15"
                        : validated
                          ? "border-emerald-400/50 bg-emerald-500/10"
                          : "border-white/10 bg-black/20"
                    } disabled:cursor-not-allowed disabled:opacity-40`}
                  >
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-sm font-semibold">
                      {step.id}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">{step.title}</span>
                      <span className="mt-1 block text-sm text-slate-400">{step.text}</span>
                      {alert ? <span className="mt-2 block text-sm font-medium text-red-200">Alerte — {fault?.title}</span> : null}
                    </span>
                  </button>
                  {index < STEPS.length - 1 ? <div className="ml-7 h-3 w-px bg-white/15" /> : null}
                </li>
              );
            })}
          </ol>
        </div>
        <aside className="rounded-3xl border border-white/10 bg-[#12080c] p-5">
          <p className="text-xs tracking-[0.16em] text-red-300">CONDUITE IMMÉDIATE</p>
          {fault ? (
            <>
              <h3 className="mt-2 text-xl font-semibold text-white">{fault.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{fault.symptom}</p>
              <p className="mt-3 text-sm leading-relaxed text-slate-100">{fault.solution}</p>
            </>
          ) : (
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              Parcours nominal. Cliquez les étapes dans l&apos;ordre, ou simulez une panne pour figer le GRAFCET en rouge.
            </p>
          )}
        </aside>
      </div>
      )}

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-semibold text-white">Codes défauts constructeurs</h3>
        <p className="mt-1 text-sm text-slate-400">Daikin, Atlantic, Enphase, SMA, poêles et VMC. La recherche couvre toutes les marques.</p>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Marque, code ou symptôme — ex. U4, bougie, isolement"
          className="mt-4 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500"
        />
        <ul className="mt-4 divide-y divide-white/5">
          {codes.map((item) => (
            <li key={`${item.brand}-${item.code}`} className="py-3">
              <p className="text-sm font-semibold text-[#e8c872]">
                {item.brand} · {item.code}
              </p>
              <p className="mt-1 text-sm text-white">{item.meaning}</p>
              <p className="mt-1 text-sm text-slate-400">{item.check}</p>
            </li>
          ))}
          {codes.length === 0 ? <li className="py-3 text-sm text-slate-400">Aucun code ne correspond.</li> : null}
        </ul>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <h3 className="text-lg font-semibold text-white">Checklist d&apos;entretien</h3>
        <ul className="mt-4 space-y-3">
          {checks.map((item) => {
            const key = `${filiere}-${item.title}`;
            const checked = Boolean(done[key]);
            return (
              <li key={key}>
                <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setDone((current) => ({ ...current, [key]: !current[key] }))}
                    className="mt-1"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-white">{item.title}</span>
                    <span className="mt-1 block text-sm leading-relaxed text-slate-400">{item.detail}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
