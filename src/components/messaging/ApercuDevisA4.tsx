import type { ReactNode } from "react";
import type { EtudePac } from "../hvac/types";
import { LOGO_ARBRES } from "./marque";

type Pages = "rapport" | "devis" | "complet";

type Props = {
  etude: EtudePac;
  client: string;
  ville: string;
  projet: string;
  logoUrl?: string;
  pages?: Pages;
};

function euro(valeur: number): string {
  return Math.round(valeur).toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
}

function euroCentimes(valeur: number): string {
  return valeur.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function lignesMarche(etude: EtudePac): { designation: string; totalHt: number }[] {
  const montant = (id: string) => etude.devis.lignes.find((ligne) => ligne.id === id)?.totalHt ?? 0;
  const posePac = montant("pac") + montant("pose");
  const hydro = montant("tampon") + montant("decouplage");
  const miseEnService = montant("consuel");
  const desembouage = Math.max(0, etude.devis.totalHt - posePac - hydro - miseEnService);
  return [
    { designation: `Fourniture & pose PAC air/eau ${nombre(etude.puissancePacKw)} kW`, totalHt: posePac },
    { designation: "Désembouage machine DTU 65.16", totalHt: desembouage },
    { designation: `Découplage hydraulique & ballon tampon ${Math.round(etude.volumeTamponStandardL).toLocaleString("fr-FR")} L`, totalHt: hydro },
    { designation: "Mise en service & raccordements", totalHt: miseEnService },
  ];
}

function echeancier(resteAChargeTtc: number): { libelle: string; montant: number }[] {
  const signature = Math.round(resteAChargeTtc * 30) / 100;
  const demarrage = Math.round(resteAChargeTtc * 40) / 100;
  const solde = Math.round((resteAChargeTtc - signature - demarrage) * 100) / 100;
  return [
    { libelle: "Acompte de 30 % à la signature", montant: signature },
    { libelle: "40 % au démarrage des travaux", montant: demarrage },
    { libelle: "Solde de 30 % à la réception sans réserve", montant: solde },
  ];
}

function nombre(valeur: number, digits = 1): string {
  return valeur.toLocaleString("fr-FR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function SchemaBivalence({ etude, tint }: { etude: EtudePac; tint: number }) {
  const largeur = 680;
  const hauteur = 210;
  const gauche = 36;
  const droite = 16;
  const haut = 16;
  const bas = 28;
  const tMin = etude.textBase - 2;
  const tMax = Math.max(tint, tMin + 1);
  const pMax = Math.max(etude.pDepKw, etude.puissancePacKw, 1) * 1.2;
  const xOf = (t: number) => gauche + ((t - tMin) / (tMax - tMin)) * (largeur - gauche - droite);
  const yOf = (p: number) => haut + (1 - Math.max(0, p) / pMax) * (hauteur - haut - bas);
  const split = xOf(etude.tbiv ?? etude.textBase);
  const points = Array.from({ length: 25 }, (_, index) => {
    const t = tMin + ((tMax - tMin) * index) / 24;
    const pBat = etude.deltaK > 0 ? (etude.pDepKw * (tint - t)) / etude.deltaK : 0;
    const pPac = etude.puissancePacKw * (1 + 0.03 * (t - etude.textBase));
    return { bat: `${xOf(t)},${yOf(pBat)}`, pac: `${xOf(t)},${yOf(Math.max(0, pPac))}` };
  });
  return (
    <svg viewBox={`0 0 ${largeur} ${hauteur}`} className="h-40 w-full" role="img" aria-label="Schéma de bivalence">
      <rect x={gauche} y={haut} width={Math.max(0, split - gauche)} height={hauteur - haut - bas} fill="#ffedd5" />
      <rect x={split} y={haut} width={Math.max(0, largeur - droite - split)} height={hauteur - haut - bas} fill="#e0f2fe" />
      <line x1={split} y1={haut} x2={split} y2={hauteur - bas} stroke="#d97706" strokeDasharray="4 3" />
      <polyline fill="none" stroke="#0f172a" strokeWidth="2" points={points.map((point) => point.bat).join(" ")} />
      <polyline fill="none" stroke="#0284c7" strokeWidth="2.5" points={points.map((point) => point.pac).join(" ")} />
      <text x={gauche} y={hauteur - 8} fill="#475569" fontSize="11">{etude.textBase} °C</text>
      <text x={split} y={haut + 14} fill="#b45309" fontSize="11">{etude.tbiv === null ? "" : `Tbiv ${nombre(etude.tbiv)} °C`}</text>
      <text x={largeur - droite} y={hauteur - 8} textAnchor="end" fill="#475569" fontSize="11">{tint} °C</text>
    </svg>
  );
}

function Page({ children, page }: { children: ReactNode; page: string }) {
  return (
    <article data-page={page} className="flex min-h-[1020px] w-[760px] flex-col bg-white text-slate-900 shadow-xl">
      {children}
    </article>
  );
}

export default function ApercuDevisA4({ etude, client, ville, projet, logoUrl = LOGO_ARBRES, pages = "complet" }: Props) {
  const devis = etude.devis;
  const couverture = `${Math.round(etude.couvertureAnnuelle * 100)} %`;
  const retour = devis.retourAns === null ? "> 25 ans" : `${nombre(devis.retourAns)} ans`;
  const legende =
    etude.puissanceChaudiereKw > 0
      ? `PAC à 60 % de P_dep. Chaudière conservée en secours (${nombre(etude.puissanceChaudiereKw)} kW) sous Tbiv. Couverture annuelle ${couverture}.`
      : `Couverture à la température de base ${Math.round(Math.min(1, etude.ratioCouvertureBase) * 100)} %. Hypothèse +3 % de puissance PAC par degré.`;
  const hydro = [
    ["Débit primaire PAC", `${nombre(etude.debitPacM3h, 2)} m³/h`, "Delta T 5 K"],
    ["Débit équivalent chaudière", `${nombre(etude.debitChaudiereM3h, 2)} m³/h`, "Delta T 15 K"],
    ["Ballon tampon", `${Math.round(etude.volumeTamponStandardL).toLocaleString("fr-FR")} L`, `minimum ${Math.round(etude.volumeTamponL).toLocaleString("fr-FR")} L · 20 L/kW`],
    ["Découplage", `DN ${etude.bouteille.dn}`, `${etude.bouteille.preconisation} · ${nombre(etude.bouteille.vitesseMs, 2)} m/s`],
  ];

  const marche = lignesMarche(etude);
  const versements = echeancier(devis.resteAChargeTtc);
  const montrerRapport = pages !== "devis";
  const montrerDevis = pages !== "rapport";

  return (
    <div className="space-y-4" data-testid="apercu-devis-a4" data-pages={pages} data-pdep={etude.pDepKw} data-enr={Math.round(etude.couvertureAnnuelle * 100)}>
      {montrerRapport ? (
        <>
          {pages === "complet" ? <p className="text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Page 1 — Étude thermique</p> : null}
          <Page page="etude">
        <header className="flex items-center gap-4 bg-[#0a0f1d] px-6 py-4 text-white">
          <img src={logoUrl} alt="Logo des trois arbres ENERGIA CONSEIL IA" className="h-14 w-auto rounded-md bg-white px-2 py-1" />
          <div>
            <p className="text-base font-semibold tracking-tight">ENERGIA CONSEIL IA®</p>
            <p className="text-[11px] text-cyan-200">Bureau d'études thermiques & solaire — Contractant général</p>
          </div>
          <p className="ml-auto text-right font-mono text-[11px] text-emerald-200">{devis.numero}</p>
        </header>
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
        <div className="flex flex-1 flex-col px-6 py-5">
          <div className="grid grid-cols-3 gap-3 border border-slate-200 px-4 py-3 text-[12px]">
            <p><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Foyer</span>{client}</p>
            <p><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Site</span>{ville || "—"}</p>
            <p><span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">Projet</span>{projet || "Étude PAC"}</p>
          </div>
          <p className="mt-2 text-[11px] text-slate-500">
            {etude.departementNom} · Text base {etude.textBase} °C · zone CEE {etude.zone}
          </p>
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              ["Puissance thermique", `${nombre(etude.pDepKw)} kW`, `PAC ${nombre(etude.puissancePacKw)} kW`],
              ["Couverture EnR", couverture, "des kWh annuels"],
              ["Économies annuelles", euro(etude.economieAnnuelleEur), "avant aides du devis"],
              ["Temps de retour", retour, "reste à charge / économies"],
            ].map(([label, valeur, detail]) => (
              <div key={label} className="border border-slate-200 bg-slate-50 px-3 py-2">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 text-lg font-semibold text-[#0a0f1d]">{valeur}</p>
                <p className="text-[10px] text-slate-500">{detail}</p>
              </div>
            ))}
          </div>
          <h3 className="mt-5 border-b-2 border-cyan-500 pb-1 text-sm font-semibold">Schéma de bivalence</h3>
          <SchemaBivalence etude={etude} tint={etude.textBase + etude.deltaK} />
          <p className="text-[11px] leading-relaxed text-slate-600">{legende}</p>
          <h3 className="mt-4 border-b-2 border-cyan-500 pb-1 text-sm font-semibold">Synthèse hydraulique</h3>
          <ul className="mt-2 space-y-1.5">
            {hydro.map(([label, valeur, detail]) => (
              <li key={label} className="grid grid-cols-[180px_140px_1fr] items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px]">
                <span className="font-semibold uppercase tracking-wide text-slate-500">{label}</span>
                <span className="font-semibold">{valeur}</span>
                <span className="text-slate-500">{detail}</span>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-6 text-[10px] text-slate-400">ENERGIA CONSEIL IA® · 16 Rue Cuvier, 69006 Lyon · Marque déposée INPI n° 5213845 · Page 1</p>
        </div>
      </Page>
        </>
      ) : null}

      {montrerDevis ? (
        <>
          {pages === "complet" ? <p className="border-t border-dashed border-slate-400 pt-4 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Page 2 — Devis & marché chiffré</p> : null}
          <Page page="marche">
        <header className="flex items-center gap-3 bg-[#0a0f1d] px-6 py-3 text-white">
          <img src={logoUrl} alt="" className="h-10 w-auto rounded-md bg-white px-2 py-1" />
          <p className="text-sm font-semibold">Devis & marché de travaux</p>
          <p className="ml-auto font-mono text-[11px] text-emerald-200">{devis.numero}</p>
        </header>
        <div className="h-1 bg-gradient-to-r from-emerald-400 to-cyan-400" />
        <div className="flex flex-1 flex-col px-6 py-5">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-[#0a0f1d] text-left text-white">
                <th className="px-2 py-1.5 font-semibold">Désignation</th>
                <th className="px-2 py-1.5 text-right font-semibold">Quantité</th>
                <th className="px-2 py-1.5 text-right font-semibold">PU HT</th>
                <th className="px-2 py-1.5 text-right font-semibold">Total HT</th>
              </tr>
            </thead>
            <tbody>
              {marche.map((ligne, index) => (
                <tr key={ligne.designation} className="border-b border-slate-100">
                  <td className="px-2 py-1.5">{index + 1}. {ligne.designation}</td>
                  <td className="px-2 py-1.5 text-right">1 forfait</td>
                  <td className="px-2 py-1.5 text-right">{euro(ligne.totalHt)}</td>
                  <td className="px-2 py-1.5 text-right font-semibold">{euro(ligne.totalHt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 grid grid-cols-2 gap-3 text-[12px]">
            <div className="border border-orange-200 bg-orange-50 px-3 py-2 text-[11px] leading-relaxed text-orange-950">
              <p className="font-semibold">Avis juridique Julia</p>
              <p className="mt-1">Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. Validité 3 mois. QualiPAC. INPI n° 5213845.</p>
            </div>
            <div className="border border-slate-200">
              {[
                ["Fournitures HT", euro(devis.fournituresHt)],
                ["Pose et ingénierie HT", euro(devis.ingenierieHt)],
                ["Total HT", euro(devis.totalHt)],
                [`TVA ${(devis.tauxTva * 100).toLocaleString("fr-FR")} %`, euro(devis.tvaEur)],
                ["Total TTC", euro(devis.totalTtc)],
                ...devis.aides.filter((aide) => aide.eligible && aide.montantEur > 0).map((aide) => [aide.id.toUpperCase(), `− ${euro(aide.montantEur)}`] as [string, string]),
              ].map(([label, valeur]) => (
                <p key={label} className="flex justify-between px-3 py-1">
                  <span>{label}</span><span>{valeur}</span>
                </p>
              ))}
              <p className="flex justify-between bg-[#0a0f1d] px-3 py-2 font-semibold text-white">
                <span>Reste à charge TTC</span><span>{euro(devis.resteAChargeTtc)}</span>
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <table className="w-full border-collapse text-[11px]">
              <caption className="mb-1 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">Échéancier du reste à charge</caption>
              <tbody>
                {versements.map((versement) => (
                  <tr key={versement.libelle} className="border-b border-slate-200">
                    <td className="py-1.5 pr-2">{versement.libelle}</td>
                    <td className="py-1.5 text-right font-semibold">{euroCentimes(versement.montant)} TTC</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-2 border-dashed border-slate-500 px-3 py-2 text-[11px] leading-relaxed">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-600">Cadre réservé au client</p>
              <p className="mt-1">Mention manuscrite « Bon pour accord et marché de travaux accepté » + date et signature.</p>
              <p className="mt-5">Date : ____________________</p>
              <p className="mt-3">Signature : ____________________</p>
            </div>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-slate-600">Le déblocage des 40 % et du solde intervient après validation de Sylvain LEMBELEMBE (AMO).</p>
          <p className="mt-1 text-[11px] font-semibold text-[#0a0f1d]">Couvert par Garantie Décennale Calypso Assurances n° LUNPIB2604975 — Entreprise ENERGIA CONSEIL IA®️</p>
          <p className="mt-auto pt-6 text-[10px] text-slate-400">Sylvain LEMBELEMBE 06 10 59 68 98 · DAMIEN 06 72 68 09 68 · FABIEN 06 71 19 96 45 · Julia · MAR Antoine BARATIER — Cabinet C2ET · Page 2</p>
        </div>
      </Page>
        </>
      ) : null}
    </div>
  );
}
