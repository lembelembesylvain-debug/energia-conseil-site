import { useState } from "react";
import { Copy, Download, FileText, Printer } from "lucide-react";
import { euro } from "../../lib/crm/mockData";
import {
  CHEMIN_DEVIS_FARISS,
  CLAUSES_FARISS,
  CLIENT_FARISS,
  EQUIPE_FARISS,
  FARISS_DEVIS_DATE_LONGUE,
  FARISS_DEVIS_NUMERO,
  FARISS_DOSSIER_ID,
  FINANCEMENT_FARISS,
  MENTION_AIDES_FARISS,
  NOM_ARCHIVE_PHOTOS_FARISS,
  PHASE_FARISS,
  PHOTOS_TERRAIN_FARISS,
  POSTES_FARISS_DEVIS,
  RIB_QONTO,
  STATUT_FARISS,
  TITRE_FARISS,
  TOTAUX_FARISS,
  texteRibAcompteFariss,
} from "../../lib/crm/farissLaRicamarieOfficiel.js";
import ConventionIngenierieModal from "./ConventionIngenierieModal";
import VisionneusePhoto from "./VisionneusePhoto.jsx";

function octets16(n) {
  return [n & 255, (n >>> 8) & 255];
}

function octets32(n) {
  return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];
}

function crc32(data) {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    c ^= data[i];
    for (let k = 0; k < 8; k += 1) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return (c ^ 0xffffffff) >>> 0;
}

function archiveZip(fichiers) {
  const locaux = [];
  const centraux = [];
  let offset = 0;
  fichiers.forEach((fichier) => {
    const nom = new TextEncoder().encode(fichier.nom);
    const crc = crc32(fichier.data);
    const local = new Uint8Array([
      ...octets32(0x04034b50),
      ...octets16(20),
      ...octets16(0),
      ...octets16(0),
      ...octets16(0),
      ...octets16(0),
      ...octets32(crc),
      ...octets32(fichier.data.length),
      ...octets32(fichier.data.length),
      ...octets16(nom.length),
      ...octets16(0),
    ]);
    locaux.push(local, nom, fichier.data);
    centraux.push(
      new Uint8Array([
        ...octets32(0x02014b50),
        ...octets16(20),
        ...octets16(20),
        ...octets16(0),
        ...octets16(0),
        ...octets16(0),
        ...octets16(0),
        ...octets32(crc),
        ...octets32(fichier.data.length),
        ...octets32(fichier.data.length),
        ...octets16(nom.length),
        ...octets16(0),
        ...octets16(0),
        ...octets16(0),
        ...octets16(0),
        ...octets32(0),
        ...octets32(offset),
      ]),
      nom,
    );
    offset += local.length + nom.length + fichier.data.length;
  });
  let tailleCentral = 0;
  centraux.forEach((part) => {
    tailleCentral += part.length;
  });
  const fin = new Uint8Array([
    ...octets32(0x06054b50),
    ...octets16(0),
    ...octets16(0),
    ...octets16(fichiers.length),
    ...octets16(fichiers.length),
    ...octets32(tailleCentral),
    ...octets32(offset),
    ...octets16(0),
  ]);
  return new Blob([...locaux, ...centraux, fin], { type: "application/zip" });
}

async function telechargerPhotosDossier() {
  const fichiers = [];
  for (const photo of PHOTOS_TERRAIN_FARISS) {
    const reponse = await fetch(photo.src);
    if (!reponse.ok) throw new Error(photo.src);
    fichiers.push({ nom: photo.fichier, data: new Uint8Array(await reponse.arrayBuffer()) });
  }
  const url = URL.createObjectURL(archiveZip(fichiers));
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = NOM_ARCHIVE_PHOTOS_FARISS;
  document.body.appendChild(lien);
  lien.click();
  lien.remove();
  URL.revokeObjectURL(url);
}

export function GaleriePhotosFariss({ testId = "galerie-photos-fariss" }) {
  const [indexOuvert, setIndexOuvert] = useState(null);
  const [telechargement, setTelechargement] = useState(false);
  const [erreurZip, setErreurZip] = useState("");
  const photosVisionneuse = PHOTOS_TERRAIN_FARISS.map((photo) => ({
    src: photo.src,
    label: photo.label,
  }));

  const telecharger = async () => {
    setErreurZip("");
    setTelechargement(true);
    try {
      await telechargerPhotosDossier();
    } catch {
      setErreurZip("Le téléchargement groupé n’a pas abouti. Les photos restent consultables une par une.");
    } finally {
      setTelechargement(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4" data-testid={testId}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Constat avant travaux</p>
          <h3 className="mt-1 text-base font-semibold text-white">Galerie Photos &amp; Constat Technique Avant Travaux</h3>
          <p className="mt-1 text-sm text-slate-400">Relevé du 20 octobre 2026 — 5 photos. Cliquer pour agrandir.</p>
        </div>
        <button
          type="button"
          data-testid="bouton-telecharger-photos-fariss"
          onClick={telecharger}
          disabled={telechargement}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 text-xs font-semibold text-sky-100 hover:bg-sky-500/25 disabled:opacity-60"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          {telechargement ? "Préparation de l’archive…" : "Télécharger toutes les photos du dossier"}
        </button>
      </div>
      {erreurZip ? <p className="mt-3 text-sm text-amber-200">{erreurZip}</p> : null}
      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        {PHOTOS_TERRAIN_FARISS.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            onClick={() => setIndexOuvert(index)}
            className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 text-left transition hover:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          >
            <span className="relative block aspect-[4/3] overflow-hidden bg-slate-950">
              <img src={photo.src} alt={photo.titre} className="h-full w-full object-cover" loading="lazy" />
              <span className="absolute left-2 top-2 rounded-lg border border-white/15 bg-slate-950/75 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
                Photo {index + 1}
              </span>
            </span>
            <span className="block space-y-2 p-3">
              <span className="block text-sm font-semibold leading-snug text-white">{photo.titre}</span>
              <span className="inline-flex rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-[11px] leading-snug text-emerald-100">
                {photo.badge}
              </span>
            </span>
          </button>
        ))}
      </div>
      {indexOuvert != null ? (
        <VisionneusePhoto
          photos={photosVisionneuse}
          index={indexOuvert}
          onIndex={setIndexOuvert}
          onClose={() => setIndexOuvert(null)}
        />
      ) : null}
    </section>
  );
}

function qte(poste) {
  if (poste.unite === "m²") {
    return poste.quantite.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  return String(poste.quantite);
}

export default function FicheFariss() {
  const [ribCopie, setRibCopie] = useState(false);
  const [conventionOuverte, setConventionOuverte] = useState(false);

  const copierRib = async () => {
    const texte = texteRibAcompteFariss();
    try {
      await navigator.clipboard.writeText(texte);
      setRibCopie(true);
    } catch {
      window.prompt("Copier le RIB Qonto — acompte 3 135,00 € TTC", texte);
    }
    window.setTimeout(() => setRibCopie(false), 2500);
  };

  const ouvrirDevis = () => {
    window.open(CHEMIN_DEVIS_FARISS, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="mt-4 space-y-4" data-testid="fiche-fariss">
      <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Dossier &amp; devis</p>
        <p className="mt-1 font-mono text-sm text-sky-200">
          {FARISS_DOSSIER_ID} · {FARISS_DEVIS_NUMERO}
        </p>
        <p className="mt-2 text-sm font-semibold text-white">{CLIENT_FARISS.libelleSignature}</p>
        <p className="mt-1 text-sm text-slate-300">{CLIENT_FARISS.adresse}</p>
        <p className="mt-1 text-sm text-slate-300">{CLIENT_FARISS.telephone}</p>
        <p className="mt-2 text-sm text-white">{TITRE_FARISS}</p>
        <p className="mt-2 text-sm text-amber-100">
          {STATUT_FARISS} — {PHASE_FARISS}
        </p>
        <p className="mt-1 text-xs text-slate-400">Devis du {FARISS_DEVIS_DATE_LONGUE} · validité 3 mois · TVA rénovation 10 %</p>
      </div>

      <GaleriePhotosFariss />

      <div className="flex flex-wrap gap-2" data-testid="actions-fariss">
        <button
          type="button"
          data-testid="bouton-pdf-fariss"
          onClick={ouvrirDevis}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-sky-600 px-3 text-xs font-semibold text-white hover:bg-sky-500"
        >
          <Printer className="h-3.5 w-3.5" aria-hidden />
          <FileText className="h-3.5 w-3.5" aria-hidden />
          Exporter PDF / Imprimer le devis
        </button>
        <button
          type="button"
          data-testid="bouton-rib-fariss"
          onClick={copierRib}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[#f9c74f]/50 bg-[#1a5c2e] px-3 text-xs font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
        >
          <Copy className="h-3.5 w-3.5" aria-hidden />
          {ribCopie ? "RIB copié" : "Copier RIB Qonto Acompte 3 135 €"}
        </button>
        <button
          type="button"
          data-testid="bouton-convention-fariss"
          onClick={() => setConventionOuverte(true)}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-500"
        >
          Voir la Convention d&apos;Assistance 990 €
        </button>
      </div>

      <div className="flex flex-wrap gap-2 text-xs">
        <span className="rounded-xl border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 text-emerald-100">
          Titulaire : {EQUIPE_FARISS.titulaireMarche}
        </span>
        <span className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-3 py-2 text-sky-100">
          Apporteur : {EQUIPE_FARISS.apporteur}
        </span>
        <span className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-amber-100">
          {EQUIPE_FARISS.facturation}
        </span>
      </div>
      <p className="text-xs text-slate-400">
        {EQUIPE_FARISS.apporteurEmails} · Sylvain LEMBELEMBE 06 10 59 68 98 · Damien RICHARD 06 72 68 09 68 · FABIEN
        06 71 19 96 45 · Julia · MAR Antoine BARATIER – Cabinet C2ET
      </p>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-left text-sm" data-testid="tableau-postes-fariss">
          <thead className="bg-slate-900 text-[11px] uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">N°</th>
              <th className="px-3 py-3">Désignation</th>
              <th className="px-3 py-3">Qté</th>
              <th className="px-3 py-3">PU HT</th>
              <th className="px-3 py-3">Total HT</th>
              <th className="px-3 py-3">TVA 10 %</th>
              <th className="px-3 py-3">TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-slate-950/60">
            {POSTES_FARISS_DEVIS.map((poste) => (
              <tr key={poste.id}>
                <td className="px-3 py-3 font-mono text-sky-200">{poste.ordreContractuel}</td>
                <td className="px-3 py-3">
                  <p className="font-semibold text-white">{poste.nom}</p>
                  <p className="mt-1 max-w-xl text-xs leading-relaxed text-slate-400">{poste.specifications}</p>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-slate-200">
                  {qte(poste)} {poste.unite}
                </td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-200">{euro(poste.puHt)}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-white">{euro(poste.totalHt)}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-300">{euro(poste.totalTva)}</td>
                <td className="whitespace-nowrap px-3 py-3 tabular-nums font-semibold text-emerald-100">
                  {euro(poste.totalTtc)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">Total HT</p>
          <p className="mt-1 text-lg font-semibold text-white">{euro(TOTAUX_FARISS.totalHt)}</p>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-[11px] uppercase tracking-wide text-slate-400">TVA 10 %</p>
          <p className="mt-1 text-lg font-semibold text-white">{euro(TOTAUX_FARISS.totalTva)}</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="text-[11px] uppercase tracking-wide text-emerald-200">Total TTC</p>
          <p className="mt-1 text-lg font-semibold text-white">{euro(TOTAUX_FARISS.totalTtc)}</p>
        </div>
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4">
          <p className="text-[11px] uppercase tracking-wide text-amber-100">Acompte 30 % / Solde 70 %</p>
          <p className="mt-1 text-sm font-semibold text-white">
            {euro(FINANCEMENT_FARISS.acompte)} · {euro(FINANCEMENT_FARISS.solde)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-orange-400/40 bg-orange-500/10 p-4 text-sm text-orange-50">
        <p className="text-xs font-semibold uppercase tracking-wide text-orange-200">MaPrimeAdapt&apos; — à titre indicatif</p>
        <p className="mt-2 leading-relaxed">{MENTION_AIDES_FARISS}</p>
      </div>

      <div className="space-y-2" data-testid="clauses-fariss">
        {CLAUSES_FARISS.map((clause) => (
          <p key={clause.slice(0, 24)} className="rounded-xl border border-slate-700 bg-slate-950/70 p-3 text-sm leading-relaxed text-slate-200">
            {clause}
          </p>
        ))}
      </div>

      <div className="rounded-2xl border border-[#f9c74f]/40 bg-[#1a5c2e]/40 p-4 text-sm text-emerald-50" data-testid="rib-fariss">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#f9c74f]">RIB Qonto — acompte 3 135,00 € TTC</p>
        <p className="mt-2">Titulaire : {RIB_QONTO.titulaire}</p>
        <p>Banque : {RIB_QONTO.banque}</p>
        <p className="mt-1 font-mono text-sm text-white">IBAN {RIB_QONTO.iban}</p>
        <p className="font-mono text-sm text-white">BIC {RIB_QONTO.bic}</p>
      </div>

      <ConventionIngenierieModal
        ouvert={conventionOuverte}
        onFermer={() => setConventionOuverte(false)}
        client={CLIENT_FARISS.libelleSignature}
        adresse={CLIENT_FARISS.adresse}
        ville={CLIENT_FARISS.ville}
        reference={FARISS_DEVIS_NUMERO}
      />
    </div>
  );
}
