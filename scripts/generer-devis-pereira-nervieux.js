/**
 * Écrit le devis HTML + rapport Pereira (racine + public/)
 * et data/sauvegardes/client-pereira-nervieux-sans-iti.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  AIDES_PEREIRA_VIOLET,
  FICHIER_DEVIS_PEREIRA_NERVIEUX,
  FICHIER_RAPPORT_PEREIRA_NERVIEUX,
  FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX,
  FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX_CALCULE,
  FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX_LEGACY,
  FISCALITE_AVIS_PEREIRA,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  editionOfficiellePereiraNervieux,
} from "../src/lib/crm/pereiraNervieuxOfficiel.js";
import { construireHtmlDevisPereiraNervieux } from "../src/lib/crm/devisPereiraNervieuxHtml.js";
import { construireHtmlRapportPereiraNervieux } from "../src/lib/crm/rapportPereiraNervieuxHtml.js";
import { snapshotProptech } from "../src/lib/crm/sauvegardeProptech.js";
import { calculerTunnelProptech } from "../src/lib/crm/tunnelProptech.js";
import { ROLE_ADMIN } from "../src/lib/crm/roles.js";
import {
  calculerAidesIndicatives,
  calculerFinancement,
  calculerFinancesInternes,
} from "../src/lib/crm/editionDossier.js";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = construireHtmlDevisPereiraNervieux();
const rapport = construireHtmlRapportPereiraNervieux();
const publicDir = join(racine, "public");
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(racine, FICHIER_DEVIS_PEREIRA_NERVIEUX), html, "utf8");
writeFileSync(join(publicDir, FICHIER_DEVIS_PEREIRA_NERVIEUX), html, "utf8");
writeFileSync(join(racine, FICHIER_RAPPORT_PEREIRA_NERVIEUX), rapport, "utf8");
writeFileSync(join(publicDir, FICHIER_RAPPORT_PEREIRA_NERVIEUX), rapport, "utf8");

const edition = editionOfficiellePereiraNervieux();
const tunnel = calculerTunnelProptech(edition, {
  dpeActuel: edition.valorisation.dpeActuel,
});
const snapshot = snapshotProptech({
  dossierId: PEREIRA_NERVIEUX_DOSSIER_ID,
  edition,
  role: ROLE_ADMIN,
  sniper: null,
  tunnel,
});
snapshot.date = "2026-10-26T19:00:00.000Z";
snapshot.devisOfficiel = edition.devisOfficiel;
snapshot.mentionsJuridiques = edition.mentionsJuridiques;
snapshot.aides = calculerAidesIndicatives(edition);
snapshot.financement = calculerFinancement(edition);
snapshot.financesInternes = calculerFinancesInternes(edition, ROLE_ADMIN);
snapshot.fiscaliteAvis = FISCALITE_AVIS_PEREIRA;
snapshot.aidesVerrouillees = AIDES_PEREIRA_VIOLET;
snapshot.photos = edition.photos;
snapshot.logement = {
  type: "Maison individuelle R+1",
  surfaceHabitable: 164,
  hsp: 2.5,
  anneeConstruction: "1948-1974",
  zoneClimatique: "H1c",
  altitudeM: 315,
  adresse: edition.client.adresse,
};
snapshot.metresReconcilies = {
  comblesM2: 60,
  rampantsM2: 0,
  plancherM2: 19,
  menuiseriesM2: 19.38,
  veluxNb: 0,
  itiM2: 0,
};

const dossier = join(racine, "data", "sauvegardes");
mkdirSync(dossier, { recursive: true });
const payload = `${JSON.stringify(snapshot, null, 2)}\n`;
writeFileSync(join(dossier, FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX), payload, "utf8");
writeFileSync(join(dossier, FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX_CALCULE), payload, "utf8");
writeFileSync(join(dossier, FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX_LEGACY), payload, "utf8");

const synthese = {
  dossierId: snapshot.dossierId,
  numero: edition.devisOfficiel.numero,
  rfr: FISCALITE_AVIS_PEREIRA.rfr,
  parts: FISCALITE_AVIS_PEREIRA.parts,
  profil: FISCALITE_AVIS_PEREIRA.profil,
  ht: snapshot.tunnel?.totaux?.totalHt,
  ttc: snapshot.tunnel?.totaux?.totalTtc,
  mpr: snapshot.aides?.mpr,
  mar: snapshot.aides?.mar,
  totalAides: snapshot.aides?.totalAides,
  rac: snapshot.financement?.resteACharge,
  mensualite20: snapshot.financement?.mensualite20,
  ecoPtz: snapshot.financement?.ecoPtzMontant,
  acompte30: snapshot.financement?.acompte,
  miChantier40: snapshot.financement?.intermediaire,
  reception30: snapshot.financement?.solde,
  clyve: snapshot.financesInternes?.coutClyveHt,
  postes: edition.travaux.length,
  html: FICHIER_DEVIS_PEREIRA_NERVIEUX,
  rapport: FICHIER_RAPPORT_PEREIRA_NERVIEUX,
};

console.log(`Écrit ${join(racine, FICHIER_DEVIS_PEREIRA_NERVIEUX)}`);
console.log(`Écrit ${join(publicDir, FICHIER_DEVIS_PEREIRA_NERVIEUX)}`);
console.log(`Écrit ${join(racine, FICHIER_RAPPORT_PEREIRA_NERVIEUX)}`);
console.log(`Écrit ${join(dossier, FICHIER_SAUVEGARDE_PEREIRA_NERVIEUX)}`);
console.log(JSON.stringify(synthese, null, 2));
