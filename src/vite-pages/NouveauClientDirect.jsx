import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RecapDevisClientDirect from "../components/crm/RecapDevisClientDirect.jsx";
import {
  PHOTOS_CHANTIER_CLIENT_DIRECT,
  POSTES_CLIENT_DIRECT,
  SAUTS_CLASSES,
  calculerDevisClientDirect,
  calculerProfilAnahClient,
  enregistrerClientDirect,
  libelleProfilAnah,
} from "../lib/crm/clientDirect.js";

const CHAMP =
  "mt-2 w-full min-h-14 rounded-2xl border border-white/10 bg-slate-950 px-4 text-base text-white outline-none placeholder:text-slate-500 focus:border-emerald-300/80 focus:ring-2 focus:ring-emerald-300/30";

const COULEUR_PROFIL = {
  bleu: "border-sky-400/60 bg-sky-500/20 text-sky-100",
  jaune: "border-amber-300/70 bg-amber-400/20 text-amber-50",
  violet: "border-violet-400/60 bg-violet-500/20 text-violet-100",
  rose: "border-rose-400/60 bg-rose-500/20 text-rose-100",
};

function compresserPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !String(file.type || "").startsWith("image/")) {
      reject(new Error("Choisissez une photo."));
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      const max = 1280;
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
      resolve(canvas.toDataURL("image/jpeg", 0.72));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Photo illisible. Reprenez-la en JPEG."));
    };
    image.src = url;
  });
}

function Section({ numero, titre, children }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 sm:p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">
        {numero}. {titre}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Champ({ label, erreur, children }) {
  return (
    <label className="block text-sm text-slate-300">
      {label}
      {children}
      {erreur ? <span className="mt-1 block text-xs text-rose-300">{erreur}</span> : null}
    </label>
  );
}

export default function NouveauClientDirect() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [email, setEmail] = useState("");
  const [adresse, setAdresse] = useState("");
  const [personnes, setPersonnes] = useState(1);
  const [rfr, setRfr] = useState("");
  const [numeroAuditMar, setNumeroAuditMar] = useState("");
  const [sautClasses, setSautClasses] = useState(3);
  const [posteIds, setPosteIds] = useState(["combles", "murs", "fenetres", "pac"]);
  const [photos, setPhotos] = useState({});
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState(null);

  const fiscalite = useMemo(() => calculerProfilAnahClient(rfr, personnes), [rfr, personnes]);
  const devis = useMemo(
    () => (fiscalite.profil && posteIds.length ? calculerDevisClientDirect(posteIds, fiscalite, sautClasses) : null),
    [fiscalite, posteIds, sautClasses],
  );
  const nbPhotos = Object.values(photos).filter(Boolean).length;

  function basculerPoste(id) {
    setPosteIds((actuel) => (actuel.includes(id) ? actuel.filter((item) => item !== id) : [...actuel, id]));
  }

  async function choisirPhoto(slotId, file) {
    if (!file) return;
    try {
      const dataUrl = await compresserPhoto(file);
      setPhotos((actuel) => ({ ...actuel, [slotId]: dataUrl }));
    } catch (error) {
      setErreurs((actuel) => ({ ...actuel, photos: error.message || "Photo refusée." }));
    }
  }

  function enregistrer(event) {
    event.preventDefault();
    setEnvoi(true);
    const retour = enregistrerClientDirect({
      nom,
      prenom,
      telephone,
      email,
      adresse,
      personnes,
      rfr,
      numeroAuditMar,
      sautClasses,
      posteIds,
      photos,
    });
    setEnvoi(false);
    if (!retour.ok) {
      setErreurs(retour.erreurs || {});
      return;
    }
    setErreurs({});
    setResultat(retour);
  }

  if (resultat?.projet) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-6">
        <div className="mx-auto max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Dossier enregistré</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">{resultat.projet.nom}</h1>
          <p className="mt-2 text-sm text-slate-300">
            Le dossier est dans la liste des projets et dans le pipeline commercial, au stade devis.
            {resultat.photosRetirees ? " Les photos n’ont pas pu être gardées : mémoire locale saturée." : ""}
          </p>
          <RecapDevisClientDirect devis={resultat.projet.devisIndicatif} />
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => navigate("/test-dashboard-crm#pipeline")}
              className="min-h-14 rounded-2xl bg-emerald-500 px-4 text-sm font-semibold text-slate-950"
            >
              Voir le pipeline
            </button>
            <button
              type="button"
              onClick={() => navigate("/test-dashboard-crm#projets")}
              className="min-h-14 rounded-2xl border border-slate-700 px-4 text-sm font-semibold text-white"
            >
              Voir la liste des projets
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-100 sm:px-6">
      <form onSubmit={enregistrer} className="mx-auto flex max-w-lg flex-col gap-4 pb-28" data-testid="formulaire-nouveau-client">
        <header className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">ENERGIA-CONSEIL IA®</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Nouveau client direct</h1>
            <p className="mt-1 text-sm text-slate-400">Saisie terrain — téléphone ou tablette.</p>
          </div>
          <Link to="/test-dashboard-crm" className="shrink-0 text-sm text-slate-400 underline-offset-2">
            CRM
          </Link>
        </header>

        <Section numero="1" titre="Coordonnées">
          <Champ label="Nom" erreur={erreurs.nom}>
            <input className={CHAMP} value={nom} onChange={(event) => setNom(event.target.value)} autoComplete="family-name" />
          </Champ>
          <Champ label="Prénom" erreur={erreurs.prenom}>
            <input className={CHAMP} value={prenom} onChange={(event) => setPrenom(event.target.value)} autoComplete="given-name" />
          </Champ>
          <Champ label="Téléphone" erreur={erreurs.telephone}>
            <input className={CHAMP} value={telephone} onChange={(event) => setTelephone(event.target.value)} inputMode="tel" autoComplete="tel" />
          </Champ>
          <Champ label="E-mail" erreur={erreurs.email}>
            <input className={CHAMP} value={email} onChange={(event) => setEmail(event.target.value)} inputMode="email" autoComplete="email" />
          </Champ>
          <Champ label="Adresse du chantier" erreur={erreurs.adresse}>
            <textarea className={`${CHAMP} min-h-24 py-3`} value={adresse} onChange={(event) => setAdresse(event.target.value)} placeholder="12 rue des Lilas, 42510 Bussières" />
          </Champ>
        </Section>

        <Section numero="2" titre="Fiscalité Anah 2026">
          <Champ label="Nombre de personnes au foyer">
            <select className={CHAMP} value={personnes} onChange={(event) => setPersonnes(Number(event.target.value))}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n} {n > 1 ? "personnes" : "personne"}
                </option>
              ))}
            </select>
          </Champ>
          <Champ label="Revenu fiscal de référence (€)" erreur={erreurs.rfr}>
            <input className={CHAMP} value={rfr} onChange={(event) => setRfr(event.target.value)} inputMode="numeric" placeholder="20 216" />
          </Champ>
          <div
            className={`rounded-2xl border px-4 py-3 ${COULEUR_PROFIL[fiscalite.profil] || "border-slate-700 bg-slate-950 text-slate-400"}`}
            data-testid="profil-anah-calcule"
          >
            <p className="text-xs font-semibold uppercase tracking-wide">Profil Anah hors Île-de-France</p>
            <p className="mt-1 text-lg font-semibold">{fiscalite.profil ? libelleProfilAnah(fiscalite.profil) : "Saisissez le RFR"}</p>
            {fiscalite.profil ? (
              <p className="mt-1 text-xs">
                Bleu ≤ {fiscalite.seuils.bleu.toLocaleString("fr-FR")} € · Jaune ≤ {fiscalite.seuils.jaune.toLocaleString("fr-FR")} € · Violet ≤ {fiscalite.seuils.violet.toLocaleString("fr-FR")} €
              </p>
            ) : null}
          </div>
        </Section>

        <Section numero="3" titre="Données audit">
          <Champ label="N° d'audit MAR">
            <input className={CHAMP} value={numeroAuditMar} onChange={(event) => setNumeroAuditMar(event.target.value)} placeholder="A26420202241D" autoCapitalize="characters" />
          </Champ>
          <Champ label="Saut de classes prévu" erreur={erreurs.sautClasses}>
            <select className={CHAMP} value={sautClasses} onChange={(event) => setSautClasses(Number(event.target.value))}>
              {SAUTS_CLASSES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label} — plafond {item.plafondHt.toLocaleString("fr-FR")} € HT
                </option>
              ))}
            </select>
          </Champ>
        </Section>

        <Section numero="4" titre="Relevé des 10 photos chantier">
          <p className="text-sm text-slate-400">{nbPhotos} / 10 photos. L’appareil photo du téléphone s’ouvre directement.</p>
          {erreurs.photos ? <p className="text-xs text-rose-300">{erreurs.photos}</p> : null}
          <div className="grid grid-cols-2 gap-3">
            {PHOTOS_CHANTIER_CLIENT_DIRECT.map((slot) => (
              <label key={slot.id} className="block overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
                {photos[slot.id] ? (
                  <img src={photos[slot.id]} alt={slot.label} className="h-28 w-full object-cover" />
                ) : (
                  <span className="flex h-28 items-center justify-center px-2 text-center text-xs text-slate-500">Appuyer pour photographier</span>
                )}
                <span className="block px-2 py-2 text-xs font-medium text-slate-200">{slot.label}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    event.target.value = "";
                    choisirPhoto(slot.id, file);
                  }}
                />
              </label>
            ))}
          </div>
        </Section>

        <Section numero="5" titre="Postes de travaux envisagés">
          {erreurs.postes ? <p className="text-xs text-rose-300">{erreurs.postes}</p> : null}
          <ul className="space-y-2">
            {POSTES_CLIENT_DIRECT.map((poste) => {
              const coche = posteIds.includes(poste.id);
              return (
                <li key={poste.id}>
                  <label className={`flex min-h-14 items-center gap-3 rounded-2xl border px-3 py-2 ${coche ? "border-emerald-400/60 bg-emerald-500/10" : "border-slate-800 bg-slate-950"}`}>
                    <input type="checkbox" checked={coche} onChange={() => basculerPoste(poste.id)} className="h-5 w-5 accent-emerald-500" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-white">{poste.ordre}. {poste.nom}</span>
                      <span className="block text-xs text-slate-400">{poste.spec} — {poste.ht.toLocaleString("fr-FR")} € HT</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <p className="text-xs leading-relaxed text-slate-400">
            La marge contractant général de 5 200 € HT (TVA 20 %) est ajoutée automatiquement, après les postes, dans l’ordre optimal des travaux.
          </p>
          {devis ? <RecapDevisClientDirect devis={devis} /> : null}
        </Section>

        {erreurs.formulaire ? <p className="text-sm text-rose-300">{erreurs.formulaire}</p> : null}

        <div className="fixed inset-x-0 bottom-0 border-t border-slate-800 bg-slate-950/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-lg">
            <button
              type="submit"
              disabled={envoi}
              data-testid="enregistrer-dossier-client"
              className="min-h-14 w-full rounded-2xl bg-emerald-500 text-base font-semibold text-slate-950 disabled:opacity-60"
            >
              Enregistrer le dossier
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
