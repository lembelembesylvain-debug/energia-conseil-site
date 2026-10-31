/**
 * Vérifie la fiche BET NOMOS, les types d'audit et la convention cadre.
 * Usage : npx tsx scripts/verify-bet-nomos.js
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { htmlConventionNomos } from "../src/lib/crm/conventionNomos.js";
import {
  BET_NOMOS_CONVENTION_REF,
  CHEMIN_CONVENTION_NOMOS,
  NOM_FICHIER_CONVENTION_NOMOS,
  PARTENAIRE_BET_NOMOS,
  TYPES_AUDIT_MARCHE,
} from "../src/lib/crm/betNomosOfficiel.js";
import { estDossierRattacheAuPartenaire, listerPartenairesCrm } from "../src/lib/crm/partenaires.js";
import { infererSourceApporteur } from "../src/lib/crm/operationnelCrm.js";
import { TYPES_PROJET_MANUEL } from "../src/lib/crm/projetsManuels.js";
import { construireMarcheLeadCourtier } from "../src/components/crm/ModalDevisMarcheLead.jsx";

const erreurs = [];
const ok = (cond, message) => {
  if (!cond) erreurs.push(message);
};

const fiche = listerPartenairesCrm().find((item) => item.id === "bet-nomos");
ok(fiche, "fiche CRM bet-nomos");
ok(fiche?.email === "contact@nomos.bet.fr", "email");
ok(fiche?.telephone === "06 58 25 34 44", "téléphone");
ok(fiche?.certification === "RGE AFNOR", "certification");
ok(fiche?.referent === "Romain", "référent");
ok(fiche?.conventionRef === BET_NOMOS_CONVENTION_REF, "référence convention");
ok(fiche?.poles?.length === 3, "trois pôles");
ok(
  estDossierRattacheAuPartenaire(
    { bureauEtudesId: "bet-nomos", apporteurId: "damien" },
    PARTENAIRE_BET_NOMOS,
  ),
  "dossier rattaché par bureau d'études",
);
ok(infererSourceApporteur({ apporteurNom: "Romain BET Nomos" }) === "romain_bet_nomos", "apport historique");
ok(infererSourceApporteur({ apporteurNom: "BET NOMOS — Romain" }) === "romain_bet_nomos", "nouveau libellé");

for (const type of TYPES_AUDIT_MARCHE) {
  ok(TYPES_PROJET_MANUEL.includes(type), `type manquant : ${type}`);
}
ok(TYPES_PROJET_MANUEL.includes("Rénovation Globale Anah"), "types historiques conservés");
ok(TYPES_PROJET_MANUEL[0] === "Rénovation Globale Anah", "type par défaut inchangé");

const html = htmlConventionNomos();
ok(html.includes('src="/logo.png"'), "logo ENERGIA");
ok(html.includes("Document officiel"), "badge officiel");
ok(html.includes("CONVENTION CADRE DE PARTENARIAT"), "titre");
ok(html.includes('class="page page-1"') && html.includes('class="page page-2"'), "deux pages");
ok((html.match(/class="page page-/g) || []).length === 2, "strictement deux pages");
ok(html.includes("tacite reconduction"), "durée");
ok(html.includes("page-break-after: always"), "saut de page");
ok(html.includes("/assets/bet-nomos/logo-n.png"), "monogramme NOMOS");
ok(html.includes(BET_NOMOS_CONVENTION_REF), "réf. dans le HTML");
ok(html.includes("NF EN 16247"), "norme");
ok(html.includes("Romain"), "signataire BET");
ok(html.includes("Sylvain LEMBELEMBE"), "signataire ENERGIA");
ok(!html.includes("10 %"), "aucun pourcentage inventé");
ok(html.includes("bon de commande"), "honoraires au bon de commande");
ok(html.includes("entière liberté de choix"), "réserve maison individuelle");
ok(html.includes("Contractant Général unique"), "exécution exclusive hors Anah");
ok(html.includes("DTU 65.16"), "annexe CVC");
ok(html.includes("Décret BACS"), "annexe GTB");
ok(html.includes("murs-rideaux"), "annexe enveloppe");
ok(!html.includes("Cette priorité est un droit de présentation"), "ancien article 4 retiré");

const marche = construireMarcheLeadCourtier({
  nom: "SCI Atelier",
  typeProjet: "Tertiaire (Décret Tertiaire / Décret BACS / GTB)",
  bureauEtudesId: "bet-nomos",
  budget: 80000,
});
ok(marche.aidesEstimees === 0, "tertiaire hors forfait 20 %");
ok(marche.bureauEtudesNom === "BET NOMOS — Romain", "bureau affiché sur le marché");
ok(marche.totalTtc === 80000, "montant tertiaire conservé");

const gilbertas = construireMarcheLeadCourtier({ nom: "Gilbertas", ville: "Clermont-Ferrand", budget: 1 });
ok(gilbertas.totalTtc === 37600, "Gilbertas inchangé");

writeFileSync(resolve("public", NOM_FICHIER_CONVENTION_NOMOS), html, "utf8");
ok(CHEMIN_CONVENTION_NOMOS.endsWith(NOM_FICHIER_CONVENTION_NOMOS), "chemin public");

if (erreurs.length) {
  console.error(erreurs.join("\n"));
  process.exit(1);
}
console.log(`OK BET NOMOS — ${BET_NOMOS_CONVENTION_REF} — ${NOM_FICHIER_CONVENTION_NOMOS}`);
