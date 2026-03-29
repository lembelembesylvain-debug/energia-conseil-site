import Link from "next/link";

export const metadata = {
  title: "Merci — ENERGIA-CONSEIL IA®",
  description: "Votre paiement a été enregistré.",
};

export default async function MerciPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const params = await searchParams;
  const hasSession = Boolean(params.session_id);

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-[#f0fdf4] to-white px-4 py-16 text-center">
      <div className="max-w-lg rounded-2xl border border-[#2d5a3d]/15 bg-white p-10 shadow-2xl">
        <p className="text-5xl" aria-hidden>
          ✓
        </p>
        <h1 className="mt-4 text-2xl font-bold text-[#2d5a3d] sm:text-3xl">
          Merci pour votre commande
        </h1>
        <p className="mt-4 text-neutral-600">
          {hasSession
            ? "Votre paiement est confirmé. Vous recevrez très prochainement les instructions pour lancer votre audit énergétique IA."
            : "Merci ! Si vous venez de finaliser un paiement, notre équipe vous recontacte sous peu."}
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-2xl bg-[#52b788] px-8 py-3 font-semibold text-white shadow-lg transition hover:bg-[#40916c]"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
