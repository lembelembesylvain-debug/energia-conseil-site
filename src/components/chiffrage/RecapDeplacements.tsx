import type { ResultatDeplacements } from "../../lib/chiffrage";
import {
  LABEL_SOURCE_DISTANCE,
  LIBELLE_DEPLACEMENTS_ENERGIA,
  formatEuro,
  formatKm,
} from "../../lib/chiffrage";

type Props = {
  deplacements: ResultatDeplacements;
  adresseChantier: string;
};

export default function RecapDeplacements({ deplacements, adresseChantier }: Props) {
  const chantier = adresseChantier.trim() || "Adresse du chantier non renseignée";

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a3c5e]">
          A. Déplacements des entreprises intervenantes
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Trajet depuis l’adresse de chaque artisan jusqu’au chantier. Jamais depuis la base
          ENERGIA.
        </p>
        {deplacements.artisans.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">Aucune entreprise saisie.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {deplacements.artisans.map((artisan) => (
              <li key={artisan.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
                <p className="font-semibold text-slate-900">
                  {artisan.nomArtisan.trim() || "Entreprise non nommée"}
                </p>
                <dl className="mt-2 grid gap-1 text-xs text-slate-700 sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-500">Adresse de départ</dt>
                    <dd>{artisan.adresseDepart.trim() || "Non renseignée"}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Adresse du chantier</dt>
                    <dd>{chantier}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Kilomètres aller-retour</dt>
                    <dd>
                      {formatKm(artisan.distanceAllerRetourKm)}{" "}
                      <span className="text-amber-800">
                        ({LABEL_SOURCE_DISTANCE[artisan.sourceDistance] ?? artisan.sourceDistance})
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Nombre de déplacements</dt>
                    <dd>{artisan.nombreDeplacements}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Frais estimés HT</dt>
                    <dd className="font-semibold">{formatEuro(artisan.fraisEstimesHt)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Comptabilisation</dt>
                    <dd className={artisan.deplacementDejaInclusDansDevis ? "text-teal-800" : "text-orange-800"}>
                      {artisan.statutFacturation === "inclus_dans_devis"
                        ? "Inclus dans le devis"
                        : "Ajouté séparément"}
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm">
          Total artisans ajouté au coût interne :{" "}
          <strong>{formatEuro(deplacements.totalArtisansAjoutesHt)}</strong>
          <span className="text-xs text-slate-500">
            {" "}
            (estimé {formatEuro(deplacements.totalArtisansEstimesHt)}, hors lignes déjà
            incluses)
          </span>
        </p>
      </article>

      <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a3c5e]">
          B. {LIBELLE_DEPLACEMENTS_ENERGIA}
        </h2>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs uppercase text-slate-500">Base de départ</dt>
            <dd className="font-medium">
              {deplacements.energia.adresseDepart.trim() || "Non renseignée"}
            </dd>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <dt className="text-xs uppercase text-slate-500">Adresse du chantier</dt>
            <dd className="font-medium">{chantier}</dd>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs uppercase text-slate-500">Nombre de visites</dt>
              <dd className="text-lg font-bold">{deplacements.energia.nombreVisites}</dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs uppercase text-slate-500">Kilomètres totaux</dt>
              <dd className="text-lg font-bold">
                {formatKm(deplacements.energia.distanceTotaleKm)}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs uppercase text-slate-500">Péages HT</dt>
              <dd className="font-semibold">
                {formatEuro(deplacements.energia.coutPeageHt)}
              </dd>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              <dt className="text-xs uppercase text-slate-500">Stationnement HT</dt>
              <dd className="font-semibold">
                {formatEuro(deplacements.energia.coutStationnementHt)}
              </dd>
            </div>
          </div>
          <div className="rounded-lg border border-teal-300 bg-teal-50 px-3 py-2">
            <dt className="text-xs uppercase text-teal-800">Frais HT</dt>
            <dd className="text-xl font-bold text-[#1a3c5e]">
              {formatEuro(deplacements.energia.fraisDeplacementHt)}
            </dd>
            <p className="text-[11px] text-slate-600">
              {LABEL_SOURCE_DISTANCE[deplacements.energia.sourceDistance]} —{" "}
              {deplacements.energia.estimationComplete
                ? "estimation complète"
                : "indicatif, non définitif"}
            </p>
          </div>
        </dl>
        <ul className="mt-3 text-xs text-slate-600">
          {deplacements.energia.visites
            .filter((visite) => visite.inclus && visite.nombre > 0)
            .map((visite) => (
              <li key={visite.id}>
                {visite.libelle} : {visite.nombre}
              </li>
            ))}
        </ul>
      </article>
    </section>
  );
}
