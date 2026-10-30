import html2canvas from "html2canvas";
import jsPDFModule from "jspdf";
import type { jsPDF as JsPdfDocument } from "jspdf";

type JsPdfCtor = new (options?: { orientation?: string; unit?: string; format?: string; compress?: boolean }) => JsPdfDocument;

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

export async function telechargerCatalogueCommercialPdf(element: HTMLElement) {
  const pages = element.querySelectorAll<HTMLElement>(".catalogue-page");
  if (pages.length === 0) throw new Error("Aucune page de catalogue à exporter.");
  const pdf = new JsPDF({ orientation: "p", unit: "mm", format: "a4", compress: true });
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
  }
  pdf.save("Catalogue-Commercial-ENERGIA-2026.pdf");
}
