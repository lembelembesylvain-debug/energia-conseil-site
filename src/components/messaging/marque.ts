const CLE_MARQUE = "energia-messagerie-marque-v2";

export const LOGO_ARBRES = "/assets/energia-logo-arbres.png";

export const SIGNATURE_DEUX_SITES = [
  "Sylvain Lembelembe",
  "Fondateur & CEO — Contractant Général Digital",
  "ENERGIA-CONSEIL IA®️",
  "Direction & Ingénierie",
  "Bureau d'Études Thermiques & Solaire — Contractant Général",
  "Marque déposée INPI n° 5213845",
  "16 Rue Cuvier, 69006 Lyon",
  "06 10 59 68 98",
  "contact@energia-conseil-ia.com",
  "energia-conseil-ia.com | renovoptim-ia.com",
].join("\n");

export type MarqueEmail = {
  logoUrl: string;
  nomExpediteur: string;
  emailExpediteur: string;
  signature: string;
};

export const MARQUE_DEFAUT: MarqueEmail = {
  logoUrl: LOGO_ARBRES,
  nomExpediteur: "ENERGIA CONSEIL IA®️",
  emailExpediteur: "contact@renovoptim-ia.com",
  signature: SIGNATURE_DEUX_SITES,
};

export function lireMarque(): MarqueEmail {
  if (typeof localStorage === "undefined") return MARQUE_DEFAUT;
  try {
    const brut = localStorage.getItem(CLE_MARQUE);
    if (!brut) return MARQUE_DEFAUT;
    const lu = JSON.parse(brut) as Partial<MarqueEmail>;
    return {
      logoUrl: typeof lu.logoUrl === "string" && lu.logoUrl.trim() ? lu.logoUrl.trim() : MARQUE_DEFAUT.logoUrl,
      nomExpediteur: typeof lu.nomExpediteur === "string" && lu.nomExpediteur.trim() ? lu.nomExpediteur.trim() : MARQUE_DEFAUT.nomExpediteur,
      emailExpediteur:
        typeof lu.emailExpediteur === "string" && lu.emailExpediteur.includes("@")
          ? lu.emailExpediteur.trim()
          : MARQUE_DEFAUT.emailExpediteur,
      signature: typeof lu.signature === "string" && lu.signature.trim() ? lu.signature : MARQUE_DEFAUT.signature,
    };
  } catch {
    return MARQUE_DEFAUT;
  }
}

export function enregistrerMarque(marque: MarqueEmail): void {
  localStorage.setItem(CLE_MARQUE, JSON.stringify(marque));
}

export function enteteFrom(marque: MarqueEmail): string {
  const nom = marque.nomExpediteur.replace(/[<>\r\n]/g, "").trim() || MARQUE_DEFAUT.nomExpediteur;
  const email = marque.emailExpediteur.replace(/[<>\r\n]/g, "").trim() || MARQUE_DEFAUT.emailExpediteur;
  return `${nom} <${email}>`;
}
