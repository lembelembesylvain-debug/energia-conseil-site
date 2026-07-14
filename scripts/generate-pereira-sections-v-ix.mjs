import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUDIT = path.join(__dirname, '..', 'audit-energetique-pereira-nervieux-2026.html');

// Execute the Python script logic by spawning - can't, use inline port
// Read python file and eval? Too hacky. Port minimal: read py output by running through regex

const pyPath = path.join(__dirname, 'generate-pereira-sections-v-ix.py');
const pyCode = fs.readFileSync(pyPath, 'utf8');

// Extract P array content - actually just run splice using node reimplementation
const FOOTER = (n) => `ENERGIA-CONSEIL IA® — Décennale MIC Insurance N° LUNPIB2604975 — Page ${n}/60`;
const REF = (n) => `Réf. AUDIT-2026-PEREIRA | Page ${n}/60`;
const AIDS = `  <div class="box box-info" style="font-size:10px;margin:8px 0;">
    <strong>Aides financières 2026 (estimation à titre indicatif).</strong> Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
  </div>`;

const hdr = (page, sub) => `  <header>
    <div>
      <div class="logo-text">ENERGIA-CONSEIL IA®</div>
      <div style="font-size: 9px; font-weight: 600; color: var(--text-muted);">${sub}</div>
    </div>
    <div class="company-info">${REF(page)}</div>
  </header>`;

const pg = (page, sub, body, compact = true) => {
  const c = compact ? 'page page-compact' : 'page';
  return `<!-- PAGE ${page} -->
<div class="${c}">
${hdr(page, sub)}
${body}
  <footer>${FOOTER(page)}</footer>
</div>
`;
};

// Load pages from generated fragment - write by importing python output file
const fragmentPath = path.join(__dirname, 'pereira-vix-fragment.html');
if (!fs.existsSync(fragmentPath)) {
  console.error('Run: copy python P output to pereira-vix-fragment.html first');
  process.exit(1);
}

const text = fs.readFileSync(AUDIT, 'utf8');
const idx = text.indexOf('<!-- PAGE 36');
if (idx === -1) throw new Error('PAGE 36 marker not found');
const fragment = fs.readFileSync(fragmentPath, 'utf8');
const newTail = fragment + '\n</body>\n</html>\n';
fs.writeFileSync(AUDIT, text.slice(0, idx) + newTail, 'utf8');
console.log('Spliced fragment into audit');
