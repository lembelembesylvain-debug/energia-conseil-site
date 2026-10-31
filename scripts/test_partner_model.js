/**
 * Tests du modèle partenaire duplicable — partenaire fictif uniquement.
 * Vérifie l’isolation CRM et l’absence de données Catarina.
 */

import {
  A_COMPLETER,
  assertNotCatarinaClone,
  champOuPlaceholder,
  createEmptyPartner,
  getPartnerAttribution,
  getPartnerById,
  isKnownPartnerId,
  isPartnerPageEnabled,
  listKnownPartnerIds,
  PARTNER_DEMO,
  PARTNERS,
  resolveQrTarget,
} from "../src/config/partners.js";
import { filtrerLeadsPartenaire } from "../src/lib/crm/leadsDiagnostic.js";
import {
  partenairesVisiblesPourRole,
  partnerConfigToCrm,
} from "../src/lib/crm/partenaires.js";
import { ROLE_ADMIN, ROLE_PARTENAIRE } from "../src/lib/crm/roles.js";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const clones = assertNotCatarinaClone(PARTNER_DEMO);
assert(clones.length === 0, `Le partenaire démo recopie Catarina : ${clones.join(", ")}`);

assert(PARTNER_DEMO.id === "demo-alexandre-morel", "id démo inattendu");
assert(PARTNER_DEMO.photo === "", "La démo ne doit pas avoir de photo");
assert(PARTNER_DEMO.logoPartner === "", "La démo ne doit pas réutiliser un logo iad/Catarina");
assert(PARTNER_DEMO.phone === A_COMPLETER, "Téléphone démo doit rester [À COMPLÉTER]");
assert(PARTNER_DEMO.website === "", "Site démo doit être vide");
assert(champOuPlaceholder(PARTNER_DEMO.website) === A_COMPLETER, "Site vide → placeholder");
assert(isPartnerPageEnabled(PARTNER_DEMO), "La page démo doit être accessible");
assert(getPartnerById("demo-alexandre-morel")?.id === PARTNER_DEMO.id, "getPartnerById démo");
assert(!getPartnerById("catarina-martins"), "Catarina ne doit pas être dans la config duplicable");
assert(isKnownPartnerId("catarina-martins"), "L’id historique reste reconnu pour l’API");
assert(isKnownPartnerId("demo-alexandre-morel"), "L’id démo doit être connu");
assert(!isKnownPartnerId("inconnu-xyz"), "Un id inconnu doit être rejeté");

const qr = resolveQrTarget(PARTNER_DEMO);
assert(qr.includes("/partenaire/demo-alexandre-morel"), "QR démo unique");
assert(!qr.toLowerCase().includes("immobilier-chagny"), "QR démo ne doit pas réutiliser Catarina");
assert(!qr.includes("catarina"), "QR démo sans catarina");

const attribution = getPartnerAttribution(PARTNER_DEMO.id);
assert(attribution.partenaire_id === "demo-alexandre-morel", "Attribution CRM démo");
assert(attribution.sourceLabel.includes("Alexandre Morel"), "Source lead démo");

const empty = createEmptyPartner("nouveau-partenaire");
assert(empty.photo === "", "Nouveau partenaire sans photo par défaut");
assert(empty.qrTarget.includes("/partenaire/nouveau-partenaire"), "QR pré-rempli unique");
assert(assertNotCatarinaClone(empty).length === 0, "Squelette vide sans Catarina");

const leads = [
  { id: "1", partenaire_id: "catarina-martins", nom: "Lead Catarina" },
  { id: "2", partenaire_id: "demo-alexandre-morel", nom: "Lead Démo" },
  { id: "3", partenaire_id: "autre-partenaire", nom: "Lead Autre" },
];
const leadsDemo = filtrerLeadsPartenaire(leads, "demo-alexandre-morel");
assert(leadsDemo.length === 1, "Le partenaire ne voit qu’un lead");
assert(leadsDemo[0].id === "2", "Le mauvais lead a fuité");
assert(
  !leadsDemo.some((lead) => lead.partenaire_id !== "demo-alexandre-morel"),
  "Fuite de prospects d’un autre partenaire",
);

const crmDemo = partnerConfigToCrm(PARTNER_DEMO);
assert(crmDemo.id === "demo-alexandre-morel", "Mapping CRM id");
const visiblesPartenaire = partenairesVisiblesPourRole(ROLE_PARTENAIRE, "demo-alexandre-morel");
assert(visiblesPartenaire.length === 1, "Un partenaire ne liste pas les autres fiches");
assert(visiblesPartenaire[0].id === "demo-alexandre-morel", "Fiche partenaire isolée");
assert(
  !visiblesPartenaire.some((p) => p.id === "catarina-martins"),
  "Catarina ne doit pas apparaître dans le CRM du partenaire démo",
);
const visiblesAdmin = partenairesVisiblesPourRole(ROLE_ADMIN, "demo-alexandre-morel");
assert(visiblesAdmin.length >= 2, "L’admin voit l’annuaire complet");
assert(listKnownPartnerIds().includes("demo-alexandre-morel"), "Annuaire ids");
assert(
  PARTNERS.every((partner) => assertNotCatarinaClone(partner).length === 0),
  "Aucun partenaire duplicable ne reprend Catarina",
);

console.log("OK — modèle partenaire fictif isolé, sans données Catarina.");
