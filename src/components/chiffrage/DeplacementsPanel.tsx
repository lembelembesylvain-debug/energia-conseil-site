import type {
  DeplacementArtisanSaisie,
  DeplacementsSaisie,
  ParametresChiffrage,
  SourceDistance,
  SourcePrix,
} from "../../lib/chiffrage";
import {
  LABEL_SOURCE_DISTANCE,
  SOURCES_PRIX,
  TYPES_VISITE_ENERGIA,
  creerArtisanVide,
} from "../../lib/chiffrage";

type Props = {
  parametres: ParametresChiffrage;
  deplacements: DeplacementsSaisie;
  onParametres: (patch: Partial<ParametresChiffrage>) => void;
  onDeplacements: (suivants: DeplacementsSaisie) => void;
};

const inputClass = "mt-1 w-full rounded-lg border border-slate-300 px-2 py-2 text-sm";

function NumberOrEmpty({
  value,
  onChange,
  placeholder = "À saisir",
  step = 0.01,
  title,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  step?: number;
  title?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      step={step}
      title={title}
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(event) => {
        const raw = event.target.value;
        onChange(raw === "" ? null : Number(raw));
      }}
      className={inputClass}
    />
  );
}

export default function DeplacementsPanel({
  parametres,
  deplacements,
  onParametres,
  onDeplacements,
}: Props) {
  function patchDeplacement(patch: Partial<ParametresChiffrage["deplacement"]>) {
    onParametres({
      deplacement: { ...parametres.deplacement, ...patch },
    });
  }

  function patchEnergia(patch: Partial<DeplacementsSaisie["energia"]>) {
    onDeplacements({
      ...deplacements,
      energia: { ...deplacements.energia, ...patch },
    });
  }

  function patchArtisan(id: string, patch: Partial<DeplacementArtisanSaisie>) {
    onDeplacements({
      ...deplacements,
      artisans: deplacements.artisans.map((artisan) =>
        artisan.id === id ? { ...artisan, ...patch } : artisan,
      ),
    });
  }

  function ajouterArtisan() {
    onDeplacements({
      ...deplacements,
      artisans: [...deplacements.artisans, creerArtisanVide(parametres.deplacement)],
    });
  }

  function retirerArtisan(id: string) {
    onDeplacements({
      ...deplacements,
      artisans: deplacements.artisans.filter((artisan) => artisan.id !== id),
    });
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1a3c5e]">
          Déplacements — modèle mixte contractant général
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Les artisans sont calculés depuis <strong>leur adresse d’entreprise</strong> jusqu’au
          chantier. ENERGIA CONSEIL IA® est calculée depuis la{" "}
          <strong>base opérationnelle ENERGIA</strong>. Aucune adresse de Lyon n’est appliquée
          automatiquement aux artisans. Aucune distance n’est inventée.
        </p>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="text-sm">
            Adresse du chantier
            <input
              type="text"
              value={parametres.adresseChantier}
              onChange={(event) => onParametres({ adresseChantier: event.target.value })}
              placeholder="Adresse complète du logement"
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            Base de départ ENERGIA CONSEIL IA®
            <input
              type="text"
              value={parametres.adresseDepartEnergia}
              onChange={(event) => {
                onParametres({ adresseDepartEnergia: event.target.value });
                patchEnergia({ adresseDepart: event.target.value });
              }}
              placeholder="Base opérationnelle ENERGIA (modifiable)"
              className={inputClass}
            />
          </label>
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Barèmes kilométriques (paramètres du module)
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Laissez vide plutôt que d’inventer un barème. Aucun 0,60 €/km n’est appliqué tant que
          vous ne le saisissez pas.
        </p>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <label className="text-sm">
            €/km ENERGIA HT
            <NumberOrEmpty
              value={parametres.deplacement.coutKilometriqueEnergiaHt}
              onChange={(value) => {
                patchDeplacement({ coutKilometriqueEnergiaHt: value });
                patchEnergia({ coutKilometriqueHt: value });
              }}
              title="Coût kilométrique interne ENERGIA"
            />
          </label>
          <label className="text-sm">
            €/km artisan HT
            <NumberOrEmpty
              value={parametres.deplacement.coutKilometriqueArtisanHt}
              onChange={(value) => patchDeplacement({ coutKilometriqueArtisanHt: value })}
              title="Coût kilométrique artisan par défaut"
            />
          </label>
          <label className="text-sm">
            Péage HT par défaut (€)
            <input
              type="number"
              min={0}
              step={0.01}
              value={parametres.deplacement.coutPeageHt || ""}
              placeholder="0"
              onChange={(event) =>
                patchDeplacement({
                  coutPeageHt: event.target.value === "" ? 0 : Number(event.target.value),
                })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            Stationnement HT par défaut (€)
            <input
              type="number"
              min={0}
              step={0.01}
              value={parametres.deplacement.coutStationnementHt || ""}
              placeholder="0"
              onChange={(event) =>
                patchDeplacement({
                  coutStationnementHt:
                    event.target.value === "" ? 0 : Number(event.target.value),
                })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            Coût horaire trajet HT (€)
            <NumberOrEmpty
              value={parametres.deplacement.coutHoraireTempsDeplacementHt}
              onChange={(value) =>
                patchDeplacement({ coutHoraireTempsDeplacementHt: value })
              }
              title="Optionnel — appliqué si un temps de trajet est saisi"
            />
          </label>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[#1a3c5e]">
            A. Entreprises intervenantes
          </h3>
          <button
            type="button"
            onClick={ajouterArtisan}
            className="rounded-lg bg-[#1a3c5e] px-3 py-2 text-sm font-semibold text-white"
          >
            Ajouter un artisan
          </button>
        </div>
        {deplacements.artisans.length === 0 ? (
          <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Aucun artisan saisi. Ajoutez une entreprise pour calculer ses déplacements depuis
            <em> son</em> adresse, pas depuis la base ENERGIA.
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {deplacements.artisans.map((artisan, index) => (
              <li
                key={artisan.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">
                    Artisan {index + 1}
                    {artisan.nomArtisan ? ` — ${artisan.nomArtisan}` : ""}
                  </p>
                  <button
                    type="button"
                    onClick={() => retirerArtisan(artisan.id)}
                    className="text-xs font-semibold text-red-700 hover:underline"
                  >
                    Retirer
                  </button>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  <label className="text-sm md:col-span-2">
                    Nom de l’entreprise
                    <input
                      type="text"
                      value={artisan.nomArtisan}
                      onChange={(event) =>
                        patchArtisan(artisan.id, { nomArtisan: event.target.value })
                      }
                      placeholder="Raison sociale RGE"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm md:col-span-2">
                    Adresse de départ (base artisan)
                    <input
                      type="text"
                      value={artisan.adresseDepart}
                      onChange={(event) =>
                        patchArtisan(artisan.id, { adresseDepart: event.target.value })
                      }
                      placeholder="Adresse de l’entreprise — jamais Lyon par défaut"
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm">
                    km aller-retour (saisie manuelle)
                    <NumberOrEmpty
                      value={artisan.distanceAllerRetourKm}
                      onChange={(value) =>
                        patchArtisan(artisan.id, { distanceAllerRetourKm: value })
                      }
                      title="Distance artisan → chantier, aller-retour"
                    />
                  </label>
                  <label className="text-sm">
                    Nombre de déplacements
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={artisan.nombreDeplacements || ""}
                      placeholder="0"
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          nombreDeplacements:
                            event.target.value === "" ? 0 : Number(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm">
                    €/km HT (cet artisan)
                    <NumberOrEmpty
                      value={artisan.coutKilometriqueHt}
                      onChange={(value) =>
                        patchArtisan(artisan.id, { coutKilometriqueHt: value })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Péages HT (€)
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={artisan.coutPeageHt || ""}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          coutPeageHt:
                            event.target.value === "" ? 0 : Number(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm">
                    Stationnement HT (€)
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={artisan.coutStationnementHt || ""}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          coutStationnementHt:
                            event.target.value === "" ? 0 : Number(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm">
                    Temps de trajet (h / aller-retour)
                    <NumberOrEmpty
                      value={artisan.tempsTrajetHeures}
                      onChange={(value) =>
                        patchArtisan(artisan.id, { tempsTrajetHeures: value })
                      }
                      placeholder="Optionnel"
                    />
                  </label>
                  <label className="text-sm">
                    Frais facturés par l’artisan HT (€)
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={artisan.fraisFacturesArtisanHt || ""}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          fraisFacturesArtisanHt:
                            event.target.value === "" ? 0 : Number(event.target.value),
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="text-sm">
                    Source de la distance
                    <select
                      value={artisan.sourceDistance}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          sourceDistance: event.target.value as SourceDistance,
                        })
                      }
                      className={inputClass}
                    >
                      {Object.entries(LABEL_SOURCE_DISTANCE).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Source du coût
                    <select
                      value={artisan.sourceCout}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          sourceCout: event.target.value as SourcePrix,
                        })
                      }
                      className={inputClass}
                    >
                      {SOURCES_PRIX.map((source) => (
                        <option key={source.value} value={source.value}>
                          {source.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm">
                    Date de vérification
                    <input
                      type="date"
                      value={artisan.dateVerification ?? ""}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          dateVerification: event.target.value || null,
                        })
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className="flex items-center gap-2 text-sm md:col-span-2">
                    <input
                      type="checkbox"
                      checked={artisan.deplacementDejaInclusDansDevis}
                      onChange={(event) =>
                        patchArtisan(artisan.id, {
                          deplacementDejaInclusDansDevis: event.target.checked,
                        })
                      }
                    />
                    Déplacement déjà inclus dans le devis (ne pas comptabiliser une seconde
                    fois)
                  </label>
                  <label className="text-sm md:col-span-2 xl:col-span-3">
                    Commentaire
                    <input
                      type="text"
                      value={artisan.commentaire}
                      onChange={(event) =>
                        patchArtisan(artisan.id, { commentaire: event.target.value })
                      }
                      placeholder="Réf. devis, « déplacement compris », zone…"
                      className={inputClass}
                    />
                  </label>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-base font-semibold text-[#1a3c5e]">
          B. Déplacements, visites et suivi ENERGIA CONSEIL IA®
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Trajet calculé depuis la base ENERGIA jusqu’au chantier, distinct des artisans.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <label className="text-sm">
            km aller-retour (saisie manuelle)
            <NumberOrEmpty
              value={deplacements.energia.distanceAllerRetourKm}
              onChange={(value) => patchEnergia({ distanceAllerRetourKm: value })}
            />
          </label>
          <label className="text-sm">
            Source de la distance
            <select
              value={deplacements.energia.sourceDistance}
              onChange={(event) =>
                patchEnergia({ sourceDistance: event.target.value as SourceDistance })
              }
              className={inputClass}
            >
              {Object.entries(LABEL_SOURCE_DISTANCE).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Péages HT (€)
            <input
              type="number"
              min={0}
              step={0.01}
              value={deplacements.energia.coutPeageHt || ""}
              onChange={(event) =>
                patchEnergia({
                  coutPeageHt: event.target.value === "" ? 0 : Number(event.target.value),
                })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            Stationnement HT (€)
            <input
              type="number"
              min={0}
              step={0.01}
              value={deplacements.energia.coutStationnementHt || ""}
              onChange={(event) =>
                patchEnergia({
                  coutStationnementHt:
                    event.target.value === "" ? 0 : Number(event.target.value),
                })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm">
            Temps de trajet (h / aller-retour)
            <NumberOrEmpty
              value={deplacements.energia.tempsTrajetHeures}
              onChange={(value) => patchEnergia({ tempsTrajetHeures: value })}
              placeholder="Optionnel"
            />
          </label>
          <label className="text-sm">
            Source du coût
            <select
              value={deplacements.energia.sourceCout}
              onChange={(event) =>
                patchEnergia({ sourceCout: event.target.value as SourcePrix })
              }
              className={inputClass}
            >
              {SOURCES_PRIX.map((source) => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            Date de vérification
            <input
              type="date"
              value={deplacements.energia.dateVerification ?? ""}
              onChange={(event) =>
                patchEnergia({ dateVerification: event.target.value || null })
              }
              className={inputClass}
            />
          </label>
          <label className="text-sm md:col-span-2 xl:col-span-4">
            Commentaire
            <input
              type="text"
              value={deplacements.energia.commentaire}
              onChange={(event) => patchEnergia({ commentaire: event.target.value })}
              placeholder="Motif des visites, contraintes d’accès…"
              className={inputClass}
            />
          </label>
        </div>

        <h4 className="mt-5 text-sm font-semibold text-slate-700">Nombre de visites</h4>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {TYPES_VISITE_ENERGIA.map((type) => {
            const visite = deplacements.energia.visites.find((item) => item.id === type.value);
            if (!visite) return null;
            return (
              <label
                key={type.value}
                className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
              >
                <input
                  type="checkbox"
                  checked={visite.inclus}
                  onChange={(event) =>
                    patchEnergia({
                      visites: deplacements.energia.visites.map((item) =>
                        item.id === type.value
                          ? { ...item, inclus: event.target.checked }
                          : item,
                      ),
                    })
                  }
                />
                <span className="flex-1">{type.libelle}</span>
                <input
                  type="number"
                  min={0}
                  step={1}
                  value={visite.nombre || ""}
                  placeholder="0"
                  onChange={(event) =>
                    patchEnergia({
                      visites: deplacements.energia.visites.map((item) =>
                        item.id === type.value
                          ? {
                              ...item,
                              nombre: event.target.value === "" ? 0 : Number(event.target.value),
                            }
                          : item,
                      ),
                    })
                  }
                  className="w-16 rounded border border-slate-300 px-1.5 py-1 text-right"
                />
              </label>
            );
          })}
        </div>
      </div>
    </section>
  );
}
