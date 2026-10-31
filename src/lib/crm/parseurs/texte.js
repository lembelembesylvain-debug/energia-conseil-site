/**
 * Extraction de texte bornée : PDF textuel uniquement.
 * Un PDF scanné (sans opérateurs de texte) reste une pièce jointe.
 */

const SEUIL_TEXTE_PDF = 40;

function decodeLatin1(bytes) {
  let out = "";
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < data.length; i += 1) out += String.fromCharCode(data[i]);
  return out;
}

function unescapePdfString(raw) {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\")
    .replace(/\\(\d{1,3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
}

function reparerUtf8DepuisLatin1(texte) {
  try {
    const bytes = Uint8Array.from(texte, (c) => c.charCodeAt(0));
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return texte;
  }
}

export function extraireChainesPdf(raw) {
  const morceaux = [];
  const tj = /\((?:\\.|[^\\)])*\)\s*Tj/g;
  let match;
  while ((match = tj.exec(raw))) {
    const inner = match[0].replace(/\)\s*Tj$/, "").slice(1);
    morceaux.push(reparerUtf8DepuisLatin1(unescapePdfString(inner)));
  }
  const tjArray = /\[(?:\s*\((?:\\.|[^\\)])*\)\s*-?\d*\.?\d*)+\s*\]\s*TJ/g;
  while ((match = tjArray.exec(raw))) {
    const parts = [...match[0].matchAll(/\((?:\\.|[^\\)])*\)/g)].map((m) => unescapePdfString(m[0].slice(1, -1)));
    morceaux.push(parts.join(""));
  }
  return morceaux.join(" ").replace(/\s+/g, " ").trim();
}

export function extraireTextePdf(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  const raw = decodeLatin1(data);
  if (!raw.includes("%PDF")) {
    return { ok: false, texte: "", motif: "fichier_non_pdf", pieceJointeSeule: true, sourcePage: null };
  }
  const texte = extraireChainesPdf(raw);
  if (texte.length < SEUIL_TEXTE_PDF) {
    return {
      ok: false,
      texte: "",
      motif: "pdf_scanne_sans_texte",
      pieceJointeSeule: true,
      sourcePage: null,
    };
  }
  return { ok: true, texte, motif: null, pieceJointeSeule: false, sourcePage: 1 };
}

export function estImage(nomFichier = "", typeMime = "") {
  const nom = String(nomFichier).toLowerCase();
  const mime = String(typeMime).toLowerCase();
  return (
    mime.startsWith("image/") ||
    nom.endsWith(".jpg") ||
    nom.endsWith(".jpeg") ||
    nom.endsWith(".png") ||
    nom.endsWith(".webp")
  );
}

export function estPdf(nomFichier = "", typeMime = "") {
  return String(typeMime).toLowerCase().includes("pdf") || String(nomFichier).toLowerCase().endsWith(".pdf");
}

export function estCsv(nomFichier = "", typeMime = "") {
  const nom = String(nomFichier).toLowerCase();
  const mime = String(typeMime).toLowerCase();
  return nom.endsWith(".csv") || mime.includes("csv") || mime.includes("tab-separated");
}

export function estXlsx(nomFichier = "", typeMime = "") {
  const nom = String(nomFichier).toLowerCase();
  const mime = String(typeMime).toLowerCase();
  return nom.endsWith(".xlsx") || nom.endsWith(".xls") || mime.includes("spreadsheet") || mime.includes("excel");
}

export function estDocx(nomFichier = "", typeMime = "") {
  const nom = String(nomFichier).toLowerCase();
  return nom.endsWith(".docx") || String(typeMime).includes("wordprocessingml");
}

export function bytesSemblentTexte(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  if (data.length === 0) return false;
  const sample = data.subarray(0, Math.min(data.length, 800));
  let printables = 0;
  for (let i = 0; i < sample.length; i += 1) {
    const c = sample[i];
    if (c === 9 || c === 10 || c === 13 || (c >= 32 && c < 127) || c >= 160) printables += 1;
  }
  return printables / sample.length > 0.85;
}

export function decoderTexte(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(data);
  } catch {
    return decodeLatin1(data);
  }
}
