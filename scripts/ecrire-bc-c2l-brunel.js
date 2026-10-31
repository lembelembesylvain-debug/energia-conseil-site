import { writeFileSync } from "fs";
import { grouperLignesParArtisan, chargerReferentiel } from "../src/lib/crm/artisansRge.js";
import { htmlBonCommandePourGroupe } from "../src/lib/crm/bonCommandeSousTraitanceHtml.js";
import { lignesMarcheBrunel } from "../src/lib/crm/brunelMarcheOfficiel2026.js";
import { BRUNEL_DOSSIER_ID } from "../src/lib/crm/brunelWorkingBase.js";

const referentiel = chargerReferentiel();
const groupes = grouperLignesParArtisan(lignesMarcheBrunel("option-baie"), referentiel);
const c2l = groupes.find((g) => g.artisan.id === "c2l-isolation");
if (!c2l) throw new Error("Groupe C2L introuvable");

const html = htmlBonCommandePourGroupe({
  artisan: c2l.artisan,
  lignes: c2l.lignes,
  dossier: { id: BRUNEL_DOSSIER_ID, client: "M. Emrick Brunel" },
});

if (!html.includes("1 050,00") || !html.includes("35 m²") || html.includes("100 m²") || html.includes("2 200,00")) {
  throw new Error("Bon de commande C2L incomplet");
}

const cibles = ["public/c2l-isolation-chantier.html", "public/BC-ST-2026-C2L-ISOLATION.html"];
for (const cible of cibles) writeFileSync(cible, html);
console.log(`BC C2L écrit : ${cibles.join(", ")}`);
