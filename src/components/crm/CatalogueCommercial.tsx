import { useState } from "react";
import { BRANDING } from "../../lib/branding";
import {
  BADGES_QUATRIEME,
  BADGE_TESLA,
  CONTACTS_QUATRIEME,
  LOGO_COUVERTURE,
  MENTIONS_COUVERTURE,
  SLOGAN_INSTITUTIONNEL,
  MENTION_AIDES_CATALOGUE,
  MOT_FONDATEUR,
  PLANCHE_TRAME,
  PROFILS_CLIENTS,
  PLANCHES_B2B,
  PLANCHES_GARANTIES,
  PLANCHES_RESIDENTIEL,
  POLICE_DECENNALE,
  SECTIONS_BOOK,
  type PlancheCatalogue,
} from "../../lib/crm/catalogueCommercial";
import { telechargerCatalogueCommercialPdf } from "../../lib/crm/catalogueCommercialPdf";

function Planche({ planche }: { planche: PlancheCatalogue }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
      <header className="border-b border-slate-800 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">{planche.kicker}</p>
        <h3 className="mt-1 text-xl font-semibold text-white">{planche.titre}</h3>
      </header>
      {planche.image ? (
        <img src={planche.image} alt={planche.alt ?? planche.titre} className="aspect-video w-full object-cover" />
      ) : null}
      <div className="space-y-4 px-5 py-5">
        {planche.blocs.map((bloc) => (
          <section key={bloc.titre}>
            <h4 className="text-sm font-semibold text-amber-100">{bloc.titre}</h4>
            {bloc.texte ? <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-300">{bloc.texte}</p> : null}
            {bloc.puces ? (
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-300">
                {bloc.puces.map((puce) => (
                  <li key={puce}>{puce}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </article>
  );
}

export default function CatalogueCommercial() {
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  const telecharger = async () => {
    setBusy(true);
    setErreur("");
    try {
      await telechargerCatalogueCommercialPdf();
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Le PDF n'a pas pu être généré.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-slate-950 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">Book de vente Damien</p>
          <p className="mt-1 text-sm text-slate-300">Catalogue officiel 2026 — lecture client, puis impression A4.</p>
        </div>
        <button
          type="button"
          data-testid="telecharger-catalogue-commercial"
          onClick={() => void telecharger()}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {busy ? "Préparation du PDF…" : "📥 Télécharger le Catalogue Complet de Vente (PDF A4)"}
        </button>
      </div>
      {erreur ? <p className="text-sm text-rose-300">{erreur}</p> : null}

      <nav className="flex flex-wrap gap-2" aria-label="Sections du catalogue">
        {SECTIONS_BOOK.map((section) => (
          <a
            key={section.id}
            href={`#${section.ancre}`}
            className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-amber-400/60 hover:text-amber-100"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <section id="book-couverture" className="overflow-hidden rounded-3xl border border-amber-400/40 bg-[#0c1220] text-white shadow-2xl">
        <div className="border-b border-amber-400/30 px-6 py-8 sm:px-10">
          <img
            src={LOGO_COUVERTURE}
            alt="Logo officiel ENERGIA CONSEIL IA aux trois arbres"
            className="h-20 w-auto rounded-xl bg-white p-2"
          />
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-300">Catalogue officiel 2026</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{BRANDING.nom}</h2>
          <p className="mt-2 text-base text-amber-100">Bureau d&apos;Études Thermiques &amp; Contractant Général Digital</p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300">
            Rénovation globale · Écosystème solaire Tesla · Tertiaire &amp; décarbonation industrielle
          </p>
          <ul className="mt-6 space-y-1.5 text-sm text-slate-200">
            {MENTIONS_COUVERTURE.map((ligne) => (
              <li key={ligne}>{ligne}</li>
            ))}
          </ul>
          <p className="mt-5 inline-flex rounded-full border border-amber-400/50 px-3 py-1.5 text-xs font-semibold text-amber-200">
            {BADGE_TESLA}
          </p>
        </div>
        <blockquote className="px-6 py-8 sm:px-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">
            Le mot de Sylvain LEMBELEMBE, Fondateur &amp; CEO
          </p>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-slate-100">{MOT_FONDATEUR}</p>
          <footer className="mt-5 text-sm text-amber-100">
            Sylvain LEMBELEMBE
            <span className="mt-1 block text-slate-400">Fondateur &amp; CEO — Contractant Général Digital</span>
            <span className="block text-slate-500">{POLICE_DECENNALE}</span>
          </footer>
          <p className="mt-6 text-xs leading-relaxed text-slate-400">{MENTION_AIDES_CATALOGUE}</p>
        </blockquote>
      </section>

      <section id="book-garanties" className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Charte des 4 garanties</h2>
        <Planche planche={PLANCHES_GARANTIES} />
      </section>

      <section id="book-residentiel" className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Pôle résidentiel &amp; solaire Tesla</h2>
        {PLANCHES_RESIDENTIEL.map((planche) => (
          <Planche key={planche.id} planche={planche} />
        ))}
      </section>

      <section id="book-b2b" className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Pôle tertiaire, décret BACS &amp; industrie</h2>
        {PLANCHES_B2B.map((planche) => (
          <Planche key={planche.id} planche={planche} />
        ))}
      </section>

      <section id="book-profils" className="space-y-4">
        <header>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">Guide Damien · avant la trame</p>
          <h2 className="mt-1 text-lg font-semibold text-white">Profils clients et postures commerciales</h2>
        </header>
        <div className="grid gap-4 lg:grid-cols-2">
          {PROFILS_CLIENTS.map((profil, index) => (
            <article key={profil.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-300">Profil {index + 1}</p>
              <h3 className="mt-1 text-base font-semibold text-white">{profil.titre}</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-semibold text-amber-100">Psychologie</dt>
                  <dd className="mt-0.5 text-slate-300">{profil.psychologie}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-amber-100">Posture</dt>
                  <dd className="mt-0.5 text-slate-300">{profil.posture}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-amber-100">Argument</dt>
                  <dd className="mt-0.5 text-slate-300">{profil.argument}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-amber-100">Levier</dt>
                  <dd className="mt-0.5 text-slate-300">{profil.levier}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-slate-400">{MENTION_AIDES_CATALOGUE}</p>
      </section>

      <section id="book-trame">
        <Planche planche={PLANCHE_TRAME} />
      </section>

      <section id="book-quatrieme" className="overflow-hidden rounded-3xl border border-amber-400/40 bg-[#0c1220] px-6 py-10 text-white sm:px-10">
        <img
          src={LOGO_COUVERTURE}
          alt="Logo officiel ENERGIA CONSEIL IA"
          className="h-24 w-auto rounded-xl bg-white p-3"
        />
        <h2 className="mt-6 text-3xl font-semibold tracking-tight">{BRANDING.nom}</h2>
        <p className="mt-3 max-w-xl text-base italic leading-relaxed text-amber-200">{SLOGAN_INSTITUTIONNEL}</p>
        <dl className="mt-8 space-y-2 text-sm">
          {CONTACTS_QUATRIEME.map((contact) => (
            <div key={contact.role} className="grid gap-1 sm:grid-cols-[11rem_1fr]">
              <dt className="font-semibold text-amber-300">{contact.role}</dt>
              <dd className="text-slate-100">{contact.valeur}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-8 flex flex-col gap-2 text-sm text-amber-100">
          {BADGES_QUATRIEME.map((badge) => (
            <li key={badge}>{badge}</li>
          ))}
        </ul>
        <p className="mt-8 text-xs leading-relaxed text-slate-400">{MENTION_AIDES_CATALOGUE}</p>
      </section>
    </div>
  );
}
