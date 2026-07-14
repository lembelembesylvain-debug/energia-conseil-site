import LandingPage from "@/components/landing/LandingPage";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "ENERGIA CONSEIL IA® | Rénovation énergétique & Audit IA — Auvergne-Rhône-Alpes",
  description:
    "Transformez votre passoire thermique en maison A+. Audit IA en 30 min, aides MaPrimeRénov' 2026, zéro apport possible. N°1 rénovation globale en Auvergne-Rhône-Alpes.",
  openGraph: {
    title: "ENERGIA CONSEIL IA® — Rénovation énergétique premium",
    description:
      "Audit IA complet, aides 2026, plan de financement zéro apport. Démarrer mon audit gratuit.",
    locale: "fr_FR",
    type: "website",
  },
};

export default function HomePage() {
  return <LandingPage />;
}
