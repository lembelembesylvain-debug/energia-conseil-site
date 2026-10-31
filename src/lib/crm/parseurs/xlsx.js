/**
 * Lecture XLSX minimale (ZIP + sharedStrings + sheet1).
 * L’inflate DEFLATE est injecté (Node zlib ou DecompressionStream navigateur).
 */

function u16(buf, off) {
  return buf[off] | (buf[off + 1] << 8);
}

function u32(buf, off) {
  return (buf[off] | (buf[off + 1] << 8) | (buf[off + 2] << 16) | (buf[off + 3] << 24)) >>> 0;
}

export function extraireEntreesZip(bytes, inflateRaw) {
  const buf = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const fichiers = {};
  let offset = 0;
  while (offset + 30 < buf.length) {
    if (u32(buf, offset) !== 0x04034b50) break;
    const method = u16(buf, offset + 8);
    const compressedSize = u32(buf, offset + 18);
    const nameLen = u16(buf, offset + 26);
    const extraLen = u16(buf, offset + 28);
    const nameStart = offset + 30;
    const name = new TextDecoder("utf-8").decode(buf.subarray(nameStart, nameStart + nameLen));
    const dataStart = nameStart + nameLen + extraLen;
    const compressed = buf.subarray(dataStart, dataStart + compressedSize);
    let data = compressed;
    if (method === 8 && typeof inflateRaw === "function") {
      data = inflateRaw(compressed);
      if (!(data instanceof Uint8Array)) data = new Uint8Array(data);
    } else if (method !== 0 && method !== 8) {
      offset = dataStart + compressedSize;
      continue;
    }
    fichiers[name] = data;
    offset = dataStart + compressedSize;
  }
  return fichiers;
}

function xmlTexte(bytes) {
  return new TextDecoder("utf-8").decode(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
}

export function lireSharedStrings(xml) {
  const valeurs = [];
  const blocs = String(xml).matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g);
  for (const bloc of blocs) {
    const textes = [...bloc[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((m) => m[1]);
    valeurs.push(textes.join(""));
  }
  return valeurs;
}

function colLigneDepuisRef(ref) {
  const match = String(ref).match(/^([A-Z]+)(\d+)$/i);
  if (!match) return { col: 0, row: 1 };
  const letters = match[1].toUpperCase();
  let col = 0;
  for (let i = 0; i < letters.length; i += 1) col = col * 26 + (letters.charCodeAt(i) - 64);
  return { col: col - 1, row: Number(match[2]) };
}

export function lireFeuilleXlsx(xml, sharedStrings = []) {
  const rows = [];
  const cellules = String(xml).matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/g);
  for (const cellule of cellules) {
    const attrs = cellule[1];
    const inner = cellule[2];
    const ref = attrs.match(/\br="([^"]+)"/)?.[1];
    const type = attrs.match(/\bt="([^"]+)"/)?.[1] || "";
    const v = inner.match(/<v[^>]*>([\s\S]*?)<\/v>/)?.[1];
    if (!ref) continue;
    const { col, row } = colLigneDepuisRef(ref);
    while (rows.length < row) rows.push([]);
    let value = v ?? "";
    if (type === "s") value = sharedStrings[Number(v)] ?? "";
    rows[row - 1][col] = value;
  }
  return rows.filter((r) => r && r.length);
}

export function lignesXlsxVersCsv(rows) {
  return rows
    .map((row) => row.map((cell) => String(cell ?? "").replace(/;/g, ",")).join(";"))
    .join("\n");
}

export function extraireCsvDepuisXlsx(bytes, inflateRaw) {
  const fichiers = extraireEntreesZip(bytes, inflateRaw);
  const sharedName = Object.keys(fichiers).find((n) => n.endsWith("sharedStrings.xml"));
  const sheetName =
    Object.keys(fichiers).find((n) => /xl\/worksheets\/sheet1\.xml$/i.test(n)) ||
    Object.keys(fichiers).find((n) => /xl\/worksheets\/sheet\d+\.xml$/i.test(n));
  if (!sheetName) return { ok: false, csv: "", motif: "xlsx_sans_feuille" };
  const shared = sharedName ? lireSharedStrings(xmlTexte(fichiers[sharedName])) : [];
  const rows = lireFeuilleXlsx(xmlTexte(fichiers[sheetName]), shared);
  if (!rows.length) return { ok: false, csv: "", motif: "xlsx_vide" };
  return { ok: true, csv: lignesXlsxVersCsv(rows), motif: null };
}
