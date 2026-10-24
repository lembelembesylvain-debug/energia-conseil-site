import { useMemo, useState } from "react";
import { AlertTriangle, Download, Droplets, FileText, Flame, Gauge, Thermometer } from "lucide-react";
import { lireRoleStocke, peutVoirCoutsInternes } from "../../lib/crm/roles.js";
import { COEFFICIENTS_G, DEPARTEMENTS_CLIMAT, DELTA_T_CHAUDIERE, DELTA_T_PAC, tintParDefaut } from "./calcul";
import { etatInitialPac, evaluerPac } from "./devis";
import { telechargerPacPdf } from "./exportPdf";
import type { ClasseGtb, EnergieChaudiere, EtatPac, IsolationId, MarquePac, ModePac, TypeBatiment, UsageTertiaire } from "./types";

type Props = {
  clientNomInitial?: string;
  dossierId?: string | null;
  /** Marge brute visible pour l'administrateur. */
  afficherMarge?: boolean;
  isAdmin?: boolean;
};

const ETAPES = [
  { id: 1 as const, label: "Bâtiment", icon: Thermometer },
  { id: 2 as const, label: "Architecture", icon: Gauge },
  { id: 3 as const, label: "Hydraulique", icon: Droplets },
  { id: 4 as const, label: "Devis & PDF", icon: FileText },
];

const CHAMP =
  "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400";

function eur(valeur: number) {
  return Math.round(valeur).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function nombreFr(valeur: number, digits = 0) {
  return valeur.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function Nombre({
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  unite,
}: {
  label: string;
  value: number;
  onChange: (valeur: number) => void;
  step?: number;
  min?: number;
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

function SchemaBivalence({
  textBase,
  tint,
  tbiv,
  pDep,
  pPac,
}: {
  textBase: number;
  tint: number;
  tbiv: number | null;
  pDep: number;
  pPac: number;
}) {
  const largeur = 640;
  const hauteur = 220;
  const gauche = 36;
  const droite = 16;
  const haut = 16;
  const bas = 28;
  const tMin = textBase - 2;
  const tMax = Math.max(tint, tMin + 1);
  const pMax = Math.max(pDep, pPac, 1) * 1.2;
  const xOf = (t: number) => gauche + ((t - tMin) / (tMax - tMin)) * (largeur - gauche - droite);
  const yOf = (p: number) => haut + (1 - Math.max(0, p) / pMax) * (hauteur - haut - bas);
  const split = xOf(tbiv ?? textBase);
  const points = Array.from({ length: 25 }, (_, index) => {
    const t = tMin + ((tMax - tMin) * index) / 24;
    const pBat = tint - textBase > 0 ? (pDep * (tint - t)) / (tint - textBase) : 0;
    const pMachine = pPac * (1 + 0.03 * (t - textBase));
    return { t, bat: `${xOf(t)},${yOf(pBat)}`, pac: `${xOf(t)},${yOf(Math.max(0, pMachine))}` };
  });
  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} className="h-56 w-full" role="img" aria-label="Courbe de bivalence">
      <rect x={gauche} y={haut} width={split - gauche} height={hauteur - haut - bas} fill="#78350f" opacity="0.35" />
      <rect x={split} y={haut} width={largeur - droite - split} height={hauteur - haut - bas} fill="#0e7490" opacity="0.28" />
      <line x1={split} y1={haut} x2={split} y2={hauteur - bas} stroke="#fbbf24" strokeDasharray="4 3" />
      <polyline fill="none" stroke="#e2e8f0" strokeWidth="2" points={points.map((point) => point.bat).join(" ")} />
      <polyline fill="none" stroke="#22d3ee" strokeWidth="2.5" points={points.map((point) => point.pac).join(" ")} />
      <text x={gauche} y={hauteur - 8} fill="#94a3b8" fontSize="11">{textBase} °C</text>
      <text x={split} y={haut + 14} fill="#fbbf24" fontSize="11">{tbiv === null ? "" : `Tbiv ${tbiv.toLocaleString("fr-FR")} °C`}</text>
      <text x={largeur - droite} y={hauteur - 8} textAnchor="end" fill="#94a3b8" fontSize="11">{tint} °C</text>
    </svg>
  );
}

export default function PacDimensionnement({ clientNomInitial = "", dossierId = null, afficherMarge, isAdmin }: Props) {
  const voirMarge = isAdmin ?? afficherMarge ?? peutVoirCoutsInternes(lireRoleStocke());
  const [etat, setEtat] = useState<EtatPac>(() => etatInitialPac(clientNomInitial));
  const [etape, setEtape] = useState<(typeof ETAPES)[number]["id"]>(1);
  const etude = useMemo(() => evaluerPac(etat, dossierId), [etat, dossierId]);
  const patch = (partial: Partial<EtatPac>) => setEtat((courant) => ({ ...courant, ...partial }));
  const choisirType = (typeBatiment: TypeBatiment) => {
    patch({
      typeBatiment,
      tint: etat.tintManuelle ? etat.tint : tintParDefaut(typeBatiment),
    });
  };

  return (
    <section
      data-testid="dimensionnement-pac"
      data-pdep={etude.pDepKw}
      data-pac={etude.puissancePacKw}
      data-tbiv={etude.tbiv ?? ""}
      data-debit={etude.debitPacM3h}
      data-tampon={etude.volumeTamponL}
      className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 text-white shadow-lg shadow-slate-950/40"
    >
      <header className="border-b border-white/10 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-5 sm:px-6">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
          ENERGIA CONSEIL IA® · QualiPAC
        </p>
        <h2 className="mt-2 flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
          <Flame className="h-6 w-6 text-amber-300" aria-hidden />
          Dimensionnement PAC & chaufferies hybrides
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Déperditions, relève de chaudière et génie hydraulique. Le chauffage se dimensionne après l'isolation, jamais l'inverse.
        </p>
        <label className="mt-4 block max-w-md">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Foyer</span>
          <input className={CHAMP} value={etat.clientNom} placeholder="Nom du client" onChange={(event) => patch({ clientNom: event.target.value })} />
        </label>
      </header>

      <div className="grid gap-3 border-b border-white/10 px-5 py-4 sm:grid-cols-2 sm:px-6 xl:grid-cols-4">
        <Kpi label="Puissance thermique" valeur={`${nombreFr(etude.pDepKw, 1)} kW`} detail={`PAC ${nombreFr(etude.puissancePacKw, 1)} kW`} />
        <Kpi label="Couverture EnR" valeur={`${Math.round(etude.couvertureAnnuelle * 100)} %`} detail="des kWh annuels" />
        <Kpi label="Économies annuelles" valeur={eur(etude.economieAnnuelleEur)} detail="avant aides" />
        <Kpi label="Temps de retour" valeur={etude.devis.retourAns === null ? "> 25 ans" : `${nombreFr(etude.devis.retourAns, 1)} ans`} detail="reste à charge / économies" />
      </div>

      <div className="flex flex-wrap gap-2 px-5 py-4 sm:px-6" role="tablist" aria-label="Étapes du dimensionnement">
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
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                actif ? "bg-cyan-400 text-slate-950" : "border border-slate-600 text-slate-200"
              }`}
            >
              <Icone className="h-3.5 w-3.5" aria-hidden />
              {item.id}. {item.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-5 px-5 pb-6 sm:px-6">
        {etape === 1 ? (
          <div className="space-y-5" data-testid="pac-etape-batiment">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ["residentiel", "Résidentiel individuel"],
                  ["tertiaire", "Tertiaire"],
                  ["collectif", "Logement collectif"],
                ] as const
              ).map(([id, libelle]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={etat.typeBatiment === id}
                  onClick={() => choisirType(id)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    etat.typeBatiment === id ? "bg-amber-400 text-slate-950" : "border border-slate-600 text-slate-200"
                  }`}
                >
                  {libelle}
                </button>
              ))}
            </div>
            {etat.typeBatiment === "tertiaire" ? (
              <label className="block max-w-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Usage</span>
                <select className={CHAMP} value={etat.usageTertiaire} onChange={(event) => patch({ usageTertiaire: event.target.value as UsageTertiaire })}>
                  <option value="bureaux">Bureaux</option>
                  <option value="commerce">Commerce</option>
                  <option value="entrepot">Entrepôt</option>
                </select>
              </label>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-3">
              <Nombre label="Surface chauffée" unite="m²" value={etat.surfaceM2} min={1} step={1} onChange={(surfaceM2) => patch({ surfaceM2 })} />
              <Nombre label="Hauteur sous plafond" unite="m" value={etat.hauteurM} min={2} step={0.1} onChange={(hauteurM) => patch({ hauteurM })} />
              <div className="rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Volume</p>
                <p className="mt-1 font-mono text-2xl">{nombreFr(etude.volumeM3, 1)} m³</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Niveau d'isolation</span>
                <select className={CHAMP} value={etat.isolation} onChange={(event) => patch({ isolation: event.target.value as IsolationId })}>
                  {(Object.keys(COEFFICIENTS_G) as IsolationId[]).map((id) => (
                    <option key={id} value={id}>
                      {COEFFICIENTS_G[id].libelle} — G = {COEFFICIENTS_G[id].g.toLocaleString("fr-FR")} W/m³.°C
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Département / zone climatique</span>
                <select className={CHAMP} value={etat.departement} onChange={(event) => patch({ departement: event.target.value })}>
                  {DEPARTEMENTS_CLIMAT.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} {item.nom} — Text base {item.textBase} °C — {item.zone}
                    </option>
                  ))}
                </select>
              </label>
              <Nombre
                label="Température de consigne"
                unite="°C"
                value={etat.tint}
                min={16}
                step={0.5}
                onChange={(tint) => patch({ tint, tintManuelle: true })}
              />
            </div>
            <div className="rounded-xl border border-cyan-400/30 bg-slate-900 px-4 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200">Déperditions brutes</p>
              <p className="mt-2 font-mono text-3xl text-white" data-testid="pac-pdep">{nombreFr(etude.pDepKw, 1)} kW</p>
              <p className="mt-2 text-sm text-slate-300">
                P_dep = {nombreFr(etude.volumeM3, 1)} m³ × {etude.g.toLocaleString("fr-FR")} × ({nombreFr(etat.tint, 1)} − ({etude.textBase})) / 1000
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {etude.departementNom} · zone CEE {etude.zone} · écart {nombreFr(etude.deltaK, 1)} K · consigne {etat.typeBatiment === "tertiaire" ? "19 °C tertiaire" : "20 °C logement"} par défaut.
              </p>
            </div>
          </div>
        ) : null}

        {etape === 2 ? (
          <div className="space-y-5" data-testid="pac-etape-architecture">
            <div className="grid gap-3 lg:grid-cols-3">
              {(
                [
                  ["thermo", "PAC 100 % thermodynamique", "Neuf ou rénovation performante. 90 à 100 % des déperditions à Text base, appoint électrique 3 à 9 kW."],
                  ["cascade", "Cascade de PAC tertiaire", "2, 3 ou 4 groupes Inverter, 35 à 100 kW. Master/Slave et rotation des heures compresseurs."],
                  ["hybride", "Hybride : PAC en relève", "Règle d'or AMO. 60 % de P_dep, environ 85 % des kWh. Chaudière conservée sous Tbiv."],
                ] as const
              ).map(([id, titre, detail]) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={etat.mode === id}
                  onClick={() => patch({ mode: id as ModePac })}
                  className={`rounded-xl border px-4 py-3 text-left ${
                    etat.mode === id ? "border-cyan-300 bg-cyan-400/10" : "border-slate-700 bg-slate-900"
                  }`}
                >
                  <p className="text-sm font-semibold">{titre}</p>
                  <p className="mt-1 text-xs text-slate-400">{detail}</p>
                </button>
              ))}
            </div>

            {etat.mode === "thermo" ? (
              <div className="flex flex-wrap gap-2">
                {([0.9, 0.95, 1] as const).map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    aria-pressed={etat.ratioThermo === ratio}
                    onClick={() => patch({ ratioThermo: ratio })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      etat.ratioThermo === ratio ? "bg-cyan-400 text-slate-950" : "border border-slate-600"
                    }`}
                  >
                    {Math.round(ratio * 100)} % à Text base
                  </button>
                ))}
                <p className="w-full text-sm text-slate-300">
                  PAC {nombreFr(etude.puissancePacKw, 1)} kW · appoint électrique étagé {etude.appointElectriqueKw} kW.
                </p>
              </div>
            ) : null}

            {etat.mode === "cascade" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-wrap gap-2">
                  {([2, 3, 4] as const).map((nombre) => (
                    <button
                      key={nombre}
                      type="button"
                      aria-pressed={etat.nombreModules === nombre}
                      onClick={() => patch({ nombreModules: nombre })}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        etat.nombreModules === nombre ? "bg-cyan-400 text-slate-950" : "border border-slate-600"
                      }`}
                    >
                      {nombre} modules
                    </button>
                  ))}
                </div>
                <label className="block">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Marque</span>
                  <select className={CHAMP} value={etat.marque} onChange={(event) => patch({ marque: event.target.value as MarquePac })}>
                    <option value="daikin">Daikin</option>
                    <option value="mitsubishi">Mitsubishi</option>
                    <option value="viessmann">Viessmann</option>
                  </select>
                </label>
                <p className="sm:col-span-2 text-sm text-slate-300">
                  {etude.modules ? `${etude.modules.nombre} × ${etude.modules.unitaireKw} kW = ${etude.modules.totalKw} kW.` : ""} Régulation Master/Slave, rotation des heures compresseurs. Plage de travail 36 à 400 kW.
                </p>
              </div>
            ) : null}

            {etat.mode === "hybride" ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-2">
                  {(["gaz", "fioul"] as const).map((energie) => (
                    <button
                      key={energie}
                      type="button"
                      aria-pressed={etat.energieChaudiere === energie}
                      onClick={() => patch({ energieChaudiere: energie as EnergieChaudiere })}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${
                        etat.energieChaudiere === energie ? "bg-amber-400 text-slate-950" : "border border-slate-600"
                      }`}
                    >
                      Chaudière {energie}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-200">Point de bivalence</p>
                  <p className="mt-1 font-mono text-2xl" data-testid="pac-tbiv">{etude.tbiv === null ? "—" : `${nombreFr(etude.tbiv, 1)} °C`}</p>
                  <p className="mt-1 text-xs text-amber-50">
                    PAC {nombreFr(etude.puissancePacKw, 1)} kW, soit 60 % de P_dep. Chaudière conservée à {nombreFr(etude.puissanceChaudiereKw, 1)} kW sous Tbiv. 85 % des kWh annuels.
                  </p>
                </div>
              </div>
            ) : null}

            {etude.alerteAppoint ? (
              <p className="flex gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 px-3 py-2 text-sm text-amber-50">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                {etude.alerteAppoint}
              </p>
            ) : null}

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
              <SchemaBivalence textBase={etude.textBase} tint={etat.tint} tbiv={etude.tbiv} pDep={etude.pDepKw} pPac={etude.puissancePacKw} />
              <p className="mt-2 text-xs text-slate-400">
                Trait clair : déperditions. Trait cyan : puissance PAC (+3 % par degré). Zone or : en dessous de Tbiv. Zone cyan : la PAC couvre le besoin.
              </p>
            </div>
          </div>
        ) : null}

        {etape === 3 ? (
          <div className="space-y-4" data-testid="pac-etape-hydraulique">
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Débit primaire PAC · ΔT {DELTA_T_PAC} K</p>
                <p className="mt-1 font-mono text-2xl" data-testid="pac-debit">{nombreFr(etude.debitPacM3h, 2)} m³/h</p>
                <p className="mt-1 text-xs text-slate-400">Q = {nombreFr(etude.puissancePacKw, 1)} / (1,163 × {DELTA_T_PAC})</p>
              </article>
              <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Même puissance en chaudière · ΔT {DELTA_T_CHAUDIERE} K</p>
                <p className="mt-1 font-mono text-2xl">{nombreFr(etude.debitChaudiereM3h, 2)} m³/h</p>
                <p className="mt-1 text-xs text-slate-400">Soit environ {etude.debitChaudiereM3h > 0 ? nombreFr(etude.debitPacM3h / etude.debitChaudiereM3h, 1) : "—"} fois moins de débit.</p>
              </article>
              <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Ballon tampon anti-court-cycle</p>
                <p className="mt-1 font-mono text-2xl" data-testid="pac-tampon">{nombreFr(etude.volumeTamponStandardL)} L</p>
                <p className="mt-1 text-xs text-slate-400">Minimum {nombreFr(etude.volumeTamponL)} L, soit 20 L × {nombreFr(etude.puissancePacKw, 1)} kW.</p>
              </article>
              <article className="rounded-xl border border-slate-700 bg-slate-900 p-4">
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Découplage · règle des 3D</p>
                <p className="mt-1 font-mono text-2xl">DN {etude.bouteille.dn}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {etude.bouteille.preconisation}. Vitesse {nombreFr(etude.bouteille.vitesseMs, 2)} m/s, entraxe {etude.bouteille.entraxeMm} mm.
                </p>
              </article>
            </div>
            <p className="flex gap-2 rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Une chaudière au même kilowatt travaille à ΔT 15 K. Reprendre ses tubes pour une PAC à ΔT 5 K divise le débit utile par trois : haute pression, court-cycle, compresseur en sécurité.
            </p>
          </div>
        ) : null}

        {etape === 4 ? (
          <div className="space-y-4" data-testid="pac-etape-devis">
            {etat.typeBatiment === "tertiaire" ? (
              <div className="flex flex-wrap gap-2">
                <span className="text-xs uppercase tracking-wide text-slate-400">TVA tertiaire</span>
                {([0.1, 0.2] as const).map((taux) => (
                  <button
                    key={taux}
                    type="button"
                    aria-pressed={etat.tauxTvaTertiaire === taux}
                    onClick={() => patch({ tauxTvaTertiaire: taux })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      etat.tauxTvaTertiaire === taux ? "bg-cyan-400 text-slate-950" : "border border-slate-600"
                    }`}
                  >
                    {Math.round(taux * 100)} %
                  </button>
                ))}
                <span className="text-xs uppercase tracking-wide text-slate-400">GTB</span>
                {(["B", "A"] as const).map((classe) => (
                  <button
                    key={classe}
                    type="button"
                    aria-pressed={etat.classeGtb === classe}
                    onClick={() => patch({ classeGtb: classe as ClasseGtb })}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                      etat.classeGtb === classe ? "bg-amber-400 text-slate-950" : "border border-slate-600"
                    }`}
                  >
                    Classe {classe}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">TVA 5,5 % rénovation énergétique du logement. Le tertiaire se chiffre à 10 ou 20 %.</p>
            )}
            <p className="font-mono text-sm text-cyan-200">{etude.devis.numero}</p>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900 text-[11px] uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-3 py-2">Désignation</th>
                    <th className="px-3 py-2">Qté</th>
                    <th className="px-3 py-2">PU HT</th>
                    <th className="px-3 py-2">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {etude.devis.lignes.map((ligne) => (
                    <tr key={ligne.id} className="border-t border-slate-800">
                      <td className="px-3 py-2">{ligne.designation}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{nombreFr(ligne.quantite, ligne.quantite % 1 === 0 ? 0 : 1)} {ligne.unite}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{eur(ligne.puHt)}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{eur(ligne.totalHt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <dl className="grid gap-2 text-sm sm:grid-cols-2">
              <LigneRecap label="Fournitures HT" valeur={eur(etude.devis.fournituresHt)} />
              <LigneRecap label="Pose et ingénierie HT" valeur={eur(etude.devis.ingenierieHt)} />
              <LigneRecap label="Total HT" valeur={eur(etude.devis.totalHt)} />
              <LigneRecap label={`TVA ${nombreFr(etude.devis.tauxTva * 100, etude.devis.tauxTva < 0.1 ? 1 : 0)} %`} valeur={eur(etude.devis.tvaEur)} />
              <LigneRecap label="Total TTC" valeur={eur(etude.devis.totalTtc)} />
              {etude.devis.aides.map((aide) => (
                <div key={aide.id} className="rounded-xl border border-slate-800 px-3 py-2 sm:col-span-2">
                  <div className="flex justify-between gap-3">
                    <dt>{aide.libelle}</dt>
                    <dd>{aide.eligible ? `− ${eur(aide.montantEur)}` : "non éligible"}</dd>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">{aide.detail}</p>
                </div>
              ))}
              <div className="flex justify-between gap-3 rounded-xl border border-cyan-400/40 bg-cyan-400/10 px-3 py-2 sm:col-span-2" data-testid="pac-rac">
                <dt className="font-semibold">Reste à charge TTC</dt>
                <dd className="font-mono text-lg">{eur(etude.devis.resteAChargeTtc)}</dd>
              </div>
            </dl>
            {voirMarge ? (
              <div className="rounded-xl border border-amber-400/50 bg-amber-400/10 px-4 py-3 text-sm text-amber-50" data-testid="pac-marge">
                <p className="font-semibold">Marge brute interne — visible uniquement pour l'administrateur</p>
                <p className="mt-1">
                  {eur(etude.devis.margeBruteHt)} HT ({Math.round(etude.devis.margeBrutePct * 100)} % du HT). Coût d'achat {eur(etude.devis.coutAchatHt)} HT.
                  La pose et le Consuel sont comptés à marge nulle.
                </p>
              </div>
            ) : null}
            <p className="text-xs text-slate-500">
              Aides CEE 2026, estimation à titre indicatif. ROI {etude.devis.retourAns === null ? "au-delà de 25 ans" : `${nombreFr(etude.devis.retourAns, 1)} ans`} sur le reste à charge. Avis établi par Julia, 2026.
            </p>
            <button
              type="button"
              data-testid="pac-exporter-pdf"
              onClick={() => telechargerPacPdf(etude, etat.clientNom, etat.tint)}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
            >
              <Download className="h-4 w-4" aria-hidden />
              Exporter le devis PDF
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Kpi({ label, valeur, detail }: { label: string; valeur: string; detail: string }) {
  return (
    <article className="rounded-xl border border-slate-700 border-t-2 border-t-cyan-400 bg-slate-900 px-3 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-xl text-white">{valeur}</p>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </article>
  );
}

function LigneRecap({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex justify-between gap-3 rounded-xl border border-slate-800 px-3 py-2">
      <dt>{label}</dt>
      <dd>{valeur}</dd>
    </div>
  );
}
