import { useEffect, useMemo, useState } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  AVERTISSEMENT_CONFIDENTIALITE,
  FILTRES_ANCIENNETE,
  FILTRES_URGENCE,
  TYPES_PROBLEME,
  chargerInsalubrite,
  couleurUrgence,
  emojiProbleme,
  libelleProbleme,
  pointVisible,
  type PointInsalubrite,
} from "../../lib/crm/insalubrite";
import { creerDossierInsalubrite, lireDossiersInsalubrite } from "../../lib/crm/dossiersInsalubrite";

type Props = {
  onDossierCree?: (dossier: ReturnType<typeof creerDossierInsalubrite>) => void;
};

function Recentrer({ centre, zoom }: { centre: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(centre, zoom);
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [centre, zoom, map]);
  return null;
}

function iconeSignalement(point: PointInsalubrite) {
  const couleur = couleurUrgence(point.urgency_score);
  const emoji = emojiProbleme(point.type_pb);
  return L.divIcon({
    className: "insal-icon",
    iconSize: [38, 38],
    iconAnchor: [19, 36],
    html: `<span class="insal-pulse" style="--insal-color:${couleur}" title="${emoji} ${point.type_pb}">
      <span class="insal-emoji">${emoji}</span>
      <em>${point.urgency_score}</em>
    </span>`,
  });
}

export default function InsalubriteRadar({ onDossierCree }: Props) {
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof chargerInsalubrite>> | null>(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState("");
  const [filtreType, setFiltreType] = useState("tous");
  const [filtreUrgence, setFiltreUrgence] = useState("tous");
  const [filtreAnciennete, setFiltreAnciennete] = useState("tous");
  const [selection, setSelection] = useState<PointInsalubrite | null>(null);
  const [messageDossier, setMessageDossier] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    chargerInsalubrite(ac.signal)
      .then((data) => {
        setPayload(data);
        setErreur("");
      })
      .catch((err: Error) => {
        if (err?.name === "AbortError") return;
        setErreur(err?.message || "Chargement impossible.");
      })
      .finally(() => {
        if (!ac.signal.aborted) setChargement(false);
      });
    return () => ac.abort();
  }, []);

  const points = useMemo(
    () => (payload?.points ?? []).filter((item) => pointVisible(item, filtreType, filtreUrgence, filtreAnciennete)),
    [payload, filtreType, filtreUrgence, filtreAnciennete],
  );

  const centre: [number, number] = [payload?.centre.lat ?? 46.7808, payload?.centre.lng ?? 4.8539];
  const zoom = payload?.centre.zoom ?? 11;

  const creerDossier = () => {
    if (!selection) return;
    const existant = lireDossiersInsalubrite().find((item: { sourcePointId: string }) => item.sourcePointId === selection.id);
    if (existant) {
      setMessageDossier("Dossier déjà ouvert pour cette zone — à compléter après consentement.");
      onDossierCree?.(existant);
      return;
    }
    const dossier = creerDossierInsalubrite(selection);
    setMessageDossier("Dossier créé. Occupant et contact à saisir uniquement après consentement.");
    onDossierCree?.(dossier);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
      <div className="relative min-h-[70vh]">
        {payload ? (
          <MapContainer
            center={centre}
            zoom={zoom}
            zoomControl={false}
            className="insal-carte absolute inset-0 z-0 h-full min-h-[70vh] w-full"
          >
            <Recentrer centre={centre} zoom={zoom} />
            <ZoomControl position="bottomleft" />
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            {points.map((point) => (
              <Marker
                key={point.id}
                position={[point.lat, point.lng]}
                icon={iconeSignalement(point)}
                eventHandlers={{
                  click: () => {
                    setMessageDossier("");
                    setSelection(point);
                  },
                }}
              />
            ))}
          </MapContainer>
        ) : (
          <div className="absolute inset-0 bg-slate-950" />
        )}

        <style>{`
          .insal-carte.leaflet-container { background: #020617; font: inherit; }
          .insal-carte img { max-width: none !important; }
          .insal-icon { background: none; border: 0; }
          .insal-pulse {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 38px;
            height: 38px;
            border-radius: 999px;
            background: #0f172a;
            border: 2px solid var(--insal-color);
            box-shadow: 0 0 0 0 var(--insal-color);
            animation: insal-pulse 1.9s ease-out infinite;
          }
          .insal-emoji { font-size: 16px; line-height: 1; }
          .insal-pulse em {
            position: absolute;
            right: -4px;
            bottom: -4px;
            min-width: 16px;
            height: 16px;
            padding: 0 3px;
            border-radius: 999px;
            background: var(--insal-color);
            color: #fff;
            font-size: 9px;
            font-style: normal;
            font-weight: 800;
            text-align: center;
            line-height: 16px;
          }
          @keyframes insal-pulse {
            0% { box-shadow: 0 0 0 0 var(--insal-color); }
            70% { box-shadow: 0 0 0 10px transparent; }
            100% { box-shadow: 0 0 0 0 transparent; }
          }
        `}</style>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[2000] flex flex-col gap-3 p-3 sm:p-4">
          <div className="pointer-events-auto rounded-2xl border border-amber-400/40 bg-amber-950/90 px-3 py-2 text-[11px] leading-relaxed text-amber-100 shadow-xl">
            {payload?.avertissement || AVERTISSEMENT_CONFIDENTIALITE}
          </div>
          <div className="pointer-events-auto rounded-2xl border border-slate-700/80 bg-slate-950/90 p-3 shadow-xl backdrop-blur">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <label className="block min-w-[12rem] flex-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Type de problème
                </span>
                <select
                  value={filtreType}
                  onChange={(e) => setFiltreType(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {TYPES_PROBLEME.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.emoji ? `${item.emoji} ` : ""}
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-[11rem] flex-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Score d'urgence
                </span>
                <select
                  value={filtreUrgence}
                  onChange={(e) => setFiltreUrgence(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {FILTRES_URGENCE.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block min-w-[11rem] flex-1">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
                  Ancienneté du signalement
                </span>
                <select
                  value={filtreAnciennete}
                  onChange={(e) => setFiltreAnciennete(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                >
                  {FILTRES_ANCIENNETE.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {chargement ? "Chargement des zones agrégées…" : `${points.length} zone(s) visible(s)`}
              <span className="text-slate-500"> · aucun nom, téléphone ni e-mail chargé</span>
            </p>
          </div>
        </div>

        {erreur ? (
          <div className="absolute bottom-4 left-4 right-4 z-[2000] rounded-xl border border-rose-500/40 bg-rose-950/90 px-4 py-3 text-sm text-rose-100">
            {erreur}
          </div>
        ) : null}

        {selection ? (
          <aside className="absolute bottom-16 right-4 z-[2600] w-[min(100%-2rem,21rem)] rounded-2xl border border-amber-400/30 bg-slate-950/95 p-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.45)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
              Zone agrégée · non nominative
            </p>
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <p className="text-[15px] font-bold leading-snug text-white">
                {emojiProbleme(selection.type_pb)} {libelleProbleme(selection.type_pb)}
              </p>
              <button type="button" className="shrink-0 text-xs text-slate-400 hover:text-white" onClick={() => setSelection(null)}>
                Fermer
              </button>
            </div>
            <p className="mt-1 text-sm text-slate-300">
              {selection.city} · {selection.quartier}
            </p>
            <p className="text-xs text-slate-500">{selection.zone_label}</p>
            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              <li>
                Score d'urgence :{" "}
                <span className="font-semibold text-orange-300">{selection.urgency_score} / 5</span>
              </li>
              <li>Signalements agrégés : {selection.signalements_count}</li>
              <li>
                Date du signalement :{" "}
                {selection.signalement_date
                  ? new Date(selection.signalement_date).toLocaleDateString("fr-FR")
                  : "—"}
              </li>
              <li>Type de bâti (anonyme) : {selection.building_kind || "—"}</li>
            </ul>
            <button
              type="button"
              onClick={creerDossier}
              className="mt-3 w-full rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Créer dossier Insalubrité
            </button>
            {messageDossier ? <p className="mt-2 text-[11px] leading-relaxed text-emerald-200">{messageDossier}</p> : null}
            <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
              Le dossier pourra ensuite être complété manuellement avec le consentement de l'occupant.
            </p>
          </aside>
        ) : null}
      </div>
    </section>
  );
}
