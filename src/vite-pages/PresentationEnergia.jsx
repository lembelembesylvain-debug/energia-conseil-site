import { useEffect, useState } from "react";

const LOGO = "/assets/LOGO.png";

const SECTIONS = [
  { id: "ouverture", label: "Ouverture" },
  { id: "ecosysteme", label: "Écosystème" },
  { id: "crm", label: "CRM" },
  { id: "kit-damien", label: "Kit Damien" },
  { id: "controle-interne", label: "Contrôle interne" },
  { id: "audit", label: "Audit IA" },
  { id: "piliers", label: "5 piliers" },
  { id: "photovoltaique", label: "Photovoltaïque" },
  { id: "parcours", label: "Parcours" },
  { id: "gouvernance", label: "Gouvernance" },
  { id: "prudence", label: "Mentions" },
];

const LIENS = {
  crm: "/test-dashboard-crm",
  kitDamien: "/test-dashboard-crm#presentation",
  controleInterne: "/test-dashboard-crm#controle-interne",
  dossierClient: "/test-dashboard-crm#projets",
};

function NavLink({ href, children, primaire = false }) {
  return (
    <a
      href={href}
      className={
        primaire
          ? "inline-flex min-h-11 items-center justify-center rounded-full bg-[#14532d] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#166534]"
          : "inline-flex min-h-11 items-center justify-center rounded-full border border-[#14532d]/25 bg-white px-4 py-2 text-sm font-semibold text-[#14532d] transition hover:border-[#c9a227] hover:text-[#0b3d2e]"
      }
    >
      {children}
    </a>
  );
}

function Carte({ titre, texte, accent = false }) {
  return (
    <article
      className={`rounded-2xl border p-5 shadow-sm ${
        accent
          ? "border-[#c9a227]/50 bg-[#fbf8ee]"
          : "border-emerald-900/10 bg-white"
      }`}
    >
      <h3 className="text-base font-semibold text-[#14532d]">{titre}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{texte}</p>
    </article>
  );
}

export default function PresentationEnergia() {
  const [menuOuvert, setMenuOuvert] = useState(false);

  useEffect(() => {
    document.title = "Présentation ENERGIA CONSEIL IA®";
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faf7] text-slate-800">
      <a
        href="#ouverture"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-3 focus:py-2"
      >
        Aller au contenu
      </a>

      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#ouverture" className="flex min-w-0 items-center gap-3">
            <img src={LOGO} alt="ENERGIA CONSEIL IA®" className="h-12 w-auto object-contain sm:h-14" />
            <span className="hidden truncate text-sm font-semibold text-[#14532d] sm:inline">
              Présentation
            </span>
          </a>
          <nav className="hidden min-w-0 flex-1 items-center justify-end gap-1 overflow-x-auto lg:flex" aria-label="Sections">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-[#14532d]"
              >
                {section.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NavLink href={LIENS.crm}>Retour au CRM</NavLink>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-full border border-slate-200 px-3 text-sm font-medium lg:hidden"
              aria-expanded={menuOuvert}
              aria-controls="menu-sections"
              onClick={() => setMenuOuvert((v) => !v)}
            >
              Menu
            </button>
          </div>
        </div>
        {menuOuvert ? (
          <nav id="menu-sections" className="border-t border-emerald-900/10 bg-white px-4 py-3 lg:hidden">
            <ul className="grid grid-cols-2 gap-2">
              {SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block rounded-xl bg-emerald-50 px-3 py-2 text-sm text-[#14532d]"
                    onClick={() => setMenuOuvert(false)}
                  >
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <section id="ouverture" className="scroll-mt-28">
          <div className="overflow-hidden rounded-3xl border border-emerald-900/10 bg-white shadow-sm">
            <div className="grid gap-8 px-6 py-10 sm:px-10 lg:grid-cols-[minmax(0,16rem)_1fr] lg:items-center">
              <img
                src={LOGO}
                alt="Logo officiel ENERGIA CONSEIL IA®"
                className="mx-auto w-full max-w-[16rem] object-contain"
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c9a227]">
                  Présentation professionnelle
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0b3d2e] sm:text-4xl">
                  ENERGIA CONSEIL IA®
                </h1>
                <p className="mt-3 text-lg font-medium text-[#14532d]">Sylvain Lembelembe</p>
                <p className="text-sm text-slate-600">
                  Fondateur &amp; CEO — Contractant Général Digital
                </p>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                  Rénovation énergétique, autonomie énergétique et accompagnement de projets.
                  Bureau d’études et AMO : on coordonne, on ne vend pas de données internes
                  sur cette page.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <NavLink href={LIENS.crm} primaire>
                    Retour au CRM
                  </NavLink>
                  <NavLink href={LIENS.kitDamien}>Ouvrir le Kit Damien</NavLink>
                  <NavLink href={LIENS.controleInterne}>Ouvrir le Centre de Contrôle Interne</NavLink>
                  <NavLink href={LIENS.dossierClient}>Ouvrir un dossier client</NavLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ecosysteme" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Notre écosystème</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Six espaces distincts. Les boutons ci-dessous n’ouvrent que des routes déjà
            présentes dans l’application.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Carte
              titre="Site public ENERGIA CONSEIL IA®"
              texte="Vitrine et premier contact. Cette présentation n’en modifie pas le contenu."
            />
            <Carte
              titre="TravauxOptim"
              texte="Mise en relation avec des artisans. Module d’écosystème, sans route dédiée dans cette application."
            />
            <Carte titre="CRM commercial" texte="Prospects, pipeline, projets, relances, partenaires, artisans et financements." />
            <Carte titre="Kit Damien" texte="Présentation terrain sur tablette : logement, travaux, scénarios, budget client, aides indicatives et financement sous réserve." />
            <Carte
              titre="Centre de Contrôle Interne"
              texte="Pilotage des coûts et des marges. Accès réservé à l’administrateur propriétaire."
              accent
            />
            <Carte titre="Audit IA et rapport client" texte="Analyse du logement, scénarios, aides indicatives, reste à charge estimé et export PDF." />
          </div>
        </section>

        <section id="crm" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Le CRM</h2>
          <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            Les données éventuellement visibles après ouverture du CRM sont illustratives
            lorsqu’elles ne proviennent pas de la base réelle. Cette page de présentation
            n’affiche aucun dossier client.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Gestion des prospects",
              "Pipeline commercial",
              "Suivi des projets",
              "Relances",
              "Partenaires",
              "Artisans RGE",
              "Financements",
            ].map((item) => (
              <li
                key={item}
                className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 text-sm font-medium text-[#14532d]"
              >
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="kit-damien" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Le Kit Damien</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Outil de rendez-vous terrain. Vue commerciale uniquement : rien de ce qui suit
            n’est un coût d’achat, un prix fournisseur, une marge ENERGIA, une commission
            Damien, un coût Clyve ni un prix plancher.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Présentation client sur tablette",
              "Logement et travaux",
              "Scénarios",
              "Budget client",
              "Aides indicatives",
              "Financement sous réserve",
              "Signature des documents autorisés",
            ].map((item) => (
              <p
                key={item}
                className="rounded-xl border border-emerald-900/10 bg-white px-4 py-3 text-sm text-slate-700"
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        <section id="controle-interne" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Le Centre de Contrôle Interne</h2>
          <p className="mt-3 rounded-2xl border-2 border-[#c9a227] bg-[#14532d] px-5 py-4 text-center text-sm font-semibold tracking-wide text-[#e8d48b]">
            Accès réservé à l’administrateur propriétaire.
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
            Cet espace sert au pilotage interne. La présentation décrit le rôle, sans
            afficher de montants, de marges ni de coûts.
          </p>
          <ul className="mt-5 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
            {[
              "Comparaison des coûts",
              "Matériel acheté par ENERGIA",
              "Pose des artisans",
              "Prix de vente",
              "Calcul de marge",
              "Suivi des devis réels",
              "Contrôle du coût Clyve",
              "Commission commerciale",
            ].map((item) => (
              <li key={item} className="rounded-lg bg-white px-4 py-2.5 ring-1 ring-emerald-900/10">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="audit" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Audit IA et rapport</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Carte titre="Analyse du logement" texte="Lecture des données disponibles pour identifier les priorités techniques." />
            <Carte titre="Scénarios de travaux" texte="Ordre des postes et options, sans substitution aux devis artisans." />
            <Carte titre="Aides et reste à charge" texte="Estimations indicatives, à valider selon revenus, éligibilité, ANAH et CEE." />
            <Carte titre="Rapport PDF" texte="Document de synthèse pour le client et le MAR, distinct du devis contractuel." />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            Chaque information est distinguée selon sa nature : donnée extraite, hypothèse,
            estimation ou devis réel. Aucun statut n’est inventé.
          </p>
        </section>

        <section id="piliers" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Les 5 piliers ENERGIA</h2>
          <ol className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {["Enveloppe", "Chauffage", "Ventilation", "Solaire", "Pilotage"].map((pilier, index) => (
              <li
                key={pilier}
                className="rounded-2xl border border-[#c9a227]/40 bg-white px-4 py-6 text-center shadow-sm"
              >
                <span className="text-xs font-semibold uppercase tracking-widest text-[#c9a227]">
                  {index + 1}
                </span>
                <p className="mt-2 font-semibold text-[#14532d]">{pilier}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="photovoltaique" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Photovoltaïque</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600">
            Logique d’installation, de 500 Wc à 100 kWc. Aucun tarif réglementaire ni aide
            n’est présenté ici comme définitif.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[
              "Puissance 500 Wc à 100 kWc",
              "Panneaux",
              "Micro-onduleurs ou onduleur centralisé",
              "Batterie",
              "Coffret de protection",
              "Rails et fixations",
              "Câbles",
              "Raccordement",
              "Monitoring",
              "Maintenance",
            ].map((item) => (
              <li key={item} className="rounded-xl bg-white px-4 py-3 text-sm ring-1 ring-emerald-900/10">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section id="parcours" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Parcours client</h2>
          <ol className="mt-5 space-y-3">
            {[
              "Premier contact",
              "Analyse du logement",
              "Audit",
              "Définition du scénario",
              "Consultation des artisans",
              "Devis réels",
              "Étude des aides et du financement",
              "Validation",
              "Travaux",
              "Suivi et réception",
            ].map((etape, index) => (
              <li key={etape} className="flex gap-4 rounded-2xl bg-white px-4 py-3 ring-1 ring-emerald-900/10">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#14532d] text-sm font-semibold text-[#e8d48b]">
                  {index + 1}
                </span>
                <span className="self-center text-sm font-medium text-[#0b3d2e]">{etape}</span>
              </li>
            ))}
          </ol>
        </section>

        <section id="gouvernance" className="mt-14 scroll-mt-28">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Gouvernance et indépendance</h2>
          <div className="mt-5 space-y-3 rounded-2xl border border-emerald-900/10 bg-white p-5 text-sm leading-relaxed text-slate-700">
            <p>
              L’association Habitat Digne 71 doit rester indépendante d’ENERGIA.
            </p>
            <p>
              Les décisions de l’association ne doivent pas être prises par une personne en
              conflit d’intérêts.
            </p>
            <p>
              ENERGIA peut apporter une expertise technique ou une licence de marque selon un
              cadre écrit.
            </p>
            <p>
              Les rôles, conventions et éventuelles prestations doivent être validés
              séparément.
            </p>
          </div>
        </section>

        <section id="prudence" className="mt-14 scroll-mt-28 pb-8">
          <h2 className="text-2xl font-semibold text-[#0b3d2e]">Mentions de prudence</h2>
          <ul className="mt-5 space-y-2 text-sm leading-relaxed text-slate-700">
            <li className="rounded-xl bg-white px-4 py-3 ring-1 ring-emerald-900/10">
              Les aides sont indicatives.
            </li>
            <li className="rounded-xl bg-white px-4 py-3 ring-1 ring-emerald-900/10">
              Les financements dépendent de l’étude et de l’acceptation du dossier.
            </li>
            <li className="rounded-xl bg-white px-4 py-3 ring-1 ring-emerald-900/10">
              Les prix sont à confirmer par les devis réels.
            </li>
            <li className="rounded-xl bg-white px-4 py-3 ring-1 ring-emerald-900/10">
              Les performances doivent être validées par une étude technique.
            </li>
            <li className="rounded-xl bg-white px-4 py-3 ring-1 ring-emerald-900/10">
              La présentation ne constitue pas un devis contractuel.
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            <NavLink href={LIENS.crm} primaire>
              Retour au CRM
            </NavLink>
            <NavLink href={LIENS.kitDamien}>Ouvrir le Kit Damien</NavLink>
            <NavLink href={LIENS.controleInterne}>Ouvrir le Centre de Contrôle Interne</NavLink>
            <NavLink href={LIENS.dossierClient}>Ouvrir un dossier client</NavLink>
          </div>
        </section>
      </main>
    </div>
  );
}
