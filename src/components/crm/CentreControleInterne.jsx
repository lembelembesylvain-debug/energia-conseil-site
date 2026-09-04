import { useEffect, useState } from "react";
import EnergiaCoPilot from "../EnergiaCoPilot";
import { CHAMPS_INTERDITS_HORS_ADMIN } from "../../lib/crm/roles";
import { DOSSIERS_TEST_LOCAUX, calculerMarges, euro } from "../../lib/crm/mockData";
import { PEREIRA_AUDIT_ID } from "../../data/pereiraAuditExtract";
import RepartitionMarges from "./RepartitionMarges";

const LIENS_INTERNES = [
  {
    href: "/test-dashboard-crm#catalogue",
    label: "Catalogue métiers",
    hint: "Catégories, sous-catégories, tarifs et marges — sans modifier les projets",
  },
  {
    href: "/chiffrage",
    label: "Module chiffrage d’ampleur",
    hint: "Page existante — coûts internes",
  },
  {
    href: "/admin",
    label: "Administration audits",
    hint: "Page existante — authentification admin",
  },
  {
    href: "/nouvel-audit",
    label: "Nouvel audit",
    hint: "Page existante — création de dossier",
  },
];

export default function CentreControleInterne() {
  const [Estimation, setEstimation] = useState(null);
  const [erreurEstimation, setErreurEstimation] = useState(null);

  useEffect(() => {
    let actif = true;
    import("../ProjectEstimation")
      .then((mod) => {
        if (actif) setEstimation(() => mod.default);
      })
      .catch((err) => {
        if (actif) {
          setErreurEstimation(
            err?.message ??
              "Module ProjectEstimation indisponible (configuration Supabase manquante).",
          );
        }
      });
    return () => {
      actif = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-red-500/30 bg-red-950/40 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">
          Accès administrateur propriétaire uniquement
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Centre de Contrôle Interne</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-red-100/90">
          Module distinct du tableau de bord commercial. Il peut afficher des données sensibles.
          Le rôle Commercial et la présentation client n’y ont pas accès.
        </p>
        <p className="mt-3 text-xs text-slate-400">
          Champs masqués hors de cet espace : {CHAMPS_INTERDITS_HORS_ADMIN.join(" · ")}.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {LIENS_INTERNES.map((lien) => (
          <a
            key={lien.href}
            href={lien.href}
            className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition hover:border-emerald-500/40"
          >
            <p className="font-medium text-white">{lien.label}</p>
            <p className="mt-1 text-xs text-slate-400">{lien.hint}</p>
            <p className="mt-2 font-mono text-xs text-sky-300">{lien.href}</p>
          </a>
        ))}
      </section>

      {DOSSIERS_TEST_LOCAUX.map((dossier) => {
        const marges = calculerMarges(dossier);
        const travaux = [...(dossier.travaux ?? [])].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
        return (
          <section
            key={dossier.id}
            className="rounded-2xl border border-red-500/20 bg-slate-900/80 p-4 sm:p-5"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-300">
              Jeu de test local — hors production
            </p>
            <h3 className="mt-1 text-lg font-semibold text-white">{dossier.nom}</h3>
            <p className="mt-1 text-sm text-slate-400">{dossier.typeProjet}</p>
            <p className="mt-1 font-mono text-xs text-sky-300">{dossier.auditId}</p>
            <p className="mt-1 text-xs text-slate-500">
              {dossier.statut} · Apporteur : {dossier.apporteur.nom}
            </p>
            {dossier.href ? (
              <a
                href={dossier.href}
                className="mt-3 inline-flex rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200"
              >
                Ouvrir le dossier
              </a>
            ) : null}

            <div className="mt-4 overflow-x-auto">
              {travaux.length > 0 ? (
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-3 py-2 font-medium">Poste</th>
                      <th className="px-3 py-2 font-medium text-right">HT</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {travaux.map((ligne) => (
                      <tr key={ligne.id}>
                        <td className="px-3 py-2 text-slate-200">{ligne.label}</td>
                        <td className="px-3 py-2 text-right text-white">{euro(ligne.ht)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-700 px-3 py-4 text-sm text-slate-400">
                  Aucune prestation enregistrée. CA prévisionnel : {euro(marges.totalTtc)}.
                </p>
              )}
            </div>

            {travaux.length > 0 ? (
              <div className="mt-5">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
                  Répartition des marges
                </h4>
                <RepartitionMarges marges={marges} apporteurNom={dossier.apporteur.nom} />
              </div>
            ) : null}
          </section>
        );
      })}

      <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
          Estimation interne (ProjectEstimation)
        </h3>
        <p className="mt-2 mb-4 text-xs text-slate-400">
          Module existant conservé. Dossier Pereira : {PEREIRA_AUDIT_ID}. L’enregistrement de
          l’estimation est actif. Les coûts fournisseurs, marges et commission Damien restent
          ici, jamais sur le CRM commercial. Le dossier Marjollet s’ouvre depuis Projets
          (/test-maison-marjollet), sans prestation préremplie.
        </p>
        {erreurEstimation ? (
          <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
            {erreurEstimation} Le composant n’a pas été supprimé : il reste sur
            /test-maison-pereira et /audit/:id.
          </p>
        ) : Estimation ? (
          <Estimation auditId={PEREIRA_AUDIT_ID} voirCoutsInternes />
        ) : (
          <p className="text-sm text-slate-400">Chargement de ProjectEstimation…</p>
        )}
      </section>

      <EnergiaCoPilot syntheseAudit="Centre de Contrôle Interne ENERGIA — usage administrateur uniquement. Ne pas exposer marges, coûts d’achat, commission Damien, coût Clyve ni prix plancher hors de cet espace." />
    </div>
  );
}
