import { useEffect, useId, useState } from "react";
import {
  STATUT_INITIAL_DOCUMENTS,
  STATUTS_PROJET_MANUEL,
  TYPES_PROJET_MANUEL,
  validerProjetManuel,
} from "../../lib/crm/projetsManuels";
import { SOURCE_APPORTEUR_DIRECT, SOURCES_APPORTEUR, ETAPES_ANAH } from "../../lib/crm/operationnelCrm.js";
import { BET_NOMOS_CONVENTION_REF, BET_NOMOS_ID, estTypeAuditEtendu } from "../../lib/crm/betNomosOfficiel.js";
import { PROFILS_ANAH, STATUTS_OCCUPATION } from "../../lib/crm/editionDossier.js";
import {
  CATEGORIES_METIERS,
  COORDINATION_NATIONALE,
  assignerCoordinateurLot,
} from "../../lib/crm/catalogue";

const BROUILLON_KEY = "energia-crm-dossier-form-draft-v1";

const JALONS_LIBELLES = {
  1: "1/5 Lead",
  2: "2/5 Devis / MAR",
  3: "3/5 Financement",
  4: "4/5 Travaux",
  5: "5/5 Réceptionné",
};

const CHAMP_VIDE = {
  nom: "",
  prenom: "",
  ville: "",
  codePostal: "",
  adresse: "",
  telephone: "",
  email: "",
  rfr: "",
  statut: STATUT_INITIAL_DOCUMENTS,
  typeProjet: TYPES_PROJET_MANUEL[0],
  description: "",
  montantEstimeTtc: "",
  montantHt: "",
  equipeDirection: "Sylvain LEMBELEMBE",
  equipeCommercial: "Damien",
  equipeDesign: "",
  equipeCoordination: COORDINATION_NATIONALE.responsable,
  apporteurId: SOURCE_APPORTEUR_DIRECT,
  bureauEtudesId: "",
  profilAnah: "",
  statutOccupation: "",
  etapeAnah: ETAPES_ANAH[0].id,
  jalonsValides: [],
  validationMar: false,
  acompte30Encaisse: false,
  travaux: [],
};

const identifiantLigne = () => globalThis.crypto?.randomUUID?.() || `lot-${Date.now()}-${Math.random()}`;
const nombre = (value) => Number(String(value || "0").replace(",", ".")) || 0;
const euro = (value) => `${Number(value || 0).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €`;

function lireBrouillon(projet) {
  if (projet) {
    return {
      ...CHAMP_VIDE,
      ...projet,
      prenom: projet.prenom || "",
      typeProjet: projet.typeProjet || CHAMP_VIDE.typeProjet,
      description: projet.description || "",
      montantEstimeTtc: projet.montantEstimeTtc ?? projet.caTtc ?? "",
      montantHt: projet.montantHt ?? projet.caHt ?? "",
      equipeDirection:
        projet.equipe?.direction ||
        projet.equipe?.directionContractantGeneral ||
        CHAMP_VIDE.equipeDirection,
      equipeCommercial:
        projet.equipe?.commercial || projet.equipe?.commercialApporteur || CHAMP_VIDE.equipeCommercial,
      equipeDesign: projet.equipe?.design || projet.equipe?.designAgencement || "",
      equipeCoordination:
        projet.equipe?.coordination ||
        projet.equipe?.coordinateur ||
        COORDINATION_NATIONALE.responsable,
      rfr: projet.rfr ?? "",
      bureauEtudesId: projet.bureauEtudesId || "",
      travaux: Array.isArray(projet.travaux)
        ? projet.travaux.map((lot) => assignerCoordinateurLot(lot, lot.categorieId))
        : [],
      jalonsValides: Array.isArray(projet.jalonsValides) ? projet.jalonsValides : [],
    };
  }
  try {
    const stocke = JSON.parse(localStorage.getItem(BROUILLON_KEY) || "null");
    if (stocke && !stocke.projetId) return { ...CHAMP_VIDE, ...stocke, travaux: stocke.travaux || [] };
  } catch {
    /* ignore */
  }
  return { ...CHAMP_VIDE, travaux: [] };
}

export default function ModalNouveauProjet({
  ouvert,
  onFermer,
  onEnregistrer,
  projet = null,
  masquerMarges = false,
}) {
  const titreId = useId();
  const [champs, setChamps] = useState(() => lireBrouillon(projet));
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!ouvert) return undefined;
    setChamps(lireBrouillon(projet));
    setErreurs({});
    setEnvoi(false);
    const onKey = (event) => {
      if (event.key === "Escape") onFermer();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ouvert, onFermer, projet]);

  useEffect(() => {
    if (!ouvert || projet) return;
    try {
      localStorage.setItem(BROUILLON_KEY, JSON.stringify(champs));
    } catch {
      /* quota / mode privé */
    }
  }, [champs, ouvert, projet]);

  if (!ouvert) return null;

  const changer = (cle) => (event) => {
    setChamps((prev) => ({ ...prev, [cle]: event.target.value }));
  };

  const changerLot = (id, patch) => {
    setChamps((prev) => ({
      ...prev,
      travaux: prev.travaux.map((lot) => (lot.id === id ? { ...lot, ...patch } : lot)),
    }));
  };

  const lots = champs.travaux || [];
  const totalVenteHt = lots.reduce((sum, lot) => sum + nombre(lot.quantite) * nombre(lot.prixVentePuHt), 0);
  const totalAchatHt = lots.reduce((sum, lot) => sum + nombre(lot.quantite) * nombre(lot.coutAchatPuHt), 0);
  const margeBruteHt = totalVenteHt - totalAchatHt;

  const soumettre = (event) => {
    event.preventDefault();
    const ordreJalon = ETAPES_ANAH.find((item) => item.id === champs.etapeAnah)?.ordre || 1;
    const jalon2Valide = champs.jalonsValides.includes(ETAPES_ANAH[1].id);
    if (ordreJalon >= 3 && !jalon2Valide) {
      setErreurs({ pipeline: "Validez le jalon 2 avant de positionner le dossier au jalon 3 ou supérieur." });
      return;
    }
    if (champs.acompte30Encaisse && ordreJalon < 3) {
      setErreurs({ pipeline: "L’acompte de 30 % ne peut être confirmé qu’à partir du jalon 3." });
      return;
    }
    const { ok, erreurs: nextErreurs, valeurs } = validerProjetManuel(champs);
    if (!ok) {
      setErreurs(nextErreurs);
      return;
    }
    setEnvoi(true);
    const resultat = onEnregistrer(
      {
        ...champs,
        ...valeurs,
        adresse: champs.adresse.trim(),
        telephone: champs.telephone.trim(),
        email: champs.email.trim(),
        equipe: {
          direction: champs.equipeDirection.trim(),
          commercial: champs.equipeCommercial.trim(),
          design: champs.equipeDesign.trim(),
          coordination: champs.equipeCoordination.trim() || COORDINATION_NATIONALE.responsable,
        },
        travaux: lots.map((lot) =>
          assignerCoordinateurLot(
            {
              ...lot,
              quantite: nombre(lot.quantite),
              prixVentePuHt: nombre(lot.prixVentePuHt),
              coutAchatPuHt: masquerMarges ? 0 : nombre(lot.coutAchatPuHt),
              tauxTva: Number(lot.tauxTva) || 0.055,
            },
            lot.categorieId,
          ),
        ),
      },
      projet?.id,
    );
    setEnvoi(false);
    if (!resultat?.ok) {
      setErreurs(resultat?.erreurs ?? { nom: "Enregistrement impossible." });
      return;
    }
    try {
      localStorage.removeItem(BROUILLON_KEY);
    } catch {
      /* ignore */
    }
    onFermer();
  };

  const champClass =
    "mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3 py-2.5 text-sm text-white outline-none ring-emerald-500/40 placeholder:text-slate-500 focus:border-emerald-500/60 focus:ring-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onFermer}
      />
      <form
        onSubmit={soumettre}
        aria-labelledby={titreId}
        className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 p-5 shadow-2xl shadow-emerald-950/40 sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
          Pilotage manuel · Sauvegarde locale automatique
        </p>
        <h2 id={titreId} className="mt-1 text-xl font-semibold text-white">
          {projet ? "Modifier le projet manuellement" : "+ Nouveau Projet Manuel"}
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Saisie interactive : client, type, apporteur, montants, statut et équipe. Le CA dashboard se
          recalcule immédiatement après enregistrement.
        </p>

        <div className="mt-5 grid gap-5">
          <section className="grid gap-4 sm:grid-cols-2">
            <h3 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-200">
              Client & localisation
            </h3>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Nom
              <input
                required
                autoFocus
                className={champClass}
                value={champs.nom}
                onChange={changer("nom")}
                placeholder="Nom du client"
              />
              {erreurs.nom ? <span className="mt-1 block text-[11px] text-amber-300">{erreurs.nom}</span> : null}
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Prénom
              <input className={champClass} value={champs.prenom} onChange={changer("prenom")} placeholder="Prénom" />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Téléphone
              <input type="tel" className={champClass} value={champs.telephone} onChange={changer("telephone")} />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              E-mail
              <input type="email" className={champClass} value={champs.email} onChange={changer("email")} />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 sm:col-span-2">
              Adresse
              <input
                className={champClass}
                value={champs.adresse}
                onChange={changer("adresse")}
                placeholder="N°, rue, complément"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Ville
              <input
                required
                className={champClass}
                value={champs.ville}
                onChange={changer("ville")}
                placeholder="FEURS"
              />
              {erreurs.ville ? <span className="mt-1 block text-[11px] text-amber-300">{erreurs.ville}</span> : null}
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Code postal
              <input
                inputMode="numeric"
                maxLength={5}
                className={champClass}
                value={champs.codePostal}
                onChange={changer("codePostal")}
                placeholder="42110"
              />
              {erreurs.codePostal ? (
                <span className="mt-1 block text-[11px] text-amber-300">{erreurs.codePostal}</span>
              ) : null}
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <h3 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-200">
              Projet & montants
            </h3>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Type de projet
              <select className={champClass} value={champs.typeProjet} onChange={changer("typeProjet")}>
                {TYPES_PROJET_MANUEL.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                {champs.typeProjet && !TYPES_PROJET_MANUEL.includes(champs.typeProjet) ? (
                  <option value={champs.typeProjet}>{champs.typeProjet}</option>
                ) : null}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Bureau d'études — phase audit
              <select className={champClass} value={champs.bureauEtudesId || ""} onChange={changer("bureauEtudesId")}>
                <option value="">Aucun — audit non assigné</option>
                <option value={BET_NOMOS_ID}>BET NOMOS — Romain (audit et diagnostic)</option>
              </select>
              <span className="mt-1 block text-[11px] normal-case tracking-normal text-slate-500">
                Assigné avant le chiffrage Contractant Général. Convention {BET_NOMOS_CONVENTION_REF}.
                {estTypeAuditEtendu(champs.typeProjet) && !champs.bureauEtudesId
                  ? " Ce type de marché prévoit un audit BET NOMOS en amont."
                  : ""}
              </span>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Apporteur
              <select className={champClass} value={champs.apporteurId} onChange={changer("apporteurId")}>
                {SOURCES_APPORTEUR.map((source) => (
                  <option key={source.id} value={source.id}>
                    {source.selectLabel}
                  </option>
                ))}
              </select>
              {erreurs.apporteurId ? (
                <span className="mt-1 block text-[11px] text-amber-300">{erreurs.apporteurId}</span>
              ) : null}
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Montant estimé / validé TTC (€)
              <input
                inputMode="decimal"
                className={champClass}
                value={champs.montantEstimeTtc}
                onChange={changer("montantEstimeTtc")}
                placeholder="20000"
              />
              {erreurs.montantEstimeTtc ? (
                <span className="mt-1 block text-[11px] text-amber-300">{erreurs.montantEstimeTtc}</span>
              ) : null}
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Montant HT (€)
              <input
                inputMode="decimal"
                className={champClass}
                value={champs.montantHt}
                onChange={changer("montantHt")}
                placeholder="Auto si TTC renseigné (TVA 10 %)"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400 sm:col-span-2">
              Description libre
              <textarea
                rows={3}
                className={champClass}
                value={champs.description}
                onChange={changer("description")}
                placeholder="Contexte chantier, contraintes, notes commerciales…"
              />
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <h3 className="sm:col-span-2 lg:col-span-4 text-sm font-semibold uppercase tracking-wide text-slate-200">
              Attribution équipe
            </h3>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Direction CG
              <input className={champClass} value={champs.equipeDirection} onChange={changer("equipeDirection")} />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Commercial
              <input className={champClass} value={champs.equipeCommercial} onChange={changer("equipeCommercial")} />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Design / Agencement
              <input
                className={champClass}
                value={champs.equipeDesign}
                onChange={changer("equipeDesign")}
                placeholder="Catarina Martins (optionnel)"
              />
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Coordinateur France
              <input
                className={champClass}
                value={champs.equipeCoordination}
                onChange={changer("equipeCoordination")}
                placeholder={COORDINATION_NATIONALE.responsable}
              />
              <span className="mt-1 block text-[10px] normal-case tracking-normal text-emerald-300/90">
                Défaut : {COORDINATION_NATIONALE.responsable} — {COORDINATION_NATIONALE.telephoneAffiche}
              </span>
            </label>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <h3 className="sm:col-span-2 text-sm font-semibold uppercase tracking-wide text-slate-200">
              Statut & pipeline ANAH
            </h3>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Statut du dossier
              <select className={champClass} value={champs.statut} onChange={changer("statut")}>
                {STATUTS_PROJET_MANUEL.map((statut) => (
                  <option key={statut} value={statut}>
                    {statut}
                  </option>
                ))}
                {champs.statut && !STATUTS_PROJET_MANUEL.includes(champs.statut) ? (
                  <option value={champs.statut}>{champs.statut}</option>
                ) : null}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Jalon ANAH
              <select className={champClass} value={champs.etapeAnah} onChange={changer("etapeAnah")}>
                {ETAPES_ANAH.map((item) => (
                  <option key={item.id} value={item.id}>
                    {JALONS_LIBELLES[item.ordre] || `${item.ordre}/5`} — {item.compactLabel}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Profil fiscal ANAH
              <select className={champClass} value={champs.profilAnah} onChange={changer("profilAnah")}>
                <option value="">À renseigner</option>
                {PROFILS_ANAH.map((profil) => (
                  <option key={profil.id} value={profil.id}>
                    {profil.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Statut d’occupation
              <select className={champClass} value={champs.statutOccupation} onChange={changer("statutOccupation")}>
                <option value="">À renseigner</option>
                {STATUTS_OCCUPATION.filter((item) => item.id !== "acquereur").map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-medium uppercase tracking-wide text-slate-400">
              Revenu fiscal de référence (optionnel)
              <input
                inputMode="numeric"
                className={champClass}
                value={champs.rfr}
                onChange={changer("rfr")}
                placeholder="18785"
              />
              {erreurs.rfr ? <span className="mt-1 block text-[11px] text-amber-300">{erreurs.rfr}</span> : null}
            </label>
            <label className="flex items-center gap-2 self-end pb-2 text-sm text-slate-200">
              <input
                type="checkbox"
                checked={champs.acompte30Encaisse}
                onChange={(event) =>
                  setChamps((prev) => ({ ...prev, acompte30Encaisse: event.target.checked }))
                }
              />
              Acompte 30 % reçu
            </label>
            <div className="sm:col-span-2 grid gap-2 sm:grid-cols-5">
              {ETAPES_ANAH.map((item) => (
                <label
                  key={item.id}
                  className="flex items-start gap-2 rounded-lg border border-slate-700 p-2 text-xs text-slate-300"
                >
                  <input
                    type="checkbox"
                    checked={champs.jalonsValides.includes(item.id)}
                    onChange={(event) =>
                      setChamps((prev) => ({
                        ...prev,
                        ...(item.ordre === 2 ? { validationMar: event.target.checked } : {}),
                        jalonsValides: event.target.checked
                          ? [...new Set([...prev.jalonsValides, item.id])]
                          : prev.jalonsValides.filter((id) => id !== item.id),
                      }))
                    }
                  />
                  {JALONS_LIBELLES[item.ordre] || `Jalon ${item.ordre}`}
                </label>
              ))}
            </div>
            {erreurs.pipeline ? <p role="alert" className="sm:col-span-2 text-sm text-rose-200">{erreurs.pipeline}</p> : null}
          </section>

          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                Lots de travaux (optionnel)
              </h3>
              <button
                type="button"
                className="rounded-lg border border-emerald-500/50 px-3 py-2 text-xs font-semibold text-emerald-200"
                onClick={() =>
                  setChamps((prev) => {
                    const categorieDefaut = CATEGORIES_METIERS[0]?.id || "";
                    const nouveau = assignerCoordinateurLot(
                      {
                        id: identifiantLigne(),
                        nom: "",
                        quantite: 1,
                        prixVentePuHt: "",
                        coutAchatPuHt: "",
                        tauxTva: 0.055,
                        categorieId: categorieDefaut,
                      },
                      categorieDefaut,
                    );
                    return { ...prev, travaux: [...prev.travaux, nouveau] };
                  })
                }
              >
                + Ajouter un poste
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {lots.map((lot) => {
                const qte = nombre(lot.quantite);
                const vente = qte * nombre(lot.prixVentePuHt);
                const achat = masquerMarges ? 0 : qte * nombre(lot.coutAchatPuHt);
                const perte = !masquerMarges && vente < achat;
                return (
                  <div
                    key={lot.id}
                    className={`grid gap-3 rounded-xl border p-3 sm:grid-cols-6 ${
                      perte ? "border-rose-500/70 bg-rose-500/10" : "border-slate-700 bg-slate-950/50"
                    }`}
                  >
                    <label className="text-[11px] uppercase text-slate-400 sm:col-span-2">
                      Corps d’état / catégorie
                      <select
                        className={champClass}
                        value={lot.categorieId || ""}
                        onChange={(event) => {
                          const catId = event.target.value;
                          setChamps((prev) => ({
                            ...prev,
                            travaux: prev.travaux.map((item) =>
                              item.id === lot.id
                                ? assignerCoordinateurLot({ ...item, categorieId: catId }, catId)
                                : item,
                            ),
                          }));
                        }}
                      >
                        <option value="">Choisir…</option>
                        {CATEGORIES_METIERS.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {String(cat.ordre).padStart(2, "0")} · {cat.nom}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-[11px] uppercase text-slate-400 sm:col-span-2">
                      Nom du lot
                      <input
                        className={champClass}
                        value={lot.nom}
                        onChange={(event) => changerLot(lot.id, { nom: event.target.value })}
                      />
                    </label>
                    <label className="text-[11px] uppercase text-slate-400">
                      Métré
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={champClass}
                        value={lot.quantite}
                        onChange={(event) => changerLot(lot.id, { quantite: event.target.value })}
                      />
                    </label>
                    <label className="text-[11px] uppercase text-slate-400">
                      Vente PU HT
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className={champClass}
                        value={lot.prixVentePuHt}
                        onChange={(event) => changerLot(lot.id, { prixVentePuHt: event.target.value })}
                      />
                    </label>
                    {!masquerMarges ? (
                      <label className="text-[11px] uppercase text-slate-400">
                        Achat PU HT
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          className={champClass}
                          value={lot.coutAchatPuHt}
                          onChange={(event) => changerLot(lot.id, { coutAchatPuHt: event.target.value })}
                        />
                      </label>
                    ) : (
                      <div className="text-[11px] uppercase text-slate-500">Achat masqué (Vue AMO)</div>
                    )}
                    <label className="text-[11px] uppercase text-slate-400">
                      TVA
                      <select
                        className={champClass}
                        value={lot.tauxTva}
                        onChange={(event) => changerLot(lot.id, { tauxTva: Number(event.target.value) })}
                      >
                        <option value={0.055}>5,5 %</option>
                        <option value={0.1}>10 %</option>
                        <option value={0.2}>20 %</option>
                      </select>
                    </label>
                    {!masquerMarges ? (
                      <div className="flex items-center justify-between gap-2 text-xs sm:col-span-5">
                        <span className={perte ? "font-semibold text-rose-200" : "text-slate-300"}>
                          {perte ? "Alerte : vente à perte" : "Marge de la ligne"} · {euro(vente - achat)} HT
                        </span>
                        <span className="text-slate-400">
                          Vente {euro(vente)} · Achat {euro(achat)}
                        </span>
                      </div>
                    ) : null}
                    <div className="sm:col-span-5 flex flex-wrap items-center gap-2 text-[11px] text-emerald-200/90">
                      <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-2 py-0.5 font-semibold uppercase tracking-wide text-emerald-100">
                        {COORDINATION_NATIONALE.badgeReseau}
                      </span>
                      <span>
                        👷‍♂️ Coordinateur : {lot.coordinateur?.nom || COORDINATION_NATIONALE.responsable} (
                        {lot.coordinateur?.telephone || COORDINATION_NATIONALE.telephoneAffiche})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="text-left text-xs text-rose-300 sm:text-right"
                      onClick={() =>
                        setChamps((prev) => ({
                          ...prev,
                          travaux: prev.travaux.filter((item) => item.id !== lot.id),
                        }))
                      }
                    >
                      Supprimer le poste
                    </button>
                  </div>
                );
              })}
              {!masquerMarges && lots.length > 0 ? (
                <div
                  className={`flex flex-wrap justify-between gap-2 rounded-lg border px-3 py-2 text-sm ${
                    margeBruteHt < 0 ? "border-rose-500/60 text-rose-200" : "border-slate-700 text-slate-200"
                  }`}
                >
                  <span>
                    Vente totale : {euro(totalVenteHt)} HT · Achat : {euro(totalAchatHt)} HT
                  </span>
                  <strong>Marge brute : {euro(margeBruteHt)} HT</strong>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onFermer}
            className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:border-slate-500"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={envoi}
            className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-60"
          >
            {projet ? "Enregistrer les modifications" : "Créer le projet"}
          </button>
        </div>
      </form>
    </div>
  );
}
