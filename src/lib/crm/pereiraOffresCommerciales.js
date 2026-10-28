/**
 * Deux formules client Pereira Nervieux — transmission DEV-2026-PEREIRA-01 / 02.
 * Totaux sanctuarisés. La marge Contractant Général reste 5 200,00 € HT dans les deux cas.
 * Le panier technique 8 postes (pereiraNervieuxOfficiel.js) n'est pas modifié.
 */

import { RIB_QONTO } from "./paradesAntiFuite.js";
import { HONORAIRES_HUB_ADMIN_HT } from "./operationnelCrm.js";
import {
  AIDES_PEREIRA_VIOLET,
  CLIENT_PEREIRA_NERVIEUX,
  CONTACTS_PEREIRA_CONTRAT,
  EXCLUSION_ITI_PEREIRA,
  FISCALITE_AVIS_PEREIRA,
  METRES_PEREIRA_NERVIEUX,
  PAIRES_PHOTOS_CONTRAT_PEREIRA,
  PHOTOS_CONTRAT_PEREIRA,
  PRESTATAIRE_ENERGIA,
} from "./pereiraNervieuxOfficiel.js";
import {
  articlesCgvContractantGeneral,
  construireHtmlContratContractantGeneral,
  dateLongue,
  euro,
  htmlAnnexePhotos,
} from "./contratContractantGeneralHtml.js";

export const OFFRE_PEREIRA_ABF = "pereira-abf";
export const OFFRE_PEREIRA_ECO = "pereira-eco";
export const DATE_DEVIS_COMMERCIAL_PEREIRA = "2026-10-28";

const TVA = 0.055;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function poste(ligne) {
  const totalHt = round2(ligne.totalHt);
  const totalTva = ligne.totalTva == null ? round2(totalHt * TVA) : round2(ligne.totalTva);
  return {
    ...ligne,
    totalHt,
    totalTva,
    totalTtc: round2(totalHt + totalTva),
    tauxTva: TVA,
    puHt: ligne.quantite ? round2(totalHt / ligne.quantite) : totalHt,
    verrouillageOfficiel: true,
    quantiteFlexible: false,
    sourcePrix: "formule-commerciale-pereira-2026-10-28",
  };
}

/** Lots 1 à 4 + CG, identiques sur les deux formules. TVA PAC ajustée de 0,01 € pour que la colonne tombe sur la TVA du total. */
const LOTS_COMMUNS_PEREIRA = [
  poste({
    id: "pereira-com-lot-1-pac",
    familleId: "chauffage",
    nom: "Lot 1 — Pompe à chaleur air/eau haute température (remplacement chaudière fioul)",
    specifications:
      "Fiche CEE BAR-TH-104. PAC air/eau haute température, chauffage seul, radiateurs fonte, dimensionnement après isolation, SCOP ≥ 3,50. Dépose et neutralisation de la chaudière fioul. Le forfait comprend la VMC simple flux hygroréglable type B, posée après l’isolation et avant la mise en service de la PAC. Conformité ABF : unité extérieure côté cour intérieure, invisible depuis la voie publique et la croix classée.",
    artisan: "À sélectionner RGE (ECO SYSTÈME DURABLE)",
    quantite: 1,
    unite: "lot",
    totalHt: 10855.64,
    totalTva: 597.05,
    ordreContractuel: 1,
    ordreThermique: 6,
    prestationId: "marche-pac-ae-ht-abf",
  }),
  poste({
    id: "pereira-com-lot-2-cet",
    familleId: "ecs",
    nom: "Lot 2 — Chauffe-eau thermodynamique 250 L + désembouage DTU 65.16 + filtre magnétique",
    specifications:
      "Fiche CEE BAR-TH-148. Ballon thermodynamique 250 L indépendant, COP ≥ 3,0. Désembouage hydrodynamique complet du réseau de radiateurs fonte selon DTU 65.16 et filtre pot à boue magnétique. Garantie constructeur de la PAC conditionnée à ce désembouage.",
    artisan: "À sélectionner RGE (ECO SYSTÈME DURABLE)",
    quantite: 1,
    unite: "lot",
    totalHt: 3700,
    ordreContractuel: 2,
    ordreThermique: 7,
    prestationId: "marche-cet-desembouage",
  }),
  poste({
    id: "pereira-com-lot-3-combles",
    familleId: "isolation",
    nom: "Lot 3 — Isolation des combles perdus 60 m² (laine minérale soufflée, R ≥ 7,0)",
    specifications:
      "60 m² de combles perdus, laine minérale soufflée, R ≥ 7,0 m².K/W. Exclusion des 70 m² de rampants et des Velux. Artisan RGE. Exécution en tête de chantier, avant la pompe à chaleur.",
    artisan: "À sélectionner RGE",
    quantite: 60,
    unite: "m²",
    totalHt: 1185,
    ordreContractuel: 3,
    ordreThermique: 1,
    prestationId: "marche-combles-souffle",
  }),
  poste({
    id: "pereira-com-lot-4-plancher",
    familleId: "isolation",
    nom: "Lot 4 — Isolation du plancher bas sur cave 19 m² (panneaux rigides, R ≥ 3,0)",
    specifications:
      "19 m² réels de plancher bas sur sous-sol accessible, panneaux rigides en sous-face, R ≥ 3,0 m².K/W. Hors les 60 m² théoriques non mesurés. Artisan RGE. Exécution avant la pompe à chaleur.",
    artisan: "À sélectionner RGE",
    quantite: 19,
    unite: "m²",
    totalHt: 3135.19,
    ordreContractuel: 4,
    ordreThermique: 3,
    prestationId: "marche-plancher-bas",
  }),
];

const LOT_MENUISERIES_ABF = poste({
  id: "pereira-com-lot-5-menuiseries",
  familleId: "menuiseries",
  nom: "Lot 5 — Menuiseries extérieures alu teinté / bois, conformes ABF",
  specifications:
    "Remplacement des menuiseries extérieures : 19,38 m², 10 châssis verticaux (7 fenêtres + 3 fixes), 0 Velux, Uw ≤ 1,30. Aluminium teinté ou bois, petits bois et proportions d’origine, palette de teintes de la mairie. Exclusion du PVC blanc. Conformité ABF.",
  artisan: "À sélectionner RGE",
  quantite: 1,
  unite: "lot",
  totalHt: 6635.07,
  ordreContractuel: 5,
  ordreThermique: 4,
  prestationId: "marche-menuiseries-abf",
});

const LOT_CG = poste({
  id: "pereira-com-lot-cg",
  familleId: "",
  nom: "Direction & Contractant Général — Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA®",
  specifications: `Coordination TCE, pilotage de chantier, responsabilité de Contractant Général, assurance décennale Calipso Assurances n° LUNPIB2604975. Montant réservé identique sur les deux formules : 5 200,00 € HT. Clyve (${euro(HONORAIRES_HUB_ADMIN_HT)} € HT) est un coût interne, non facturé au client.`,
  artisan: "ENERGIA-CONSEIL IA®",
  quantite: 1,
  unite: "lot",
  totalHt: 5200,
  ordreContractuel: 6,
  ordreThermique: 9,
  prestationId: "energia-contractant-general",
});

export const MARGE_CG_PEREIRA_HT = 5200;

export function offrePereiraActive(valeur) {
  return valeur === OFFRE_PEREIRA_ECO ? OFFRE_PEREIRA_ECO : OFFRE_PEREIRA_ABF;
}

export function lignesOffrePereira(offre) {
  const eco = offrePereiraActive(offre) === OFFRE_PEREIRA_ECO;
  const lots = eco ? [...LOTS_COMMUNS_PEREIRA] : [...LOTS_COMMUNS_PEREIRA, LOT_MENUISERIES_ABF];
  return [...lots, LOT_CG].map((ligne) => ({ ...ligne }));
}

function sommer(lignes) {
  return {
    totalHt: round2(lignes.reduce((s, l) => s + l.totalHt, 0)),
    totalTva: round2(lignes.reduce((s, l) => s + l.totalTva, 0)),
    totalTtc: round2(lignes.reduce((s, l) => s + l.totalTtc, 0)),
  };
}

export const TOTAUX_OFFRE_PEREIRA_ABF = {
  totalHt: 30710.9,
  totalTva: 1689.1,
  totalTtc: 32400,
  aides: 15500,
  resteACharge: 16900,
  acompte: 5070,
  intermediaire: 6760,
  solde: 5070,
  mensualiteVivons: 135,
  mensualiteEcoPtz20: 70.42,
  economieFioulMois: 160,
};

export const TOTAUX_OFFRE_PEREIRA_ECO = {
  totalHt: 24075.83,
  totalTva: 1324.17,
  totalTtc: 25400,
  aides: 15500,
  resteACharge: 9900,
  acompte: 2970,
  intermediaire: 3960,
  solde: 2970,
  mensualiteVivons: 79,
  mensualiteEcoPtz20: 41.25,
  economieFioulMois: 160,
};

export function totauxOffrePereira(offre) {
  return offrePereiraActive(offre) === OFFRE_PEREIRA_ECO ? TOTAUX_OFFRE_PEREIRA_ECO : TOTAUX_OFFRE_PEREIRA_ABF;
}

export function metaOffrePereira(offre) {
  const eco = offrePereiraActive(offre) === OFFRE_PEREIRA_ECO;
  return eco
    ? {
        id: OFFRE_PEREIRA_ECO,
        numero: "DEV-2026-PEREIRA-02",
        titre: "DEVIS — Formule Sérénité Éco-Confort",
        libelleCourt: "Formule Éco 9 900 € RAC",
        badge: "Sans menuiseries",
      }
    : {
        id: OFFRE_PEREIRA_ABF,
        numero: "DEV-2026-PEREIRA-01",
        titre: "DEVIS — Formule Rénovation Globale Complète ABF",
        libelleCourt: "Formule Complète ABF 16 900 € RAC",
        badge: "Conformité ABF",
      };
}

const ALERTE_ORDRE_PEREIRA = `ALERTE CRITIQUE — ORDRE D'EXÉCUTION. L'ordre de chiffrage (Lot 1 PAC, Lot 2 ballon, Lot 3 combles, Lot 4 plancher) ne commande pas le chantier. Problème : démarrer la pompe à chaleur avant l'isolation surdimensionne l'équipement. Conséquence : surcoût de 4 000 à 6 000 € et perte d'efficacité. Ordre correct impératif : 1. Isolation combles 2. Isolation plancher bas 3. Menuiseries (formule ABF uniquement) 4. VMC simple flux 5. PAC air/eau haute température 6. Chauffe-eau thermodynamique et désembouage DTU 65.16. Justification : le dimensionnement de la PAC et l'éligibilité des aides sont conditionnés par l'isolation préalable.`;

function companyHtml() {
  const p = PRESTATAIRE_ENERGIA;
  return `Bureau d'Études &amp; Contractant Général<br>
16 Rue Cuvier, 69006 Lyon<br>
Tél : ${p.telephone} | ${p.email}<br>
SIRET : 941 819 427 00019 — RCS Lyon | TVA : ${p.tva}<br>
Marque INPI n° ${p.inpi}${p.assuranceDecennale ? ` — Assurance décennale ${p.assuranceDecennale}` : ""}`;
}

function piedReglementHtml() {
  return `<div class="disclaimer">
    <strong>TVA 5,5 %.</strong> Taux réduit de taxe sur la valeur ajoutée au titre de l'article 278-0 bis A du CGI (travaux de rénovation énergétique).
    <br><strong>Règlement de l'acompte par virement — Qonto SA.</strong>
    Titulaire : ${RIB_QONTO.titulaire} — ${RIB_QONTO.adresseTitulaire}.
    IBAN : ${RIB_QONTO.iban} — BIC : ${RIB_QONTO.bic}.
  </div>`;
}

function htmlPlanFinancement(meta, t) {
  return `
    <section class="bloc keep">
      <h2>V. PLAN DE FINANCEMENT &amp; SCÉNARIOS DE DÉMARRAGE</h2>
      <p>Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>
      <p><strong>Scénario A — Aides maximum.</strong> Profil Violet. J+0 audit ENERGIA ; J+1 dépôt MaPrimeRénov' (MAR) et demande Éco-PTZ (FABIEN) ; accord estimé sous 3 à 6 mois ; ensuite seulement, signature des devis définitifs et démarrage. <strong>NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH (sinon perte définitive et irrémédiable du MPR).</strong></p>
      <p><strong>Scénario B — Démarrage rapide.</strong> Renonciation définitive à MaPrimeRénov' pour les travaux de la présente formule. Devis signé, puis Éco-PTZ et prêt FABIEN, déblocage et démarrage sous environ 3 semaines. Aucune aide MPR.</p>
      <table>
        <thead>
          <tr>
            <th>Critère</th>
            <th style="background:#1a3c5e;color:#fff">Scénario A – Aides Max</th>
            <th style="background:#1a3c5e;color:#fff">Scénario B – Rapide</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Délai démarrage</td><td style="background:#f0fdf4">3 à 6 mois</td><td style="background:#f0f9ff">3 semaines</td></tr>
          <tr><td>MaPrimeRénov'</td><td style="background:#f0fdf4">Oui</td><td style="background:#f0f9ff">Non</td></tr>
          <tr><td>Éco-PTZ</td><td style="background:#f0fdf4">Oui</td><td style="background:#f0f9ff">Oui</td></tr>
          <tr><td>Prêt FABIEN</td><td style="background:#f0fdf4">Oui</td><td style="background:#f0f9ff">Oui</td></tr>
          <tr><td>CEE (hors ITE/ITI)</td><td style="background:#f0fdf4">Oui</td><td style="background:#f0f9ff">Oui</td></tr>
          <tr><td>Financement max</td><td style="background:#f0fdf4">MPR + 125 000 EUR</td><td style="background:#f0f9ff">125 000 EUR</td></tr>
          <tr><td>Reste à charge</td><td style="background:#f0fdf4">Minimisé</td><td style="background:#f0f9ff">Plus élevé</td></tr>
          <tr><td>Contrainte</td><td style="background:#f0fdf4">Accord ANAH obligatoire</td><td style="background:#f0f9ff">Aucune</td></tr>
          <tr><td>Idéal pour</td><td style="background:#f0fdf4">BLEU / JAUNE / VIOLET</td><td style="background:#f0f9ff">ROSE / Non éligible / Pressé</td></tr>
        </tbody>
      </table>
      <div class="hors-subvention">
        <strong>Choix du client — scénario de démarrage</strong>
        <p>☐ Scénario A : j'attends l'accord écrit de l'ANAH (3 à 6 mois) avant toute signature de devis définitif.</p>
        <p>☐ Scénario B : je renonce définitivement à MaPrimeRénov' pour ces travaux et je retiens le démarrage rapide (environ 3 semaines).</p>
        <p>Fait à ____________________ le ____ / ____ / 2026 — Signature client : ____________________</p>
      </div>
      <p><strong>Éco-PTZ et prêt travaux :</strong> FABIEN — VIVONS COURTIER — 06 71 19 96 45. Prêt travaux jusqu'à 75 000 €. Éco-PTZ jusqu'à 50 000 € à taux 0 %. Simulation indicative Vivons Courtier / UMAFI sur le reste à charge : environ ${euro(t.mensualiteVivons)} €/mois (taux et durée confirmés par FABIEN). Éco-PTZ 0 % sur 20 ans : ${euro(t.mensualiteEcoPtz20)} €/mois. Apport 0 € possible. Acceptation 48–72 h.</p>
      <p><strong>MaPrimeRénov' :</strong> MAR Antoine BARATIER — Cabinet C2ET, dépôt et suivi du dossier ANAH.</p>
      <p><strong>Coordination :</strong> Sylvain LEMBELEMBE — ENERGIA-CONSEIL IA® — 06 10 59 68 98 — contact@energia-conseil-ia.com.</p>
      <p>Économie de fioul indiquée à titre indicatif : environ ${euro(t.economieFioulMois)} €/mois. Sur la simulation Vivons Courtier, la mensualité de la présente formule (${euro(t.mensualiteVivons)} €/mois) est couverte par cette économie. Ce n'est pas un engagement de résultat.</p>
      <div class="julia">
        <p>⚖️ Les deux scénarios sont exclusifs. Scénario A : l'accord écrit de l'ANAH est obligatoire avant toute signature de devis définitif, sinon perte définitive et irrémédiable du MPR. Scénario B : renonciation définitive au MPR pour les travaux concernés. ENERGIA-CONSEIL IA® n'est pas responsable du non-respect de ce choix par le client. La formule ${meta.numero} est exclusive de l'autre formule Pereira : une seule des deux peut être acceptée.</p>
        <p><strong>Clause Julia Protection Aides :</strong> responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart &gt; 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH/CEE.</p>
        <p>Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – Mars 2026</p>
      </div>
    </section>`;
}

function pairesPhotos(eco) {
  const source = eco
    ? PAIRES_PHOTOS_CONTRAT_PEREIRA.filter((paire) => paire.id !== "facade-menuiseries")
    : PAIRES_PHOTOS_CONTRAT_PEREIRA;
  return source.map((paire) => {
    if (paire.id === "facade-menuiseries") {
      return {
        ...paire,
        preconisationRge:
          "Menuiseries alu teinté ou bois, Uw ≤ 1,30, petits bois et teintes de la mairie. Exclusion du PVC blanc. Conformité ABF.",
      };
    }
    if (paire.id === "combles") {
      return {
        ...paire,
        preconisationRge:
          "Laine minérale soufflée R ≥ 7,0 sur 60 m², artisan RGE. Photo après-pose à verser à réception.",
      };
    }
    return paire;
  });
}

export function payloadDevisCommercialPereira(offre) {
  const meta = metaOffrePereira(offre);
  const eco = meta.id === OFFRE_PEREIRA_ECO;
  const t = totauxOffrePereira(offre);
  const a = AIDES_PEREIRA_VIOLET;
  const c = CLIENT_PEREIRA_NERVIEUX;
  const p = PRESTATAIRE_ENERGIA;
  const fisc = FISCALITE_AVIS_PEREIRA;
  const dateTxt = dateLongue(DATE_DEVIS_COMMERCIAL_PEREIRA);
  const postes = lignesOffrePereira(offre);
  const alerteOrdre = eco
    ? ALERTE_ORDRE_PEREIRA.replace(" (formule ABF uniquement)", " — absentes de cette formule")
    : ALERTE_ORDRE_PEREIRA;

  const cgv = articlesCgvContractantGeneral({
    numero: meta.numero,
    dateTxt,
    totalTtc: t.totalTtc,
    acompte: t.acompte,
    intermediaire: t.intermediaire,
    solde: t.solde,
    ordreTravaux: eco
      ? "Isolation combles → plancher bas → VMC simple flux → PAC air/eau HT (dimensionnement post-isolation) → chauffe-eau thermodynamique 250 L et désembouage DTU 65.16. Isolation avant chauffage. Menuiseries exclues de cette formule."
      : "Isolation combles → plancher bas → menuiseries ABF → VMC simple flux → PAC air/eau HT (dimensionnement post-isolation) → chauffe-eau thermodynamique 250 L et désembouage DTU 65.16. Isolation avant chauffage.",
    artisans: "réseau RGE coordonné par Sylvain LEMBELEMBE",
  });
  cgv[2] = `<strong>Article 3 — Modalités de paiement 30 / 40 / 30 sur le reste à charge.</strong> Montant du marché : ${euro(t.totalHt)} € HT, TVA 5,5 % ${euro(t.totalTva)} €, soit ${euro(t.totalTtc)} € TTC. Aides estimées à titre indicatif : ${euro(t.aides)} €. Reste à charge indicatif : ${euro(t.resteACharge)} € TTC. Facture d'acompte de 30 % : ${euro(t.acompte)} € TTC, émise après accord écrit de l'ANAH si le scénario A est retenu (exigible à la signature si le client coche le scénario B). 40 % soit ${euro(t.intermediaire)} € TTC à mi-chantier, uniquement après validation de Sylvain LEMBELEMBE (Contractant Général — ENERGIA-CONSEIL IA®). Solde de 30 % soit ${euro(t.solde)} € TTC à la réception, après procès-verbal sans réserve. Le client règle sous 5 à 10 jours ouvrés après le feu vert de Sylvain.`;

  return {
    titre: meta.titre,
    numero: meta.numero,
    dateIso: DATE_DEVIS_COMMERCIAL_PEREIRA,
    dateTxt,
    prestataire: p,
    companyHtml: companyHtml(),
    piedReglementHtml: piedReglementHtml(),
    metaLignesHtml: `${meta.badge}<br>Maison ${c.surfaceHabitable} m² — Nervieux (42) — profil Violet<br>`,
    clientHtml: `<strong>Monsieur ${c.prenom} ${c.nom}</strong><br>1 Route de Saint-Germain-Laval, 42510 Nervieux<br>Propriétaire occupant — ${c.surfaceHabitable} m² — DPE ${c.dpeActuel} → ${c.dpeCible}`,
    lieuExecution: "1 Route de Saint-Germain-Laval, 42510 Nervieux",
    fiscaliteHtml: `<div class="disclaimer"><strong>Fiscalité.</strong> ${fisc.mention}</div>`,
    alertHtml: `<div class="alert-red">${alerteOrdre}</div>
      <div class="sous-ensemble"><strong>Badge conformité ABF.</strong> ${
        eco
          ? "Unité extérieure de la pompe à chaleur côté cour intérieure, invisible depuis la voie publique et la croix classée. Menuiseries non comprises dans cette formule."
          : "Unité extérieure côté cour intérieure, invisible depuis la voie publique et la croix classée. Menuiseries alu teinté ou bois, petits bois et teintes communales. Exclusion du PVC blanc."
      }</div>
      <div class="disclaimer">${EXCLUSION_ITI_PEREIRA.mention}</div>`,
    engagementArtisansHtml:
      "Les artisans RGE interviennent sous la maîtrise d'œuvre et la sous-traitance contractuelle d'ENERGIA-CONSEIL IA®. Mise en concurrence de 2 à 3 entreprises par poste, coordonnée par Sylvain LEMBELEMBE.",
    titrePostes: eco
      ? "II. Détail des postes — Formule Sérénité Éco-Confort"
      : "II. Détail des postes — Formule Rénovation Globale Complète ABF",
    introPostesHtml:
      "Les numéros de lots reprennent le récapitulatif transmis au client. L'ordre d'exécution est celui de l'alerte et du planning : isolation avant chauffage. TVA 5,5 % (article 278-0 bis A du CGI). Marge Contractant Général réservée : 5 200,00 € HT, identique sur les deux formules.",
    postes,
    totaux: { totalHt: t.totalHt, totalTva: t.totalTva, totalTtc: t.totalTtc },
    totauxPhraseHtml: `<strong>Total formule :</strong> ${euro(t.totalHt)} € HT | TVA 5,5 % : ${euro(t.totalTva)} € | <strong>TOTAL TTC : ${euro(t.totalTtc)} €</strong>.`,
    annexePhotosHtml: htmlAnnexePhotos({
      paires: pairesPhotos(eco),
      mentionLegale: PHOTOS_CONTRAT_PEREIRA.mentionLegale,
      mentionProjection: PHOTOS_CONTRAT_PEREIRA.mentionProjection,
      piedHtml: eco
        ? "Formule Éco : les menuiseries ne font pas partie du marché. Photos limitées aux postes retenus."
        : "Menuiseries neuves : alu teinté ou bois, Uw ≤ 1,30, conformité ABF, exclusion du PVC blanc.",
    }),
    recapLignes: [
      { label: "Total HT", montant: `${euro(t.totalHt)} €` },
      { label: "TVA 5,5 % — article 278-0 bis A du CGI", montant: `${euro(t.totalTva)} €` },
      { label: "Total TTC", montant: `${euro(t.totalTtc)} €`, total: true },
      {
        label: "MaPrimeRénov' Parcours Accompagné (estimation à titre indicatif)",
        montant: `− ${euro(a.mpr)} €`,
      },
      {
        label: "CEE Coup de pouce chauffage fioul (estimation à titre indicatif)",
        montant: `− ${euro(a.cee)} €`,
      },
      { label: "Total aides estimées", montant: `− ${euro(t.aides)} €`, total: true },
      { label: "Reste à charge client TTC", montant: `${euro(t.resteACharge)} €`, total: true },
      {
        label: "Facture d'acompte 30 % du reste à charge",
        muted: "Émise après accord écrit ANAH si scénario A. Exigible à la signature si scénario B.",
        montant: `${euro(t.acompte)} € TTC`,
      },
      {
        label: "40 % mi-chantier",
        muted: "Uniquement après validation de Sylvain LEMBELEMBE. Règlement sous 5 à 10 jours ouvrés.",
        montant: `${euro(t.intermediaire)} € TTC`,
      },
      {
        label: "30 % à réception",
        muted: "Réception avec Sylvain, le MAR et le client, après procès-verbal sans réserve.",
        montant: `${euro(t.solde)} € TTC`,
      },
    ],
    modalitesReglementHtml: piedReglementHtml(),
    titreAides: "IV. Aides 2026 (estimation à titre indicatif)",
    aidesLignes: [
      { label: "MaPrimeRénov' Parcours Accompagné — profil Violet", montant: `${euro(a.mpr)} €` },
      { label: "CEE Coup de pouce chauffage fioul", montant: `${euro(a.cee)} €` },
      { label: "Total aides", montant: `${euro(t.aides)} €`, total: true },
      { label: "Reste à charge", montant: `${euro(t.resteACharge)} € TTC`, total: true },
      {
        label: "Simulation Vivons Courtier / UMAFI (indicative)",
        montant: `environ ${euro(t.mensualiteVivons)} € / mois`,
      },
      {
        label: "Éco-PTZ 0 % sur 20 ans (indicatif)",
        montant: `${euro(t.mensualiteEcoPtz20)} € / mois`,
      },
    ],
    regleAnahExtra: " NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L'ACCORD ÉCRIT DE L'ANAH.",
    apresRecapHtml: htmlPlanFinancement(meta, t),
    planning: [
      {
        phase: "Accord ANAH (scénario A)",
        duree: "3 à 6 mois",
        detail: "Aucun démarrage et aucune signature de devis définitif avant l'accord écrit. Clyve et le MAR instruisent le dossier.",
      },
      { phase: "1. Combles 60 m²", duree: "2 à 3 jours", detail: "Laine minérale soufflée R ≥ 7,0 — avant la PAC" },
      { phase: "2. Plancher bas 19 m²", duree: "1 à 2 semaines", detail: "Panneaux rigides R ≥ 3,0 — avant la PAC" },
      ...(eco
        ? []
        : [
            {
              phase: "3. Menuiseries ABF",
              duree: "2 à 3 semaines",
              detail: "Alu teinté ou bois, petits bois, teintes mairie, hors PVC blanc",
            },
          ]),
      { phase: "4. VMC simple flux", duree: "3 à 5 jours", detail: "Incluse au lot chauffage, après isolation" },
      {
        phase: "5. PAC air/eau HT",
        duree: "2 à 3 semaines",
        detail: "Groupe extérieur côté cour, masqué, conforme ABF. Dimensionnement post-isolation.",
      },
      {
        phase: "6. Ballon 250 L et désembouage",
        duree: "2 à 3 jours",
        detail: "DTU 65.16 et filtre magnétique",
      },
    ],
    signatureHtml: `<p>Je soussigné, <strong>Monsieur ${c.prenom} ${c.nom}</strong>, accepte le devis <strong>${meta.numero}</strong> — ${meta.titre} — d'un montant de <strong>${euro(t.totalTtc)} € TTC</strong>, reste à charge indicatif <strong>${euro(t.resteACharge)} € TTC</strong>, et mandate ENERGIA-CONSEIL IA® comme Contractant Général.</p>
      <p>J'ai coché un seul scénario de démarrage (A ou B). J'ai pris connaissance de l'ordre d'exécution : isolation avant chauffage.</p>
      <p>Fait à ____________________ , le ____ / ____ / 2026</p>
      <table class="sig-table"><tr>
        <td>Le client — Monsieur ${c.prenom} ${c.nom}<div class="sig-line"></div></td>
        <td>ENERGIA-CONSEIL IA® — Sylvain LEMBELEMBE<div class="sig-line"></div></td>
      </tr></table>`,
    contacts: [
      ...CONTACTS_PEREIRA_CONTRAT,
      {
        role: "MAR — Mon Accompagnateur Rénov'",
        nom: "Antoine BARATIER — Cabinet C2ET",
        detail: "Parcours accompagné, dépôt et suivi du dossier ANAH (coordination ENERGIA)",
      },
    ],
    juliaBullets: [
      `la formule <strong>${meta.numero}</strong> (${euro(t.totalTtc)} € TTC, reste à charge indicatif ${euro(t.resteACharge)} €) et son exclusivité par rapport à l'autre formule Pereira ;`,
      `la conformité ABF du groupe extérieur (côté cour, hors vue de la voie publique et de la croix classée)${eco ? "" : " et des menuiseries (alu teinté ou bois, exclusion du PVC blanc)"} ;`,
      `le profil Violet (RFR ${euro(fisc.rfr)} €, 1 part, hors Île-de-France) et les aides 2026 à titre indicatif ;`,
      `l'ordre d'exécution impératif : isolation des combles et du plancher avant la pompe à chaleur ;`,
      `l'interdiction de démarrer avant l'accord écrit de l'ANAH si le scénario A est retenu ;`,
      `la <strong>Clause Julia Protection Aides</strong> : responsabilité ENERGIA plafonnée à 2 000 € en cas d'écart &gt; 10 % imputable à une erreur prouvée d'ENERGIA ; 0 % si erreur client ou décision ANAH/CEE ;`,
      `le paiement 30 / 40 / 30 du reste à charge (${euro(t.acompte)} € / ${euro(t.intermediaire)} € / ${euro(t.solde)} € TTC), le 40 % et le solde après validation de Sylvain LEMBELEMBE.`,
    ],
    cgvArticles: cgv,
    ordreTravauxCgv: "Isolation avant chauffage.",
    echeancier: { acompte: t.acompte, intermediaire: t.intermediaire, solde: t.solde },
    mentionsHtml: `Document confidentiel. Année 2026. ${p.nom} — 16 Rue Cuvier, 69006 Lyon — SIRET 941 819 427 00019 — RCS Lyon 941 819 427 — TVA ${p.tva} — Marque INPI n° ${p.inpi}. Métrés : combles ${METRES_PEREIRA_NERVIEUX.comblesM2} m², plancher ${METRES_PEREIRA_NERVIEUX.plancherM2} m². Clyve intervient comme gestionnaire administrative partenaire et n'est pas une ligne facturée au client.`,
    footerClientHtml: `${meta.numero} — Monsieur ${c.prenom} ${c.nom} — 1 Route de Saint-Germain-Laval, 42510 Nervieux — ${dateTxt}`,
  };
}

export function construireHtmlDevisCommercialPereira(offre) {
  return construireHtmlContratContractantGeneral(payloadDevisCommercialPereira(offre));
}

export function controlerTotauxOffrePereira(offre) {
  const lignes = lignesOffrePereira(offre);
  const somme = sommer(lignes);
  const attendu = totauxOffrePereira(offre);
  const marge = lignes.find((l) => l.prestationId === "energia-contractant-general");
  return {
    ok:
      somme.totalHt === attendu.totalHt &&
      somme.totalTva === attendu.totalTva &&
      somme.totalTtc === attendu.totalTtc &&
      marge?.totalHt === MARGE_CG_PEREIRA_HT &&
      round2(attendu.totalTtc - attendu.aides) === attendu.resteACharge &&
      round2(attendu.resteACharge * 0.3) === attendu.acompte,
    somme,
    attendu,
  };
}
