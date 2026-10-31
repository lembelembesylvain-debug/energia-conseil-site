import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { genererHtmlDevisBrunelFinal } from "../src/lib/crm/devisBrunelFinalHtml.js";

function mime(path) {
  const ext = path.toLowerCase().split(".").pop();
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "svg") return "image/svg+xml";
  return "image/jpeg";
}

let html = genererHtmlDevisBrunelFinal();
const srcs = [...html.matchAll(/src="(\/[^"]+\.(?:jpg|jpeg|png|webp))"/g)].map((match) => match[1]);
for (const src of [...new Set(srcs)]) {
  const file = join("public", src.replace(/^\//, ""));
  if (!existsSync(file)) {
    console.error("image absente", file);
    continue;
  }
  const b64 = readFileSync(file).toString("base64");
  html = html.split(`src="${src}"`).join(`src="data:${mime(file)};base64,${b64}"`);
}

if (!html.includes("33 478,53") || !html.includes("1 458,80") || !html.includes("data:image/jpeg;base64,")) {
  throw new Error("HTML incomplet");
}

const cibles = [
  "DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html",
  "public/DEVIS_BRUNEL_Indivision_COUBLE_2026_FINAL.html",
  "public/DEVIS_BRUNEL_Indivision_COUBLE_2026_PERFORMANCE.html",
];
for (const cible of cibles) writeFileSync(cible, html);
console.log(`HTML marché Brunel écrit (${html.length} caractères) : ${cibles.join(", ")}`);
