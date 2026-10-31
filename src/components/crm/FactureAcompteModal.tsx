/**
 * Facture d'acompte — appel de fonds Contractant Général.
 * Feuille A4 imprimable (art. 289 du CGI) avec RIB Qonto officiel.
 */
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, CreditCard, Download, FileText, Printer } from "lucide-react";
import { BRANDING } from "../../lib/branding";
import {
  CLIENT_COUTY,
  COUTY_ESCALIER_CONTRAT_NUMERO,
  COUTY_ESCALIER_DOSSIER_ID,
  TOTAUX_COUTY,
} from "../../lib/crm/coutyEscalierOfficiel";
import {
  CLIENT_MASSON,
  FINANCEMENT_MASSON,
  MASSON_DEVIS_DATE,
  MASSON_DEVIS_NUMERO,
  MASSON_DOSSIER_ID,
  MENTION_ECHEANCIER_MASSON,
  TITRE_MASSON,
  TOTAUX_MASSON,
} from "../../lib/crm/massonToulonOfficiel";
import {
  CLIENT_FARISS,
  FARISS_DEVIS_DATE,
  FARISS_DEVIS_NUMERO,
  FARISS_DOSSIER_ID,
  FINANCEMENT_FARISS,
  TITRE_FARISS,
  TOTAUX_FARISS,
} from "../../lib/crm/farissLaRicamarieOfficiel";
import {
  CLIENT_OUSSARA,
  FINANCEMENT_OUSSARA,
  OUSSARA_DEVIS_DATE,
  OUSSARA_DEVIS_NUMERO,
  OUSSARA_DOSSIER_ID,
  TITRE_OUSSARA,
  TOTAUX_OUSSARA,
} from "../../lib/crm/oussaraColombierOfficiel";
import {
  CLIENT_OUSSARA_COMBLES,
  FINANCEMENT_OUSSARA_COMBLES,
  OUSSARA_COMBLES_DATE,
  OUSSARA_COMBLES_DEVIS_NUMERO,
  OUSSARA_COMBLES_DOSSIER_ID,
  TITRE_OUSSARA_COMBLES,
  TOTAUX_OUSSARA_COMBLES,
} from "../../lib/crm/oussaraComblesOfficiel";
import {
  ABDENABI_ADRESSE_CADRE,
  ABDENABI_ADRESSE_CHANTIER,
  ABDENABI_BDC,
  ABDENABI_CLIENT_FACTURE,
  ABDENABI_DATE_ISO,
  ABDENABI_DEVIS,
  ABDENABI_FACTURE,
  ABDENABI_ID,
  ABDENABI_TVA_TAUX,
  ABDENABI_VENTE_TTC,
} from "../../data/chantiers";
import {
  CLIENT_GILBERTAS,
  FACTURE_ACOMPTE_GILBERTAS,
  FINANCEMENT_GILBERTAS,
  GILBERTAS_CONTRAT_DATE,
  GILBERTAS_CONTRAT_NUMERO,
  GILBERTAS_DOSSIER_ID,
  GILBERTAS_REFERENCE,
  INTITULE_MARCHE_GILBERTAS,
  LIEU_EXECUTION_GILBERTAS,
  TOTAUX_GILBERTAS,
} from "../../lib/crm/gilbertasClermontOfficiel";

export const RIB_QONTO = {
  titulaire: "ENERGIA CONSEIL",
  adresseTitulaire: "16 Rue Cuvier, 69006 Lyon",
  banque: "Qonto SA",
  adresseBanque: "6 Impasse Bonne Nouvelle, 75010 Paris",
  iban: "FR76 1695 8000 0186 6836 4808 772",
  bic: "QNTOFRP1XXX",
} as const;

export const ASSURANCE_FACTURE =
  "Garantie Décennale & RCP : Calipso Assurances n° LUNPIB2604975";

const DESIGNATION_COUTY =
  "Marché global de travaux signé — Sécurisation et pose main courante chêne sur-mesure Ø 42 mm avec retours PMR";

export type TauxTvaFacture = 5.5 | 10 | 20;
export type TypeAppelFonds = "acompte30" | "intermediaire40" | "solde30" | "libre";
export type StatutFactureAcompte = "attente" | "encaisse";

export type SaisieFactureAcompte = {
  client: string;
  adresse: string;
  referenceContrat: string;
  dateContrat: string;
  dateEmission: string;
  montantTtc: number;
  tauxTva: TauxTvaFacture;
  typeAppel: TypeAppelFonds;
  pourcentageLibre: number;
  numero: string;
  designationMarche: string;
  statut: StatutFactureAcompte;
  /** Rappel d'échéancier affiché à la place de la phrase de solde, pour l'acompte 30 %. */
  suiteEcheancier?: string;
};

export type MarcheFacturable = {
  id?: string;
  nom?: string;
  ref?: string;
  montantTtc?: number;
  adresse?: string;
  designation?: string;
  tauxTva?: TauxTvaFacture;
};

export type LeadFacturable = {
  id?: string;
  prenom?: string;
  nomFamille?: string;
  nom?: string;
  ville?: string;
  region?: string;
  adresse?: string;
  address?: string;
  typeTravaux?: string;
  typeProjet?: string;
  notes?: string;
  reference?: string;
  budget?: number | string | null;
  caTtc?: number | string | null;
};

type Props = {
  ouvert: boolean;
  onFermer: () => void;
  marche?: MarcheFacturable | null;
  /** Appel imposé à l'ouverture (acompte 30 % par défaut, solde 70 % après PV). */
  appel?: TypeAppelFonds;
  pourcentageLibre?: number;
  suffixeNumero?: string;
  lienPaiement?: string;
};

const TAUX_OPTIONS: { valeur: TauxTvaFacture; label: string }[] = [
  { valeur: 10, label: "10 % — Rénovation / Autonomie" },
  { valeur: 20, label: "20 %" },
  { valeur: 5.5, label: "5,5 %" },
];

const APPELS: { id: TypeAppelFonds; label: string }[] = [
  { id: "acompte30", label: "Acompte 30 % à la commande" },
  { id: "intermediaire40", label: "Appel intermédiaire 40 % démarrage" },
  { id: "solde30", label: "Solde 30 % réception de chantier" },
  { id: "libre", label: "Pourcentage libre personnalisé" },
];

const PRINT_CSS = `
  .facture-acompte-a4,
  .facture-acompte-logo,
  .facture-acompte-entete {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .facture-acompte-logo {
    filter: none;
    -webkit-filter: none;
  }
  @page { size: A4 portrait; margin: 0; }
  @media print {
    html, body, #root {
      background: #fff !important;
      margin: 0 !important;
      padding: 0 !important;
      height: 297mm !important;
      max-height: 297mm !important;
      min-height: 0 !important;
      overflow: hidden !important;
    }
    body * { visibility: hidden !important; }
    .facture-acompte-a4,
    .facture-acompte-a4 * { visibility: visible !important; }
    .facture-acompte-noprint { display: none !important; }
    .facture-acompte-logo {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      filter: none !important;
      -webkit-filter: none !important;
    }
    .facture-acompte-entete {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .facture-acompte-a4 {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      height: 297mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      box-shadow: none !important;
      border-radius: 0 !important;
      overflow: hidden !important;
      transform: none !important;
    }
  }
`;

export function round2(montant: number): number {
  return Math.round((montant + Number.EPSILON) * 100) / 100;
}

export function euro(montant: number): string {
  if (!Number.isFinite(montant)) return "—";
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(round2(montant));
}

export function formatPourcent(valeur: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(valeur);
}

export function dateLongue(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso || "—";
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export function dateCourte(iso: string): string {
  const date = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(date.getTime())) return iso || "—";
  return date.toLocaleDateString("fr-FR");
}

export function pourcentageAppel(saisie: Pick<SaisieFactureAcompte, "typeAppel" | "pourcentageLibre">): number {
  if (saisie.typeAppel === "acompte30" || saisie.typeAppel === "solde30") return 30;
  if (saisie.typeAppel === "intermediaire40") return 40;
  const libre = Number(saisie.pourcentageLibre);
  if (!Number.isFinite(libre)) return 0;
  return Math.min(100, Math.max(0, libre));
}

export type DecompteAcompte = {
  htMarche: number;
  tvaMarche: number;
  pourcentage: number;
  appelHt: number;
  appelTva: number;
  appelTtc: number;
  restePct: number;
  resteTtc: number;
};

/** Décompte d'appel de fonds : la TVA est calculée sur l'acompte, pas sur le marché entier. */
export function calculerDecompte(saisie: SaisieFactureAcompte): DecompteAcompte {
  const ttc = round2(Math.max(0, Number(saisie.montantTtc) || 0));
  const taux = saisie.tauxTva / 100;
  const pourcentage = pourcentageAppel(saisie);
  const htMarche = taux >= 0 ? round2(ttc / (1 + taux)) : ttc;
  const tvaMarche = round2(ttc - htMarche);
  const appelTtc = round2(ttc * (pourcentage / 100));
  const appelHt = taux >= 0 ? round2(appelTtc / (1 + taux)) : appelTtc;
  const appelTva = round2(appelTtc - appelHt);
  const resteTtc = round2(ttc - appelTtc);
  const restePct = round2(100 - pourcentage);
  return { htMarche, tvaMarche, pourcentage, appelHt, appelTva, appelTtc, restePct, resteTtc };
}

function tokenClient(nom: string): string {
  const mots = nom
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const ignores = new Set(["madame", "monsieur", "mme", "mr", "mlle", "indivision", "dossier", "avenant"]);
  const utiles = mots.filter((mot) => !ignores.has(mot.toLowerCase()) && mot.length > 1);
  const choisi = (utiles[utiles.length - 1] || mots[0] || "CLIENT").toUpperCase();
  return choisi.slice(0, 18);
}

function nomCourt(nom: string): string {
  const token = tokenClient(nom);
  return token.charAt(0) + token.slice(1).toLowerCase();
}

export function titreFacture(type: TypeAppelFonds, pourcentage = 0): string {
  if (type === "solde30" || (type === "libre" && pourcentage >= 50)) return "FACTURE DE SOLDE";
  if (type === "intermediaire40") return "APPEL DE FONDS INTERMÉDIAIRE";
  return "FACTURE D'ACOMPTE";
}

export function phraseResteDu(saisie: SaisieFactureAcompte, decompte: DecompteAcompte): string {
  if (saisie.suiteEcheancier && (saisie.typeAppel === "acompte30" || saisie.typeAppel === "libre")) {
    return saisie.suiteEcheancier;
  }
  if (decompte.resteTtc <= 0) return "Aucun solde restant dû après encaissement de cet appel.";
  if (saisie.typeAppel === "solde30") {
    return `Cet appel solde ${formatPourcent(decompte.pourcentage)} % du marché. Quote-part non comprise dans cette facture : ${euro(decompte.resteTtc)} TTC (${formatPourcent(decompte.restePct)} %).`;
  }
  return `Solde restant dû à la réception après PV sans réserve (${formatPourcent(decompte.restePct)} %) : ${euro(decompte.resteTtc)} TTC`;
}

export function libelleLigneAppel(type: TypeAppelFonds, pourcentage: number): string {
  if (type === "acompte30") return "Acompte de 30 % à la commande exigible à signature";
  if (type === "intermediaire40") return "Appel intermédiaire de 40 % au démarrage de chantier";
  if (type === "solde30") return "Solde de 30 % à la réception de chantier";
  return `Appel de fonds de ${formatPourcent(pourcentage)} % (pourcentage libre)`;
}

export function libelleVirementSuggere(saisie: SaisieFactureAcompte): string {
  const prefixe =
    saisie.typeAppel === "solde30" || (saisie.typeAppel === "libre" && saisie.pourcentageLibre >= 50)
      ? "Solde"
      : saisie.typeAppel === "intermediaire40"
        ? "Avancement"
        : "Acompte";
  const correspondance = saisie.numero.match(/FA-(\d{4}).*?(\d{2})$/i);
  const code = correspondance ? `FA-${correspondance[1]}-${correspondance[2]}` : saisie.numero.trim() || "FA-2026-01";
  return `${prefixe} ${nomCourt(saisie.client)} ${code}`;
}

export function saisieCouty(): SaisieFactureAcompte {
  return {
    client: CLIENT_COUTY.libelleSignature,
    adresse: CLIENT_COUTY.adresse,
    referenceContrat: COUTY_ESCALIER_CONTRAT_NUMERO,
    dateContrat: "2026-10-16",
    dateEmission: "2026-10-16",
    montantTtc: TOTAUX_COUTY.totalTtc,
    tauxTva: 10,
    typeAppel: "acompte30",
    pourcentageLibre: 30,
    numero: "FA-2026-COUTY-01",
    designationMarche: DESIGNATION_COUTY,
    statut: "attente",
  };
}

export function saisieFactureFariss(): SaisieFactureAcompte {
  return {
    client: CLIENT_FARISS.libelleSignature,
    adresse: `${CLIENT_FARISS.adresse}\nTéléphone : ${CLIENT_FARISS.telephone}`,
    referenceContrat: FARISS_DEVIS_NUMERO,
    dateContrat: FARISS_DEVIS_DATE,
    dateEmission: FARISS_DEVIS_DATE,
    montantTtc: TOTAUX_FARISS.totalTtc,
    tauxTva: 10,
    typeAppel: "acompte30",
    pourcentageLibre: 30,
    numero: "FA-2026-FARISS-01",
    designationMarche: TITRE_FARISS,
    statut: "attente",
    suiteEcheancier: `Solde fin de chantier (70 %) : ${euro(FINANCEMENT_FARISS.solde)} TTC, après réception et validation de Sylvain LEMBELEMBE. Devis subordonné à la notification officielle MaPrimeAdapt'.`,
  };
}

export function saisieFactureMasson(): SaisieFactureAcompte {
  return {
    client: CLIENT_MASSON.libelleSignature,
    adresse: `${CLIENT_MASSON.adresse}\nTéléphone : ${CLIENT_MASSON.telephone}\n${CLIENT_MASSON.email}`,
    referenceContrat: MASSON_DEVIS_NUMERO,
    dateContrat: MASSON_DEVIS_DATE,
    dateEmission: MASSON_DEVIS_DATE,
    montantTtc: TOTAUX_MASSON.totalTtc,
    tauxTva: 10,
    typeAppel: "acompte30",
    pourcentageLibre: 30,
    numero: "FA-2026-MASSON-01",
    designationMarche: TITRE_MASSON,
    statut: "attente",
    suiteEcheancier: `Solde 70 % à la réception : ${euro(FINANCEMENT_MASSON.solde)} TTC, à la mise en service et à la remise du certificat CC2. ${MENTION_ECHEANCIER_MASSON}`,
  };
}

function estMarcheMasson(marche?: MarcheFacturable | null): boolean {
  if (!marche) return false;
  if (marche.id === MASSON_DOSSIER_ID) return true;
  if (marche.ref === MASSON_DEVIS_NUMERO) return true;
  return /masson|kristell/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""}`);
}

function estMarcheFariss(marche?: MarcheFacturable | null): boolean {
  if (!marche) return false;
  if (marche.id === FARISS_DOSSIER_ID) return true;
  if (marche.ref === FARISS_DEVIS_NUMERO) return true;
  return /fariss|ricamarie|maprimeadapt/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""}`);
}

export function saisieFactureOussara(): SaisieFactureAcompte {
  return {
    client: CLIENT_OUSSARA.libelleSignature,
    adresse: CLIENT_OUSSARA.adresse,
    referenceContrat: OUSSARA_DEVIS_NUMERO,
    dateContrat: OUSSARA_DEVIS_DATE,
    dateEmission: OUSSARA_DEVIS_DATE,
    montantTtc: TOTAUX_OUSSARA.totalTtc,
    tauxTva: 20,
    typeAppel: "libre",
    pourcentageLibre: 40,
    numero: "FA-2026-OUSSARA-02",
    designationMarche: TITRE_OUSSARA,
    statut: "attente",
    suiteEcheancier: `Acompte 2 à la livraison du matériel et au démarrage de la pose (40 %) : ${euro(FINANCEMENT_OUSSARA.intermediaire)} TTC. Solde à la réception sans réserve (20 %) : ${euro(FINANCEMENT_OUSSARA.solde)} TTC. TVA 20 % construction neuve.`,
  };
}

export function saisieFactureOussaraCombles(): SaisieFactureAcompte {
  return {
    client: CLIENT_OUSSARA_COMBLES.libelleSignature,
    adresse: CLIENT_OUSSARA_COMBLES.adresse,
    referenceContrat: OUSSARA_COMBLES_DEVIS_NUMERO,
    dateContrat: OUSSARA_COMBLES_DATE,
    dateEmission: OUSSARA_COMBLES_DATE,
    montantTtc: TOTAUX_OUSSARA_COMBLES.totalTtc,
    tauxTva: 20,
    typeAppel: "libre",
    pourcentageLibre: 40,
    numero: "FA-2026-OUSSARA-COMBLES-01",
    designationMarche: TITRE_OUSSARA_COMBLES,
    statut: "attente",
    suiteEcheancier: `Solde à l'achèvement des travaux (60 %) : ${euro(FINANCEMENT_OUSSARA_COMBLES.solde)} TTC. TVA 20 % construction neuve.`,
  };
}

function estMarcheOussaraCombles(marche?: MarcheFacturable | null): boolean {
  if (!marche) return false;
  if (marche.id === OUSSARA_COMBLES_DOSSIER_ID) return true;
  if (marche.ref === OUSSARA_COMBLES_DEVIS_NUMERO) return true;
  return /combles/i.test(`${marche.ref || ""} ${marche.designation || ""}`);
}

function estMarcheOussara(marche?: MarcheFacturable | null): boolean {
  if (!marche) return false;
  if (estMarcheOussaraCombles(marche)) return false;
  if (marche.id === OUSSARA_DOSSIER_ID) return true;
  if (marche.ref === OUSSARA_DEVIS_NUMERO) return true;
  return /oussara|colombier/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""} ${marche.adresse || ""}`);
}

function estMarcheCouty(marche?: MarcheFacturable | null): boolean {
  if (!marche) return true;
  if (marche.id === COUTY_ESCALIER_DOSSIER_ID) return true;
  if (marche.ref === COUTY_ESCALIER_CONTRAT_NUMERO) return true;
  return /couty/i.test(`${marche.nom || ""} ${marche.ref || ""}`);
}

function estMarcheGilbertas(marche?: MarcheFacturable | null): boolean {
  if (!marche) return false;
  if (marche.id === GILBERTAS_DOSSIER_ID) return true;
  if (marche.ref === GILBERTAS_REFERENCE || marche.ref === GILBERTAS_CONTRAT_NUMERO) return true;
  return /gilbertas/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""} ${marche.adresse || ""}`);
}

export function saisieFactureGilbertas(): SaisieFactureAcompte {
  return {
    client: `${CLIENT_GILBERTAS.civilite} ${CLIENT_GILBERTAS.nom}`,
    adresse: `Téléphone : ${CLIENT_GILBERTAS.telephoneAffiche}\nLieu d'exécution : ${LIEU_EXECUTION_GILBERTAS}`,
    referenceContrat: GILBERTAS_CONTRAT_NUMERO,
    dateContrat: GILBERTAS_CONTRAT_DATE,
    dateEmission: GILBERTAS_CONTRAT_DATE,
    montantTtc: TOTAUX_GILBERTAS.totalTtc,
    tauxTva: 10,
    typeAppel: "acompte30",
    pourcentageLibre: 30,
    numero: FACTURE_ACOMPTE_GILBERTAS.numero,
    designationMarche: `Marché de travaux Contractant Général — ${INTITULE_MARCHE_GILBERTAS} — ${LIEU_EXECUTION_GILBERTAS}`,
    statut: "attente",
    suiteEcheancier: `Échéance 40 % au démarrage des travaux : ${euro(FINANCEMENT_GILBERTAS.intermediaire)} TTC. Solde 30 % à la réception après PV sans réserve : ${euro(FINANCEMENT_GILBERTAS.solde)} TTC.`,
  };
}

function estMarcheAbdenabi(marche?: MarcheFacturable | null): boolean {
  if (!marche) return false;
  if (marche.id === ABDENABI_ID) return true;
  if (marche.ref === ABDENABI_DEVIS || marche.ref === ABDENABI_BDC || marche.ref === ABDENABI_FACTURE) return true;
  return /abdenabi|beloucif/i.test(`${marche.nom || ""} ${marche.ref || ""} ${marche.designation || ""}`);
}

export function saisieFactureAbdenabi(): SaisieFactureAcompte {
  return {
    client: ABDENABI_CLIENT_FACTURE,
    adresse: ABDENABI_ADRESSE_CHANTIER,
    referenceContrat: ABDENABI_DEVIS,
    dateContrat: ABDENABI_DATE_ISO,
    dateEmission: ABDENABI_DATE_ISO,
    montantTtc: ABDENABI_VENTE_TTC,
    tauxTva: ABDENABI_TVA_TAUX,
    typeAppel: "acompte30",
    pourcentageLibre: 30,
    numero: ABDENABI_FACTURE,
    designationMarche:
      "Marché signé — remplacement de chaudière murale gaz Saunier Duval Themafast Classic V 18/24 VMC Gaz, désembouage et protection magnétique.",
    statut: "attente",
  };
}

/** Cadre client A4 : rue et complément, puis code postal et ville. */
export function adresseCadreClient(adresse: string): string {
  const propre = adresse.trim();
  if (propre === ABDENABI_ADRESSE_CHANTIER) return ABDENABI_ADRESSE_CADRE;
  return propre;
}

export function saisiePourMarche(marche?: MarcheFacturable | null): SaisieFactureAcompte {
  if (estMarcheGilbertas(marche)) return saisieFactureGilbertas();
  if (estMarcheAbdenabi(marche)) return saisieFactureAbdenabi();
  if (estMarcheMasson(marche)) return saisieFactureMasson();
  if (estMarcheFariss(marche)) return saisieFactureFariss();
  if (estMarcheOussaraCombles(marche)) return saisieFactureOussaraCombles();
  if (estMarcheOussara(marche)) return saisieFactureOussara();
  if (estMarcheCouty(marche)) return saisieCouty();
  const base = saisieCouty();
  const client = (marche?.nom || "Client").trim();
  const token = tokenClient(client);
  const montant = Number(marche?.montantTtc);
  const travaux = (marche?.designation || "").trim();
  const taux = marche?.tauxTva;
  const tauxTva: TauxTvaFacture = taux === 5.5 || taux === 10 || taux === 20 ? taux : base.tauxTva;
  return {
    ...base,
    client,
    adresse: (marche?.adresse || "").trim(),
    referenceContrat: marche?.ref || "",
    montantTtc: Number.isFinite(montant) && montant > 0 ? round2(montant) : 0,
    tauxTva,
    numero: `FA-2026-${token}-01`,
    designationMarche: travaux || `Marché global de travaux signé — ${client}`,
    statut: "attente",
  };
}

/** Données réelles du lead cliqué. Couty ouvre le marché main courante, jamais un autre dossier. */
export function marcheFactureDepuisLead(lead?: LeadFacturable | null): MarcheFacturable {
  const nom =
    [lead?.prenom, lead?.nomFamille].filter(Boolean).join(" ").trim() || (lead?.nom || "Client").trim();
  const indice = `${nom} ${lead?.ville || ""} ${lead?.region || ""} ${lead?.notes || ""} ${lead?.typeTravaux || ""} ${lead?.typeProjet || ""} ${lead?.reference || ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  if (indice.includes("gilbertas") || indice.includes("clermont")) {
    return {
      id: GILBERTAS_DOSSIER_ID,
      nom: `${CLIENT_GILBERTAS.civilite} ${CLIENT_GILBERTAS.nom}`,
      ref: GILBERTAS_CONTRAT_NUMERO,
      montantTtc: TOTAUX_GILBERTAS.totalTtc,
      adresse: `Téléphone : ${CLIENT_GILBERTAS.telephoneAffiche}\nLieu d'exécution : ${LIEU_EXECUTION_GILBERTAS}`,
      designation: saisieFactureGilbertas().designationMarche,
      tauxTva: 10,
    };
  }
  if (indice.includes("abdenabi") || indice.includes("beloucif")) {
    return {
      id: ABDENABI_ID,
      nom: ABDENABI_CLIENT_FACTURE,
      ref: ABDENABI_DEVIS,
      montantTtc: ABDENABI_VENTE_TTC,
      adresse: ABDENABI_ADRESSE_CHANTIER,
      designation: saisieFactureAbdenabi().designationMarche,
      tauxTva: ABDENABI_TVA_TAUX,
    };
  }
  if (indice.includes("masson") || indice.includes("kristell")) {
    return {
      id: MASSON_DOSSIER_ID,
      nom: CLIENT_MASSON.libelleSignature,
      ref: MASSON_DEVIS_NUMERO,
      montantTtc: TOTAUX_MASSON.totalTtc,
      adresse: CLIENT_MASSON.adresse,
      designation: TITRE_MASSON,
      tauxTva: 10,
    };
  }
  if (indice.includes("fariss") || indice.includes("ricamarie") || indice.includes("maprimeadapt")) {
    return {
      id: FARISS_DOSSIER_ID,
      nom: CLIENT_FARISS.libelleSignature,
      ref: FARISS_DEVIS_NUMERO,
      montantTtc: TOTAUX_FARISS.totalTtc,
      adresse: CLIENT_FARISS.adresse,
      designation: TITRE_FARISS,
      tauxTva: 10,
    };
  }
  if (indice.includes("combles")) {
    return {
      id: OUSSARA_COMBLES_DOSSIER_ID,
      nom: CLIENT_OUSSARA_COMBLES.libelleSignature,
      ref: OUSSARA_COMBLES_DEVIS_NUMERO,
      montantTtc: TOTAUX_OUSSARA_COMBLES.totalTtc,
      adresse: CLIENT_OUSSARA_COMBLES.adresse,
      designation: TITRE_OUSSARA_COMBLES,
      tauxTva: 20,
    };
  }
  if (indice.includes("oussara") || indice.includes("colombier")) {
    return {
      id: OUSSARA_DOSSIER_ID,
      nom: CLIENT_OUSSARA.libelleSignature,
      ref: OUSSARA_DEVIS_NUMERO,
      montantTtc: TOTAUX_OUSSARA.totalTtc,
      adresse: CLIENT_OUSSARA.adresse,
      designation: TITRE_OUSSARA,
      tauxTva: 20,
    };
  }
  if (indice.includes("couty") || indice.includes("mably") || indice.includes("main courante")) {
    return {
      id: COUTY_ESCALIER_DOSSIER_ID,
      nom: CLIENT_COUTY.libelleSignature,
      ref: COUTY_ESCALIER_CONTRAT_NUMERO,
      montantTtc: TOTAUX_COUTY.totalTtc,
      adresse: CLIENT_COUTY.adresse,
      designation: DESIGNATION_COUTY,
    };
  }
  const montant = Number(lead?.budget ?? lead?.caTtc);
  const adresse = (lead?.adresse || lead?.address || lead?.ville || lead?.region || "").trim();
  const travaux = (lead?.typeTravaux || lead?.typeProjet || "").trim();
  return {
    id: lead?.id,
    nom,
    ref: lead?.reference || "",
    montantTtc: Number.isFinite(montant) && montant > 0 ? montant : undefined,
    adresse,
    designation: travaux ? `Marché global de travaux signé — ${travaux}` : `Marché global de travaux signé — ${nom}`,
  };
}

function lireStatut(numero: string): StatutFactureAcompte | null {
  try {
    const valeur = sessionStorage.getItem(`energia-facture-acompte:${numero}`);
    return valeur === "encaisse" || valeur === "attente" ? valeur : null;
  } catch {
    return null;
  }
}

function ecrireStatut(numero: string, statut: StatutFactureAcompte) {
  try {
    sessionStorage.setItem(`energia-facture-acompte:${numero}`, statut);
  } catch {
    /* session indisponible */
  }
}

const inputClass =
  "mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#f9c74f]";

export default function FactureAcompteModal({
  ouvert,
  onFermer,
  marche = null,
  appel,
  pourcentageLibre,
  suffixeNumero,
  lienPaiement = "",
}: Props) {
  const [saisie, setSaisie] = useState<SaisieFactureAcompte>(() => saisiePourMarche(marche));
  const [libelleManuel, setLibelleManuel] = useState<string | null>(null);

  useEffect(() => {
    if (!ouvert) return;
    const base = saisiePourMarche(marche);
    const numero = suffixeNumero ? base.numero.replace(/-01$/, suffixeNumero) : base.numero;
    const prochaine: SaisieFactureAcompte = appel
      ? {
          ...base,
          numero,
          typeAppel: appel,
          pourcentageLibre: pourcentageLibre ?? base.pourcentageLibre,
        }
      : { ...base, numero };
    const statutMemoire = lireStatut(prochaine.numero);
    setSaisie(statutMemoire ? { ...prochaine, statut: statutMemoire } : prochaine);
    setLibelleManuel(null);
  }, [ouvert, marche?.id, marche?.nom, marche?.ref, marche?.montantTtc, marche?.adresse, marche?.designation, marche?.tauxTva, appel, pourcentageLibre, suffixeNumero]);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      onFermer();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [ouvert, onFermer]);

  const decompte = useMemo(() => calculerDecompte(saisie), [saisie]);
  const libelle = (libelleManuel ?? libelleSuggereAffiche(saisie)).trim();
  const marcheCouty = saisie.referenceContrat === COUTY_ESCALIER_CONTRAT_NUMERO;
  const echeancierAtipique =
    marcheCouty && saisie.typeAppel !== "acompte30" && !(saisie.typeAppel === "libre" && decompte.pourcentage === 70);
  const saisieInvalide =
    !saisie.client.trim() || !saisie.numero.trim() || !(saisie.montantTtc > 0) || decompte.pourcentage <= 0;

  function maj<K extends keyof SaisieFactureAcompte>(cle: K, valeur: SaisieFactureAcompte[K]) {
    setSaisie((prev) => {
      const next = { ...prev, [cle]: valeur };
      if (cle === "statut" && typeof valeur === "string") ecrireStatut(next.numero, valeur);
      if (cle === "numero" && typeof valeur === "string") {
        const memoire = lireStatut(valeur);
        if (memoire) next.statut = memoire;
      }
      return next;
    });
  }

  if (!ouvert || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="facture-acompte-overlay fixed inset-0 z-[96] flex flex-col bg-[#102a43] lg:flex-row"
      role="dialog"
      aria-modal="true"
      aria-labelledby="facture-acompte-titre"
      data-testid="modal-facture-acompte"
    >
      <style>{PRINT_CSS}</style>

      <aside className="facture-acompte-noprint flex max-h-[46vh] w-full shrink-0 flex-col overflow-y-auto border-b border-white/10 lg:max-h-none lg:w-[440px] lg:border-b-0 lg:border-r">
        <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f9c74f]">
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Contractant Général
            </p>
            <h2 id="facture-acompte-titre" className="mt-1 text-xl font-semibold text-white">
              Facture d&apos;acompte
            </h2>
            <p className="mt-1 text-sm text-slate-300">Appel de fonds n° 1 — 30 % à la commande, éditable avant impression.</p>
          </div>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-white/15 px-2.5 py-1 text-sm text-slate-200 hover:bg-white/10"
            aria-label="Fermer la facture d'acompte"
          >
            Fermer
          </button>
        </div>

        <form
          className="space-y-5 px-5 pb-6"
          onSubmit={(event) => {
            event.preventDefault();
            if (!saisieInvalide) window.print();
          }}
        >
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">
              Informations client &amp; chantier
            </legend>
            <label className="block text-xs text-slate-300">
              Nom du client
              <input className={inputClass} value={saisie.client} onChange={(event) => maj("client", event.target.value)} />
            </label>
            <label className="block text-xs text-slate-300">
              Adresse
              <textarea
                className={`${inputClass} min-h-16 resize-y`}
                value={saisie.adresse}
                onChange={(event) => maj("adresse", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Référence contrat lié
              <input
                className={inputClass}
                value={saisie.referenceContrat}
                onChange={(event) => maj("referenceContrat", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Date du contrat
              <input
                type="date"
                className={inputClass}
                value={saisie.dateContrat}
                onChange={(event) => maj("dateContrat", event.target.value)}
              />
            </label>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">
              Paramètres financiers du marché
            </legend>
            <label className="block text-xs text-slate-300">
              Montant total du marché TTC
              <input
                type="number"
                min="0"
                step="0.01"
                className={inputClass}
                value={Number.isFinite(saisie.montantTtc) ? saisie.montantTtc : ""}
                onChange={(event) => maj("montantTtc", event.target.value === "" ? 0 : Number(event.target.value))}
              />
            </label>
            <label className="block text-xs text-slate-300">
              TVA
              <select
                className={inputClass}
                value={String(saisie.tauxTva)}
                onChange={(event) => maj("tauxTva", Number(event.target.value) as TauxTvaFacture)}
              >
                {TAUX_OPTIONS.map((option) => (
                  <option key={option.valeur} value={option.valeur}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="space-y-2">
              <p className="text-xs text-slate-300">Type d&apos;appel de fonds</p>
              {APPELS.map((appel) => (
                <label key={appel.id} className="flex cursor-pointer items-start gap-2 text-sm text-slate-100">
                  <input
                    type="radio"
                    name="type-appel"
                    className="mt-1 accent-[#f9c74f]"
                    checked={saisie.typeAppel === appel.id}
                    onChange={() => maj("typeAppel", appel.id)}
                  />
                  <span>{appel.label}</span>
                </label>
              ))}
              {saisie.typeAppel === "libre" ? (
                <label className="block text-xs text-slate-300">
                  Pourcentage libre
                  <input
                    type="number"
                    min="0.01"
                    max="100"
                    step="0.01"
                    className={inputClass}
                    value={saisie.pourcentageLibre}
                    onChange={(event) => maj("pourcentageLibre", Number(event.target.value))}
                  />
                </label>
              ) : null}
              {echeancierAtipique ? (
                <p className="rounded-lg border border-[#f9c74f]/40 bg-[#f9c74f]/10 px-3 py-2 text-xs leading-relaxed text-[#f9c74f]">
                  Marché Couty : l&apos;échéancier signé est 30 % à la commande ({euro(445.5)}) puis 70 % à la réception (
                  {euro(1039.5)}). L&apos;appel 40 % ne figure pas à ce contrat.
                </p>
              ) : null}
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-[#2d8a4e]">Numérotation</legend>
            <label className="block text-xs text-slate-300">
              Numéro de facture
              <input className={inputClass} value={saisie.numero} onChange={(event) => maj("numero", event.target.value)} />
            </label>
            <label className="block text-xs text-slate-300">
              Date d&apos;émission
              <input
                type="date"
                className={inputClass}
                value={saisie.dateEmission}
                onChange={(event) => maj("dateEmission", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Désignation du marché
              <textarea
                className={`${inputClass} min-h-20 resize-y`}
                value={saisie.designationMarche}
                onChange={(event) => maj("designationMarche", event.target.value)}
              />
            </label>
            <label className="block text-xs text-slate-300">
              Libellé de virement obligatoire
              <input
                className={inputClass}
                value={libelleManuel ?? libelleVirementSuggere(saisie)}
                onChange={(event) => setLibelleManuel(event.target.value)}
              />
            </label>
            {libelleManuel !== null ? (
              <button type="button" className="text-xs text-[#f9c74f] underline" onClick={() => setLibelleManuel(null)}>
                Revenir au libellé automatique
              </button>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-300">Statut</span>
              <button
                type="button"
                onClick={() => maj("statut", saisie.statut === "encaisse" ? "attente" : "encaisse")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  saisie.statut === "encaisse"
                    ? "border-[#2d8a4e] bg-[#1a5c2e] text-white"
                    : "border-[#f9c74f] bg-[#f9c74f]/15 text-[#f9c74f]"
                }`}
              >
                {saisie.statut === "encaisse" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                ) : (
                  <CreditCard className="h-3.5 w-3.5" aria-hidden />
                )}
                {saisie.statut === "encaisse" ? "Encaissé" : "En attente de virement"}
              </button>
            </div>
          </fieldset>

          <div className="rounded-2xl border border-[#f9c74f]/40 bg-[#1a5c2e]/40 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f9c74f]">Net à payer</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-white" data-testid="facture-acompte-net">
              {euro(decompte.appelTtc)} TTC
            </p>
            <p className="mt-1 text-xs text-slate-200">
              Base HT {euro(decompte.appelHt)} · TVA {formatPourcent(saisie.tauxTva)} % {euro(decompte.appelTva)}
            </p>
            <button
              type="submit"
              disabled={saisieInvalide}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a5c2e] px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#2d8a4e] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer / enregistrer en PDF
            </button>
          </div>
        </form>
      </aside>

      <div className="min-h-0 flex-1 overflow-auto bg-slate-200">
        <div className="facture-acompte-noprint sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 bg-white/95 px-4 py-3">
          <p className="text-sm font-medium text-[#102a43]">Aperçu A4 — obligations art. 289 du CGI</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              disabled={saisieInvalide}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1a5c2e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#2d8a4e] disabled:opacity-50"
            >
              <Printer className="h-4 w-4" aria-hidden />
              Imprimer
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              disabled={saisieInvalide}
              title="Dans la fenêtre d'impression, choisir Enregistrer au format PDF"
              className="inline-flex items-center gap-2 rounded-xl border border-[#1a5c2e] bg-white px-3 py-2 text-sm font-semibold text-[#1a5c2e] hover:bg-emerald-50 disabled:opacity-50"
            >
              <Download className="h-4 w-4" aria-hidden />
              PDF
            </button>
          </div>
        </div>

        <div className="px-4 py-6">
          <FeuilleAcompte saisie={saisie} decompte={decompte} libelleVirement={libelle} lienPaiement={lienPaiement} onBasculerStatut={() => maj("statut", saisie.statut === "encaisse" ? "attente" : "encaisse")} />
        </div>
      </div>
    </div>,
    document.body,
  );
}

function libelleSuggereAffiche(saisie: SaisieFactureAcompte): string {
  return libelleVirementSuggere(saisie);
}

function titrePrincipalFeuille(saisie: SaisieFactureAcompte, decompte: DecompteAcompte): string {
  if (saisie.typeAppel === "acompte30") return "FACTURE D'ACOMPTE — APPEL DE FONDS N° 1 (30 %)";
  if (saisie.typeAppel === "intermediaire40") return "APPEL DE FONDS INTERMÉDIAIRE — N° 2 (40 %)";
  if (saisie.typeAppel === "solde30") return "FACTURE DE SOLDE — APPEL DE FONDS (30 %)";
  return `${titreFacture(saisie.typeAppel, decompte.pourcentage)} — APPEL DE FONDS (${formatPourcent(decompte.pourcentage)} %)`;
}

function libelleLigneMarcheAppel(saisie: SaisieFactureAcompte, decompte: DecompteAcompte): string {
  if (saisie.typeAppel === "acompte30") return "Appel de fonds — Acompte 30 % exigible à la signature";
  return libelleLigneAppel(saisie.typeAppel, decompte.pourcentage);
}

function FeuilleAcompte({
  saisie,
  decompte,
  libelleVirement,
  lienPaiement = "",
  onBasculerStatut,
}: {
  saisie: SaisieFactureAcompte;
  decompte: DecompteAcompte;
  libelleVirement: string;
  lienPaiement?: string;
  onBasculerStatut: () => void;
}) {
  const encaisse = saisie.statut === "encaisse";
  const montantMarche = round2(saisie.montantTtc || 0);
  const cellule = "border border-[#cbd5e1] px-[1.6mm] py-[1.4mm] align-top";
  const montant = `${cellule} text-right tabular-nums whitespace-nowrap`;

  return (
    <article
      id="facture-acompte-a4"
      data-testid="facture-acompte-a4"
      className="facture-acompte-a4 mx-auto flex h-[297mm] w-[210mm] max-w-full flex-col overflow-hidden bg-white px-[11mm] pt-[10mm] pb-[8mm] text-[#0B1F3A] shadow-[0_12px_40px_rgba(11,31,58,0.16)]"
    >
      <header className="border-b-[3px] border-[#059669] pb-[2.5mm]">
        <div className="flex items-start justify-between gap-[5mm]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[3.2mm]">
              <img
                src="/logo-energia.png"
                alt="Logo ENERGIA CONSEIL IA®"
                className="facture-acompte-logo h-[14mm] w-auto shrink-0 object-contain object-left"
              />
              <div className="min-w-0">
                <p className="text-[13pt] font-extrabold leading-none tracking-[0.02em] text-[#059669]">
                  ENERGIA CONSEIL IA®
                </p>
                <p className="mt-[0.8mm] text-[7.5pt] leading-snug text-[#475569]">
                  {BRANDING.slogan} · Marque déposée INPI n° {BRANDING.inpi}
                </p>
              </div>
            </div>
            <p className="mt-[1.8mm] text-[7.5pt] leading-[1.35] text-[#475569]">
              {BRANDING.forme} au capital de {BRANDING.capital} — {BRANDING.siege}
              <br />
              SIRET {BRANDING.siretAffiche} — RCS {BRANDING.rcsAffiche} — TVA {BRANDING.tva} — APE {BRANDING.ape}
              <br />
              {ASSURANCE_FACTURE}
              <br />
              Direction &amp; Contractant Général : Sylvain LEMBELEMBE — {BRANDING.telephone} — {BRANDING.email}
            </p>
          </div>
          <aside className="w-[68mm] shrink-0 border border-[#0B1F3A] px-[3mm] py-[2.2mm] text-[8pt] leading-snug text-[#475569]">
            <p className="text-[7.5pt] font-extrabold uppercase tracking-[0.08em] text-[#0B1F3A]">N° Facture d&apos;acompte</p>
            <p className="mt-[0.6mm] text-[10pt] font-extrabold leading-tight text-[#0B1F3A]">{saisie.numero || "—"}</p>
            <p className="mt-[1.6mm]">Date d&apos;émission : {dateLongue(saisie.dateEmission)}</p>
            <p>Réf. marché lié : {saisie.referenceContrat || "—"}</p>
            <p>Date du contrat : {dateCourte(saisie.dateContrat)}</p>
            <p className="mt-[1mm] font-semibold text-[#0B1F3A]">Montant total du marché : {euro(montantMarche)} TTC</p>
            <button
              type="button"
              onClick={onBasculerStatut}
              className={`facture-acompte-statut mt-[1.6mm] inline-flex items-center gap-1 border px-[1.6mm] py-[0.6mm] text-[7.5pt] font-semibold ${
                encaisse ? "border-[#059669] text-[#065f46]" : "border-[#cbd5e1] text-[#0B1F3A]"
              }`}
            >
              {encaisse ? <CheckCircle2 className="h-3 w-3" aria-hidden /> : <CreditCard className="h-3 w-3" aria-hidden />}
              {encaisse ? "Encaissé" : "En attente de virement"}
            </button>
          </aside>
        </div>
        <h1 className="mt-[3mm] border-b-2 border-[#059669] pb-[1.2mm] text-center text-[11pt] font-extrabold uppercase tracking-[0.03em] text-[#0B1F3A]">
          {titrePrincipalFeuille(saisie, decompte)}
        </h1>
      </header>

      <section className="mt-[3.5mm]">
        <h2 className="border-b border-[#059669]/40 pb-[1mm] text-[10pt] font-extrabold text-[#059669]">
          I. Identification des parties
        </h2>
        <table className="mt-[2mm] w-full border-collapse text-[8pt]">
          <thead>
            <tr className="facture-acompte-entete bg-[#1a5c2e] text-left text-white">
              <th className="w-1/2 border border-[#1a5c2e] px-[2.5mm] py-[1.6mm] font-semibold">Contractant Général</th>
              <th className="w-1/2 border border-[#1a5c2e] px-[2.5mm] py-[1.6mm] font-semibold">Client</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[#cbd5e1] px-[2.5mm] py-[1.8mm] leading-snug text-[#334155]">
                <strong className="text-[#0B1F3A]">{BRANDING.nom}</strong>
                <br />
                {BRANDING.forme} au capital de {BRANDING.capital}
                <br />
                SIRET {BRANDING.siretAffiche} — RCS {BRANDING.rcsAffiche}
                <br />
                {BRANDING.siege}
                <br />
                {ASSURANCE_FACTURE}
              </td>
              <td className="border border-[#cbd5e1] px-[2.5mm] py-[1.8mm] leading-snug text-[#334155]">
                <strong className="text-[#0B1F3A]">{saisie.client || "—"}</strong>
                <br />
                {adresseCadreClient(saisie.adresse) ? (
                  <span className="whitespace-pre-line">{adresseCadreClient(saisie.adresse)}</span>
                ) : null}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-[3.5mm]">
        <h2 className="border-b border-[#059669]/40 pb-[1mm] text-[10pt] font-extrabold text-[#059669]">
          II. Détail des prestations
        </h2>
        <table className="mt-[2mm] w-full border-collapse text-[7.2pt]">
          <thead>
            <tr className="facture-acompte-entete bg-[#0B1F3A] text-left text-[6.6pt] uppercase tracking-wide text-white">
              <th className={`${cellule} border-[#0B1F3A] w-[8mm] font-semibold`}>N°</th>
              <th className={`${cellule} border-[#0B1F3A] font-semibold`}>Désignation détaillée &amp; spécifications</th>
              <th className={`${cellule} border-[#0B1F3A] w-[10mm] text-right font-semibold`}>Qté</th>
              <th className={`${cellule} border-[#0B1F3A] w-[12mm] font-semibold`}>Unité</th>
              <th className={`${cellule} border-[#0B1F3A] w-[22mm] text-right font-semibold`}>PU HT</th>
              <th className={`${cellule} border-[#0B1F3A] w-[22mm] text-right font-semibold`}>Total HT</th>
              <th className={`${cellule} border-[#0B1F3A] w-[24mm] text-right font-semibold`}>TVA</th>
              <th className={`${cellule} border-[#0B1F3A] w-[24mm] text-right font-semibold`}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={`${cellule} text-right font-bold text-[#059669]`}>1</td>
              <td className={cellule}>
                <p className="font-semibold text-[#0B1F3A]">Rappel du marché signé</p>
                <p className="mt-[0.4mm] font-normal leading-snug text-[#475569]">{saisie.designationMarche}</p>
              </td>
              <td className={`${montant} font-semibold`}>1</td>
              <td className={cellule}>ens.</td>
              <td className={`${montant} font-semibold`}>{euro(decompte.htMarche)}</td>
              <td className={`${montant} font-semibold`}>{euro(decompte.htMarche)}</td>
              <td className={montant}>
                {formatPourcent(saisie.tauxTva)} % · {euro(decompte.tvaMarche)}
              </td>
              <td className={`${montant} font-semibold`}>{euro(montantMarche)}</td>
            </tr>
            <tr className="bg-[#ecfdf5]">
              <td className={`${cellule} text-right font-bold text-[#059669]`}>2</td>
              <td className={cellule}>
                <p className="font-semibold text-[#0B1F3A]">{libelleLigneMarcheAppel(saisie, decompte)}</p>
                <p className="mt-[0.4mm] font-normal leading-snug text-[#475569]">
                  Quote-part exigible du marché {saisie.referenceContrat || "lié"} — {formatPourcent(decompte.pourcentage)} %
                </p>
              </td>
              <td className={`${montant} font-semibold`}>1</td>
              <td className={cellule}>u</td>
              <td className={`${montant} font-semibold`}>{euro(decompte.appelHt)}</td>
              <td className={`${montant} font-semibold`}>{euro(decompte.appelHt)}</td>
              <td className={montant}>
                {formatPourcent(saisie.tauxTva)} % · {euro(decompte.appelTva)}
              </td>
              <td className={`${montant} font-semibold`}>{euro(decompte.appelTtc)}</td>
            </tr>
          </tbody>
        </table>

        <div className="mt-[3mm] grid grid-cols-[1fr_68mm] gap-[4mm]">
          <p className="text-[8pt] leading-snug text-[#475569]">{phraseResteDu(saisie, decompte)}</p>
          <div className="border border-[#0B1F3A] text-[8pt]">
            <div className="flex justify-between gap-3 px-[3mm] py-[1.3mm]">
              <span>Base HT</span>
              <span className="font-semibold tabular-nums">{euro(decompte.appelHt)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-slate-200 px-[3mm] py-[1.3mm]">
              <span>TVA {formatPourcent(saisie.tauxTva)} %</span>
              <span className="font-semibold tabular-nums">{euro(decompte.appelTva)}</span>
            </div>
            <div className="facture-acompte-entete flex justify-between gap-3 bg-[#0B1F3A] px-[3mm] py-[1.8mm] text-[10pt] font-extrabold text-white">
              <span>Net à payer</span>
              <span data-testid="facture-acompte-net" className="tabular-nums">
                {euro(decompte.appelTtc)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-[3.5mm] border border-[#0B1F3A] px-[3mm] py-[2.2mm] text-[8pt] leading-snug text-[#334155]">
        <p className="text-[8pt] font-extrabold text-[#0B1F3A]">Règlement par virement — RIB Qonto</p>
        <p className="mt-[1.2mm]">
          Titulaire : {RIB_QONTO.titulaire} — {RIB_QONTO.adresseTitulaire}
        </p>
        <p>
          Banque : {RIB_QONTO.banque} — {RIB_QONTO.adresseBanque}
        </p>
        <p className="mt-[1mm] font-semibold tabular-nums text-[#0B1F3A]">IBAN : {RIB_QONTO.iban}</p>
        <p className="font-semibold tabular-nums text-[#0B1F3A]">BIC / SWIFT : {RIB_QONTO.bic}</p>
        <p className="mt-[1mm]">Libellé de virement obligatoire : « {libelleVirement || "—"} »</p>
        {lienPaiement ? <p className="mt-[1mm]">Lien de paiement : {lienPaiement}</p> : null}
      </section>

      <footer className="mt-auto border-t border-slate-200 pt-[2.2mm] text-[6.4pt] leading-snug text-[#64748b]">
        <p>Facture d&apos;acompte établie conformément à l&apos;article 289 du CGI. TVA acquittée sur les encaissements.</p>
        <p>Règlement par virement bancaire à réception. Indemnité forfaitaire pour frais de recouvrement : 40 €.</p>
        <p className="mt-[1mm] text-[#0f172a]">
          {BRANDING.nom} — {BRANDING.forme} au capital de {BRANDING.capital} — {BRANDING.siege} — SIRET {BRANDING.siretAffiche}
        </p>
      </footer>
    </article>
  );
}
