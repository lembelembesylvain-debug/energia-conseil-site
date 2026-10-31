/**
 * Orchestrateur « carto sniper » : Cadastre + DVF + Géorisques autour d’un point WGS84.
 */

import { chargerCoucheCadastre } from "./cadastre.js";
import { chargerDvfPoint } from "./dvf.js";
import { chargerGeorisques } from "./georisques.js";

export function pointValide(lat, lng) {
  const la = Number(lat);
  const lo = Number(lng);
  return Number.isFinite(la) && Number.isFinite(lo) && la >= 41 && la <= 52 && lo >= -6 && lo <= 10;
}

export async function enrichirPointSniper(lat, lng, { signal, voie } = {}) {
  if (!pointValide(lat, lng)) {
    throw new Error("Coordonnées hors France métropolitaine.");
  }

  const cadastre = await chargerCoucheCadastre(lat, lng, { signal }).catch((err) => ({
    source: "IGN API Carto",
    parcelle: null,
    bati: null,
    erreur: err?.message || "Cadastre indisponible",
  }));

  const idu = cadastre?.parcelle?.idu || "";
  const codeInsee = cadastre?.parcelle?.codeInsee || "";

  const [dvf, geo] = await Promise.all([
    chargerDvfPoint(lat, lng, { signal, idu, voie, codeInsee }).catch((err) => ({
      perimetre: null,
      mutations: [],
      prixM2Median: null,
      attribution: "DVF — DGFiP / Etalab",
      erreur: err?.message || "DVF indisponible",
    })),
    chargerGeorisques(lat, lng, { signal, codeInsee }).catch((err) => ({
      resume: {
        rga: { libelle: "Retrait-gonflement des argiles (RGA / sécheresse)", niveau: "Indisponible" },
        inondation: { libelle: "Inondation", niveau: "Indisponible", expose: false },
        sismicite: { libelle: "Sismicité", niveau: "Indisponible", zone: null },
        radon: { libelle: "Radon", niveau: "Indisponible", classe: null },
        source: "API Géorisques",
      },
      erreur: err?.message || "Géorisques indisponible",
    })),
  ]);

  return {
    version: 1,
    date: new Date().toISOString(),
    lat: Number(lat),
    lng: Number(lng),
    cadastre,
    dvf,
    georisques: geo,
    mention:
      "Données ouvertes à titre indicatif (IGN, DGFiP/Etalab, Géorisques). Elles ne remplacent pas un bornage, une expertise ni un état des risques (ERP).",
  };
}

export async function chargerSniperViaApi(lat, lng, { signal, voie } = {}) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (voie) params.set("voie", String(voie));
  const reponse = await fetch(`/api/proptech-sniper?${params}`, { signal });
  if (!reponse.ok) {
    const brut = await reponse.json().catch(() => ({}));
    throw new Error(brut.error || `Sniper indisponible (${reponse.status}).`);
  }
  return reponse.json();
}
