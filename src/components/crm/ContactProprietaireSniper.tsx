import { useEffect, useRef, useState } from "react";
import {
  estMaisonIndividuelle,
  rechercherEntrepriseAdresse,
  urlAnnuairePublic,
} from "../../lib/crm/rechercheEntreprises";
import {
  enregistrerFicheSniperCrm,
  NOM_PROPRIETAIRE_A_QUALIFIER,
  STATUT_A_QUALIFIER,
} from "../../lib/crm/enregistrerFicheSniper";

export const BADGE_REGISTRE_ENTREPRISES =
  "Source : Recherche d'entreprises (api.gouv.fr) — personne morale, SIREN et dirigeant publics.";

const CLE_FICHE = "energia-annuaire-fiche";

interface ContactEnregistre {
  nom: string;
  telephone: string;
  statut: string;
}

interface Props {
  identifiant?: string;
  typeBati?: string;
  adresse?: string;
  codePostal?: string;
  commune?: string;
  codeDep?: string;
  etiquette?: string;
  consoKwhM2?: number | null;
  surfaceHabitableM2?: number | null;
  anneeConstruction?: number | null;
  section?: string;
  numero?: string;
  chauffage?: string;
  variante?: "clair" | "sombre";
}

function cleStockage(identifiant?: string, adresse?: string) {
  return `${CLE_FICHE}:${identifiant || adresse || ""}`;
}

function lireFiche(cle: string): ContactEnregistre | null {
  if (!cle || typeof sessionStorage === "undefined") return null;
  try {
    const brut = JSON.parse(sessionStorage.getItem(cle) || "null");
    if (!brut?.nom && !brut?.telephone && !brut?.statut) return null;
    return {
      nom: String(brut.nom || ""),
      telephone: String(brut.telephone || ""),
      statut: String(brut.statut || STATUT_A_QUALIFIER),
    };
  } catch {
    return null;
  }
}

export default function ContactProprietaireSniper({
  identifiant,
  typeBati,
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
  variante = "clair",
}: Props) {
  const sombre = variante === "sombre";
  const maison = estMaisonIndividuelle(typeBati);
  const adresseUtile = String(adresse || "").trim();
  const exploitable = adresseUtile.length >= 8 && !/point sélectionné|non renseignée/i.test(adresseUtile);
  const [phase, setPhase] = useState<"repos" | "charge" | "trouve" | "vide" | "erreur">("repos");
  const [entreprise, setEntreprise] = useState<null | {
    denomination: string;
    dirigeant: string;
    qualite: string;
    siren: string;
  }>(null);
  const [message, setMessage] = useState("");
  const [nomSaisi, setNomSaisi] = useState("");
  const [telephoneSaisi, setTelephoneSaisi] = useState("");
  const [enregistre, setEnregistre] = useState<ContactEnregistre | null>(null);
  const [alerte, setAlerte] = useState("");
  const [toast, setToast] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stocke = lireFiche(cleStockage(identifiant, adresseUtile));
    setEnregistre(stocke);
    setNomSaisi(stocke?.nom && stocke.nom !== NOM_PROPRIETAIRE_A_QUALIFIER ? stocke.nom : "");
    setTelephoneSaisi(stocke?.telephone && stocke.telephone !== STATUT_A_QUALIFIER ? stocke.telephone : "");
    setEntreprise(null);
    setMessage("");
    setAlerte("");
    if (!exploitable) {
      setPhase("repos");
      return undefined;
    }
    const ac = new AbortController();
    setPhase("charge");
    rechercherEntrepriseAdresse({
      adresse: adresseUtile,
      codePostal,
      commune,
      signal: ac.signal,
    })
      .then((trouve) => {
        if (ac.signal.aborted) return;
        setEntreprise(trouve);
        setPhase(trouve ? "trouve" : "vide");
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setEntreprise(null);
        setPhase("erreur");
        setMessage(err?.message || "Registre des entreprises indisponible.");
      });
    return () => ac.abort();
  }, [identifiant, adresseUtile, codePostal, commune, exploitable]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const enregistrer = () => {
    try {
      const nomBrut = String(nomSaisi ?? "").trim();
      const telBrut = String(telephoneSaisi ?? "").trim();
      const idFiche = String(identifiant ?? "").trim();
      const adresseCle = String(adresseUtile ?? "").trim();
      const fiche = enregistrerFicheSniperCrm({
        identifiant: idFiche || adresseCle || "sans-identifiant",
        nom: nomBrut,
        telephone: telBrut,
        adresse: adresseCle,
        codePostal: String(codePostal ?? "").trim(),
        commune: String(commune ?? "").trim(),
        etiquette,
        consoKwhM2,
        surfaceHabitableM2,
        anneeConstruction,
        section,
        numero,
        chauffage,
      });
      const contact = {
        nom: fiche.nom || NOM_PROPRIETAIRE_A_QUALIFIER,
        telephone: fiche.telephone || "",
        statut: fiche.statut || STATUT_A_QUALIFIER,
      };
      if (typeof sessionStorage !== "undefined") {
        sessionStorage.setItem(cleStockage(idFiche || adresseCle || "sans-identifiant", adresseCle), JSON.stringify(contact));
      }
      setEnregistre(contact);
      setAlerte("");
      setToast(true);
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(false), 3200);
    } catch {
      setToast(false);
      setAlerte("La carte reste affichée. Réessayez l'enregistrement.");
    }
  };

  const bouton = sombre
    ? "mt-2 inline-flex w-full items-center justify-center rounded-lg border border-sky-300/50 bg-sky-500/15 px-2 py-1.5 text-center text-[11px] font-semibold text-sky-50 hover:bg-sky-500/25"
    : "no-print mt-1.5 inline-flex w-full items-center justify-center rounded border border-[#0B1F33] bg-[#0B1F33] px-2 py-1 text-center text-[9px] font-semibold text-white hover:bg-[#16324d]";
  const champ = sombre
    ? "w-full rounded border border-white/15 bg-slate-900 px-2 py-1 text-[11px] text-white"
    : "no-print w-full rounded border border-slate-300 bg-white px-2 py-1 text-[10px] text-slate-900";

  return (
    <div className={sombre ? "mt-2" : "mt-1"}>
      {phase === "charge" ? (
        <p className={sombre ? "text-[11px] text-amber-100" : "text-[10px] text-slate-600"}>
          Registre des entreprises sur cette adresse…
        </p>
      ) : null}

      {phase === "trouve" && entreprise ? (
        <div className={sombre ? "rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-2" : "rounded border border-emerald-200 bg-emerald-50/70 p-1.5"}>
          <p className={sombre ? "text-[11px] font-semibold text-white" : "text-[10px] font-semibold text-slate-900"}>
            {entreprise.denomination}
          </p>
          <p className={sombre ? "mt-1 text-[11px] text-slate-200" : "mt-0.5 text-[10px] text-slate-800"}>
            {entreprise.qualite || "Dirigeant"} : {entreprise.dirigeant || "Non diffusé"}
          </p>
          <p className={sombre ? "text-[11px] font-mono text-emerald-100" : "text-[10px] font-mono text-emerald-900"}>
            SIREN {entreprise.siren}
          </p>
          <a
            className={sombre ? "mt-1 inline-block text-[10px] text-sky-200 underline" : "no-print mt-0.5 inline-block text-[9px] text-sky-800 underline"}
            href={`https://annuaire-entreprises.data.gouv.fr/entreprise/${entreprise.siren}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Ouvrir la fiche registre
          </a>
          <p className={sombre ? "mt-1.5 text-[10px] leading-snug text-emerald-100" : "mt-1 text-[8px] leading-snug text-emerald-900"}>
            {BADGE_REGISTRE_ENTREPRISES}
          </p>
        </div>
      ) : null}

      {phase === "vide" ? (
        <p className={sombre ? "text-[11px] text-slate-300" : "text-[10px] text-slate-600"}>
          Aucune SCI, SARL ou société enregistrée à cette adresse.
        </p>
      ) : null}
      {phase === "erreur" ? (
        <p className={sombre ? "text-[11px] text-rose-200" : "text-[10px] text-rose-700"}>{message}</p>
      ) : null}

      {maison && exploitable ? (
        <div className={sombre ? "mt-2" : "mt-1"}>
          <a
            data-testid="verifier-annuaire-public"
            className={bouton}
            href={urlAnnuairePublic(adresseUtile)}
            target="_blank"
            rel="noopener noreferrer"
          >
            [ 🌐 Vérifier Annuaire Public ]
          </a>
          <div className={sombre ? "mt-2 grid gap-1.5" : "no-print mt-1.5 grid gap-1"}>
            <input
              className={champ}
              value={nomSaisi}
              onChange={(event) => setNomSaisi(event.target.value)}
              placeholder="Nom lu dans l'annuaire"
              aria-label="Nom lu dans l'annuaire"
            />
            <input
              className={champ}
              value={telephoneSaisi}
              onChange={(event) => setTelephoneSaisi(event.target.value)}
              placeholder="Numéro lu dans l'annuaire"
              aria-label="Numéro lu dans l'annuaire"
            />
            <button
              type="button"
              className={bouton}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                enregistrer();
              }}
            >
              [ Enregistrer dans la fiche ]
            </button>
          </div>
          {alerte ? (
            <p className={sombre ? "mt-1.5 text-[11px] text-amber-100" : "mt-1 text-[10px] text-amber-800"} role="alert">
              {alerte}
            </p>
          ) : null}
          {enregistre ? (
            <p className={sombre ? "mt-1.5 text-[11px] text-emerald-100" : "mt-1 text-[10px] text-emerald-900"}>
              Fiche : {enregistre.nom || NOM_PROPRIETAIRE_A_QUALIFIER} · {enregistre.telephone || "—"} · {enregistre.statut || STATUT_A_QUALIFIER}
            </p>
          ) : null}
        </div>
      ) : null}
      {toast ? (
        <div
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[6000] -translate-x-1/2 rounded-full border border-emerald-200 bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(5,46,22,0.35)]"
        >
          Fiche enregistrée avec succès dans le CRM
        </div>
      ) : null}
    </div>
  );
}
