import { useState, type FormEvent } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ArrowRight,
  FileCheck,
  Check,
  Menu,
  X,
} from "lucide-react";
import LogoEnergia from "../crm/LogoEnergia";

const NAV = [
  { href: "/#", label: "Accueil" },
  { href: "/#comment-ca-marche", label: "Comment ça marche" },
  { href: "/#aides-2026", label: "Aides 2026" },
  { href: "/#resultats", label: "Résultats" },
  { href: "/maintenance", label: "Entretien & SAV" },
  { href: "/#contact", label: "Nous contacter" },
];

const FORFAITS = [
  {
    nom: "Pack Sérénité Granulés",
    accroche: "Ramonage annuel poêle et chaudière bois",
    prix: "15,90 €",
    valeur: "Pack Sérénité Granulés (15.90€/m)",
    cta: "Souscrire au Pack Granulés",
    points: [
      "1 ramonage certifié annuel obligatoire",
      "Nettoyage creuset et extracteur de fumées",
      "Certificat de ramonage pour l'assurance",
      "Contrôle bougie d'allumage et joints",
    ],
    misEnAvant: false,
  },
  {
    nom: "Pack Sérénité PAC",
    accroche: "Entretien réglementaire pompe à chaleur",
    prix: "19,90 €",
    valeur: "Pack Sérénité PAC (19.90€/m)",
    cta: "Souscrire au Pack PAC",
    points: [
      "Visite biennale obligatoire Décret 2020-912",
      "Contrôle d'étanchéité et Cerfa 15497 F-Gaz",
      "Dépannage prioritaire sous 48 h",
      "Vérification pression et vase d'expansion",
    ],
    misEnAvant: false,
  },
  {
    nom: "Pack Global Autonomie",
    accroche: "PAC, solaire, batterie et chauffage",
    prix: "29,90 €",
    valeur: "Pack Global Autonomie (29.90€/m)",
    cta: "Souscrire au Pack Autonomie",
    points: [
      "Entretien intégral PAC et circuit hydraulique",
      "Contrôle électrique panneaux et onduleur",
      "Diagnostic batterie solaire et Tesla Powerwall",
      "Ramonage annuel poêle inclus si équipé",
      "Assistance prioritaire 7j/7",
    ],
    misEnAvant: true,
  },
] as const;

export function MaintenanceLanding() {
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    ville: "",
    codePostal: "",
    formule: "Pack Sérénité PAC (19.90€/m)",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const choisirFormule = (valeur: string) => {
    setFormData((actuel) => ({ ...actuel, formule: valeur }));
  };

  return (
    <div className="min-h-screen bg-[#f6faf7] text-slate-800">
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <a href="/" className="shrink-0" aria-label="ENERGIA CONSEIL IA® — Accueil">
            <LogoEnergia className="h-12 w-auto object-contain sm:h-14" width={168} height={56} />
          </a>

          <nav className="hidden items-center gap-5 text-sm font-medium text-slate-600 lg:flex" aria-label="Navigation principale">
            {NAV.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={
                  item.href === "/maintenance"
                    ? "font-semibold text-emerald-700"
                    : "transition hover:text-emerald-700"
                }
                aria-current={item.href === "/maintenance" ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <a
            href="#tarifs"
            className="hidden rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 sm:inline-flex"
          >
            Voir les forfaits
          </a>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-emerald-900/15 text-emerald-900 lg:hidden"
            aria-expanded={menuOuvert}
            aria-controls="menu-maintenance"
            onClick={() => setMenuOuvert((ouvert) => !ouvert)}
          >
            {menuOuvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Menu</span>
          </button>
        </div>

        {menuOuvert ? (
          <nav id="menu-maintenance" className="border-t border-emerald-900/10 bg-white px-4 py-3 lg:hidden" aria-label="Navigation principale">
            <ul className="grid gap-1">
              {NAV.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="block rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-900 hover:bg-emerald-50"
                    onClick={() => setMenuOuvert(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </header>

      <section className="border-b border-emerald-900/10 bg-white px-4 pb-16 pt-12 md:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              Décret 2020-912
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="h-3.5 w-3.5" />
              Calipso Assurances n° LUNPIB2604975
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0b3d2e] md:text-5xl">
            Entretien, SAV et conformité
            <span className="mt-2 block text-emerald-700">PAC, granulés et solaire</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Sécurisez la garantie constructeur et la couverture d&apos;assurance. Des techniciens
            RGE (QualiPAC, Qualibois, QualiPV) interviennent avec attestation d&apos;étanchéité
            Cerfa dématérialisée.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#tarifs"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Choisir un forfait
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#cee"
              className="rounded-full border border-emerald-900/15 bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:border-emerald-600"
            >
              Primes CEE associées
            </a>
          </div>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
          <article className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <div className="mb-3 w-fit rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-[#0b3d2e]">Obligation biennale PAC</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Le décret n° 2020-912 impose un contrôle d&apos;étanchéité et d&apos;efficacité tous
              les 2 ans pour les PAC de 4 à 70 kW.
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <div className="mb-3 w-fit rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <Flame className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-[#0b3d2e]">Ramonage annuel bois</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Entretien et ramonage obligatoires une fois par an pour les poêles à granulés et
              inserts, avec attestation pour l&apos;assurance habitation.
            </p>
          </article>
          <article className="rounded-2xl border border-emerald-900/10 bg-white p-5 shadow-sm">
            <div className="mb-3 w-fit rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <FileCheck className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-[#0b3d2e]">Cerfa 15497 dématérialisé</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Attestation F-Gaz signée par l&apos;opérateur agréé, archivée dans l&apos;espace
              ENERGIA CONSEIL IA®.
            </p>
          </article>
        </div>
      </section>

      <section id="cee" className="scroll-mt-24 border-y border-emerald-900/10 bg-white px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-[#0b3d2e] md:text-3xl">Primes CEE associées</h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
              Aides financières 2026 (estimation à titre indicatif). Aides à valider selon
              éligibilité en vigueur. Montants définitifs après instruction CEE.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["BAR-TH-173", "Thermostats connectés", "Régulation pièce par pièce. Prise en charge indicative jusqu'à 80 % par les CEE."],
              ["BAR-SE-105", "Désembouage réseau", "Nettoyage du circuit radiateurs ou plancher chauffant et injection d'inhibiteur."],
              ["BAR-TH-148", "Chauffe-eau thermodynamique", "Remplacement d'un ballon électrique pour réduire la consommation d'eau chaude."],
              ["BAT-TH-116", "Tertiaire et GTB", "Mise en conformité Décret BACS pour bâtiments tertiaires et copropriétés."],
            ].map(([code, titre, texte]) => (
              <article key={code} className="rounded-2xl border border-emerald-900/10 bg-[#f6faf7] p-5">
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  {code}
                </span>
                <h3 className="mt-3 font-semibold text-[#0b3d2e]">{titre}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{texte}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="tarifs" className="scroll-mt-24 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-[#0b3d2e] md:text-3xl">Forfaits ENERGIA Sérénité</h2>
            <p className="mt-3 text-sm text-slate-600">Abonnement mensuel TTC, sans engagement, technicien dédié.</p>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {FORFAITS.map((forfait) => (
              <article
                key={forfait.nom}
                className={
                  forfait.misEnAvant
                    ? "relative flex flex-col rounded-2xl border-2 border-emerald-600 bg-white p-6 shadow-md"
                    : "flex flex-col rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm"
                }
              >
                {forfait.misEnAvant ? (
                  <span className="absolute -top-3 right-4 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Le plus complet
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold text-[#0b3d2e]">{forfait.nom}</h3>
                <p className="mt-1 text-sm text-slate-600">{forfait.accroche}</p>
                <p className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight text-emerald-700">{forfait.prix}</span>
                  <span className="text-sm text-slate-500">TTC / mois</span>
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-slate-700">
                  {forfait.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="#formulaire"
                  onClick={() => choisirFormule(forfait.valeur)}
                  className={
                    forfait.misEnAvant
                      ? "mt-8 block rounded-full bg-emerald-600 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700"
                      : "mt-8 block rounded-full border border-emerald-700 py-2.5 text-center text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
                  }
                >
                  {forfait.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="formulaire" className="scroll-mt-24 px-4 pb-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-emerald-900/10 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-semibold text-[#0b3d2e]">Réserver une visite d&apos;entretien</h2>
            <p className="mt-2 text-sm text-slate-600">Un technicien agréé rappelle sous 2 heures ouvrées.</p>
          </div>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 w-fit rounded-full bg-emerald-50 p-3 text-emerald-700">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-[#0b3d2e]">Demande confirmée</h3>
              <p className="mt-2 text-sm text-slate-600">
                Le dossier est enregistré. Le technicien partenaire vous contacte pour caler le créneau.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sav-nom">
                  Nom et prénom
                </label>
                <input
                  id="sav-nom"
                  required
                  placeholder="Jean Dupont"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sav-tel">
                    Téléphone
                  </label>
                  <input
                    id="sav-tel"
                    required
                    placeholder="06 00 00 00 00"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sav-cp">
                    Code postal
                  </label>
                  <input
                    id="sav-cp"
                    required
                    placeholder="71100"
                    value={formData.codePostal}
                    onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sav-ville">
                  Ville
                </label>
                <input
                  id="sav-ville"
                  placeholder="Chalon-sur-Saône"
                  value={formData.ville}
                  onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="sav-formule">
                  Formule souhaitée
                </label>
                <select
                  id="sav-formule"
                  value={formData.formule}
                  onChange={(e) => setFormData({ ...formData, formule: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="Pack Sérénité Granulés (15.90€/m)">Pack Sérénité Granulés — 15,90 € TTC/mois</option>
                  <option value="Pack Sérénité PAC (19.90€/m)">Pack Sérénité PAC — 19,90 € TTC/mois</option>
                  <option value="Pack Global Autonomie (29.90€/m)">Pack Global Autonomie — 29,90 € TTC/mois</option>
                  <option value="Visite ponctuelle unique">Visite ponctuelle sans abonnement — 160 € TTC</option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-full bg-emerald-600 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Valider la demande d&apos;entretien
              </button>
            </form>
          )}
        </div>
      </section>

      <footer className="border-t border-emerald-900/10 bg-white px-4 py-8 text-sm text-slate-600">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>ENERGIA CONSEIL IA® — 16 Rue Cuvier, 69006 Lyon — 06 10 59 68 98</p>
          <p>Décennale Calipso Assurances n° LUNPIB2604975 · Marque INPI n° 5213845</p>
        </div>
      </footer>
    </div>
  );
}

export default MaintenanceLanding;
