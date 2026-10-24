/**
 * Socle opérationnel CRM — apporteurs, jalons ANAH / CEE, Consultation Duo Catarina.
 */

export const SOURCE_APPORTEUR_DIRECT = "direct_energia";
export const SOURCE_APPORTEUR_CATARINA = "catarina_martins";
export const SOURCE_APPORTEUR_ROMAIN = "romain_bet_nomos";
export const SOURCE_APPORTEUR_FABIEN = "courtier_fabien";
export const SOURCE_APPORTEUR_DAMIEN = "damien";
export const SOURCE_APPORTEUR_JAMEL = "jamel_hamzaoui";
/** Alias historique — normalisé vers Courtier Fabien. */
export const SOURCE_APPORTEUR_EXTERNE = SOURCE_APPORTEUR_FABIEN;

export const CONSULTATION_DUO_CATARINA = {
  montantTtc: 390,
  label: "Consultation Duo 390 €",
  hint: "Visite terrain Catarina + étude ENERGIA",
  deductibilite:
    "Déductible du reste à charge travaux si le projet aboutit à un marché ENERGIA CONSEIL IA® (mention à titre indicatif).",
};

/** Répartition contractuelle Consultation Duo : 60 % Catarina / 40 % Energia Conseil IA. */
export const MONTANT_CONSULTATION_DUO_TTC = 390;
export const PART_CATARINA_DUO = 0.6;
export const PART_ENERGIA_DUO = 0.4;
export const REVERSEMENT_DUO_CATARINA_TTC = 234;
export const PART_ENERGIA_DUO_TTC = 156;
export const TAUX_COMMISSION_TRAVAUX_CATARINA = 0.1;
export const FORFAIT_COORDINATION_CATARINA_HT = 1500;

export const STATUT_COMMISSION_EN_ATTENTE = "en_attente";
export const STATUT_COMMISSION_A_REGLER = "a_regler";
export const STATUT_COMMISSION_REGLE = "regle";

export const STATUTS_COMMISSION = [
  { id: STATUT_COMMISSION_EN_ATTENTE, label: "En attente" },
  { id: STATUT_COMMISSION_A_REGLER, label: "À régler" },
  { id: STATUT_COMMISSION_REGLE, label: "Réglé" },
];

export const SOURCES_APPORTEUR = [
  {
    id: SOURCE_APPORTEUR_CATARINA,
    label: "Catarina Martins",
    selectLabel: "Catarina Martins",
    compactLabel: "Catarina Martins",
    hint: "Apporteur immobilier — commission Duo 60 % et travaux 10 % HT",
  },
  {
    id: SOURCE_APPORTEUR_ROMAIN,
    label: "BET NOMOS — Romain",
    selectLabel: "BET NOMOS — Romain",
    compactLabel: "Romain BET Nomos",
    hint: "Bureau d'études RGE AFNOR — audit en amont du chiffrage CG — CONV-2026-BET-NOMOS-01",
  },
  {
    id: SOURCE_APPORTEUR_FABIEN,
    label: "Fabien Vivons Courtier",
    selectLabel: "Fabien Vivons Courtier",
    compactLabel: "Fabien Vivons Courtier",
    hint: "Apport courtage financements travaux",
  },
  {
    id: SOURCE_APPORTEUR_DAMIEN,
    label: "Damien (Commercial)",
    selectLabel: "Damien (Commercial)",
    compactLabel: "Damien",
    hint: "Apporteur commercial Damien",
  },
  {
    id: SOURCE_APPORTEUR_JAMEL,
    label: "Jamel HAMZAOUI — ENERG’ÉTHIQUE",
    selectLabel: "Jamel HAMZAOUI — ENERG’ÉTHIQUE",
    compactLabel: "Jamel HAMZAOUI",
    hint: "Apporteur B2C 10 % HT — périmètre hors énergie et hors aides publiques — CONV-2026-ENERGETHIQUE-JAMEL-HAMZAOUI",
  },
  {
    id: SOURCE_APPORTEUR_DIRECT,
    label: "Direct / Aucun",
    selectLabel: "Direct / Aucun",
    compactLabel: "Direct / Aucun",
    hint: "Dossier sans apporteur externe",
  },
];

export const ETAPE_ANAH_AUDIT = "audit_reglementaire";
export const ETAPE_ANAH_VALIDATION_MAR = "validation_mar_financement";
export const ETAPE_ANAH_MARCHE_SIGNE = "marche_signe_acompte";
/** Ancien id — normalisé vers le jalon 4 (dépôt MPR & accord ANAH). */
export const ETAPE_ANAH_MPR_DEPOSE = "mpr_depose";
export const ETAPE_ANAH_ACCORD = "accord_anah";
export const ETAPE_ANAH_RECEPTION = "chantier_receptionne";

/** Alias rétrocompatibilité des anciens ids. */
export const ETAPE_ANAH_AUDIT_VALIDE = ETAPE_ANAH_AUDIT;
export const ETAPE_ANAH_DEVIS_ENVOYE = ETAPE_ANAH_AUDIT;
export const ETAPE_ANAH_ACCORD_INDIVISION = ETAPE_ANAH_AUDIT;
export const ETAPE_ANAH_DEPOT = ETAPE_ANAH_MPR_DEPOSE;
export const ETAPE_ANAH_INSTRUCTION = ETAPE_ANAH_MPR_DEPOSE;

export const ETAPES_ANAH = [
  {
    id: ETAPE_ANAH_AUDIT,
    label: "Audit réglementaire réalisé",
    compactLabel: "Audit réglementaire réalisé",
    sousTexte: "",
    ordre: 1,
    color: "#38bdf8",
  },
  {
    id: ETAPE_ANAH_VALIDATION_MAR,
    label: "Validation MAR & Financement bancaire",
    compactLabel: "Validation MAR & Financement bancaire",
    sousTexte: "Verrou obligatoire avant signature devis",
    ordre: 2,
    color: "#a78bfa",
  },
  {
    id: ETAPE_ANAH_MARCHE_SIGNE,
    label: "Marché signé & Acompte 30 %",
    compactLabel: "Marché signé & Acompte 30 %",
    sousTexte: "Bloqué tant que le jalon 2 n’est pas validé",
    ordre: 3,
    verrouMar: true,
    color: "#22d3ee",
  },
  {
    id: ETAPE_ANAH_ACCORD,
    label: "Dépôt MPR & Accord ANAH",
    compactLabel: "Dépôt MPR & Accord ANAH",
    sousTexte: "",
    ordre: 4,
    color: "#34d399",
  },
  {
    id: ETAPE_ANAH_RECEPTION,
    label: "Réception travaux & Primes versées",
    compactLabel: "Réception travaux & Primes versées",
    sousTexte: "",
    ordre: 5,
    color: "#10b981",
  },
];

export const IDS_PIPELINE_CA = {
  pereiraDemo: "demo-pereira",
  pereiraNervieux: "projet-manuel-pereira-nervieux",
  brunel: "projet-manuel-brunel-emrick",
  gilbertas: "dossier-gilbertas-clermont-2026",
  massardier: "lead-massardier-cuisine-2026",
  cloisonSdb: "dossier-cloison-sdb-2026",
  damienPv100kwc: "damien-pv-100kwc-07",
  gesnouin: "dossier-gesnouin-batterie-ac-2026",
};

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function sourceApporteurValide(id) {
  return SOURCES_APPORTEUR.some((item) => item.id === id);
}

export function normaliserSourceApporteur(id) {
  const brut = texte(id).toLowerCase();
  if (brut === "apporteur_externe" || brut === "externe") return SOURCE_APPORTEUR_FABIEN;
  if (brut === "romain" || brut === "nomos" || brut === "romain_bet" || brut === "bet_nomos") {
    return SOURCE_APPORTEUR_ROMAIN;
  }
  if (brut === "jamel" || brut === "hamzaoui" || brut === "jamel_hamzaoui") {
    return SOURCE_APPORTEUR_JAMEL;
  }
  if (sourceApporteurValide(brut)) return brut;
  return SOURCE_APPORTEUR_DIRECT;
}

export function trouverSourceApporteur(id) {
  const normalise = normaliserSourceApporteur(id);
  return SOURCES_APPORTEUR.find((item) => item.id === normalise) ?? SOURCES_APPORTEUR[0];
}

export function libelleSourceApporteur(id, { compact = false, select = false } = {}) {
  const source = trouverSourceApporteur(id);
  if (select) return source.selectLabel || source.label;
  return compact ? source.compactLabel : source.label;
}

export function infererSourceApporteur({ apporteurId, apporteurNom, partenaireId, source } = {}) {
  const id = texte(apporteurId).toLowerCase();
  if (id === "apporteur_externe") return SOURCE_APPORTEUR_FABIEN;
  if (sourceApporteurValide(id)) return id;
  const nom = `${texte(apporteurNom)} ${texte(partenaireId)} ${texte(source)}`.toLowerCase();
  if (nom.includes("catarina") || nom.includes("qr") || nom.includes("signature immobilière")) {
    return SOURCE_APPORTEUR_CATARINA;
  }
  if (nom.includes("hamzaoui") || nom.includes("jamel") || (nom.includes("energ") && nom.includes("ethique"))) {
    return SOURCE_APPORTEUR_JAMEL;
  }
  if (nom.includes("damien (commercial)") || nom.trim() === "damien") return SOURCE_APPORTEUR_DAMIEN;
  if (nom.includes("romain") || nom.includes("nomos")) {
    return SOURCE_APPORTEUR_ROMAIN;
  }
  if (nom.includes("fabien") || nom.includes("vivons") || nom.includes("courtier")) {
    return SOURCE_APPORTEUR_FABIEN;
  }
  if (nom.includes("damien") || nom.includes("externe") || nom.includes("richards")) {
    return SOURCE_APPORTEUR_FABIEN;
  }
  return SOURCE_APPORTEUR_DIRECT;
}

export function estApporteurCatarina(id) {
  return normaliserSourceApporteur(id) === SOURCE_APPORTEUR_CATARINA;
}

export function etapeAnahValide(id) {
  return ETAPES_ANAH.some((item) => item.id === id);
}

export function normaliserEtapeAnah(id) {
  const map = {
    audit_valide: ETAPE_ANAH_AUDIT,
    devis_envoye: ETAPE_ANAH_AUDIT,
    accord_indivision: ETAPE_ANAH_AUDIT,
    validation_mar: ETAPE_ANAH_VALIDATION_MAR,
    financement_bancaire: ETAPE_ANAH_VALIDATION_MAR,
    depot_anah: ETAPE_ANAH_ACCORD,
    instruction_anah: ETAPE_ANAH_ACCORD,
    mpr_depose: ETAPE_ANAH_ACCORD,
    accord_anah: ETAPE_ANAH_ACCORD,
  };
  const brut = texte(id);
  if (map[brut]) return map[brut];
  if (etapeAnahValide(brut)) return brut;
  return ETAPE_ANAH_AUDIT;
}

export function trouverEtapeAnah(id) {
  const normalise = normaliserEtapeAnah(id);
  return ETAPES_ANAH.find((item) => item.id === normalise) ?? ETAPES_ANAH[0];
}

export function etapeAnahDepuisStatut(statut) {
  const s = texte(statut).toLowerCase();
  if (s.includes("réception") || s.includes("reception") || s.includes("primes versées") || s.includes("primes versees")) {
    return ETAPE_ANAH_RECEPTION;
  }
  if (
    (s.includes("accord") && (s.includes("anah") || s.includes("subvention"))) ||
    s.includes("travaux autorisés") ||
    s.includes("travaux autorises")
  ) {
    return ETAPE_ANAH_ACCORD;
  }
  if (s.includes("attente de dépôt") || s.includes("attente de depot")) {
    return ETAPE_ANAH_VALIDATION_MAR;
  }
  if (s.includes("déposé") || s.includes("depose") || s.includes("instruction") || s.includes("mpr")) {
    return ETAPE_ANAH_ACCORD;
  }
  if (
    s.includes("validation mar") ||
    s.includes("rdv mar") ||
    s.includes("financement bancaire") ||
    (s.includes("mar") && s.includes("financement"))
  ) {
    return ETAPE_ANAH_VALIDATION_MAR;
  }
  if (
    !s.includes("attente") &&
    (s.includes("signé") || s.includes("marché sign") || s.includes("marche sign") || s.includes("acompte 30"))
  ) {
    return ETAPE_ANAH_MARCHE_SIGNE;
  }
  return ETAPE_ANAH_AUDIT;
}

export function parcoursAnahJusqua(etapeId) {
  const courant = trouverEtapeAnah(etapeId);
  return ETAPES_ANAH.filter((item) => item.ordre <= courant.ordre);
}

export function libelleParcoursAnah(etapeId) {
  return parcoursAnahJusqua(etapeId)
    .map((item) => item.compactLabel)
    .join(" → ");
}

export function regrouperPipelineAnah(dossiers) {
  const counts = Object.fromEntries(ETAPES_ANAH.map((etape) => [etape.id, 0]));
  for (const dossier of dossiers ?? []) {
    if (dossier?.horsAidesPubliques === true) continue;
    const id = normaliserEtapeAnah(dossier.etapeAnah || etapeAnahDepuisStatut(dossier.statut));
    counts[id] = (counts[id] ?? 0) + 1;
  }
  return ETAPES_ANAH.map((etape) => ({ ...etape, count: counts[etape.id] ?? 0 }));
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function statutCommissionValide(id) {
  return STATUTS_COMMISSION.some((item) => item.id === id);
}

export function libelleStatutCommission(id) {
  return STATUTS_COMMISSION.find((item) => item.id === id)?.label || "En attente";
}

/** Le jalon 2 est acquis seulement s’il a été validé, ou si le dossier est déjà au-delà. */
export function validationMarAcquise(dossier) {
  if (!dossier || typeof dossier === "string") {
    return trouverEtapeAnah(typeof dossier === "string" ? dossier : "").ordre > 2;
  }
  if (dossier.validationMar === true) return true;
  if (dossier.validationMar === false) return false;
  return trouverEtapeAnah(dossier.etapeAnah).ordre > 2;
}

/** Interdit le passage au jalon 3 (et au-delà) tant que le jalon 2 n’est pas validé. */
export function peutPasserAuJalon(dossier, etapeCibleId) {
  const cible = trouverEtapeAnah(etapeCibleId);
  if (cible.ordre < 3) return true;
  return validationMarAcquise(dossier);
}

export function messageVerrouMarche() {
  return "Impossible de passer au jalon 3 : le jalon 2 (Validation MAR & financement bancaire) n’est pas validé. Verrou obligatoire avant signature du devis.";
}
export const AVERTISSEMENT_VISITE_TECHNIQUE_VERROUILLEE =
  "🔒 Visite Technique réservée : déclenchement uniquement après signature du marché et encaissement de l’acompte de 30 % (aucun déplacement préalable à blanc).";

export function peutPlanifierVisiteTechnique(dossier) {
  return dossier?.acompte30Encaisse === true && trouverEtapeAnah(dossier?.etapeAnah).ordre >= 3;
}

export function calculerCommissionCatarina({
  consultationDuo = false,
  montantTravauxHt = 0,
  etapeAnah,
} = {}) {
  const ht = Number(montantTravauxHt);
  const baseHt = Number.isFinite(ht) ? ht : 0;
  const duo = consultationDuo === true;
  const ordreEtape = trouverEtapeAnah(etapeAnah).ordre;
  const coordinationDeclenchee = ordreEtape >= 3;
  const commissionTravauxDeclenchee = ordreEtape >= 5;
  const commissionTravauxHt = round2(baseHt * TAUX_COMMISSION_TRAVAUX_CATARINA);
  const totalPartenaireEstimeHt = round2(FORFAIT_COORDINATION_CATARINA_HT + commissionTravauxHt);
  return {
    consultationDuo: duo,
    montantDuoTtc: duo ? MONTANT_CONSULTATION_DUO_TTC : 0,
    reversementDuoTtc: duo ? REVERSEMENT_DUO_CATARINA_TTC : 0,
    partEnergiaDuoTtc: duo ? PART_ENERGIA_DUO_TTC : 0,
    forfaitCoordinationHt: FORFAIT_COORDINATION_CATARINA_HT,
    commissionTravauxHt,
    totalPartenaireEstimeHt,
    coordinationDeclenchee,
    commissionTravauxDeclenchee,
    forfaitCoordinationDuHt: coordinationDeclenchee ? FORFAIT_COORDINATION_CATARINA_HT : 0,
    commissionTravauxDueHt: commissionTravauxDeclenchee ? commissionTravauxHt : 0,
    totalDeclencheHt: round2(
      (coordinationDeclenchee ? FORFAIT_COORDINATION_CATARINA_HT : 0) +
        (commissionTravauxDeclenchee ? commissionTravauxHt : 0),
    ),
    totalGenere: round2((duo ? REVERSEMENT_DUO_CATARINA_TTC : 0) + commissionTravauxHt),
  };
}

export function statutCommissionEffectif(dossier) {
  if (statutCommissionValide(dossier?.statutCommission)) return dossier.statutCommission;
  return trouverEtapeAnah(dossier?.etapeAnah).ordre >= 3
    ? STATUT_COMMISSION_A_REGLER
    : STATUT_COMMISSION_EN_ATTENTE;
}

export function recapitulatifCommissionsCatarina(dossiers) {
  const lignes = (dossiers ?? [])
    .filter((dossier) => estApporteurCatarina(dossier?.apporteurId))
    .map((dossier) => {
      const commission = calculerCommissionCatarina({
        consultationDuo: dossier.consultationDuo === true,
        montantTravauxHt: dossier.caHt,
        etapeAnah: dossier.etapeAnah,
      });
      return {
        id: dossier.id,
        nom: dossier.nom || "Dossier",
        ville: dossier.ville || "",
        caHt: Number(dossier.caHt) || 0,
        statut: statutCommissionEffectif(dossier),
        ...commission,
      };
    });

  const totalDuoTtc = round2(lignes.reduce((somme, ligne) => somme + ligne.reversementDuoTtc, 0));
  const totalCoordinationHt = round2(lignes.reduce((somme, ligne) => somme + ligne.forfaitCoordinationHt, 0));
  const totalTravauxHt = round2(lignes.reduce((somme, ligne) => somme + ligne.commissionTravauxHt, 0));
  const totalPartenaireEstimeHt = round2(totalCoordinationHt + totalTravauxHt);
  let statut = STATUT_COMMISSION_EN_ATTENTE;
  if (lignes.length > 0 && lignes.every((ligne) => ligne.statut === STATUT_COMMISSION_REGLE)) {
    statut = STATUT_COMMISSION_REGLE;
  } else if (lignes.some((ligne) => ligne.statut === STATUT_COMMISSION_A_REGLER || ligne.statut === STATUT_COMMISSION_REGLE)) {
    statut = STATUT_COMMISSION_A_REGLER;
  }

  return {
    nbDossiers: lignes.length,
    totalDuoTtc,
    totalCoordinationHt,
    totalTravauxHt,
    totalPartenaireEstimeHt,
    totalGenere: round2(totalDuoTtc + totalTravauxHt),
    statut,
    lignes,
  };
}

export {
  DETAIL_JALON_BRUNEL_DEPOT_MAR,
  STATUT_CRM_BRUNEL_MARCHE,
} from "./brunelMarcheOfficiel2026.js";

/** Barème officiel 2026 transmis par le MAR Antoine Baratier — Cabinet C2ET. Hors Île-de-France. */
export const BAREME_RFR_2026_HORS_IDF = {
  1: { bleu: 17363, jaune: 22259, violet: 31185 },
  2: { bleu: 25393, jaune: 32553, violet: 45842 },
  3: { bleu: 30540, jaune: 39148, violet: 55196 },
  4: { bleu: 35676, jaune: 45735, violet: 64550 },
  5: { bleu: 40835, jaune: 52348, violet: 73907 },
  parPersonneSupplementaire: { bleu: 5151, jaune: 6598, violet: 9357 },
};

export const PLAFONDS_PARCOURS_ACCOMPAGNE_HT = {
  deuxClasses: 30000,
  troisClassesOuPlus: 40000,
};

export const TAUX_TRAVAUX_PARCOURS_2026 = [
  { id: "bleu", label: "Très modeste (Bleu)", tauxHt: 0.8, ecretementTtc: 1 },
  { id: "jaune", label: "Modeste (Jaune)", tauxHt: 0.6, ecretementTtc: 0.8 },
  { id: "violet", label: "Intermédiaire (Violet)", tauxHt: 0.45, ecretementTtc: 0.8 },
  { id: "rose", label: "Supérieur (Rose)", tauxHt: 0.1, ecretementTtc: 0.5 },
];

export const PRISE_EN_CHARGE_MAR_2026 = {
  plafondTtc: 2000,
  profils: [
    { id: "bleu", taux: 1, aide: 2000, resteACharge: 0 },
    { id: "jaune", taux: 0.8, aide: 1600, resteACharge: 400 },
    { id: "violet", taux: 0.4, aide: 800, resteACharge: 1200 },
    { id: "rose", taux: 0.2, aide: 400, resteACharge: 1600 },
  ],
};

export const FOYER_BRUNEL_BAREME_MAR = {
  personnes: 1,
  profil: "jaune",
  plafondJaune: 22259,
  libelle: "Foyer 1 personne — Profil JAUNE (RFR 20 216 € ≤ 22 259 €)",
};

export const TEXTE_ECO_PTZ_BRUNEL =
  "Financement du reste à charge : Éco-PTZ à 0 % sur 20 ans possible (mensualité estimée : ~63,50 € / mois à taux zéro sans apport). Permet de financer l'intégralité du reste à charge global de 15 238,60 € TTC (travaux + MAR) sans apport personnel.";

export function seuilsRfrHorsIdf(personnes) {
  const n = Math.max(1, Math.floor(Number(personnes) || 1));
  if (n <= 5) return { ...BAREME_RFR_2026_HORS_IDF[n] };
  const extra = n - 5;
  const base = BAREME_RFR_2026_HORS_IDF[5];
  const add = BAREME_RFR_2026_HORS_IDF.parPersonneSupplementaire;
  return {
    bleu: base.bleu + extra * add.bleu,
    jaune: base.jaune + extra * add.jaune,
    violet: base.violet + extra * add.violet,
  };
}

export const VUE_HUB_SUPER_ADMIN = "super-admin";
export const VUE_HUB_AMO = "amo";
export const VUE_HUB_STORAGE_KEY = "energia-crm-vue-hub";

/** Forfait officiel Clyve — Cabinet Hub Admin, par dossier. TVA 20 %, réglé à l'acompte. */
export const HONORAIRES_HUB_ADMIN_HT = 990;
export const TAUX_TVA_HONORAIRES_HUB_ADMIN = 0.2;
export const HONORAIRES_HUB_ADMIN_TVA = 198;
export const HONORAIRES_HUB_ADMIN_TTC = 1188;
/** Ancien forfait, encore présent dans des sauvegardes locales : relu comme le tarif officiel. */
export const HONORAIRES_HUB_ADMIN_HT_ANCIEN = 1100;

function montantEuroFr(n) {
  return `${Number(n).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} €`;
}

export function libelleHonorairesAmoHubAdmin() {
  return `Honoraires AMO Hub Admin = ${montantEuroFr(HONORAIRES_HUB_ADMIN_HT)} HT (TVA 20 % = ${montantEuroFr(HONORAIRES_HUB_ADMIN_TVA)}, soit ${montantEuroFr(HONORAIRES_HUB_ADMIN_TTC)} TTC réglés à l'acompte).`;
}

export const VUES_HUB = [
  { id: VUE_HUB_SUPER_ADMIN, label: "Vue Super-Admin (Sylvain)" },
  { id: VUE_HUB_AMO, label: "Vue AMO (Clyve)" },
];

export function estVueAmo(vueHub) {
  return vueHub === VUE_HUB_AMO;
}

export function lireVueHub() {
  try {
    const value = sessionStorage.getItem(VUE_HUB_STORAGE_KEY);
    return value === VUE_HUB_AMO ? VUE_HUB_AMO : VUE_HUB_SUPER_ADMIN;
  } catch {
    return VUE_HUB_SUPER_ADMIN;
  }
}

export function enregistrerVueHub(vueHub) {
  try {
    sessionStorage.setItem(VUE_HUB_STORAGE_KEY, estVueAmo(vueHub) ? VUE_HUB_AMO : VUE_HUB_SUPER_ADMIN);
  } catch {
    /* ignore */
  }
}

/** Droits d'affichage de la vue Hub. L'AMO voit le dossier administratif, pas la marge ni les achats. */
export function droitsVueHub(vueHub) {
  const amo = estVueAmo(vueHub);
  return {
    amo,
    afficherDonneesAdministratives: true,
    afficherRfr: true,
    afficherGed: true,
    afficherAuditMar: true,
    afficherFicheTechnique: true,
    afficherDevisOfficiel: true,
    afficherSubventionAnah: true,
    afficherHonorairesMar: true,
    afficherJalonsAnah: true,
    afficherHonorairesHubAdmin: true,
    afficherMargeCg: !amo,
    afficherBonsCommande: !amo,
    afficherCommissionsCommerciales: !amo,
    afficherTresorerieInterne: !amo,
  };
}

/** Retire marge, achats sous-traitants, commissions et trésorerie. Conserve RFR, pièces et jalons. */
export function sanitiserProjetPourVueHub(audit, vueHub) {
  if (!audit || !estVueAmo(vueHub)) return audit;
  const travaux = (audit.travaux || []).map(({ coutAchatHt: _achat, margeBruteHt: _marge, ...lot }) => lot);
  const workingBase = audit.workingBase
    ? {
        ...audit.workingBase,
        financesInternes: { coutArtisanHt: null, prixVenteHt: null, statutPaiement: null },
      }
    : null;
  return {
    ...audit,
    margeBruteHt: null,
    coutAchatHt: null,
    coutArtisanHt: null,
    commissionDamienHt: null,
    forfaitCatarinaHt: null,
    margeNetteEnergiaHt: null,
    partner_commission: null,
    syntheseFinanciere: audit.syntheseFinanciere
      ? {
          ...audit.syntheseFinanciere,
          coutsTravauxHt: null,
          commissionDamienHt: null,
          forfaitCatarinaHt: null,
          margeNetteEnergiaHt: null,
        }
      : audit.syntheseFinanciere,
    travaux,
    workingBase,
    finances: audit.finances
      ? {
          ...audit.finances,
          commission_amount: null,
          partner_commission: null,
          marge_nette: null,
          net_margin: null,
          cout_achat: null,
          coutArtisanHt: null,
        }
      : audit.finances,
  };
}

export function profilDepuisRfrHorsIdf(rfr, personnes) {
  const revenu = Number(rfr);
  if (!Number.isFinite(revenu)) return null;
  const seuils = seuilsRfrHorsIdf(personnes);
  if (revenu <= seuils.bleu) return "bleu";
  if (revenu <= seuils.jaune) return "jaune";
  if (revenu <= seuils.violet) return "violet";
  return "rose";
}

/**
 * Audit énergétique réglementaire C2ET — BRUNEL_1_1_1_0_AER.pdf (52 pages).
 * Chiffres repris du PDF (visite et établissement le 24/09/2026).
 * Les étiquettes A–G sont celles de l'échelle DPE 2021 appliquées aux kWhEP/m².an publiés
 * (G ≥ 420, D 180–249, C 110–179, B 70–109). Les lettres sont dans les jauges graphiques du PDF.
 * Le GES initial (18 kg) est reconstitué : −15 kg = −83 %, −14 kg = −78 %, −11 kg = −61 %.
 * L'audit ne publie pas de gain kWh poste par poste : seuls les coûts estimés par lot sont donnés.
 * Ces montants ne remplacent pas le devis ENERGIA.
 */
export const CHEMIN_AUDIT_AER_BRUNEL = "/projects/brunel/BRUNEL_1_1_1_0_AER.pdf";

export const AUDIT_REGLEMENTAIRE_BRUNEL = {
  source: "BRUNEL_1_1_1_0_AER.pdf",
  pages: 52,
  numero: "A26420202241D",
  mission: "BRUNEL Logement 001",
  dateVisite: "2026-09-24",
  dateEtablissement: "2026-09-24",
  dateValidite: "2031-09-23",
  auditeur: {
    cabinet: "C2ET",
    nom: "Antoine Baratier",
    adresse: "4 ZI de Montbertrand, Centre d'Affaires de Montbertrand, 38230 Charvieu-Chavagneux",
    telephone: "07 66 60 00 81",
    email: "antoine.baratier@cabinetc2et.fr",
    siret: "78854236300056",
    certification: "OPQIBI 21 08 4353",
    certificationJusquau: "2026-12-01",
    logiciel: "DPEWIN V5.4.4",
  },
  bati: {
    proprietaire: "BRUNEL Emrick",
    adresseAudit: "48 Impasse de la Lagune",
    type: "Maison individuelle",
    anneeConstruction: "Avant 1948",
    surfaceReferenceM2: 82.9,
    altitudeM: 524,
    niveaux: 2,
    departement: "Loire",
    ubatInitial: 1.225,
    ubatBaseInitial: 0.329,
  },
  etatInitial: {
    classeEnergie: "G",
    passoire: true,
    kwhEpM2: 460,
    kwhEfM2: 242,
    gesKgCo2M2: 18,
    factureMinEur: 3470,
    factureMaxEur: 4720,
    prixIndexesAu: "2023-01-01",
    chauffage: { energie: "électricité", kwhEpM2: 411.5, kwhEfM2: 216.6, factureMinEur: 3110, factureMaxEur: 4210 },
    ecs: { kwhEpM2: 45.4, kwhEfM2: 23.9, factureMinEur: 340, factureMaxEur: 470 },
    eclairage: { kwhEpM2: 3.5, kwhEfM2: 1.9, factureMinEur: 20, factureMaxEur: 40 },
    mursPartDesPertes: 0.49,
  },
  scenarios: [
    {
      id: "scenario-1",
      titre: "Scénario 1 — en une fois",
      parcours: "G → B",
      retenu: false,
      travaux: [
        "Menuiseries DV Uw ≤ 1,3 — ~5 000 €",
        "Portes Ud ≤ 1,7 — ~3 500 €",
        "ITI murs extérieurs R ≥ 3,7 — ~12 800 €",
        "ITI murs sur locaux non chauffés — ~3 000 €",
        "Isolation combles perdus — ~1 300 €",
        "VMC simple flux hygro B — ~1 800 €",
        "PAC air/air — ~12 000 €",
        "Chauffe-eau thermodynamique — ~4 500 €",
      ],
      ubat: 0.356,
      gainPourcentEp: 83,
      gainKwhEpM2: 383,
      kwhEpM2Apres: 77,
      kwhEfM2Apres: 40,
      classeApres: "B",
      reductionGesKg: 15,
      factureMinEur: 670,
      factureMaxEur: 940,
      investissementTtcEur: 46950,
    },
    {
      id: "scenario-2",
      titre: "Scénario 2 — par étapes",
      parcours: "G → D → B",
      retenu: false,
      etapes: [
        {
          titre: "Étape 1 — enveloppe",
          travaux: "Menuiseries, ITI murs, isolation des combles",
          ubat: 0.354,
          gainPourcentEp: 59,
          gainKwhEpM2: 270,
          kwhEpM2Apres: 190,
          classeApres: "D",
          reductionGesKg: 11,
          factureMinEur: 1480,
          factureMaxEur: 2040,
          investissementTtcEur: 26700,
        },
        {
          titre: "Étape 2 — systèmes",
          travaux: "VMC hygro B, PAC air/air, chauffe-eau thermodynamique",
          ubat: 0.354,
          gainPourcentEp: 83,
          gainKwhEpM2: 383,
          kwhEpM2Apres: 77,
          classeApres: "B",
          reductionGesKg: 15,
          factureMinEur: 670,
          factureMaxEur: 940,
          investissementTtcEur: 20250,
        },
      ],
    },
    {
      id: "scenario-3",
      titre: "Scénario 3 — retenu par le client (p. 18)",
      parcours: "G → C",
      retenu: true,
      sautClasses: 4,
      travaux: [
        { poste: "Menuiseries", detail: "7 fenêtres, Uw ≤ 1,3 et Sw ≤ 0,3", coutTtcEur: 6500 },
        { poste: "Porte", detail: "Porte d'entrée Ud ≤ 1,7", coutTtcEur: 1500 },
        { poste: "Combles", detail: "Plancher des combles perdus, 60,53 m², R = 7", coutTtcEur: 2100 },
        { poste: "VMC", detail: "Simple flux hygroréglable type B", coutTtcEur: 1800 },
        { poste: "PAC", detail: "PAC air/air, splits, SCOP > 3,6 (l'audit ne cite pas la marque Daikin)", coutTtcEur: 12000 },
        { poste: "CET", detail: "Chauffe-eau thermodynamique, COP ECS > 2,5 sur air extrait", coutTtcEur: 4500 },
        { poste: "Travaux induits", detail: "Déposes, trappe, membrane, rejets, alimentation PAC", coutTtcEur: 3050 },
      ],
      sansIsolationMurs: true,
      ubat: 0.874,
      ubatBase: 0.326,
      gainPourcentEp: 73,
      gainKwhEpM2: 337,
      gainKwhEfM2: 178,
      gainPourcentEf: 57,
      kwhEpM2Apres: 123,
      kwhEfM2Apres: 64,
      classeApres: "C",
      reductionGesPourcent: 78,
      reductionGesKg: 14,
      gesKgCo2M2Apres: 4,
      factureMinEur: 1520,
      factureMaxEur: 2090,
      investissementTtcEur: 31450,
      surfaceReferenceApresM2: 131.88,
      hauteurMoyenneApresM: 2.5,
      seuilAnah35: true,
      seuilAnah55: true,
    },
  ],
};

export function economiesAnnuellesScenario3Brunel(audit = AUDIT_REGLEMENTAIRE_BRUNEL) {
  const initial = audit.etatInitial;
  const scenario = audit.scenarios.find((item) => item.id === "scenario-3");
  const surface = audit.bati.surfaceReferenceM2;
  const factureInitialeMilieu = (initial.factureMinEur + initial.factureMaxEur) / 2;
  const factureApresMilieu = (scenario.factureMinEur + scenario.factureMaxEur) / 2;
  return {
    kwhEpAn: Math.round(scenario.gainKwhEpM2 * surface),
    kwhEfAn: Math.round(scenario.gainKwhEfM2 * surface),
    eurosMilieu: Math.round(factureInitialeMilieu - factureApresMilieu),
    eurosMin: initial.factureMinEur - scenario.factureMaxEur,
    eurosMax: initial.factureMaxEur - scenario.factureMinEur,
    gainPourcentEp: scenario.gainPourcentEp,
  };
}
