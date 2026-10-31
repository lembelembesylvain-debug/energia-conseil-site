import { useEffect, useRef, useState } from "react";
import {
  FORMATS_ACCEPTES,
  TYPES_DOCUMENTS,
  importerDocument,
  lireEtatImport,
  revoirChampImport,
  synchroniserPrefillDossier,
} from "../../lib/crm/importDocuments";
import { dossierEstProtege } from "../../lib/crm/gardeFousImport";
import { peutImporterDocument } from "../../lib/crm/roles";
import { enregistrerBlobCoffre } from "../../lib/crm/coffreDocuments";
import RevueExtractionDossier from "./RevueExtractionDossier";

async function inflateRawNavigateur(data) {
  if (typeof DecompressionStream === "undefined") return data;
  const ds = new DecompressionStream("deflate-raw");
  const stream = new Blob([data]).stream().pipeThrough(ds);
  const buf = await new Response(stream).arrayBuffer();
  return new Uint8Array(buf);
}

export default function ImportDocumentDossier({ dossier, role, onChange }) {
  const inputRef = useRef(null);
  const [typeDocument, setTypeDocument] = useState("dpe");
  const [message, setMessage] = useState("");
  const [etat, setEtat] = useState(() => lireEtatImport(dossier?.id));
  const admin = peutImporterDocument(role);
  const protege = dossierEstProtege(dossier);

  useEffect(() => {
    setEtat(lireEtatImport(dossier?.id));
    if (dossier?.id) {
      const base = synchroniserPrefillDossier(dossier.id);
      if (base) onChange?.(base);
    }
  }, [dossier?.id]);

  if (!admin) return null;

  if (protege) {
    return (
      <p className="mt-4 text-xs text-slate-500">
        Import désactivé : les dossiers Pereira et Marjollet ne sont pas modifiables.
      </p>
    );
  }

  const rafraichir = (suivant, texte) => {
    setEtat(suivant);
    onChange?.(suivant);
    if (texte) setMessage(texte);
  };

  const importer = async (file) => {
    if (!file) return;
    setMessage("");
    const binaire = new Uint8Array(await file.arrayBuffer());
    let inflateRaw = inflateRawNavigateur;
    try {
      const resultat = importerDocument({
        dossier,
        role,
        utilisateur: "administrateur",
        nomFichier: file.name,
        typeMime: file.type,
        typeDocument,
        binaire,
        inflateRaw,
        persisterBlob: true,
      });
      if (resultat.document?.id) {
        try {
          await enregistrerBlobCoffre(resultat.document.id, new Blob([binaire], { type: file.type || "application/octet-stream" }));
        } catch {
          /* coffre indisponible : métadonnées conservées, pas de copie public/ */
        }
      }
      rafraichir(
        resultat.etat,
        resultat.ok
          ? `${resultat.champsProposes.length} champ(s) proposé(s). Validation humaine obligatoire. Aucun document publié.`
          : resultat.message,
      );
    } catch (error) {
      setMessage(error?.message || "Import impossible.");
    }
  };

  const onActionChamp = (champId, action, valeur) => {
    const payload = action === "modifier" ? { valeur } : {};
    const resultat = revoirChampImport(dossier.id, champId, action, payload, role);
    if (!resultat.ok) {
      setMessage(resultat.message);
      return;
    }
    rafraichir(resultat.etat, `Champ ${action === "modifier" ? "corrigé" : action === "valider" ? "validé" : "rejeté"}. Seuls les champs validés alimentent la fiche. Aucune publication.`);
  };

  return (
    <section className="mt-6 rounded-2xl border border-sky-500/30 bg-sky-500/5 p-4">
      <h3 className="text-sm font-semibold text-sky-100">Importer un document dans le dossier</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">
        Coffre privé du navigateur. Aucun fichier n’est copié dans public/, src/assets/ ni Git.
        Extraction proposée uniquement. Aucune aide calculée, aucun devis ni rapport généré.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-2">
        <label className="text-xs text-slate-400">
          Type
          <select
            value={typeDocument}
            onChange={(e) => setTypeDocument(e.target.value)}
            className="mt-1 block rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-sm text-white"
          >
            {TYPES_DOCUMENTS.map((type) => (
              <option key={type.id} value={type.id}>
                {type.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-xl border border-sky-400/50 bg-sky-500/20 px-3 py-2 text-xs font-semibold text-sky-50 hover:border-sky-300"
        >
          Importer un document
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={FORMATS_ACCEPTES}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            importer(file);
          }}
        />
      </div>
      {message ? <p className="mt-3 text-xs text-amber-100">{message}</p> : null}
      <RevueExtractionDossier etat={etat} onActionChamp={onActionChamp} />
    </section>
  );
}
