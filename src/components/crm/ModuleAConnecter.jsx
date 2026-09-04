export default function ModuleAConnecter({ titre, description }) {
  return (
    <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">Module à connecter</p>
      <h2 className="mt-2 text-xl font-semibold text-white">{titre}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-amber-50/90">
        {description}
      </p>
      <p className="mt-4 text-xs text-slate-400">
        Aucun écran fictif n’a été créé. Aucune donnée client n’a été inventée. La connexion à une
        table ou un service existant devra être validée avant toute évolution Supabase.
      </p>
    </section>
  );
}
