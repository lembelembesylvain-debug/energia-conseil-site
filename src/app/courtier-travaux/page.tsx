"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

const brand = "#2d5a3d";
const accent = "#52b788";

const fadeSlideUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 * i,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

const WORK_OPTIONS: { id: string; label: string }[] = [
  { id: "pac_air_eau", label: "PAC air/eau" },
  { id: "pac_air_air", label: "PAC air/air" },
  { id: "photovoltaique", label: "Photovoltaïque" },
  { id: "vmc_simple", label: "VMC simple flux" },
  { id: "vmc_double", label: "VMC double flux" },
  { id: "fenetres", label: "Fenêtres / menuiseries" },
  { id: "volets", label: "Volets filaires ou solaires" },
  { id: "plancher_hydraulique", label: "Plancher chauffant hydraulique" },
  { id: "plancher_electrique", label: "Plancher chauffant électrique" },
  { id: "isolation", label: "Isolation combles/murs" },
  { id: "autre", label: "Autre" },
];

function ParticleField() {
  const dots = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${((i * 73) % 97) + 1}%`,
        top: `${((i * 41) % 93) + 3}%`,
        delay: (i % 10) * 0.35,
        size: 2 + (i % 5),
        duration: 4 + (i % 5),
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white/20"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
          }}
          animate={{
            opacity: [0.15, 0.75, 0.15],
            y: [0, -14, 0],
          }}
          transition={{
            duration: d.duration,
            delay: d.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ExampleTableAnimated() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const rows = [
    { label: "Projet rénovation globale", value: "65 000€", bold: true },
    { label: "MaPrimeRénov (70%)", value: "- 45 500€", neg: true },
    { label: "CEE", value: "- 3 500€", neg: true },
    { label: "Éco-PTZ banque", value: "- 16 000€", neg: true },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 text-left backdrop-blur-sm"
    >
      <table className="w-full text-sm text-white/95 sm:text-base">
        <tbody>
          {rows.map((r, i) => (
            <motion.tr
              key={r.label}
              initial={{ opacity: 0, x: -12 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.1 * i, duration: 0.35 }}
              className="border-b border-white/10 last:border-0"
            >
              <td className="py-2.5 pr-4 font-medium">{r.label}</td>
              <td
                className={`py-2.5 text-right font-mono ${
                  r.bold ? "font-bold text-[#d8f3dc]" : ""
                } ${r.neg ? "text-emerald-200/95" : ""}`}
              >
                {r.value}
              </td>
            </motion.tr>
          ))}
          <motion.tr
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.55 }}
          >
            <td colSpan={2} className="pt-4">
              <div className="border-t border-white/20 pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-white">Reste à charge</span>
                  <span className="text-xl font-bold text-[#52b788]">0€ 🎉</span>
                </div>
              </div>
            </td>
          </motion.tr>
        </tbody>
      </table>

      <div className="mt-6 space-y-4 rounded-xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-50">
        <p>
          <strong className="text-amber-100">PROBLÈME :</strong> délai aides = 6
          mois à 1 an
        </p>
      </div>
      <div className="mt-4 space-y-2 rounded-xl border border-emerald-400/35 bg-emerald-500/15 p-4 text-sm text-emerald-50">
        <p className="font-bold text-white">SOLUTION FABIEN :</p>
        <ul className="list-inside list-disc space-y-1">
          <li>Fabien avance les 65 000€</li>
          <li>Travaux commencent MAINTENANT ✅</li>
          <li>Remboursement à réception des aides</li>
        </ul>
      </div>
    </motion.div>
  );
}

export default function CourtierTravauxPage() {
  const [travaux, setTravaux] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [situation, setSituation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "ok" | "err";
    text: string;
  } | null>(null);

  const toggleTravaux = (id: string) => {
    setTravaux((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);
    try {
      const fd = new FormData(e.currentTarget);
      const res = await fetch("/api/courtier-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: fd.get("prenom"),
          nom: fd.get("nom"),
          email: fd.get("email"),
          telephone: fd.get("telephone"),
          travaux,
          budget,
          situation,
          region: fd.get("region"),
          description: fd.get("description"),
        }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        throw new Error(data.error || "Envoi impossible");
      }
      setMessage({
        type: "ok",
        text: "Demande envoyée. Vous recevrez une confirmation par email.",
      });
      (e.target as HTMLFormElement).reset();
      setTravaux([]);
      setBudget("");
      setSituation("");
    } catch (err) {
      setMessage({
        type: "err",
        text:
          err instanceof Error ? err.message : "Une erreur est survenue.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] bg-neutral-950 text-white">
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/audit-scaled.jpg"
            alt=""
            fill
            className="object-cover opacity-40"
            sizes="100vw"
            priority
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-[#0f2418]/95 via-[#2d5a3d]/92 to-[#1a3d2a]/98"
            aria-hidden
          />
        </div>
        <ParticleField />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pb-20 pt-28 text-center sm:px-6 lg:px-8 lg:pt-32">
          <motion.div
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center"
          >
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              {[
                "Partenaire ENERGIA-CONSEIL IA®",
                "Réponse sous 48h",
                "Partout en France",
              ].map((b, i) => (
                <motion.span
                  key={b}
                  custom={i}
                  variants={fadeSlideUp}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/95 shadow backdrop-blur-md sm:text-sm"
                >
                  {b}
                </motion.span>
              ))}
            </div>

            <motion.h1
              custom={3}
              variants={fadeSlideUp}
              className="max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            >
              Vos travaux de rénovation financés jusqu&apos;à 75 000€ — sans
              apport
            </motion.h1>

            <motion.p
              custom={4}
              variants={fadeSlideUp}
              className="mt-6 max-w-2xl text-lg text-white/88 sm:text-xl"
            >
              Fabien Barras, notre courtier partenaire national, finance vos
              travaux quand les aides ne suffisent pas — ou avance les fonds en
              attendant MaPrimeRénov
            </motion.p>

            <motion.div custom={5} variants={fadeSlideUp} className="mt-10">
              <a
                href="#contact-fabien"
                className="animate-pulse-cta inline-flex rounded-2xl bg-[#52b788] px-8 py-4 text-lg font-semibold text-white shadow-2xl transition hover:bg-[#40916c]"
              >
                Envoyer ma demande à Fabien →
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* AVANTAGES */}
      <section
        className="border-t border-white/10 px-4 py-16 sm:px-6"
        style={{ backgroundColor: brand }}
      >
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Gratuit pour le client",
            "Artisans RGE certifiés France entière",
            "Jusqu'à 75 000€ financés",
            "Réponse sous 48h",
          ].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm"
            >
              <p className="text-lg font-semibold text-white">
                ✅ {t}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FABIEN */}
      <section className="bg-neutral-900 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Votre courtier partenaire
          </h2>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-8 text-left shadow-2xl">
            <p className="text-2xl font-bold" style={{ color: accent }}>
              Fabien Barras
            </p>
            <p className="mt-2 text-lg text-white/90">
              Société : <strong>Vivons Courtier</strong>
            </p>
            <p className="mt-1 text-white/80">
              Site :{" "}
              <a
                href="https://travauxcredit.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#7dd3a8] underline"
              >
                travauxcredit.fr
              </a>
            </p>
            <p className="mt-2 text-sm text-white/70">
              Zone : National — Partout en France
            </p>
            <p className="mt-6 leading-relaxed text-white/85">
              Fabien Barras accompagne les propriétaires dans leur projet de
              rénovation énergétique : sélection des artisans RGE, comparaison
              des devis, montage du dossier d&apos;aides et financement complet
              quand les aides ne couvrent pas tout.
            </p>
          </div>
        </div>
      </section>

      {/* FINANCEMENT */}
      <section className="px-4 py-20 sm:px-6" style={{ backgroundColor: brand }}>
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-3xl font-bold sm:text-4xl">
            Fabien intervient dans 2 situations
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-white/15 bg-white/5 p-8 shadow-2xl"
            >
              <p className="text-3xl" aria-hidden>
                💳
              </p>
              <h3 className="mt-3 text-xl font-bold text-white">
                Il reste quelque chose à financer ?
              </h3>
              <p className="mt-4 leading-relaxed text-white/85">
                Après MaPrimeRénov + CEE + Éco-PTZ de votre banque, il reste un
                solde ? Fabien finance le reste à charge directement via{" "}
                <a
                  href="https://travauxcredit.fr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#b7f0d2] underline"
                >
                  travauxcredit.fr
                </a>
                . Sans démarches — Sans attente.
              </p>
            </motion.article>
            <motion.article
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-white/15 bg-white/5 p-8 shadow-2xl"
            >
              <p className="text-3xl" aria-hidden>
                ⚡
              </p>
              <h3 className="mt-3 text-xl font-bold text-white">
                Vous ne voulez pas attendre 6 mois à 1 an vos aides ?
              </h3>
              <p className="mt-4 leading-relaxed text-white/85">
                MaPrimeRénov et CEE prennent 6 mois à 1 an pour être versés.
                Fabien avance l&apos;intégralité jusqu&apos;à 75 000€. Vos
                travaux commencent MAINTENANT. Vous remboursez à réception des
                aides.
              </p>
            </motion.article>
          </div>
        </div>
      </section>

      {/* EXEMPLE */}
      <section className="bg-neutral-950 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-lg">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Exemple concret
          </h2>
          <div className="mt-10">
            <ExampleTableAnimated />
          </div>
        </div>
      </section>

      {/* FORMULAIRE */}
      <section
        id="contact-fabien"
        className="scroll-mt-24 px-4 py-20 sm:px-6"
        style={{ backgroundColor: brand }}
      >
        <div className="mx-auto max-w-2xl">
          <h2 className="text-center text-3xl font-bold text-white sm:text-4xl">
            Contactez Fabien gratuitement
          </h2>
          <p className="mt-3 text-center text-white/75">
            Remplissez le formulaire — réponse sous 48h ouvrés.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-6 rounded-2xl border border-white/15 bg-white/5 p-6 shadow-2xl backdrop-blur-sm sm:p-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Prénom <span className="text-red-300">*</span>
                </label>
                <input
                  name="prenom"
                  required
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#52b788] focus:outline-none focus:ring-2 focus:ring-[#52b788]/40"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/90">
                  Nom <span className="text-red-300">*</span>
                </label>
                <input
                  name="nom"
                  required
                  className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#52b788] focus:outline-none focus:ring-2 focus:ring-[#52b788]/40"
                  placeholder="Dupont"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90">
                Email <span className="text-red-300">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#52b788] focus:outline-none focus:ring-2 focus:ring-[#52b788]/40"
                placeholder="vous@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90">
                Téléphone <span className="text-red-300">*</span>
              </label>
              <input
                name="telephone"
                type="tel"
                required
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#52b788] focus:outline-none focus:ring-2 focus:ring-[#52b788]/40"
                placeholder="06 12 34 56 78"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-white/90">
                Type de travaux (plusieurs choix possibles)
              </legend>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {WORK_OPTIONS.map((opt) => (
                  <label
                    key={opt.id}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={travaux.includes(opt.id)}
                      onChange={() => toggleTravaux(opt.id)}
                      className="mt-1 rounded border-white/30 bg-white/10 text-[#52b788] focus:ring-[#52b788]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-white/90">
                Budget estimé travaux
              </legend>
              <div className="mt-3 space-y-2">
                {[
                  { v: "moins_10k", l: "Moins de 10 000€" },
                  { v: "dix_vingt_cinq", l: "10 000 - 25 000€" },
                  { v: "vingt_cinq_cinquante", l: "25 000 - 50 000€" },
                  { v: "cinquante_soixante_quinze", l: "50 000 - 75 000€" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="budget_radio"
                      value={o.v}
                      checked={budget === o.v}
                      onChange={() => setBudget(o.v)}
                      className="border-white/30 bg-white/10 text-[#52b788] focus:ring-[#52b788]"
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-sm font-medium text-white/90">
                Situation financement
              </legend>
              <div className="mt-3 space-y-2">
                {[
                  {
                    v: "reste_a_charge",
                    l: "Reste à charge après aides",
                  },
                  {
                    v: "travaux_express",
                    l: "Travaux express — je ne veux pas attendre les aides",
                  },
                  { v: "ne_sait_pas", l: "Je ne sais pas encore" },
                ].map((o) => (
                  <label
                    key={o.v}
                    className="flex cursor-pointer items-start gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="situation_radio"
                      value={o.v}
                      checked={situation === o.v}
                      onChange={() => setSituation(o.v)}
                      className="mt-1 border-white/30 bg-white/10 text-[#52b788] focus:ring-[#52b788]"
                    />
                    {o.l}
                  </label>
                ))}
              </div>
            </fieldset>

            <div>
              <label className="block text-sm font-medium text-white/90">
                Région / Département
              </label>
              <input
                name="region"
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#52b788] focus:outline-none focus:ring-2 focus:ring-[#52b788]/40"
                placeholder="ex. Rhône / Lyon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/90">
                Description du projet
              </label>
              <textarea
                name="description"
                rows={4}
                className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 focus:border-[#52b788] focus:outline-none focus:ring-2 focus:ring-[#52b788]/40"
                placeholder="Décrivez votre projet, contraintes, délais souhaités…"
              />
            </div>

            {message ? (
              <p
                className={
                  message.type === "ok"
                    ? "text-sm text-emerald-200"
                    : "text-sm text-red-200"
                }
              >
                {message.text}
              </p>
            ) : null}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={submitting ? undefined : { scale: 1.02 }}
              whileTap={submitting ? undefined : { scale: 0.98 }}
              className="animate-pulse-cta w-full rounded-2xl bg-[#52b788] px-8 py-4 text-lg font-bold text-white shadow-2xl transition hover:bg-[#40916c] disabled:cursor-wait disabled:opacity-70"
            >
              {submitting
                ? "Envoi en cours…"
                : "Envoyer ma demande à Fabien →"}
            </motion.button>
          </form>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="relative overflow-hidden bg-neutral-950 px-4 py-16 text-center sm:px-6">
        <ParticleField />
        <div className="relative z-10 mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Simuler mon financement gratuitement
          </h2>
          <a
            href="https://travauxcredit.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex rounded-2xl border-2 border-[#52b788] bg-[#52b788] px-10 py-4 text-lg font-bold text-white shadow-xl transition hover:bg-[#40916c]"
          >
            travauxcredit.fr →
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-neutral-900 px-4 py-12 text-center text-sm text-white/65">
        <p>
          <Link
            href="https://energia-conseil-ia.com"
            className="font-semibold text-[#7dd3a8] underline"
          >
            energia-conseil-ia.com
          </Link>
        </p>
        <p className="mt-3 text-xs text-white/50">
          ENERGIA-CONSEIL IA® — marque déposée à l&apos;INPI
        </p>
        <p className="mt-2 text-xs text-white/45">
          Partenariat Vivons Courtier / travauxcredit.fr — Apporteur
          d&apos;affaires — Fabien Barras
        </p>
        <p className="mt-4">
          <Link href="/" className="text-[#52b788] hover:underline">
            ← Retour à l&apos;accueil
          </Link>
        </p>
      </footer>
    </main>
  );
}
