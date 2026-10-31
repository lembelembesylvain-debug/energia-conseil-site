import { FormEvent, type ReactNode, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import iadLogo from "../../../templates/marketing/assets/iad-logo.png";
import energiaLogo from "../../../templates/marketing/assets/energia-logo-arbres.png";
import catarinaPhoto from "../../../templates/marketing/assets/catarina-martins.png";
import {
  BANDES_DPE,
  COMMUNES_SECTEUR,
  CRENEAUX_RDV,
  JOURS_RDV,
  MODES_CHAUFFAGE,
  SURFACE_DEFAUT,
  SURFACE_MAX,
  SURFACE_MIN,
  TYPES_BIEN,
  calculerScenarios,
  labelBien,
  labelChauffage,
  labelDpe,
  resumerScenarios,
  type BandeDpe,
  type ModeChauffage,
  type ReponsesEstimer,
  type TypeBien,
} from "../../lib/valorisation/estimerValorisation";
import { envoyerLeadChagny } from "../../lib/valorisation/envoyerLeadChagny";

const TEL_CATARINA = "06 61 37 14 64";
const EMAIL_CATARINA = "contact@catarinamartins-immobilier.fr";
const RSAC = "RSAC Dijon 819 244 328";

type Etape =
  | "accueil"
  | "type"
  | "surface"
  | "dpe"
  | "chauffage"
  | "commune"
  | "scenarios"
  | "lead"
  | "merci";

const QUESTIONS: Etape[] = ["type", "surface", "dpe", "chauffage", "commune"];

const ACCENT_CARD = {
  navy: "border-navy bg-white",
  gold: "border-gold bg-[#fffdf8]",
  green: "border-energia bg-energia-soft shadow-[0_16px_40px_-24px_rgba(15,118,110,0.55)]",
} as const;

function demarrerSurEstimer(): boolean {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname.replace(/\/+$/, "");
  const host = window.location.hostname;
  if (
    host === "catarinamartins-immobilier.fr"
    || host === "www.catarinamartins-immobilier.fr"
    || host === "immobilier-chagny.fr"
    || host === "www.immobilier-chagny.fr"
  ) return true;
  return window.location.hash === "#estimer" || path.endsWith("/estimer");
}

export default function ImmobilierChagnyApp() {
  const [etape, setEtape] = useState<Etape>(() => (demarrerSurEstimer() ? "type" : "accueil"));
  const [typeBien, setTypeBien] = useState<TypeBien | "">("");
  const [surface, setSurface] = useState(SURFACE_DEFAUT);
  const [dpe, setDpe] = useState<BandeDpe | "">("");
  const [chauffage, setChauffage] = useState<ModeChauffage | "">("");
  const [commune, setCommune] = useState("");
  const [lead, setLead] = useState({
    prenom: "",
    nom: "",
    telephone: "",
    adresse: "",
    email: "",
    jour: "",
    creneau: "",
    consentement: false,
    souhaitAudit: false,
  });
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [envoi, setEnvoi] = useState(false);
  const [erreurEnvoi, setErreurEnvoi] = useState("");
  const [canalEnvoi, setCanalEnvoi] = useState<"php" | "mailto" | null>(null);
  const [lienMailto, setLienMailto] = useState(`mailto:${EMAIL_CATARINA}`);

  const reponses = useMemo<ReponsesEstimer | null>(() => {
    if (!typeBien || !dpe || !chauffage || !commune) return null;
    return { typeBien, surface, dpe, chauffage, commune };
  }, [typeBien, surface, dpe, chauffage, commune]);

  const resultat = useMemo(() => (reponses ? calculerScenarios(reponses) : null), [reponses]);

  useEffect(() => {
    const onHash = () => {
      if (window.location.hash === "#estimer" && etape === "accueil") setEtape("type");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [etape]);

  useEffect(() => {
    if (etape === "accueil") return;
    document.getElementById("estimer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [etape]);

  const indexQuestion = QUESTIONS.indexOf(etape);
  const progression = etape === "accueil" ? 0 : indexQuestion >= 0 ? ((indexQuestion + 1) / QUESTIONS.length) * 55 : etape === "scenarios" ? 75 : etape === "lead" ? 90 : 100;

  const allerEstimer = () => {
    window.history.replaceState(null, "", `${window.location.pathname}#estimer`);
    setEtape("type");
  };

  const validerLead = () => {
    const next: Record<string, string> = {};
    if (lead.prenom.trim().length < 2) next.prenom = "Prénom requis.";
    if (lead.nom.trim().length < 2) next.nom = "Nom requis.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email.trim())) next.email = "E-mail invalide.";
    const tel = lead.telephone.replace(/[.\s-]/g, "");
    if (!/^(?:(?:\+33|0033)|0)[1-9]\d{8}$/.test(tel)) next.telephone = "Téléphone invalide.";
    if (lead.adresse.trim().length < 8) next.adresse = "Adresse du bien requise.";
    if (!JOURS_RDV.includes(lead.jour as (typeof JOURS_RDV)[number])) next.jour = "Choisissez un jour.";
    if (!CRENEAUX_RDV.some((c) => c.id === lead.creneau)) next.creneau = "Choisissez un créneau.";
    if (!lead.consentement) next.consentement = "Le consentement de recontact est obligatoire.";
    setErreurs(next);
    return Object.keys(next).length === 0;
  };

  const envoyer = async (event: FormEvent) => {
    event.preventDefault();
    if (!reponses || !resultat || !validerLead()) return;
    setEnvoi(true);
    setErreurEnvoi("");
    const payload = {
      prenom: lead.prenom.trim(),
      nom: lead.nom.trim(),
      email: lead.email.trim().toLowerCase(),
      telephone: lead.telephone.trim(),
      adresse: lead.adresse.trim(),
      jour: lead.jour,
      creneau: lead.creneau,
      consentement: lead.consentement,
      souhaitAudit: lead.souhaitAudit,
      typeBien: reponses.typeBien,
      surface: reponses.surface,
      dpe: reponses.dpe,
      chauffage: reponses.chauffage,
      commune: reponses.commune,
      scenariosResume: resumerScenarios(resultat.scenarios),
    };
    try {
      const resultatEnvoi = await envoyerLeadChagny(payload);
      setLienMailto(resultatEnvoi.mailto);
      setCanalEnvoi(resultatEnvoi.canal);
      setEtape("merci");
      if (resultatEnvoi.autoOpen) {
        window.location.href = resultatEnvoi.mailto;
      }
    } catch {
      setErreurEnvoi("Envoi interrompu. Utilisez le bouton pour écrire à contact@catarinamartins-immobilier.fr.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <div className="min-h-screen bg-ice text-ink">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-navy/95 text-white backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <img src={iadLogo} alt="iad France" className="h-8 w-auto brightness-0 invert" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-extrabold tracking-[0.14em] uppercase text-gold">Catarina Martins</p>
              <p className="truncate text-[11px] text-white/70">Conseillère iad France · Chagny</p>
            </div>
          </div>
          <a
            href="#estimer"
            onClick={(e) => {
              e.preventDefault();
              allerEstimer();
            }}
            className="shrink-0 rounded-full bg-gold px-3 py-2 text-center text-[11px] font-extrabold leading-tight text-navy-deep sm:px-4 sm:text-sm"
          >
            Estimer la valorisation de mon bien
          </a>
        </div>
      </header>

      <section className="bg-navy-deep text-white">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:grid-cols-[1.1fr_0.9fr] sm:items-center sm:py-14">
          <div>
            <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-gold">QR flyer · 30 secondes</p>
            <h1 className="mt-3 text-[1.85rem] font-extrabold leading-[1.15] tracking-tight sm:text-4xl">
              Diagnostic de valorisation énergétique &amp; immobilière
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
              3 projets en 1 : projection 3D, analyse énergétique par Energia Conseil IA®, bilan de valorisation
              avec Catarina Martins (iad France).
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={allerEstimer}
                className="rounded-2xl bg-energia px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_30px_-12px_rgba(15,118,110,0.9)]"
              >
                Lancer mon Diagnostic de Valorisation (30 sec)
              </button>
              <a
                href={`tel:+33661371464`}
                className="rounded-2xl border border-white/20 px-5 py-3.5 text-center text-sm font-semibold text-white"
              >
                Appeler Catarina · {TEL_CATARINA}
              </a>
            </div>
            <p className="mt-4 text-xs text-white/55">
              Simulation illustrative — pas un DPE, pas un audit sur site, pas une garantie d’aides ou de plus-value.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-sm">
            <div className="overflow-hidden rounded-[28px] border border-gold/40 bg-navy shadow-[0_30px_60px_-24px_rgba(0,0,0,0.55)]">
              <img src={catarinaPhoto} alt="Catarina Martins, conseillère iad France" className="h-72 w-full object-cover object-top sm:h-80" />
              <div className="flex items-center gap-3 px-4 py-3">
                <img src={energiaLogo} alt="" className="h-10 w-10 rounded-full bg-white p-1" />
                <p className="text-xs leading-snug text-white/80">
                  Partenaire technique
                  <br />
                  <span className="font-bold text-gold">Energia Conseil IA®</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-5xl">
          <p className="text-[11px] font-extrabold tracking-[0.18em] uppercase text-gold-deep">Synergie Catarina Martins × Energia Conseil IA®</p>
          <h2 className="mt-2 text-2xl font-extrabold text-navy sm:text-3xl">3 projets en 1</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Un seul parcours pour visualiser, chiffrer et valoriser le bien — sans confondre le diagnostic de 30 secondes
            avec l’audit énergétique payant.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <article className="rounded-3xl border border-line bg-ice p-5">
              <p className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-gold">1</p>
              <h3 className="mt-3 text-lg font-extrabold text-navy">Projection 3D</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Visualiser le potentiel intérieur et extérieur du bien avant travaux.</p>
            </article>
            <article className="rounded-3xl border border-line bg-ice p-5">
              <p className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-gold">2</p>
              <h3 className="mt-3 text-lg font-extrabold text-navy">Analyse énergétique</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Chiffrage des aides et des scénarios techniques par le bureau d’études Energia Conseil IA®.
                Aides 2026 à titre indicatif, à valider selon revenus réels.
              </p>
            </article>
            <article className="rounded-3xl border border-gold bg-[#fffdf8] p-5">
              <p className="flex h-9 w-9 items-center justify-center rounded-full bg-navy text-sm font-extrabold text-gold">3</p>
              <h3 className="mt-3 text-lg font-extrabold text-navy">Bilan de valorisation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Maximiser le prix net vendeur avec Catarina Martins (iad France).
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="estimer" className="scroll-mt-20 px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-line">
            <div className="h-full rounded-full bg-gradient-to-r from-navy to-energia transition-all duration-500" style={{ width: `${progression}%` }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={etape}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
              className="rounded-[28px] border border-line bg-white p-5 shadow-[0_20px_50px_-32px_rgba(11,31,58,0.35)] sm:p-8"
            >
              {etape === "accueil" ? (
                <div>
                  <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-gold-deep">Module interactif</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-navy">Votre diagnostic en 30 secondes</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Cinq questions. Trois scénarios de valorisation. Puis prise de rendez-vous de pré-qualification
                    avec Catarina Martins et Energia Conseil IA®. L’audit énergétique complet est une prestation payante
                    (199 € TTC), distincte de ce diagnostic de 30 secondes.
                  </p>
                  <button type="button" onClick={allerEstimer} className="mt-6 w-full rounded-2xl bg-energia py-3.5 text-sm font-extrabold text-white sm:w-auto sm:px-8">
                    Lancer mon Diagnostic de Valorisation (30 sec)
                  </button>
                </div>
              ) : null}

              {etape === "type" ? (
                <Question titre="Quel type de bien ?" etapeLabel="1 / 5" onRetour={() => setEtape("accueil")}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {TYPES_BIEN.map((item) => (
                      <Choice key={item.id} selected={typeBien === item.id} onClick={() => { setTypeBien(item.id); setEtape("surface"); }}>
                        {item.label}
                      </Choice>
                    ))}
                  </div>
                </Question>
              ) : null}

              {etape === "surface" ? (
                <Question titre="Surface habitable approximative" etapeLabel="2 / 5" onRetour={() => setEtape("type")}>
                  <div className="rounded-2xl bg-ice px-4 py-5">
                    <p className="text-center text-4xl font-extrabold text-navy">{surface} <span className="text-lg font-bold text-muted">m²</span></p>
                    <input
                      type="range"
                      min={SURFACE_MIN}
                      max={SURFACE_MAX}
                      value={surface}
                      aria-label="Surface habitable en mètres carrés"
                      onChange={(e) => setSurface(Number(e.target.value))}
                      className="mt-5 w-full"
                    />
                    <div className="mt-2 flex justify-between text-xs text-muted">
                      <span>{SURFACE_MIN} m²</span>
                      <span>{SURFACE_MAX} m²</span>
                    </div>
                    <label className="mt-4 block text-sm font-semibold text-navy">
                      Ou saisissez la surface
                      <input
                        type="number"
                        min={SURFACE_MIN}
                        max={SURFACE_MAX}
                        value={surface}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n)) setSurface(Math.min(SURFACE_MAX, Math.max(SURFACE_MIN, Math.round(n))));
                        }}
                        className="mt-2 w-full rounded-xl border border-line px-3 py-3"
                      />
                    </label>
                  </div>
                  <button type="button" onClick={() => setEtape("dpe")} className="mt-5 w-full rounded-2xl bg-navy py-3.5 text-sm font-extrabold text-white">
                    Continuer
                  </button>
                </Question>
              ) : null}

              {etape === "dpe" ? (
                <Question titre="DPE estimé ou connu" etapeLabel="3 / 5" onRetour={() => setEtape("surface")}>
                  <div className="grid gap-3">
                    {BANDES_DPE.map((item) => (
                      <Choice key={item.id} selected={dpe === item.id} onClick={() => { setDpe(item.id); setEtape("chauffage"); }}>
                        {item.label}
                      </Choice>
                    ))}
                  </div>
                </Question>
              ) : null}

              {etape === "chauffage" ? (
                <Question titre="Mode de chauffage actuel" etapeLabel="4 / 5" onRetour={() => setEtape("dpe")}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {MODES_CHAUFFAGE.map((item) => (
                      <Choice key={item.id} selected={chauffage === item.id} onClick={() => { setChauffage(item.id); setEtape("commune"); }}>
                        {item.label}
                      </Choice>
                    ))}
                  </div>
                </Question>
              ) : null}

              {etape === "commune" ? (
                <Question titre="Secteur du bien" etapeLabel="5 / 5" onRetour={() => setEtape("chauffage")}>
                  <p className="mb-3 text-sm text-muted">Chagny et communes limitrophes (71 / 21).</p>
                  <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
                    {COMMUNES_SECTEUR.map((item) => (
                      <Choice
                        key={item}
                        selected={commune === item}
                        onClick={() => {
                          setCommune(item);
                          setEtape("scenarios");
                        }}
                      >
                        {item}
                      </Choice>
                    ))}
                  </div>
                </Question>
              ) : null}

              {etape === "scenarios" && resultat && reponses ? (
                <div>
                  <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-gold-deep">Calcul instantané</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-navy">Trois scénarios comparatifs</h2>
                  <p className="mt-2 text-sm text-muted">
                    {labelBien(reponses.typeBien)} · {reponses.surface} m² · {reponses.commune} · {labelDpe(reponses.dpe)}
                  </p>
                  <div className="mt-5 grid gap-4">
                    {resultat.scenarios.map((scenario, index) => (
                      <article key={scenario.id} className={`rounded-3xl border-2 p-5 ${ACCENT_CARD[scenario.accent]}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-extrabold tracking-[0.12em] uppercase text-muted">
                              Scénario {index + 1} · {scenario.badge}
                            </p>
                            <h3 className="mt-1 text-lg font-extrabold text-navy">{scenario.titre}</h3>
                            <p className="text-sm text-muted">{scenario.sousTitre}</p>
                          </div>
                        </div>
                        <p className="mt-3 text-sm font-extrabold text-energia">{scenario.plusValue}</p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-ink">
                          {scenario.points.map((point) => (
                            <li key={point} className="flex gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-muted">{resultat.mention}</p>
                  <p className="mt-2 text-xs font-semibold text-energia">
                    Aides financières 2026 (estimation à titre indicatif). À valider selon revenus réels. Montants définitifs après instruction ANAH et CEE.
                  </p>
                  <aside className="mt-6 rounded-3xl border-2 border-energia bg-energia-soft p-5">
                    <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-energia">Offre d’audit technique</p>
                    <h3 className="mt-1 text-lg font-extrabold text-navy">Audit Énergétique IA — 199 € TTC</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      Audit énergétique complet et approfondi, conforme au flyer. Ce n’est pas le diagnostic de 30 secondes.
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-muted">
                      Nécessite la transmission des documents utiles et d’un minimum de 4 photographies du logement avant toute visite sur place.
                    </p>
                    <p className="mt-2 text-xs font-semibold text-navy">
                      Objectif : zéro déplacement inutile. Pré-qualification obligatoire au bureau, avec Catarina Martins.
                    </p>
                  </aside>
                  <button type="button" onClick={() => setEtape("lead")} className="mt-6 w-full rounded-2xl bg-energia py-3.5 text-sm font-extrabold text-white">
                    Estimer la valorisation de mon bien — prendre RDV
                  </button>
                  <button type="button" onClick={() => setEtape("commune")} className="mt-3 w-full text-sm font-semibold text-muted">
                    Modifier le questionnaire
                  </button>
                </div>
              ) : null}

              {etape === "lead" ? (
                <form onSubmit={envoyer} noValidate>
                  <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-gold-deep">Pré-qualification</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-navy">Bilan de valorisation &amp; rendez-vous</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    Créneau d’appel ou de rendez-vous bureau. Aucune visite sur place avant documents utiles et 4 photographies.
                    Notification envoyée à {EMAIL_CATARINA}.
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <Champ label="Prénom" error={erreurs.prenom}>
                      <input value={lead.prenom} autoComplete="given-name" onChange={(e) => setLead({ ...lead, prenom: e.target.value })} className="w-full rounded-xl border border-line px-3 py-3" />
                    </Champ>
                    <Champ label="Nom" error={erreurs.nom}>
                      <input value={lead.nom} autoComplete="family-name" onChange={(e) => setLead({ ...lead, nom: e.target.value })} className="w-full rounded-xl border border-line px-3 py-3" />
                    </Champ>
                  </div>
                  <Champ label="Téléphone" error={erreurs.telephone}>
                    <input type="tel" value={lead.telephone} autoComplete="tel" onChange={(e) => setLead({ ...lead, telephone: e.target.value })} className="mt-3 w-full rounded-xl border border-line px-3 py-3" />
                  </Champ>
                  <Champ label="Adresse du bien" error={erreurs.adresse}>
                    <input value={lead.adresse} autoComplete="street-address" onChange={(e) => setLead({ ...lead, adresse: e.target.value })} className="mt-3 w-full rounded-xl border border-line px-3 py-3" />
                  </Champ>
                  <Champ label="E-mail" error={erreurs.email}>
                    <input type="email" value={lead.email} autoComplete="email" onChange={(e) => setLead({ ...lead, email: e.target.value })} className="mt-3 w-full rounded-xl border border-line px-3 py-3" />
                  </Champ>
                  <p className="mt-5 text-sm font-bold text-navy">Créneau de pré-qualification (lun. – sam.)</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {JOURS_RDV.map((jour) => (
                      <Choice key={jour} compact selected={lead.jour === jour} onClick={() => setLead({ ...lead, jour })}>
                        {jour}
                      </Choice>
                    ))}
                  </div>
                  {erreurs.jour ? <p className="mt-1 text-xs text-red-600">{erreurs.jour}</p> : null}
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {CRENEAUX_RDV.map((slot) => (
                      <Choice key={slot.id} compact selected={lead.creneau === slot.id} onClick={() => setLead({ ...lead, creneau: slot.id })}>
                        {slot.label}
                      </Choice>
                    ))}
                  </div>
                  {erreurs.creneau ? <p className="mt-1 text-xs text-red-600">{erreurs.creneau}</p> : null}
                  <label className="mt-5 flex gap-3 text-sm leading-relaxed">
                    <input type="checkbox" checked={lead.souhaitAudit} onChange={(e) => setLead({ ...lead, souhaitAudit: e.target.checked })} className="mt-1" />
                    <span>
                      Je souhaite commander l’<strong>Audit Énergétique IA — 199 € TTC</strong>.
                      Nécessite la transmission des documents utiles et d’un minimum de 4 photographies du logement avant toute visite sur place.
                    </span>
                  </label>
                  <label className="mt-4 flex gap-3 text-sm leading-relaxed">
                    <input type="checkbox" checked={lead.consentement} onChange={(e) => setLead({ ...lead, consentement: e.target.checked })} className="mt-1" />
                    <span>J’accepte d’être recontacté(e) par Catarina Martins (iad France) et Energia Conseil IA® au sujet de ce bien. <em className="text-muted">(obligatoire)</em></span>
                  </label>
                  {erreurs.consentement ? <p className="mt-1 text-xs text-red-600">{erreurs.consentement}</p> : null}
                  {erreurEnvoi ? <p className="mt-3 text-sm text-red-700">{erreurEnvoi}</p> : null}
                  <button type="submit" disabled={envoi} className="mt-6 w-full rounded-2xl bg-energia py-3.5 text-sm font-extrabold text-white disabled:opacity-60">
                    {envoi ? "Envoi…" : "Envoyer ma demande à Catarina"}
                  </button>
                  <button type="button" onClick={() => setEtape("scenarios")} className="mt-3 w-full text-sm font-semibold text-muted">
                    Retour aux scénarios
                  </button>
                </form>
              ) : null}

              {etape === "merci" ? (
                <div className="text-center">
                  <p className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-energia-soft text-2xl text-energia">✓</p>
                  <h2 className="mt-4 text-2xl font-extrabold text-navy">Demande bien reçue</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    Catarina Martins (iad France) et Energia Conseil IA® vous recontactent pour la pré-qualification
                    ({lead.jour} — {CRENEAUX_RDV.find((c) => c.id === lead.creneau)?.label}).
                    Aucune visite sur place avant documents utiles et 4 photographies du logement.
                  </p>
                  {lead.souhaitAudit ? (
                    <p className="mt-3 text-sm font-semibold text-navy">
                      Votre intérêt pour l’Audit Énergétique IA — 199 € TTC a été transmis.
                    </p>
                  ) : null}
                  {canalEnvoi === "php" ? (
                    <p className="mt-3 text-sm text-energia">Une notification a été envoyée à {EMAIL_CATARINA}.</p>
                  ) : (
                    <p className="mt-3 text-sm text-navy">
                      Si votre messagerie s’ouvre, envoyez le message. Sinon, utilisez le bouton ci-dessous : la demande part vers {EMAIL_CATARINA}.
                    </p>
                  )}
                  <a href={lienMailto} className="mt-6 inline-flex w-full justify-center rounded-2xl border border-navy px-4 py-3 text-sm font-bold text-navy">
                    Écrire à {EMAIL_CATARINA}
                  </a>
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <footer className="border-t border-line bg-white px-4 py-8 text-xs leading-relaxed text-muted">
        <div className="mx-auto max-w-5xl space-y-3">
          <p className="font-bold text-navy">Catarina Martins, conseillère iad France · Partenaire technique Energia Conseil IA®</p>
          <p className="text-[11px] font-normal tracking-[0.045em] text-muted/90">Agent commercial EI - {RSAC} · {TEL_CATARINA} · {EMAIL_CATARINA}</p>
          <p>ENERGIA CONSEIL IA® — 16 rue Cuvier, 69006 Lyon — 06 10 59 68 98 — contact@energia-conseil-ia.com — SIRET 94181942700019</p>
          <p>
            Les scénarios, aides MaPrimeRénov’ / CEE 2026 et fourchettes de valorisation sont des simulations illustratives.
            Ils ne constituent ni une mesure réglementaire, ni un audit réalisé sur site, ni une garantie d’aide, d’économie,
            Données collectées pour recontact et pré-qualification. Aucune visite sur place avant documents utiles et 4 photographies.
            Droits RGPD : {EMAIL_CATARINA} ou contact@energia-conseil-ia.com.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Question({
  titre,
  etapeLabel,
  onRetour,
  children,
}: {
  titre: string;
  etapeLabel: string;
  onRetour: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase text-gold-deep">{etapeLabel}</p>
      <h2 className="mt-2 text-2xl font-extrabold text-navy">{titre}</h2>
      <div className="mt-5">{children}</div>
      <button type="button" onClick={onRetour} className="mt-4 text-sm font-semibold text-muted">
        Retour
      </button>
    </div>
  );
}

function Choice({
  selected,
  onClick,
  children,
  compact = false,
}: {
  selected: boolean;
  onClick: () => void;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border text-left font-semibold transition ${
        compact ? "px-3 py-2.5 text-sm" : "px-4 py-4 text-[15px]"
      } ${selected ? "border-navy bg-navy text-white" : "border-line bg-ice text-navy hover:border-gold"}`}
    >
      {children}
    </button>
  );
}

function Champ({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-navy">
      {label}
      {children}
      {error ? <em className="mt-1 block text-xs font-medium not-italic text-red-600">{error}</em> : null}
    </label>
  );
}
