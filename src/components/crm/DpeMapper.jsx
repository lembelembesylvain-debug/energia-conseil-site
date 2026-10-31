import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CENTRE_CORSE_DPE,
  CIBLES_SERGE_CORSE,
  COULEURS_DPE,
  CODE_POSTAL_ADEME_DEFAUT,
  CODES_ZONE_CHALON_300,
  DEPARTEMENT_DPE_DEFAUT,
  DEPARTEMENTS_DPE,
  estCorseDpe,
  libelleOptionDepartement,
  libelleOptionTypeBatiment,
  normaliserCodeDepartementDpe,
  TYPES_BATIMENT_DPE,
  TYPE_BATIMENT_DPE_DEFAUT,
  chargerDpeDepartement,
  trouverDepartementDpe,
  trouverTypeBatimentDpe,
  urlJsonDepartement,
  VILLES_ADEME_CORSE,
} from "../../lib/crm/dpeDepartements";
import { departementDepuisCodePostal, LIMITE_ADEME } from "../../lib/crm/ademeDpe";
import RechercheVilleBan from "./RechercheVilleBan";
import PanneauSniperProptech from "./PanneauSniperProptech";
import { chargerSniperViaApi } from "../../lib/proptech/sniper";
import { memoriserSniperSession } from "../../lib/crm/sauvegardeProptech";
import {
  estBailleurEnInfraction,
  estBienEnVente,
  estCibleSolaire,
} from "../../lib/proptech/statutMarcheDpe";
import { classerStatutTransaction, retenirNouvelAcquereur } from "../../lib/proptech/statutTransactionDvf";
import { correspondFiltreB2b, estModeB2b, FILTRES_B2B } from "../../lib/proptech/decarbonationB2bSniper";
import { NB_CIBLES_B2B_42, NB_PARTICULIERS_42 } from "../../lib/proptech/packProspectionLoire42";
import BannieresOpportunite from "./BannieresOpportunite";
import StatutTransactionBloc from "./StatutTransactionBloc";
import { ouvrirMessagerie } from "../messaging/navigation";
import {
  EMAIL_DAMIEN,
  corpsPack,
  dossierDepuisLogement,
  fichesPdfPieces,
  idLogement,
  limiteCibles,
  MAX_CIBLES_COMMANDO,
  telechargerCourriers,
} from "../../lib/crm/commandoDpe";

const URL_CALCULATEUR_AIDES = "/?simulate=1";
const URL_ANNONCES_DEMO = "/data/dpe/annonces_demo.json";

function logementVisible(logement, filtre) {
  const etiquette = logement?.etiquette;
  if (filtre === "passoires") return etiquette === "F" || etiquette === "G";
  if (filtre === "E") return etiquette === "E";
  if (filtre === "D") return ["A", "B", "C", "D"].includes(etiquette);
  return true;
}

function correspondTransaction(logement, filtreTransaction) {
  if (!filtreTransaction || filtreTransaction === "tous") return true;
  const statut = classerStatutTransaction(logement ?? {});
  if (filtreTransaction === "acquereurs") return retenirNouvelAcquereur(logement ?? {});
  if (filtreTransaction === "vente") return statut?.id === "vente_active";
  if (filtreTransaction === "bailleurs") return statut?.id === "bailleur_interdit";
  return true;
}

function correspondMarche(logement, venteSeule, bailleurSeul, solaireSeul) {
  if (!venteSeule && !bailleurSeul && !solaireSeul) return true;
  const okVente = venteSeule && estBienEnVente(logement);
  const okBailleur = bailleurSeul && estBailleurEnInfraction(logement);
  const okSolaire = solaireSeul && estCibleSolaire(logement);
  return okVente || okBailleur || okSolaire;
}

function echapperHtml(valeur) {
  return String(valeur ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formaterPrixAnnonce(prix) {
  return `${Number(prix || 0).toLocaleString("fr-FR")} €`;
}

function couleurAnnonce(dpe) {
  return String(dpe).toUpperCase() === "F" ? "#f97316" : "#dc2626";
}

function iconeMaisonAnnonce(dpe) {
  const couleur = couleurAnnonce(dpe);
  const lettre = echapperHtml(String(dpe || "G").toUpperCase());
  return L.divIcon({
    className: "dpe-annonce-icon",
    iconSize: [38, 38],
    iconAnchor: [19, 36],
    popupAnchor: [0, 8],
    html: `<span class="dpe-annonce-pulse" style="--dpe-annonce-color:${couleur}" title="Bien à vendre DPE ${lettre}">
      <svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">
        <path fill="${couleur}" stroke="#0f172a" stroke-width="1.4" d="M4 15.2 16 5.2 28 15.2V27a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 27V15.2Z"/>
        <path fill="#0f172a" d="M13 18.6h6v9.4h-6z"/>
      </svg>
      <em>${lettre}</em>
    </span>`,
  });
}

function svgTypeBatiment(typeBatiment, couleur) {
  if (typeBatiment === "collectif") {
    return `<path fill="${couleur}" stroke="#0f172a" stroke-width="1.3" d="M6 28V8h20v20H6Zm4-16h4v4h-4zm8 0h4v4h-4zM10 20h4v4h-4zm8 0h4v4h-4z"/>`;
  }
  if (typeBatiment === "tertiaire") {
    return `<path fill="${couleur}" stroke="#0f172a" stroke-width="1.3" d="M5 28V10l11-6 11 6v18H5Zm6-14h4v3H11zm6 0h4v3h-4zM11 20h4v3h-4zm6 0h4v3h-4z"/>`;
  }
  if (typeBatiment === "industriel") {
    return `<path fill="${couleur}" stroke="#0f172a" stroke-width="1.3" d="M4 28V16l7-4v4l6-5v5l7-4v16H4Zm18-18h4v8h-4z"/>`;
  }
  return `<path fill="${couleur}" stroke="#0f172a" stroke-width="1.3" d="M4 15.2 16 5.2 28 15.2V27a1.4 1.4 0 0 1-1.4 1.4H5.4A1.4 1.4 0 0 1 4 27V15.2Z"/><path fill="#0f172a" d="M13 18.6h6v9.4h-6z"/>`;
}

function pastilleMarche(logement) {
  const badges = [];
  let statut = null;
  try {
    statut = classerStatutTransaction(logement ?? {});
  } catch {
    statut = null;
  }
  if (statut?.id === "vendu_recent") badges.push(`<i class="dpe-marche-badge dpe-marche-acquereur">${statut.badge}</i>`);
  else if (statut?.id === "vente_active") badges.push(`<i class="dpe-marche-badge dpe-marche-vente-active">${statut.badge}</i>`);
  else if (estBienEnVente(logement ?? {})) badges.push(`<i class="dpe-marche-badge dpe-marche-vente">VENTE</i>`);
  if (statut?.id !== "vendu_recent" && (statut?.id === "bailleur_interdit" || estBailleurEnInfraction(logement ?? {}))) {
    badges.push(`<i class="dpe-marche-badge dpe-marche-bailleur">BAILLEUR / G-F</i>`);
  }
  if (statut?.id === "occupant_historique") badges.push(`<i class="dpe-marche-badge dpe-marche-historique">${statut.badge}</i>`);
  if (estCibleSolaire(logement ?? {})) badges.push(`<i class="dpe-marche-badge dpe-marche-solaire">CIBLE SOLAIRE</i>`);
  if (!badges.length) return "";
  return `<span class="dpe-marche-badges">${badges.join("")}</span>`;
}

function iconeTypeBatiment(logement, typeBatiment) {
  const couleur = COULEURS_DPE[logement?.etiquette] ?? "#dc2626";
  const lettre = echapperHtml(logement?.etiquette ?? "?");
  const meta = trouverTypeBatimentDpe(typeBatiment);
  return L.divIcon({
    className: "dpe-type-icon",
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    html: `<span class="dpe-type-mark" title="${meta.icone} ${meta.label} DPE ${lettre}">
      <svg viewBox="0 0 32 32" width="28" height="28" aria-hidden="true">${svgTypeBatiment(typeBatiment, couleur)}</svg>
      <em>${lettre}</em>
      ${pastilleMarche(logement)}
    </span>`,
  });
}

export default function DpeMapper() {
  const [code, setCode] = useState(DEPARTEMENT_DPE_DEFAUT);
  const [codePostal, setCodePostal] = useState(CODE_POSTAL_ADEME_DEFAUT);
  const [saisieCp, setSaisieCp] = useState(CODE_POSTAL_ADEME_DEFAUT);
  const [payload, setPayload] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtre, setFiltre] = useState("tous");
  const [filtreVente, setFiltreVente] = useState(false);
  const [filtreBailleur, setFiltreBailleur] = useState(false);
  const [filtreSolaire, setFiltreSolaire] = useState(false);
  const [filtreTransaction, setFiltreTransaction] = useState("tous");
  const [filtreB2b, setFiltreB2b] = useState("tous");
  const [typeBatiment, setTypeBatiment] = useState(TYPE_BATIMENT_DPE_DEFAUT);
  const [selection, setSelection] = useState(null);
  const [cibleVille, setCibleVille] = useState(null);
  const [noticeVille, setNoticeVille] = useState("");
  const [voirAnnonces, setVoirAnnonces] = useState(false);
  const [annonces, setAnnonces] = useState([]);
  const [annonceActive, setAnnonceActive] = useState(null);
  const [cibleAdresse, setCibleAdresse] = useState(null);
  const [sniper, setSniper] = useState(null);
  const [sniperChargement, setSniperChargement] = useState(false);
  const [sniperErreur, setSniperErreur] = useState("");
  const [sniperMasque, setSniperMasque] = useState(false);
  const [cartePrete, setCartePrete] = useState(false);
  const [cibleSergeId, setCibleSergeId] = useState(null);
  const [ciblesCommando, setCiblesCommando] = useState([]);
  const carteRef = useRef(null);
  const mapRef = useRef(null);
  const calqueRef = useRef(null);
  const rendererRef = useRef(null);
  const sniperRef = useRef(null);
  const proptechLayerRef = useRef(null);
  const annoncesLayerRef = useRef(null);
  const derniereCibleIdRef = useRef(null);
  const verrouCibleSergeRef = useRef(null);
  const commandoLayerRef = useRef(null);

  const meta = trouverDepartementDpe(code);

  const apresClasse = useMemo(
    () => (payload?.logements ?? []).filter((item) => logementVisible(item, filtre)),
    [payload, filtre],
  );
  const modeB2b = estModeB2b(typeBatiment);
  const logementsAffiches = useMemo(() => {
    const residentiel = apresClasse.filter(
      (item) =>
        correspondMarche(item, filtreVente, filtreBailleur, filtreSolaire) &&
        correspondTransaction(item, filtreTransaction),
    );
    if (!modeB2b) return residentiel;
    return residentiel.filter((item) => correspondFiltreB2b(item, filtreB2b));
  }, [apresClasse, filtreVente, filtreBailleur, filtreSolaire, filtreTransaction, modeB2b, filtreB2b]);

  const nbBailleursUrgence = useMemo(
    () => apresClasse.filter((item) => estBailleurEnInfraction(item)).length,
    [apresClasse],
  );
  const nbSolaire = useMemo(() => apresClasse.filter((item) => estCibleSolaire(item)).length, [apresClasse]);
  const nbAcquereurs = useMemo(() => apresClasse.filter((item) => retenirNouvelAcquereur(item)).length, [apresClasse]);
  const nbVenteActive = useMemo(
    () => apresClasse.filter((item) => classerStatutTransaction(item)?.id === "vente_active").length,
    [apresClasse],
  );

  const comptesB2b = useMemo(() => {
    const compte = (id) => apresClasse.filter((item) => correspondFiltreB2b(item, id)).length;
    return {
      decret: compte("decret"),
      bacs: compte("bacs"),
      solaire: compte("solaire"),
      chaleur: compte("chaleur"),
      tous: apresClasse.length,
    };
  }, [apresClasse]);

  const nbPassoires = useMemo(
    () => (payload?.logements ?? []).filter((item) => item?.etiquette === "F" || item?.etiquette === "G").length,
    [payload],
  );

  useEffect(() => {
    const ac = new AbortController();
    setChargement(true);
    setErreur("");
    setSelection(null);
    setPayload(null);

    chargerDpeDepartement(code, { signal: ac.signal, typeBatiment, codePostal })
      .then((data) => {
        if (ac.signal.aborted) return;
        setPayload(data);
        setErreur("");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setPayload(null);
        setErreur(err?.message || "Chargement du département impossible.");
      })
      .finally(() => {
        if (!ac.signal.aborted) setChargement(false);
      });

    calqueRef.current?.clearLayers();
    return () => ac.abort();
  }, [code, typeBatiment, codePostal]);

  useEffect(() => {
    let actif = true;
    fetch(URL_ANNONCES_DEMO)
      .then((reponse) => {
        if (!reponse.ok) throw new Error(String(reponse.status));
        return reponse.json();
      })
      .then((brut) => {
        if (!actif) return;
        const liste = Array.isArray(brut) ? brut : brut?.annonces;
        setAnnonces(Array.isArray(liste) ? liste : []);
      })
      .catch(() => {
        if (actif) setAnnonces([]);
      });
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    if (!carteRef.current || mapRef.current) return;

    const centre = trouverDepartementDpe(DEPARTEMENT_DPE_DEFAUT) ?? DEPARTEMENTS_DPE[0];
    const map = L.map(carteRef.current, {
      zoomControl: false,
      attributionControl: true,
    }).setView([centre.lat, centre.lng], centre.zoom);

    L.control.zoom({ position: "bottomleft" }).addTo(map);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    map.createPane("annonces-demo");
    map.getPane("annonces-demo").style.zIndex = "650";

    rendererRef.current = L.canvas({ padding: 0.4 });
    calqueRef.current = L.layerGroup().addTo(map);
    sniperRef.current = L.layerGroup().addTo(map);
    proptechLayerRef.current = L.layerGroup().addTo(map);
    annoncesLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setCartePrete(true);

    const resize = () => map.invalidateSize();
    window.addEventListener("resize", resize);
    requestAnimationFrame(resize);

    return () => {
      window.removeEventListener("resize", resize);
      setCartePrete(false);
      map.remove();
      mapRef.current = null;
      calqueRef.current = null;
      sniperRef.current = null;
      proptechLayerRef.current = null;
      annoncesLayerRef.current = null;
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cartePrete) return undefined;
    const ajuster = () => map.invalidateSize();
    ajuster();
    const frame = requestAnimationFrame(ajuster);
    const timer = window.setTimeout(ajuster, 180);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [cartePrete]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (cibleVille) {
      if (derniereCibleIdRef.current !== cibleVille.id) {
        derniereCibleIdRef.current = cibleVille.id;
        map.flyTo([cibleVille.lat, cibleVille.lng], cibleVille.zoom || 14, { duration: 0.7 });
      }
      return;
    }

    const verrou = CIBLES_SERGE_CORSE.find((item) => item.id === verrouCibleSergeRef.current);
    if (verrou && estCorseDpe(code)) {
      derniereCibleIdRef.current = null;
      map.flyTo([verrou.lat, verrou.lng], verrou.zoom, { duration: 0.75 });
      return;
    }

    derniereCibleIdRef.current = null;
    const points = (payload?.live ? payload.logements : [])
      .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
      .map((item) => [item.lat, item.lng]);
    if (!cibleVille && points.length) {
      const bornes = L.latLngBounds(points);
      if (bornes.isValid()) {
        map.fitBounds(bornes, { padding: [36, 36], maxZoom: codePostal ? 14 : 11 });
        return;
      }
    }
    if (estCorseDpe(code)) {
      map.flyTo([CENTRE_CORSE_DPE.lat, CENTRE_CORSE_DPE.lng], CENTRE_CORSE_DPE.zoom, { duration: 0.85 });
      return;
    }

    const ville = payload?.villePrincipale;
    const fallback = meta;
    const lat = ville?.lat ?? fallback?.lat;
    const lng = ville?.lng ?? fallback?.lng;
    const zoom = ville?.zoom ?? fallback?.zoom ?? 12;
    if (lat == null || lng == null) return;
    map.flyTo([lat, lng], zoom, { duration: 0.85 });
  }, [code, payload, meta, cibleVille, codePostal]);

  useEffect(() => {
    const calque = sniperRef.current;
    if (!calque) return;
    calque.clearLayers();
    if (!cibleVille) return;
    L.circleMarker([cibleVille.lat, cibleVille.lng], {
      radius: 14,
      color: "#34d399",
      weight: 2,
      fillColor: "#10b981",
      fillOpacity: 0.18,
    })
      .bindTooltip(`Cible : ${cibleVille.nom}`, { direction: "top", opacity: 0.95 })
      .addTo(calque);
  }, [cibleVille]);

  useEffect(() => {
    const calque = calqueRef.current;
    if (!calque) return;
    calque.clearLayers();

    logementsAffiches.forEach((logement) => {
      const lat = Number(logement?.lat);
      const lng = Number(logement?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      try {
        const etiquette = logement?.etiquette ?? "?";
        const adresse = logement?.adresse ?? "Adresse non renseignée";
        const commune = logement?.commune ?? "";
        const marqueur = L.marker([lat, lng], {
          icon: iconeTypeBatiment(logement, typeBatiment),
          keyboard: true,
          title: `${etiquette} · ${adresse}, ${commune}`,
        });
        marqueur.bindTooltip(
          `${trouverTypeBatimentDpe(typeBatiment)?.icone ?? ""} ${etiquette} · ${adresse}, ${commune}`,
          { direction: "top", opacity: 0.95 },
        );
        marqueur.on("click", (event) => {
          L.DomEvent.stopPropagation(event);
          mapRef.current?.closePopup();
          verrouCibleSergeRef.current = null;
          setCibleSergeId(null);
          setAnnonceActive(null);
          setCibleAdresse(null);
          setSniperMasque(false);
          setSelection(logement);
        });
        marqueur.addTo(calque);
      } catch {
        /* une fiche incomplète ne bloque pas les autres marqueurs */
      }
    });
  }, [logementsAffiches, typeBatiment]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !cartePrete) return;
    if (!commandoLayerRef.current) commandoLayerRef.current = L.layerGroup().addTo(map);
    const calque = commandoLayerRef.current;
    calque.clearLayers();
    ciblesCommando.forEach((logement) => {
      const lat = Number(logement?.lat);
      const lng = Number(logement?.lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      L.circleMarker([lat, lng], {
        radius: 18,
        color: "#f97316",
        weight: 2,
        fillColor: "#fb923c",
        fillOpacity: 0.25,
      }).addTo(calque);
    });
  }, [ciblesCommando, cartePrete]);

  useEffect(() => {
    if (!selection) return;
    if (logementsAffiches.some((item) => item.id === selection.id)) return;
    setSelection(null);
    setSniper(null);
    setSniperErreur("");
  }, [logementsAffiches, selection]);

  useEffect(() => {
    const calque = annoncesLayerRef.current;
    if (!calque) return;
    calque.clearLayers();
    if (!voirAnnonces) return;

    annonces.forEach((annonce) => {
      if (annonce.lat == null || annonce.lng == null) return;
      const marqueur = L.marker([annonce.lat, annonce.lng], {
        icon: iconeMaisonAnnonce(annonce.dpe),
        pane: "annonces-demo",
        keyboard: true,
        title: `${annonce.title} — ${formaterPrixAnnonce(annonce.price)}`,
      });
      marqueur.bindTooltip(`${annonce.title} · ${formaterPrixAnnonce(annonce.price)}`, {
        direction: "top",
        opacity: 0.95,
      });
      marqueur.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        setSelection(null);
        setCibleAdresse(null);
        setAnnonceActive(annonce);
      });
      marqueur.addTo(calque);
    });
  }, [voirAnnonces, annonces]);

  const pointSniperLat = selection?.lat ?? cibleAdresse?.lat;
  const pointSniperLng = selection?.lng ?? cibleAdresse?.lng;
  const pointSniperVoie = selection?.adresse || cibleAdresse?.rue || cibleAdresse?.label || "";

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    const onClick = (event) => {
      verrouCibleSergeRef.current = null;
      setCibleSergeId(null);
      setSelection(null);
      setAnnonceActive(null);
      setCibleAdresse({
        id: `click-${event.latlng.lat.toFixed(5)}-${event.latlng.lng.toFixed(5)}`,
        lat: event.latlng.lat,
        lng: event.latlng.lng,
        label: "Point sélectionné",
        rue: "",
      });
      setSniperMasque(false);
    };
    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [cartePrete]);

  useEffect(() => {
    if (pointSniperLat == null || pointSniperLng == null) {
      setSniper(null);
      setSniperErreur("");
      setSniperChargement(false);
      proptechLayerRef.current?.clearLayers();
      return undefined;
    }
    const ac = new AbortController();
    setSniperChargement(true);
    setSniperErreur("");
    chargerSniperViaApi(pointSniperLat, pointSniperLng, { signal: ac.signal, voie: pointSniperVoie })
      .then((data) => {
        if (ac.signal.aborted) return;
        setSniper(data);
        memoriserSniperSession(data);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setSniper(null);
        setSniperErreur(err?.message || "Enrichissement carto indisponible.");
      })
      .finally(() => {
        if (!ac.signal.aborted) setSniperChargement(false);
      });
    return () => ac.abort();
  }, [pointSniperLat, pointSniperLng, pointSniperVoie]);

  useEffect(() => {
    const calque = proptechLayerRef.current;
    if (!calque) return;
    calque.clearLayers();
    const parcelleGeom = sniper?.cadastre?.parcelle?.geometry;
    const batiGeom = sniper?.cadastre?.bati?.geometry;
    if (parcelleGeom) {
      L.geoJSON(parcelleGeom, {
        style: { color: "#fbbf24", weight: 2, fillColor: "#fbbf24", fillOpacity: 0.12 },
      }).addTo(calque);
    }
    if (batiGeom) {
      L.geoJSON(batiGeom, {
        style: { color: "#f97316", weight: 2, fillColor: "#fb923c", fillOpacity: 0.28 },
      }).addTo(calque);
    }
    if (parcelleGeom && mapRef.current) {
      const bounds = L.geoJSON(parcelleGeom).getBounds();
      if (bounds.isValid()) mapRef.current.fitBounds(bounds, { padding: [48, 48], maxZoom: 19 });
    }
  }, [sniper]);

  const villeLabel = cibleVille
    ? `${cibleVille.nom}${cibleVille.codePostal ? ` (${cibleVille.codePostal})` : ""}`
    : estCorseDpe(code)
      ? "la Corse"
      : payload?.villePrincipale?.nom || meta?.villePrincipale || "—";

  const typeSelecteur = typeBatiment === "industriel" ? "tertiaire" : typeBatiment;

  useEffect(() => {
    if (!cibleSergeId || !payload) return;
    const logement = (payload.logements ?? []).find((item) => item.id === cibleSergeId);
    if (logement) setSelection(logement);
  }, [cibleSergeId, payload]);

  const choisirVille = (item) => {
    const brut = String(item.departement || "").trim();
    const cp = String(item.codePostal || "").trim();
    verrouCibleSergeRef.current = null;
    setCibleSergeId(null);
    setNoticeVille("");
    setCibleVille(item);
    setSelection(null);
    setAnnonceActive(null);
    setCibleAdresse(null);
    setSaisieCp(cp);
    setCodePostal(/^\d{5}$/.test(cp) ? cp : "");
    derniereCibleIdRef.current = item.id;
    mapRef.current?.flyTo([item.lat, item.lng], item.zoom || 14, { duration: 0.7 });

    const dept = normaliserCodeDepartementDpe(brut || departementDepuisCodePostal(cp));
    if (dept && dept !== code) setCode(dept);
  };

  const chargerCodePostal = () => {
    const cp = saisieCp.trim();
    if (!/^\d{5}$/.test(cp)) {
      setNoticeVille("Indiquez un code postal à 5 chiffres pour interroger l'ADEME.");
      return;
    }
    const dept = departementDepuisCodePostal(cp);
    verrouCibleSergeRef.current = null;
    setCibleSergeId(null);
    setCibleVille(null);
    setNoticeVille("");
    setSelection(null);
    setCodePostal(cp);
    if (dept && dept !== code) setCode(dept);
  };

  const chargerVilleAdeme = (ville) => {
    verrouCibleSergeRef.current = null;
    setCibleSergeId(null);
    setNoticeVille("");
    setSelection(null);
    setAnnonceActive(null);
    setCibleAdresse(null);
    setSaisieCp(ville.codePostal);
    setCodePostal(ville.codePostal);
    const cible = {
      id: `ademe-${ville.id}`,
      nom: ville.nom,
      lat: ville.lat,
      lng: ville.lng,
      zoom: ville.zoom,
      codePostal: ville.codePostal,
      departement: ville.code,
    };
    setCibleVille(cible);
    derniereCibleIdRef.current = cible.id;
    if (ville.code !== code) setCode(ville.code);
    mapRef.current?.flyTo([ville.lat, ville.lng], ville.zoom, { duration: 0.7 });
  };

  const choisirAdresse = (item) => {
    verrouCibleSergeRef.current = null;
    setCibleSergeId(null);
    setNoticeVille("");
    setCibleVille(null);
    setAnnonceActive(null);
    setSelection(null);
    setCibleAdresse(item);
    setSniperMasque(false);
    mapRef.current?.flyTo([item.lat, item.lng], 18, { duration: 0.6 });
    const brut = String(item.departement || "").trim();
    const dept = normaliserCodeDepartementDpe(brut);
    if (dept && dept !== code && trouverDepartementDpe(dept)) setCode(dept);
  };

  const toutEfface =
    filtre === "tous" && !filtreVente && !filtreBailleur && !filtreSolaire && filtreTransaction === "tous";

  const choisirRapide = (id) => {
    setFiltre("tous");
    setFiltreVente(false);
    setFiltreBailleur(false);
    setFiltreSolaire(false);
    setFiltreTransaction("tous");
    if (id === "acquereurs") setFiltreTransaction("acquereurs");
    if (id === "vente") setFiltreTransaction("vente");
    if (id === "bailleurs") setFiltreBailleur(true);
    if (id === "solaire") setFiltreSolaire(true);
    if (id === "passoires") setFiltre("passoires");
  };

  const ouvrirCibleSerge = (cible) => {
    verrouCibleSergeRef.current = cible.id;
    setCibleSergeId(cible.id);
    setCibleVille(null);
    setNoticeVille("");
    setAnnonceActive(null);
    setCibleAdresse(null);
    setSniperMasque(false);
    setFiltre("tous");
    setFiltreVente(false);
    setFiltreBailleur(false);
    setFiltreSolaire(false);
    setFiltreTransaction("tous");
    setFiltreB2b("tous");
    setCodePostal("");
    setSaisieCp("");
    if (!estCorseDpe(code)) setCode("2A");
    if (estCorseDpe(code) && typeBatiment === cible.typeBatiment) {
      const deja = (payload?.logements ?? []).find((item) => item.id === cible.id);
      if (deja) setSelection(deja);
    }
    setTypeBatiment(cible.typeBatiment);
    mapRef.current?.flyTo([cible.lat, cible.lng], cible.zoom, { duration: 0.7 });
  };

  const choisirPack42 = (type) => {
    verrouCibleSergeRef.current = null;
    setCibleSergeId(null);
    setSelection(null);
    setCodePostal("");
    setSaisieCp("");
    setTypeBatiment(type);
    setFiltre("tous");
    setFiltreVente(false);
    setFiltreBailleur(false);
    setFiltreSolaire(false);
    setFiltreTransaction("tous");
    setFiltreB2b("tous");
  };

  const classeBadge = (actif, actifClasse) =>
    `rounded-full border px-3 py-1.5 text-xs font-medium ${
      actif ? actifClasse : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
    }`;

  const cibleEstSelectionnee = (logement) =>
    ciblesCommando.some((item) => idLogement(item) === idLogement(logement));

  const basculerCible = (logement) => {
    const id = idLogement(logement);
    if (!id) return;
    setCiblesCommando((courant) => {
      if (courant.some((item) => idLogement(item) === id)) {
        return courant.filter((item) => idLogement(item) !== id);
      }
      if (courant.length >= MAX_CIBLES_COMMANDO) return courant;
      return [...courant, logement];
    });
  };

  const transfererCibles = (avecMessage) => {
    const liste = limiteCibles(ciblesCommando);
    if (liste.length === 0) return;
    const dossiers = liste.map(dossierDepuisLogement);
    ouvrirMessagerie({
      dossiers,
      dossierId: dossiers[0].id,
      clientNom: dossiers[0].libelle,
      destinataire: avecMessage ? EMAIL_DAMIEN : "",
      sujet: avecMessage ? `Pack Commando DPE - ${liste.length} cibles` : "",
      corps: avecMessage ? corpsPack(liste) : "",
      pieces: fichesPdfPieces(liste),
      contexte: {
        clientNom: dossiers[0].libelle,
        ville: dossiers[0].ville,
        projet: dossiers[0].projet,
      },
    });
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-3">
      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-end">
        <label className="block min-w-[14rem] flex-1">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Sélectionner le département
          </span>
          <select
            data-testid="select-departement"
            value={code}
            onChange={(e) => {
              const suivant = e.target.value;
              verrouCibleSergeRef.current = null;
              setCibleSergeId(null);
              setCibleVille(null);
              setNoticeVille("");
              setSelection(null);
              if (suivant === "71") {
                setCodePostal(CODE_POSTAL_ADEME_DEFAUT);
                setSaisieCp(CODE_POSTAL_ADEME_DEFAUT);
              } else {
                setCodePostal("");
                setSaisieCp("");
              }
              setCode(suivant);
              if (suivant === "42") {
                setTypeBatiment("individuel");
                setFiltre("tous");
                setFiltreVente(false);
                setFiltreBailleur(false);
                setFiltreSolaire(false);
                setFiltreTransaction("tous");
                setFiltreB2b("tous");
              }
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            <optgroup label="Zone Chalon-sur-Saône (Rayon 300 km)">
              {CODES_ZONE_CHALON_300.map((deptCode) => {
                const dept = trouverDepartementDpe(deptCode);
                if (!dept) return null;
                return (
                  <option key={dept.code} value={dept.code}>
                    {libelleOptionDepartement(dept)}
                  </option>
                );
              })}
            </optgroup>
            <optgroup label="Hors rayon">
              {DEPARTEMENTS_DPE.filter((dept) => !CODES_ZONE_CHALON_300.includes(dept.code)).map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {libelleOptionDepartement(dept)}
                </option>
              ))}
            </optgroup>
            {DEPARTEMENTS_DPE.some((dept) => dept.code === code) ? null : (
              <option value={code}>{code} — ADEME</option>
            )}
          </select>
        </label>
        <form
          className="block min-w-[11rem]"
          onSubmit={(event) => {
            event.preventDefault();
            chargerCodePostal();
          }}
        >
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Code postal ADEME
          </span>
          <div className="flex gap-1.5">
            <input
              data-testid="filtre-code-postal"
              inputMode="numeric"
              maxLength={5}
              value={saisieCp}
              onChange={(event) => setSaisieCp(event.target.value.replace(/\D/g, "").slice(0, 5))}
              placeholder={CODE_POSTAL_ADEME_DEFAUT}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl border border-emerald-400/50 bg-emerald-500/15 px-3 text-xs font-semibold text-emerald-100 hover:bg-emerald-500/25"
            >
              Charger
            </button>
          </div>
        </form>
        <label className="block min-w-[14rem] flex-1">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Type de bâtiment
          </span>
          <select
            data-testid="select-type-batiment"
            value={typeSelecteur}
            onChange={(e) => {
              const suivant = e.target.value;
              verrouCibleSergeRef.current = null;
              setCibleSergeId(null);
              setSelection(null);
              setTypeBatiment(suivant);
              setFiltre("tous");
              setFiltreVente(false);
              setFiltreBailleur(false);
              setFiltreSolaire(false);
              setFiltreTransaction("tous");
              setFiltreB2b("tous");
            }}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          >
            {TYPES_BATIMENT_DPE.filter((item) => item.selecteur !== false).map((item) => (
              <option key={item.id} value={item.id}>
                {item.icone} {libelleOptionTypeBatiment(item)}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] leading-snug text-slate-400">
            {trouverTypeBatimentDpe(typeSelecteur).detail}
          </span>
        </label>
        <RechercheVilleBan onChoisir={choisirVille} latProximite={meta?.lat} lngProximite={meta?.lng} />
        <RechercheVilleBan mode="adresse" onChoisir={choisirAdresse} latProximite={meta?.lat} lngProximite={meta?.lng} />
        <button
          type="button"
          aria-pressed={voirAnnonces}
          onClick={() => {
            setVoirAnnonces((actuel) => {
              const suivant = !actuel;
              if (!suivant) setAnnonceActive(null);
              return suivant;
            });
          }}
          className={`h-10 shrink-0 rounded-xl border px-3 text-xs font-medium ${
            voirAnnonces
              ? "border-sky-400/70 bg-sky-500/20 text-sky-100"
              : "border-slate-700 bg-slate-900 text-slate-300 hover:border-sky-500/40"
          }`}
        >
          Biens à vendre
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        {code === "42" ? (
          <>
            <button
              type="button"
              data-testid="compteur-42-particuliers"
              aria-pressed={!modeB2b}
              onClick={() => choisirPack42("individuel")}
              className={classeBadge(!modeB2b, "border-orange-300 bg-orange-500/25 text-orange-50")}
            >
              {payload?.live ? "Maisons F/G — ADEME" : `${NB_PARTICULIERS_42} Particuliers F/G à rénover`}
            </button>
            <button
              type="button"
              data-testid="compteur-42-b2b"
              aria-pressed={modeB2b}
              onClick={() => choisirPack42("industriel")}
              className={classeBadge(modeB2b, "border-sky-300 bg-sky-500/25 text-sky-50")}
            >
              {payload?.live ? "Tertiaire F/G — ADEME" : `${NB_CIBLES_B2B_42} Cibles B2B Décarbonation / Solaire`}
            </button>
          </>
        ) : modeB2b ? (
          FILTRES_B2B.map((item) => (
            <button
              key={item.id}
              type="button"
              data-testid={item.testid}
              aria-pressed={filtreB2b === item.id}
              onClick={() => setFiltreB2b(item.id)}
              className={classeBadge(filtreB2b === item.id, item.actif)}
            >
              {item.label} ({comptesB2b[item.id]})
            </button>
          ))
        ) : (
          <>
            <button
              type="button"
              data-testid="filtre-dpe-acquereurs"
              aria-pressed={filtreTransaction === "acquereurs"}
              onClick={() => choisirRapide("acquereurs")}
              className={classeBadge(filtreTransaction === "acquereurs", "border-emerald-300 bg-emerald-500/25 text-emerald-50")}
            >
              🟢 Nouveaux Acquéreurs (Vendus &lt; 24 mois) ({nbAcquereurs})
            </button>
            <button
              type="button"
              data-testid="filtre-dpe-vente-active"
              aria-pressed={filtreTransaction === "vente"}
              onClick={() => choisirRapide("vente")}
              className={classeBadge(filtreTransaction === "vente", "border-cyan-300 bg-cyan-500/25 text-cyan-50")}
            >
              🔵 En Vente Active ({nbVenteActive})
            </button>
            <button
              type="button"
              data-testid="filtre-dpe-bailleurs-bloques"
              aria-pressed={filtreBailleur}
              onClick={() => choisirRapide("bailleurs")}
              className={classeBadge(filtreBailleur, "border-rose-300 bg-rose-600/30 text-rose-50")}
            >
              🔴 Bailleurs Urgence G/F ({nbBailleursUrgence})
            </button>
            <button
              type="button"
              data-testid="filtre-dpe-solaire"
              aria-pressed={filtreSolaire}
              onClick={() => choisirRapide("solaire")}
              className={classeBadge(filtreSolaire, "border-amber-300 bg-amber-600/30 text-amber-50")}
            >
              ☀️ Cibles Solaires 100 kWc ({nbSolaire})
            </button>
            <button
              type="button"
              data-testid="filtre-dpe-passoires"
              aria-pressed={filtre === "passoires"}
              onClick={() => choisirRapide("passoires")}
              className={classeBadge(filtre === "passoires", "border-orange-300 bg-orange-500/25 text-orange-50")}
            >
              Passoires F/G ({nbPassoires})
            </button>
            <button
              type="button"
              data-testid="filtre-dpe-tous-biens"
              aria-pressed={toutEfface}
              onClick={() => choisirRapide("tous")}
              className={classeBadge(toutEfface, "border-emerald-400/60 bg-emerald-500/20 text-emerald-100")}
            >
              Tous
            </button>
          </>
        )}
      </div>
      {estCorseDpe(code) ? (
        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2.5" data-testid="villes-ademe-corse">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-200">
            ADEME en direct — Corse
          </p>
          <div className="flex flex-wrap gap-2">
            {VILLES_ADEME_CORSE.map((ville) => (
              <button
                key={ville.id}
                type="button"
                data-testid={`ville-ademe-${ville.id}`}
                aria-pressed={codePostal === ville.codePostal}
                onClick={() => chargerVilleAdeme(ville)}
                className={classeBadge(
                  codePostal === ville.codePostal,
                  "border-emerald-300 bg-emerald-500/25 text-emerald-50",
                )}
              >
                {ville.nom} ({ville.codePostal})
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-emerald-100/80">
            Chaque ville charge jusqu&apos;à {LIMITE_ADEME} vrais DPE F et G certifiés par l&apos;ADEME
            (adresse BAN, étiquette, consommation, année de construction).
          </p>
        </div>
      ) : null}
      {estCorseDpe(code) ? (
        <div className="mb-3 flex flex-col gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3 py-2.5" data-testid="cibles-serge-corse">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-200">
            Cibles test Serge — Corse
          </p>
          <div className="flex flex-wrap gap-2">
            {CIBLES_SERGE_CORSE.map((cible) => (
              <button
                key={cible.id}
                type="button"
                data-testid={`cible-serge-${cible.id}`}
                aria-pressed={cibleSergeId === cible.id}
                onClick={() => ouvrirCibleSerge(cible)}
                className={classeBadge(
                  cibleSergeId === cible.id,
                  "border-amber-300 bg-amber-500/25 text-amber-50",
                )}
              >
                {cible.titre}
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed text-amber-100/80">
            {CIBLES_SERGE_CORSE.find((item) => item.id === cibleSergeId)?.resume ||
              "Villa Afa (DPE F, double aide ZNI) et résidence Porto-Vecchio (DPE G, PAC + solaire). Aides à titre indicatif."}
          </p>
        </div>
      ) : null}
      <p className="mb-3 text-xs text-slate-400" data-testid="compteur-marche-dpe">
        {chargement
          ? `Interrogation ADEME — ${LIMITE_ADEME} passoires F/G${codePostal ? ` · ${codePostal}` : ""}…`
          : code === "42" && !payload?.live
            ? `${NB_PARTICULIERS_42} Particuliers F/G à rénover · ${NB_CIBLES_B2B_42} Cibles B2B Décarbonation / Solaire`
            : `${logementsAffiches.length} ${modeB2b ? "site(s) B2B" : "bâtiment(s)"} affiché(s)`}
        {!chargement && payload?.live ? ` · ${nbPassoires} passoires F/G ADEME` : ""}
        <span className="text-slate-500">
          {" "}
          · {trouverTypeBatimentDpe(typeBatiment)?.icone} {trouverTypeBatimentDpe(typeBatiment)?.label}
          · centrée sur {villeLabel}
          {codePostal ? ` · CP ${codePostal}` : ""}
          {payload?.source ? ` · ${payload.source}` : ""}
          {voirAnnonces ? ` · ${annonces.length} biens à vendre (démo)` : ""}
        </span>
      </p>
      {noticeVille ? <p className="mb-3 text-[11px] text-amber-200">{noticeVille}</p> : null}

      <div className="w-full h-[650px] relative rounded-xl overflow-hidden">
        <div ref={carteRef} className="dpe-mapper-carte absolute inset-0 z-0 h-full w-full" />
        {ciblesCommando.length > 0 ? (
          <div
            data-testid="bandeau-commando"
            className="absolute left-1/2 top-3 z-[3000] w-[min(100%-1.5rem,48rem)] -translate-x-1/2 rounded-2xl border border-orange-300/50 bg-slate-950/95 px-3 py-3 shadow-2xl"
          >
            <p className="text-sm font-semibold text-orange-100">
              Sélection Commando : {ciblesCommando.length} cible{ciblesCommando.length > 1 ? "s" : ""} sélectionnée{ciblesCommando.length > 1 ? "s" : ""}
              <span className="mt-0.5 block text-[11px] font-medium text-orange-200/80">Passoires F/G : lot utile de 6 à 10 cibles.</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="commando-transferer"
                onClick={() => transfererCibles(false)}
                className="rounded-xl bg-cyan-300 px-3 py-2 text-xs font-semibold text-slate-950"
              >
                Transférer vers Messagerie
              </button>
              <button
                type="button"
                data-testid="commando-email"
                onClick={() => transfererCibles(true)}
                className="rounded-xl border border-emerald-300/50 bg-emerald-400/15 px-3 py-2 text-xs font-semibold text-emerald-50"
              >
                Envoyer la feuille de route à Damien
              </button>
              <button
                type="button"
                data-testid="commando-courriers"
                onClick={() => telechargerCourriers(ciblesCommando)}
                className="rounded-xl border border-slate-500 px-3 py-2 text-xs font-semibold text-white"
              >
                Télécharger les courriers A4 en lot
              </button>
            </div>
          </div>
        ) : null}
        <style>{`
          .dpe-mapper-carte.leaflet-container { background: #020617; font: inherit; }
          .dpe-mapper-carte img { max-width: none !important; }
          .dpe-mapper-carte .leaflet-popup-pane { z-index: 2500; }
          .dpe-mapper-carte .leaflet-tooltip-pane { z-index: 2400; }
          .dpe-annonce-icon { background: none; border: 0; }
          .dpe-type-icon { background: none; border: 0; overflow: visible !important; }
          .dpe-type-mark {
            position: relative;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            width: 34px;
            height: 34px;
            overflow: visible;
          }
          .dpe-marche-badges {
            position: absolute;
            top: -7px;
            left: 16px;
            display: flex;
            flex-direction: column;
            gap: 1px;
            pointer-events: none;
            z-index: 3;
          }
          .dpe-marche-badge {
            display: inline-block;
            padding: 0 3px;
            border-radius: 999px;
            font-style: normal;
            font-size: 7px;
            font-weight: 800;
            letter-spacing: 0.03em;
            line-height: 1.35;
            white-space: nowrap;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.45);
          }
          .dpe-marche-vente {
            background: #b45309;
            color: #fef3c7;
            border: 1px solid #fde68a;
          }
          .dpe-marche-acquereur {
            background: #059669;
            color: #ecfdf5;
            border: 1px solid #6ee7b7;
          }
          .dpe-marche-vente-active {
            background: #0891b2;
            color: #ecfeff;
            border: 1px solid #67e8f9;
          }
          .dpe-marche-historique {
            background: #475569;
            color: #f1f5f9;
            border: 1px solid #94a3b8;
          }
          .dpe-marche-bailleur {
            background: #be123c;
            color: #fff1f2;
            border: 1px solid #fb7185;
            animation: dpe-pulse-bailleur 1.15s ease-in-out infinite;
          }
          .dpe-marche-solaire {
            background: #d97706;
            color: #fffbeb;
            border: 1px solid #fde68a;
          }
          @keyframes dpe-pulse-bailleur {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.35; }
          }
          @media (prefers-reduced-motion: reduce) {
            .dpe-marche-bailleur { animation: none; }
          }
          .dpe-type-mark em {
            position: absolute;
            top: 5px;
            left: 50%;
            transform: translateX(-50%);
            font-style: normal;
            font-size: 8px;
            font-weight: 800;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0,0,0,.55);
          }
          .dpe-annonce-pulse {
            position: relative;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            width: 38px;
            height: 38px;
            animation: dpe-annonce-pulse 1.8s ease-in-out infinite;
          }
          .dpe-annonce-pulse em {
            position: absolute;
            top: 7px;
            left: 50%;
            transform: translateX(-50%);
            font-style: normal;
            font-size: 9px;
            font-weight: 800;
            color: #fff;
            text-shadow: 0 1px 2px rgba(0,0,0,.55);
          }
          @keyframes dpe-annonce-pulse {
            0%, 100% { filter: drop-shadow(0 0 0 var(--dpe-annonce-color)); transform: translateY(0); }
            50% { filter: drop-shadow(0 0 8px var(--dpe-annonce-color)); transform: translateY(-2px); }
          }
          .dpe-annonce-popup-wrap .leaflet-popup-content-wrapper {
            background: linear-gradient(180deg, #0b1220 0%, #020617 100%);
            color: #e2e8f0;
            border: 1px solid rgba(56, 189, 248, 0.28);
            border-radius: 16px;
            box-shadow: 0 18px 40px rgba(0,0,0,.5);
            padding: 0;
          }
          .dpe-annonce-popup-wrap .leaflet-popup-content { margin: 14px 16px 16px; width: 260px !important; }
          .dpe-annonce-popup-wrap .leaflet-popup-tip { background: #0b1220; }
          .dpe-annonce-popup-wrap a.leaflet-popup-close-button { color: #94a3b8; }
          .dpe-annonce-popup-kicker {
            margin: 0 0 6px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: .16em;
            text-transform: uppercase;
            color: #7dd3fc;
          }
          .dpe-annonce-popup-title { margin: 0; font-size: 15px; font-weight: 700; color: #fff; line-height: 1.3; }
          .dpe-annonce-popup-price { margin: 8px 0 0; font-size: 18px; font-weight: 700; color: #38bdf8; }
          .dpe-annonce-popup-city { margin: 2px 0 0; font-size: 12px; color: #94a3b8; }
          .dpe-annonce-popup-dpe { margin: 10px 0 0; font-size: 12px; color: #fdba74; }
          .dpe-annonce-popup-actions { display: grid; gap: 8px; margin-top: 14px; }
          .dpe-annonce-btn-agence, .dpe-annonce-btn-simuler {
            display: block;
            text-align: center;
            border-radius: 10px;
            padding: 8px 10px;
            font-size: 12px;
            font-weight: 700;
            text-decoration: none;
          }
          .dpe-annonce-btn-agence { background: #2563eb; color: #fff; }
          .dpe-annonce-btn-simuler { background: #059669; color: #fff; }
        `}</style>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[1200] flex flex-wrap gap-1.5 rounded-xl border border-slate-700/70 bg-slate-950/85 px-2.5 py-2 text-[10px] font-semibold uppercase tracking-wide text-slate-200">
          {Object.entries(COULEURS_DPE).map(([lettre, couleur]) => (
            <span key={lettre} className="inline-flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: couleur }} />
              {lettre}
            </span>
          ))}
        </div>

        {chargement ? (
          <div className="absolute inset-0 z-[1500] flex items-center justify-center bg-slate-950/40 text-sm text-slate-200">
            Interrogation ADEME — {meta?.nom ?? code}
            {codePostal ? ` · ${codePostal}` : ""}…
          </div>
        ) : null}

        {erreur ? (
          <div className="absolute bottom-4 left-4 right-4 z-[2000] rounded-xl border border-rose-500/40 bg-rose-950/90 px-4 py-3 text-sm text-rose-100">
            {erreur}
          </div>
        ) : null}

        {annonceActive ? (
          <aside className="absolute bottom-12 right-4 z-[2600] w-[min(100%-2rem,20.5rem)] rounded-2xl border border-sky-400/30 bg-slate-950/95 p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-300">
              Bien à vendre · démo partenaire
            </p>
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <p className="text-[15px] font-bold leading-snug text-white">{annonceActive.title}</p>
              <button
                type="button"
                className="shrink-0 text-xs text-slate-400 hover:text-white"
                onClick={() => setAnnonceActive(null)}
              >
                Fermer
              </button>
            </div>
            <p className="mt-2 text-lg font-semibold text-sky-300">{formaterPrixAnnonce(annonceActive.price)}</p>
            <p className="text-xs text-slate-400">{annonceActive.city}</p>
            <p className="mt-1.5 text-sm text-orange-300">
              DPE : {String(annonceActive.dpe || "G").toUpperCase()}
              {["F", "G"].includes(String(annonceActive.dpe || "").toUpperCase())
                ? " (Passoire thermique)"
                : ""}
            </p>
            <div className="mt-3 grid gap-2">
              <a
                href={annonceActive.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-blue-500"
              >
                Ouvrir la fiche agence
              </a>
              <a
                href={URL_CALCULATEUR_AIDES}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Simuler la Rénovation Globale
              </a>
            </div>
          </aside>
        ) : null}

        {(!sniperMasque && (sniper || sniperChargement || sniperErreur)) ? (
          <PanneauSniperProptech
            sniper={sniper}
            logement={selection}
            typeBatiment={typeBatiment}
            codeDepartement={code}
            chargement={sniperChargement}
            erreur={sniperErreur}
            onFermer={() => {
              setSniperMasque(true);
            }}
            onAppliquerPrixM2={(prixM2) => {
              memoriserSniperSession({ ...(sniper || {}), prixM2Applique: prixM2 });
            }}
          />
        ) : null}

        {selection ? (
          <aside className="absolute bottom-4 left-4 z-[2000] w-[min(100%-2rem,22rem)] rounded-2xl border border-slate-700 bg-slate-950/95 p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3">
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ backgroundColor: COULEURS_DPE[selection.etiquette] }}
              >
                {selection.etiquette}
              </span>
              <button
                type="button"
                className="text-xs text-slate-400 hover:text-white"
                onClick={() => setSelection(null)}
              >
                Fermer
              </button>
            </div>
            <BannieresOpportunite bien={selection} />
            <StatutTransactionBloc statut={classerStatutTransaction(selection)} />
            <p className="mt-3 font-medium text-white">{selection.adresse}</p>
            <p className="text-sm text-slate-300">
              {selection.codePostal} {selection.commune}
            </p>
            <button
              type="button"
              role="checkbox"
              aria-checked={cibleEstSelectionnee(selection)}
              data-testid="cibler-commando"
              onClick={() => basculerCible(selection)}
              className={`mt-3 flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold ${cibleEstSelectionnee(selection) ? "border-orange-300/60 bg-orange-400/15 text-orange-50" : "border-slate-600 text-slate-100"}`}
            >
              <span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${cibleEstSelectionnee(selection) ? "border-orange-300 bg-orange-300 text-slate-950" : "border-slate-500"}`}>
                {cibleEstSelectionnee(selection) ? "✓" : ""}
              </span>
              {cibleEstSelectionnee(selection) ? "Retirer la cible" : "+ Cibler"}
            </button>
            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              <li>Type : {trouverTypeBatimentDpe(typeBatiment).label}</li>
              {typeBatiment === "individuel" ? (
                <>
                  <li>Type bâti : {selection.type || "—"}</li>
                  <li>Surface : {selection.surface ? `${selection.surface} m²` : "—"}</li>
                </>
              ) : null}
              {typeBatiment === "collectif" ? (
                <>
                  <li>Lots : {selection.nbLots != null ? selection.nbLots : "—"}</li>
                  <li>DPE immeuble : {selection.dpeImmeuble || selection.etiquette}</li>
                  <li>Surface : {selection.surface ? `${selection.surface} m²` : "—"}</li>
                </>
              ) : null}
              {typeBatiment === "tertiaire" || typeBatiment === "industriel" ? (
                <>
                  <li>Surface : {selection.surface ? `${selection.surface} m²` : "—"}</li>
                  <li>Activité : {selection.activite || "—"}</li>
                  <li>Décret tertiaire : {selection.decretTertiaire || "À vérifier"}</li>
                  <li>
                    Potentiel PV toiture (estimatif) :{" "}
                    {selection.potentielPvKwc != null ? `${selection.potentielPvKwc} kWc` : "—"}
                  </li>
                </>
              ) : null}
              <li>Année : {selection.annee || "—"}</li>
              <li>Chauffage : {selection.chauffage || "—"}</li>
              {selection.aides ? <li className="text-emerald-200">{selection.aides}</li> : null}
              {selection.offre ? <li className="text-amber-200">{selection.offre}</li> : null}
              <li>Conso : {selection.conso ? `${selection.conso} kWh/m².an` : "—"}</li>
              <li className="font-mono text-sky-300">{selection.id}</li>
            </ul>
          </aside>
        ) : null}
      </div>
      <p className="border-t border-slate-800 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        Passoires F et G chargées en direct depuis l&apos;API ouverte ADEME (data.ademe.fr, jeu logements existants
        dpe03existant ou tertiaire dpe01tertiaire) : {LIMITE_ADEME} diagnostics les plus récents de la zone, avec adresse
        BAN, étiquette, consommation et année de construction certifiées par l&apos;État. Si l&apos;ADEME ne répond pas,
        l&apos;extrait local public{urlJsonDepartement(code, typeBatiment)} sert de secours. Cadastre : IGN. Mutations :
        DVF. Risques : Géorisques. Société et gérant : recherche-entreprises.api.gouv.fr. Les aides éventuellement
        citées restent une estimation à titre indicatif, à valider selon les revenus réels. Montants définitifs après
        instruction ANAH et CEE.
      </p>
    </section>
  );
}
