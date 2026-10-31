/**
 * Devis contractant général — M. David Emmanuel PEREIRA, Nervieux.
 * Réf. DEV-2026-PEREIRA-01 — 26 octobre 2026.
 * Marché de travaux de Contractant Général : 30 710,90 € HT / 32 400,00 € TTC. Reste à charge estimé 16 900,00 €.
 * Distinct du contrat verrouillé CONTRATS-2026-PEREIRA-NERVIEUX-SANS-ITI (16/09/2026).
 */
import { useEffect } from "react";
import { LOGO_ENERGIA_CONTRAT_PATH } from "../../lib/crm/contratContractantGeneralHtml.js";
import { RIB_QONTO } from "../../lib/crm/paradesAntiFuite.js";

export const REFERENCE = "DEV-2026-PEREIRA-01";
const DATE_DEVIS = "26 octobre 2026";

type Lot = {
  n: number;
  titre: string;
  detail: string;
  ht: number;
  direction?: boolean;
};

/** Ordre d'exécution : isolation → menuiseries → VMC → dépose fioul → PAC → ballon → pilotage. */
const LOTS: Lot[] = [
  {
    n: 1,
    titre: "Lot 1 : Isolation des combles perdus — 60 m², R ≥ 7,0",
    detail: "Laine déroulée sur combles perdus. Exclusion des 70 m² de rampants. Artisan RGE.",
    ht: 1185,
  },
  {
    n: 2,
    titre: "Lot 2 : Isolation du plancher bas — 19 m², R ≥ 3,0",
    detail:
      "Sous-face cave accessible. Isolation des murs (ITI) exclue : zone ABF et préservation des 164 m² habitables.",
    ht: 3135.19,
  },
  {
    n: 3,
    titre: "Lot 3 : Menuiseries extérieures — 19,38 m², 10 châssis",
    detail: "7 fenêtres + 3 châssis fixes, Uw ≤ 1,30. Exclusion des 3 Velux. Teinte à valider avec l’ABF.",
    ht: 6557.14,
  },
  {
    n: 4,
    titre: "Lot 4 : Ventilation hygroréglable type Hygro B",
    detail: "Centrale basse consommation, réseau de conduits isolés et bouches hygroréglables. Pose après isolation.",
    ht: 1160.9,
  },
  {
    n: 5,
    titre: "Lot 5 : Dépose chaudière fioul, désembouage et pot à boue",
    detail:
      "Neutralisation, évacuation en filière agréée (BSD), désembouage du réseau fonte, filtre magnétique (DTU 65.16).",
    ht: 1500,
  },
  {
    n: 6,
    titre: "Lot 6 : PAC air/eau haute température — chauffage seul",
    detail:
      "Réseau radiateurs fonte. Dimensionnement après isolation (combles, plancher, menuiseries). Puissance confirmée par note de calcul avant commande usine. ECS par ballon séparé.",
    ht: 9772.67,
  },
  {
    n: 7,
    titre: "Lot 7 : Ballon thermodynamique 250 L",
    detail: "Chauffe-eau thermodynamique indépendant, COP ≥ 3,0. Pose après la PAC.",
    ht: 2200,
  },
  {
    n: 8,
    titre: "Lot 8 : Direction, Pilotage & Responsabilité de Contractant Général",
    detail:
      "Coordination technique, garantie de parfait achèvement, interlocuteur unique et réception de chantier. Sylvain LEMBELEMBE.",
    ht: 5200,
    direction: true,
  },
];

const TOTAL_HT = 30710.9;
const TVA = 1689.1;
const TOTAL_TTC = 32400;
const MPR = 11500;
const CEE = 4000;
const AIDES = 15500;
const RAC = 16900;

function eur(n: number) {
  return (
    n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}

const PRINT_CSS = `
  @page { size: A4 portrait; margin: 10mm; }
  @media print {
    html, body, #root { background: #fff !important; margin: 0 !important; }
    .devis-toolbar { display: none !important; }
    .devis-sheet { box-shadow: none !important; margin: 0 !important; max-width: none !important; }
    .devis-sheet + .devis-sheet { break-before: page; page-break-before: always; }
  }
`;

export const DevisPereira: React.FC = () => {
  useEffect(() => {
    const precedent = document.title;
    document.title = `${REFERENCE} — PEREIRA`;
    return () => {
      document.title = precedent;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-200 text-slate-800">
      <style>{PRINT_CSS}</style>
      <div className="devis-toolbar sticky top-0 z-20 flex items-center justify-between gap-3 bg-slate-900 px-4 py-3 text-white print:hidden">
        <p className="text-sm font-semibold">
          {REFERENCE} — M. David Emmanuel PEREIRA — {eur(RAC)} TTC estimés
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold uppercase tracking-wide"
        >
          Imprimer / PDF
        </button>
      </div>

      <div className="devis-sheet mx-auto my-6 max-w-4xl bg-white p-8 font-sans text-xs leading-relaxed shadow-lg print:my-0 print:p-0 print:shadow-none">
        <div className="mb-6 flex items-start justify-between border-b-2 border-emerald-600 pb-4">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <img
                src={LOGO_ENERGIA_CONTRAT_PATH}
                alt="ENERGIA CONSEIL IA"
                className="h-12 w-auto object-contain"
              />
              <div>
                <h1 className="text-lg font-extrabold tracking-tight text-slate-900 uppercase">
                  ENERGIA CONSEIL IA<span className="text-emerald-600">®</span>
                </h1>
                <p className="text-[10px] font-semibold tracking-wider text-emerald-700 uppercase">
                  Ensemblier & Contractant Général
                </p>
              </div>
            </div>
            <p className="text-slate-600">SASU au capital de 100 € — Marque INPI n° 5213845</p>
            <p className="text-slate-600">16 Rue Cuvier, 69006 Lyon</p>
            <p className="text-slate-600">SIRET : 941 819 427 00019 | RCS Lyon 941 819 427</p>
            <p className="text-slate-600">TVA Intra. : FR01941819427</p>
            <p className="font-medium text-slate-600">
              Tél : 06 10 59 68 98 | contact@energia-conseil-ia.com
            </p>
          </div>

          <div className="w-72 rounded-lg border border-slate-200 bg-slate-50 p-4 text-right">
            <span className="mb-2 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase">
              Devis Officiel Contractant Général
            </span>
            <p className="text-sm font-bold text-slate-900">Réf : {REFERENCE}</p>
            <p className="mb-2 text-[11px] text-slate-500">Date : {DATE_DEVIS} — validité 3 mois</p>
            <div className="border-t border-slate-200 pt-2 text-left">
              <p className="font-bold text-slate-800">M. David Emmanuel PEREIRA</p>
              <p className="text-slate-600">1 Route de Saint-Germain-Laval</p>
              <p className="text-slate-600">42510 NERVIEUX</p>
              <p className="mt-1 text-[10px] font-semibold text-amber-700">
                Zone patrimoniale ABF (périmètre Croix, XVIIe)
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Profil MaPrimeRénov’ Violet — RFR 27 522 €, 1 part, province. DPE F → C visé, sans ITI.
              </p>
            </div>
          </div>
        </div>

        <h2 className="mb-2 text-[11px] font-bold tracking-wide text-slate-900 uppercase">
          II. Détail des travaux — ordre d’exécution
        </h2>
        <p className="mb-2 text-[10px] text-slate-500">
          Isolation des combles, puis plancher, puis menuiseries, puis VMC, puis dépose fioul et PAC,
          puis ballon. Le lot 8 (pilotage) court sur toute la durée. TVA 5,5 % sur l’ensemble du marché.
        </p>
        <table className="mb-4 w-full border-collapse">
          <thead>
            <tr className="bg-slate-800 text-left text-[10px] text-white">
              <th className="px-2 py-1.5 font-semibold">Désignation</th>
              <th className="w-16 px-2 py-1.5 text-center font-semibold">TVA</th>
              <th className="w-28 px-2 py-1.5 text-right font-semibold">Total HT</th>
            </tr>
          </thead>
          <tbody>
            {LOTS.map((lot) => (
              <tr key={lot.n} className={lot.direction ? "bg-emerald-50/70" : "border-b border-slate-100"}>
                <td className="px-2 py-1.5">
                  <span className={lot.direction ? "font-semibold text-emerald-950" : "font-semibold text-slate-900"}>
                    {lot.titre}
                  </span>
                  <p className={lot.direction ? "text-[10px] text-emerald-800" : "text-[10px] text-slate-500"}>
                    {lot.detail}
                  </p>
                </td>
                <td className={`px-2 py-1.5 text-center ${lot.direction ? "text-emerald-800" : "text-slate-600"}`}>
                  5,5 %
                </td>
                <td
                  className={`px-2 py-1.5 text-right font-medium ${lot.direction ? "font-bold text-emerald-950" : ""}`}
                >
                  {eur(lot.ht)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-emerald-300 bg-emerald-50/60 p-3">
            <h3 className="mb-1.5 flex items-center gap-1 text-xs font-bold text-emerald-950">
              <span>🏛️</span> Subventions d’État estimées (mandataire administratif)
            </h3>
            <p className="mb-1.5 text-[9px] font-semibold text-emerald-900">
              Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels
              et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
            </p>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-700">
                <span>MaPrimeRénov’ Parcours Accompagné (profil Violet) :</span>
                <span className="font-semibold text-emerald-700">- {eur(MPR)}</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Prime CEE Coup de pouce sortie de fioul :</span>
                <span className="font-semibold text-emerald-700">- {eur(CEE)}</span>
              </div>
              <div className="flex justify-between border-t border-emerald-200 pt-1 font-bold text-emerald-900">
                <span>Total des aides estimées :</span>
                <span>- {eur(AIDES)}</span>
              </div>
            </div>
            <p className="mt-2 text-[9px] text-slate-500 italic">
              Dossier instruit avec le MAR Antoine BARATIER – Cabinet C2ET. En parcours accompagné, la
              prime CEE chauffage peut être intégrée au forfait MPR et ne pas s’ajouter. Si l’instruction
              retient le non-cumul, le reste à charge estimé passe à {eur(RAC + CEE)} TTC.
            </p>
          </div>

          <div className="flex flex-col justify-between rounded-lg bg-slate-100 p-3">
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Montant total HT :</span>
                <span className="font-medium">{eur(TOTAL_HT)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>TVA (5,5 %) :</span>
                <span className="font-medium">{eur(TVA)}</span>
              </div>
              <div className="flex justify-between border-t border-slate-300 pt-1 font-bold text-slate-800">
                <span>Montant total travaux TTC :</span>
                <span>{eur(TOTAL_TTC)}</span>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between rounded border-2 border-emerald-600 bg-white p-2 shadow-sm">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase">
                  Reste à charge net estimé
                </p>
                <p className="text-[9px] font-semibold text-emerald-700">
                  Sous plafond 17 000 € si les deux aides sont confirmées
                </p>
              </div>
              <span className="text-base font-extrabold text-emerald-700">{eur(RAC)} TTC</span>
            </div>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <div>
            <h4 className="mb-1 flex items-center gap-1 text-[11px] font-bold text-slate-900">
              <span>💳</span> Coordonnées bancaires (règlement par virement)
            </h4>
            <p className="text-[10px] text-slate-600">
              Bénéficiaire : <strong>{RIB_QONTO.titulaire}</strong>
            </p>
            <p className="text-[10px] text-slate-600">
              Banque : <strong>{RIB_QONTO.banque}</strong>
            </p>
            <p className="mt-1 rounded border border-slate-200 bg-white p-1 font-mono text-[10px] text-slate-800">
              IBAN : <strong>{RIB_QONTO.iban}</strong>
            </p>
            <p className="mt-0.5 font-mono text-[10px] text-slate-600">
              BIC : <strong>{RIB_QONTO.bic}</strong>
            </p>
            <p className="mt-1 text-[9px] text-slate-500">Libellé : Acompte {REFERENCE}</p>
          </div>
          <div>
            <h4 className="mb-1 text-[11px] font-bold text-slate-900">
              Échéancier du reste à charge estimé ({eur(RAC)})
            </h4>
            <ul className="space-y-0.5 text-[10px] text-slate-600">
              <li>
                • <strong>Acompte à la signature (30 %) :</strong> {eur(5070)} TTC — verrouille la
                commande, après levée des conditions suspensives.
              </li>
              <li>
                • <strong>Mi-chantier (40 %) :</strong> {eur(6760)} TTC — déblocage uniquement après
                validation de Sylvain LEMBELEMBE. Financement FABIEN activable.
              </li>
              <li>
                • <strong>Solde à réception (30 %) :</strong> {eur(5070)} TTC — après PV sans réserve
                (Sylvain, MAR et client).
              </li>
            </ul>
            <p className="mt-1 text-[9px] text-slate-500">
              Paiement 30/40/30 : 30 % à la signature, 40 % mi-chantier après validation de Sylvain
              LEMBELEMBE (AMO ENERGIA-CONSEIL IA®), 30 % à réception.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-300 pt-2">
          <p className="mb-3 text-[9px] leading-tight text-slate-500">
            <strong>Conditions suspensives :</strong> le présent marché est conditionné à l’obtention de
            la déclaration préalable auprès de la mairie de Nervieux et de l’Architecte des Bâtiments de
            France, et à la notification d’accord des subventions Anah. Aucun début de travaux ne peut
            être engagé avant la levée de ces conditions. Démarrer avant l’accord écrit de l’ANAH
            entraîne le refus total de MaPrimeRénov’.
          </p>
          <div className="grid grid-cols-2 gap-8 text-[10px]">
            <div>
              <p className="mb-1 font-bold text-slate-800">Pour ENERGIA CONSEIL IA® :</p>
              <p className="text-slate-600">Sylvain LEMBELEMBE, Président</p>
              <div className="flex h-14 items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 italic">
                Cachet et signature
              </div>
            </div>
            <div>
              <p className="mb-1 font-bold text-slate-800">Pour le client (M. David Emmanuel PEREIRA) :</p>
              <p className="text-[9px] text-slate-500 italic">
                Mention manuscrite « Bon pour accord et marché de travaux » :
              </p>
              <div className="flex h-14 items-center justify-center rounded border border-dashed border-slate-300 text-slate-400 italic">
                Date et signature du client
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="devis-sheet mx-auto mb-8 max-w-4xl bg-white p-8 font-sans text-xs leading-relaxed shadow-lg print:mb-0 print:p-0 print:shadow-none">
        <h2 className="mb-2 border-b-2 border-emerald-600 pb-1 text-sm font-extrabold text-slate-900 uppercase">
          V. Plan de financement et scénarios de démarrage
        </h2>
        <p className="mb-2 text-[10px] font-bold text-emerald-800">
          NE JAMAIS SIGNER LES DEVIS DÉFINITIFS AVANT L’ACCORD ÉCRIT DE L’ANAH (sinon perte définitive
          et irrémédiable du MPR).
        </p>

        <table className="mb-3 w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-[#1a3c5e] text-white">
              <th className="px-2 py-1 text-left">Critère</th>
              <th className="bg-[#f0fdf4] px-2 py-1 text-left text-emerald-950">Scénario A – Aides Max</th>
              <th className="bg-[#f0f9ff] px-2 py-1 text-left text-sky-950">Scénario B – Rapide</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Délai démarrage", "3 à 6 mois", "3 semaines"],
              ["MaPrimeRénov’", "Oui", "Non"],
              ["Éco-PTZ", "Oui", "Oui"],
              ["Prêt FABIEN", "Oui", "Oui"],
              ["CEE (hors ITE/ITI)", "Oui", "Oui"],
              ["Financement max", "MPR + 125 000 EUR", "125 000 EUR"],
              ["Reste à charge", "Minimisé", "Plus élevé"],
              ["Contrainte", "Accord ANAH obligatoire", "Aucune"],
              ["Idéal pour", "BLEU / JAUNE / VIOLET", "ROSE / Non éligible / Pressé"],
            ].map(([critere, a, b]) => (
              <tr key={critere} className="border-b border-slate-200">
                <td className="px-2 py-1 font-medium">{critere}</td>
                <td className="bg-[#f0fdf4] px-2 py-1">{a}</td>
                <td className="bg-[#f0f9ff] px-2 py-1">{b}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mb-3 rounded border border-[#f97316] bg-white p-3 shadow-sm">
          <p className="mb-1 text-[11px] font-bold">Choix du client — scénarios exclusifs</p>
          <p className="text-[10px]">☐ Scénario A : attente de l’accord ANAH (3 à 6 mois). Profil Violet recommandé.</p>
          <p className="text-[10px]">
            ☐ Scénario B : renonciation définitive au MPR et démarrage rapide (3 semaines).
          </p>
          <p className="mt-2 text-[10px]">Fait à ________________ le ________________ Signature client ________________</p>
        </div>

        <div className="mb-3 rounded border-l-4 border-[#f97316] bg-[#fff7ed] p-3 text-[10px]">
          <p className="font-bold">⚖️ Avis juridique — scénarios</p>
          <p>
            Les deux scénarios sont exclusifs. Scénario A : accord ANAH obligatoire avant toute signature
            de devis définitif, sinon perte définitive et irrémédiable du MPR. Scénario B : renonciation
            définitive au MPR. ENERGIA-CONSEIL IA® n’est pas responsable du non-respect de ce choix par
            le client.
          </p>
          <p className="mt-1 italic">Avis établi par Julia – Juriste ENERGIA-CONSEIL IA® – Mars 2026</p>
        </div>

        <div className="mb-3 text-[10px] text-slate-700">
          <p>
            <strong>Éco-PTZ et prêt travaux :</strong> FABIEN – VIVONS COURTIER – 06 71 19 96 45. Prêt
            jusqu’à 75 000 €. Éco-PTZ jusqu’à 50 000 € à taux 0 %. Apport 0 € possible. Acceptation 48–72 h.
            FABIEN finance le montant total des travaux, pas seulement le reste à charge.
          </p>
          <p>
            <strong>MaPrimeRénov’ :</strong> MAR Antoine BARATIER – Cabinet C2ET. Dépôt et suivi ANAH.
          </p>
          <p>
            <strong>AMO :</strong> Sylvain LEMBELEMBE – 06 10 59 68 98 – contact@energia-conseil-ia.com
          </p>
        </div>

        <h2 className="mb-1 text-[11px] font-bold uppercase">X. Avis juridique Julia</h2>
        <div className="mb-3 space-y-1 text-[10px] text-slate-700">
          <p>
            <strong>Conformité.</strong> Artisans RGE. Ordre isolation avant chauffage. Profil Violet 2026
            (RFR 27 522 €, 1 part, hors IDF). Plafond parcours 3 classes non dépassé. Cumul d’aides estimé
            inférieur à 100 % du TTC et à l’écrêtement Violet de 80 %.
          </p>
          <p>
            <strong>Contraintes.</strong> Déclaration préalable et accord ABF suspensifs. ITI exclue. TVA
            5,5 % présentée sur l’ensemble du marché, y compris le lot 8 ; une requalification fiscale du
            lot de direction à 20 % ferait l’objet d’un avenant avant commande. La puissance de la PAC est
            arrêtée après note de calcul post-isolation : un surcroît de puissance ouvre un avenant.
          </p>
          <p>
            <strong>Clause Julia Protection Aides.</strong> Responsabilité d’ENERGIA plafonnée à 2 000 € en
            cas d’écart supérieur à 10 % imputable à une erreur prouvée d’ENERGIA ; 0 % si l’écart vient
            du client ou d’une décision ANAH/CEE. Le client certifie l’exactitude des informations
            d’éligibilité.
          </p>
          <p>
            <strong>Avertissement.</strong> Ne pas signer le devis définitif avant l’accord écrit ANAH.
            Validité 3 mois. Assurance dommages-ouvrage recommandée ; ENERGIA n’est pas responsable de son
            défaut de souscription. Photos avant / pendant / après et PV à chaque étape. Aucun déblocage
            des 40 % ni des 30 % de réception sans validation de Sylvain LEMBELEMBE.
          </p>
          <p className="italic">
            Avis établi sous la responsabilité de Julia, juriste. 26 octobre 2026. Clause Julia — plafond
            2 000 €.
          </p>
        </div>

        <h2 className="mb-1 text-[11px] font-bold uppercase">XI. Contacts</h2>
        <p className="text-[10px] leading-relaxed text-slate-700">
          Sylvain LEMBELEMBE (AMO) 06 10 59 68 98 — contact@energia-conseil-ia.com · DAMIEN (Commercial)
          06 72 68 09 68 — damien.srdconseil@gmail.com · FABIEN (VIVONS COURTIER) 06 71 19 96 45 · Julia
          (Juriste) · MAR Antoine BARATIER – Cabinet C2ET.
        </p>
        <p className="mt-2 text-[9px] text-slate-500">
          ENERGIA-CONSEIL IA® — SIRET 94181942700019 — RCS Lyon 941819427 — 16 Rue Cuvier, 69006 Lyon.
          Document confidentiel, année 2026. Les 12 protections contractuelles (planning artisans, chantier
          propre, réserve de propriété, pénalités, DO, révision BT01 au-delà de 60 jours, force majeure,
          annulation, litiges à Lyon, RGPD, malfaçons) figurent aux conditions générales du marché de
          contractant général.
        </p>
      </div>
    </div>
  );
};

export default DevisPereira;
