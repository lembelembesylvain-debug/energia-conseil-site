/**
 * Moteur de génération du rapport A4 premium ENERGIA CONSEIL IA®
 * Remplit ~85 pages à partir d'un JSON client unique.
 */
import {
  PLACEHOLDER,
  PAGES_TOTALES,
  val,
  money,
  moneyOrDash,
  esc,
  list,
  formatDateFR,
  pctBar,
  pageShell,
  getQueryParam,
  loadJson,
} from "./utils.js";
import { PEDAGO } from "./content-pedagogique.js";

let pageNum = 0;
let pages = [];
let data = null;

function push(html, opts = {}) {
  pageNum += 1;
  pages.push(pageShell(pageNum, html, { ...opts, demo: !!data?.meta?.demo }));
}

function sectionTitle(n, title) {
  return `<h1><span class="section-num">${esc(n)}</span>${esc(title)}</h1>`;
}

function disclaimerAides() {
  return `<div class="encadre encadre-orange">
    <p class="small"><strong>Aides financières (estimation à titre indicatif).</strong>
    Aides à valider selon revenus réels et éligibilité en vigueur.
    Montants définitifs après instruction des organismes compétents.
    Non déduites du devis sauf mention contractuelle explicite.
    Versement au client selon conditions applicables.</p>
  </div>`;
}

function disclaimerGeneral() {
  return `<div class="encadre encadre-bleu">
    <p class="small">${esc(data.meta.disclaimer_general)}</p>
  </div>`;
}

/* ========== PAGES ========== */

function buildCover() {
  const c = data.client;
  const l = data.logement;
  const demo = data.meta.demo;
  push(
    `<div class="cover-inner">
      <div>
        <div class="cover-brand">ENERGIA CONSEIL <span>IA®</span></div>
        <div class="cover-tagline">${esc(data.entreprise.tagline)}<br>${esc(data.entreprise.adresse)} · ${esc(data.entreprise.telephone)} · ${esc(data.entreprise.siret)}</div>
        ${demo ? `<div class="cover-badge-demo">Données de démonstration</div>` : ""}
        <div class="cover-title">${esc(data.meta.titre_document)}<br><span style="font-size:12pt;font-weight:500;opacity:.9">${esc(data.meta.sous_titre)}</span></div>
        <div class="cover-meta">
          <dl>
            <dt>Client</dt><dd>${esc(c.nom_complet)}</dd>
            <dt>Adresse du bien</dt><dd>${esc(l.adresse)}</dd>
            <dt>Référence dossier</dt><dd>${esc(data.meta.reference_dossier)}</dd>
            <dt>Date de génération</dt><dd>${esc(formatDateFR(data.meta.date_generation))}</dd>
            <dt>Scénario retenu</dt><dd>${esc(data.scenarios?.[data.scenario_retenu]?.label || PLACEHOLDER)}</dd>
          </dl>
        </div>
      </div>
      <div class="cover-signature">
        <p>Document établi pour accompagnement du projet de rénovation énergétique.</p>
        <p style="margin-top:4mm"><strong>Signature ENERGIA CONSEIL IA®</strong><br>
        Sylvain LEMBELEMBE — Contractant Général / AMO<br>
        ${esc(data.entreprise.email)} · ${esc(data.entreprise.site)}</p>
        <p class="tiny" style="margin-top:6mm;opacity:.7">Pagination cible : Page x / ${PAGES_TOTALES} · Pied de page : Généré par Limova</p>
      </div>
    </div>`,
    { cover: true }
  );
}

function buildDisclaimerPages() {
  push(`
    ${sectionTitle("0", "Cadre du document & limites")}
    ${disclaimerGeneral()}
    <h3>Ce que ce rapport est</h3>
    <ul>
      <li>Un support pédagogique et commercial pour comprendre le projet</li>
      <li>Une synthèse structurée à partir d’un fichier de données client unique</li>
      <li>Un outil de suivi avant, pendant et après la rénovation</li>
    </ul>
    <h3>Ce que ce rapport n’est pas</h3>
    <ul>
      <li>Un audit réglementaire</li>
      <li>Un accompagnement MAR</li>
      <li>Une étude structurelle</li>
      <li>Une décision d’attribution d’aides</li>
    </ul>
    ${disclaimerAides()}
    <div class="encadre">
      <h4>Règle de données</h4>
      <p>Aucune aide, performance thermique, qualification RGE, assurance, montant ou donnée client n’est inventée.
      Toute information absente s’affiche : <strong>${esc(PLACEHOLDER)}</strong>.</p>
    </div>
    <h3>Sources</h3>
    ${list(data.meta.sources_utilisees)}
    ${data.meta.sources_absentes?.length ? `<h4>Sources non disponibles à la génération</h4>${list(data.meta.sources_absentes)}` : ""}
  `);
}

function buildToc() {
  const items = [
    ["Page de garde", 1],
    ["Cadre & limites", 2],
    ["Table des matières", 3],
    ["1. Synthèse exécutive", 5],
    ["2. Profil du logement", 8],
    ["3. Diagnostic énergétique détaillé", 11],
    ["4. Scénarios de rénovation", 19],
    ["5. Programme de travaux retenu", 25],
    ["6. Focus technique par poste", 30],
    ["7. Aides financières et financement", 50],
    ["8. Planning de réalisation", 58],
    ["9. Entreprises, RGE et assurances", 62],
    ["10. Conditions commerciales et contractuelles", 65],
    ["11. Annexes (devis, glossaire, FAQ, checklist)", 69],
    ["12. Prochaines étapes", 84],
  ];
  push(`
    ${sectionTitle("", "Table des matières")}
    <p class="lead">Rapport premium — ${esc(data.meta.reference_dossier)} — ${esc(data.client.nom_complet)}</p>
    <ul class="toc-list">
      ${items
        .map(
          ([label, p]) =>
            `<li><span>${esc(label)}</span><span class="dots"></span><span class="page-n">${p}</span></li>`
        )
        .join("")}
    </ul>
    <div class="encadre encadre-vert mt">
      <p class="small">Les numéros de section renvoient à la structure éditoriale. La pagination imprimée suit le format <strong>Page X / ${PAGES_TOTALES}</strong>.</p>
    </div>
  `);
  push(`
    <h2>Comment lire ce rapport</h2>
    <div class="icon-row">
      <div class="icon-box"><div class="ico">1</div><div class="t">Synthèse</div><div class="d">Vision globale du projet</div></div>
      <div class="icon-box"><div class="ico">2</div><div class="t">Diagnostic</div><div class="d">État du logement</div></div>
      <div class="icon-box"><div class="ico">3</div><div class="t">Scénarios</div><div class="d">Choix & recommandations</div></div>
    </div>
    <div class="icon-row">
      <div class="icon-box"><div class="ico">4</div><div class="t">Travaux</div><div class="d">Lots & focus techniques</div></div>
      <div class="icon-box"><div class="ico">5</div><div class="t">Aides</div><div class="d">Indicatif & checklist</div></div>
      <div class="icon-box"><div class="ico">6</div><div class="t">Suivi</div><div class="d">Planning & entreprises</div></div>
    </div>
    <h3>Contacts projet (5 interlocuteurs)</h3>
    <table class="data">
      <thead><tr><th>Rôle</th><th>Nom</th><th>Contact</th></tr></thead>
      <tbody>
        <tr><td>AMO / Coordination</td><td>${esc(data.contacts.amo.nom)}</td><td>${esc(data.contacts.amo.telephone)} · ${esc(data.contacts.amo.email)}</td></tr>
        <tr><td>Commercial</td><td>${esc(data.contacts.commercial.nom)}</td><td>${esc(data.contacts.commercial.telephone)} · ${esc(data.contacts.commercial.email)}</td></tr>
        <tr><td>Courtier</td><td>${esc(data.contacts.courtier.nom)} — ${esc(data.contacts.courtier.entite)}</td><td>${esc(data.contacts.courtier.telephone)}</td></tr>
        <tr><td>Juriste</td><td>${esc(data.contacts.juriste.nom)}</td><td>${esc(val(data.contacts.juriste.telephone))}</td></tr>
        <tr><td>MAR</td><td>${esc(data.contacts.mar.nom)} — ${esc(data.contacts.mar.entite)}</td><td>${esc(val(data.contacts.mar.telephone))}</td></tr>
      </tbody>
    </table>
    <p class="tiny">${esc(data.contacts.mar.precision)}</p>
  `);
}

function buildSynthese() {
  const s = data.synthese;
  const p = data.performance;
  push(`
    ${sectionTitle("1", "Synthèse exécutive")}
    <p class="lead">Situation, objectifs, budget et bénéfices — vue d’ensemble pour le client.</p>
    <div class="kpi-grid">
      <div class="kpi"><div class="label">DPE initial → cible</div><div class="value">${esc(p.dpe_initial)} → ${esc(p.dpe_cible)}</div><div class="hint">${esc(p.source_performance)}</div></div>
      <div class="kpi accent"><div class="label">Budget travaux TTC</div><div class="value">${esc(moneyOrDash(s.budget_global_ttc))}</div><div class="hint">HT ${esc(moneyOrDash(s.budget_global_ht))} · TVA ${esc(moneyOrDash(s.budget_tva))}</div></div>
      <div class="kpi"><div class="label">Conso cible indicative</div><div class="value">${esc(val(p.conso_cible_kwh_ep_m2_an))} <span style="font-size:9pt">kWhEP/m².an</span></div><div class="hint">Statut : ${esc(p.statut)}</div></div>
      <div class="kpi"><div class="label">Planning prévisionnel</div><div class="value" style="font-size:11pt">${esc(s.planning_previsionnel)}</div><div class="hint">Aléas possibles : voir section Planning</div></div>
    </div>
    <h3>Situation initiale</h3>
    <p>${esc(s.situation_initiale)}</p>
    <h3>Objectif énergétique</h3>
    <p>${esc(s.objectif_energetique)}</p>
  `);
  push(`
    <h2>Travaux recommandés & finances</h2>
    <h3>Travaux recommandés (ordre de principe)</h3>
    ${list(s.travaux_recommandes)}
    <p class="small muted">Ordre d’exécution contractuel : ${esc(data.ordre_execution_resume)}</p>
    <h3>Aides estimatives</h3>
    ${disclaimerAides()}
    <p>${esc(s.aides_mention)}</p>
    <p><strong>Total aides estimé :</strong> ${esc(val(data.aides.total_affichage))}</p>
    <p><strong>Reste à charge estimatif :</strong> ${esc(s.reste_a_charge_estimatif)}</p>
    <div class="encadre encadre-vert">
      <h4>MAR</h4>
      <p>${esc(data.budget.mar_precision)}</p>
    </div>
  `);
  push(`
    <h2>Principaux bénéfices attendus</h2>
    <div class="icon-row">
      <div class="icon-box"><div class="ico">◆</div><div class="t">Confort</div><div class="d">${esc(s.benefices[0] || PLACEHOLDER)}</div></div>
      <div class="icon-box"><div class="ico">◆</div><div class="t">Patrimoine</div><div class="d">${esc(s.benefices[1] || PLACEHOLDER)}</div></div>
      <div class="icon-box"><div class="ico">◆</div><div class="t">Énergie</div><div class="d">${esc(s.benefices[2] || PLACEHOLDER)}</div></div>
      <div class="icon-box"><div class="ico">◆</div><div class="t">Carbone</div><div class="d">${esc(s.benefices[3] || PLACEHOLDER)}</div></div>
    </div>
    <h3>Paiements — rappel</h3>
    <table class="data">
      <thead><tr><th>Échéance</th><th>Condition</th><th class="num">Montant</th><th>Statut</th></tr></thead>
      <tbody>
        ${data.paiements.echeances
          .map(
            (e) => `<tr>
            <td>${esc(e.libelle)}</td>
            <td>${esc(e.condition)}</td>
            <td class="num">${esc(moneyOrDash(e.montant_ttc))}</td>
            <td>${e.statut === "EN COURS" ? `<span class="statut-encours">EN COURS</span>` : esc(e.statut)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <p class="tiny">Le statut « EN COURS » ne signifie ni « payé » ni « encaissé ».</p>
    ${disclaimerGeneral()}
  `);
}

function buildProfil() {
  const l = data.logement;
  const p = data.performance;
  push(`
    ${sectionTitle("2", "Profil du logement")}
    <table class="data">
      <tbody>
        <tr><td>Type de bien</td><td>${esc(l.type_bien)}</td></tr>
        <tr><td>Surface habitable</td><td>${esc(val(l.surface_habitable_m2))} m²</td></tr>
        <tr><td>Époque / année</td><td>${esc(val(l.epoque_construction))} / ${esc(val(l.annee_construction))}</td></tr>
        <tr><td>Adresse</td><td>${esc(l.adresse)}</td></tr>
        <tr><td>Zone climatique</td><td>${esc(val(l.zone_climatique))} · ${esc(val(l.region))}</td></tr>
        <tr><td>Occupation</td><td>${esc(val(l.occupation))} · ${esc(val(l.nb_occupants))} occupant(s)</td></tr>
        <tr><td>Description</td><td>${esc(val(l.description))}</td></tr>
        <tr><td>DPE initial</td><td><span class="badge badge-orange">${esc(p.dpe_initial)}</span></td></tr>
        <tr><td>Classe cible</td><td><span class="badge badge-vert">${esc(p.dpe_cible)}</span></td></tr>
        <tr><td>Conso cible</td><td>${esc(val(p.conso_cible_kwh_ep_m2_an))} kWhEP/m².an</td></tr>
      </tbody>
    </table>
    <h3>Contraintes connues</h3>
    ${list(l.contraintes_connues)}
  `);
  push(`
    <h2>Photos du logement</h2>
    <p class="muted small">${esc(l.photos_statut)}</p>
    <div class="photo-grid">
      <div class="photo-slot">Photo 1 — Façade / vue générale<br><em>Emplacement prévu</em></div>
      <div class="photo-slot">Photo 2 — Toiture<br><em>Emplacement prévu</em></div>
      <div class="photo-slot">Photo 3 — Intérieur / chauffage<br><em>Emplacement prévu</em></div>
      <div class="photo-slot">Photo 4 — Menuiseries<br><em>Emplacement prévu</em></div>
    </div>
  `);
  push(`
    <h2>Plans & profil aides (indicatif)</h2>
    <div class="photo-grid">
      <div class="photo-slot">Plan RDC<br><em>Emplacement prévu — document non joint</em></div>
      <div class="photo-slot">Plan étage / combles<br><em>Emplacement prévu — document non joint</em></div>
    </div>
    <h3>Profil aides (non garanti)</h3>
    ${disclaimerAides()}
    <table class="data">
      <tr><td>RFR</td><td>${esc(val(data.profil_aides.rfr))}</td></tr>
      <tr><td>Nb personnes fiscales</td><td>${esc(val(data.profil_aides.nb_personnes_fiscales))}</td></tr>
      <tr><td>Profil MPR estimé</td><td>${esc(val(data.profil_aides.profil_mpr_estime))}</td></tr>
      <tr><td>Note</td><td>${esc(data.profil_aides.profil_note)}</td></tr>
    </table>
  `);
}

function buildDiagnostic() {
  const e = data.etat_existant;
  const env = e.enveloppe;
  push(`
    ${sectionTitle("3", "Diagnostic énergétique détaillé")}
    ${PEDAGO.audit_intro}
    <h3>Enveloppe — synthèse</h3>
    <table class="data">
      <thead><tr><th>Poste</th><th>État</th><th>Part indicative</th><th>Statut</th></tr></thead>
      <tbody>
        <tr><td>Toiture</td><td>${esc(env.toiture.etat)}</td><td class="center">${esc(env.toiture.deperdition_pct_indicatif)} %</td><td>${esc(env.toiture.statut)}</td></tr>
        <tr><td>Murs</td><td>${esc(env.murs.etat)}</td><td class="center">${esc(env.murs.deperdition_pct_indicatif)} %</td><td>${esc(env.murs.statut)}</td></tr>
        <tr><td>Planchers</td><td>${esc(env.planchers.etat)}</td><td class="center">${esc(env.planchers.deperdition_pct_indicatif)} %</td><td>${esc(env.planchers.statut)}</td></tr>
        <tr><td>Fenêtres</td><td>${esc(env.fenetres.etat)}</td><td class="center">${esc(env.fenetres.deperdition_pct_indicatif)} %</td><td>${esc(env.fenetres.statut)}</td></tr>
        <tr><td>Ponts thermiques</td><td>${esc(env.ponts_thermiques.etat)}</td><td class="center">${esc(env.ponts_thermiques.deperdition_pct_indicatif)} %</td><td>${esc(env.ponts_thermiques.statut)}</td></tr>
        <tr><td>Infiltrations</td><td>${esc(env.infiltrations.etat)}</td><td class="center">${esc(env.infiltrations.deperdition_pct_indicatif)} %</td><td>${esc(env.infiltrations.statut)}</td></tr>
      </tbody>
    </table>
    <p class="tiny">Les pourcentages de déperdition sont indicatifs (ordres de grandeur pédagogiques) et ne remplacent pas un calcul réglementaire.</p>
  `);
  push(`
    <h2>Graphique indicatif des déperditions</h2>
    <div class="chart-bars">
      ${[
        ["Toiture", env.toiture.deperdition_pct_indicatif],
        ["Murs", env.murs.deperdition_pct_indicatif],
        ["Fenêtres", env.fenetres.deperdition_pct_indicatif],
        ["Planchers", env.planchers.deperdition_pct_indicatif],
        ["Ponts", env.ponts_thermiques.deperdition_pct_indicatif],
        ["Infiltrations", env.infiltrations.deperdition_pct_indicatif],
      ]
        .map(
          ([lab, pct]) =>
            `<div class="chart-row"><div>${esc(lab)}</div>${pctBar(pct)}<div class="chart-pct">${esc(pct)} %</div></div>`
        )
        .join("")}
    </div>
    <div class="encadre">
      <p class="small">Schéma pédagogique : prioriser les postes à fort impact (souvent toiture puis murs/menuiseries) avant le dimensionnement des systèmes de chauffage.</p>
    </div>
    ${PEDAGO.isolation}
  `);
  push(`
    <h2>Ventilation, chauffage, ECS, régulation</h2>
    <table class="data">
      <tr><td>Ventilation — type</td><td>${esc(val(e.ventilation.type))}</td></tr>
      <tr><td>Ventilation — état</td><td>${esc(val(e.ventilation.etat))}</td></tr>
      <tr><td>Chauffage — type</td><td>${esc(val(e.chauffage.type))}</td></tr>
      <tr><td>Chauffage — âge</td><td>${esc(val(e.chauffage.age))}</td></tr>
      <tr><td>Chauffage — puissance</td><td>${esc(val(e.chauffage.puissance))}</td></tr>
      <tr><td>ECS</td><td>${esc(val(e.ecs.type))}</td></tr>
      <tr><td>Régulation</td><td>${esc(val(e.regulation.type))}</td></tr>
      <tr><td>Facture / conso avant</td><td>${esc(val(e.consommations_avant.facture_chauffage_ecs_an))}</td></tr>
    </table>
    <p class="muted small">${esc(e.consommations_avant.commentaire)}</p>
    <h3>Qualité d’air</h3>
    <p>Après renforcement de l’étanchéité (menuiseries, isolation), la ventilation doit être adaptée pour préserver la qualité d’air intérieur. Si aucun lot VMC n’est prévu au devis, une étude complémentaire peut être recommandée.</p>
  `);
  // filler diagnostic pages for page count
  for (const block of [
    ["Toiture & combles", PEDAGO.isolation],
    ["Murs — ITE vs ITI", PEDAGO.ite_iti],
    ["Menuiseries existantes", PEDAGO.menuiseries],
    ["Systèmes & trajectoire", PEDAGO.renovation_globale],
  ]) {
    push(`
      <h2>Focus diagnostic — ${esc(block[0])}</h2>
      ${block[1]}
      <div class="encadre encadre-bleu mt">
        <p class="small">Données chiffrées spécifiques au logement : uniquement celles présentes dans le JSON client. Sinon : ${esc(PLACEHOLDER)}.</p>
      </div>
      <h3>Points de contrôle avant chantier</h3>
      <ul class="check-list">
        <li>Visite technique et métrés définitifs</li>
        <li>Photos avant travaux classées</li>
        <li>Fiches techniques produits retenus</li>
        <li>Attestations RGE / assurances à jour</li>
      </ul>
    `);
  }
}

function scenarioCard(sc) {
  return `<div class="scenario-card${sc.recommande ? " recommended" : ""}">
    <div class="head">
      <h3 style="margin:0">${esc(sc.label)}</h3>
      ${sc.recommande ? `<span class="badge badge-vert">Recommandé</span>` : `<span class="badge badge-gris">Alternatif</span>`}
    </div>
    <p><strong>Budget estimatif TTC :</strong> ${esc(moneyOrDash(sc.budget_estimatif_ttc))}</p>
    <p><strong>DPE projeté :</strong> ${esc(val(sc.dpe_projete))} · <strong>Confort :</strong> ${esc(val(sc.niveau_confort))}</p>
    <p><strong>Gains énergétiques :</strong> ${esc(val(sc.gains_energetiques))}</p>
    <h4>Travaux inclus</h4>${list(sc.travaux_inclus)}
    <div class="two-col">
      <div><h4>Avantages</h4>${list(sc.avantages)}</div>
      <div><h4>Limites</h4>${list(sc.limites)}</div>
    </div>
    <p class="tiny mt"><strong>Conditions / hypothèses :</strong> ${esc(sc.conditions)}</p>
  </div>`;
}

function buildScenarios() {
  const sc = data.scenarios;
  push(`
    ${sectionTitle("4", "Scénarios de rénovation")}
    <p class="lead">Trois niveaux de ambition. Le scénario Optimal correspond au programme retenu dans le devis ENERGIA lorsque les montants sont renseignés.</p>
    ${disclaimerAides()}
    ${scenarioCard(sc.essentiel)}
  `);
  push(`
    <h2>Scénario Optimal — recommandé</h2>
    ${scenarioCard(sc.optimal)}
  `);
  push(`
    <h2>Scénario Excellence</h2>
    ${scenarioCard(sc.excellence)}
    <div class="encadre encadre-orange">
      <p class="small">Les scénarios Essentiel et Excellence hors devis signé restent non contractuels. Seul le programme de travaux chiffré dans le JSON / devis fait foi.</p>
    </div>
  `);
  push(`
    <h2>Tableau comparatif des scénarios</h2>
    <table class="data">
      <thead><tr><th>Critère</th><th>Essentiel</th><th>Optimal</th><th>Excellence</th></tr></thead>
      <tbody>
        <tr><td>Recommandé</td><td class="center">${sc.essentiel.recommande ? "Oui" : "—"}</td><td class="center">${sc.optimal.recommande ? "Oui" : "—"}</td><td class="center">${sc.excellence.recommande ? "Oui" : "—"}</td></tr>
        <tr><td>Budget TTC</td><td>${esc(moneyOrDash(sc.essentiel.budget_estimatif_ttc))}</td><td>${esc(moneyOrDash(sc.optimal.budget_estimatif_ttc))}</td><td>${esc(moneyOrDash(sc.excellence.budget_estimatif_ttc))}</td></tr>
        <tr><td>DPE projeté</td><td>${esc(val(sc.essentiel.dpe_projete))}</td><td>${esc(val(sc.optimal.dpe_projete))}</td><td>${esc(val(sc.excellence.dpe_projete))}</td></tr>
        <tr><td>Confort</td><td>${esc(val(sc.essentiel.niveau_confort))}</td><td>${esc(val(sc.optimal.niveau_confort))}</td><td>${esc(val(sc.excellence.niveau_confort))}</td></tr>
      </tbody>
    </table>
    ${PEDAGO.renovation_globale}
  `);
  // pad
  push(`
    <h2>Hypothèses communes aux scénarios</h2>
    <ul>
      <li>Année de référence documentaire : 2026</li>
      <li>Isolation avant chauffage</li>
      <li>Entreprises RGE pour les lots concernés</li>
      <li>Aides toujours indicatives</li>
      <li>MAR hors devis principal</li>
    </ul>
    <div class="encadre encadre-vert">
      <p><strong>Scénario retenu pour la suite du rapport :</strong> ${esc(sc[data.scenario_retenu]?.label || PLACEHOLDER)}</p>
    </div>
  `);
}

function buildProgramme() {
  push(`
    ${sectionTitle("5", "Programme de travaux retenu")}
    <p class="lead">Détail des lots — montants issus du devis lorsque renseignés dans le JSON.</p>
    <table class="data">
      <thead>
        <tr>
          <th>N°</th><th>Désignation</th><th>Entreprise</th><th>TVA</th>
          <th class="num">HT</th><th class="num">TTC</th>
        </tr>
      </thead>
      <tbody>
        ${data.lots
          .map(
            (l) => `<tr>
            <td class="center">${esc(l.n)}</td>
            <td><strong>${esc(l.designation)}</strong><br><span class="tiny">${esc(l.description)}</span></td>
            <td>${esc(val(l.entreprise))}<br><span class="tiny">${esc(val(l.qualification))}</span></td>
            <td class="center">${l.taux_tva != null ? esc(l.taux_tva) + " %" : esc(PLACEHOLDER)}</td>
            <td class="num">${esc(moneyOrDash(l.montant_ht))}</td>
            <td class="num">${esc(moneyOrDash(l.montant_ttc))}</td>
          </tr>`
          )
          .join("")}
        <tr class="total">
          <td colspan="4">TOTAL</td>
          <td class="num">${esc(moneyOrDash(data.budget.total_ht))}</td>
          <td class="num">${esc(moneyOrDash(data.budget.total_ttc))}</td>
        </tr>
      </tbody>
    </table>
  `);
  push(`
    <h2>Ventilation TVA</h2>
    <table class="data">
      <thead><tr><th>Taux</th><th>Lots</th><th class="num">Base HT</th><th class="num">TVA</th><th class="num">TTC</th></tr></thead>
      <tbody>
        ${(data.budget.ventilation_tva || [])
          .map(
            (v) => `<tr>
            <td>${esc(v.taux)} %</td>
            <td>${esc(v.lots)}</td>
            <td class="num">${esc(moneyOrDash(v.base_ht))}</td>
            <td class="num">${esc(moneyOrDash(v.tva))}</td>
            <td class="num">${esc(moneyOrDash(v.ttc))}</td>
          </tr>`
          )
          .join("") || `<tr><td colspan="5">${esc(PLACEHOLDER)}</td></tr>`}
        <tr class="total">
          <td colspan="2">TOTAL</td>
          <td class="num">${esc(moneyOrDash(data.budget.total_ht))}</td>
          <td class="num">${esc(moneyOrDash(data.budget.total_tva))}</td>
          <td class="num">${esc(moneyOrDash(data.budget.total_ttc))}</td>
        </tr>
      </tbody>
    </table>
    <div class="encadre encadre-vert">
      <p><strong>Total TTC marché :</strong> ${esc(moneyOrDash(data.budget.total_ttc))}</p>
      <p class="small">${esc(data.budget.mar_precision)}</p>
    </div>
  `);
  push(`
    <h2>Métrés, performances, dépendances</h2>
    <table class="data">
      <thead><tr><th>Lot</th><th>Métrés</th><th>Matériaux</th><th>Performance cible</th><th>Ordre</th></tr></thead>
      <tbody>
        ${data.lots
          .map(
            (l) => `<tr>
            <td>${esc(l.n)}. ${esc(l.designation)}</td>
            <td>${esc(val(l.metres))}</td>
            <td>${esc(val(l.materiaux))}</td>
            <td>${esc(val(l.performance_cible))}</td>
            <td class="center">${esc(l.ordre_execution)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <p><strong>Ordre d’exécution :</strong> ${esc(data.ordre_execution_resume)}</p>
  `);
  push(`
    <h2>Réserves à lever avant chantier</h2>
    <ul class="check-list">
      ${data.lots
        .flatMap((l) => (l.reserves || []).map((r) => `<li>Lot ${esc(l.n)} — ${esc(r)}</li>`))
        .join("") || `<li>${esc(PLACEHOLDER)}</li>`}
      <li>Attestations RGE et assurances à vérifier pour chaque entreprise</li>
      <li>Validation administrative avant démarrage (selon parcours aides choisi)</li>
      <li>Statut acompte 30 % : actuellement <span class="statut-encours">EN COURS</span></li>
    </ul>
    <h3>Dépendances techniques</h3>
    ${list(data.lots.filter((l) => l.dependances?.length).map((l) => `Lot ${l.n} : ${(l.dependances || []).join(", ")}`))}
  `);
}

function focusPage(title, html, lotHint) {
  push(`
    <h2>${esc(title)}</h2>
    ${html}
    ${lotHint ? `<div class="encadre mt"><p class="small"><strong>Lien programme :</strong> ${esc(lotHint)}</p></div>` : ""}
    <h4>Contrôles types à réception</h4>
    <ul class="check-list">
      <li>Conformité au devis et aux fiches techniques</li>
      <li>Photos avant / pendant / après</li>
      <li>Essais de fonctionnement si équipement</li>
      <li>Propreté de zone et documents remis</li>
    </ul>
  `);
}

function buildFocus() {
  push(`
    ${sectionTitle("6", "Focus technique par poste")}
    <p class="lead">Fiches pédagogiques pour chaque poste concerné par le projet. Les performances chiffrées hors JSON restent « ${esc(PLACEHOLDER)} ».</p>
    ${PEDAGO.renovation_globale}
  `);

  const lotsByFocus = Object.fromEntries(
    (data.lots || []).map((l) => [l.focus_cle, `Lot ${l.n} — ${l.designation} — ${moneyOrDash(l.montant_ttc)} TTC`])
  );

  const actifs = new Set(data.focus_actifs || []);

  if (actifs.has("securisation")) {
    focusPage(
      "Sécurisation et mise en place chantier",
      `<p>Préparer le site, protéger les zones, organiser les accès et la gestion des déchets. Lot organisationnel indispensable avant les travaux de toiture.</p>
       <ul><li>Protections et balisage</li><li>Benne / évacuation</li><li>Accès artisans</li></ul>`,
      lotsByFocus.securisation
    );
  }
  if (actifs.has("isolation_toiture")) {
    focusPage("Isolation de toiture / rampants", PEDAGO.isolation, lotsByFocus.isolation_toiture);
    focusPage(
      "Isolation — points de vigilance bâti ancien",
      `<p>Sur pierre ancienne : continuité d’isolation, gestion de la vapeur d’eau, traitement des points singuliers (rives, noues, pénétrations).</p>
       <p>Résistance thermique cible : ${esc(PLACEHOLDER)} si non renseignée dans les fiches jointes.</p>`,
      lotsByFocus.isolation_toiture
    );
  }
  if (actifs.has("couverture")) {
    focusPage("Couverture", PEDAGO.couverture_zinguerie, lotsByFocus.couverture);
  }
  if (actifs.has("zinguerie")) {
    focusPage(
      "Zinguerie",
      `<p>Zinc, naissances, fonds de chenaux et étanchéité des évacuations. Contrôle des pentes et absence de fuite après pluie.</p>`,
      lotsByFocus.zinguerie
    );
  }
  if (actifs.has("menuiseries")) {
    focusPage("Menuiseries", PEDAGO.menuiseries, lotsByFocus.menuiseries);
    focusPage(
      "Menuiseries — pose et étanchéité",
      `<p>La performance dépend autant de la pose que du produit. Contrôler ouverture/fermeture, joints, finitions intérieures et extérieures.</p>`,
      lotsByFocus.menuiseries
    );
  }
  if (actifs.has("pac")) {
    focusPage("Pompe à chaleur air/air", PEDAGO.pac, lotsByFocus.pac);
    focusPage(
      "PAC — mise en service",
      `<p>Emplacements des unités, essais, paramétrage, remise des notices et explication d’usage au client font partie de la réception du lot.</p>`,
      lotsByFocus.pac
    );
  }
  if (actifs.has("cet")) {
    focusPage("Chauffe-eau thermodynamique", PEDAGO.cet, lotsByFocus.cet);
  }
  if (data.ventilation_concernee) {
    focusPage(
      "Ventilation",
      `<p>Lot ventilation concerné : détails dans le JSON. Sinon étude complémentaire recommandée après renforcement de l’étanchéité.</p>`,
      null
    );
  } else {
    focusPage(
      "Ventilation — hors périmètre actuel",
      `<p>Aucun lot ventilation n’est inclus dans le programme retenu. Après travaux d’enveloppe, une vérification de la qualité d’air / besoin VMC peut être pertinente.</p>
       <p>Statut : ${esc(PLACEHOLDER)} pour type et dimensionnement.</p>`,
      null
    );
  }
  if (data.option_photovoltaique?.concerne) {
    focusPage("Photovoltaïque", PEDAGO.photovoltaique, moneyOrDash(data.option_photovoltaique.montant));
  } else {
    focusPage(
      "Photovoltaïque — option hors devis",
      `${PEDAGO.photovoltaique}<p><strong>Statut :</strong> ${esc(val(data.option_photovoltaique?.statut))}</p>`,
      null
    );
  }
  if (actifs.has("coordination")) {
    focusPage("Coordination générale et réception", PEDAGO.coordination, lotsByFocus.coordination);
  }
  // pedagogical extras to reach length
  focusPage("Rappel ordre optimal des travaux", `
    <ol>
      <li>Isolation combles / toiture</li>
      <li>Isolation murs</li>
      <li>Isolation planchers</li>
      <li>Fenêtres</li>
      <li>VMC</li>
      <li>PAC</li>
      <li>Ballon thermodynamique</li>
      <li>Photovoltaïque</li>
    </ol>
    <p>Dans ce dossier, l’ordre contractuel retenu est : ${esc(data.ordre_execution_resume)}.</p>
  `);
  focusPage("ITE vs ITI — complément", PEDAGO.ite_iti);
  focusPage("Équipements complémentaires", `
    <p>Selon les besoins : régulation fine, radiateurs, amélioration ponts thermiques, VMC, stockage PV. Toute option doit faire l’objet d’un chiffrage distinct.</p>
    ${PEDAGO.cet}
  `);
}

function buildAides() {
  push(`
    ${sectionTitle("7", "Aides financières et financement")}
    ${PEDAGO.aides}
    ${disclaimerAides()}
  `);
  push(`
    <h2>Tableau des aides estimatives</h2>
    <table class="data">
      <thead><tr><th>Dispositif</th><th>Montant</th><th>Statut</th><th>Conditions</th></tr></thead>
      <tbody>
        ${data.aides.lignes
          .map(
            (a) => `<tr>
            <td>${esc(a.libelle)}</td>
            <td class="num">${esc(a.affichage || moneyOrDash(a.montant))}</td>
            <td><span class="badge badge-orange">${esc(a.statut)}</span></td>
            <td class="small">${esc(a.conditions)}</td>
          </tr>`
          )
          .join("")}
        <tr class="total"><td>Total estimé</td><td class="num" colspan="3">${esc(val(data.aides.total_affichage))}</td></tr>
      </tbody>
    </table>
    <div class="encadre encadre-orange">
      <p><strong>Important :</strong> les aides ne sont pas déduites du devis sauf mention contractuelle explicite. Elles sont versées au client selon les conditions applicables.</p>
    </div>
  `);
  push(`
    <h2>MaPrimeRénov’ — lecture pédagogique</h2>
    <p>Le parcours dépend du profil de ressources, du type de travaux et du gain de classes. Aucun barème chiffré n’est reproduit ici sans source validée dans le fichier client.</p>
    <p>Profil estimé dans ce dossier : <strong>${esc(val(data.profil_aides.profil_mpr_estime))}</strong>.</p>
    <h3>CEE</h3>
    <p>Montants variables selon fiches et obligés — toujours en estimation.</p>
    <h3>Éco-PTZ & financement</h3>
    <p>Courtier : ${esc(data.contacts.courtier.nom)} — ${esc(data.contacts.courtier.entite)} — ${esc(data.contacts.courtier.telephone)}.</p>
    <p>Acceptation et conditions : ${esc(PLACEHOLDER)} jusqu’à instruction bancaire.</p>
  `);
  push(`
    <h2>Checklist des justificatifs à réunir</h2>
    <ul class="check-list">
      ${data.aides.checklist_justificatifs.map((j) => `<li>${esc(j)}</li>`).join("")}
    </ul>
    <div class="encadre mt">
      <p class="small">Sans justificatifs complets, aucune estimation d’aide ne peut être consolidée. Le rapport n’attribue aucune aide.</p>
    </div>
  `);
  push(`
    <h2>Financement & échéancier travaux</h2>
    <p>${esc(data.paiements.mode)}</p>
    <table class="data">
      <thead><tr><th>Échéance</th><th>Condition</th><th class="num">Montant TTC</th><th>Statut</th></tr></thead>
      <tbody>
        ${data.paiements.echeances
          .map(
            (e) => `<tr>
            <td>${esc(e.libelle)}</td>
            <td>${esc(e.condition)}</td>
            <td class="num">${esc(moneyOrDash(e.montant_ttc))}</td>
            <td>${e.statut === "EN COURS" ? `<span class="statut-encours">EN COURS</span>` : esc(e.statut)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <p class="tiny">Base TTC : ${esc(moneyOrDash(data.paiements.base_ttc))}</p>
  `);
  // pad aides
  for (let i = 0; i < 2; i++) {
    push(`
      <h2>Points de vigilance aides (${i + 1}/2)</h2>
      <ul>
        <li>Ne pas démarrer certains parcours avant accord écrit des organismes lorsque requis</li>
        <li>Conserver devis, factures, attestations RGE et photos</li>
        <li>MAR : prestation séparée — coordination avec le parcours ANAH</li>
        <li>Écart éventuel estimation / validation : hors invention de clause nouvelle dans ce rapport</li>
      </ul>
      ${disclaimerAides()}
      ${disclaimerGeneral()}
    `);
  }
}

function buildPlanning() {
  const pl = data.planning;
  push(`
    ${sectionTitle("8", "Planning de réalisation")}
    <p><strong>Durée indicative chantier :</strong> ${esc(pl.duree_chantier_indicative)}</p>
    <h3>Étapes avant chantier</h3>
    <div class="timeline">
      ${pl.avant_chantier
        .map(
          (e) => `<div class="item"><div class="when">${esc(e.delai_indicatif)}</div><div class="what">${esc(e.etape)}</div></div>`
        )
        .join("")}
    </div>
  `);
  push(`
    <h2>Planning travaux — semaine par semaine</h2>
    <table class="data">
      <thead><tr><th>Période</th><th>Phase</th><th>Détail</th></tr></thead>
      <tbody>
        ${pl.semaines
          .map(
            (s) => `<tr><td>${esc(s.periode)}</td><td>${esc(s.libelle)}</td><td>${esc(s.detail)}</td></tr>`
          )
          .join("")}
      </tbody>
    </table>
    <h3>Réception</h3>
    <p>${esc(pl.reception)}</p>
  `);
  push(`
    <h2>Aléas possibles</h2>
    ${list(pl.aleas_possibles)}
    <div class="encadre encadre-bleu">
      <p class="small">Planning prévisionnel non contractuel quant aux dates calendaires exactes. Les délais administratifs (aides) peuvent décaler le démarrage.</p>
    </div>
    <h3>Jalons de validation</h3>
    <ul>
      <li>Démarrage après validation administrative écrite le cas échéant</li>
      <li>Mi-chantier : validation Sylvain LEMBELEMBE avant échéance 40 %</li>
      <li>Réception : PV signé avant échéance 30 %</li>
    </ul>
  `);
}

function buildEntreprises() {
  push(`
    ${sectionTitle("9", "Entreprises, RGE et assurances")}
    <p class="lead">Tableau des sous-traitants. Toute date ou attestation non vérifiée doit être contrôlée avant ouverture de chantier.</p>
    <table class="data">
      <thead>
        <tr><th>Lots</th><th>Entreprise / SIRET</th><th>Qualification RGE</th><th>Assurance</th><th>Document à vérifier</th></tr>
      </thead>
      <tbody>
        ${data.entreprises
          .map(
            (e) => `<tr>
            <td>${esc(e.lots)}</td>
            <td><strong>${esc(e.entreprise)}</strong> (${esc(val(e.forme))})<br>
              <span class="tiny">${esc(val(e.adresse))}</span><br>
              SIRET ${esc(val(e.siret))}
            </td>
            <td>${esc(val(e.qualification_rge))}<br><span class="tiny">${esc(val(e.qualification_validite))}</span></td>
            <td>${esc(val(e.assurance))}<br><span class="tiny">${esc(val(e.assurance_validite))}</span></td>
            <td class="small">${esc(val(e.document_a_verifier))}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
  `);
  push(`
    <h2>Contrôle avant ouverture de chantier</h2>
    <ul class="check-list">
      <li>Attestation RGE en cours de validité pour chaque lot concerné</li>
      <li>Attestation d’assurance RC / décennale à jour</li>
      <li>SIRET et raison sociale conformes au devis</li>
      <li>Périmètre de qualification aligné avec le lot</li>
      <li>Documents classés dans le dossier client</li>
    </ul>
    <p class="mt">Coordination : ${esc(data.contacts.amo.nom)} — ${esc(data.contacts.amo.telephone)}</p>
  `);
}

function buildConditions() {
  push(`
    ${sectionTitle("10", "Conditions commerciales et contractuelles")}
    <p class="small muted">Source : ${esc(data.conditions_commerciales.source)}</p>
    <div class="encadre encadre-orange">
      <p class="small">Aucune formulation juridique nouvelle n’est créée dans ce rapport. Reprise exclusive d’éléments validés du modèle de devis.</p>
    </div>
    <ol>
      ${data.conditions_commerciales.points.map((p) => `<li>${esc(p)}</li>`).join("")}
    </ol>
  `);
  push(`
    <h2>Échéancier 30 % / 40 % / 30 %</h2>
    <table class="data">
      <thead><tr><th>Échéance</th><th>Condition</th><th class="num">Montant</th><th>Statut</th></tr></thead>
      <tbody>
        ${data.paiements.echeances
          .map(
            (e) => `<tr>
            <td>${esc(e.libelle)}</td>
            <td>${esc(e.condition)}</td>
            <td class="num">${esc(moneyOrDash(e.montant_ttc))}</td>
            <td>${e.statut === "EN COURS" ? `<span class="statut-encours">EN COURS</span>` : esc(e.statut)}</td>
          </tr>`
          )
          .join("")}
      </tbody>
    </table>
    <h3>Sous-traitance & avenants</h3>
    <p>Sous-traitance acceptée par le client. Travaux supplémentaires uniquement par avenant signé.</p>
    <h3>Garanties & médiation</h3>
    <p>Garanties légales applicables (décennale, biennale, parfait achèvement). Litiges : tentative amiable puis tribunaux de Lyon (selon devis).</p>
  `);
  push(`
    <h2>Droit de rétractation & réclamations</h2>
    <p>Le droit de rétractation s’apprécie selon le mode de conclusion du contrat (distance, démarchage, etc.). Se référer au devis / conditions signées.</p>
    <p>Réclamations : ${esc(data.entreprise.email)} — ${esc(data.entreprise.telephone)}</p>
    ${disclaimerGeneral()}
  `);
}

function buildAnnexes() {
  push(`
    ${sectionTitle("11", "Annexes")}
    <h3>A. Devis détaillé</h3>
    <p>${esc(data.annexes.devis_detaille)}</p>
    <p>Récapitulatif TTC : <strong>${esc(moneyOrDash(data.budget.total_ttc))}</strong></p>
    <h3>B. Fiches techniques équipements</h3>
    <p>${esc(data.annexes.fiches_techniques)}</p>
    <h3>C. Attestations RGE et assurances</h3>
    <p>${esc(data.annexes.attestations_rge_assurances)}</p>
    <h3>D. Photos avant travaux</h3>
    <p>${esc(data.annexes.photos_avant)}</p>
  `);
  push(`
    <h2>Annexe E — Checklist client</h2>
    <ul class="check-list">
      ${data.aides.checklist_justificatifs.map((j) => `<li>${esc(j)}</li>`).join("")}
      <li>Valider le scénario Optimal</li>
      <li>Suivre le statut acompte 30 % (EN COURS)</li>
      <li>Planifier la visite technique</li>
    </ul>
  `);
  push(`
    <h2>Annexe F — Glossaire rénovation énergétique</h2>
    <table class="data">
      <thead><tr><th>Terme</th><th>Définition</th></tr></thead>
      <tbody>
        ${PEDAGO.glossaire.map((g) => `<tr><td><strong>${esc(g.t)}</strong></td><td>${esc(g.d)}</td></tr>`).join("")}
      </tbody>
    </table>
  `);
  // FAQ split on 2 pages
  const faq1 = PEDAGO.faq.slice(0, 4);
  const faq2 = PEDAGO.faq.slice(4);
  push(`
    <h2>Annexe G — Questions fréquentes (1/2)</h2>
    ${faq1.map((f) => `<h4>${esc(f.q)}</h4><p>${esc(f.a)}</p>`).join("")}
  `);
  push(`
    <h2>Annexe G — Questions fréquentes (2/2)</h2>
    ${faq2.map((f) => `<h4>${esc(f.q)}</h4><p>${esc(f.a)}</p>`).join("")}
  `);
  // Extra annex pages for volume
  for (let i = 1; i <= 8; i++) {
    push(`
      <h2>Annexe H — Cahier de suivi (${i}/8)</h2>
      <p class="lead">Pages réservées au suivi chantier et à l’ajout de pièces (photos, PV, factures).</p>
      <div class="photo-grid">
        <div class="photo-slot">Emplacement document / photo<br><em>À compléter</em></div>
        <div class="photo-slot">Emplacement document / photo<br><em>À compléter</em></div>
      </div>
      <table class="data">
        <thead><tr><th>Date</th><th>Événement</th><th>Visa</th></tr></thead>
        <tbody>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
          <tr><td>&nbsp;</td><td></td><td></td></tr>
        </tbody>
      </table>
      <p class="tiny">Ne pas inventer de données : coller uniquement les pièces réelles du dossier.</p>
    `);
  }
}

function buildNextSteps() {
  push(`
    ${sectionTitle("12", "Prochaines étapes")}
    <div class="encadre encadre-nuit">
      <h3 style="color:#5eead4;margin-top:0">Votre feuille de route</h3>
      <ol style="margin-left:5mm">
        ${data.annexes.prochaines_etapes.map((e) => `<li style="margin:2mm 0">${esc(e)}</li>`).join("")}
      </ol>
    </div>
    <h3>Contacts</h3>
    <p><strong>${esc(data.contacts.amo.nom)}</strong> — ${esc(data.contacts.amo.telephone)} — ${esc(data.contacts.amo.email)}</p>
    <p><strong>${esc(data.contacts.commercial.nom)}</strong> — ${esc(data.contacts.commercial.telephone)}</p>
    <p><strong>${esc(data.contacts.courtier.nom)}</strong> (${esc(data.contacts.courtier.entite)}) — ${esc(data.contacts.courtier.telephone)}</p>
    <p><strong>${esc(data.contacts.juriste.nom)}</strong> — Juriste</p>
    <p><strong>${esc(data.contacts.mar.nom)}</strong> — ${esc(data.contacts.mar.entite)}</p>
    ${disclaimerGeneral()}
    ${disclaimerAides()}
    <p class="ac mt" style="margin-top:10mm"><strong>ENERGIA CONSEIL IA®</strong><br>
    ${esc(data.entreprise.adresse)} · SIRET ${esc(data.entreprise.siret)}<br>
    <span class="tiny">Généré par Limova · ${esc(data.meta.reference_dossier)}</span></p>
  `);
}

function padToTarget() {
  while (pageNum < PAGES_TOTALES) {
    const remaining = PAGES_TOTALES - pageNum;
    push(`
      <h2>Page de consolidation documentaire</h2>
      <p class="lead">Espace réservé pour pièces complémentaires du dossier ${esc(data.meta.reference_dossier)}.</p>
      <div class="photo-slot" style="min-height:120mm">
        Emplacement libre — attestation, photo, plan, PV ou fiche technique<br>
        <em>Aucune donnée inventée · ${esc(PLACEHOLDER)}</em><br>
        <span class="tiny">Pages restantes avant clôture : ${remaining - 1}</span>
      </div>
      <p class="tiny mt">Cette page garantit une pagination stable Page X / ${PAGES_TOTALES} pour impression PDF A4.</p>
    `);
  }
}

function buildAll() {
  pageNum = 0;
  pages = [];
  buildCover();
  buildDisclaimerPages();
  buildToc();
  buildSynthese();
  buildProfil();
  buildDiagnostic();
  buildScenarios();
  buildProgramme();
  buildFocus();
  buildAides();
  buildPlanning();
  buildEntreprises();
  buildConditions();
  buildAnnexes();
  buildNextSteps();
  padToTarget();
  // If somehow over, trim is not needed — pad only adds. If over 85, still OK to show actual count in footer... 
  // User asked Page X / 85 fixed. So if we exceed, we should stop earlier.
  if (pageNum > PAGES_TOTALES) {
    pages = pages.slice(0, PAGES_TOTALES);
    pageNum = PAGES_TOTALES;
  }
}

export async function renderRapport(rootEl, statusEl) {
  const mode = getQueryParam("mode", "royer");
  const custom = getQueryParam("data", "");
  let path = "data/rapport-client-royer.json";
  if (mode === "demo") path = "data/rapport-client-demo.json";
  if (custom) path = custom;

  // LocalStorage override from parametrage
  const stored = localStorage.getItem("energia_rapport_data");
  if (getQueryParam("from") === "param" && stored) {
    data = JSON.parse(stored);
  } else {
    data = await loadJson(path);
  }

  if (statusEl) {
    statusEl.textContent = `${data.meta.demo ? "DEMO · " : ""}${data.meta.reference_dossier} · ${data.client.nom_complet}`;
  }

  buildAll();
  rootEl.innerHTML = pages.join("\n");
  document.title = `Rapport ${data.meta.reference_dossier} — ENERGIA CONSEIL IA®`;
  return data;
}

export function printRapport() {
  window.print();
}
