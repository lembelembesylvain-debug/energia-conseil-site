"use client";

import Link from "next/link";
import { motion, useInView, animate } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const emerald = "#0f766e";
const emeraldLight = "#10b981";

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
  children: React.ReactNode;
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

export default function LandingPage() {
  const surface = useCountUp(164, { suffix: " m²" });
  const gain = useCountUp(390, { prefix: "+", suffix: " €" });
  const taux = useCountUp(90, { suffix: "%" });

  return (
    <div className="overflow-x-hidden bg-white">
      {/* ─── HEADER FIXE ─── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-teal-900/10 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-lg font-bold tracking-tight sm:text-xl"
            style={{ color: emerald }}
          >
            <span aria-hidden>⚡</span>
            <span>ENERGIA CONSEIL IA®</span>
          </Link>

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

          <Link
            href="/audit"
            className="animate-pulse-cta shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 sm:px-5 sm:text-base"
            style={{ backgroundColor: emeraldLight }}
          >
            Démarrer mon Audit Gratuit
          </Link>
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
              Notre IA analyse votre logement, calcule vos aides MaPrimeRénov&apos;
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
              <Link
                href="/audit"
                className="animate-pulse-cta inline-flex items-center justify-center gap-2 rounded-2xl px-8 py-4 text-lg font-bold text-white shadow-2xl transition hover:brightness-110 sm:px-10 sm:py-5 sm:text-xl"
                style={{ backgroundColor: emeraldLight }}
              >
                🚀 Démarrer mon Audit Gratuit
              </Link>
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
                {"prefix" in stat && stat.prefix}
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
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white shadow-lg transition hover:brightness-110"
              style={{ backgroundColor: emerald }}
            >
              Commencer maintenant →
            </Link>
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
            ont jusqu&apos;au <strong>31 décembre 2026</strong> pour accéder au
            parcours par geste. À partir de 2027, seul le Parcours Accompagné
            sera disponible.
          </p>
        </div>

        <div className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
              Profils MaPrimeRénov&apos; 2026
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
              <Link
                href="/audit"
                className="inline-flex items-center gap-2 rounded-xl border-2 px-8 py-3.5 font-semibold transition hover:bg-teal-50"
                style={{ borderColor: emerald, color: emerald }}
              >
                Calculer mes aides →
              </Link>
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
                  &ldquo;{t.quote}&rdquo;
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
            Rejoignez les propriétaires qui ont choisi l&apos;autonomie
            énergétique.
          </p>
          <Link
            href="/audit"
            className="mt-10 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-10 py-5 text-lg font-bold shadow-xl transition hover:scale-[1.02] hover:shadow-2xl sm:text-xl"
            style={{ color: emerald }}
          >
            🚀 Démarrer mon Audit Gratuit
          </Link>
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
              Partenaire ANAH France Rénov&apos; | Marque déposée INPI N°5213845
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
