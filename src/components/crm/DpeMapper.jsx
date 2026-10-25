import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  COULEURS_DPE,
  DEPARTEMENT_DPE_DEFAUT,
  DEPARTEMENTS_DPE,
  libelleOptionDepartement,
  TYPES_BATIMENT_DPE,
  TYPE_BATIMENT_DPE_DEFAUT,
  chargerDpeDepartement,
  trouverDepartementDpe,
  trouverTypeBatimentDpe,
  urlJsonDepartement,
} from "../../lib/crm/dpeDepartements";
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
  const carteRef = useRef(null);
  const mapRef = useRef(null);
  const calqueRef = useRef(null);
  const rendererRef = useRef(null);
  const sniperRef = useRef(null);
  const proptechLayerRef = useRef(null);
  const annoncesLayerRef = useRef(null);
  const derniereCibleIdRef = useRef(null);

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

    chargerDpeDepartement(code, { signal: ac.signal, typeBatiment })
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
  }, [code, typeBatiment]);

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
        map.flyTo([cibleVille.lat, cibleVille.lng], 14, { duration: 0.7 });
      }
      return;
    }

    derniereCibleIdRef.current = null;
    const ville = payload?.villePrincipale;
    const fallback = meta;
    const lat = ville?.lat ?? fallback?.lat;
    const lng = ville?.lng ?? fallback?.lng;
    const zoom = ville?.zoom ?? fallback?.zoom ?? 12;
    if (lat == null || lng == null) return;
    map.flyTo([lat, lng], zoom, { duration: 0.85 });
  }, [code, payload, meta, cibleVille]);

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
    : payload?.villePrincipale?.nom || meta?.villePrincipale || "—";

  const choisirVille = (item) => {
    const brut = String(item.departement || "").trim();
    setNoticeVille("");
    setCibleVille(item);
    setSelection(null);
    setAnnonceActive(null);
    setCibleAdresse(null);
    derniereCibleIdRef.current = item.id;
    mapRef.current?.flyTo([item.lat, item.lng], 14, { duration: 0.7 });

    const dept = /^\d+$/.test(brut) ? brut.padStart(2, "0") : brut;
    if (!dept || dept === code) return;
    if (trouverDepartementDpe(dept)) {
      setCode(dept);
      return;
    }
    setNoticeVille(
      `Aucun fichier DPE pour le département ${dept}. Carte centrée sur ${item.nom} (zoom 14).`,
    );
  };

  const choisirAdresse = (item) => {
    setNoticeVille("");
    setCibleVille(null);
    setAnnonceActive(null);
    setSelection(null);
    setCibleAdresse(item);
    setSniperMasque(false);
    mapRef.current?.flyTo([item.lat, item.lng], 18, { duration: 0.6 });
    const brut = String(item.departement || "").trim();
    const dept = /^\d+$/.test(brut) ? brut.padStart(2, "0") : brut;
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

  const choisirPack42 = (type) => {
    setSelection(null);
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
              setCibleVille(null);
              setNoticeVille("");
              setSelection(null);
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
            {DEPARTEMENTS_DPE.map((dept) => (
              <option key={dept.code} value={dept.code}>
                {libelleOptionDepartement(dept)}
              </option>
            ))}
          </select>
        </label>
        <label className="block min-w-[14rem] flex-1">
          <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
            Type de bâtiment
          </span>
          <select
            data-testid="select-type-batiment"
            value={typeBatiment}
            onChange={(e) => {
              const suivant = e.target.value;
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
            {TYPES_BATIMENT_DPE.map((item) => (
              <option key={item.id} value={item.id}>
                {item.icone} {item.label}
              </option>
            ))}
          </select>
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
              {NB_PARTICULIERS_42} Particuliers F/G à rénover
            </button>
            <button
              type="button"
              data-testid="compteur-42-b2b"
              aria-pressed={modeB2b}
              onClick={() => choisirPack42("industriel")}
              className={classeBadge(modeB2b, "border-sky-300 bg-sky-500/25 text-sky-50")}
            >
              {NB_CIBLES_B2B_42} Cibles B2B Décarbonation / Solaire
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
      <p className="mb-3 text-xs text-slate-400" data-testid="compteur-marche-dpe">
        {chargement
          ? "Chargement du fichier JSON…"
          : code === "42"
            ? `${NB_PARTICULIERS_42} Particuliers F/G à rénover · ${NB_CIBLES_B2B_42} Cibles B2B Décarbonation / Solaire`
            : `${logementsAffiches.length} ${modeB2b ? "site(s) B2B" : "bâtiment(s)"}`}
        {!chargement && payload && code !== "42" ? ` · ${nbPassoires} passoires F/G` : ""}
        <span className="text-slate-500">
          {" "}
          · {trouverTypeBatimentDpe(typeBatiment)?.icone} {trouverTypeBatimentDpe(typeBatiment)?.label}
          · centrée sur {villeLabel}
          {cibleVille ? " · zoom 14" : ""} · {urlJsonDepartement(code, typeBatiment).replace("/data/dpe/", "")} uniquement
          {voirAnnonces ? ` · ${annonces.length} biens à vendre (démo)` : ""}
        </span>
      </p>
      {noticeVille ? <p className="mb-3 text-[11px] text-amber-200">{noticeVille}</p> : null}

      <div className="w-full h-[650px] relative rounded-xl overflow-hidden">
        <div ref={carteRef} className="dpe-mapper-carte absolute inset-0 z-0 h-full w-full" />
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

        {chargement && !cibleVille ? (
          <div className="absolute inset-0 z-[1500] flex items-center justify-center bg-slate-950/40 text-sm text-slate-200">
            Chargement de {meta?.nom ?? code}.json…
          </div>
        ) : null}

        {erreur ? (
          <div className="absolute bottom-4 left-4 right-4 z-[2000] rounded-xl border border-rose-500/40 bg-rose-950/90 px-4 py-3 text-sm text-rose-100">
            {erreur} Placez le fichier dans <code className="font-mono text-rose-200">public{urlJsonDepartement(code, typeBatiment)}</code>.
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
              {typeBatiment === "tertiaire" ? (
                <>
                  <li>Surface : {selection.surface ? `${selection.surface} m²` : "—"}</li>
                  <li>Décret tertiaire : {selection.decretTertiaire || "À vérifier"}</li>
                </>
              ) : null}
              {typeBatiment === "industriel" ? (
                <>
                  <li>Activité : {selection.activite || "—"}</li>
                  <li>
                    Potentiel PV toiture (estimatif) :{" "}
                    {selection.potentielPvKwc != null ? `${selection.potentielPvKwc} kWc` : "—"}
                  </li>
                  <li>Surface : {selection.surface ? `${selection.surface} m²` : "—"}</li>
                </>
              ) : null}
              <li>Année : {selection.annee || "—"}</li>
              <li>Chauffage : {selection.chauffage || "—"}</li>
              <li>Conso : {selection.conso ? `${selection.conso} kWh/m².an` : "—"}</li>
              <li className="font-mono text-sky-300">{selection.id}</li>
            </ul>
          </aside>
        ) : null}
      </div>
      <p className="border-t border-slate-800 px-4 py-3 text-[11px] leading-relaxed text-slate-500">
        Données DPE de démonstration, à titre indicatif. Un seul fichier JSON est chargé à la fois
        (public{urlJsonDepartement(code, typeBatiment)}) pour ne pas alourdir le navigateur. Remplacez ces extraits par
        un dump ADEME local du même nom pour le département et le type concernés. Cadastre : IGN API Carto /
        Parcellaire Express. Mutations : DVF DGFiP/Etalab. Risques : Géorisques.gouv.fr.
      </p>
    </section>
  );
}
