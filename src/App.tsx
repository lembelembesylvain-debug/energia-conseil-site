import { motion, useInView, animate } from "framer-motion";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type FormEvent,
} from "react";

/** Freemium : masque les détails financiers avancés et affiche le bloc conversion Premium */
const FREEMIUM = true;

const emerald = "#0f766e";
const emeraldLight = "#10b981";

type TabId = "calculateur" | "audit";

const fmt = (n: number) =>
  n.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

const TRAVAUX_PRESETS: Record<string, number> = {
  essentiel: 25000,
  performance: 43000,
  performancePlus: 55000,
  excellence: 67500,
};

function goCheckout() {
  window.location.href = "#";
}

// --- Types & calculateur inline (autonome pour Vite/Bolt) ---
type MaPrimeRenovCategory = "BLEU" | "JAUNE" | "VIOLET" | "ROSE";
type DPEClass = "A" | "B" | "C" | "D" | "E" | "F" | "G";
type Region = "IDF" | "OTHER";

type CalculationResult = {
  totalAides: number;
  resteACharge: number;
  economiesAnnuelles: number;
  maPrimeRenov: { category: MaPrimeRenovCategory };
};

const MPR_THRESHOLDS: Record<
  Region,
  Record<number, { bleu: number; jaune: number; violet: number }> & {
    perAdditional: { bleu: number; jaune: number; violet: number };
  }
> = {
  IDF: {
    1: { bleu: 24031, jaune: 29253, violet: 40851 },
    2: { bleu: 35270, jaune: 42933, violet: 60051 },
    3: { bleu: 42357, jaune: 51564, violet: 71846 },
    4: { bleu: 49455, jaune: 60208, violet: 84562 },
    5: { bleu: 56580, jaune: 68877, violet: 96817 },
    perAdditional: { bleu: 7116, jaune: 8663, violet: 12257 },
  },
  OTHER: {
    1: { bleu: 17363, jaune: 22259, violet: 31185 },
    2: { bleu: 25393, jaune: 32553, violet: 45842 },
    3: { bleu: 30540, jaune: 39148, violet: 55196 },
    4: { bleu: 35676, jaune: 45743, violet: 64550 },
    5: { bleu: 40802, jaune: 52338, violet: 73904 },
    perAdditional: { bleu: 5126, jaune: 6595, violet: 9354 },
  },
};

function getMaPrimeRenovCategory(
  income: number,
  householdSize: number,
  region: Region,
): MaPrimeRenovCategory {
  const thresholds = MPR_THRESHOLDS[region];
  const size = Math.min(Math.max(householdSize, 1), 5);
  let limit = thresholds[size];
  if (householdSize > 5) {
    const extra = householdSize - 5;
    limit = {
      bleu: thresholds[5].bleu + extra * thresholds.perAdditional.bleu,
      jaune: thresholds[5].jaune + extra * thresholds.perAdditional.jaune,
      violet: thresholds[5].violet + extra * thresholds.perAdditional.violet,
    };
  }
  if (income <= limit.bleu) return "BLEU";
  if (income <= limit.jaune) return "JAUNE";
  if (income <= limit.violet) return "VIOLET";
  return "ROSE";
}

function sumWorksCost(works: Record<string, { estimatedCost?: number } | undefined>): number {
  return Object.values(works).reduce(
    (total, item) => total + (item?.estimatedCost ?? 0),
    0,
  );
}

function calculateEnergyAids(
  household: {
    income: number;
    householdSize: number;
    region: Region;
  },
  logement: {
    surface: number;
    dpeActuel: DPEClass;
    dpeVise: DPEClass;
  },
  works: Record<string, { estimatedCost?: number } | undefined>,
  isParcoursAccompagne = false,
): CalculationResult {
  const coutTotalTravaux = sumWorksCost(works);
  const category = getMaPrimeRenovCategory(
    household.income,
    household.householdSize,
    household.region,
  );

  const parcoursRates: Record<MaPrimeRenovCategory, number> = {
    BLEU: 0.8,
    JAUNE: 0.6,
    VIOLET: 0.45,
    ROSE: 0.1,
  };
  const parcoursMax: Record<MaPrimeRenovCategory, number> = {
    BLEU: 32000,
    JAUNE: 24000,
    VIOLET: 18000,
    ROSE: 4000,
  };

  const mpr = isParcoursAccompagne
    ? Math.min(coutTotalTravaux * parcoursRates[category], parcoursMax[category])
    : Math.min(coutTotalTravaux * 0.35, parcoursMax[category]);

  const cee = Math.round(coutTotalTravaux * 0.12);
  const tvaEconomise = Math.round(coutTotalTravaux * (0.2 / 1.055) * 0.145);
  const totalAides = Math.min(
    Math.round(mpr + cee + tvaEconomise),
    Math.round(coutTotalTravaux * 0.95),
  );
  const resteACharge = Math.max(0, coutTotalTravaux - totalAides);

  const coef: Record<DPEClass, number> = {
    A: 8,
    B: 12,
    C: 18,
    D: 28,
    E: 38,
    F: 48,
    G: 58,
  };
  const factureAvant = Math.round(logement.surface * coef[logement.dpeActuel]);
  const factureApres = Math.round(logement.surface * coef[logement.dpeVise]);
  const economiesAnnuelles = Math.max(0, factureAvant - factureApres);

  return {
    totalAides,
    resteACharge,
    economiesAnnuelles,
    maPrimeRenov: { category },
  };
}

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function useCountUp(
  target: number,
  options: { suffix?: string; prefix?: string } = {},
) {
  const { suffix = "", prefix = "" } = options;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, target, {
      duration: 2,
      ease: [0.22, 1, 0.36, 1] as const,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, target]);

  return {
    ref,
    text: `${prefix}${display.toLocaleString("fr-FR")}${suffix}`,
  };
}

function FadeSection({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

type LandingViewProps = { onStartAudit: () => void; };

function LandingView({ onStartAudit }: LandingViewProps) {
  const surface = useCountUp(164, { suffix: " m²" });
  const gain = useCountUp(390, { prefix: "+", suffix: " €" });
  const taux = useCountUp(90, { suffix: "%" });

  return (
    <div className="overflow-x-hidden bg-white">
      {/* ─── HEADER FIXE ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-teal-900/10 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <a
            href="#"
            className="flex items-center gap-1.5 text-lg font-bold tracking-tight sm:text-xl"
            style={{ color: emerald }}
          >
            <span aria-hidden>⚡</span>
            <span>ENERGIA CONSEIL IA®</span>
          </a>

          <nav
            className="hidden items-center gap-6 text-sm font-medium text-neutral-600 md:flex"
            aria-label="Navigation principale"
          >
            <a href="#" className="transition hover:text-[#0f766e]">
              Accueil
            </a>
            <a href="#comment-ca-marche" className="transition hover:text-[#0f766e]">
              Comment ça marche
            </a>
            <a href="#aides-2026" className="transition hover:text-[#0f766e]">
              Aides 2026
            </a>
            <a href="#contact" className="transition hover:text-[#0f766e]">
              Nous contacter
            </a>
          </nav>

          <button
            type="button"
            onClick={onStartAudit}
            className="animate-pulse-cta shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 sm:px-5 sm:text-base"
            style={{ backgroundColor: emeraldLight }}
          >
            Démarrer mon Audit Gratuit
          </button>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-24 sm:pt-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-28 lg:pt-12">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col"
          >
            <motion.div
              custom={0}
              variants={fadeUp}
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800"
            >
              <span>🏆</span>
              <span>N°1 de la Rénovation Globale en Auvergne-Rhône-Alpes</span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="text-balance text-4xl font-extrabold leading-[1.08] tracking-tight text-neutral-900 sm:text-5xl lg:text-[3.25rem]"
            >
              Transformez votre passoire thermique en maison{" "}
              <span style={{ color: emerald }}>A+</span> et économisez{" "}
              <span style={{ color: emeraldLight }}>584 €/mois</span>
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600 sm:text-xl"
            >
              Notre IA analyse votre logement, calcule vos aides MaPrimeRénov'
              2026 et génère votre audit complet en 30 min. Zéro apport. Zéro
              stress.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-8 flex flex-wrap gap-3"
            >
              {[
                "✅ Audit IA en 30 minutes",
                "🛡️ Décennale MIC LUNPIB2604975",
                "💰 Zéro apport possible",
              ].map((badge) => (
                <span
                  key={badge}
                  className="rounded-full border border-teal-100 bg-teal-50/80 px-4 py-2 text-sm font-medium text-teal-900"
                >
                  {badge}
                </span>
              ))}
            </motion.div>

            <motion.div custom={4} variants={fadeUp} className="mt-10">
              <button
                type="button"
                onClick={onStartAudit}
                className="animate-pulse-cta inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-2xl transition hover:brightness-110 sm:px-10 sm:py-5 sm:text-xl"
                style={{ backgroundColor: emeraldLight }}
              >
                🚀 Démarrer mon Audit Gratuit
              </button>
            </motion.div>
          </motion.div>

          {/* Visuel Hero */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mx-auto aspect-[4/3] w-full max-w-md lg:max-h-[480px] lg:max-w-none lg:aspect-square"
          >
            <div
              className="absolute inset-0 rounded-3xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${emerald} 0%, ${emeraldLight} 50%, #34d399 100%)`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <motion.span
                  className="text-[8rem] drop-shadow-2xl"
                  animate={{ y: [0, -12, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  🏠
                </motion.span>
                <motion.span
                  className="absolute -right-16 -top-8 text-6xl"
                  animate={{ rotate: [0, 15, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  aria-hidden
                >
                  ☀️
                </motion.span>
                <motion.span
                  className="absolute -bottom-4 -left-12 text-5xl"
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  aria-hidden
                >
                  ⚡
                </motion.span>
              </div>
            </div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-t from-black/10 to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* ─── CHIFFRES CLÉS ─── */}
      <FadeSection className="border-y border-teal-100 bg-teal-50/50 px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
          {[
            {
              ref: surface.ref,
              icon: "🏠",
              value: surface.text,
              label: "Surface moyenne rénovée",
            },
            {
              ref: gain.ref,
              icon: "💰",
              value: gain.text,
              label: "Gain net mensuel moyen",
            },
            {
              ref: taux.ref,
              icon: "⚡",
              value: taux.text,
              label: "Taux d'aides Profil Bleu",
            },
            {
              ref: null,
              icon: "⭐",
              value: "F→A",
              label: "Saut énergétique moyen",
              prefix: "DPE ",
            },
          ].map((stat) => (
            <div key={stat.label} ref={stat.ref ?? undefined} className="text-center">
              <span className="text-3xl" aria-hidden>
                {stat.icon}
              </span>
              <p
                className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl"
                style={{ color: emerald }}
              >
                {"prefix" in stat ? stat.prefix : null}
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-medium text-neutral-600 sm:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </FadeSection>

      {/* ─── COMMENT ÇA MARCHE ─── */}
      <FadeSection
        id="comment-ca-marche"
        className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
            Comment ça marche
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-neutral-600">
            Trois étapes simples pour transformer votre logement
          </p>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "📋",
                title: "Je remplis le formulaire (5 min)",
                desc: "Nom, adresse, surface, DPE, revenus.",
              },
              {
                icon: "🤖",
                title: "L'IA analyse mon logement (25 min)",
                desc: "Calcul des aides, simulation financière, recommandations techniques.",
              },
              {
                icon: "📄",
                title: "Je reçois mon Audit Complet (48h)",
                desc: "85 pages personnalisées avec votre plan de financement Zéro Apport.",
              },
            ].map((step, i) => (
              <motion.article
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeUp}
                className="group rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `${emeraldLight}20` }}
                >
                  {step.icon}
                </div>
                <h3 className="mt-5 text-lg font-bold text-neutral-900">
                  {step.title}
                </h3>
                <p className="mt-3 text-neutral-600 leading-relaxed">{step.desc}</p>
              </motion.article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={onStartAudit}
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110"
              style={{ backgroundColor: emerald }}
            >
              Commencer maintenant →
            </button>
          </div>
        </div>
      </FadeSection>

      {/* ─── 3 PILIERS ─── */}
      <FadeSection className="bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Les 3 piliers ENERGIA
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                icon: "🏠",
                color: "#0ea5e9",
                title: "L'Isolation",
                stat: "-40% de déperditions",
              },
              {
                icon: "🌡️",
                color: "#f97316",
                title: "La PAC",
                stat: "-60% de facture chauffage",
              },
              {
                icon: "☀️",
                color: "#eab308",
                title: "Le Solaire",
                stat: "Facture résiduelle 208€/an",
              },
            ].map((pillar, i) => (
              <motion.article
                key={pillar.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl bg-white p-8 text-center shadow-lg transition hover:shadow-xl"
              >
                <div
                  className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                  style={{ backgroundColor: `${pillar.color}18` }}
                >
                  {pillar.icon}
                </div>
                <h3 className="mt-5 text-xl font-bold text-neutral-900">
                  {pillar.title}
                </h3>
                <p
                  className="mt-3 text-2xl font-extrabold"
                  style={{ color: pillar.color }}
                >
                  {pillar.stat}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ─── AIDES 2026 ─── */}
      <FadeSection id="aides-2026" className="scroll-mt-24">
        <div
          className="px-4 py-8 sm:px-6 lg:px-8"
          style={{ backgroundColor: emerald }}
        >
          <p className="mx-auto max-w-4xl text-center text-base font-medium leading-relaxed text-white sm:text-lg">
            ⚡ <strong>ATTENTION :</strong> Les passoires thermiques (DPE F et G)
            ont jusqu'au <strong>31 décembre 2026</strong> pour accéder au
            parcours par geste. À partir de 2027, seul le Parcours Accompagné
            sera disponible.
          </p>
        </div>

        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Profils MaPrimeRénov' 2026
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-center text-sm text-amber-800">
              Aides financières 2026 (estimation à titre indicatif). Montants
              définitifs après instruction ANAH et CEE.
            </p>

            <div className="mt-10 overflow-hidden rounded-2xl shadow-xl">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr style={{ backgroundColor: "#1a3c5e" }}>
                    <th className="px-5 py-4 text-sm font-semibold text-white">
                      Profil
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-white">
                      Revenus
                    </th>
                    <th className="px-5 py-4 text-sm font-semibold text-white">
                      Taux MPR
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white text-sm sm:text-base">
                  {[
                    ["🔵 Bleu", "Très modestes", "90%"],
                    ["🟡 Jaune", "Modestes", "70%"],
                    ["🟣 Violet", "Intermédiaires", "55%"],
                    ["🌸 Rose", "Aisés", "35%"],
                  ].map(([profil, revenus, taux], i) => (
                    <tr
                      key={profil}
                      className={i % 2 === 0 ? "bg-teal-50/40" : "bg-white"}
                    >
                      <td className="border-b border-neutral-100 px-5 py-4 font-semibold">
                        {profil}
                      </td>
                      <td className="border-b border-neutral-100 px-5 py-4 text-neutral-600">
                        {revenus}
                      </td>
                      <td
                        className="border-b border-neutral-100 px-5 py-4 font-bold"
                        style={{ color: emerald }}
                      >
                        {taux}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={onStartAudit}
                className="inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3.5 font-semibold transition hover:bg-teal-50"
                style={{ borderColor: emerald, color: emerald }}
              >
                Calculer mes aides →
              </button>
            </div>
          </div>
        </div>
      </FadeSection>

      {/* ─── TÉMOIGNAGES ─── */}
      <FadeSection className="bg-neutral-50 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Ils nous font confiance
          </h2>
          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {[
              {
                name: "M. DUPONT — Lyon (69)",
                quote:
                  "Passé de DPE G à A en 12 semaines. Je gagne 420€/mois net. L'équipe ENERGIA a tout géré !",
              },
              {
                name: "Mme MARTIN — Saint-Étienne (42)",
                quote:
                  "Zéro apport, zéro stress. Les aides ont tout couvert. Je recommande à 100%.",
              },
              {
                name: "M. BERNARD — Grenoble (38)",
                quote:
                  "L'audit IA m'a bluffé. 85 pages ultra-précises livrées en 24h. Projet signé la semaine suivante.",
              },
            ].map((t, i) => (
              <motion.article
                key={t.name}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl bg-white p-8 shadow-lg transition hover:shadow-xl"
              >
                <div className="text-amber-400 text-lg tracking-wider" aria-hidden>
                  ⭐⭐⭐⭐⭐
                </div>
                <blockquote className="mt-4 text-neutral-700 leading-relaxed italic">
                  « {t.quote} »
                </blockquote>
                <p className="mt-5 font-bold text-neutral-900">{t.name}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </FadeSection>

      {/* ─── CTA FINAL ─── */}
      <FadeSection
        className="px-4 py-24 sm:px-6 lg:px-8"
        id="cta-final"
      >
        <div
          className="mx-auto max-w-4xl rounded-3xl px-6 py-16 text-center shadow-2xl sm:px-12 sm:py-20"
          style={{
            background: `linear-gradient(135deg, ${emerald} 0%, ${emeraldLight} 100%)`,
          }}
        >
          <h2 className="text-balance text-3xl font-extrabold text-white sm:text-4xl md:text-5xl">
            Votre maison mérite le meilleur.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/90">
            Rejoignez les propriétaires qui ont choisi l'autonomie
            énergétique.
          </p>
          <button
            type="button"
            onClick={onStartAudit}
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-bold shadow-xl transition hover:scale-[1.02] hover:shadow-2xl sm:text-xl"
            style={{ color: emerald }}
          >
            🚀 Démarrer mon Audit Gratuit
          </button>
        </div>
      </FadeSection>

      {/* ─── FOOTER ─── */}
      <footer
        id="contact"
        className="scroll-mt-24 border-t border-neutral-200 bg-neutral-900 px-4 py-14 text-neutral-300 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-10 md:flex-row md:justify-between">
            <div>
              <p
                className="text-xl font-bold text-white"
                style={{ color: emeraldLight }}
              >
                ⚡ ENERGIA CONSEIL IA®
              </p>
              <address className="mt-4 not-italic text-sm leading-relaxed">
                16 Rue Cuvier, 69006 Lyon
                <br />
                SIRET : 941 819 427 00019
                <br />
                <a
                  href="mailto:contact@energia-conseil-ia.com"
                  className="transition hover:text-white"
                >
                  contact@energia-conseil-ia.com
                </a>
                <br />
                <a href="tel:+33610596898" className="transition hover:text-white">
                  06 10 59 68 98
                </a>
              </address>
            </div>

            <div className="text-sm">
              <p className="font-semibold text-white">Informations légales</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <a href="#" className="transition hover:text-white">
                    CGV
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Mentions Légales
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-white">
                    Politique de confidentialité
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-neutral-700 pt-8 text-center text-sm">
            <p className="inline-flex flex-wrap items-center justify-center gap-2 rounded-full border border-teal-700/50 bg-teal-900/30 px-4 py-2 text-teal-200">
              Partenaire ANAH France Rénov' | Marque déposée INPI N°5213845
            </p>
            <p className="mt-4 text-neutral-500">
              © {new Date().getFullYear()} ENERGIA-CONSEIL IA® — Tous droits
              réservés
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function dpeIndex(dpe: DPEClass): number {
  return "ABCDEFG".indexOf(dpe);
}

function buildWorks(totalCost: number) {
  const roof = Math.round(totalCost * 0.12);
  const walls = Math.round(totalCost * 0.28);
  const windows = Math.round(totalCost * 0.1);
  const vmc = Math.round(totalCost * 0.06);
  const pac = Math.round(totalCost * 0.32);
  const ballon = Math.round(totalCost * 0.07);
  const remainder = totalCost - roof - walls - windows - vmc - pac - ballon;

  return {
    roofInsulation: { type: "combles", surface: 80, rValue: 8, estimatedCost: roof },
    iti: { type: "iti", surface: 100, rValue: 3.7, estimatedCost: walls + Math.max(0, remainder) },
    windows: { type: "fenetres", quantity: 8, estimatedCost: windows },
    vmcDoubleFlux: { type: "vmc_df", estimatedCost: vmc },
    heatPumpAirWater: { type: "pac", cop: 4.5, estimatedCost: pac },
    thermodynamicWaterHeater: { type: "ballon", estimatedCost: ballon },
  };
}

function estimateFacture(surface: number, dpe: DPEClass): number {
  const coef: Record<DPEClass, number> = {
    A: 8,
    B: 12,
    C: 18,
    D: 28,
    E: 38,
    F: 48,
    G: 58,
  };
  return Math.round(surface * coef[dpe]);
}

function estimateMonthlyLoan(resteACharge: number, years = 15): number {
  if (resteACharge <= 0) return 0;
  return Math.round(resteACharge / (years * 12));
}

function estimateGainNetMensuel(
  economiesMois: number,
  mensualite: number,
): number {
  return Math.round(economiesMois - mensualite);
}

function buildProjection30Ans(
  resteACharge: number,
  economiesAnnuelles: number,
): { year: number; cumul: number }[] {
  const rows: { year: number; cumul: number }[] = [];
  let cumul = -resteACharge;
  for (let year = 1; year <= 30; year += 1) {
    cumul += economiesAnnuelles;
    rows.push({ year, cumul });
  }
  return rows;
}

function AuditPremiumBlock({ onCheckout }: { onCheckout: () => void }) {
  return (
    <div className="rounded-2xl border-4 border-emerald-600 bg-emerald-50 p-6 md:p-8 shadow-lg">
      <h3 className="text-xl md:text-2xl font-bold text-emerald-900 mb-3">
        🚀 Passez au niveau supérieur !
      </h3>
      <p className="text-emerald-800 font-medium mb-4">
        Débloquez l'analyse complète de votre projet :
      </p>
      <ul className="space-y-2 text-emerald-900 text-sm md:text-base mb-2">
        <li>✅ Votre plan de financement détaillé sur 30 ans</li>
        <li>✅ Le ROI précis de votre batterie solaire</li>
        <li>✅ Tous les détails des aides au centime près</li>
        <li>✅ Votre Rapport d'Audit IA complet de 85 pages</li>
      </ul>
      <p className="text-emerald-700 text-sm italic mb-1">
        (Envoyé par email sous 5 minutes après paiement)
      </p>
      <button type="button" onClick={onCheckout} className="big-green-button">
        Je veux mon Audit IA Premium (199 €)
      </button>
    </div>
  );
}

function PlanFinancementCourtierTable({
  montantTravaux,
  resteACharge,
  economiesAnnuelles,
}: {
  montantTravaux: number;
  resteACharge: number;
  economiesAnnuelles: number;
}) {
  const mensualite = estimateMonthlyLoan(montantTravaux);
  const economiesMois = Math.round(economiesAnnuelles / 12);
  const gainNet = estimateGainNetMensuel(economiesMois, mensualite);

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        💳 Plan de Financement Courtier
      </h3>
      <p className="text-xs text-amber-700 mb-3">
        Aides financières 2026 (estimation à titre indicatif). Montants définitifs
        après instruction ANAH et CEE.
      </p>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="py-2 text-gray-600">Montant financé (FABIEN)</td>
            <td className="py-2 text-right font-semibold">{fmt(montantTravaux)}</td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Mensualité estimée (15 ans)</td>
            <td className="py-2 text-right font-semibold text-teal-700">
              {fmt(mensualite)}/mois
            </td>
          </tr>
          <tr>
            <td className="py-2 text-gray-600">Économies chauffage/mois</td>
            <td className="py-2 text-right font-semibold text-emerald-700">
              +{fmt(economiesMois)}/mois
            </td>
          </tr>
          <tr className="bg-emerald-50">
            <td className="py-3 font-bold text-emerald-900">Gain net mensuel</td>
            <td className="py-3 text-right font-bold text-emerald-800">
              {gainNet >= 0 ? "+" : ""}
              {fmt(gainNet)}/mois
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Projection30AnsTable({
  resteACharge,
  economiesAnnuelles,
}: {
  resteACharge: number;
  economiesAnnuelles: number;
}) {
  const rows = buildProjection30Ans(resteACharge, economiesAnnuelles);
  const breakeven = rows.find((r) => r.cumul >= 0)?.year;

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-2">
        📈 Projection sur 30 ans
      </h3>
      {breakeven ? (
        <p className="text-sm text-emerald-700 mb-3">
          Rentabilité estimée à <strong>{breakeven} ans</strong>
        </p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[280px]">
          <thead>
            <tr className="border-b border-gray-200 text-left text-gray-500">
              <th className="py-2 pr-4">Année</th>
              <th className="py-2 text-right">Bénéfice net cumulé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[5, 10, 15, 20, 25, 30].map((year) => {
              const row = rows[year - 1];
              return (
                <tr key={year}>
                  <td className="py-2 text-gray-600">An {year}</td>
                  <td
                    className={`py-2 text-right font-medium ${
                      row.cumul >= 0 ? "text-emerald-700" : "text-red-600"
                    }`}
                  >
                    {fmt(row.cumul)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ROIBatterieBlock({ roiBatterieAns }: { roiBatterieAns: number }) {
  const alerte = roiBatterieAns > 12;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">🔋 ROI Batterie</h3>
        <p className="text-2xl font-bold text-amber-800">
          {roiBatterieAns.toFixed(1)} ans
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Retour sur investissement batterie LFP 7 kWh (option solaire)
        </p>
      </div>
      {alerte ? (
        <div className="rounded-xl border-2 border-red-500 bg-red-50 p-4 text-red-800 text-sm">
          ⚠️ <strong>Alerte :</strong> le ROI batterie dépasse 12 ans — l'analyse
          Premium détaille les scénarios avec et sans stockage pour optimiser votre
          rentabilité.
        </div>
      ) : null}
    </div>
  );
}

type AuditSimulatorViewProps = { onBack: () => void; };

function AuditSimulatorView({ onBack }: AuditSimulatorViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>("calculateur");
  const [calculated, setCalculated] = useState(false);

  const [surface, setSurface] = useState(100);
  const [revenus, setRevenus] = useState(25000);
  const [personnes, setPersonnes] = useState(2);
  const [region, setRegion] = useState<Region>("OTHER");
  const [dpeActuel, setDpeActuel] = useState<DPEClass>("F");
  const [dpeVise, setDpeVise] = useState<DPEClass>("B");
  const [presetTravaux, setPresetTravaux] = useState("performancePlus");

  const montantTravaux = TRAVAUX_PRESETS[presetTravaux] ?? 55000;

  const result: CalculationResult | null = useMemo(() => {
    if (!calculated) return null;
    return calculateEnergyAids(
      {
        income: revenus,
        householdSize: personnes,
        region,
      },
      {
        surface,
        dpeActuel,
        dpeVise,
      },
      buildWorks(montantTravaux),
      true,
    );
  }, [calculated, revenus, personnes, region, surface, dpeActuel, dpeVise, montantTravaux]);

  const factureAvant = estimateFacture(surface, dpeActuel);
  const factureApres = estimateFacture(surface, dpeVise);
  const economiesAnnuelles =
    result?.economiesAnnuelles ?? Math.max(0, factureAvant - factureApres);
  const resteACharge = result?.resteACharge ?? montantTravaux;
  const totalAides = result?.totalAides ?? 0;
  const roiBatterieAns = 14.5;

  const handleCalculate = (e: FormEvent) => {
    e.preventDefault();
    setCalculated(true);
    setActiveTab("audit");
  };

  const tabs: { id: TabId; label: string }[] = [
    { id: "calculateur", label: "Calculateur" },
    { id: "audit", label: "Audit Énergétique" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-teal-900 via-emerald-900 to-teal-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 inline-block text-sm text-emerald-200/90 underline-offset-2 hover:text-white hover:underline"
          >
            ← Retour à l'accueil
          </button>
          <p className="text-emerald-200/80 text-sm font-medium tracking-wide uppercase mb-1">
            ENERGIA-CONSEIL IA®
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Simulateur rénovation énergétique 2026
          </h1>
          <p className="text-teal-100/90 mt-2 text-sm md:text-base">
            Estimation gratuite · Audit complet Premium 199 €
          </p>
        </header>

        <div
          className="flex rounded-xl bg-white/10 p-1 mb-6 backdrop-blur-sm"
          role="tablist"
          aria-label="Sections simulateur"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              disabled={tab.id === "audit" && !calculated}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-white text-emerald-900 shadow-md"
                  : "text-white/80 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "calculateur" ? (
          <section
            role="tabpanel"
            className="rounded-2xl bg-white p-6 md:p-8 shadow-xl"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              📋 Vos informations
            </h2>
            <form onSubmit={handleCalculate} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Surface (m²)
                  </span>
                  <input
                    type="number"
                    min={20}
                    max={500}
                    value={surface}
                    onChange={(e) => setSurface(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Revenus annuels (€)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={revenus}
                    onChange={(e) => setRevenus(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    Personnes au foyer
                  </span>
                  <select
                    value={personnes}
                    onChange={(e) => setPersonnes(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <option key={n} value={n}>
                        {n} personne{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">Région</span>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    <option value="OTHER">Hors Île-de-France</option>
                    <option value="IDF">Île-de-France</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    DPE actuel
                  </span>
                  <select
                    value={dpeActuel}
                    onChange={(e) => setDpeActuel(e.target.value as DPEClass)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {(["G", "F", "E", "D", "C"] as DPEClass[]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-gray-700">
                    DPE visé
                  </span>
                  <select
                    value={dpeVise}
                    onChange={(e) => setDpeVise(e.target.value as DPEClass)}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                  >
                    {(["D", "C", "B", "A"] as DPEClass[]).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-gray-700">
                  Bouquet de travaux
                </span>
                <select
                  value={presetTravaux}
                  onChange={(e) => setPresetTravaux(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5"
                >
                  <option value="essentiel">Essentiel — 25 000 €</option>
                  <option value="performance">Performance — 43 000 €</option>
                  <option value="performancePlus">Performance+ — 55 000 €</option>
                  <option value="excellence">Excellence — 67 500 €</option>
                </select>
              </label>

              <button
                type="submit"
                className="w-full md:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold hover:shadow-lg transition-shadow"
              >
                📈 Calculer mon audit gratuit
              </button>
            </form>
          </section>
        ) : null}

        {activeTab === "audit" && result ? (
          <section role="tabpanel" className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 border border-emerald-300/50 p-6 md:p-8 shadow-xl">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                ⚡ Synthèse de votre audit (aperçu gratuit)
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Travaux TTC</p>
                  <p className="font-bold text-gray-900">{fmt(montantTravaux)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Aides estimées</p>
                  <p className="font-bold text-emerald-700">{fmt(totalAides)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Reste à charge</p>
                  <p className="font-bold text-teal-800">{fmt(resteACharge)}</p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-center">
                  <p className="text-xs text-gray-500">Profil MPR</p>
                  <p className="font-bold text-gray-900">
                    {result.maPrimeRenov.category}
                  </p>
                </div>
              </div>

              <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Aides financières 2026 (estimation à titre indicatif). Aides à valider
                selon revenus réels du client. Montants définitifs après instruction
                ANAH et CEE.
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl bg-white/70 p-4 text-center">
                  <p className="text-xs text-gray-500">Facture AVANT</p>
                  <p className="text-lg font-bold text-amber-700">
                    {fmt(factureAvant)}/an
                  </p>
                  <p className="text-xs text-gray-500">DPE {dpeActuel}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-4 text-center">
                  <p className="text-xs text-gray-500">Facture APRÈS</p>
                  <p className="text-lg font-bold text-emerald-700">
                    {fmt(factureApres)}/an
                  </p>
                  <p className="text-xs text-gray-500">DPE {dpeVise}</p>
                </div>
              </div>

              <p className="text-center text-emerald-800 font-semibold">
                Gain DPE : {dpeActuel} → {dpeVise} (
                {Math.max(0, dpeIndex(dpeActuel) - dpeIndex(dpeVise))} classe
                {Math.max(0, dpeIndex(dpeActuel) - dpeIndex(dpeVise)) > 1 ? "s" : ""})
                · Économies ~{fmt(economiesAnnuelles)}/an
              </p>
            </div>

            {FREEMIUM ? (
              <AuditPremiumBlock onCheckout={goCheckout} />
            ) : (
              <div className="space-y-6">
                <PlanFinancementCourtierTable
                  montantTravaux={montantTravaux}
                  resteACharge={resteACharge}
                  economiesAnnuelles={economiesAnnuelles}
                />
                <Projection30AnsTable
                  resteACharge={resteACharge}
                  economiesAnnuelles={economiesAnnuelles}
                />
                <ROIBatterieBlock roiBatterieAns={roiBatterieAns} />
              </div>
            )}

            <div className="rounded-2xl border-2 border-amber-400 bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 text-white shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl" aria-hidden>
                  🍒
                </span>
                <div>
                  <h3 className="text-xl font-bold">Cerise sur le gâteau</h3>
                  <p className="text-amber-200 text-sm">
                    Option Solaire Haute Performance
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: "☀️", title: "DualSun Bifacial", sub: "6 kWc · +30 % production" },
                  { icon: "⚡", title: "Enphase IQ8", sub: "Micro-onduleurs · anti-ombrage" },
                  { icon: "🔋", title: "Batterie LFP 7 kWh", sub: "Autoconsommation optimisée" },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl bg-white/10 border border-white/10 p-4 text-center"
                  >
                    <div className="text-2xl mb-1">{item.icon}</div>
                    <p className="font-semibold text-sm">{item.title}</p>
                    <p className="text-xs text-slate-300 mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>

              {FREEMIUM ? (
                <div className="rounded-xl bg-emerald-900/40 border border-emerald-500/40 p-4 text-emerald-100 text-sm leading-relaxed">
                  L'analyse complète de rentabilité de votre option solaire, avec
                  projections financières et ROI détaillé, est disponible dans votre{" "}
                  <strong className="text-white">Audit IA Premium</strong>.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-slate-300 mb-1">ROI sur 30 ans (solaire)</p>
                    <p className="text-2xl font-bold text-emerald-400">8,2 ans</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-slate-300 mb-1">Gain net solaire/mois</p>
                    <p className="text-2xl font-bold text-emerald-400">+196 €</p>
                  </div>
                  <div className="rounded-xl bg-white/10 p-4 md:col-span-2">
                    <p className="text-slate-300 mb-1">Mensualité option solaire</p>
                    <p className="text-xl font-bold">~89 €/mois (Éco-PTZ complémentaire)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="text-center pb-8">
              <button
                type="button"
                onClick={goCheckout}
                className="big-green-button max-w-lg mx-auto text-base md:text-lg"
              >
                Je veux mon Audit IA complet (40-60 pages) sous 48h — 199 €
              </button>
              <p className="text-teal-100/70 text-xs mt-4">
                Paiement sécurisé Stripe · Remboursé si travaux {'>'} 10 000 €
              </p>
            </div>
          </section>
        ) : null}

        {activeTab === "audit" && !result ? (
          <div className="rounded-2xl bg-white/10 p-8 text-center text-white">
            <p>Complétez d'abord le calculateur pour voir votre audit.</p>
            <button
              type="button"
              onClick={() => setActiveTab("calculateur")}
              className="mt-4 text-emerald-200 underline hover:text-white"
            >
              Retour au calculateur
            </button>
          </div>
        ) : null}
      </div>
    </main>
  );
}

export default function App() {
  const [showSimulator, setShowSimulator] = useState(false);

  if (showSimulator) {
    return <AuditSimulatorView onBack={() => setShowSimulator(false)} />;
  }

  return <LandingView onStartAudit={() => setShowSimulator(true)} />;
}
