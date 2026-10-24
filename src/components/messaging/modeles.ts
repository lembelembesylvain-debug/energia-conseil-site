import type { ContexteEmail, DossierMessagerie, ModeleEmailId } from "./types";

export type ModeleEmail = {
  id: ModeleEmailId;
  libelle: string;
  resume: string;
};

export const MODELES_EMAIL: ModeleEmail[] = [
  {
    id: "etude-pac",
    libelle: "Envoi officiel de l'étude thermique & devis PAC",
    resume: "KPI : puissance, économies, CEE déduits",
  },
  {
    id: "calpinage-solaire",
    libelle: "Transmission de l'étude solaire 500 kWc & calpinage toiture/ombrière",
    resume: "Calepinage toiture ou ombrière et bilan",
  },
  {
    id: "relance-j4",
    libelle: "Relance bienveillante devis J+4",
    resume: "Point à quatre jours, sans pression",
  },
  {
    id: "pieces-complementaires",
    libelle: "Demande de pièces justificatives (Avis d'impôt, facture EDF)",
    resume: "Avis d'imposition et facture d'électricité",
  },
  {
    id: "visite-technique",
    libelle: "Confirmation de passage technicien",
    resume: "Accès chaufferie, tableau et combles",
  },
];

const MENTION_AIDES =
  "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.";

export const PHRASE_DOCUMENT =
  "Votre étude technique et votre devis officiel sont disponibles directement en pièce jointe (PDF A4 ci-joint) ou via le bouton ci-dessous.";

/** Retire les URL brutes du type « Lien du document : http://localhost… ». */
export function retirerLiensBruts(corps: string): string {
  return corps.replace(/^Lien du document\s*:.*$/gim, PHRASE_DOCUMENT).replace(/\n{3,}/g, "\n\n");
}

export function euro(valeur: number | undefined): string {
  if (valeur === undefined || !Number.isFinite(valeur)) return "—";
  return Math.round(valeur).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function lienAbsolu(chemin: string): string {
  const propre = chemin.trim();
  if (!propre) return "";
  if (/^https?:\/\//i.test(propre)) return propre;
  if (typeof window === "undefined") return propre;
  const cheminNormalise = propre.startsWith("/") ? propre : `/${propre}`;
  return `${window.location.origin}${cheminNormalise}`;
}

function salutation(dossier: DossierMessagerie, contexte?: ContexteEmail): string {
  const nomSaisi = (contexte?.clientNom || "").trim();
  const nom = nomSaisi || dossier.libelle || dossier.nom;
  const porteDejaUneCivilite = /^(madame|monsieur|mme|mr|m\.|m )\b/i.test(nom);
  if (nomSaisi || porteDejaUneCivilite) return `Bonjour ${nom},`;
  const civilite = (contexte?.civilite || dossier.civilite || "").trim();
  return `Bonjour ${[civilite, nom].filter(Boolean).join(" ")},`;
}

function blocChiffres(lignes: string[]): string {
  const utiles = lignes.filter((ligne) => ligne.trim().length > 0);
  if (utiles.length === 0) return "";
  return `${utiles.join("\n")}\n`;
}

export function composerModele(
  id: ModeleEmailId,
  dossier: DossierMessagerie,
  contexte?: ContexteEmail,
): { sujet: string; corps: string } {
  const ville = contexte?.ville || dossier.ville || "votre commune";
  const projet = contexte?.projet || dossier.projet;
  const bonjour = salutation(dossier, contexte);

  if (id === "etude-pac") {
    const sujet = `ENERGIA CONSEIL IA®️ — Votre étude thermique & devis officiel — ${dossier.libelle}`;
    const corps = (
      [
        bonjour,
        "",
        `Veuillez trouver l'étude thermique et le devis officiel de pompe à chaleur établi par ENERGIA CONSEIL IA® pour votre projet${projet ? ` « ${projet} »` : ""} à ${ville}.`,
        "",
        blocChiffres([
          contexte?.puissanceThermiqueKw ? `Déperditions du bâtiment : ${contexte.puissanceThermiqueKw.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kW.` : "",
          contexte?.puissanceKw ? `Puissance PAC retenue après isolation : ${contexte.puissanceKw.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kW.` : "",
          contexte?.economiesAnnuelles ? `Économies annuelles estimées : ${euro(contexte.economiesAnnuelles)}.` : "",
          contexte?.ceeEur ? `CEE déduits (estimation à titre indicatif) : ${euro(contexte.ceeEur)}.` : "",
          contexte?.totalTtc ? `Montant des travaux : ${euro(contexte.totalTtc)} TTC.` : "",
          contexte?.resteACharge ? `Reste à charge estimé : ${euro(contexte.resteACharge)} TTC.` : "",
        ]).trimEnd(),
        "",
        PHRASE_DOCUMENT,
        "",
        "Le chauffage se dimensionne après l'isolation. Le devis est valable 3 mois. Les travaux du parcours MaPrimeRénov' ne démarrent qu'après l'accord écrit de l'ANAH.",
        "",
        MENTION_AIDES,
        "",
        "Je reste disponible pour le commenter avec vous. Votre interlocuteur commercial est DAMIEN (06 72 68 09 68). Le financement, si vous le souhaitez, est monté par FABIEN — VIVONS COURTIER (06 71 19 96 45).",
      ]
        .filter((ligne, index, liste) => ligne !== "" || liste[index - 1] !== "")
        .join("\n")
    );
    return { sujet, corps };
  }

  if (id === "calpinage-solaire") {
    const kwc = contexte?.kwc;
    const kwcLibelle = kwc && kwc >= 100 ? `${kwc.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} kWc` : kwc ? `${kwc.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} kWc` : "solaire";
    const sujet = `Calepinage solaire ${kwc && kwc >= 100 ? kwcLibelle : "et bilan financier"} — ${dossier.libelle}`;
    const retour =
      contexte?.retourAns === null
        ? "au-delà de 25 ans"
        : contexte?.retourAns
          ? `${contexte.retourAns.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} ans`
          : "";
    const corps = (
      [
        bonjour,
        "",
        `Veuillez trouver l'étude solaire${kwc ? ` (${kwcLibelle})` : ""} et le calepinage toiture / ombrière, ainsi que le bilan financier de votre projet${projet ? ` « ${projet} »` : ""} à ${ville}.`,
        "",
        blocChiffres([
          kwc ? `Puissance installée : ${kwcLibelle}.` : "",
          contexte?.gainAnnuel ? `Gain estimé la première année : ${euro(contexte.gainAnnuel)}.` : "",
          contexte?.cumul25 ? `Économies cumulées sur 25 ans : ${euro(contexte.cumul25)}.` : "",
          retour ? `Temps de retour indicatif : ${retour}.` : "",
          contexte?.totalTtc ? `Investissement : ${euro(contexte.totalTtc)} TTC.` : "",
          contexte?.resteACharge ? `Reste à charge estimé : ${euro(contexte.resteACharge)} TTC.` : "",
        ]).trimEnd(),
        "",
        PHRASE_DOCUMENT,
        "",
        "En rénovation globale, le photovoltaïque se pose en dernier, après l'isolation, les menuiseries, la ventilation et le chauffage. Cette étude ne vaut pas devis signé. Validation QualiPV avant commande.",
        "",
        MENTION_AIDES,
      ]
        .filter((ligne, index, liste) => ligne !== "" || liste[index - 1] !== "")
        .join("\n")
    );
    return { sujet, corps };
  }

  if (id === "relance-j4") {
    return {
      sujet: `Votre devis ENERGIA — un point quand vous voulez — ${dossier.libelle}`,
      corps: (
        [
          bonjour,
          "",
          "Je me permets une relance bienveillante, quatre jours après l'envoi du devis. Aucune urgence de votre côté.",
          "",
          `Je voulais simplement savoir si vous aviez pu en prendre connaissance${projet ? ` (projet « ${projet} »)` : ""} et si un échange de quinze minutes vous serait utile pour lever une question technique, d'aides ou de financement.`,
          "",
          PHRASE_DOCUMENT,
          "",
          MENTION_AIDES,
          "",
          "Si le moment n'est pas le bon, dites-le moi : je reprogramme sans difficulté.",
        ].join("\n")
      ),
    };
  }

  if (id === "pieces-complementaires") {
    return {
      sujet: `Pièces complémentaires pour votre dossier — ${dossier.libelle}`,
      corps: (
        [
          bonjour,
          "",
          `Pour avancer sur votre dossier${projet ? ` « ${projet} »` : ""} à ${ville}, merci de nous transmettre les pièces suivantes, lisibles et complètes :`,
          "",
          "1. Dernier avis d'imposition (toutes les pages, recto et verso).",
          "2. Facture d'électricité récente (EDF ou votre fournisseur), avec le numéro de PDL et la consommation annuelle.",
          "3. Si un financement est envisagé : un RIB, pour le dossier monté par FABIEN — VIVONS COURTIER (06 71 19 96 45).",
          "",
          "Vous pouvez répondre directement à cet email en joignant les fichiers. Ces documents servent à vérifier l'éligibilité réelle aux aides. Le client certifie l'exactitude des informations transmises.",
          "",
          MENTION_AIDES,
        ].join("\n")
      ),
    };
  }

  return {
    sujet: `Confirmation de visite technique — ${dossier.libelle}`,
    corps: (
      [
        bonjour,
        "",
        `Je vous confirme le passage de notre technicien pour la visite technique${ville ? ` à ${ville}` : ""}${projet ? `, concernant « ${projet} »` : ""}.`,
        "",
        "Merci de prévoir :",
        "- l'accès au logement à l'heure convenue ;",
        "- l'accès au tableau électrique, à la chaufferie ou au local technique, et aux combles si l'isolation est au programme ;",
        "- les factures d'énergie des douze derniers mois, si vous les avez sous la main.",
        "",
        "Votre interlocuteur AMO reste Sylvain LEMBELEMBE, joignable au 06 10 59 68 98. En cas d'empêchement, un simple retour suffit pour déplacer le rendez-vous.",
      ].join("\n")
    ),
  };
}
