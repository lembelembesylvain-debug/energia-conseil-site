/**
 * Étude A4 de faisabilité solaire et Tesla Powerwall 3, à partir de la fiche Carto Sniper.
 */
import { jsPDF } from "jspdf";
import {
  PIED_CONTACT,
  PIED_EQUIPE,
  textePdf,
  type FicheOpportunite,
} from "./ficheOpportuniteSniper";
import {
  AUTOCONSO_SIMPLE,
  AUTOCONSO_TESLA,
  CAPACITE_POWERWALL_KWH,
  IRRADIATION_BOURGOGNE_KWH_PAR_KWC,
  MENTION_TARIF_OA,
  calculerEtudeSolaire,
  formaterEntierFr,
  type EtudeSolaire,
} from "./solaireCalculs";

export interface EtudeSolaireSite {
  etude: EtudeSolaire;
  reference: string;
  adresse: string;
  parcelle: string;
  toiture: string;
}

export function composerEtudeSolaire(fiche: FicheOpportunite): EtudeSolaireSite {
  const etude = calculerEtudeSolaire({
    empriseM2: fiche.empriseM2,
    empriseFiable: fiche.ancreeSurReleve,
    surfaceHabitableM2: fiche.surfaceHabitableM2,
    chauffage: fiche.chauffage,
    consoKwhM2: fiche.consoKwhM2,
    etiquette: fiche.etiquette,
    typeBati: fiche.typeBati,
  });
  const reference = fiche.reference.replace(/^SNIPER-/, "SOLAIRE-");
  const parcelle = [fiche.section, fiche.numero].filter(Boolean).join(" ") || "Non communiquée";
  const toiture =
    etude.toitureExploitableM2 != null
      ? `${formaterEntierFr(etude.toitureExploitableM2)} m2 exploitables`
      : "À relever";
  return { etude, reference, adresse: fiche.adresseComplete, parcelle, toiture };
}

function euros(valeur: number | null): string {
  if (valeur == null) return "Non chiffré";
  return `${formaterEntierFr(valeur)} EUR`;
}

function ecrire(
  pdf: jsPDF,
  texte: string,
  x: number,
  y: number,
  largeur: number,
  taille = 8,
): number {
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(taille);
  pdf.setTextColor(15, 23, 42);
  const lignes = pdf.splitTextToSize(textePdf(texte), largeur) as string[];
  pdf.text(lignes, x, y);
  return y + lignes.length * (taille * 0.42);
}

export function mettreEnPageEtudeSolaire(fiche: FicheOpportunite): { pdf: jsPDF; bas: number } {
  const site = composerEtudeSolaire(fiche);
  const etude = site.etude;
  const pdf = new jsPDF({ unit: "mm", format: "a4", compress: false });
  pdf.setProperties({
    title: textePdf(`Etude solaire ${site.reference}`),
    author: "ENERGIA CONSEIL IA",
    subject: "Faisabilite solaire et Tesla Powerwall 3",
    creator: "ENERGIA CONSEIL IA",
  });

  pdf.setFillColor(11, 31, 51);
  pdf.rect(0, 0, 210, 28, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text(textePdf("ENERGIA CONSEIL IA (R)"), 12, 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text(textePdf("Ingénierie Solaire QualiPV & Solutions Tesla Powerwall"), 12, 16);
  pdf.setFontSize(7.5);
  pdf.text(textePdf("16 Rue Cuvier, 69006 Lyon  |  SIRET 94181942700019"), 12, 22);
  pdf.setFont("helvetica", "bold");
  pdf.text(site.reference, 198, 16, { align: "right" });

  pdf.setFillColor(244, 240, 230);
  pdf.rect(0, 28, 210, 8, "F");
  pdf.setTextColor(11, 31, 51);
  pdf.setFontSize(8);
  pdf.text(textePdf("FICHE D'ÉTUDE SOLAIRE & AUTOCONSOMMATION"), 105, 33.2, { align: "center" });

  let y = 42;
  const blocs: Array<{ titre: string; lignes: string[] }> = [
    {
      titre: "1  -  Caractéristiques du site",
      lignes: [
        `Adresse : ${site.adresse}`,
        `Parcelle IGN : ${site.parcelle}`,
        `Surface de toiture disponible : ${site.toiture}`,
        etude.noteToiture,
        `Chauffage : ${fiche.chauffage}. Irradiation retenue : ${IRRADIATION_BOURGOGNE_KWH_PAR_KWC} kWh/kWc/an (Bourgogne).`,
      ],
    },
    {
      titre: "2  -  Calepinage technique",
      lignes: [
        etude.libellePuissance,
        `${etude.nombreModules} modules 500 W bifaciaux (biverre), soit ${String(etude.puissanceKwc).replace(".", ",")} kWc.`,
        "Onduleur hybride intégré au stockage, câblage DC jusqu'aux modules et AC vers le tableau.",
        `Production annuelle estimée : ${formaterEntierFr(etude.productionAnnuelleKwh)} kWh/an.`,
      ],
    },
    {
      titre: "3  -  Stockage Tesla Powerwall 3",
      lignes: [
        `Batterie ${String(CAPACITE_POWERWALL_KWH).replace(".", ",")} kWh, onduleur hybride intégré, alimentation de secours en cas de coupure réseau.`,
        `Autoconsommation solaire simple : ${Math.round(AUTOCONSO_SIMPLE * 100)} %. Avec Powerwall 3 : ${Math.round(AUTOCONSO_TESLA * 100)} % du productible, plafonnée à la consommation du site.`,
        `kWh autoconsommés : ${formaterEntierFr(etude.kwhAutoTesla)}. Surplus revendu : ${formaterEntierFr(etude.kwhSurplusTesla)} kWh.`,
      ],
    },
    {
      titre: "4  -  Bilan économique sur 25 ans",
      lignes: [
        `Facture EDF actuelle, avant solaire : ${euros(etude.factureActuelleEur)}.`,
        `Facture EDF résiduelle après solaire + Tesla : ${euros(etude.factureResiduelleEur)}.`,
        `Économie annuelle : ${euros(etude.economieAnnuelleEur)} (kWh autoconsommés x 0,25 EUR + surplus x 0,011 EUR). Sans batterie : ${euros(etude.economieSimpleEur)}.`,
        etude.partFactureEffacee != null
          ? `Part de facture effacée sur ce site : ${Math.round(etude.partFactureEffacee * 100)} %. Le plafond de 70 % vise un foyer dont les usages électriques sont couverts par la toiture.`
          : "Part de facture non calculée : consommation électrique insuffisamment renseignée.",
        `Gains cumulés sur 25 ans : ${euros(etude.gains25AnsEur)}, décote de performance 0,5 %/an, hors inflation.`,
        etude.roiAnnees != null
          ? `Retour calculé : ${String(etude.roiAnnees).replace(".", ",")} ans (pose ${euros(etude.coutPoseEur)} + Powerwall ${euros(etude.coutBatterieEur)}). La fourchette de 5 à 7 ans correspond à un tarif de surplus antérieur à juin 2026.`
          : "Retour non calculé.",
        MENTION_TARIF_OA,
      ],
    },
  ];

  blocs.forEach((bloc) => {
    pdf.setFillColor(11, 31, 51);
    pdf.rect(12, y, 186, 6, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(textePdf(bloc.titre), 14, y + 4.1);
    y += 9;
    bloc.lignes.forEach((ligne) => {
      y = ecrire(pdf, ligne, 14, y, 182, 7.4) + 1.3;
    });
    y += 1.6;
  });

  pdf.setFillColor(11, 31, 51);
  pdf.rect(0, 276, 210, 21, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.4);
  pdf.text(
    textePdf("Certification QualiPV Qualit'EnR. Garantie décennale de pose. Assurance responsabilité civile professionnelle."),
    12,
    281,
  );
  pdf.text(textePdf(`Contact : ${PIED_CONTACT}`), 12, 285.5);
  pdf.text(textePdf(PIED_EQUIPE), 12, 290);

  return { pdf, bas: y };
}

export function telechargerEtudeSolairePdf(fiche: FicheOpportunite): void {
  const site = composerEtudeSolaire(fiche);
  const { pdf } = mettreEnPageEtudeSolaire(fiche);
  pdf.save(`${site.reference}.pdf`);
}
