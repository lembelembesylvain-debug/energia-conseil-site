import { champEstIncertain } from "../../lib/crm/extractionChamps";

function libelleStatut(status) {
  if (status === "proposed") return "proposé";
  if (status === "extracted") return "extrait";
  if (status === "validated") return "validé";
  if (status === "manually_corrected") return "corrigé";
  if (status === "conflicting") return "contradictoire";
  if (status === "rejected") return "rejeté";
  if (status === "missing") return "manquant";
  return status;
}

function libelleConfiance(confidence) {
  if (confidence === "high") return "élevée";
  if (confidence === "medium") return "moyenne";
  if (confidence === "low") return "faible";
  return "aucune";
}

function afficherValeur(value) {
  if (value == null) return "—";
  if (typeof value === "object") {
    const ligne = value;
    return [
      ligne.prestation,
      ligne.quantite != null ? `${ligne.quantite} ${ligne.unite || ""}` : null,
      ligne.prixHt != null ? `${ligne.prixHt} € HT` : null,
      ligne.prixFerme ? null : "prix non ferme",
      ligne.sourcePrix === "fourchette" ? "fourchette indicative" : null,
    ]
      .filter(Boolean)
      .join(" · ");
  }
  return String(value);
}

function ChampRevue({ champ, onAction }) {
  const incertain = champEstIncertain(champ);
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">{champ.field}</p>
          <p className="mt-1 text-sm text-white">{afficherValeur(champ.value)}</p>
          {champ.unit ? <p className="text-xs text-slate-400">{champ.unit}</p> : null}
        </div>
        <div className="text-right text-xs text-slate-400">
          <p>
            Source : {champ.sourceDocument}
            {champ.sourcePage ? ` · p.${champ.sourcePage}` : ""}
          </p>
          <p>
            Confiance {libelleConfiance(champ.confidence)} · {libelleStatut(champ.status)}
          </p>
        </div>
      </div>
      {incertain ? (
        <p className="mt-2 text-xs text-amber-200">À vérifier — donnée non certaine.</p>
      ) : null}
      {champ.status === "conflicting" ? (
        <p className="mt-2 text-xs text-orange-100">
          Contradiction : valeur conservée ci-dessus. Proposition de {champ.sourceDocumentConflict} :{" "}
          {afficherValeur(champ.valeurProposee)}. Aucun écrasement automatique.
        </p>
      ) : null}
      {champ.nEstPasUneLigneTravaux ? (
        <p className="mt-2 text-xs text-slate-400">
          Recommandation — ce n’est pas une ligne de travaux validée.
        </p>
      ) : null}
      {champ.categorie === "travaux" ? (
        <p className="mt-2 text-xs text-slate-400">
          Prix indicatif à vérifier. Une fourchette ne devient pas un prix ferme.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAction("valider")}
          className="rounded-lg border border-emerald-500/50 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-semibold text-emerald-100"
        >
          Valider
        </button>
        <button
          type="button"
          onClick={() => {
            const actuelle = typeof champ.value === "object" ? JSON.stringify(champ.value) : String(champ.value ?? "");
            const saisie = window.prompt("Nouvelle valeur", actuelle);
            if (saisie == null) return;
            onAction("modifier", saisie);
          }}
          className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs font-semibold text-slate-100"
        >
          Modifier
        </button>
        <button
          type="button"
          onClick={() => onAction("rejeter")}
          className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-semibold text-rose-100"
        >
          Rejeter
        </button>
      </div>
    </article>
  );
}

export default function RevueExtractionDossier({ etat, onActionChamp }) {
  const champs = etat?.champs || [];
  const documents = etat?.documents || [];

  if (documents.length === 0 && champs.length === 0) {
    return (
      <p className="mt-3 text-xs text-slate-500">
        Aucun document importé. Les valeurs proposées apparaîtront ici avec leur source.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Documents importés</h4>
        <ul className="mt-2 space-y-1 text-xs text-slate-300">
          {documents.map((doc) => (
            <li key={doc.id}>
              {doc.nomFichier} · {doc.type} · {doc.statutAnalyse} · confiance {libelleConfiance(doc.niveauConfiance)}
              {doc.statutAnalyse === "bloque_contradiction" ? (
                <span className="block text-orange-200">
                  Contradiction détectée : vérifier l’identité du client et l’adresse du bien avant
                  association au dossier.
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Champs extraits — revue obligatoire
        </h4>
        {champs.length === 0 ? (
          <p className="text-xs text-slate-500">Aucune donnée clairement identifiable extraite.</p>
        ) : (
          champs.map((champ) => (
            <ChampRevue
              key={champ.id}
              champ={champ}
              onAction={(action, valeur) => onActionChamp?.(champ.id, action, valeur)}
            />
          ))
        )}
      </div>
    </div>
  );
}
