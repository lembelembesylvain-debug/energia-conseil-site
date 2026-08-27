import { loadJson, PLACEHOLDER } from "./utils.js";

const STORAGE_KEY = "energia_rapport_data";
let data = null;

const $ = (id) => document.getElementById(id);

function setMsg(t) {
  $("save-msg").textContent = t;
}

function fillForm() {
  if (!data) return;
  $("client_nom").value = data.client?.nom_complet || "";
  $("meta_ref").value = data.meta?.reference_dossier || "";
  $("meta_date").value = data.meta?.date_generation || "";
  $("meta_demo").value = data.meta?.demo ? "true" : "false";
  $("client_email").value = data.client?.email || "";
  $("client_tel").value = data.client?.telephone || "";

  $("log_adresse").value = data.logement?.adresse || "";
  $("log_type").value = data.logement?.type_bien || "";
  $("log_surface").value = data.logement?.surface_habitable_m2 ?? "";
  $("log_epoque").value = data.logement?.epoque_construction || "";
  $("dpe_init").value = data.performance?.dpe_initial || "";
  $("dpe_cible").value = data.performance?.dpe_cible || "";
  $("conso_cible").value = data.performance?.conso_cible_kwh_ep_m2_an ?? "";
  $("log_occup").value = data.logement?.occupation || "";
  $("log_desc").value = data.logement?.description || "";

  $("bud_ht").value = data.budget?.total_ht ?? "";
  $("bud_tva").value = data.budget?.total_tva ?? "";
  $("bud_ttc").value = data.budget?.total_ttc ?? "";
  $("scenario").value = data.scenario_retenu || "optimal";

  $("aides_total").value = data.aides?.total_affichage || "";
  $("profil_mpr").value = data.profil_aides?.profil_mpr_estime || "";
  $("aides_disclaimer").value = data.aides?.disclaimer || "";

  $("plan_duree").value = data.planning?.duree_chantier_indicative || "";
  $("plan_reception").value = data.planning?.reception || "";

  const e = data.paiements?.echeances || [];
  $("pay_30").value = e[0]?.montant_ttc ?? "";
  $("pay_30_statut").value = e[0]?.statut || "EN COURS";
  $("pay_40").value = e[1]?.montant_ttc ?? "";
  $("pay_40_statut").value = e[1]?.statut || "À venir";
  $("pay_r30").value = e[2]?.montant_ttc ?? "";
  $("pay_r30_statut").value = e[2]?.statut || "À venir";

  $("json_raw").value = JSON.stringify(data, null, 2);

  $("lots-summary").innerHTML = (data.lots || [])
    .map(
      (l) => `<div class="lot-card"><h3>Lot ${l.n} — ${l.designation}</h3>
      <p style="margin:0;font-size:.85rem">${l.entreprise || PLACEHOLDER} · TTC ${l.montant_ttc ?? PLACEHOLDER}</p></div>`
    )
    .join("") || `<p>${PLACEHOLDER}</p>`;

  $("entreprises-summary").innerHTML = (data.entreprises || [])
    .map(
      (en) => `<div class="lot-card"><h3>${en.entreprise}</h3>
      <p style="margin:0;font-size:.85rem">SIRET ${en.siret || PLACEHOLDER}<br>
      RGE : ${en.qualification_rge || PLACEHOLDER}<br>
      Assurance : ${en.assurance || PLACEHOLDER}<br>
      <em>${en.document_a_verifier || ""}</em></p></div>`
    )
    .join("") || `<p>${PLACEHOLDER}</p>`;
}

function numOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function emptyToPlaceholder(v) {
  if (v === null || v === undefined) return PLACEHOLDER;
  const s = String(v).trim();
  return s === "" ? PLACEHOLDER : s;
}

function readFormIntoData() {
  if (!data) data = {};
  data.meta = data.meta || {};
  data.client = data.client || {};
  data.logement = data.logement || {};
  data.performance = data.performance || {};
  data.budget = data.budget || {};
  data.aides = data.aides || {};
  data.profil_aides = data.profil_aides || {};
  data.planning = data.planning || {};
  data.paiements = data.paiements || { echeances: [] };
  data.synthese = data.synthese || {};

  data.client.nom_complet = emptyToPlaceholder($("client_nom").value);
  data.meta.reference_dossier = emptyToPlaceholder($("meta_ref").value);
  data.meta.date_generation = $("meta_date").value || new Date().toISOString().slice(0, 10);
  data.meta.demo = $("meta_demo").value === "true";
  data.meta.mode = data.meta.demo ? "demo" : "client";
  if (data.meta.demo) {
    data.meta.sous_titre = "DONNÉES DE DÉMONSTRATION — Ne pas utiliser comme dossier client réel";
    data.meta.bandeau_demo = "Données de démonstration";
  }
  data.client.email = emptyToPlaceholder($("client_email").value);
  data.client.telephone = emptyToPlaceholder($("client_tel").value);

  data.logement.adresse = emptyToPlaceholder($("log_adresse").value);
  data.logement.type_bien = emptyToPlaceholder($("log_type").value);
  data.logement.surface_habitable_m2 = numOrNull($("log_surface").value);
  data.logement.epoque_construction = emptyToPlaceholder($("log_epoque").value);
  data.logement.occupation = emptyToPlaceholder($("log_occup").value);
  data.logement.description = emptyToPlaceholder($("log_desc").value);

  data.performance.dpe_initial = emptyToPlaceholder($("dpe_init").value);
  data.performance.dpe_cible = emptyToPlaceholder($("dpe_cible").value);
  const conso = $("conso_cible").value.trim();
  data.performance.conso_cible_kwh_ep_m2_an = conso === "" ? PLACEHOLDER : numOrNull(conso) ?? conso;

  data.budget.total_ht = numOrNull($("bud_ht").value);
  data.budget.total_tva = numOrNull($("bud_tva").value);
  data.budget.total_ttc = numOrNull($("bud_ttc").value);
  data.synthese.budget_global_ht = data.budget.total_ht;
  data.synthese.budget_global_ttc = data.budget.total_ttc;
  data.synthese.budget_tva = data.budget.total_tva;
  data.scenario_retenu = $("scenario").value;

  data.aides.total_affichage = emptyToPlaceholder($("aides_total").value);
  data.profil_aides.profil_mpr_estime = emptyToPlaceholder($("profil_mpr").value);
  data.aides.disclaimer = $("aides_disclaimer").value || data.aides.disclaimer;

  data.planning.duree_chantier_indicative = emptyToPlaceholder($("plan_duree").value);
  data.planning.reception = emptyToPlaceholder($("plan_reception").value);

  if (!Array.isArray(data.paiements.echeances) || data.paiements.echeances.length < 3) {
    data.paiements.echeances = [
      { code: "acompte_30", libelle: "30 % — Signature / commande", condition: "À la signature du devis", montant_ttc: null, statut: "EN COURS" },
      { code: "mi_chantier_40", libelle: "40 % — Mi-chantier", condition: "Après validation écrite de Sylvain LEMBELEMBE", montant_ttc: null, statut: "À venir" },
      { code: "reception_30", libelle: "30 % — Réception", condition: "À la réception des travaux", montant_ttc: null, statut: "À venir" },
    ];
  }
  data.paiements.echeances[0].montant_ttc = numOrNull($("pay_30").value);
  data.paiements.echeances[0].statut = $("pay_30_statut").value || "EN COURS";
  data.paiements.echeances[1].montant_ttc = numOrNull($("pay_40").value);
  data.paiements.echeances[1].statut = emptyToPlaceholder($("pay_40_statut").value);
  data.paiements.echeances[2].montant_ttc = numOrNull($("pay_r30").value);
  data.paiements.echeances[2].statut = emptyToPlaceholder($("pay_r30_statut").value);
  data.paiements.base_ttc = data.budget.total_ttc;

  $("json_raw").value = JSON.stringify(data, null, 2);
}

function applyJsonRaw() {
  try {
    data = JSON.parse($("json_raw").value);
    fillForm();
    setMsg("JSON appliqué.");
  } catch (e) {
    setMsg("JSON invalide : " + e.message);
  }
}

function saveLocal() {
  readFormIntoData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  setMsg("Enregistré dans le navigateur (localStorage). Prévisualisez avec le bouton dédié.");
}

function preview() {
  readFormIntoData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  window.location.href = "rapport.html?from=param";
}

function downloadJson() {
  readFormIntoData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = (data.meta?.reference_dossier || "rapport-client") + ".json";
  a.click();
  URL.revokeObjectURL(a.href);
}

async function loadPath(path) {
  data = await loadJson(path);
  fillForm();
  setMsg("Modèle chargé : " + path);
}

document.querySelectorAll("#nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("#nav button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    document.querySelectorAll(".panel").forEach((p) => {
      if (p.id && p.id.startsWith("panel-")) p.classList.add("hidden");
    });
    // keep actions panel visible — only hide tab panels
    ["client", "logement", "travaux", "entreprises", "aides", "planning", "paiements", "json"].forEach((id) => {
      const el = $("panel-" + id);
      if (el) el.classList.add("hidden");
    });
    $("panel-" + btn.dataset.panel).classList.remove("hidden");
  });
});

$("btn-load-royer").addEventListener("click", () => loadPath("data/rapport-client-royer.json"));
$("btn-load-demo").addEventListener("click", () => loadPath("data/rapport-client-demo.json"));
$("btn-apply-json").addEventListener("click", applyJsonRaw);
$("btn-save").addEventListener("click", saveLocal);
$("btn-preview").addEventListener("click", preview);
$("btn-preview-2").addEventListener("click", preview);
$("btn-download").addEventListener("click", (e) => {
  e.preventDefault();
  downloadJson();
});

// init
loadPath("data/rapport-client-royer.json").catch((err) => {
  setMsg("Erreur chargement : " + err.message + " — lancez un serveur local (voir README).");
});
