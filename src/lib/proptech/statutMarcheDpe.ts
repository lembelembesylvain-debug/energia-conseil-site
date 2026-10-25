/** Motif officiel du DPE et occupation, pour le filtre Carto Sniper et la fiche A4. */

export type MotifDpe = "vente" | "location" | "autre";
export type StatutOccupation = "bailleur" | "occupant";

export interface MarcheDpe {
  motifDpe?: MotifDpe | null;
  statutOccupation?: StatutOccupation | null;
  etiquette?: string | null;
  chauffage?: string | null;
  conso?: number | null;
  consoKwhM2?: number | null;
  surface?: number | null;
  surfaceHabitableM2?: number | null;
}

export const PRIX_KWH_EDF_EUR = 0.25;

export interface BanniereOpportunite {
  id: "vente" | "bailleur" | "solaire";
  titre: string;
  detail: string;
}

function jeton(valeur: unknown): string {
  return String(valeur ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]+/g, " ")
    .trim();
}

export function normaliserMotifDpe(valeur: unknown): MotifDpe | undefined {
  const v = jeton(valeur);
  if (!v) return undefined;
  if (v === "vente" || v === "dpe vente" || v === "mise en vente") return "vente";
  if (v === "location" || v === "locatif" || v === "bailleur") return "location";
  if (v === "autre") return "autre";
  return undefined;
}

export function normaliserStatutOccupation(valeur: unknown): StatutOccupation | undefined {
  const v = jeton(valeur);
  if (!v) return undefined;
  if (v === "bailleur" || v === "proprietaire bailleur" || v === "location") return "bailleur";
  if (v === "occupant" || v === "proprietaire" || v === "proprietaire occupant") return "occupant";
  return undefined;
}

export function estBienEnVente(bien: MarcheDpe | null | undefined): boolean {
  return bien?.motifDpe === "vente";
}

export function estBailleur(bien: MarcheDpe | null | undefined): boolean {
  return bien?.motifDpe === "location" || bien?.statutOccupation === "bailleur";
}

export function estBailleurEnInfraction(bien: MarcheDpe | null | undefined): boolean {
  return estBailleur(bien) && (bien?.etiquette === "F" || bien?.etiquette === "G");
}

export function formaterEntierFr(valeur: number): string {
  return Math.round(valeur)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function nombreUtile(valeur: number | null | undefined): number | null {
  return valeur != null && Number.isFinite(valeur) ? valeur : null;
}

export function consoDuBien(bien: MarcheDpe | null | undefined): number | null {
  return nombreUtile(bien?.conso) ?? nombreUtile(bien?.consoKwhM2);
}

export function surfaceDuBien(bien: MarcheDpe | null | undefined): number | null {
  return nombreUtile(bien?.surface) ?? nombreUtile(bien?.surfaceHabitableM2);
}

export function estChauffageElectrique(chauffage: unknown): boolean {
  const v = jeton(chauffage);
  return v.includes("elec") || v.includes("joule");
}

/** Facture EDF estimée : surface habitable × conso DPE × 0,25 EUR/kWh. */
export function factureEdfEstimee(
  surface: number | null | undefined,
  conso: number | null | undefined,
): number | null {
  if (surface == null || conso == null || !(surface > 0) || !(conso > 0)) return null;
  return Math.round(surface * conso * PRIX_KWH_EDF_EUR);
}

export function estCibleSolaire(bien: MarcheDpe | null | undefined): boolean {
  if (!bien || !estChauffageElectrique(bien?.chauffage)) return false;
  const conso = consoDuBien(bien);
  if (conso != null && conso >= 250) return true;
  const facture = factureEdfEstimee(surfaceDuBien(bien), conso);
  return facture != null && facture > 4000;
}

export function plusValueRenovation(valeurVenale: number | null | undefined): number | null {
  if (valeurVenale == null || !(valeurVenale > 0)) return null;
  return Math.round(valeurVenale * 1.2);
}

export function libelleMotifDpe(bien: MarcheDpe): string {
  if (estBienEnVente(bien)) return "VENTE EN COURS";
  if (estBailleur(bien)) return "LOCATION (PROPRIÉTAIRE BAILLEUR)";
  if (bien.statutOccupation === "occupant") return "PROPRIÉTAIRE OCCUPANT";
  if (bien.motifDpe === "autre") return "Autre motif DPE";
  return "Non renseigné";
}

/** Alerte bloc 3 : G interdit à la location depuis 2025, F au 1er janvier 2028. */
export function alerteBailleur(bien: MarcheDpe): string | null {
  if (!estBailleurEnInfraction(bien)) return null;
  if (bien.etiquette === "G") {
    return "URGENCE BAILLEUR : Logement frappé par l'interdiction de louer au 1er janvier 2025. Risque d'annulation de bail ou de blocage du loyer.";
  }
  return "URGENCE BAILLEUR : Logement classé F. Gel des loyers en vigueur. Interdiction de louer au 1er janvier 2028. Risque de blocage du loyer.";
}

export function bannieresOpportunite(
  bien: MarcheDpe,
  valeurVenale?: number | null,
): BanniereOpportunite[] {
  const lignes: BanniereOpportunite[] = [];
  if (estBienEnVente(bien)) {
    const apres = plusValueRenovation(valeurVenale);
    lignes.push({
      id: "vente",
      titre: "Mise en vente active · Mandat prioritaire",
      detail:
        apres != null
          ? `Plus-value vénale après rénovation globale : +20 % · ${formaterEntierFr(apres)} EUR`
          : "Plus-value vénale après rénovation globale : +20 % (valeur à établir)",
    });
  }
  if (estBailleurEnInfraction(bien)) {
    lignes.push({
      id: "bailleur",
      titre: "Propriétaire Bailleur · Urgence Loi Climat",
      detail: "Location interdite (G depuis 2025 / F en 2028) · Loyers bloqués",
    });
  }
  if (estCibleSolaire(bien)) {
    const facture = factureEdfEstimee(surfaceDuBien(bien), consoDuBien(bien));
    const montant = facture != null ? `${formaterEntierFr(facture)} EUR` : "non chiffrée";
    lignes.push({
      id: "solaire",
      titre: `Facture EDF estimée : ${montant} / an · Idéal Solaire & Tesla`,
      detail:
        "Potentiel Solaire 6 à 9 kWc + Batterie Tesla Powerwall 3 (économie estimée : jusqu'à 70 % de la facture)",
    });
  }
  return lignes;
}

export function textesStatutLateral(bien: MarcheDpe): string[] {
  const lignes: string[] = [];
  if (estBienEnVente(bien)) {
    lignes.push("Statut marché : Mis en vente (DPE Vente obligatoire)");
  }
  if (estBailleur(bien)) {
    lignes.push("Statut d'occupation : Propriétaire Bailleur (Location active - Risque interdiction Loi Climat)");
  }
  return lignes;
}
