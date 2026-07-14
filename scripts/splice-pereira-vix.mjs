import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const auditPath = path.join(root, 'audit-energetique-pereira-nervieux-2026.html');
const fragmentPath = path.join(root, 'scripts', 'pereira-vix-fragment.html');

const text = fs.readFileSync(auditPath, 'utf8');
const marker = '<!-- PAGE 36';
const idx = text.indexOf(marker);
if (idx === -1) throw new Error('PAGE 36 marker not found');

const fragment = fs.readFileSync(fragmentPath, 'utf8');
fs.writeFileSync(auditPath, text.slice(0, idx) + fragment + '\n</body>\n</html>\n', 'utf8');
console.log('Spliced', fragment.split('<!-- PAGE').length - 1, 'pages into audit');
