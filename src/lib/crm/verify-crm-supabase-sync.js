/**
 * Smoke test sync Supabase CRM (sans réseau si non configuré).
 * npx tsx src/lib/crm/verify-crm-supabase-sync.js
 */

import {
  IDS_PROJETS_SYNC_PRIORITAIRES,
  lireConfigSupabase,
  projetManuelVersLeadCourtier,
  projetManuelVersLigneCrm,
} from "./crmSupabaseSync.js";
import { PROJET_DAMIEN_PV_100KWC_DEFAUT } from "./damienPv100kwcOfficiel.js";
import { PROJET_CLOISON_SDB_DEFAUT } from "./cloisonSdbOfficiel.js";
import { PROJET_MASSARDIER_DEFAUT } from "./massardierLeadOfficiel.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const cfg = lireConfigSupabase();
console.log(
  cfg.configure
    ? `Config Supabase : OK (url len=${cfg.url.length})`
    : "Config Supabase : absente — bandeau restera « en attente » jusqu’à .env",
);

assert(IDS_PROJETS_SYNC_PRIORITAIRES.includes(PROJET_DAMIEN_PV_100KWC_DEFAUT.id), "Damien PV prioritaire");
assert(IDS_PROJETS_SYNC_PRIORITAIRES.includes(PROJET_CLOISON_SDB_DEFAUT.id), "Cloison SDB prioritaire");

const lignePv = projetManuelVersLigneCrm(PROJET_DAMIEN_PV_100KWC_DEFAUT);
assert(lignePv.id === "damien-pv-100kwc-07", "id PV");
assert(lignePv.montant_ttc === 106800, "TTC PV");
assert(lignePv.commission_ht === 3500, "commission PV");
assert(Array.isArray(lignePv.payload.postesContractuels) && lignePv.payload.postesContractuels.length === 5, "5 postes PV");

const ligneSdb = projetManuelVersLigneCrm(PROJET_CLOISON_SDB_DEFAUT);
assert(ligneSdb.montant_ttc === 2717, "TTC Cloison");

const lead = projetManuelVersLeadCourtier(PROJET_MASSARDIER_DEFAUT);
assert(lead.prenom && lead.nom, "identité lead");
assert(lead.telephone && !/^0+$/.test(String(lead.telephone).replace(/\D/g, "")), "téléphone réel requis");
assert(lead.type_travaux || lead.notes, "type/notes lead");

const leadPvSansTel = projetManuelVersLeadCourtier(PROJET_DAMIEN_PV_100KWC_DEFAUT);
assert(leadPvSansTel === null, "Damien PV sans téléphone réel → pas d’insert mock leads_courtier");

console.log("OK — mapping sync CRM prêt (Damien PV, Cloison SDB, Massardier).");
