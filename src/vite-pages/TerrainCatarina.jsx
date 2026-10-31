import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import VisionneusePhoto from "../components/crm/VisionneusePhoto.jsx";
import GalerieRelevesTerrain from "../components/crm/GalerieRelevesTerrain.jsx";
import {
  convertirPhotoHauteResolution,
  photosDepuisFormulaire,
  restaurerBrouillonPhotos,
  sauverBrouillonPhotos,
  synchroniserPhotosReleve,
} from "../lib/crm/photosReleveTerrain.js";
import {
  JALON_RELEVE_TERRAIN,
  MAX_PHOTOS_RELEVE,
  OBJECTIFS_RELEVE,
  PHOTOS_BIEN,
  PHOTOS_DOCUMENTS,
  dateDuJourLocale,
  enregistrerReleveTerrainCatarina,
  extraireLocalisation,
  mentionPhotosSynchronisees,
  messageTransmissionWhatsApp,
  telephoneReleveValide,
  urlWhatsAppSylvain,
} from "../lib/crm/releveTerrainCatarina.js";

const CHAMP =
  "mt-2 w-full min-h-14 rounded-2xl border border-white/10 bg-slate-950 px-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-amber-300/80 focus:ring-2 focus:ring-amber-300/30";

function vibrer(pattern = 12) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* retour haptique indisponible */
  }
}

function dateLongue(iso) {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function IconeAppareil() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-7 w-7">
      <path
        fill="currentColor"
        d="M9 4.5 7.8 6.5H5.5A2.5 2.5 0 0 0 3 9v8.5A2.5 2.5 0 0 0 5.5 20h13a2.5 2.5 0 0 0 2.5-2.5V9a2.5 2.5 0 0 0-2.5-2.5h-2.3L15 4.5H9Zm3 4a4.75 4.75 0 1 1 0 9.5 4.75 4.75 0 0 1 0-9.5Zm0 1.8a2.95 2.95 0 1 0 0 5.9 2.95 2.95 0 0 0 0-5.9Z"
      />
    </svg>
  );
}

function Erreur({ message }) {
  if (!message) return null;
  return <p className="mt-2 text-sm leading-snug text-amber-200">{message}</p>;
}

function Bloc({ numero, titre, fait, children }) {
  return (
    <section
      className={`rounded-3xl border p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] sm:p-5 ${
        fait ? "border-emerald-400/45 bg-slate-900" : "border-white/10 bg-slate-900/85"
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold ${
            fait ? "bg-emerald-400 text-slate-950" : "bg-slate-800 text-amber-200"
          }`}
        >
          {numero}
        </span>
        <h2 className="text-lg font-semibold tracking-tight text-white">{titre}</h2>
      </div>
      {children}
    </section>
  );
}

function BoutonPhoto({ id, label, apercu, onChoisir, onVoir }) {
  return (
    <div
      className={`rounded-2xl border px-3 py-2 ${
        apercu ? "border-emerald-400/50 bg-emerald-400/10" : "border-white/10 bg-slate-950"
      }`}
    >
      <label
        htmlFor={id}
        onPointerDown={() => vibrer(8)}
        className="flex min-h-[4.75rem] cursor-pointer items-center gap-3 text-left text-base font-semibold text-slate-100 active:scale-[0.98]"
      >
        {apercu ? (
          <img src={apercu} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-amber-200">
            <IconeAppareil />
          </span>
        )}
        <span className="leading-snug">
          <span className="block text-amber-200">{apercu ? "Reprendre" : "+"}</span>
          {label}
        </span>
      </label>
      {apercu ? (
        <button
          type="button"
          onClick={onVoir}
          className="mt-2 min-h-11 w-full rounded-xl border border-white/15 text-sm font-semibold text-white"
        >
          Voir en grand
        </button>
      ) : null}
      <input
        id={id}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={onChoisir}
      />
    </div>
  );
}

function formulaireVide() {
  return {
    nom: "",
    telephone: "",
    adresse: "",
    dateVisite: dateDuJourLocale(),
    photosBien: {},
    surfaceHabitable: "",
    longueurSol: "",
    largeurSol: "",
    hauteurSousPlafond: "",
    surfaceCombles: "",
    nombreFenetres: "",
    photosDocuments: {},
    objectif: "",
  };
}

export default function TerrainCatarina() {
  const [form, setForm] = useState(formulaireVide);
  const [erreurs, setErreurs] = useState({});
  const [erreurPhoto, setErreurPhoto] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [succes, setSucces] = useState(null);
  const [brouillonPret, setBrouillonPret] = useState(false);
  const [photoOuverte, setPhotoOuverte] = useState(null);

  useEffect(() => {
    const precedent = document.title;
    document.title = "Relevé express Catarina — ENERGIA CONSEIL IA";
    return () => {
      document.title = precedent;
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    restaurerBrouillonPhotos().then((brouillon) => {
      if (ignore || !brouillon.total) {
        setBrouillonPret(true);
        return;
      }
      setForm((prev) => ({
        ...prev,
        photosBien: { ...prev.photosBien, ...brouillon.photosBien },
        photosDocuments: { ...prev.photosDocuments, ...brouillon.photosDocuments },
      }));
      setBrouillonPret(true);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const photosBienPrises = PHOTOS_BIEN.filter((slot) => form.photosBien[slot.id]).length;
  const photosDocsPrises = PHOTOS_DOCUMENTS.filter((slot) => form.photosDocuments[slot.id]).length;
  const cotesRemplies = [
    form.surfaceHabitable,
    form.longueurSol,
    form.largeurSol,
    form.hauteurSousPlafond,
    form.surfaceCombles,
    form.nombreFenetres,
  ].filter((valeur) => String(valeur).trim() !== "").length;

  const galeriePrise = photosDepuisFormulaire(form);
  const totalPhotos = galeriePrise.length;

  const blocsFaits = useMemo(() => {
    const client =
      form.nom.trim().length >= 2 &&
      telephoneReleveValide(form.telephone) &&
      extraireLocalisation(form.adresse).ok;
    return [
      client,
      photosBienPrises > 0,
      cotesRemplies > 0,
      photosDocsPrises > 0,
      Boolean(form.objectif),
    ];
  }, [form, photosBienPrises, photosDocsPrises, cotesRemplies]);

  useEffect(() => {
    if (!brouillonPret || succes) return undefined;
    const timer = window.setTimeout(() => {
      sauverBrouillonPhotos(form);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [form, brouillonPret, succes]);

  const progression = blocsFaits.filter(Boolean).length;
  const telephoneAppel = form.telephone.replace(/[^\d+]/g, "");

  const changer = (cle) => (event) => {
    setForm((prev) => ({ ...prev, [cle]: event.target.value }));
  };

  const choisirPhoto = (groupe, id) => async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    vibrer(10);
    try {
      const dataUrl = await convertirPhotoHauteResolution(file);
      setForm((prev) => ({ ...prev, [groupe]: { ...prev[groupe], [id]: dataUrl } }));
      setErreurPhoto("");
    } catch (error) {
      setErreurPhoto(error instanceof Error ? error.message : "Photo illisible.");
      vibrer([20, 30, 20]);
    }
  };

  const soumettre = async (event) => {
    event.preventDefault();
    if (envoi) return;
    vibrer(14);
    setEnvoi(true);
    const resultat = enregistrerReleveTerrainCatarina(form);
    if (!resultat.ok) {
      setEnvoi(false);
      setErreurs(resultat.erreurs || {});
      vibrer([18, 36, 18]);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const nbPhotos = photosDepuisFormulaire(form).length;
    const message = messageTransmissionWhatsApp(resultat.projet, nbPhotos);
    const lienWhatsApp = urlWhatsAppSylvain(message);
    window.open(lienWhatsApp, "_blank", "noopener,noreferrer");
    const sync = await synchroniserPhotosReleve(resultat.projet, form);
    const mention = mentionPhotosSynchronisees(sync.nb);
    setEnvoi(false);
    setErreurs({});
    setSucces({ ...resultat, nbPhotos: sync.nb, cloud: sync.cloud, mention, lienWhatsApp });
    vibrer([12, 28, 12, 28, 18]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const nouveau = () => {
    vibrer(10);
    setForm(formulaireVide());
    setErreurs({});
    setErreurPhoto("");
    setSucces(null);
  };

  if (succes?.projet) {
    return (
      <div className="min-h-dvh bg-slate-950 px-4 py-8 text-slate-100">
        <div className="mx-auto flex min-h-[80dvh] max-w-lg flex-col justify-center">
          <div className="rounded-[2rem] border border-amber-300/40 bg-gradient-to-b from-amber-300/15 to-slate-900 p-6 text-center shadow-[0_20px_60px_rgba(217,119,6,0.18)] sm:p-8">
            <p className="text-4xl" aria-hidden="true">
              ✨
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
              Maison Martins
            </p>
            <h1 className="mt-3 text-2xl font-semibold leading-snug text-white">
              Dossier transmis avec succès à Sylvain Lembelembe. Étude et note d&apos;arbitrage
              remises sous 48h chrono.
            </h1>
            <p className="mt-4 text-base text-slate-300">
              {succes.projet.nom}
              <span className="mt-1 block text-sm text-slate-400">{succes.projet.adresse}</span>
            </p>
            <p className="mt-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-50">
              {JALON_RELEVE_TERRAIN}
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.16em] text-violet-200">
              Apporteur {succes.projet.etiquetteApporteur}
            </p>
            {succes.mention ? (
              <p className="mt-4 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-50">
                {succes.mention}
              </p>
            ) : null}
            {succes.lienWhatsApp ? (
              <a
                href={succes.lienWhatsApp}
                className="mt-3 inline-flex min-h-12 items-center justify-center text-sm font-semibold text-amber-200 underline-offset-2"
              >
                Rouvrir le récapitulatif WhatsApp
              </a>
            ) : null}
            {succes.photosAllegees ? (
              <p className="mt-4 text-sm text-amber-100">
                Le dossier est bien créé. Les originaux photo sont conservés dans la galerie du CRM.
              </p>
            ) : null}
            {!succes.cloud ? (
              <p className="mt-4 text-sm text-amber-100">
                Les photos sont enregistrées sur cet appareil et dans le dossier du CRM. Si le cloud n&apos;est pas joignable, ouvrez le CRM sur le même réseau pour les récupérer.
              </p>
            ) : null}
            <div className="mt-8 grid gap-3">
              <button
                type="button"
                onClick={nouveau}
                className="min-h-14 rounded-2xl bg-amber-300 text-base font-bold text-slate-950 active:scale-[0.98]"
              >
                Nouveau relevé
              </button>
              <Link
                to="/test-dashboard-crm"
                className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-white/15 text-base font-semibold text-white active:scale-[0.98]"
              >
                Ouvrir le CRM
              </Link>
            </div>
          </div>
          <div className="mx-auto mt-6 w-full max-w-3xl">
            <GalerieRelevesTerrain variante="terrain" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-slate-950 text-slate-100 [color-scheme:dark]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-200/90">
              Catarina Martins · Terrain restreint
            </p>
            <Link to="/test-dashboard-crm" className="shrink-0 text-xs font-medium text-slate-400 underline-offset-2 active:text-white">
              CRM
            </Link>
          </div>
          <h1 className="mt-2 text-xl font-semibold leading-snug text-white sm:text-2xl">
            Maison Martins &amp; Energia Conseil IA — Relevé Express 10 min
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Relevé terrain uniquement. Les marges internes et les coûts de sous-traitance ne figurent pas ici.
          </p>
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-300">
              <span>{progression === 5 ? "Prêt à transmettre" : `Préparation · ${progression}/5`}</span>
              <span className="text-amber-200">{Math.round((progression / 5) * 100)} %</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-amber-200">
              {totalPhotos}/{MAX_PHOTOS_RELEVE} photos
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800" role="progressbar" aria-valuenow={progression} aria-valuemin={0} aria-valuemax={5}>
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-400 transition-[width] duration-300"
                style={{ width: `${(progression / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <form id="releve-catarina" onSubmit={soumettre} className="mx-auto grid max-w-3xl gap-4 px-4 pb-48 pt-5">
        {erreurs.formulaire ? (
          <p className="rounded-2xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
            {erreurs.formulaire}
          </p>
        ) : null}

        <Bloc numero="1" titre="Le client" fait={blocsFaits[0]}>
          <label className="block text-sm font-medium text-slate-300">
            Nom &amp; prénom
            <input
              required
              autoComplete="name"
              className={CHAMP}
              value={form.nom}
              onChange={changer("nom")}
              placeholder="Camille Martin"
            />
            <Erreur message={erreurs.nom} />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-300">
            Téléphone
            <span className="mt-2 flex gap-2">
              <input
                required
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={`${CHAMP} mt-0`}
                value={form.telephone}
                onChange={changer("telephone")}
                placeholder="06 12 34 56 78"
              />
              {telephoneAppel.length >= 10 ? (
                <a
                  href={`tel:${telephoneAppel}`}
                  onPointerDown={() => vibrer(8)}
                  className="inline-flex min-h-14 min-w-14 items-center justify-center rounded-2xl bg-emerald-400 text-xl text-slate-950 active:scale-95"
                  aria-label="Appeler le client"
                >
                  ☎
                </a>
              ) : null}
            </span>
            <Erreur message={erreurs.telephone} />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-300">
            Adresse complète du bien
            <textarea
              required
              rows={3}
              autoComplete="street-address"
              className={`${CHAMP} min-h-24 py-3`}
              value={form.adresse}
              onChange={changer("adresse")}
              placeholder="12 rue des Lilas, 71150 Chagny"
            />
            <Erreur message={erreurs.adresse} />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-300">
            Date de visite
            <input type="date" className={CHAMP} value={form.dateVisite} onChange={changer("dateVisite")} />
            <span className="mt-2 block text-sm capitalize text-slate-400">{dateLongue(form.dateVisite)}</span>
            <Erreur message={erreurs.dateVisite} />
          </label>
        </Bloc>

        <Bloc numero="2" titre="Les photos du bien" fait={blocsFaits[1]}>
          <p className="mb-3 text-sm font-semibold text-amber-200">
            {totalPhotos}/{MAX_PHOTOS_RELEVE} photos · haute résolution
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {PHOTOS_BIEN.map((slot) => (
              <BoutonPhoto
                key={slot.id}
                id={`bien-${slot.id}`}
                label={slot.label}
                apercu={form.photosBien[slot.id]}
                onChoisir={choisirPhoto("photosBien", slot.id)}
                onVoir={() => {
                  const index = galeriePrise.findIndex((photo) => photo.id === slot.id);
                  setPhotoOuverte(index < 0 ? 0 : index);
                }}
              />
            ))}
          </div>
        </Bloc>

        <Bloc numero="3" titre="Les cotes rapides" fait={blocsFaits[2]}>
          <p className="mb-3 text-sm text-slate-400">Télémètre laser — chiffres uniquement.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-300">
              Surface habitable (m²)
              <input
                inputMode="decimal"
                className={CHAMP}
                value={form.surfaceHabitable}
                onChange={changer("surfaceHabitable")}
                placeholder="128"
              />
              <Erreur message={erreurs.surfaceHabitable} />
            </label>
            <fieldset className="min-w-0">
              <legend className="text-sm font-medium text-slate-300">Longueur × largeur au sol (m)</legend>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  aria-label="Longueur au sol en mètres"
                  inputMode="decimal"
                  className={`${CHAMP} mt-0 px-3`}
                  value={form.longueurSol}
                  onChange={changer("longueurSol")}
                  placeholder="L"
                />
                <input
                  aria-label="Largeur au sol en mètres"
                  inputMode="decimal"
                  className={`${CHAMP} mt-0 px-3`}
                  value={form.largeurSol}
                  onChange={changer("largeurSol")}
                  placeholder="l"
                />
              </div>
              <Erreur message={erreurs.longueurSol || erreurs.largeurSol} />
            </fieldset>
            <label className="block text-sm font-medium text-slate-300">
              Hauteur sous plafond (m)
              <input
                inputMode="decimal"
                className={CHAMP}
                value={form.hauteurSousPlafond}
                onChange={changer("hauteurSousPlafond")}
                placeholder="2,50"
              />
              <Erreur message={erreurs.hauteurSousPlafond} />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Combles (m²)
              <input
                inputMode="decimal"
                className={CHAMP}
                value={form.surfaceCombles}
                onChange={changer("surfaceCombles")}
                placeholder="65"
              />
              <Erreur message={erreurs.surfaceCombles} />
            </label>
            <label className="block text-sm font-medium text-slate-300">
              Fenêtres à changer
              <input
                inputMode="numeric"
                className={CHAMP}
                value={form.nombreFenetres}
                onChange={changer("nombreFenetres")}
                placeholder="8"
              />
              <Erreur message={erreurs.nombreFenetres} />
            </label>
          </div>
        </Bloc>

        <Bloc numero="4" titre="Les 3 documents clés" fait={blocsFaits[3]}>
          <div className="grid gap-3">
            {PHOTOS_DOCUMENTS.map((slot) => (
              <BoutonPhoto
                key={slot.id}
                id={`doc-${slot.id}`}
                label={slot.label}
                apercu={form.photosDocuments[slot.id]}
                onChoisir={choisirPhoto("photosDocuments", slot.id)}
                onVoir={() => {
                  const index = galeriePrise.findIndex((photo) => photo.id === slot.id);
                  setPhotoOuverte(index < 0 ? 0 : index);
                }}
              />
            ))}
          </div>
          {erreurPhoto ? <Erreur message={erreurPhoto} /> : null}
        </Bloc>

        <Bloc numero="5" titre="L'objectif client" fait={blocsFaits[4]}>
          <fieldset className="grid gap-3">
            <legend className="sr-only">Objectif du client</legend>
            {OBJECTIFS_RELEVE.map((item) => {
              const choisi = form.objectif === item.id;
              return (
                <label
                  key={item.id}
                  onPointerDown={() => vibrer(8)}
                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-base leading-snug active:scale-[0.98] ${
                    choisi
                      ? "border-amber-300 bg-amber-300/15 text-white shadow-[0_0_0_1px_rgba(252,211,77,0.35)]"
                      : "border-white/10 bg-slate-950 text-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="objectif"
                    value={item.id}
                    checked={choisi}
                    onChange={changer("objectif")}
                    className="h-5 w-5 shrink-0 accent-amber-400"
                  />
                  <span>{item.label}</span>
                </label>
              );
            })}
          </fieldset>
          <Erreur message={erreurs.objectif} />
        </Bloc>

        <GalerieRelevesTerrain variante="terrain" />

        <p className="px-1 text-center text-xs leading-relaxed text-slate-500">
          Bureau d&apos;études · Sylvain LEMBELEMBE · 06 10 59 68 98
        </p>
      </form>

      {photoOuverte != null ? (
        <VisionneusePhoto
          photos={galeriePrise.map((photo) => ({ ...photo, src: photo.dataUrl }))}
          index={photoOuverte}
          onIndex={setPhotoOuverte}
          onClose={() => setPhotoOuverte(null)}
        />
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-amber-300/25 bg-slate-950/95 px-4 pt-3 backdrop-blur-md pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-3xl">
          <button
            type="submit"
            form="releve-catarina"
            disabled={envoi}
            className="min-h-16 w-full rounded-2xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-400 text-base font-extrabold tracking-wide text-slate-950 shadow-[0_10px_30px_rgba(251,191,36,0.28)] active:scale-[0.98] disabled:opacity-60"
          >
            {envoi ? "Transmission…" : "⚡ TRANSMETTRE AU BUREAU D'ÉTUDES (SYLVAIN)"}
          </button>
        </div>
      </div>
    </div>
  );
}
