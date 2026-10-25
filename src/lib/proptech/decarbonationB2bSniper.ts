/**
 * Carto Sniper — module Tertiaire, Industrie et décarbonation CEE.
 * Filtres de carte, cadrage réglementaire et étude A4 remise en main propre.
 */
import { jsPDF } from "jspdf";
import { MENTION_AIDES, PIED_CONTACT, PIED_EQUIPE, textePdf } from "./ficheOpportuniteSniper";

export type FiltreB2b = "decret" | "bacs" | "solaire" | "chaleur" | "tous";

export interface SiteProfessionnel {
  id?: string;
  adresse?: string;
  commune?: string;
  codePostal?: string;
  surface?: number | null;
  decretTertiaire?: string;
  activite?: string;
  potentielPvKwc?: number | null;
  chauffage?: string;
  conso?: number | null;
  etiquette?: string;
  annee?: number | null;
}

export interface ContexteFicheB2b {
  reference?: string;
  adresseComplete?: string;
  section?: string;
  numero?: string;
}

export interface EtudeDecarbonationB2b {
  reference: string;
  adresse: string;
  parcelle: string;
  segment: string;
  surfaceM2: number | null;
  activite: string;
  chauffage: string;
  etiquette: string;
  decretAssujetti: boolean;
  decretStatut: string;
  decretTexte: string;
  bacsObligatoire: boolean;
  bacsStatut: string;
  bacsTexte: string;
  puissanceKw: number | null;
  batTh116: string;
  indUt117: string;
  toitureM2: number | null;
  puissanceKwc: number | null;
  solaireRetenu: boolean;
  effacementEur: number | null;
  solaireTexte: string;
}

export const SEUIL_DECRET_TERTIAIRE_M2 = 1000;
export const SEUIL_TOITURE_SOLAIRE_M2 = 800;
export const PUISSANCE_SOLAIRE_MIN_KWC = 100;
export const PUISSANCE_SOLAIRE_MAX_KWC = 500;
export const EFFACEMENT_MIN_EUR = 35_000;
export const EFFACEMENT_MAX_EUR = 100_000;
const SEUIL_BACS_KW = 70;
const COEF_PUISSANCE_EXISTANT_KW_M2 = 0.08;
const M2_PAR_KWC = 7;

export const TEXTE_DECRET_TERTIAIRE =
  "Surface assujettie (> 1 000 m²) - Obligation légale de -40% d'ici 2030 (Plateforme OPERAT).";

export const TEXTE_DECRET_BACS =
  "Système d'automatisation GTB classe B obligatoire - Prise en charge CEE bonifiée jusqu'à 70%.";

export const TEXTE_BAT_TH_116 =
  "Fiche CEE BAT-TH-116 (GTB tertiaire) : système de gestion technique classe B minimum, sur chauffage, eau chaude, refroidissement, éclairage et auxiliaires. Prise en charge CEE bonifiée jusqu'à 70 %.";

export const TEXTE_IND_UT_117 =
  "Fiche CEE IND-UT-117 (récupération de chaleur) : valorisation de la chaleur fatale des compresseurs ou groupes froids, et appoint hybride. Baisse estimée de 20 % à 40 % sur le chauffage process.";

export const FILTRES_B2B: ReadonlyArray<{
  id: FiltreB2b;
  testid: string;
  label: string;
  actif: string;
}> = [
  {
    id: "decret",
    testid: "filtre-b2b-decret",
    label: "🏢 Décret Tertiaire Assujetti (> 1 000 m²)",
    actif: "border-sky-300 bg-sky-500/25 text-sky-50",
  },
  {
    id: "bacs",
    testid: "filtre-b2b-bacs",
    label: "🤖 GTB BACS Obligatoire (CEE ~70% / BAT-TH-116)",
    actif: "border-violet-300 bg-violet-500/25 text-violet-50",
  },
  {
    id: "solaire",
    testid: "filtre-b2b-solaire",
    label: "☀️ Solaire Industriel 100-500 kWc (Toiture > 800 m²)",
    actif: "border-amber-300 bg-amber-600/30 text-amber-50",
  },
  {
    id: "chaleur",
    testid: "filtre-b2b-chaleur",
    label: "♨️ Décarbonation Chaleur & Hybride (IND-UT-117)",
    actif: "border-orange-300 bg-orange-500/25 text-orange-50",
  },
  {
    id: "tous",
    testid: "filtre-b2b-tous",
    label: "Tous les sites B2B",
    actif: "border-emerald-400/60 bg-emerald-500/20 text-emerald-100",
  },
];

export function estModeB2b(typeBatiment: string): boolean {
  return typeBatiment === "tertiaire" || typeBatiment === "industriel";
}

export function segmentB2b(typeBatiment: string): string {
  return typeBatiment === "industriel" ? "Industrie & Logistique" : "Tertiaire & Commerces";
}

function surfaceUtile(site: SiteProfessionnel): number | null {
  const surface = Number(site.surface);
  return Number.isFinite(surface) && surface > 0 ? surface : null;
}

export function puissanceThermiqueEstimeeKw(site: SiteProfessionnel): number | null {
  const surface = surfaceUtile(site);
  if (surface == null) return null;
  return Math.round(surface * COEF_PUISSANCE_EXISTANT_KW_M2);
}

export function assujettiDecretTertiaire(site: SiteProfessionnel): boolean {
  const surface = surfaceUtile(site);
  if (surface != null && surface > SEUIL_DECRET_TERTIAIRE_M2) return true;
  return /^assujetti\b/i.test(String(site.decretTertiaire || "").trim());
}

export function gtbBacsObligatoire(site: SiteProfessionnel): boolean {
  const puissance = puissanceThermiqueEstimeeKw(site);
  if (puissance != null) return puissance >= SEUIL_BACS_KW;
  return assujettiDecretTertiaire(site);
}

export function cibleSolaireIndustriel(site: SiteProfessionnel): boolean {
  const surface = surfaceUtile(site);
  const kwc = nombrePositif(site.potentielPvKwc);
  if (surface != null && surface > SEUIL_TOITURE_SOLAIRE_M2) return true;
  return kwc != null && kwc >= PUISSANCE_SOLAIRE_MIN_KWC && kwc <= PUISSANCE_SOLAIRE_MAX_KWC;
}

export function cibleDecarbonationChaleur(site: SiteProfessionnel): boolean {
  if (String(site.activite || "").trim()) return true;
  return /gaz|fioul|fuel|process|charbon|hybride|réseau|reseau/.test(String(site.chauffage || "").toLowerCase());
}

export function correspondFiltreB2b(site: SiteProfessionnel, filtre: FiltreB2b): boolean {
  if (filtre === "tous") return true;
  if (filtre === "decret") return assujettiDecretTertiaire(site);
  if (filtre === "bacs") return gtbBacsObligatoire(site);
  if (filtre === "solaire") return cibleSolaireIndustriel(site);
  if (filtre === "chaleur") return cibleDecarbonationChaleur(site);
  return true;
}

function nombrePositif(valeur: number | null | undefined): number | null {
  const n = Number(valeur);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function effacementFactureEdf(kwc: number): number {
  const borne = Math.min(PUISSANCE_SOLAIRE_MAX_KWC, Math.max(PUISSANCE_SOLAIRE_MIN_KWC, kwc));
  const part = (borne - PUISSANCE_SOLAIRE_MIN_KWC) / (PUISSANCE_SOLAIRE_MAX_KWC - PUISSANCE_SOLAIRE_MIN_KWC);
  return Math.round(EFFACEMENT_MIN_EUR + part * (EFFACEMENT_MAX_EUR - EFFACEMENT_MIN_EUR));
}

function puissanceSolaireRetenue(site: SiteProfessionnel): { kwc: number | null; retenu: boolean } {
  const toiture = surfaceUtile(site);
  const potentiel = nombrePositif(site.potentielPvKwc);
  const toitureLarge = toiture != null && toiture > SEUIL_TOITURE_SOLAIRE_M2;
  const potentielDansTranche =
    potentiel != null && potentiel >= PUISSANCE_SOLAIRE_MIN_KWC && potentiel <= PUISSANCE_SOLAIRE_MAX_KWC;

  if (toitureLarge) {
    const brut = potentiel ?? Math.round(toiture / M2_PAR_KWC);
    const kwc = Math.min(PUISSANCE_SOLAIRE_MAX_KWC, Math.max(PUISSANCE_SOLAIRE_MIN_KWC, brut));
    return { kwc, retenu: true };
  }
  if (potentielDansTranche) return { kwc: potentiel, retenu: true };
  const brut = potentiel ?? (toiture != null ? Math.round(toiture / M2_PAR_KWC) : null);
  return { kwc: brut, retenu: false };
}

function formaterSurface(m2: number | null): string {
  if (m2 == null) return "non renseignée";
  return `${Math.round(m2).toLocaleString("fr-FR")} m²`;
}

function formaterEuros(valeur: number): string {
  return `${Math.round(valeur).toLocaleString("fr-FR")} €`;
}

export function composerEtudeDecarbonation(
  logement: SiteProfessionnel | null | undefined,
  typeBatiment: string,
  contexte: ContexteFicheB2b = {},
): EtudeDecarbonationB2b | null {
  if (!logement || !estModeB2b(typeBatiment)) return null;
  const surface = surfaceUtile(logement);
  const decretAssujetti = assujettiDecretTertiaire(logement);
  const puissanceKw = puissanceThermiqueEstimeeKw(logement);
  const bacsObligatoire = gtbBacsObligatoire(logement);
  const solaire = puissanceSolaireRetenue(logement);
  const effacement = solaire.retenu && solaire.kwc != null ? effacementFactureEdf(solaire.kwc) : null;
  const adresse =
    contexte.adresseComplete ||
    [logement.adresse, logement.codePostal, logement.commune].filter(Boolean).join(", ") ||
    "Adresse non renseignée";
  const id = String(logement.id || "").trim();
  const reference = contexte.reference
    ? contexte.reference.replace(/^SNIPER-/, "B2B-")
    : id
      ? `B2B-${id}`
      : "B2B-SITE";

  const decretStatut = decretAssujetti
    ? `Site assujetti sur la surface connue (${formaterSurface(surface)}).`
    : `Seuil non atteint sur la surface connue (${formaterSurface(surface)}).`;
  const bacsStatut = bacsObligatoire
    ? puissanceKw != null
      ? `Obligation retenue : puissance thermique estimée ${puissanceKw.toLocaleString("fr-FR")} kW (seuil décret BACS 70 kW).`
      : "Obligation retenue sur le statut d'assujettissement du site."
    : puissanceKw != null
      ? `Sous le seuil BACS : puissance thermique estimée ${puissanceKw.toLocaleString("fr-FR")} kW.`
      : "Puissance thermique non estimable : surface non renseignée.";

  const solaireTexte = solaire.retenu && solaire.kwc != null && effacement != null
    ? `Centrale solaire ${solaire.kwc.toLocaleString("fr-FR")} kWc (tranche 100 à 500 kWc, toiture ${formaterSurface(surface)}). Effacement direct de facture EDF : ${formaterEuros(effacement)} / an (fourchette 35 000 € à 100 000 €/an).`
    : `Centrale solaire 100 à 500 kWc non retenue en l'état (toiture ${formaterSurface(surface)}). Le gisement 35 000 € à 100 000 €/an suppose une toiture supérieure à 800 m².`;

  return {
    reference,
    adresse,
    parcelle: [contexte.section, contexte.numero].filter(Boolean).join(" ") || "Non communiquée",
    segment: segmentB2b(typeBatiment),
    surfaceM2: surface,
    activite: String(logement.activite || "").trim() || "Non précisée",
    chauffage: String(logement.chauffage || "").trim() || "Non précisé",
    etiquette: String(logement.etiquette || "").trim() || "—",
    decretAssujetti,
    decretStatut,
    decretTexte: TEXTE_DECRET_TERTIAIRE,
    bacsObligatoire,
    bacsStatut,
    bacsTexte: TEXTE_DECRET_BACS,
    puissanceKw,
    batTh116: TEXTE_BAT_TH_116,
    indUt117: TEXTE_IND_UT_117,
    toitureM2: surface,
    puissanceKwc: solaire.kwc,
    solaireRetenu: solaire.retenu,
    effacementEur: effacement,
    solaireTexte,
  };
}

export function peutExporterEtudeB2b(etude: EtudeDecarbonationB2b | null): boolean {
  return Boolean(etude && etude.adresse && etude.adresse !== "Adresse non renseignée");
}

function ecrire(pdf: jsPDF, texte: string, x: number, y: number, largeur: number, taille = 7.2): number {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(taille);
  pdf.setTextColor(15, 23, 42);
  const lignes = pdf.splitTextToSize(textePdf(texte), largeur) as string[];
  pdf.text(lignes, x, y);
  return y + lignes.length * (taille * 0.4);
}

export function mettreEnPageEtudeDecarbonation(etude: EtudeDecarbonationB2b): { pdf: jsPDF; bas: number } {
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });
  pdf.setProperties({
    title: textePdf(`Etude decarbonation ${etude.reference}`),
    author: "ENERGIA CONSEIL IA",
    subject: "Etude Decarbonation et GTB B2B",
    creator: "ENERGIA CONSEIL IA",
  });

  pdf.setFillColor(11, 31, 51);
  pdf.rect(0, 0, 210, 28, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(textePdf("ENERGIA CONSEIL IA (R)"), 12, 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(textePdf("Bureau d'études & AMO — Tertiaire, Industrie & Décarbonation CEE"), 12, 16);
  pdf.setFontSize(7.5);
  pdf.text(textePdf("16 Rue Cuvier, 69006 Lyon  |  SIRET 94181942700019  |  RCS Lyon 941819427"), 12, 22);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  pdf.text(textePdf(etude.reference), 198, 16, { align: "right" });

  pdf.setFillColor(244, 240, 230);
  pdf.rect(0, 28, 210, 8, "F");
  pdf.setTextColor(11, 31, 51);
  pdf.setFontSize(8);
  pdf.text(textePdf("ÉTUDE DÉCARBONATION & GTB B2B"), 105, 33.2, { align: "center" });

  const blocs: Array<{ titre: string; lignes: string[] }> = [
    {
      titre: "1  -  Site professionnel",
      lignes: [
        `Segment : ${etude.segment}. Adresse : ${etude.adresse}.`,
        `Parcelle : ${etude.parcelle}. Surface : ${formaterSurface(etude.surfaceM2)}. Activité : ${etude.activite}.`,
        `Chauffage : ${etude.chauffage}. Étiquette énergétique : ${etude.etiquette}.`,
      ],
    },
    {
      titre: "2  -  Réglementation et obligations",
      lignes: [
        `Décret Tertiaire — ${etude.decretStatut} ${etude.decretTexte}`,
        `Décret BACS — ${etude.bacsStatut} ${etude.bacsTexte}`,
      ],
    },
    {
      titre: "3  -  Dispositifs CEE et effacement électrique",
      lignes: [etude.batTh116, etude.indUt117, etude.solaireTexte],
    },
    {
      titre: "4  -  Cadrage de remise en main propre",
      lignes: [
        "Document d'ingénierie ENERGIA CONSEIL IA, à remettre au dirigeant avant devis d'entreprise.",
        "Les CEE restent une estimation. Le volume définitif suit la fiche standardisée en vigueur et le contrôle sur site.",
        MENTION_AIDES,
        "Avis de cadrage : Julia — Juriste ENERGIA-CONSEIL IA. Les scénarios d'aides sont indicatifs et exclusifs d'un engagement de prime.",
      ],
    },
  ];

  let y = 42;
  blocs.forEach((bloc) => {
    pdf.setFillColor(11, 31, 51);
    pdf.rect(12, y, 186, 6, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(textePdf(bloc.titre), 14, y + 4.1);
    y += 9;
    bloc.lignes.forEach((ligne) => {
      y = ecrire(pdf, ligne, 14, y, 182, 7.2) + 1.2;
    });
    y += 1.4;
  });

  pdf.setFillColor(11, 31, 51);
  pdf.rect(0, 272, 210, 25, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.2);
  pdf.text(textePdf("Document confidentiel — ENERGIA CONSEIL IA (R) — 2026. Marque déposée INPI."), 12, 278);
  pdf.text(textePdf(`Contact : ${PIED_CONTACT}`), 12, 282.5);
  const equipe = pdf.splitTextToSize(textePdf(PIED_EQUIPE), 186) as string[];
  pdf.text(equipe.slice(0, 2), 12, 287);

  return { pdf, bas: y };
}

export function telechargerEtudeDecarbonationPdf(etude: EtudeDecarbonationB2b): void {
  const { pdf } = mettreEnPageEtudeDecarbonation(etude);
  pdf.save(`${etude.reference}.pdf`);
}
