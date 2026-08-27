import {
  CONTACT_CHIFFRAGE,
  MENTIONS_COMMERCIALES,
  MENTIONS_DEPLACEMENT,
} from "../../lib/chiffrage";

export default function RapportMentions() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm print:border-0 print:shadow-none">
      <h2 className="text-lg font-semibold text-[#1a3c5e]">Mentions commerciales et juridiques</h2>
      <ul className="mt-3 space-y-2 text-sm text-slate-800">
        {MENTIONS_COMMERCIALES.map((mention) => (
          <li key={mention} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            {mention}
          </li>
        ))}
      </ul>
      <h3 className="mt-5 text-base font-semibold text-[#1a3c5e]">Déplacements et visites</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-800">
        {MENTIONS_DEPLACEMENT.map((mention) => (
          <li key={mention} className="rounded-lg border border-orange-200 bg-[#fff7ed] px-3 py-2">
            {mention}
          </li>
        ))}
      </ul>
      <div className="mt-4 rounded-lg border border-[#1a3c5e] bg-[#1a3c5e] px-4 py-3 text-white">
        <p className="font-semibold">{CONTACT_CHIFFRAGE.enseigne}</p>
        <p className="text-sm text-slate-200">{CONTACT_CHIFFRAGE.qualite}</p>
        <p className="mt-1 text-sm">
          Contact professionnel :{" "}
          <a className="underline" href={`mailto:${CONTACT_CHIFFRAGE.email}`}>
            {CONTACT_CHIFFRAGE.email}
          </a>
        </p>
      </div>
    </section>
  );
}
