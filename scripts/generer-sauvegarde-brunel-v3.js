/**
 * Génère data/sauvegardes/devis-brunel-v3-officiel.json
 * et met à jour l’état PropTech Brunel du jour.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRUNEL_DOSSIER_ID } from "../src/lib/crm/brunelWorkingBase.js";
import { editionOfficielleBrunelV3 } from "../src/lib/crm/brunelDevisV3Officiel.js";
import { snapshotProptech } from "../src/lib/crm/sauvegardeProptech.js";
import { calculerTunnelProptech } from "../src/lib/crm/tunnelProptech.js";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
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
console.log(`Écrit ${officiel}`);
console.log(`Écrit ${actif}`);
console.log(
  JSON.stringify(
    {
      ttc: snapshot.tunnel?.totaux?.totalTtc,
      aides: snapshot.tunnel?.aides?.totalAides,
      rac: snapshot.tunnel?.resteACharge,
      adresse: snapshot.edition?.client?.adresse,
    },
    null,
    2,
  ),
);
