import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Guide photos — Audit ENERGIA-CONSEIL IA®",
  description:
    "Comment prendre les 15 photos pour votre audit énergétique IA : façades, pièces, équipements.",
};

export default function GuidePhotosPage() {
  return (
    <main className="min-h-[100dvh] bg-neutral-50">
      <header
        className="border-b border-white/10 px-4 py-6 sm:px-8"
        style={{ backgroundColor: "#2d5a3d" }}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-bold text-white">
            ENERGIA-CONSEIL IA<sup className="text-xs">®</sup>
          </p>
          <Link
            href="/merci"
            className="text-sm font-medium text-white/80 hover:text-white"
          >
            ← Retour confirmation
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-4 py-12 sm:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-[#2d5a3d] sm:text-4xl">
          Guide : vos 15 photos pour l&apos;audit IA
        </h1>
        <p className="mt-4 text-lg text-neutral-600">
          Des photos nettes et bien cadrées permettent à notre IA d&apos;estimer
          au mieux les déperditions et de dimensionner les scénarios de travaux.
        </p>

        <section className="mt-10 rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-neutral-900">Façades</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-neutral-700">
            <li>Une photo par orientation (nord, sud, est, ouest) si possible.</li>
            <li>prenez du recul pour voir mur + toiture / débords.</li>
            <li>Évitez contre-jour fort ; privilégiez une lumière uniforme.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-neutral-900">Pièces</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-neutral-700">
            <li>Séjour, chambres principales, cuisine, salle de bain.</li>
            <li>Menuiseries (fenêtres) visibles sur au moins une photo par pièce.</li>
            <li>Planchers / murs en gros plan si doute sur l&apos;isolation.</li>
          </ul>
        </section>

        <section className="mt-6 rounded-2xl bg-white p-8 shadow-xl">
          <h2 className="text-xl font-bold text-neutral-900">Équipements</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-neutral-700">
            <li>Chaudière / PAC / poêle — plaque signalétique lisible si possible.</li>
            <li>Ballon d&apos;eau chaude, VMC (grille et caisson si accessible).</li>
            <li>Tableau électrique ouvert (disjoncteurs visibles).</li>
            <li>Combles : trappe ouverte, isolation visible si accès.</li>
          </ul>
        </section>

        <div
          className="mt-10 rounded-2xl border-2 p-6 text-center"
          style={{ borderColor: "#52b788", backgroundColor: "#f0fdf4" }}
        >
          <p className="font-semibold text-[#166534]">
            Envoyez vos photos à{" "}
            <a
              href="mailto:audit@energia-conseil-ia.com"
              className="underline decoration-[#2d5a3d]/40 underline-offset-2"
            >
              audit@energia-conseil-ia.com
            </a>
          </p>
          <p className="mt-2 text-sm text-neutral-600">
            Indiquez votre nom, prénom et le numéro de commande (reçu après
            paiement) dans l&apos;objet du mail.
          </p>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/"
            className="inline-flex rounded-2xl bg-[#2d5a3d] px-8 py-3 font-semibold text-white shadow-lg hover:bg-[#244832]"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </article>
    </main>
  );
}
