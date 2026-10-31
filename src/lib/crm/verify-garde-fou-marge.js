/**
 * Contrôles bouclier anti-marge négative.
 * Exécution : node src/lib/crm/verify-garde-fou-marge.js
 */

import {
  MODE_FOURNITURE_POSE,
  MODE_POSE_SEULE,
  STATUT_DEVIS_BLOQUE,
  STATUT_DEVIS_CONFORME,
  STATUT_DEVIS_VIGILANCE,
  STATUT_MARGE_PERTE,
  STATUT_MARGE_VIGILANCE,
  TAUX_MARGE_SECURISATION,
  analyserDevis,
  analyserLigneMarge,
  coutRevientSelonMode,
  prixVentePlancherHt,
  puHtPlancherDepuisRevientTotal,
  tenterExportClient,
} from "./gardeFouMarge.js";
import { referentielParDefaut } from "./artisansRge.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { htmlContratPourDossier } from "./htmlContratCrm.js";
import { editionVide } from "./editionDossier.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const referentiel = referentielParDefaut();

const modeA = analyserLigneMarge({
  id: "a",
  nom: "PAC F+P",
  prixVenteHt: 15000,
  coutRevientHt: coutRevientSelonMode({
    modeSousTraitance: MODE_FOURNITURE_POSE,
    coutFourniturePoseHt: 10500,
    coutMaterielDirectHt: 7500,
    coutPoseArtisanHt: 2500,
  }),
  modeSousTraitance: MODE_FOURNITURE_POSE,
});
assert(modeA.coutRevientHt === 10500, `Mode A revient ${modeA.coutRevientHt}`);
assert(modeA.margeHt === 4500, `Mode A marge ${modeA.margeHt} ≠ 15000-10500`);
assert(Math.abs(modeA.tauxMarge - 0.3) < 1e-9, "Mode A 30 %");
assert(modeA.statut !== STATUT_MARGE_PERTE, "Mode A pas une perte");

const modeB = analyserLigneMarge({
  id: "b",
  nom: "PAC pose seule",
  prixVenteHt: 15000,
  coutRevientHt: coutRevientSelonMode({
    modeSousTraitance: MODE_POSE_SEULE,
    coutFourniturePoseHt: 10500,
    coutMaterielDirectHt: 7500,
    coutPoseArtisanHt: 2500,
  }),
  modeSousTraitance: MODE_POSE_SEULE,
});
assert(modeB.coutRevientHt === 10000, "Mode B 7500+2500");
assert(modeB.margeHt === 5000, "Mode B 15000-10000");

const perte = analyserLigneMarge({
  id: "perte",
  nom: "Isolation vendue à perte",
  prixVenteHt: 18,
  coutRevientHt: 22,
});
assert(perte.statut === STATUT_MARGE_PERTE, "vente à perte détectée");
assert(perte.margeHt === -4, `marge ${perte.margeHt}`);
assert(perte.tauxMarge < 0, "taux négatif");

const faible = analyserLigneMarge({
  id: "faible",
  nom: "Peinture marge 10 %",
  prixVenteHt: 100,
  coutRevientHt: 90,
});
assert(faible.statut === STATUT_MARGE_VIGILANCE, "marge 10 % → vigilance ligne");
assert(Math.abs(faible.tauxMarge - 0.1) < 1e-9, "taux 10 %");

assert(prixVentePlancherHt(85, TAUX_MARGE_SECURISATION) === 100, "plancher 15 % : 85 / 0,85 = 100");
assert(puHtPlancherDepuisRevientTotal(2200, 100) === 25.88, `PU plancher combles ${puHtPlancherDepuisRevientTotal(2200, 100)}`);

const lignePerte = {
  id: "trav-perte",
  nom: "Isolation vendue à perte",
  familleId: "isolation",
  artisan: "C2L (RGE)",
  artisanId: "c2l-isolation",
  quantite: 100,
  unite: "m²",
  puHt: 10,
  totalHt: 1000,
  modeSousTraitance: MODE_FOURNITURE_POSE,
};
const devisPerte = analyserDevis([lignePerte], referentiel);
assert(devisPerte.venteAPerte, "devis : ligne déficitaire");
assert(devisPerte.statut === STATUT_DEVIS_BLOQUE, "devis bloqué");
assert(devisPerte.totalFactureClientHt === 1000, "facture 1000");
assert(devisPerte.totalCoutsAchatHt === 2200, "C2L 100×22");
assert(devisPerte.margeBruteHt === -1200, "marge globale -1200");

const exportPerte = tenterExportClient({
  travaux: [lignePerte],
  dossier: { id: "projet-manuel-test-perte" },
  edition: editionVide(),
  referentiel,
});
assert(exportPerte.ok === false, "export contrat bloqué");
assert(exportPerte.bloque === true, "flag bloque");
assert(/vente à perte/i.test(exportPerte.motif), `motif export : ${exportPerte.motif}`);
assert(/Isolation vendue à perte/.test(exportPerte.motif), "nom de ligne dans le motif");

const exportOfficiel = tenterExportClient({
  travaux: [lignePerte],
  dossier: { id: BRUNEL_DOSSIER_ID },
  edition: { ...editionVide(), verrouillageOfficiel: true },
  referentiel,
});
assert(exportOfficiel.ok === true, "contrat officiel Brunel toujours téléchargeable");
assert(exportOfficiel.exceptionOfficielle === true, "exception dossier signé");
assert(typeof htmlContratPourDossier({}, { id: BRUNEL_DOSSIER_ID }) === "string", "HTML officiel intact");

const ligneSaine = {
  id: "trav-ok",
  nom: "Isolation combles",
  familleId: "isolation",
  artisan: "C2L (RGE)",
  quantite: 100,
  unite: "m²",
  puHt: 41.68,
  totalHt: 4168,
  modeSousTraitance: MODE_FOURNITURE_POSE,
};
const devisSain = analyserDevis([ligneSaine], referentiel);
assert(devisSain.venteAPerte === false, "pas de perte");
assert(devisSain.statut === STATUT_DEVIS_CONFORME, `conforme ${devisSain.tauxMarge}`);
assert(tenterExportClient({ travaux: [ligneSaine], dossier: { id: "client-test" }, referentiel }).ok, "export autorisé");

const devisVigilance = analyserDevis(
  [
    {
      id: "trav-vig",
      nom: "Lot vigilance",
      totalHt: 100,
      quantite: 1,
      unite: "forfait",
      fourniturePosePuHt: 85,
      modeSousTraitance: MODE_FOURNITURE_POSE,
    },
  ],
  referentiel,
);
assert(devisVigilance.statut === STATUT_DEVIS_VIGILANCE, `vigilance globale ${devisVigilance.tauxMarge}`);
assert(devisVigilance.venteAPerte === false, "15 % n’est pas une vente à perte");
assert(
  tenterExportClient({
    travaux: [
      {
        id: "trav-vig",
        nom: "Lot vigilance",
        totalHt: 100,
        quantite: 1,
        unite: "forfait",
        fourniturePosePuHt: 85,
        modeSousTraitance: MODE_FOURNITURE_POSE,
      },
    ],
    dossier: { id: "client-test" },
    referentiel,
  }).ok,
  "export autorisé si marge ≥ 0 même < 20 %",
);

assert(
  coutRevientSelonMode({
    modeSousTraitance: MODE_FOURNITURE_POSE,
    coutFourniturePoseHt: 100,
    coutMaterielDirectHt: 80,
    coutPoseArtisanHt: 20,
  }) === 100,
  "Mode A : forfait prioritaire sur mat+pose",
);
assert(
  coutRevientSelonMode({
    modeSousTraitance: MODE_POSE_SEULE,
    coutFourniturePoseHt: 100,
    coutMaterielDirectHt: 80,
    coutPoseArtisanHt: 20,
  }) === 100,
  "Mode B : 80+20",
);

console.log("OK verify-garde-fou-marge — Mode A/B, vente à perte, blocage export, exception officielle, plancher 15 %.");
