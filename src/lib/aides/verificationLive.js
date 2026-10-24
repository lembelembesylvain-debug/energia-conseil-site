/**
 * Vérification live des barèmes d’aides (MPR, CEE, Bonus).
 * Une date absente ou trop ancienne n’est jamais assimilée à une validation.
 */

export const SEUIL_VERIFICATION_WEB_JOURS = 30;

export const URL_ANAH_GOUV = "https://www.anah.gouv.fr";

export const ALERTE_VERIFICATION_ANAH = "Vérification recommandée sur anah.gouv.fr";

export const LIBELLE_BADGE_VERIFICATION_WEB = "Date de vérification web";

export const STATUT_AIDES_BROUILLON = "brouillon";

export const STATUT_AIDES_VALIDE = "valide";

export const LIGNES_AIDES_DEFAUT = [
  { id: "mpr", libelle: "MaPrimeRénov’", dateVerificationWeb: null, verifieeWeb: false },
  { id: "cee", libelle: "CEE", dateVerificationWeb: null, verifieeWeb: false },
  { id: "bonus", libelle: "Bonus", dateVerificationWeb: null, verifieeWeb: false },
];

export function dateDuJourISO(au = new Date()) {
  return au.toISOString().slice(0, 10);
}

export function formaterDateFr(iso, au = new Date()) {
  const source = iso && /^\d{4}-\d{2}-\d{2}$/.test(iso) ? iso : dateDuJourISO(au);
  const [annee, mois, jour] = source.split("-");
  return `${jour}/${mois}/${annee}`;
}

export function mentionLegaleAidesVerifiees(au = new Date()) {
  return `Aides calculées sur la base des barèmes vérifiés le ${formaterDateFr(dateDuJourISO(au), au)}. Les montants définitifs sont soumis à l'approbation des organismes (ANAH, Pollueurs) au moment du dépôt du dossier.`;
}

export function joursDepuisVerification(dateIso, au = new Date()) {
  if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return null;
  const parsed = new Date(`${dateIso}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  const debut = new Date(au);
  debut.setHours(0, 0, 0, 0);
  return Math.floor((debut.getTime() - parsed.getTime()) / (24 * 60 * 60 * 1000));
}

/** Date absente ou antérieure de plus de 30 jours → vérification web à refaire. */
export function verificationWebObsolete(dateIso, au = new Date()) {
  const jours = joursDepuisVerification(dateIso, au);
  if (jours == null) return true;
  return jours > SEUIL_VERIFICATION_WEB_JOURS;
}

export function creerVerificationAidesDossier(lignes = LIGNES_AIDES_DEFAUT) {
  return {
    source_verification_url: URL_ANAH_GOUV,
    aides_verifiees_web: false,
    aides_date_verification_web: null,
    aides_verifiees_web_par: null,
    aides_verifiees_web_at: null,
    statut: STATUT_AIDES_BROUILLON,
    lignes: lignes.map((ligne) => ({
      ...ligne,
      dateVerificationWeb: ligne.dateVerificationWeb ?? null,
      verifieeWeb: false,
    })),
  };
}

export function lignesAidesVerifieesWeb(lignes, au = new Date()) {
  const source = Array.isArray(lignes) && lignes.length > 0 ? lignes : LIGNES_AIDES_DEFAUT;
  return source.every(
    (ligne) => ligne.verifieeWeb === true && !verificationWebObsolete(ligne.dateVerificationWeb, au),
  );
}

export function peutPasserBrouillonVersValide({ statutActuel, statutCible, aidesVerifieesWeb }) {
  const actuel = String(statutActuel ?? "").trim().toLowerCase();
  const cible = String(statutCible ?? "").trim().toLowerCase();
  const versValide = cible === STATUT_AIDES_VALIDE || cible === "validé" || cible === "validee";
  if (!versValide) return { ok: true, raisons: [] };
  if (actuel === STATUT_AIDES_VALIDE) return { ok: true, raisons: [] };
  if (aidesVerifieesWeb) return { ok: true, raisons: [] };
  return {
    ok: false,
    raisons: [
      "Passage Brouillon → Validé bloqué : les aides n’ont pas été marquées « Vérifiées Web » par l’administrateur.",
    ],
  };
}

export function marquerAidesVerifieesWeb(actuel, { auteur, url = URL_ANAH_GOUV, au = new Date() }) {
  const base = actuel ?? creerVerificationAidesDossier();
  const date = dateDuJourISO(au);
  return {
    ...base,
    source_verification_url: url || URL_ANAH_GOUV,
    aides_verifiees_web: true,
    aides_date_verification_web: date,
    aides_verifiees_web_par: auteur,
    aides_verifiees_web_at: au.toISOString(),
    statut: STATUT_AIDES_BROUILLON,
    lignes: (base.lignes.length ? base.lignes : LIGNES_AIDES_DEFAUT).map((ligne) => ({
      ...ligne,
      dateVerificationWeb: date,
      verifieeWeb: true,
    })),
  };
}

export function appliquerDateLigne(actuel, ligneId, dateVerificationWeb) {
  const lignes = actuel.lignes.map((ligne) =>
    ligne.id === ligneId
      ? {
          ...ligne,
          dateVerificationWeb,
          verifieeWeb: Boolean(dateVerificationWeb) && !verificationWebObsolete(dateVerificationWeb),
        }
      : ligne,
  );
  return {
    ...actuel,
    aides_verifiees_web: false,
    statut: STATUT_AIDES_BROUILLON,
    lignes,
  };
}

export function mettreAJourSourceVerification(actuel, url) {
  return {
    ...(actuel ?? creerVerificationAidesDossier()),
    source_verification_url: url || URL_ANAH_GOUV,
  };
}

export function passerAidesValidees(actuel) {
  const verification = actuel ?? creerVerificationAidesDossier();
  const garde = peutPasserBrouillonVersValide({
    statutActuel: verification.statut,
    statutCible: STATUT_AIDES_VALIDE,
    aidesVerifieesWeb: verification.aides_verifiees_web === true && lignesAidesVerifieesWeb(verification.lignes),
  });
  if (!garde.ok) return { ok: false, verification, raisons: garde.raisons };
  return {
    ok: true,
    raisons: [],
    verification: { ...verification, statut: STATUT_AIDES_VALIDE },
  };
}
