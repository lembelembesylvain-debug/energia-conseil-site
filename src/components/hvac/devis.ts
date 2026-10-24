import {
  appointElectriqueKw,
  besoinAnnuelKwh,
  choisirModulesCascade,
  COEFFICIENTS_G,
  couvertureAnnuelle,
  debitM3h,
  DELTA_T_CHAUDIERE,
  DELTA_T_PAC,
  departementClimatique,
  dimensionnerBouteille,
  economieAnnuelle,
  pointBivalence,
  prixElectricite,
  puissanceDeperditionsKw,
  scopRetenu,
  volumeM3,
  volumeTamponMinL,
  volumeTamponStandardL,
} from "./calcul";
import type { AideCee, DevisPac, EtatPac, EtudePac, LigneDevisPac, MarquePac, ZoneCee } from "./types";

const PRIX_MWH_CUMAC = 7.2;

const BAR_TH_104: Record<ZoneCee, number> = { H1: 4400, H2: 3600, H3: 2500 };

const CUMAC_PAC_M2: Record<string, Record<ZoneCee, number>> = {
  bureaux: { H1: 520, H2: 420, H3: 280 },
  commerce: { H1: 390, H2: 310, H3: 210 },
  entrepot: { H1: 160, H2: 120, H3: 80 },
  collectif: { H1: 260, H2: 210, H3: 140 },
};

const CUMAC_GTB_M2: Record<ZoneCee, number> = { H1: 210, H2: 170, H3: 110 };

const MARQUES: Record<MarquePac, string> = {
  daikin: "Daikin",
  mitsubishi: "Mitsubishi",
  viessmann: "Viessmann",
};

function argent(valeur: number): number {
  return Math.round(valeur);
}

function ligne(
  id: string,
  famille: LigneDevisPac["famille"],
  designation: string,
  quantite: number,
  unite: string,
  puHt: number,
  coutUnitaireHt: number,
): LigneDevisPac {
  const qte = Math.round(quantite * 100) / 100;
  return {
    id,
    famille,
    designation,
    quantite: qte,
    unite,
    puHt: argent(puHt),
    totalHt: argent(qte * puHt),
    coutHt: argent(qte * coutUnitaireHt),
  };
}

function eurAide(cumacKwh: number): number {
  return argent((Math.max(0, cumacKwh) / 1000) * PRIX_MWH_CUMAC);
}

export function evaluerPac(etat: EtatPac, dossierId: string | null): EtudePac {
  const climat = departementClimatique(etat.departement);
  const volume = volumeM3(etat.surfaceM2, etat.hauteurM);
  const g = COEFFICIENTS_G[etat.isolation].g;
  const pDepKw = puissanceDeperditionsKw(volume, g, etat.tint, climat.textBase);
  const tertiaire = etat.typeBatiment === "tertiaire";
  const collectif = etat.typeBatiment === "collectif";
  const grand = tertiaire || collectif;

  let puissancePacKw = 0;
  let ratioCouvertureBase = 0;
  let appointElectriqueKwValeur = 0;
  let alerteAppoint: string | null = null;
  let modules: EtudePac["modules"] = null;
  let puissanceChaudiereKw = 0;

  if (etat.mode === "thermo") {
    ratioCouvertureBase = etat.ratioThermo;
    puissancePacKw = Math.ceil(pDepKw * ratioCouvertureBase * 2) / 2;
    appointElectriqueKwValeur = appointElectriqueKw(pDepKw, ratioCouvertureBase);
    const manque = pDepKw * (1 - ratioCouvertureBase);
    if (manque > appointElectriqueKwValeur + 0.2) {
      alerteAppoint = `L'appoint ${appointElectriqueKwValeur} kW ne couvre pas les ${manque.toFixed(1)} kW restants. Passer en cascade ou en relève de chaudière.`;
    }
  } else if (etat.mode === "cascade") {
    const choix = choisirModulesCascade(pDepKw, etat.nombreModules);
    modules = choix;
    puissancePacKw = choix.totalKw;
    ratioCouvertureBase = pDepKw > 0 ? puissancePacKw / pDepKw : 0;
    if (pDepKw > 0 && pDepKw < 36) {
      alerteAppoint = "La cascade est prévue pour 36 à 400 kW. La puissance du bâtiment est en dessous de cette plage.";
    }
    if (puissancePacKw < pDepKw - 0.5) {
      alerteAppoint = `La cascade ${puissancePacKw} kW reste sous les déperditions ${pDepKw.toFixed(1)} kW. Ajouter un module ou monter en gamme.`;
    }
  } else {
    ratioCouvertureBase = 0.6;
    puissancePacKw = Math.ceil(pDepKw * 0.6 * 2) / 2;
    puissanceChaudiereKw = Math.ceil(pDepKw * 2) / 2;
  }

  const ratioBivalence = pDepKw > 0 ? Math.min(1, puissancePacKw / pDepKw) : 0;
  const tbiv = pointBivalence(etat.tint, climat.textBase, etat.mode === "hybride" ? 0.6 : ratioBivalence);
  const couverture = couvertureAnnuelle(etat.mode, ratioBivalence);
  const debitPac = debitM3h(puissancePacKw, DELTA_T_PAC);
  const debitChaudiere = debitM3h(puissancePacKw, DELTA_T_CHAUDIERE);
  const tamponMin = volumeTamponMinL(puissancePacKw);
  const bouteille = dimensionnerBouteille(debitPac);
  const besoin = besoinAnnuelKwh(pDepKw, etat.tint, climat.textBase, climat.dju);
  const bilan = economieAnnuelle({
    besoinKwh: besoin,
    couverture,
    scop: scopRetenu(etat.mode),
    energie: etat.energieChaudiere,
    prixElec: prixElectricite(etat.typeBatiment),
    mode: etat.mode,
  });

  const marque = MARQUES[etat.marque];
  const lignes: LigneDevisPac[] = [];
  if (puissancePacKw > 0) {
    const eurKw = etat.mode === "cascade" ? 540 : grand ? 620 : 820;
    const plancher = etat.mode === "cascade" || grand ? 0 : 6900;
    const nombre = modules?.nombre ?? 1;
    const kwFacture = modules ? modules.unitaireKw * nombre : puissancePacKw;
    const totalVente = Math.max(plancher, argent(kwFacture * eurKw));
    const pu = argent(totalVente / nombre);
    const designation =
      etat.mode === "cascade"
        ? `Cascade ${nombre} x ${marque} ${modules?.unitaireKw} kW Inverter, régulation Master/Slave`
        : etat.mode === "hybride"
          ? `${marque} air/eau ${puissancePacKw} kW en relève de chaudière ${etat.energieChaudiere}`
          : `${marque} air/eau ${puissancePacKw} kW et appoint électrique ${appointElectriqueKwValeur} kW`;
    lignes.push(ligne("pac", "fourniture", designation, nombre, "u", pu, argent(pu * 0.72)));
  }

  const tampon = volumeTamponStandardL(tamponMin);
  if (tampon > 0) {
    const pu = Math.max(780, argent(tampon * 3.4));
    lignes.push(ligne("tampon", "fourniture", `Ballon tampon ${tampon} L et accessoires hydrauliques`, 1, "u", pu, argent(pu * 0.7)));
  }

  const prixDn: Record<number, number> = {
    50: 620, 65: 780, 80: 980, 100: 1280, 125: 1680, 150: 2140, 200: 2900, 250: 3800, 300: 4900, 350: 5800, 400: 7200, 450: 8600, 500: 9800, 600: 12500,
  };
  const circulateurs = (modules?.nombre ?? 1) + 1;
  const puCirc = grand ? 890 : 640;
  const puBouteille = (prixDn[bouteille.dn] ?? 12500) + circulateurs * puCirc;
  lignes.push(
    ligne(
      "decouplage",
      "fourniture",
      `${bouteille.preconisation}, ${circulateurs} circulateurs à vitesse variable`,
      1,
      "forfait",
      puBouteille,
      argent(puBouteille * 0.72),
    ),
  );

  const puVannes = (grand ? 2400 : 1620) + Math.max(0, (modules?.nombre ?? 1) - 1) * 280;
  lignes.push(
    ligne(
      "regulation",
      "fourniture",
      etat.mode === "hybride"
        ? "Vanne 3 voies motorisée de bivalence et régulation loi d'eau"
        : "Vannes 3 voies motorisées et régulation loi d'eau",
      1,
      "forfait",
      puVannes,
      argent(puVannes * 0.7),
    ),
  );

  if (grand) {
    const eurM2 = etat.classeGtb === "A" ? 6.5 : 4.8;
    const puGtb = Math.max(3200, argent(etat.surfaceM2 * eurM2));
    lignes.push(
      ligne(
        "gtb",
        "fourniture",
        `GTB Décret BACS classe ${etat.classeGtb} — fiche BAT-TH-116`,
        1,
        "forfait",
        puGtb,
        argent(puGtb * 0.75),
      ),
    );
  }

  if (puissancePacKw > 0) {
    const eurKwPose = grand ? 210 : 390;
    const pose = Math.max(1600, argent(puissancePacKw * eurKwPose));
    lignes.push(ligne("pose", "ingenierie", "Main-d'œuvre et pose QualiPAC / CVC", 1, "forfait", pose, pose));
    const consuel = grand || puissancePacKw > 30 ? 1850 : 490;
    lignes.push(ligne("consuel", "ingenierie", "Consuel, raccordement et mise en service", 1, "forfait", consuel, consuel));
  }

  const fournituresHt = argent(lignes.filter((item) => item.famille === "fourniture").reduce((total, item) => total + item.totalHt, 0));
  const ingenierieHt = argent(lignes.filter((item) => item.famille === "ingenierie").reduce((total, item) => total + item.totalHt, 0));
  const totalHt = fournituresHt + ingenierieHt;
  const tauxTva = tertiaire ? etat.tauxTvaTertiaire : 0.055;
  const tvaEur = argent(totalHt * tauxTva);
  const totalTtc = totalHt + tvaEur;
  const aides = ecreterAides(aidesCee(etat, climat.zone, grand), totalTtc);
  const totalAidesEur = argent(aides.reduce((total, aide) => total + (aide.eligible ? aide.montantEur : 0), 0));
  const resteAChargeTtc = Math.max(0, totalTtc - totalAidesEur);
  const coutAchatHt = argent(lignes.reduce((total, item) => total + item.coutHt, 0));
  const margeBruteHt = argent(totalHt - coutAchatHt);
  const margeBrutePct = totalHt > 0 ? Math.round((margeBruteHt / totalHt) * 1000) / 1000 : 0;
  const retourAns =
    bilan.economieEur > 50 ? Math.round((resteAChargeTtc / bilan.economieEur) * 10) / 10 : null;
  const code = (dossierId || etat.clientNom || "LIBRE").replace(/[^a-zA-Z0-9-]/g, "").slice(0, 16) || "LIBRE";

  const devis: DevisPac = {
    numero: `DEV-2026-PAC-${code.toUpperCase()}`,
    lignes,
    fournituresHt,
    ingenierieHt,
    totalHt,
    tauxTva,
    tvaEur,
    totalTtc,
    aides,
    totalAidesEur,
    resteAChargeTtc,
    coutAchatHt,
    margeBruteHt,
    margeBrutePct,
    retourAns,
  };

  return {
    volumeM3: Math.round(volume * 10) / 10,
    g,
    textBase: climat.textBase,
    zone: climat.zone,
    dju: climat.dju,
    departementNom: climat.nom,
    deltaK: etat.tint - climat.textBase,
    pDepKw: Math.round(pDepKw * 10) / 10,
    puissancePacKw,
    ratioCouvertureBase,
    appointElectriqueKw: appointElectriqueKwValeur,
    alerteAppoint,
    modules,
    tbiv,
    couvertureAnnuelle: couverture,
    puissanceChaudiereKw,
    debitPacM3h: Math.round(debitPac * 100) / 100,
    debitChaudiereM3h: Math.round(debitChaudiere * 100) / 100,
    volumeTamponL: Math.round(tamponMin),
    volumeTamponStandardL: tampon,
    bouteille,
    besoinKwh: Math.round(besoin),
    economieAnnuelleEur: argent(bilan.economieEur),
    coutAvantEur: argent(bilan.coutAvantEur),
    coutApresEur: argent(bilan.coutApresEur),
    devis,
  };
}

function ecreterAides(aides: AideCee[], plafondTtc: number): AideCee[] {
  const brut = aides.reduce((total, aide) => total + (aide.eligible ? aide.montantEur : 0), 0);
  if (brut <= plafondTtc || brut <= 0) return aides;
  let reste = plafondTtc;
  return aides.map((aide) => {
    if (!aide.eligible) return aide;
    const montant = Math.min(aide.montantEur, Math.max(0, reste));
    reste -= montant;
    return { ...aide, montantEur: montant };
  });
}

function aidesCee(etat: EtatPac, zone: ZoneCee, grand: boolean): AideCee[] {
  const residentiel = etat.typeBatiment === "residentiel";
  const bar = residentiel ? BAR_TH_104[zone] : 0;
  const cleCumac = etat.typeBatiment === "collectif" ? "collectif" : etat.usageTertiaire;
  const cumacPac = grand ? etat.surfaceM2 * CUMAC_PAC_M2[cleCumac][zone] : 0;
  const cumacGtb = grand ? etat.surfaceM2 * CUMAC_GTB_M2[zone] * (etat.classeGtb === "A" ? 1.2 : 1) : 0;
  return [
    {
      id: "bar-th-104",
      libelle: "BAR-TH-104 — Coup de pouce résidentiel",
      montantEur: bar,
      eligible: residentiel && bar > 0,
      detail: residentiel
        ? `Forfait indicatif zone ${zone}, profil de revenus non instruit.`
        : "Fiche résiduelle : non applicable à ce bâtiment.",
    },
    {
      id: "bat-th-113",
      libelle: "BAT-TH-113 — PAC tertiaire",
      montantEur: eurAide(cumacPac),
      eligible: grand && cumacPac > 0,
      detail: grand
        ? `${Math.round(cumacPac).toLocaleString("fr-FR")} kWh cumac × ${PRIX_MWH_CUMAC} EUR/MWhc, indicatif.`
        : "Fiche tertiaire : non applicable à la maison individuelle.",
    },
    {
      id: "bat-th-116",
      libelle: "BAT-TH-116 — Bonus GTB",
      montantEur: eurAide(cumacGtb),
      eligible: grand && cumacGtb > 0,
      detail: grand
        ? `Classe ${etat.classeGtb}, zone ${zone}, valorisation indicative.`
        : "Décret BACS : non applicable à la maison individuelle.",
    },
  ];
}

export function etatInitialPac(clientNom = ""): EtatPac {
  return {
    clientNom,
    typeBatiment: "residentiel",
    usageTertiaire: "bureaux",
    surfaceM2: 140,
    hauteurM: 2.5,
    isolation: "rt2000",
    departement: "71",
    tint: 20,
    tintManuelle: false,
    mode: "hybride",
    ratioThermo: 1,
    nombreModules: 3,
    marque: "daikin",
    energieChaudiere: "gaz",
    tauxTvaTertiaire: 0.2,
    classeGtb: "B",
  };
}
