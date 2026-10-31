import { useState } from "react";
import {
  MENTION_ESTIMATION_INDICATIVE,
  TAMPON_DEVIS_NON_CONTRACTUEL,
  MENTION_DEVIS_VIDE,
  enregistrerBrouillonBrunel,
  enregistrerPrefillBrunel,
  validerParAdministrateurBrunel,
  tenterGenererDocumentFinalBrunel,
  peutGenererDocumentFinal,
  logementManquant,
  lireBaseTravailBrunel,
  marquerAidesVerifieesWebBrunel,
  appliquerDateVerificationAideBrunel,
  mettreSourceVerificationBrunel,
  passerAidesValideesBrunel,
} from "../../lib/crm/brunelWorkingBase";
import { etudierFaisabiliteFeurs } from "../../lib/crm/etudeFaisabilite";
import {
  peutEditerDossierCrm,
  peutValiderDossier,
  peutVoirAlertesIdentite,
  peutVoirDocumentsSensibles,
} from "../../lib/crm/roles";
import FormulaireLogementDossier from "./FormulaireLogementDossier";
import GrilleTravauxDossier from "./GrilleTravauxDossier";
import ImportDocumentDossier from "./ImportDocumentDossier";
import ControleFinalAdmin from "./ControleFinalAdmin";
import ModuleVerificationLive from "../aides/ModuleVerificationLive";
import PiecesDossierEdition from "./PiecesDossierEdition";
import { lireEtatImport } from "../../lib/crm/importDocuments";
import { construireDossierTravailSynthese, MENTION_AIDES_INDICATIVES } from "../../lib/crm/prefillDossier";
import ContratContractantGeneralMaster from "./ContratContractantGeneralMaster";
import { PEREIRA_NERVIEUX_DOSSIER_ID } from "../../lib/crm/pereiraNervieuxOfficiel";

export default function DocumentsTravailDossier({
  dossier,
  role,
  onBaseChange,
  edition,
  onEditionChange,
  voirGed = false,
  voirBonsCommande = true,
  masquerMargeCg = false,
}) {
  const [message, setMessage] = useState("");
  const base = dossier?.workingBase;
  if (!base) return null;

  const manquants = logementManquant(base.logement);
  const generation = peutGenererDocumentFinal(base, role);
  const admin = peutValiderDossier(role);
  const editable = peutEditerDossierCrm(role);
  const voirPiecesSensibles = peutVoirDocumentsSensibles(role) || voirGed;
  const voirAlertes = peutVoirAlertesIdentite(role);
  const etude = etudierFaisabiliteFeurs(base);
  const etatImport = lireEtatImport(dossier.id);
  const synthese = construireDossierTravailSynthese({
    base,
    champs: etatImport.champs,
    documents: etatImport.documents,
    role,
  });

  const enregistrer = () => {
    const next = enregistrerBrouillonBrunel();
    onBaseChange?.(next);
    setMessage("Brouillon enregistré. Aucun document n’a été transmis.");
  };

  const valider = () => {
    const next = validerParAdministrateurBrunel();
    onBaseChange?.(next);
    setMessage(
      "Vérification administrateur enregistrée. La génération finale reste bloquée tant que le logement n’est pas complet. Les aides restent en brouillon tant qu’elles ne sont pas « Vérifiées Web ».",
    );
  };

  const validerAides = () => {
    const resultat = passerAidesValideesBrunel();
    if (!resultat.ok) {
      setMessage(resultat.raisons.join(" "));
      return;
    }
    onBaseChange?.(resultat.base);
    setMessage("Aides passées au statut Validé après marquage Vérifiées Web.");
  };

  const generer = () => {
    const resultat = tenterGenererDocumentFinalBrunel(role);
    setMessage(resultat.raisons.join(" "));
  };

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
        Base de travail — non publiée
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Documents de travail</h2>
        <ContratContractantGeneralMaster dossier={dossier} edition={edition} compact afficherContrat={!masquerMargeCg} />
      </div>
      <p className="mt-2 text-sm text-amber-100">{base.mention || MENTION_ESTIMATION_INDICATIVE}</p>

      {voirAlertes && base.alertes?.length ? (
        <ul className="mt-4 space-y-2">
          {base.alertes.map((alerte) => (
            <li
              key={alerte}
              className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100"
            >
              {alerte}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Audit</p>
          <p className="mt-1 font-medium text-white">Brouillon</p>
          <p className="mt-1 text-xs text-slate-400">Préparation interne — non constitutif d’un DPE officiel.</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Devis</p>
          <p className="mt-1 font-medium text-amber-100">{TAMPON_DEVIS_NON_CONTRACTUEL}</p>
          <p className="mt-1 text-xs text-slate-400">Aucune ligne, aucun total, aucun prix ferme.</p>
        </article>
        <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Rapport</p>
          <p className="mt-1 font-medium text-white">Non généré</p>
          <p className="mt-1 text-xs text-slate-400">{base.documents.rapport.raison}</p>
        </article>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-slate-400">{MENTION_DEVIS_VIDE}</p>

      <div className="mt-6">
        <FormulaireLogementDossier
          logement={base.logement}
          sources={base.logementSources}
          extras={base.logementExtras}
          editable={editable}
          onChange={(logement) => {
            const next = enregistrerPrefillBrunel({ logement });
            onBaseChange?.(next);
          }}
        />
      </div>

      <div className="mt-4">
        <GrilleTravauxDossier
          lignes={base.documents.devis.lignes}
          travauxProposes={base.travauxProposes}
          role={role}
          editable={editable}
          editionLignes={edition?.travaux || []}
          onLignesChange={(travaux) => onEditionChange?.({ travaux })}
          surfaceDefaut={edition?.client?.surfaceHabitable || ""}
          voirBonsCommande={voirBonsCommande}
          masquerMargeCg={masquerMargeCg}
          libelleVerrou={
            dossier?.id === PEREIRA_NERVIEUX_DOSSIER_ID
              ? "Contrat SANS ITI — 8 postes verrouillés (menuiseries 19,38 m², combles 60 m², plancher 19 m², VMC SF hygro, PAC air/eau HT chauffage seul, CET 250 L, dépose fioul + désembouage DTU 65.16 1 500 € HT, CG TVA 20 %). Hors rampants, hors Velux, hors ITI."
              : ""
          }
        />
      </div>

      {base.aidesVerification ? (
        <div className="mt-4">
          <ModuleVerificationLive
            verification={base.aidesVerification}
            admin={admin}
            onDateLigne={(ligneId, date) => onBaseChange?.(appliquerDateVerificationAideBrunel(ligneId, date))}
            onMarquerVerifieesWeb={(url) => onBaseChange?.(marquerAidesVerifieesWebBrunel(url))}
            onSourceUrl={(url) => onBaseChange?.(mettreSourceVerificationBrunel(url))}
          />
        </div>
      ) : null}

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Étude de faisabilité préparatoire
        </h3>
        <p className="mt-2 text-sm text-amber-100">
          {etude.titre} — {etude.statut} — niveau de confiance {etude.niveauConfiance}.
        </p>
        <p className="mt-2 text-xs text-slate-400">{etude.travauxPotentiels}</p>
        <p className="mt-2 text-xs text-slate-400">{etude.dependances}</p>
        <p className="mt-2 text-xs text-slate-400">
          Visite sur site nécessaire. Devis RGE à obtenir. Aucune aide chiffrée tant que le logement
          Feurs n’est pas complet.
        </p>
        {voirAlertes ? (
          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-amber-100/90">
            {etude.reserves.map((reserve) => (
              <li key={reserve}>{reserve}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            Données manquantes : {etude.manquantes.length} champ(s) logement.
          </p>
        )}
      </section>

      <section className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">Tableau de synthèse</h3>
        <p className="mt-2 text-sm text-white">Statut : {synthese.statut}</p>
        <ul className="mt-2 grid gap-1 text-xs text-slate-300 sm:grid-cols-2">
          <li>Documents reçus : {synthese.documentsRecus}</li>
          <li>Documents analysés : {synthese.documentsAnalyses}</li>
          <li>Données extraites : {synthese.donneesExtraites}</li>
          <li>Données validées : {synthese.donneesValidees}</li>
          <li>Contradictions : {synthese.donneesContradictoires}</li>
          <li>Travaux proposés : {synthese.travauxProposes.length}</li>
          <li>Aides vérifiées web : {synthese.aidesVerifiees ? "oui" : "non"}</li>
          <li>Financement simulé : {synthese.financementSimule ? "indicatif" : "non calculable"}</li>
        </ul>
        <p className="mt-2 text-xs text-slate-500">{MENTION_AIDES_INDICATIVES}</p>
        {synthese.donneesManquantes.length ? (
          <p className="mt-2 text-xs text-amber-100">
            Champs encore manquants : {synthese.donneesManquantes.join(", ")}
          </p>
        ) : null}
        <p className="mt-2 text-xs text-slate-400">Prochaines actions : {synthese.prochainesActions.join(" · ")}</p>
      </section>

      {admin ? (
        <ImportDocumentDossier
          dossier={dossier}
          role={role}
          onChange={() => onBaseChange?.(lireBaseTravailBrunel())}
        />
      ) : null}

      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-300">Pièces du dossier</h3>
      {edition ? (
        <PiecesDossierEdition
          pieces={edition.pieces}
          onChange={(pieces) => onEditionChange?.({ pieces })}
          editable={editable}
          voirFiscal={voirPiecesSensibles}
          peutValider={admin}
        />
      ) : (
      <ul className="mt-2 space-y-1 text-sm text-slate-300">
        {(base.pieces ?? [])
          .filter((piece) => voirPiecesSensibles || !piece.fiscal)
          .map((piece) => (
            <li key={piece.type}>{piece.libellePublic}</li>
          ))}
      </ul>
      )}

      {admin ? (
        <div className="mt-6 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4">
          <h3 className="text-sm font-semibold text-orange-100">Validation humaine obligatoire</h3>
          <p className="mt-2 text-xs text-orange-50/90">
            Contrôles bloquants : {manquants.length} champ(s) logement manquant(s)
            {base.validationHumaine.valideAdmin ? " · vérification admin enregistrée" : " · admin non validé"}.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-orange-50/80">
            {generation.raisons.map((raison) => (
              <li key={raison}>{raison}</li>
            ))}
          </ul>
          {admin ? (
            <ControleFinalAdmin
              dossier={dossier}
              etatImport={etatImport}
              role={role}
              onBrouillon={enregistrer}
              onValider={valider}
            />
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={enregistrer}
              className="rounded-xl border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 hover:border-slate-400"
            >
              Enregistrer comme brouillon
            </button>
            <button
              type="button"
              onClick={valider}
              className="rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-3 py-2 text-xs font-semibold text-emerald-100 hover:border-emerald-400"
            >
              Valider par l’administrateur
            </button>
            <button
              type="button"
              onClick={validerAides}
              disabled={!base.aidesVerification?.aides_verifiees_web}
              title={
                base.aidesVerification?.aides_verifiees_web
                  ? "Passer les aides de Brouillon à Validé"
                  : "Marquer d’abord les aides « Vérifiées Web »"
              }
              className="rounded-xl border border-sky-500/50 bg-sky-500/15 px-3 py-2 text-xs font-semibold text-sky-100 hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Valider les aides
            </button>
            <button
              type="button"
              disabled
              title={generation.raisons.join(" ")}
              onClick={generer}
              className="cursor-not-allowed rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-xs font-semibold text-slate-500"
            >
              Générer le document final
            </button>
          </div>
          {message ? <p className="mt-3 text-xs text-emerald-200">{message}</p> : null}
        </div>
      ) : (
        <p className="mt-6 text-xs text-slate-500">
          Les documents de travail ne sont pas transmissibles. Seul l’administrateur peut valider ou
          débloquer une génération.
        </p>
      )}
    </section>
  );
}
