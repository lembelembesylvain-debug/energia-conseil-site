import type { ContexteEmail, ModeleEmailId, PrefillMessagerie } from "./types";

export const HASH_MESSAGERIE = "messagerie-crm";
export const EVENEMENT_PREFILL = "energia-messagerie-prefill";
const CLE_PREFILL = "energia-messagerie-prefill-v1";

let memoire: PrefillMessagerie | null = null;

export function ouvrirMessagerie(saisie: {
  dossierId?: string | null;
  clientNom?: string;
  destinataire?: string;
  modeleId?: ModeleEmailId;
  contexte?: ContexteEmail;
  pieces?: { nom: string; url: string }[];
}): void {
  const prefill: PrefillMessagerie = {
    jeton: crypto.randomUUID(),
    dossierId: saisie.dossierId,
    clientNom: saisie.clientNom,
    destinataire: saisie.destinataire,
    modeleId: saisie.modeleId,
    contexte: saisie.contexte,
    pieces: saisie.pieces,
  };
  memoire = prefill;
  try {
    sessionStorage.setItem(CLE_PREFILL, JSON.stringify(prefill));
  } catch {
    /* Session indisponible : la mémoire du module suffit pour l'onglet courant. */
  }
  const hashActuel = window.location.hash.replace(/^#/, "").split("?")[0];
  if (hashActuel !== HASH_MESSAGERIE) {
    window.location.hash = HASH_MESSAGERIE;
  }
  window.dispatchEvent(new Event(EVENEMENT_PREFILL));
}

export function lirePrefillCourant(): PrefillMessagerie | null {
  try {
    const brut = sessionStorage.getItem(CLE_PREFILL);
    if (brut) {
      const lu = JSON.parse(brut) as PrefillMessagerie;
      if (lu && typeof lu.jeton === "string") {
        memoire = lu;
        return lu;
      }
    }
  } catch {
    /* JSON illisible : on retombe sur la mémoire. */
  }
  return memoire;
}
