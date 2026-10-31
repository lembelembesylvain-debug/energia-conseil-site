import { Fragment, useState } from "react";
import { euro } from "../../lib/crm/mockData";
import { LIBELLE_DONNEE_MANQUANTE } from "../../lib/crm/brunelWorkingBase";
import {
  calculerLigneTravaux,
  creerLigneTravaux,
  totauxTravaux,
} from "../../lib/crm/editionDossier";
import {
  chargerReferentiel,
  grouperLignesParArtisan,
} from "../../lib/crm/artisansRge";
import { calculerFraisDeplacementArtisanHt } from "../../lib/chiffrage/frais-deplacement-artisan.js";
import {
  htmlBonCommandePourGroupe,
  nomFichierBonCommande,
} from "../../lib/crm/bonCommandeSousTraitanceHtml";
import SelecteurTravauxThermiques from "./SelecteurTravauxThermiques";
import SelecteurSousTraitanceLigne from "./SelecteurSousTraitanceLigne";
import AlerteMargeLigne from "./AlerteMargeLigne";
import BoutonSecuriserMarge from "./BoutonSecuriserMarge";
import WidgetRentabiliteDevis from "./WidgetRentabiliteDevis";
import {
  analyserDevis,
  analyserLigneTravaux,
  classesLigneMarge,
  puHtPlancherDepuisRevientTotal,
  STATUT_MARGE_PERTE,
} from "../../lib/crm/gardeFouMarge";

const inputClass =
  "w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-right text-sm text-white focus:border-emerald-500 focus:outline-none";

/**
 * Grille travaux du dossier — mode édition catalogue thermique ENERGIA.
 */
export default function GrilleTravauxDossier({
  lignes = [],
  travauxProposes = [],
  role = "administrateur",
  editable = false,
  editionLignes = [],
  onLignesChange,
  surfaceDefaut = "",
  libelleVerrou = "",
  voirCoutsInternes = false,
  voirBonsCommande = true,
  masquerMargeCg = false,
  dossier = null,
  edition = null,
}) {
  const [selecteur, setSelecteur] = useState({
    familleId: "",
    sousCategorieId: "",
    prestationId: "",
    prestation: null,
    quantite: surfaceDefaut || 1,
    modeSousTraitance: "fourniture_pose",
  });
  const [message, setMessage] = useState("");
  const [deplacementsArtisans, setDeplacementsArtisans] = useState({});
  const referentiel = chargerReferentiel();

  const imprimerBonCommande = (groupe, imprimer) => {
    const parametresDeplacement = deplacementsArtisans[groupe.artisan.id] || {
      distanceAllerKm: null,
      joursDePose: 1,
    };
    const html = htmlBonCommandePourGroupe({
      artisan: groupe.artisan,
      lignes: groupe.lignes,
      dossier,
      edition,
      ...parametresDeplacement,
    });
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    if (imprimer) {
      window.open(url, "_blank", "noopener,noreferrer")?.print?.();
    } else {
      const lien = document.createElement("a");
      lien.href = url;
      lien.download = nomFichierBonCommande(groupe.artisan, dossier);
      document.body.appendChild(lien);
      lien.click();
      lien.remove();
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60000);
  };

  if (editable) {
    const totaux = totauxTravaux(editionLignes);
    const lignesVisibles = masquerMargeCg
      ? totaux.lignes.filter((ligne) => ligne.id !== "brunel-2026-direction-cg" && !/contractant général/i.test(ligne.nom || ""))
      : totaux.lignes;
    const groupesBc = grouperLignesParArtisan(totaux.lignes, referentiel);
    const libelleAffiche = masquerMargeCg
      ? String(libelleVerrou || "").replace(/Marge Contractant Général 5 200 € HT\. ?/g, "")
      : libelleVerrou;
    const verrouille = editionLignes.some((l) => l.verrouillageOfficiel);
    const rentabilite = voirCoutsInternes ? analyserDevis(totaux.lignes, referentiel) : null;
    const ajouter = () => {
      if (!selecteur.prestation) {
        setMessage("Choisissez une prestation avant d’ajouter.");
        return;
      }
      const ligne = creerLigneTravaux({
        familleId: selecteur.familleId,
        categorieId: selecteur.categorieId,
        sousCategorieId: selecteur.sousCategorieId,
        prestation: selecteur.prestation,
        quantite: selecteur.quantite,
      });
      onLignesChange?.(totauxTravaux([...editionLignes, ligne]).lignes);
      setSelecteur((s) => ({ ...s, prestationId: "", prestation: null }));
      setMessage("Ligne ajoutée au devis indicatif — ordre thermique conservé.");
    };
    const modifier = (id, patch) => {
      const next = editionLignes.map((ligne) =>
        ligne.id === id ? calculerLigneTravaux({ ...ligne, ...patch }) : ligne,
      );
      onLignesChange?.(totauxTravaux(next).lignes);
    };
    const supprimer = (id) => {
      onLignesChange?.(totauxTravaux(editionLignes.filter((l) => l.id !== id)).lignes);
    };

    return (
      <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Travaux envisagés</h3>
          <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
            Mode édition actif
          </span>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {verrouille
            ? libelleAffiche ||
              (masquerMargeCg
                ? "Devis n°1 option 1 — 31 733,21 € HT / 33 478,53 € TTC (TVA 5,5 %). Devis n°2 hors ANAH 7 489,20 € HT / 8 238,12 € TTC."
                : "Devis n°1 option 1 — 31 733,21 € HT / 33 478,53 € TTC (TVA 5,5 %). Marge Contractant Général 5 200 € HT. Devis n°2 hors ANAH 7 489,20 € HT / 8 238,12 € TTC.")
            : "Ordre thermique ENERGIA : Combles → Murs → Planchers → Fenêtres → VMC → PAC → ECS → PV. Prix indicatifs catalogue / marché 2026 — non contractuels."}
        </p>

        {verrouille ? null : (
          <div className="mt-4">
            <SelecteurTravauxThermiques
              familleId={selecteur.familleId}
              sousCategorieId={selecteur.sousCategorieId}
              prestationId={selecteur.prestationId}
              quantite={selecteur.quantite}
              modeSousTraitance={selecteur.modeSousTraitance}
              role={role}
              onChange={setSelecteur}
            />
            <button
              type="button"
              onClick={ajouter}
              className="mt-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-400"
            >
              Ajouter au devis
            </button>
            {message ? <p className="mt-2 text-xs text-emerald-200">{message}</p> : null}
          </div>
        )}

        {totaux.lignes.length === 0 ? (
          <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            Aucune prestation saisie. Ajoutez une ligne depuis le catalogue.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-2 py-2">Ordre</th>
                  <th className="px-2 py-2">Poste</th>
                  <th className="px-2 py-2">Artisan RGE</th>
                  <th className="px-2 py-2 text-right">Qté</th>
                  <th className="px-2 py-2 text-right">PU HT</th>
                  <th className="px-2 py-2 text-right">Total HT</th>
                  <th className="px-2 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {lignesVisibles.map((ligne) => {
                  const analyseLigne = voirCoutsInternes
                    ? analyserLigneTravaux(ligne, referentiel)
                    : null;
                  return (
                  <Fragment key={ligne.id}>
                    <tr className={analyseLigne ? classesLigneMarge(analyseLigne.statut) : undefined}>
                      <td className="px-2 py-2 text-emerald-300">{ligne.ordreLabel}</td>
                      <td className="px-2 py-2 text-white">
                        {ligne.nom}
                        {ligne.specifications ? (
                          <span className="mt-0.5 block text-[11px] font-normal text-slate-500">
                            {ligne.specifications}
                          </span>
                        ) : null}
                        {analyseLigne ? (
                          <div className="mt-1">
                            <AlerteMargeLigne analyse={analyseLigne} />
                          </div>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 text-xs text-slate-300">{ligne.artisan || "—"}</td>
                      <td className="px-2 py-2 text-right">
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step={ligne.quantiteFlexible ? 1 : 0.01}
                          disabled={Boolean(ligne.verrouillageOfficiel) && !ligne.quantiteFlexible}
                          value={ligne.quantite}
                          onChange={(event) => modifier(ligne.id, { quantite: event.target.value })}
                        />
                        <span className="ml-1 text-[11px] text-slate-500">{ligne.unite}</span>
                      </td>
                      <td className="px-2 py-2 text-right">
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step="1"
                          value={ligne.puHt}
                          disabled={ligne.verrouillageOfficiel}
                          onChange={(event) => modifier(ligne.id, { puHt: event.target.value })}
                        />
                        {voirCoutsInternes &&
                        analyseLigne?.prixPlancher15Ht != null &&
                        !ligne.verrouillageOfficiel &&
                        (analyseLigne.statut === STATUT_MARGE_PERTE ||
                          (analyseLigne.tauxMarge != null && analyseLigne.tauxMarge < 0.15)) ? (
                          <div className="mt-1">
                            <BoutonSecuriserMarge
                              prixPlancherHt={puHtPlancherDepuisRevientTotal(
                                analyseLigne.coutRevientHt,
                                ligne.quantite,
                              )}
                              onClick={() => {
                                const pu = puHtPlancherDepuisRevientTotal(
                                  analyseLigne.coutRevientHt,
                                  ligne.quantite,
                                );
                                if (pu != null) modifier(ligne.id, { puHt: pu });
                              }}
                            />
                          </div>
                        ) : null}
                      </td>
                      <td className="px-2 py-2 text-right font-medium text-emerald-200">
                        {euro(ligne.totalHt)}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {ligne.verrouillageOfficiel ? (
                          <span className="text-[11px] uppercase tracking-wide text-amber-200/80">FINAL</span>
                        ) : (
                          <button
                            type="button"
                            className="text-xs text-rose-300 hover:text-rose-200"
                            onClick={() => supprimer(ligne.id)}
                          >
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                    {voirBonsCommande ? (
                    <tr>
                      <td colSpan={7} className="px-2 pb-3 pt-0">
                        <SelecteurSousTraitanceLigne
                          ligne={ligne}
                          referentiel={referentiel}
                          voirCoutsInternes={voirCoutsInternes}
                          editable={editable}
                          onChange={(patch) => modifier(ligne.id, patch)}
                        />
                      </td>
                    </tr>
                    ) : null}
                  </Fragment>
                  );
                })}
              </tbody>
            </table>
            {rentabilite ? <WidgetRentabiliteDevis analyse={rentabilite} /> : null}
            <p className="mt-3 text-sm text-slate-300">
              Total : <strong className="text-white">{euro(totaux.totalHt)} HT</strong>
              {" / "}
              <strong className="text-emerald-200">{euro(totaux.totalTtc)} TTC</strong>
              <span className="ml-2 text-xs text-slate-500">
                {totaux.lignes.some((l) => l.id === "v5-poste-solaire-6kwc")
                  ? "TVA mixte 5,5 % (marché Performance) / 20 % (pack solaire)"
                  : totaux.lignes.some((l) => Number(l.tauxTva) >= 0.2)
                    ? masquerMargeCg
                      ? "TVA 5,5 % rénovation énergétique"
                      : "TVA mixte 5,5 % (travaux) / 20 % (contractant général)"
                    : "TVA 5,5 % rénovation énergétique"}
              </span>
            </p>
            {voirBonsCommande && groupesBc.length > 0 ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bons de commande sous-traitance &amp; ordres de service
                </p>
                <ul className="mt-2 space-y-2">
                  {groupesBc.map((groupe) => (
                    <li key={groupe.artisan.id} className="rounded-lg border border-slate-800 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm text-white">
                          {groupe.artisan.raisonSociale}
                          <span className="ml-2 text-xs text-slate-500">{groupe.lignes.length} poste(s)</span>
                        </span>
                        <span className="flex gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-emerald-400/40 px-3 py-1 text-xs font-semibold text-emerald-100"
                            onClick={() => imprimerBonCommande(groupe, false)}
                          >
                            Télécharger
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-semibold text-white"
                            onClick={() => imprimerBonCommande(groupe, true)}
                          >
                            Imprimer
                          </button>
                        </span>
                      </div>
                      {(() => {
                        const deplacement = deplacementsArtisans[groupe.artisan.id] || {
                          distanceAllerKm: null,
                          joursDePose: 1,
                        };
                        const frais = calculerFraisDeplacementArtisanHt(
                          deplacement.distanceAllerKm,
                          deplacement.joursDePose,
                        );
                        return (
                          <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <label className="text-xs text-slate-400">
                              Distance aller simple artisan → chantier (km)
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={deplacement.distanceAllerKm ?? ""}
                                onChange={(event) =>
                                  setDeplacementsArtisans((actuel) => ({
                                    ...actuel,
                                    [groupe.artisan.id]: {
                                      ...deplacement,
                                      distanceAllerKm:
                                        event.target.value === "" ? null : Number(event.target.value),
                                    },
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
                              />
                            </label>
                            <label className="text-xs text-slate-400">
                              Jours de pose
                              <input
                                type="number"
                                min="1"
                                step="1"
                                value={deplacement.joursDePose}
                                onChange={(event) =>
                                  setDeplacementsArtisans((actuel) => ({
                                    ...actuel,
                                    [groupe.artisan.id]: {
                                      ...deplacement,
                                      joursDePose: Math.max(1, Number(event.target.value) || 1),
                                    },
                                  }))
                                }
                                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
                              />
                            </label>
                            <p className="self-end text-xs text-slate-300">
                              {frais && frais.fraisDeplacementHt > 0
                                ? `Frais de déplacement et logistique chantier (> 30 km) : ${euro(frais.fraisDeplacementHt)} HT`
                                : deplacement.distanceAllerKm == null
                                  ? "Saisissez la distance pour calculer les frais."
                                  : "Zone incluse : aucun frais kilométrique."}
                            </p>
                          </div>
                        );
                      })()}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-[11px] text-slate-500">
                  Facturation en autoliquidation de la TVA — Article 283-2 nonies du CGI. Date d’intervention
                  coordonnée par Sylvain LEMBELEMBE (Contractant Général).
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>
    );
  }

  const proposes = Array.isArray(travauxProposes) ? travauxProposes : [];
  const vides = proposes.length === 0 && (!Array.isArray(lignes) || lignes.length === 0);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Travaux envisagés</h3>
      <p className="mt-2 text-xs text-slate-500">
        Fourchette de marché ≠ prix ferme. Les lignes importées restent proposées jusqu’à validation
        distincte. Aucune ligne d’une autre référence documentaire n’est importée.
      </p>

      {vides ? (
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          Aucune prestation saisie — {LIBELLE_DONNEE_MANQUANTE}. Pas de total, pas de prix inventé.
        </p>
      ) : (
        <ul className="mt-4 space-y-2 text-sm text-white">
          {proposes.map((ligne) => (
            <li key={ligne.id} className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2">
              <p className="font-medium">{ligne.prestation}</p>
              <p className="text-xs text-slate-400">
                {ligne.quantite != null ? `${ligne.quantite} ${ligne.unite || ""}` : "quantité à confirmer"}
                {ligne.fourchette || ligne.prixHt == null
                  ? " · fourchette / prix indicatif — non ferme"
                  : ligne.prixHt != null
                    ? ` · ${ligne.prixHt} € HT à vérifier`
                    : ""}
                {" · "}
                {ligne.sourceDocument || ligne.sourcePrix} · {ligne.statut}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
