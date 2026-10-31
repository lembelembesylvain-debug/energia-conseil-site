/**
 * Dispatch chantier — découpage multi-corps d'état et liasse de bons de commande.
 * Les feuilles A4 réutilisent le bon de commande officiel (charte blanche, autoliquidation, Sûreté-6).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ClipboardList, Printer, Save } from "lucide-react";
import FactureAcompteModal, { euro, round2, type MarcheFacturable, type TauxTvaFacture } from "./FactureAcompteModal";
import BonDeCommandeArtisanModal, {
  AnnexePhotos,
  FeuilleCommande,
  LOT_MENUISERIE_COUTY,
  MONTANT_HT_COUTY,
  PRINT_CSS_BDC,
  commandeDepuisLead,
  saisieDepuisProps,
  type LeadCommandable,
  type PhotoChantier,
} from "./BonDeCommandeArtisanModal";

const STORAGE = "energia-dispatch-chantiers-v1";
export const EVENT_MARCHE_ACTIF = "energia-marche-actif";
const MAX_PHOTOS_LOT = 4;

export type LotId = "gros-oeuvre" | "clos-couvert" | "isolation" | "fluides" | "finitions";

type LotDef = {
  id: LotId;
  ordre: number;
  titre: string;
  motif: RegExp;
};

const ORDRE_LOTS: LotDef[] = [
  { id: "gros-oeuvre", ordre: 1, titre: "Gros œuvre / Maçonnerie / IPN", motif: /ma[cç]on|dalle|ipn|gros oeuvre|gros œuvre|d[ée]mol|fondation|b[ée]ton/i },
  { id: "clos-couvert", ordre: 2, titre: "Charpente / Couverture / Menuiseries extérieures", motif: /charpente|couverture|toiture|fen[eê]tre|menuiserie ext|volet|huisserie/i },
  { id: "isolation", ordre: 3, titre: "Isolation / Plâtrerie / Plafonds", motif: /isol|platr|plâtr|plafond|cloison|comble|iti|ite|doublage/i },
  { id: "fluides", ordre: 4, titre: "Chauffage / PAC / Plomberie / Électricité", motif: /chauff|pac\b|plomb|élec|electr|vmc|ballon|batterie|photovolta|solaire|zendure/i },
  { id: "finitions", ordre: 5, titre: "Agencement / Finitions / Peinture / PMR", motif: /peinture|cuisine|agencement|pmr|main courante|escalier|finition|carrelage|sol\b|autonomie/i },
];

export type PhotoDispatch = PhotoChantier & { id: string; lotId: LotId | "" };

export type LotDispatch = {
  id: LotId;
  ordre: number;
  titre: string;
  actif: boolean;
  artisan: string;
  montantHt: number;
  designation: string;
};

export type DossierDispatch = {
  leadId: string;
  clientNom: string;
  adresse: string;
  telephone: string;
  ville: string;
  dateDemarrage: string;
  metre: string;
  demande: string;
  marcheRef: string;
  bdcBase: string;
  venteTtc: number;
  tauxTva: TauxTvaFacture;
  commissionPct: number;
  lots: LotDispatch[];
  photos: PhotoDispatch[];
  statut: "brouillon" | "marche-actif";
};

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  lead?: (LeadCommandable & { id?: string; budget?: number | string | null; caTtc?: number | string | null }) | null;
};

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f9c74f]";

function dateDuJourIso(): string {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function lotsDepuisTexte(texte: string): Set<LotId> {
  const actifs = new Set<LotId>();
  for (const lot of ORDRE_LOTS) {
    if (lot.motif.test(texte)) actifs.add(lot.id);
  }
  return actifs;
}

function numeroLot(base: string, ordre: number): string {
  const suffixe = `-${String(ordre).padStart(2, "0")}`;
  if (/-\d{2}$/.test(base)) return base.replace(/-\d{2}$/, suffixe);
  return `${base}${suffixe}`;
}

export function dossierDepuisLead(lead?: Props["lead"]): DossierDispatch {
  const commande = commandeDepuisLead(lead || undefined);
  const demande = [lead?.typeTravaux, lead?.typeProjet, lead?.notes, commande.lotDescription].filter(Boolean).join(" — ");
  const indice = `${commande.clientNom} ${commande.clientVille} ${demande}`;
  const couty = /couty|mably|main courante/i.test(indice);
  const detectes = lotsDepuisTexte(demande);
  if (couty) {
    detectes.clear();
    detectes.add("finitions");
  } else if (detectes.size === 0 && /électricien/i.test(commande.artisanCorpsEtat || "")) detectes.add("fluides");
  else if (detectes.size === 0 && /ma[cç]on/i.test(commande.artisanCorpsEtat || "")) detectes.add("gros-oeuvre");
  else if (detectes.size === 0 && /plaquiste|isol/i.test(commande.artisanCorpsEtat || "")) detectes.add("isolation");
  else if (detectes.size === 0 && /menuisier/i.test(commande.artisanCorpsEtat || "")) detectes.add("finitions");

  const budget = Number(lead?.budget ?? lead?.caTtc);
  const venteTtc = couty ? 1485 : Number.isFinite(budget) && budget > 0 ? round2(budget) : 0;
  const lots: LotDispatch[] = ORDRE_LOTS.map((def) => {
    const actif = detectes.has(def.id);
    const finitionCouty = couty && def.id === "finitions";
    return {
      id: def.id,
      ordre: def.ordre,
      titre: def.titre,
      actif,
      artisan: finitionCouty ? "Entreprise de pose partenaire" : "",
      montantHt: finitionCouty ? MONTANT_HT_COUTY : 0,
      designation: finitionCouty ? LOT_MENUISERIE_COUTY : actif ? `${def.titre} — ${commande.lotDescription}` : "",
    };
  });
  return {
    leadId: lead?.id || commande.dossierId || "",
    clientNom: commande.clientNom,
    adresse: commande.clientAdresse,
    telephone: commande.clientTel,
    ville: commande.clientVille,
    dateDemarrage: dateDuJourIso(),
    metre: "",
    demande,
    marcheRef: commande.marcheRef,
    bdcBase: commande.bdcRef,
    venteTtc,
    tauxTva: 10,
    commissionPct: 10,
    lots,
    photos: (commande.photos || []).map((photo, index) => ({
      ...photo,
      id: `photo-init-${index}`,
      lotId: (couty ? "finitions" : "") as LotId | "",
      phase: "avant" as const,
    })),
    statut: "brouillon",
  };
}

function lireTous(): Record<string, DossierDispatch> {
  try {
    const brut = localStorage.getItem(STORAGE);
    if (!brut) return {};
    const data = JSON.parse(brut);
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

export function lireMarchesActifs(): Record<string, { client: string; enregistreLe: string }> {
  const tous = lireTous();
  const actifs: Record<string, { client: string; enregistreLe: string }> = {};
  for (const [id, dossier] of Object.entries(tous)) {
    if (dossier?.statut === "marche-actif" && id) {
      actifs[id] = { client: dossier.clientNom || "", enregistreLe: dossier.dateDemarrage || "" };
    }
  }
  return actifs;
}

function persister(dossier: DossierDispatch): "ok" | "sans-photos" {
  const tous = lireTous();
  const cle = dossier.leadId || dossier.bdcBase || dossier.clientNom || "brouillon";
  try {
    localStorage.setItem(STORAGE, JSON.stringify({ ...tous, [cle]: dossier }));
    return "ok";
  } catch {
    const leger = { ...dossier, photos: dossier.photos.map((photo) => ({ ...photo, src: "" })) };
    localStorage.setItem(STORAGE, JSON.stringify({ ...tous, [cle]: leger }));
    return "sans-photos";
  }
}

function compresserImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("image"));
      image.onload = () => {
        const max = 900;
        const ratio = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * ratio));
        canvas.height = Math.max(1, Math.round(image.height * ratio));
        const contexte = canvas.getContext("2d");
        if (!contexte) {
          resolve(String(reader.result || ""));
          return;
        }
        contexte.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.72));
      };
      image.src = String(reader.result || "");
    };
    reader.readAsDataURL(file);
  });
}

function venteHtDe(dossier: DossierDispatch): number {
  const taux = dossier.tauxTva / 100;
  return taux >= 0 ? round2(dossier.venteTtc / (1 + taux)) : round2(dossier.venteTtc);
}

function synthese(dossier: DossierDispatch) {
  const venteHt = venteHtDe(dossier);
  const debours = round2(dossier.lots.filter((lot) => lot.actif).reduce((somme, lot) => somme + (Number(lot.montantHt) || 0), 0));
  const commission = round2(venteHt * (Number(dossier.commissionPct) || 0) / 100);
  const marge = round2(venteHt - debours - commission);
  const margePct = venteHt > 0 ? round2((marge / venteHt) * 100) : 0;
  return { venteHt, debours, commission, marge, margePct };
}

function lotsPrets(dossier: DossierDispatch): LotDispatch[] {
  return dossier.lots.filter((lot) => lot.actif && lot.artisan.trim() && lot.montantHt > 0 && lot.designation.trim());
}

function phaseDe(photo: PhotoDispatch): "avant" | "apres" {
  return photo.phase === "apres" ? "apres" : "avant";
}

function photosLot(dossier: DossierDispatch, lotId: LotId): PhotoChantier[] {
  const duLot = dossier.photos.filter((photo) => photo.lotId === lotId && photo.src);
  const avant = duLot.filter((photo) => phaseDe(photo) === "avant").slice(0, MAX_PHOTOS_LOT);
  const apres = duLot.filter((photo) => phaseDe(photo) === "apres").slice(0, 2);
  return [...avant, ...apres].map((photo) => ({
    src: photo.src,
    legende: photo.legende,
    phase: phaseDe(photo),
  }));
}

function comptePhase(dossier: DossierDispatch, lotId: LotId, phase: "avant" | "apres"): number {
  return dossier.photos.filter((photo) => photo.lotId === lotId && phaseDe(photo) === phase && photo.src).length;
}

export default function ChantierOrchestrateurModal({ ouvert, onFermer, lead = null }: Props) {
  const [etape, setEtape] = useState(1);
  const [dossier, setDossier] = useState<DossierDispatch>(() => dossierDepuisLead(lead));
  const [message, setMessage] = useState("");
  const [facture, setFacture] = useState<MarcheFacturable | null>(null);
  const [bdcOuvert, setBdcOuvert] = useState(false);
  const [lotActif, setLotActif] = useState<LotId | null>(null);
  const [liasse, setLiasse] = useState(false);
  const [presentation, setPresentation] = useState(false);
  const inputPhotos = useRef<HTMLInputElement>(null);
  const cleLead = lead?.id || "";

  useEffect(() => {
    if (!ouvert) return;
    const sauve = cleLead ? lireTous()[cleLead] : null;
    setDossier(sauve && sauve.clientNom ? sauve : dossierDepuisLead(lead));
    setEtape(1);
    setMessage("");
    setLotActif(null);
    setLiasse(false);
    setPresentation(false);
  }, [ouvert, cleLead]);

  useEffect(() => {
    if (!ouvert || facture || bdcOuvert || liasse) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (presentation) {
        setPresentation(false);
        return;
      }
      onFermer();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [ouvert, onFermer, facture, bdcOuvert, liasse, presentation]);

  const chiffres = useMemo(() => synthese(dossier), [dossier]);
  const prets = lotsPrets(dossier);
  const lotSelectionne = prets.find((lot) => lot.id === lotActif) || prets[0] || null;
  const fluides = dossier.lots.find((lot) => lot.id === "fluides")?.actif;
  const isolation = dossier.lots.find((lot) => lot.id === "isolation")?.actif;
  const enveloppe = dossier.lots.some((lot) => (lot.id === "gros-oeuvre" || lot.id === "clos-couvert") && lot.actif);
  const alerteOrdre = Boolean(fluides && !isolation && enveloppe);

  function patch(partiel: Partial<DossierDispatch>) {
    setDossier((prev) => ({ ...prev, ...partiel }));
  }

  function patchLot(id: LotId, partiel: Partial<LotDispatch>) {
    setDossier((prev) => ({
      ...prev,
      lots: prev.lots.map((lot) => (lot.id === id ? { ...lot, ...partiel } : lot)),
    }));
  }

  async function ajouterPhotos(liste: FileList | File[] | null, lotId: LotId | "" = "", phase: "avant" | "apres" = "avant") {
    if (!liste) return;
    const images = [...liste].filter((fichier) => fichier.type.startsWith("image/"));
    const plafond = phase === "apres" ? 2 : lotId ? MAX_PHOTOS_LOT : 12;
    const deja = lotId ? comptePhase(dossier, lotId, phase) : 0;
    const places = Math.max(0, plafond - deja);
    const ajouts: PhotoDispatch[] = [];
    for (const fichier of images.slice(0, places || (lotId ? 0 : 12))) {
      try {
        const src = await compresserImage(fichier);
        if (src) {
          ajouts.push({
            id: `photo-${Date.now()}-${ajouts.length}`,
            src,
            legende: "",
            lotId,
            phase,
          });
        }
      } catch {
        /* fichier ignoré */
      }
    }
    if (!ajouts.length && lotId && places === 0) {
      setMessage(phase === "apres" ? "2 visuels cibles maximum par lot sur l'annexe." : "4 photos avant maximum par lot.");
      return;
    }
    if (ajouts.length) setDossier((prev) => ({ ...prev, photos: [...prev.photos, ...ajouts] }));
  }

  function ouvrirFacture() {
    const designation = dossier.lots
      .filter((lot) => lot.actif && lot.designation.trim())
      .map((lot) => `${lot.ordre}. ${lot.designation}`)
      .join(" | ");
    setFacture({
      id: dossier.leadId || dossier.bdcBase,
      nom: dossier.clientNom,
      ref: dossier.marcheRef,
      montantTtc: dossier.venteTtc,
      adresse: [dossier.adresse, dossier.ville].filter(Boolean).join(", "),
      designation: designation || dossier.demande,
      tauxTva: dossier.tauxTva,
    });
  }

  function ouvrirBdc(lot: LotDispatch) {
    setLotActif(lot.id);
    setBdcOuvert(true);
  }

  function imprimerLiasse() {
    if (!prets.length) return;
    setLotActif(prets[0].id);
    setLiasse(true);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  }

  function enregistrerMarche() {
    const resultat = persister({ ...dossier, statut: "marche-actif" });
    setDossier((prev) => ({ ...prev, statut: "marche-actif" }));
    setMessage(
      resultat === "ok"
        ? "Marché actif enregistré dans le CRM."
        : "Marché actif enregistré. Les photos n'ont pas pu être conservées (mémoire du navigateur pleine).",
    );
    window.dispatchEvent(new CustomEvent(EVENT_MARCHE_ACTIF));
  }

  const saisieLot = (lot: LotDispatch) =>
    saisieDepuisProps({
      ouvert: true,
      onFermer: () => undefined,
      clientNom: dossier.clientNom,
      clientAdresse: dossier.adresse,
      clientTel: dossier.telephone,
      clientVille: dossier.ville,
      marcheRef: dossier.marcheRef,
      bdcRef: numeroLot(dossier.bdcBase, lot.ordre),
      lotDescription: lot.designation,
      artisanNom: lot.artisan,
      artisanCorpsEtat: lot.titre,
      montantHT: lot.montantHt,
    });

  if (!ouvert || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[94] flex flex-col bg-[#102a43]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dispatch-chantier-titre"
      data-testid="modal-dispatch-chantier"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9c74f]">Contractant général</p>
          <h2 id="dispatch-chantier-titre" className="mt-1 text-xl font-semibold text-white">
            Dispatch chantier &amp; bons de commande
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {dossier.clientNom || "Nouveau chantier"} — ordre d&apos;intervention BTP, marge nette en direct.
          </p>
        </div>
        <button type="button" onClick={onFermer} className="rounded-lg border border-white/15 px-3 py-1.5 text-sm text-slate-200 hover:bg-white/10">
          Fermer
        </button>
      </header>

      <nav className="flex flex-wrap gap-2 border-b border-white/10 px-5 py-3" aria-label="Étapes du dispatch">
        {[
          [1, "Fiche & photos"],
          [2, "Vente client"],
          [3, "Lots artisans"],
          [4, "Bons de commande"],
        ].map(([numero, libelle]) => (
          <button
            key={numero}
            type="button"
            onClick={() => setEtape(Number(numero))}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              etape === numero ? "bg-[#1a5c2e] text-[#f9c74f]" : "border border-white/15 text-slate-300 hover:bg-white/10"
            }`}
          >
            {numero}. {libelle}
          </button>
        ))}
      </nav>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        {etape === 1 ? (
          <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-2">
            <label className="block text-xs text-slate-300">
              Client
              <input className={inputClass} value={dossier.clientNom} onChange={(event) => patch({ clientNom: event.target.value })} />
            </label>
            <label className="block text-xs text-slate-300">
              Téléphone
              <input className={inputClass} value={dossier.telephone} onChange={(event) => patch({ telephone: event.target.value })} />
            </label>
            <label className="block text-xs text-slate-300 lg:col-span-2">
              Adresse exacte du chantier
              <textarea className={`${inputClass} min-h-16`} value={dossier.adresse} onChange={(event) => patch({ adresse: event.target.value })} />
            </label>
            <label className="block text-xs text-slate-300">
              Ville
              <input className={inputClass} value={dossier.ville} onChange={(event) => patch({ ville: event.target.value })} />
            </label>
            <label className="block text-xs text-slate-300">
              Date de démarrage souhaitée
              <input type="date" className={inputClass} value={dossier.dateDemarrage} onChange={(event) => patch({ dateDemarrage: event.target.value })} />
            </label>
            <label className="block text-xs text-slate-300 lg:col-span-2">
              Métré et repérage
              <textarea
                className={`${inputClass} min-h-20`}
                value={dossier.metre}
                placeholder="Surfaces, linéaires, accès, contraintes relevées sur place"
                onChange={(event) => patch({ metre: event.target.value })}
              />
            </label>
            <div className="lg:col-span-2">
              <button
                type="button"
                data-testid="dispatch-ajouter-photos"
                onClick={() => inputPhotos.current?.click()}
                className="rounded-xl border border-dashed border-[#f9c74f]/70 px-4 py-3 text-sm font-semibold text-[#f9c74f] hover:bg-white/5"
              >
                📷 Ajouter les photos de repérage
              </button>
              <div
                className="mt-3 rounded-xl border border-dashed border-white/20 px-3 py-4 text-center text-xs text-slate-300"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void ajouterPhotos(event.dataTransfer.files);
                }}
              >
                Glisser-déposer les photos, puis taguer chaque image par corps d&apos;état. {dossier.photos.length} photo(s).
                <input
                  ref={inputPhotos}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    void ajouterPhotos(event.target.files);
                    event.target.value = "";
                  }}
                />
              </div>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {dossier.photos.map((photo) => (
                  <li key={photo.id} className="rounded-xl border border-white/10 p-2">
                    {photo.src ? <img src={photo.src} alt="" className="h-28 w-full rounded object-cover" /> : null}
                    <label className="mt-2 block text-[11px] text-slate-300">
                      Type de visuel
                      <select
                        className={inputClass}
                        value={phaseDe(photo)}
                        onChange={(event) => {
                          const phase = event.target.value === "apres" ? "apres" : "avant";
                          if (photo.lotId && phase === "apres" && comptePhase(dossier, photo.lotId, "apres") >= 2 && phaseDe(photo) !== "apres") {
                            setMessage("2 visuels cibles maximum par lot.");
                            return;
                          }
                          setDossier((prev) => ({
                            ...prev,
                            photos: prev.photos.map((item) => (item.id === photo.id ? { ...item, phase } : item)),
                          }));
                        }}
                      >
                        <option value="avant">Avant travaux — état initial</option>
                        <option value="apres">Projection — visuel cible</option>
                      </select>
                    </label>
                    <label className="mt-2 block text-[11px] text-slate-300">
                      Corps d&apos;état
                      <select
                        className={inputClass}
                        value={photo.lotId}
                        onChange={(event) => {
                          const lotId = event.target.value as LotId | "";
                          const deja = lotId ? dossier.photos.filter((item) => item.lotId === lotId).length : 0;
                          if (lotId && deja >= MAX_PHOTOS_LOT && photo.lotId !== lotId) {
                            setMessage(`4 photos maximum pour ce lot sur l'annexe A4.`);
                            return;
                          }
                          setDossier((prev) => ({
                            ...prev,
                            photos: prev.photos.map((item) => (item.id === photo.id ? { ...item, lotId } : item)),
                          }));
                        }}
                      >
                        <option value="">Non assignée</option>
                        {ORDRE_LOTS.map((lot) => (
                          <option key={lot.id} value={lot.id}>
                            {lot.ordre}. {lot.titre}
                          </option>
                        ))}
                      </select>
                    </label>
                    <input
                      className={inputClass}
                      value={photo.legende}
                      placeholder="Légende de repérage"
                      onChange={(event) =>
                        setDossier((prev) => ({
                          ...prev,
                          photos: prev.photos.map((item) => (item.id === photo.id ? { ...item, legende: event.target.value } : item)),
                        }))
                      }
                    />
                    <button
                      type="button"
                      className="mt-2 text-xs text-rose-200"
                      onClick={() => setDossier((prev) => ({ ...prev, photos: prev.photos.filter((item) => item.id !== photo.id) }))}
                    >
                      Retirer
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {etape === 2 ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <label className="block text-xs text-slate-300">
              Montant vendu au client — TTC
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={dossier.venteTtc || ""}
                onChange={(event) => patch({ venteTtc: event.target.value === "" ? 0 : Number(event.target.value) })}
              />
            </label>
            <p className="text-sm text-slate-200">
              Montant HT correspondant : <strong className="text-white">{euro(chiffres.venteHt)}</strong>
            </p>
            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Régime de TVA</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {(
                  [
                    [5.5, "5,5 % — Rénovation énergétique"],
                    [10, "10 % — Amélioration / Autonomie"],
                    [20, "20 % — Standard"],
                  ] as const
                ).map(([taux, libelle]) => (
                  <button
                    key={taux}
                    type="button"
                    onClick={() => patch({ tauxTva: taux })}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold ${
                      dossier.tauxTva === taux ? "bg-[#1a5c2e] text-[#f9c74f]" : "border border-white/15 text-slate-200"
                    }`}
                  >
                    {libelle}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="text-sm text-slate-300">
              Acompte 30 % : <strong className="text-white">{euro(round2(dossier.venteTtc * 0.3))}</strong> TTC — facture avec RIB Qonto.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="dispatch-facture-acompte"
                disabled={!(dossier.venteTtc > 0) || !dossier.clientNom.trim()}
                onClick={ouvrirFacture}
                className="rounded-xl bg-[#1a5c2e] px-4 py-3 text-sm font-semibold text-white hover:bg-[#2d8a4e] disabled:opacity-50"
              >
                Générer la facture d&apos;acompte 30 %
              </button>
              <button
                type="button"
                data-testid="dispatch-presentation-client"
                onClick={() => setPresentation(true)}
                className="rounded-xl border border-[#f9c74f]/60 px-4 py-3 text-sm font-semibold text-[#f9c74f] hover:bg-white/5"
              >
                Présentation devis client — Avant / Après
              </button>
            </div>
          </div>
        ) : null}

        {etape === 3 ? (
          <div className="mx-auto max-w-5xl space-y-3">
            {alerteOrdre ? (
              <p className="rounded-xl border border-rose-400/50 bg-rose-500/10 px-4 py-3 text-sm text-rose-100" data-testid="dispatch-alerte-ordre">
                Alerte — le lot chauffage est actif sans le lot isolation, alors qu&apos;un lot de gros œuvre ou de clos-couvert est engagé. L&apos;isolation précède le chauffage : sinon la PAC est surdimensionnée.
              </p>
            ) : null}
            {dossier.lots.map((lot) => (
              <article key={lot.id} className="rounded-2xl border border-white/10 p-4">
                <label className="flex items-start gap-3 text-sm font-semibold text-white">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={lot.actif}
                    onChange={(event) => patchLot(lot.id, { actif: event.target.checked })}
                  />
                  <span>
                    [Ordre {lot.ordre}] {lot.titre}
                    <span className="mt-1 block text-xs font-normal text-slate-400">
                      {comptePhase(dossier, lot.id, "avant")} avant · {comptePhase(dossier, lot.id, "apres")} projection(s)
                    </span>
                  </span>
                </label>
                {lot.actif ? (
                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <label className="block text-xs text-slate-300">
                      Sous-traitant
                      <input className={inputClass} value={lot.artisan} onChange={(event) => patchLot(lot.id, { artisan: event.target.value })} />
                    </label>
                    <label className="block text-xs text-slate-300">
                      Montant forfait HT
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={inputClass}
                        value={lot.montantHt || ""}
                        onChange={(event) => patchLot(lot.id, { montantHt: event.target.value === "" ? 0 : Number(event.target.value) })}
                      />
                    </label>
                    <label className="block text-xs text-slate-300 md:col-span-2">
                      Désignation du lot
                      <textarea className={`${inputClass} min-h-16`} value={lot.designation} onChange={(event) => patchLot(lot.id, { designation: event.target.value })} />
                    </label>
                    <ZoneVisuels lotId={lot.id} phase="avant" titre="Zone A — Photos avant travaux" dossier={dossier} onFiles={(files) => void ajouterPhotos(files, lot.id, "avant")} />
                    <ZoneVisuels lotId={lot.id} phase="apres" titre="Zone B — Projections / visuel cible après travaux" dossier={dossier} onFiles={(files) => void ajouterPhotos(files, lot.id, "apres")} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {etape === 4 ? (
          <div className="mx-auto max-w-4xl">
            {prets.length === 0 ? (
              <p className="text-sm text-slate-300">
                Aucun lot prêt. À l&apos;étape 3, activez un corps d&apos;état, nommez le sous-traitant et saisissez un forfait HT.
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {prets.map((lot) => (
                    <button
                      key={lot.id}
                      type="button"
                      onClick={() => setLotActif(lot.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        lotSelectionne?.id === lot.id ? "bg-[#1a5c2e] text-[#f9c74f]" : "border border-white/15 text-slate-200"
                      }`}
                    >
                      {lot.ordre}. {lot.artisan}
                    </button>
                  ))}
                </div>
                {lotSelectionne ? (
                  <div className="mt-4 rounded-2xl border border-white/10 p-4 text-sm text-slate-200">
                    <p className="font-semibold text-white">{lotSelectionne.titre}</p>
                    <p className="mt-1">N° {numeroLot(dossier.bdcBase, lotSelectionne.ordre)}</p>
                    <p className="mt-1">{euro(lotSelectionne.montantHt)} HT — {photosLot(dossier, lotSelectionne.id).length} photo(s) d&apos;annexe</p>
                    <button
                      type="button"
                      data-testid="dispatch-ouvrir-bdc"
                      onClick={() => ouvrirBdc(lotSelectionne)}
                      className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#1a5c2e] px-4 py-2.5 text-sm font-semibold text-white"
                    >
                      <ClipboardList className="h-4 w-4" aria-hidden />
                      Ouvrir et imprimer ce bon de commande
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        ) : null}
      </div>

      {etape >= 3 ? (
        <aside className="border-t border-[#f9c74f]/40 bg-[#1a5c2e]/50 px-5 py-3" data-testid="dispatch-marge">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f9c74f]">Marge nette ENERGIA CONSEIL IA®</p>
          <p className="mt-1 text-sm text-white">
            Vente {euro(chiffres.venteHt)} HT − débours {euro(chiffres.debours)} HT − commission apporteur {euro(chiffres.commission)} ({dossier.commissionPct} %)
            {" = "}
            <strong>{euro(chiffres.marge)} HT</strong>
            {" "}({chiffres.margePct} %)
          </p>
          <label className="mt-2 inline-flex items-center gap-2 text-xs text-slate-200">
            Commission apporteur
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              className="w-20 rounded border border-white/20 bg-white/10 px-2 py-1 text-white"
              value={dossier.commissionPct}
              onChange={(event) => patch({ commissionPct: event.target.value === "" ? 0 : Number(event.target.value) })}
            />
            %
          </label>
        </aside>
      ) : null}

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-5 py-3">
        <p className="text-xs text-emerald-200">{message}</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="dispatch-imprimer-liasse"
            disabled={!prets.length}
            onClick={imprimerLiasse}
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Printer className="h-4 w-4" aria-hidden />
            Imprimer / exporter tous les BDC
          </button>
          <button
            type="button"
            data-testid="dispatch-enregistrer-marche"
            disabled={!dossier.clientNom.trim()}
            onClick={enregistrerMarche}
            className="inline-flex items-center gap-2 rounded-xl bg-[#f9c74f] px-3 py-2 text-sm font-semibold text-[#102a43] disabled:opacity-50"
          >
            <Save className="h-4 w-4" aria-hidden />
            Enregistrer et passer au statut Marché actif
          </button>
        </div>
      </footer>

      <FactureAcompteModal ouvert={Boolean(facture)} marche={facture} onFermer={() => setFacture(null)} />
      <BonDeCommandeArtisanModal
        ouvert={bdcOuvert && Boolean(lotSelectionne)}
        onFermer={() => setBdcOuvert(false)}
        clientNom={dossier.clientNom}
        clientAdresse={dossier.adresse}
        clientTel={dossier.telephone}
        clientVille={dossier.ville}
        marcheRef={dossier.marcheRef}
        bdcRef={lotSelectionne ? numeroLot(dossier.bdcBase, lotSelectionne.ordre) : ""}
        lotDescription={lotSelectionne?.designation || ""}
        artisanNom={lotSelectionne?.artisan || ""}
        artisanCorpsEtat={lotSelectionne?.titre || ""}
        montantHT={lotSelectionne?.montantHt || 0}
        photos={lotSelectionne ? photosLot(dossier, lotSelectionne.id) : []}
        dossierId={`${dossier.leadId}-${lotSelectionne?.id || "lot"}`}
      />
      {presentation ? <PresentationDevisClient dossier={dossier} onFermer={() => setPresentation(false)} /> : null}
      {liasse ? (
        <LiasseBdc
          dossier={dossier}
          lots={prets}
          saisieLot={saisieLot}
          onFermer={() => setLiasse(false)}
          onLegende={(photoId, legende) =>
            setDossier((prev) => ({
              ...prev,
              photos: prev.photos.map((photo) => (photo.id === photoId ? { ...photo, legende } : photo)),
            }))
          }
        />
      ) : null}
    </div>,
    document.body,
  );
}

function LiasseBdc({
  dossier,
  lots,
  saisieLot,
  onFermer,
  onLegende,
}: {
  dossier: DossierDispatch;
  lots: LotDispatch[];
  saisieLot: (lot: LotDispatch) => ReturnType<typeof saisieDepuisProps>;
  onFermer: () => void;
  onLegende: (photoId: string, legende: string) => void;
}) {
  return createPortal(
    <div className="bdc-artisan-overlay fixed inset-0 z-[99] overflow-auto bg-slate-200" data-testid="liasse-bdc">
      <style>{PRINT_CSS_BDC}</style>
      <div className="bdc-artisan-noprint sticky top-0 z-10 flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
        <p className="text-sm font-medium text-[#102a43]">Liasse — {lots.length} bon(s) de commande — {dossier.clientNom}</p>
        <div className="flex gap-2">
          <button type="button" onClick={() => window.print()} className="rounded-xl bg-[#1a5c2e] px-3 py-2 text-sm font-semibold text-white">
            Imprimer la liasse
          </button>
          <button type="button" onClick={onFermer} className="rounded-xl border px-3 py-2 text-sm">
            Fermer
          </button>
        </div>
      </div>
      <div className="bdc-artisan-dossier flex flex-col items-center gap-8 px-4 py-6">
        {lots.map((lot, index) => {
          const photos = photosLot(dossier, lot.id);
          const dernier = index === lots.length - 1;
          const relaisPage1 = photos.length === 0 && !dernier;
          const relaisPage2 = photos.length > 0 && !dernier;
          const saisie = saisieLot(lot);
          return (
            <div key={lot.id} className="flex flex-col items-center gap-8">
              <FeuilleCommande
                saisie={saisie}
                suite={photos.length > 0}
                relais={relaisPage1}
                ancre={`bdc-${lot.id}`}
                onBasculerStatut={() => undefined}
              />
              {photos.length > 0 ? (
                <AnnexePhotos
                  saisie={saisie}
                  photos={photos}
                  relais={relaisPage2}
                  ancre={`annexe-${lot.id}`}
                  onLegende={(photoIndex, legende) => {
                    const cible = dossier.photos.filter((photo) => photo.lotId === lot.id)[photoIndex];
                    if (cible) onLegende(cible.id, legende);
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>,
    document.body,
  );
}

function ZoneVisuels({
  lotId,
  phase,
  titre,
  dossier,
  onFiles,
}: {
  lotId: LotId;
  phase: "avant" | "apres";
  titre: string;
  dossier: DossierDispatch;
  onFiles: (files: FileList) => void;
}) {
  const photos = dossier.photos.filter((photo) => photo.lotId === lotId && phaseDe(photo) === phase && photo.src);
  return (
    <div
      className="rounded-xl border border-dashed border-white/20 p-3"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (event.dataTransfer.files.length) onFiles(event.dataTransfer.files);
      }}
    >
      <p className="text-xs font-semibold text-[#f9c74f]">{titre}</p>
      <p className="mt-1 text-[11px] text-slate-400">{photos.length} image(s)</p>
      <label className="mt-2 inline-flex cursor-pointer rounded-lg border border-white/15 px-2 py-1 text-[11px] text-slate-200 hover:bg-white/10">
        Ajouter
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) onFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </label>
      <div className="mt-2 flex gap-2 overflow-x-auto">
        {photos.map((photo) => (
          <img key={photo.id} src={photo.src} alt={photo.legende} className="h-16 w-20 shrink-0 rounded object-cover" />
        ))}
      </div>
    </div>
  );
}

function ComparateurAvantApres({ avant, apres }: { avant: string; apres: string }) {
  const [ratio, setRatio] = useState(52);
  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-slate-200" data-testid="comparateur-avant-apres">
      <img src={apres} alt="Visuel objectif après travaux" className="absolute inset-0 h-full w-full object-cover" />
      <img
        src={avant}
        alt="État initial du chantier"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - ratio}% 0 0)` }}
      />
      <span className="absolute left-3 top-3 rounded bg-[#0B1F3A]/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Avant</span>
      <span className="absolute right-3 top-3 rounded bg-[#059669]/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">Après</span>
      <input
        aria-label="Curseur avant après"
        type="range"
        min={2}
        max={98}
        value={ratio}
        onChange={(event) => setRatio(Number(event.target.value))}
        className="absolute bottom-3 left-4 right-4"
      />
    </div>
  );
}

function PresentationDevisClient({ dossier, onFermer }: { dossier: DossierDispatch; onFermer: () => void }) {
  const lots = dossier.lots.filter((lot) => lot.actif);
  const chiffres = synthese(dossier);
  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-[#f8fafc] text-[#0B1F3A]" data-testid="presentation-devis-client">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#059669]">ENERGIA CONSEIL IA® — Contractant général</p>
          <h3 className="text-lg font-semibold">Présentation du marché — {dossier.clientNom || "Client"}</h3>
        </div>
        <button type="button" onClick={onFermer} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Fermer
        </button>
      </header>
      <div className="mx-auto max-w-4xl space-y-8 px-6 py-6">
        <p className="text-sm text-slate-600">
          {dossier.adresse} {dossier.ville ? `— ${dossier.ville}` : ""} · Montant du marché {euro(dossier.venteTtc)} TTC ({euro(chiffres.venteHt)} HT)
        </p>
        {lots.map((lot) => {
          const visuels = photosLot(dossier, lot.id);
          const avant = visuels.filter((photo) => photo.phase !== "apres");
          const apres = visuels.filter((photo) => photo.phase === "apres");
          const paires = avant.map((photo, index) => ({ avant: photo, apres: apres[index] })).filter((paire) => paire.apres);
          return (
            <section key={lot.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="font-semibold">
                {lot.ordre}. {lot.titre}
              </h4>
              {paires.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  {avant.length
                    ? "Photo d'état initial enregistrée. La projection après travaux n'est pas encore déposée pour ce lot."
                    : "Aucun visuel pour ce lot."}
                </p>
              ) : (
                <div className="mt-3 space-y-4">
                  {paires.map((paire) => (
                    <ComparateurAvantApres key={`${paire.avant.src}-${paire.apres.src}`} avant={paire.avant.src} apres={paire.apres.src} />
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
