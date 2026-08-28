import { useCallback, useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

const LEGAL =
  "Informations indicatives à confirmer par les professionnels RGE et le MAR.";

const SENSITIVE_QUERY =
  /\b(marge[s]?(\s*(nette[s]?|commerciale[s]?|interne[s]?|brute[s]?))?|co[uû]ts?\s*d['’]?achat|prix\s*d['’]?achat|tarif[s]?\s*fournisseur|prix\s*fournisseur|co[uû]ts?\s*mat[eé]riel[s]?|markup)\b/i;

const REFUS_MARGES =
  "Je ne communique pas les marges nettes ni les coûts d’achat matériels : ces données restent internes à ENERGIA-CONSEIL IA®. Je peux t’aider sur le technique (ITI pisé, PAC, ordre des travaux), le financement UMAFI, les aides 2026 à titre indicatif, ou la synthèse d’audit côté client.";

const QUICK_ACTIONS = [
  { id: "iti-pise", label: "Expliquer l'ITI Pisé" },
  { id: "umafi", label: "Simuler le financement UMAFI" },
  { id: "pac", label: "Comparer les PAC" },
  { id: "synthese", label: "Synthèse de l'audit" },
] as const;

type QuickActionId = (typeof QUICK_ACTIONS)[number]["id"];

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type EnergiaCoPilotProps = {
  /** Synthèse d’audit côté client uniquement (jamais de marges ni coûts d’achat). */
  syntheseAudit?: string;
};

const REPONSE_ITI_PISE = `ITI sur pisé / béton de terre : le mur doit rester perspirant.

• Privilégier des isolants ouverts à la vapeur (fibre de bois, liège, chanvre, enduits terre/chaux) plutôt qu’un complexe étanche type PSE + pare-vapeur trop fermé.
• ITI possible en doublage, avec attention aux ponts thermiques (tableaux, planchers) et à la condensation interstitielle.
• ITE possible avec enduits adaptés au support terre — à valider après diagnostic de façade (fissures, humidité, salissures).
• Objectif technique post-travaux : R ≥ 3,7 (RT2012) à R ≥ 4–5 (RE2020), sous réserve du support et du MAR.
• Ordre impératif : isolation (combles puis murs puis planchers) avant menuiseries, VMC et PAC.
• ITI en geste isolé : exclu MaPrimeRénov’ 2026 — à intégrer dans un parcours d’ampleur.

À confirmer sur site par l’artisan RGE et le MAR (humidité, fissures, compatibilité des enduits).`;

const REPONSE_UMAFI = `Financement UMAFI — simulation d’orientation (aucun taux, aucun accord garanti).

• Interlocuteur : FABIEN — UMAFI, mandataire IOBSP (ORIAS 26 009 255) — 06 71 19 96 45 — code apporteur D4.
• Principe : étude de capacité, puis montage Éco-PTZ (jusqu’à 50 000 € à taux 0 % si éligible) et/ou prêt travaux. Apport 0 € possible selon dossier.
• Convention B : aucun taux, montant ou accord n’est affiché ici. Acceptation sous réserve d’étude et des partenaires bancaires.
• Règle ANAH : ne jamais signer les devis définitifs ni démarrer les travaux avant l’accord écrit MaPrimeRénov’ (sinon perte définitive du MPR).
• Calculette travaux : umafi.fr (source=D4). Regroupement de crédits possible si reste à charge élevé.
• Déblocage chantier type 30 / 40 / 30 : 40 % mi-chantier uniquement après validation Sylvain LEMBELEMBE (AMO).

Prochaine étape Damien : envoyer le client vers FABIEN pour l’étude de capacité, sans citer de mensualité figée.`;

const REPONSE_PAC = `Comparaison PAC — choix technique, jamais un tarif d’achat.

• PAC air-eau : chauffage + ECS possible, radiateurs ou plancher, COP ≥ 4 visé. Adaptée après isolation (besoins réduits). Dimensionnement = surface × coef post-isolation × marge 1,1–1,2 (ex. RE2020 ~ 0,03–0,05 kW/m²).
• PAC air-air (multi-split) : confort pièce par pièce, pas d’ECS. SCOP à viser ≥ 3,5–4. Souvent retenue quand le réseau hydraulique est absent ou vétuste (ex. fioul + radiateurs HT).
• PAC géothermie : plus stable, COP ≥ 4,5, coût et contrainte de forage — rare en rénovation standard.
• Erreur fatale : dimensionner la PAC avant l’isolation = surpuissance et surcoût client de l’ordre de 4 000–6 000 €.
• Aides 2026 (indicatif, geste par geste PAC air-eau) : 5 000 / 4 000 / 3 000 / 0 € selon profil Bleu / Jaune / Violet / Rose — à valider ANAH. Parcours d’ampleur : selon gain de classes et plafonds.

Sur un pisé / fioul : isoler d’abord, puis recaler la puissance. Le MAR et l’installateur RGE tranchent air-eau vs air-air selon émetteurs et ECS.`;

const REPONSE_SYNTHESE_DEFAUT = `Synthèse type — à coller sur le dossier ouvert.

1. Enveloppe : combles → murs (ITI ou ITE) → planchers. Isolation avant tout système.
2. Menuiseries après l’isolation des murs (limiter les ponts).
3. VMC (hygro B ou double flux) après étanchéité/isolation.
4. PAC et ECS thermodynamique dimensionnés post-isolation.
5. Aides 2026 : MaPrimeRénov’ parcours, CEE, Éco-PTZ — montants à titre indicatif, définitifs après ANAH / CEE.
6. Financement : UMAFI (FABIEN) + MAR Léo-Energy. Travaux après accord ANAH.

Ouvre « Expliquer l'ITI Pisé », « Comparer les PAC » ou « Simuler le financement UMAFI » pour le détail.`;

const REPONSE_ORDRE = `Ordre optimal ENERGIA (non négociable) :
1. Isolation combles → 2. Murs (ITE/ITI) → 3. Planchers → 4. Fenêtres → 5. VMC → 6. PAC → 7. Ballon thermo → 8. Photovoltaïque.

Isolation avant chauffage toujours. PAC ou VMC avant isolation = inefficacité et risque d’aides.`;

const REPONSE_AIDES = `Aides financières 2026 (estimation à titre indicatif).
À valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.

• MaPrimeRénov’ parcours : plafonds 30 000 € HT (2 classes) / 40 000 € HT (3+). Taux Bleu 80 %, Jaune 60 %, Violet 45 %, Rose 10 % (hors IDF, 1–3 parts — seuils 2026).
• Écrêtement TTC : Bleu 100 %, Jaune/Violet 80 %, Rose 50 %.
• CEE : fourchette variable 20–40 % selon obligés. Coup de pouce ~ 4 700 € (2 classes) / 5 800 € (3+).
• Éco-PTZ : 15 / 25 / 50 k€ selon nombre d’actions — taux 0 %, artisans RGE.

Aucun cumul au-delà de 100 % des travaux. ITI en geste isolé exclu MPR 2026.`;

const ACCUEIL =
  "Co-Pilote IA — assistant interne Damien. Pose une question ou utilise un raccourci. Je reste sur le technique, les aides indicatives et le parcours client — jamais sur les marges ni les achats fournisseurs.";

function isSensitive(text: string): boolean {
  const t = text.toLowerCase();
  if (/\bmarge/.test(t) && /dimensionnement|coef(?:ficient)?|s[eé]curit[eé]/.test(t)) {
    return false;
  }
  return SENSITIVE_QUERY.test(text);
}

function matchLibre(text: string): QuickActionId | "ordre" | "aides" | "libre" {
  const t = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  if (/\b(pise|iti|terre|perspirant)\b/.test(t)) return "iti-pise";
  if (/\b(umafi|financement|eco-?ptz|pret|courtier|fabien)\b/.test(t)) return "umafi";
  if (/\b(pac|pompe a chaleur|air-eau|air\/eau|air-air|geotherm)/.test(t)) return "pac";
  if (/\b(synthese|resume|audit|pignard|pereira)\b/.test(t)) return "synthese";
  if (/\b(ordre|travaux|combles|avant chauffage)\b/.test(t)) return "ordre";
  if (/\b(aide|maprimerenov|mpr|cee|anah|bareme)\b/.test(t)) return "aides";
  return "libre";
}

function reponseLibre(): string {
  return `Je n’ai pas de fiche exacte pour cette formulation. Tu peux me demander :
• l’ITI sur pisé (matériaux perspirants, R visé, parcours MPR) ;
• une orientation financement UMAFI (sans taux) ;
• une comparaison PAC air-eau / air-air / géo ;
• la synthèse de l’audit ouvert.

${LEGAL}`;
}

function IconRobot({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="8" width="14" height="11" rx="3" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="9.25" cy="13" r="1.25" fill="currentColor" />
      <circle cx="14.75" cy="13" r="1.25" fill="currentColor" />
      <path d="M12 8V5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="4" r="1.1" fill="currentColor" />
      <path d="M8 19.5v1.2M16 19.5v1.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconSend({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4.5 12 20 4.5l-5.5 15-2.8-6.2L4.5 12Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
    </svg>
  );
}

let msgSeq = 0;
function nextId(prefix: string) {
  msgSeq += 1;
  return `${prefix}-${msgSeq}`;
}

export default function EnergiaCoPilot({ syntheseAudit }: EnergiaCoPilotProps) {
  const panelId = useId();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => [
    { id: "accueil", role: "assistant", text: ACCUEIL },
  ]);
  const listRef = useId();
  const scrollerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimer = useRef<number | null>(null);

  const synthese = useMemo(() => {
    const corps = syntheseAudit?.trim()
      ? syntheseAudit.trim()
      : REPONSE_SYNTHESE_DEFAUT;
    return `${corps}\n\n${LEGAL}`;
  }, [syntheseAudit]);

  const repondre = useCallback(
    (cle: QuickActionId | "ordre" | "aides" | "libre") => {
      switch (cle) {
        case "iti-pise":
          return `${REPONSE_ITI_PISE}\n\n${LEGAL}`;
        case "umafi":
          return `${REPONSE_UMAFI}\n\n${LEGAL}`;
        case "pac":
          return `${REPONSE_PAC}\n\n${LEGAL}`;
        case "synthese":
          return synthese;
        case "ordre":
          return `${REPONSE_ORDRE}\n\n${LEGAL}`;
        case "aides":
          return `${REPONSE_AIDES}\n\n${LEGAL}`;
        default:
          return reponseLibre();
      }
    },
    [synthese],
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 180);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pousserAssistant = useCallback((texte: string) => {
    setTyping(true);
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId("a"), role: "assistant", text: texte }]);
      setTyping(false);
    }, 280);
  }, []);

  const envoyer = useCallback(
    (texteBrut: string) => {
      const texte = texteBrut.trim();
      if (!texte || typing) return;
      setMessages((prev) => [...prev, { id: nextId("u"), role: "user", text: texte }]);
      setDraft("");
      if (isSensitive(texte)) {
        pousserAssistant(REFUS_MARGES);
        return;
      }
      pousserAssistant(repondre(matchLibre(texte)));
    },
    [pousserAssistant, repondre, typing],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    envoyer(draft);
  };

  const onDraftKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer(draft);
    }
  };

  return (
    <div className="pointer-events-none fixed inset-0 z-[80] print:hidden" aria-live="polite">
      {open ? (
        <button
          type="button"
          className="pointer-events-auto absolute inset-0 bg-slate-950/50 backdrop-blur-[2px]"
          aria-label="Fermer le Co-Pilote IA"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        id={panelId}
        role="dialog"
        aria-labelledby={`${panelId}-title`}
        aria-hidden={!open}
        inert={!open}
        className={`absolute bottom-24 right-4 flex w-[min(100%-2rem,24rem)] max-h-[min(36rem,calc(100vh-7.5rem))] flex-col overflow-hidden rounded-2xl border border-teal-700/40 bg-slate-950 shadow-2xl shadow-teal-950/40 transition-all duration-300 sm:right-6 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none invisible translate-y-4 opacity-0"
        }`}
      >
        <header className="flex items-center gap-3 bg-gradient-to-r from-[#0f766e] to-[#10b981] px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25">
            <IconRobot className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id={`${panelId}-title`} className="truncate text-sm font-semibold tracking-tight text-white">
              Co-Pilote IA
            </h2>
            <p className="truncate text-[11px] text-emerald-50/85">ENERGIA-CONSEIL IA® — Damien</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-2 py-1 text-xs font-medium text-white/90 hover:bg-white/15"
          >
            Fermer
          </button>
        </header>

        <div
          ref={scrollerRef}
          id={listRef}
          className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
          role="log"
        >
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[92%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                  m.role === "user"
                    ? "bg-gradient-to-br from-[#0f766e] to-[#10b981] text-white"
                    : "border border-slate-800 bg-slate-900 text-slate-100"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {typing ? (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 px-3 py-2 text-[13px] text-teal-300">
                Rédaction…
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-slate-800 px-3 pb-2 pt-2">
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">Actions rapides</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                type="button"
                disabled={typing}
                onClick={() => envoyer(action.label)}
                className="rounded-full border border-teal-700/50 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-emerald-200 transition hover:border-emerald-400/70 hover:bg-slate-800 disabled:opacity-50"
              >
                {action.label}
              </button>
            ))}
          </div>

          <form onSubmit={onSubmit} className="flex items-end gap-2">
            <label htmlFor={inputId} className="sr-only">
              Question au Co-Pilote IA
            </label>
            <textarea
              id={inputId}
              ref={inputRef}
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onDraftKey}
              placeholder="Pose une question libre…"
              className="min-h-[2.75rem] flex-1 resize-none rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
            />
            <button
              type="submit"
              disabled={typing || !draft.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0f766e] to-[#10b981] text-white shadow-md disabled:opacity-40"
              aria-label="Envoyer"
            >
              <IconSend className="h-4 w-4" />
            </button>
          </form>
          <p className="mt-2 px-0.5 text-[10px] leading-snug text-slate-500">{LEGAL}</p>
        </div>
      </aside>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="pointer-events-auto absolute bottom-5 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#0f766e] to-[#10b981] text-white shadow-lg shadow-teal-900/40 ring-1 ring-white/20 transition hover:scale-105 hover:shadow-teal-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 sm:right-6"
        title="Co-Pilote IA"
      >
        {open ? (
          <span className="text-lg leading-none" aria-hidden="true">
            ×
          </span>
        ) : (
          <IconRobot className="h-7 w-7" />
        )}
        <span className="sr-only">{open ? "Fermer le Co-Pilote IA" : "Ouvrir le Co-Pilote IA"}</span>
      </button>
    </div>
  );
}
