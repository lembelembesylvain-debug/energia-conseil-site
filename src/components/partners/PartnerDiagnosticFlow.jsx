import { useMemo, useState } from "react";
import energiaLogo from "../../../templates/marketing/assets/energia-logo-arbres.png";
import {
  CLASSES_DPE,
  OBJECTIFS_PROJET,
  TYPES_CHAUFFAGE,
  TYPES_LOGEMENT,
  enregistrerLeadDiagnostic,
  transmettreLeadServeur,
  validerLeadDiagnostic,
} from "../../lib/crm/leadsDiagnostic";
import { notifierLeadPartenaire } from "../../lib/crm/notificationsPartner";
import {
  aUnePhoto,
  aUnLogoReseau,
  champOuPlaceholder,
  displayNameOf,
  getPartnerAttribution,
  partnerQrPublicPath,
} from "../../config/partners";

const EMPTY = {
  prenom: "",
  nom: "",
  email: "",
  telephone: "",
  code_postal: "",
  annee_construction: "",
  surface_habitable: "",
  type_logement: "",
  type_chauffage: "",
  dpe: "",
  objectif_projet: "",
  consentement_contact: false,
  consentement_email: false,
};

export default function PartnerDiagnosticFlow({ partner }) {
  const [etape, setEtape] = useState("intro");
  const [form, setForm] = useState(EMPTY);
  const [erreurs, setErreurs] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [lead, setLead] = useState(null);
  const [conversion, setConversion] = useState("");
  const [politique, setPolitique] = useState(false);

  const nom = displayNameOf(partner);
  const reseau = champOuPlaceholder(partner.network);
  const titre = champOuPlaceholder(partner.title);
  const telephone = champOuPlaceholder(partner.phone);
  const email = champOuPlaceholder(partner.email);
  const secteur = champOuPlaceholder(partner.sector);
  const legal = champOuPlaceholder(partner.legalMention);
  const photo = aUnePhoto(partner) ? partner.photo : "";
  const logoReseau = aUnLogoReseau(partner) ? partner.logoPartner : "";
  const attribution = getPartnerAttribution(partner.id);
  const extrasLead = {
    partenaire_id: attribution.partenaire_id,
    source: attribution.sourceLabel,
    assignee: attribution.assignee,
  };

  const setChamp = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const enregistrerAvecAttribution = (valeurs, extra = {}) =>
    enregistrerLeadDiagnostic(valeurs, { ...extrasLead, ...extra });

  const soumettre = async (event) => {
    event.preventDefault();
    const { ok, erreurs: nextErreurs, valeurs } = validerLeadDiagnostic({
      ...form,
      annee_construction: form.annee_construction === "" ? NaN : Number(form.annee_construction),
      surface_habitable: form.surface_habitable === "" ? NaN : Number(form.surface_habitable),
    });
    setErreurs(nextErreurs);
    if (!ok) return;

    setEnvoi(true);
    const record = enregistrerAvecAttribution(valeurs);
    notifierLeadPartenaire(record, partner);
    await transmettreLeadServeur(record);
    setLead(record);
    setEtape("resultat");
    setEnvoi(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const demanderContact = () => {
    if (!lead) return;
    const updated = enregistrerAvecAttribution(lead, { statut_lead: "contact à effectuer" });
    setLead(updated);
    setConversion("contact");
  };

  const proposerAudit = () => {
    if (!lead) return;
    const updated = enregistrerAvecAttribution(lead, { statut_lead: "audit proposé" });
    setLead(updated);
    setConversion("audit");
  };

  const niveauLabel = useMemo(() => {
    if (!lead) return "";
    if (lead.niveau_potentiel === "élevé") return "Potentiel de rénovation élevé";
    if (lead.niveau_potentiel === "moyen") return "Potentiel de rénovation moyen";
    return "Potentiel à approfondir";
  }, [lead]);

  const initials = `${(partner.firstName || nom).slice(0, 1)}${(partner.lastName || "").slice(0, 1)}`.toUpperCase();
  const brand = partner.brandColor || "#0b1f3a";

  return (
    <div className="dq" style={{ "--partner": brand }}>
      <style>{CSS}</style>
      <header className="dq-top">
        {logoReseau ? (
          <img className="dq-network" src={logoReseau} alt={reseau} />
        ) : (
          <p className="dq-network-text">{reseau}</p>
        )}
        <aside className="dq-badge">
          <img src={energiaLogo} alt="" />
          <span>Partenaire technique<br />Energia Conseil IA®</span>
        </aside>
      </header>

      {etape === "intro" ? (
        <section className="dq-card">
          <div className="dq-hero">
            {photo ? (
              <img src={photo} alt={`${nom}, ${titre}`} />
            ) : (
              <div className="dq-avatar" aria-hidden>{initials || "P"}</div>
            )}
            <div>
              <p className="dq-kicker">{nom} — {reseau}</p>
              <h1>Découvrez le potentiel de votre bien en 30 secondes</h1>
            </div>
          </div>
          <p className="dq-lead">
            Avant de vendre, acheter ou rénover, obtenez une première orientation personnalisée.
          </p>
          <p className="dq-note">
            Cette première analyse est indicative et ne remplace pas un audit énergétique complet.
          </p>
          <button className="dq-btn" type="button" onClick={() => setEtape("formulaire")}>
            Commencer le diagnostic
          </button>
          <p className="dq-legal">{legal}</p>
        </section>
      ) : null}

      {etape === "formulaire" ? (
        <form className="dq-card" onSubmit={soumettre} method="post" autoComplete="on" noValidate>
          <p className="dq-kicker">Étape 2 / 4</p>
          <h2>Quelques informations sur votre projet</h2>
          <p className="dq-lead">Uniquement ce qui est nécessaire pour une première orientation.</p>

          <div className="dq-grid">
            <Champ label="Prénom" error={erreurs.prenom}>
              <input value={form.prenom} onChange={(e) => setChamp("prenom", e.target.value)} autoComplete="given-name" required />
            </Champ>
            <Champ label="Nom" error={erreurs.nom}>
              <input value={form.nom} onChange={(e) => setChamp("nom", e.target.value)} autoComplete="family-name" required />
            </Champ>
          </div>
          <Champ label="Email" error={erreurs.email}>
            <input type="email" value={form.email} onChange={(e) => setChamp("email", e.target.value)} autoComplete="email" required />
          </Champ>
          <Champ label="Téléphone" error={erreurs.telephone}>
            <input type="tel" value={form.telephone} onChange={(e) => setChamp("telephone", e.target.value)} autoComplete="tel" required />
          </Champ>
          <div className="dq-grid">
            <Champ label="Code postal" error={erreurs.code_postal}>
              <input inputMode="numeric" maxLength={5} value={form.code_postal} onChange={(e) => setChamp("code_postal", e.target.value)} required />
            </Champ>
            <Champ label="Année de construction" error={erreurs.annee_construction}>
              <input inputMode="numeric" maxLength={4} value={form.annee_construction} onChange={(e) => setChamp("annee_construction", e.target.value)} required />
            </Champ>
          </div>
          <Champ label="Surface habitable (m²)" error={erreurs.surface_habitable}>
            <input inputMode="numeric" value={form.surface_habitable} onChange={(e) => setChamp("surface_habitable", e.target.value)} required />
          </Champ>
          <Champ label="Type de logement" error={erreurs.type_logement}>
            <select value={form.type_logement} onChange={(e) => setChamp("type_logement", e.target.value)} required>
              <option value="">Choisir</option>
              {TYPES_LOGEMENT.map((v) => (
                <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </Champ>
          <Champ label="Type de chauffage" error={erreurs.type_chauffage}>
            <select value={form.type_chauffage} onChange={(e) => setChamp("type_chauffage", e.target.value)} required>
              <option value="">Choisir</option>
              {TYPES_CHAUFFAGE.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </Champ>
          <Champ label="DPE connu" error={erreurs.dpe}>
            <select value={form.dpe} onChange={(e) => setChamp("dpe", e.target.value)} required>
              <option value="">Choisir</option>
              {CLASSES_DPE.map((v) => (
                <option key={v} value={v}>{v === "inconnu" ? "Inconnu" : v}</option>
              ))}
            </select>
          </Champ>
          <Champ label="Objectif" error={erreurs.objectif_projet}>
            <select value={form.objectif_projet} onChange={(e) => setChamp("objectif_projet", e.target.value)} required>
              <option value="">Choisir</option>
              {OBJECTIFS_PROJET.map((v) => (
                <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>
              ))}
            </select>
          </Champ>

          <label className="dq-check">
            <input
              type="checkbox"
              checked={form.consentement_contact}
              onChange={(e) => setChamp("consentement_contact", e.target.checked)}
              required
            />
            <span>J’accepte d’être recontacté au sujet de mon projet. <em>(obligatoire)</em></span>
          </label>
          {erreurs.consentement_contact ? <p className="dq-error">{erreurs.consentement_contact}</p> : null}

          <label className="dq-check">
            <input
              type="checkbox"
              checked={form.consentement_email}
              onChange={(e) => setChamp("consentement_email", e.target.checked)}
            />
            <span>Je souhaite recevoir le mini-bilan par email. <em>(facultatif — aucun email commercial sans cette case)</em></span>
          </label>

          <p className="dq-note">
            Vos données sont transmises à {nom} ({reseau}) et à Energia Conseil IA®, partenaire technique.
            Elles ne sont pas affichées dans l’URL.{" "}
            <button type="button" className="dq-link" onClick={() => setPolitique((v) => !v)}>
              Politique de confidentialité
            </button>
          </p>
          {politique ? (
            <PolitiqueConfidentialite
              nom={nom}
              reseau={reseau}
              email={email}
              legal={legal}
            />
          ) : null}

          <button className="dq-btn" type="submit" disabled={envoi}>
            {envoi ? "Transmission…" : "Voir mon orientation"}
          </button>
        </form>
      ) : null}

      {etape === "resultat" && lead ? (
        <section className="dq-card">
          <p className="dq-kicker">Orientation indicative</p>
          <h2>{niveauLabel}</h2>
          <p className="dq-lead">{lead.message_confort}</p>

          <h3>Points d’attention</h3>
          <ul>
            {lead.points_attention.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h3>Travaux susceptibles d’être étudiés</h3>
          <ul>
            {lead.travaux_possibles.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="dq-note">{lead.disclaimer}</p>

          <h3>Et maintenant ?</h3>
          <button className="dq-btn" type="button" onClick={demanderContact}>
            Être recontacté par {partner.firstName || nom}
          </button>
          <button className="dq-btn dq-btn-alt" type="button" onClick={proposerAudit}>
            Découvrir l’Audit Énergétique IA — 199 € TTC
          </button>
          <p className="dq-note">
            L’audit détaillé nécessite les documents utiles et un minimum de 4 photographies exploitables du logement.
          </p>

          {conversion === "contact" ? (
            <p className="dq-ok">
              Merci. {nom} ({reseau}) vous recontactera au sujet de votre projet.
              Statut du lead : contact à effectuer.
            </p>
          ) : null}
          {conversion === "audit" ? (
            <div className="dq-offer">
              <strong>Audit Énergétique IA — 199 € TTC</strong>
              <p>
                Rapport personnalisé pouvant inclure l’analyse énergétique, l’estimation des aides, des scénarios de
                rénovation et un bilan de valorisation. Montants d’aides, économies et valeur du bien restent indicatifs.
              </p>
              <p>{nom} vous oriente. Energia Conseil IA® intervient comme partenaire technique.</p>
            </div>
          ) : null}
          <p className="dq-legal">{legal}</p>
        </section>
      ) : null}

      <footer className="dq-foot">
        <p>{nom} — {reseau} · {telephone} · {email}</p>
        {secteur !== "[À COMPLÉTER]" ? <p>{secteur}</p> : null}
        <p>Avec l’expertise technique d’Energia Conseil IA®</p>
        <img className="dq-qr" src={partnerQrPublicPath(partner.id)} alt={`QR code vers la page ${nom}`} />
      </footer>
    </div>
  );
}

function Champ({ label, error, children }) {
  return (
    <label className="dq-field">
      <span>{label}</span>
      {children}
      {error ? <em className="dq-error">{error}</em> : null}
    </label>
  );
}

function PolitiqueConfidentialite({ nom, reseau, email, legal }) {
  return (
    <div className="dq-privacy">
      <h3>Politique de confidentialité</h3>
      <p>
        Responsables de traitement : {nom} ({reseau}
        {legal !== "[À COMPLÉTER]" ? `, ${legal}` : ""}),
        et ENERGIA CONSEIL IA® (SIRET 94181942700019) en tant que partenaire technique.
      </p>
      <p>
        Données collectées : identité, contact, caractéristiques déclarées du logement et objectif du projet.
        Finalités : pré-qualification, recontact commercial par {nom}, éventuellement envoi du mini-bilan si vous
        l’avez demandé. Durée de conservation : 3 ans après le dernier contact, sauf obligation légale plus longue.
      </p>
      <p>
        Base légale : consentement (recontact obligatoire pour transmettre le dossier ; email facultatif).
        Aucun email commercial n’est envoyé sans la case facultative cochée.
      </p>
      <p>
        Droits d’accès, rectification, effacement, limitation, opposition : {email}
        ou contact@energia-conseil-ia.com. Réclamation possible auprès de la CNIL.
      </p>
    </div>
  );
}

const CSS = `
  @import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap");
  .dq {
    --navy: #0b1f3a;
    --gold: #9a7b45;
    --energia: #0f766e;
    --line: #e6edf4;
    --muted: #5b6b7c;
    min-height: 100dvh;
    margin: 0 auto;
    max-width: 520px;
    padding: 16px 16px 40px;
    font-family: "Plus Jakarta Sans", Arial, Helvetica, sans-serif;
    color: var(--navy);
    background: #f4f7fb;
  }
  .dq-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 16px;
  }
  .dq-network { height: 36px; width: auto; max-width: 42%; object-fit: contain; }
  .dq-network-text {
    margin: 0;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--partner, var(--navy));
    max-width: 42%;
  }
  .dq-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 58%;
    padding: 6px 8px;
    border: 1px solid #cce7e3;
    background: #f0fdfa;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1.25;
    color: var(--energia);
  }
  .dq-badge img { width: 28px; height: 18px; object-fit: contain; }
  .dq-card {
    background: #fff;
    border-radius: 18px;
    padding: 20px 18px 22px;
    box-shadow: 0 10px 30px rgba(11, 31, 58, 0.08);
  }
  .dq-hero { display: flex; gap: 12px; align-items: center; margin-bottom: 14px; }
  .dq-hero img, .dq-avatar {
    width: 72px; height: 72px; border-radius: 50%; object-fit: cover; object-position: center top;
    background: #eef3f8; flex-shrink: 0;
  }
  .dq-avatar {
    display: grid; place-items: center; font-weight: 800; color: #fff;
    background: var(--partner, var(--navy));
  }
  .dq-kicker {
    font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--partner, var(--navy));
    margin: 0 0 6px;
  }
  .dq h1, .dq h2 { font-size: 22px; letter-spacing: -0.03em; line-height: 1.2; margin: 0 0 10px; }
  .dq h3 { font-size: 14px; margin: 16px 0 8px; }
  .dq-lead { font-size: 15px; line-height: 1.45; color: #334155; margin: 0 0 12px; }
  .dq-note { font-size: 12.5px; line-height: 1.4; color: var(--muted); margin: 10px 0 16px; }
  .dq-btn {
    width: 100%; border: 0; border-radius: 999px; padding: 14px 16px;
    background: var(--partner, var(--navy)); color: #fff; font: inherit; font-weight: 800; font-size: 15px;
    cursor: pointer;
  }
  .dq-btn[disabled] { opacity: 0.65; }
  .dq-btn-alt { margin-top: 10px; background: var(--energia); }
  .dq-legal { margin-top: 14px; font-size: 11px; color: #7a8a99; }
  .dq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .dq-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; font-size: 13px; font-weight: 700; }
  .dq-field input, .dq-field select {
    border: 1px solid var(--line); border-radius: 10px; padding: 11px 12px; font: inherit; font-weight: 500;
    background: #fff; color: var(--navy);
  }
  .dq-check { display: flex; gap: 10px; align-items: flex-start; font-size: 13px; font-weight: 500; margin: 8px 0; }
  .dq-check input { margin-top: 3px; }
  .dq-check em { color: var(--muted); font-style: normal; }
  .dq-error { color: #b42318; font-size: 12px; font-weight: 600; font-style: normal; margin: 0 0 8px; }
  .dq-link { border: 0; background: none; color: var(--energia); font: inherit; font-weight: 700; padding: 0; cursor: pointer; }
  .dq-privacy { background: #f8fafc; border-radius: 12px; padding: 12px; font-size: 12.5px; line-height: 1.45; color: #334155; margin-bottom: 14px; }
  .dq-privacy h3 { margin-top: 0; }
  .dq ul { margin: 0 0 8px 18px; padding: 0; color: #334155; font-size: 14px; line-height: 1.45; }
  .dq-ok { background: #f0fdfa; color: var(--energia); border-radius: 12px; padding: 12px; font-size: 14px; font-weight: 600; }
  .dq-offer { margin-top: 12px; border: 1px solid #e4d5b5; background: #fffdf8; border-radius: 12px; padding: 14px; }
  .dq-offer strong { display: block; margin-bottom: 8px; }
  .dq-offer p { font-size: 13px; line-height: 1.4; color: #334155; margin: 0 0 8px; }
  .dq-foot { margin-top: 18px; font-size: 12px; color: var(--muted); line-height: 1.45; text-align: center; }
  .dq-qr { width: 88px; height: 88px; margin: 12px auto 0; display: block; background: #fff; padding: 6px; border-radius: 8px; }
  @media (max-width: 420px) { .dq-grid { grid-template-columns: 1fr; } }
`;
