/**
 * Relevé express terrain Catarina Martins.
 * Crée un dossier dans le même stockage que les projets CRM manuels.
 */

import {
  ETAPE_ANAH_AUDIT,
  SOURCE_APPORTEUR_CATARINA,
  STATUT_COMMISSION_EN_ATTENTE,
  libelleSourceApporteur,
} from "./operationnelCrm.js";
import {
  STORAGE_PROJETS_MANUELS,
  estDoublonProjet,
  lireProjetsManuels,
} from "./projetsManuels.js";

export const JALON_RELEVE_TERRAIN = "1. Audit réglementaire réalisé [ VERROU MAR ]";
export const ETIQUETTE_APPORTEUR_CATARINA = "CATARINA MARTINS";
export const STATUT_RELEVE_TERRAIN = "Audit en cours";

export const PHOTOS_BIEN = [
  { id: "facade", label: "Façade" },
  { id: "salon", label: "Séjour" },
  { id: "toiture", label: "Combles" },
  { id: "tableau", label: "Tableau électrique" },
  { id: "compteur", label: "Compteur" },
  { id: "pignons", label: "Pignons & Arrière" },
  { id: "chauffage", label: "Chauffage / Chaudière" },
];

export const PHOTOS_DOCUMENTS = [
  { id: "dpe", label: "Photo DPE existant" },
  { id: "facture", label: "Photo Facture Énergie" },
  { id: "avis", label: "Photo Avis d'Imposition (RFR visible)" },
];

export const SLOTS_PHOTOS_RELEVE = [
  ...PHOTOS_BIEN.map((slot) => ({ ...slot, groupe: "bien" })),
  ...PHOTOS_DOCUMENTS.map((slot) => ({ ...slot, groupe: "documents" })),
];

export const MAX_PHOTOS_RELEVE = SLOTS_PHOTOS_RELEVE.length;

const ETIQUETTES_PHOTO = {
  facade: "Façade",
  salon: "Séjour",
  sejour: "Séjour",
  toiture: "Combles",
  combles: "Combles",
  tableau: "Tableau électrique",
  compteur: "Compteur",
  pignons: "Pignons & Arrière",
  chauffage: "Chauffage / Chaudière",
  menuiseries: "Menuiseries / Fenêtres",
  dpe: "Photo DPE existant",
  facture: "Photo Facture Énergie",
  avis: "Photo Avis d'Imposition (RFR visible)",
};

export const TELEPHONE_WHATSAPP_SYLVAIN = "33610596898";

export function etiquettePhoto(id, label) {
  if (ETIQUETTES_PHOTO[id]) return ETIQUETTES_PHOTO[id];
  const texteLabel = texte(label);
  return texteLabel || "Photo";
}

export const OBJECTIFS_RELEVE = [
  { id: "vente_etat", label: "Vente rapide en l'état" },
  {
    id: "valorisation",
    label: "Valorisation avant vente (rénovation pour vendre au prix fort)",
  },
  { id: "renovation_habiter", label: "Rénovation globale pour habiter (aides Anah)" },
];

const TEL_RE = /^(?:(?:\+33|0033)[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}$/;

export function telephoneReleveValide(value) {
  return TEL_RE.test(texte(value));
}

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function dateDuJourLocale(date = new Date()) {
  const mois = String(date.getMonth() + 1).padStart(2, "0");
  const jour = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${mois}-${jour}`;
}

export function extraireLocalisation(adresse) {
  const brut = texte(adresse).replace(/\s+/g, " ");
  const matches = [...brut.matchAll(/(\d{5})\s+([^,\d]+)/g)];
  const last = matches.at(-1);
  if (!last) return { ok: false, adresse: brut, codePostal: "", ville: "" };
  const ville = last[2].replace(/[().]/g, " ").replace(/\s+/g, " ").trim();
  if (ville.length < 2) return { ok: false, adresse: brut, codePostal: last[1], ville: "" };
  return { ok: true, adresse: brut, codePostal: last[1], ville };
}

function nombreOptionnel(value) {
  if (value == null || value === "") return { ok: true, valeur: null };
  const n = Number(String(value).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(n) || n < 0) return { ok: false, valeur: null };
  return { ok: true, valeur: n };
}

function normaliserGroupePhotos(brut, slots) {
  const source = brut && typeof brut === "object" ? brut : {};
  const out = {};
  for (const slot of slots) {
    const valeur = source[slot.id];
    out[slot.id] = typeof valeur === "string" && valeur.startsWith("data:image/") ? valeur : null;
  }
  return out;
}

export function validerReleveTerrain(brut = {}) {
  const erreurs = {};
  const nom = texte(brut.nom);
  const telephone = texte(brut.telephone);
  const localisation = extraireLocalisation(brut.adresse);
  const dateVisite = texte(brut.dateVisite) || dateDuJourLocale();
  const objectif = OBJECTIFS_RELEVE.find((item) => item.id === brut.objectif) || null;
  const surface = nombreOptionnel(brut.surfaceHabitable);
  const longueur = nombreOptionnel(brut.longueurSol);
  const largeur = nombreOptionnel(brut.largeurSol);
  const hauteur = nombreOptionnel(brut.hauteurSousPlafond);
  const combles = nombreOptionnel(brut.surfaceCombles);
  const fenetres = nombreOptionnel(brut.nombreFenetres);

  if (nom.length < 2) erreurs.nom = "Nom et prénom requis.";
  if (!TEL_RE.test(telephone)) erreurs.telephone = "Numéro de téléphone invalide.";
  if (!localisation.ok) {
    erreurs.adresse = "Indiquez l'adresse complète avec le code postal, par exemple 12 rue des Lilas, 71150 Chagny.";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateVisite) || Number.isNaN(Date.parse(dateVisite))) {
    erreurs.dateVisite = "Date de visite invalide.";
  }
  if (!objectif) erreurs.objectif = "Choisissez l'objectif du client.";
  if (!surface.ok) erreurs.surfaceHabitable = "Surface habitable invalide.";
  if (!longueur.ok) erreurs.longueurSol = "Longueur invalide.";
  if (!largeur.ok) erreurs.largeurSol = "Largeur invalide.";
  if (!hauteur.ok) erreurs.hauteurSousPlafond = "Hauteur invalide.";
  if (!combles.ok) erreurs.surfaceCombles = "Surface des combles invalide.";
  if (!fenetres.ok || (fenetres.valeur != null && !Number.isInteger(fenetres.valeur))) {
    erreurs.nombreFenetres = "Indiquez un nombre entier de fenêtres.";
  }

  return {
    ok: Object.keys(erreurs).length === 0,
    erreurs,
    valeurs: {
      nom,
      telephone,
      adresse: localisation.adresse,
      ville: localisation.ville,
      codePostal: localisation.codePostal,
      dateVisite,
      objectifId: objectif?.id || "",
      objectifLabel: objectif?.label || "",
      surfaceHabitable: surface.valeur,
      longueurSol: longueur.valeur,
      largeurSol: largeur.valeur,
      hauteurSousPlafond: hauteur.valeur,
      surfaceCombles: combles.valeur,
      nombreFenetres: fenetres.valeur,
      photos: {
        bien: normaliserGroupePhotos(brut.photosBien, PHOTOS_BIEN),
        documents: normaliserGroupePhotos(brut.photosDocuments, PHOTOS_DOCUMENTS),
      },
    },
  };
}

function photosAllegées(photos) {
  const marquer = (groupe) =>
    Object.fromEntries(
      Object.entries(groupe || {}).map(([cle, valeur]) => [cle, valeur ? "present" : null]),
    );
  return {
    bien: marquer(photos?.bien),
    documents: marquer(photos?.documents),
    allegees: true,
  };
}

function ecrireListe(liste) {
  localStorage.setItem(STORAGE_PROJETS_MANUELS, JSON.stringify(liste));
}

export function enregistrerReleveTerrainCatarina(brut) {
  const validation = validerReleveTerrain(brut);
  if (!validation.ok) return { ok: false, erreurs: validation.erreurs, projet: null, liste: null };

  if (typeof localStorage === "undefined") {
    return {
      ok: false,
      erreurs: { formulaire: "Stockage local indisponible sur cet appareil." },
      projet: null,
      liste: null,
    };
  }

  const valeurs = validation.valeurs;
  const actuels = lireProjetsManuels();
  if (
    actuels.some((item) =>
      estDoublonProjet(item, {
        nom: valeurs.nom,
        ville: valeurs.ville,
        codePostal: valeurs.codePostal,
      }),
    )
  ) {
    return {
      ok: false,
      erreurs: { nom: "Un dossier existe déjà pour ce client et cette localisation." },
      projet: null,
      liste: actuels,
    };
  }

  const apporteurNom = libelleSourceApporteur(SOURCE_APPORTEUR_CATARINA, { select: true });
  const projet = {
    id: `projet-manuel-${Date.now()}`,
    nom: valeurs.nom,
    ville: valeurs.ville,
    codePostal: valeurs.codePostal,
    adresse: valeurs.adresse,
    telephone: valeurs.telephone,
    dateVisite: valeurs.dateVisite,
    rfr: null,
    statut: STATUT_RELEVE_TERRAIN,
    source: "releve-terrain-catarina",
    origine: "releve-terrain-catarina",
    createdAt: valeurs.dateVisite,
    apporteurId: SOURCE_APPORTEUR_CATARINA,
    apporteurNom,
    etiquetteApporteur: ETIQUETTE_APPORTEUR_CATARINA,
    etapeAnah: ETAPE_ANAH_AUDIT,
    validationMar: false,
    consultationDuo: false,
    statutCommission: STATUT_COMMISSION_EN_ATTENTE,
    detailJalon: JALON_RELEVE_TERRAIN,
    objectifId: valeurs.objectifId,
    objectifLabel: valeurs.objectifLabel,
    typeProjet: `Relevé express Catarina — ${valeurs.objectifLabel}`,
    surfaceHabitable: valeurs.surfaceHabitable,
    longueurSol: valeurs.longueurSol,
    largeurSol: valeurs.largeurSol,
    hauteurSousPlafond: valeurs.hauteurSousPlafond,
    surfaceCombles: valeurs.surfaceCombles,
    nombreFenetres: valeurs.nombreFenetres,
    photos: valeurs.photos,
    alertes: [
      "Relevé terrain Catarina Martins. RFR à lire sur la photo d'avis d'imposition — catégorie d'aide à confirmer.",
    ],
  };

  try {
    const liste = [projet, ...actuels];
    ecrireListe(liste);
    return { ok: true, erreurs: {}, projet, liste, photosAllegees: false };
  } catch {
    const allege = { ...projet, photos: photosAllegées(projet.photos) };
    try {
      const liste = [allege, ...actuels];
      ecrireListe(liste);
      return { ok: true, erreurs: {}, projet: allege, liste, photosAllegees: true };
    } catch {
      return {
        ok: false,
        erreurs: {
          formulaire: "Mémoire locale saturée. Retirez quelques photos puis transmettez à nouveau.",
        },
        projet: null,
        liste: actuels,
      };
    }
  }
}

export function formaterMesure(valeur) {
  if (valeur == null || valeur === "") return "";
  const n = Number(valeur);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });
}

export function formaterDateReleve(iso) {
  const brut = texte(iso).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(brut)) return "";
  const date = new Date(`${brut}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("fr-FR");
}

export function estReleveTerrain(projet) {
  return projet?.source === "releve-terrain-catarina" || projet?.origine === "releve-terrain-catarina";
}

export function compterPhotosEnregistrees(projet) {
  let total = 0;
  for (const groupe of ["bien", "documents"]) {
    const source = projet?.photos?.[groupe];
    if (!source || typeof source !== "object") continue;
    for (const valeur of Object.values(source)) {
      if (typeof valeur === "string" && (valeur.startsWith("data:image/") || valeur === "present")) total += 1;
    }
  }
  if (total > 0) return total;
  if (Array.isArray(projet?.photosDistantes)) {
    return projet.photosDistantes.filter((photo) => photo?.url || photo?.src).length;
  }
  return 0;
}

export function titreFicheReleve(projet) {
  const lieu = texte(projet?.adresse) || [projet?.codePostal, projet?.ville].filter(Boolean).join(" ");
  const surface = projet?.surfaceHabitable != null ? `${formaterMesure(projet.surfaceHabitable)} m²` : "";
  const date = formaterDateReleve(projet?.dateVisite || projet?.createdAt);
  return [lieu, surface, date ? `Relevé du ${date}` : ""].filter(Boolean).join(" — ");
}

export function mentionPhotosSynchronisees(nb) {
  const n = Number(nb) || 0;
  if (n <= 0) return "";
  const pluriel = n > 1;
  return `✅ ${n} photo${pluriel ? "s" : ""} haute résolution synchronisée${pluriel ? "s" : ""} dans le CRM`;
}

export function messageTransmissionWhatsApp(projet, nbPhotos) {
  const lignes = [
    "Relevé terrain — Catarina Martins — ENERGIA-CONSEIL IA®",
    `Client : ${texte(projet?.nom) || "—"}`,
    `Adresse : ${texte(projet?.adresse) || "—"}`,
  ];
  if (projet?.surfaceHabitable != null) lignes.push(`Cotes laser : ${formaterMesure(projet.surfaceHabitable)} m²`);
  if (projet?.hauteurSousPlafond != null) lignes.push(`Hauteur : ${formaterMesure(projet.hauteurSousPlafond)} m`);
  if (projet?.surfaceCombles != null) lignes.push(`Combles : ${formaterMesure(projet.surfaceCombles)} m²`);
  if (projet?.objectifLabel) lignes.push(`Objectif : ${projet.objectifLabel}`);
  const mention = mentionPhotosSynchronisees(nbPhotos);
  if (mention) {
    lignes.push("");
    lignes.push(mention);
  }
  return lignes.join("\n");
}

export function urlWhatsAppSylvain(message) {
  return `https://wa.me/${TELEPHONE_WHATSAPP_SYLVAIN}?text=${encodeURIComponent(message || "")}`;
}
