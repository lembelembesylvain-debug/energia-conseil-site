import { AUDIT_REGLEMENTAIRE_BRUNEL, CHEMIN_AUDIT_AER_BRUNEL, economiesAnnuellesScenario3Brunel } from "../../lib/crm/operationnelCrm";

const COULEURS_DPE = {
  A: "#319834",
  B: "#52b153",
  C: "#c3d645",
  D: "#f7ec16",
  E: "#f0b50f",
  F: "#eb8235",
  G: "#e31d23",
};

function euroEntier(valeur) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);
}

function JaugeDpe({ titre, classe }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{titre}</p>
      <div className="mt-3 flex items-end gap-1">
        {Object.entries(COULEURS_DPE).map(([lettre, couleur]) => (
          <div key={lettre} className="flex-1 text-center">
            <div
              className="rounded-t-md"
              style={{
                background: couleur,
                height: lettre === classe ? 72 : 28 + (lettre.charCodeAt(0) - 65) * 4,
                outline: lettre === classe ? "3px solid #0f172a" : "none",
              }}
            />
            <p className={`mt-1 text-xs ${lettre === classe ? "font-bold text-slate-900" : "text-slate-400"}`}>{lettre}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-3xl font-bold" style={{ color: COULEURS_DPE[classe] }}>
        {classe}
      </p>
    </div>
  );
}

export default function BilanEnergetiqueAuditBrunel() {
  const audit = AUDIT_REGLEMENTAIRE_BRUNEL;
  const scenario3 = audit.scenarios.find((item) => item.id === "scenario-3");
  const economies = economiesAnnuellesScenario3Brunel(audit);

  return (
    <section className="space-y-4" data-testid="bilan-energetique-audit-brunel">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Bilan énergétique officiel (audit MAR)</h3>
          <p className="mt-1 text-sm text-slate-600">
            Audit {audit.numero} · visite et établissement le 24/09/2026 · {audit.auditeur.cabinet} — {audit.auditeur.nom} · valable jusqu'au 23/09/2031
          </p>
        </div>
        <a
          href={CHEMIN_AUDIT_AER_BRUNEL}
          download="BRUNEL_1_1_1_0_AER.pdf"
          className="rounded-xl bg-[#1b4332] px-4 py-2 text-sm font-semibold text-white"
          data-testid="telecharger-audit-aer-brunel"
        >
          Télécharger l'audit complet (52 pages)
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Chiffre label="Surface de référence" valeur="82,90 m²" detail="Altitude 524 m · avant 1948 · 2 niveaux" />
        <Chiffre label="Énergie primaire initiale" valeur="460 kWhEP/m².an" detail="242 kWhEF/m².an · passoire G" />
        <Chiffre label="GES initial" valeur="18 kg CO₂/m².an" detail="Reconstitué des réductions publiées (−83 % = −15 kg)" />
        <Chiffre label="Facture initiale" valeur="3 470 à 4 720 €/an" detail="Prix indexés au 1er janvier 2023" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1.2fr]">
        <JaugeDpe titre="Avant travaux" classe="G" />
        <JaugeDpe titre="Après scénario 3" classe="C" />
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Économies annuelles — scénario retenu</p>
          <p className="mt-2 text-4xl font-bold text-emerald-900" data-testid="compteur-economies-brunel">
            {euroEntier(economies.eurosMilieu)}
            <span className="text-lg font-semibold"> /an</span>
          </p>
          <p className="mt-1 text-sm text-emerald-900">Milieu de fourchette (facture 3 470–4 720 € vers 1 520–2 090 €).</p>
          <p className="mt-2 text-sm text-emerald-900">
            {economies.kwhEpAn.toLocaleString("fr-FR")} kWhEP/an · {economies.gainPourcentEp} % d'énergie primaire
          </p>
          <p className="mt-2 text-sm font-medium text-emerald-950">
            73 % dépasse les seuils Anah de 35 % et de 55 %. Saut de 4 classes, G vers C (123 kWhEP/m².an).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#1a3c5e] text-white">
            <tr>
              <th className="px-3 py-2">Critère</th>
              <th className="px-3 py-2">Scénario 1</th>
              <th className="px-3 py-2">Scénario 2</th>
              <th className="bg-emerald-800 px-3 py-2">Scénario 3 — retenu</th>
            </tr>
          </thead>
          <tbody>
            <Ligne label="Parcours DPE" a="G → B" b="G → D → B" c="G → C" />
            <Ligne label="kWhEP/m².an après" a="77 (classe B)" b="190 puis 77" c="123 (classe C)" />
            <Ligne label="Gain énergie primaire" a="−83 % (−383)" b="−59 % puis −83 %" c="−73 % (−337)" />
            <Ligne label="Facture après" a="670 à 940 €" b="1 480–2 040 € puis 670–940 €" c="1 520 à 2 090 €" />
            <Ligne label="Investissement audit TTC" a="~46 950 €" b="~26 700 € + ~20 250 €" c="~31 450 €" />
            <Ligne
              label="Travaux"
              a="Menuiseries, ITI, combles, VMC, PAC, CET"
              b="Étape 1 enveloppe · étape 2 systèmes"
              c="Menuiseries, porte, combles, VMC, PAC, CET — sans ITI"
            />
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h4 className="font-semibold text-slate-900">Lots du scénario 3 (page 18)</h4>
        <p className="mt-1 text-sm text-slate-600">
          L'audit donne le gain global (−337 kWhEP/m².an, −178 kWhEF/m².an, −14 kg CO₂/m².an). Il ne répartit pas ce gain en kWh par lot.
          La PAC y est décrite en air/air, sans marque.
        </p>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {scenario3.travaux.map((lot) => (
            <li key={lot.poste} className="rounded-xl bg-slate-50 px-3 py-2 text-sm">
              <span className="font-semibold text-slate-900">{lot.poste}</span>
              <span className="text-slate-600"> — {lot.detail}</span>
              <span className="block font-medium text-slate-800">{euroEntier(lot.coutTtcEur)} TTC estimés</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-600">
          Le scénario 3 aménage l'ancienne étable et le grenier. La surface de référence après travaux devient 131,88 m² (hauteur moyenne 2,50 m). Ubat après travaux : 0,874 W/(m².K).
        </p>
      </div>

      <p className="text-xs text-slate-500">
        Estimations de l'audit C2ET au 24/09/2026, indexées sur les prix de l'énergie au 01/01/2023. Elles ne constituent pas un devis.
        Le marché ENERGIA reste le devis n°1. Adresse portée sur l'audit : {audit.bati.adresseAudit}. Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
      </p>
    </section>
  );
}

function Chiffre({ label, valeur, detail }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-900">{valeur}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function Ligne({ label, a, b, c }) {
  return (
    <tr className="border-t border-slate-100">
      <th className="px-3 py-2 font-medium text-slate-700">{label}</th>
      <td className="bg-[#f0fdf4] px-3 py-2">{a}</td>
      <td className="bg-[#f0f9ff] px-3 py-2">{b}</td>
      <td className="bg-emerald-50 px-3 py-2 font-medium">{c}</td>
    </tr>
  );
}
