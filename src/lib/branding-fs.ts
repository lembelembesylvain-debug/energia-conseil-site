import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { LOGO_FS_RELATIVE, LOGO_SCRIPTS_IA_FS } from "./branding";

/** Chemin unique du logo officiel — jamais un dossier client. */
export function resolveOfficialLogoPath(projectRoot: string): string {
  if (existsSync(LOGO_SCRIPTS_IA_FS)) return LOGO_SCRIPTS_IA_FS;
  return resolve(projectRoot, LOGO_FS_RELATIVE);
}
