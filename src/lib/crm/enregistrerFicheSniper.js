/**
 * Fiche de prospection Carto Sniper → CRM local, puis tentative Supabase (crm_projets).
 * Un nom ou un numéro vide n'empêche pas l'enregistrement.
 */
import { SOURCE_APPORTEUR_DIRECT } from "./operationnelCrm.js";
import { enregistrerProjetManuel, lireProjetsManuels, modifierProjetManuel } from "./projetsManuels.js";

const CLE_FICHES = "energia-crm-fiches-sniper-v1";
export const NOM_PROPRIETAIRE_A_QUALIFIER = "Propriétaire à qualifier";
export const STATUT_A_QUALIFIER = "À qualifier";

function texte(valeur) {
  return valeur == null ? "" : String(valeur).trim();
}

function nombre(valeur) {
  const n = Number(valeur);
  return Number.isFinite(n) ? n : null;
}

function annee(valeur) {
  const n = nombre(valeur);
  if (n == null || n < 1800 || n > 2100) return null;
  return Math.round(n);
}

function lireFiches() {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_FICHES) || "[]");
    return Array.isArray(brut) ? brut : [];
  } catch {
    return [];
  }
}

function ecrireFiches(liste) {
  localStorage.setItem(CLE_FICHES, JSON.stringify(liste.slice(0, 300)));
}

function terrainDepuis(brut) {
  return {
    etiquette: texte(brut?.etiquette) || "-",
    consoKwhM2: nombre(brut?.consoKwhM2),
    surfaceHabitableM2: nombre(brut?.surfaceHabitableM2),
    anneeConstruction: annee(brut?.anneeConstruction),
    section: texte(brut?.section) || "-",
    numero: texte(brut?.numero) || "-",
    chauffage: texte(brut?.chauffage) || "-",
  };
}

function resumeTerrain(terrain) {
  const kwh = terrain.consoKwhM2 == null ? "-" : `${terrain.consoKwhM2} kWh/m2.an`;
  const surface = terrain.surfaceHabitableM2 == null ? "-" : `${terrain.surfaceHabitableM2} m2`;
  const anneeTxt = terrain.anneeConstruction == null ? "-" : String(terrain.anneeConstruction);
  const cadastre = [terrain.section, terrain.numero].filter((item) => item && item !== "-").join(" ") || "-";
  return `DPE ${terrain.etiquette} · ${kwh} · ${surface} · année ${anneeTxt} · cadastre ${cadastre}`;
}

function pousserVersSupabase(projet) {
  if (!projet?.id) return;
  import("./crmSupabaseSync.js")
    .then((mod) => mod.synchroniserProjetsVersSupabase([projet]))
    .catch(() => {});
}

function upsertPipeline({ id, nomDossier, telephone, adresse, codePostal, commune, statut, terrain }) {
  const cp = /^\d{5}$/.test(codePostal) ? codePostal : "";
  const ville = texte(commune);
  if (!cp || ville.length < 2 || nomDossier.length < 2) return null;
  const marque = `SNIPER:${id}`;
  const payload = {
    nom: nomDossier,
    prenom: "",
    ville,
    codePostal: cp,
    statut,
    typeProjet: "Prospection DPE",
    description: `${marque} — ${resumeTerrain(terrain)}. ${texte(adresse)}`.trim(),
    adresse,
    telephone,
    apporteurId: SOURCE_APPORTEUR_DIRECT,
    ficheTerrain: { ...terrain, adresse: texte(adresse), codePostal: cp, commune: ville },
  };
  const existants = lireProjetsManuels();
  const deja = existants.find((item) => texte(item?.description).includes(marque));
  const resultat = deja?.id ? modifierProjetManuel(deja.id, payload) : enregistrerProjetManuel(payload);
  if (resultat?.ok && resultat.projet) pousserVersSupabase(resultat.projet);
  return resultat;
}

export function enregistrerFicheSniperCrm({
  identifiant,
  nom,
  telephone,
  adresse,
  codePostal,
  commune,
  etiquette,
  consoKwhM2,
  surfaceHabitableM2,
  anneeConstruction,
  section,
  numero,
  chauffage,
}) {
  const nomBrut = texte(nom);
  const telBrut = texte(telephone);
  const incomplet = !nomBrut || !telBrut;
  const terrain = terrainDepuis({
    etiquette,
    consoKwhM2,
    surfaceHabitableM2,
    anneeConstruction,
    section,
    numero,
    chauffage,
  });
  const fiche = {
    id: texte(identifiant) || texte(adresse) || "sans-identifiant",
    nom: nomBrut || NOM_PROPRIETAIRE_A_QUALIFIER,
    telephone: telBrut,
    adresse: texte(adresse),
    codePostal: texte(codePostal),
    commune: texte(commune),
    statut: incomplet ? STATUT_A_QUALIFIER : "Nouveau Lead — À Contacter",
    ...terrain,
    updatedAt: new Date().toISOString(),
  };

  try {
    const liste = lireFiches().filter((item) => item?.id !== fiche.id);
    liste.unshift(fiche);
    ecrireFiches(liste);
  } catch {
    /* le toast et la session restent la confirmation visible */
  }

  try {
    upsertPipeline({
      id: fiche.id,
      nomDossier: nomBrut.length >= 2 ? nomBrut : NOM_PROPRIETAIRE_A_QUALIFIER,
      telephone: telBrut,
      adresse: fiche.adresse,
      codePostal: fiche.codePostal,
      commune: fiche.commune,
      statut: fiche.statut,
      terrain,
    });
  } catch {
    /* pipeline indisponible : la fiche locale est déjà écrite */
  }

  return fiche;
}
