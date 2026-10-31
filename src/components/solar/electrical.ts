import { MICROS, MODELES_CASCADE, MODELES_CENTRAUX, POWERWALL_3, type ModeleCascade, type ModeleOnduleur } from "./catalogue";
import type {
  ArchitectureId,
  BilanCentrale,
  BilanElectrique,
  BilanMicro,
  ControleChaine,
  MarqueCascade,
  MarqueCentrale,
  MicroId,
  Panneau,
  SegmentProjet,
} from "./types";

const T_FROID = -10;
const T_CHAUD = 70;
const T_STC = 25;

export function tensionTemperature(tensionStc: number, coeffPct: number, temperature: number): number {
  if (!Number.isFinite(tensionStc) || tensionStc <= 0) return 0;
  return tensionStc * (1 + (coeffPct / 100) * (temperature - T_STC));
}

export function bornesSerie(panneau: Panneau, vmax: number, vmin: number) {
  const vocFroid = tensionTemperature(panneau.voc, panneau.coeffVoc, T_FROID);
  const vmppChaud = tensionTemperature(panneau.vmpp, panneau.coeffVmpp, T_CHAUD);
  const max = vocFroid > 0 ? Math.floor((vmax + 1e-9) / vocFroid) : 0;
  const min = vmppChaud > 0 ? Math.ceil((vmin - 1e-9) / vmppChaud) : 1;
  return { vocFroid, vmppChaud, min: Math.max(1, min), max: Math.max(0, max) };
}

/** Répartit les modules sur le minimum de chaînes qui tiennent dans la fenêtre de tension. */
export function proposerChaines(
  nombre: number,
  minN: number,
  maxN: number,
  maxChaines: number,
): { comptes: number[]; reste: number } {
  if (nombre <= 0 || maxChaines < 1) return { comptes: [], reste: Math.max(0, nombre) };
  if (maxN < 1) return { comptes: [], reste: nombre };
  const minEff = Math.min(Math.max(1, minN), maxN);
  const minChaines = Math.max(1, Math.ceil(nombre / maxN));
  if (minChaines > maxChaines) {
    return {
      comptes: Array.from({ length: maxChaines }, () => maxN),
      reste: nombre - maxChaines * maxN,
    };
  }
  let nChaines = minChaines;
  for (let compte = minChaines; compte <= Math.min(maxChaines, nombre); compte += 1) {
    const moyenne = nombre / compte;
    if (moyenne >= minEff && moyenne <= maxN) {
      nChaines = compte;
      break;
    }
  }
  const base = Math.floor(nombre / nChaines);
  const extra = nombre % nChaines;
  const comptes = Array.from({ length: nChaines }, (_, index) => base + (index < extra ? 1 : 0));
  return { comptes, reste: 0 };
}

function chaineLibre(index: number, panneau: Panneau): ControleChaine {
  return { index, nombre: 0, ok: true, vocFroidV: 0, vmppChaudV: 0, iscA: panneau.isc, motifs: [] };
}

function controleSerie(
  index: number,
  nombre: number,
  panneau: Panneau,
  vmax: number,
  vmin: number,
  imax: number,
): ControleChaine {
  if (nombre <= 0) return chaineLibre(index, panneau);
  const { vocFroid, vmppChaud } = bornesSerie(panneau, vmax, vmin);
  const voc = nombre * vocFroid;
  const vmpp = nombre * vmppChaud;
  const motifs: string[] = [];
  if (nombre < 1) motifs.push("Chaîne vide.");
  if (voc > vmax + 0.05) {
    motifs.push(`Voc −10 °C = ${voc.toFixed(0)} V, au-dessus de ${vmax} V.`);
  }
  if (nombre > 0 && vmpp < vmin - 0.05) {
    motifs.push(`Vmpp 70 °C = ${vmpp.toFixed(0)} V, sous le minimum ${vmin} V.`);
  }
  if (panneau.isc > imax + 0.05) {
    motifs.push(`Isc ${panneau.isc.toFixed(2)} A > ${imax} A par tracker.`);
  }
  return {
    index,
    nombre,
    ok: motifs.length === 0 && nombre > 0,
    vocFroidV: voc,
    vmppChaudV: vmpp,
    iscA: panneau.isc,
    motifs,
  };
}

function controleOptimiseurs(
  index: number,
  nombre: number,
  panneau: Panneau,
  optMin: number,
  optMax: number,
): ControleChaine {
  if (nombre <= 0) return chaineLibre(index, panneau);
  const vocFroid = tensionTemperature(panneau.voc, panneau.coeffVoc, T_FROID);
  const vmppChaud = tensionTemperature(panneau.vmpp, panneau.coeffVmpp, T_CHAUD);
  const motifs: string[] = [];
  if (nombre < optMin) motifs.push(`${nombre} optimiseur(s), minimum ${optMin} par chaîne.`);
  if (nombre > optMax) motifs.push(`${nombre} optimiseurs, maximum ${optMax} par chaîne.`);
  if (panneau.wc > 505) motifs.push("Puissance module au-dessus d'un optimiseur S500 : vérifier S550 / P505.");
  return {
    index,
    nombre,
    ok: motifs.length === 0 && nombre > 0,
    vocFroidV: nombre * vocFroid,
    vmppChaudV: nombre * vmppChaud,
    iscA: panneau.isc,
    motifs,
  };
}

function choisirModele(marque: MarqueCentrale, kwc: number, forceId: string): ModeleOnduleur {
  const famille = MODELES_CENTRAUX.filter((modele) => modele.marque === marque);
  const force = famille.find((modele) => modele.id === forceId);
  if (force) return force;
  const capables = famille.filter((modele) => modele.kwAc * modele.ratioDcMax >= kwc - 1e-6);
  const pool = capables.length > 0 ? capables : famille;
  const cible = kwc / 1.2;
  return [...pool].sort((a, b) => Math.abs(a.kwAc - cible) - Math.abs(b.kwAc - cible))[0];
}

function evaluerCentrale(modele: ModeleOnduleur, kwc: number): BilanCentrale {
  const ratio = modele.kwAc > 0 ? kwc / modele.kwAc : 0;
  const motifs: string[] = [];
  if (kwc <= 0) motifs.push("Aucun module actif.");
  if (ratio > modele.ratioDcMax + 0.02) {
    motifs.push(`Ratio DC/AC ${ratio.toFixed(2)} au-dessus de ${modele.ratioDcMax.toFixed(2)}.`);
  }
  if (kwc > 0 && ratio < 0.7) motifs.push(`Onduleur surdimensionné (ratio DC/AC ${ratio.toFixed(2)}).`);
  return {
    id: modele.id,
    nom: modele.nom,
    kwAc: modele.kwAc,
    kwDc: kwc,
    ratio,
    mppt: modele.mppt,
    vmax: modele.vmax,
    vmin: modele.vmin,
    imax: modele.imax,
    optimiseurs: modele.optimiseurs,
    ok: motifs.length === 0,
    motifs,
  };
}

function bilanMicro(panneau: Panneau, modulesActifs: number, microId: MicroId): BilanMicro {
  const micro = MICROS[microId];
  const nombreMicros = micro.panneauxParMicro > 0 ? Math.ceil(modulesActifs / micro.panneauxParMicro) : 0;
  const maxParBranche = Math.max(1, Math.floor(micro.courantUtileA / micro.iac));
  const branches: number[] = [];
  let reste = nombreMicros;
  while (reste > 0) {
    const prise = Math.min(maxParBranche, reste);
    branches.push(prise);
    reste -= prise;
  }
  const courantsA = branches.map((compte) => compte * micro.iac);
  return {
    id: microId,
    nom: micro.nom,
    panneauxParMicro: micro.panneauxParMicro,
    nombreMicros,
    va: micro.va,
    iac: micro.iac,
    maxParBranche,
    branches,
    courantsA,
    ok: modulesActifs > 0 && courantsA.every((courant) => courant <= micro.courantUtileA + 0.05),
    ecretage:
      micro.panneauxParMicro === 1
        ? panneau.wc > micro.va + 5
        : panneau.wc * micro.panneauxParMicro > micro.va + 5,
  };
}

function comptesRetenus(
  modulesActifs: number,
  repartition: "auto" | "manuel",
  comptes: number[],
  minN: number,
  maxN: number,
  mppt: number,
): { comptes: number[]; reste: number } {
  if (repartition === "auto") return proposerChaines(modulesActifs, minN, maxN, mppt);
  const manuels = Array.from({ length: mppt }, (_, index) => {
    const valeur = comptes[index];
    return Math.max(0, Math.round(Number.isFinite(valeur) ? valeur : 0));
  });
  const somme = manuels.reduce((total, valeur) => total + valeur, 0);
  return { comptes: manuels, reste: modulesActifs - somme };
}

function resumeTailles(comptes: number[]): string {
  const map = new Map<number, number>();
  comptes.forEach((nombre) => {
    if (nombre > 0) map.set(nombre, (map.get(nombre) ?? 0) + 1);
  });
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([nombre, compte]) => `${compte} x ${nombre} modules`)
    .join(", ");
}

function choisirCascade(marque: MarqueCascade, kwc: number, modeleId: string, modules: number, panneau: Panneau) {
  const famille = MODELES_CASCADE.filter((modele) => modele.marque === marque);
  const force = modeleId && modeleId !== "auto" ? famille.find((modele) => modele.id === modeleId) : undefined;
  const pool = force ? [force] : famille.length > 0 ? famille : MODELES_CASCADE;
  let retenu: { modele: ModeleCascade; nombre: number } = { modele: pool[0], nombre: 1 };
  let meilleurScore = Infinity;
  pool.forEach((modele) => {
    const bornes = bornesSerie(panneau, modele.vmax, modele.vmin);
    const parMppt = panneau.isc * 2 <= modele.imax + 0.05 && bornes.max > 0 ? 2 : 1;
    const parUnite = modele.mppt * parMppt * Math.max(0, bornes.max);
    const nRatio = Math.max(1, Math.ceil(kwc / (modele.kwAc * modele.ratioDcMax)));
    const nCible = Math.max(1, Math.round(kwc / (modele.kwAc * 1.15)) || 1);
    const nModules = parUnite > 0 ? Math.ceil(Math.max(modules, 1) / parUnite) : 99;
    const nombre = Math.min(40, Math.max(nRatio, nCible, nModules));
    const ratio = modele.kwAc > 0 ? kwc / (nombre * modele.kwAc) : 99;
    const score = nombre * 100 + Math.abs(ratio - 1.15);
    if (score < meilleurScore) {
      meilleurScore = score;
      retenu = { modele, nombre };
    }
  });
  return retenu;
}

function evaluerCascade(
  input: {
    panneau: Panneau;
    modulesActifs: number;
    kwc: number;
    marqueCascade?: MarqueCascade;
    modeleCascadeId?: string;
  },
  alertes: string[],
): BilanElectrique {
  const marque = input.marqueCascade === "sma" ? "sma" : "huawei";
  const choix = choisirCascade(marque, input.kwc, input.modeleCascadeId ?? "auto", input.modulesActifs, input.panneau);
  const modele = choix.modele;
  const bornes = bornesSerie(input.panneau, modele.vmax, modele.vmin);
  const parMppt = input.panneau.isc * 2 <= modele.imax + 0.05 ? 2 : 1;
  const mpptTotal = choix.nombre * modele.mppt;
  const proposition = proposerChaines(input.modulesActifs, bornes.min, bornes.max, mpptTotal * parMppt);
  const chaines = proposition.comptes.map((nombre, index) =>
    controleSerie(index + 1, nombre, input.panneau, modele.vmax, modele.vmin, modele.imax),
  );
  const ratio = modele.kwAc > 0 ? input.kwc / (choix.nombre * modele.kwAc) : 0;
  if (input.modulesActifs === 0) alertes.push("Aucun module actif à équiper.");
  if (bornes.max < 1) alertes.push("Un seul module dépasse la tension maximale de l'onduleur de chaîne à −10 °C.");
  if (bornes.max < bornes.min) alertes.push("La fenêtre de tension de cet onduleur ne peut pas accueillir ce module.");
  if (ratio > modele.ratioDcMax + 0.02) {
    alertes.push(`Ratio DC/AC ${ratio.toFixed(2)} au-dessus de ${modele.ratioDcMax.toFixed(2)} pour ${choix.nombre} onduleur(s).`);
  }
  if (proposition.reste > 0) alertes.push(`${proposition.reste} module(s) hors des chaînes (${mpptTotal} MPPT, ${parMppt} chaîne(s) par MPPT).`);
  const motifs = new Set<string>();
  chaines.forEach((chaine) => chaine.motifs.forEach((motif) => motifs.add(motif)));
  motifs.forEach((motif) => alertes.push(motif));
  const actives = chaines.filter((chaine) => chaine.nombre > 0);
  const ok =
    input.modulesActifs > 0 &&
    proposition.reste === 0 &&
    actives.length > 0 &&
    actives.every((chaine) => chaine.ok) &&
    ratio <= modele.ratioDcMax + 0.02 &&
    bornes.max >= bornes.min;
  const resumeChaines = resumeTailles(proposition.comptes) || "aucune chaîne";
  return {
    architecture: "cascade",
    ok,
    resume: ok
      ? `${choix.nombre} x ${modele.nom}, ratio DC/AC ${ratio.toFixed(2)}, ${actives.length} chaînes. ${resumeChaines}.`
      : "Onduleurs de chaîne hors plage.",
    chaines,
    nonAffectes: proposition.reste,
    micro: null,
    centrale: null,
    secoursKw: null,
    alertes: [...new Set(alertes)],
    unitesPowerwall: 1,
    cascade: {
      nom: modele.nom,
      nombre: choix.nombre,
      kwAcTotal: choix.nombre * modele.kwAc,
      ratio,
      mpptTotal,
      chainesParMppt: parMppt,
      resumeChaines,
    },
  };
}

export function evaluerElectrique(input: {
  architecture: ArchitectureId;
  panneau: Panneau;
  modulesActifs: number;
  kwc: number;
  repartition: "auto" | "manuel";
  comptes: number[];
  secours: boolean;
  microId: MicroId;
  marqueCentrale: MarqueCentrale;
  modeleCentralId: string;
  unitesPowerwall?: number;
  marqueCascade?: MarqueCascade;
  modeleCascadeId?: string;
  segment?: SegmentProjet;
}): BilanElectrique {
  const alertes: string[] = [];

  if (input.architecture === "micro") {
    const micro = bilanMicro(input.panneau, input.modulesActifs, input.microId);
    if (input.modulesActifs === 0) alertes.push("Aucun module actif à équiper.");
    if (micro.ecretage && input.modulesActifs > 0) {
      alertes.push(`Écrêtage possible : module ${input.panneau.wc} Wc sur ${micro.nom} (${micro.va} VA).`);
    }
    if (input.microId === "apsystems-ds3" && input.modulesActifs % 2 === 1) {
      alertes.push("Le dernier DS3 ne reçoit qu'un seul module.");
    }
    if (!micro.ok && input.modulesActifs > 0) alertes.push("Bus AC au-dessus du courant utile 16 A.");
    return {
      architecture: "micro",
      ok: micro.ok,
      resume: micro.ok ? `${micro.nombreMicros} micro-onduleurs, bus AC tenu.` : "Bus AC à revoir.",
      chaines: [],
      nonAffectes: 0,
      micro,
      centrale: null,
      secoursKw: null,
      alertes: [...new Set(alertes)],
      unitesPowerwall: 1,
      cascade: null,
    };
  }

  if (input.architecture === "hybride") {
    const modele = choisirModele(input.marqueCentrale, input.kwc, input.modeleCentralId);
    const centrale = evaluerCentrale(modele, input.kwc);
    const proposition = comptesRetenus(
      input.modulesActifs,
      input.repartition,
      input.comptes,
      modele.optimiseurs ? modele.optMin : bornesSerie(input.panneau, modele.vmax, modele.vmin).min,
      modele.optimiseurs ? modele.optMax : bornesSerie(input.panneau, modele.vmax, modele.vmin).max,
      modele.mppt,
    );
    const chaines = proposition.comptes.map((nombre, index) =>
      modele.optimiseurs
        ? controleOptimiseurs(index + 1, nombre, input.panneau, modele.optMin, modele.optMax)
        : controleSerie(index + 1, nombre, input.panneau, modele.vmax, modele.vmin, modele.imax),
    );
    if (!modele.optimiseurs && bornesSerie(input.panneau, modele.vmax, modele.vmin).max < 1) {
      alertes.push("Un seul module dépasse déjà la tension maximale de l'onduleur à −10 °C.");
    }
    if (proposition.reste > 0) alertes.push(`${proposition.reste} module(s) hors des ${modele.mppt} MPPT.`);
    if (proposition.reste < 0) alertes.push(`Les chaînes comptent ${-proposition.reste} module(s) de trop.`);
    alertes.push(...centrale.motifs);
    chaines.forEach((chaine) => {
      chaine.motifs.forEach((motif) => alertes.push(`MPPT ${chaine.index} : ${motif}`));
    });
    const actives = chaines.filter((chaine) => chaine.nombre > 0);
    const chainesOk = actives.length > 0 && actives.every((chaine) => chaine.ok);
    const ok = centrale.ok && chainesOk && proposition.reste === 0 && input.modulesActifs > 0;
    return {
      architecture: "hybride",
      ok,
      resume: ok ? `${centrale.nom} retenu, ${actives.length} chaîne(s).` : "Architecture centrale hors plage.",
      chaines,
      nonAffectes: proposition.reste,
      micro: null,
      centrale,
      secoursKw: null,
      alertes: [...new Set(alertes)],
      unitesPowerwall: 1,
      cascade: null,
    };
  }

  if (input.architecture === "cascade") return evaluerCascade(input, alertes);

  const tertiaire = input.segment === "tertiaire";
  const unites = tertiaire
    ? Math.min(POWERWALL_3.unitesMax, Math.max(1, Math.round(input.unitesPowerwall ?? 1)))
    : 1;
  const bornes = bornesSerie(input.panneau, POWERWALL_3.vmax, POWERWALL_3.vmin);
  const proposition = comptesRetenus(
    input.modulesActifs,
    input.repartition,
    input.comptes,
    bornes.min,
    bornes.max,
    POWERWALL_3.mppt * unites,
  );
  const chaines = proposition.comptes.map((nombre, index) =>
    controleSerie(index + 1, nombre, input.panneau, POWERWALL_3.vmax, POWERWALL_3.vmin, POWERWALL_3.imax),
  );
  const plafondDc = POWERWALL_3.solaireMaxKwc * unites;
  if (input.kwc > plafondDc) {
    alertes.push(
      unites >= POWERWALL_3.unitesMax
        ? `4 Powerwall 3 plafonnent à ${plafondDc} kWc DC, ${POWERWALL_3.secoursKw * unites} kW AC et ${POWERWALL_3.capaciteKwh * unites} kWh. Au-delà : onduleurs de chaîne en cascade.`
        : `Au-delà de ${plafondDc} kWc DC pour ${unites} Powerwall 3 : ajouter une unité (4 maximum) ou passer en cascade.`,
    );
  }
  if (bornes.max < 1) alertes.push("Un seul module dépasse déjà 480 V à −10 °C.");
  if (proposition.reste > 0) alertes.push(`${proposition.reste} module(s) hors des ${POWERWALL_3.mppt * unites} MPPT.`);
  if (proposition.reste < 0) alertes.push(`Les chaînes comptent ${-proposition.reste} module(s) de trop.`);
  if (input.panneau.isc > POWERWALL_3.imax) {
    alertes.push("Ce module dépasse 13 A : incompatible avec un MPPT Powerwall 3. Le DualSun 425 Wc, les micro-onduleurs ou un onduleur central restent possibles.");
  }
  chaines.filter((chaine) => !chaine.ok).forEach((chaine) => {
    chaine.motifs
      .filter((motif) => !motif.startsWith("Isc"))
      .forEach((motif) => alertes.push(`MPPT ${chaine.index} : ${motif}`));
  });
  const actives = chaines.filter((chaine) => chaine.nombre > 0);
  const ok =
    input.modulesActifs > 0 &&
    proposition.reste === 0 &&
    actives.length > 0 &&
    actives.every((chaine) => chaine.ok) &&
    input.kwc <= plafondDc;
  const kwh = POWERWALL_3.capaciteKwh * unites;
  const kwAc = POWERWALL_3.secoursKw * unites;
  return {
    architecture: "tesla-pw3",
    ok,
    resume: ok
      ? unites > 1
        ? `${unites} Powerwall 3 chaînées : ${actives.length} chaîne(s), ${kwAc} kW AC, ${kwh} kWh.`
        : `Powerwall 3 : ${actives.length} chaîne(s) dans la fenêtre 60–480 V.`
      : "Chaînes Powerwall 3 hors spécification.",
    chaines,
    nonAffectes: proposition.reste,
    micro: null,
    centrale: null,
    secoursKw: input.secours ? kwAc : null,
    alertes: [...new Set(alertes)],
    unitesPowerwall: unites,
    cascade: null,
  };
}
