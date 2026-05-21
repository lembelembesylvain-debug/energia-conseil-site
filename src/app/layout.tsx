import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title:
    "ENERGIA-CONSEIL IA® | Plateforme d'audit énergétique IA – n°1 en France",
  description:
    "Audit énergétique IA complet en 48h • 199€ • Remboursé si travaux. Rapport PDF, aides, artisans RGE.",
  openGraph: {
    title: "ENERGIA-CONSEIL IA® – Audit énergétique IA",
    description:
      "La plateforme d'audit énergétique par intelligence artificielle, leader en France.",
    locale: "fr_FR",
    type: "website",
  },
  verification: {
    google: "PZlTB6tI90wQ1xsVayNuaJZjnsA2I6G8tkkBSDxKvlQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-white font-sans text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
