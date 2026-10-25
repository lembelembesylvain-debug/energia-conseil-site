import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { composerEtudeSolaire, telechargerEtudeSolairePdf } from "../../lib/proptech/etudeSolaireSniper";
import { peutExporterFiche, type FicheOpportunite } from "../../lib/proptech/ficheOpportuniteSniper";
import { formaterEntierFr } from "../../lib/proptech/solaireCalculs";

const CSS_IMPRESSION = `
@page { size: A4 portrait; margin: 0; }
@media print {
  html, body { background: #fff !important; }
  body > *:not(#etude-solaire-print-root) { display: none !important; }
  #etude-solaire-print-root {
    position: static !important;
    inset: auto !important;
    display: block !important;
    overflow: visible !important;
    background: #fff !important;
    padding: 0 !important;
  }
  #etude-solaire-print-root .no-print { display: none !important; }
  #etude-solaire-a4 {
    width: 210mm !important;
    min-height: 297mm !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
}
`;

function euros(valeur: number | null): string {
  if (valeur == null) return "Non chiffré";
  return `${formaterEntierFr(valeur)} €`;
}

function Ligne({ label, valeur }: { label: string; valeur: string }) {
  return (
    <p className="text-[11px] leading-snug text-slate-800">
      <span className="font-semibold text-slate-950">{label}. </span>
      {valeur}
    </p>
  );
}

function Cadre({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="border border-[#d6cec0] bg-white">
      <h3 className="bg-[#0B1F33] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white">
        {titre}
      </h3>
      <div className="space-y-1 border-l-[3px] border-[#b08a4a] px-3 py-2">{children}</div>
    </section>
  );
}

interface BlocEtudeSolaireProps {
  fiche: FicheOpportunite;
}

export default function BlocEtudeSolaire({ fiche }: BlocEtudeSolaireProps) {
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const site = composerEtudeSolaire(fiche);
  const etude = site.etude;
  const actif = peutExporterFiche(fiche);

  useEffect(() => {
    if (!ouvert) return undefined;
    const precedente = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const fermer = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOuvert(false);
    };
    window.addEventListener("keydown", fermer);
    return () => {
      document.body.style.overflow = precedente;
      window.removeEventListener("keydown", fermer);
    };
  }, [ouvert]);

  const telecharger = () => {
    try {
      telechargerEtudeSolairePdf(fiche);
      setErreur("");
    } catch (err) {
      setErreur(err instanceof Error ? err.message : "Export PDF impossible.");
    }
  };

  return (
    <section className="mt-3 rounded-xl border border-amber-400/30 bg-slate-900/80 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">
          Potentiel solaire et autonomie
        </p>
        {etude.toitureIdeale ? (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
            Toiture idéale solaire
          </span>
        ) : (
          <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
            Toiture à confirmer
          </span>
        )}
      </div>
      <ul className="mt-2 space-y-1 text-[11px] leading-snug text-slate-200">
        <li>{etude.libellePuissance}</li>
        <li>Production annuelle estimée : {formaterEntierFr(etude.productionAnnuelleKwh)} kWh / an</li>
        <li>Économie annuelle estimée : jusqu&apos;à {euros(etude.economieAnnuelleEur)} / an effacés</li>
        <li>Compatible Tesla Powerwall 3 (autonomie jour/nuit 85 %)</li>
      </ul>
      <p className="mt-1 text-[10px] leading-snug text-slate-400">{etude.noteToiture}</p>
      <button
        type="button"
        data-testid="export-etude-solaire"
        disabled={!actif}
        onClick={(event) => {
          event.stopPropagation();
          if (!actif) return;
          setOuvert(true);
        }}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/70 bg-amber-500/90 px-3 py-2.5 text-[12px] font-semibold text-slate-950 hover:bg-amber-400 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
      >
        <span aria-hidden="true">☀️</span>
        Exporter l&apos;Étude Solaire PDF (A4)
      </button>
      {erreur ? <p className="mt-2 text-[11px] text-rose-200">{erreur}</p> : null}

      {ouvert
        ? createPortal(
            <div
              id="etude-solaire-print-root"
              className="fixed inset-0 z-[5000] flex flex-col bg-slate-950/80"
              role="dialog"
              aria-modal="true"
              aria-labelledby="titre-etude-solaire"
            >
              <style>{CSS_IMPRESSION}</style>
              <div className="no-print flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
                <div>
                  <p id="titre-etude-solaire" className="text-sm font-semibold text-white">
                    Étude solaire et Tesla — aperçu A4
                  </p>
                  <p className="text-[11px] text-slate-300">{site.reference}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                    onClick={() => window.print()}
                  >
                    Imprimer
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-300"
                    onClick={telecharger}
                  >
                    Télécharger le PDF
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10"
                    onClick={() => setOuvert(false)}
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6">
                <article id="etude-solaire-a4" className="mx-auto flex min-h-[297mm] w-[210mm] flex-col bg-white text-slate-800 shadow-2xl">
                  <header className="bg-[#0B1F33] px-8 pb-3 pt-5 text-white">
                    <p className="text-[13px] font-bold">ENERGIA CONSEIL IA®</p>
                    <p className="mt-1 text-[10px] text-[#d6b36a]">
                      Ingénierie Solaire QualiPV & Solutions Tesla Powerwall
                    </p>
                    <p className="mt-2 text-[10px] font-semibold">{site.reference}</p>
                  </header>
                  <p className="bg-[#F4F0E6] px-6 py-2 text-center text-[11px] font-bold text-[#0B1F33]">
                    FICHE D&apos;ÉTUDE SOLAIRE & AUTOCONSOMMATION
                  </p>
                  <div className="space-y-2 px-6 py-3">
                    <Cadre titre="1 — Caractéristiques du site">
                      <Ligne label="Adresse" valeur={site.adresse} />
                      <Ligne label="Parcelle IGN" valeur={site.parcelle} />
                      <Ligne label="Toiture disponible" valeur={site.toiture} />
                      <Ligne label="Hypothèse" valeur={etude.noteToiture} />
                    </Cadre>
                    <Cadre titre="2 — Calepinage technique">
                      <Ligne label="Puissance" valeur={etude.libellePuissance} />
                      <Ligne
                        label="Modules"
                        valeur={`${etude.nombreModules} modules 500 W bifaciaux, onduleur hybride, câblage DC/AC`}
                      />
                      <Ligne
                        label="Production"
                        valeur={`${formaterEntierFr(etude.productionAnnuelleKwh)} kWh / an`}
                      />
                    </Cadre>
                    <Cadre titre="3 — Tesla Powerwall 3">
                      <Ligne
                        label="Stockage"
                        valeur="13,5 kWh, onduleur hybride intégré, secours en cas de coupure réseau"
                      />
                      <Ligne
                        label="Autoconsommation"
                        valeur={`${formaterEntierFr(etude.kwhAutoTesla)} kWh autoconsommés · ${formaterEntierFr(etude.kwhSurplusTesla)} kWh de surplus`}
                      />
                    </Cadre>
                    <Cadre titre="4 — Bilan économique sur 25 ans">
                      <Ligne label="Facture EDF actuelle" valeur={euros(etude.factureActuelleEur)} />
                      <Ligne label="Facture résiduelle" valeur={euros(etude.factureResiduelleEur)} />
                      <Ligne label="Économie annuelle" valeur={euros(etude.economieAnnuelleEur)} />
                      <Ligne label="Gains cumulés 25 ans" valeur={euros(etude.gains25AnsEur)} />
                      <Ligne
                        label="Retour calculé"
                        valeur={
                          etude.roiAnnees != null
                            ? `${String(etude.roiAnnees).replace(".", ",")} ans au tarif OA de juin 2026 (1,1 c€/kWh). La fourchette 5 à 7 ans correspond à un tarif de surplus antérieur.`
                            : "Non calculé"
                        }
                      />
                    </Cadre>
                  </div>
                  <footer className="mt-auto bg-[#0B1F33] px-8 py-3 text-[8px] leading-relaxed text-slate-200">
                    <p>Certification QualiPV Qualit&apos;EnR. Garantie décennale de pose. Assurance RC professionnelle.</p>
                    <p className="mt-0.5">contact@energia-conseil-ia.com | 06 10 59 68 98 | renovoptim-ia.com</p>
                  </footer>
                </article>
              </div>
            </div>,
            document.body,
          )
        : null}
    </section>
  );
}
