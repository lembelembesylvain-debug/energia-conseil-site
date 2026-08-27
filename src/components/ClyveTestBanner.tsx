import type { ClyveJeuTest } from "../hooks/useClyveTestJeu";
import type { AidEstimateResult } from "../types/aides";

export default function ClyveTestBanner({
  jeu,
  onChange,
  controleMoteur,
}: {
  jeu: ClyveJeuTest;
  onChange: (jeu: ClyveJeuTest) => void;
  controleMoteur: {
    corpusOk: boolean;
    fictifOk: boolean;
    fictif: AidEstimateResult;
  };
}) {
  return (
    <div className="border-b border-amber-700 bg-amber-950 px-4 py-3 text-amber-50 md:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide">Contrôle moteur d’aides — test local</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onChange("corpus")}
            className={`min-h-11 rounded-full px-3 py-2 text-sm ${
              jeu === "corpus" ? "bg-amber-400 text-slate-950" : "border border-amber-400 text-amber-100"
            }`}
          >
            Corpus Clyve (données manquantes)
          </button>
          <button
            type="button"
            onClick={() => onChange("fictif")}
            className={`min-h-11 rounded-full px-3 py-2 text-sm ${
              jeu === "fictif" ? "bg-amber-400 text-slate-950" : "border border-amber-400 text-amber-100"
            }`}
          >
            Jeu fictif (RFR + 2 occupants)
          </button>
        </div>
      </div>
      <p className="mx-auto mt-2 max-w-7xl text-xs text-amber-100">
        Corpus : {controleMoteur.corpusOk ? "OK — aides bloquées, aucun profil" : "ÉCHEC contrôle corpus"} · Fictif :{" "}
        {controleMoteur.fictifOk ? "OK — profil Jaune, calcul contrôlé" : "ÉCHEC contrôle fictif"}
        {controleMoteur.fictif.totalAides != null
          ? ` · aides scénario B (indicatif) ${controleMoteur.fictif.totalAides.toLocaleString("fr-FR")} €`
          : ""}
      </p>
    </div>
  );
}
