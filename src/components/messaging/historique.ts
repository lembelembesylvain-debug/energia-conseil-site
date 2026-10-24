import { getSupabaseClient } from "../../lib/supabase.js";
import { DOSSIERS_MESSAGERIE } from "./annuaire";
import { PHRASE_DOCUMENT, retirerLiensBruts } from "./modeles";
import { SIGNATURE_OFFICIELLE } from "./signature";
import type { EmailEnregistre, ModeleEmailId } from "./types";

const CLE_HISTORIQUE = "energia-messagerie-historique-v1";
export const EVENEMENT_HISTORIQUE = "energia-messagerie-maj";
const SEUIL_RELANCE_MS = 4 * 24 * 60 * 60 * 1000;
const PLAFOND = 400;

function ilYA(jours: number): string {
  return new Date(Date.now() - jours * 24 * 60 * 60 * 1000).toISOString();
}

function messageSeed(
  id: string,
  dossierId: string,
  destinataire: string,
  sujet: string,
  corps: string,
  modeleId: ModeleEmailId,
  jours: number,
): EmailEnregistre {
  return {
    id,
    dossierId,
    destinataire,
    sujet,
    corps,
    modeleId,
    envoyeLe: ilYA(jours),
    statut: "envoye",
    canal: "simulation",
    detail: "Historique d'ouverture du module",
  };
}

function historiqueInitial(): EmailEnregistre[] {
  const masson = DOSSIERS_MESSAGERIE.find((dossier) => dossier.nom === "MASSON");
  const brunel = DOSSIERS_MESSAGERIE.find((dossier) => dossier.nom === "BRUNEL");
  const gesnouin = DOSSIERS_MESSAGERIE.find((dossier) => dossier.nom === "GESNOUIN");
  const couty = DOSSIERS_MESSAGERIE.find((dossier) => dossier.nom === "COUTY");
  const messages: EmailEnregistre[] = [];
  if (masson) {
    messages.push(
      messageSeed(
        "seed-masson-devis",
        masson.id,
        masson.email,
        "Devis chaudière et désembouage — Mme Kristell MASSON",
        `Bonjour Mme Kristell MASSON,\n\nVeuillez trouver le devis de remplacement de chaudière gaz et de désembouage pour Toulon.\n${PHRASE_DOCUMENT}\n\n${SIGNATURE_OFFICIELLE}`,
        "etude-pac",
        5,
      ),
    );
  }
  if (brunel) {
    messages.push(
      messageSeed(
        "seed-brunel-devis",
        brunel.id,
        brunel.email,
        "Devis rénovation — M. Emrick BRUNEL",
        `Bonjour M. Emrick BRUNEL,\n\nLe devis de rénovation de l'indivision COUBLE est disponible.\n${PHRASE_DOCUMENT}\n\n${SIGNATURE_OFFICIELLE}`,
        "etude-pac",
        6,
      ),
    );
  }
  if (gesnouin) {
    messages.push(
      messageSeed(
        "seed-gesnouin-devis",
        gesnouin.id,
        gesnouin.email,
        "Devis batterie AC — M. Joël GESNOUIN",
        `Bonjour M. Joël GESNOUIN,\n\nLe devis de stockage batterie est en attente de votre retour.\n${PHRASE_DOCUMENT}\n\n${SIGNATURE_OFFICIELLE}`,
        "calpinage-solaire",
        8,
      ),
    );
  }
  if (couty) {
    messages.push(
      messageSeed(
        "seed-couty-visite",
        couty.id,
        couty.email,
        "Confirmation de visite — Mme Marie-France COUTY",
        `Bonjour Mme Marie-France COUTY,\n\nLa visite technique pour la main courante à Mably est confirmée.\n\n${SIGNATURE_OFFICIELLE}`,
        "visite-technique",
        1,
      ),
    );
  }
  return messages;
}

function normaliser(valeur: unknown): EmailEnregistre[] {
  if (!Array.isArray(valeur)) return [];
  return valeur.filter((item): item is EmailEnregistre => {
    if (!item || typeof item !== "object") return false;
    const email = item as Partial<EmailEnregistre>;
    return typeof email.id === "string" && typeof email.dossierId === "string" && typeof email.envoyeLe === "string";
  });
}

export function lireHistorique(): EmailEnregistre[] {
  if (typeof localStorage === "undefined") return historiqueInitial();
  try {
    const brut = localStorage.getItem(CLE_HISTORIQUE);
    if (!brut) {
      const initial = historiqueInitial();
      localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(initial));
      return initial;
    }
    const lu = normaliser(JSON.parse(brut)).map((message) => ({ ...message, corps: retirerLiensBruts(message.corps) }));
    if (lu.length === 0) return historiqueInitial();
    const brutNettoye = JSON.stringify(lu);
    if (brutNettoye !== JSON.stringify(normaliser(JSON.parse(brut)))) {
      localStorage.setItem(CLE_HISTORIQUE, brutNettoye);
    }
    return lu;
  } catch {
    return historiqueInitial();
  }
}

export function compterRelancesDues(messages = lireHistorique(), maintenant = Date.now()): number {
  const derniers = new Map<string, EmailEnregistre>();
  for (const message of messages) {
    const courant = derniers.get(message.dossierId);
    if (!courant || message.envoyeLe > courant.envoyeLe) derniers.set(message.dossierId, message);
  }
  let total = 0;
  for (const dernier of derniers.values()) {
    if (dernier.modeleId === "relance-j4" || dernier.statut === "echec") continue;
    const age = maintenant - new Date(dernier.envoyeLe).getTime();
    if (Number.isFinite(age) && age >= SEUIL_RELANCE_MS) total += 1;
  }
  return total;
}

type ClientInsert = {
  from: (table: string) => {
    insert: (ligne: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>;
  };
};

async function pousserSupabase(message: EmailEnregistre): Promise<void> {
  const client = getSupabaseClient() as ClientInsert | null;
  if (!client) return;
  try {
    const { error } = await client.from("crm_emails").insert({
      id: message.id,
      dossier_id: message.dossierId,
      destinataire: message.destinataire,
      sujet: message.sujet,
      corps: message.corps,
      modele_id: message.modeleId,
      envoye_le: message.envoyeLe,
      statut: message.statut,
      canal: message.canal,
      resend_id: message.resendId ?? null,
    });
    if (error) return;
  } catch {
    /* Table absente ou RLS : l'historique navigateur reste la référence. */
  }
}

export async function archiverEmail(message: EmailEnregistre): Promise<EmailEnregistre[]> {
  const suivant = [message, ...lireHistorique().filter((item) => item.id !== message.id)].slice(0, PLAFOND);
  try {
    localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(suivant));
  } catch {
    /* Quota plein : l'email reste affiché dans la session. */
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(EVENEMENT_HISTORIQUE));
  }
  await pousserSupabase(message);
  return suivant;
}

export function historiqueDuDossier(dossierId: string, messages = lireHistorique()): EmailEnregistre[] {
  return messages
    .filter((message) => message.dossierId === dossierId)
    .sort((a, b) => b.envoyeLe.localeCompare(a.envoyeLe));
}
