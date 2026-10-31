import { jsPDF } from "jspdf";

export const EMAIL_DAMIEN = "damien.srdconseil@gmail.com";
export const EMAIL_SYLVAIN = "contact@energia-conseil-ia.com";
export const MAX_CIBLES_COMMANDO = 10;
const MAX_FICHES_MAIL = 8;

function latin(texte) {
  return String(texte ?? "")
    .replace(/[—–−]/g, "-")
    .replace(/[’‘]/g, "'")
    .replace(/\u00a0|\u202f/g, " ")
    .replace(/[éèêë]/g, "e")
    .replace(/[àâä]/g, "a")
    .replace(/[îï]/g, "i")
    .replace(/[ôö]/g, "o")
    .replace(/[ùûü]/g, "u")
    .replace(/ç/g, "c")
    .replace(/[ÉÈÊË]/g, "E")
    .replace(/[ÀÂÄ]/g, "A")
    .replace(/œ/g, "oe")
    .replace(/²/g, "2")
    .replace(/€/g, "EUR");
}

export function idLogement(logement) {
  const brut = String(logement?.id || "").trim();
  if (brut) return brut;
  return [logement?.adresse, logement?.codePostal, logement?.lat, logement?.lng].filter(Boolean).join("-");
}

export function limiteCibles(cibles) {
  return (cibles || []).slice(0, MAX_CIBLES_COMMANDO);
}

function surface(logement) {
  const valeur = Number(logement?.surface);
  return Number.isFinite(valeur) && valeur > 0 ? `${Math.round(valeur)} m2` : "surface non renseignee";
}

function potentiel(logement) {
  const note = String(logement?.etiquette || "").toUpperCase();
  if (note === "F" || note === "G") {
    return "Isolation des combles, puis des murs, puis menuiseries, VMC et PAC dimensionnee apres isolation.";
  }
  if (note === "E" || note === "D") {
    return "Renfort d'isolation et remplacement du generateur apres recalage des deperditions.";
  }
  return "Verification de l'enveloppe et du generateur avant tout chiffrage.";
}

export function dossierDepuisLogement(logement) {
  const id = idLogement(logement);
  const adresse = String(logement?.adresse || "Adresse a completer").trim();
  const commune = String(logement?.commune || "").trim();
  const cp = String(logement?.codePostal || "").trim();
  const note = String(logement?.etiquette || "?").toUpperCase();
  return {
    id: `dpe-${id}`,
    libelle: adresse,
    nom: commune || adresse,
    civilite: "",
    email: "",
    telephone: "",
    ville: [cp, commune].filter(Boolean).join(" "),
    projet: `DPE ${note} · ${surface(logement)} · ${logement?.chauffage || "chauffage a confirmer"}`,
    lienDocument: "",
  };
}

export function corpsPack(cibles) {
  const lignes = limiteCibles(cibles).map((logement, index) => {
    const note = String(logement?.etiquette || "?").toUpperCase();
    const passe = note === "F" || note === "G" ? " passoire" : "";
    return [
      `${index + 1}. ${logement?.adresse || "Adresse a completer"}`,
      `   ${logement?.codePostal || ""} ${logement?.commune || ""}`.trimEnd(),
      `   Surface : ${surface(logement)} · Chauffage : ${logement?.chauffage || "—"}`,
      `   DPE ${note}${passe}${logement?.conso ? ` · ${logement.conso} kWh/m2.an` : ""}`,
      `   Potentiel : ${potentiel(logement)}`,
    ].join("\n");
  });
  return [
    "Bonjour Damien,",
    "",
    `Voici le pack Commando : ${lignes.length} cible(s) relevee(s) sur la carte DPE.`,
    "Chaque ligne reprend l'adresse, la surface, le chauffage, la note et le potentiel de travaux.",
    "Copie de pilotage : Sylvain LEMBELEMBE, AMO ENERGIA CONSEIL IA.",
    "",
    ...lignes,
    "",
    "Aides financieres 2026 (estimation a titre indicatif). Aides a valider selon revenus reels du client et eligibilite en vigueur. Montants definitifs apres instruction ANAH et CEE.",
    "",
    "Sylvain LEMBELEMBE (AMO) 06 10 59 68 98",
    "DAMIEN (Commercial) 06 72 68 09 68",
    "FABIEN (VIVONS COURTIER) 06 71 19 96 45",
    "Julia (Juriste)",
    "MAR Antoine BARATIER - Cabinet C2ET",
  ].join("\n");
}

function ecrireParagraphe(doc, texte, x, y, largeur) {
  const morceaux = doc.splitTextToSize(latin(texte), largeur);
  doc.text(morceaux, x, y);
  return y + morceaux.length * 4.6;
}

function pageCourrier(doc, logement, index, total) {
  if (index > 0) doc.addPage();
  doc.setFillColor(8, 18, 40);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(232, 255, 246);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ENERGIA CONSEIL IA", 14, 11);
  doc.setFontSize(13);
  doc.text("Courrier d'ingenierie - cible DPE", 14, 19);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(latin(`${index + 1} / ${total}`), 180, 19);
  doc.setTextColor(15, 23, 42);
  const note = String(logement?.etiquette || "?").toUpperCase();
  const adresse = `${logement?.adresse || "Adresse a completer"}, ${logement?.codePostal || ""} ${logement?.commune || ""}`;
  let y = 40;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  y = ecrireParagraphe(doc, adresse, 14, y, 182);
  y += 4;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const paragraphes = [
    "Madame, Monsieur,",
    `Le diagnostic repere sur ce bien est classe ${note}${logement?.conso ? `, soit environ ${logement.conso} kWh/m2.an` : ""}. Surface : ${surface(logement)}. Chauffage : ${logement?.chauffage || "a confirmer"}. Annee de construction : ${logement?.annee || "non renseignee"}.`,
    `Potentiel de travaux, dans l'ordre : ${potentiel(logement)}`,
    "Ce courrier prepare une prise de contact. Il ne vaut ni audit reglementaire, ni devis, ni promesse d'aides.",
    "Aides financieres 2026 (estimation a titre indicatif). Aides a valider selon revenus reels du client et eligibilite en vigueur. Montants definitifs apres instruction ANAH et CEE.",
    "Sylvain LEMBELEMBE - AMO ENERGIA CONSEIL IA - 06 10 59 68 98 - contact@energia-conseil-ia.com",
    "DAMIEN (Commercial) 06 72 68 09 68 | FABIEN (VIVONS COURTIER) 06 71 19 96 45 | Julia (Juriste) | MAR Antoine BARATIER - Cabinet C2ET",
  ];
  paragraphes.forEach((paragraphe) => {
    y = ecrireParagraphe(doc, paragraphe, 14, y, 182);
    y += 3;
  });
}

export function fichesPdfPieces(cibles) {
  return limiteCibles(cibles)
    .slice(0, MAX_FICHES_MAIL)
    .map((logement) => {
      const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
      pageCourrier(doc, logement, 0, 1);
      const brut = doc.output("datauristring");
      const coupe = brut.indexOf(",");
      const note = String(logement?.etiquette || "DPE").toUpperCase();
      return {
        nom: `Fiche-DPE-${note}-${idLogement(logement).replace(/[^\w-]+/g, "").slice(0, 24) || "cible"}.pdf`,
        contenuBase64: coupe >= 0 ? brut.slice(coupe + 1) : brut,
      };
    });
}

export function telechargerCourriers(cibles) {
  const liste = limiteCibles(cibles);
  if (liste.length === 0) return;
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  liste.forEach((logement, index) => pageCourrier(doc, logement, index, liste.length));
  doc.save(`Courriers-commando-DPE-${liste.length}.pdf`);
}
