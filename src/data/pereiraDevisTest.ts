/**
 * Devis de test AUDIT-PEREIRA-2026-001 — bouquet client septembre 2026.
 * Surfaces confirmées : combles 60 m² déroulés R ≥ 7 ; plancher bas 19 m² R ≥ 3.
 * ITI 270 m², PAC, menuiseries ALUMINIUM et VMC inchangés.
 * Coordination figée (plus-value aluminium déjà absorbée) — le total suit les surfaces.
 * Hors dossier Royer.
 */

import { AVERTISSEMENT_TVA, CONDITIONS_PAIEMENT_DEVIS } from "../lib/chiffrage/constantes";
import { formatEuro } from "../lib/chiffrage/format";
import {
  roundEuro,
  totauxDevisClient,
  type DevisClientPdfEtudeFinanciere,
  type DevisClientPdfGesteCommercial,
  type DevisClientPdfInput,
  type DevisClientPdfLigne,
} from "../lib/generateDevisPdf";
import { PEREIRA_AUDIT_ID, PEREIRA_IDENTITE } from "./pereiraAuditExtract";
import {
  PEREIRA_COMBLES_RESISTANCE,
  PEREIRA_COMBLES_SURFACE_M2,
  PEREIRA_COMBLES_TTC,
  PEREIRA_ITI_NOM,
  PEREIRA_ITI_SURFACE_M2,
  PEREIRA_ITI_TTC_AUDIT,
  PEREIRA_PLANCHER_RESISTANCE,
  PEREIRA_PLANCHER_SURFACE_M2,
  PEREIRA_PLANCHER_TTC,
} from "./pereiraItiEstimation";

const TAUX_TVA_TRAVAUX = 0.055;
const TAUX_TVA_ADMIN = 0.2;

export const PEREIRA_VMC_TTC = 1500;
export const PEREIRA_REMISE_COMMERCIALE_TTC = 1500;
export const PEREIRA_MPR_PARCOURS_TTC = 20000;
/** Honoraires figés après absorption de la plus-value aluminium — ne pas rééquilibrer sur un forfait commercial fixe. */
export const PEREIRA_COORDINATION_TTC = 1672.76;
export const PEREIRA_PROFIL_MPR = "Violet";
export const PEREIRA_PLAFOND_MPR_HT = 40000;
export const PEREIRA_TAUX_MPR_VIOLET = 0.5;
export const PEREIRA_ECO_PTZ_MONTANT = 50000;
export const PEREIRA_ECO_PTZ_DUREE_ANS = 20;
export const PEREIRA_ECO_PTZ_MENSUALITE = 208.33;
export const PEREIRA_APPORT_PERSONNEL = 5000;
export const PEREIRA_PRET_RELAIS_ANAH = 20000;
export const PEREIRA_EPARGNE_SECURITE = 12000;

function champ(label: string): string {
  return PEREIRA_IDENTITE.find((item) => item.label === label)?.valeur ?? "";
}

function ligneDepuisTtc(params: {
  designation: string;
  description: string;
  quantite: number;
  unite: string;
  ttc: number;
  tauxTva?: number;
}): DevisClientPdfLigne {
  const tauxTva = params.tauxTva ?? TAUX_TVA_TRAVAUX;
  const ttc = roundEuro(params.ttc);
  const ht = roundEuro(ttc / (1 + tauxTva));
  const tva = roundEuro(ttc - ht);
  const quantite = params.quantite > 0 ? params.quantite : 1;
  return {
    designation: params.designation,
    description: params.description,
    quantite,
    unite: params.unite,
    prixUnitaireHt: roundEuro(ht / quantite),
    montantHt: ht,
    tauxTva,
    montantTva: tva,
    montantTtc: ttc,
  };
}

export const PEREIRA_CLIENT_NOM = "M. Pereira";
export const PEREIRA_ADRESSE_CHANTIER = champ("Adresse du bien (audit)");
export const PEREIRA_ADRESSE_FACTURATION = champ("Adresse du propriétaire (audit)");
export const PEREIRA_DEVIS_NUMERO = `DEV-2026-${PEREIRA_AUDIT_ID}`;

export const PEREIRA_LIBELLE_PROJET = "Rénovation énergétique d'ampleur";

export const PEREIRA_OBJET_TRAVAUX =
  "Rénovation énergétique d'ampleur de votre maison de 164 m² à Nervieux (42), visant un gain de 5 classes DPE (F à A) grâce à un bouquet de travaux performants. Remplacement de la chaudière fioul par une PAC air/eau haute température double service (chauffage + ECS) : pas de ballon thermodynamique séparé. Estimation à confirmer par devis artisan RGE.";

export const PEREIRA_PAC_DESIGNATION =
  "Remplacement chaudière fioul par PAC air/eau haute température double service";

export const PEREIRA_PAC_DESCRIPTION =
  "PAC air/eau haute température assurant le chauffage et la production d’eau chaude sanitaire. Dépose de la chaudière fioul, des équipements associés et du ballon séparé si confirmé. Dépose et évacuation de la chaudière et de la cuve fioul, selon contraintes du site. Puissance 12 kW : estimation issue de l’audit, à confirmer. Dimensionnement définitif après isolation et validation par l’installateur. Estimation à confirmer par devis artisan RGE.";

export const PEREIRA_STATUT_DEVIS =
  "ESTIMATION — NON CONTRACTUELLE — estimation à confirmer par devis artisan RGE";

/** Lots travaux (hors ballon thermodynamique, hors coordination). */
export const PEREIRA_DEVIS_LIGNES_TRAVAUX: DevisClientPdfLigne[] = [
  ligneDepuisTtc({
    designation: "Menuiseries ALUMINIUM Uw ≤ 1,30",
    description:
      "Aluminium avec rupture de pont thermique. 7 fenêtres + 2 portes. Coloris blanc indicatif. Surface des ouvrants à confirmer en visite.",
    quantite: 9,
    unite: "unite",
    ttc: 8552.24,
  }),
  ligneDepuisTtc({
    designation: PEREIRA_ITI_NOM,
    description: `ITI 12 cm, R ≥ 3,70. ${PEREIRA_ITI_SURFACE_M2} m² (audit). Matériau perspirant (pisé).`,
    quantite: PEREIRA_ITI_SURFACE_M2,
    unite: "m2",
    ttc: PEREIRA_ITI_TTC_AUDIT,
  }),
  ligneDepuisTtc({
    designation: "Isolation combles, R ≥ 7",
    description: `Isolation des combles perdus, ${PEREIRA_COMBLES_SURFACE_M2} m² de surface déroulée, ${PEREIRA_COMBLES_RESISTANCE}.`,
    quantite: PEREIRA_COMBLES_SURFACE_M2,
    unite: "m2",
    ttc: PEREIRA_COMBLES_TTC,
  }),
  ligneDepuisTtc({
    designation: "Isolation plancher, R ≥ 3",
    description: `Plancher bas / dalle sur sous-sol, ${PEREIRA_PLANCHER_SURFACE_M2} m², ${PEREIRA_PLANCHER_RESISTANCE}.`,
    quantite: PEREIRA_PLANCHER_SURFACE_M2,
    unite: "m2",
    ttc: PEREIRA_PLANCHER_TTC,
  }),
  ligneDepuisTtc({
    designation: "VMC Hygro B — fourniture et pose",
    description: "Simple flux hygroréglable type B, après isolation. Montant TTC : 1 500,00 €.",
    quantite: 1,
    unite: "forfait",
    ttc: PEREIRA_VMC_TTC,
  }),
  ligneDepuisTtc({
    designation: PEREIRA_PAC_DESIGNATION,
    description: PEREIRA_PAC_DESCRIPTION,
    quantite: 1,
    unite: "forfait",
    ttc: 14000,
  }),
  ligneDepuisTtc({
    designation: "Travaux induits",
    description: "Dépose menuiseries et remises en état électrique / plomberie.",
    quantite: 1,
    unite: "forfait",
    ttc: 126,
  }),
];

function ligneCoordinationFigee(): DevisClientPdfLigne {
  return ligneDepuisTtc({
    designation: "Coordination et pilotage",
    description: "AMO, sélection artisans RGE, planning et suivi jusqu’à réception.",
    quantite: 1,
    unite: "forfait",
    ttc: PEREIRA_COORDINATION_TTC,
    tauxTva: TAUX_TVA_ADMIN,
  });
}

export const PEREIRA_DEVIS_LIGNES_TEST: DevisClientPdfLigne[] = [
  ...PEREIRA_DEVIS_LIGNES_TRAVAUX,
  ligneCoordinationFigee(),
];

export function totauxLignesPereira(lignes: DevisClientPdfLigne[] = PEREIRA_DEVIS_LIGNES_TEST) {
  const totalHt = roundEuro(lignes.reduce((acc, item) => acc + (item.montantHt ?? 0), 0));
  const totalTva = roundEuro(lignes.reduce((acc, item) => acc + (item.montantTva ?? 0), 0));
  const totalTtc = roundEuro(lignes.reduce((acc, item) => acc + (item.montantTtc ?? 0), 0));
  return { totalHt, totalTva, totalTtc };
}

export const PEREIRA_TOTAL_VENTE_TTC = totauxLignesPereira().totalTtc;
export const PEREIRA_TOTAL_NET_TTC = roundEuro(PEREIRA_TOTAL_VENTE_TTC - PEREIRA_REMISE_COMMERCIALE_TTC);
export const PEREIRA_RAC_NET_TTC = roundEuro(PEREIRA_TOTAL_NET_TTC - PEREIRA_MPR_PARCOURS_TTC);
/** RAC théorique présenté au financement : total TTC avant remise − MPR (hors geste commercial). */
export const PEREIRA_RAC_THEORIQUE_TTC = roundEuro(PEREIRA_TOTAL_VENTE_TTC - PEREIRA_MPR_PARCOURS_TTC);

export const PEREIRA_GESTE_COMMERCIAL: DevisClientPdfGesteCommercial = {
  titre: "Geste commercial exceptionnel",
  vmcLibelle: "VMC Hygro B — fourniture et pose",
  vmcMontantTtc: PEREIRA_VMC_TTC,
  remiseLibelle: "Remise accordée sur les honoraires de coordination et de pilotage",
  remiseMontantTtc: PEREIRA_REMISE_COMMERCIALE_TTC,
  mention:
    "La remise commerciale est acquise uniquement dans le cadre de l'acceptation du présent devis. Elle ne constitue pas une aide publique, un CEE ou une subvention MaPrimeRénov'. Les aides éventuelles sont calculées et instruites sur la base des dépenses réellement facturées et payées. Elles restent soumises à l'éligibilité du ménage, aux critères techniques et à l'acceptation de l'organisme compétent.",
};

export const PEREIRA_ETUDE_FINANCIERE: DevisClientPdfEtudeFinanciere = {
  profil: `Profil ${PEREIRA_PROFIL_MPR} — MaPrimeRénov’ Parcours Accompagné (barème septembre 2026)`,
  aides: [
    {
      libelle: `MaPrimeRénov’ Parcours (${PEREIRA_TAUX_MPR_VIOLET * 100} % du plafond ${PEREIRA_PLAFOND_MPR_HT.toLocaleString("fr-FR")} € HT, hors bonus)`,
      montant: PEREIRA_MPR_PARCOURS_TTC,
    },
  ],
  totalAides: PEREIRA_MPR_PARCOURS_TTC,
  resteACharge: PEREIRA_RAC_NET_TTC,
  disclaimers: [
    "Aides financières 2026 (estimation à titre indicatif).",
    "Aides à valider selon revenus réels du client et éligibilité en vigueur.",
    "Montants définitifs après instruction ANAH et CEE.",
  ],
  financementTitre: "Solutions de financement (simulations indicatives à valider)",
  financement: [],
  solutionsExclusives: {
    separateur: "OU",
    optionA: {
      code: "A",
      titre: "Éco-PTZ + Préfinancement de l'aide",
      sousTitre: "Idéal si vous n'avez pas de crédits en cours importants",
      blocs: [
        {
          titre: "1. Financement du Reste à Charge",
          lignes: [
            {
              libelle: "Éco-PTZ (Prêt d'État à Taux 0% - via votre banque partenaire)",
              detail: `${formatEuro(PEREIRA_ECO_PTZ_MONTANT)} (Mensualité indicative : ${formatEuro(PEREIRA_ECO_PTZ_MENSUALITE)} / mois sur ${PEREIRA_ECO_PTZ_DUREE_ANS} ans)`,
            },
            {
              libelle: "Apport personnel (Épargne client)",
              detail: formatEuro(PEREIRA_APPORT_PERSONNEL),
            },
          ],
          note: `Reste à charge après remise : ${formatEuro(PEREIRA_RAC_NET_TTC)}. RAC théorique hors geste commercial : ${formatEuro(PEREIRA_RAC_THEORIQUE_TTC)}. Couvert par Éco-PTZ ${formatEuro(PEREIRA_ECO_PTZ_MONTANT)} + apport ${formatEuro(PEREIRA_APPORT_PERSONNEL)}.`,
        },
        {
          titre: "2. Préfinancement de l'aide ANAH (Période d'attente de 6 à 12 mois)",
          lignes: [
            {
              libelle: "Prêt de trésorerie complémentaire / relais UMAFI",
              detail: `${formatEuro(PEREIRA_PRET_RELAIS_ANAH)} (Recherche de financement par notre partenaire Fabien - UMAFI pour couvrir l'échéancier pendant les travaux, remboursable en une fois à la réception de votre aide de l'Anah).`,
            },
          ],
        },
      ],
    },
    optionB: {
      code: "B",
      titre: "Regroupement de crédits global UMAFI",
      sousTitre: "Idéal si vous avez déjà des crédits immo, auto ou conso en cours",
      blocs: [
        {
          lignes: [
            {
              libelle: "Regroupement de crédits global",
              detail: `Notre partenaire courtier Fabien (UMAFI - ORIAS 26 009 255) étudie l'intégration complète de l'enveloppe de travaux de ${formatEuro(PEREIRA_TOTAL_VENTE_TTC)} dans vos encours de crédits actuels.`,
            },
          ],
          note: "Objectif : Lisser l'intégralité du projet de rénovation en une seule mensualité unique et optimisée, sans impacter votre reste à vivre.",
        },
      ],
    },
  },
  mentionFinancement:
    "Études de financement réalisées sous réserve d'acceptation définitive par les partenaires financiers. Aucun accord de prêt ou de regroupement n'est garanti avant étude complète du dossier.",
};

export function construireDevisPereiraTest(): DevisClientPdfInput {
  const brut = totauxLignesPereira();
  if (brut.totalTtc !== PEREIRA_TOTAL_VENTE_TTC) {
    throw new Error(`Total TTC Pereira ${brut.totalTtc} ≠ ${PEREIRA_TOTAL_VENTE_TTC}`);
  }
  if (PEREIRA_DEVIS_LIGNES_TEST.some((ligne) => /ballon thermodynamique/i.test(`${ligne.designation} ${ligne.description}`))) {
    throw new Error("Le devis Pereira ne doit plus contenir de ballon thermodynamique.");
  }
  if (!PEREIRA_DEVIS_LIGNES_TEST.some((ligne) => /VMC Hygro B — fourniture et pose/i.test(ligne.designation))) {
    throw new Error("La ligne VMC Hygro B — fourniture et pose est absente du devis Pereira.");
  }

  if (PEREIRA_DEVIS_LIGNES_TEST.filter((ligne) => /PAC air\/eau/i.test(ligne.designation)).length !== 1) {
    throw new Error("Le devis Pereira doit contenir une seule ligne PAC air/eau double service.");
  }
  const lignePac = PEREIRA_DEVIS_LIGNES_TEST.find((ligne) => ligne.designation === PEREIRA_PAC_DESIGNATION);
  if (!lignePac) {
    throw new Error("La désignation PAC fioul → air/eau HT double service est absente.");
  }
  if (lignePac.montantTtc !== 14000) {
    throw new Error("Le montant TTC de la ligne PAC Pereira a été modifié sans validation.");
  }
  if (!/12 kW/i.test(lignePac.description) || !/estimation issue de l['’]audit/i.test(lignePac.description)) {
    throw new Error("La puissance 12 kW issue de l’audit (à confirmer) est absente de la ligne PAC.");
  }
  if (!/cuve fioul/i.test(lignePac.description) || !/Dépose/i.test(lignePac.description)) {
    throw new Error("La dépose / évacuation chaudière et cuve fioul est absente de la ligne PAC.");
  }
  if (
    /Daikin|Atlantic|Viessmann|Mitsubishi|Panasonic|Hitachi|Vaillant|Bosch|Altherma|Auer|Nibe/i.test(
      `${lignePac.designation} ${lignePac.description}`,
    )
  ) {
    throw new Error("Aucune marque ni modèle de PAC ne doit être inventé.");
  }
  if (!/estimation à confirmer par devis artisan RGE/i.test(`${lignePac.description} ${PEREIRA_STATUT_DEVIS}`)) {
    throw new Error("Le statut « estimation à confirmer par devis artisan RGE » est absent.");
  }
  const ligneMenuiseries = PEREIRA_DEVIS_LIGNES_TEST.find((ligne) => /menuiseries/i.test(ligne.designation));
  if (!ligneMenuiseries) {
    throw new Error("La ligne Menuiseries est absente du devis Pereira.");
  }
  if (/PVC/i.test(`${ligneMenuiseries.designation} ${ligneMenuiseries.description}`)) {
    throw new Error("Le devis Pereira ne doit plus mentionner du PVC pour les menuiseries.");
  }
  if (!/ALUMINIUM/i.test(ligneMenuiseries.designation) || !/rupture de pont thermique/i.test(ligneMenuiseries.description ?? "")) {
    throw new Error("Les menuiseries Pereira doivent être en ALUMINIUM avec rupture de pont thermique.");
  }
  if (ligneMenuiseries.prixUnitaireHt !== 900.71) {
    throw new Error(`Prix unitaire HT menuiseries Pereira ${ligneMenuiseries.prixUnitaireHt} ≠ 900,71 €.`);
  }
  if (ligneMenuiseries.montantHt !== 8106.39) {
    throw new Error(`Total HT menuiseries Pereira ${ligneMenuiseries.montantHt} ≠ 8 106,39 €.`);
  }
  const ligneCombles = PEREIRA_DEVIS_LIGNES_TEST.find((ligne) => /isolation combles/i.test(ligne.designation));
  if (!ligneCombles || ligneCombles.quantite !== PEREIRA_COMBLES_SURFACE_M2 || ligneCombles.montantTtc !== PEREIRA_COMBLES_TTC) {
    throw new Error("Les combles Pereira doivent rester à 60 m² déroulés (prorata du forfait 2 500 € TTC).");
  }
  const lignePlancher = PEREIRA_DEVIS_LIGNES_TEST.find((ligne) => /isolation plancher/i.test(ligne.designation));
  if (!lignePlancher || lignePlancher.quantite !== PEREIRA_PLANCHER_SURFACE_M2 || lignePlancher.montantTtc !== PEREIRA_PLANCHER_TTC) {
    throw new Error("Le plancher Pereira doit rester à 19 m² (prorata du forfait 10 445 € TTC).");
  }
  const ligneIti = PEREIRA_DEVIS_LIGNES_TEST.find((ligne) => ligne.designation.includes("ITI 12 cm"));
  if (!ligneIti || ligneIti.quantite !== 270 || ligneIti.montantTtc !== PEREIRA_ITI_TTC_AUDIT) {
    throw new Error("L’ITI Pereira 270 m² ne doit pas être modifiée.");
  }
  const ligneCoordination = PEREIRA_DEVIS_LIGNES_TEST.find((ligne) => /coordination et pilotage/i.test(ligne.designation));
  if (!ligneCoordination || ligneCoordination.montantTtc !== PEREIRA_COORDINATION_TTC) {
    throw new Error("Les honoraires de coordination Pereira ne doivent pas être rééquilibrés.");
  }
  if (PEREIRA_MPR_PARCOURS_TTC !== 20000) {
    throw new Error("MaPrimeRénov’ Parcours Pereira doit rester à 20 000,00 € (recalcul prudent).");
  }
  const optionA = PEREIRA_ETUDE_FINANCIERE.solutionsExclusives?.optionA;
  const optionB = PEREIRA_ETUDE_FINANCIERE.solutionsExclusives?.optionB;
  const texteA = JSON.stringify(optionA ?? {});
  const texteB = JSON.stringify(optionB ?? {});
  if (!/via votre banque partenaire/i.test(texteA) || !texteA.includes(formatEuro(PEREIRA_RAC_NET_TTC))) {
    throw new Error("L’option A du financement Pereira n’est pas à jour (banque partenaire / RAC après remise).");
  }
  if (!/hors geste commercial/i.test(texteA) || !texteA.includes(formatEuro(PEREIRA_RAC_THEORIQUE_TTC))) {
    throw new Error("L’option A doit distinguer le RAC après remise du RAC théorique hors geste commercial.");
  }
  if (!/ORIAS 26 009 255/i.test(texteB) || !texteB.includes(formatEuro(PEREIRA_TOTAL_VENTE_TTC))) {
    throw new Error("L’option B du financement Pereira doit porter sur le nouveau total TTC (ORIAS UMAFI).");
  }
  if (!/sous réserve d'acceptation définitive par les partenaires financiers/i.test(PEREIRA_ETUDE_FINANCIERE.mentionFinancement ?? "")) {
    throw new Error("La mention de prudence du financement Pereira est absente ou incomplète.");
  }
  const texteClient = [
    JSON.stringify(PEREIRA_ETUDE_FINANCIERE),
    PEREIRA_OBJET_TRAVAUX,
    PEREIRA_DEVIS_LIGNES_TEST.map((ligne) => `${ligne.designation} ${ligne.description}`).join(" "),
  ].join(" ");
  if (/75[\s\u00a0]?000|73[\s\u00a0]?500|55[\s\u00a0]?000|53[\s\u00a0]?500/.test(texteClient)) {
    throw new Error("Un ancien montant 75 000 / 73 500 / 55 000 / 53 500 apparaît encore dans le devis Pereira.");
  }

  const brouillon: DevisClientPdfInput = {
    numero: PEREIRA_DEVIS_NUMERO,
    date: new Date().toLocaleDateString("fr-FR"),
    validite: CONDITIONS_PAIEMENT_DEVIS.validite,
    clientNom: PEREIRA_CLIENT_NOM,
    clientAdresse: PEREIRA_ADRESSE_CHANTIER,
    clientEmail: undefined,
    clientTelephone: undefined,
    adresseFacturation: PEREIRA_ADRESSE_FACTURATION,
    referenceDossier: PEREIRA_AUDIT_ID,
    statut: PEREIRA_STATUT_DEVIS,
    libelleProjet: PEREIRA_LIBELLE_PROJET,
    objetTravaux: PEREIRA_OBJET_TRAVAUX,
    introductionProjet: PEREIRA_OBJET_TRAVAUX,
    lignes: PEREIRA_DEVIS_LIGNES_TEST,
    totalHt: brut.totalHt,
    totalTva: brut.totalTva,
    totalTtc: brut.totalTtc,
    mentionTva: `${AVERTISSEMENT_TVA} TVA 5,5 % sur les travaux de rénovation, 20 % sur la coordination et les frais administratifs.`,
    etudeFinanciere: PEREIRA_ETUDE_FINANCIERE,
    gesteCommercial: PEREIRA_GESTE_COMMERCIAL,
    modeCompact: true,
    filename: `Devis_${PEREIRA_AUDIT_ID}.pdf`,
  };

  const totaux = totauxDevisClient(brouillon);
  if (totaux.totalTtc !== PEREIRA_TOTAL_NET_TTC) {
    throw new Error(`Total TTC net Pereira ${totaux.totalTtc} ≠ ${PEREIRA_TOTAL_NET_TTC}`);
  }
  if (totaux.remiseCommercialeTtc !== PEREIRA_REMISE_COMMERCIALE_TTC) {
    throw new Error("La remise commerciale de 1 500,00 € TTC est absente.");
  }

  return {
    ...brouillon,
    totalHt: totaux.totalHt,
    totalTva: totaux.totalTva,
    totalTtc: totaux.totalTtc,
  };
}
