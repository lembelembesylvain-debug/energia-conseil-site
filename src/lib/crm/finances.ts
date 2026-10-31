/**
 * Commissions et marges commerciales CRM — ENERGIA CONSEIL IA®.
 *
 * Règle par défaut : 10 % HT du montant des travaux (projets globaux).
 * Ces montants sont internes : ils ne s’ajoutent JAMAIS au prix client HT/TTC du devis.
 */

export const COMMISSION_RATE_DEFAULT = 10;

export const COMMERCIAL_DAMIEN = {
  id: "commercial-damien",
  nom: "DAMIEN",
  email: "damien.srdconseil@gmail.com",
  telephone: "06 72 68 09 68",
} as const;

/** Aucun commercial sélectionnable. L'identifiant historique Damien n'ouvre plus de session. */
export const COMMERCIAUX_CRM = [] as const;

export type FinancesProjet = {
  commercial_id: string | null;
  commercialNom: string | null;
  commission_rate_default: number;
  commission_amount: number | null;
  partner_id: string | null;
  partner_commission: number;
  venteHt: number | null;
  coutArtisanHt: number | null;
  net_margin: number | null;
  /** Toujours false : la commission n’est pas un poste du devis client. */
  impactePrixClient: false;
};

export type FinancesCommercial = {
  commercial_id: string | null;
  commercialNom: string | null;
  commission_rate_default: number;
  commission_amount: number | null;
  libelleCommission: string;
};

function round2(n: number): number {
  return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
}

function montantOuNull(value: unknown): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? round2(n) : null;
}

export function tauxCommissionDecimal(rate = COMMISSION_RATE_DEFAULT): number {
  return rate / 100;
}

export function nomCommercial(commercialId?: string | null): string | null {
  if (!commercialId || commercialId === COMMERCIAL_DAMIEN.id) return null;
  return COMMERCIAUX_CRM.find((item) => item.id === commercialId)?.nom ?? null;
}

export function libelleCommissionAgent(rate = COMMISSION_RATE_DEFAULT): string {
  return `Commission Agent (${rate}% HT)`;
}

/**
 * Calcule les finances internes d’un dossier.
 * Ne modifie pas venteHt : la commission est un coût interne, pas un prix client.
 */
export function calculerFinancesProjet(input: {
  commercial_id?: string | null;
  venteHt?: number | null;
  coutArtisanHt?: number | null;
  commission_rate_default?: number | null;
  partner_commission?: number | null;
  partner_id?: string | null;
}): FinancesProjet {
  const rate =
    input.commission_rate_default != null && Number.isFinite(Number(input.commission_rate_default))
      ? Number(input.commission_rate_default)
      : COMMISSION_RATE_DEFAULT;
  const venteHt = montantOuNull(input.venteHt);
  const coutArtisanHt = montantOuNull(input.coutArtisanHt);
  const commission_amount =
    venteHt == null ? null : round2(venteHt * tauxCommissionDecimal(rate));
  const partner_commission = montantOuNull(input.partner_commission) ?? 0;
  const net_margin =
    venteHt == null || coutArtisanHt == null || commission_amount == null
      ? null
      : round2(venteHt - coutArtisanHt - commission_amount - partner_commission);

  return {
    commercial_id: input.commercial_id ?? null,
    commercialNom: nomCommercial(input.commercial_id),
    commission_rate_default: rate,
    commission_amount,
    partner_id: input.partner_id ?? null,
    partner_commission,
    venteHt,
    coutArtisanHt,
    net_margin,
    impactePrixClient: false,
  };
}

export function financesPourRole(
  finances: FinancesProjet | null | undefined,
  role: string,
  options: { commercialId?: string | null } = {},
): FinancesProjet | FinancesCommercial | null {
  if (!finances) return null;
  if (role === "administrateur") return finances;
  if (role === "commercial") {
    const commercialId = options.commercialId || "";
    if (!commercialId || commercialId === COMMERCIAL_DAMIEN.id) return null;
    if (finances.commercial_id && finances.commercial_id !== commercialId) return null;
    return {
      commercial_id: finances.commercial_id,
      commercialNom: finances.commercialNom,
      commission_rate_default: finances.commission_rate_default,
      commission_amount: finances.commission_amount,
      libelleCommission: libelleCommissionAgent(finances.commission_rate_default),
    };
  }
  return null;
}

export function estVueFinancesComplete(
  vue: FinancesProjet | FinancesCommercial | null,
): vue is FinancesProjet {
  return Boolean(vue && "net_margin" in vue && "impactePrixClient" in vue);
}

export function totauxFinancesAdmin(dossiers: Array<{ finances?: FinancesProjet | null }>) {
  let totalCommissions = 0;
  let totalPartner = 0;
  let totalMargeNette = 0;
  let nbCommissions = 0;
  let nbMarges = 0;
  for (const dossier of dossiers) {
    const finances = dossier.finances;
    if (!finances) continue;
    if (finances.commission_amount != null) {
      totalCommissions = round2(totalCommissions + finances.commission_amount);
      nbCommissions += 1;
    }
    if (finances.partner_commission) {
      totalPartner = round2(totalPartner + finances.partner_commission);
    }
    if (finances.net_margin != null) {
      totalMargeNette = round2(totalMargeNette + finances.net_margin);
      nbMarges += 1;
    }
  }
  return {
    totalCommissions,
    totalPartner,
    totalMargeNette,
    nbCommissions,
    nbMarges,
  };
}

export function enrichirDossierFinances<T extends Record<string, unknown>>(dossier: T) {
  const existant = dossier.finances as FinancesProjet | undefined;
  if (existant && typeof existant === "object" && "commission_rate_default" in existant) {
    return dossier;
  }
  return {
    ...dossier,
    finances: calculerFinancesProjet({
      commercial_id: (dossier.commercial_id as string | null | undefined) ?? null,
      venteHt: (dossier.caHt as number | null | undefined) ?? null,
      coutArtisanHt: (dossier.coutArtisanHt as number | null | undefined) ?? null,
      partner_commission: (dossier.partner_commission as number | null | undefined) ?? 0,
      partner_id:
        (dossier.partenaire_id as string | null | undefined) ??
        (dossier.partner_id as string | null | undefined) ??
        null,
      commission_rate_default:
        (dossier.commission_rate_default as number | null | undefined) ?? COMMISSION_RATE_DEFAULT,
    }),
  };
}

export function totauxCommissionsCommercial(
  dossiers: Array<{ finances?: FinancesProjet | null }>,
  commercialId: string,
) {
  let total = 0;
  let nb = 0;
  for (const dossier of dossiers) {
    const finances = dossier.finances;
    if (!finances) continue;
    if (finances.commercial_id && finances.commercial_id !== commercialId) continue;
    if (finances.commission_amount == null) continue;
    total = round2(total + finances.commission_amount);
    nb += 1;
  }
  return { total, nb };
}
