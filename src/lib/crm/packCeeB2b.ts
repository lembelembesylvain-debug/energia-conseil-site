import { jsPDF } from "jspdf";
import { estimationCentraleEur, volumeCumacDepuisEuros, type CeeFicheTravaux } from "./ceeRadarTravaux";
import { ficheStrategiqueParCode } from "./fichesStrategiquesCee";
import { EMAIL_DAMIEN } from "./commandoDpe";

export { EMAIL_DAMIEN };

function latin(texte: string) {
  return texte
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
    .replace(/²/g, "2")
    .replace(/€/g, "EUR");
}

export function euroPack(montant: number) {
  return montant.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

export function potentielCumule(fiches: CeeFicheTravaux[]) {
  return fiches.reduce((total, fiche) => total + estimationCentraleEur(fiche), 0);
}

export function corpsPackCee(fiches: CeeFicheTravaux[]) {
  const lignes = fiches.map((fiche, index) => {
    const strategie = ficheStrategiqueParCode(fiche.code);
    const metiers = strategie?.corpsEtat?.length ? strategie.corpsEtat.join(", ") : "corps d'état à confirmer au dossier";
    return [
      `${index + 1}. ${fiche.code} — ${fiche.intitule} (${fiche.segment})`,
      `   Prime indicative : ${fiche.prime} · repère central ${euroPack(estimationCentraleEur(fiche))}`,
      `   Volume : ${volumeCumacDepuisEuros(fiche.estimationMinEur, fiche.estimationMaxEur)}`,
      `   Corps d'état : ${metiers}`,
      `   Argument : ${fiche.argumentCle}`,
    ].join("\n");
  });
  return [
    "Bonjour Damien,",
    "",
    `Pack B2B CEE : ${fiches.length} opération(s), potentiel cumulé indicatif ${euroPack(potentielCumule(fiches))}.`,
    "Le récapitulatif reprend la prime, le volume cumac, les corps d'état et l'argument de vente. Les fiches techniques sont jointes.",
    "",
    ...lignes,
    "",
    "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels, éligibilité et cours EMMY. Montants définitifs après instruction ANAH et CEE.",
    "",
    "Sylvain LEMBELEMBE (AMO) 06 10 59 68 98",
    "DAMIEN (Commercial) 06 72 68 09 68",
    "FABIEN (VIVONS COURTIER) 06 71 19 96 45",
    "Julia (Juriste)",
    "MAR Antoine BARATIER - Cabinet C2ET",
  ].join("\n");
}

function paragraphe(doc: jsPDF, texte: string, x: number, y: number, largeur: number) {
  const morceaux = doc.splitTextToSize(latin(texte), largeur) as string[];
  doc.text(morceaux, x, y);
  return y + morceaux.length * 4.4;
}

export function documentPackCee(fiches: CeeFicheTravaux[]) {
  const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });
  fiches.forEach((fiche, index) => {
    if (index > 0) doc.addPage();
    const strategie = ficheStrategiqueParCode(fiche.code);
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, "F");
    doc.setTextColor(254, 243, 199);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ENERGIA CONSEIL IA - Pack d'opportunite CEE", 14, 11);
    doc.setFontSize(13);
    doc.text(latin(`${fiche.code} - ${fiche.intitule}`).slice(0, 78), 14, 19);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`${index + 1} / ${fiches.length}`, 180, 19);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    let y = 40;
    const blocs = [
      `Segment : ${fiche.segment}. Prime : ${fiche.prime}. Repere central : ${euroPack(estimationCentraleEur(fiche))}.`,
      `Volume cumac : ${volumeCumacDepuisEuros(fiche.estimationMinEur, fiche.estimationMaxEur)}.`,
      strategie?.principe || fiche.argumentCle,
      `Corps d'etat : ${(strategie?.corpsEtat || ["A confirmer au dossier"]).join(" ; ")}`,
      strategie?.eligibilite?.length ? `Eligibilite : ${strategie.eligibilite.join(" ")}` : fiche.cibles,
      "Aides financieres 2026 (estimation a titre indicatif). A valider selon eligibilite et cours EMMY. Montants definitifs apres instruction CEE.",
    ];
    blocs.forEach((bloc) => {
      y = paragraphe(doc, bloc, 14, y, 182);
      y += 3;
    });
  });
  return doc;
}

export function pdfPackCeeBase64(fiches: CeeFicheTravaux[]) {
  const brut = documentPackCee(fiches).output("datauristring");
  const coupe = brut.indexOf(",");
  return coupe >= 0 ? brut.slice(coupe + 1) : brut;
}

export function telechargerPackCee(fiches: CeeFicheTravaux[]) {
  if (fiches.length === 0) return;
  documentPackCee(fiches).save(`Pack-opportunite-CEE-${fiches.length}.pdf`);
}
