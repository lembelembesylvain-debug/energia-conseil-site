import { useEffect, useMemo, useState } from "react";
import { euro } from "../../lib/crm/mockData";
import { lireEditionDossier } from "../../lib/crm/editionDossier";
import { BRUNEL_DOSSIER_ID } from "../../lib/crm/brunelWorkingBase";
import { OFFRE_AUTONOMIE } from "../../lib/crm/brunelOffresV5";
import { lignesMarcheBrunel } from "../../lib/crm/brunelMarcheOfficiel2026";
import {
  ARTICLE_CGI_AUTOLIQUIDATION,
  MENTION_AUTOLIQUIDATION_TVA,
  chargerReferentiel,
  enregistrerReferentiel,
  grouperLignesParArtisan,
  persisterReferentielDisque,
} from "../../lib/crm/artisansRge";
import {
  htmlBonCommandePourGroupe,
  nomFichierBonCommande,
} from "../../lib/crm/bonCommandeSousTraitanceHtml";
import ToggleSousTraitance from "./ToggleSousTraitance";
import { ROLE_ADMIN, peutVoirCoutsInternes } from "../../lib/crm/roles";
import { analyserDevis } from "../../lib/crm/gardeFouMarge";
import WidgetRentabiliteDevis from "./WidgetRentabiliteDevis";

function ouvrirHtml(html, { imprimer = false, nom = "bon-commande.html" } = {}) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  if (imprimer) {
    const fenetre = window.open(url, "_blank", "noopener,noreferrer");
    if (fenetre) {
      const timer = window.setInterval(() => {
        try {
          if (fenetre.closed) {
            window.clearInterval(timer);
            return;
          }
          if (fenetre.document.readyState === "complete") {
            window.clearInterval(timer);
            fenetre.focus();
            fenetre.print();
          }
        } catch {
          window.clearInterval(timer);
        }
      }, 250);
    }
  } else {
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = nom;
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 120000);
}

const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white focus:border-emerald-500 focus:outline-none";

/**
 * Annuaire artisans RGE partenaires + grilles de sous-traitance.
 */
export default function AnnuaireArtisansRge({ role = "commercial", dossier = null, voirBonsCommande = true }) {
  const [referentiel, setReferentiel] = useState(() => chargerReferentiel());
  const [selectionId, setSelectionId] = useState(referentiel.artisans[0]?.id || "");
  const [filtreZone, setFiltreZone] = useState("");
  const [message, setMessage] = useState("");
  const admin = role === ROLE_ADMIN;
  const voirCouts = peutVoirCoutsInternes(role);
  const edition = dossier?.id ? lireEditionDossier(dossier.id, dossier) : null;

  useEffect(() => {
    enregistrerReferentiel(referentiel);
  }, [referentiel]);

  const artisans = useMemo(() => {
    const liste = referentiel.artisans || [];
    if (!filtreZone) return liste;
    return liste.filter((a) => (a.zones || []).includes(filtreZone));
  }, [referentiel, filtreZone]);

  const selection = artisans.find((a) => a.id === selectionId) || artisans[0] || null;

  const lignesPourBc = useMemo(() => {
    if (dossier?.id === BRUNEL_DOSSIER_ID && edition?.offreActive !== OFFRE_AUTONOMIE) {
      return lignesMarcheBrunel(edition?.offreActive);
    }
    return edition?.travaux || [];
  }, [dossier?.id, edition]);

  const groupesBc = useMemo(() => {
    if (!lignesPourBc.length) return [];
    return grouperLignesParArtisan(lignesPourBc, referentiel);
  }, [lignesPourBc, referentiel]);

  const rentabilite = useMemo(() => {
    if (!voirCouts || !lignesPourBc.length) return null;
    return analyserDevis(lignesPourBc, referentiel);
  }, [voirCouts, lignesPourBc, referentiel]);

  const patcherArtisan = (artisanId, patch) => {
    setReferentiel((prev) => ({
      ...prev,
      artisans: prev.artisans.map((a) => {
        if (a.id !== artisanId) return a;
        return {
          ...a,
          ...patch,
          rge: { ...(a.rge || {}), ...(patch.rge || {}) },
          decennale: { ...(a.decennale || {}), ...(patch.decennale || {}) },
        };
      }),
    }));
  };

  const patcherGrille = (artisanId, grilleId, patch) => {
    setReferentiel((prev) => ({
      ...prev,
      artisans: prev.artisans.map((a) =>
        a.id !== artisanId
          ? a
          : {
              ...a,
              grilles: (a.grilles || []).map((g) => (g.id === grilleId ? { ...g, ...patch } : g)),
            },
      ),
    }));
  };

  const ajouterArtisan = () => {
    const id = globalThis.crypto?.randomUUID?.() || `artisan-${Date.now()}`;
    const artisan = {
      id,
      raisonSociale: "Nouvelle entreprise",
      enseigne: "",
      dirigeant: "",
      siret: "",
      telephone: "",
      email: "",
      adresse: "",
      zones: [],
      specialites: [],
      decennale: { compagnie: "", police: "", validite: "" },
      rge: { organisme: "", numero: "", validite: "" },
      grilles: [],
    };
    setReferentiel((prev) => ({ ...prev, artisans: [...prev.artisans, artisan] }));
    setSelectionId(id);
    setFiltreZone("");
  };

  const sauvegarder = async () => {
    const resultat = await persisterReferentielDisque(referentiel, role);
    setMessage(
      resultat.stockeFichier
        ? "Référentiel enregistré dans data/artisans-rge-referentiel.json"
        : resultat.raison || "Sauvegarde locale (navigateur) effectuée.",
    );
  };

  const genererBc = (groupe, imprimer) => {
    const html = htmlBonCommandePourGroupe({
      artisan: groupe.artisan,
      lignes: groupe.lignes,
      dossier,
      edition,
    });
    ouvrirHtml(html, { imprimer, nom: nomFichierBonCommande(groupe.artisan, dossier) });
  };

  return (
    <section className="space-y-5">
      <header className="rounded-2xl border border-emerald-500/30 bg-slate-900/80 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Contractant Général · Sous-traitance BTP
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Artisans RGE &amp; grilles de sous-traitance</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-300">
          Annuaire partenaires réels, double mode tarifaire (fourniture + pose vs pose seule) et bons de commande
          en autoliquidation de TVA ({ARTICLE_CGI_AUTOLIQUIDATION}).
        </p>
        <p className="mt-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {MENTION_AUTOLIQUIDATION_TVA}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="text-xs text-slate-400">
            Zone
            <select
              className="ml-2 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-white"
              value={filtreZone}
              onChange={(event) => setFiltreZone(event.target.value)}
            >
              <option value="">Toutes (42, 69, 71, 01, 21)</option>
              {["42", "69", "71", "01", "21"].map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </label>
          {admin ? (
            <span className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={ajouterArtisan}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40"
              >
                + Ajouter un artisan
              </button>
              <button
                type="button"
                onClick={sauvegarder}
                className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200"
              >
                Synchroniser le référentiel
              </button>
            </span>
          ) : null}
          {message ? <span className="text-xs text-emerald-200">{message}</span> : null}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ul className="space-y-2">
          {artisans.map((artisan) => (
            <li key={artisan.id}>
              <button
                type="button"
                onClick={() => setSelectionId(artisan.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                  selection?.id === artisan.id
                    ? "border-emerald-400/60 bg-emerald-500/15"
                    : "border-slate-800 bg-slate-950/60 hover:border-slate-600"
                }`}
              >
                <p className="font-semibold text-white">{artisan.enseigne || artisan.raisonSociale}</p>
                <p className="mt-1 text-[11px] text-slate-400">{artisan.specialites?.join(" · ")}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-emerald-200/80">
                  {artisan.rge?.organisme} · {artisan.rge?.numero}
                </p>
              </button>
            </li>
          ))}
        </ul>

        {selection ? (
          <article className="rounded-2xl border border-slate-800 bg-slate-950/50 p-5">
            <h3 className="text-lg font-semibold text-white">{selection.raisonSociale}</h3>
            <p className="text-sm text-slate-400">{selection.enseigne}</p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
              <Champ label="Forme / Dirigeant" value={`${selection.forme} · ${selection.dirigeant}`} />
              <Champ
                label="SIRET"
                value={
                  selection.siretStatut === "a_confirmer"
                    ? `${selection.siret} (à confirmer sur Kbis)`
                    : selection.siret
                }
              />
              <Champ label="Téléphone" value={selection.telephone} />
              <Champ label="Email" value={selection.email} />
              <Champ label="Adresse" value={selection.adresse} className="sm:col-span-2" />
              <Champ label="Zones d’intervention" value={(selection.zones || []).join(", ")} />
              <Champ
                label="Qualification RGE"
                value={`${selection.rge?.organisme} n° ${selection.rge?.numero} — validité ${selection.rge?.validite}`}
              />
              <Champ
                label="Assurance décennale"
                value={`${selection.decennale?.compagnie} — police ${selection.decennale?.police}${
                  selection.decennale?.validite ? ` — jusqu’au ${selection.decennale.validite}` : ""
                }`}
              />
              <Champ
                label="Statut contractuel"
                value={`${selection.contratSousTraitance?.type} — autoliquidation TVA (${selection.contratSousTraitance?.article})`}
                className="sm:col-span-2"
              />
            </dl>

            {admin ? (
              <section className="mt-5 rounded-xl border border-emerald-500/25 bg-slate-900/70 p-4">
                <h4 className="text-sm font-semibold uppercase tracking-wide text-emerald-200">Fiche artisan · sauvegarde locale automatique</h4>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Entreprise", "raisonSociale"],
                    ["Enseigne", "enseigne"],
                    ["Dirigeant", "dirigeant"],
                    ["SIRET", "siret"],
                    ["Adresse", "adresse"],
                    ["Téléphone", "telephone"],
                    ["E-mail", "email"],
                  ].map(([label, cle]) => (
                    <label key={cle} className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      {label}
                      <input className={`${inputClass} mt-1`} value={selection[cle] || ""} onChange={(event) => patcherArtisan(selection.id, { [cle]: event.target.value })} />
                    </label>
                  ))}
                  <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Zones d’intervention (codes séparés par des virgules)
                    <input className={`${inputClass} mt-1`} value={(selection.zones || []).join(", ")} onChange={(event) => patcherArtisan(selection.id, { zones: event.target.value.split(",").map((zone) => zone.trim()).filter(Boolean) })} />
                  </label>
                  <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Nom de l’assurance décennale
                    <input className={`${inputClass} mt-1`} value={selection.decennale?.compagnie || ""} onChange={(event) => patcherArtisan(selection.id, { decennale: { compagnie: event.target.value } })} />
                  </label>
                  <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Numéro de police
                    <input className={`${inputClass} mt-1`} value={selection.decennale?.police || ""} onChange={(event) => patcherArtisan(selection.id, { decennale: { police: event.target.value } })} />
                  </label>
                  <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Fin de validité décennale
                    <input type="date" className={`${inputClass} mt-1`} value={selection.decennale?.validite || ""} onChange={(event) => patcherArtisan(selection.id, { decennale: { validite: event.target.value } })} />
                  </label>
                </div>
              </section>
            ) : null}

            {admin ? (
              <div className="mt-5 space-y-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Pilotage Contractant Général
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-slate-400">Mode par défaut</span>
                  <ToggleSousTraitance
                    mode={selection.modeDefaut}
                    onChange={(mode) => patcherArtisan(selection.id, { modeDefaut: mode })}
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-[11px] uppercase tracking-wide text-slate-500">
                    Validité RGE
                    <input
                      className={`${inputClass} mt-1`}
                      type="date"
                      value={selection.rge?.validite || ""}
                      onChange={(event) =>
                        patcherArtisan(selection.id, { rge: { validite: event.target.value } })
                      }
                    />
                  </label>
                  <label className="text-[11px] uppercase tracking-wide text-slate-500">
                    Attestation décennale — validité
                    <input
                      className={`${inputClass} mt-1`}
                      type="date"
                      value={selection.decennale?.validite || ""}
                      onChange={(event) =>
                        patcherArtisan(selection.id, { decennale: { validite: event.target.value } })
                      }
                    />
                  </label>
                  <label className="text-[11px] uppercase tracking-wide text-slate-500 sm:col-span-2">
                    N° police décennale
                    <input
                      className={`${inputClass} mt-1`}
                      type="text"
                      value={selection.decennale?.police || ""}
                      onChange={(event) =>
                        patcherArtisan(selection.id, { decennale: { police: event.target.value } })
                      }
                    />
                  </label>
                </div>
              </div>
            ) : null}

            <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-300">
              Grilles de sous-traitance — Mode A vs Mode B
            </h4>
            {!voirCouts ? (
              <p className="mt-2 text-xs text-slate-500">
                Les PU internes (fourniture + pose, pose seule, matériel direct) sont réservés à l’administration.
              </p>
            ) : (
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-2 py-2">Métier</th>
                      <th className="px-2 py-2">Unité</th>
                      <th className="px-2 py-2 text-right">A · Fourniture + pose</th>
                      <th className="px-2 py-2 text-right">B · Pose seule</th>
                      <th className="px-2 py-2 text-right">Matériel direct ENERGIA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(selection.grilles || []).map((grille) => (
                      <tr key={grille.id}>
                        <td className="px-2 py-2 text-white">{grille.metier}</td>
                        <td className="px-2 py-2 text-slate-400">{grille.unite}</td>
                        {["fourniturePosePuHt", "poseSeulePuHt", "materielDirectPuHt"].map((cle) => (
                          <td key={cle} className="px-2 py-2 text-right">
                            {admin ? (
                              <input
                                className={`${inputClass} w-24 text-right`}
                                type="number"
                                min="0"
                                step="0.01"
                                value={grille[cle] ?? ""}
                                onChange={(event) =>
                                  patcherGrille(selection.id, grille.id, {
                                    [cle]: event.target.value === "" ? null : Number(event.target.value),
                                  })
                                }
                              />
                            ) : (
                              euro(grille[cle])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </article>
        ) : null}
      </div>

      {voirBonsCommande && dossier?.id ? (
        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Bons de commande — dossier {dossier.client || dossier.nom || dossier.id}
          </h3>
          {rentabilite ? <WidgetRentabiliteDevis analyse={rentabilite} /> : null}
          {groupesBc.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">
              Aucun artisan RGE associé aux postes. Ouvrez l’onglet Travaux du dossier pour affecter C2L, Bonheur
              d’Amarante ou SMN Energies.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {groupesBc.map((groupe) => (
                <li
                  key={groupe.artisan.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2"
                >
                  <p className="text-sm text-white">
                    {groupe.artisan.raisonSociale}
                    <span className="ml-2 text-xs text-slate-500">{groupe.lignes.length} poste(s)</span>
                  </p>
                  <span className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-emerald-400/50 px-3 py-1.5 text-xs font-semibold text-emerald-100"
                      onClick={() => genererBc(groupe, false)}
                    >
                      Télécharger le BC
                    </button>
                    <button
                      type="button"
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
                      onClick={() => genererBc(groupe, true)}
                    >
                      Imprimer l’ordre de service
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </section>
  );
}

function Champ({ label, value, className = "" }) {
  return (
    <div className={className}>
      <dt className="text-[11px] uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-slate-200">{value || "—"}</dd>
    </div>
  );
}
