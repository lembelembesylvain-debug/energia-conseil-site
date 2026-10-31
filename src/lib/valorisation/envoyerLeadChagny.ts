const EMAIL_CATARINA = "contact@catarinamartins-immobilier.fr";

export type PayloadLeadChagny = {
  prenom: string;
  nom: string;
  email: string;
  telephone: string;
  adresse: string;
  jour: string;
  creneau: string;
  typeBien: string;
  surface: number;
  dpe: string;
  chauffage: string;
  commune: string;
  scenariosResume: string;
  consentement: boolean;
  souhaitAudit: boolean;
};

export function construireMailtoLead(payload: PayloadLeadChagny): string {
  const creneau = payload.creneau === "apres-midi" ? "Après-midi" : payload.creneau === "matin" ? "Matin" : payload.creneau;
  const audit = payload.souhaitAudit
    ? "Oui — Audit Énergétique IA 199 € TTC demandé"
    : "Non — diagnostic de valorisation uniquement";
  const corps = [
    "Nouveau lead — catarinamartins-immobilier.fr",
    "",
    `Nom : ${payload.nom}`,
    `Prénom : ${payload.prenom}`,
    `Téléphone : ${payload.telephone}`,
    `E-mail : ${payload.email}`,
    `Adresse du bien : ${payload.adresse}`,
    `Pré-qualification : ${payload.jour} — ${creneau}`,
    `Audit 199 € TTC : ${audit}`,
    "",
    `Bien : ${payload.typeBien} — ${payload.surface} m² — ${payload.commune}`,
    `DPE : ${payload.dpe}`,
    `Chauffage : ${payload.chauffage}`,
    "",
    payload.scenariosResume,
    "",
    "Rappel : aucune visite sur place avant documents utiles et 4 photographies du logement.",
  ].join("\n");
  return `mailto:${EMAIL_CATARINA}?subject=${encodeURIComponent(`Diagnostic valorisation — ${payload.prenom} ${payload.nom}`)}&body=${encodeURIComponent(corps)}`;
}

/**
 * o2switch / cPanel : POST vers estimer.php (mail natif).
 * Si PHP n'est pas exécuté (Vite local, page statique), on bascule sur mailto.
 */
export async function envoyerLeadChagny(payload: PayloadLeadChagny): Promise<{
  delivered: boolean;
  canal: "php" | "mailto";
  autoOpen: boolean;
  mailto: string;
}> {
  const mailto = construireMailtoLead(payload);
  try {
    const res = await fetch("/estimer.php", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const type = res.headers.get("content-type") || "";
    if (type.includes("application/json")) {
      const data = await res.json().catch(() => ({}));
      if (data?.ok && data?.delivered === true) {
        return { delivered: true, canal: "php", autoOpen: false, mailto };
      }
      if (res.ok || res.status === 202) {
        return { delivered: false, canal: "mailto", autoOpen: false, mailto };
      }
    }
  } catch {
    /* hébergement sans PHP ou hors ligne */
  }
  return { delivered: false, canal: "mailto", autoOpen: true, mailto };
}
