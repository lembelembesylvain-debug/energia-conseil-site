/**
 * Parades anti-fuite — qualification financière, devis à double option,
 * convention d'ingénierie remboursable, phasage étanche Anah / gros œuvre.
 */

export const PARADE_STORAGE_KEY = "energia-crm-parades-anti-fuite-v1";

export const FORFAIT_INGENIERIE_TTC = 990;
export const FORFAIT_INGENIERIE_HT = 825;
export const FORFAIT_INGENIERIE_TVA = 165;
export const TAUX_TVA_INGENIERIE = 0.2;
export const SEUIL_ECART_BUDGET = 0.2;
export const SEUIL_ECART_SEVERE = 0.4;
export const TAUX_ACOMPTE = 0.3;

export const ASSURANCE_CALIPSO = "Calipso Assurances n° LUNPIB2604975";
export const INPI_MARQUE = "5213845";

export const RIB_QONTO = {
  titulaire: "ENERGIA CONSEIL",
  adresseTitulaire: "16 Rue Cuvier, 69006 Lyon",
  banque: "Qonto SA",
  adresseBanque: "6 Impasse Bonne Nouvelle, 75010 Paris",
  iban: "FR76 1695 8000 0186 6836 4808 772",
  bic: "QNTOFRP1XXX",
};

export const CLAUSE_DEDUCTION_INGENIERIE =
  "Le montant du présent forfait d'ingénierie (990,00 € TTC) est intégralement offert et déduit à 100 % de la facture finale de travaux dès lors que le chantier est confié à ENERGIA CONSEIL IA® en qualité de Contractant Général. En cas de renoncement unilatéral du maître d'ouvrage ou d'exécution des travaux par des tiers sur la base des présents scénarios et métrés, ce montant reste définitivement exigible au titre des frais d'études engagés.";

export const ORIGINES_FONDS = [
  { id: "epargne", label: "Épargne disponible" },
  { id: "pret_valide", label: "Prêt bancaire validé" },
  { id: "financement_cours", label: "Financement en cours" },
];

export const DECISIONNAIRES = [
  { id: "proprietaire_unique", label: "Propriétaire unique" },
  { id: "indivision_accord", label: "Indivision d'accord" },
  { id: "conjoints_alignes", label: "Conjoints alignés" },
];

export const STATUTS_FAISABILITE = [
  { id: "qualifie_solvable", label: "Qualifié et solvable", tone: "emerald" },
  { id: "budget_recadrer", label: "Budget à recadrer", tone: "amber" },
  { id: "touriste", label: "Touriste / Risque élevé", tone: "red" },
];

export const PACKS = [
  { id: "essentiel", label: "Pack Essentiel", hint: "Lots prioritaires — signables seuls" },
  { id: "signature", label: "Pack Signature uniquement", hint: "Finitions et confort — Option 2" },
];

export const PHASES = [
  { id: "phase1", label: "Phase 1 — Lot énergétique aidé (Anah)" },
  { id: "phase2", label: "Phase 2 — Gros œuvre / travaux non aidés" },
];

const FAMILLES_PHASE_2 = new Set([
  "peinture",
  "electricite",
  "menuiserie-interieure",
  "carrelage",
  "maconnerie",
  "demolition",
  "terrassement",
  "paysagisme",
  "plafonds-tendus",
  "piscine",
  "serrurerie",
  "vitrerie",
  "ravalement-facade",
  "plomberie",
]);

const MOTS_PHASE_2 =
  /peinture|électricité|electricite|cuisine|sol\s*lvt|lvt|carrelage|maçon|macon|gros\s*œuvre|gros\s*oeuvre|démolition|demolition|faux plafond|agencement|dalle|enduit intérieur|parquet/i;

const MOTS_PHASE_1 =
  /comble|ite|iti|isolation|menuiserie ext|fenêtre|fenetre|vmc|pac\b|pompe à chaleur|pompe a chaleur|ballon|thermodynamique|photovolta|plancher bas|chauffe-eau|chauffe eau/i;

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function euroParade(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export function qualificationVide() {
  return {
    budgetMaxTtc: "",
    origineFonds: "",
    decisionnaires: "",
    statutFaisabilite: "",
    recadrageOral: false,
    qualifieLe: "",
  };
}

export function phasageVide() {
  return {
    accordAnahNotifie: false,
    packs: {},
    phases: {},
    optionRetenue: "",
  };
}

export function paradesVides() {
  return {
    qualification: qualificationVide(),
    phasage: phasageVide(),
    lots: [],
  };
}

export function libelleOrigine(id) {
  return ORIGINES_FONDS.find((item) => item.id === id)?.label || "";
}

export function libelleDecisionnaire(id) {
  return DECISIONNAIRES.find((item) => item.id === id)?.label || "";
}

export function libelleStatut(id) {
  return STATUTS_FAISABILITE.find((item) => item.id === id)?.label || "";
}

export function qualificationComplete(qualification) {
  const budget = Number(qualification?.budgetMaxTtc);
  return (
    Number.isFinite(budget) &&
    budget > 0 &&
    Boolean(qualification?.origineFonds) &&
    Boolean(qualification?.decisionnaires) &&
    Boolean(qualification?.statutFaisabilite)
  );
}

export function analyserEcartBudget(budgetMaxTtc, montantChiffreTtc) {
  const budget = Number(budgetMaxTtc);
  const montant = Number(montantChiffreTtc);
  if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(montant) || montant <= 0) {
    return { alerte: false, severe: false, ecartPct: 0, depassement: 0, plafond: 0 };
  }
  const depassement = round2(montant - budget);
  const ecartPct = depassement / budget;
  return {
    alerte: ecartPct > SEUIL_ECART_BUDGET,
    severe: ecartPct > SEUIL_ECART_SEVERE,
    ecartPct,
    depassement,
    plafond: round2(budget * (1 + SEUIL_ECART_BUDGET)),
  };
}

export function phaseParDefaut(ligne) {
  if (ligne?.phase === "phase1" || ligne?.phase === "phase2") return ligne.phase;
  const famille = String(ligne?.familleId || ligne?.categorieId || "");
  const blob = `${famille} ${ligne?.nom || ""} ${ligne?.label || ""} ${ligne?.prestation || ""}`;
  if (FAMILLES_PHASE_2.has(famille) || MOTS_PHASE_2.test(blob)) return "phase2";
  if (MOTS_PHASE_1.test(blob)) return "phase1";
  if (["isolation", "menuiseries", "ventilation", "chauffage", "ecs", "solaire"].includes(famille)) {
    return "phase1";
  }
  return "phase2";
}

export function packParDefaut(ligne) {
  if (ligne?.pack === "essentiel" || ligne?.pack === "signature") return ligne.pack;
  return "essentiel";
}

function montantBrut(ligne) {
  const candidats = [ligne?.totalTtc, ligne?.prixTtc, ligne?.montantTtc, ligne?.ht, ligne?.totalHt];
  for (const valeur of candidats) {
    const n = Number(valeur);
    if (Number.isFinite(n)) return { montant: round2(n), unite: ligne?.totalTtc != null || ligne?.prixTtc != null || ligne?.montantTtc != null ? "TTC" : "HT" };
  }
  return { montant: 0, unite: "TTC" };
}

export function normaliserLot(ligne, index, phasage) {
  const id = String(ligne?.id || `lot-${index + 1}`);
  const brut = montantBrut(ligne);
  const phaseForcee = phasage?.phases?.[id];
  const packForce = phasage?.packs?.[id];
  return {
    id,
    nom: ligne?.nom || ligne?.label || ligne?.prestation || "Lot",
    total: brut.montant,
    unite: brut.unite,
    pack: packForce === "signature" || packForce === "essentiel" ? packForce : packParDefaut(ligne),
    phase: phaseForcee === "phase1" || phaseForcee === "phase2" ? phaseForcee : phaseParDefaut(ligne),
  };
}

function sommeLots(lots) {
  const total = round2(lots.reduce((sum, lot) => sum + (lot.total || 0), 0));
  return {
    lots,
    total,
    acompte30: round2(total * TAUX_ACOMPTE),
    unite: lots.some((lot) => lot.unite === "HT") && lots.some((lot) => lot.unite === "TTC") ? "mixte" : lots[0]?.unite || "TTC",
  };
}

export function calculerDoubleOption(lignes, phasage, { masquerPhase2 = true } = {}) {
  const lots = (Array.isArray(lignes) ? lignes : []).map((ligne, index) => normaliserLot(ligne, index, phasage));
  const phase2 = lots.filter((lot) => lot.phase === "phase2");
  const phase1 = lots.filter((lot) => lot.phase !== "phase2");
  const visibles = masquerPhase2 && !phasage?.accordAnahNotifie ? phase1 : lots;
  const essentiel = visibles.filter((lot) => lot.pack !== "signature");
  const signature = visibles;
  return {
    lots,
    essentiels: sommeLots(essentiel),
    signature: sommeLots(signature),
    phase1: sommeLots(phase1),
    phase2: sommeLots(phase2),
    phase2Masquee: Boolean(masquerPhase2 && !phasage?.accordAnahNotifie && phase2.length > 0),
  };
}

export function montantChiffreComplet(lignes, phasage, repliTtc) {
  const calcul = calculerDoubleOption(lignes, phasage, { masquerPhase2: false });
  if (calcul.lots.length === 0) {
    const repli = Number(repliTtc);
    return Number.isFinite(repli) ? repli : 0;
  }
  return calcul.signature.total;
}

export function lignesAffichablesDossier(dossier, edition) {
  if (Array.isArray(edition?.travaux) && edition.travaux.length > 0) return edition.travaux;
  if (Array.isArray(dossier?.travaux) && dossier.travaux.length > 0) return dossier.travaux;
  const proposes = dossier?.workingBase?.travauxProposes;
  if (Array.isArray(proposes) && proposes.length > 0) return proposes;
  return [];
}

function lireTousParades() {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(PARADE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function ecrireTousParades(tous) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(PARADE_STORAGE_KEY, JSON.stringify(tous));
  } catch {
    /* quota */
  }
}

export function lireParades(id) {
  const cle = String(id || "").trim();
  const stocke = cle ? lireTousParades()[cle] : null;
  const vide = paradesVides();
  if (!stocke || typeof stocke !== "object") return vide;
  return {
    qualification: { ...vide.qualification, ...(stocke.qualification || {}) },
    phasage: {
      ...vide.phasage,
      ...(stocke.phasage || {}),
      packs: { ...(stocke.phasage?.packs || {}) },
      phases: { ...(stocke.phasage?.phases || {}) },
    },
    lots: Array.isArray(stocke.lots) ? stocke.lots : [],
  };
}

export function enregistrerParades(id, patch) {
  const cle = String(id || "").trim();
  const actuel = lireParades(cle);
  const suivant = {
    qualification: { ...actuel.qualification, ...(patch?.qualification || {}) },
    phasage: {
      ...actuel.phasage,
      ...(patch?.phasage || {}),
      packs: { ...actuel.phasage.packs, ...(patch?.phasage?.packs || {}) },
      phases: { ...actuel.phasage.phases, ...(patch?.phasage?.phases || {}) },
    },
    lots: Array.isArray(patch?.lots) ? patch.lots : actuel.lots,
  };
  if (suivant.qualification && qualificationComplete(suivant.qualification) && !suivant.qualification.qualifieLe) {
    suivant.qualification.qualifieLe = new Date().toISOString().slice(0, 10);
  }
  if (cle) {
    const tous = lireTousParades();
    tous[cle] = suivant;
    ecrireTousParades(tous);
  }
  return suivant;
}

function escapeHtml(valeur) {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function htmlConventionIngenierie({
  client = "Maître d'ouvrage",
  adresse = "",
  ville = "",
  reference = "",
  date = "",
} = {}) {
  const jour =
    date ||
    new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  const clientHtml = escapeHtml(client);
  const adresseHtml = escapeHtml([adresse, ville].filter(Boolean).join(" — ") || "Adresse du bien à compléter");
  const referenceHtml = escapeHtml(reference || "CONV-ETUDE-2026");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Convention d'assistance et d'ingénierie de projet — ${clientHtml}</title>
  <style>
    @page { size: A4; margin: 14mm 14mm 16mm; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #0f172a; font-family: "Segoe UI", Calibri, sans-serif; font-size: 11pt; line-height: 1.45; }
    header { display: flex; justify-content: space-between; gap: 16px; align-items: center; border-bottom: 3px solid #047857; padding-bottom: 12px; }
    h1 { font-family: Palatino, "Palatino Linotype", Georgia, serif; font-size: 18pt; line-height: 1.2; color: #064e3b; margin: 16px 0 4px; }
    h2 { font-family: Palatino, Georgia, serif; font-size: 12pt; color: #065f46; margin: 18px 0 6px; }
    .kicker { letter-spacing: .14em; text-transform: uppercase; font-size: 8.5pt; color: #047857; font-weight: 700; margin: 0; }
    .marque { font-family: Palatino, Georgia, serif; font-size: 13pt; color: #064e3b; margin: 2px 0 0; }
    .meta { font-size: 8.5pt; color: #475569; text-align: right; line-height: 1.35; }
    .logo { height: 62px; width: auto; object-fit: contain; }
    .forfait { margin-top: 12px; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 10px; padding: 12px 14px; }
    .forfait strong { font-family: Palatino, Georgia, serif; font-size: 16pt; color: #065f46; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    td { padding: 4px 0; vertical-align: top; }
    td.n { text-align: right; font-variant-numeric: tabular-nums; font-weight: 700; }
    .clause { background: #fff7ed; border-left: 4px solid #f97316; padding: 12px 14px; margin-top: 8px; }
    .clause p { margin: 0; }
    .julia { margin-top: 14px; background: #fff7ed; border-left: 4px solid #f97316; padding: 10px 12px; font-size: 9.5pt; }
    .sign { display: flex; gap: 16px; margin-top: 18px; }
    .sign div { flex: 1; border: 1px solid #d1fae5; border-radius: 10px; min-height: 110px; padding: 10px; }
    .rib { margin-top: 14px; border: 1px solid #a7f3d0; border-radius: 10px; padding: 10px 12px; font-size: 9.5pt; background: #f0fdf4; }
    footer { margin-top: 16px; font-size: 8pt; color: #64748b; border-top: 1px solid #d1fae5; padding-top: 8px; }
    .badge { display: inline-block; border: 1px solid #047857; color: #047857; border-radius: 999px; padding: 2px 8px; font-size: 8pt; font-weight: 700; letter-spacing: .04em; }
  </style>
</head>
<body>
  <header>
    <div>
      <img class="logo" src="/assets/energia-logo-arbres.png" alt="ENERGIA CONSEIL IA®" />
      <p class="marque">ENERGIA CONSEIL IA®</p>
      <p class="kicker">Audit énergétique · Bureau d'études &amp; AMO · Contractant général</p>
    </div>
    <div class="meta">
      16 Rue Cuvier, 69006 Lyon<br />
      06 10 59 68 98 · contact@energia-conseil-ia.com<br />
      SIRET 941 819 427 00019 · RCS Lyon 941 819 427<br />
      SASU au capital de 100 €<br />
      <span class="badge">INPI n° ${INPI_MARQUE}</span><br />
      ${ASSURANCE_CALIPSO}
    </div>
  </header>
  <p class="kicker">Document officiel · ${referenceHtml}</p>
  <h1>Convention d'assistance &amp; d'ingénierie de projet</h1>
  <p>Entre <strong>ENERGIA CONSEIL IA®</strong>, Contractant Général, et le maître d'ouvrage désigné ci-dessous.</p>
  <table>
    <tr><td>Maître d'ouvrage</td><td><strong>${clientHtml}</strong></td></tr>
    <tr><td>Bien</td><td>${adresseHtml}</td></tr>
    <tr><td>Date</td><td>${escapeHtml(jour)}</td></tr>
  </table>
  <h2>Article 1 — Objet</h2>
  <p>La présente convention valorise l'audit thermique, le dimensionnement technique et le montage du plan de financement Anah, réalisés par ENERGIA CONSEIL IA®. Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>
  <h2>Article 2 — Forfait d'étude</h2>
  <div class="forfait">
    <p style="margin:0 0 6px">Forfait d'ingénierie de projet</p>
    <strong>990,00 € TTC</strong>
    <table>
      <tr><td>Honoraire HT</td><td class="n">825,00 €</td></tr>
      <tr><td>TVA 20 %</td><td class="n">165,00 €</td></tr>
      <tr><td>Total TTC</td><td class="n">990,00 €</td></tr>
    </table>
  </div>
  <h2>Article 3 — Engagement et déduction intégrale</h2>
  <div class="clause"><p>${CLAUSE_DEDUCTION_INGENIERIE}</p></div>
  <h2>Article 4 — Exigibilité</h2>
  <p>Le forfait est exigible à la signature de la présente convention. Il est soldé par virement sur le compte Qonto d'ENERGIA CONSEIL IA®. Dès lors que le marché de travaux est confié à ENERGIA CONSEIL IA®, le montant est déduit à 100 % de la facture finale, sans reste à payer au titre de cette étude.</p>
  <div class="rib">
    <strong>Règlement — RIB Qonto</strong><br />
    Titulaire : ${RIB_QONTO.titulaire} — ${RIB_QONTO.adresseTitulaire}<br />
    Banque : ${RIB_QONTO.banque} — ${RIB_QONTO.adresseBanque}<br />
    IBAN : ${RIB_QONTO.iban}<br />
    BIC : ${RIB_QONTO.bic}<br />
    Libellé : Convention ingénierie ${referenceHtml}
  </div>
  <div class="julia">
    <strong>⚖ Avis juridique.</strong> La déduction intégrale est subordonnée à la confiance du chantier à ENERGIA CONSEIL IA® en qualité de Contractant Général. Le renoncement unilatéral ou l'exécution par des tiers sur la base des scénarios et métrés rend le forfait définitivement exigible. ENERGIA CONSEIL IA® n'est pas responsable d'un usage des études hors de ce cadre.<br />
    Avis établi par Julia — Juriste ENERGIA-CONSEIL IA® — 2026.
  </div>
  <div class="sign">
    <div>
      <strong>Le maître d'ouvrage</strong>
      <p>Bon pour accord sur le forfait de 990,00 € TTC et sur la clause de déduction intégrale.</p>
      <p>Fait à _______________, le _______________</p>
      <p>Signature : _______________</p>
    </div>
    <div>
      <strong>ENERGIA CONSEIL IA®</strong>
      <p>Sylvain LEMBELEMBE — Direction et portage Contractant Général</p>
      <p>Fait à Lyon, le ${escapeHtml(jour)}</p>
      <p>Signature : _______________</p>
    </div>
  </div>
  <footer>
    ENERGIA CONSEIL IA® — Marque déposée INPI n° ${INPI_MARQUE} — ${ASSURANCE_CALIPSO} — SIRET 94181942700019 — RCS Lyon 941819427 — SASU Capital 100 € — 16 Rue Cuvier, 69006 Lyon.
    Document confidentiel. Les métrés et scénarios restent la propriété intellectuelle d'ENERGIA CONSEIL IA® jusqu'au complet paiement du forfait ou à sa déduction sur facture de travaux.
  </footer>
</body>
</html>`;
}
