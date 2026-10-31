/**
 * Rapport d'ingénierie technique, phasage & marché de travaux — Longère La Genête.
 * Contenu des 5 pages du document client. Les chiffres viennent tous de longereLaGenete.ts :
 * ce fichier ne recalcule rien, il met en récit.
 */

import {
  ANNEXE_COUPE_3D,
  CONTACTS_PROJET,
  MENTIONS_AIDES,
  MODULES_TRAVEES,
  PHASE_4,
  PHASES,
  PRIORITES_VISITE,
  PROJET_LONGERE,
  genererOffre,
  sommeSurfacesModules,
  type FigureAnnexe,
} from "./longereLaGenete";

export const EMETTEUR_RAPPORT = {
  nom: "ENERGIA-CONSEIL IA®",
  slogan: "Audit Énergétique Intelligence Artificielle — Bureau d'études & Contractant Général",
  adresse: "16 Rue Cuvier, 69006 Lyon",
  forme: "SASU au capital de 100 €",
  siret: "94181942700019",
  rcs: "Lyon 941819427",
  inpi: "5213845",
  telephone: "06 10 59 68 98",
  email: "contact@energia-conseil-ia.com",
  site: "www.energia-conseil-ia.com",
  logoSrc: "/assets/LOGO.png",
} as const;

export const TITRE_RAPPORT = "RAPPORT D'INGÉNIERIE TECHNIQUE, PHASAGE & MARCHÉ DE TRAVAUX";

export const NOM_FICHIER_RAPPORT = "Rapport_Ingenierie_Longere_La_Genete_DEV-2026-LAGENETE-P1.pdf";

/** Page 1 — couverture. */
export const COUVERTURE = {
  titre: TITRE_RAPPORT,
  bien: `Longère bressane de ${PROJET_LONGERE.longueurFacadeM.toLocaleString("fr-FR")} mètres linéaires — ${PROJET_LONGERE.codePostal} ${PROJET_LONGERE.commune}`,
  maitreOuvrage: `Mme ${PROJET_LONGERE.client} — ${PROJET_LONGERE.cabinet}`,
  adresse: `${PROJET_LONGERE.adresse}, ${PROJET_LONGERE.codePostal} ${PROJET_LONGERE.commune}`,
  date: PROJET_LONGERE.dateLibelle,
  reference: `${PROJET_LONGERE.numeroBase}-P1`,
  mentionConfidentialite:
    "Document confidentiel, établi pour le maître d'ouvrage désigné. Reproduction et cession interdites. Année de référence 2026.",
} as const;

/** Page 2 — état des lieux. */
export const PHOTO_FACADE = {
  src: "/test-maison-clyve/facade-avant.png",
  legende: "Façade existante avant travaux — longère en pisé sur soubassement pierre et brique, couverture tuiles canal.",
} as const;

export const ANALYSE_BATI = [
  {
    titre: "Pisé traditionnel sur soubassement pierre et brique",
    texte: `Bâti bressan en terre crue banchée, monté sur un soubassement de pierre et de brique. Murs de refend maçonnés de ${PROJET_LONGERE.epaisseurRefendsCm} cm d'épaisseur, qui portent la charpente à pannes. Faîtage à ${PROJET_LONGERE.hauteurFaitageM.toLocaleString("fr-FR")} m, égout à ${PROJET_LONGERE.hauteurEgoutM.toLocaleString("fr-FR")} m. Le pisé est perspirant : il impose des matériaux qui laissent sécher la paroi et interdit l'enduit ciment, la ceinture étanche et toute source d'humidité permanente.`,
  },
  {
    titre: "Pathologie de la toiture",
    texte:
      "Travées B à D : pannes dégradées et charges de couverture mal reprises en tête de murs en terre. L'absence de sablières continues concentre les efforts sur des têtes de murs déjà fragilisées. Défaut d'étanchéité constaté. La mise hors d'eau ne peut pas attendre le printemps, sous peine d'aggraver la dissolution du pisé en tête de mur.",
  },
  {
    titre: "Conséquence sur l'ordre des travaux",
    texte:
      "La structure et le hors d'eau précèdent l'isolation, qui précède le chauffage. Dimensionner une pompe à chaleur ou poser une VMC avant l'isolation de toiture conduirait à un surdimensionnement et à la perte de l'éligibilité aux aides.",
  },
] as const;

export const MODULES_RAPPORT = MODULES_TRAVEES;
export const SOMME_MODULES_M2 = sommeSurfacesModules();
export const SURFACE_PLAN_M2 = PROJET_LONGERE.surfaceHabitablePlanM2;
export const ECART_SURFACE_M2 = Math.round((SURFACE_PLAN_M2 - SOMME_MODULES_M2) * 10) / 10;

export const NOTE_SURFACES = `Somme des six modules : ${SOMME_MODULES_M2.toLocaleString("fr-FR")} m². Surface portée au plan d'architecte : ${SURFACE_PLAN_M2.toLocaleString("fr-FR")} m². Écart de ${ECART_SURFACE_M2.toLocaleString("fr-FR")} m² à recouper au métré sur site.`;

/** Les trois urgences du cadre rouge, reprises des priorités de visite. */
export const CADRE_URGENCE = PRIORITES_VISITE.filter((item) => item.rang <= 3);

/** Page 3 — projections visuelles. */
export const FIGURES_RAPPORT: FigureAnnexe[] = [...ANNEXE_COUPE_3D.figures];
export const TITRE_PAGE_PROJECTIONS = "PROJECTIONS VISUELLES & COUPE 3D ARCHITECTURALE";

/** Page 4 — feuille de route. */
export type EtapeFeuilleRoute = {
  id: 1 | 2 | 3 | 4;
  nom: string;
  echeance: string;
  contenu: string;
  montant: string;
  aide: string | null;
};

const offrePhase1 = genererOffre("phase1");
const offrePhase1et2 = genererOffre("phase1et2");

export const OFFRE_PHASE_1 = offrePhase1;
export const OFFRE_PHASE_1_ET_2 = offrePhase1et2;

export const FEUILLE_DE_ROUTE: EtapeFeuilleRoute[] = [
  {
    id: 1,
    nom: PHASES[0].nom,
    echeance: "Immédiat — avant l'hiver",
    contenu:
      "Mise hors d'eau de la toiture des travées B à D : sablières continues en tête de murs en pisé, reprise des pannes dégradées, voligeage continu et bâche armée renforcée. Sécurisation de la plomberie urgente : étanchéité nourrice, groupe de sécurité du ballon 200 L, calorifugeage du compteur, clapet aérateur.",
    montant: "8 850,00 € HT — 9 735,00 € TTC",
    aide: null,
  },
  {
    id: 2,
    nom: PHASES[1].nom,
    echeance: "Confort familial — dans la foulée",
    contenu:
      "Plancher haut bois du module B (44,3 m²) : muralières sur refends, solives 75 × 225, dalles OSB 3. Attentes eau froide et évacuation de la future cuisine du module B.",
    montant: "6 000,00 € HT",
    aide: null,
  },
  {
    id: 3,
    nom: PHASES[2].nom,
    echeance: "Consolidation — après la phase 2",
    contenu:
      "Consolidation des planchers hauts des modules C et D, reprise du décalage de niveau côté C, trémie d'escalier conservée. Attentes salle de bain et WC du module C.",
    montant: "4 200,00 € HT",
    aide: null,
  },
  {
    id: 4,
    nom: PHASE_4.nom,
    echeance: "Printemps — parcours accompagné MAR / Anah",
    contenu:
      "Couverture en tuiles canal bressanes neuves, isolation de toiture en sarking, VMC, pompe à chaleur air-eau et chauffe-eau thermodynamique. Dimensionnements calculés après isolation.",
    montant: "69 000,00 € HT — 72 795,00 € TTC",
    aide: "80 % de prise en charge financière (Profil Anah Bleu — Très Modeste). Subvention Anah directe estimée : 55 200 € à 56 000 €. Reste à charge prévisionnel estimé : ~13 600 € à 17 595 € TTC (finançable via Éco-PTZ à taux 0 % par Vivons Courtier). Montants et taux réels selon la Loi de Finances et les barèmes Anah 2027, instruction MAR Cabinet C2ET.",
  },
];

export const MENTIONS_AIDES_RAPPORT = [...MENTIONS_AIDES];

export const REGLE_ANAH =
  "Les travaux énergétiques de la phase 4 ne démarrent qu'après l'accord écrit de l'ANAH. Signer un devis énergétique définitif avant cet accord entraîne la perte définitive et irrémédiable de MaPrimeRénov'. Les travaux d'urgence de la Phase 1 sont indépendants et non conditionnés à l'accord d'aides de la Phase 4 : le présent marché d'urgence peut être signé immédiatement.";

/** Page 5 — marché chiffré. */
export const OPTIONS_MARCHE = [
  {
    id: "option-1",
    libelle: "Option 1 — Phase 1 seule",
    detail: "Mise hors d'eau des travées B à D et sécurisation de la plomberie avant l'hiver.",
    numero: offrePhase1.numero,
    totalHt: offrePhase1.totalHt,
    totalTva: offrePhase1.totalTva,
    totalTtc: offrePhase1.totalTtc,
    echeancier: offrePhase1.echeancier,
  },
  {
    id: "option-2",
    libelle: "Option 2 — Phases 1 et 2",
    detail: "Ajoute le plancher haut bois du module B et les attentes cuisine.",
    numero: offrePhase1et2.numero,
    totalHt: offrePhase1et2.totalHt,
    totalTva: offrePhase1et2.totalTva,
    totalTtc: offrePhase1et2.totalTtc,
    echeancier: offrePhase1et2.echeancier,
  },
] as const;

/**
 * Libellé imposé par les règles ENERGIA : le 40 % est conditionné à la validation
 * de Sylvain LEMBELEMBE, pas au simple démarrage du chantier.
 */
export const MODALITES_REGLEMENT = [
  "30 % à la commande, à la signature du marché.",
  "40 % en cours de chantier, uniquement après validation de Sylvain LEMBELEMBE (point d'avancement, conformité, respect de l'ordre des travaux). Règlement sous 5 à 10 jours ouvrés après feu vert.",
  "30 % à la réception des travaux, constat de bonne fin signé.",
] as const;

export const MENTION_REGLEMENT =
  "Paiement par déblocage progressif 30/40/30 : 30 % à la signature, 40 % mi-chantier après validation de Sylvain LEMBELEMBE (contractant général — ENERGIA-CONSEIL IA®), 30 % à réception.";

export const CONTACTS_RAPPORT = CONTACTS_PROJET;

export const CADRE_SIGNATURE = {
  titre: "BON POUR ACCORD ET MARCHÉ FERME",
  texte: `Je soussignée Mme ${PROJET_LONGERE.client}, ${PROJET_LONGERE.cabinet}, accepte le marché de contractant général ci-dessus et mandate ENERGIA-CONSEIL IA® pour la direction et la coordination des travaux. Option retenue : ☐ Option 1 (phase 1)   ☐ Option 2 (phases 1 et 2).`,
  lignes: ["Fait à ______________________", "Le ____ / ____ / 2026", "Signature précédée de « Bon pour accord »"],
} as const;

export const PAGES_RAPPORT = [
  "Couverture officielle",
  "État des lieux & analyse du bâti",
  "Projections visuelles & coupe 3D",
  "Feuille de route en 4 phases",
  "Marché de contractant général chiffré",
] as const;

export function verifierCoherenceRapport(): string[] {
  const erreurs: string[] = [];

  if (PAGES_RAPPORT.length !== 5) erreurs.push(`${PAGES_RAPPORT.length} pages au lieu de 5`);
  if (FIGURES_RAPPORT.length !== 2) erreurs.push(`${FIGURES_RAPPORT.length} figures au lieu de 2`);
  if (MODULES_RAPPORT.length !== 6) erreurs.push(`${MODULES_RAPPORT.length} modules au lieu de 6`);
  if (CADRE_URGENCE.length !== 3) erreurs.push(`${CADRE_URGENCE.length} urgences au lieu de 3`);
  if (FEUILLE_DE_ROUTE.length !== 4) erreurs.push(`${FEUILLE_DE_ROUTE.length} phases au lieu de 4`);
  if (CONTACTS_RAPPORT.length !== 4) erreurs.push(`${CONTACTS_RAPPORT.length} contacts au lieu de 4`);
  if (CONTACTS_RAPPORT.some((contact) => /DAMIEN/i.test(contact.nom))) erreurs.push("Damien encore présent");

  if (offrePhase1.totalHt !== 8850 || offrePhase1.totalTtc !== 9735) {
    erreurs.push(`option 1 : ${offrePhase1.totalHt} HT / ${offrePhase1.totalTtc} TTC`);
  }
  if (offrePhase1et2.totalHt !== 14850 || offrePhase1et2.totalTtc !== 16335) {
    erreurs.push(`option 2 : ${offrePhase1et2.totalHt} HT / ${offrePhase1et2.totalTtc} TTC`);
  }
  if (EMETTEUR_RAPPORT.inpi !== "5213845") erreurs.push("numéro INPI");
  if (MENTIONS_AIDES_RAPPORT.length !== 3) erreurs.push("disclaimers aides incomplets");
  if (!MODALITES_REGLEMENT[1].includes("Sylvain LEMBELEMBE")) {
    erreurs.push("le 40 % doit rester conditionné à la validation de Sylvain");
  }

  return erreurs;
}
