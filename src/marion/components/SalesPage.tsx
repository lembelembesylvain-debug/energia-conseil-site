import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import {
  BRAND,
  ENROLL_KEY,
  FAQ,
  MODULES,
  TESTIMONIALS,
  lessonDurationLabel,
  totalDurationMin,
} from "../data/courseData";

const serif = '"Cormorant Garamond", Georgia, serif';

type SalesPageProps = {
  onEnterPortal: () => void;
};

export default function SalesPage({ onEnterPortal }: SalesPageProps) {
  const [payOpen, setPayOpen] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [review, setReview] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setEnrolled(window.localStorage.getItem(ENROLL_KEY) === "1");
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => {
      setReview((current) => (current + 1) % TESTIMONIALS.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [paused]);

  function openPay() {
    if (enrolled) {
      onEnterPortal();
      return;
    }
    setPayOpen(true);
  }

  function confirmEnrollment() {
    window.localStorage.setItem(ENROLL_KEY, "1");
    setEnrolled(true);
    setPayOpen(false);
    onEnterPortal();
  }

  const hours = Math.round(totalDurationMin() / 60);

  return (
    <main>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.15fr_0.85fr] lg:py-24">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[#6E7F62]">Formation en ligne · 01</p>
          <h1 className="mt-4 text-5xl leading-[0.95] text-[#2C3328] sm:text-7xl" style={{ fontFamily: serif }}>
            {BRAND.formation}
          </h1>
          <p className="mt-6 max-w-xl text-lg font-light leading-relaxed text-[#5C554C]">
            Apprendre le massage métamorphique comme on apprend une langue lente : par le geste,
            le silence, et un protocole que l'on peut tenir dès la première séance offerte.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openPay}
              className="rounded-full bg-[#3F4F3C] px-6 py-3.5 text-sm tracking-wide text-[#F7F3EC] shadow-sm transition hover:bg-[#324032]"
            >
              {enrolled ? "Entrer dans l'espace élève" : `Rejoindre la formation · ${BRAND.priceEur} €`}
            </button>
            <a href="#programme" className="rounded-full px-4 py-3 text-sm text-[#6E7F62] underline-offset-4 hover:underline">
              Voir les 4 modules
            </a>
          </div>
          <p className="mt-5 text-sm text-[#8A8178]">
            {hours} h de vidéo · protocole PDF · cercle Telegram · garantie {BRAND.garantieJours} jours
          </p>
        </div>
        <aside className="relative overflow-hidden rounded-[2rem] border border-[#E3D8C8] bg-[#FBF8F4] p-8 shadow-[0_30px_80px_-40px_rgba(63,79,60,0.45)]">
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#E7EFE4]" />
          <div className="absolute -bottom-8 -left-6 h-28 w-28 rounded-full bg-[#F3E4DC]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.22em] text-[#C4846A]">Avec {BRAND.formatrice}</p>
            <p className="mt-4 text-4xl text-[#2C3328]" style={{ fontFamily: serif }}>
              Un geste.
              <br />
              Quatre modules.
              <br />
              Une séance entière.
            </p>
            <dl className="mt-8 space-y-3 text-sm text-[#5C554C]">
              <Row k="Investissement" v={`${BRAND.priceEur} €`} />
              <Row k="Accès" v={BRAND.acces} />
              <Row k="Format" v="Vidéos + protocole" />
              <Row k="Contact" v={BRAND.email} />
            </dl>
          </div>
        </aside>
      </section>

      <Block n="02" title="Le poids que l'on porte sans le nommer" kicker="Le constat">
        <p>
          Beaucoup arrivent au massage métamorphique après avoir accumulé des techniques, des
          protocoles trop pleins, et la sensation de devoir « faire quelque chose » à la personne
          allongée. Le corps est là. L'attention, moins.
        </p>
        <p>
          On cherche alors une pratique qui ne demande pas de diagnostiquer, ni de réparer, ni de
          raconter une histoire à la place de l'autre. Juste un toucher assez léger pour que quelque
          chose, parfois, se dépose.
        </p>
      </Block>

      <Block n="03" title="Ce que vous cherchez vraiment" kicker="La promesse" tint>
        <p>
          Pas une certification de plus à afficher. Une manière de tenir une séance du premier
          silence jusqu'à la clôture, sans vous perdre dans les zones, sans accélérer quand le calme
          s'installe.
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            "Un protocole que vous pouvez refaire les yeux presque fermés.",
            "Une éthique simple : accueillir, ne pas interpréter.",
            "La permission d'offrir vos premières séances sans vous justifier.",
          ].map((item) => (
            <li key={item} className="rounded-2xl border border-[#E3D8C8] bg-white/70 p-4 text-sm leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </Block>

      <Block n="04" title="Une pratique ancienne, un geste très simple" kicker="La discipline">
        <p>
          Le massage métamorphique travaille par un toucher léger des pieds, des mains et de la tête.
          Il ne manipule pas, ne craque rien, ne promet pas de dénouer un passé. Il propose un cadre
          de présence, répété avec constance.
        </p>
        <p>
          {BRAND.formation} traduit cette simplicité en un chemin filmé : vous voyez la main de Marion,
          vous entendez quand rester, et vous recevez la fiche qui tient dans une séance réelle.
        </p>
      </Block>

      <Block n="05" title="Cette formation est pour vous si…" kicker="Pour qui">
        <div className="grid gap-6 md:grid-cols-2">
          <Card title="Elle vous convient">
            <ul className="space-y-2">
              {[
                "Vous voulez offrir un geste de bien-être, à des proches puis peut-être plus largement.",
                "Vous pratiquez déjà et vous cherchez plus de lenteur que de technique.",
                "Vous aimez apprendre en regardant, puis en refaisant tout de suite.",
              ].map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </Card>
          <Card title="Elle ne vous convient pas">
            <ul className="space-y-2">
              {[
                "Vous cherchez un diplôme d'État ou un acte de soin réglementé.",
                "Vous voulez une méthode qui promet un résultat mesurable sur un symptôme.",
                "Vous préférez un stage en salle, sans travail en autonomie.",
              ].map((item) => (
                <li key={item}>· {item}</li>
              ))}
            </ul>
          </Card>
        </div>
      </Block>

      <section id="programme" className="scroll-mt-24 border-y border-[#E3D8C8] bg-[#FBF8F4]/70">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#C4846A]">06 · Le parcours</p>
          <h2 className="mt-3 max-w-2xl text-4xl text-[#2C3328] sm:text-5xl" style={{ fontFamily: serif }}>
            Quatre modules, dans l'ordre d'une vraie séance
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {MODULES.map((module) => (
              <article key={module.id} className="rounded-[1.6rem] border border-[#E3D8C8] bg-white/80 p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-[#6E7F62]">Module {module.index}</p>
                <h3 className="mt-2 text-3xl text-[#2C3328]" style={{ fontFamily: serif }}>
                  {module.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[#5C554C]">{module.intention}</p>
                <ul className="mt-4 space-y-2 text-sm text-[#4E463F]">
                  {module.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-baseline justify-between gap-3 border-t border-[#EFE6DA] pt-2">
                      <span>{lesson.title}</span>
                      <span className="shrink-0 text-xs text-[#8A8178]">{lessonDurationLabel(lesson.durationMin)}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Block n="07" title="Ce qui change après la formation" kicker="Ce avec quoi vous repartez">
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Le protocole complet", "Pieds, mains, tête et clôture, dans un PDF à garder à côté du tapis."],
            ["Les séances filmées", "Chaque geste est montré, puis repris dans une séance commentée."],
            ["Votre cadre", "Les mots pour présenter la pratique sans surpromettre."],
            ["Le cercle", "Un groupe Telegram privé pour les questions des premières semaines."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl bg-[#F7F3EC] p-5">
              <h3 className="text-2xl text-[#3F4F3C]" style={{ fontFamily: serif }}>
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5C554C]">{text}</p>
            </div>
          ))}
        </div>
      </Block>

      <Block n="08" title="Marion Duriaux" kicker="La formatrice" tint>
        <div className="grid items-start gap-8 md:grid-cols-[180px_1fr]">
          <div className="flex h-44 w-44 items-end justify-center rounded-[2rem] bg-gradient-to-b from-[#E7EFE4] to-[#F3E4DC]">
            <span className="pb-6 text-5xl text-[#3F4F3C]" style={{ fontFamily: serif }}>
              M
            </span>
          </div>
          <div className="space-y-4">
            <p>
              Marion accompagne par le massage métamorphique sous le nom {BRAND.name}. Elle filme
              comme elle pratique : peu de mots, une main visible, et le temps laissé à ce qui ne se
              voit pas tout de suite.
            </p>
            <p>
              Cette formation est le protocole qu'elle transmet lorsqu'on lui demande « par où
              commencer ». Pas un catalogue de variantes. Le geste, tenu jusqu'au bout.
            </p>
            <p>
              Pour lui écrire directement :{" "}
              <a className="text-[#3F4F3C] underline decoration-[#C4846A] underline-offset-4" href={`mailto:${BRAND.email}`}>
                {BRAND.email}
              </a>
            </p>
          </div>
        </div>
      </Block>

      <section
        className="border-y border-[#E3D8C8]"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#C4846A]">09 · Elles et ils en parlent</p>
          <figure className="mt-8">
            <blockquote className="text-3xl leading-snug text-[#2C3328] sm:text-4xl" style={{ fontFamily: serif }}>
              « {TESTIMONIALS[review].quote} »
            </blockquote>
            <figcaption className="mt-6 text-sm text-[#6E655C]">
              {TESTIMONIALS[review].name}
              <span className="text-[#C4846A]"> · </span>
              {TESTIMONIALS[review].detail}
            </figcaption>
          </figure>
          <div className="mt-8 flex items-center justify-center gap-3">
            <CarouselButton label="Avis précédent" onClick={() => setReview((i) => (i + TESTIMONIALS.length - 1) % TESTIMONIALS.length)}>
              ←
            </CarouselButton>
            {TESTIMONIALS.map((item, index) => (
              <button
                key={item.id}
                type="button"
                aria-label={`Avis de ${item.name}`}
                onClick={() => setReview(index)}
                className={`h-2.5 rounded-full transition-all ${index === review ? "w-8 bg-[#6E7F62]" : "w-2.5 bg-[#D9CBBA]"}`}
              />
            ))}
            <CarouselButton label="Avis suivant" onClick={() => setReview((i) => (i + 1) % TESTIMONIALS.length)}>
              →
            </CarouselButton>
          </div>
        </div>
      </section>

      <section id="inscription" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <p className="text-xs uppercase tracking-[0.28em] text-[#6E7F62]">10 · L'inscription</p>
          <div className="mt-6 overflow-hidden rounded-[2rem] border border-[#E3D8C8] bg-[#3F4F3C] text-[#F7F3EC] shadow-[0_24px_60px_-36px_rgba(63,79,60,0.8)] md:grid md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-8 sm:p-10">
              <h2 className="text-4xl sm:text-5xl" style={{ fontFamily: serif }}>
                {BRAND.formation}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[#E4EBDF]">
                Tout le parcours, le protocole PDF et l'entrée dans le cercle privé. Un seul
                règlement, puis vous avancez quand la maison est calme.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-[#E4EBDF]">
                <li>· {MODULES.length} modules, {hours} heures de leçons</li>
                <li>· Lecteur et progression dans l'espace élève</li>
                <li>· {BRAND.acces}</li>
              </ul>
            </div>
            <div className="flex flex-col justify-between bg-[#FBF8F4] p-8 text-[#2F2A26] sm:p-10">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#C4846A]">Paiement unique</p>
                <p className="mt-2 text-6xl text-[#3F4F3C]" style={{ fontFamily: serif }}>
                  {BRAND.priceEur} €
                </p>
              </div>
              <button
                type="button"
                onClick={openPay}
                className="mt-8 rounded-full bg-[#C4846A] px-6 py-3.5 text-sm text-white transition hover:bg-[#b3735c]"
              >
                {enrolled ? "Ouvrir mon espace élève" : "S'inscrire maintenant"}
              </button>
              <p className="mt-4 text-xs leading-relaxed text-[#8A8178]">
                Démonstration : le paiement Stripe est simulé, aucun montant n'est débité.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Block n="11" title={`Garantie douce de ${BRAND.garantieJours} jours`} kicker="Sans justification">
        <p>
          Regardez les premiers modules. Refaites le protocole des pieds. Si le geste ne vous
          correspond pas, écrivez à Marion dans les {BRAND.garantieJours} jours : le montant vous est
          rendu intégralement.
        </p>
        <p className="rounded-2xl border border-[#E7C8B8] bg-[#FBF6F2] p-5 text-sm">
          Un message suffit, à{" "}
          <a className="font-medium text-[#3F4F3C]" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>
          . Pas de formulaire, pas d'argumentaire à fournir.
        </p>
      </Block>

      <section className="mx-auto max-w-3xl px-5 pb-8 sm:px-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#C4846A]">12 · Avant de vous décider</p>
        <h2 className="mt-3 text-4xl text-[#2C3328]" style={{ fontFamily: serif }}>
          Questions fréquentes
        </h2>
        <div className="mt-6 divide-y divide-[#E3D8C8] border-y border-[#E3D8C8]">
          {FAQ.map((item) => (
            <details key={item.question} className="group py-4">
              <summary className="cursor-pointer list-none text-lg text-[#2C3328] marker:content-none">
                <span className="mr-2 text-[#C4846A] group-open:hidden">+</span>
                <span className="mr-2 hidden text-[#C4846A] group-open:inline">–</span>
                {item.question}
              </summary>
              <p className="mt-3 pl-5 text-sm leading-relaxed text-[#5C554C]">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 rounded-[1.8rem] border border-[#E3D8C8] bg-white/75 px-6 py-10 text-center">
          <h2 className="text-4xl text-[#2C3328]" style={{ fontFamily: serif }}>
            Le premier geste est de réserver votre place
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-[#5C554C]">
            Ou d'écrire à Marion si une question reste ouverte. Elle lit les messages envoyés à{" "}
            {BRAND.email}.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={openPay}
              className="rounded-full bg-[#3F4F3C] px-6 py-3.5 text-sm text-[#F7F3EC]"
            >
              {enrolled ? "Continuer dans l'espace élève" : `Je m'inscris · ${BRAND.priceEur} €`}
            </button>
            <a
              href={`mailto:${BRAND.email}?subject=Question%20—%20L'Art%20de%20la%20M%C3%A9tamorphose`}
              className="rounded-full border border-[#C4846A] px-6 py-3.5 text-sm text-[#8A5344]"
            >
              Écrire à Marion
            </a>
          </div>
        </div>
      </section>

      {payOpen && (
        <PaymentModal onClose={() => setPayOpen(false)} onSuccess={confirmEnrollment} />
      )}
    </main>
  );
}

function Block({
  n,
  kicker,
  title,
  tint,
  children,
}: {
  n: string;
  kicker: string;
  title: string;
  tint?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={tint ? "bg-[#E7EFE4]/45" : undefined}>
      <div className="mx-auto max-w-3xl space-y-4 px-5 py-16 text-[#4E463F] sm:px-8">
        <p className="text-xs uppercase tracking-[0.28em] text-[#6E7F62]">
          {n} · {kicker}
        </p>
        <h2 className="text-4xl leading-tight text-[#2C3328] sm:text-5xl" style={{ fontFamily: serif }}>
          {title}
        </h2>
        <div className="space-y-4 text-base leading-relaxed">{children}</div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[#EFE6DA] pb-2">
      <dt className="text-[#8A8178]">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-[#E3D8C8] bg-white/70 p-6 text-sm leading-relaxed">
      <h3 className="mb-3 text-2xl text-[#3F4F3C]" style={{ fontFamily: serif }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function CarouselButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E3D8C8] text-[#3F4F3C] hover:bg-white"
    >
      {children}
    </button>
  );
}

function PaymentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const digits = card.replace(/\s/g, "");
    if (name.trim().length < 3 || digits.length < 16 || !/^\d{2}\/\d{2}$/.test(expiry) || cvc.length < 3) {
      setError("Vérifiez le nom, les 16 chiffres, la date MM/AA et le cryptogramme.");
      return;
    }
    setError("");
    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      onSuccess();
    }, 1100);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2C3328]/45 p-4 sm:items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="paiement-titre"
        className="w-full max-w-md rounded-[1.6rem] bg-[#FBF8F4] p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#6E7F62]">Stripe · simulation</p>
            <h2 id="paiement-titre" className="mt-1 text-3xl text-[#2C3328]" style={{ fontFamily: serif }}>
              Régler {BRAND.priceEur} €
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-sm text-[#8A8178]" aria-label="Fermer">
            Fermer
          </button>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-[#8A8178]">
          Aucun paiement réel. Les chiffres saisis restent dans cette fenêtre et ne sont pas enregistrés.
        </p>
        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <Field label="Nom sur la carte" value={name} onChange={setName} autoComplete="cc-name" />
          <Field
            label="Numéro de carte"
            value={card}
            inputMode="numeric"
            autoComplete="cc-number"
            onChange={(value) =>
              setCard(
                value
                  .replace(/\D/g, "")
                  .slice(0, 16)
                  .replace(/(\d{4})(?=\d)/g, "$1 ")
                  .trim(),
              )
            }
          />
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Expiration"
              value={expiry}
              placeholder="MM/AA"
              autoComplete="cc-exp"
              onChange={(value) => {
                const digits = value.replace(/\D/g, "").slice(0, 4);
                setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
              }}
            />
            <Field
              label="CVC"
              value={cvc}
              inputMode="numeric"
              autoComplete="cc-csc"
              onChange={(value) => setCvc(value.replace(/\D/g, "").slice(0, 4))}
            />
          </div>
          {error && <p className="text-sm text-[#8A5344]">{error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-2 w-full rounded-full bg-[#3F4F3C] py-3.5 text-sm text-[#F7F3EC] disabled:opacity-60"
          >
            {pending ? "Confirmation…" : `Payer ${BRAND.priceEur} €`}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "text";
}) {
  return (
    <label className="block text-xs uppercase tracking-[0.14em] text-[#8A8178]">
      {label}
      <input
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-xl border border-[#E3D8C8] bg-white px-3 py-2.5 text-base normal-case tracking-normal text-[#2F2A26] outline-none focus:border-[#6E7F62]"
      />
    </label>
  );
}
