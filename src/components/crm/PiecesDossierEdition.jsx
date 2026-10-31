import { useRef, useState } from "react";
import { enregistrerBlobCoffre } from "../../lib/crm/coffreDocuments";
import { PIECES_OBLIGATOIRES, STATUTS_PIECE } from "../../lib/crm/editionDossier";

const badge = {
  manquante: "border-amber-500/40 bg-amber-500/10 text-amber-100",
  recue: "border-sky-500/40 bg-sky-500/10 text-sky-100",
  validee: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
};

export default function PiecesDossierEdition({
  pieces,
  onChange,
  editable,
  voirFiscal = false,
  peutValider = false,
}) {
  const inputRefs = useRef({});
  const [message, setMessage] = useState("");
  const visibles = PIECES_OBLIGATOIRES.filter((p) => voirFiscal || !p.fiscal);

  const patchPiece = (id, partial) => {
    onChange?.({
      ...pieces,
      [id]: { ...(pieces[id] || { id, statut: "manquante" }), ...partial },
    });
  };

  const importer = async (piece, file) => {
    if (!file) return;
    const documentId = `piece-${piece.id}-${Date.now()}`;
    try {
      await enregistrerBlobCoffre(documentId, file);
    } catch {
      /* métadonnées conservées même si IndexedDB indisponible */
    }
    patchPiece(piece.id, {
      statut: "recue",
      nomFichier: file.name,
      documentId,
    });
    setMessage(`${piece.libelle} reçu : ${file.name}`);
  };

  return (
    <div className="mt-4 space-y-3">
      <p className="text-xs text-slate-400">
        Photos obligatoires du logement, justificatif RFR et facture / DPE. Les fichiers restent dans le
        coffre navigateur — jamais publiés.
      </p>
      <ul className="space-y-2">
        {visibles.map((piece) => {
          const etat = pieces?.[piece.id] || { statut: "manquante" };
          const libelleStatut = STATUTS_PIECE.find((s) => s.id === etat.statut)?.label || "Manquante";
          return (
            <li
              key={piece.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-white">{piece.libelle}</p>
                {etat.nomFichier ? (
                  <p className="mt-0.5 text-xs text-slate-400">{etat.nomFichier}</p>
                ) : (
                  <p className="mt-0.5 text-xs text-slate-500">Aucun fichier</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge[etat.statut] || badge.manquante}`}>
                  {libelleStatut}
                </span>
                {editable ? (
                  <>
                    <input
                      ref={(el) => {
                        inputRefs.current[piece.id] = el;
                      }}
                      type="file"
                      accept={piece.type === "photo" ? "image/*" : ".pdf,image/*"}
                      className="hidden"
                      onChange={(event) => importer(piece, event.target.files?.[0])}
                    />
                    <button
                      type="button"
                      className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs text-slate-100 hover:border-emerald-400"
                      onClick={() => inputRefs.current[piece.id]?.click()}
                    >
                      Téléverser
                    </button>
                  </>
                ) : null}
                {peutValider && etat.statut !== "manquante" ? (
                  <select
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white"
                    value={etat.statut}
                    onChange={(event) => patchPiece(piece.id, { statut: event.target.value })}
                  >
                    {STATUTS_PIECE.filter((s) => s.id !== "manquante").map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {message ? <p className="text-xs text-emerald-200">{message}</p> : null}
    </div>
  );
}
