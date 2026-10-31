import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Download,
  Factory,
  LayoutGrid,
  LineChart,
  Mail,
  Paperclip,
  PlugZap,
  Plus,
  RotateCcw,
  Ruler,
  Sun,
  Trash2,
  Zap,
} from "lucide-react";
import {
  CONSO_PALIER_KWH,
  DEPARTEMENTS,
  ETAT_INITIAL,
  MICROS,
  MODELES_CASCADE,
  MODELES_CENTRAUX,
  OBSTACLES_DEFAUT,
  PALIERS_KWC,
  PANNEAUX,
  POWERWALL_3,
  PRIX_TARIF_PRO,
  panneauDepuisEtat,
} from "./catalogue";
import { attacherEtudeAuDevis, telechargerEtudeJson, telechargerEtudePdf } from "./exportEtude";
import { construireEtude } from "./etude";
import { borne, deplacerObstacle, dimensionnerPalier, empreinteModule, libelleAzimut, toitureDepuis } from "./layout";
import RoofCanvas from "./RoofCanvas";
import { lireRoleStocke, peutVoirCoutsInternes } from "../../lib/crm/roles.js";
import { ouvrirMessagerie } from "../messaging/navigation";
import type {
  ArchitectureId,
  EtatCalpinage,
  EtudeTechnique,
  MicroId,
  Obstacle,
  OrientationPanneau,
  SegmentProjet,
  TarifPro,
  TypeCouverture,
  TypeObstacle,
} from "./types";

type Props = {
  clientNomInitial?: string;
  dossierId?: string | null;
  /** Marge brute. Sans prop : réservée à la session administrateur propriétaire. */
  afficherMarge?: boolean;
};

const ETAPES = [
  { id: 1 as const, label: "Toiture & obstacles", icon: Ruler },
  { id: 2 as const, label: "Panneaux & calepinage", icon: LayoutGrid },
  { id: 3 as const, label: "Onduleur & batterie", icon: Zap },
  { id: 4 as const, label: "Bilan 25 ans", icon: LineChart },
];

const CHAMP =
  "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400";

function pct(taux: number) {
  return `${Math.round(taux * 100)} %`;
}

function kwh(valeur: number) {
  return `${Math.round(valeur).toLocaleString("fr-FR")} kWh`;
}

function eur(valeur: number) {
  return Math.round(valeur).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function retour(ans: number | null) {
  if (ans === null) return "Au-delà de 25 ans";
  return `${ans.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ans`;
}

function Nombre({
  label,
  value,
  onChange,
  step = 0.1,
  min,
  max,
  unite,
}: {
  label: string;
  value: number;
  onChange: (valeur: number) => void;
  step?: number;
  min?: number;
  max?: number;
  unite?: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="mt-1.5 flex items-center gap-2">
        <input
          type="number"
          className={CHAMP}
          value={Number.isFinite(value) ? value : 0}
          min={min}
          max={max}
          step={step}
          onChange={(event) => {
            const suivant = event.target.valueAsNumber;
            if (Number.isFinite(suivant)) onChange(suivant);
          }}
        />
        {unite ? <span className="shrink-0 text-xs text-slate-400">{unite}</span> : null}
      </span>
    </label>
  );
}

function Boussole({ azimut }: { azimut: number }) {
  return (
    <svg viewBox="0 0 88 88" className="h-24 w-24" aria-hidden>
      <circle cx="44" cy="44" r="40" fill="#020617" stroke="#334155" />
      <text x="44" y="16" textAnchor="middle" fill="#94a3b8" fontSize="9">N</text>
      <text x="44" y="80" textAnchor="middle" fill="#6ee7b7" fontSize="9">S</text>
      <text x="8" y="47" fill="#94a3b8" fontSize="9">O</text>
      <text x="74" y="47" fill="#94a3b8" fontSize="9">E</text>
      <g transform={`rotate(${180 + azimut} 44 44)`}>
        <line x1="44" y1="46" x2="44" y2="22" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="44" r="3" fill="#34d399" />
      </g>
    </svg>
  );
}

function Courbe({ courbe, investissement }: { courbe: EtudeTechnique["production"]["courbe"]; investissement: number }) {
  const max = Math.max(investissement, ...courbe.map((point) => point.cumul), 1);
  const largeur = 320;
  const hauteur = 110;
  const trace = courbe
    .map((point, index) => {
      const x = (index / Math.max(1, courbe.length - 1)) * largeur;
      const y = hauteur - (point.cumul / max) * (hauteur - 8) - 4;
      return `${x},${y}`;
    })
    .join(" ");
  const yInvest = hauteur - (investissement / max) * (hauteur - 8) - 4;
  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} className="mt-3 h-36 w-full" role="img" aria-label="Économies cumulées sur 25 ans">
      <line x1="0" y1={yInvest} x2={largeur} y2={yInvest} stroke="#f97316" strokeDasharray="5 4" />
      <polyline fill="none" stroke="#34d399" strokeWidth="2.5" points={trace} />
    </svg>
  );
}

export default function SolarCalpinage({ clientNomInitial = "", dossierId = null, afficherMarge }: Props) {
  const voirMarge = afficherMarge ?? peutVoirCoutsInternes(lireRoleStocke());
  const [etat, setEtat] = useState<EtatCalpinage>(() => ({ ...ETAT_INITIAL, clientNom: clientNomInitial }));
  const [etape, setEtape] = useState<(typeof ETAPES)[number]["id"]>(1);
  const [message, setMessage] = useState<string | null>(null);
  const etude = useMemo(() => construireEtude(etat, dossierId), [etat, dossierId]);
  const panneau = panneauDepuisEtat(etat);
  const empreinte = empreinteModule(etat.orientation, panneau);
  const patch = (partial: Partial<EtatCalpinage>) => setEtat((courant) => ({ ...courant, ...partial }));
  const maxLargeur = etat.segment === "tertiaire" ? 220 : 80;
  const maxRampant = etat.segment === "tertiaire" ? 160 : 40;

  const appliquerPalier = (kwc: (typeof PALIERS_KWC)[number]) => {
    const type: TypeCouverture = etat.typeCouverture === "rampant" ? "bac-acier" : etat.typeCouverture;
    const inclinaisonDeg = type === "bac-acier" ? 8 : type === "ombriere" ? 10 : type === "terrasse" ? 12 : etat.inclinaisonDeg;
    const dims = dimensionnerPalier(kwc, panneau, "paysage", type, inclinaisonDeg);
    const tarifPro: TarifPro = kwc > 250 ? "vert" : "jaune";
    patch({
      segment: "tertiaire",
      typeCouverture: type,
      orientation: "paysage",
      inclinaisonDeg,
      largeurM: dims.largeurM,
      rampantM: dims.rampantM,
      kwcCible: kwc,
      desactives: [],
      obstacles: [],
      architecture: kwc >= 100 ? "cascade" : etat.architecture === "tesla-pw3" ? "tesla-pw3" : "cascade",
      unitesPowerwall: Math.min(POWERWALL_3.unitesMax, Math.max(1, Math.ceil(kwc / POWERWALL_3.solaireMaxKwc))),
      repartition: "auto",
      tarifPro,
      prixKwh: PRIX_TARIF_PRO[tarifPro],
      prixManuel: false,
      injectionManuelle: false,
      consoKwh: CONSO_PALIER_KWH[kwc],
      investissementSaisi: null,
    });
  };

  const choisirSegment = (segment: SegmentProjet) => {
    if (segment === etat.segment) return;
    if (segment === "tertiaire") {
      patch({
        segment,
        architecture: etat.architecture === "tesla-pw3" ? "tesla-pw3" : "cascade",
        repartition: "auto",
      });
      return;
    }
    patch({
      segment,
      architecture: etat.architecture === "cascade" ? "tesla-pw3" : etat.architecture,
      largeurM: Math.min(etat.largeurM, 80),
      rampantM: Math.min(etat.rampantM, 40),
      kwcCible: null,
    });
  };

  const choisirCouverture = (type: TypeCouverture) => {
    const inclinaisonDeg = type === "rampant" ? 30 : type === "bac-acier" ? 8 : type === "ombriere" ? 10 : 12;
    if (etat.segment === "tertiaire" && etat.kwcCible) {
      const dims = dimensionnerPalier(etat.kwcCible, panneau, etat.orientation, type, inclinaisonDeg);
      patch({ typeCouverture: type, inclinaisonDeg, largeurM: dims.largeurM, rampantM: dims.rampantM, desactives: [] });
      return;
    }
    patch({ typeCouverture: type, inclinaisonDeg });
  };

  const basculerModule = (id: string) => {
    setEtat((courant) => ({
      ...courant,
      desactives: courant.desactives.includes(id)
        ? courant.desactives.filter((item) => item !== id)
        : [...courant.desactives, id],
    }));
  };

  const ajouterObstacle = (type: TypeObstacle) => {
    const defaut = OBSTACLES_DEFAUT[type];
    const obstacle: Obstacle = {
      id: `obs-${crypto.randomUUID()}`,
      type,
      x: Math.max(0, (etat.largeurM - defaut.largeurM) / 2),
      y: Math.max(0, (etat.rampantM - defaut.hauteurM) / 2),
      largeurM: defaut.largeurM,
      hauteurM: defaut.hauteurM,
    };
    patch({ obstacles: [...etat.obstacles, obstacle] });
  };

  const majObstacle = (id: string, partial: Partial<Obstacle>) => {
    setEtat((courant) => {
      const toit = toitureDepuis(
        courant.largeurM,
        courant.rampantM,
        courant.inclinaisonDeg,
        courant.azimutDeg,
        courant.typeCouverture,
        courant.segment,
      );
      return {
        ...courant,
        obstacles: courant.obstacles.map((obstacle) => {
          if (obstacle.id !== id) return obstacle;
          const suivant = {
            ...obstacle,
            ...partial,
            largeurM: borne(partial.largeurM ?? obstacle.largeurM, 0.1, toit.largeurM),
            hauteurM: borne(partial.hauteurM ?? obstacle.hauteurM, 0.1, toit.rampantM),
          };
          return deplacerObstacle(suivant, suivant.x, suivant.y, toit);
        }),
      };
    });
  };

  const deplacer = (id: string, x: number, y: number) => {
    setEtat((courant) => {
      const toit = toitureDepuis(
        courant.largeurM,
        courant.rampantM,
        courant.inclinaisonDeg,
        courant.azimutDeg,
        courant.typeCouverture,
        courant.segment,
      );
      return {
        ...courant,
        obstacles: courant.obstacles.map((obstacle) => (obstacle.id === id ? deplacerObstacle(obstacle, x, y, toit) : obstacle)),
      };
    });
  };

  const choisirOrientation = (orientation: OrientationPanneau) => {
    if (etat.segment === "tertiaire" && etat.kwcCible) {
      const dims = dimensionnerPalier(etat.kwcCible, panneau, orientation, etat.typeCouverture, etat.inclinaisonDeg);
      patch({ orientation, desactives: [], largeurM: dims.largeurM, rampantM: dims.rampantM });
      return;
    }
    patch({ orientation, desactives: [] });
  };

  const editerChaine = (index: number, valeur: number) => {
    if (!Number.isFinite(valeur)) return;
    const base = etat.repartition === "auto" ? etude.electrique.chaines.map((chaine) => chaine.nombre) : etat.comptes;
    const comptes = [0, 0, 0, 0, 0, 0];
    base.forEach((nombre, position) => {
      if (position < 6) comptes[position] = nombre;
    });
    comptes[index] = Math.max(0, Math.round(valeur));
    patch({ repartition: "manuel", comptes });
  };

  const attacher = () => {
    try {
      const id = attacherEtudeAuDevis(etude, dossierId, { masquerMarge: !voirMarge });
      setMessage(`Étude attachée au dossier ${id}. Elle est enregistrée sur ce navigateur pour le devis.`);
    } catch {
      setMessage("Enregistrement impossible dans ce navigateur.");
    }
  };

  const unitesPw = etat.segment === "tertiaire" ? Math.min(POWERWALL_3.unitesMax, Math.max(1, etat.unitesPowerwall)) : 1;
  const mppt = etat.architecture === "tesla-pw3" ? POWERWALL_3.mppt * unitesPw : (etude.electrique.centrale?.mppt ?? 0);
  const slots = Array.from({ length: mppt }, (_, index) => etude.electrique.chaines[index]?.nombre ?? 0);
  const chainesActives = etude.electrique.chaines.filter((chaine) => chaine.nombre > 0);
  const saisieChaines = etat.architecture !== "micro" && etat.architecture !== "cascade" && mppt > 0 && mppt <= 8;
  const architectures =
    etat.segment === "tertiaire"
      ? ([
          ["tesla-pw3", "Stockage Tesla Powerwall 3", "Jusqu'à 4 unités chaînées : 46 kW AC, 54 kWh"],
          ["cascade", "Onduleurs de chaîne en cascade", "Huawei SUN2000 ou SMA CORE2, 36 à 500 kWc"],
        ] as const)
      : ([
          ["tesla-pw3", "Tesla Powerwall 3", "Onduleur + batterie 13,5 kWh, 6 MPPT"],
          ["micro", "Micro-onduleurs", "Enphase IQ8HC ou APSystems DS3"],
          ["hybride", "Hybride central", "Huawei SUN2000 ou SolarEdge"],
        ] as const);

  const plan = (
    <RoofCanvas
      largeurM={etat.largeurM}
      rampantM={etat.rampantM}
      cellules={etude.cellules}
      empreinte={empreinte}
      obstacles={etat.obstacles}
      typeCouverture={etat.typeCouverture}
      onToggle={basculerModule}
      onDeplacerObstacle={deplacer}
    />
  );

  return (
    <section
      data-testid="calpinage-solaire"
      data-panneaux={etude.modulesActifs}
      data-kwc={etude.kwc.toFixed(2)}
      data-electrique={etude.electrique.ok ? "ok" : "alerte"}
      data-segment={etat.segment}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-lg shadow-slate-950/40"
    >
      <header className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
              ENERGIA CONSEIL IA® · QualiPV
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
              <Sun className="h-6 w-6 text-emerald-300" aria-hidden />
              Calepinage solaire {etat.segment === "tertiaire" ? "tertiaire & industriel" : "& stockage Tesla"}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              En rénovation globale, le photovoltaïque se pose en dernier : après l'isolation, les menuiseries, la ventilation et le chauffage.
            </p>
          </div>
          <p className="max-w-xs rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-center text-[11px] font-semibold leading-snug text-red-100">
            {etat.segment === "tertiaire"
              ? etat.architecture === "cascade"
                ? "Onduleurs de chaîne · 36 à 500 kWc"
                : `Tertiaire · ${unitesPw} Powerwall · ${unitesPw * POWERWALL_3.secoursKw} kW AC · ${unitesPw * POWERWALL_3.capaciteKwh} kWh`
              : `Powerwall 3 · 6 MPPT · secours ${POWERWALL_3.secoursKw} kW`}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="block max-w-md flex-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Foyer</span>
            <input
              className={CHAMP}
              value={etat.clientNom}
              placeholder="Nom du client"
              onChange={(event) => patch({ clientNom: event.target.value })}
            />
          </label>
          <button
            type="button"
            data-testid="calpinage-envoyer-email"
            onClick={() =>
              ouvrirMessagerie({
                dossierId,
                clientNom: etat.clientNom,
                modeleId: "calpinage-solaire",
                contexte: {
                  clientNom: etat.clientNom,
                  kwc: etude.kwc,
                  gainAnnuel: etude.production.gainAnnuelEur,
                  retourAns: etude.production.retourAns,
                  cumul25: etude.production.cumul25Eur,
                  resteACharge: etude.devis.resteAChargeTtc,
                  totalTtc: etude.devis.totalTtc,
                },
              })
            }
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-50"
          >
            <Mail className="h-4 w-4" aria-hidden />
            Envoyer par email
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Segment de projet">
          {(
            [
              ["residentiel", "Résidentiel"],
              ["tertiaire", "Tertiaire & industrie"],
            ] as const
          ).map(([id, libelle]) => (
            <button
              key={id}
              type="button"
              data-testid={`calpinage-segment-${id}`}
              aria-pressed={etat.segment === id}
              onClick={() => choisirSegment(id)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                etat.segment === id ? "bg-emerald-400 text-slate-950" : "border border-slate-600 text-slate-200"
              }`}
            >
              {id === "tertiaire" ? <Factory className="mr-1 inline h-3.5 w-3.5" aria-hidden /> : null}
              {libelle}
            </button>
          ))}
        </div>
      </header>

      <div className="flex gap-2 overflow-x-auto border-b border-white/10 px-4 py-3" role="tablist">
        {ETAPES.map((item) => {
          const Icone = item.icon;
          const actif = etape === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={actif}
              onClick={() => setEtape(item.id)}
              className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                actif ? "bg-emerald-500/15 text-emerald-100" : "text-slate-300 hover:bg-slate-900"
              }`}
            >
              <Icone className="h-4 w-4" aria-hidden />
              {item.id}. {item.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_280px] sm:p-6">
        <div className="min-w-0 space-y-5">
          {etape === 1 ? (
            <div className="space-y-5" data-testid="calpinage-etape-toiture">
              {etat.segment === "tertiaire" ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Paliers tertiaires</p>
                  <div className="flex flex-wrap gap-2">
                    {PALIERS_KWC.map((kwc) => (
                      <button
                        key={kwc}
                        type="button"
                        data-testid={`calpinage-palier-${kwc}`}
                        aria-pressed={etat.kwcCible === kwc}
                        onClick={() => appliquerPalier(kwc)}
                        className={`rounded-xl px-3 py-2 text-sm font-semibold ${
                          etat.kwcCible === kwc ? "bg-emerald-400 text-slate-950" : "border border-slate-600 text-slate-100"
                        }`}
                      >
                        {kwc} kWc
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(
                      [
                        ["bac-acier", "Bac acier"],
                        ["terrasse", "Toiture terrasse"],
                        ["ombriere", "Ombrière de parking"],
                        ["rampant", "Rampant"],
                      ] as const
                    ).map(([id, libelle]) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={etat.typeCouverture === id}
                        onClick={() => choisirCouverture(id)}
                        className={`rounded-xl border px-3 py-2 text-sm ${
                          etat.typeCouverture === id ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700"
                        }`}
                      >
                        {libelle}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="grid gap-4 sm:grid-cols-2">
                <Nombre label="Largeur d'égout" unite="m" min={1} max={maxLargeur} value={etat.largeurM} onChange={(largeurM) => patch({ largeurM: borne(largeurM, 1, maxLargeur), kwcCible: null })} />
                <Nombre label="Longueur de rampant" unite="m" min={1} max={maxRampant} value={etat.rampantM} onChange={(rampantM) => patch({ rampantM: borne(rampantM, 1, maxRampant), kwcCible: null })} />
                <Nombre label="Inclinaison" unite="°" min={0} max={90} step={1} value={etat.inclinaisonDeg} onChange={(inclinaisonDeg) => patch({ inclinaisonDeg: borne(inclinaisonDeg, 0, 90) })} />
                <Nombre label={`Azimut · ${libelleAzimut(etat.azimutDeg)}`} unite="°" min={-180} max={180} step={1} value={etat.azimutDeg} onChange={(azimutDeg) => patch({ azimutDeg: borne(azimutDeg, -180, 180) })} />
              </div>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Orientation de −180° nord à +180° nord, 0° sud
                </span>
                <input
                  type="range"
                  min={-180}
                  max={180}
                  step={1}
                  value={etat.azimutDeg}
                  onChange={(event) => patch({ azimutDeg: Number(event.target.value) })}
                  className="mt-3 w-full accent-emerald-400"
                />
              </label>
              <div className="flex flex-wrap items-center gap-4">
                <Boussole azimut={etat.azimutDeg} />
                <p className="max-w-sm text-sm text-slate-300">
                  Est négatif, ouest positif. Le trait vert indique la direction vers laquelle regarde la toiture.
                </p>
              </div>
              {Math.abs(etat.azimutDeg) > 100 ? (
                <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  Orientation éloignée du sud : le productible chute fortement.
                </p>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {(Object.keys(OBSTACLES_DEFAUT) as TypeObstacle[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => ajouterObstacle(type)}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:border-emerald-400"
                  >
                    <Plus className="h-4 w-4" aria-hidden />
                    {OBSTACLES_DEFAUT[type].libelle}
                  </button>
                ))}
              </div>
              <ul className="space-y-3">
                {etat.obstacles.map((obstacle) => (
                  <li key={obstacle.id} className="grid gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                    <p className="self-center text-sm font-semibold text-slate-200">{OBSTACLES_DEFAUT[obstacle.type].libelle}</p>
                    <Nombre label="X" unite="m" step={0.05} value={obstacle.x} onChange={(x) => majObstacle(obstacle.id, { x })} />
                    <Nombre label="Y depuis l'égout" unite="m" step={0.05} value={obstacle.y} onChange={(y) => majObstacle(obstacle.id, { y })} />
                    <Nombre label="Largeur" unite="m" step={0.05} value={obstacle.largeurM} onChange={(largeurM) => majObstacle(obstacle.id, { largeurM })} />
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <Nombre label="Hauteur" unite="m" step={0.05} value={obstacle.hauteurM} onChange={(hauteurM) => majObstacle(obstacle.id, { hauteurM })} />
                      </div>
                      <button
                        type="button"
                        aria-label="Supprimer l'obstacle"
                        onClick={() => patch({ obstacles: etat.obstacles.filter((item) => item.id !== obstacle.id) })}
                        className="mb-1 rounded-lg border border-slate-700 p-2 text-slate-300 hover:text-red-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {plan}
            </div>
          ) : null}

          {etape === 2 ? (
            <div className="space-y-5" data-testid="calpinage-etape-panneaux">
              <div className="flex flex-wrap gap-2">
                {(["portrait", "paysage"] as const).map((orientation) => (
                  <button
                    key={orientation}
                    type="button"
                    aria-pressed={etat.orientation === orientation}
                    onClick={() => choisirOrientation(orientation)}
                    className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                      etat.orientation === orientation
                        ? "border-emerald-400 bg-emerald-500/15 text-emerald-100"
                        : "border-slate-700 text-slate-300"
                    }`}
                  >
                    {orientation === "portrait" ? "Portrait 1,13 × 1,75 m" : "Paysage 1,75 × 1,13 m"}
                  </button>
                ))}
                <button
                  type="button"
                  data-testid="calpinage-remplir"
                  onClick={() => patch({ desactives: [] })}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden />
                  Remplir automatiquement
                </button>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {PANNEAUX.map((modele) => (
                  <button
                    key={modele.id}
                    type="button"
                    onClick={() => patch({ panneauId: modele.id })}
                    className={`rounded-xl border px-3 py-3 text-left ${
                      etat.panneauId === modele.id ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700 bg-slate-900"
                    }`}
                  >
                    <p className="text-sm font-semibold">{modele.nom}</p>
                    <p className="mt-1 font-mono text-xs text-slate-400">
                      {modele.wc} Wc · Voc {modele.voc} V · Vmpp {modele.vmpp} V · Isc {modele.isc} A
                    </p>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => patch({ panneauId: "custom" })}
                  className={`rounded-xl border px-3 py-3 text-left ${
                    etat.panneauId === "custom" ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <p className="text-sm font-semibold">Module personnalisé</p>
                  <p className="mt-1 text-xs text-slate-400">Wc, Voc, Vmpp, Isc et format</p>
                </button>
              </div>
              {etat.panneauId === "custom" ? (
                <div className="grid gap-3 rounded-xl border border-slate-800 p-3 sm:grid-cols-3">
                  <label className="block sm:col-span-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Nom</span>
                    <input
                      className={CHAMP}
                      value={etat.panneauCustom.nom}
                      onChange={(event) => patch({ panneauCustom: { ...etat.panneauCustom, nom: event.target.value } })}
                    />
                  </label>
                  <Nombre label="Puissance" unite="Wc" step={5} value={etat.panneauCustom.wc} onChange={(wc) => patch({ panneauCustom: { ...etat.panneauCustom, wc } })} />
                  <Nombre label="Voc" unite="V" step={0.1} value={etat.panneauCustom.voc} onChange={(voc) => patch({ panneauCustom: { ...etat.panneauCustom, voc } })} />
                  <Nombre label="Vmpp" unite="V" step={0.1} value={etat.panneauCustom.vmpp} onChange={(vmpp) => patch({ panneauCustom: { ...etat.panneauCustom, vmpp } })} />
                  <Nombre label="Isc" unite="A" step={0.1} value={etat.panneauCustom.isc} onChange={(isc) => patch({ panneauCustom: { ...etat.panneauCustom, isc } })} />
                  <Nombre label="Longueur" unite="m" step={0.01} value={etat.panneauCustom.longueurM} onChange={(longueurM) => patch({ panneauCustom: { ...etat.panneauCustom, longueurM } })} />
                  <Nombre label="Largeur" unite="m" step={0.01} value={etat.panneauCustom.largeurM} onChange={(largeurM) => patch({ panneauCustom: { ...etat.panneauCustom, largeurM } })} />
                </div>
              ) : null}
              <p className="font-mono text-sm text-emerald-200" data-testid="calpinage-kwc">
                {etude.modulesActifs} modules actifs · {etude.kwc.toFixed(2)} kWc
              </p>
              {plan}
            </div>
          ) : null}

          {etape === 3 ? (
            <div className="space-y-5" data-testid="calpinage-etape-onduleur">
              <div className={`grid gap-3 ${architectures.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                {architectures.map(([id, titre, detail]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={etat.architecture === id}
                    onClick={() => patch({ architecture: id as ArchitectureId, repartition: "auto" })}
                    className={`rounded-xl border px-3 py-3 text-left ${
                      etat.architecture === id ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700 bg-slate-900"
                    }`}
                  >
                    <p className="text-sm font-semibold">{titre}</p>
                    <p className="mt-1 text-xs text-slate-400">{detail}</p>
                  </button>
                ))}
              </div>

              {etat.architecture === "tesla-pw3" ? (
                <div className="space-y-3 rounded-xl border border-slate-800 p-4">
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <BatteryCharging className="h-4 w-4 text-emerald-300" aria-hidden />
                    {POWERWALL_3.nom} · {POWERWALL_3.capaciteKwh} kWh · {POWERWALL_3.mppt} MPPT · {POWERWALL_3.vmin}–{POWERWALL_3.vmax} V · {POWERWALL_3.imax} A
                  </p>
                  <label className="flex items-center gap-2 text-sm text-slate-200">
                    <input
                      type="checkbox"
                      checked={etat.secours}
                      onChange={(event) => patch({ secours: event.target.checked })}
                      className="accent-emerald-400"
                    />
                    Backup Gateway · secours {POWERWALL_3.secoursKw * unitesPw} kW
                    {etat.segment === "tertiaire" ? ` · ${unitesPw * POWERWALL_3.capaciteKwh} kWh` : ""}
                  </label>
                  {etat.segment === "tertiaire" ? (
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: POWERWALL_3.unitesMax }, (_, index) => index + 1).map((nombre) => (
                        <button
                          key={nombre}
                          type="button"
                          aria-pressed={unitesPw === nombre}
                          onClick={() => patch({ unitesPowerwall: nombre, repartition: "auto" })}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                            unitesPw === nombre ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700"
                          }`}
                        >
                          {nombre} × {POWERWALL_3.secoursKw} kW · {nombre * POWERWALL_3.capaciteKwh} kWh
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {etat.architecture === "micro" ? (
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(MICROS) as MicroId[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={etat.microId === id}
                      onClick={() => patch({ microId: id })}
                      className={`rounded-xl border px-3 py-2 text-sm ${
                        etat.microId === id ? "border-emerald-400 bg-emerald-500/10" : "border-slate-700"
                      }`}
                    >
                      {MICROS[id].nom}
                    </button>
                  ))}
                </div>
              ) : null}

              {etat.architecture === "hybride" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Marque</span>
                    <select
                      className={CHAMP}
                      value={etat.marqueCentrale}
                      onChange={(event) =>
                        patch({
                          marqueCentrale: event.target.value === "solaredge" ? "solaredge" : "huawei",
                          modeleCentralId: "auto",
                          repartition: "auto",
                        })
                      }
                    >
                      <option value="huawei">Huawei SUN2000</option>
                      <option value="solaredge">SolarEdge</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Modèle</span>
                    <select
                      className={CHAMP}
                      value={etat.modeleCentralId}
                      onChange={(event) => patch({ modeleCentralId: event.target.value, repartition: "auto" })}
                    >
                      <option value="auto">Recommandation automatique</option>
                      {MODELES_CENTRAUX.filter((modele) => modele.marque === etat.marqueCentrale).map((modele) => (
                        <option key={modele.id} value={modele.id}>
                          {modele.nom}
                        </option>
                      ))}
                    </select>
                  </label>
                  {etude.electrique.centrale ? (
                    <p className="sm:col-span-2 text-sm text-slate-300">
                      {etude.electrique.centrale.nom} · ratio DC/AC {etude.electrique.centrale.ratio.toFixed(2)} ·{" "}
                      {etude.electrique.centrale.vmax} V max
                    </p>
                  ) : null}
                </div>
              ) : null}

              {etat.architecture === "cascade" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Marque</span>
                    <select
                      className={CHAMP}
                      value={etat.marqueCascade}
                      onChange={(event) =>
                        patch({
                          marqueCascade: event.target.value === "sma" ? "sma" : "huawei",
                          modeleCascadeId: "auto",
                        })
                      }
                    >
                      <option value="huawei">Huawei SUN2000</option>
                      <option value="sma">SMA CORE</option>
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Modèle</span>
                    <select
                      className={CHAMP}
                      value={etat.modeleCascadeId}
                      onChange={(event) => patch({ modeleCascadeId: event.target.value })}
                    >
                      <option value="auto">Le moins d'armoires possible</option>
                      {MODELES_CASCADE.filter((modele) => modele.marque === etat.marqueCascade).map((modele) => (
                        <option key={modele.id} value={modele.id}>
                          {modele.nom}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block sm:col-span-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Batterie centralisée C&I</span>
                    <select
                      className={CHAMP}
                      value={etat.batterieCiKwh}
                      onChange={(event) => patch({ batterieCiKwh: Number(event.target.value) })}
                    >
                      <option value={0}>Sans batterie</option>
                      <option value={100}>100 kWh</option>
                      <option value={200}>200 kWh</option>
                      <option value={500}>500 kWh</option>
                    </select>
                  </label>
                  {etude.electrique.cascade ? (
                    <p className="sm:col-span-2 text-sm text-slate-300">
                      {etude.electrique.cascade.nombre} × {etude.electrique.cascade.nom} · {etude.electrique.cascade.kwAcTotal} kW AC · ratio{" "}
                      {etude.electrique.cascade.ratio.toFixed(2)} · {etude.electrique.cascade.chainesParMppt} chaîne(s) par MPPT.{" "}
                      {etude.electrique.cascade.resumeChaines}. Valeurs de fiche à confirmer avant Consuel.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {etat.segment === "tertiaire" ? (
                <div className="space-y-3 rounded-xl border border-slate-800 p-4" data-testid="calpinage-irve">
                  <label className="flex items-center gap-2 text-sm font-semibold">
                    <input
                      type="checkbox"
                      checked={etat.irveActive}
                      onChange={(event) => patch({ irveActive: event.target.checked })}
                      className="accent-emerald-400"
                    />
                    <PlugZap className="h-4 w-4 text-emerald-300" aria-hidden />
                    Bornes de recharge 22 kW triphasées
                  </label>
                  {etat.irveActive ? (
                    <Nombre
                      label="Nombre de bornes"
                      min={1}
                      max={10}
                      step={1}
                      value={etat.nbBornes}
                      onChange={(nbBornes) => patch({ nbBornes: Math.round(borne(nbBornes, 1, 10)) })}
                    />
                  ) : null}
                  {etude.production.tertiaire ? (
                    <p className="text-sm text-slate-300" data-testid="calpinage-advenir">
                      ADVENIR indicatif : {eur(etude.production.tertiaire.aideAdvenirEur)} (jusqu'à 50 % du lot bornes, plafonné).
                      Les bornes absorbent {kwh(etude.production.tertiaire.kwhIrve)} du surplus, valorisés au tarif du site.
                    </p>
                  ) : null}
                </div>
              ) : null}

              {saisieChaines ? (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-slate-300">Affectation des modules aux trackers</p>
                    <button
                      type="button"
                      onClick={() => patch({ repartition: "auto" })}
                      className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      Répartir automatiquement
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {slots.map((nombre, index) => {
                      const chaine = etude.electrique.chaines[index];
                      const ok = chaine ? chaine.ok : nombre === 0;
                      return (
                        <label
                          key={`mppt-${index}`}
                          className={`rounded-xl border p-3 ${ok ? "border-emerald-500/40 bg-emerald-500/10" : "border-red-500/50 bg-red-500/10"}`}
                        >
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">MPPT {index + 1}</span>
                          <input
                            type="number"
                            min={0}
                            step={1}
                            className={CHAMP}
                            value={nombre}
                            onChange={(event) => editerChaine(index, event.target.valueAsNumber)}
                          />
                          {chaine && chaine.nombre > 0 ? (
                            <span className="mt-2 block text-xs text-slate-300">
                              Voc −10 °C {chaine.vocFroidV.toFixed(0)} V · Vmpp 70 °C {chaine.vmppChaudV.toFixed(0)} V · Isc{" "}
                              {chaine.iscA.toLocaleString("fr-FR")} A
                            </span>
                          ) : (
                            <span className="mt-2 block text-xs text-slate-500">Tracker libre</span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ) : etude.electrique.micro ? (
                <div className="space-y-2 rounded-xl border border-slate-800 p-4 text-sm text-slate-200">
                  <p>
                    {etude.electrique.micro.nombreMicros} × {etude.electrique.micro.nom} · {etude.electrique.micro.panneauxParMicro}{" "}
                    module(s) par micro · {etude.electrique.micro.va} VA
                  </p>
                  <ul className="space-y-1">
                    {etude.electrique.micro.branches.map((compte, index) => (
                      <li key={`branche-${index}`}>
                        Branche {index + 1} : {compte} micros · {etude.electrique.micro?.courantsA[index]?.toFixed(2)} A / 16 A utiles
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {etude.electrique.alertes.length > 0 ? (
                <ul className="space-y-2">
                  {etude.electrique.alertes.map((alerte) => (
                    <li key={alerte} className="flex gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                      {alerte}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="flex items-center gap-2 text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {etude.electrique.resume}
                </p>
              )}
            </div>
          ) : null}

          {etape === 4 ? (
            <div className="space-y-5" data-testid="calpinage-etape-bilan">
              <div className="space-y-3" data-testid="calpinage-devis">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Devis contractant général</p>
                    <p className="font-mono text-sm text-emerald-200">{etude.devis.numero}</p>
                  </div>
                  <p className="font-mono text-sm text-slate-300">TVA {Math.round(etude.devis.tauxTva * 100)} %</p>
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-900 text-[11px] uppercase tracking-wide text-slate-400">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Désignation</th>
                        <th className="px-3 py-2 font-semibold">Qté</th>
                        <th className="px-3 py-2 font-semibold">PU HT</th>
                        <th className="px-3 py-2 font-semibold">Total HT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {etude.devis.lignes.map((ligne) => (
                        <tr key={ligne.id} className="border-t border-slate-800">
                          <td className="px-3 py-2">{ligne.designation}</td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            {ligne.quantite.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} {ligne.unite}
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">{eur(ligne.puHt)}</td>
                          <td className="px-3 py-2 whitespace-nowrap">{eur(ligne.totalHt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2"><dt>Fournitures HT</dt><dd>{eur(etude.devis.fournituresHt)}</dd></div>
                  <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2"><dt>Main-d'œuvre et ingénierie HT</dt><dd>{eur(etude.devis.ingenierieHt)}</dd></div>
                  <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2"><dt>Total HT</dt><dd>{eur(etude.devis.totalHt)}</dd></div>
                  <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2"><dt>TVA</dt><dd>{eur(etude.devis.tvaEur)}</dd></div>
                  <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2"><dt>Total TTC</dt><dd>{eur(etude.devis.totalTtc)}</dd></div>
                  {etude.devis.aides.map((aide) => (
                    <div key={aide.id} className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2 sm:col-span-2">
                      <dt>{aide.libelle}</dt>
                      <dd>− {eur(aide.montantEur)}</dd>
                    </div>
                  ))}
                  <div className="flex justify-between gap-3 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 sm:col-span-2" data-testid="calpinage-rac">
                    <dt className="font-semibold">Reste à charge TTC</dt>
                    <dd className="font-mono text-lg">{eur(etude.devis.resteAChargeTtc)}</dd>
                  </div>
                </dl>
                {voirMarge ? (
                  <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-50" data-testid="calpinage-marge">
                    <p className="font-semibold">Marge brute interne — visible uniquement pour Sylvain</p>
                    <p className="mt-1">
                      {eur(etude.devis.margeBruteHt)} HT ({Math.round(etude.devis.margeBrutePct * 100)} % du HT). Coût d'achat {eur(etude.devis.coutAchatHt)} HT.
                      Les forfaits sans coût distinct (pose, coffret, câble, démarches) sont comptés à marge nulle.
                    </p>
                  </div>
                ) : null}
                <p className="text-xs text-slate-500">
                  Aides financières 2026 (estimation à titre indicatif). Validité 3 mois. Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – 2026.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Département</span>
                  <select
                    className={CHAMP}
                    value={etat.departement}
                    onChange={(event) => {
                      const code = event.target.value;
                      const dept = DEPARTEMENTS.find((item) => item.code === code);
                      setEtat((courant) => ({
                        ...courant,
                        departement: code,
                        productible: courant.productibleManuel ? courant.productible : (dept?.productible ?? courant.productible),
                      }));
                    }}
                  >
                    {DEPARTEMENTS.map((dept) => (
                      <option key={dept.code} value={dept.code}>
                        {dept.code} — {dept.nom} · {dept.productible} kWh/kWc
                      </option>
                    ))}
                  </select>
                </label>
                <Nombre
                  label="Productible de référence"
                  unite="kWh/kWc"
                  step={10}
                  min={700}
                  max={1800}
                  value={etat.productible}
                  onChange={(productible) => patch({ productible, productibleManuel: true })}
                />
                <Nombre label="Consommation annuelle" unite="kWh" step={100} min={0} value={etat.consoKwh} onChange={(consoKwh) => patch({ consoKwh: Math.max(0, consoKwh) })} />
                {etat.segment === "tertiaire" ? (
                  <label className="block">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tarif Enedis</span>
                    <select
                      className={CHAMP}
                      value={etat.tarifPro}
                      onChange={(event) => {
                        const tarifPro: TarifPro = event.target.value === "vert" ? "vert" : "jaune";
                        patch({
                          tarifPro,
                          prixKwh: etat.prixManuel ? etat.prixKwh : PRIX_TARIF_PRO[tarifPro],
                        });
                      }}
                    >
                      <option value="jaune">Tarif Jaune · {PRIX_TARIF_PRO.jaune.toLocaleString("fr-FR")} EUR/kWh</option>
                      <option value="vert">Tarif Vert · {PRIX_TARIF_PRO.vert.toLocaleString("fr-FR")} EUR/kWh</option>
                    </select>
                  </label>
                ) : null}
                <Nombre
                  label={etat.segment === "tertiaire" ? "Prix d'achat du site" : "Prix de l'électricité"}
                  unite="EUR/kWh"
                  step={0.01}
                  min={0}
                  value={etat.segment === "tertiaire" && !etat.prixManuel ? PRIX_TARIF_PRO[etat.tarifPro] : etat.prixKwh}
                  onChange={(prixKwh) => patch({ prixKwh: Math.max(0, prixKwh), prixManuel: true })}
                />
                <Nombre
                  label={etat.segment === "tertiaire" ? "Injection S21 (20 ans)" : "Tarif d'injection du surplus"}
                  unite="EUR/kWh"
                  step={0.01}
                  min={0}
                  value={
                    etat.segment === "tertiaire" && !etat.injectionManuelle
                      ? (etude.production.tertiaire?.tarifInjectionS21 ?? etat.tarifInjection)
                      : etat.tarifInjection
                  }
                  onChange={(tarifInjection) => patch({ tarifInjection: Math.max(0, tarifInjection), injectionManuelle: true })}
                />
                <Nombre
                  label={etat.segment === "tertiaire" ? "Investissement net HT" : "Investissement TTC"}
                  unite="EUR"
                  step={100}
                  min={0}
                  value={etat.investissementSaisi ?? etude.production.investissementEur}
                  onChange={(valeur) => patch({ investissementSaisi: Math.max(0, valeur) })}
                />
              </div>
              {etat.investissementSaisi !== null || etat.productibleManuel || etat.prixManuel || etat.injectionManuelle ? (
                <button
                  type="button"
                  onClick={() => {
                    const dept = DEPARTEMENTS.find((item) => item.code === etat.departement);
                    patch({
                      investissementSaisi: null,
                      productibleManuel: false,
                      prixManuel: false,
                      injectionManuelle: false,
                      productible: dept?.productible ?? etat.productible,
                    });
                  }}
                  className="text-xs font-semibold text-emerald-300"
                >
                  Revenir aux hypothèses du département et du chiffrage
                </button>
              ) : null}
              <p className="text-xs text-slate-400">{etude.production.detailInvestissement}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Production</p>
                  <p className="mt-1 font-mono text-2xl">{kwh(etude.production.productionKwh)}/an</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Facteur orientation {etude.production.facteurOrientation.toFixed(2)} · {Math.round(etude.production.productibleCorrige)} kWh/kWc
                  </p>
                </article>
                <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Autoconsommation</p>
                  <p className="mt-1 font-mono text-2xl">{pct(etude.production.tauxReel)}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {etude.production.tertiaire
                      ? `Bâtiment ${pct(etude.production.tauxCible)} de la production, puis bornes ${kwh(etude.production.tertiaire.kwhIrve)} et batterie ${kwh(etude.production.tertiaire.kwhBatterie)}. Couverture du site ${pct(etude.production.couvertureConso)}.`
                      : `Cible ${etat.architecture === "tesla-pw3" ? "80–90 %" : "30–40 %"} avec cette architecture (${pct(etude.production.tauxCible)}), plafonnée par la consommation. Couverture des besoins ${pct(etude.production.couvertureConso)}.`}
                  </p>
                </article>
                <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Gain année 1</p>
                  <p className="mt-1 font-mono text-2xl">{eur(etude.production.gainAnnuelEur)}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Dont {eur(etude.production.economieAnnuelleEur)} d'électricité évitée et {eur(etude.production.revenuInjectionEur)} d'injection.
                  </p>
                </article>
                <article className="rounded-xl border border-slate-800 bg-slate-900 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">Cumul 25 ans · retour</p>
                  <p className="mt-1 font-mono text-2xl">{eur(etude.production.cumul25Eur)}</p>
                  <p className="mt-1 text-xs text-slate-400">{retour(etude.production.retourAns)} · inflation 3 %/an, injection figée 20 ans{etude.production.tertiaire ? ` · économie d'impôt ${eur(etude.production.tertiaire.economieFiscaleEur)}/an pendant 20 ans` : ""}</p>
                </article>
              </div>
              <Courbe courbe={etude.production.courbe} investissement={etude.production.investissementEur} />
              <p className="text-xs text-slate-500">Trait orange : investissement. Courbe verte : économies cumulées.</p>
              <div className="rounded-xl border border-orange-500/50 border-l-4 bg-orange-950/40 px-4 py-3 text-sm text-orange-50">
                <p className="font-semibold">Aides et portée de l'étude</p>
                <p className="mt-1">
                  {etude.production.tertiaire
                    ? "Aides financières 2026 (estimation à titre indicatif). ADVENIR, jusqu'à 50 % du lot bornes, est la seule aide déduite du devis. Tarif Jaune ou Vert, injection S21 et amortissement linéaire 20 ans à 25 % d'impôt sont des hypothèses de travail, pour une entreprise à l'impôt sur les sociétés. TVA 20 % considérée comme récupérable, hors retour. Aucune aide photovoltaïque n'est déduite du bilan 25 ans. Cette étude ne vaut pas devis signé."
                    : "Aides financières 2026 (estimation à titre indicatif). La prime à l'autoconsommation et l'ADVENIR, quand elles figurent, sont déduites du seul devis. Le bilan 25 ans est calculé avant ces aides. Aides à valider selon éligibilité en vigueur. Montants définitifs après instruction. Cette étude ne vaut pas devis signé. Validation QualiPV avant commande."}
                </p>
                <p className="mt-2 text-xs">Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – 2026</p>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">
                Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 · DAMIEN (Commercial) 06 72 68 09 68 · FABIEN (VIVONS COURTIER) 06 71 19 96 45 · Julia (Juriste) · MAR Antoine BARATIER – Cabinet C2ET
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              data-testid="calpinage-exporter-json"
              onClick={() => telechargerEtudeJson(etude, { masquerMarge: !voirMarge })}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exporter l'étude (JSON)
            </button>
            <button
              type="button"
              data-testid="calpinage-exporter-pdf"
              onClick={() => telechargerEtudePdf(etude)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-600 px-3 py-2 text-sm font-semibold"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exporter l'étude (PDF)
            </button>
            <button
              type="button"
              data-testid="calpinage-attacher"
              onClick={attacher}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold text-slate-950"
            >
              <Paperclip className="h-4 w-4" aria-hidden />
              Attacher au devis CRM
            </button>
          </div>
          {message ? <p className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">{message}</p> : null}
        </div>

        <aside className="h-fit space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 lg:sticky lg:top-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">Synthèse live</p>
          <p className="font-mono text-3xl font-semibold">{etude.kwc.toFixed(2)} <span className="text-lg text-slate-400">kWc</span></p>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Modules</dt><dd>{etude.modulesActifs}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Production</dt><dd>{kwh(etude.production.productionKwh)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Autoconso.</dt><dd>{pct(etude.production.tauxReel)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Gain an 1</dt><dd>{eur(etude.production.gainAnnuelEur)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Retour</dt><dd>{retour(etude.production.retourAns)}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-slate-400">Reste à charge</dt><dd>{eur(etude.devis.resteAChargeTtc)}</dd></div>
          </dl>
          <p className={`flex items-start gap-2 text-xs ${etude.electrique.ok ? "text-emerald-200" : "text-amber-200"}`}>
            {etude.electrique.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
            {etude.electrique.resume}
          </p>
        </aside>
      </div>
    </section>
  );
}
