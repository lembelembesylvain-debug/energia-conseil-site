/**
 * Contrôles dossier M. Mustapha FARISS — La Ricamarie.
 * 9 500 HT / 10 450 TTC · TVA 10 % · acompte 3 135 · solde 7 315.
 * Exécution : npx tsx src/lib/crm/verify-fariss.js
 */

import { existsSync } from "node:fs";
import {
  CLAUSES_FARISS,
  FARISS_DOSSIER_ID,
  FARISS_REFERENCE,
  FINANCEMENT_FARISS,
  PHOTOS_TERRAIN_FARISS,
  POSTES_FARISS_DEVIS,
  PROJET_FARISS_DEFAUT,
  RIB_QONTO,
  STATUT_FARISS,
  TOTAUX_FARISS,
  texteRibAcompteFariss,
} from "./farissLaRicamarieOfficiel.js";
import { fusionnerAvecDefautBrunel, projetManuelVersAudit } from "./projetsManuels.js";
import { cheminContratPublic, htmlContratPourDossier, nomFichierContrat } from "./htmlContratCrm.js";
import { payloadContratFarissOfficiel } from "./payloadContratCrm.js";
import { projetManuelVersLeadCourtier, projetManuelVersLigneCrm } from "./crmSupabaseSync.js";
import { calculerCommissionOfficielle } from "./commissionPareto.js";
import { MARCHES } from "../../components/crm/ModulesStrategiquesCrm.jsx";

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

const sommeHt = Math.round(POSTES_FARISS_DEVIS.reduce((s, p) => s + p.totalHt, 0) * 100) / 100;
const sommeTva = Math.round(POSTES_FARISS_DEVIS.reduce((s, p) => s + p.totalTva, 0) * 100) / 100;
const sommeTtc = Math.round(POSTES_FARISS_DEVIS.reduce((s, p) => s + p.totalTtc, 0) * 100) / 100;

assert(TOTAUX_FARISS.totalHt === 9500, "HT");
assert(TOTAUX_FARISS.totalTva === 950, "TVA");
assert(TOTAUX_FARISS.totalTtc === 10450, "TTC");
assert(sommeHt === 9500, "somme postes HT");
assert(sommeTva === 950, "somme postes TVA");
assert(sommeTtc === 10450, "somme postes TTC");
assert(POSTES_FARISS_DEVIS.length === 6, "6 postes");
assert(POSTES_FARISS_DEVIS[1].quantite * POSTES_FARISS_DEVIS[1].puHt === 3355, "poste 2");
assert(POSTES_FARISS_DEVIS[2].quantite * POSTES_FARISS_DEVIS[2].puHt === 1472.5, "poste 3");
assert(POSTES_FARISS_DEVIS[3].quantite * POSTES_FARISS_DEVIS[3].puHt === 1395, "poste 4");
assert(FINANCEMENT_FARISS.acompte === 3135, "acompte 30 %");
assert(FINANCEMENT_FARISS.solde === 7315, "solde 70 %");
assert(FINANCEMENT_FARISS.acompte + FINANCEMENT_FARISS.solde === 10450, "échéancier");
assert(TOTAUX_FARISS.commissionDamienHt === 950, "commission B2C 10 %");
assert(CLAUSES_FARISS.length === 3, "3 clauses");
assert(PHOTOS_TERRAIN_FARISS.length === 5, "5 photos");
for (const photo of PHOTOS_TERRAIN_FARISS) {
  assert(existsSync(new URL(`../../../public${photo.src}`, import.meta.url)), photo.src);
  assert(photo.titre.length > 10, `légende ${photo.id}`);
}
assert(texteRibAcompteFariss().includes(RIB_QONTO.iban), "texte RIB");
assert(texteRibAcompteFariss().includes("3 135,00"), "montant acompte RIB");

assert(PROJET_FARISS_DEFAUT.id === FARISS_DOSSIER_ID, "id");
assert(PROJET_FARISS_DEFAUT.statut === STATUT_FARISS, "statut");
assert(PROJET_FARISS_DEFAUT.telephone === "06 81 07 09 17", "téléphone");
assert(PROJET_FARISS_DEFAUT.adresse.includes("Danielle Casanova"), "adresse");
assert(PROJET_FARISS_DEFAUT.codePostal === "42150", "CP");
assert(PROJET_FARISS_DEFAUT.apporteurId === "damien", "apporteur Damien");

const fusion = fusionnerAvecDefautBrunel([]);
assert(fusion.some((item) => item.id === FARISS_DOSSIER_ID), "fusion seed Fariss");

const audit = projetManuelVersAudit(PROJET_FARISS_DEFAUT);
assert(audit.caHt === 9500, "audit HT");
assert(audit.caTtc === 10450, "audit TTC");
assert(audit.commissionDamienHt === 950, "audit commission");
assert(audit.margeNetteEnergiaHt == null, "marge non inventée");
assert(audit.coutArtisanHt == null, "débours non inventés");
assert(audit.auditId === FARISS_REFERENCE, "référence");
assert(audit.nom.includes("FARISS"), "nom");
assert(audit.echeancier.acompte === 3135, "échéancier audit");
assert(audit.echeancier.solde === 7315, "solde audit");

const commission = calculerCommissionOfficielle(audit);
assert(commission?.regle === "b2c" && commission.partApporteurHt === 950, "règle B2C 10 %");

const ligne = projetManuelVersLigneCrm(PROJET_FARISS_DEFAUT);
assert(ligne.client_nom.includes("FARISS"), "ligne CRM");
assert(ligne.montant_ttc === 10450, "ligne TTC");
assert(ligne.telephone === "06 81 07 09 17", "ligne téléphone");

const lead = projetManuelVersLeadCourtier(PROJET_FARISS_DEFAUT);
assert(lead && lead.telephone === "06 81 07 09 17", "lead téléphone");
assert(/FARISS/.test(lead.nom), "lead nom");

const payload = payloadContratFarissOfficiel();
assert(payload.totaux.totalTtc === 10450, "payload TTC");
assert(payload.echeancier.acompte === 3135, "payload acompte");
assert(payload.juliaBullets.some((l) => l.includes("990,00")), "julia 990");
assert(payload.contacts.length === 5, "5 contacts");

const html = htmlContratPourDossier({}, { id: FARISS_DOSSIER_ID });
assert(html.includes("10 450,00"), "HTML TTC");
assert(html.includes("9 500,00"), "HTML HT");
assert(html.includes("3 135,00"), "HTML acompte");
assert(html.includes("7 315,00"), "HTML solde");
assert(html.includes("MaPrimeAdapt"), "HTML MaPrimeAdapt");
assert(html.includes("Kinedo"), "HTML Kinedo");
assert(html.includes("Aqua Habita"), "HTML Aqua Habita");
assert(html.includes(RIB_QONTO.iban), "HTML IBAN");
assert(html.includes(RIB_QONTO.bic), "HTML BIC");
assert(html.includes("990,00"), "HTML forfait 990");
assert(html.includes("DEV-2026-FARISS-01"), "HTML référence");
assert(html.includes("Danielle Casanova"), "HTML adresse");
assert(html.includes("Galerie Photos"), "HTML galerie");
assert(html.includes("01-fiche-releve-aqua-habita.jpg"), "HTML photo relevé");
assert(html.includes("05-dallage-zone-douche-kinedo.jpg"), "HTML photo sol");
assert(html.includes("Clause Julia"), "HTML Julia");
assert(html.includes("Sylvain LEMBELEMBE"), "HTML Sylvain");
assert(html.includes("Damien RICHARD"), "HTML Damien");
assert(html.includes("FABIEN"), "HTML Fabien");
assert(html.includes("Antoine BARATIER"), "HTML MAR");
assert(!/commissionDamien|marge nette|715,00/i.test(html), "pas de marge interne");
assert(nomFichierContrat({ id: FARISS_DOSSIER_ID }) === "DEVIS_FARISS_LARICAMARIE_2026.html", "nom fichier");
assert(cheminContratPublic(FARISS_DOSSIER_ID) === "/DEVIS_FARISS_LARICAMARIE_2026.html", "chemin public");

const marche = MARCHES.find((item) => item.id === FARISS_DOSSIER_ID);
assert(marche && marche.montantTtc === 10450, "marché CRM");
assert(marche.ref === "DEV-2026-FARISS-01", "réf marché");
assert(marche.htmlPublic === "/DEVIS_FARISS_LARICAMARIE_2026.html", "html marché");

console.log("OK — dossier Fariss 9 500 HT / 10 450 TTC, 6 postes, MaPrimeAdapt', RIB, convention 990 €");
