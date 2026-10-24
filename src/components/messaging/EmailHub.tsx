import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, Download, Eye, Mail, Search, Send, Settings2, TriangleAlert } from "lucide-react";
import { pacPdfBase64, telechargerPacPdf } from "../hvac/exportPdf";
import ApercuDevisA4 from "./ApercuDevisA4";
import { DOSSIERS_MESSAGERIE, dossierPonctuel, trouverDossier } from "./annuaire";
import { envoyerEmailProfessionnel } from "./envoyerEmail";
import { etudePourDossier } from "./etudeA4";
import { archiverEmail, historiqueDuDossier, lireHistorique } from "./historique";
import { MARQUE_DEFAUT, enregistrerMarque, enteteFrom, lireMarque } from "./marque";
import type { MarqueEmail } from "./marque";
import { MODELES_EMAIL, composerModele } from "./modeles";
import { EVENEMENT_PREFILL, lirePrefillCourant } from "./navigation";
import { rendreEmailHtml, texteAvecSignature } from "./renduHtml";
import type { ContexteEmail, DossierMessagerie, EmailEnregistre, ModeleEmailId, PieceJointe, ResultatEnvoi } from "./types";

type Props = {
  dossierIdInitial?: string | null;
  clientNomInitial?: string;
};

const CHAMP =
  "mt-1.5 w-full rounded-xl border border-cyan-400/20 bg-[#070b16] px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/70";

const NOM_DEVIS = "Devis officiel de travaux — Contractant Général";
const NOM_RAPPORT = "Rapport d'ingénierie thermique & dimensionnement PAC";

function modeleJointLesDeux(id: ModeleEmailId | null | undefined): boolean {
  return id === "etude-pac" || id === "calpinage-solaire" || id === "relance-j4";
}

function jouerNotification(): void {
  const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;
  const contexte = new AudioCtx();
  const osc = contexte.createOscillator();
  const gain = contexte.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.05, contexte.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, contexte.currentTime + 0.28);
  osc.connect(gain);
  gain.connect(contexte.destination);
  osc.start();
  osc.stop(contexte.currentTime + 0.3);
  osc.onended = () => void contexte.close();
}

function formatQuand(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" });
}

function dossierDepuisPrefill(
  annuaire: DossierMessagerie[],
  dossierId?: string | null,
  clientNom?: string,
  destinataire?: string,
): { annuaire: DossierMessagerie[]; id: string } {
  const connu = trouverDossier(dossierId, annuaire);
  if (connu) return { annuaire, id: connu.id };
  const nom = (clientNom || "").trim().toLowerCase();
  if (nom) {
    const parNom = annuaire.find((dossier) => {
      const libelle = dossier.libelle.toLowerCase();
      const famille = dossier.nom.toLowerCase();
      return libelle.includes(nom) || nom.includes(famille);
    });
    if (parNom) return { annuaire, id: parNom.id };
  }
  if (dossierId) {
    const ajoute = dossierPonctuel(dossierId, clientNom || "Dossier en cours", destinataire || "");
    return { annuaire: [ajoute, ...annuaire.filter((dossier) => dossier.id !== ajoute.id)], id: ajoute.id };
  }
  return { annuaire, id: annuaire[0]?.id || "" };
}

function pieceDepuisUrl(nom: string, url: string): PieceJointe {
  return { id: crypto.randomUUID(), nom, url, taille: 0 };
}

export default function EmailHub({ dossierIdInitial = null, clientNomInitial = "" }: Props) {
  const depart = dossierDepuisPrefill(DOSSIERS_MESSAGERIE, dossierIdInitial, clientNomInitial);
  const [annuaire, setAnnuaire] = useState<DossierMessagerie[]>(depart.annuaire);
  const [dossierId, setDossierId] = useState(depart.id);
  const [recherche, setRecherche] = useState("");
  const [destinataire, setDestinataire] = useState("");
  const [sujet, setSujet] = useState("");
  const [corps, setCorps] = useState("");
  const [modeleActif, setModeleActif] = useState<ModeleEmailId | null>(null);
  const [contexte, setContexte] = useState<ContexteEmail | undefined>(undefined);
  const [pieces, setPieces] = useState<PieceJointe[]>([]);
  const [joindreDevis, setJoindreDevis] = useState(false);
  const [joindreRapport, setJoindreRapport] = useState(false);
  const [cibleApercu, setCibleApercu] = useState<"devis" | "rapport">("devis");
  const [toast, setToast] = useState<string | null>(null);
  const [historique, setHistorique] = useState<EmailEnregistre[]>(() => lireHistorique());
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<ResultatEnvoi | null>(null);
  const [marque, setMarque] = useState<MarqueEmail>(() => lireMarque());
  const [parametres, setParametres] = useState(false);
  const [apercu, setApercu] = useState<"desktop" | "mobile" | "rapport" | "devis">("desktop");
  const [feuillePleine, setFeuillePleine] = useState(false);
  const jetonApplique = useRef<string | null>(null);

  const dossier = trouverDossier(dossierId, annuaire) ?? annuaire[0];
  const lienAction = pieces.find((piece) => piece.url)?.url || contexte?.lien || dossier?.lienDocument || "";
  const feuille = useMemo(() => (dossier ? etudePourDossier(dossier) : null), [dossier]);
  const piecesVisibles = useMemo(() => {
    const liste: PieceJointe[] = [];
    if (joindreDevis) liste.push({ id: "devis-officiel-a4", nom: NOM_DEVIS, taille: 0 });
    if (joindreRapport) liste.push({ id: "rapport-ingenierie-pac", nom: NOM_RAPPORT, taille: 0 });
    return liste;
  }, [joindreDevis, joindreRapport]);

  useEffect(() => {
    if (!feuillePleine) return undefined;
    const fermer = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFeuillePleine(false);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", fermer);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", fermer);
    };
  }, [feuillePleine]);

  useEffect(() => {
    if (!feuillePleine) return undefined;
    const timer = window.setTimeout(() => {
      const articles = document.querySelectorAll('[aria-label="Devis A4 en plein écran"] article');
      const index = cibleApercu === "devis" ? 1 : 0;
      articles[index]?.scrollIntoView({ block: "start" });
    }, 40);
    return () => window.clearTimeout(timer);
  }, [feuillePleine, cibleApercu]);

  useEffect(() => {
    if (!resultat?.ok) return undefined;
    setToast(resultat.message);
    jouerNotification();
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [resultat]);

  const html = useMemo(
    () =>
      rendreEmailHtml({
        destinataire,
        sujet,
        corps: corps || "Votre message apparaîtra ici.",
        marque,
        lienAction,
        contexte,
        pieces: piecesVisibles,
      }),
    [destinataire, sujet, corps, marque, lienAction, contexte, piecesVisibles],
  );
  const htmlApercu = useMemo(
    () =>
      rendreEmailHtml({
        destinataire,
        sujet,
        corps: corps || "Votre message apparaîtra ici.",
        marque,
        lienAction,
        contexte,
        pieces: piecesVisibles,
        figerLiens: true,
      }),
    [destinataire, sujet, corps, marque, lienAction, contexte, piecesVisibles],
  );

  const appliquerDossier = (suivant: DossierMessagerie) => {
    setDossierId(suivant.id);
    setDestinataire(suivant.email);
    setSujet("");
    setCorps("");
    setModeleActif(null);
    setContexte(undefined);
    setPieces([]);
    setJoindreDevis(false);
    setJoindreRapport(false);
    setResultat(null);
  };

  const appliquerModele = (id: ModeleEmailId, cible = dossier, suivant?: ContexteEmail) => {
    if (!cible) return;
    const compose = composerModele(id, cible, suivant);
    setModeleActif(id);
    setSujet(compose.sujet);
    setCorps(compose.corps);
    setContexte(suivant);
    const joints = modeleJointLesDeux(id);
    setJoindreDevis(joints);
    setJoindreRapport(joints);
    setResultat(null);
  };

  const ouvrirApercuPiece = (cible: "devis" | "rapport") => {
    setCibleApercu(cible);
    setFeuillePleine(true);
  };

  useEffect(() => {
    const appliquerPrefill = () => {
      const prefill = lirePrefillCourant();
      if (!prefill || prefill.jeton === jetonApplique.current) return;
      jetonApplique.current = prefill.jeton;
      setAnnuaire((courant) => {
        const resolution = dossierDepuisPrefill(courant, prefill.dossierId, prefill.clientNom, prefill.destinataire);
        const cible = trouverDossier(resolution.id, resolution.annuaire);
        if (cible) {
          const contexteSuivant: ContexteEmail = {
            ...prefill.contexte,
            clientNom: prefill.clientNom || prefill.contexte?.clientNom,
            lien: prefill.contexte?.lien || cible.lienDocument,
          };
          setDossierId(cible.id);
          setDestinataire(prefill.destinataire || cible.email);
          setContexte(contexteSuivant);
          const jointes = (prefill.pieces || [])
            .filter((piece) => piece.nom && piece.url)
            .map((piece) => pieceDepuisUrl(piece.nom, piece.url));
          setPieces(jointes);
          const joints = modeleJointLesDeux(prefill.modeleId) || jointes.length > 0;
          setJoindreDevis(joints);
          setJoindreRapport(modeleJointLesDeux(prefill.modeleId));
          if (prefill.modeleId) {
            const compose = composerModele(prefill.modeleId, cible, contexteSuivant);
            setModeleActif(prefill.modeleId);
            setSujet(compose.sujet);
            setCorps(compose.corps);
            setResultat(null);
          }
        }
        return resolution.annuaire;
      });
    };
    appliquerPrefill();
    window.addEventListener(EVENEMENT_PREFILL, appliquerPrefill);
    return () => window.removeEventListener(EVENEMENT_PREFILL, appliquerPrefill);
  }, []);

  useEffect(() => {
    if (!dossier) return;
    setDestinataire((courant) => courant || dossier.email);
  }, [dossier]);

  const visibles = useMemo(() => {
    const terme = recherche.trim().toLowerCase();
    if (!terme) return annuaire;
    return annuaire.filter((item) =>
      [item.libelle, item.ville, item.projet, item.email].join(" ").toLowerCase().includes(terme),
    );
  }, [annuaire, recherche]);

  const fil = dossier ? historiqueDuDossier(dossier.id, historique) : [];

  const sauverMarque = (suivante: MarqueEmail) => {
    setMarque(suivante);
    enregistrerMarque(suivante);
  };

  const envoyer = async () => {
    if (!dossier || envoi) return;
    setEnvoi(true);
    setResultat(null);
    const texte = texteAvecSignature(corps, marque.signature);
    const joints: { filename: string; content: string }[] = [];
    if (feuille && joindreDevis) {
      joints.push({
        filename: "Devis-officiel-A4.pdf",
        content: pacPdfBase64(feuille.etude, dossier.libelle, feuille.etat.tint, "devis"),
      });
    }
    if (feuille && joindreRapport) {
      joints.push({
        filename: "Rapport-ingenierie-PAC.pdf",
        content: pacPdfBase64(feuille.etude, dossier.libelle, feuille.etat.tint, "rapport"),
      });
    }
    for (const piece of pieces) {
      if (joints.length >= 2 || !piece.contenuBase64) continue;
      joints.push({ filename: piece.nom, content: piece.contenuBase64 });
    }
    const reponse = await envoyerEmailProfessionnel({
      to: destinataire,
      subject: sujet,
      text: texte,
      html,
      from: enteteFrom(marque),
      attachments: joints,
    });
    const enregistre: EmailEnregistre = {
      id: crypto.randomUUID(),
      dossierId: dossier.id,
      destinataire: destinataire.trim(),
      sujet: sujet.trim(),
      corps: texte,
      modeleId: modeleActif,
      envoyeLe: new Date().toISOString(),
      statut: reponse.ok ? (reponse.canal === "simulation" ? "simule" : "envoye") : "echec",
      canal: reponse.canal,
      resendId: reponse.resendId,
      detail: reponse.detail || reponse.message,
    };
    if (reponse.ok || reponse.canal !== "simulation") {
      const suivant = await archiverEmail(enregistre);
      setHistorique(suivant);
    }
    setResultat(reponse);
    setEnvoi(false);
  };

  return (
    <section
      data-testid="messagerie-crm"
      className="overflow-hidden rounded-2xl border border-cyan-400/20 bg-[#0a0f1d] text-slate-100 shadow-[0_0_40px_rgba(34,211,238,0.06)]"
    >
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-cyan-400/15 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">ENERGIA CONSEIL IA® · Resend</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-white">Messagerie & Emails Clients</h2>
          <p className="mt-1 text-sm text-slate-400">
            Expéditeur : <span className="text-slate-200">{enteteFrom(marque)}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => setParametres((ouvert) => !ouvert)}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-50"
        >
          <Settings2 className="h-4 w-4" aria-hidden />
          Paramètres de marque
        </button>
      </header>

      {parametres ? (
        <form
          className="grid gap-3 border-b border-cyan-400/15 bg-[#070b16] px-5 py-4 md:grid-cols-[160px_minmax(0,1fr)]"
          onSubmit={(event) => {
            event.preventDefault();
            sauverMarque(marque);
            setParametres(false);
          }}
        >
          <div>
            <img src={marque.logoUrl} alt="Logo ENERGIA CONSEIL IA" className="h-16 w-auto rounded-lg bg-white p-2" />
            <label className="mt-2 block text-[11px] text-slate-400">
              Remplacer le logo
              <input
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="mt-1 block w-full text-xs"
                onChange={(event) => {
                  const fichier = event.target.files?.[0];
                  if (!fichier || fichier.size > 400_000) return;
                  const lecteur = new FileReader();
                  lecteur.onload = () => {
                    if (typeof lecteur.result === "string") sauverMarque({ ...marque, logoUrl: lecteur.result });
                  };
                  lecteur.readAsDataURL(fichier);
                }}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Nom d'expéditeur
              <input className={CHAMP} value={marque.nomExpediteur} onChange={(event) => setMarque({ ...marque, nomExpediteur: event.target.value })} />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Adresse d'expéditeur
              <input className={CHAMP} value={marque.emailExpediteur} onChange={(event) => setMarque({ ...marque, emailExpediteur: event.target.value })} />
            </label>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:col-span-2">
              Signature
              <textarea rows={8} className={CHAMP} value={marque.signature} onChange={(event) => setMarque({ ...marque, signature: event.target.value })} />
            </label>
            <div className="flex flex-wrap gap-2 sm:col-span-2">
              <button type="submit" className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-semibold text-slate-950">Enregistrer</button>
              <button type="button" className="rounded-xl border border-slate-600 px-3 py-2 text-sm" onClick={() => sauverMarque(MARQUE_DEFAUT)}>
                Signature officielle
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="grid xl:grid-cols-[280px_minmax(0,1fr)_minmax(300px,380px)]">
        <aside className="border-b border-cyan-400/15 xl:border-b-0 xl:border-r">
          <div className="p-4">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Dossier client</span>
              <span className="relative mt-1.5 block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden />
                <input className={`${CHAMP} pl-9`} value={recherche} placeholder="Masson, Brunel, Gilbertas…" onChange={(event) => setRecherche(event.target.value)} />
              </span>
            </label>
            <ul className="mt-3 max-h-56 space-y-1 overflow-y-auto pr-1" aria-label="Dossiers">
              {visibles.map((item) => {
                const actif = item.id === dossier?.id;
                const compte = historiqueDuDossier(item.id, historique).length;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => appliquerDossier(item)}
                      className={`w-full rounded-xl border px-3 py-2 text-left ${actif ? "border-cyan-300/50 bg-cyan-400/10" : "border-transparent hover:border-slate-700 hover:bg-white/5"}`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="block text-sm font-semibold text-white">{item.libelle}</span>
                        <span className="font-mono text-[10px] text-slate-500">{compte}</span>
                      </span>
                      <span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.email || "Email à renseigner"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="border-t border-cyan-400/15 p-4">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
              <Clock3 className="h-3.5 w-3.5" aria-hidden />
              Historique
            </p>
            {fil.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">Aucun email archivé pour ce dossier.</p>
            ) : (
              <ol className="mt-2 max-h-48 space-y-2 overflow-y-auto">
                {fil.map((message) => (
                  <li key={message.id} className="rounded-xl border border-slate-800 bg-[#070b16] px-3 py-2">
                    <p className="text-xs font-semibold text-white">{message.sujet}</p>
                    <p className="mt-1 font-mono text-[10px] text-cyan-200/80">{formatQuand(message.envoyeLe)} · {message.destinataire}</p>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Modèles</p>
            <ul className="mt-2 space-y-1.5">
              {MODELES_EMAIL.map((modele) => (
                <li key={modele.id}>
                  <button
                    type="button"
                    onClick={() => appliquerModele(modele.id, dossier, { ...contexte, lien: dossier?.lienDocument, ville: dossier?.ville, projet: dossier?.projet })}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-xs ${modeleActif === modele.id ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-50" : "border-slate-800 text-slate-200"}`}
                  >
                    {modele.libelle}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <form
          className="border-b border-cyan-400/15 p-4 xl:border-b-0 xl:border-r"
          onSubmit={(event) => {
            event.preventDefault();
            void envoyer();
          }}
        >
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Mail className="h-3.5 w-3.5" aria-hidden />
            Éditeur
          </p>
          <label className="mt-3 block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Destinataire</span>
            <input type="email" required className={CHAMP} value={destinataire} placeholder="client@domaine.fr" onChange={(event) => setDestinataire(event.target.value)} />
          </label>
          <label className="mt-3 block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Objet</span>
            <input className={CHAMP} required value={sujet} onChange={(event) => setSujet(event.target.value)} />
          </label>
          <label className="mt-3 block">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Message</span>
            <textarea required rows={12} className={`${CHAMP} resize-y font-[Georgia,_serif] leading-relaxed`} value={corps} onChange={(event) => setCorps(event.target.value)} />
          </label>
          <p className="mt-2 text-[11px] text-slate-500">La signature, le logo et le bouton d'action sont ajoutés dans l'aperçu et dans l'email HTML.</p>
          <div className="mt-3 space-y-2">
            <button
              type="button"
              role="checkbox"
              aria-checked={joindreDevis}
              data-testid="joindre-devis"
              onClick={() => setJoindreDevis((coche) => !coche)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${joindreDevis ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-50" : "border-slate-700 text-slate-200"}`}
            >
              <span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${joindreDevis ? "border-emerald-300 bg-emerald-300 text-[#0a0f1d]" : "border-slate-500"}`}>{joindreDevis ? "✓" : ""}</span>
              Joindre le Devis officiel A4 (PDF)
            </button>
            <button
              type="button"
              role="checkbox"
              aria-checked={joindreRapport}
              data-testid="joindre-rapport"
              onClick={() => setJoindreRapport((coche) => !coche)}
              className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm ${joindreRapport ? "border-emerald-300/50 bg-emerald-400/10 text-emerald-50" : "border-slate-700 text-slate-200"}`}
            >
              <span className={`grid h-4 w-4 place-items-center rounded border text-[10px] ${joindreRapport ? "border-emerald-300 bg-emerald-300 text-[#0a0f1d]" : "border-slate-500"}`}>{joindreRapport ? "✓" : ""}</span>
              Joindre le Rapport d'ingénierie thermique / PAC (PDF)
            </button>
            <ul className="space-y-1">
              {joindreDevis ? (
                <li className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#070b16] px-2 py-1.5 text-xs">
                  <span className="truncate">{NOM_DEVIS}</span>
                  <button type="button" data-testid="apercu-piece-devis" onClick={() => ouvrirApercuPiece("devis")} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-100">
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Voir l'aperçu
                  </button>
                </li>
              ) : null}
              {joindreRapport ? (
                <li className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-[#070b16] px-2 py-1.5 text-xs">
                  <span className="truncate">{NOM_RAPPORT}</span>
                  <button type="button" data-testid="apercu-piece-rapport" onClick={() => ouvrirApercuPiece("rapport")} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-100">
                    <Eye className="h-3.5 w-3.5" aria-hidden />
                    Voir l'aperçu
                  </button>
                </li>
              ) : null}
            </ul>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={envoi} data-testid="messagerie-envoyer" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-[#0a0f1d] disabled:opacity-60">
              <Send className="h-4 w-4" aria-hidden />
              {envoi ? "Envoi…" : "Envoyer"}
            </button>
            {resultat?.ok ? (
              <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/40 bg-emerald-400/15 px-3 py-1.5 text-sm font-semibold text-emerald-100">
                <CheckCircle2 className="h-4 w-4" aria-hidden />
                {resultat.message}
              </p>
            ) : null}
            {resultat && !resultat.ok ? (
              <p className="inline-flex items-center gap-2 text-sm text-rose-200">
                <TriangleAlert className="h-4 w-4" aria-hidden />
                {resultat.message}
              </p>
            ) : null}
          </div>
          {resultat?.detail ? <p className="mt-2 text-xs leading-relaxed text-slate-400">{resultat.detail}</p> : null}
        </form>

        <aside className="bg-[#070b16] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Aperçu</p>
            <div className="inline-flex flex-wrap rounded-full border border-slate-700 p-0.5">
              <button type="button" aria-pressed={apercu === "mobile"} onClick={() => setApercu("mobile")} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${apercu === "mobile" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
                📱 Mobile
              </button>
              <button type="button" aria-pressed={apercu === "desktop"} onClick={() => setApercu("desktop")} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${apercu === "desktop" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
                💻 Desktop
              </button>
              <button type="button" aria-pressed={apercu === "rapport"} onClick={() => setApercu("rapport")} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${apercu === "rapport" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
                📊 Rapport Technique PAC
              </button>
              <button type="button" data-testid="apercu-devis-a4-bouton" aria-pressed={apercu === "devis"} onClick={() => setApercu("devis")} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${apercu === "devis" ? "bg-cyan-300 text-slate-950" : "text-slate-300"}`}>
                📄 Devis Chiffré A4
              </button>
            </div>
          </div>
          {apercu === "rapport" || apercu === "devis" ? (
            feuille && dossier ? (
              <div className="mt-3">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => telechargerPacPdf(feuille.etude, dossier.libelle, feuille.etat.tint, "rapport")} className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-100">PDF Rapport</button>
                  <button type="button" onClick={() => telechargerPacPdf(feuille.etude, dossier.libelle, feuille.etat.tint, "devis")} className="rounded-lg border border-slate-600 px-2 py-1 text-[11px] font-semibold text-slate-100">PDF Devis</button>
                  <button type="button" onClick={() => telechargerPacPdf(feuille.etude, dossier.libelle, feuille.etat.tint, "complet")} className="rounded-lg border border-cyan-300/40 px-2 py-1 text-[11px] font-semibold text-cyan-100">PDF les deux</button>
                </div>
                <div className="max-h-[640px] overflow-auto rounded-2xl border border-slate-700 bg-slate-900/70 p-3">
                  <div className="mx-auto overflow-hidden" style={{ width: 380, height: apercu === "rapport" ? 530 : 1100 }}>
                    <div style={{ width: 760, transform: "scale(0.5)", transformOrigin: "top left" }}>
                      <ApercuDevisA4
                        pages={apercu === "rapport" ? "rapport" : "complet"}
                        etude={feuille.etude}
                        client={dossier.libelle}
                        ville={dossier.ville}
                        projet={dossier.projet}
                        logoUrl={marque.logoUrl}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null
          ) : (
            <div className={`mx-auto mt-3 overflow-hidden rounded-2xl border border-slate-700 bg-[#e7eef2] ${apercu === "desktop" ? "w-full" : "w-[280px]"}`}>
              <iframe
                key={apercu}
                title="Aperçu de l'email"
                data-testid="apercu-email-html"
                sandbox="allow-same-origin"
                srcDoc={htmlApercu}
                className="h-[640px] w-full bg-[#e7eef2]"
              />
            </div>
          )}
        </aside>
      </div>
      {feuillePleine && feuille && dossier ? (
        <div className="fixed inset-0 z-[80] flex flex-col bg-slate-950" role="dialog" aria-modal="true" aria-label="Devis A4 en plein écran">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">{cibleApercu === "devis" ? "Devis officiel A4" : "Rapport d'ingénierie"} — {dossier.libelle}</p>
            <div className="flex gap-2">
              <button type="button" onClick={() => telechargerPacPdf(feuille.etude, dossier.libelle, feuille.etat.tint, cibleApercu === "devis" ? "complet" : "rapport")} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-3 py-1.5 text-sm font-semibold text-[#0a0f1d]">
                <Download className="h-4 w-4" aria-hidden />
                Télécharger le PDF
              </button>
              <button type="button" onClick={() => setFeuillePleine(false)} className="rounded-xl border border-slate-500 px-3 py-1.5 text-sm text-white">
                Fermer
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto bg-slate-800 p-6">
            <div className="mx-auto w-[760px]" style={{ zoom: 1 }}>
              <ApercuDevisA4 pages={cibleApercu === "devis" ? "complet" : "rapport"} etude={feuille.etude} client={dossier.libelle} ville={dossier.ville} projet={dossier.projet} logoUrl={marque.logoUrl} />
            </div>
          </div>
        </div>
      ) : null}
      {toast ? (
        <p role="status" data-testid="toast-envoi" className="fixed bottom-6 right-6 z-[70] inline-flex max-w-sm items-center gap-2 rounded-2xl border border-emerald-300/40 bg-emerald-400 px-4 py-3 text-sm font-semibold text-[#052e16] shadow-xl">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          {toast}
        </p>
      ) : null}
    </section>
  );
}
