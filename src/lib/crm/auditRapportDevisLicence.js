/**
 * Audit, rapport et devis sous licence de marque — 5 à 7 pages A4.
 * Impression HTML : aperçu navigateur, puis Enregistrer en PDF.
 */

import {
  AIDES_PEREIRA_VIOLET,
  CLIENT_PEREIRA_NERVIEUX,
  PAIRES_PHOTOS_CONTRAT_PEREIRA,
  TOTAUX_PEREIRA_NERVIEUX,
} from "./pereiraNervieuxOfficiel.js";
import { TOTAUX_BRUNEL_V4 } from "./brunelDevisV3Officiel.js";
import { LOGO_ENERGIA_DATA_URI } from "./logoEnergiaDataUri.js";
import {
  IDENTITE_LEGALE,
  MENTION_PROPRIETE_INTELLECTUELLE,
} from "../branding.ts";
import { totauxTravaux } from "./editionDossier.js";

const DEPERDITIONS = [
  { label: "Toiture / combles", part: 30, couleur: "#b91c1c" },
  { label: "Murs / façades", part: 25, couleur: "#ea580c" },
  { label: "Menuiseries", part: 15, couleur: "#d97706" },
  { label: "Ventilation / air", part: 12, couleur: "#0284c7" },
  { label: "Plancher bas", part: 10, couleur: "#0f766e" },
  { label: "Ponts thermiques", part: 8, couleur: "#64748b" },
];

const CLASSES_DPE = [
  { lettre: "A", fond: "#009c6d" },
  { lettre: "B", fond: "#52b153" },
  { lettre: "C", fond: "#c3d200" },
  { lettre: "D", fond: "#f5e900" },
  { lettre: "E", fond: "#f0b50f" },
  { lettre: "F", fond: "#eb8235" },
  { lettre: "G", fond: "#d7221f" },
];

function echap(valeur) {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function euro(montant) {
  if (montant == null || montant === "") return "À confirmer";
  const n = Number(montant);
  if (!Number.isFinite(n)) return "À confirmer";
  return `${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`;
}

function estPereira(dossier) {
  const id = String(dossier?.id || "");
  const nom = String(dossier?.nom || "");
  return id.includes("pereira") || /pereira/i.test(nom);
}

function estContratPereira(dossier) {
  return String(dossier?.id || "") === "projet-manuel-pereira-nervieux";
}

function estBrunel(dossier) {
  const id = String(dossier?.id || "");
  const nom = String(dossier?.nom || "");
  return id.includes("brunel") || /brunel/i.test(nom);
}

function lignesTravaux(dossier, edition) {
  const editionLignes = Array.isArray(edition?.travaux) ? edition.travaux : [];
  if (editionLignes.length) return editionLignes;
  return Array.isArray(dossier?.travaux) ? dossier.travaux : [];
}

function libelleLigne(ligne) {
  return String(ligne?.nom || ligne?.label || ligne?.designation || "").trim();
}

function conseiller(dossier) {
  const equipe = dossier?.equipe || {};
  const apporteur = String(dossier?.apporteurNom || dossier?.apporteur?.nom || "");
  if (equipe.designAgencement || /catarina/i.test(apporteur)) return "Catarina Martins";
  if (equipe.commercial || equipe.commercialApporteur || /damien/i.test(apporteur)) return "Damien";
  if (dossier?.pilotage?.intervenant) return dossier.pilotage.intervenant;
  return "Sylvain LEMBELEMBE";
}

function dateReleve(dossier) {
  const brut = dossier?.dateReleve || dossier?.date || dossier?.createdAt;
  if (!brut) return new Date().toLocaleDateString("fr-FR");
  const date = new Date(brut);
  if (Number.isNaN(date.getTime())) return String(brut);
  return date.toLocaleDateString("fr-FR");
}

function adresseBien(dossier) {
  return (
    dossier?.adresse ||
    dossier?.workingBase?.client?.adresse ||
    [dossier?.ville, dossier?.codePostal].filter(Boolean).join(" ") ||
    "Adresse à confirmer au relevé"
  );
}

function photoSlot(galerie, ids) {
  const liste = Array.isArray(galerie) ? galerie : [];
  return liste.find((photo) => ids.includes(String(photo?.id || ""))) || null;
}

function photosDocument(dossier, galerie) {
  const facadeTerrain = photoSlot(galerie, ["facade", "pignons"]);
  const chauffageTerrain = photoSlot(galerie, ["chauffage"]);
  const comblesTerrain = photoSlot(galerie, ["toiture", "combles"]);
  const tableauTerrain = photoSlot(galerie, ["tableau", "compteur"]);
  if (String(dossier?.id || "").includes("brunel") || /brunel/i.test(String(dossier?.nom || ""))) {
    return {
      facade: facadeTerrain?.src || "/images/brunel/facade-brunel.jpg",
      chauffage: chauffageTerrain?.src || "",
      combles: comblesTerrain?.src || "",
      tableau: tableauTerrain?.src || "",
      apresFacade: "",
      apresChauffage: "",
      source: facadeTerrain ? "Relevé terrain" : "Photo façade du dossier Brunel",
    };
  }
  if (estPereira(dossier)) {
    const paires = PAIRES_PHOTOS_CONTRAT_PEREIRA;
    return {
      facade: facadeTerrain?.src || paires[0].avantSrc,
      chauffage: chauffageTerrain?.src || paires[1].avantSrc,
      combles: comblesTerrain?.src || paires[2].avantSrc,
      tableau: tableauTerrain?.src || paires[3].avantSrc,
      apresFacade: paires[0].apresSrc,
      apresChauffage: paires[1].apresSrc,
      source: facadeTerrain ? "Relevé terrain" : "Visite officielle Pereira",
    };
  }
  return {
    facade: facadeTerrain?.src || "",
    chauffage: chauffageTerrain?.src || "",
    combles: comblesTerrain?.src || "",
    tableau: tableauTerrain?.src || "",
    apresFacade: "",
    apresChauffage: "",
    source: facadeTerrain ? "Relevé terrain" : "",
  };
}

function diagnostic(dossier, edition) {
  if (estPereira(dossier)) {
    const c = CLIENT_PEREIRA_NERVIEUX;
    return {
      dpeActuel: c.dpeActuel,
      cepActuel: c.cepInitial,
      dpeCible: c.dpeCible,
      cepCible: c.cepCible,
      gainPct: c.gainEpPct,
      factureMin: c.factureAvantMin,
      factureMax: c.factureAvantMax,
    };
  }
  const valo = edition?.valorisation || {};
  const actuel = String(valo.dpeActuel || dossier?.dpeActuel || "").toUpperCase();
  const cible = String(valo.dpeCible || dossier?.dpeCible || "").toUpperCase();
  return {
    dpeActuel: actuel || "—",
    cepActuel: Number(dossier?.cepActuel) || null,
    dpeCible: cible || "—",
    cepCible: Number(dossier?.cepCible) || null,
    gainPct: Number(dossier?.gainEpPct) || null,
    factureMin: Number(dossier?.factureAvantMin) || null,
    factureMax: Number(dossier?.factureAvantMax) || null,
  };
}

function finance(dossier, edition, diag) {
  if (estContratPereira(dossier)) {
    const a = AIDES_PEREIRA_VIOLET;
    const t = TOTAUX_PEREIRA_NERVIEUX;
    const facture = (diag.factureMin + diag.factureMax) / 2;
    const economie = Math.round(facture * (diag.gainPct / 100));
    return {
      ht: t.totalHt,
      ttc: t.totalTtc,
      mpr: a.mpr + a.mar,
      cee: a.cee,
      solaire: 0,
      aides: a.totalAides,
      rac: a.resteACharge,
      mensualite: a.mensualite20,
      economie,
      libelleMpr: a.libelleMpr,
      locales: 0,
      phraseMensualite: "",
    };
  }
  if (estBrunel(dossier)) {
    const t = TOTAUX_BRUNEL_V4;
    const mpr = 21445;
    const cee = 4875;
    const locales = 1500;
    const aides = mpr + cee + locales;
    const rac = Math.round(t.totalTtc - aides);
    return {
      ht: t.totalHt,
      ttc: t.totalTtc,
      mpr,
      cee,
      solaire: 0,
      locales,
      aides,
      rac,
      mensualite: 39,
      economie: 0,
      libelleMpr: "MaPrimeRénov’ 2026 — parcours accompagné",
      phraseMensualite:
        "Soit 39 € / mois, simulation indicative amortie par les économies d'énergie.",
    };
  }
  const lignes = lignesTravaux(dossier, edition);
  let ht = lignes.reduce((somme, ligne) => somme + Number(ligne.totalHt ?? ligne.ht ?? 0), 0);
  let ttc = Number(dossier?.totaux?.ttc || dossier?.montantEstimeTtc || dossier?.caTtc || 0);
  if (edition?.travaux?.length) {
    const totaux = totauxTravaux(edition.travaux);
    if (totaux?.totalTtc) {
      ht = totaux.totalHt;
      ttc = totaux.totalTtc;
    }
  }
  if (!ttc && ht) ttc = Math.round(ht * 1.055);
  const overrides = edition?.aides?.overrides || {};
  const nombreOuNull = (valeur) => (valeur == null || valeur === "" ? null : Number(valeur));
  const mpr = nombreOuNull(overrides.mpr);
  const cee = nombreOuNull(overrides.cee);
  const solaire = null;
  const aidesConnues = [mpr, cee, nombreOuNull(overrides.locales), nombreOuNull(overrides.coupDePouce)].filter(
    (valeur) => Number.isFinite(valeur),
  );
  const aides = aidesConnues.length ? aidesConnues.reduce((somme, valeur) => somme + valeur, 0) : null;
  const rac = ttc && aides != null ? Math.max(0, ttc - aides) : ttc ? null : null;
  const economie = diag.gainPct && diag.factureMin ? Math.round(((diag.factureMin + (diag.factureMax || diag.factureMin)) / 2) * (diag.gainPct / 100)) : 0;
  const duree = Number(edition?.financement?.ecoPtzDuree) || 20;
  const mensualite = rac ? Math.round((rac / (duree * 12)) * 100) / 100 : 0;
  return {
    ht: ht || null,
    ttc: ttc || null,
    mpr,
    cee,
    solaire,
    locales: nombreOuNull(overrides.locales),
    aides,
    rac: ttc ? rac : null,
    mensualite,
    economie,
    libelleMpr: "MaPrimeRénov’ 2026 — parcours accompagné, à instruire",
    phraseMensualite: "",
  };
}

function ficheDepuisLibelle(texte) {
  const t = texte.toLowerCase();
  if (/powerwall|tesla|solaire|photovolta|kwhc|kwc/.test(t)) {
    return {
      titre: "Équipement solaire hybride & stockage",
      lignes: [
        "Puissance à confirmer au calepinage toiture.",
        "Stockage Tesla Powerwall 3 : 13,5 kWh, si le poste est retenu.",
        "Secours des circuits prioritaires après mise en service.",
      ],
    };
  }
  if (/air\s*\/\s*air|splits?/.test(t)) {
    return {
      titre: "Pompe à chaleur air/air",
      lignes: [texte, "Unités pièce par pièce. COP selon la fiche matériel retenue."],
    };
  }
  if (/pac|pompe à chaleur|pompe a chaleur|chaudière|chaudiere/.test(t)) {
    return {
      titre: "Pompe à chaleur air/eau",
      lignes: [
        texte,
        "Dimensionnement après isolation. COP cible ≥ 4.",
        "Marque premium de type Daikin ou Mitsubishi, à l’appel d’offres RGE.",
      ],
    };
  }
  if (/ite|extérieur|exterieur|façade|facade|iti|mur/.test(t)) {
    return {
      titre: "Isolation des murs",
      lignes: [texte, "Résistance thermique visée R ≥ 3,7, à confirmer selon le complexe retenu."],
    };
  }
  if (/comble|toiture|rampant/.test(t)) {
    return {
      titre: "Isolation de toiture",
      lignes: [texte, "Combles : R ≥ 7 visé."],
    };
  }
  if (/plancher|cave/.test(t)) {
    return { titre: "Isolation du plancher bas", lignes: [texte, "R ≥ 3 visé."] };
  }
  if (/fenêtre|fenetre|menuiser|baie/.test(t)) {
    return { titre: "Menuiseries", lignes: [texte, "Uw ≤ 1,3 visé, pose après l’isolation des murs."] };
  }
  if (/vmc|thermostat|régulation|regulation/.test(t)) {
    return { titre: "Ventilation et régulation", lignes: [texte, "Régulation pièce par pièce si le poste est au marché."] };
  }
  if (/ballon|ecs|thermodynamique/.test(t)) {
    return { titre: "Eau chaude", lignes: [texte] };
  }
  if (/administratif|clyve|coordination|contractant/.test(t)) return null;
  return { titre: texte, lignes: ["Poste retenu pour ce bien."] };
}

function bouquet(dossier, edition) {
  const vus = new Set();
  const fiches = [];
  for (const ligne of lignesTravaux(dossier, edition)) {
    const libelle = libelleLigne(ligne);
    if (!libelle) continue;
    const fiche = ficheDepuisLibelle(libelle);
    if (!fiche || vus.has(fiche.titre)) continue;
    vus.add(fiche.titre);
    fiches.push(fiche);
  }
  return fiches;
}

function jauge(lettre, cep) {
  const actif = String(lettre || "—").toUpperCase();
  const ton = actif === "F" || actif === "G" ? " dpe-rouge" : actif === "A" || actif === "B" ? " dpe-vert" : "";
  const pastilles = CLASSES_DPE.map((classe) => {
    const on = classe.lettre === actif;
    return `<span class="dpe${on ? ` dpe-on${ton}` : ""}" style="background:${classe.fond}">${classe.lettre}</span>`;
  }).join("");
  const cepTxt = cep ? `${cep} kWh/m²/an` : "kWh/m²/an à mesurer";
  return `<div class="jauge">${pastilles}</div><p class="cep">${echap(actif)} — ${echap(cepTxt)}</p>`;
}

function imageOuVide(src, alt) {
  if (!src) {
    return `<div class="photo-vide">${echap(alt)}<br>Photo non encore transmise</div>`;
  }
  return `<img src="${echap(src)}" alt="${echap(alt)}" />`;
}

const ENCADRE_MARCHE =
  "Marché de Rénovation Globale Clé en Main régi par les articles 1787 et suivants du Code Civil. Mission complète de Contractant Général : conception, ingénierie financière des aides (Anah / CEE), coordination et exécution des travaux, garantie décennale et parfait achèvement.";

function camembert() {
  let curseur = 0;
  const parts = DEPERDITIONS.map((item) => {
    const debut = curseur;
    curseur += item.part;
    return `${item.couleur} ${debut}% ${curseur}%`;
  }).join(", ");
  const legendes = DEPERDITIONS.map(
    (item) =>
      `<li><span class="puce" style="background:${item.couleur}"></span>${echap(item.label)} <strong>${item.part} %</strong></li>`,
  ).join("");
  return `<div class="camembert" style="background:conic-gradient(${parts})" role="img" aria-label="Déperditions thermiques"></div><ul class="legende">${legendes}</ul>`;
}

function pied() {
  return `<footer class="pied">
    <p>${echap(IDENTITE_LEGALE.raisonSociale)}</p>
    <p>${echap(IDENTITE_LEGALE.forme)} — ${echap(IDENTITE_LEGALE.siege)} — ${echap(IDENTITE_LEGALE.ape)}</p>
    <p>${echap(MENTION_PROPRIETE_INTELLECTUELLE)}</p>
  </footer>`;
}

export function construireHtmlAuditRapportDevis({ dossier, edition, galerie }) {
  const nom = dossier?.nom || "Client";
  const photos = photosDocument(dossier, galerie);
  const diag = diagnostic(dossier, edition);
  const argent = finance(dossier, edition, diag);
  const fiches = bouquet(dossier, edition);
  const economieMois = argent.economie ? Math.round(argent.economie / 12) : 0;
  const autofinance =
    argent.phraseMensualite ||
    (argent.mensualite && economieMois && economieMois >= argent.mensualite
      ? `Soit ${euro(argent.mensualite)} / mois, simulation indicative amortie par les économies d'énergie.`
      : argent.mensualite
        ? `Soit ${euro(argent.mensualite)} / mois, simulation indicative.`
        : "Mensualité à monter avec FABIEN — VIVONS COURTIER.");
  const fichesHtml = fiches.length
    ? fiches
        .map(
          (fiche) => `<article class="fiche">
            <h3>${echap(fiche.titre)}</h3>
            <ul>${fiche.lignes.map((ligne) => `<li>${echap(ligne)}</li>`).join("")}</ul>
          </article>`,
        )
        .join("")
    : `<p class="vide">Aucun poste retenu pour ce bien. Le bouquet sera limité aux travaux cochés dans le dossier.</p>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>Étude thermique — ${echap(nom)} — ENERGIA CONSEIL IA®</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Segoe UI", sans-serif; color: #0f172a; background: #e2e8f0; }
    .page { width: 186mm; min-height: 262mm; margin: 8mm auto; background: white; padding: 10mm 12mm 14mm; position: relative; page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    h1 { font-size: 18pt; line-height: 1.2; margin: 8px 0; color: #0b1f3a; }
    h2 { font-size: 13pt; margin: 0 0 8px; color: #0b1f3a; }
    h3 { margin: 0 0 4px; font-size: 11pt; }
    p, li { font-size: 9.5pt; line-height: 1.35; }
    .logo-img { display: block; height: 26mm; width: auto; max-width: 82mm; object-fit: contain; object-position: left center; background: transparent; }
    .marque { display: inline-block; margin: 3mm 0 2mm; font-size: 8pt; font-weight: 700; color: #0f766e; background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 999px; padding: 2px 8px; }
    .cadre { margin-top: 4mm; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden; background: #f8fafc; }
    .couverture-photo { width: 100%; height: 92mm; object-fit: cover; object-position: center; display: block; }
    .photo-vide, .couverture-vide { height: 78mm; border: 1px dashed #94a3b8; border-radius: 8px; display: flex; align-items: center; justify-content: center; text-align: center; color: #64748b; font-size: 9pt; padding: 8px; }
    .bloc { background: #f8fafc; border-left: 3px solid #0284c7; padding: 8px 10px; margin-top: 8px; }
    .jauge { display: flex; gap: 3px; margin-top: 6px; }
    .dpe { flex: 1; text-align: center; color: white; font-weight: 800; font-size: 9pt; padding: 4px 0; border-radius: 3px; opacity: .35; }
    .dpe-on { opacity: 1; transform: scale(1.08); }
    .dpe-rouge { box-shadow: 0 0 0 2px #b91c1c; }
    .dpe-vert { box-shadow: 0 0 0 2px #15803d; }
    .cep { font-weight: 700; margin: 4px 0 0; }
    .diag { display: grid; grid-template-columns: 42mm 1fr; gap: 8mm; align-items: center; }
    .camembert { width: 42mm; height: 42mm; border-radius: 50%; }
    .legende { list-style: none; margin: 0; padding: 0; }
    .legende li { display: flex; gap: 6px; align-items: center; margin: 3px 0; }
    .puce { width: 8px; height: 8px; border-radius: 2px; display: inline-block; }
    .fiches { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .fiche { border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; break-inside: avoid; }
    .grille { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .grille figure, .compare figure { margin: 0; }
    .grille img, .compare img, .grille .photo-vide, .compare .photo-vide { width: 100%; height: 42mm; object-fit: cover; border-radius: 6px; }
    .grille .photo-vide, .compare .photo-vide { height: 42mm; }
    figcaption { font-size: 8pt; color: #475569; margin-top: 2px; }
    .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 8px; }
    .badge { display: inline-block; background: #ecfeff; color: #0e7490; border: 1px solid #67e8f9; border-radius: 999px; font-size: 8pt; font-weight: 700; padding: 3px 8px; }
    table { width: 100%; border-collapse: collapse; }
    td { border-bottom: 1px solid #e2e8f0; padding: 5px 2px; font-size: 9.5pt; }
    td:last-child { text-align: right; font-variant-numeric: tabular-nums; font-weight: 700; }
    .vert { color: #15803d; }
    .rac { font-size: 14pt; color: #0b1f3a; }
    .equipe { margin: 6px 0 0; padding-left: 16px; }
    .equipe li { margin: 1px 0; }
    .disclaimer { font-size: 8pt; color: #475569; background: #fff7ed; border-left: 3px solid #f97316; padding: 6px 8px; }
    .pied { margin-top: 8mm; border-top: 1px solid #e2e8f0; padding-top: 4px; }
    .pied p { font-size: 7pt; color: #64748b; margin: 2px 0; }
    .toolbar { position: sticky; top: 0; background: #0b1f3a; color: white; padding: 8px 12px; display: flex; justify-content: space-between; }
    .toolbar button { background: linear-gradient(90deg, #2563eb, #22d3ee); color: white; border: 0; border-radius: 8px; padding: 8px 12px; font-weight: 700; }
    @media print { body { background: white; } .toolbar { display: none; } .page { margin: 0; width: auto; min-height: auto; } }
  </style>
</head>
<body>
  <div class="toolbar">
    <span>Aperçu — Audit, rapport & devis sous licence de marque</span>
    <button type="button" onclick="window.print()">Enregistrer en PDF</button>
  </div>

  <section class="page">
    <img class="logo-img" src="${LOGO_ENERGIA_DATA_URI}" alt="ENERGIA CONSEIL IA®" />
    <p class="marque">Document édité sous Licence de Marque Exclusive — Marque déposée et protégée INPI n° 5213845</p>
    <h1>Étude thermique prévisionnelle & marché de rénovation globale clé en main</h1>
    <div class="bloc">
      <p><strong>${echap(nom)}</strong></p>
      <p>${echap(adresseBien(dossier))}</p>
      <p>Relevé terrain : ${echap(dateReleve(dossier))}</p>
      <p>Conseiller habilité : ${echap(conseiller(dossier))}</p>
    </div>
    <div class="cadre">
    ${
      photos.facade
        ? `<img class="couverture-photo" src="${echap(photos.facade)}" alt="Façade du bien" />`
        : `<div class="couverture-vide">Façade — en attente de la photo du relevé terrain</div>`
    }
    </div>
    ${pied()}
  </section>

  <section class="page">
    <h2>Diagnostic initial et déperditions</h2>
    ${jauge(diag.dpeActuel, diag.cepActuel)}
    <div class="diag">
      ${camembert()}
    </div>
    <p class="disclaimer">Répartition type d’une maison peu isolée. Les parts se confirment au relevé. Elles ne remplacent pas un calcul réglementaire.</p>
    <div class="bloc">
      <p><strong>Facture énergétique annuelle constatée</strong></p>
      <p>${
        diag.factureMin
          ? `${euro(diag.factureMin)}${diag.factureMax && diag.factureMax !== diag.factureMin ? ` à ${euro(diag.factureMax)}` : ""} / an`
          : "À relever sur les factures du foyer"
      }</p>
    </div>
    ${pied()}
  </section>

  <section class="page">
    <h2>Bouquet de travaux retenu pour ce bien</h2>
    <div class="fiches">${fichesHtml}</div>
    <p class="disclaimer">${echap(ENCADRE_MARCHE)}</p>
    ${pied()}
  </section>

  <section class="page">
    <h2>Diagnostic terrain et projection avant / après</h2>
    <p>Photos réelles avant travaux${photos.source ? ` — ${echap(photos.source)}` : ""}.</p>
    <div class="grille">
      <figure>${imageOuVide(photos.facade, "Façade")}<figcaption>Façade / murs</figcaption></figure>
      <figure>${imageOuVide(photos.chauffage, "Chauffage")}<figcaption>Générateur de chauffage actuel</figcaption></figure>
      <figure>${imageOuVide(photos.combles, "Combles")}<figcaption>Combles ou toiture</figcaption></figure>
      <figure>${imageOuVide(photos.tableau, "Tableau")}<figcaption>Tableau électrique / accès technique</figcaption></figure>
    </div>
    <div class="compare">
      <figure>
        <p><strong>État initial actuel (passoire ${echap(diag.dpeActuel)})</strong></p>
        ${imageOuVide(photos.facade, "État initial")}
        <figcaption>Photo réelle de la façade</figcaption>
      </figure>
      <figure>
        <p><strong>Projection après rénovation ENERGIA (classe ${echap(diag.dpeCible)} visée)</strong></p>
        ${
          photos.apresFacade
            ? `<img src="${echap(photos.apresFacade)}" alt="Projection après rénovation" />`
            : `<div class="photo-vide">Projection ITE, générateur compact et toiture traitée — visuel à produire après le relevé</div>`
        }
        <figcaption>Image de projection, non contractuelle — classe visée ${echap(diag.dpeCible)}</figcaption>
      </figure>
    </div>
    <p class="badge">Transformation thermique et esthétique • Valorisation patrimoniale immédiate (+15 % à +25 % de valeur verte)</p>
    ${pied()}
  </section>

  <section class="page">
    <h2>Saut de performance</h2>
    ${jauge(diag.dpeCible, diag.cepCible)}
    <div class="bloc">
      <p><strong>Gain énergétique</strong> ${diag.gainPct ? `${diag.gainPct} %` : "À calculer après le bouquet arrêté"}</p>
      <p><strong>Baisse de facture estimée</strong> ${argent.economie ? `${euro(argent.economie)} / an` : "À calculer à partir des factures"}</p>
      <p><strong>Valeur verte à la revente</strong> Ordre de grandeur +15 % à +25 %, non contractuel, selon le marché local et le DPE atteint.</p>
    </div>
    <p class="disclaimer">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.</p>
    ${pied()}
  </section>

  <section class="page">
    <h2>Bilan financier, subventions et financement</h2>
    <table>
      <tr><td>Montant des travaux clé en main HT</td><td>${euro(argent.ht)}</td></tr>
      <tr><td>Montant TTC</td><td>${euro(argent.ttc)}</td></tr>
      <tr><td>${echap(argent.libelleMpr)}</td><td class="vert">− ${euro(argent.mpr)}</td></tr>
      <tr><td>Primes CEE EMMY — BAR-TH-164 / coup de pouce</td><td class="vert">− ${euro(argent.cee)}</td></tr>
      ${
        argent.locales
          ? `<tr><td>Aide régionale</td><td class="vert">− ${euro(argent.locales)}</td></tr>`
          : ""
      }
      ${
        argent.solaire
          ? `<tr><td>Prime autoconsommation / crédit d’impôt solaire ou borne</td><td class="vert">− ${euro(argent.solaire)}</td></tr>`
          : ""
      }
      <tr><td>Total des aides déduites</td><td class="vert">${euro(argent.aides)}</td></tr>
      <tr><td class="rac">Reste à charge net client</td><td class="rac">${euro(argent.rac)}</td></tr>
    </table>
    <div class="bloc"><p>${echap(autofinance)}</p></div>
    <p class="disclaimer">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Ce document est une étude sous licence de marque. Il ne remplace pas le devis définitif signé après accord ANAH lorsque le parcours MaPrimeRénov’ est retenu.</p>
    <p>Bon pour accord de l’étude : fait à ________ le ________ — Signature du client :</p>
    <ul class="equipe">
      <li>Sylvain LEMBELEMBE (AMO) — 06 10 59 68 98</li>
      <li>DAMIEN (Commercial) — 06 72 68 09 68</li>
      <li>FABIEN (Vivons Courtier) — 06 71 19 96 45</li>
      <li>Julia (Juriste)</li>
      <li>Antoine BARATIER (MAR — Cabinet C2ET)</li>
    </ul>
    ${pied()}
  </section>
</body>
</html>`;
}

export async function embarquerImagesLocales(html) {
  if (typeof window === "undefined" || typeof fetch !== "function") return html;
  const chemins = [...new Set([...html.matchAll(/src="(\/[^"]+)"/g)].map((trouve) => trouve[1]))];
  let resultat = html;
  for (const chemin of chemins) {
    try {
      const reponse = await fetch(`${window.location.origin}${chemin}`);
      if (!reponse.ok) continue;
      const blob = await reponse.blob();
      if (!String(blob.type || "").startsWith("image/")) continue;
      const data = await new Promise((resolve) => {
        const lecteur = new FileReader();
        lecteur.onload = () => resolve(String(lecteur.result || ""));
        lecteur.onerror = () => resolve("");
        lecteur.readAsDataURL(blob);
      });
      if (String(data).startsWith("data:image/")) {
        resultat = resultat.split(`src="${chemin}"`).join(`src="${data}"`);
      }
    } catch {
      /* le chemin d’origine reste en place */
    }
  }
  return resultat;
}

export function ouvrirApercuAuditRapportDevis(html) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const fenetre = window.open(url, "_blank", "noopener,noreferrer");
  if (fenetre) {
    const timer = window.setInterval(() => {
      try {
        if (fenetre.closed) {
          window.clearInterval(timer);
          return;
        }
        if (fenetre.document.readyState === "complete") {
          window.clearInterval(timer);
          fenetre.focus();
          fenetre.print();
        }
      } catch {
        window.clearInterval(timer);
      }
    }, 300);
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120000);
  return Boolean(fenetre);
}
