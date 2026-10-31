import { useEffect, useState } from "react";
import { CLYVE_LAGENETE_DOSSIER_ID } from "../../lib/crm/clyveLaGeneteContrat";
import { htmlContratPourDossierAvecImagesEmbarquees } from "../../lib/crm/htmlContratCrm";

export default function PageContratClyveLaGenete() {
  const [html, setHtml] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    document.title = "CONTRAT-2026-LAGENETE-CLYVE-PHASE1 | ENERGIA-CONSEIL IA®";
    htmlContratPourDossierAvecImagesEmbarquees({}, { id: CLYVE_LAGENETE_DOSSIER_ID })
      .then(setHtml)
      .catch((cause) => {
        setErreur(cause instanceof Error ? cause.message : "Chargement du contrat impossible.");
      });
  }, []);

  if (erreur) {
    return <p className="p-6 text-sm text-red-700">{erreur}</p>;
  }
  if (!html) {
    return <p className="p-6 text-sm text-slate-600">Préparation du contrat officiel…</p>;
  }

  return (
    <iframe
      title="Contrat de contractant général — Longère La Genête"
      srcDoc={html}
      className="h-screen w-full border-0 bg-slate-200"
    />
  );
}
