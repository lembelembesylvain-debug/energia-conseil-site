/**
 * Contrôles du scénario terrain Brunel (Feurs) — métrés, DPE C, catalogue 2026, sauvegarde.
 * Exécution : node src/lib/crm/verify-brunel-scenario-terrain.js
 */

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import {
  METRES_TERRAIN_BRUNEL,
  estimerGainEnergetiqueBrunel,
  scenarioFinancierBrunel,
  signaturesInterditesDans,
  snapshotBrunelTerrain,
  surfaceVitreieTotale,
} from "./brunelScenarioTerrain.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const racine = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const fichierSauvegarde = join(
  racine,
  "data/sauvegardes/proptech-projet-manuel-brunel-emrick-2026-09-16.json",
);

const m = METRES_TERRAIN_BRUNEL;
assert(m.comblesM2 === 60, "combles 60 m²");
assert(m.plancherM2 === 19, "plancher 19 m²");
assert(m.menuiseriesM2 === 19.38, "vitrage 19,38 m²");
assert(m.fenetresNb === 7 && m.fenetresM2 === 14.2, "7 fenêtres / 14,20 m²");
assert(m.fixesOpaquesNb === 3 && m.fixesOpaquesM2 === 5.17, "3 opaques / 5,17 m²");
assert(m.chassisTotal === 10, "10 châssis");
assert(Math.abs(surfaceVitreieTotale() - 19.37) < 0.02, "14,20 + 5,17 ≈ 19,38");
assert(m.sansVoletsSolaires && m.sansVelux, "sans volets solaires ni Velux");

const gain = estimerGainEnergetiqueBrunel();
assert(gain.dpeActuel === "F", "DPE actuel F");
assert(gain.dpeCible === "C", `DPE cible C, obtenu ${gain.dpeCible} (CEP ${gain.cepApres})`);
assert(gain.gainClasses === 3, `saut +3 classes, obtenu ${gain.gainClasses}`);
assert(gain.gainPct >= 50, `gain énergétique ≥ 50 %, obtenu ${gain.gainPct} %`);
assert(gain.eligibiliteParcours === true, "Parcours Accompagné éligible (≥ 2 classes)");
assert(gain.plafondMprHt === 40000, "plafond MPR 40 000 € HT (3 classes)");
assert(gain.dpeBGaranti === false, "B non garanti sans isolation des murs");

const { edition, totaux, tunnel, ecoPtz } = scenarioFinancierBrunel();
assert(edition.client.nom === "Brunel", "client Brunel");
assert(edition.client.adresse.includes("42110"), "CP Feurs");
assert(edition.client.adresse.toUpperCase().includes("FEURS"), "ville Feurs");
assert(edition.aides.profil === "jaune", "profil Jaune indicatif");
assert(edition.aides.parcours === "parcours", "Parcours Accompagné");
assert(edition.aides.region === "AURA", "région Loire / AURA");
assert(edition.valorisation.dpeCible === "C", "fiche DPE C");

const combles = totaux.lignes.find((l) => l.id === "brunel-combles");
const plancher = totaux.lignes.find((l) => l.id === "brunel-plancher");
const fenetres = totaux.lignes.find((l) => l.id === "brunel-fenetres");
assert(combles?.quantite === 60 && combles.prestationId === "marche-combles-deroule", "lot combles catalogue déroulé");
assert(plancher?.quantite === 19 && plancher.prestationId === "marche-plancher-bas", "lot plancher catalogue");
assert(fenetres?.quantite === 19.38, "menuiseries 19,38 m²");
assert(fenetres?.unite === "m²", "menuiseries au m²");
assert(fenetres?.puHt === 550, `Alu Gris 550 € HT/m², obtenu ${fenetres?.puHt}`);
assert(fenetres?.prestationId === "marche-fenetre-alu-gris-m2", "catalogue Alu Gris Uw ≤ 1.3");
assert(fenetres?.totalHt === 10659, `19,38 × 550 = 10 659 HT, obtenu ${fenetres?.totalHt}`);
assert(!totaux.lignes.some((l) => l.id === "brunel-opaques"), "opaques inclus dans les 19,38 m²");
assert(totaux.lignes[0].id === "brunel-combles", "ordre : combles en premier");
assert(totaux.lignes.some((l) => l.id === "brunel-pac"), "PAC conservée");
assert(totaux.lignes.some((l) => l.id === "brunel-vmc"), "VMC conservée");
assert(
  !totaux.lignes.some((l) => /volet|velux/i.test(l.prestationId || "") || /^(volet|velux)/i.test(l.nom)),
  "aucun lot volets solaires ni Velux",
);

assert(edition.aides.gainClasses === 2, "aides Brunel : gain 2 classes (Jaune 60 %)");
assert(tunnel.aides.mpr > 0, "MPR calculée");
assert(tunnel.aides.cee === 0, "Parcours : CEE à 0 (intégrées MPR)");
assert(tunnel.aides.coupDePouce === 0, "Parcours : Coup de pouce à 0");
assert(tunnel.aides.locales === 0, "Parcours : pas de locales auto");
assert(tunnel.aides.totalAides === tunnel.aides.mpr, "aides d’État = MPR seul");
assert(tunnel.aides.totalAides <= tunnel.aides.plafondEcretement, "sous écrêtement profil");
assert(tunnel.resteACharge === Math.round((totaux.totalTtc - tunnel.aides.totalAides + Number.EPSILON) * 100) / 100, "RAC = TTC − aides");
assert(ecoPtz.montant === Math.min(50000, tunnel.resteACharge), "Éco-PTZ = min(50 000, RAC)");
assert(ecoPtz.duree === 20, "Parcours Accompagné : Éco-PTZ 20 ans");
assert(ecoPtz.mensualite === Math.round((ecoPtz.montant / (ecoPtz.duree * 12) + Number.EPSILON) * 100) / 100, "mensualité 0 %");
assert(ecoPtz.canal === "eco_ptz_etat", "Éco-PTZ = canal 1 banques d’État");
assert(!/FABIEN|VIVONS/i.test(tunnel.canauxFinancement.ecoPtz.rappel), "canal 1 sans courtier");
assert(/FABIEN/.test(tunnel.canauxFinancement.pretTravaux.titre), "canal 2 Fabien");
assert(/indicatif/i.test(tunnel.aides.mention), "disclaimer aides");
assert(/intégrée dans le taux/i.test(tunnel.aides.mentionCee || ""), "mention CEE intégrée");

assert(signaturesInterditesDans(edition).length === 0, "aucune signature Bussières dans l’édition");
assert(signaturesInterditesDans(tunnel).length === 0, "aucune signature Bussières dans le tunnel");

const snapshot = snapshotBrunelTerrain({ date: "2026-09-16T09:00:00.000Z" });
assert(snapshot.dossierId === BRUNEL_DOSSIER_ID, "dossier Brunel");
assert(snapshot.sniper == null, "pas de sniper Chagny / parcelle étrangère");
assert(!JSON.stringify(snapshot).toLowerCase().includes("chagny"), "Chagny absent");
assert(signaturesInterditesDans(snapshot).length === 0, "snapshot hors signatures interdites");

assert(existsSync(fichierSauvegarde), `sauvegarde absente : ${fichierSauvegarde}`);
const disque = JSON.parse(readFileSync(fichierSauvegarde, "utf8"));
assert(disque.dossierId === BRUNEL_DOSSIER_ID, "fichier : id Brunel");
assert(disque.sniper == null, "fichier : sniper vide");
assert(!JSON.stringify(disque).toLowerCase().includes("chagny"), "fichier : pas Chagny");

console.log(
  `OK — Brunel terrain : ${m.comblesM2} m² combles + ${m.plancherM2} m² PL BAS + ${m.menuiseriesM2} m² alu gris | DPE ${gain.dpeActuel}→${gain.dpeCible} (${gain.gainPct} %) | TTC ${totaux.totalTtc} € | aides ${tunnel.aides.totalAides} € | RAC ${tunnel.resteACharge} € | Éco-PTZ ${ecoPtz.mensualite} €/mois sur ${ecoPtz.duree} ans.`,
);
