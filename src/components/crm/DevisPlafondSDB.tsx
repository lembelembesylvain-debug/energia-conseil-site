/**
 * Devis Contractant Général — reprise intégrale d'un plafond de salle de bain sinistré.
 * Chiffrage rapide, zones de déplacement, marge interne (hors impression) et feuille A4.
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bath,
  Calculator,
  CheckCircle,
  Paintbrush,
  Printer,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { BRANDING } from "../../lib/branding";
import { lireRoleStocke, peutVoirCoutsInternes } from "../../lib/crm/roles.js";

export const REFERENCE_PLAFOND_SDB = "DEV-2026-PLAFOND-SDB";

const PU_PEINTURE_HT = 35;
const FORFAIT_PROTECTION_HT = 110;
const FORFAIT_PLATRERIE_HT = 260;
const FORFAIT_NETTOYAGE_HT = 60;

/** Débours internes. Le cas par défaut (6 m², zone 03, tous postes) tombe à 500 € HT. */
const COUT_PROTECTION_HT = 45;
const COUT_PLATRERIE_HT = 175;
const COUT_PEINTURE_M2_HT = 15;
const COUT_NETTOYAGE_HT = 30;

export const ZONES_DEPLACEMENT = [
  { id: "local", label: "Local (Rayon < 30 km)", ht: 60, coutHt: 25 },
  { id: "regional", label: "Régional (Rayon 30 à 80 km)", ht: 150, coutHt: 70 },
  {
    id: "grand",
    label: "Grand Déplacement Zone 03 / Auvergne (Trajet > 150 km - ex: Mâcon ➔ Allier)",
    ht: 300,
    coutHt: 160,
    detail: "Liaison 71 Mâcon → 03 Allier, environ 400 km aller-retour, carburant et péage.",
  },
] as const;

export type ZoneDeplacementId = (typeof ZONES_DEPLACEMENT)[number]["id"];
export type TauxTvaPlafond = 0.1 | 0.2;

export type SaisiePlafondSdb = {
  client: string;
  adresse: string;
  piece: string;
  surfaceM2: number;
  protection: boolean;
  platrerie: boolean;
  peinture: boolean;
  nettoyage: boolean;
  zone: ZoneDeplacementId;
  tauxTva: TauxTvaPlafond;
};

export type LigneDevisPlafond = {
  id: string;
  numero: number;
  designation: string;
  specification: string;
  quantite: number;
  unite: string;
  puHt: number;
  totalHt: number;
};

export type ResultatDevisPlafond = {
  lignes: LigneDevisPlafond[];
  totalHt: number;
  tva: number;
  totalTtc: number;
  deboursHt: number;
  margeHt: number;
  margePct: number;
  echeances: { signature: number; miChantier: number; reception: number };
  zoneLabel: string;
};

const SAISIE_DEFAUT: SaisiePlafondSdb = {
  client: "Philippe MURAT",
  adresse: "6 Route d'Évaux-les-Bains, 03420 Marcillat-en-Combraille",
  piece: "Plafond Salle de Bain",
  surfaceM2: 6,
  protection: true,
  platrerie: true,
  peinture: true,
  nettoyage: true,
  zone: "grand",
  tauxTva: 0.1,
};

const PRINT_CSS = `
  .devis-plafond-sheet {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  @page {
    size: A4 portrait;
    margin: 0;
  }
  @media print {
    html, body, #root {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      height: 297mm !important;
      max-height: 297mm !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    body * { visibility: hidden !important; }
    .devis-plafond-sheet,
    .devis-plafond-sheet * { visibility: visible !important; }
    .devis-plafond-no-print { display: none !important; }
    .devis-plafond-sheet {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      box-shadow: none !important;
      overflow: hidden !important;
      transform: none !important;
    }
    .devis-plafond-echelle { height: auto !important; }
  }
`;

function arrondi(montant: number) {
  return Math.round((montant + Number.EPSILON) * 100) / 100;
}

export function eur(montant: number) {
  return (
    montant.toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

function pct(valeur: number) {
  return (
    valeur.toLocaleString("fr-FR", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }) + " %"
  );
}

function zoneParId(id: ZoneDeplacementId) {
  return ZONES_DEPLACEMENT.find((zone) => zone.id === id) ?? ZONES_DEPLACEMENT[2];
}

export function calculerDevisPlafondSdb(saisie: SaisiePlafondSdb): ResultatDevisPlafond {
  const surface = Math.max(0, Number.isFinite(saisie.surfaceM2) ? saisie.surfaceM2 : 0);
  const zone = zoneParId(saisie.zone);
  const brouillon: Omit<LigneDevisPlafond, "numero">[] = [];
  let deboursHt = 0;

  if (saisie.protection) {
    brouillon.push({
      id: "protection",
      designation: "Protection intégrale de la pièce d'eau",
      specification: "Bâchage étanche du sol, des carrelages muraux et des sanitaires.",
      quantite: 1,
      unite: "fft",
      puHt: FORFAIT_PROTECTION_HT,
      totalHt: FORFAIT_PROTECTION_HT,
    });
    deboursHt += COUT_PROTECTION_HT;
  }
  if (saisie.platrerie) {
    brouillon.push({
      id: "platrerie",
      designation: "Reprise plâtrerie et greffe BA13 hydrofuge",
      specification:
        "Découpe de la zone arrachée, renforts en sous-face, greffe de plaque verte hydro, calicot armé et enduit en 3 passes.",
      quantite: 1,
      unite: "fft",
      puHt: FORFAIT_PLATRERIE_HT,
      totalHt: FORFAIT_PLATRERIE_HT,
    });
    deboursHt += COUT_PLATRERIE_HT;
  }
  if (saisie.peinture) {
    const totalHt = arrondi(surface * PU_PEINTURE_HT);
    brouillon.push({
      id: "peinture",
      designation: "Mise en peinture intégrale anti-humidité",
      specification:
        "Ponçage, impression hydrofuge et 2 couches de peinture spéciale pièces humides, finition velours blanc.",
      quantite: surface,
      unite: "m²",
      puHt: PU_PEINTURE_HT,
      totalHt,
    });
    deboursHt += arrondi(surface * COUT_PEINTURE_M2_HT);
  }
  if (saisie.nettoyage) {
    brouillon.push({
      id: "nettoyage",
      designation: "Nettoyage de fin de chantier et repli",
      specification: "Repli du bâchage, nettoyage de la pièce d'eau et évacuation des déchets de plâtre.",
      quantite: 1,
      unite: "fft",
      puHt: FORFAIT_NETTOYAGE_HT,
      totalHt: FORFAIT_NETTOYAGE_HT,
    });
    deboursHt += COUT_NETTOYAGE_HT;
  }

  brouillon.push({
    id: "deplacement",
    designation:
      zone.id === "grand"
        ? "Grand déplacement Zone 03 / Auvergne"
        : `Déplacement — ${zone.label}`,
    specification:
      zone.id === "grand"
        ? "Trajet supérieur à 150 km. Liaison 71 Mâcon → 03 Allier, environ 400 km aller-retour."
        : zone.label,
    quantite: 1,
    unite: "fft",
    puHt: zone.ht,
    totalHt: zone.ht,
  });
  deboursHt += zone.coutHt;

  const lignes = brouillon.map((ligne, index) => ({ ...ligne, numero: index + 1 }));
  const totalHt = arrondi(lignes.reduce((somme, ligne) => somme + ligne.totalHt, 0));
  const tva = arrondi(totalHt * saisie.tauxTva);
  const totalTtc = arrondi(totalHt + tva);
  const debours = arrondi(deboursHt);
  const margeHt = arrondi(totalHt - debours);
  const margePct = totalHt > 0 ? (margeHt / totalHt) * 100 : 0;
  const signature = arrondi(totalTtc * 0.3);
  const miChantier = arrondi(totalTtc * 0.4);
  const reception = arrondi(totalTtc - signature - miChantier);

  return {
    lignes,
    totalHt,
    tva,
    totalTtc,
    deboursHt: debours,
    margeHt,
    margePct,
    echeances: { signature, miChantier, reception },
    zoneLabel: zone.label,
  };
}

function quantiteAffichee(ligne: LigneDevisPlafond) {
  if (ligne.unite === "m²") {
    return ligne.quantite.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
  }
  return "1";
}

type Props = {
  /** Carte de marge. Sans prop : réservée à la session administrateur propriétaire. */
  afficherMargeInterne?: boolean;
  /** `page` ajoute le fond plein écran de la route /devis/plafond-sdb. */
  cadre?: "crm" | "page";
};

export default function DevisPlafondSDB({ afficherMargeInterne, cadre = "page" }: Props) {
  const margeVisible = afficherMargeInterne ?? peutVoirCoutsInternes(lireRoleStocke());
  const [client, setClient] = useState(SAISIE_DEFAUT.client);
  const [adresse, setAdresse] = useState(SAISIE_DEFAUT.adresse);
  const [piece, setPiece] = useState(SAISIE_DEFAUT.piece);
  const [surfaceTexte, setSurfaceTexte] = useState(String(SAISIE_DEFAUT.surfaceM2));
  const [protection, setProtection] = useState(SAISIE_DEFAUT.protection);
  const [platrerie, setPlatrerie] = useState(SAISIE_DEFAUT.platrerie);
  const [peinture, setPeinture] = useState(SAISIE_DEFAUT.peinture);
  const [nettoyage, setNettoyage] = useState(SAISIE_DEFAUT.nettoyage);
  const [zone, setZone] = useState<ZoneDeplacementId>(SAISIE_DEFAUT.zone);
  const [tauxTva, setTauxTva] = useState<TauxTvaPlafond>(SAISIE_DEFAUT.tauxTva);

  const surfaceM2 = Math.max(0, Number(surfaceTexte.replace(",", ".")) || 0);
  const resultat = useMemo(
    () =>
      calculerDevisPlafondSdb({
        client,
        adresse,
        piece,
        surfaceM2,
        protection,
        platrerie,
        peinture,
        nettoyage,
        zone,
        tauxTva,
      }),
    [adresse, client, nettoyage, peinture, piece, platrerie, protection, surfaceM2, tauxTva, zone],
  );

  const dateDevis = new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const tauxLabel = tauxTva === 0.1 ? "10 %" : "20 %";
  const dansCible = resultat.margePct >= 45 && resultat.margePct <= 50;
  const apercuRef = useRef<HTMLDivElement>(null);
  const [echelle, setEchelle] = useState(1);

  useEffect(() => {
    const zone = apercuRef.current;
    if (!zone) return;
    const mesurer = () => {
      const largeurFeuille = (210 * 96) / 25.4;
      const disponible = zone.clientWidth;
      setEchelle(disponible > 0 ? Math.min(1, disponible / largeurFeuille) : 1);
    };
    mesurer();
    const observer = new ResizeObserver(mesurer);
    observer.observe(zone);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      data-testid="module-devis-plafond-sdb"
      className={`text-[#102a43] ${cadre === "page" ? "min-h-screen bg-slate-950 px-4 py-6 sm:px-6" : ""}`}
    >
      <style>{PRINT_CSS}</style>
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="devis-plafond-no-print space-y-4 rounded-2xl border border-[#1a5c2e]/40 bg-[#102a43] p-4 text-slate-100 shadow-lg sm:p-5">
          <header className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#1a5c2e] text-[#f9c74f]">
              <Bath className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9c74f]">
                Contractant Général
              </p>
              <h2 className="text-lg font-semibold text-white">Plafond salle de bain sinistré</h2>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                Chiffrage en direct. L&apos;aperçu de droite est la feuille A4 remise au client.
              </p>
            </div>
          </header>

          <fieldset className="space-y-3">
            <legend className="text-[11px] font-semibold uppercase tracking-wide text-[#f9c74f]">
              Identité client et chantier
            </legend>
            <label className="block text-xs text-slate-300">
              Nom et prénom
              <input
                value={client}
                onChange={(event) => setClient(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#f9c74f]"
                autoComplete="name"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Adresse du chantier
              <textarea
                value={adresse}
                onChange={(event) => setAdresse(event.target.value)}
                rows={2}
                className="mt-1 w-full resize-y rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#f9c74f]"
              />
            </label>
            <label className="block text-xs text-slate-300">
              Pièce
              <input
                value={piece}
                onChange={(event) => setPiece(event.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#f9c74f]"
              />
            </label>
          </fieldset>

          <label className="block text-xs text-slate-300">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#f9c74f]">
              <Paintbrush className="h-3.5 w-3.5" aria-hidden />
              Surface plafond (m²)
            </span>
            <input
              type="number"
              min={0}
              step={0.5}
              inputMode="decimal"
              value={surfaceTexte}
              onChange={(event) => setSurfaceTexte(event.target.value)}
              data-testid="devis-plafond-surface"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#f9c74f]"
            />
            <span className="mt-1 block text-[11px] text-slate-400">
              Peinture : {eur(PU_PEINTURE_HT)} HT / m², impression comprise et 2 couches de finition.
            </span>
          </label>

          <fieldset className="space-y-2">
            <legend className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-[#f9c74f]">
              Postes de travaux
            </legend>
            <PosteToggle
              actif={protection}
              onChange={setProtection}
              titre="Protection intégrale de la pièce d'eau"
              detail={`Forfait ${eur(FORFAIT_PROTECTION_HT)} HT`}
              icone={<ShieldCheck className="h-4 w-4" aria-hidden />}
            />
            <PosteToggle
              actif={platrerie}
              onChange={setPlatrerie}
              titre="Reprise plâtrerie et greffe BA13 hydrofuge"
              detail={`Forfait ${eur(FORFAIT_PLATRERIE_HT)} HT`}
              icone={<Bath className="h-4 w-4" aria-hidden />}
            />
            <PosteToggle
              actif={peinture}
              onChange={setPeinture}
              titre="Mise en peinture intégrale anti-humidité"
              detail={`${eur(arrondi(surfaceM2 * PU_PEINTURE_HT))} HT (${surfaceM2.toLocaleString("fr-FR")} m² × 35,00 €)`}
              icone={<Paintbrush className="h-4 w-4" aria-hidden />}
            />
            <PosteToggle
              actif={nettoyage}
              onChange={setNettoyage}
              titre="Nettoyage fin de chantier et repli"
              detail={`Forfait ${eur(FORFAIT_NETTOYAGE_HT)} HT`}
              icone={<CheckCircle className="h-4 w-4" aria-hidden />}
            />
          </fieldset>

          <label className="block text-xs text-slate-300">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#f9c74f]">
              <Truck className="h-3.5 w-3.5" aria-hidden />
              Zone de déplacement
            </span>
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value as ZoneDeplacementId)}
              data-testid="devis-plafond-zone"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#f9c74f]"
            >
              {ZONES_DEPLACEMENT.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — {eur(item.ht)} HT
                </option>
              ))}
            </select>
          </label>

          <label className="block text-xs text-slate-300">
            Taux de TVA
            <select
              value={String(tauxTva)}
              onChange={(event) => setTauxTva(event.target.value === "0.2" ? 0.2 : 0.1)}
              data-testid="devis-plafond-tva"
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-white outline-none focus:border-[#f9c74f]"
            >
              <option value="0.1">10 % — rénovation d&apos;un logement de plus de 2 ans</option>
              <option value="0.2">20 % — taux normal</option>
            </select>
          </label>

          {margeVisible ? (
            <aside
              data-testid="devis-plafond-marge-carte"
              className="devis-plafond-no-print rounded-xl border border-[#f9c74f]/50 bg-[#0c1c2e] p-4"
            >
              <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#f9c74f]">
                <Calculator className="h-3.5 w-3.5" aria-hidden />
                Gestion privée — chef d&apos;entreprise
              </p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
                Masquée à l&apos;impression. Débours estimés artisan Momo / peintre, carburant et péage.
              </p>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-slate-400">Débours sous-traitance estimés</dt>
                  <dd data-testid="devis-plafond-debours" className="font-semibold tabular-nums text-white">
                    {eur(resultat.deboursHt)} HT
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3">
                  <dt className="text-slate-400">Prix vendu client</dt>
                  <dd className="text-right font-semibold tabular-nums text-white">
                    <span data-testid="devis-plafond-vendu-ht">{eur(resultat.totalHt)} HT</span>
                    <span className="mt-0.5 block text-xs font-medium text-slate-300">
                      {eur(resultat.totalTtc)} TTC
                    </span>
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-white/10 pt-2">
                  <dt className="text-[#f9c74f]">Marge nette ENERGIA CONSEIL IA®</dt>
                  <dd className="text-right">
                    <span
                      data-testid="devis-plafond-marge"
                      className="block font-semibold tabular-nums text-[#f9c74f]"
                    >
                      {eur(resultat.margeHt)}
                    </span>
                    <span
                      data-testid="devis-plafond-marge-pct"
                      className={`mt-0.5 inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        dansCible ? "bg-[#1a5c2e] text-[#f9c74f]" : "bg-amber-500/20 text-amber-100"
                      }`}
                    >
                      +{pct(resultat.margePct)}
                      {dansCible ? " · cible +45 % à +50 %" : ""}
                    </span>
                  </dd>
                </div>
              </dl>
            </aside>
          ) : (
            <p className="devis-plafond-no-print rounded-xl border border-white/10 px-3 py-2 text-[11px] leading-relaxed text-slate-400">
              La marge nette du Contractant Général est réservée à la session Administrateur
              propriétaire. Elle ne figure pas sur la feuille client.
            </p>
          )}
        </section>

        <section className="min-w-0">
          <div className="devis-plafond-no-print mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-slate-400">
              Aperçu A4 officiel · {REFERENCE_PLAFOND_SDB}
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              data-testid="devis-plafond-imprimer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a5c2e] px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#2d8a4e]"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer / Exporter PDF
            </button>
          </div>
          <p className="devis-plafond-no-print mb-3 text-[11px] leading-relaxed text-slate-500">
            Dans la fenêtre d&apos;impression : destination « Enregistrer au format PDF », format A4,
            marges Aucune, graphiques d&apos;arrière-plan activés.
          </p>

          <div ref={apercuRef} className="pb-6">
            <div className="devis-plafond-echelle" style={{ height: `calc(297mm * ${echelle})` }}>
            <article
              className="devis-plafond-sheet mx-auto flex min-h-[297mm] w-[210mm] origin-top-left flex-col bg-white px-[12mm] py-[10mm] text-[#102a43] shadow-xl"
              style={{ transform: `scale(${echelle})` }}
            >
              <header className="border-b-[3px] border-[#1a5c2e] pb-[3mm]">
                <div className="flex items-start justify-between gap-[6mm]">
                  <div className="min-w-0">
                    <div className="flex items-center gap-[3mm]">
                      <img
                        src="/logo.png"
                        alt="ENERGIA CONSEIL IA®"
                        className="h-[14mm] w-auto object-contain object-left"
                      />
                      <div>
                        <p className="text-[13pt] font-extrabold leading-none tracking-wide text-[#1a5c2e]">
                          ENERGIA CONSEIL IA®
                        </p>
                        <p className="mt-[1mm] text-[7.5pt] text-slate-600">
                          {BRANDING.slogan} · Marque déposée INPI n°{BRANDING.inpi} · Bureau
                          d&apos;études &amp; AMO · Contractant Général
                        </p>
                      </div>
                    </div>
                    <p className="mt-[2mm] text-[7.5pt] leading-snug text-slate-600">
                      {BRANDING.forme} au capital de {BRANDING.capital} — {BRANDING.siege}
                      <br />
                      SIRET {BRANDING.siretAffiche} — RCS {BRANDING.rcsAffiche} — TVA {BRANDING.tva}
                      <br />
                      {BRANDING.telephone} — {BRANDING.email} — {BRANDING.site}
                    </p>
                  </div>
                  <div className="w-[58mm] shrink-0 rounded-md bg-[#102a43] px-[3mm] py-[2.5mm] text-right text-[8pt] leading-snug text-white">
                    <p className="text-[11pt] font-extrabold tracking-wide text-[#f9c74f]">DEVIS</p>
                    <p className="mt-[1mm]">
                      N° {REFERENCE_PLAFOND_SDB}
                      <br />
                      Date : {dateDevis}
                      <br />
                      Validité : 3 mois
                      <br />
                      Page 1 / 1
                    </p>
                  </div>
                </div>
                <div className="mt-[3mm] bg-[#1a5c2e] px-[3mm] py-[1.8mm] text-[9pt] font-bold tracking-wide text-white uppercase">
                  Reprise intégrale d&apos;un plafond de salle de bain sinistré
                </div>
                <div className="h-[1.2mm] bg-[#f9c74f]" />
              </header>

              <section className="mt-[3.5mm] grid grid-cols-2 gap-[4mm] text-[8.5pt]">
                <div className="rounded border border-slate-200 px-[3mm] py-[2mm]">
                  <p className="text-[7pt] font-semibold uppercase tracking-wide text-[#2d8a4e]">
                    Client
                  </p>
                  <p className="mt-[1mm] font-semibold">{client || "—"}</p>
                  <p className="text-slate-600">Interlocuteur commercial : DAMIEN — 06 72 68 09 68</p>
                </div>
                <div className="rounded border border-slate-200 px-[3mm] py-[2mm]">
                  <p className="text-[7pt] font-semibold uppercase tracking-wide text-[#2d8a4e]">
                    Chantier
                  </p>
                  <p className="mt-[1mm] whitespace-pre-line">{adresse || "—"}</p>
                  <p className="font-medium">Pièce : {piece || "—"}</p>
                </div>
              </section>

              <p className="mt-[3mm] text-[8pt] leading-snug text-slate-700">
                Placo arraché, rebouchage hydrofuge, ponçage et peinture anti-humidité. Marché de
                travaux clé en main, ENERGIA CONSEIL IA® Contractant Général. Ordre d&apos;exécution
                impératif : protection, plâtrerie, peinture, nettoyage.
              </p>

              <table className="mt-[3mm] w-full border-collapse text-[8pt]">
                <thead>
                  <tr className="bg-[#102a43] text-left text-[7pt] uppercase tracking-wide text-white">
                    <th className="px-[1.5mm] py-[1.4mm] font-semibold">N°</th>
                    <th className="px-[1.5mm] py-[1.4mm] font-semibold">Désignation</th>
                    <th className="px-[1.5mm] py-[1.4mm] text-right font-semibold">Qté</th>
                    <th className="px-[1.5mm] py-[1.4mm] font-semibold">Unité</th>
                    <th className="px-[1.5mm] py-[1.4mm] text-right font-semibold">PU HT</th>
                    <th className="px-[1.5mm] py-[1.4mm] text-right font-semibold">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {resultat.lignes.map((ligne) => (
                    <tr key={ligne.id} className="border-b border-slate-200 align-top">
                      <td className="px-[1.5mm] py-[1.6mm] font-semibold text-[#1a5c2e]">
                        {ligne.numero}
                      </td>
                      <td className="px-[1.5mm] py-[1.6mm]">
                        <p className="font-semibold">{ligne.designation}</p>
                        <p className="text-[7pt] leading-snug text-slate-600">{ligne.specification}</p>
                      </td>
                      <td className="px-[1.5mm] py-[1.6mm] text-right tabular-nums">
                        {quantiteAffichee(ligne)}
                      </td>
                      <td className="px-[1.5mm] py-[1.6mm]">{ligne.unite}</td>
                      <td className="px-[1.5mm] py-[1.6mm] text-right tabular-nums">
                        {eur(ligne.puHt)}
                      </td>
                      <td className="px-[1.5mm] py-[1.6mm] text-right font-semibold tabular-nums">
                        {eur(ligne.totalHt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-[3mm] ml-auto w-[78mm] text-[8.5pt]">
                <div className="flex justify-between border-b border-slate-200 py-[1mm]">
                  <span>Total HT</span>
                  <span data-testid="devis-plafond-total-ht" className="font-semibold tabular-nums">
                    {eur(resultat.totalHt)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-200 py-[1mm]">
                  <span>TVA {tauxLabel}</span>
                  <span className="tabular-nums">{eur(resultat.tva)}</span>
                </div>
                <div className="mt-[1mm] flex justify-between bg-[#1a5c2e] px-[2mm] py-[1.5mm] font-bold text-white">
                  <span>Total TTC</span>
                  <span data-testid="devis-plafond-total-ttc" className="tabular-nums">
                    {eur(resultat.totalTtc)}
                  </span>
                </div>
              </div>

              <section className="mt-[3mm] text-[7pt] leading-snug text-slate-700">
                <p className="font-semibold text-[#102a43]">
                  Règlement — déblocage 30 / 40 / 30
                </p>
                <p>
                  30 % à la signature ({eur(resultat.echeances.signature)}) · 40 % en cours de
                  chantier après validation de Sylvain LEMBELEMBE ({eur(resultat.echeances.miChantier)}
                  ) · 30 % à la réception ({eur(resultat.echeances.reception)}). Paiement par
                  déblocage progressif 30/40/30 : 30 % à la signature, 40 % mi-chantier après
                  validation de Sylvain LEMBELEMBE (AMO ENERGIA-CONSEIL IA®), 30 % à réception.
                </p>
                <p className="mt-[1mm]">
                  Aides financières 2026 (estimation à titre indicatif) : non sollicitées sur ce
                  devis (0 €). Aides à valider selon revenus réels du client et éligibilité en
                  vigueur. Montants définitifs après instruction ANAH et CEE. TVA {tauxLabel}
                  {tauxTva === 0.1
                    ? " au titre de la rénovation d'un logement achevé depuis plus de 2 ans."
                    : " au taux normal."}{" "}
                  Éco-PTZ et prêt travaux : FABIEN — VIVONS COURTIER — 06 71 19 96 45, sur demande.
                </p>
              </section>

              <aside className="mt-[2.5mm] border-l-4 border-[#f97316] bg-[#fff7ed] px-[3mm] py-[2mm] text-[7pt] leading-snug text-[#102a43]">
                <p className="font-semibold">Avis juridique — Julia</p>
                <p className="mt-[0.8mm]">
                  Conformité : marché de travaux Contractant Général, ordre d&apos;exécution
                  impératif, cumul d&apos;aides sans objet (aucune aide chiffrée). Clause Julia
                  Protection Aides : responsabilité ENERGIA plafonnée à 2 000 € en cas d&apos;écart
                  &gt; 10 % imputable à une erreur prouvée d&apos;ENERGIA ; 0 % si erreur client ou
                  décision ANAH/CEE. Le client certifie l&apos;exactitude des informations fournies.
                  Conditions référencées : réserve de propriété, pénalités de retard, force majeure,
                  chantier propre, assurances, RGPD, médiation puis tribunaux de Lyon.
                </p>
                <p className="mt-[1mm] font-medium">
                  Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – Mars 2026
                </p>
              </aside>

              <div className="mt-[3mm] grid grid-cols-2 gap-[6mm] text-[8pt]">
                <div>
                  <p className="font-semibold">Bon pour accord</p>
                  <p className="mt-[1mm] text-[7.5pt] leading-snug text-slate-600">
                    Je soussigné(e) {client || "………………"}, accepte le présent devis et mandate
                    ENERGIA-CONSEIL IA® pour la coordination du chantier.
                  </p>
                  <p className="mt-[2mm]">Fait à …………………………, le ………………</p>
                  <p className="mt-[3mm]">Signature client : …………………………</p>
                </div>
                <div>
                  <p className="font-semibold">Pour ENERGIA CONSEIL IA®</p>
                  <p className="mt-[1mm] text-[7.5pt] text-slate-600">
                    Sylvain LEMBELEMBE — Contractant Général
                    <br />
                    {BRANDING.telephone}
                  </p>
                  <p className="mt-[6mm]">Signature : …………………………</p>
                </div>
              </div>

              <footer className="mt-auto border-t border-slate-200 pt-[2mm] text-[6.4pt] leading-snug text-slate-500">
                Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 · DAMIEN (Commercial) 06 72 68 09 68 ·
                FABIEN – VIVONS COURTIER 06 71 19 96 45 · Julia (Juriste) · MAR Antoine BARATIER –
                Cabinet C2ET. Document confidentiel — année de référence 2026. {BRANDING.nom} —{" "}
                {BRANDING.siretAffiche} — {BRANDING.siege}.
              </footer>
            </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function PosteToggle({
  actif,
  onChange,
  titre,
  detail,
  icone,
}: {
  actif: boolean;
  onChange: (actif: boolean) => void;
  titre: string;
  detail: string;
  icone: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 ${
        actif ? "border-[#2d8a4e] bg-[#1a5c2e]/50" : "border-white/10 bg-slate-950/30"
      }`}
    >
      <input
        type="checkbox"
        checked={actif}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#f9c74f]"
      />
      <span className={`mt-0.5 ${actif ? "text-[#f9c74f]" : "text-slate-500"}`}>{icone}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-medium text-white">
          {actif ? <CheckCircle className="h-3.5 w-3.5 text-[#f9c74f]" aria-hidden /> : null}
          {titre}
        </span>
        <span className="mt-0.5 block text-[11px] text-slate-300">{detail}</span>
      </span>
    </label>
  );
}
