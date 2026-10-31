import { construireHtmlAuditRapportDevis } from "./auditRapportDevisLicence.js";

const html = construireHtmlAuditRapportDevis({
  dossier: {
    id: "demo-pereira",
    nom: "Monsieur Pereira",
    ville: "Nervieux (42)",
    date: "2026-09-03",
    travaux: [
      { label: "Isolation Toiture (60 m² Combles Perdus)" },
      { label: "Remplacement chaudière fioul par PAC air/eau HT" },
    ],
    totaux: { ht: 44320, ttc: 46758 },
  },
  edition: null,
  galerie: [],
});

const attendus = [
  "Étude thermique prévisionnelle",
  "5213845",
  "FR01941819427",
  "7112B",
  "articles 1787",
  "Façade / murs",
  "Projection après rénovation",
  "À confirmer",
  "images/pereira/01-facade",
];
let ko = 0;
for (const texte of attendus) {
  const ok = html.includes(texte);
  if (!ok) ko += 1;
  console.log(ok ? "OK" : "MANQUE", texte);
}
if (!html.includes("data:image/png;base64,")) {
  ko += 1;
  console.log("MANQUE logo embarqué");
} else {
  console.log("OK logo embarqué");
}
if (html.includes("Powerwall")) {
  ko += 1;
  console.log("MANQUE absence Powerwall");
} else {
  console.log("OK absence Powerwall");
}
const pages = html.split('class="page"').length - 1;
console.log("pages", pages);
if (pages < 5 || pages > 7) ko += 1;
if (ko) process.exit(1);
console.log("OK — rapport licence de marque");
