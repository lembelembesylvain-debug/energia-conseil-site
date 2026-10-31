/**
 * Photos haute résolution du relevé terrain Catarina.
 * IndexedDB sur l'appareil, copie disque via /api/releves-photos,
 * et bucket Supabase Storage "releves-photos" pour le CRM d'un autre écran.
 */

import { lireProjetsManuels, STORAGE_PROJETS_MANUELS } from "./projetsManuels.js";
import {
  SLOTS_PHOTOS_RELEVE,
  estReleveTerrain,
  etiquettePhoto,
} from "./releveTerrainCatarina.js";

export const BUCKET_RELEVES_PHOTOS = "releves-photos";
export const CLE_PING_RELEVES = "energia-releves-ping";
export const EVENEMENT_RELEVES = "energia-releves-maj";
const DB_NAME = "energia-releves-photos";
const DB_STORE = "photos";
const BROUILLON_ID = "brouillon";

function clePhoto(releveId, slotId) {
  return `${releveId}::${slotId}`;
}

function ouvrirBase() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const requete = indexedDB.open(DB_NAME, 1);
    requete.onupgradeneeded = () => {
      const base = requete.result;
      if (!base.objectStoreNames.contains(DB_STORE)) base.createObjectStore(DB_STORE);
    };
    requete.onsuccess = () => resolve(requete.result);
    requete.onerror = () => resolve(null);
  });
}

async function ecrirePhotoLocale(releveId, photo) {
  const base = await ouvrirBase();
  if (!base || !photo?.dataUrl) return false;
  return new Promise((resolve) => {
    const tx = base.transaction(DB_STORE, "readwrite");
    tx.objectStore(DB_STORE).put(
      {
        releveId,
        id: photo.id,
        label: photo.label,
        groupe: photo.groupe,
        dataUrl: photo.dataUrl,
      },
      clePhoto(releveId, photo.id),
    );
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

async function lirePhotosLocales(releveId) {
  const base = await ouvrirBase();
  if (!base) return [];
  return new Promise((resolve) => {
    const tx = base.transaction(DB_STORE, "readonly");
    const requete = tx.objectStore(DB_STORE).getAll();
    requete.onsuccess = () => {
      const lignes = Array.isArray(requete.result) ? requete.result : [];
      resolve(
        lignes
          .filter((ligne) => ligne?.releveId === releveId && typeof ligne.dataUrl === "string")
          .map((ligne) => ({
            id: ligne.id,
            label: etiquettePhoto(ligne.id, ligne.label),
            groupe: ligne.groupe || "bien",
            src: ligne.dataUrl,
          })),
      );
    };
    requete.onerror = () => resolve([]);
  });
}

async function effacerPhotosLocales(releveId) {
  const base = await ouvrirBase();
  if (!base) return;
  const photos = await lirePhotosLocales(releveId);
  await new Promise((resolve) => {
    const tx = base.transaction(DB_STORE, "readwrite");
    const store = tx.objectStore(DB_STORE);
    for (const photo of photos) store.delete(clePhoto(releveId, photo.id));
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

export function photosDepuisFormulaire(form) {
  const photos = [];
  for (const slot of SLOTS_PHOTOS_RELEVE) {
    const source = slot.groupe === "documents" ? form?.photosDocuments : form?.photosBien;
    const dataUrl = source?.[slot.id];
    if (typeof dataUrl === "string" && dataUrl.startsWith("data:image/")) {
      photos.push({
        id: slot.id,
        label: etiquettePhoto(slot.id, slot.label),
        groupe: slot.groupe,
        dataUrl,
      });
    }
  }
  return photos;
}

export function galerieDepuisProjet(projet) {
  const photos = [];
  for (const slot of SLOTS_PHOTOS_RELEVE) {
    const valeur = projet?.photos?.[slot.groupe]?.[slot.id];
    if (typeof valeur === "string" && valeur.startsWith("data:image/")) {
      photos.push({
        id: slot.id,
        label: etiquettePhoto(slot.id, slot.label),
        groupe: slot.groupe,
        src: valeur,
      });
    }
  }
  if (photos.length) return photos;
  if (Array.isArray(projet?.photosDistantes)) {
    return projet.photosDistantes
      .filter((photo) => photo?.url || photo?.src)
      .map((photo) => ({
        id: photo.id,
        label: etiquettePhoto(photo.id, photo.label),
        groupe: photo.groupe || "bien",
        src: photo.url || photo.src,
      }));
  }
  return [];
}

export async function sauverBrouillonPhotos(form) {
  const photos = photosDepuisFormulaire(form);
  await effacerPhotosLocales(BROUILLON_ID);
  for (const photo of photos) await ecrirePhotoLocale(BROUILLON_ID, photo);
  return photos.length;
}

export async function restaurerBrouillonPhotos() {
  const photos = await lirePhotosLocales(BROUILLON_ID);
  const photosBien = {};
  const photosDocuments = {};
  for (const photo of photos) {
    if (photo.groupe === "documents") photosDocuments[photo.id] = photo.src;
    else photosBien[photo.id] = photo.src;
  }
  return { photosBien, photosDocuments, total: photos.length };
}

function dataUrlVersBlob(dataUrl) {
  const [entete, base64] = String(dataUrl).split(",");
  const mime = /data:(.*?);/.exec(entete)?.[1] || "image/jpeg";
  const binaire = atob(base64 || "");
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i);
  return new Blob([octets], { type: mime });
}

async function clientSupabase() {
  const url = import.meta.env?.VITE_SUPABASE_URL;
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key || typeof window === "undefined") return null;
  try {
    const module = await import("../supabase.js");
    return module.supabase || null;
  } catch {
    return null;
  }
}

async function envoyerPhotoApi(releveId, photo) {
  const reponse = await fetch("/api/releves-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "photo",
      id: releveId,
      slotId: photo.id,
      label: photo.label,
      groupe: photo.groupe,
      dataUrl: photo.dataUrl,
    }),
  });
  if (!reponse.ok) return null;
  const json = await reponse.json();
  return json?.url || json?.src || null;
}

async function envoyerManifesteApi(fiche) {
  const reponse = await fetch("/api/releves-photos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "manifeste", releve: fiche }),
  });
  if (!reponse.ok) return false;
  const json = await reponse.json();
  return json?.ok === true;
}

async function envoyerPhotoSupabase(supabase, releveId, photo) {
  const chemin = `${releveId}/${photo.id}.jpg`;
  const blob = dataUrlVersBlob(photo.dataUrl);
  const { error } = await supabase.storage.from(BUCKET_RELEVES_PHOTOS).upload(chemin, blob, {
    upsert: true,
    contentType: blob.type || "image/jpeg",
    cacheControl: "3600",
  });
  if (error) return null;
  const { data } = supabase.storage.from(BUCKET_RELEVES_PHOTOS).getPublicUrl(chemin);
  return data?.publicUrl || null;
}

async function envoyerManifesteSupabase(supabase, fiche) {
  const chemin = `manifests/${fiche.id}.json`;
  const blob = new Blob([JSON.stringify(fiche)], { type: "application/json" });
  const { error } = await supabase.storage.from(BUCKET_RELEVES_PHOTOS).upload(chemin, blob, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "30",
  });
  return !error;
}

function memoriserUrls(projetId, photosDistantes) {
  if (typeof localStorage === "undefined") return;
  try {
    const liste = lireProjetsManuels();
    const index = liste.findIndex((item) => item.id === projetId);
    if (index < 0) return;
    liste[index] = { ...liste[index], photosDistantes };
    localStorage.setItem(STORAGE_PROJETS_MANUELS, JSON.stringify(liste));
  } catch {
    /* quota : les originaux restent dans IndexedDB */
  }
}

export function signalerRelevesMaj(id) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CLE_PING_RELEVES, JSON.stringify({ at: Date.now(), id: id || "" }));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENEMENT_RELEVES, { detail: { id } }));
}

export async function synchroniserPhotosReleve(projet, form) {
  const photos = photosDepuisFormulaire(form);
  await effacerPhotosLocales(projet.id);
  for (const photo of photos) await ecrirePhotoLocale(projet.id, photo);
  await effacerPhotosLocales(BROUILLON_ID);

  const supabase = await clientSupabase();
  const distantes = [];
  let cloud = false;

  for (const photo of photos) {
    let url = null;
    try {
      url = await envoyerPhotoApi(projet.id, photo);
      if (url) cloud = true;
    } catch {
      url = null;
    }
    if (supabase) {
      try {
        const publique = await envoyerPhotoSupabase(supabase, projet.id, photo);
        if (publique) {
          url = publique;
          cloud = true;
        }
      } catch {
        /* bucket absent ou politique de stockage */
      }
    }
    distantes.push({
      id: photo.id,
      label: photo.label,
      groupe: photo.groupe,
      url: url || "",
    });
  }

  const fiche = {
    id: projet.id,
    nom: projet.nom,
    adresse: projet.adresse,
    ville: projet.ville,
    codePostal: projet.codePostal,
    telephone: projet.telephone,
    dateVisite: projet.dateVisite,
    surfaceHabitable: projet.surfaceHabitable,
    hauteurSousPlafond: projet.hauteurSousPlafond,
    surfaceCombles: projet.surfaceCombles,
    longueurSol: projet.longueurSol,
    largeurSol: projet.largeurSol,
    nombreFenetres: projet.nombreFenetres,
    objectifLabel: projet.objectifLabel,
    createdAt: projet.createdAt,
    photos: distantes,
  };

  try {
    if (await envoyerManifesteApi(fiche)) cloud = true;
  } catch {
    /* API locale indisponible */
  }
  if (supabase) {
    try {
      if (await envoyerManifesteSupabase(supabase, fiche)) cloud = true;
    } catch {
      /* manifeste cloud ignoré */
    }
  }

  memoriserUrls(projet.id, distantes.filter((photo) => photo.url));
  signalerRelevesMaj(projet.id);
  return { nb: photos.length, cloud, photos: distantes };
}

function ordreSlots(id) {
  const index = SLOTS_PHOTOS_RELEVE.findIndex((slot) => slot.id === id);
  return index < 0 ? 99 : index;
}

function trierGalerie(photos) {
  return [...photos].sort((a, b) => ordreSlots(a.id) - ordreSlots(b.id));
}

async function relevesDepuisApi() {
  const reponse = await fetch("/api/releves-photos", { cache: "no-store" });
  if (!reponse.ok) return [];
  const json = await reponse.json();
  return Array.isArray(json?.releves) ? json.releves : [];
}

async function relevesDepuisSupabase() {
  const supabase = await clientSupabase();
  if (!supabase) return [];
  const { data, error } = await supabase.storage.from(BUCKET_RELEVES_PHOTOS).list("manifests", {
    limit: 40,
    sortBy: { column: "created_at", order: "desc" },
  });
  if (error || !Array.isArray(data)) return [];
  const releves = [];
  for (const fichier of data) {
    if (!fichier?.name?.endsWith(".json")) continue;
    const { data: blob, error: lecture } = await supabase.storage
      .from(BUCKET_RELEVES_PHOTOS)
      .download(`manifests/${fichier.name}`);
    if (lecture || !blob) continue;
    try {
      releves.push(JSON.parse(await blob.text()));
    } catch {
      /* manifeste illisible */
    }
  }
  return releves;
}

function normaliserDistant(fiche) {
  if (!fiche?.id) return null;
  const galerie = trierGalerie(
    (Array.isArray(fiche.photos) ? fiche.photos : [])
      .map((photo) => ({
        id: photo.id,
        label: etiquettePhoto(photo.id, photo.label),
        groupe: photo.groupe || "bien",
        src: photo.url || photo.src || "",
      }))
      .filter((photo) => photo.src),
  );
  return {
    id: fiche.id,
    nom: fiche.nom || "Client",
    adresse: fiche.adresse || "",
    ville: fiche.ville || "",
    codePostal: fiche.codePostal || "",
    dateVisite: fiche.dateVisite || fiche.createdAt || "",
    surfaceHabitable: fiche.surfaceHabitable ?? null,
    hauteurSousPlafond: fiche.hauteurSousPlafond ?? null,
    surfaceCombles: fiche.surfaceCombles ?? null,
    objectifLabel: fiche.objectifLabel || "",
    galerie,
    source: "releve-terrain-catarina",
    origine: "releve-terrain-catarina",
  };
}

export async function chargerRelevesTransmis() {
  const locaux = lireProjetsManuels().filter(estReleveTerrain);
  const parId = new Map();

  for (const projet of locaux) {
    let galerie = galerieDepuisProjet(projet);
    if (!galerie.length) galerie = await lirePhotosLocales(projet.id);
    parId.set(projet.id, { ...projet, galerie: trierGalerie(galerie) });
  }

  let distants = [];
  try {
    distants = distants.concat(await relevesDepuisApi());
  } catch {
    /* pas d'API */
  }
  try {
    distants = distants.concat(await relevesDepuisSupabase());
  } catch {
    /* pas de bucket */
  }

  for (const brut of distants) {
    const distant = normaliserDistant(brut);
    if (!distant) continue;
    const existant = parId.get(distant.id);
    if (!existant) {
      parId.set(distant.id, distant);
      continue;
    }
    const galerie = existant.galerie?.length ? existant.galerie : distant.galerie;
    parId.set(distant.id, {
      ...distant,
      ...existant,
      surfaceHabitable: existant.surfaceHabitable ?? distant.surfaceHabitable,
      hauteurSousPlafond: existant.hauteurSousPlafond ?? distant.hauteurSousPlafond,
      surfaceCombles: existant.surfaceCombles ?? distant.surfaceCombles,
      galerie,
    });
  }

  return [...parId.values()].sort((a, b) =>
    String(b.dateVisite || b.createdAt || "").localeCompare(String(a.dateVisite || a.createdAt || "")),
  );
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(octets) {
  let c = 0xffffffff;
  for (let i = 0; i < octets.length; i += 1) c = CRC_TABLE[(c ^ octets[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function dataUrlVersOctets(dataUrl) {
  const base64 = String(dataUrl).split(",")[1] || "";
  const binaire = atob(base64);
  const octets = new Uint8Array(binaire.length);
  for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i);
  return octets;
}

async function srcVersOctets(src) {
  if (String(src).startsWith("data:")) return dataUrlVersOctets(src);
  const reponse = await fetch(src);
  if (!reponse.ok) throw new Error("photo illisible");
  return new Uint8Array(await reponse.arrayBuffer());
}

function nomFichierPhoto(index, photo) {
  const base = String(photo.label || photo.id || "photo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return `${String(index + 1).padStart(2, "0")}-${base || "photo"}.jpg`;
}

export async function creerZipPhotos(photos) {
  const fichiers = [];
  for (let i = 0; i < photos.length; i += 1) {
    const octets = await srcVersOctets(photos[i].src);
    fichiers.push({ nom: nomFichierPhoto(i, photos[i]), octets });
  }

  const locaux = [];
  const centraux = [];
  let offset = 0;
  const encodeur = new TextEncoder();

  for (const fichier of fichiers) {
    const nom = encodeur.encode(fichier.nom);
    const crc = crc32(fichier.octets);
    const local = new Uint8Array(30 + nom.length);
    const vue = new DataView(local.buffer);
    vue.setUint32(0, 0x04034b50, true);
    vue.setUint16(4, 20, true);
    vue.setUint16(8, 0, true);
    vue.setUint32(14, crc, true);
    vue.setUint32(18, fichier.octets.length, true);
    vue.setUint32(22, fichier.octets.length, true);
    vue.setUint16(26, nom.length, true);
    local.set(nom, 30);
    locaux.push(local, fichier.octets);

    const central = new Uint8Array(46 + nom.length);
    const vueCentrale = new DataView(central.buffer);
    vueCentrale.setUint32(0, 0x02014b50, true);
    vueCentrale.setUint16(4, 20, true);
    vueCentrale.setUint16(6, 20, true);
    vueCentrale.setUint32(16, crc, true);
    vueCentrale.setUint32(20, fichier.octets.length, true);
    vueCentrale.setUint32(24, fichier.octets.length, true);
    vueCentrale.setUint16(28, nom.length, true);
    vueCentrale.setUint32(42, offset, true);
    central.set(nom, 46);
    centraux.push(central);
    offset += local.length + fichier.octets.length;
  }

  const tailleCentrale = centraux.reduce((total, bloc) => total + bloc.length, 0);
  const fin = new Uint8Array(22);
  const vueFin = new DataView(fin.buffer);
  vueFin.setUint32(0, 0x06054b50, true);
  vueFin.setUint16(8, fichiers.length, true);
  vueFin.setUint16(10, fichiers.length, true);
  vueFin.setUint32(12, tailleCentrale, true);
  vueFin.setUint32(16, offset, true);

  return new Blob([...locaux, ...centraux, fin], { type: "application/zip" });
}

export async function telechargerZipPhotos(nomFichier, photos) {
  const blob = await creerZipPhotos(photos);
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = nomFichier;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export function convertirPhotoHauteResolution(file) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || "").startsWith("image/")) {
      reject(new Error("Choisissez une photo."));
      return;
    }
    const conserverOriginal = file.size <= 4 * 1024 * 1024 && /jpeg|jpg|png|webp/i.test(file.type || "");
    if (conserverOriginal) {
      const lecteur = new FileReader();
      lecteur.onload = () => resolve(String(lecteur.result || ""));
      lecteur.onerror = () => reject(new Error("Photo illisible. Reprenez-la en JPEG."));
      lecteur.readAsDataURL(file);
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 3200;
      const ratio = Math.min(1, max / Math.max(image.width, image.height, 1));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Aperçu impossible sur cet appareil."));
        return;
      }
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.9));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Photo illisible. Reprenez-la en JPEG."));
    };
    image.src = url;
  });
}
