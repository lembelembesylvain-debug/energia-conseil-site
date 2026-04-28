import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <main className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-900">Renov&apos;Optim IA</h1>
        <p className="mt-3 text-slate-600">
          Plateforme SaaS de simulation MaPrimeRenov&apos; 2026 (hors IDF), avec
          authentification Supabase et parcours en 3 etapes.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Se connecter
          </Link>
          <Link
            href="/signup"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Creer un compte
          </Link>
          <Link
            href="/dashboard"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
          >
            Aller au dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}
