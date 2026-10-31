/**
 * Export JSON / CSV / rapport Markdown des tarifs marché 2026.
 * Exécution : npx tsx scripts/export-catalogue-tarifs-marche-2026.ts
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { calculerPrestation } from "../src/lib/crm/catalogue/calculs";
import { PRESTATIONS_SEED } from "../src/lib/crm/catalogue/prestations-seed";
import {
  AVERTISSEMENT_TARIF_MARCHE,
  DATE_CONSULTATION_TARIFS_MARCHE,
  PRESTATIONS_MARCHE_2026,
  REFERENCES_MARCHE_PAR_ID,
} from "../src/lib/crm/catalogue/tarifs-marche-2026";
import { PRESTATIONS_MARCHE_COMPLEMENT } from "../src/lib/crm/catalogue/tarifs-marche-2026-complement";
import { journaliserMigrationCatalogue, snapshotTarifsFermes } from "../src/lib/crm/catalogue/migration";
import type { PrestationCatalogue, ReferenceMarche } from "../src/lib/crm/catalogue/types";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const AVANT = 121;

type LigneExport = {
  prestationId: string;
  nom: string;
  categorieId: string;
  sousCategorieId: string;
  priceStatus: "market_reference";
  priceMinHT: number;
  priceMedianHT: number;
  priceMaxHT: number;
  priceMinTTC: number;
  priceMedianTTC: number;
  priceMaxTTC: number;
  unit: string;
  unitExport: string;
  regionalAdjustment: number;
  vatRate: number;
  vatNote: string;
  complexity: string;
  supplyMode: string;
  includes: string[];
  excludes: string[];
  confidence: string;
  sourceName: string;
  sourceUrl: string;
  additionalSources: { name: string; url: string }[];
  sourceDate: string;
  lastReviewedAt: string;
  zone: string;
  requiresQuote: true;
  existingSalePriceUnchanged: boolean;
};

function unitExport(unit: string): string {
  if (unit === "m²") return "m2";
  if (unit === "u") return "unite";
  if (unit === "j") return "jour";
  return unit;
}

function csvEscape(value: string | number | boolean): string {
  const text = String(value);
  if (/[",\n;]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function ligneDepuis(prestation: PrestationCatalogue, reference: ReferenceMarche): LigneExport {
  return {
    prestationId: prestation.id,
    nom: prestation.nom,
    categorieId: prestation.categorieId,
    sousCategorieId: prestation.sousCategorieId,
    priceStatus: "market_reference",
    priceMinHT: reference.priceMinHT,
    priceMedianHT: reference.priceMedianHT,
    priceMaxHT: reference.priceMaxHT,
    priceMinTTC: reference.priceMinTTC,
    priceMedianTTC: reference.priceMedianTTC,
    priceMaxTTC: reference.priceMaxTTC,
    unit: reference.unit,
    unitExport: unitExport(reference.unit),
    regionalAdjustment: reference.regionalAdjustment,
    vatRate: reference.vatRate,
    vatNote: reference.vatNote,
    complexity: reference.complexity,
    supplyMode: reference.supplyMode,
    includes: reference.includes,
    excludes: reference.excludes,
    confidence: reference.confidence,
    sourceName: reference.sourceName,
    sourceUrl: reference.sourceUrl,
    additionalSources: reference.additionalSources,
    sourceDate: reference.sourceDate,
    lastReviewedAt: reference.lastReviewedAt,
    zone: reference.zone,
    requiresQuote: true,
    existingSalePriceUnchanged: prestation.prixVenteHt != null,
  };
}

const lignes: LigneExport[] = [];
for (const prestation of PRESTATIONS_SEED) {
  if (!prestation.referenceMarche) continue;
  lignes.push(ligneDepuis(prestation, prestation.referenceMarche));
}

const calculees = PRESTATIONS_SEED.map(calculerPrestation);
const avecTarifFerme = calculees.filter((item) => item.tarifRenseigne).length;
const sansTarifFerme = calculees.length - avecTarifFerme;
const avecMarche = lignes.length;
const nouvelles = PRESTATIONS_MARCHE_2026.length + PRESTATIONS_MARCHE_COMPLEMENT.length;
const rattacheesExistantes = Object.keys(REFERENCES_MARCHE_PAR_ID).length;

const sources = new Map<string, { url: string; date: string }>();
for (const ligne of lignes) {
  sources.set(ligne.sourceName, { url: ligne.sourceUrl, date: ligne.sourceDate });
  for (const extra of ligne.additionalSources) {
    sources.set(extra.name, { url: extra.url, date: ligne.sourceDate });
  }
}

const aConfirmer = lignes.filter((ligne) => ligne.requiresQuote).map((ligne) => ligne.prestationId);
const validationArtisan = lignes
  .filter((ligne) => ligne.confidence !== "high")
  .map((ligne) => `${ligne.nom} (${ligne.confidence})`);

const anomalies: string[] = [];
for (const ligne of lignes) {
  if (ligne.priceMinTTC > ligne.priceMedianTTC || ligne.priceMedianTTC > ligne.priceMaxTTC) {
    anomalies.push(`${ligne.prestationId} : min/médian/max TTC incohérents`);
  }
  if (!ligne.sourceUrl) anomalies.push(`${ligne.prestationId} : source URL manquante`);
  if (ligne.existingSalePriceUnchanged) {
    anomalies.push(`${ligne.prestationId} : une fiche déjà tarifée a reçu un overlay marché`);
  }
}

const dualSun = PRESTATIONS_SEED.find((item) => item.id === "pv-dualsun-flash-500");
if (!dualSun || dualSun.prixVenteHt !== 350) {
  anomalies.push("DualSun Flash 500 : tarif existant modifié");
}

const payload = {
  generatedAt: DATE_CONSULTATION_TARIFS_MARCHE,
  warning: AVERTISSEMENT_TARIF_MARCHE,
  counts: {
    prestationsAvant: AVANT,
    prestationsApres: PRESTATIONS_SEED.length,
    nouvellesPrestationsMarche: nouvelles,
    fichesExistantesCompletees: rattacheesExistantes,
            tarifsFermesRenseignes: avecTarifFerme,
            tarifsFermesAvant: 34,
            tarifsRestantAVerifier: sansTarifFerme,
    referencesMarche: avecMarche,
  },
  items: lignes,
};

const csvHeader = [
  "prestationId",
  "nom",
  "categorieId",
  "unit",
  "priceMinHT",
  "priceMedianHT",
  "priceMaxHT",
  "priceMinTTC",
  "priceMedianTTC",
  "priceMaxTTC",
  "vatRate",
  "complexity",
  "supplyMode",
  "confidence",
  "sourceName",
  "sourceUrl",
  "sourceDate",
  "requiresQuote",
  "zone",
];

const csvRows = [
  csvHeader.join(";"),
  ...lignes.map((ligne) =>
    [
      ligne.prestationId,
      ligne.nom,
      ligne.categorieId,
      ligne.unitExport,
      ligne.priceMinHT,
      ligne.priceMedianHT,
      ligne.priceMaxHT,
      ligne.priceMinTTC,
      ligne.priceMedianTTC,
      ligne.priceMaxTTC,
      ligne.vatRate,
      ligne.complexity,
      ligne.supplyMode,
      ligne.confidence,
      ligne.sourceName,
      ligne.sourceUrl,
      ligne.sourceDate,
      ligne.requiresQuote,
      ligne.zone,
    ]
      .map((value) => csvEscape(value as string | number | boolean))
      .join(";"),
  ),
];

const tableLignes = lignes
  .map(
    (ligne) =>
      `| ${ligne.nom} | ${ligne.priceMinTTC}–${ligne.priceMaxTTC} € TTC / ${ligne.unit} | ${ligne.priceMedianTTC} € TTC | ${ligne.supplyMode} | ${ligne.complexity} | ${ligne.confidence} | ${ligne.sourceName} |`,
  )
  .join("\n");

const sourcesMd = [...sources.entries()]
  .map(([name, meta]) => `- ${name} — ${meta.url} (consulté le ${meta.date})`)
  .join("\n");

const markdown = `# Catalogue — tarifs de marché France 2026

Date de consultation : **${DATE_CONSULTATION_TARIFS_MARCHE}**  
Zone : France métropolitaine, avec repère Bourgogne-Franche-Comté (proche de la médiane nationale).

${AVERTISSEMENT_TARIF_MARCHE}

Les montants ci-dessous sont des **repères indicatifs**. Ils ne constituent pas un devis ferme, ni un prix, une économie, une aide ou une marge garantis. Hors aides financières. Hors aléas et travaux supplémentaires. À confirmer par devis.

## Volumes

| Indicateur | Avant | Après |
|---|---:|---:|
| Prestations au catalogue | ${AVANT} | ${PRESTATIONS_SEED.length} |
| Nouvelles fiches « marché 2026 » | — | ${nouvelles} |
| Fiches existantes complétées (sans écrasement du prix de vente) | — | ${rattacheesExistantes} |
| Tarifs fermes renseignés (coût + vente) | 34 (29 PV fournisseurs + 5 démos) | ${avecTarifFerme} |
| Tarifs restant à vérifier / hors devis ferme | ${AVANT - 34} | ${sansTarifFerme} |
| Références de marché rattachées | 0 | ${avecMarche} |

Les **34 tarifs fermes** (DualSun, Enphase, Huawei, Pylontech, accessoires PV chiffrés, lignes de démonstration) n’ont pas été modifiés.

Non couverts par un tarif marché client (volontaire) : audit ENERGIA, coordination AMO, frais administratifs, aléas, coordination PV ENERGIA, frais Clyve.

## Nouvelles fourchettes (TTC, indicatif)

| Prestation | Fourchette observée | Prix médian indicatif | Fourniture / pose | Complexité | Confiance | Source principale |
|---|---|---|---|---|---|---|
${tableLignes}

## Sources utilisées

${sourcesMd}

## Prestations à faire confirmer par devis

Toutes les ${aConfirmer.length} références marché portent \`requiresQuote: true\`.

Liste : ${aConfirmer.join(", ")}.

## Tarifs nécessitant une validation locale par artisan

Fourchettes à confiance moyenne ou basse, à recaler sur devis Bourgogne-Franche-Comté :

${validationArtisan.map((item) => `- ${item}`).join("\n")}

## Anomalies ou incohérences détectées

${anomalies.length ? anomalies.map((item) => `- ${item}`).join("\n") : "- Aucune anomalie bloquante détectée à l’export (fourchettes min ≤ médian ≤ max, source présente, tarifs DualSun inchangés)."}

## Structure interne ENERGIA (non affichée partenaire)

Les champs suivants existent séparément du tarif marché et restent vides tant qu’un devis n’est pas reçu :

- coût marché indicatif (médian HT du repère) ;
- marge cible Energia ;
- commission partenaire ;
- frais de coordination ;
- prix de vente proposé ;
- prix final après devis.

L’espace partenaire Catarina n’affiche pas ces champs. Le catalogue métiers CRM reste réservé à l’administrateur ; les colonnes de marge sont masquées hors \`peutVoirCoutsInternes\`.

## Fichiers générés

- \`data/catalogue_tarifs_marche_2026.json\`
- \`exports/catalogue_tarifs_marche_2026.csv\`
`;

mkdirSync(join(root, "data"), { recursive: true });
mkdirSync(join(root, "data/sauvegardes"), { recursive: true });
mkdirSync(join(root, "exports"), { recursive: true });
mkdirSync(join(root, "docs"), { recursive: true });

const journal = journaliserMigrationCatalogue();
const snapshotFermes = snapshotTarifsFermes();
writeFileSync(
  join(root, "data/sauvegardes/catalogue_tarifs_fermes_2026-09-13.json"),
  JSON.stringify(
    {
      date: DATE_CONSULTATION_TARIFS_MARCHE,
      note: "Sauvegarde logique des 34 tarifs fermes. Ne pas écraser.",
      tarifs: snapshotFermes,
    },
    null,
    2,
  ),
  "utf8",
);

const rapportMigration = `# Rapport de migration catalogue — 13 septembre 2026

Les fourchettes de marché sont indicatives, hors aides et hors aléas. Elles doivent être confirmées par un devis professionnel.

## Journal

| Indicateur | Valeur |
|---|---:|
| Prestations avant | ${journal.avant} |
| Prestations après | ${journal.apres} |
| Fiches ajoutées | ${journal.ajoutees.length} |
| Fiches complétées (recalibrage local) | ${journal.completees.length} |
| Ignorées car déjà présentes (rejeu) | ${journal.ignoreesDejaPresentes.length} |
| Tarifs fermes conservés / protégés | ${journal.protegeesTarifFerme.length} |
| Fiches à recalibrer localement | ${journal.aRecalibrerLocalement.length} |

### Ajoutées
${journal.ajoutees.map((id) => `- \`${id}\``).join("\n")}

### Complétées (statut « à recalibrer » sur fiches déjà présentes)
${journal.completees.map((id) => `- \`${id}\``).join("\n") || "- Aucune"}

### Protégées (tarifs fermes)
${journal.protegeesTarifFerme.map((id) => `- \`${id}\``).join("\n")}

### À recalibrer localement
${journal.aRecalibrerLocalement.map((id) => `- \`${id}\``).join("\n")}

DualSun Flash reste à **200 / 50 / 350 € HT**. Les 5 lignes de démonstration, les kits photovoltaïques fournisseurs, Clyve, Catarina, Quantum et les règles d’attribution CRM n’ont pas été modifiés.
`;

writeFileSync(join(root, "docs/catalogue_migration_2026-09-13.md"), rapportMigration, "utf8");
writeFileSync(join(root, "data/catalogue_tarifs_marche_2026.json"), JSON.stringify(payload, null, 2), "utf8");
writeFileSync(join(root, "exports/catalogue_tarifs_marche_2026.csv"), `${csvRows.join("\n")}\n`, "utf8");
writeFileSync(join(root, "docs/catalogue_tarifs_marche_2026.md"), markdown, "utf8");

console.log(
  `Export OK — avant ${journal.avant} / après ${journal.apres} / +${journal.ajoutees.length} / protégés ${journal.protegeesTarifFerme.length}.`,
);
if (anomalies.length) {
  console.warn("Anomalies :");
  for (const item of anomalies) console.warn(` - ${item}`);
}
