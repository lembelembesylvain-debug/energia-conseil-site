import { useEffect, useMemo, useState } from "react";
import { ClipboardList, FileText } from "lucide-react";
import LogoEnergia from "./LogoEnergia";
import FactureAcompteModal from "./FactureAcompteModal";
import BonDeCommandeArtisanModal from "./BonDeCommandeArtisanModal";
import QualificationFinanciereBloc from "./QualificationFinanciereBloc";
import DevisDoubleOption from "./DevisDoubleOption";
import PhasageEtancheChantier from "./PhasageEtancheChantier";
import ConventionIngenierieModal, { BoutonConventionIngenierie } from "./ConventionIngenierieModal";
import { libelleBureauEtudes } from "../../lib/crm/betNomosOfficiel.js";
import {
  analyserEcartBudget,
  calculerDoubleOption,
  enregistrerParades,
  lireParades,
  montantChiffreComplet,
  qualificationComplete,
} from "../../lib/crm/paradesAntiFuite.js";
/**
 * Modale Devis & Marché Contractant Général — fiches leads_courtier.
 */

function euro(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return "—";
  return v.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

export function urlContratPourLeadCourtier(lead) {
  const blob = [
    lead?.prenom,
    lead?.nomFamille,
    lead?.nom,
    lead?.ville,
    lead?.region,
    lead?.typeTravaux,
    lead?.typeProjet,
    lead?.notes,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
  const budget = Number(lead?.budget ?? lead?.caTtc);

  if (
    blob.includes("100 kwc") ||
    blob.includes("photovolta") ||
    blob.includes("ardeche") ||
    blob.includes("centrale solaire") ||
    budget === 106800 ||
    budget === 89000
  ) {
    return "/CONTRAT_PHOTOVOLTAIQUE_100KWC_ARDECHE_2026.html";
  }
  if (blob.includes("massardier") || budget === 20000) {
    return "/CONTRAT_MASSARDIER_CUISINE_2026_FINAL.html";
  }
  if (blob.includes("gilbertas") || blob.includes("clermont")) {
    return "/CONTRAT_GILBERTAS_CLERMONT_2026_FINAL.html";
  }
  if (blob.includes("zoulou") || (blob.includes("paris") && budget === 84500)) {
    return "/CONTRAT_RENOVATION_ZOULOU_PARIS_2026.html";
  }
  return null;
}

/** Fiche marché pour tout lead (y compris Zoulou) — toujours utilisable. */
export function construireMarcheLeadCourtier(lead) {
  const prenom = (lead?.prenom || "").trim();
  const nomFamille = (lead?.nomFamille || "").trim();
  const nomComplet = [prenom, nomFamille].filter(Boolean).join(" ") || lead?.nom || "Client";
  const ville = lead?.ville || lead?.region || "—";
  const telephone = lead?.telephone || "—";
  const email = lead?.email || "";
  const travaux =
    lead?.typeTravaux || lead?.typeProjet || lead?.notes || "Travaux de rénovation énergétique — à préciser";
  const blob = `${nomComplet} ${ville} ${travaux}`.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  let totalTtc = Number(lead?.budget ?? lead?.caTtc);
  if (!Number.isFinite(totalTtc) || totalTtc <= 0) totalTtc = 0;

  let aidesEstimees = 0;
  let mentionAides =
    "Aides financières 2026 (estimation à titre indicatif). À valider selon revenus réels. Montants définitifs après instruction ANAH et CEE.";

  if (blob.includes("100 kwc") || blob.includes("photovolta") || totalTtc === 106800 || totalTtc === 89000) {
    totalTtc = 106800;
    aidesEstimees = 0;
    mentionAides =
      "Marché photovoltaïque hangar / tertiaire — hors MaPrimeRénov’ résidentiel. Pas d’aide ANAH déduite sur ce marché. Estimation indicative.";
  } else if (blob.includes("marseille") || blob.includes("pack 3") || totalTtc === 41500) {
    totalTtc = 41500;
    aidesEstimees = Math.round(totalTtc * 0.15);
    mentionAides =
      "Pack 3 en 1 — aides ANAH / CEE estimées à titre indicatif (~15 %). Montants définitifs après instruction ANAH et CEE.";
  } else if (blob.includes("massardier") || totalTtc === 20000) {
    totalTtc = 20000;
    aidesEstimees = 0;
    mentionAides =
      "Cuisine italienne Direct Usine — hors MaPrimeRénov’ Parcours. Reste à charge = montant ferme TTC.";
  } else if (blob.includes("gilbertas") || blob.includes("clermont")) {
    totalTtc = 37600;
    aidesEstimees = 0;
    mentionAides =
      "Rénovation complète second œuvre et cuisine clé en main — hors MaPrimeRénov'. Reste à charge = 37 600 € TTC. Aides financières 2026 à titre indicatif : 0 € sur ce marché.";
  } else if (blob.includes("tertiaire") || blob.includes("decret bacs") || blob.includes(" bacs") || blob.includes("gtb")) {
    aidesEstimees = 0;
    mentionAides =
      "Tertiaire — Décret Tertiaire, Décret BACS et GTB. Audit BET NOMOS en amont du chiffrage. Aides financières 2026 à titre indicatif, hors MaPrimeRénov' résidentiel. Montants définitifs après instruction.";
  } else if (blob.includes("copropriete") || blob.includes("logement collectif") || blob.includes("dtg")) {
    aidesEstimees = 0;
    mentionAides =
      "Copropriété et logement collectif — audit global, DTG et AMO. Aides financières 2026 à titre indicatif. Montants définitifs après instruction.";
  } else if (blob.includes("industrie") || blob.includes("16247")) {
    aidesEstimees = 0;
    mentionAides =
      "Industrie — audit réglementaire NF EN 16247 et CEE industrie. Aides financières 2026 à titre indicatif. Montants définitifs après instruction CEE.";
  } else if (totalTtc > 0) {
    aidesEstimees = Math.round(totalTtc * 0.2);
  }

  const resteACharge = Math.max(0, totalTtc - aidesEstimees);
  const acompte = Math.round(resteACharge * 0.3 * 100) / 100;
  const intermediaire = Math.round(resteACharge * 0.4 * 100) / 100;
  const solde = Math.round((resteACharge - acompte - intermediaire) * 100) / 100;

  return {
    id: lead?.id,
    client: nomComplet,
    telephone,
    email,
    ville,
    travaux,
    totalTtc,
    aidesEstimees,
    resteACharge,
    acompte,
    intermediaire,
    solde,
    mentionAides,
    typeProjet: lead?.typeProjet || "",
    bureauEtudesId: lead?.bureauEtudesId || "",
    bureauEtudesNom: lead?.bureauEtudesNom || libelleBureauEtudes(lead?.bureauEtudesId),
    urlContrat: urlContratPourLeadCourtier(lead),
    statut: lead?.statut || "Nouveau",
  };
}

export default function ModalDevisMarcheLead({ marche, onFermer }) {
  const [parades, setParades] = useState(() => lireParades(marche?.id));
  const [factureOuverte, setFactureOuverte] = useState(false);
  const [conventionOuverte, setConventionOuverte] = useState(false);

  useEffect(() => {
    setParades(lireParades(marche?.id));
    setFactureOuverte(false);
    setConventionOuverte(false);
  }, [marche?.id]);

  const calcul = useMemo(
    () => calculerDoubleOption(parades.lots, parades.phasage, { masquerPhase2: true }),
    [parades],
  );
  const montantComplet = montantChiffreComplet(parades.lots, parades.phasage, marche?.totalTtc);
  const ecart = analyserEcartBudget(parades.qualification?.budgetMaxTtc, montantComplet);
  const qualifie = qualificationComplete(parades.qualification);
  const envoiBloque = !qualifie || (ecart.alerte && !parades.qualification?.recadrageOral);

  const sauver = (patch) => {
    if (!marche?.id) {
      setParades((actuel) => ({
        ...actuel,
        ...patch,
        qualification: { ...actuel.qualification, ...(patch.qualification || {}) },
        phasage: { ...actuel.phasage, ...(patch.phasage || {}) },
        lots: Array.isArray(patch.lots) ? patch.lots : actuel.lots,
      }));
      return;
    }
    setParades(enregistrerParades(marche.id, patch));
  };

  if (!marche) return null;

  const totalDevisAnah = parades.lots.length
    ? calcul.phase2Masquee
      ? calcul.phase1.total
      : calcul.signature.total
    : marche.totalTtc;
  const echeancierPhase1 = parades.lots.length > 0 && calcul.phase2Masquee;
  const acompteAffiche = echeancierPhase1 ? Math.round(totalDevisAnah * 30) / 100 : marche.acompte;
  const intermediaireAffiche = echeancierPhase1 ? Math.round(totalDevisAnah * 40) / 100 : marche.intermediaire;
  const soldeAffiche = echeancierPhase1
    ? Math.round((totalDevisAnah - acompteAffiche - intermediaireAffiche) * 100) / 100
    : marche.solde;

  const imprimer = () => {
    const zone = document.getElementById("modale-devis-marche-print");
    if (!zone) {
      window.print();
      return;
    }
    const fenetre = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!fenetre) {
      window.print();
      return;
    }
    fenetre.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/><title>Devis & Marché — ${marche.client}</title>
      <style>
        body{font-family:Segoe UI,system-ui,sans-serif;color:#0f172a;padding:24px;line-height:1.45}
        h1{font-size:20px;margin:0 0 8px;color:#0f766e}
        h2{font-size:14px;text-transform:uppercase;letter-spacing:.06em;color:#334155;margin:20px 0 8px}
        .box{border:1px solid #cbd5e1;border-radius:12px;padding:14px;margin:10px 0;background:#f8fafc}
        .row{display:flex;justify-content:space-between;gap:12px;padding:6px 0;border-bottom:1px solid #e2e8f0}
        .row:last-child{border-bottom:0}
        .disclaimer{font-size:11px;color:#92400e;background:#fff7ed;border-left:4px solid #f97316;padding:10px;margin-top:12px}
        .print-logo{height:56px;width:auto;object-fit:contain;margin-bottom:8px}
      </style></head><body>
      <img class="print-logo" src="/logo.png" alt="ENERGIA CONSEIL IA®"
        onerror="this.onerror=null;this.src='/assets/LOGO.png';this.onerror=function(){this.style.display='none';document.getElementById('print-blason').style.display='block';};" />
      <svg id="print-blason" style="display:none;margin-bottom:8px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 176" width="120" height="88" role="img" aria-label="ENERGIA CONSEIL IA®">
        <ellipse cx="120" cy="88" rx="108" ry="78" fill="#0B1F3A" stroke="#D97706" stroke-width="6"/>
        <text x="120" y="72" text-anchor="middle" fill="#F8FAFC" font-family="Georgia,serif" font-size="28" font-weight="700">EC IA</text>
        <text x="120" y="98" text-anchor="middle" fill="#FBBF24" font-family="Segoe UI,sans-serif" font-size="11" font-weight="700">ENERGIA CONSEIL IA®</text>
        <text x="120" y="118" text-anchor="middle" fill="#64748B" font-family="Segoe UI,sans-serif" font-size="9">INPI n° 5213845</text>
      </svg>
      <h1>Devis & Marché Contractant Général</h1>
      <p style="color:#64748b;font-size:12px">ENERGIA-CONSEIL IA® — 16 Rue Cuvier, 69006 Lyon — INPI n°5213845</p>
      ${zone.innerHTML}
      </body></html>`);
    fenetre.document.close();
    fenetre.focus();
    fenetre.print();
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modale-devis-marche-titre"
      onClick={onFermer}
    >
      <div
        className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-emerald-500/30 bg-slate-900 shadow-2xl shadow-emerald-950/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 px-5 py-4">
          <div className="flex items-start gap-3">
            <LogoEnergia className="h-10 w-auto object-contain" width={120} height={40} />
            <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
              ENERGIA-CONSEIL IA® — Contractant Général
            </p>
            <h2 id="modale-devis-marche-titre" className="mt-1 text-lg font-semibold text-white">
              Devis & Marché Contractant Général
            </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onFermer}
            className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm text-slate-300 hover:bg-slate-800"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-5 py-5 text-slate-200">
          <QualificationFinanciereBloc
            qualification={parades.qualification}
            editable
            montantChiffreTtc={montantComplet}
            onChange={(qualification) => sauver({ qualification })}
          />
          {qualifie ? (
            <>
              <PhasageEtancheChantier
                lignes={parades.lots}
                phasage={parades.phasage}
                editable
                onPhasage={(phasage) => sauver({ phasage })}
              />
              <DevisDoubleOption
                calcul={calcul}
                editable
                optionRetenue={parades.phasage?.optionRetenue || ""}
                onOptionRetenue={(optionRetenue) => sauver({ phasage: { optionRetenue } })}
                onAffecter={(id, patch) => {
                  sauver({
                    lots: parades.lots.map((lot) => (lot.id === id ? { ...lot, ...patch } : lot)),
                  });
                }}
                onModifierLot={(id, patch) => {
                  sauver({
                    lots: parades.lots.map((lot) => (lot.id === id ? { ...lot, ...patch } : lot)),
                  });
                }}
                onAjouterLot={() => {
                  sauver({
                    lots: [
                      ...parades.lots,
                      {
                        id: `lot-${Date.now()}`,
                        nom: "Nouveau lot",
                        totalTtc: 0,
                        pack: "essentiel",
                        phase: "phase1",
                      },
                    ],
                  });
                }}
                onRetirerLot={(id) => sauver({ lots: parades.lots.filter((lot) => lot.id !== id) })}
                recadrageRequis={ecart.alerte}
                recadrageOral={Boolean(parades.qualification?.recadrageOral)}
                onRecadrageOral={(recadrageOral) => sauver({ qualification: { recadrageOral } })}
              />
            </>
          ) : (
            <p className="rounded-xl border border-orange-400/40 bg-orange-500/10 px-3 py-2 text-sm text-orange-50">
              Qualification financière obligatoire avant le chiffrage et l&apos;envoi du devis.
            </p>
          )}
        <div id="modale-devis-marche-print" className="space-y-4">
          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Client</h3>
            <p className="text-base font-semibold text-white">{marche.client}</p>
            <p className="mt-1 text-sm text-slate-300">
              {marche.telephone}
              {marche.email ? ` · ${marche.email}` : ""}
            </p>
            <p className="text-sm text-sky-300">{marche.ville}</p>
            {marche.statut ? <p className="mt-1 text-xs text-slate-500">Statut : {marche.statut}</p> : null}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Désignation des travaux
            </h3>
            <p className="text-sm leading-relaxed text-slate-100">{marche.travaux}</p>
            {marche.typeProjet ? (
              <p className="mt-2 text-xs text-slate-400">Type de marché : {marche.typeProjet}</p>
            ) : null}
            {marche.bureauEtudesNom ? (
              <p className="mt-1 text-xs text-emerald-200">
                Bureau d'études — phase audit : {marche.bureauEtudesNom}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
              <p className="text-[10px] uppercase tracking-wide text-emerald-200/80">
                {parades.lots.length && calcul.phase2Masquee ? "Devis Anah Phase 1 TTC" : "Montant marché TTC"}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-white">
                {totalDevisAnah ? euro(totalDevisAnah) : "À chiffrer"}
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-[10px] uppercase tracking-wide text-amber-100/80">Aides ANAH / CEE (indicatif)</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-amber-50">{euro(marche.aidesEstimees || 0)}</p>
            </div>
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
              <p className="text-[10px] uppercase tracking-wide text-sky-100/80">
                {echeancierPhase1 ? "Phase 1 au devis Anah" : "Reste à charge"}
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-sky-50">
                {echeancierPhase1 ? euro(totalDevisAnah) : marche.resteACharge ? euro(marche.resteACharge) : "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Échéancier officiel 30 % / 40 % / 30 %
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/80 px-3 py-2">
                <span>30 % à la signature</span>
                <strong className="tabular-nums text-white">{euro(acompteAffiche || 0)}</strong>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/80 px-3 py-2">
                <span>40 % mi-chantier (validation Sylvain LEMBELEMBE)</span>
                <strong className="tabular-nums text-white">{euro(intermediaireAffiche || 0)}</strong>
              </li>
              <li className="flex items-center justify-between gap-3 rounded-lg bg-slate-900/80 px-3 py-2">
                <span>30 % à réception</span>
                <strong className="tabular-nums text-white">{euro(soldeAffiche || 0)}</strong>
              </li>
            </ul>
            <p className="mt-3 text-[11px] text-slate-500">
              Paiement par déblocage progressif 30/40/30 : 30 % à la signature, 40 % mi-chantier après validation
              de Sylvain LEMBELEMBE (AMO ENERGIA-CONSEIL IA®), 30 % à réception.
            </p>
          </div>

          <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-xs text-orange-100">
            {marche.mentionAides}
          </div>
          {qualifie && parades.lots.length > 0 ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                Acceptation — deux options sur le même contrat
              </h3>
              <p className="mt-2 text-white">
                Option 1 Pack Essentiel : {euro(calcul.essentiels.total)} — acompte 30 % {euro(calcul.essentiels.acompte30)}
              </p>
              <p className="mt-1 text-white">
                Option 2 Pack Signature : {euro(calcul.signature.total)} — acompte 30 % {euro(calcul.signature.acompte30)}
              </p>
              <p className="mt-2 text-emerald-100">
                Option retenue : {parades.phasage?.optionRetenue === "signature" ? "Pack Signature" : parades.phasage?.optionRetenue === "essentiel" ? "Pack Essentiel" : "à cocher par le client"}
              </p>
              {calcul.phase2Masquee ? (
                <p className="mt-2 text-xs text-slate-300">
                  Phase 2 (gros œuvre et travaux non aidés) absente de ce devis Anah. Avenant présenté après notification d&apos;accord.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 px-5 py-4">
          {marche.urlContrat ? (
            <a
              href={marche.urlContrat}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-sky-300 underline-offset-2 hover:underline"
            >
              Ouvrir le contrat HTML officiel
            </a>
          ) : (
            <span className="text-xs text-slate-500">Fiche marché générée depuis le lead CRM</span>
          )}
          <button
            type="button"
            onClick={imprimer}
            disabled={envoiBloque}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-900/40 hover:from-emerald-500 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            [ 🖨️ Imprimer / Enregistrer en PDF ]
          </button>
          <BoutonConventionIngenierie onClick={() => setConventionOuverte(true)} testId="bouton-convention-devis-lead" />
          <button
            type="button"
            onClick={() => setFactureOuverte(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1a5c2e] px-3 py-2 text-xs font-semibold text-[#f9c74f]"
          >
            <FileText className="h-3.5 w-3.5" aria-hidden />
            Facture d&apos;acompte
          </button>
        </div>
      </div>
      <FactureAcompteModal
        ouvert={factureOuverte}
        marche={{
          id: marche.id,
          nom: marche.client,
          ref: String(marche.id || "DEVIS"),
          montantTtc: totalDevisAnah || marche.totalTtc || 0,
          adresse: marche.ville,
          designation: marche.travaux,
        }}
        onFermer={() => setFactureOuverte(false)}
      />
      <ConventionIngenierieModal
        ouvert={conventionOuverte}
        onFermer={() => setConventionOuverte(false)}
        client={marche.client}
        adresse={marche.ville}
        ville={marche.ville}
        reference={marche.id ? `CONV-ETUDE-${marche.id}` : "CONV-ETUDE-2026"}
      />
    </div>
  );
}

/** Contrat officiel 5 pages — ouvert depuis la sidebar « Devis & Marchés ». */
export function ModalContratOfficiel({ marches = [], marche, onChoisir, onFermer }) {
  const [factureOuverte, setFactureOuverte] = useState(false);
  const [commandeOuverte, setCommandeOuverte] = useState(false);
  const [conventionOuverte, setConventionOuverte] = useState(false);

  useEffect(() => {
    setFactureOuverte(false);
    setCommandeOuverte(false);
    setConventionOuverte(false);
  }, [marche?.id]);

  useEffect(() => {
    if (!marche) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape" && !factureOuverte && !commandeOuverte && !conventionOuverte) onFermer?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [marche, onFermer, factureOuverte, commandeOuverte, conventionOuverte]);

  if (!marche) return null;

  return (
    <div
      className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/80 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-contrat-officiel-titre"
      data-testid="modal-contrat-officiel"
      onClick={onFermer}
    >
      <div
        className="flex h-[min(94vh,1100px)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-sky-400/30 bg-slate-950 shadow-2xl shadow-sky-950/40"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 px-4 py-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
              {marche.kicker || "Marché de travaux · Contractant Général"}
            </p>
            <h2 id="modal-contrat-officiel-titre" className="mt-1 text-lg font-semibold text-white">
              Contrat officiel — {marche.nom}
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {marches.length > 1 ? (
              <label className="text-xs text-slate-400">
                <span className="sr-only">Choisir le marché</span>
                <select
                  value={marche.id}
                  onChange={(event) => {
                    const suivant = marches.find((item) => item.id === event.target.value);
                    if (suivant) onChoisir?.(suivant);
                  }}
                  className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-sky-100"
                >
                  {marches.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nom}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button
              type="button"
              data-testid="bouton-facture-acompte-contrat"
              onClick={() => setFactureOuverte(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1a5c2e] px-3 py-1.5 text-xs font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
            >
              <FileText className="h-3.5 w-3.5" aria-hidden />
              Facture d&apos;acompte
            </button>
            <BoutonConventionIngenierie
              onClick={() => setConventionOuverte(true)}
              testId="bouton-convention-ingenierie-contrat"
            />
            <button
              type="button"
              data-testid="bouton-bdc-artisan-contrat"
              onClick={() => setCommandeOuverte(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#f9c74f]/50 bg-[#1a5c2e] px-3 py-1.5 text-xs font-semibold text-[#f9c74f] hover:bg-[#2d8a4e]"
            >
              <ClipboardList className="h-3.5 w-3.5" aria-hidden />
              Bon de Commande Artisan
            </button>
            {marche.htmlPublic ? (
              <a
                href={marche.htmlPublic}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-sky-400/40 px-3 py-1.5 text-xs font-semibold text-sky-100 hover:bg-sky-500/15"
              >
                Ouvrir dans un onglet
              </a>
            ) : null}
            <button
              type="button"
              onClick={onFermer}
              className="rounded-lg border border-slate-700 px-2.5 py-1 text-sm text-slate-300 hover:bg-slate-800"
              aria-label="Fermer le contrat"
            >
              ✕
            </button>
          </div>
        </div>
        {marche.htmlPublic ? (
          <iframe
            title={`Contrat officiel ${marche.nom}`}
            src={marche.htmlPublic}
            className="min-h-0 w-full flex-1 bg-white"
          />
        ) : (
          <p className="p-6 text-sm text-slate-400">Aucun contrat HTML n’est associé à ce marché.</p>
        )}
      </div>
      <FactureAcompteModal
        ouvert={factureOuverte}
        marche={marche}
        onFermer={() => setFactureOuverte(false)}
      />
      <BonDeCommandeArtisanModal
        ouvert={commandeOuverte}
        marche={marche}
        onFermer={() => setCommandeOuverte(false)}
      />
      <ConventionIngenierieModal
        ouvert={conventionOuverte}
        onFermer={() => setConventionOuverte(false)}
        client={marche.nom}
        reference={marche.ref || marche.id}
      />
    </div>
  );
}
