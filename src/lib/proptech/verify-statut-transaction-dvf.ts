/**
 * Statuts vente / acquéreur : date de référence figée au 25 octobre 2026.
 * Lancement : npx tsx src/lib/proptech/verify-statut-transaction-dvf.ts
 */
import assert from "node:assert/strict";
import { composerFicheOpportunite, mettreEnPageFiche } from "./ficheOpportuniteSniper.ts";
import { classerStatutTransaction, encadreMutationPdf, retenirNouvelAcquereur } from "./statutTransactionDvf.ts";

const maintenant = new Date("2026-10-25T12:00:00");

const acquereur = classerStatutTransaction(
  {
    etiquette: "F",
    chauffage: "électrique",
    conso: 365,
    surface: 88,
    motifDpe: "vente",
    dateDpe: "2025-11-02",
    mutationsDvf: [{ date: "2026-03-12", prixNet: 185000, prixM2: 2102, surParcelle: true }],
  },
  maintenant,
);
assert.equal(acquereur.id, "vendu_recent");
assert.match(acquereur.detail, /12\/03\/2026/);
assert.match(acquereur.detail, /185 000/);
assert.match(acquereur.approche || "", /Offre d'accueil Ensemblier/);
assert.equal(retenirNouvelAcquereur({
  etiquette: "F",
  chauffage: "électrique",
  conso: 365,
  surface: 88,
  dateDpe: "2025-11-02",
  mutationsDvf: [{ date: "2026-03-12", prixNet: 185000, prixM2: 2102, surParcelle: true }],
}, maintenant), true);

const rueSeule = classerStatutTransaction(
  {
    motifDpe: "vente",
    dateDpe: "2026-07-15",
    etiquette: "G",
    mutationsDvf: [{ date: "2026-03-12", prixNet: 100000, prixM2: 1000, surParcelle: false }],
  },
  maintenant,
);
assert.equal(rueSeule.id, "vente_active", "une vente de rue ne crée pas un nouvel acquéreur");

const vente = classerStatutTransaction(
  { motifDpe: "vente", etiquette: "G", dateDpe: "2026-07-15", mutationsDvf: [] },
  maintenant,
);
assert.equal(vente.id, "vente_active");
assert.match(vente.detail, /obligation d'audit/);

const bailleur = classerStatutTransaction(
  { motifDpe: "location", statutOccupation: "bailleur", etiquette: "G", mutationsDvf: [] },
  maintenant,
);
assert.equal(bailleur.id, "bailleur_interdit");

const historique = classerStatutTransaction(
  {
    etiquette: "E",
    statutOccupation: "occupant",
    mutationsDvf: [{ date: "2014-05-12", prixNet: 90000, prixM2: 900, surParcelle: true }],
  },
  maintenant,
);
assert.equal(historique.id, "occupant_historique");

const encadre = encadreMutationPdf(acquereur, "185 000 EUR");
assert.match(encadre || "", /Historique de mutation : Bien acquis le 12\/03\/2026 pour 185 000 EUR/);
assert.match(encadre || "", /Acquéreur récent en phase de programmation travaux/);

const fiche = composerFicheOpportunite(
  {
    id: "hors-catalogue-acquereur",
    adresse: "12 Rue du Test",
    commune: "Chalon-sur-Saône",
    codePostal: "71100",
    surface: 88,
    etiquette: "F",
    chauffage: "électrique",
    conso: 365,
    motifDpe: "vente",
    dateDpe: "2025-11-02",
    mutationsDvf: [{ date: "2026-03-12", prixNet: 185000, prixM2: 2102, surParcelle: true }],
  },
  null,
);
assert.equal(fiche.statutTransaction.id, "vendu_recent");
const page = mettreEnPageFiche(fiche);
assert.equal(page.pdf.getNumberOfPages(), 1);
assert.ok(page.bas < 274, `bas ${page.bas}`);
const brut = page.pdf.output();
assert.match(brut, /Acquereur recent en phase de programmation travaux|Acquéreur récent en phase de programmation travaux/);

console.log("Statut transaction DVF : A/B/C/D OK.");
