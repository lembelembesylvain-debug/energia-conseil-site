import type { Metadata } from "next";
import MerciClient from "./MerciClient";

export const metadata: Metadata = {
  title: "Paiement confirmé — ENERGIA-CONSEIL IA®",
  description:
    "Votre audit énergétique IA est en cours de préparation. Prochaines étapes et envoi des photos.",
};

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const sessionId = params.session_id?.trim() || null;

  return <MerciClient sessionId={sessionId} />;
}
