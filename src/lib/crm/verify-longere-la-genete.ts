/**
 * Cohérence chiffrée — Longère La Genête.
 * Exécution : npx tsx src/lib/crm/verify-longere-la-genete.ts
 */

import { existsSync } from "node:fs";
import { DOSSIER_CLYVE_LAGENETE, calculerMarges, dossiersVersAuditsCrm } from "./mockData.js";
import {
  ANNEXE_COUPE_3D,
  CONTACTS_PROJET,
  verifierCoherenceLongere,
  genererOffre,
} from "../../data/longereLaGenete";

const erreurs = verifierCoherenceLongere();
if (erreurs.length > 0) {
  throw new Error(erreurs.join(" | "));
}

const offre = genererOffre("phase1");
const marges = calculerMarges(DOSSIER_CLYVE_LAGENETE);
if (DOSSIER_CLYVE_LAGENETE.nom !== "Maison Clyve - La Genête") {
  throw new Error(DOSSIER_CLYVE_LAGENETE.nom);
}
if (DOSSIER_CLYVE_LAGENETE.etape !== "devis") throw new Error("étape pipeline");
if (DOSSIER_CLYVE_LAGENETE.href !== "/longere-la-genete") throw new Error("href dossier");
if (marges.totalHt !== offre.totalHt || marges.totalTtc !== offre.totalTtc) {
  throw new Error(`CRM ${marges.totalHt} / ${marges.totalTtc} ≠ offre ${offre.totalHt} / ${offre.totalTtc}`);
}
if (marges.partEnergiaHt !== 1500 || marges.partTravauxHt !== 7350 || marges.partApporteurHt !== 0) {
  throw new Error(`ventilation CRM ${marges.partTravauxHt} + ${marges.partEnergiaHt} + ${marges.partApporteurHt}`);
}
if (DOSSIER_CLYVE_LAGENETE.commercial_id != null || DOSSIER_CLYVE_LAGENETE.commission_rate_default !== 0) {
  throw new Error("dossier Clyve encore rattaché à une commission commerciale");
}
const auditClyve = dossiersVersAuditsCrm([DOSSIER_CLYVE_LAGENETE])[0];
if (auditClyve.commercial_id != null || auditClyve.commission_amount !== 0) {
  throw new Error(`commission CRM Clyve : ${auditClyve.commercial_id} / ${auditClyve.commission_amount}`);
}

if (!ANNEXE_COUPE_3D.titre.startsWith("ANNEXE TECHNIQUE 1")) throw new Error("titre annexe");
ANNEXE_COUPE_3D.figures.forEach((figure, index) => {
  if (!existsSync(`public${figure.src}`)) {
    throw new Error(`Annexe technique 1 : image absente de public${figure.src}`);
  }
  if (!figure.legende.startsWith(`Figure ${index + 1} :`)) {
    throw new Error(`légende hors séquence : ${figure.legende.slice(0, 40)}`);
  }
});

if (CONTACTS_PROJET.length !== 4) throw new Error(`${CONTACTS_PROJET.length} contacts au lieu de 4`);
if (CONTACTS_PROJET.some((contact) => /DAMIEN/i.test(`${contact.nom} ${contact.role}`))) {
  throw new Error("Damien encore présent sur un dossier direct");
}
const mar = CONTACTS_PROJET.find((contact) => contact.role.startsWith("MAR"));
if (!mar || mar.nom !== "Antoine BARATIER — Cabinet C2ET") throw new Error("MAR officiel absent");
if (JSON.stringify(CONTACTS_PROJET).includes("Léo-Energy")) throw new Error("Léo-Energy encore présent");

console.log(
  `Longère La Genête — cohérence OK (8 850 € HT / 9 735 € TTC, marge sanctuarisée, ${ANNEXE_COUPE_3D.figures.length} figures en annexe).`,
);
