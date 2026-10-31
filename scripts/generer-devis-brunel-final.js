/**
 * Écrit le devis HTML FINAL (racine + public/)
 * et rafraîchit data/sauvegardes/devis-brunel-v3-officiel.json
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRUNEL_DOSSIER_ID } from "../src/lib/crm/brunelWorkingBase.js";
import { FICHIER_DEVIS_BRUNEL_FINAL, editionOfficielleBrunelV3 } from "../src/lib/crm/brunelDevisV3Officiel.js";
import { genererHtmlDevisBrunelFinal } from "../src/lib/crm/devisBrunelFinalHtml.js";
import { SRC_FACADE_BRUNEL } from "../src/lib/crm/payloadContratCrm.js";
import { snapshotProptech } from "../src/lib/crm/sauvegardeProptech.js";
import { calculerTunnelProptech } from "../src/lib/crm/tunnelProptech.js";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");

function embarquerFacade(html) {
  const jpg = join(racine, "public/images/brunel/facade-brunel.jpg");
  if (!existsSync(jpg)) return html;
  const dataUri = `data:image/jpeg;base64,${readFileSync(jpg).toString("base64")}`;
  return html.split(SRC_FACADE_BRUNEL).join(dataUri);
}

const html = embarquerFacade(genererHtmlDevisBrunelFinal());
const publicDir = join(racine, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(racine, FICHIER_DEVIS_BRUNEL_FINAL), html, "utf8");
writeFileSync(join(publicDir, FICHIER_DEVIS_BRUNEL_FINAL), html, "utf8");

const dossier = join(racine, "data", "sauvegardes");
const edition = editionOfficielleBrunelV3();
const tunnel = calculerTunnelProptech(edition, {
  dpeActuel: edition.valorisation.dpeActuel,
});
const snapshot = snapshotProptech({
  dossierId: BRUNEL_DOSSIER_ID,
  edition,
  role: "commercial",
  sniper: null,
  tunnel,
});
snapshot.date = "2026-09-19T00:16:00.000Z";
snapshot.devisOfficiel = edition.devisOfficiel;
snapshot.mentionsJuridiques = edition.mentionsJuridiques;

mkdirSync(dossier, { recursive: true });
const officiel = join(dossier, "devis-brunel-v3-officiel.json");
const actif = join(dossier, "proptech-projet-manuel-brunel-emrick-2026-09-19.json");
const json = `${JSON.stringify(snapshot, null, 2)}\n`;
writeFileSync(officiel, json, "utf8");
writeFileSync(actif, json, "utf8");

console.log(`Écrit ${join(racine, FICHIER_DEVIS_BRUNEL_FINAL)}`);
console.log(`Écrit ${join(publicDir, FICHIER_DEVIS_BRUNEL_FINAL)}`);
console.log(`Écrit ${officiel}`);
console.log(
  JSON.stringify(
    {
      numero: edition.devisOfficiel.numero,
      ttc: snapshot.tunnel?.totaux?.totalTtc,
      aides: snapshot.tunnel?.aides?.totalAides,
      rac: snapshot.tunnel?.resteACharge,
      combles: edition.travaux?.[0]?.quantite,
    },
    null,
    2,
  ),
);
