/**
 * Modules stratégiques CRM — Devis & Marchés, Coordination, Cuisines, Apporteurs.
 */
import { useState } from "react";
import { ClipboardList, Copy, FileText } from "lucide-react";
import ContratContractantGeneralMaster from "./ContratContractantGeneralMaster";
import FactureAcompteModal from "./FactureAcompteModal";
import BonDeCommandeArtisanModal from "./BonDeCommandeArtisanModal";
import ConventionIngenierieModal, { BoutonConventionIngenierie } from "./ConventionIngenierieModal";
import ChantierOrchestrateurModal from "./ChantierOrchestrateurModal";
import ChantierMasterOrchestratorModal from "./ChantierMasterOrchestratorModal";
import RecapCommissionsCatarina from "./RecapCommissionsCatarina";
import { euro } from "../../lib/crm/mockData";
import { BRUNEL_DOSSIER_ID } from "../../lib/crm/brunelWorkingBase";
import {
  CHEMIN_DEVIS_PEREIRA_NERVIEUX,
  PEREIRA_NERVIEUX_DOSSIER_ID,
  PEREIRA_NERVIEUX_NUMERO,
  TOTAUX_PEREIRA_NERVIEUX,
} from "../../lib/crm/pereiraNervieuxOfficiel";
import { CHEMIN_DEVIS_BRUNEL_FINAL } from "../../lib/crm/brunelDevisV3Officiel";
import {
  CHEMIN_CONTRAT_GILBERTAS,
  CLIENT_GILBERTAS,
  GILBERTAS_DOSSIER_ID,
  GILBERTAS_REFERENCE,
  FINANCEMENT_GILBERTAS,
  PROJET_GILBERTAS_DEFAUT,
  TOTAUX_GILBERTAS,
} from "../../lib/crm/gilbertasClermontOfficiel";
import {
  CHEMIN_CONTRAT_MASSARDIER,
  MASSARDIER_LEAD_ID,
  MASSARDIER_REFERENCE,
  PROJET_MASSARDIER_DEFAUT,
  TOTAUX_MASSARDIER,
} from "../../lib/crm/massardierLeadOfficiel";
import {
  CLOISON_SDB_DOSSIER_ID,
  NOM_FICHIER_CONTRAT_CLOISON_SDB,
  PROJET_CLOISON_SDB_DEFAUT,
  TOTAUX_CLOISON_SDB,
  FINANCEMENT_CLOISON_SDB,
} from "../../lib/crm/cloisonSdbOfficiel";
import {
  CHEMIN_DEVIS_GESNOUIN_PDF,
  GESNOUIN_DOSSIER_ID,
  GESNOUIN_REFERENCE,
  PROJET_GESNOUIN_DEFAUT,
  TOTAUX_GESNOUIN,
} from "../../lib/crm/gesnouinBatterieOfficiel";
import {
  COUTY_ESCALIER_DOSSIER_ID,
  COUTY_ESCALIER_REFERENCE,
  NOM_FICHIER_DEVIS_COUTY,
  PROJET_COUTY_ESCALIER_DEFAUT,
  TOTAUX_COUTY,
} from "../../lib/crm/coutyEscalierOfficiel";
import {
  BRUNEL_MACONNERIE_DOSSIER_ID,
  BRUNEL_MACONNERIE_REFERENCE,
  CHEMIN_CONTRAT_BRUNEL_MACONNERIE,
  FINANCEMENT_BRUNEL_MACONNERIE,
  TOTAUX_BRUNEL_MACONNERIE,
} from "../../lib/crm/brunelMaconnerieOfficiel";
import { COORDINATION_NATIONALE } from "../../lib/crm/catalogue/coordinationNationale.ts";
import {
  ABDENABI_ADRESSE_RUE,
  ABDENABI_CHANTIER,
  ABDENABI_CLIENT_BDC,
  ABDENABI_CONTACT_MOMO,
  ABDENABI_CORPS_ETAT,
  ABDENABI_CP_VILLE,
  ABDENABI_ID,
  ABDENABI_SOUS_TRAITANT,
  ABDENABI_ST_HT,
} from "../../data/chantiers";
import { lireEditionDossier } from "../../lib/crm/editionDossier";
import { calculerCommissionOfficielle, simulerCommission } from "../../lib/crm/commissionPareto";
import {
  CHEMIN_BDC_MASSON,
  CHEMIN_DEVIS_MASSON,
  CLIENT_MASSON,
  FINANCEMENT_MASSON,
  MASSON_DOSSIER_ID,
  MASSON_REFERENCE,
  PROJET_MASSON_DEFAUT,
  TOTAUX_MASSON,
} from "../../lib/crm/massonToulonOfficiel";
import {
  CHEMIN_DEVIS_FARISS,
  FARISS_DOSSIER_ID,
  FARISS_REFERENCE,
  FINANCEMENT_FARISS,
  PROJET_FARISS_DEFAUT,
  TOTAUX_FARISS,
  texteRibAcompteFariss,
} from "../../lib/crm/farissLaRicamarieOfficiel";
import {
  CHEMIN_DEVIS_OUSSARA,
  CLIENT_OUSSARA,
  FINANCEMENT_OUSSARA,
  OUSSARA_DOSSIER_ID,
  OUSSARA_REFERENCE,
  PROJET_OUSSARA_DEFAUT,
  TOTAUX_OUSSARA,
} from "../../lib/crm/oussaraColombierOfficiel";
import {
  CHEMIN_DEVIS_OUSSARA_COMBLES,
  CLIENT_OUSSARA_COMBLES,
  FINANCEMENT_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DOSSIER_ID,
  OUSSARA_COMBLES_REFERENCE,
  PROJET_OUSSARA_COMBLES_DEFAUT,
  TOTAUX_OUSSARA_COMBLES,
} from "../../lib/crm/oussaraComblesOfficiel";
import {
  CHEMIN_CONTRAT_DAMIEN_PV_100KWC,
  DAMIEN_PV_100KWC_DOSSIER_ID,
  DAMIEN_PV_100KWC_REFERENCE,
  PROJET_DAMIEN_PV_100KWC_DEFAUT,
  TOTAUX_DAMIEN_PV_100KWC,
} from "../../lib/crm/damienPv100kwcOfficiel";

export const MARCHES = [
  {
    id: BRUNEL_DOSSIER_ID,
    nom: "Brunel / Indivision COUBLE",
    ref: "DEV-2026-BRUNEL",
    montantTtc: 33478.53,
    statut: "Contrat CG validé",
    htmlPublic: CHEMIN_DEVIS_BRUNEL_FINAL,
  },
  {
    id: BRUNEL_MACONNERIE_DOSSIER_ID,
    nom: "Brunel — Avenant n°01 Gros Œuvre & Dalle 80 m²",
    ref: BRUNEL_MACONNERIE_REFERENCE,
    montantTtc: TOTAUX_BRUNEL_MACONNERIE.totalTtc,
    statut: "Avenant maçonnerie",
    htmlPublic: CHEMIN_CONTRAT_BRUNEL_MACONNERIE,
  },
  {
    id: PEREIRA_NERVIEUX_DOSSIER_ID,
    nom: "Pereira — Nervieux",
    ref: PEREIRA_NERVIEUX_NUMERO,
    montantTtc: TOTAUX_PEREIRA_NERVIEUX.totalTtc,
    statut: "Marché de travaux de Contractant Général",
    htmlPublic: CHEMIN_DEVIS_PEREIRA_NERVIEUX,
  },
  {
    id: GILBERTAS_DOSSIER_ID,
    nom: CLIENT_GILBERTAS.nom,
    ref: GILBERTAS_REFERENCE,
    montantTtc: TOTAUX_GILBERTAS.totalTtc,
    statut: PROJET_GILBERTAS_DEFAUT.statut || "Devis en cours",
    htmlPublic: CHEMIN_CONTRAT_GILBERTAS,
  },
  {
    id: MASSARDIER_LEAD_ID,
    nom: PROJET_MASSARDIER_DEFAUT.nom || "Roger Massardier",
    ref: MASSARDIER_REFERENCE,
    montantTtc: TOTAUX_MASSARDIER.totalTtc,
    statut: PROJET_MASSARDIER_DEFAUT.statut || "Lead budgeté",
    htmlPublic: CHEMIN_CONTRAT_MASSARDIER,
  },
  {
    id: CLOISON_SDB_DOSSIER_ID,
    nom: "Cloison & Faux-plafond SDB",
    ref: PROJET_CLOISON_SDB_DEFAUT.reference,
    montantTtc: TOTAUX_CLOISON_SDB.totalTtc,
    statut: PROJET_CLOISON_SDB_DEFAUT.statut,
    htmlPublic: `/${NOM_FICHIER_CONTRAT_CLOISON_SDB}`,
  },
  {
    id: GESNOUIN_DOSSIER_ID,
    nom: PROJET_GESNOUIN_DEFAUT.nom,
    ref: GESNOUIN_REFERENCE,
    montantTtc: TOTAUX_GESNOUIN.totalTtc,
    statut: PROJET_GESNOUIN_DEFAUT.statut,
    htmlPublic: CHEMIN_DEVIS_GESNOUIN_PDF,
  },
  {
    id: COUTY_ESCALIER_DOSSIER_ID,
    nom: PROJET_COUTY_ESCALIER_DEFAUT.nom,
    ref: COUTY_ESCALIER_REFERENCE,
    montantTtc: TOTAUX_COUTY.totalTtc,
    statut: PROJET_COUTY_ESCALIER_DEFAUT.statut,
    htmlPublic: `/${NOM_FICHIER_DEVIS_COUTY}`,
  },
  {
    id: FARISS_DOSSIER_ID,
    nom: PROJET_FARISS_DEFAUT.nom,
    ref: FARISS_REFERENCE,
    montantTtc: TOTAUX_FARISS.totalTtc,
    statut: PROJET_FARISS_DEFAUT.statut,
    htmlPublic: CHEMIN_DEVIS_FARISS,
    tauxTva: 10,
    adresse: PROJET_FARISS_DEFAUT.adresse,
    designation: PROJET_FARISS_DEFAUT.typeProjet,
    acompteTtc: FINANCEMENT_FARISS.acompte,
  },
  {
    id: MASSON_DOSSIER_ID,
    nom: PROJET_MASSON_DEFAUT.nom,
    ref: MASSON_REFERENCE,
    montantTtc: TOTAUX_MASSON.totalTtc,
    statut: PROJET_MASSON_DEFAUT.statut,
    htmlPublic: CHEMIN_DEVIS_MASSON,
    tauxTva: 10,
    adresse: `${CLIENT_MASSON.adresse}\nTéléphone : ${CLIENT_MASSON.telephone}`,
    designation: PROJET_MASSON_DEFAUT.typeProjet,
    acompteTtc: FINANCEMENT_MASSON.acompte,
  },
  {
    id: OUSSARA_DOSSIER_ID,
    nom: PROJET_OUSSARA_DEFAUT.nom,
    ref: OUSSARA_REFERENCE,
    montantTtc: TOTAUX_OUSSARA.totalTtc,
    statut: PROJET_OUSSARA_DEFAUT.statut,
    htmlPublic: CHEMIN_DEVIS_OUSSARA,
    tauxTva: 20,
    adresse: CLIENT_OUSSARA.adresse,
    designation: PROJET_OUSSARA_DEFAUT.typeProjet,
    acompteTtc: FINANCEMENT_OUSSARA.acompte,
    precision: `Brut ${TOTAUX_OUSSARA.totalHtBrut.toLocaleString("fr-FR")} € HT · geste Direction −${TOTAUX_OUSSARA.gesteCommercialHt.toLocaleString("fr-FR")} € HT · net ${TOTAUX_OUSSARA.totalHt.toLocaleString("fr-FR")} € HT · TVA 20 % ${TOTAUX_OUSSARA.totalTva.toLocaleString("fr-FR")} € · ${TOTAUX_OUSSARA.totalTtc.toLocaleString("fr-FR")} € TTC · acompte 40 % ${FINANCEMENT_OUSSARA.acompte.toLocaleString("fr-FR")} €`,
  },
  {
    id: OUSSARA_COMBLES_DOSSIER_ID,
    nom: PROJET_OUSSARA_COMBLES_DEFAUT.nom,
    ref: OUSSARA_COMBLES_REFERENCE,
    montantTtc: TOTAUX_OUSSARA_COMBLES.totalTtc,
    statut: PROJET_OUSSARA_COMBLES_DEFAUT.statut,
    htmlPublic: CHEMIN_DEVIS_OUSSARA_COMBLES,
    tauxTva: 20,
    adresse: CLIENT_OUSSARA_COMBLES.adresse,
    designation: PROJET_OUSSARA_COMBLES_DEFAUT.typeProjet,
    acompteTtc: FINANCEMENT_OUSSARA_COMBLES.acompte,
    precision: `Combles perdus 49 m² · ${TOTAUX_OUSSARA_COMBLES.totalHt.toLocaleString("fr-FR")} € HT · TVA 20 % ${TOTAUX_OUSSARA_COMBLES.totalTva.toLocaleString("fr-FR")} € · ${TOTAUX_OUSSARA_COMBLES.totalTtc.toLocaleString("fr-FR")} € TTC · acompte 40 % ${FINANCEMENT_OUSSARA_COMBLES.acompte.toLocaleString("fr-FR")} €`,
  },
  {
    id: ABDENABI_ID,
    nom: "Abdenabi BELOUCIF — Chaudière Strasbourg",
    ref: ABDENABI_CHANTIER.devis,
    montantTtc: ABDENABI_CHANTIER.venteTtc,
    statut: "Devis chaudière VMC Gaz",
  },
];

/** Contrat PV 100 kWc — hors liste Devis, ouvert depuis Apporteurs. */
const MARCHE_PV_DAMIEN = {
  id: DAMIEN_PV_100KWC_DOSSIER_ID,
  nom: PROJET_DAMIEN_PV_100KWC_DEFAUT.nom,
  ref: DAMIEN_PV_100KWC_REFERENCE,
  montantTtc: TOTAUX_DAMIEN_PV_100KWC.totalTtc,
  statut: PROJET_DAMIEN_PV_100KWC_DEFAUT.statut,
  htmlPublic: CHEMIN_CONTRAT_DAMIEN_PV_100KWC,
};

export const CONVENTION_DAMIEN_RICHARD = {
  id: "convention-damien-richard-srd-2026",
  nom: "Damien RICHARD — B2C 10 % · Pareto 70 / 30",
  kicker: "Convention d’apporteur d’affaires",
  htmlPublic: "/CONVENTION_COMMERCIALE_DAMIEN_RICHARD_SRD_2026.html",
};

export const CONVENTION_JAMEL_HAMZAOUI = {
  id: "convention-jamel-hamzaoui-energetique-2026",
  nom: "Jamel HAMZAOUI — ENERG’ÉTHIQUE — B2C 10 % · Pareto 70 / 30 — hors énergie",
  kicker: "Convention d’apporteur d’affaires",
  htmlPublic: "/CONVENTION_COMMERCIALE_JAMEL_HAMZAOUI_ENERGETHIQUE_2026.html",
};

function normaliserCle(valeur) {
  return String(valeur || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

/** Marché HTML correspondant à un dossier apporteur. */
export function contratPourDossier(dossier) {
  const pool = [...MARCHES, MARCHE_PV_DAMIEN];
  const id = dossier?.id;
  const direct = pool.find((item) => item.id === id);
  if (direct) return direct;
  const ref = normaliserCle(dossier?.reference || dossier?.auditId);
  if (ref) {
    const parRef = pool.find((item) => normaliserCle(item.ref) === ref);
    if (parRef) return parRef;
  }
  const nom = normaliserCle(dossier?.nom || dossier?.client);
  if (!nom) return null;
  return (
    pool.find((item) => {
      const cible = normaliserCle(item.nom);
      return nom.includes(cible) || cible.includes(nom);
    }) || null
  );
}

const CHANTIERS_MOHAMED = [
  {
    id: MASSON_DOSSIER_ID,
    chantier: "Masson — chaudière gaz Toulon (échéancier 30/70)",
    client: `${CLIENT_MASSON.libelleSignature} — Mohamed BENAOUDA (BMI)`,
    montantTtc: TOTAUX_MASSON.totalTtc,
    jalon30: { label: "30 % à la commande", montant: FINANCEMENT_MASSON.acompte, statut: "À encaisser" },
    jalon40: { label: "Pas de jalon 40 %", montant: 0, statut: "Échéancier 30 / 70" },
    jalon30solde: {
      label: "70 % à la réception",
      montant: FINANCEMENT_MASSON.solde,
      statut: "Mise en service + CC2",
    },
    pv: "PV réception et certificat CC2 — à la mise en service",
    bdcPublic: CHEMIN_BDC_MASSON,
  },
  {
    id: CLOISON_SDB_DOSSIER_ID,
    chantier: "Cloison 3,50 m & faux-plafond SDB",
    client: "M. / Mme [Nom du Client]",
    montantTtc: TOTAUX_CLOISON_SDB.totalTtc,
    jalon30: { label: "30 % signature", montant: FINANCEMENT_CLOISON_SDB.acompte, statut: "À encaisser" },
    jalon40: { label: "40 % démarrage", montant: FINANCEMENT_CLOISON_SDB.intermediaire, statut: "En attente" },
    jalon30solde: { label: "30 % réception", montant: FINANCEMENT_CLOISON_SDB.solde, statut: "En attente" },
    pv: "PV réception sans réserve — à établir",
  },
  {
    id: GILBERTAS_DOSSIER_ID,
    chantier: "Gilbertas — cuisine clé en main & second œuvre",
    client: PROJET_GILBERTAS_DEFAUT.nom || "Gilbertas",
    montantTtc: TOTAUX_GILBERTAS.totalTtc,
    jalon30: { label: "30 % commande", montant: FINANCEMENT_GILBERTAS.acompte, statut: "À préparer" },
    jalon40: { label: "40 % démarrage", montant: FINANCEMENT_GILBERTAS.intermediaire, statut: "En attente" },
    jalon30solde: { label: "30 % livraison", montant: FINANCEMENT_GILBERTAS.solde, statut: "En attente" },
    pv: "PV réception — non démarré",
  },
  {
    id: BRUNEL_DOSSIER_ID,
    chantier: "Brunel — rénovation globale CG",
    client: "Indivision COUBLE / Brunel",
    montantTtc: 33478.53,
    jalon30: { label: "30 % signature", montant: 10043.56, statut: "Marché validé" },
    jalon40: { label: "40 % mi-chantier", montant: 13391.41, statut: "Après validation Sylvain" },
    jalon30solde: { label: "30 % réception", montant: 10043.56, statut: "En attente" },
    pv: "PV réception sans réserve — à venir",
  },
  {
    id: BRUNEL_MACONNERIE_DOSSIER_ID,
    chantier: "Brunel — Avenant Gros Œuvre / dalle 80 m²",
    client: "Indivision COUBLE / Brunel",
    montantTtc: TOTAUX_BRUNEL_MACONNERIE.totalTtc,
    jalon30: {
      label: "30 % signature",
      montant: FINANCEMENT_BRUNEL_MACONNERIE.acompte,
      statut: "À encaisser",
    },
    jalon40: {
      label: "40 % démarrage",
      montant: FINANCEMENT_BRUNEL_MACONNERIE.intermediaire,
      statut: "Après validation Sylvain",
    },
    jalon30solde: {
      label: "30 % réception",
      montant: FINANCEMENT_BRUNEL_MACONNERIE.solde,
      statut: "En attente",
    },
    pv: "PV réception avenant — à établir",
  },
];

const CUISINES = [
  {
    id: "veneta",
    marque: "Veneta Cucine",
    origine: "Italie — direct usine",
    positionnement: "Cuisines italiennes premium · filières usine",
    contact: "Catarina Martins — design & agencement",
  },
  {
    id: "arredo3",
    marque: "Arredo3",
    origine: "Italie — direct usine",
    positionnement: "Cuisines design contemporain · volumes & îlots",
    contact: "Catarina Martins — design & agencement",
  },
  {
    id: "catarina-design",
    marque: "Projets design Catarina Martins",
    origine: "Partenaire ENERGIA — Immobilière Catarinense",
    positionnement: "Consultation Duo · agencement · forfaits coordination",
    contact: "Catarina Martins",
  },
];

function BadgeStatut({ children, tone = "slate" }) {
  const tones = {
    slate: "border-slate-600 bg-slate-800 text-slate-200",
    emerald: "border-emerald-400/40 bg-emerald-500/15 text-emerald-100",
    amber: "border-amber-400/40 bg-amber-500/15 text-amber-100",
    sky: "border-sky-400/40 bg-sky-500/15 text-sky-100",
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

export function ModuleDevisMarches({ dossiers = [], masquerMarges = false, onOuvrirContrat }) {
  const parId = Object.fromEntries((dossiers || []).map((d) => [d.id, d]));
  const [factureMarche, setFactureMarche] = useState(null);
  const [commandeMarche, setCommandeMarche] = useState(null);
  const [conventionMarche, setConventionMarche] = useState(null);
  const [dispatchOuvert, setDispatchOuvert] = useState(false);
  const [masterOuvert, setMasterOuvert] = useState(false);
  const [masterPreset, setMasterPreset] = useState(null);
  const marcheCouty = MARCHES.find((item) => item.id === COUTY_ESCALIER_DOSSIER_ID) || null;

  return (
    <>
    <section id="devis" data-testid="module-devis-marches" className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Marchés Contractant Général</p>
        <button
          type="button"
          onClick={() => onOuvrirContrat?.(MARCHES[0])}
          className="mt-1 block text-left"
        >
          <h2 className="text-xl font-semibold text-sky-100 hover:text-white">Devis &amp; Marchés</h2>
          <p className="mt-1 text-sm text-sky-200/80 underline-offset-2 hover:underline">
            Ouvrir le contrat officiel (5 pages)
          </p>
        </button>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Accès direct aux contrats générés (Brunel, Pereira, Beloucif, Fariss, Gilbertas, Massardier, Cloison SDB…).
          Téléchargement HTML / impression PDF via le moteur Contractant Général.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            data-testid="bouton-facture-acompte-couty"
            onClick={() => setFactureMarche(marcheCouty)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1a5c2e] px-3 py-2 text-sm font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
          >
            <FileText className="h-4 w-4" aria-hidden />
            Facture d&apos;acompte 30 % — Couty
          </button>
          <button
            type="button"
            data-testid="bouton-bdc-artisan-couty"
            onClick={() => setCommandeMarche(marcheCouty)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#f9c74f]/50 bg-[#1a5c2e] px-3 py-2 text-sm font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
          >
            <ClipboardList className="h-4 w-4" aria-hidden />
            Bon de commande artisan — Couty
          </button>
          <button
            type="button"
            data-testid="bouton-dispatch-chantier"
            onClick={() => setDispatchOuvert(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/40 bg-slate-950 px-3 py-2 text-sm font-semibold text-emerald-100 hover:bg-slate-800"
          >
            Dispatch chantier multi-lots
          </button>
          <button
            type="button"
            data-testid="bouton-orchestrateur-maitre"
            onClick={() => {
              setMasterPreset(null);
              setMasterOuvert(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-[#f9c74f]/50 bg-[#1a5c2e] px-3 py-2 text-sm font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
          >
            Orchestrateur maître
          </button>
          <button
            type="button"
            data-testid="bouton-chantier-abdenabi"
            onClick={() => {
              setMasterPreset(ABDENABI_ID);
              setMasterOuvert(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#047857] px-3 py-2 text-sm font-semibold text-white hover:bg-[#059669]"
          >
            Chantier Abdenabi — Strasbourg
          </button>
          <a
            href="#plafond-sdb"
            className="inline-flex items-center rounded-xl border border-[#f9c74f]/40 bg-[#1a5c2e]/30 px-3 py-2 text-sm font-semibold text-[#f9c74f] hover:bg-[#1a5c2e]/50"
          >
            Chiffrer un plafond de salle de bain sinistré
          </a>
        </div>
      </div>

      <ul className="space-y-3">
        {MARCHES.map((marche) => {
          const dossier = parId[marche.id] || { id: marche.id, nom: marche.nom };
          const edition = lireEditionDossier(marche.id, dossier);
          return (
            <li
              key={marche.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-sky-400/50 hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <button
                type="button"
                onClick={() => {
                  if (marche.id === ABDENABI_ID) {
                    setMasterPreset(ABDENABI_ID);
                    setMasterOuvert(true);
                    return;
                  }
                  onOuvrirContrat?.(marche);
                }}
                className="min-w-0 flex-1 rounded-xl px-1 py-1 text-left hover:bg-sky-500/5"
                aria-label={`Ouvrir le marché ${marche.nom}, ${euro(marche.montantTtc)} TTC`}
              >
                <p className="font-semibold text-sky-100">{marche.nom}</p>
                <p className="mt-1 font-mono text-xs text-sky-300">{marche.ref}</p>
                <p className="mt-2 text-sm text-slate-200">
                  {euro(marche.montantTtc)} TTC · <BadgeStatut tone="emerald">{marche.statut}</BadgeStatut>
                </p>
                {marche.precision ? <p className="mt-1 text-xs leading-relaxed text-slate-400">{marche.precision}</p> : null}
              </button>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  data-testid={`bouton-facture-acompte-${marche.id}`}
                  onClick={() => setFactureMarche(marche)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#f9c74f]/50 bg-[#1a5c2e] px-3 text-xs font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden />
                  Facture d&apos;acompte
                </button>
                <BoutonConventionIngenierie
                  testId={`bouton-convention-ingenierie-${marche.id}`}
                  label={
                    marche.id === FARISS_DOSSIER_ID
                      ? "Voir la Convention d'Assistance 990 €"
                      : undefined
                  }
                  onClick={() => setConventionMarche(marche)}
                />
                {marche.id === FARISS_DOSSIER_ID ? (
                  <button
                    type="button"
                    data-testid="bouton-rib-fariss-marche"
                    onClick={async () => {
                      const texte = texteRibAcompteFariss();
                      try {
                        await navigator.clipboard.writeText(texte);
                      } catch {
                        window.prompt("Copier le RIB Qonto — acompte 3 135 €", texte);
                      }
                    }}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#f9c74f]/50 bg-[#1a5c2e] px-3 text-xs font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
                  >
                    <Copy className="h-3.5 w-3.5" aria-hidden />
                    Copier RIB Qonto Acompte 3 135 €
                  </button>
                ) : null}
                <button
                  type="button"
                  data-testid={`bouton-bdc-artisan-${marche.id}`}
                  onClick={() => setCommandeMarche(marche)}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-sky-400/40 bg-slate-950 px-3 text-xs font-semibold text-sky-100 hover:bg-slate-800"
                >
                  <ClipboardList className="h-3.5 w-3.5" aria-hidden />
                  Bon de Commande Artisan
                </button>
                {marche.htmlPublic ? (
                  <a
                    href={marche.htmlPublic}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 text-xs font-semibold text-sky-100 hover:bg-sky-500/25"
                  >
                    Ouvrir HTML
                  </a>
                ) : null}
                <ContratContractantGeneralMaster
                  dossier={dossier}
                  edition={edition}
                  compact
                  afficherContrat={!masquerMarges}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
    <FactureAcompteModal
      key={factureMarche?.id || "fa-ferme"}
      ouvert={Boolean(factureMarche)}
      marche={factureMarche}
      onFermer={() => setFactureMarche(null)}
    />
    <ConventionIngenierieModal
      ouvert={Boolean(conventionMarche)}
      onFermer={() => setConventionMarche(null)}
      client={conventionMarche?.nom}
      adresse={conventionMarche?.adresse}
      reference={conventionMarche?.ref}
    />
    <BonDeCommandeArtisanModal
      key={commandeMarche?.id || "bdc-ferme"}
      ouvert={Boolean(commandeMarche)}
      marche={commandeMarche}
      onFermer={() => setCommandeMarche(null)}
      {...(commandeMarche?.id === ABDENABI_ID
        ? {
            clientNom: ABDENABI_CLIENT_BDC,
            clientAdresse: ABDENABI_ADRESSE_RUE,
            clientVille: ABDENABI_CP_VILLE,
            marcheRef: ABDENABI_CHANTIER.devis,
            bdcRef: ABDENABI_CHANTIER.sousTraitance.reference,
            lotDescription: ABDENABI_CHANTIER.sousTraitance.prestation,
            artisanNom: ABDENABI_SOUS_TRAITANT,
            artisanCorpsEtat: ABDENABI_CORPS_ETAT,
            artisanContact: ABDENABI_CONTACT_MOMO,
            montantHT: ABDENABI_ST_HT,
            dossierId: ABDENABI_ID,
          }
        : {})}
    />
    <ChantierOrchestrateurModal ouvert={dispatchOuvert} onFermer={() => setDispatchOuvert(false)} />
    <ChantierMasterOrchestratorModal
      key={masterOuvert ? masterPreset || "orchestrateur" : "ferme"}
      ouvert={masterOuvert}
      presetId={masterPreset}
      onFermer={() => {
        setMasterOuvert(false);
        setMasterPreset(null);
      }}
    />
    </>
  );
}

export function ModuleCoordinationChantiers() {
  return (
    <section id="coordination" data-testid="module-coordination-chantiers" className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
          {COORDINATION_NATIONALE.titre}
        </p>
        <h2 className="mt-1 text-xl font-semibold text-white">Coordination &amp; Chantiers</h2>
        <p className="mt-2 text-sm text-slate-400">
          Pilotage {COORDINATION_NATIONALE.responsable} — {COORDINATION_NATIONALE.telephoneAffiche}. Jalons 30 % /
          40 % / 30 % et PV de réception sans réserve.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={`tel:${COORDINATION_NATIONALE.telephoneTel}`}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-100"
          >
            Appeler Mohamed
          </a>
          <a
            href={COORDINATION_NATIONALE.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-sky-400/40 bg-sky-500/10 px-3 py-1.5 text-xs font-semibold text-sky-100"
          >
            WhatsApp Mohamed
          </a>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-900 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-4 py-3">Chantier</th>
              <th className="px-4 py-3">30 % acompte</th>
              <th className="px-4 py-3">40 % avancement</th>
              <th className="px-4 py-3">30 % solde</th>
              <th className="px-4 py-3">PV réception</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/60">
            {CHANTIERS_MOHAMED.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{row.chantier}</p>
                  <p className="text-xs text-slate-400">{row.client}</p>
                  <p className="mt-1 text-xs text-emerald-200">{euro(row.montantTtc)} TTC</p>
                  {row.bdcPublic ? (
                    <a href={row.bdcPublic} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-semibold text-sky-200 underline">
                      Bon de commande BMI
                    </a>
                  ) : null}
                </td>
                <td className="px-4 py-3">
                  <p className="tabular-nums text-white">{euro(row.jalon30.montant)}</p>
                  <BadgeStatut tone="amber">{row.jalon30.statut}</BadgeStatut>
                </td>
                <td className="px-4 py-3">
                  <p className="tabular-nums text-white">{euro(row.jalon40.montant)}</p>
                  <BadgeStatut tone="sky">{row.jalon40.statut}</BadgeStatut>
                </td>
                <td className="px-4 py-3">
                  <p className="tabular-nums text-white">{euro(row.jalon30solde.montant)}</p>
                  <BadgeStatut>{row.jalon30solde.statut}</BadgeStatut>
                </td>
                <td className="px-4 py-3 text-xs text-slate-300">{row.pv}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ModuleCuisinesAgencement() {
  return (
    <section id="cuisines" data-testid="module-cuisines-agencement" className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300">Agencement &amp; design</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Cuisines &amp; Agencement</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Accès rapide aux filières cuisines italiennes direct usine (Veneta Cucine, Arredo3) et aux projets design
          Catarina Martins.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {CUISINES.map((item) => (
          <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-200">{item.origine}</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{item.marque}</h3>
            <p className="mt-2 text-sm text-slate-300">{item.positionnement}</p>
            <p className="mt-3 text-xs text-emerald-200">{item.contact}</p>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4 text-sm text-violet-50">
        <p className="font-semibold">Parcours type</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-violet-100/90">
          <li>Consultation Duo Catarina / ENERGIA</li>
          <li>Choix usine Veneta Cucine ou Arredo3</li>
          <li>Intégration au marché Contractant Général si travaux associés</li>
          <li>Coordination chantier Mohamed + suivi commissions apporteur</li>
        </ol>
      </div>
    </section>
  );
}

function partApporteurDossier(dossier) {
  return calculerCommissionOfficielle(dossier)?.partApporteurHt ?? (Number(dossier?.commissionDamienHt) || 0);
}

function SimulateurRentabiliteCommission() {
  const [hauteValeur, setHauteValeur] = useState(true);
  const [montant, setMontant] = useState("75000");
  const [cout, setCout] = useState("55000");
  const resultat = simulerCommission({
    montantHt: Number(String(montant).replace(",", ".")),
    coutHt: Number(String(cout).replace(",", ".")),
    hauteValeur,
  });

  return (
    <section className="rounded-2xl border border-amber-400/30 bg-slate-950/70 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-200">Simulateur de rentabilité</p>
      <h3 className="mt-1 text-lg font-semibold text-white">Double règle de commissionnement</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setHauteValeur(false);
            setMontant("20000");
            setCout("12000");
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${hauteValeur ? "border border-slate-700 text-slate-300" : "bg-emerald-600 text-white"}`}
        >
          B2C &lt; 50 000 € HT · 10 %
        </button>
        <button
          type="button"
          onClick={() => {
            setHauteValeur(true);
            setMontant("75000");
            setCout("55000");
          }}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${hauteValeur ? "bg-emerald-600 text-white" : "border border-slate-700 text-slate-300"}`}
        >
          Haute valeur · Pareto 70 / 30
        </button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-400">
          Montant projet HT
          <input
            value={montant}
            onChange={(event) => setMontant(event.target.value)}
            inputMode="decimal"
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
          />
        </label>
        {hauteValeur ? (
          <label className="text-xs text-slate-400">
            Coût travaux et matériel HT
            <input
              value={cout}
              onChange={(event) => setCout(event.target.value)}
              inputMode="decimal"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            />
          </label>
        ) : null}
      </div>
      {resultat?.regle === "pareto" ? (
        <div className="mt-4 space-y-1 text-sm text-slate-200">
          <p>
            {euro(resultat.montantHt)} HT − {euro(resultat.coutHt)} HT = marge brute{" "}
            <strong className="text-white">{euro(resultat.margeBruteHt)} HT</strong>
          </p>
          <p>
            Part apporteur (30&nbsp;%) : <strong className="text-sky-200">{euro(resultat.partApporteurHt)} HT</strong>
          </p>
          <p>
            Part ENERGIA CONSEIL IA® (70&nbsp;%) :{" "}
            <strong className="text-emerald-200">{euro(resultat.partEnergiaHt)} HT</strong>
          </p>
        </div>
      ) : resultat?.regle === "b2c" ? (
        <p className="mt-4 text-sm text-slate-200">
          Commission apporteur : <strong className="text-sky-200">{euro(resultat.partApporteurHt)} HT</strong>
          {" "}(10&nbsp;% du montant des travaux, sans calcul de coûts).
        </p>
      ) : (
        <p className="mt-4 text-sm text-amber-200">Saisissez un montant HT, et le coût travaux pour la règle Pareto.</p>
      )}
    </section>
  );
}

export function ModuleApporteursCommissions({ dossiers = [], voirPartEnergia = true, onStatut, onOuvrirContrat }) {
  const damien = (dossiers || []).filter(
    (d) =>
      /damien/i.test(`${d.apporteurNom || ""} ${d.apporteurId || ""} ${d.sourceLead || ""}`) ||
      d.commissionDamienHt > 0,
  );
  const jamel = (dossiers || []).filter((d) =>
    /jamel|hamzaoui/i.test(`${d.apporteurNom || ""} ${d.apporteurId || ""} ${d.sourceLead || ""}`),
  );
  const totalDamien = damien.reduce((s, d) => s + partApporteurDossier(d), 0);

  return (
    <section id="apporteurs" data-testid="module-apporteurs-commissions" className="space-y-4">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">Réseau apporteurs</p>
        <h2 className="mt-1 text-xl font-semibold text-white">Apporteurs &amp; Commissions</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          B2C résidentiel sous 50&nbsp;000&nbsp;€ HT : 10&nbsp;% HT des travaux. Haute valeur (B2B, tertiaire,
          industrie, centrale solaire 100&nbsp;kWc ou dossier au-dessus de 50&nbsp;000&nbsp;€ HT) : 30&nbsp;% de la
          marge brute pour l’apporteur, 70&nbsp;% pour ENERGIA CONSEIL IA®.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-sky-200">Damien — Éco-Technicien BtoC</p>
          <p className="mt-2 text-2xl font-semibold text-white">{euro(totalDamien)} HT</p>
          <p className="mt-1 text-xs text-sky-100/80">Règle B2C 10 % · Pareto 70 / 30 · {damien.length} dossier(s)</p>
          <button
            type="button"
            onClick={() => onOuvrirContrat?.(CONVENTION_DAMIEN_RICHARD)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-semibold leading-snug text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500"
          >
            📑 Télécharger / Voir le Contrat Commercial de Damien RICHARD (B2C 10 % · Pareto 70 / 30)
          </button>
        </article>
        <article className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-200">Jamel HAMZAOUI — ENERG’ÉTHIQUE</p>
          <p className="mt-2 text-sm text-emerald-50">Conseil pour les affaires · Strasbourg · B2C 10 % · Pareto 70 / 30 · hors énergie et hors aides</p>
          {jamel.length > 0 ? (
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-emerald-50">
              {jamel.map((dossier) => (
                <li key={dossier.id}>
                  <span className="font-semibold">{dossier.nom}</span>
                  {" — "}
                  {dossier.statut || "Prospect"}
                  {dossier.ville ? ` · ${dossier.ville}` : ""}
                  {dossier.telephone ? ` · ${dossier.telephone}` : ""}
                  <span className="mt-0.5 block text-emerald-100/80">
                    Commission 10 % HT sur lots autorisés seulement
                    {dossier.montantHt ? "" : " — montant non calculé, devis HT absent"}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
          <button
            type="button"
            data-testid="bouton-convention-jamel"
            onClick={() => onOuvrirContrat?.(CONVENTION_JAMEL_HAMZAOUI)}
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-emerald-600 px-3 py-3 text-center text-sm font-semibold leading-snug text-white shadow-lg shadow-emerald-950/40 hover:bg-emerald-500"
          >
            📑 Convention Jamel HAMZAOUI (ENERG’ÉTHIQUE)
          </button>
        </article>
        <article className="rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-violet-200">Forfaits agencement</p>
          <p className="mt-2 text-sm text-violet-50">Consultation Duo + coordination Catarina (voir détail ci-dessous)</p>
        </article>
      </div>

      <SimulateurRentabiliteCommission />

      {damien.length > 0 ? (
        <ul className="divide-y divide-slate-800 rounded-2xl border border-slate-800 bg-slate-950/60">
          {damien.map((d) => {
            const marche = contratPourDossier(d);
            const calcul = calculerCommissionOfficielle(d);
            const part = calcul?.partApporteurHt ?? (Number(d.commissionDamienHt) || 0);
            return (
            <li key={d.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 text-sm">
              <div className="min-w-0">
                <p className="font-medium text-white">{d.nom || d.client || d.id}</p>
                <p className="text-xs text-slate-400">{d.reference || d.sourceLead || "Apporteur Damien"}</p>
                {calcul?.regle === "b2c" ? (
                  <p className="mt-1 text-xs text-emerald-200">{calcul.libelle}</p>
                ) : null}
                {calcul?.regle === "pareto" && voirPartEnergia ? (
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-300">
                    {euro(calcul.montantHt)} HT − {euro(calcul.coutHt)} HT = marge brute {euro(calcul.margeBruteHt)} HT
                    <br />
                    Part apporteur (30&nbsp;%) : {euro(calcul.partApporteurHt)} HT · Part ENERGIA CONSEIL IA® (70&nbsp;%) : {euro(calcul.partEnergiaHt)} HT
                  </p>
                ) : null}
                {calcul?.regle === "pareto" && !voirPartEnergia ? (
                  <p className="mt-1 text-xs text-amber-200">{calcul.libelle}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <p className="tabular-nums font-semibold text-sky-200">
                  {euro(part)} HT
                </p>
                {marche ? (
                  <button
                    type="button"
                    onClick={() => onOuvrirContrat?.(marche)}
                    className="inline-flex min-h-10 items-center rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 text-xs font-semibold text-sky-100 hover:bg-sky-500/25"
                  >
                    📄 Voir le Marché
                  </button>
                ) : null}
              </div>
            </li>
            );
          })}
        </ul>
      ) : null}

      <RecapCommissionsCatarina
        dossiers={dossiers}
        editable={Boolean(onStatut)}
        voirPartEnergia={voirPartEnergia}
        onStatut={onStatut}
      />
    </section>
  );
}

export default function ModulesStrategiquesCrm({
  module,
  dossiers = [],
  masquerMarges = false,
  voirPartEnergia = true,
  onStatutCommission,
  onOuvrirContrat,
}) {
  if (module === "devis") {
    return <ModuleDevisMarches dossiers={dossiers} masquerMarges={masquerMarges} onOuvrirContrat={onOuvrirContrat} />;
  }
  if (module === "coordination") {
    return <ModuleCoordinationChantiers />;
  }
  if (module === "cuisines") {
    return <ModuleCuisinesAgencement />;
  }
  if (module === "apporteurs") {
    return (
      <ModuleApporteursCommissions
        dossiers={dossiers}
        voirPartEnergia={voirPartEnergia}
        onStatut={onStatutCommission}
        onOuvrirContrat={onOuvrirContrat}
      />
    );
  }
  return null;
}
