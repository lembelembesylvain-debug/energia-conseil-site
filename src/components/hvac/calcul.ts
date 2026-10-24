import type {
  DepartementClimatique,
  EnergieChaudiere,
  EtatPac,
  IsolationId,
  ModePac,
  TypeBatiment,
  ZoneCee,
} from "./types";

/** Gain de puissance d'une PAC air/eau par degré au-dessus de la température de base. */
export const ALPHA_PAC = 0.03;
export const DELTA_T_PAC = 5;
export const DELTA_T_CHAUDIERE = 15;
export const LITRES_TAMPON_PAR_KW = 20;
export const VITESSE_MAX_MS = 0.5;

export const COEFFICIENTS_G: Record<IsolationId, { g: number; libelle: string }> = {
  passoire: { g: 1.8, libelle: "Passoire thermique G/F" },
  rt2000: { g: 1.2, libelle: "RT 2000 / Moyen" },
  rt2012: { g: 0.8, libelle: "RT 2012" },
  re2020: { g: 0.5, libelle: "RE 2020" },
};

export const DEPARTEMENTS_CLIMAT: DepartementClimatique[] = [
  { code: "71", nom: "Saône-et-Loire", textBase: -10, zone: "H1", dju: 2500 },
  { code: "69", nom: "Rhône", textBase: -10, zone: "H1", dju: 2450 },
  { code: "75", nom: "Paris", textBase: -5, zone: "H1", dju: 2400 },
  { code: "13", nom: "Bouches-du-Rhône", textBase: -5, zone: "H3", dju: 1400 },
  { code: "01", nom: "Ain", textBase: -10, zone: "H1", dju: 2600 },
  { code: "06", nom: "Alpes-Maritimes", textBase: -5, zone: "H3", dju: 1450 },
  { code: "14", nom: "Calvados", textBase: -7, zone: "H2", dju: 2300 },
  { code: "21", nom: "Côte-d'Or", textBase: -10, zone: "H1", dju: 2550 },
  { code: "31", nom: "Haute-Garonne", textBase: -5, zone: "H2", dju: 1900 },
  { code: "33", nom: "Gironde", textBase: -5, zone: "H2", dju: 1950 },
  { code: "34", nom: "Hérault", textBase: -5, zone: "H3", dju: 1500 },
  { code: "38", nom: "Isère", textBase: -15, zone: "H1", dju: 2800 },
  { code: "42", nom: "Loire", textBase: -10, zone: "H1", dju: 2550 },
  { code: "44", nom: "Loire-Atlantique", textBase: -5, zone: "H2", dju: 2100 },
  { code: "45", nom: "Loiret", textBase: -7, zone: "H1", dju: 2400 },
  { code: "54", nom: "Meurthe-et-Moselle", textBase: -12, zone: "H1", dju: 2750 },
  { code: "57", nom: "Moselle", textBase: -12, zone: "H1", dju: 2800 },
  { code: "59", nom: "Nord", textBase: -9, zone: "H1", dju: 2600 },
  { code: "62", nom: "Pas-de-Calais", textBase: -9, zone: "H1", dju: 2550 },
  { code: "63", nom: "Puy-de-Dôme", textBase: -10, zone: "H1", dju: 2650 },
  { code: "67", nom: "Bas-Rhin", textBase: -15, zone: "H1", dju: 2900 },
  { code: "68", nom: "Haut-Rhin", textBase: -15, zone: "H1", dju: 2850 },
  { code: "73", nom: "Savoie", textBase: -15, zone: "H1", dju: 3000 },
  { code: "74", nom: "Haute-Savoie", textBase: -15, zone: "H1", dju: 3050 },
  { code: "76", nom: "Seine-Maritime", textBase: -7, zone: "H1", dju: 2400 },
  { code: "77", nom: "Seine-et-Marne", textBase: -7, zone: "H1", dju: 2450 },
  { code: "78", nom: "Yvelines", textBase: -7, zone: "H1", dju: 2450 },
  { code: "83", nom: "Var", textBase: -5, zone: "H3", dju: 1400 },
  { code: "84", nom: "Vaucluse", textBase: -5, zone: "H2", dju: 1800 },
  { code: "87", nom: "Haute-Vienne", textBase: -7, zone: "H1", dju: 2350 },
  { code: "89", nom: "Yonne", textBase: -10, zone: "H1", dju: 2550 },
  { code: "92", nom: "Hauts-de-Seine", textBase: -5, zone: "H1", dju: 2400 },
  { code: "93", nom: "Seine-Saint-Denis", textBase: -5, zone: "H1", dju: 2400 },
  { code: "94", nom: "Val-de-Marne", textBase: -5, zone: "H1", dju: 2400 },
  { code: "95", nom: "Val-d'Oise", textBase: -7, zone: "H1", dju: 2450 },
];

export const MODULES_CASCADE_KW = [35, 50, 65, 80, 100] as const;

const VOLUMES_TAMPON = [100, 200, 300, 500, 800, 1000, 1500, 2000, 2500, 3000, 4000, 5000];
const DN_STANDARD = [50, 65, 80, 100, 125, 150, 200, 250, 300, 350, 400, 450, 500, 600];

export function departementClimatique(code: string): DepartementClimatique {
  return DEPARTEMENTS_CLIMAT.find((item) => item.code === code) ?? DEPARTEMENTS_CLIMAT[0];
}

export function tintParDefaut(type: TypeBatiment): number {
  return type === "tertiaire" ? 19 : 20;
}

export function volumeM3(surfaceM2: number, hauteurM: number): number {
  return Math.max(0, surfaceM2) * Math.max(0, hauteurM);
}

/** P_dep (kW) = V × G × (Tint − Text_base) / 1000. */
export function puissanceDeperditionsKw(volume: number, g: number, tint: number, textBase: number): number {
  const delta = tint - textBase;
  if (volume <= 0 || g <= 0 || delta <= 0) return 0;
  return (volume * g * delta) / 1000;
}

/**
 * Température où la puissance PAC rejoint la courbe de déperditions.
 * À 60 % de P_dep et Text base −10 °C / Tint 20 °C, Tbiv vaut environ −2 °C.
 */
export function pointBivalence(tint: number, textBase: number, ratio: number): number | null {
  const delta = tint - textBase;
  if (delta <= 0 || ratio <= 0) return null;
  if (ratio >= 0.999) return textBase;
  const a = ratio * ALPHA_PAC * delta + 1;
  const b = tint - ratio * delta + ratio * ALPHA_PAC * delta * textBase;
  return Math.round((b / a) * 10) / 10;
}

export function appointElectriqueKw(pDepKw: number, ratio: number): number {
  const manque = Math.max(0, pDepKw * (1 - ratio));
  const besoin = Math.max(3, manque);
  return [3, 6, 9].find((palier) => palier >= besoin - 0.05) ?? 9;
}

export function choisirModulesCascade(pDepKw: number, nombre: 2 | 3 | 4): { nombre: 2 | 3 | 4; unitaireKw: number; totalKw: number } {
  const cible = pDepKw / nombre;
  const unitaire = MODULES_CASCADE_KW.find((kw) => kw + 0.05 >= cible) ?? 100;
  return { nombre, unitaireKw: unitaire, totalKw: nombre * unitaire };
}

export function debitM3h(puissanceKw: number, deltaT: number): number {
  if (puissanceKw <= 0 || deltaT <= 0) return 0;
  return puissanceKw / (1.163 * deltaT);
}

export function volumeTamponMinL(puissancePacKw: number): number {
  return Math.max(0, puissancePacKw) * LITRES_TAMPON_PAR_KW;
}

export function volumeTamponStandardL(minimumL: number): number {
  return VOLUMES_TAMPON.find((volume) => volume + 0.1 >= minimumL) ?? 5000;
}

/** Diamètre de bouteille pour v < 0,5 m/s, entraxe = 3 × DN. */
export function dimensionnerBouteille(debitM3hValeur: number): { dn: number; entraxeMm: number; vitesseMs: number; preconisation: string } {
  if (debitM3hValeur <= 0) {
    return { dn: 50, entraxeMm: 150, vitesseMs: 0, preconisation: "Bouteille de découplage DN 50" };
  }
  const debitM3s = debitM3hValeur / 3600;
  const section = debitM3s / VITESSE_MAX_MS;
  const diametreMm = Math.sqrt((4 * section) / Math.PI) * 1000;
  const dn = DN_STANDARD.find((valeur) => valeur + 0.1 >= diametreMm) ?? 600;
  const sectionReelle = (Math.PI * (dn / 1000) ** 2) / 4;
  const vitesseMs = debitM3s / sectionReelle;
  const preconisation =
    dn <= 200
      ? `Bouteille casse-pression DN ${dn}, entraxe ${3 * dn} mm`
      : `Échangeur à plaques préférable au-delà du DN 200 (calcul DN ${dn})`;
  return { dn, entraxeMm: 3 * dn, vitesseMs, preconisation };
}

export function besoinAnnuelKwh(pDepKw: number, tint: number, textBase: number, dju: number): number {
  const delta = tint - textBase;
  if (pDepKw <= 0 || delta <= 0 || dju <= 0) return 0;
  return (pDepKw * dju * 24) / delta;
}

export function couvertureAnnuelle(mode: ModePac, ratioBase: number): number {
  if (mode === "hybride") return 0.85;
  if (mode === "cascade") return ratioBase >= 0.98 ? 0.99 : Math.max(0.7, Math.min(0.98, 0.55 + 0.4 * ratioBase));
  if (ratioBase >= 0.999) return 0.99;
  if (ratioBase >= 0.95) return 0.98;
  return 0.96;
}

const PRIX_ENERGIE: Record<EnergieChaudiere, { eurKwh: number; rendement: number }> = {
  gaz: { eurKwh: 0.112, rendement: 0.92 },
  fioul: { eurKwh: 0.145, rendement: 0.86 },
};

export function economieAnnuelle(input: {
  besoinKwh: number;
  couverture: number;
  scop: number;
  energie: EnergieChaudiere;
  prixElec: number;
  mode: ModePac;
}): { coutAvantEur: number; coutApresEur: number; economieEur: number } {
  const combustible = PRIX_ENERGIE[input.energie];
  const coutAvantEur = input.besoinKwh <= 0 ? 0 : (input.besoinKwh / combustible.rendement) * combustible.eurKwh;
  const partPac = Math.min(1, Math.max(0, input.couverture));
  const kwhPac = input.besoinKwh * partPac;
  const kwhReste = input.besoinKwh - kwhPac;
  const coutPac = input.scop > 0 ? (kwhPac / input.scop) * input.prixElec : 0;
  const coutReste =
    input.mode === "hybride" ? (kwhReste / combustible.rendement) * combustible.eurKwh : kwhReste * input.prixElec;
  const coutApresEur = coutPac + coutReste;
  return { coutAvantEur, coutApresEur, economieEur: coutAvantEur - coutApresEur };
}

export function scopRetenu(mode: ModePac): number {
  if (mode === "hybride") return 3.6;
  if (mode === "cascade") return 3.4;
  return 3.1;
}

export function prixElectricite(type: TypeBatiment): number {
  return type === "tertiaire" ? 0.17 : 0.21;
}

export function zoneLibelle(zone: ZoneCee): string {
  if (zone === "H1") return "H1";
  if (zone === "H2") return "H2";
  return "H3";
}
