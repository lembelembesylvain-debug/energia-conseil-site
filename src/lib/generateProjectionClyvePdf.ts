import jsPDF from "jspdf";
import {
  BANDEAU_PROJECTION,
  FILIGRANE_PROJECTION,
  LEGENDE_PROJECTION,
  MENTION_PDF_PROJECTION,
  type PaireProjection,
  type StatutProjection,
  type VersionProjection,
} from "../data/projectionMaisonClyve";
import { DISCLAIMER, type AfterPhoto, type CategoriePhoto } from "../data/rapportCompletMaisonClyve";

const MARGIN = 14;
const PAGE_W = 210;
const PAGE_H = 297;
const NAVY: [number, number, number] = [15, 23, 42];

function t(value: string): string {
  return value
    .replace(/’/g, "'")
    .replace(/‘/g, "'")
    .replace(/“|”/g, '"')
    .replace(/–|—/g, "-")
    .replace(/€/g, " EUR");
}

function imageFormat(src: string): "PNG" | "JPEG" {
  return /\.jpe?g$/i.test(src) ? "JPEG" : "PNG";
}

async function loadImageDataUrl(src: string): Promise<string | null> {
  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function wrap(doc: jsPDF, text: string, y: number, size = 8): number {
  doc.setFontSize(size);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(t(text), PAGE_W - MARGIN * 2) as string[];
  for (const line of lines) {
    if (y > PAGE_H - 16) {
      doc.addPage();
      y = 22;
    }
    doc.text(line, MARGIN, y);
    y += 4.5;
  }
  return y;
}

function captionUnderImage(
  doc: jsPDF,
  x: number,
  y: number,
  width: number,
  title: string,
  badge: boolean,
  legend = LEGENDE_PROJECTION,
) {
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(t(title), x, y, { maxWidth: width });
  if (badge) {
    doc.setTextColor(146, 64, 14);
    doc.text(t(BANDEAU_PROJECTION), x, y + 4, { maxWidth: width });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6);
    doc.setTextColor(71, 85, 105);
    const legendLines = doc.splitTextToSize(t(legend), width) as string[];
    doc.text(legendLines, x, y + 8);
    doc.setTextColor(0, 0, 0);
    return y + 8 + legendLines.length * 3.2;
  }
  return y + 4;
}

function header(doc: jsPDF) {
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 14, "F");
  doc.setTextColor(253, 230, 138);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(t(DISCLAIMER), PAGE_W / 2, 6, { align: "center", maxWidth: PAGE_W - 12 });
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(t(BANDEAU_PROJECTION), PAGE_W / 2, 11, { align: "center" });
  doc.setTextColor(0, 0, 0);
}

export async function generateProjectionClyvePdf(input: {
  paires: PaireProjection[];
  statuts: Record<string, StatutProjection>;
  afterPhotos: Partial<Record<CategoriePhoto, AfterPhoto>>;
  versionId?: string;
}): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  for (let index = 0; index < input.paires.length; index += 1) {
    if (index > 0) doc.addPage();
    const paire = input.paires[index];
    header(doc);
    let y = 22;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(t(`Projection illustrative — ${paire.categorie}`), MARGIN, y);
    y += 7;
    y = wrap(doc, MENTION_PDF_PROJECTION, y, 8);
    y += 2;

    const avant = await loadImageDataUrl(paire.photoAvantSrc);
    const imgW = 88;
    const imgH = 52;
    const versions: VersionProjection[] = paire.versions?.length
      ? input.versionId
        ? paire.versions.filter((item) => item.id === input.versionId)
        : paire.versions
      : [];

    if (avant) {
      try {
        doc.addImage(avant, imageFormat(paire.photoAvantSrc), MARGIN, y, PAGE_W - MARGIN * 2, imgH);
      } catch {
        /* ignore */
      }
    }
    y = captionUnderImage(doc, MARGIN, y + imgH + 4, PAGE_W - MARGIN * 2, "AVANT — PHOTO REELLE", false);
    y += 6;

    if (versions.length > 0) {
      const colW = versions.length === 1 ? PAGE_W - MARGIN * 2 : imgW;
      for (let i = 0; i < versions.length; i += 1) {
        const version = versions[i];
        const x = versions.length === 1 ? MARGIN : MARGIN + i * 94;
        const proj = await loadImageDataUrl(version.src);
        if (proj) {
          try {
            doc.addImage(proj, "PNG", x, y, colW, imgH);
          } catch {
            /* ignore */
          }
        }
      }
      let captionY = y + imgH + 4;
      for (let i = 0; i < versions.length; i += 1) {
        const version = versions[i];
        const x = versions.length === 1 ? MARGIN : MARGIN + i * 94;
        const endY = captionUnderImage(
          doc,
          x,
          captionY,
          colW,
          `${version.titre} — ${version.statut}`,
          true,
          paire.legende ?? LEGENDE_PROJECTION,
        );
        captionY = Math.max(captionY, endY);
      }
      y = captionY + 6;
    } else {
      const proj = await loadImageDataUrl(paire.projectionSrc);
      if (proj) {
        try {
          doc.addImage(proj, "PNG", MARGIN, y, PAGE_W - MARGIN * 2, imgH);
        } catch {
          /* ignore */
        }
      }
      y = captionUnderImage(
        doc,
        MARGIN,
        y + imgH + 4,
        PAGE_W - MARGIN * 2,
        "APRES — PROJECTION ILLUSTRATIVE",
        true,
        paire.legende ?? LEGENDE_PROJECTION,
      );
      y += 6;
    }

    const cat = paire.categoriePhotoApres as CategoriePhoto | undefined;
    const reale = cat ? input.afterPhotos[cat] : undefined;
    if (reale?.dataUrl) {
      y = wrap(doc, "Photo apres travaux REELLE jointe — la projection n'est pas substituee.", y, 8);
      try {
        doc.addImage(reale.dataUrl, "PNG", MARGIN, y, imgW, imgH);
        y += imgH + 6;
      } catch {
        y += 4;
      }
    }

    const statutTexte = versions.length
      ? versions
          .map((version) => {
            const key = `${paire.id}:${version.id}`;
            return `${version.titre} : ${input.statuts[key] ?? version.statut}`;
          })
          .join(" | ")
      : `Statut : ${input.statuts[paire.id] ?? paire.statutInitial}`;

    y = wrap(doc, statutTexte, y, 9);
    y = wrap(doc, `Confiance : ${paire.confiance}`, y, 8);
    y = wrap(doc, `Source : ${paire.source}`, y, 8);
    y = wrap(doc, `Devis / recommandation : ${paire.devisOuReco}`, y, 8);
    y = wrap(doc, `Travaux representes : ${paire.travauxRepresentes.join(" ; ")}`, y, 8);
    y = wrap(doc, `Elements confirmes : ${paire.elementsConfirmes.join(" ; ")}`, y, 8);
    y = wrap(doc, `Elements estimatifs : ${paire.elementsEstimatifs.join(" ; ")}`, y, 8);
    y = wrap(doc, `Non simule : ${paire.travauxNonSimules.join(" ; ")}`, y, 8);
    y = wrap(doc, `A valider : ${paire.pointsAValider.join(" ; ")}`, y, 8);
    y = wrap(doc, MENTION_PDF_PROJECTION, y + 2, 8);
    wrap(doc, LEGENDE_PROJECTION, y, 7);
  }

  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(100);
    doc.text(t(FILIGRANE_PROJECTION), PAGE_W / 2, PAGE_H - 8, { align: "center" });
    doc.text(`Page ${i}/${total}`, PAGE_W - MARGIN, PAGE_H - 8, { align: "right" });
  }

  const name =
    input.paires.length === 1
      ? `projection-maison-clyve-${input.paires[0].id}${input.versionId ? `-${input.versionId}` : ""}.pdf`
      : "projections-illustratives-maison-clyve.pdf";
  doc.save(name);
}
