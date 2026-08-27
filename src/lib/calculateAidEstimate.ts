import { AID_RULES_2026, determinerProfil } from "../data/aidRules2026";
import { UMAFI } from "../data/umafi";
import type { WorkItem } from "../types/audit";
import type {
  AidEstimateResult,
  AideLigne,
  CalculateAidEstimateInput,
  EligibleWorkInput,
  PosteAide,
  ProfilMpr,
} from "../types/aides";

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function dpeRank(lettre: string | null): number | null {
  if (!lettre) return null;
  const map: Record<string, number> = { G: 6, F: 5, E: 4, D: 3, C: 2, B: 1, A: 0 };
  return map[lettre.toUpperCase()] ?? null;
}

function gainClasses(actuel: string | null, vise: string | null): number | null {
  const a = dpeRank(actuel);
  const v = dpeRank(vise);
  if (a == null || v == null) return null;
  return Math.max(0, a - v);
}

function inferPoste(lot: WorkItem): PosteAide {
  const text = `${lot.libelle} ${lot.detail}`.toLowerCase();
  if (/(dalle|maçon|macon|ouverture)/i.test(text)) return "maconnerie";
  if (/(photovolta|dualsun|solaire|batterie|pv\b)/i.test(text)) return "pv";
  if (/(pac|pompe à chaleur|chauffage)/i.test(text)) return "pac";
  if (/(vmc|ventilation)/i.test(text)) return "vmc";
  if (/(ballon|ecs|thermodynamique)/i.test(text)) return "ballon";
  if (/(fenêtre|fenetre|menuiser)/i.test(text)) return "menuiseries";
  if (/(plancher)/i.test(text)) return "isolation_planchers";
  if (/(ite|iti|mur)/i.test(text)) return "isolation_murs";
  if (/(toiture|comble|sous-toiture|couverture)/i.test(text)) return "isolation_toiture";
  return "autre";
}

function parseSurfaceM2(lot: WorkItem): number | undefined {
  const match = `${lot.libelle} ${lot.detail}`.replace(",", ".").match(/(\d+(?:\.\d+)?)\s*m²/i);
  return match ? Number(match[1]) : undefined;
}

function htFromTtc(ttc: number, tvaRate: number): number {
  return round2(ttc / (1 + tvaRate));
}

function classifyLots(lots: WorkItem[]): EligibleWorkInput[] {
  return lots.map((lot) => {
    const poste = inferPoste(lot);
    const surfaceM2 = parseSurfaceM2(lot);
    const mixedRoof =
      poste === "isolation_toiture" &&
      /tuile|couverture|zinguerie|réfection/i.test(`${lot.libelle} ${lot.detail} ${lot.reference}`);
    const eligibleMpr =
      !AID_RULES_2026.eligibilite.postesNonEligiblesMpr.includes(poste) &&
      poste !== "autre" &&
      !mixedRoof;
    const eligibleCee =
      (poste === "isolation_toiture" ||
        poste === "pac" ||
        poste === "vmc" ||
        poste === "ballon" ||
        poste === "menuiseries") &&
      !(AID_RULES_2026.cee.horsIteIti && poste === "isolation_murs");

    let montantHt: number | undefined;
    let note: string | undefined;
    if (mixedRoof) {
      note =
        "Lot toiture mixte (couverture + isolation) : la part isolation n’est pas isolée comptablement. Montant couverture non retenu en dépense MPR. CEE toiture éventuel : indicatif uniquement.";
    } else if (lot.source === "DEVIS RÉEL" && /10\s*%/.test(`${lot.reference} ${lot.detail}`)) {
      montantHt = htFromTtc(lot.montantTtc, 0.1);
    } else if (eligibleMpr) {
      montantHt = htFromTtc(lot.montantTtc, 0.055);
    }

    return {
      libelle: lot.libelle,
      poste,
      montantTtc: lot.montantTtc,
      montantHt,
      surfaceM2,
      source: lot.source,
      eligibleMpr: eligibleMpr && lot.source !== "HYPOTHÈSE",
      eligibleCee: eligibleCee && lot.source !== "HYPOTHÈSE",
      note,
    };
  });
}

function missingFoyerFields(input: CalculateAidEstimateInput): string[] {
  const { foyer } = input;
  const missing: string[] = [];
  if (foyer.rfr == null) missing.push("RFR du foyer");
  if (foyer.rfrYear == null) missing.push("Année du RFR");
  if (foyer.householdSize == null) missing.push("Nombre de personnes dans le foyer");
  if (!foyer.regionCode && !foyer.region) missing.push("Région");
  if (!foyer.department) missing.push("Département");
  if (!foyer.housingStatus) missing.push("Statut du logement");
  if (!foyer.residenceType) missing.push("Résidence principale ou secondaire");
  if (!foyer.occupantType) missing.push("Propriétaire occupant ou bailleur");
  if (!foyer.constructionYear && !foyer.housingAgeLabel) missing.push("Ancienneté du logement");
  if (!foyer.dpeActuel) missing.push("DPE actuel");
  if (!foyer.dpeVise) missing.push("Gain DPE visé");
  if (!foyer.parcoursType || foyer.parcoursType === "non_determine") missing.push("Type de parcours d’aide");
  if (!foyer.rgeCompany) missing.push("Entreprise RGE associée");
  if (!foyer.filingDate) missing.push("Date prévue de dépôt du dossier");
  return missing;
}

function buildClyveAlerts(input: CalculateAidEstimateInput, missing: string[]): string[] {
  const alerts: string[] = [
    ...missing.map((item) => `${item} manquant.`),
    "Plafonds non calculables tant que le profil fiscal et le DPE ne sont pas renseignés.",
    "Validation MAR obligatoire.",
  ];
  const lots = input.lots;
  const hasChauffageDevis = lots.some((lot) => lot.source === "DEVIS RÉEL" && inferPoste(lot) === "pac");
  const hasVmcDevis = lots.some((lot) => lot.source === "DEVIS RÉEL" && inferPoste(lot) === "vmc");
  const hasMenuiserieDevis = lots.some((lot) => lot.source === "DEVIS RÉEL" && inferPoste(lot) === "menuiseries");
  if (!hasChauffageDevis) alerts.push("Aucun devis chauffage.");
  if (!hasVmcDevis) alerts.push("Aucun devis ventilation.");
  if (!hasMenuiserieDevis) alerts.push("Aucun devis menuiseries.");
  if (lots.some((lot) => /échue|echue|2021|2022/i.test(lot.detail + lot.reference))) {
    alerts.push("Devis échus.");
  }
  if (lots.some((lot) => inferPoste(lot) === "isolation_toiture")) {
    alerts.push("Devis toiture contradictoires (surfaces 360 / 450 / 505 m² — offre Madinier non cumulée).");
  }
  alerts.push("Travaux non éligibles ou non documentés : maçonnerie / dalles, photovoltaïque, lots estimés sans devis.");
  return Array.from(new Set(alerts));
}

function emptyResult(
  input: CalculateAidEstimateInput,
  status: AidEstimateResult["status"],
  profileMessage: string,
  missing: string[],
  alerts: string[],
): AidEstimateResult {
  const lotsClasses = {
    documentes: input.lots.filter((lot) => lot.source === "DEVIS RÉEL"),
    estimes: input.lots.filter((lot) => lot.source === "ESTIMATION TECHNIQUE"),
    hypotheses: input.lots.filter((lot) => lot.source === "HYPOTHÈSE"),
  };
  return {
    calculable: false,
    status,
    profile: null,
    profileLabel: "Profil d’aide non déterminable",
    profileMessage,
    baremeVersion: AID_RULES_2026.version,
    missingFields: missing,
    alerts,
    travauxDocumentesTtc: round2(lotsClasses.documentes.reduce((sum, lot) => sum + lot.montantTtc, 0)),
    travauxEstimesTtc: round2(lotsClasses.estimes.reduce((sum, lot) => sum + lot.montantTtc, 0)),
    travauxHypothesesTtc: round2(lotsClasses.hypotheses.reduce((sum, lot) => sum + lot.montantTtc, 0)),
    depensesEligiblesHt: 0,
    depensesEligiblesTtc: 0,
    depensesNonEligiblesTtc: round2(input.budgetTtc),
    plafondDepensesHt: null,
    mpr: null,
    cee: null,
    locales: null,
    autres: null,
    totalAides: null,
    resteACharge: null,
    ecretementApplied: false,
    ecoPtzPossible: false,
    ecoPtzMessage: UMAFI.ecoPtzIndisponible,
    lignes: [],
    lotsClasses,
  };
}

/**
 * Moteur d’aides contrôlé. N’applique jamais un pourcentage brut au budget total.
 * Bloque le calcul si RFR / composition du foyer (et données d’éligibilité) manquent.
 */
export function calculateAidEstimate(input: CalculateAidEstimateInput): AidEstimateResult {
  const missing = missingFoyerFields(input);
  const fiscalMissing = input.foyer.rfr == null || input.foyer.householdSize == null;
  const lotsClasses = {
    documentes: input.lots.filter((lot) => lot.source === "DEVIS RÉEL"),
    estimes: input.lots.filter((lot) => lot.source === "ESTIMATION TECHNIQUE"),
    hypotheses: input.lots.filter((lot) => lot.source === "HYPOTHÈSE"),
  };

  if (fiscalMissing) {
    return emptyResult(
      input,
      "DONNEES_FISCALES_MANQUANTES",
      "Profil d’aide non déterminable : RFR et/ou composition du foyer manquants.",
      missing,
      buildClyveAlerts(input, missing),
    );
  }

  const regionCode = input.foyer.regionCode;
  if (!regionCode) {
    return emptyResult(
      input,
      "AIDES_NON_CALCULABLES",
      "Profil d’aide non déterminable : région manquante pour appliquer le barème.",
      missing,
      buildClyveAlerts(input, missing),
    );
  }

  const profile = determinerProfil(input.foyer.rfr as number, input.foyer.householdSize as number, regionCode);
  const profileMeta = AID_RULES_2026.profils[profile];
  const eligibilityAlerts: string[] = [];

  if (input.foyer.residenceType && input.foyer.residenceType !== "principale") {
    return {
      ...emptyResult(
        input,
        "AIDES_NON_CALCULABLES",
        `Profil ${profileMeta.label} identifié, mais MaPrimeRénov’ Parcours exige une résidence principale.`,
        missing,
        ["Résidence secondaire : MPR Parcours non applicable.", "Validation MAR obligatoire."],
      ),
      profile,
      profileLabel: profileMeta.label,
    };
  }

  if (missing.includes("DPE actuel") || missing.includes("Gain DPE visé")) {
    return {
      ...emptyResult(
        input,
        "AIDES_NON_CALCULABLES",
        `Profil ${profileMeta.label} identifiable, mais les plafonds Parcours ne sont pas calculables sans DPE.`,
        missing,
        buildClyveAlerts(input, missing),
      ),
      profile,
      profileLabel: profileMeta.label,
      status: "AIDES_NON_CALCULABLES",
    };
  }

  if (input.foyer.residenceType == null || input.foyer.occupantType == null) {
    return {
      ...emptyResult(
        input,
        "AIDES_NON_CALCULABLES",
        `Profil ${profileMeta.label} identifiable, mais le statut d’occupation manque pour l’éligibilité.`,
        missing,
        buildClyveAlerts(input, missing),
      ),
      profile,
      profileLabel: profileMeta.label,
    };
  }

  const gain = gainClasses(input.foyer.dpeActuel, input.foyer.dpeVise);
  if (gain == null || gain < 2) {
    eligibilityAlerts.push("Gain DPE < 2 classes : Parcours Accompagné non retenu. Aucun forfait geste n’est additionné ici sans métrés validés.");
    return {
      ...emptyResult(
        input,
        "AIDES_NON_CALCULABLES",
        `Profil ${profileMeta.label} identifié. Gain DPE insuffisant ou non calculable pour un parcours.`,
        missing,
        [...eligibilityAlerts, "Validation MAR obligatoire."],
      ),
      profile,
      profileLabel: profileMeta.label,
    };
  }

  const works = classifyLots(input.lots);
  const eligible = works.filter((item) => item.eligibleMpr && item.montantHt && item.montantHt > 0);
  const eligibleHtRaw = round2(eligible.reduce((sum, item) => sum + (item.montantHt ?? 0), 0));
  const eligibleTtcRaw = round2(
    eligible.reduce((sum, item) => {
      return sum + item.montantTtc;
    }, 0),
  );
  const nonEligiblesTtc = round2(input.budgetTtc - eligibleTtcRaw);

  const troisClasses = gain >= 3;
  const plafondHt = troisClasses
    ? AID_RULES_2026.plafondsParcoursHt.troisClassesOuPlus
    : AID_RULES_2026.plafondsParcoursHt.deuxClasses;
  const depensesRetenuesHt = Math.min(eligibleHtRaw, plafondHt);
  const maxProfil = troisClasses ? profileMeta.max3classes : profileMeta.max2classes;

  let mpr = round2(depensesRetenuesHt * profileMeta.tauxParcours);
  mpr = Math.min(mpr, maxProfil);

  if (input.foyer.dpeActuel && ["F", "G"].includes(input.foyer.dpeActuel.toUpperCase()) && gain >= 2) {
    mpr = round2(mpr + AID_RULES_2026.bonus.sortiePassoire);
  }
  if (input.foyer.dpeVise && ["A", "B"].includes(input.foyer.dpeVise.toUpperCase())) {
    mpr = round2(mpr + AID_RULES_2026.bonus.bbc);
  }
  mpr = Math.min(mpr, maxProfil + AID_RULES_2026.bonus.maxCumul);

  let cee = 0;
  const lignes: AideLigne[] = [];
  for (const item of works) {
    if (!item.eligibleCee) continue;
    if (item.poste === "isolation_toiture" && item.surfaceM2) {
      const montant = round2(item.surfaceM2 * AID_RULES_2026.cee.isolationToitureEurM2.median);
      cee += montant;
      lignes.push({
        dispositif: "CEE",
        libelle: `Isolation toiture ${item.surfaceM2} m²`,
        montant,
        detail: `${AID_RULES_2026.cee.isolationToitureEurM2.median} €/m² (médiane ${AID_RULES_2026.cee.isolationToitureEurM2.min}–${AID_RULES_2026.cee.isolationToitureEurM2.max} €/m²). ${AID_RULES_2026.cee.variation}`,
      });
    }
    if (item.poste === "pac" && !/air[\s/\-]*air/i.test(item.libelle + (item.note ?? ""))) {
      const montant = AID_RULES_2026.cee.pacAirEau.median;
      cee += montant;
      lignes.push({
        dispositif: "CEE",
        libelle: "PAC air-eau",
        montant,
        detail: `Médiane ${AID_RULES_2026.cee.pacAirEau.min}–${AID_RULES_2026.cee.pacAirEau.max} €. Lot estimé, pas un devis.`,
      });
    }
    if (item.poste === "vmc" && /double flux|df/i.test(item.libelle + (item.note ?? ""))) {
      const montant = AID_RULES_2026.cee.vmcDf.median;
      cee += montant;
      lignes.push({
        dispositif: "CEE",
        libelle: "VMC double flux",
        montant,
        detail: `Médiane ${AID_RULES_2026.cee.vmcDf.min}–${AID_RULES_2026.cee.vmcDf.max} €.`,
      });
    }
  }
  const coupDePouce = troisClasses ? AID_RULES_2026.cee.coupDePouce.troisClassesOuPlus : AID_RULES_2026.cee.coupDePouce.deuxClasses;
  cee = round2(cee + coupDePouce);
  lignes.push({
    dispositif: "Autres",
    libelle: "Coup de pouce rénovation performante (indicatif)",
    montant: coupDePouce,
    detail: troisClasses ? "Gain 3 classes ou plus." : "Gain 2 classes.",
  });

  const locales = 0;
  let autres = coupDePouce;
  let totalAides = round2(mpr + (cee - coupDePouce) + locales + autres);

  const ecretementRate = AID_RULES_2026.ecretementTtc[profile];
  const plafondCumul = round2(eligibleTtcRaw * ecretementRate);
  const plafond100 = eligibleTtcRaw * AID_RULES_2026.cumul.maxRatioDepensesEligibles;
  let ecretementApplied = false;
  if (totalAides > Math.min(plafondCumul, plafond100)) {
    totalAides = round2(Math.min(plafondCumul, plafond100));
    ecretementApplied = true;
  }

  lignes.unshift({
    dispositif: "MaPrimeRénov'",
    libelle: `Parcours ${troisClasses ? "3 classes ou +" : "2 classes"} — ${profileMeta.label}`,
    montant: mpr,
    detail: `Taux ${Math.round(profileMeta.tauxParcours * 100)} % sur ${depensesRetenuesHt.toLocaleString("fr-FR")} € HT retenus (plafond ${plafondHt.toLocaleString("fr-FR")} € HT, max profil ${maxProfil.toLocaleString("fr-FR")} €).`,
  });

  const resteACharge = round2(Math.max(0, input.budgetTtc - totalAides));
  const housingOldEnough =
    input.foyer.constructionYear != null
      ? new Date().getFullYear() - input.foyer.constructionYear >= AID_RULES_2026.eligibilite.ancienneteMinimaleAns
      : Boolean(input.foyer.housingAgeLabel);

  const alerts = [
    AID_RULES_2026.disclaimer,
    "Estimation contrôlée — non contractuelle. Validation MAR obligatoire.",
    ...works.filter((item) => item.note).map((item) => item.note as string),
    nonEligiblesTtc > 0 ? `Dépenses hors éligibilité MPR (maçonnerie, PV, lots mixtes) : ${nonEligiblesTtc.toLocaleString("fr-FR")} € TTC restent à charge.` : "",
    ecretementApplied ? `Écrêtement ${Math.round(ecretementRate * 100)} % appliqué (profil ${profile}).` : "",
    lotsClasses.estimes.length > 0 ? "Des lots estimés sont inclus dans l’assiette éligible : à remplacer par des devis RGE." : "",
    lotsClasses.hypotheses.length > 0 ? "Des hypothèses non documentées sont exclues de MaPrimeRénov’." : "",
    UMAFI.mentionConventionB,
  ].filter(Boolean);

  return {
    calculable: true,
    status: "CALCUL_CONTROLE",
    profile,
    profileLabel: profileMeta.label,
    profileMessage: `Profil déterminé d’après le RFR ${input.foyer.rfr?.toLocaleString("fr-FR")} €, ${input.foyer.householdSize} personne(s), barème ${AID_RULES_2026.version}.`,
    baremeVersion: AID_RULES_2026.version,
    missingFields: missing.filter((item) => {
      if (item === "Entreprise RGE associée" && input.foyer.rgeCompany) return false;
      if (item === "Type de parcours d’aide" && input.foyer.parcoursType && input.foyer.parcoursType !== "non_determine") {
        return false;
      }
      return true;
    }),
    alerts,
    travauxDocumentesTtc: round2(lotsClasses.documentes.reduce((sum, lot) => sum + lot.montantTtc, 0)),
    travauxEstimesTtc: round2(lotsClasses.estimes.reduce((sum, lot) => sum + lot.montantTtc, 0)),
    travauxHypothesesTtc: round2(lotsClasses.hypotheses.reduce((sum, lot) => sum + lot.montantTtc, 0)),
    depensesEligiblesHt: depensesRetenuesHt,
    depensesEligiblesTtc: eligibleTtcRaw,
    depensesNonEligiblesTtc: nonEligiblesTtc,
    plafondDepensesHt: plafondHt,
    mpr,
    cee: round2(cee - coupDePouce),
    locales,
    autres,
    totalAides,
    resteACharge,
    ecretementApplied,
    ecoPtzPossible: input.foyer.residenceType === "principale" && housingOldEnough,
    ecoPtzMessage: input.foyer.residenceType === "principale" && housingOldEnough
      ? `${UMAFI.ecoPtzIndisponible} Plafond théorique Éco-PTZ rénovation globale : ${AID_RULES_2026.ecoPtz.troisOuGlobal.toLocaleString("fr-FR")} €. ${UMAFI.mensualiteDisclaimer}`
      : UMAFI.ecoPtzIndisponible,
    lignes,
    lotsClasses,
  };
}

export function sumBySource(lots: WorkItem[], source: WorkItem["source"]): number {
  return round2(lots.filter((lot) => lot.source === source).reduce((sum, lot) => sum + lot.montantTtc, 0));
}

export function profileBadgeClass(profile: ProfilMpr | null): string {
  if (!profile) return "bg-slate-200 text-slate-800 border-slate-400";
  const map: Record<ProfilMpr, string> = {
    bleu: "bg-sky-100 text-sky-950 border-sky-300",
    jaune: "bg-amber-100 text-amber-950 border-amber-300",
    violet: "bg-violet-100 text-violet-950 border-violet-300",
    rose: "bg-rose-100 text-rose-950 border-rose-300",
  };
  return map[profile];
}
