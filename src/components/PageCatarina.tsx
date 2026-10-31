import { useState, type FormEvent } from "react";

const HEATING_OPTIONS = ["Gaz", "Fioul", "Électricité", "Bois / granulés", "Pompe à chaleur", "Autre / je ne sais pas"];

type FormValues = {
  nom: string;
  prenom: string;
  telephone: string;
  adresse: string;
  chauffage: string;
  dateSouhaitee: string;
  consentement: boolean;
};

const INITIAL_FORM: FormValues = {
  nom: "",
  prenom: "",
  telephone: "",
  adresse: "",
  chauffage: "",
  dateSouhaitee: "",
  consentement: false,
};

function dateLocaleAujourdHui(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

export default function PageCatarina() {
  const [form, setForm] = useState<FormValues>(INITIAL_FORM);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [envoye, setEnvoye] = useState(false);

  const modifier = <K extends keyof FormValues>(champ: K, valeur: FormValues[K]) => {
    setForm((actuel) => ({ ...actuel, [champ]: valeur }));
  };

  const soumettre = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErreur("");
    setEnvoi(true);

    try {
      const response = await fetch("/api/demandes-visite-catarina", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: form.nom,
          prenom: form.prenom,
          telephone: form.telephone,
          adresse_maison: form.adresse,
          chauffage_actuel: form.chauffage,
          date_souhaitee: form.dateSouhaitee,
          consentement_contact: form.consentement,
          origine: "Origine : Flyer Catarina",
        }),
      });
      const result = (await response.json()) as { ok?: boolean; error?: string };
      if (!response.ok || !result.ok) {
        throw new Error(result.error || "La demande n’a pas pu être enregistrée. Réessayez dans un instant.");
      }
      setEnvoye(true);
      setForm(INITIAL_FORM);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setEnvoi(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#071321] px-4 py-8 text-[#0B192C] sm:py-12">
      <div className="mx-auto max-w-xl overflow-hidden rounded-[28px] border border-[#C5A880]/60 bg-[#F7F5F0] shadow-[0_28px_80px_rgba(0,0,0,.4)]">
        <header className="relative overflow-hidden bg-[#0B192C] px-6 pb-7 pt-6 text-white sm:px-9">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#C5A880]/30 via-[#C5A880] to-[#C5A880]/30" />
          <div className="flex items-center gap-3">
            <div className="flex h-[50px] w-[100px] shrink-0 items-center justify-center border border-[#C5A880]/70 px-2 py-1">
              <img src="/assets/energia-logo-arbres.png" alt="Logo officiel Energia Conseil IA" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold tracking-wide">ENERGIA CONSEIL IA®</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[.2em] text-[#C5A880]">Rénovation énergétique</p>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-[88px] w-[88px] shrink-0 overflow-hidden rounded-full border-2 border-[#C5A880] p-1">
              <img src="/assets/catarina-martins.png" alt="Catarina Martins" className="h-full w-full rounded-full object-cover object-top" />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[.22em] text-[#C5A880]">Votre coordinatrice de travaux</p>
              <h1 className="mt-1 font-serif text-2xl font-semibold">Catarina MARTINS</h1>
              <p className="mt-1 text-xs text-slate-300">Visite technique &amp; étude de votre projet</p>
            </div>
          </div>
        </header>

        <section className="px-5 py-6 sm:px-9 sm:py-8">
          {envoye ? (
            <div role="status" className="border border-emerald-700/20 bg-emerald-50 p-5 text-center">
              <p className="text-2xl text-emerald-800" aria-hidden="true">✓</p>
              <h2 className="mt-2 font-serif text-2xl font-semibold text-[#0B192C]">Votre demande est enregistrée</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Catarina vous recontactera pour confirmer le créneau souhaité et préparer la visite technique.</p>
              <p className="mt-4 border-l-2 border-[#C5A880] bg-white px-3 py-2 text-left text-xs leading-relaxed text-slate-700">Étude d’ingénierie préalable : 390 € TTC, intégralement déduits du marché de travaux dès sa signature.</p>
            </div>
          ) : (
            <>
              <p className="text-[9px] font-bold uppercase tracking-[.22em] text-[#8A704C]">Rendez-vous privé · sans engagement sur les travaux</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight">Organisons votre visite technique.</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">Indiquez vos coordonnées et le créneau qui vous conviendrait. Nous vous recontactons pour confirmer le rendez-vous.</p>

              <form className="mt-6 space-y-4" onSubmit={soumettre}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-xs font-semibold text-slate-700">Prénom
                    <input className="mt-1.5 block min-h-12 w-full border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25" autoComplete="given-name" required minLength={2} value={form.prenom} onChange={(event) => modifier("prenom", event.target.value)} />
                  </label>
                  <label className="block text-xs font-semibold text-slate-700">Nom
                    <input className="mt-1.5 block min-h-12 w-full border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25" autoComplete="family-name" required minLength={2} value={form.nom} onChange={(event) => modifier("nom", event.target.value)} />
                  </label>
                </div>
                <label className="block text-xs font-semibold text-slate-700">Téléphone
                  <input className="mt-1.5 block min-h-12 w-full border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25" type="tel" autoComplete="tel" inputMode="tel" required minLength={10} value={form.telephone} onChange={(event) => modifier("telephone", event.target.value)} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">Adresse de la maison
                  <input className="mt-1.5 block min-h-12 w-full border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25" autoComplete="street-address" required minLength={5} value={form.adresse} onChange={(event) => modifier("adresse", event.target.value)} />
                </label>
                <label className="block text-xs font-semibold text-slate-700">Type de chauffage actuel
                  <select className="mt-1.5 block min-h-12 w-full border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25" required value={form.chauffage} onChange={(event) => modifier("chauffage", event.target.value)}>
                    <option value="">Sélectionner</option>
                    {HEATING_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="block text-xs font-semibold text-slate-700">Date souhaitée
                  <input className="mt-1.5 block min-h-12 w-full border border-slate-300 bg-white px-3 text-base outline-none transition focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/25" type="date" min={dateLocaleAujourdHui()} required value={form.dateSouhaitee} onChange={(event) => modifier("dateSouhaitee", event.target.value)} />
                </label>

                <label className="flex items-start gap-3 border border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-600">
                  <input className="mt-0.5 h-4 w-4 accent-[#0D5B3F]" type="checkbox" required checked={form.consentement} onChange={(event) => modifier("consentement", event.target.checked)} />
                  <span>J’accepte que mes informations soient utilisées pour organiser cette visite et être recontacté(e) par Catarina MARTINS et ENERGIA CONSEIL IA®. Elles ne seront pas publiées. <span className="text-[#8A704C]">(obligatoire)</span></span>
                </label>

                {erreur ? <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{erreur}</p> : null}
                <button className="w-full border border-[#E1C89E] bg-[#C5A880] px-4 py-4 text-sm font-bold leading-snug text-[#0B192C] shadow-md transition hover:bg-[#D3B991] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={envoi}>
                  {envoi ? "Enregistrement de votre demande…" : "Valider ma demande de visite technique (390 € déduits des travaux)"}
                </button>
              </form>
              <p className="mt-4 text-[10px] leading-relaxed text-slate-500">La visite est confirmée après échange avec Catarina. L’étude d’ingénierie préalable est facturée 390 € TTC et déduite du marché de travaux dès signature ; cette demande ne constitue pas une commande de travaux.</p>
            </>
          )}
        </section>
        <footer className="border-t border-[#C5A880]/50 bg-[#0B192C] px-5 py-4 text-center text-[10px] leading-relaxed text-slate-300 sm:px-9">
          <p className="font-semibold text-white">Catarina MARTINS · Coordinatrice de travaux</p>
          <p className="mt-1">Avec l’expertise technique d’ENERGIA CONSEIL IA® · 06 10 59 68 98</p>
          <p className="mt-2 text-slate-400">Données utilisées uniquement pour traiter votre demande. Contact : contact@energia-conseil-ia.com</p>
        </footer>
      </div>
    </main>
  );
}
