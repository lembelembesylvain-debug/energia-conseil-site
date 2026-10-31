/**
 * Contrôles Brunel V5 — double option Performance / Autonomie solaire.
 * Exécution : node src/lib/crm/verify-brunel-offres-v5.js
 */

import {
  AIDES_BRUNEL_V5_AUTONOMIE,
  AIDES_BRUNEL_V5_PERFORMANCE,
  ECHEANCIER_BRUNEL_V5_AUTONOMIE,
  ECHEANCIER_BRUNEL_V5_PERFORMANCE,
  FINANCEMENT_BRUNEL_V5_AUTONOMIE,
  GALERIE_PROJECTIONS_BRUNEL,
  METRIQUES_SOLAIRES_BRUNEL,
  OFFRE_AUTONOMIE,
  OFFRE_PERFORMANCE,
  POSTE_SOLAIRE_V5_ID,
  TOTAUX_BRUNEL_V5_CUMUL,
  TOTAUX_BRUNEL_V5_PERFORMANCE,
  TOTAUX_BRUNEL_V5_SOLAIRE,
  calculerAmortissementSolaireBrunel,
  recapOffreBrunel,
  totauxContractuelsBrunelV5,
} from "./brunelOffresV5.js";
import {
  appliquerVerrouillageBrunelV5,
  calculerAidesIndicatives,
  calculerFinancement,
  totauxTravaux,
} from "./editionDossier.js";
import { htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { TOTAUX_BRUNEL_V4 } from "./brunelDevisV3Officiel.js";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

assert(TOTAUX_BRUNEL_V5_PERFORMANCE.totalHt === 35192.41, "Performance HT");
assert(TOTAUX_BRUNEL_V5_PERFORMANCE.totalTva === 1935.58, "Performance TVA");
assert(TOTAUX_BRUNEL_V5_PERFORMANCE.totalTtc === 37127.99, "Performance TTC");
assert(TOTAUX_BRUNEL_V5_PERFORMANCE.totalTtc === TOTAUX_BRUNEL_V4.totalTtc, "V5 Performance = V4");
assert(TOTAUX_BRUNEL_V5_SOLAIRE.totalHt === 15000, "Solaire HT");
assert(TOTAUX_BRUNEL_V5_SOLAIRE.totalTva === 3000, "Solaire TVA 20 %");
assert(TOTAUX_BRUNEL_V5_SOLAIRE.totalTtc === 18000, "Solaire TTC");
assert(TOTAUX_BRUNEL_V5_CUMUL.totalHt === 50192.41, "Cumul HT");
assert(TOTAUX_BRUNEL_V5_CUMUL.totalTva === 4935.58, "Cumul TVA");
assert(TOTAUX_BRUNEL_V5_CUMUL.totalTtc === 55127.99, "Cumul TTC");
assert(
  round2(TOTAUX_BRUNEL_V5_PERFORMANCE.totalTtc + TOTAUX_BRUNEL_V5_SOLAIRE.totalTtc) ===
    TOTAUX_BRUNEL_V5_CUMUL.totalTtc,
  "Performance + solaire = cumul TTC",
);

assert(ECHEANCIER_BRUNEL_V5_PERFORMANCE.acompte === 11138.4, "acompte Performance");
assert(ECHEANCIER_BRUNEL_V5_PERFORMANCE.intermediaire === 14851.2, "40 % Performance");
assert(ECHEANCIER_BRUNEL_V5_PERFORMANCE.solde === 11138.39, "solde Performance");
assert(
  round2(
    ECHEANCIER_BRUNEL_V5_AUTONOMIE.acompte +
      ECHEANCIER_BRUNEL_V5_AUTONOMIE.intermediaire +
      ECHEANCIER_BRUNEL_V5_AUTONOMIE.solde,
  ) === 55127.99,
  "échéancier Autonomie = TTC cumul",
);

const perf = totauxContractuelsBrunelV5(OFFRE_PERFORMANCE);
assert(perf.lignes.length === 8, "8 postes Performance");
assert(!perf.lignes.some((l) => l.id === POSTE_SOLAIRE_V5_ID), "pas de solaire en Performance");
assert(perf.totalTtc === 37127.99, "totaux Performance");

const auto = totauxContractuelsBrunelV5(OFFRE_AUTONOMIE);
assert(auto.lignes.length === 9, "9 postes Autonomie");
assert(auto.lignes[8].id === POSTE_SOLAIRE_V5_ID, "poste 9 solaire");
assert(auto.lignes[8].tauxTva === 0.2, "TVA 20 % solaire");
assert(auto.totalTtc === 55127.99, "totaux Autonomie");
assert(totauxTravaux(auto.lignes).totalTtc === 55127.99, "moteur totaux Autonomie");

const lockedPerf = appliquerVerrouillageBrunelV5({ offreActive: OFFRE_PERFORMANCE });
assert(lockedPerf.travaux.length === 8, "verrou Performance 8 postes");
const lockedAuto = appliquerVerrouillageBrunelV5({ offreActive: OFFRE_AUTONOMIE });
assert(lockedAuto.travaux.length === 9, "verrou Autonomie 9 postes");
assert(lockedAuto.version === "V5", "version V5 Autonomie");

const aidesPerf = calculerAidesIndicatives(lockedPerf);
assert(aidesPerf.totalAides === AIDES_BRUNEL_V5_PERFORMANCE.totalAides, "aides inchangées Performance");
const planPerf = calculerFinancement(lockedPerf);
assert(planPerf.resteACharge === 7707.99, `RAC Performance ${planPerf.resteACharge}`);
assert(planPerf.acompte === 11138.4, "acompte Performance financement");
assert(planPerf.mensualite === 32.12, "mensualité Performance");

const planAuto = calculerFinancement(lockedAuto);
assert(planAuto.resteACharge === AIDES_BRUNEL_V5_AUTONOMIE.resteACharge, `RAC Autonomie ${planAuto.resteACharge}`);
assert(planAuto.totalTtc === 55127.99, "TTC Autonomie financement");
assert(planAuto.acompte === FINANCEMENT_BRUNEL_V5_AUTONOMIE.acompte, "acompte Autonomie");
assert(planAuto.mensualite === 107.12, "mensualité Autonomie");

const recap = recapOffreBrunel(OFFRE_AUTONOMIE);
assert(recap.solaireInclus === true, "recap solaire");
assert(recap.resteACharge === 25707.99, "recap RAC");

const roi = calculerAmortissementSolaireBrunel(0.035);
assert(roi.jalons.length === 8, "8 jalons ROI");
assert(roi.jalons[0].economieAnnuelle === 1430, "année 1 = 1 430");
assert(roi.jalons[4].annee === 10, "jalon année 10");
assert(roi.anneePointMort === 11, `point mort année ${roi.anneePointMort}`);
assert(roi.jalons[4].economieCumulee > 16000 && roi.jalons[4].economieCumulee < 19000, `année 10 cumul ${roi.jalons[4].economieCumulee}`);
assert(roi.cumul25Ans > 18000, `cumul 25 ans ${roi.cumul25Ans}`);
assert(roi.gainNet25Ans === round2(roi.cumul25Ans - METRIQUES_SOLAIRES_BRUNEL.investissementTtc), "gain net = cumul − 18 000");
assert(METRIQUES_SOLAIRES_BRUNEL.productionKwhAn === 7268, "PVGIS 7 268");

assert(GALERIE_PROJECTIONS_BRUNEL.length === 3, "3 rendus officiels");
assert(GALERIE_PROJECTIONS_BRUNEL[0].src.includes("renovation-architecturale-contemporaine"), "façade baie 215x240");
assert(GALERIE_PROJECTIONS_BRUNEL[1].src.includes("facade-sud-panneaux-solaires"), "façade sud");
assert(GALERIE_PROJECTIONS_BRUNEL[2].src.includes("unite-exterieure-daikin"), "PAC Daikin");

const htmlPerf = htmlContratPourDossier({ offreActive: OFFRE_PERFORMANCE }, { id: BRUNEL_DOSSIER_ID });
assert(htmlPerf.includes("33 478,53"), "HTML marché option 1 TTC");
assert(htmlPerf.includes("31 733,21"), "HTML marché option 1 HT");
assert(htmlPerf.includes("1 458,80"), "HTML combles 35 m²");
assert(!htmlPerf.includes("55 127,99"), "HTML Performance sans cumul");
const htmlAuto = htmlContratPourDossier({ offreActive: OFFRE_AUTONOMIE }, { id: BRUNEL_DOSSIER_ID });
assert(htmlAuto.includes("55 127,99"), "HTML Autonomie TTC");
assert(htmlAuto.includes("50 192,41"), "HTML Autonomie HT");
assert(htmlAuto.includes("15 000,00"), "HTML lot solaire HT");
assert(htmlAuto.includes("18 000,00"), "HTML lot solaire TTC");
assert(htmlAuto.includes("16 538,40"), "HTML acompte Autonomie");
assert(htmlAuto.includes("22 051,20"), "HTML 40 % Autonomie");
assert(htmlAuto.includes("16 538,39"), "HTML solde Autonomie");
assert(htmlAuto.includes("4 935,58"), "HTML TVA mixte");
assert(htmlAuto.includes("Marché Performance HT (TVA 5,5 %)"), "HTML libellé recap Performance");
assert(htmlAuto.includes("TOTAL CHANTIER GLOBAL TTC"), "HTML total global");
assert(htmlAuto.includes("renovation-architecturale-contemporaine-anthracite.jpg"), "HTML image façade baie");
assert(htmlAuto.includes("facade-sud-panneaux-solaires-gris-anthracite.jpg"), "HTML image façade sud");
assert(htmlAuto.includes("unite-exterieure-daikin-sur-mur-de-pierre-anthracite.jpg"), "HTML image PAC Daikin");
assert(htmlAuto.includes("12 panneaux DualSun 500 Wc"), "HTML légende DualSun");
assert(htmlAuto.includes("plots antivibratiles"), "HTML légende PAC Daikin");
assert(htmlAuto.includes("max-width: 100%"), "HTML CSS images max-width");
assert(htmlAuto.includes("border-radius: 8px"), "HTML CSS images radius");
assert(htmlAuto.includes("à titre indicatif"), "disclaimer aides Autonomie");
assert(htmlAuto.includes("IV. ÉTUDE DE RENTABILITÉ FINANCIÈRE"), "HTML section ROI Autonomie");
assert(htmlAuto.includes("9,8 ans"), "HTML TRI 9,8 ans");
assert(htmlAuto.includes("8,2 %"), "HTML rendement 8,2 %");
assert(htmlAuto.includes("39 200"), "HTML gain net 39 200");
assert(htmlAuto.includes("18 522"), "HTML cumul année 10");
assert(htmlAuto.includes("57 200"), "HTML cumul 25 ans");
assert(htmlAuto.includes("Point mort franchi"), "HTML point mort");
assert(htmlAuto.includes("0,25 €/kWh"), "HTML note méthodologique tarif");
assert(htmlAuto.includes("arrêté juin 2026"), "HTML note revente surplus");
assert(htmlAuto.includes("<svg"), "HTML graphique SVG");
assert(htmlAuto.includes("figure class=\"graphique-roi-solaire\""), "HTML conteneur graphique ROI");
assert(htmlAuto.includes("Seuil d’amortissement à 9,8 ans") || htmlAuto.includes("Seuil d'amortissement à 9,8 ans"), "HTML titre graphique");
assert(htmlAuto.includes("Investissement initial : 18 000 € TTC"), "HTML ligne investissement SVG");
assert(htmlAuto.includes("Zone de bénéfice net"), "HTML zone bénéfice SVG");
assert(htmlAuto.includes("Économies réelles cumulées"), "HTML légende vert");
assert(htmlAuto.includes("Seuil investissement 18 000"), "HTML légende rouge");
assert(htmlAuto.includes("Bénéfice net patrimoine"), "HTML légende or");
assert(!htmlPerf.includes("figure class=\"graphique-roi-solaire\""), "HTML Performance sans graphique ROI");
assert(!htmlPerf.includes("ÉTUDE DE RENTABILITÉ FINANCIÈRE"), "HTML Performance sans ROI solaire");
assert(nomFichierContrat({ id: BRUNEL_DOSSIER_ID }, { offreActive: OFFRE_AUTONOMIE }).includes("AUTONOMIE"), "nom fichier Autonomie");

const racine = join(dirname(fileURLToPath(import.meta.url)), "../../..");
assert(
  existsSync(join(racine, "public/projects/brunel/renovation-architecturale-contemporaine-anthracite.jpg")),
  "image façade baie 215x240",
);
assert(
  existsSync(join(racine, "public/projects/brunel/facade-sud-panneaux-solaires-gris-anthracite.jpg")),
  "image façade sud",
);
assert(
  existsSync(join(racine, "public/projects/brunel/unite-exterieure-daikin-sur-mur-de-pierre-anthracite.jpg")),
  "image PAC Daikin",
);

console.log("OK — Brunel V5 : Performance 37 127,99 TTC / Autonomie 55 127,99 TTC / images blob / récap III.");
