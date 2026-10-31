/**
 * Contrat officiel Clyve — Longère La Genête.
 * Charte graphique = Template Master Contractant Général (Brunel / Pereira).
 * Marché Phase 1 : 8 850,00 € HT / 9 735,00 € TTC — TVA 10 %.
 */

import { construireHtmlContratContractantGeneral, euro } from "./contratContractantGeneralHtml.js";
import { PRESTATAIRE_ENERGIA } from "./brunelDevisV3Officiel.js";

export const CLYVE_LAGENETE_DOSSIER_ID = "demo-clyve-lagenete";

export const CLYVE_CONTRAT_TITRE =
  "CONTRAT DE CONTRACTANT GÉNÉRAL — MARCHÉ DE SÉCURISATION DU BÂTI & TRAVAUX CLÉ EN MAIN";

export const CLYVE_CONTRAT_NUMERO = "CONTRAT-2026-LAGENETE-CLYVE-PHASE1";
export const CLYVE_CONTRAT_DATE = "2026-09-23";
export const CLYVE_CONTRAT_DATE_TXT = "23 septembre 2026";
export const NOM_FICHIER_CONTRAT_CLYVE = "CONTRAT-2026-LAGENETE-CLYVE-PHASE1.html";

export const TOTAUX_CLYVE_PHASE_1 = {
  totalHt: 8850,
  totalTva: 885,
  totalTtc: 9735,
  tvaTaux: 0.1,
};

export const TOTAUX_CLYVE_PHASE_1_ET_2 = {
  totalHt: 14850,
  totalTva: 1485,
  totalTtc: 16335,
};

export const ECHEANCIER_CLYVE_PHASE_1 = {
  acompte: 2920.5,
  intermediaire: 3894,
  solde: 2920.5,
};

export const ECHEANCIER_CLYVE_PHASE_1_ET_2 = {
  acompte: 4900.5,
  intermediaire: 6534,
  solde: 4900.5,
};

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function poste(ordre, nom, specifications, totalHt) {
  const tauxTva = TOTAUX_CLYVE_PHASE_1.tvaTaux;
  const totalTva = round2(totalHt * tauxTva);
  return {
    ordreContractuel: ordre,
    nom,
    specifications,
    quantite: 1,
    unite: "forfait",
    puHt: totalHt,
    totalHt,
    tauxTva,
    totalTva,
    totalTtc: round2(totalHt + totalTva),
  };
}

export const POSTES_CLYVE_PHASE_1 = [
  poste(
    1,
    "Pannes sablières continues et report des charges sur refends",
    "Travées B à D. Sablières posées en tête de murs en pisé (refends 50 à 80 cm, appuis d’ordre 60 cm). Report des charges de charpente en bout de mur côté façade. Ancrage adapté à la terre crue, sans ceinture étanche ni enduit ciment.",
    1850,
  ),
  poste(
    2,
    "Remplacement des pannes dégradées et contrôle des chevrons",
    "Panne faîtière et pannes intermédiaires (deux par pan en général). Remplacement des pièces mortes. Contrôle des chevrons sur portées d’environ 4 m. Les pièces saines sont conservées après diagnostic du charpentier sur site.",
    1650,
  ),
  poste(
    3,
    "Fourniture et pose de voligeage / platelage continu bois",
    "Platelage continu sur les chevrons, au-dessus des pannes, pour porter la mise hors d’eau provisoire. Continuité possible d’une travée à l’autre selon l’état constaté.",
    1450,
  ),
  poste(
    4,
    "Bâche armée industrielle d’étanchéité hivernale provisoire",
    "Couverture provisoire renforcée pour passer l’hiver au sec sur les travées B à D. La couverture définitive en tuiles canal bressanes est reportée à la phase 4, avec l’isolation sarking.",
    980,
  ),
  poste(
    5,
    "Plomberie urgente de sauvegarde",
    "Fuite nourrice / cuivre du module B imbibant le mur en pisé : reprise d’étanchéité et protection de la terre crue, aucun enduit ciment. Remplacement du groupe de sécurité du ballon 200 L (module A). Calorifugeage du compteur d’eau et de la vanne générale (module E). Clapet aérateur Durgo sur la ventilation primaire (module A).",
    1420,
  ),
  poste(
    6,
    "Direction, Maîtrise d’œuvre & Coordination Contractant Général",
    "Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®. Coordination unique des lots, respect des règles de l’art et de l’ordre des interventions, prix ferme. Ligne sanctuarisée 1 500,00 € HT, incluse au forfait de 8 850,00 € HT.",
    1500,
  ),
];

export const CONTACTS_CLYVE_CONTRAT = [
  {
    role: "Direction & Contractant Général",
    nom: "Sylvain LEMBELEMBE",
    detail: "ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com",
  },
  {
    role: "Courtier en travaux & financements",
    nom: "FABIEN — VIVONS COURTIER",
    detail: "06 71 19 96 45 — prêt travaux jusqu’à 75 000 €, éco-PTZ jusqu’à 50 000 €",
  },
  {
    role: "Juriste ENERGIA-CONSEIL IA®",
    nom: "Julia",
    detail: "Avis juridique, conformité contractuelle et Clause Julia Protection Aides (plafond 2 000 €)",
  },
  {
    role: "MAR (Mon Accompagnateur Rénov' agréé Anah)",
    nom: "Antoine BARATIER — Cabinet C2ET",
    detail: "Parcours accompagné et validation du dossier d’aides ANAH — phase 4, au printemps",
  },
];

export const FIGURES_CLYVE_CONTRAT = [
  {
    src: "/projects/clyve-lagenete/plan-3d-rez-de-chaussee-travees-a-f.jpg",
    titre: "Figure 1 — Coupe 3D axonométrique du domaine de 31 mètres (travées A à F)",
    legende:
      "Repérage des volumes, de l’espace familial B, du pôle enfants D et de la grange / garage F. Source : Bureau d’études ENERGIA CONSEIL IA.",
    mention:
      "Projection du programme après rénovation. Les aménagements représentés ne font pas partie du présent marché d’urgence.",
  },
  {
    src: "/projects/clyve-lagenete/coupe-3d-travees-a-f.jpg",
    titre: "Figure 2 — Schéma technique de charpente à pannes sur murs de refend",
    legende:
      "Sablières en tête de mur en pisé et voligeage continu — objet de la phase 1. Source : Bureau d’études ENERGIA CONSEIL IA.",
    mention: "Schéma indicatif, à adapter sur site par le charpentier. Sections et nombre de pannes à valider après visite.",
  },
];

function htmlAnnexes3d() {
  const figures = FIGURES_CLYVE_CONTRAT.map(
    (figure) => `
      <figure>
        <img src="${figure.src}" alt="${figure.titre}" />
        <figcaption>
          <strong>${figure.titre}</strong><br />
          ${figure.legende}<br />
          <span class="muted">${figure.mention}</span>
        </figcaption>
      </figure>`,
  ).join("");
  return `
    <section class="annexe-3d bloc">
      <h2>Annexe visuelle — Projection 3D et organisation modulaire des travées (A à F)</h2>
      ${figures}
    </section>`;
}

export const FIGURES_CLYVE_PHASE_4 = [
  {
    src: "/facade-nord-pac.jpg",
    titre: "Figure 1 — Façade Nord-Est — implantation d'architecte PAC Air/Eau 14 kW",
    legende:
      "Figure 1 — Façade Nord-Est avec implantation d'architecte de la Pompe à Chaleur Air/Eau 14 kW intégrée contre le mur en pierre entre fenêtre et garage (habillage thermo-laqué RAL 7016 sur socle béton technique), toiture neuve tuiles bressanes et menuiseries isolantes.",
    mention: "Image de projection indicative — ne constitue pas une photo réelle après travaux.",
  },
  {
    src: "/interieur-b.jpg",
    titre: "Figure 2 — VUE INTÉRIEURE 3D — ESPACE DE VIE B RÉNOVÉ",
    legende: "Volume séjour/cuisine avec nouveau plancher haut bois et valorisation des poutres traditionnelles.",
    mention: "Image de projection indicative — ne constitue pas une photo réelle après travaux.",
  },
];

function htmlAnnexesPhase4() {
  const figures = FIGURES_CLYVE_PHASE_4.map(
    (figure) => `
      <figure>
        <img src="${figure.src}" alt="${figure.titre}" />
        <figcaption>
          <strong>${figure.titre}</strong><br />
          ${figure.legende}<br />
          <span class="muted">${figure.mention}</span>
        </figcaption>
      </figure>`,
  ).join("");
  return `
    <section class="annexe-projet-acheve">
      <h2>Annexes visuelles — Projections 3D du projet achevé après travaux</h2>
      ${figures}
    </section>`;
}

export function estDossierClyveLaGenete(id) {
  return id === CLYVE_LAGENETE_DOSSIER_ID;
}

export function payloadContratClyveLaGenete() {
  const p = PRESTATAIRE_ENERGIA;
  const t = TOTAUX_CLYVE_PHASE_1;
  const f = ECHEANCIER_CLYVE_PHASE_1;
  const option = TOTAUX_CLYVE_PHASE_1_ET_2;
  const f2 = ECHEANCIER_CLYVE_PHASE_1_ET_2;

  return {
    titre: CLYVE_CONTRAT_TITRE,
    numero: CLYVE_CONTRAT_NUMERO,
    dateIso: CLYVE_CONTRAT_DATE,
    dateTxt: CLYVE_CONTRAT_DATE_TXT,
    prestataire: p,
    totaux: t,
    docTitleClass: "doc-title-bandeau",
    colonneTva: "TVA 10 %",
    labelTotalRow: "TOTAL MARCHÉ PHASE 1 — PRIX FERME",
    titrePostes: "II. Détail des postes contractuels — sécurisation du bâti (Phase 1)",
    introPostesHtml:
      "Marché forfaitaire de sécurisation hivernale. Six postes. TVA 10 % — travaux d’amélioration d’un logement achevé depuis plus de deux ans. Le module F (grange / garage) reste hors de ce marché.",
    metaLignesHtml: `Mission : Sécurisation bâti, toiture B à D &amp; plomberie urgente<br>
            Prix ferme Phase 1 : ${euro(t.totalHt)} € HT / ${euro(t.totalTtc)} € TTC<br>
            Option Phase 1+2 : ${euro(option.totalHt)} € HT / ${euro(option.totalTtc)} € TTC<br>`,
    clientHtml: `<strong>Mme Clyve A.</strong> — Cabinet HUB ADMIN`,
    lieuExecution: "654 Route Départementale 975, 71290 LA GENÊTE",
    fiscaliteHtml: `<p class="muted">TVA 10 % sur l’ensemble du forfait, direction de chantier comprise. Validité 3 mois à compter du ${CLYVE_CONTRAT_DATE_TXT}.</p>`,
    alertHtml: `<div class="disclaimer"><strong>CADRE TECHNIQUE BÂTI ANCIEN PISÉ</strong> — Sauvegarde prioritaire des têtes de murs en terre crue et mise hors d’eau des travées B à D avant l’hiver. Traitement immédiat de la fuite nourrice B pour stopper l’imbibition du pisé.</div>`,
    engagementHtml: `<div class="engagement-bleu"><strong>Engagement de Contractant Général — prix ferme et forfaitaire.</strong> ENERGIA-CONSEIL IA® prend la responsabilité globale du chantier, garantit la coordination unique des lots et le respect des règles de l’art.</div>`,
    postes: POSTES_CLYVE_PHASE_1,
    totauxPhraseHtml: `<strong>Totaux contractuels Phase 1 :</strong> ${euro(t.totalHt)} € HT | TVA 10 % : ${euro(t.totalTva)} € | <strong>TOTAL TTC : ${euro(t.totalTtc)} €</strong>. Option 2 — Phases 1 et 2 (plancher haut bois du module B + attentes cuisine) : ${euro(option.totalHt)} € HT / ${euro(option.totalTtc)} € TTC, prix ferme au choix du maître d’ouvrage.`,
    annexePhotosHtml: htmlAnnexes3d(),
    recapLignes: [
      { label: "Option 1 — Phase 1 seule — Total HT", montant: `${euro(t.totalHt)} €` },
      { label: "Option 1 — TVA 10 %", montant: `${euro(t.totalTva)} €` },
      { label: "Option 1 — Total TTC — prix ferme", montant: `${euro(t.totalTtc)} €`, total: true },
      { label: "Option 1 — 30 % à la commande", montant: `${euro(f.acompte)} € TTC` },
      {
        label: "Option 1 — 40 % au démarrage",
        montant: `${euro(f.intermediaire)} € TTC`,
        muted: "Après validation de Sylvain LEMBELEMBE (point d’avancement, conformité, ordre des travaux).",
      },
      { label: "Option 1 — 30 % à la réception", montant: `${euro(f.solde)} € TTC` },
      { label: "Option 2 — Phases 1 et 2 — Total HT", montant: `${euro(option.totalHt)} €` },
      { label: "Option 2 — TVA 10 %", montant: `${euro(option.totalTva)} €` },
      { label: "Option 2 — Total TTC — prix ferme", montant: `${euro(option.totalTtc)} €`, total: true },
      { label: "Option 2 — 30 % à la commande", montant: `${euro(f2.acompte)} € TTC` },
      {
        label: "Option 2 — 40 % au démarrage",
        montant: `${euro(f2.intermediaire)} € TTC`,
        muted: "Après validation de Sylvain LEMBELEMBE.",
      },
      { label: "Option 2 — 30 % à la réception", montant: `${euro(f2.solde)} € TTC` },
    ],
    apresRecapHtml: `<section class="bloc keep">
      <h2>Choix de l’option — commande ferme immédiate</h2>
      <table>
        <thead>
          <tr>
            <th>Choix</th><th>Option</th><th>Périmètre</th>
            <th>Total HT</th><th>Total TTC</th>
            <th>30 %</th><th>40 %</th><th>30 %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>☐ </td>
            <td><strong>Option 1</strong></td>
            <td>Phase 1 — urgence hiver (charpente, hors d’eau, plomberie, direction)</td>
            <td class="montant">${euro(t.totalHt)} €</td>
            <td class="montant"><strong>${euro(t.totalTtc)} €</strong></td>
            <td class="montant">${euro(f.acompte)} €</td>
            <td class="montant">${euro(f.intermediaire)} €</td>
            <td class="montant">${euro(f.solde)} €</td>
          </tr>
          <tr>
            <td>☐ </td>
            <td><strong>Option 2</strong></td>
            <td>Phases 1 et 2 — urgence + plancher haut bois du module B et attentes cuisine</td>
            <td class="montant">${euro(option.totalHt)} €</td>
            <td class="montant"><strong>${euro(option.totalTtc)} €</strong></td>
            <td class="montant">${euro(f2.acompte)} €</td>
            <td class="montant">${euro(f2.intermediaire)} €</td>
            <td class="montant">${euro(f2.solde)} €</td>
          </tr>
        </tbody>
      </table>
      <p class="muted">Options exclusives. Cocher une seule case. Le 40 % et le solde ne sont débloqués qu’après validation de Sylvain LEMBELEMBE.</p>
    </section>`,
    titreAides: "IV. Projection financière indicative — Transition énergétique Printemps 2027",
    disclaimerAidesHtml: `<div class="bandeau-phases">
        <span class="badge-phase badge-p1">Phase 1 — Urgence Hiver</span>
        <span class="badge-phase badge-p2">Phase 2 — Habitabilité B</span>
        <span class="badge-phase badge-p3">Phase 3 — Consolidation</span>
        <span class="badge-phase badge-p4">Parcours aidé Anah 80 %</span>
      </div>
      <div class="disclaimer">
        <strong>Aides financières 2026 (estimation à titre indicatif).</strong>
        Aides à valider selon revenus réels du client et éligibilité en vigueur.
        Montants définitifs après instruction ANAH et CEE.
        ENERGIA-CONSEIL IA® ne garantit pas l’acceptation des dossiers.
      </div>`,
    aidesLignes: [
      {
        label: "MaPrimeRénov’ / CEE / Coup de pouce sur ce marché d’urgence (Phase 1)",
        montant: "0,00 €",
        muted: "Aucun geste énergétique subventionné. Travaux indépendants de l’accord d’aides de la Phase 4.",
      },
      {
        label: "Phase 4 (printemps 2027) — option 69 000 € HT / 72 795 € TTC",
        montant: "~ 55 200 € à 56 000 €",
        muted: "80 % de prise en charge financière (Profil Anah Bleu — Très Modeste). Subvention Anah directe estimée : 55 200 € à 56 000 €. Reste à charge ~ 13 600 € à 17 595 € TTC (finançable via Éco-PTZ à taux 0 % par Vivons Courtier).",
      },
    ],
    avertissementAidesHtml: `<div class="avertissement-2027"><strong>Avertissement réglementaire :</strong> Les montants d’aides mentionnés pour la Phase 4 sont calculés à titre purement estimatif sur la base des barèmes officiels Anah en vigueur pour un foyer de 5 personnes (profil Bleu). Les montants et taux réels seront arrêtés conformément aux dispositions de la Loi de Finances et aux barèmes Anah applicables en 2027 au moment de l’instruction du dossier par le MAR (Cabinet C2ET). ENERGIA CONSEIL IA® ne garantit pas les décisions d’attribution des organismes financeurs.</div>
      <div class="independance-p1 liseret-p1"><strong>Indépendance de la Phase 1.</strong> Les travaux d’urgence de la Phase 1 sont indépendants et non conditionnés à l’accord d’aides de la Phase 4. Le présent marché d’urgence peut être signé immédiatement : il ne contient aucun geste énergétique subventionné.</div>`,
    regleAnahExtra:
      " Cette règle vise exclusivement la phase 4 énergétique. Les travaux d’urgence de la Phase 1 sont indépendants et non conditionnés à l’accord d’aides de la Phase 4.",
    titrePlanning: "V. Planning prévisionnel — Phase 1 avant l’hiver",
    planning: [
      {
        phase: "1. Charpente B à D",
        duree: "1 à 2 sem.",
        detail: "Sablières, reprise des pannes, voligeage continu.",
      },
      {
        phase: "2. Mise hors d’eau",
        duree: "2 à 3 j",
        detail: "Bâche armée industrielle. Tuiles définitives reportées au printemps.",
      },
      {
        phase: "3. Plomberie de sauvegarde",
        duree: "1 à 2 j",
        detail: "Nourrice B, groupe de sécurité A, calorifugeage E, clapet Durgo A.",
      },
      {
        phase: "Direction Contractant Général",
        duree: "Toute la durée",
        detail: "Sylvain LEMBELEMBE — coordination unique, validation des déblocages 40 % et 30 %.",
      },
    ],
    titreSignature: "VI. Bon pour accord et commande ferme",
    signatureHtml: `<p>Je soussignée, <strong>Mme Clyve A.</strong>, Cabinet HUB ADMIN, accepte le présent contrat n° <strong>${CLYVE_CONTRAT_NUMERO}</strong>
        et mandate <strong>ENERGIA-CONSEIL IA® en qualité de Contractant Général</strong> pour la sécurisation du bâti, la toiture des travées B à D et la plomberie urgente, selon l’option cochée :</p>
        <p>☐ <strong>Option 1</strong> — Phase 1 seule — prix ferme et forfaitaire <strong>${euro(t.totalTtc)} € TTC</strong> (${euro(t.totalHt)} € HT) — échéancier ${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC.</p>
        <p>☐ <strong>Option 2</strong> — Phases 1 et 2 — prix ferme et forfaitaire <strong>${euro(option.totalTtc)} € TTC</strong> (${euro(option.totalHt)} € HT) — échéancier ${euro(f2.acompte)} € / ${euro(f2.intermediaire)} € / ${euro(f2.solde)} € TTC.</p>
        <p>Le 40 % et le solde sont débloqués après validation de Sylvain LEMBELEMBE. Mentions manuscrites obligatoires : « Lu et approuvé, bon pour accord et commande ferme ».</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le maître d’ouvrage — Mme Clyve A.<div class="sig-line"></div><div class="muted">Lu et approuvé, bon pour accord et commande ferme</div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div><div class="muted">Lu et approuvé, bon pour accord et commande ferme</div></td>
          </tr>
        </table>`,
    contacts: CONTACTS_CLYVE_CONTRAT,
    titreContacts: "VII. Contacts projet officiels",
    juliaBullets: [
      `la qualité d’ENERGIA-CONSEIL IA® de <strong>Contractant Général</strong> (responsabilité globale, prix forfaitaire ferme ${euro(t.totalTtc)} € TTC, artisans en sous-traitance) ;`,
      `le cadre technique du bâti ancien en pisé (sablières en tête de mur, matériaux perspirants, interdiction d’enduit ciment sur le mur imbibé) ;`,
      `l’absence de geste énergétique subventionné dans le présent marché — les aides de la phase 4 (Printemps 2027) restent une projection indicative, selon les barèmes Anah applicables en 2027, instruction MAR Cabinet C2ET ; les travaux d’urgence de la Phase 1 sont indépendants de cet accord ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d’écart &gt; 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le régime de paiement : <strong>30 % commande / 40 % démarrage / 30 % réception</strong> (${euro(f.acompte)} € / ${euro(f.intermediaire)} € / ${euro(f.solde)} € TTC), le solde après PV sans réserve et validation Sylvain LEMBELEMBE.`,
    ],
    ordreTravauxCgv:
      "Phase 1 : sablières et reprise de charpente → voligeage → bâche armée → plomberie de sauvegarde. Phase 4 (printemps, hors ce marché) : isolation sarking → tuiles canal → VMC → PAC air-eau (dimensionnement post-isolation) → chauffe-eau thermodynamique. Isolation avant chauffage en toutes circonstances.",
    echeancier: f,
    totauxPourCgv: t,
    footerClientHtml: `Contrat ${CLYVE_CONTRAT_NUMERO} — Mme Clyve A. — 654 Route Départementale 975, 71290 LA GENÊTE — ${CLYVE_CONTRAT_DATE_TXT}`,
  };
}

export function genererHtmlContratClyveLaGenete() {
  return construireHtmlContratContractantGeneral(payloadContratClyveLaGenete());
}

export function verifierCoherenceContratClyve() {
  const erreurs = [];
  const ht = POSTES_CLYVE_PHASE_1.reduce((somme, ligne) => somme + ligne.totalHt, 0);
  const tva = POSTES_CLYVE_PHASE_1.reduce((somme, ligne) => somme + ligne.totalTva, 0);
  const ttc = POSTES_CLYVE_PHASE_1.reduce((somme, ligne) => somme + ligne.totalTtc, 0);
  if (POSTES_CLYVE_PHASE_1.length !== 6) erreurs.push(`${POSTES_CLYVE_PHASE_1.length} postes au lieu de 6`);
  if (round2(ht) !== 8850) erreurs.push(`HT ${ht}`);
  if (round2(tva) !== 885) erreurs.push(`TVA ${tva}`);
  if (round2(ttc) !== 9735) erreurs.push(`TTC ${ttc}`);
  const { acompte, intermediaire, solde } = ECHEANCIER_CLYVE_PHASE_1;
  if (round2(acompte + intermediaire + solde) !== 9735) erreurs.push("échéancier ≠ TTC");
  const f2 = ECHEANCIER_CLYVE_PHASE_1_ET_2;
  if (round2(f2.acompte + f2.intermediaire + f2.solde) !== 16335) erreurs.push("échéancier option 2 ≠ TTC");
  if (POSTES_CLYVE_PHASE_1[5].totalHt !== 1500) erreurs.push("poste 6 non sanctuarisé à 1 500 € HT");
  return erreurs;
}

export const CLYVE_DEVIS_P4_TITRE =
  "DEVIS PRÉVISIONNEL DE TRANSITION ÉNERGÉTIQUE GLOBALE — AUDIT MAR & MARCHÉ CONTRACTANT GÉNÉRAL";

export const CLYVE_DEVIS_P4_NUMERO = "DEVIS-2027-LAGENETE-PHASE4-GLOBAL";
export const CLYVE_DEVIS_P4_DATE = "2026-09-24";
export const CLYVE_DEVIS_P4_DATE_TXT = "24 septembre 2026";
export const NOM_FICHIER_DEVIS_P4_CLYVE = "DEVIS-2027-LAGENETE-PHASE4-GLOBAL.html";

export const TOTAUX_CLYVE_PHASE_4 = {
  totalHt: 69000,
  totalTva: 3795,
  totalTtc: 72795,
  tvaTaux: 0.055,
};

export const MENTION_NON_SIGNATURE_P4 =
  "Avertissement légal : Devis d'ingénierie préparatoire destiné à l'audit réglementaire et au montage du dossier Anah par le MAR. Montants d'aides calculés selon les barèmes Anah en vigueur pour un ménage très modeste de 5 personnes, sous réserve des dispositions de la Loi de Finances 2027 lors du dépôt officiel. Ne pas signer avant notification d'accord officiel de l'ANAH.";

function posteP4(ordre, nom, specifications, quantite, unite, puHt) {
  const tauxTva = TOTAUX_CLYVE_PHASE_4.tvaTaux;
  const totalHt = round2(quantite * puHt);
  const totalTva = round2(totalHt * tauxTva);
  return {
    ordreContractuel: ordre,
    nom,
    specifications,
    quantite,
    unite,
    puHt,
    totalHt,
    tauxTva,
    totalTva,
    totalTtc: round2(totalHt + totalTva),
  };
}

/** Ordre optimal ENERGIA : isolation et menuiseries, puis VMC, puis chauffage. Montants identiques au brief. */
export const POSTES_CLYVE_PHASE_4 = [
  posteP4(
    1,
    "Isolation toiture Sarking fibre de bois 200 mm haute densité",
    "R = 6,05 m².K/W. Frein-vapeur perspirant, compatible pisé. Isolation posée avant la couverture définitive et avant tout chauffage. Travées B à D. Pose RGE.",
    185,
    "m²",
    100,
  ),
  posteP4(
    2,
    "Couverture tuiles bressanes terre cuite",
    "Litelage traité, faîtage ventilé, rives chaux, solins zinc 2 cheminées, gouttières zinc. Remplace la bâche armée de la phase 1. Pose sur le complexe sarking.",
    185,
    "m²",
    80,
  ),
  posteP4(
    3,
    "Menuiseries double vitrage thermique renforcé RAL 7016",
    "Gaz argon, Uw ≤ 1,3 W/m².K, Sw ≥ 0,36. Après isolation de toiture. Pose RGE.",
    8,
    "ens.",
    1550,
  ),
  posteP4(
    4,
    "Ventilation VMC hygroréglable type B très basse consommation",
    "Gaines isolées. Après l'isolation. Débits à dimensionner. Le pisé doit continuer à pouvoir sécher.",
    1,
    "ens.",
    1800,
  ),
  posteP4(
    5,
    "Pompe à chaleur Air/Eau 14 kW haute température",
    "ETAS ≥ 126 %, fluide R32, ballon tampon 100 L, régulation modulante. Puissance calculée après isolation, marge 10 à 20 %.",
    1,
    "ens.",
    13500,
  ),
  posteP4(
    6,
    "Chauffe-eau thermodynamique 250 L",
    "COP > 3,1 à 7 °C. Dépose des anciens ballons 200 L (A) et 300 L (C), à confirmer sur site.",
    1,
    "ens.",
    2800,
  ),
  posteP4(
    7,
    "Direction, Pilotage & Maîtrise d'Œuvre Contractant Général ENERGIA-CONSEIL IA®",
    "Sylvain LEMBELEMBE. Ligne sanctuarisée 5 200,00 € HT. 100 % ENERGIA, aucun intermédiaire commercial. Coordination unique, ordre des travaux, dossier MAR.",
    1,
    "forfait",
    5200,
  ),
];

export function payloadDevisPrintempsClyveLaGenete() {
  const p = PRESTATAIRE_ENERGIA;
  const t = TOTAUX_CLYVE_PHASE_4;

  return {
    titre: CLYVE_DEVIS_P4_TITRE,
    numero: CLYVE_DEVIS_P4_NUMERO,
    dateIso: CLYVE_DEVIS_P4_DATE,
    dateTxt: CLYVE_DEVIS_P4_DATE_TXT,
    prestataire: p,
    totaux: t,
    docTitleClass: "doc-title-bandeau",
    colonneTva: "TVA 5,5 %",
    labelTotalRow: "TOTAL MARCHÉ PHASE 4 — DEVIS PRÉVISIONNEL",
    titrePostes: "II. Détail des 7 postes contractuels — rénovation énergétique globale",
    introPostesHtml:
      "Devis prévisionnel. TVA 5,5 % — rénovation énergétique d'un logement achevé depuis plus de deux ans. Ordre impératif : isolation sarking, tuiles, menuiseries, VMC, puis PAC et chauffe-eau (dimensionnement post-isolation). Ce document n'est pas un devis définitif signable.",
    enteteDroitHtml: `N° ${CLYVE_DEVIS_P4_NUMERO}<br>
            Date d'étude : ${CLYVE_DEVIS_P4_DATE_TXT} · Validité : Printemps 2027<br>
            Projet : Rénovation Énergétique Globale — Parcours Accompagné MAR<br>
            Total HT : ${euro(t.totalHt)} € HT<br>
            TVA 5,5 % : ${euro(t.totalTva)} €<br>
            Total TTC : ${euro(t.totalTtc)} € TTC`,
    labelClient: "Maître d'ouvrage",
    labelLieu: "Lieu des travaux",
    colonneDesignation: "Désignation détaillée &amp; spécifications techniques RGE",
    clientHtml: `<strong>Mme Clyve A.</strong> — Cabinet HUB ADMIN<br>Foyer de 5 personnes — Profil Anah Bleu Très Modeste`,
    lieuExecution: "654 Route Départementale 975, 71290 LA GENÊTE",
    cgvIntro:
      "Le présent devis prévisionnel prépare l'audit MAR et le marché de Contractant Général. Il n'est pas un devis définitif signable. Les CGV ci-dessous s'appliqueront au marché ferme après notification d'accord officiel de l'ANAH.",
    echeancier: { acompte: 21838.5, intermediaire: 29118, solde: 21838.5 },
    fiscaliteHtml: `<p class="muted">TVA 5,5 % sur l'ensemble du marché prévisionnel, direction comprise. Validité : Printemps 2027. Instruction MAR Antoine BARATIER — Cabinet C2ET.</p>`,
    alertHtml: `<div class="disclaimer"><strong>CADRE TECHNIQUE BÂTI ANCIEN PISÉ</strong> — Isolants perspirants uniquement (fibre de bois). Aucun enduit ciment. Dimensionnement PAC et VMC après isolation. La phase 1 d'urgence est indépendante de ce devis.</div>`,
    engagementHtml: `<div class="engagement-bleu"><strong>Devis d'ingénierie préparatoire — parcours MAR / Anah.</strong> ENERGIA-CONSEIL IA® prépare le marché de Contractant Général pour l'audit réglementaire et le montage du dossier. Aucune commande ferme avant notification d'accord Anah.</div>`,
    postes: POSTES_CLYVE_PHASE_4,
    totauxPhraseHtml: `<strong>Totaux prévisionnels Phase 4 :</strong> ${euro(t.totalHt)} € HT | TVA 5,5 % : ${euro(t.totalTva)} € | <strong>TOTAL TTC : ${euro(t.totalTtc)} €</strong>.`,
    annexePhotosHtml: htmlAnnexesPhase4(),
    titreRecap: "III. Ingénierie financière &amp; subventions d'État (Profil Bleu / 5 personnes)",
    recapLignes: [
      {
        label: "MaPrimeRénov' Parcours Accompagné",
        montant: "55 200 € à 56 000 €",
        muted: "80 % de prise en charge financière (Profil Anah Bleu — Très Modeste). Subvention Anah directe estimée : 55 200 € à 56 000 €.",
      },
      {
        label: "Prestation MAR — Antoine BARATIER, Cabinet C2ET",
        montant: "100 % État, jusqu'à 2 000 €",
        muted: "Prise en charge de la prestation d'accompagnement, selon profil Bleu.",
      },
      {
        label: "Reste à charge prévisionnel estimé",
        montant: "~ 13 600 € à 17 595 € TTC",
        muted: "Finançable via Éco-PTZ à taux 0 % par Vivons Courtier.",
        total: true,
      },
      {
        label: "Financement du reste à charge",
        montant: "Éco-PTZ 0 % · ~ 70 € / mois",
        muted: "FABIEN — VIVONS COURTIER — 06 71 19 96 45. Mensualité indicative.",
      },
    ],
    titreAides: "IV. Avertissement réglementaire — Loi de Finances 2027",
    disclaimerAidesHtml: `<div class="avertissement-2027"><strong>${MENTION_NON_SIGNATURE_P4}</strong></div>
      <div class="disclaimer">
        <strong>Aides financières 2026 (estimation à titre indicatif).</strong>
        Aides à valider selon revenus réels du client et éligibilité en vigueur.
        Montants définitifs après instruction ANAH et CEE.
        ENERGIA CONSEIL IA® ne garantit pas les décisions d'attribution des organismes financeurs.
      </div>`,
    aidesLignes: [
      {
        label: "MaPrimeRénov' Parcours Accompagné (Profil Bleu 80 % indicatif)",
        montant: "~ 55 200 €",
      },
      {
        label: "MAR Cabinet C2ET",
        montant: "jusqu'à 2 000 €, 100 % État",
      },
      {
        label: "Reste à charge Clyve",
        montant: "~ 13 600 € à 17 595 € TTC",
        muted: "Finançable via Éco-PTZ à taux 0 % par Vivons Courtier.",
      },
    ],
    avertissementAidesHtml: `<div class="engagement-bleu"><strong>Indépendance de la Phase 1.</strong> Les travaux d'urgence déjà proposés (9 735 € TTC ou 16 335 € TTC) sont indépendants et non conditionnés à l'accord d'aides de la Phase 4.</div>`,
    regleAnahExtra:
      " NE JAMAIS SIGNER CE DEVIS ÉNERGÉTIQUE AVANT LA NOTIFICATION D'ACCORD ÉCRIT DE L'ANAH (sinon perte définitive et irrémédiable du MPR).",
    titrePlanning: "V. Planning prévisionnel — Printemps 2027",
    planning: [
      {
        phase: "1. Sarking fibre de bois",
        duree: "1 à 2 sem.",
        detail: "Isolation toiture R = 6,05 avant couverture et avant tout chauffage.",
      },
      {
        phase: "2. Tuiles bressanes",
        duree: "1 à 2 sem.",
        detail: "Couverture définitive, faîtage ventilé, zinc, chaux.",
      },
      {
        phase: "3. Menuiseries RAL 7016",
        duree: "2 à 3 sem.",
        detail: "Uw ≤ 1,3. Après isolation de toiture.",
      },
      {
        phase: "4. VMC Hygro B",
        duree: "3 à 5 j",
        detail: "Après isolation. Débits à dimensionner.",
      },
      {
        phase: "5. PAC 14 kW HT + CET 250 L",
        duree: "2 à 3 sem.",
        detail: "Dimensionnement post-isolation. Direction Sylvain LEMBELEMBE sur toute la durée.",
      },
    ],
    titreSignature: "VI. Prise de connaissance — pas de commande ferme",
    signatureHtml: `<p><strong>${MENTION_NON_SIGNATURE_P4}</strong></p>
        <p>Je soussignée, <strong>Mme Clyve A.</strong>, Cabinet HUB ADMIN, <strong>prends connaissance</strong> du devis prévisionnel n° <strong>${CLYVE_DEVIS_P4_NUMERO}</strong> d'un montant indicatif de <strong>${euro(t.totalTtc)} € TTC</strong> (${euro(t.totalHt)} € HT). Ce document prépare l'audit MAR et le dossier Anah. Il <strong>n'emporte aucune commande ferme</strong>.</p>
        <p>Fait à ____________________________ , le ___ / ___ / 2026</p>
        <table class="sig-table">
          <tr>
            <td>Le maître d'ouvrage — Mme Clyve A.<div class="sig-line"></div><div class="muted">Lu et pris connaissance — ne pas signer avant accord Anah</div></td>
            <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div><div class="muted">Devis d'ingénierie préparatoire</div></td>
          </tr>
        </table>`,
    contacts: CONTACTS_CLYVE_CONTRAT,
    titreContacts: "VII. Contacts projet officiels",
    juliaBullets: [
      `le caractère <strong>prévisionnel</strong> du présent devis (${euro(t.totalTtc)} € TTC) : aucune commande ferme avant notification d'accord Anah ;`,
      `le profil retenu pour la projection : foyer de 5 personnes, <strong>Bleu Très Modeste</strong>, barèmes à actualiser à la Loi de Finances 2027 ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart &gt; 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `l'indépendance des travaux d'urgence de la Phase 1, signables immédiatement, hors MaPrimeRénov'.`,
    ],
    ordreTravauxCgv:
      "Phase 4 : isolation sarking fibre de bois → tuiles canal bressanes → menuiseries → VMC hygro → PAC air-eau (dimensionnement post-isolation) → chauffe-eau thermodynamique. Isolation avant chauffage en toutes circonstances.",
    totauxPourCgv: t,
    footerClientHtml: `Devis ${CLYVE_DEVIS_P4_NUMERO} — Mme Clyve A. — 654 Route Départementale 975, 71290 LA GENÊTE — ${CLYVE_DEVIS_P4_DATE_TXT}`,
  };
}

export function genererHtmlDevisPrintempsClyve() {
  return construireHtmlContratContractantGeneral(payloadDevisPrintempsClyveLaGenete());
}

export function verifierCoherenceDevisPrintempsClyve() {
  const erreurs = [];
  const ht = POSTES_CLYVE_PHASE_4.reduce((somme, ligne) => somme + ligne.totalHt, 0);
  const tva = POSTES_CLYVE_PHASE_4.reduce((somme, ligne) => somme + ligne.totalTva, 0);
  const ttc = POSTES_CLYVE_PHASE_4.reduce((somme, ligne) => somme + ligne.totalTtc, 0);
  if (POSTES_CLYVE_PHASE_4.length !== 7) erreurs.push(`${POSTES_CLYVE_PHASE_4.length} postes au lieu de 7`);
  if (round2(ht) !== 69000) erreurs.push(`HT ${ht}`);
  if (round2(tva) !== 3795) erreurs.push(`TVA ${tva}`);
  if (round2(ttc) !== 72795) erreurs.push(`TTC ${ttc}`);
  const idxVmc = POSTES_CLYVE_PHASE_4.findIndex((poste) => /VMC/i.test(poste.nom));
  const idxPac = POSTES_CLYVE_PHASE_4.findIndex((poste) => /Pompe/i.test(poste.nom));
  if (idxVmc < 0 || idxPac < 0 || idxVmc > idxPac) erreurs.push("VMC doit précéder la PAC");
  if (POSTES_CLYVE_PHASE_4[6].totalHt !== 5200) erreurs.push("direction non sanctuarisée à 5 200 € HT");
  return erreurs;
}
