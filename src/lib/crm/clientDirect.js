/**
 * Création d'un client direct (Sylvain) : devis indicatif, marge CG et aides Anah 2026.
 * Les aides restent une estimation. Le barème hors Île-de-France est celui du CRM.
 */

import {
  ETAPE_ANAH_AUDIT,
  PLAFONDS_PARCOURS_ACCOMPAGNE_HT,
  PRISE_EN_CHARGE_MAR_2026,
  SOURCE_APPORTEUR_DIRECT,
  STATUT_COMMISSION_EN_ATTENTE,
  TAUX_TRAVAUX_PARCOURS_2026,
  libelleSourceApporteur,
  profilDepuisRfrHorsIdf,
  seuilsRfrHorsIdf,
} from "./operationnelCrm.js";
import {
  STORAGE_PROJETS_MANUELS,
  estDoublonProjet,
  lireProjetsManuels,
  parserRfr,
} from "./projetsManuels.js";
import { extraireLocalisation } from "./releveTerrainCatarina.js";

export const MARGE_CG_CLIENT_DIRECT_HT = 5200;
export const TAUX_TVA_CG = 0.2;
export const HONORAIRES_MAR_TTC = PRISE_EN_CHARGE_MAR_2026.plafondTtc;
export const STATUT_CLIENT_DIRECT = "Devis en attente de signature";
export const SOURCE_CLIENT_DIRECT = "client-direct";

export const PROFILS_ANAH_COULEUR = {
  bleu: { id: "bleu", label: "Bleu", titre: "Très modeste" },
  jaune: { id: "jaune", label: "Jaune", titre: "Modeste" },
  violet: { id: "violet", label: "Violet", titre: "Intermédiaire" },
  rose: { id: "rose", label: "Rose", titre: "Supérieur" },
};

export const SAUTS_CLASSES = [
  { id: 2, label: "2 classes", plafondHt: PLAFONDS_PARCOURS_ACCOMPAGNE_HT.deuxClasses },
  { id: 3, label: "3 classes", plafondHt: PLAFONDS_PARCOURS_ACCOMPAGNE_HT.troisClassesOuPlus },
  { id: 4, label: "4 classes ou plus", plafondHt: PLAFONDS_PARCOURS_ACCOMPAGNE_HT.troisClassesOuPlus },
];

/** Forfaits indicatifs 2026, ordre optimal. Le photovoltaïque est hors assiette MaPrimeRénov' Parcours. */
export const POSTES_CLIENT_DIRECT = [
  { id: "combles", ordre: 1, nom: "Isolation des combles", spec: "R ≥ 7", ht: 2800, tauxTva: 0.055, eligibleAnah: true },
  { id: "murs", ordre: 2, nom: "Isolation des murs (ITE)", spec: "R ≥ 4", ht: 14000, tauxTva: 0.055, eligibleAnah: true },
  { id: "planchers", ordre: 3, nom: "Isolation des planchers", spec: "R ≥ 3", ht: 2400, tauxTva: 0.055, eligibleAnah: true },
  { id: "fenetres", ordre: 4, nom: "Menuiseries", spec: "Uw ≤ 1,3", ht: 7500, tauxTva: 0.055, eligibleAnah: true },
  { id: "vmc", ordre: 5, nom: "VMC double flux", spec: "Rendement ≥ 85 %", ht: 5500, tauxTva: 0.055, eligibleAnah: true },
  { id: "pac", ordre: 6, nom: "PAC air-eau", spec: "COP ≥ 4, dimensionnement post-isolation", ht: 12000, tauxTva: 0.055, eligibleAnah: true },
  { id: "ballon", ordre: 7, nom: "Ballon thermodynamique", spec: "COP ≥ 2,5", ht: 2800, tauxTva: 0.055, eligibleAnah: true },
  { id: "pv", ordre: 8, nom: "Photovoltaïque", spec: "En dernier, après réduction des besoins", ht: 8000, tauxTva: 0.1, eligibleAnah: false },
];

export const PHOTOS_CHANTIER_CLIENT_DIRECT = [
  { id: "facade", label: "Façade principale" },
  { id: "facade-arriere", label: "Façade arrière" },
  { id: "pignon", label: "Pignon" },
  { id: "toiture", label: "Toiture / combles" },
  { id: "menuiseries", label: "Menuiseries" },
  { id: "chauffage", label: "Chauffage / chaudière" },
  { id: "tableau", label: "Tableau électrique" },
  { id: "plancher", label: "Plancher bas / cave" },
  { id: "sejour", label: "Séjour" },
  { id: "eau", label: "Pièce d'eau" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function texte(value) {
  return typeof value === "string" ? value.trim() : "";
}

function round2(n) {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

export function libelleProfilAnah(profilId) {
  const profil = PROFILS_ANAH_COULEUR[profilId];
  return profil ? `${profil.label} — ${profil.titre}` : "";
}

export function calculerProfilAnahClient(rfr, personnes) {
  const revenu = parserRfr(rfr);
  const foyer = Math.max(1, Math.floor(Number(personnes) || 1));
  const profil = Number.isFinite(revenu) ? profilDepuisRfrHorsIdf(revenu, foyer) : null;
  const seuils = seuilsRfrHorsIdf(foyer);
  const taux = TAUX_TRAVAUX_PARCOURS_2026.find((item) => item.id === profil) || null;
  const mar = PRISE_EN_CHARGE_MAR_2026.profils.find((item) => item.id === profil) || null;
  return {
    rfr: Number.isFinite(revenu) ? revenu : null,
    personnes: foyer,
    profil,
    libelle: libelleProfilAnah(profil),
    seuils,
    tauxTravaux: taux?.tauxHt ?? null,
    ecretementTtc: taux?.ecretementTtc ?? null,
    aideMar: mar?.aide ?? null,
    resteMar: mar?.resteACharge ?? null,
  };
}

function ligneTravaux(poste) {
  const ht = round2(poste.ht);
  const tva = round2(ht * poste.tauxTva);
  return {
    id: poste.id,
    nom: poste.nom,
    spec: poste.spec,
    quantite: 1,
    unite: "forfait",
    prixVentePuHt: ht,
    tauxTva: poste.tauxTva,
    totalHt: ht,
    totalTva: tva,
    totalTtc: round2(ht + tva),
    eligibleAnah: poste.eligibleAnah === true,
    ordre: poste.ordre,
  };
}

export function calculerDevisClientDirect(posteIds, fiscalite, sautClasses) {
  const ids = new Set(Array.isArray(posteIds) ? posteIds : []);
  const postes = POSTES_CLIENT_DIRECT.filter((poste) => ids.has(poste.id)).sort((a, b) => a.ordre - b.ordre);
  const lignesTravaux = postes.map(ligneTravaux);
  const htCg = MARGE_CG_CLIENT_DIRECT_HT;
  const tvaCg = round2(htCg * TAUX_TVA_CG);
  const ligneCg = {
    id: "client-direct-direction-cg",
    nom: "Direction de projet — Contractant Général",
    spec: "Marge contractant général sanctuarisée",
    quantite: 1,
    unite: "forfait",
    prixVentePuHt: htCg,
    tauxTva: TAUX_TVA_CG,
    totalHt: htCg,
    totalTva: tvaCg,
    totalTtc: round2(htCg + tvaCg),
    eligibleAnah: false,
    ordre: 9,
    margeCg: true,
  };
  const lignes = [...lignesTravaux, ligneCg];
  const totalHt = round2(lignes.reduce((sum, ligne) => sum + ligne.totalHt, 0));
  const totalTva = round2(lignes.reduce((sum, ligne) => sum + ligne.totalTva, 0));
  const totalTtc = round2(totalHt + totalTva);
  const eligibles = lignesTravaux.filter((ligne) => ligne.eligibleAnah);
  const baseEligibleHt = round2(eligibles.reduce((sum, ligne) => sum + ligne.totalHt, 0));
  const baseEligibleTtc = round2(eligibles.reduce((sum, ligne) => sum + ligne.totalTtc, 0));
  const saut = SAUTS_CLASSES.find((item) => item.id === Number(sautClasses)) || null;
  const plafondHt = saut?.plafondHt ?? 0;
  const assietteHt = round2(Math.min(baseEligibleHt, plafondHt));
  const taux = fiscalite?.tauxTravaux ?? 0;
  let mpr = round2(assietteHt * taux);
  const plafondEcretement = round2(baseEligibleTtc * (fiscalite?.ecretementTtc ?? 0));
  if (plafondEcretement > 0 && mpr > plafondEcretement) mpr = plafondEcretement;
  if (mpr > totalTtc) mpr = totalTtc;
  const aideMar = fiscalite?.aideMar ?? 0;
  const resteMar = fiscalite?.resteMar ?? HONORAIRES_MAR_TTC;
  const totalAides = round2(mpr + aideMar);
  const resteTravaux = round2(Math.max(0, totalTtc - mpr));
  const resteGlobal = round2(resteTravaux + resteMar);
  const acompte = round2(totalTtc * 0.3);
  const intermediaire = round2(totalTtc * 0.4);
  const solde = round2(totalTtc - acompte - intermediaire);

  return {
    lignes,
    totalHt,
    totalTva,
    totalTtc,
    margeCgHt: htCg,
    margeCgTva: tvaCg,
    margeCgTtc: ligneCg.totalTtc,
    baseEligibleHt,
    baseEligibleTtc,
    plafondHt,
    assietteHt,
    tauxTravaux: taux,
    sautClasses: saut?.id ?? null,
    sautLibelle: saut?.label ?? "",
    mpr,
    honorairesMarTtc: HONORAIRES_MAR_TTC,
    aideMar,
    resteMar,
    totalAides,
    resteTravaux,
    resteGlobal,
    acompte,
    intermediaire,
    solde,
    profil: fiscalite?.profil ?? null,
    libelleProfil: fiscalite?.libelle ?? "",
    mention:
      "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.",
  };
}

export function validerClientDirect(brut = {}) {
  const erreurs = {};
  const nomFamille = texte(brut.nom);
  const prenom = texte(brut.prenom);
  const telephone = texte(brut.telephone);
  const email = texte(brut.email);
  const localisation = extraireLocalisation(brut.adresse);
  const fiscalite = calculerProfilAnahClient(brut.rfr, brut.personnes);
  const saut = SAUTS_CLASSES.find((item) => item.id === Number(brut.sautClasses)) || null;
  const posteIds = (Array.isArray(brut.posteIds) ? brut.posteIds : []).filter((id) =>
    POSTES_CLIENT_DIRECT.some((poste) => poste.id === id),
  );
  const numeroAuditMar = texte(brut.numeroAuditMar).toUpperCase();

  if (nomFamille.length < 2) erreurs.nom = "Nom requis.";
  if (prenom.length < 2) erreurs.prenom = "Prénom requis.";
  if (telephone.replace(/\D/g, "").length < 10) erreurs.telephone = "Téléphone requis.";
  if (email && !EMAIL_RE.test(email)) erreurs.email = "E-mail invalide.";
  if (!localisation.ok) erreurs.adresse = "Indiquez le code postal et la ville (ex. 12 rue des Lilas, 42510 Bussières).";
  if (!Number.isFinite(fiscalite.rfr)) erreurs.rfr = "Revenu fiscal de référence requis.";
  if (!fiscalite.profil) erreurs.profil = "Profil Anah impossible à calculer.";
  if (!saut) erreurs.sautClasses = "Choisissez le saut de classes prévu.";
  if (!posteIds.length) erreurs.postes = "Choisissez au moins un poste de travaux.";

  const photos = {};
  const sourcePhotos = brut.photos && typeof brut.photos === "object" ? brut.photos : {};
  for (const slot of PHOTOS_CHANTIER_CLIENT_DIRECT) {
    const valeur = sourcePhotos[slot.id];
    photos[slot.id] = typeof valeur === "string" && valeur.startsWith("data:image/") ? valeur : null;
  }

  return {
    ok: Object.keys(erreurs).length === 0,
    erreurs,
    valeurs: {
      nomFamille,
      prenom,
      nom: `${prenom} ${nomFamille}`.replace(/\s+/g, " ").trim(),
      telephone,
      email,
      adresse: localisation.adresse || texte(brut.adresse),
      codePostal: localisation.codePostal,
      ville: localisation.ville,
      fiscalite,
      saut,
      posteIds,
      numeroAuditMar,
      photos,
    },
  };
}

function ecrireListe(liste) {
  localStorage.setItem(STORAGE_PROJETS_MANUELS, JSON.stringify(liste));
}

export function enregistrerClientDirect(brut) {
  const validation = validerClientDirect(brut);
  if (!validation.ok) return { ok: false, erreurs: validation.erreurs, projet: null, liste: null };
  if (typeof localStorage === "undefined") {
    return { ok: false, erreurs: { formulaire: "Stockage local indisponible." }, projet: null, liste: null };
  }

  const valeurs = validation.valeurs;
  const devis = calculerDevisClientDirect(valeurs.posteIds, valeurs.fiscalite, valeurs.saut.id);
  const actuels = lireProjetsManuels();
  if (actuels.some((item) => estDoublonProjet(item, valeurs))) {
    return {
      ok: false,
      erreurs: { nom: "Un dossier existe déjà pour ce client et cette localisation." },
      projet: null,
      liste: actuels,
    };
  }

  const nbPhotos = Object.values(valeurs.photos).filter(Boolean).length;
  const projet = {
    id: `projet-manuel-${Date.now()}`,
    nom: valeurs.nom,
    prenom: valeurs.prenom,
    nomFamille: valeurs.nomFamille,
    ville: valeurs.ville,
    codePostal: valeurs.codePostal,
    adresse: valeurs.adresse,
    telephone: valeurs.telephone,
    email: valeurs.email,
    rfr: valeurs.fiscalite.rfr,
    personnesFoyer: valeurs.fiscalite.personnes,
    profilAnah: valeurs.fiscalite.profil,
    numeroAuditMar: valeurs.numeroAuditMar,
    sautClasses: valeurs.saut.id,
    statut: STATUT_CLIENT_DIRECT,
    source: SOURCE_CLIENT_DIRECT,
    origine: SOURCE_CLIENT_DIRECT,
    createdAt: new Date().toISOString().slice(0, 10),
    apporteurId: SOURCE_APPORTEUR_DIRECT,
    apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_DIRECT, { select: true }),
    etapeAnah: ETAPE_ANAH_AUDIT,
    validationMar: false,
    acompte30Encaisse: false,
    dateVisiteTechnique: "",
    consultationDuo: false,
    statutCommission: STATUT_COMMISSION_EN_ATTENTE,
    detailJalon: valeurs.numeroAuditMar
      ? `Jalon 1 — Audit MAR ${valeurs.numeroAuditMar}`
      : "Jalon 1 — Audit réglementaire à déposer",
    typeProjet: `Client direct — ${valeurs.saut.label} — profil ${valeurs.fiscalite.libelle}`,
    photos: { chantier: valeurs.photos },
    nbPhotos,
    posteIds: valeurs.posteIds,
    travaux: devis.lignes.map((ligne) => ({
      id: ligne.id,
      nom: ligne.nom,
      quantite: 1,
      unite: "forfait",
      prixVentePuHt: ligne.totalHt,
      tauxTva: ligne.tauxTva,
    })),
    devisIndicatif: devis,
    margeDirectionHt: devis.margeCgHt,
    margeDirectionTtc: devis.margeCgTtc,
  };

  try {
    const liste = [projet, ...actuels];
    ecrireListe(liste);
    return { ok: true, erreurs: {}, projet, liste, photosRetirees: false };
  } catch {
    const allege = { ...projet, photos: { chantier: {} }, nbPhotos: 0 };
    try {
      const liste = [allege, ...actuels];
      ecrireListe(liste);
      return { ok: true, erreurs: {}, projet: allege, liste, photosRetirees: true };
    } catch {
      return {
        ok: false,
        erreurs: { formulaire: "Mémoire locale saturée. Retirez quelques photos puis enregistrez à nouveau." },
        projet: null,
        liste: actuels,
      };
    }
  }
}
