import { useEffect, useMemo, useRef, useState } from "react";
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ouvrirMessagerie } from "../messaging/navigation";

type MetierId = "menuiseries" | "pac" | "pv" | "isolation" | "bois" | "vmc";

type LabelRge = {
  nom: string;
  certificat: string;
  validite: string;
};

type ArtisanRadar = {
  id: string;
  nom: string;
  siret: string;
  telephone: string;
  email: string;
  adresse: string;
  codePostal: string;
  commune: string;
  lat: number;
  lon: number;
  labels: LabelRge[];
  metiers: MetierId[];
  partenaire: boolean;
};

type Centre = {
  lat: number;
  lon: number;
  libelle: string;
};

type LigneAdeme = {
  nom_entreprise?: string;
  siret?: string;
  adresse?: string;
  code_postal?: string;
  commune?: string;
  latitude?: number;
  longitude?: number;
  telephone?: string;
  email?: string;
  domaine?: string;
  nom_qualification?: string;
  nom_certificat?: string;
  lien_date_fin?: string;
};

type ChantierRadar = {
  id: string;
  nom: string;
  ville: string;
  codePostal: string;
  adresse: string;
};

type LotConsultation = {
  id: string;
  code: string;
  libelle: string;
  metier: MetierId;
  dtu: string;
};

type FavoriReseau = {
  id: string;
  nom: string;
  siret: string;
  email: string;
  telephone: string;
  commune: string;
  ajouteLe: string;
};

type Coordonnees = {
  email: string;
  telephone: string;
};

const ADEME_URL = "https://data.ademe.fr/data-fair/api/v1/datasets/liste-des-entreprises-rge-2/lines";
const CLE_RESEAU = "energia-radar-rge-reseau-v1";
const CLE_CONTACTS = "energia-radar-rge-contacts-v1";
const RAYONS = [10, 20, 30, 50] as const;

const METIERS: { id: MetierId; emoji: string; label: string; requete: string; mots: string[] }[] = [
  {
    id: "menuiseries",
    emoji: "🪟",
    label: "Menuiseries extérieures",
    requete: "fenêtre",
    mots: ["fenetre", "fenêtre", "volet", "menuiser"],
  },
  {
    id: "pac",
    emoji: "❄️",
    label: "Pompes à chaleur",
    requete: "pompe à chaleur",
    mots: ["pompe", "qualipac", "climatisation", "fluide"],
  },
  {
    id: "pv",
    emoji: "☀️",
    label: "Solaire photovoltaïque",
    requete: "photovoltaïque",
    mots: ["photovolta", "qualipv"],
  },
  {
    id: "isolation",
    emoji: "🏠",
    label: "Isolation combles & ITE",
    requete: "isolation",
    mots: ["isolation", "comble", "ite", "iti"],
  },
  {
    id: "bois",
    emoji: "🪵",
    label: "Chauffage bois",
    requete: "qualibois",
    mots: ["bois", "granul", "qualibois", "poele", "poêle"],
  },
  {
    id: "vmc",
    emoji: "💨",
    label: "Ventilation VMC",
    requete: "ventilation",
    mots: ["ventilation", "vmc"],
  },
];

const CHANTIERS = [
  { id: "oussara", label: "69124 Colombier-Saugnieu", requete: "69124 Colombier-Saugnieu" },
  { id: "bussieres", label: "42510 Bussières", requete: "42510 Bussières" },
];

const CHANTIERS_OFFICIELS: ChantierRadar[] = [
  {
    id: "oussara-colombier",
    nom: "M. et Mme OUSSARA",
    ville: "Colombier-Saugnieu",
    codePostal: "69124",
    adresse: "Rue des Verchères, 69124 Colombier-Saugnieu",
  },
  {
    id: "brunel-bussieres",
    nom: "M. Emrick BRUNEL",
    ville: "Bussières",
    codePostal: "42510",
    adresse: "48 Impasse des Lagunes, 42510 Bussières",
  },
];

const LOTS: LotConsultation[] = [
  {
    id: "men",
    code: "05",
    libelle: "Menuiseries Extérieures",
    metier: "menuiseries",
    dtu: "DTU 36.5 — fourniture, livraison et pose des menuiseries extérieures",
  },
  {
    id: "combles",
    code: "09",
    libelle: "Combles Perdus",
    metier: "isolation",
    dtu: "DTU 45.11 — soufflage mécanique, laine minérale ACERMI R ≥ 7,50 m²·K/W",
  },
  {
    id: "ite",
    code: "02",
    libelle: "Isolation des murs (ITE / ITI)",
    metier: "isolation",
    dtu: "DTU 45.4 (ITE) ou DTU 25.41 (ITI)",
  },
  {
    id: "pac",
    code: "06",
    libelle: "Pompe à chaleur",
    metier: "pac",
    dtu: "DTU 65.16",
  },
  {
    id: "vmc",
    code: "08",
    libelle: "Ventilation VMC",
    metier: "vmc",
    dtu: "DTU 68.3",
  },
  {
    id: "pv",
    code: "07",
    libelle: "Solaire photovoltaïque",
    metier: "pv",
    dtu: "guide UTE C 15-712-1",
  },
  {
    id: "bois",
    code: "04",
    libelle: "Chauffage bois",
    metier: "bois",
    dtu: "DTU 24.1",
  },
];

const RESEAU_LOCAL: ArtisanRadar[] = [
  {
    id: "bmi-mohamed",
    nom: "BMI — Mohamed BENAOUDA",
    siret: "48832778400010",
    telephone: "",
    email: "",
    adresse: "5 Grande Rue",
    codePostal: "71260",
    commune: "LUGNY",
    lat: 46.473,
    lon: 4.813,
    partenaire: true,
    metiers: ["isolation"],
    labels: [{ nom: "ITI plâtrerie", certificat: "Réseau ENERGIA", validite: "2026-10-31" }],
  },
  {
    id: "hezen-mustafa",
    nom: "HEZEN MUSTAFA",
    siret: "84821544800010",
    telephone: "",
    email: "contact@hezen-macon.fr",
    adresse: "96 Rue du Beaujolais",
    codePostal: "71000",
    commune: "MÂCON",
    lat: 46.307,
    lon: 4.831,
    partenaire: true,
    metiers: ["isolation"],
    labels: [{ nom: "Façade & ITE", certificat: "Réseau ENERGIA", validite: "2027-06-30" }],
  },
  {
    id: "c2l",
    nom: "C2L Isolation",
    siret: "53461962200101",
    telephone: "",
    email: "",
    adresse: "14 Rue Edouard Garet",
    codePostal: "42160",
    commune: "ANDRÉZIEUX-BOUTHÉON",
    lat: 45.526,
    lon: 4.261,
    partenaire: true,
    metiers: ["isolation"],
    labels: [{ nom: "Combles perdus & ITE", certificat: "RGE Qualibat", validite: "2027-12-31" }],
  },
  {
    id: "smn",
    nom: "SMN ENERGIES",
    siret: "994321883",
    telephone: "",
    email: "",
    adresse: "388 Avenue Charles de Gaulle",
    codePostal: "69200",
    commune: "VÉNISSIEUX",
    lat: 45.697,
    lon: 4.886,
    partenaire: true,
    metiers: ["pac", "vmc"],
    labels: [{ nom: "PAC air/eau & VMC", certificat: "RGE QualiPAC", validite: "2027-12-31" }],
  },
  {
    id: "lyon-fenetres",
    nom: "LYON FENETRES",
    siret: "39804950200030",
    telephone: "04 78 90 77 71",
    email: "florent.murard@lyonfenetres.com",
    adresse: "14 RUE CHAMP DOLIN",
    codePostal: "69800",
    commune: "SAINT-PRIEST",
    lat: 45.711695,
    lon: 4.966296,
    partenaire: false,
    metiers: ["menuiseries"],
    labels: [{ nom: "Menuiseries extérieures", certificat: "RGE Qualibat", validite: "2027-09-08" }],
  },
  {
    id: "reynaud",
    nom: "REYNAUD FENETRES",
    siret: "80935166100016",
    telephone: "04 72 47 64 30",
    email: "compta@reynaud-fenetres.fr",
    adresse: "290 RUE FERDINAND PERRIER",
    codePostal: "69800",
    commune: "SAINT-PRIEST",
    lat: 45.704594,
    lon: 4.985463,
    partenaire: false,
    metiers: ["menuiseries"],
    labels: [{ nom: "Menuiseries extérieures", certificat: "RGE Qualibat", validite: "2027-11-23" }],
  },
  {
    id: "esprit",
    nom: "ESPRIT-FENETRES",
    siret: "79110297300025",
    telephone: "04 37 48 39 70",
    email: "esprit-fenetres-jc@orange.fr",
    adresse: "31 RUE WILSON",
    codePostal: "69150",
    commune: "DECINES-CHARPIEU",
    lat: 45.766321,
    lon: 4.94466,
    partenaire: false,
    metiers: ["menuiseries"],
    labels: [{ nom: "Menuiseries extérieures", certificat: "RGE Qualibat", validite: "2030-12-01" }],
  },
  {
    id: "afr",
    nom: "A F R",
    siret: "39260245400010",
    telephone: "04 78 54 73 67",
    email: "maxime.virot@afr-clim.com",
    adresse: "255 route de Genas",
    codePostal: "69100",
    commune: "VILLEURBANNE",
    lat: 45.751672,
    lon: 4.904939,
    partenaire: false,
    metiers: ["pac"],
    labels: [{ nom: "QualiPAC chauffage", certificat: "RGE QualiPAC", validite: "2027-11-09" }],
  },
  {
    id: "e2s",
    nom: "E 2 S",
    siret: "40846821300124",
    telephone: "06 59 58 95 63",
    email: "nathalie.romero@e2s.fr",
    adresse: "33 AVENUE DU DOCTEUR GEORGES LEVY",
    codePostal: "69200",
    commune: "VENISSIEUX",
    lat: 45.720391,
    lon: 4.861032,
    partenaire: false,
    metiers: ["pac"],
    labels: [{ nom: "Pompe à chaleur", certificat: "RGE Qualibat", validite: "2028-12-09" }],
  },
  {
    id: "romain",
    nom: "ROMAIN ISOLATION",
    siret: "51784003900039",
    telephone: "04 72 57 68 90",
    email: "romain@romainisolation.com",
    adresse: "26 AVENUE PABLO PICASSO",
    codePostal: "69120",
    commune: "VAULX-EN-VELIN",
    lat: 45.774569,
    lon: 4.91868,
    partenaire: false,
    metiers: ["isolation"],
    labels: [{ nom: "Combles & ITI", certificat: "RGE Qualibat", validite: "2029-04-21" }],
  },
  {
    id: "thermaia",
    nom: "Thermaïa",
    siret: "91424488400013",
    telephone: "04 51 24 52 70",
    email: "administratif@thermaia.fr",
    adresse: "14 rue Saint-Maurice",
    codePostal: "69008",
    commune: "LYON",
    lat: 45.75,
    lon: 4.85,
    partenaire: false,
    metiers: ["vmc"],
    labels: [{ nom: "Ventilation double flux", certificat: "Ventilation +", validite: "2026-12-25" }],
  },
  {
    id: "batiecotherm",
    nom: "BATIECOTHERM",
    siret: "81226513000029",
    telephone: "04 74 37 38 58",
    email: "nicola.cardullo@batiecotherm.fr",
    adresse: "Chemin des Bolonières",
    codePostal: "01500",
    commune: "AMBUTRIX",
    lat: 45.939977,
    lon: 5.334009,
    partenaire: false,
    metiers: ["bois"],
    labels: [{ nom: "Poêle et chaudière bois", certificat: "RGE Qualibois", validite: "2027-03-26" }],
  },
  {
    id: "oxalis",
    nom: "OXALIS TROISIEME FLEUVE",
    siret: "41082947700166",
    telephone: "",
    email: "",
    adresse: "10 avenue des Canuts",
    codePostal: "69120",
    commune: "VAULX EN VELIN",
    lat: 45.785907,
    lon: 4.926825,
    partenaire: false,
    metiers: ["pv"],
    labels: [{ nom: "Étude solaire photovoltaïque", certificat: "Certificat OPQIBI", validite: "2028-06-01" }],
  },
];

function normaliser(valeur: string) {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

function formaterKm(km: number) {
  if (km < 1) return `${Math.max(0.1, km).toFixed(1)} km`;
  return `${km.toFixed(1)} km`;
}

function formaterValidite(iso: string) {
  const annee = Number(iso.slice(0, 4));
  if (!iso || Number.isNaN(annee)) return "date non publiée";
  if (annee >= 2090) return "validité ouverte";
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}/${m}/${y}` : iso;
}

function telephoneAppelable(telephone: string) {
  const chiffres = telephone.replace(/\D/g, "");
  if (chiffres.length < 10) return "";
  if (chiffres.endsWith("0000000000")) return "";
  return telephone.replace(/\s/g, "");
}

function metiersDepuisTexte(texte: string): MetierId[] {
  const clair = normaliser(texte);
  return METIERS.filter((metier) => metier.mots.some((mot) => clair.includes(normaliser(mot)))).map((metier) => metier.id);
}

function badgeCertificat(certificat: string) {
  const clair = normaliser(certificat);
  if (clair.includes("qualipac")) return "RGE QualiPAC";
  if (clair.includes("qualipv") || clair.includes("photovolta")) return "RGE QualiPV";
  if (clair.includes("qualibois") || clair.includes("bois")) return "RGE Qualibois";
  if (clair.includes("ventilation")) return "RGE Ventilation";
  if (clair.includes("qualibat") || clair.includes("certibat")) return "RGE Qualibat";
  return certificat || "RGE";
}

function icone(emoji: string, fond: string) {
  return L.divIcon({
    className: "radar-rge-icone",
    html: `<span style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:999px;background:${fond};border:2px solid #ecfdf5;box-shadow:0 6px 16px rgba(0,0,0,.45);font-size:16px;">${emoji}</span>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -16],
  });
}

const ICONE_CHANTIER = icone("📍", "#2563eb");

function emojiMetier(metiers: MetierId[]) {
  return METIERS.find((metier) => metiers.includes(metier.id))?.emoji || "🛠️";
}

function lireContacts(): Record<string, Coordonnees> {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_CONTACTS) || "{}");
    return brut && typeof brut === "object" ? brut : {};
  } catch {
    return {};
  }
}

function enregistrerContacts(contacts: Record<string, Coordonnees>) {
  localStorage.setItem(CLE_CONTACTS, JSON.stringify(contacts));
}

function avecCoordonnees(artisan: ArtisanRadar, contacts: Record<string, Coordonnees>): ArtisanRadar {
  const extra = contacts[artisan.id];
  if (!extra) return artisan;
  return { ...artisan, email: extra.email ?? artisan.email, telephone: extra.telephone ?? artisan.telephone };
}

function lireFavoris(): FavoriReseau[] {
  try {
    const brut = JSON.parse(localStorage.getItem(CLE_RESEAU) || "[]");
    if (!Array.isArray(brut)) return [];
    return brut
      .map((item) => {
        if (typeof item === "string") {
          return { id: item, nom: "", siret: item, email: "", telephone: "", commune: "", ajouteLe: "" };
        }
        if (!item || typeof item.id !== "string") return null;
        return item as FavoriReseau;
      })
      .filter((item): item is FavoriReseau => Boolean(item));
  } catch {
    return [];
  }
}

function estOussara(chantier: ChantierRadar) {
  return /oussara/i.test(`${chantier.id} ${chantier.nom}`);
}

function villeAffichee(ville: string, codePostal: string) {
  let texte = ville.trim();
  if (codePostal && texte.startsWith(codePostal)) texte = texte.slice(codePostal.length).trim();
  return texte.replace(/^\d{5}\s+/, "") || ville.trim();
}

function memeChantier(a: ChantierRadar, b: ChantierRadar) {
  if (a.id && a.id === b.id) return true;
  const gauche = normaliser(a.nom);
  const droite = normaliser(b.nom);
  if (gauche.includes("oussara") && droite.includes("oussara")) return true;
  if (gauche.includes("brunel") && droite.includes("brunel")) return true;
  return false;
}

function fusionnerChantiers(recus: ChantierRadar[]) {
  const liste = CHANTIERS_OFFICIELS.map((chantier) => ({ ...chantier }));
  recus.forEach((item) => {
    if (!item?.nom || liste.some((chantier) => memeChantier(chantier, item))) return;
    liste.push({
      ...item,
      ville: villeAffichee(item.ville, item.codePostal),
    });
  });
  return liste;
}

function lotDepuisMetier(metier?: MetierId) {
  if (metier === "isolation") return "combles";
  return LOTS.find((lot) => lot.metier === metier)?.id || "men";
}

function montantLot(chantier: ChantierRadar | undefined, lot: LotConsultation | undefined) {
  if (!chantier || !lot || !estOussara(chantier)) return "";
  if (lot.id === "men") return "10500";
  if (lot.id === "combles") return "1000";
  return "";
}

function euroHt(valeur: string) {
  const nombre = Number(String(valeur).replace(/\s/g, "").replace(",", "."));
  if (!Number.isFinite(nombre) || nombre <= 0) return "à confirmer";
  return `${new Intl.NumberFormat("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(nombre)} € HT`;
}

type PieceJointe = {
  id: string;
  name: string;
  url: string;
  selected: boolean;
  contenuBase64?: string;
};

const TAILLE_MAX_JOINT = 4_000_000;

function bdcPourLot(chantier: ChantierRadar | undefined, lot: LotConsultation | undefined) {
  if (!chantier || !lot || !estOussara(chantier)) return null;
  if (lot.id === "men") {
    return { nom: "BDC-ST-2026-OUSSARA-MEN-01.pdf", url: "/documents/BDC-ST-2026-OUSSARA-MEN-01.pdf" };
  }
  if (lot.id === "combles") {
    return { nom: "BDC-ST-2026-OUSSARA-ISO-01.pdf", url: "/documents/BDC-ST-2026-OUSSARA-ISO-01.pdf" };
  }
  return null;
}

function piecesParDefaut(chantier: ChantierRadar | undefined, lot: LotConsultation | undefined): PieceJointe[] {
  const pieces: PieceJointe[] = [];
  const bdc = bdcPourLot(chantier, lot);
  if (bdc && lot) {
    pieces.push({ id: `bdc-${lot.id}`, name: bdc.nom, url: bdc.url, selected: true });
  }
  if (chantier && lot?.id === "men" && estOussara(chantier)) {
    pieces.push({
      id: "plans-oussara",
      name: "OUSSARA-PLANS-TECHNIQUES.pdf",
      url: "/documents/OUSSARA-PLANS.pdf",
      selected: true,
    });
  }
  return pieces;
}

function bufferVersBase64(buffer: ArrayBuffer) {
  const octets = new Uint8Array(buffer);
  let binaire = "";
  for (let index = 0; index < octets.length; index += 0x8000) {
    binaire += String.fromCharCode(...octets.subarray(index, index + 0x8000));
  }
  return btoa(binaire);
}

async function fichierVersJoint(fichier: File): Promise<PieceJointe> {
  const nom = fichier.name.replace(/[^\w.\- ()àâäéèêëïîôùûüç]/gi, "").slice(0, 80) || "piece-jointe";
  return {
    id: crypto.randomUUID(),
    name: nom,
    url: URL.createObjectURL(fichier),
    selected: true,
    contenuBase64: bufferVersBase64(await fichier.arrayBuffer()),
  };
}

function sujetConsultation(chantier: ChantierRadar | undefined) {
  const ville = chantier?.ville || "chantier";
  return `[APPEL D'OFFRES FOURNITURE & POSE] Consultation chantier ${ville} - ENERGIA CONSEIL IA`;
}

function corpsConsultation(artisan: ArtisanRadar, chantier: ChantierRadar | undefined, lot: LotConsultation | undefined, montant: string) {
  const lieu = chantier ? `${chantier.nom} — ${chantier.ville}${chantier.codePostal ? ` (${chantier.codePostal})` : ""}` : "chantier à préciser";
  const lotLibelle = lot ? `Lot ${lot.code} - ${lot.libelle}` : "lot à préciser";
  return [
    "Bonjour,",
    "",
    `ENERGIA CONSEIL IA® consulte ${artisan.nom} (SIRET ${artisan.siret}) pour un marché forfaitaire de sous-traitance en Fourniture & Pose.`,
    "",
    `Chantier : ${lieu}`,
    chantier?.adresse ? `Adresse : ${chantier.adresse}` : "",
    `Lot : ${lotLibelle}`,
    lot ? `Exigence de fourniture : ${lot.dtu}.` : "",
    `Enveloppe marché sous-traitance : ${euroHt(montant)}.`,
    "",
    "La prestation comprend la fourniture selon le DTU applicable, la pose et la garantie décennale couvrant la fourniture et la pose, ainsi que la RC Pro.",
    "Merci de nous adresser sous 48 h votre offre chiffrée HT et votre délai d'intervention, avec vos attestations RGE, décennale et RC Pro en cours de validité.",
    "TVA autoliquidée par le preneur assujetti (art. 283-2 nonies du CGI). Les prix de vente client ne sont pas communiqués.",
    "",
    "Pièces jointes :",
    "- Bon de commande de sous-traitance Fourniture & Pose (PDF joint)",
    "- Plans et métrés techniques",
    "- Photos du tableau et de la façade, si jointes",
    "",
    "Cordialement,",
    "Sylvain LEMBELEMBE",
    "ENERGIA CONSEIL IA®",
    "06 10 59 68 98 — contact@energia-conseil-ia.com",
  ]
    .filter(Boolean)
    .join("\n");
}

function bboxDepuisRayon(lat: number, lon: number, km: number) {
  const dLat = km / 111;
  const dLon = km / (111 * Math.max(0.2, Math.cos((lat * Math.PI) / 180)));
  return [lon - dLon, lat - dLat, lon + dLon, lat + dLat].join(",");
}

async function geocoder(requete: string): Promise<Centre> {
  const reponse = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(requete)}&limit=1`);
  if (!reponse.ok) throw new Error("geocodage");
  const json = await reponse.json();
  const feature = json?.features?.[0];
  const [lon, lat] = feature?.geometry?.coordinates || [];
  if (typeof lat !== "number" || typeof lon !== "number") throw new Error("adresse introuvable");
  return { lat, lon, libelle: feature.properties?.label || requete };
}

async function interrogerAdeme(centre: Centre, rayon: number, metiers: MetierId[]): Promise<ArtisanRadar[]> {
  const choisis = METIERS.filter((metier) => metiers.includes(metier.id));
  const pages = await Promise.all(
    choisis.map(async (metier) => {
      const params = new URLSearchParams({
        size: "80",
        q: metier.requete,
        bbox: bboxDepuisRayon(centre.lat, centre.lon, rayon),
        select:
          "nom_entreprise,siret,adresse,code_postal,commune,latitude,longitude,telephone,email,domaine,nom_qualification,nom_certificat,lien_date_fin",
      });
      const reponse = await fetch(`${ADEME_URL}?${params}`, { signal: AbortSignal.timeout(12000) });
      if (!reponse.ok) throw new Error(`ademe ${reponse.status}`);
      const json = await reponse.json();
      return (json?.results || []) as LigneAdeme[];
    }),
  );
  const parSiret = new Map<string, ArtisanRadar>();
  pages.flat().forEach((ligne) => {
    if (typeof ligne.latitude !== "number" || typeof ligne.longitude !== "number") return;
    const cle = ligne.siret || `${ligne.nom_entreprise}-${ligne.latitude}`;
    const texte = `${ligne.domaine || ""} ${ligne.nom_qualification || ""} ${ligne.nom_certificat || ""}`;
    const metiersLigne = metiersDepuisTexte(texte);
    const label: LabelRge = {
      nom: ligne.nom_qualification || ligne.domaine || "Qualification RGE",
      certificat: badgeCertificat(ligne.nom_certificat || ligne.domaine || ""),
      validite: ligne.lien_date_fin || "",
    };
    const existant = parSiret.get(cle);
    if (existant) {
      existant.metiers = Array.from(new Set([...existant.metiers, ...metiersLigne]));
      if (!existant.labels.some((item) => item.nom === label.nom)) existant.labels.push(label);
      if (!existant.telephone && ligne.telephone) existant.telephone = ligne.telephone;
      if (!existant.email && ligne.email) existant.email = ligne.email;
      return;
    }
    parSiret.set(cle, {
      id: cle,
      nom: ligne.nom_entreprise || "Artisan RGE",
      siret: ligne.siret || "—",
      telephone: ligne.telephone || "",
      email: ligne.email || "",
      adresse: ligne.adresse || "",
      codePostal: ligne.code_postal || "",
      commune: ligne.commune || "",
      lat: ligne.latitude,
      lon: ligne.longitude,
      labels: [label],
      metiers: metiersLigne,
      partenaire: false,
    });
  });
  return Array.from(parSiret.values());
}

function filtrer(artisans: ArtisanRadar[], centre: Centre, rayon: number, metiers: MetierId[]) {
  return artisans
    .map((artisan) => ({ artisan, km: distanceKm(centre.lat, centre.lon, artisan.lat, artisan.lon) }))
    .filter(({ artisan, km }) => km <= rayon + 0.4 && artisan.metiers.some((metier) => metiers.includes(metier)))
    .sort((a, b) => a.km - b.km)
    .slice(0, 80);
}

function CadreCarte({ centre, zoom }: { centre: [number, number]; zoom: number }) {
  const carte = useMap();
  useEffect(() => {
    carte.setView(centre, zoom);
  }, [carte, centre, zoom]);
  return null;
}

function ModaleConsultation({
  artisan,
  chantiers,
  centre,
  recherche,
  metier,
  onFermer,
  onCoordonnees,
}: {
  artisan: ArtisanRadar;
  chantiers: ChantierRadar[];
  centre: Centre | null;
  recherche: string;
  metier?: MetierId;
  onFermer: () => void;
  onCoordonnees: (email: string, telephone: string) => void;
}) {
  const depart = useMemo(() => {
    const texte = `${centre?.libelle || ""} ${recherche}`.toLowerCase();
    return (
      chantiers.find((chantier) => {
        const ville = chantier.ville.toLowerCase();
        return (ville && texte.includes(ville)) || (chantier.codePostal && texte.includes(chantier.codePostal));
      })?.id ||
      chantiers.find((item) => estOussara(item))?.id ||
      chantiers[0]?.id ||
      ""
    );
  }, [centre, recherche, chantiers]);
  const [chantierId, setChantierId] = useState(depart);
  const [lotId, setLotId] = useState(lotDepuisMetier(metier));
  const [email, setEmail] = useState(artisan.email);
  const [telephone, setTelephone] = useState(artisan.telephone);
  const [copie, setCopie] = useState("");
  const [erreur, setErreur] = useState("");
  const [depotActif, setDepotActif] = useState(false);
  const [preparation, setPreparation] = useState(false);
  const ajoutRef = useRef<HTMLInputElement | null>(null);
  const chantier = chantiers.find((item) => item.id === chantierId) || chantiers[0];
  const lot = LOTS.find((item) => item.id === lotId) || LOTS[0];
  const [montant, setMontant] = useState(() => montantLot(chantier, lot));
  const [sujet, setSujet] = useState(() => sujetConsultation(chantier));
  const [corps, setCorps] = useState(() => corpsConsultation(artisan, chantier, lot, montantLot(chantier, lot)));
  const [attachments, setAttachments] = useState<PieceJointe[]>(() => piecesParDefaut(chantier, lot));

  useEffect(() => {
    const courant = chantiers.find((item) => item.id === chantierId) || chantiers[0];
    const lotCourant = LOTS.find((item) => item.id === lotId) || LOTS[0];
    const suivant = montantLot(courant, lotCourant);
    setMontant(suivant);
    setSujet(sujetConsultation(courant));
    setCorps(corpsConsultation(artisan, courant, lotCourant, suivant));
    setAttachments((liste) => [...piecesParDefaut(courant, lotCourant), ...liste.filter((item) => item.contenuBase64)]);
    // Le tableau chantiers change d'identité à chaque rendu du CRM : on ne réécrit le message qu'au changement de lot ou de chantier.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [artisan, chantierId, lotId]);

  useEffect(() => {
    const fermer = (event: KeyboardEvent) => {
      if (event.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", fermer);
    return () => window.removeEventListener("keydown", fermer);
  }, [onFermer]);

  const actualiserMontant = (valeur: string) => {
    setMontant(valeur);
    setCorps(corpsConsultation(artisan, chantier, lot, valeur));
  };

  const ajouterDocuments = async (liste: FileList | null) => {
    const fichiers = Array.from(liste || []);
    if (ajoutRef.current) ajoutRef.current.value = "";
    if (fichiers.length === 0) return;
    const retenus: PieceJointe[] = [];
    for (const fichier of fichiers) {
      if (fichier.size > TAILLE_MAX_JOINT) {
        setErreur(`${fichier.name} dépasse 4 Mo.`);
        continue;
      }
      retenus.push(await fichierVersJoint(fichier));
    }
    if (retenus.length === 0) return;
    setAttachments((courant) => [...courant, ...retenus]);
    setErreur("");
  };

  const removeAttachment = (id: string) => {
    setAttachments((courant) => {
      const cible = courant.find((item) => item.id === id);
      if (cible?.url.startsWith("blob:")) URL.revokeObjectURL(cible.url);
      return courant.filter((item) => item.id !== id);
    });
  };

  const toggleAttachment = (id: string) => {
    setAttachments((courant) => courant.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)));
  };

  const envoyer = async () => {
    if (!email.includes("@")) {
      setErreur("Renseignez l'email de l'artisan avant l'envoi.");
      return;
    }
    setPreparation(true);
    setErreur("");
    try {
      const pieces: { nom: string; contenuBase64: string }[] = [];
      for (const fichier of attachments.filter((item) => item.selected)) {
        if (fichier.contenuBase64) {
          pieces.push({ nom: fichier.name, contenuBase64: fichier.contenuBase64 });
          continue;
        }
        const reponse = await fetch(fichier.url);
        if (!reponse.ok) throw new Error(fichier.name);
        pieces.push({ nom: fichier.name, contenuBase64: bufferVersBase64(await reponse.arrayBuffer()) });
      }
      const libelle = chantier ? `${chantier.nom} — ${chantier.ville}` : artisan.nom;
      onCoordonnees(email.trim(), telephone.trim());
      ouvrirMessagerie({
        dossierId: `radar-${artisan.siret}`,
        clientNom: libelle,
        destinataire: email.trim(),
        sujet,
        corps,
        pieces,
        dossiers: [
          {
            id: `radar-${artisan.siret}`,
            libelle,
            nom: libelle,
            civilite: "",
            email: email.trim(),
            telephone: telephone.trim(),
            ville: chantier?.ville || "",
            projet: lot ? `Lot ${lot.code} - ${lot.libelle}` : "Sous-traitance",
            lienDocument: "",
          },
        ],
        contexte: { ville: chantier?.ville, projet: lot ? `Lot ${lot.code} - ${lot.libelle}` : "Sous-traitance" },
      });
      onFermer();
    } catch {
      setErreur("Les pièces jointes n'ont pas pu être préparées.");
      setPreparation(false);
    }
  };

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(`${sujet}\n\n${corps}`);
      setCopie("Texte copié.");
      setErreur("");
    } catch {
      setCopie("");
      setErreur("La copie a échoué. Sélectionnez le message et copiez-le manuellement.");
    }
  };

  const selectionnees = attachments.filter((item) => item.selected).length;

  return (
    <div className="fixed inset-0 z-[2000] flex items-start justify-center overflow-y-auto bg-slate-950/75 p-4 backdrop-blur-sm" role="presentation" onClick={onFermer}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="radar-rge-modale-titre"
        data-testid="radar-rge-modale"
        className="my-6 w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-950 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-300">Appel d'offres fourniture & pose</p>
            <h3 id="radar-rge-modale-titre" className="mt-1 text-xl font-semibold text-white">
              {artisan.nom}
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              SIRET {artisan.siret} · {artisan.commune || "ville non publiée"}
            </p>
          </div>
          <button type="button" onClick={onFermer} className="rounded-lg border border-slate-700 px-2 py-1 text-sm text-slate-300">
            Fermer
          </button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-medium text-slate-400">
            Email
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              data-testid="radar-rge-modale-email"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs font-medium text-slate-400">
            Téléphone
            <input
              value={telephone}
              onChange={(event) => setTelephone(event.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </label>
          <label className="block text-xs font-medium text-slate-400">
            Chantier actif
            <select
              value={chantier?.id || ""}
              onChange={(event) => setChantierId(event.target.value)}
              data-testid="radar-rge-chantier-select"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {chantiers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom} - {item.ville}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-400">
            Lot technique
            <select
              value={lot.id}
              onChange={(event) => setLotId(event.target.value)}
              data-testid="radar-rge-lot-select"
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              {LOTS.map((item) => (
                <option key={item.id} value={item.id}>
                  Lot {item.code} - {item.libelle}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="mt-3 block text-xs font-medium text-slate-400">
          Enveloppe marché sous-traitance (Fourniture & Pose)
          <input
            value={montant}
            onChange={(event) => actualiserMontant(event.target.value)}
            inputMode="decimal"
            data-testid="radar-rge-montant"
            placeholder="Montant HT"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
          <span className="mt-1 block text-[11px] text-emerald-200">{euroHt(montant)}</span>
        </label>

        <label className="mt-3 block text-xs font-medium text-slate-400">
          Objet
          <input
            value={sujet}
            onChange={(event) => setSujet(event.target.value)}
            data-testid="radar-rge-sujet"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="mt-3 block text-xs font-medium text-slate-400">
          Message
          <textarea
            value={corps}
            onChange={(event) => setCorps(event.target.value)}
            data-testid="radar-rge-corps"
            rows={12}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm leading-relaxed text-slate-100"
          />
        </label>

        {erreur ? <p className="mt-2 text-sm text-rose-300">{erreur}</p> : null}
        {copie ? <p className="mt-2 text-sm text-emerald-300">{copie}</p> : null}

        <section className="mt-4 space-y-3" data-testid="radar-rge-pieces">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pièces jointes sélectionnées ({selectionnees})</p>
          <div className="space-y-2">
            {attachments.length === 0 ? <span className="text-xs text-slate-500">Aucune pièce jointe. Ajoutez un plan, un métré ou une photo.</span> : null}
            {attachments.map((file) => (
              <div key={file.id} className="flex items-center justify-between rounded-lg border border-slate-700/80 bg-slate-800/90 p-2.5">
                <div className="flex min-w-0 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={file.selected}
                    onChange={() => toggleAttachment(file.id)}
                    data-testid={file.id.startsWith("bdc-") ? "radar-rge-bdc" : `radar-rge-piece-${file.id}`}
                    className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500/20"
                  />
                  <span className="truncate text-sm font-medium text-slate-200">📄 {file.name}</span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    data-testid="radar-rge-visualiser"
                    onClick={() => window.open(file.url, "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
                  >
                    👁️ Visualiser
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    title="Supprimer"
                    aria-label={`Supprimer ${file.name}`}
                    className="rounded p-1 text-xs text-rose-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
          <label
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors ${depotActif ? "border-emerald-500/50 bg-slate-800/70" : "border-slate-700 bg-slate-800/40 hover:border-emerald-500/50 hover:bg-slate-800/70"}`}
            onDragOver={(event) => {
              event.preventDefault();
              setDepotActif(true);
            }}
            onDragLeave={() => setDepotActif(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDepotActif(false);
              void ajouterDocuments(event.dataTransfer.files);
            }}
          >
            <span className="text-xs font-semibold text-emerald-400">+ Ajouter d'autres documents (plans, métrés, photos)</span>
            <span className="mt-0.5 text-[11px] text-slate-400">Sélectionne un ou plusieurs fichiers à la fois. 4 Mo maximum.</span>
            <input
              ref={ajoutRef}
              type="file"
              multiple
              data-testid="radar-rge-ajouter-document"
              className="hidden"
              onChange={(event) => void ajouterDocuments(event.target.files)}
            />
          </label>
        </section>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => void envoyer()} disabled={preparation} data-testid="radar-rge-envoyer" className="rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60">
            {preparation ? "Préparation…" : "✉️ Envoyer via EmailHub"}
          </button>
          <button type="button" onClick={copier} data-testid="radar-rge-copier" className="rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100">
            📋 Copier le texte du message
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RadarRge({ chantiers = [] }: { chantiers?: Partial<ChantierRadar>[] }) {
  const [recherche, setRecherche] = useState("69124 Colombier-Saugnieu");
  const [rayon, setRayon] = useState<(typeof RAYONS)[number]>(20);
  const [metiers, setMetiers] = useState<MetierId[]>(["menuiseries"]);
  const [centre, setCentre] = useState<Centre | null>(null);
  const [resultats, setResultats] = useState<{ artisan: ArtisanRadar; km: number }[]>([]);
  const [chargement, setChargement] = useState(false);
  const [message, setMessage] = useState("");
  const [source, setSource] = useState<"ademe" | "reseau" | "">("");
  const [favoris, setFavoris] = useState<FavoriReseau[]>(() => lireFavoris());
  const [contacts, setContacts] = useState<Record<string, Coordonnees>>(() => lireContacts());
  const [consultation, setConsultation] = useState<{ artisan: ArtisanRadar; metier?: MetierId } | null>(null);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [brouillon, setBrouillon] = useState<Coordonnees>({ email: "", telephone: "" });
  const [chantierIndex, setChantierIndex] = useState(0);
  const serie = useRef(0);
  const chantiersDispo = useMemo(
    () =>
      fusionnerChantiers(
        chantiers
          .filter((item) => item?.nom)
          .map((item) => ({
            id: item.id || item.nom || "",
            nom: item.nom || "",
            ville: item.ville || "",
            codePostal: item.codePostal || "",
            adresse: item.adresse || "",
          })),
      ),
    [chantiers],
  );
  const fiches = useMemo(
    () => resultats.map(({ artisan, km }) => ({ km, artisan: avecCoordonnees(artisan, contacts) })),
    [resultats, contacts],
  );

  const zoom = rayon <= 10 ? 12 : rayon <= 20 ? 11 : rayon <= 30 ? 10 : 9;
  const position = useMemo<[number, number]>(() => (centre ? [centre.lat, centre.lon] : [45.75, 4.85]), [centre]);

  const lancer = async (texte: string, rayonKm: number, metiersActifs: MetierId[]) => {
    const requete = texte.trim();
    if (!requete) {
      setMessage("Indiquez une ville ou un code postal.");
      return;
    }
    if (metiersActifs.length === 0) {
      setMessage("Choisissez au moins un corps d'état.");
      return;
    }
    const ticket = ++serie.current;
    setChargement(true);
    setMessage("");
    try {
      const lieu = await geocoder(requete);
      if (ticket !== serie.current) return;
      setCentre(lieu);
      try {
        const trouves = await interrogerAdeme(lieu, rayonKm, metiersActifs);
        if (ticket !== serie.current) return;
        const visibles = filtrer(trouves, lieu, rayonKm, metiersActifs);
        setResultats(visibles);
        setSource("ademe");
        setMessage(
          visibles.length >= 80
            ? `80 artisans RGE affichés dans un rayon de ${rayonKm} km (plafond de la recherche).`
            : visibles.length
              ? `${visibles.length} artisan${visibles.length > 1 ? "s" : ""} RGE dans un rayon de ${rayonKm} km.`
              : `Aucun artisan RGE pour ce filtre dans un rayon de ${rayonKm} km.`,
        );
      } catch {
        if (ticket !== serie.current) return;
        const visibles = filtrer(RESEAU_LOCAL, lieu, rayonKm, metiersActifs);
        setResultats(visibles);
        setSource("reseau");
        setMessage(
          visibles.length
            ? `Annuaire ADEME indisponible. ${visibles.length} fiche${visibles.length > 1 ? "s" : ""} du réseau local dans le rayon.`
            : "Annuaire ADEME indisponible, et aucun artisan du réseau local dans ce rayon.",
        );
      }
    } catch {
      if (ticket !== serie.current) return;
      setCentre(null);
      setResultats([]);
      setSource("");
      setMessage("Impossible de localiser cette ville ou ce code postal.");
    } finally {
      if (ticket === serie.current) setChargement(false);
    }
  };

  useEffect(() => {
    lancer(recherche, rayon, metiers);
    // Recherche initiale sur le chantier Oussara.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const centrerChantier = () => {
    const chantier = CHANTIERS[chantierIndex % CHANTIERS.length];
    setChantierIndex((index) => index + 1);
    setRecherche(chantier.requete);
    lancer(chantier.requete, rayon, metiers);
  };

  const sauverCoordonnees = (id: string, email: string, telephone: string) => {
    setContacts((courant) => {
      const suivant = { ...courant, [id]: { email, telephone } };
      enregistrerContacts(suivant);
      return suivant;
    });
    setEditionId(null);
  };

  const memoriser = (artisan: ArtisanRadar) => {
    setFavoris((courant) => {
      if (courant.some((item) => item.id === artisan.id)) return courant;
      const suivant = [
        ...courant,
        {
          id: artisan.id,
          nom: artisan.nom,
          siret: artisan.siret,
          email: artisan.email,
          telephone: artisan.telephone,
          commune: artisan.commune,
          ajouteLe: new Date().toISOString(),
        },
      ];
      localStorage.setItem(CLE_RESEAU, JSON.stringify(suivant));
      return suivant;
    });
  };

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.45)] sm:p-5" data-testid="radar-rge">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300/80">Réseau & terrain</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">Radar Artisans RGE</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-400">
            Annuaire officiel ADEME, géolocalisé autour du chantier. Les prix de vente client restent hors consultation.
          </p>
        </div>
        <p className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-100">
          {favoris.length} dans mon réseau
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-[1.4fr_auto_auto]">
        <form
          className="flex gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            lancer(recherche, rayon, metiers);
          }}
        >
          <input
            value={recherche}
            onChange={(event) => setRecherche(event.target.value)}
            placeholder="Ville ou code postal"
            data-testid="radar-rge-recherche"
            className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none ring-emerald-400/40 placeholder:text-slate-500 focus:ring-2"
          />
          <button type="submit" className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950" data-testid="radar-rge-lancer">
            {chargement ? "Recherche…" : "Centrer"}
          </button>
        </form>
        <button
          type="button"
          onClick={centrerChantier}
          data-testid="radar-rge-chantier"
          className="rounded-xl border border-sky-400/40 bg-sky-400/10 px-3 py-2.5 text-sm font-semibold text-sky-100"
        >
          Chantier actif · {CHANTIERS[chantierIndex % CHANTIERS.length].label}
        </button>
        <div className="flex rounded-xl border border-slate-700 bg-slate-900 p-1" role="group" aria-label="Rayon">
          {RAYONS.map((valeur) => (
            <button
              key={valeur}
              type="button"
              data-testid={`radar-rge-rayon-${valeur}`}
              onClick={() => {
                setRayon(valeur);
                if (centre) lancer(recherche, valeur, metiers);
              }}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                rayon === valeur ? "bg-emerald-500 text-slate-950" : "text-slate-300"
              }`}
            >
              {valeur} km
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {METIERS.map((metier) => {
          const actif = metiers.includes(metier.id);
          return (
            <button
              key={metier.id}
              type="button"
              data-testid={`radar-rge-metier-${metier.id}`}
              onClick={() => {
                const suivant = actif ? metiers.filter((id) => id !== metier.id) : [...metiers, metier.id];
                setMetiers(suivant);
                if (centre && suivant.length) lancer(recherche, rayon, suivant);
              }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                actif
                  ? "border-emerald-300/60 bg-emerald-400/15 text-emerald-50"
                  : "border-slate-700 bg-slate-900 text-slate-300"
              }`}
            >
              {metier.emoji} {metier.label}
            </button>
          );
        })}
      </div>

      {message ? (
        <p className={`mt-3 text-sm ${source === "reseau" ? "text-amber-200" : "text-slate-300"}`} data-testid="radar-rge-message">
          {message}
          {source === "ademe" ? " Source : annuaire ADEME." : ""}
          {centre ? ` Repère : ${centre.libelle}.` : ""}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="h-[560px] overflow-hidden rounded-2xl border border-slate-800" data-testid="radar-rge-carte">
          <MapContainer center={position} zoom={zoom} className="radar-rge-carte h-full w-full" scrollWheelZoom>
            <TileLayer
              attribution="&copy; Esri, HERE, Garmin, OpenStreetMap"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            />
            <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />
            <CadreCarte centre={position} zoom={zoom} />
            {centre ? (
              <>
                <Circle center={position} radius={rayon * 1000} pathOptions={{ color: "#34d399", weight: 1, fillOpacity: 0.06 }} />
                <Marker position={position} icon={ICONE_CHANTIER}>
                  <Popup>
                    <strong>Chantier</strong>
                    <br />
                    {centre.libelle}
                  </Popup>
                </Marker>
              </>
            ) : null}
            {fiches.map(({ artisan, km }) => (
              <Marker key={artisan.id} position={[artisan.lat, artisan.lon]} icon={icone(emojiMetier(artisan.metiers), "#059669")}>
                <Popup>
                  <strong>{artisan.nom}</strong>
                  <br />
                  SIRET {artisan.siret}
                  <br />
                  {artisan.adresse} {artisan.codePostal} {artisan.commune}
                  <br />
                  {artisan.email || "email non publié"} · {artisan.telephone || "téléphone non publié"}
                  <br />
                  {formaterKm(km)}
                  <br />
                  {artisan.labels.map((label) => `${label.certificat} · ${formaterValidite(label.validite)}`).join(" · ")}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <aside className="max-h-[560px] space-y-3 overflow-y-auto pr-1" data-testid="radar-rge-liste">
          {fiches.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-700 px-4 py-8 text-center text-sm text-slate-500">
              Les artisans du rayon apparaîtront ici, du plus proche au plus éloigné.
            </p>
          ) : (
            fiches.map(({ artisan, km }) => {
              const tel = telephoneAppelable(artisan.telephone);
              const deja = favoris.some((item) => item.id === artisan.id);
              const edite = editionId === artisan.id;
              const incomplet = !artisan.email || !tel;
              return (
                <article key={artisan.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white">{artisan.nom}</h3>
                    <span className="shrink-0 text-xs font-semibold text-emerald-300">{formaterKm(km)}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    SIRET {artisan.siret}
                    {artisan.partenaire ? " · réseau ENERGIA" : ""}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {artisan.adresse}, {artisan.codePostal} {artisan.commune}
                  </p>
                  <div className="mt-2 space-y-1 text-xs text-slate-200">
                    <p data-testid="radar-rge-email">
                      {artisan.email ? (
                        <a className="text-sky-200 underline-offset-2 hover:underline" href={`mailto:${artisan.email}`}>
                          {artisan.email}
                        </a>
                      ) : (
                        <span className="text-slate-500">Email non renseigné</span>
                      )}
                    </p>
                    <p className="flex items-center gap-2" data-testid="radar-rge-telephone">
                      {tel ? (
                        <a className="text-emerald-200" href={`tel:${tel}`}>
                          {artisan.telephone}
                        </a>
                      ) : (
                        <span className="text-slate-500">Téléphone non renseigné</span>
                      )}
                      {incomplet ? (
                        <button
                          type="button"
                          aria-label={`Compléter les coordonnées de ${artisan.nom}`}
                          data-testid="radar-rge-crayon"
                          onClick={() => {
                            setEditionId(artisan.id);
                            setBrouillon({ email: artisan.email, telephone: artisan.telephone });
                          }}
                          className="rounded-md border border-slate-600 px-1.5 py-0.5 text-[11px] text-slate-200"
                        >
                          ✎
                        </button>
                      ) : null}
                    </p>
                    {edite ? (
                      <form
                        className="space-y-1"
                        onSubmit={(event) => {
                          event.preventDefault();
                          sauverCoordonnees(artisan.id, brouillon.email.trim(), brouillon.telephone.trim());
                        }}
                      >
                        <input
                          value={brouillon.email}
                          onChange={(event) => setBrouillon((courant) => ({ ...courant, email: event.target.value }))}
                          placeholder="email@artisan.fr"
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                        />
                        <input
                          value={brouillon.telephone}
                          onChange={(event) => setBrouillon((courant) => ({ ...courant, telephone: event.target.value }))}
                          placeholder="06 00 00 00 00"
                          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-white"
                        />
                        <button type="submit" className="rounded-lg bg-emerald-500 px-2 py-1 text-[11px] font-semibold text-slate-950">
                          Enregistrer
                        </button>
                      </form>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {artisan.labels.slice(0, 3).map((label) => (
                      <span key={label.nom} className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">
                        {label.certificat} · {formaterValidite(label.validite)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tel ? (
                      <a href={`tel:${tel}`} className="rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950">
                        📞 Appeler
                      </a>
                    ) : (
                      <span className="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs text-slate-500">Téléphone non publié</span>
                    )}
                    <button
                      type="button"
                      data-testid="radar-rge-consulter"
                      onClick={() =>
                        setConsultation({
                          artisan,
                          metier: artisan.metiers.find((id) => metiers.includes(id)),
                        })
                      }
                      className="rounded-lg bg-sky-500 px-2.5 py-1.5 text-xs font-semibold text-slate-950"
                    >
                      ✉️ Consulter en sous-traitance
                    </button>
                    <button
                      type="button"
                      onClick={() => memoriser(artisan)}
                      className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-200"
                    >
                      {deja ? "Dans mon réseau" : "💾 Ajouter à mon réseau"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </aside>
      </div>
      {consultation ? (
        <ModaleConsultation
          artisan={consultation.artisan}
          chantiers={chantiersDispo}
          centre={centre}
          recherche={recherche}
          metier={consultation.metier}
          onFermer={() => setConsultation(null)}
          onCoordonnees={(email, telephone) => sauverCoordonnees(consultation.artisan.id, email, telephone)}
        />
      ) : null}
      <style>{`
        .radar-rge-carte.leaflet-container { background: #020617; font: inherit; }
        .radar-rge-carte img { max-width: none !important; }
        .radar-rge-icone { background: none; border: 0; }
        .radar-rge-carte .leaflet-popup-content-wrapper,
        .radar-rge-carte .leaflet-popup-tip {
          background: #0b1220;
          color: #e2e8f0;
          border-radius: 12px;
        }
        .radar-rge-carte .leaflet-popup-content { margin: 10px 12px; font-size: 12px; line-height: 1.45; }
      `}</style>
    </section>
  );
}
