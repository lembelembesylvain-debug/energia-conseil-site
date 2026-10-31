import { useEffect, useState } from "react";
import BadgesOfficielsEnergia from "./BadgesOfficielsEnergia";
import BoutonAuditRapportDevis from "./BoutonAuditRapportDevis";
import { PAGES_TEST_LOCALES } from "../../lib/crm/crmDataService";
import { euro } from "../../lib/crm/mockData";
import { financesPourRole } from "../../lib/crm/finances";
import { BRUNEL_DOSSIER_ID, enregistrerPrefillBrunel } from "../../lib/crm/brunelWorkingBase";
import { PEREIRA_NERVIEUX_DOSSIER_ID } from "../../lib/crm/pereiraNervieuxOfficiel";
import { GILBERTAS_DOSSIER_ID } from "../../lib/crm/gilbertasClermontOfficiel.js";
import { CLOISON_SDB_DOSSIER_ID } from "../../lib/crm/cloisonSdbOfficiel.js";
import { mentionLegaleAidesVerifiees } from "../../lib/aides/verificationLive.js";
import RecapDevisClientDirect from "./RecapDevisClientDirect.jsx";
import FicheGilbertas from "./FicheGilbertas.jsx";
import FicheCloisonSdb from "./FicheCloisonSdb.jsx";
import FicheFariss, { GaleriePhotosFariss } from "./FicheFariss.jsx";
import FicheOussara from "./FicheOussara.jsx";
import FicheOussaraCombles from "./FicheOussaraCombles.jsx";
import { FARISS_DOSSIER_ID } from "../../lib/crm/farissLaRicamarieOfficiel.js";
import { OUSSARA_DOSSIER_ID } from "../../lib/crm/oussaraColombierOfficiel.js";
import { OUSSARA_COMBLES_DOSSIER_ID } from "../../lib/crm/oussaraComblesOfficiel.js";
import {
  ROLE_ADMIN,
  estPartenaireApporteur,
  peutEditerDossierCrm,
  peutEcraserAidesIndicatives,
  peutValiderDossier,
  peutVoirAlertesIdentite,
  peutVoirDocumentsSensibles,
  peutVoirOngletFinances,
  peutVoirRfr,
} from "../../lib/crm/roles";
import {
  MENTION_AIDES_INDICATIVES,
  MENTION_FINANCEMENT_INDICATIF,
  preparerAidesIndicatives,
  preparerFinancementIndicatif,
} from "../../lib/crm/prefillDossier";
import {
  calculerFinancesInternes,
  lireEditionDossier,
  enregistrerEditionDossier,
  regionDepuisCodePostal,
  sanitiserEditionPourRole,
} from "../../lib/crm/editionDossier";
import OngletFinances from "./OngletFinances";
import RepartitionMarges from "./RepartitionMarges";
import DocumentsTravailDossier from "./DocumentsTravailDossier";
import FormulaireLogementDossier from "./FormulaireLogementDossier";
import GrilleTravauxDossier from "./GrilleTravauxDossier";
import ImportDocumentDossier from "./ImportDocumentDossier";
import FicheClientEdition from "./FicheClientEdition";
import QualificationFinanciereBloc from "./QualificationFinanciereBloc";
import DevisDoubleOption from "./DevisDoubleOption";
import PhasageEtancheChantier from "./PhasageEtancheChantier";
import {
  analyserEcartBudget,
  calculerDoubleOption,
  montantChiffreComplet,
  qualificationComplete,
} from "../../lib/crm/paradesAntiFuite";
import AidesIndicativesEdition from "./AidesIndicativesEdition";
import PlanFinancementEdition from "./PlanFinancementEdition";
import PiecesDossierEdition from "./PiecesDossierEdition";
import Projection3DWow from "../Projection3DWow";
import SimulateurSolaireTesla from "./SimulateurSolaireTesla";
import TunnelFinancierTechnique from "./TunnelFinancierTechnique";
import ContratContractantGeneralMaster from "./ContratContractantGeneralMaster";
import SelecteurOffreBrunel, { GalerieProjectionsBrunel } from "./SelecteurOffreBrunel";
import SelecteurOffrePereira from "./SelecteurOffrePereira";
import FicheMarcheBrunel from "./FicheMarcheBrunel";
import BilanEnergetiqueAuditBrunel from "./BilanEnergetiqueAuditBrunel";
import {
  AUDIT_REGLEMENTAIRE_BRUNEL,
  CHEMIN_AUDIT_AER_BRUNEL,
  VUE_HUB_SUPER_ADMIN,
  droitsVueHub,
  libelleHonorairesAmoHubAdmin,
} from "../../lib/crm/operationnelCrm";
import { libelleVerrouMarcheBrunel, lignesMarcheBrunel } from "../../lib/crm/brunelMarcheOfficiel2026";
import OngletPhotosChantierPereira from "./OngletPhotosChantierPereira";
import PilotageApporteurJalon from "./PilotageApporteurJalon";
import {
  lireSniperSession,
  sauvegarderEtatProptech,
} from "../../lib/crm/sauvegardeProptech";
import { calculerTunnelProptech } from "../../lib/crm/tunnelProptech";

const ORDRE_TRAVAUX = [
  "Isolation combles",
  "Isolation murs (ITE ou ITI)",
  "Isolation planchers",
  "Fenêtres",
  "VMC",
  "PAC (dimensionnement post-isolation)",
  "Ballon thermodynamique",
  "Photovoltaïque",
];

function BoutonTablette({ children, onClick, actif }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-16 w-full rounded-2xl px-4 text-base font-semibold shadow-lg transition sm:text-lg ${
        actif
          ? "bg-gradient-to-r from-emerald-600 to-teal-500 text-white"
          : "border border-slate-700 bg-slate-900/80 text-slate-100 hover:border-emerald-500/50"
      }`}
    >
      {children}
    </button>
  );
}

export default function PresentationTablette({
  vue,
  onVue,
  dossier,
  tablette,
  voirMargesInternes = false,
  role = "commercial",
  commercialId = "",
  onWorkingBaseChange,
  onOperationnelChange,
  dossiersDisponibles = [],
  onChangerDossier,
  vueHub = VUE_HUB_SUPER_ADMIN,
}) {
  const pad = tablette ? "p-5 sm:p-7" : "p-5";
  const titre = tablette ? "text-2xl sm:text-3xl" : "text-xl";
  const travaux = Array.isArray(dossier?.travaux) ? [...dossier.travaux].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0)) : [];
  const estDossierTest = dossier?.source === "test-local";
  const aBaseTravail = Boolean(dossier?.workingBase);
  const droitsHub = droitsVueHub(vueHub);
  const voirFinances = peutVoirOngletFinances(role) && droitsHub.afficherTresorerieInterne;
  const voirMarges = droitsHub.afficherMargeCg && voirMargesInternes;
  const roleFinances = voirMargesInternes && vueHub === VUE_HUB_SUPER_ADMIN ? ROLE_ADMIN : role;
  const voirAlertes = peutVoirAlertesIdentite(role);
  const editable = Boolean(dossier?.id) && peutEditerDossierCrm(role);
  const peutEcraser = peutEcraserAidesIndicatives(role);
  const voirFiscal = peutVoirDocumentsSensibles(role);
  const admin = peutValiderDossier(role);
  const [editionBrute, setEditionBrute] = useState(() => lireEditionDossier(dossier?.id, dossier));

  useEffect(() => {
    setEditionBrute(lireEditionDossier(dossier?.id, dossier));
  }, [dossier?.id]);

  useEffect(() => {
    if (vue === "etat-lieux-fariss" && dossier?.id !== FARISS_DOSSIER_ID) onVue?.("fiche");
  }, [vue, dossier?.id, onVue]);

  const edition = sanitiserEditionPourRole(editionBrute, role, { voirPiecesSensibles: voirFiscal });
  const editionActive = editable ? editionBrute : edition;
  const estBrunel = dossier?.id === BRUNEL_DOSSIER_ID;
  const estGilbertas = dossier?.id === GILBERTAS_DOSSIER_ID;
  const estCloisonSdb = dossier?.id === CLOISON_SDB_DOSSIER_ID;
  const estFariss = dossier?.id === FARISS_DOSSIER_ID;
  const estOussara = dossier?.id === OUSSARA_DOSSIER_ID;
  const estOussaraCombles = dossier?.id === OUSSARA_COMBLES_DOSSIER_ID;
  const lignesBrunel = estBrunel ? lignesMarcheBrunel(editionActive?.offreActive) : null;
  const lignesParade = estBrunel ? lignesBrunel || [] : editionActive?.travaux || [];
  const calculParade = calculerDoubleOption(lignesParade, editionActive?.phasage, { masquerPhase2: true });
  const montantCompletParade = montantChiffreComplet(lignesParade, editionActive?.phasage, dossier?.caTtc);
  const qualificationOk = qualificationComplete(editionActive?.qualification);
  const ecartParade = analyserEcartBudget(editionActive?.qualification?.budgetMaxTtc, montantCompletParade);
  const libelleVerrou =
    dossier?.id === PEREIRA_NERVIEUX_DOSSIER_ID
            ? "Contrat SANS ITI — 8 postes verrouillés (menuiseries 19,38 m², combles 60 m², plancher 19 m², VMC SF hygro, PAC air/eau HT chauffage seul, CET 250 L, dépose fioul + désembouage DTU 65.16 1 500 € HT, CG TVA 20 %). Profil Violet, RFR 27 522 €. Hors rampants, hors Velux, hors ITI. Maison 164 m² — Nervieux."
      : dossier?.id === BRUNEL_DOSSIER_ID
        ? libelleVerrouMarcheBrunel(editionActive?.offreActive)
        : "";
  const patcher = (partial) => {
    if (!dossier?.id || !editable) return;
    const next = enregistrerEditionDossier(dossier.id, partial, dossier);
    setEditionBrute(next);
    onWorkingBaseChange?.();
  };

  useEffect(() => {
    if (!dossier?.id || editionBrute.aides.region) return;
    const region = regionDepuisCodePostal(dossier.codePostal || dossier.workingBase?.client?.codePostal);
    if (region && region !== "autre") {
      patcher({ aides: { ...editionBrute.aides, region } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dossier?.id]);

  useEffect(() => {
    if (!dossier?.id || !editable) return undefined;
    const timer = window.setTimeout(() => {
      const sniper = lireSniperSession();
      const tunnel = calculerTunnelProptech(editionBrute, {
        prixM2Constate: editionBrute.valorisation?.prixM2Constate || sniper?.prixM2Applique || sniper?.dvf?.prixM2Median,
        dpeActuel: editionBrute.valorisation?.dpeActuel,
      });
      sauvegarderEtatProptech({
        dossierId: dossier.id,
        edition: editionBrute,
        role,
        sniper,
        tunnel,
      });
    }, 900);
    return () => window.clearTimeout(timer);
  }, [dossier?.id, editionBrute, role, editable]);

  const sniperSession = typeof window !== "undefined" ? lireSniperSession() : null;
  const prixM2Tunnel =
    editionActive.valorisation?.prixM2Constate ||
    sniperSession?.prixM2Applique ||
    sniperSession?.dvf?.prixM2Median ||
    null;
  const appliquerEcoPtz = (auto) => {
    patcher({
      financement: {
        ...editionActive.financement,
        ecoPtzMontant: auto.montant,
        ecoPtzDuree: auto.duree,
      },
    });
  };

  const vueFinances = voirFinances
    ? financesPourRole(dossier?.finances, role, { commercialId })
    : null;
  const financesEdition = voirFinances ? calculerFinancesInternes(editionBrute, roleFinances) : null;
  const aidesDossier = aBaseTravail ? preparerAidesIndicatives(dossier.workingBase) : null;
  const financementDossier = aBaseTravail ? preparerFinancementIndicatif(dossier.workingBase) : null;

  return (
    <div className="space-y-4">
      <BadgesOfficielsEnergia />
      {dossier ? (
        <div className="rounded-2xl border border-cyan-400/30 bg-slate-950/70 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
            Document d’élite du dossier
          </p>
          <div className="mt-2">
            <BoutonAuditRapportDevis dossier={dossier} edition={editionActive} />
          </div>
        </div>
      ) : null}
      <div
        className={`grid gap-3 ${
          tablette
            ? voirFinances
              ? "sm:grid-cols-2 lg:grid-cols-7"
              : "sm:grid-cols-2 lg:grid-cols-6"
            : voirFinances
              ? "sm:grid-cols-7"
              : "sm:grid-cols-6"
        }`}
      >
        <BoutonTablette actif={vue === "fiche"} onClick={() => onVue("fiche")}>
          Fiche client
        </BoutonTablette>
        <BoutonTablette actif={vue === "travaux"} onClick={() => onVue("travaux")}>
          Travaux{qualificationOk ? "" : " · à qualifier"}
        </BoutonTablette>
        <BoutonTablette actif={vue === "aides"} onClick={() => onVue("aides")}>
          Aides indicatives
        </BoutonTablette>
        <BoutonTablette actif={vue === "financement"} onClick={() => onVue("financement")}>
          Financement
        </BoutonTablette>
        {dossier ? (
          <BoutonTablette actif={vue === "documents-travail"} onClick={() => onVue("documents-travail")}>
            Dossier de travail
          </BoutonTablette>
        ) : null}
        {dossier ? (
          <BoutonTablette actif={vue === "projection-wow"} onClick={() => onVue("projection-wow")}>
            Projection WOW
          </BoutonTablette>
        ) : null}
        {dossier?.id === PEREIRA_NERVIEUX_DOSSIER_ID ? (
          <BoutonTablette actif={vue === "photos-chantier"} onClick={() => onVue("photos-chantier")}>
            Photos chantier
          </BoutonTablette>
        ) : null}
        {estFariss ? (
          <BoutonTablette actif={vue === "etat-lieux-fariss"} onClick={() => onVue("etat-lieux-fariss")}>
            État des lieux / REX technique
          </BoutonTablette>
        ) : null}
        {dossier?.id === BRUNEL_DOSSIER_ID ? (
          <BoutonTablette actif={vue === "bilan-audit"} onClick={() => onVue("bilan-audit")}>
            Bilan énergétique
          </BoutonTablette>
        ) : null}
        {voirFinances && droitsHub.afficherTresorerieInterne ? (
          <BoutonTablette actif={vue === "finances"} onClick={() => onVue("finances")}>
            Finances
          </BoutonTablette>
        ) : null}
      </div>
      {dossiersDisponibles.length > 1 && onChangerDossier ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-emerald-500/30 bg-slate-950/60 px-4 py-3 text-sm text-slate-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">Dossier actif</span>
            {dossiersDisponibles.some((item) => item.id === BRUNEL_DOSSIER_ID) ||
            dossiersDisponibles.some((item) => item.id === PEREIRA_NERVIEUX_DOSSIER_ID) ||
            dossiersDisponibles.some((item) => item.id === GILBERTAS_DOSSIER_ID) ||
            dossiersDisponibles.some((item) => item.id === CLOISON_SDB_DOSSIER_ID) ||
            dossiersDisponibles.some((item) => item.id === FARISS_DOSSIER_ID) ||
            dossiersDisponibles.some((item) => item.id === OUSSARA_DOSSIER_ID) ||
            dossiersDisponibles.some((item) => item.id === OUSSARA_COMBLES_DOSSIER_ID) ? (
              <div className="flex flex-wrap gap-2">
                {dossiersDisponibles.some((item) => item.id === BRUNEL_DOSSIER_ID) ? (
                  <button
                    type="button"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === BRUNEL_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(BRUNEL_DOSSIER_ID)}
                  >
                    Brunel
                  </button>
                ) : null}
                {dossiersDisponibles.some((item) => item.id === PEREIRA_NERVIEUX_DOSSIER_ID) ? (
                  <button
                    type="button"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === PEREIRA_NERVIEUX_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(PEREIRA_NERVIEUX_DOSSIER_ID)}
                  >
                    Pereira Nervieux
                  </button>
                ) : null}
                {dossiersDisponibles.some((item) => item.id === GILBERTAS_DOSSIER_ID) ? (
                  <button
                    type="button"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === GILBERTAS_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(GILBERTAS_DOSSIER_ID)}
                  >
                    Gilbertas
                  </button>
                ) : null}
                {dossiersDisponibles.some((item) => item.id === CLOISON_SDB_DOSSIER_ID) ? (
                  <button
                    type="button"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === CLOISON_SDB_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(CLOISON_SDB_DOSSIER_ID)}
                  >
                    Cloison SDB
                  </button>
                ) : null}
                {dossiersDisponibles.some((item) => item.id === FARISS_DOSSIER_ID) ? (
                  <button
                    type="button"
                    data-testid="raccourci-dossier-fariss"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === FARISS_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(FARISS_DOSSIER_ID)}
                  >
                    Fariss
                  </button>
                ) : null}
                {dossiersDisponibles.some((item) => item.id === OUSSARA_DOSSIER_ID) ? (
                  <button
                    type="button"
                    data-testid="raccourci-dossier-oussara"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === OUSSARA_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(OUSSARA_DOSSIER_ID)}
                  >
                    Oussara
                  </button>
                ) : null}
                {dossiersDisponibles.some((item) => item.id === OUSSARA_COMBLES_DOSSIER_ID) ? (
                  <button
                    type="button"
                    data-testid="raccourci-dossier-oussara-combles"
                    className={`min-h-10 rounded-xl px-3 text-xs font-semibold ${
                      dossier?.id === OUSSARA_COMBLES_DOSSIER_ID
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-700 bg-slate-900 text-slate-200 hover:border-emerald-500/50"
                    }`}
                    onClick={() => onChangerDossier(OUSSARA_COMBLES_DOSSIER_ID)}
                  >
                    Oussara Combles
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <label className="flex flex-wrap items-center gap-3">
            <select
              className="min-h-11 min-w-[16rem] flex-1 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
              value={dossier?.id || ""}
              onChange={(event) => onChangerDossier(event.target.value)}
            >
              {dossiersDisponibles.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom} — {item.ville || item.codePostal || item.id}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {dossier?.id ? (
        <div className="flex flex-wrap items-center justify-end gap-3">
          {dossier.id === BRUNEL_DOSSIER_ID ? (
            <div className="w-full max-w-3xl">
              <SelecteurOffreBrunel
                offreActive={editionActive?.offreActive}
                editable={editable}
                afficherMargeCg={voirMarges}
                onChange={(offreActive) => patcher({ offreActive })}
              />
            </div>
          ) : null}
          {dossier.id === PEREIRA_NERVIEUX_DOSSIER_ID ? (
            <div className="w-full">
              <SelecteurOffrePereira
                offreActive={editionActive?.offrePereira}
                editable={editable}
                onChange={(offrePereira) => patcher({ offrePereira })}
              />
            </div>
          ) : null}
          <ContratContractantGeneralMaster dossier={dossier} edition={editionActive} afficherContrat={droitsHub.afficherMargeCg} />
        </div>
      ) : null}
      {estBrunel && droitsHub.afficherAuditMar ? (
        <div className="grid gap-3 sm:grid-cols-2" data-testid="bandeau-amo-brunel">
          <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-4 text-sm text-sky-50">
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-200">Audit MAR</p>
            <p className="mt-1 text-lg font-bold text-white">{AUDIT_REGLEMENTAIRE_BRUNEL.numero}</p>
            <p className="mt-1 text-xs text-sky-100">Cabinet C2ET — Antoine Baratier — 52 pages</p>
            <a
              href={CHEMIN_AUDIT_AER_BRUNEL}
              download="BRUNEL_1_1_1_0_AER.pdf"
              className="mt-3 inline-block rounded-xl bg-[#1b4332] px-3 py-2 text-xs font-semibold text-white"
            >
              Télécharger l'audit PDF
            </a>
          </div>
          {droitsHub.afficherHonorairesHubAdmin ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-50" data-testid="honoraires-hub-admin">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Honoraires AMO Hub Admin</p>
              <p className="mt-1 text-sm font-semibold leading-relaxed text-white">{libelleHonorairesAmoHubAdmin()}</p>
            {droitsHub.afficherRfr ? (
              <p className="mt-2 text-sm text-white" data-testid="rfr-vue-amo">
                RFR déclaré {dossier.libelleRfr || (dossier.workingBase?.rfr?.montant ? euro(dossier.workingBase.rfr.montant) : euro(20216))} — profil fiscal Violet
              </p>
            ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {vue === "fiche" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={`font-semibold text-white ${titre}`}>Fiche client</h2>
            {editable ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                Mode édition actif
              </span>
            ) : null}
          </div>
          {editionActive?.mentionsJuridiques?.length ? (
            <p className="mt-3 rounded-xl border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-orange-100">
              {editionActive.mentionsJuridiques[0]}
            </p>
          ) : null}
          {estBrunel ? (
            <FicheMarcheBrunel
              offreActive={editionActive?.offreActive}
              afficherBareme
              afficherMargeCg={voirMarges}
            />
          ) : null}
          {estGilbertas ? <FicheGilbertas afficherMargeCg={voirMarges} /> : null}
          {estCloisonSdb ? <FicheCloisonSdb afficherMargeCg={voirMarges} /> : null}
          {estFariss ? <FicheFariss /> : null}
          {estOussara ? <FicheOussara afficherMargeCg={voirMarges} /> : null}
          {estOussaraCombles ? <FicheOussaraCombles /> : null}
          {!estBrunel && !estGilbertas && !estCloisonSdb && !estFariss && dossier?.devisIndicatif ? (
            <RecapDevisClientDirect devis={dossier.devisIndicatif} afficherMargeCg={voirMarges} />
          ) : null}
          {!estBrunel && editionActive?.valorisation?.dpeCible ? (
            <p className="mt-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
              Cible indicative : DPE {editionActive.valorisation.dpeActuel} → {editionActive.valorisation.dpeCible}
              {editionActive.valorisation.gainClasses ? ` (saut de ${editionActive.valorisation.gainClasses} classes)` : ""}
              {editionActive.valorisation.cepInitial && editionActive.valorisation.cepCible
                ? ` — CEP ${editionActive.valorisation.cepInitial} → ${editionActive.valorisation.cepCible} kWhEP/m².an`
                : ""}
              {editionActive.valorisation.gainEpPct ? ` (−${editionActive.valorisation.gainEpPct} % EP)` : ""}.
              {editionActive.valorisation.factureAvantMin && editionActive.valorisation.factureAvantMax
                ? ` Facture actuelle ${editionActive.valorisation.factureAvantMin} € à ${editionActive.valorisation.factureAvantMax} € / an.`
                : ""}{" "}
              Hors isolation des murs, hors rampants, hors Velux. Estimation à titre indicatif.
            </p>
          ) : null}
          {editionActive?.prestataire ? (
            <p className="mt-2 text-xs text-slate-400">
              Prestataire : {editionActive.prestataire.nom} — {editionActive.prestataire.forme} —{" "}
              {editionActive.prestataire.adresse} — SIRET {editionActive.prestataire.siret} — RCS{" "}
              {editionActive.prestataire.rcs} — TVA {editionActive.prestataire.tva} — Marque INPI n°
              {editionActive.prestataire.inpi}. Coordination : {editionActive.mar?.coordination} —{" "}
              {editionActive.mar?.nom}.
            </p>
          ) : null}
          {dossier ? (
            <>
              <FicheClientEdition
                client={editionActive.client}
                dossier={dossier}
                editable={editable}
                onChange={(client) => patcher({ client })}
              />
              <QualificationFinanciereBloc
                qualification={editionActive.qualification}
                editable={editable}
                montantChiffreTtc={montantCompletParade}
                onChange={(qualification) => patcher({ qualification })}
              />
              <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                {dossier.auditId ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Identifiant d’audit</dt>
                    <dd className="mt-1 font-mono text-sm text-sky-200">{dossier.auditId}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Localisation</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.ville || "Non renseignée"}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-slate-500">Statut dossier</dt>
                  <dd className="mt-1 text-lg text-white">{dossier.statut}</dd>
                </div>
                <PilotageApporteurJalon
                  dossier={dossier}
                  editableApporteur={editable && !estPartenaireApporteur(role) && dossier.source !== "test-local"}
                  editableJalon={editable && !estPartenaireApporteur(role) && dossier.source === "manuel"}
                  voirPartEnergia={!estPartenaireApporteur(role) && droitsHub.afficherCommissionsCommerciales}
                  voirCommissions={droitsHub.afficherCommissionsCommerciales}
                  onChange={(patch) => onOperationnelChange?.(dossier.id, patch)}
                />
                {(peutVoirRfr(role) || droitsHub.afficherRfr) && (dossier.libelleRfr || dossier.workingBase?.rfr?.montant) ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Revenu fiscal de référence</dt>
                    <dd className="mt-1 text-lg text-amber-100">
                      {dossier.libelleRfr || euro(dossier.workingBase.rfr.montant)}
                    </dd>
                  </div>
                ) : null}
                {voirAlertes && dossier.alertes?.length ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Alertes de vérification</dt>
                    <dd className="mt-1 space-y-1">
                      {dossier.alertes.map((alerte) => (
                        <p key={alerte} className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                          {alerte}
                        </p>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {dossier.email ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Email</dt>
                    <dd className="mt-1 text-lg text-white">{dossier.email}</dd>
                  </div>
                ) : null}
                {dossier.telephone ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-slate-500">Téléphone</dt>
                    <dd className="mt-1 text-lg text-white">{dossier.telephone}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : (
            <p className="mt-4 text-sm leading-relaxed text-slate-300">
              Aucun dossier n’est sélectionné. Ouvrez un projet depuis le tableau de bord, ou une
              page de test locale ci-dessous.
            </p>
          )}
          {estDossierTest ? (
            <p className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              Jeu de test local — hors production. Ne pas présenter comme un dossier signé.
            </p>
          ) : null}
          {aBaseTravail ? (
            <div className="mt-6">
              <FormulaireLogementDossier
                logement={dossier.workingBase.logement}
                sources={dossier.workingBase.logementSources}
                extras={dossier.workingBase.logementExtras}
                editable={editable}
                onChange={(logement) => {
                  if (dossier.id === BRUNEL_DOSSIER_ID) {
                    onWorkingBaseChange?.(enregistrerPrefillBrunel({ logement }));
                  }
                }}
              />
            </div>
          ) : null}
          {dossier ? <ImportDocumentDossier dossier={dossier} role={role} onChange={onWorkingBaseChange} /> : null}
          {!aBaseTravail ? (
          <ul className="mt-5 space-y-2">
            {PAGES_TEST_LOCALES.map((page) => (
              <li key={page.id}>
                <a
                  href={page.href}
                  className={`block rounded-xl border border-slate-700 bg-slate-950/60 text-emerald-200 hover:border-emerald-500/40 ${
                    tablette ? "min-h-14 px-4 py-4 text-base" : "px-4 py-3 text-sm"
                  }`}
                >
                  {page.label}
                  <span className="mt-0.5 block text-xs text-slate-500">{page.hint}</span>
                </a>
              </li>
            ))}
          </ul>
          ) : null}
        </section>
      ) : null}

      {vue === "travaux" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className={`font-semibold text-white ${titre}`}>Présentation des travaux</h2>
            <ContratContractantGeneralMaster dossier={dossier} edition={editionActive} compact afficherContrat={droitsHub.afficherMargeCg} />
          </div>
          {dossier?.id === BRUNEL_DOSSIER_ID ? (
            <div className="mt-5 space-y-4">
              <SelecteurOffreBrunel
                offreActive={editionActive?.offreActive}
                editable={editable}
                afficherMargeCg={voirMarges}
                onChange={(offreActive) => patcher({ offreActive })}
              />
              <GalerieProjectionsBrunel />
            </div>
          ) : null}
          {qualificationOk ? (
            <div className="mt-5 space-y-4">
              <PhasageEtancheChantier
                lignes={lignesParade}
                phasage={editionActive.phasage}
                editable={editable}
                onPhasage={(phasage) => patcher({ phasage })}
              />
              <DevisDoubleOption
                calcul={calculParade}
                editable={editable}
                optionRetenue={editionActive.phasage?.optionRetenue || ""}
                onOptionRetenue={(optionRetenue) =>
                  patcher({ phasage: { ...editionActive.phasage, optionRetenue } })
                }
                onAffecter={(id, patch) => {
                  const phasage = {
                    ...editionActive.phasage,
                    packs: { ...(editionActive.phasage?.packs || {}) },
                    phases: { ...(editionActive.phasage?.phases || {}) },
                  };
                  if (patch.pack) phasage.packs[id] = patch.pack;
                  if (patch.phase) phasage.phases[id] = patch.phase;
                  patcher({ phasage });
                }}
                recadrageRequis={ecartParade.alerte}
                recadrageOral={Boolean(editionActive.qualification?.recadrageOral)}
                onRecadrageOral={(recadrageOral) =>
                  patcher({ qualification: { ...editionActive.qualification, recadrageOral } })
                }
              />
            </div>
          ) : (
            <div className="mt-5">
              <p className="rounded-xl border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-50">
                Chiffrage verrouillé. Renseignez la qualification financière pour ouvrir les lots.
              </p>
              <QualificationFinanciereBloc
                qualification={editionActive.qualification}
                editable={editable}
                montantChiffreTtc={montantCompletParade}
                onChange={(qualification) => patcher({ qualification })}
              />
            </div>
          )}
          {qualificationOk ? (
          <div className="mt-5">
            <GrilleTravauxDossier
              lignes={dossier?.workingBase?.documents?.devis?.lignes || []}
              travauxProposes={dossier?.workingBase?.travauxProposes || []}
              role={role}
              editable={editable}
              editionLignes={estBrunel ? lignesBrunel : editionActive.travaux}
              onLignesChange={(travaux) => patcher({ travaux })}
              surfaceDefaut={editionActive.client.surfaceHabitable}
              libelleVerrou={libelleVerrou}
              voirCoutsInternes={voirMarges}
              voirBonsCommande={droitsHub.afficherBonsCommande}
              masquerMargeCg={!droitsHub.afficherMargeCg}
              dossier={dossier}
              edition={editionActive}
            />
          </div>
          ) : null}
          {qualificationOk && editable && !estBrunel ? (
            <TunnelFinancierTechnique
              edition={editionActive}
              prixM2Constate={prixM2Tunnel}
              dpeActuel={editionActive.valorisation?.dpeActuel}
              editable={editable}
              onAppliquerEcoPtz={appliquerEcoPtz}
            />
          ) : null}
          {qualificationOk && !editable && travaux.length > 0 ? (
            <>
              <p className="mt-2 text-sm text-slate-400">
                Ordre optimal ENERGIA — isolation avant chauffage. Montants HT du devis de test.
              </p>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">N°</th>
                      <th className="px-3 py-2 font-medium">Poste</th>
                      <th className="px-3 py-2 font-medium text-right">Montant HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {(calculParade.phase2Masquee
                      ? travaux.filter(
                          (ligne) =>
                            calculParade.lots.find((lot) => lot.id === ligne.id)?.phase !== "phase2",
                        )
                      : travaux
                    ).map((ligne, index) => (
                      <tr key={ligne.id}>
                        <td className="px-3 py-2.5 text-slate-500">{index + 1}</td>
                        <td className="px-3 py-2.5 text-white">{ligne.label}</td>
                        <td className="px-3 py-2.5 text-right font-medium text-emerald-200">
                          {euro(ligne.ht)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {dossier?.caHt != null ? (
                <p className="mt-4 text-sm text-slate-300">
                  {calculParade.phase2Masquee ? (
                    <>
                      Devis Anah Phase 1 :{" "}
                      <strong className="text-emerald-200">{euro(calculParade.phase1.total)}</strong>
                      <span className="mt-1 block text-xs text-slate-500">
                        Le montant de Phase 2 est masqué jusqu&apos;à la notification d&apos;accord de l&apos;Anah.
                      </span>
                    </>
                  ) : (
                    <>
                      Total devis : <strong className="text-white">{euro(dossier.caHt)} HT</strong>
                      {dossier.caTtc != null ? (
                        <>
                          {" "}
                          / <strong className="text-emerald-200">{euro(dossier.caTtc)} TTC</strong>
                        </>
                      ) : null}
                    </>
                  )}
                </p>
              ) : null}
              {voirMarges && dossier?.marges ? (
                <div className="mt-6 rounded-xl border border-red-500/30 bg-red-950/30 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-300">
                    Répartition interne des marges — administrateur uniquement
                  </p>
                  <RepartitionMarges
                    marges={dossier.marges}
                    apporteurNom={dossier.apporteurNom}
                    compact
                  />
                </div>
              ) : null}
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-slate-400">
                Ordre optimal ENERGIA — règle d’or : isolation avant chauffage. Aucun chiffrage interne.
              </p>
              <ol className="mt-5 space-y-3">
                {ORDRE_TRAVAUX.map((poste, index) => (
                  <li
                    key={poste}
                    className={`flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950/50 ${
                      tablette ? "min-h-14 px-4 py-3 text-base" : "px-4 py-2.5 text-sm"
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600/30 text-sm font-semibold text-emerald-200">
                      {index + 1}
                    </span>
                    <span className="text-white">{poste}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </section>
      ) : null}

      {vue === "documents-travail" && dossier ? (
        <div className="mb-4">
          <BoutonAuditRapportDevis dossier={dossier} edition={editionActive} />
        </div>
      ) : null}
      {vue === "documents-travail" && dossier ? (
        aBaseTravail ? (
          <DocumentsTravailDossier
            dossier={dossier}
            role={role}
            onBaseChange={onWorkingBaseChange}
            edition={editionActive}
            onEditionChange={patcher}
            voirGed={droitsHub.afficherGed}
            voirBonsCommande={droitsHub.afficherBonsCommande}
            masquerMargeCg={!droitsHub.afficherMargeCg}
          />
        ) : (
          <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
            <h2 className={`font-semibold text-white ${titre}`}>Dossier de travail & pièces</h2>
            <PiecesDossierEdition
              pieces={editionActive.pieces}
              onChange={(pieces) => patcher({ pieces })}
              editable={editable}
              voirFiscal={voirFiscal}
              peutValider={admin}
            />
          </section>
        )
      ) : null}

      {vue === "aides" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={`font-semibold text-white ${titre}`}>Aides indicatives</h2>
            {editable ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                Mode édition actif
              </span>
            ) : null}
          </div>
          <p className="mt-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-100">
            {mentionLegaleAidesVerifiees()}
          </p>
          {estBrunel ? (
            <FicheMarcheBrunel
              offreActive={editionActive?.offreActive}
              afficherBareme
              afficherMargeCg={voirMarges}
            />
          ) : (
            <AidesIndicativesEdition
              edition={editionActive}
              editable={editable}
              peutEcraser={peutEcraser}
              onChange={(aides) => patcher({ aides })}
            />
          )}
          {editable && !estBrunel ? (
            <TunnelFinancierTechnique
              edition={editionActive}
              prixM2Constate={prixM2Tunnel}
              dpeActuel={editionActive.valorisation?.dpeActuel}
              editable={editable}
              onAppliquerEcoPtz={appliquerEcoPtz}
            />
          ) : null}
          {aBaseTravail && aidesDossier && !estBrunel ? (
            <div className="mt-4 space-y-2 text-xs text-slate-400">
              <p className="text-amber-100">{MENTION_AIDES_INDICATIVES}</p>
              {aidesDossier.sources?.map((source) => (
                <p key={source.url}>
                  {source.dispositif} — {source.sourceOfficielle} — {source.url} — vérifié le{" "}
                  {source.dateVerificationWeb}
                  {source.pageVerifieeLe ? ` (page officielle : ${source.pageVerifieeLe})` : ""}
                </p>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {vue === "financement" ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className={`font-semibold text-white ${titre}`}>Plan de financement</h2>
            {editable ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-200">
                Mode édition actif
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Deux canaux distincts pour le reste à charge. Canal 1 — Éco-PTZ d’État à taux 0 %
            (jusqu’à 50 000 €, 15 à 20 ans) auprès des banques conventionnées (Crédit Agricole,
            Caisse d’Épargne, etc.). Canal 2 — prêts travaux 6 000 € à 75 000 € et regroupement
            de crédits : FABIEN — VIVONS COURTIER — 06 71 19 96 45.
          </p>
          {estBrunel ? (
            <FicheMarcheBrunel
              offreActive={editionActive?.offreActive}
              afficherBareme
              afficherEcoPtz
              afficherMargeCg={voirMarges}
            />
          ) : (
            <PlanFinancementEdition
              edition={editionActive}
              editable={editable}
              onChange={(financement) => patcher({ financement })}
            />
          )}
          {editable && !estBrunel ? (
            <TunnelFinancierTechnique
              edition={editionActive}
              prixM2Constate={prixM2Tunnel}
              dpeActuel={editionActive.valorisation?.dpeActuel}
              editable={editable}
              onAppliquerEcoPtz={appliquerEcoPtz}
            />
          ) : null}
          {financementDossier && !estBrunel ? (
            <p className="mt-3 text-xs text-slate-500">{MENTION_FINANCEMENT_INDICATIF}</p>
          ) : null}
          <p className="mt-4 rounded-xl border border-orange-500/40 bg-orange-500/10 p-4 text-sm text-orange-100">
            NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L’ACCORD ÉCRIT DE L’ANAH (sinon perte
            définitive et irrémédiable du MPR).
          </p>
        </section>
      ) : null}

      {vue === "bilan-audit" && dossier?.id === BRUNEL_DOSSIER_ID ? (
        <BilanEnergetiqueAuditBrunel />
      ) : null}

      {vue === "etat-lieux-fariss" && estFariss ? (
        <section className={`space-y-4 rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`} data-testid="onglet-etat-lieux-fariss">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">REX technique</p>
            <h2 className={`font-semibold text-white ${titre}`}>État des lieux / REX technique</h2>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Constat avant travaux du sous-sol, 6 Rue Danielle Casanova à La Ricamarie. Fiche de relevé Aqua Habita,
              bac à laver en béton armé, murs bruts, solives et dallage de la future douche Kinedo.
            </p>
          </div>
          <GaleriePhotosFariss testId="galerie-photos-fariss-rex" />
        </section>
      ) : null}

      {vue === "photos-chantier" && dossier?.id === PEREIRA_NERVIEUX_DOSSIER_ID ? (
        <OngletPhotosChantierPereira
          dossierId={dossier.id}
          edition={editionActive}
          editable={editable}
          onPhotosChange={(photos) => patcher({ photos })}
        />
      ) : null}

      {vue === "projection-wow" && dossier ? (
        <div className="space-y-4">
          <SimulateurSolaireTesla clientNomInitial={dossier.nom || ""} />
          <Projection3DWow dossierId={dossier.id} dossier={dossier} disposition="slider" />
        </div>
      ) : null}

      {vue === "finances" && voirFinances ? (
        <section className={`rounded-2xl border border-slate-800 bg-slate-900/80 ${pad}`}>
          <h2 className={`font-semibold text-white ${titre}`}>Finances internes</h2>
          <p className="mt-2 text-sm text-slate-400">
            {role === "administrateur"
              ? "Coûts d’achat, pose RGE, Clyve, marge brute / nette et commission — hors devis client."
              : "Votre commission agent uniquement. La marge nette ENERGIA n’est pas affichée."}
          </p>
          <OngletFinances
            vueFinances={vueFinances}
            role={roleFinances}
            financesCalculees={financesEdition}
            editable={admin}
            onFinancesChange={(partial) =>
              patcher({ finances: { ...editionBrute.finances, ...partial } })
            }
          />
        </section>
      ) : null}

      <p className="text-xs text-slate-500">
        Vue commerciale / client : aucun coût fournisseur, matériel, pose, coût Clyve d’achat ni
        prix plancher. La répartition des marges n’apparaît que pour l’administrateur. L’onglet
        Finances est masqué pour le partenaire et la présentation client.
      </p>
    </div>
  );
}
