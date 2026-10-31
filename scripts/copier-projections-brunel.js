/**
 * Copie les 2 rendus 3D Brunel V5 depuis le cache Cursor vers public/projects/brunel/.
 * Exécution : node scripts/copier-projections-brunel.js
 */
import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const racine = join(dirname(fileURLToPath(import.meta.url)), "..");
const destDir = join(racine, "public/projects/brunel");
const assets = join(
  process.env.USERPROFILE || process.env.HOME || "",
  ".cursor/projects/c-Users-lembe-energia-conseil-site-energia-conseil-site/assets",
);

const copies = [
  {
    from: join(
      assets,
      "c__Users_lembe_AppData_Roaming_Cursor_User_workspaceStorage_24e9f1ccf22962843bad487ea6426a54_images_0-1e19ac44-b0db-424c-85f1-d36d6b536708.jpg",
    ),
    to: join(destDir, "facade-sud-panneaux-solaires-gris-anthracite.jpg"),
  },
  {
    from: join(
      assets,
      "c__Users_lembe_AppData_Roaming_Cursor_User_workspaceStorage_24e9f1ccf22962843bad487ea6426a54_images_0-24b91729-1dcd-4557-b6a2-d62805e8febf.jpg",
    ),
    to: join(destDir, "unite-exterieure-daikin-sur-mur-de-pierre-anthracite.jpg"),
  },
];

mkdirSync(destDir, { recursive: true });
for (const item of copies) {
  if (!existsSync(item.from)) {
    console.warn("Source absente :", item.from);
    continue;
  }
  copyFileSync(item.from, item.to);
  console.log("OK", item.to);
}
