import jsPDFModule from "jspdf";
import type { jsPDF } from "jspdf";
import { BADGES_OFFICIELS } from "../branding";
import { ecrirePiedIdentite } from "../piedLegalPdf";
import { chargerVisuel, type LogoNote } from "./noteOpportuniteCeePdf";
import { euroSimulateur, type ResultatSolaireTesla } from "./simulateurSolaireTesla";

const VISUEL_SOLAIRE = "/assets/solaire/maison-solaire-stockage.jpg";

type JsPdfCtor = new (options?: { unit?: string; format?: string }) => jsPDF;

function jsPdfConstructor(mod: unknown): JsPdfCtor {
  if (typeof mod === "function") return mod as JsPdfCtor;
  if (mod && typeof mod === "object") {
    const record = mod as { jsPDF?: unknown; default?: unknown };
    if (typeof record.jsPDF === "function") return record.jsPDF as JsPdfCtor;
    if (record.default && record.default !== mod) return jsPdfConstructor(record.default);
  }
  throw new Error("jsPDF introuvable");
}

const JsPDF = jsPdfConstructor(jsPDFModule);

function pct(taux: number) {
  return `${Math.round(taux * 100)} %`;
}

function dessinerCoupe(doc: jsPDF, schema: LogoNote | null, y: number, pageWidth: number) {
  const marge = 14;
  const largeur = pageWidth - 28;
  const hauteur = largeur * (9 / 16);
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(marge - 1, y - 1, largeur + 2, hauteur + 2, 1.2, 1.2, "F");
  if (schema && schema.width > 0 && schema.height > 0) {
    const ratio = schema.width / schema.height;
    const cible = 16 / 9;
    let largeurImage = largeur;
    let hauteurImage = hauteur;
    if (ratio > cible) hauteurImage = largeur / ratio;
    else largeurImage = hauteur * ratio;
    doc.addImage(
      schema.dataUrl,
      "JPEG",
      marge + (largeur - largeurImage) / 2,
      y + (hauteur - hauteurImage) / 2,
      largeurImage,
      hauteurImage,
    );
  }
  return y + hauteur + 6;
}

function assurerPlace(doc: jsPDF, y: number, besoin: number) {
  if (y + besoin <= 278) return y;
  doc.addPage();
  return 16;
}

export async function telechargerPropositionSolaireTesla(resultat: ResultatSolaireTesla, clientNom: string) {
  const doc = new JsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const schema = await chargerVisuel(VISUEL_SOLAIRE);
  const nom = clientNom.trim() || "Client à préciser";
  const date = new Date().toLocaleDateString("fr-FR");
  let y = 18;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 44, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("ENERGIA CONSEIL IA®", 14, 10);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Audit Énergétique Intelligence Artificielle  |  Bureau d'études & AMO", 14, 16);
  doc.setFontSize(6.5);
  const badges = doc.splitTextToSize(BADGES_OFFICIELS.join("   ·   "), pageWidth - 28);
  doc.text(badges, 14, 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("PROPOSITION COMMERCIALE INDICATIVE", 14, 38);

  doc.setTextColor(15, 23, 42);
  y = 52;
  doc.setFontSize(14);
  doc.text("Dimensionnement solaire hybride & stockage Tesla", 14, y);
  y += 7;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Foyer : ${nom}`, 14, y);
  doc.text(`Édité le ${date}`, pageWidth - 14, y, { align: "right" });
  y += 6;
  doc.setFontSize(8);
  doc.setTextColor(100, 80, 20);
  doc.text("Partenaire Agréé Tesla Energy — Powerwall 3 & Wall Connector", 14, y);
  y += 6;
  y = dessinerCoupe(doc, schema, y, pageWidth);

  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Hypothèses de saisie", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lignesSaisie = [
    `Facture d'électricité actuelle : ${euroSimulateur(resultat.saisie.factureAnnuelleEur)} / an`,
    `Puissance retenue : ${resultat.saisie.puissanceKwc} kWc`,
    `Stockage : ${resultat.profil.titre} — ${resultat.profil.detail}`,
    `Tesla Wall Connector 22 kW : ${resultat.saisie.wallConnector ? "oui" : "non"}`,
  ];
  lignesSaisie.forEach((ligne) => {
    doc.text(ligne, 14, y);
    y += 5;
  });

  y += 3;
  y = assurerPlace(doc, y, 48);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Résultats indicatifs", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lignesResultat = [
    `Taux d'indépendance énergétique : ${pct(resultat.independance)}`,
    `Économie estimée : ${euroSimulateur(resultat.economieAnnuelleEur)} / an`,
    `Production estimée : ${resultat.productionKwh.toLocaleString("fr-FR")} kWh/an (Centre, 1 100 kWh/kWc)`,
    `Consommation déduite de la facture : ${resultat.consommationKwh.toLocaleString("fr-FR")} kWh/an à 0,25 €/kWh`,
    `Alimentation de secours Enedis : ${resultat.secoursActif ? "activée avec Powerwall 3" : "non retenue (sans batterie)"}`,
  ];
  lignesResultat.forEach((ligne) => {
    doc.text(ligne, 14, y);
    y += 5;
  });

  y += 3;
  y = assurerPlace(doc, y, 40);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text("Prix indicatif clé en main (matériel + pose RGE / QualiPV)", 14, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const lignesPrix = [
    `Centrale ${resultat.saisie.puissanceKwc} kWc : ${euroSimulateur(resultat.prixCentraleTtc)}`,
    `Stockage : ${euroSimulateur(resultat.prixBatteriesTtc)}`,
    `Borne Wall Connector : ${euroSimulateur(resultat.prixBorneTtc)}`,
  ];
  lignesPrix.forEach((ligne) => {
    doc.text(ligne, 14, y);
    y += 5;
  });
  doc.setFont("helvetica", "bold");
  doc.text(`Total indicatif TTC : ${euroSimulateur(resultat.prixTotalTtc)}`, 14, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const mentions = [
    "Simulation à titre indicatif. Ce document n'est pas un devis signé et ne vaut pas ordre de service.",
    "Prix hors aides, à confirmer après visite de toiture, structure, et puissance de raccordement.",
    "Productivité retenue : 1 100 kWh/kWc/an (Centre). Le sud et l'ombre de site font varier le résultat.",
    "La borne 22 kW suppose une alimentation compatible ; sinon elle est bridée au contrat.",
    "Le secours Powerwall 3 couvre les circuits prioritaires, pas l'intégralité du tableau, après mise en service du dispositif Tesla.",
    "Aides financières 2026 (estimation non déduite). Aides à valider selon éligibilité en vigueur. Montants définitifs après instruction.",
    "Photovoltaïque en dernier, après isolation et dimensionnement du chauffage.",
    "Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 | DAMIEN (Commercial) 06 72 68 09 68 | FABIEN (VIVONS COURTIER) 06 71 19 96 45 | Julia (Juriste) | MAR Antoine BARATIER – Cabinet C2ET.",
  ];
  mentions.forEach((mention) => {
    const wrapped = doc.splitTextToSize(mention, pageWidth - 28);
    y = assurerPlace(doc, y, wrapped.length * 3.6 + 2);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(wrapped, 14, y);
    y += wrapped.length * 3.6 + 1.2;
  });

  ecrirePiedIdentite(doc, 14, Math.min(y + 4, 268), pageWidth - 28);

  const slug = nom
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  doc.save(`Proposition_Solaire_Tesla_${slug || "client"}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
