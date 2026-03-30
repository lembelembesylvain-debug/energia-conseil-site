import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courtier travaux & financement — ENERGIA-CONSEIL IA®",
  description:
    "Financement rénovation jusqu'à 75 000€ sans apport — partenaire Vivons Courtier / travauxcredit.fr. Fabien Barras, réponse sous 48h.",
  openGraph: {
    title: "Courtier travaux — ENERGIA-CONSEIL IA®",
    description:
      "Financez vos travaux de rénovation énergétique jusqu'à 75 000€.",
    locale: "fr_FR",
  },
};

export default function CourtierTravauxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
