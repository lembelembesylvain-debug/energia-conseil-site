/**
 * Contrôles du module commissions CRM.
 * Exécution : npx tsx src/lib/crm/verify-finances.ts
 */

import { totauxDevisClient } from "../generateDevisPdf";
import { PRESTATIONS_SEED } from "./catalogue/prestations-seed";
import { AUDITS_TEST_LOCAUX, DOSSIER_PEREIRA } from "./mockData";
import {
  calculerFinancesProjet,
  COMMISSION_RATE_DEFAULT,
  COMMERCIAL_DAMIEN,
  estVueFinancesComplete,
  financesPourRole,
  libelleCommissionAgent,
  totauxFinancesAdmin,
} from "./finances";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

assert(COMMISSION_RATE_DEFAULT === 10, "Taux par défaut 10 %");

const base = calculerFinancesProjet({
  commercial_id: "agent-interne",
  venteHt: 40000,
  coutArtisanHt: 28000,
  partner_commission: 1500,
});

assert(base.commission_amount === 4000, `Commission 10 % ${base.commission_amount} ≠ 4000`);
assert(base.net_margin === 6500, `Marge nette ${base.net_margin} ≠ 6500 (40000-28000-4000-1500)`);
assert(base.impactePrixClient === false, "La commission ne doit pas impacter le prix client");
assert(base.venteHt === 40000, "Le HT de vente client ne doit pas être majoré");

const admin = financesPourRole(base, "administrateur");
assert(estVueFinancesComplete(admin), "Admin voit la vue complète");
assert(admin && "net_margin" in admin && admin.net_margin === 6500, "Admin voit la marge nette");
assert(admin && "coutArtisanHt" in admin && admin.coutArtisanHt === 28000, "Admin voit le coût artisan");

const commercial = financesPourRole(base, "commercial", { commercialId: "agent-interne" });
assert(financesPourRole(base, "commercial", { commercialId: COMMERCIAL_DAMIEN.id }) == null, "Session Damien refusée");
assert(financesPourRole(base, "commercial") == null, "Commercial sans identité : aucune commission");
assert(commercial && commercial.commission_amount === 4000, "Commercial voit sa commission 10 %");
assert(commercial && !("net_margin" in commercial), "Commercial ne voit pas la marge nette");
assert(commercial && !("coutArtisanHt" in commercial), "Commercial ne voit pas le coût artisan");
assert(commercial && !("partner_commission" in commercial), "Commercial ne voit pas la commission partenaire");

const autreCommercial = financesPourRole(base, "commercial", { commercialId: "commercial-autre" });
assert(autreCommercial == null, "Un autre commercial ne voit pas la commission");

assert(financesPourRole(base, "partenaire_apporteur") == null, "Partenaire : aucune donnée financière");
assert(financesPourRole(base, "presentation_client") == null, "Client : aucune donnée financière");

assert(libelleCommissionAgent() === "Commission Agent (10% HT)", "Libellé commission agent");

const pereiraAudit = AUDITS_TEST_LOCAUX.find((item) => item.id === "demo-pereira");
assert(pereiraAudit?.caHt === 44320.76, "HT client Pereira inchangé");
assert(pereiraAudit?.caTtc === 46758.4, "TTC client Pereira inchangé");
assert(DOSSIER_PEREIRA.totaux.ht === 44320.76, "totaux.ht Pereira non majoré par la commission");
assert(pereiraAudit?.finances?.commission_amount === 4432.08, "10 % de 44 320,76 € HT = 4 432,08 €");
assert(pereiraAudit?.finances?.net_margin == null, "Marge nette Pereira absente sans coût artisan");
assert(pereiraAudit?.finances?.impactePrixClient === false, "Commission hors devis client");

const totauxPdf = totauxDevisClient({
  numero: "TEST-COMMISSION",
  date: "2026-09-13",
  validite: "3 mois",
  clientNom: "Test",
  clientAdresse: "Lyon",
  libelleProjet: "Test",
  lignes: [
    {
      designation: "Isolation combles",
      quantite: 1,
      unite: "forfait",
      prixUnitaireHt: 10000,
      montantHt: 10000,
      tauxTva: 0.055,
    },
  ],
  totalHt: 10000,
  totalTva: 550,
  totalTtc: 10550,
});
assert(totauxPdf.totalHt === 10000, "Le devis client HT n’inclut pas la commission");
assert(totauxPdf.totalTtc === 10550, "Le devis client TTC n’inclut pas la commission");

const totaux = totauxFinancesAdmin([{ finances: base }]);
assert(totaux.totalCommissions === 4000, "Total commissions admin");
assert(totaux.totalMargeNette === 6500, "Total marge nette admin");

const dualSun = PRESTATIONS_SEED.find((item) => item.id === "pv-dualsun-flash-500");
assert(dualSun?.coutMaterielHt === 200, "DualSun Flash matériel inchangé");
assert(dualSun?.coutMainOeuvreHt === 50, "DualSun Flash MO inchangée");
assert(dualSun?.prixVenteHt === 350, "DualSun Flash vente inchangée");

const sansCout = calculerFinancesProjet({ venteHt: 10000, commercial_id: "agent-interne" });
assert(sansCout.commission_amount === 1000, "Commission calculable sans coût artisan");
assert(sansCout.net_margin == null, "Marge nette absente tant que le coût artisan n’est pas renseigné");

console.log("OK — commissions 10 % HT, visibilité rôles, DualSun inchangé, prix client non impacté.");
