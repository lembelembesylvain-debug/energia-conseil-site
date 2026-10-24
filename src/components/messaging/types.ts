export type ModeleEmailId =
  | "etude-pac"
  | "calpinage-solaire"
  | "relance-j4"
  | "pieces-complementaires"
  | "visite-technique";

export type CanalEnvoi = "resend" | "proxy" | "simulation";

export type StatutEmail = "envoye" | "simule" | "echec";

export type ContexteEmail = {
  clientNom?: string;
  civilite?: string;
  ville?: string;
  projet?: string;
  lien?: string;
  puissanceKw?: number;
  puissanceThermiqueKw?: number;
  ceeEur?: number;
  kwc?: number;
  economiesAnnuelles?: number;
  resteACharge?: number;
  totalTtc?: number;
  gainAnnuel?: number;
  retourAns?: number | null;
  cumul25?: number;
};

export type DossierMessagerie = {
  id: string;
  libelle: string;
  nom: string;
  civilite: string;
  email: string;
  telephone: string;
  ville: string;
  projet: string;
  lienDocument: string;
};

export type EmailEnregistre = {
  id: string;
  dossierId: string;
  destinataire: string;
  sujet: string;
  corps: string;
  modeleId: ModeleEmailId | null;
  envoyeLe: string;
  statut: StatutEmail;
  canal: CanalEnvoi;
  resendId?: string;
  detail?: string;
};

export type PieceJointe = {
  id: string;
  nom: string;
  url?: string;
  contenuBase64?: string;
  taille: number;
};

export type PrefillMessagerie = {
  jeton: string;
  dossierId?: string | null;
  clientNom?: string;
  destinataire?: string;
  modeleId?: ModeleEmailId;
  contexte?: ContexteEmail;
  pieces?: { nom: string; url: string }[];
};

export type ResultatEnvoi = {
  ok: boolean;
  canal: CanalEnvoi;
  resendId?: string;
  message: string;
  detail?: string;
};
