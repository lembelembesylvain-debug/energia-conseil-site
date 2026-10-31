import { useState, type FormEvent } from "react";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ArrowRight,
  FileCheck,
  Check,
} from "lucide-react";

export function MaintenanceLanding() {
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden border-b border-slate-800 px-4 pb-16 pt-20 md:px-8">
        <div className="relative z-10 mx-auto max-w-6xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-400">
            <ShieldCheck className="h-4 w-4" /> Entretien Réglementaire &amp; Conformité Décret
            2020-912
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
            Maintenance, SAV &amp; Sérénité Énergétique
            <br />
            <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
              pour votre Pompe à Chaleur, Granulés &amp; Solaire
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg text-slate-400">
            Sécurisez vos garanties constructeur et votre couverture d&apos;assurance. Nos
            techniciens RGE certifiés (QualiPAC, Qualibois, QualiPV) interviennent chez vous avec
            attestation d&apos;étanchéité officielle Cerfa dématérialisée.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href="#tarifs"
              className="flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-600"
            >
              Choisir mon Pack Sérénité
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#cee"
              className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-800"
            >
              Découvrir les Primes CEE associées
            </a>
          </div>
        </div>
      </section>

      {/* 2. LE RAPPEL DE LA LOI */}
      <section className="border-b border-slate-800 bg-slate-900/40 px-4 py-12">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-3 w-fit rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5">
              <AlertTriangle className="h-5 w-5 text-rose-400" />
            </div>
            <h4 className="text-base font-bold text-white">Obligation Biennale PAC</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Le Décret n° 2020-912 impose un contrôle d&apos;étanchéité et d&apos;efficacité tous
              les 2 ans pour les PAC 4 à 70 kW sous peine de refus de garantie.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-3 w-fit rounded-xl border border-amber-500/20 bg-amber-500/10 p-2.5">
              <Flame className="h-5 w-5 text-amber-400" />
            </div>
            <h4 className="text-base font-bold text-white">Ramonage Annuel Bois</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Entretien et ramonage obligatoires 1 fois/an pour les poêles à granulés et inserts,
              indispensables pour votre attestation d&apos;assurance habitation.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <div className="mb-3 w-fit rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5">
              <FileCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <h4 className="text-base font-bold text-white">Cerfa 15497 Dématérialisé</h4>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Délivrance instantanée de l&apos;attestation F-Gaz signée par l&apos;opérateur agréé,
              archivée à vie dans votre espace sécurisé ENERGIA.
            </p>
          </div>
        </div>
      </section>

      {/* 3. LES PRIMES CEE ASSOCIÉES */}
      <section id="cee" className="border-b border-slate-800 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-white md:text-4xl">
              Optimisation &amp; Primes CEE Disponibles
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Profitez de votre entretien pour financer les travaux d&apos;amélioration énergétique
              grâce aux fiches officielles CEE.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-amber-500/40">
              <span className="rounded bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-400">
                BAR-TH-173
              </span>
              <h4 className="mt-3 font-bold text-white">Thermostats Connectés</h4>
              <p className="mt-1 text-xs text-slate-400">
                Régulation pièce par pièce obligatoire dès 2027. Prise en charge jusqu&apos;à 80%
                par les CEE.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-blue-500/40">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                BAR-SE-105
              </span>
              <h4 className="mt-3 font-bold text-white">Désembouage Réseau</h4>
              <p className="mt-1 text-xs text-slate-400">
                Nettoyage hydrodynamique du circuit radiateurs / plancher chauffant et injection de
                produit inhibiteur.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-emerald-500/40">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                BAR-TH-148
              </span>
              <h4 className="mt-3 font-bold text-white">Chauffe-Eau Thermo</h4>
              <p className="mt-1 text-xs text-slate-400">
                Économisez jusqu&apos;à 70% d&apos;électricité sur l&apos;eau chaude en remplaçant
                votre ancien ballon électrique.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-purple-500/40">
              <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-purple-400">
                BAT-TH-116 &amp; BACS
              </span>
              <h4 className="mt-3 font-bold text-white">Tertiaire &amp; GTB</h4>
              <p className="mt-1 text-xs text-slate-400">
                Pour bâtiments tertiaires et copropriétés : mise en conformité Décret BACS financée
                jusqu&apos;à 70%.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. LES 3 FORMULES */}
      <section id="tarifs" className="border-b border-slate-800 px-4 py-16 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-white md:text-4xl">
              Les Formules ENERGIA Sérénité
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Un abonnement mensuel transparent sans engagement avec technicien dédié.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-white">Pack Sérénité PAC</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Entretien réglementaire pompe à chaleur
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">19,90 €</span>
                  <span className="text-xs text-slate-400">TTC / mois</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Visite biennale obligatoire
                    Décret 2020-912
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Contrôle d&apos;étanchéité &amp;
                    Cerfa 15497 F-Gaz
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Dépannage prioritaire sous 48h
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Vérification pression &amp; vase
                    d&apos;expansion
                  </li>
                </ul>
              </div>
              <a
                href="#formulaire"
                className="mt-8 block rounded-xl bg-slate-800 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Souscrire au Pack PAC
              </a>
            </div>

            <div className="relative flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:border-slate-700">
              <div>
                <h3 className="text-lg font-bold text-white">Pack Sérénité Granulés</h3>
                <p className="mt-1 text-xs text-slate-400">
                  Ramonage annuel poêle &amp; chaudière bois
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">15,90 €</span>
                  <span className="text-xs text-slate-400">TTC / mois</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> 1 ramonage certifié annuel
                    obligatoire
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Nettoyage creuset &amp;
                    extracteur fumées
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Certificat de ramonage pour
                    assurance
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400" /> Contrôle bougie d&apos;allumage
                    &amp; joints
                  </li>
                </ul>
              </div>
              <a
                href="#formulaire"
                className="mt-8 block rounded-xl bg-slate-800 py-2.5 text-center text-xs font-semibold text-white transition hover:bg-slate-700"
              >
                Souscrire au Pack Granulés
              </a>
            </div>

            <div className="relative flex flex-col justify-between rounded-2xl border-2 border-amber-500/60 bg-gradient-to-b from-slate-900 to-amber-950/20 p-6 shadow-xl shadow-amber-500/10">
              <div className="absolute -top-3 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-black uppercase text-slate-950">
                Le plus complet
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pack Global Autonomie</h3>
                <p className="mt-1 text-xs text-amber-300">PAC + Solaire + Tesla + Chauffage</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-amber-400">29,90 €</span>
                  <span className="text-xs text-slate-400">TTC / mois</span>
                </div>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" /> Entretien intégral PAC + Circuit
                    hydraulique
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" /> Contrôle électrique panneaux &amp;
                    onduleur
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" /> Diagnostic batterie solaire &amp;
                    Tesla Powerwall
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" /> Ramonage annuel poêle inclus si
                    équipé
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-amber-400" /> Assistance VIP 7j/7 &amp;
                    déplacement prioritaire
                  </li>
                </ul>
              </div>
              <a
                href="#formulaire"
                className="mt-8 block rounded-xl bg-amber-500 py-2.5 text-center text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-600"
              >
                Souscrire au Pack Autonomie
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FORMULAIRE */}
      <section id="formulaire" className="px-4 py-16">
        <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-white">Réserver ma visite d&apos;entretien</h3>
            <p className="mt-1 text-xs text-slate-400">
              Un technicien agréé local vous rappelle sous 2 heures ouvrées.
            </p>
          </div>

          {submitted ? (
            <div className="py-8 text-center">
              <div className="mx-auto mb-3 w-fit rounded-full bg-emerald-500/20 p-3 text-emerald-400">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h4 className="text-lg font-bold text-white">Demande confirmée !</h4>
              <p className="mt-2 text-xs text-slate-300">
                Votre dossier a été enregistré dans notre système. Notre
                frigoriste/technicien partenaire vous contacte pour caler votre créneau.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Nom &amp; Prénom
                </label>
                <input
                  required
                  placeholder="Jean Dupont"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Téléphone
                  </label>
                  <input
                    required
                    placeholder="06 00 00 00 00"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">
                    Code Postal
                  </label>
                  <input
                    required
                    placeholder="71100"
                    value={formData.codePostal}
                    onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400">
                  Formule souhaitée
                </label>
                <select
                  value={formData.formule}
                  onChange={(e) => setFormData({ ...formData, formule: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm font-semibold text-amber-400"
                >
                  <option value="Pack Sérénité PAC (19.90€/m)">
                    Pack Sérénité PAC (19,90 € TTC/mois)
                  </option>
                  <option value="Pack Sérénité Granulés (15.90€/m)">
                    Pack Sérénité Granulés (15,90 € TTC/mois)
                  </option>
                  <option value="Pack Global Autonomie (29.90€/m)">
                    Pack Global Autonomie (29,90 € TTC/mois)
                  </option>
                  <option value="Visite ponctuelle unique">
                    Visite ponctuelle sans abonnement (160 € TTC)
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-600"
              >
                Valider ma demande d&apos;entretien
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default MaintenanceLanding;
