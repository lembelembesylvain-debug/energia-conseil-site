import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

const PHONE_DISPLAY = "06 10 59 68 98";
const PHONE_HREF = "tel:+33610596898";
const EMAIL = "contact@energia-conseil-ia.com";
const EMAIL_HREF = "mailto:contact@energia-conseil-ia.com";
const ADDRESS = "16 rue Cuvier, 69006 Lyon";
const SITE_URL = "https://energia-conseil-ia.com";
const CALCULATOR_URL = "https://renovoptim-ia.com";
const WHATSAPP_URL = "https://wa.me/33610596898";
const SHARE_TITLE = "Sylvain Lembelembe — ENERGIA CONSEIL IA®";
const SHARE_TEXT =
  "Carte de visite digitale de Sylvain Lembelembe, Président & Contractant Général Digital — ENERGIA CONSEIL IA®";

const VCARD =
  "BEGIN:VCARD\n" +
  "VERSION:3.0\n" +
  "FN:Sylvain Lembelembe\n" +
  "ORG:ENERGIA CONSEIL IA\n" +
  "TITLE:Président & Contractant Général Digital\n" +
  "TEL;TYPE=CELL:+33610596898\n" +
  "EMAIL;TYPE=WORK:contact@energia-conseil-ia.com\n" +
  "URL:https://energia-conseil-ia.com\n" +
  "ADR;TYPE=WORK:;;16 Rue Cuvier;Lyon;;69006;France\n" +
  "END:VCARD";

function downloadVCard() {
  const blob = new Blob([VCARD], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Sylvain_Lembelembe.vcf";
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(function () {
    URL.revokeObjectURL(url);
  }, 1500);
}

const fade = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.08 + i * 0.07,
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  }),
};

function Icon({
  children,
  size = "sm",
}: {
  children: ReactNode;
  size?: "sm" | "md";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={size === "md" ? "h-6 w-6" : "h-5 w-5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function PhoneIcon({ size }: { size?: "sm" | "md" }) {
  return (
    <Icon size={size}>
      <path d="M6.2 3.8h2.6c.5 0 .9.4 1 .9l.4 2.3c.1.4-.1.8-.4 1.1L8.4 9.5a12.2 12.2 0 0 0 6.1 6.1l1.4-1.4c.3-.3.7-.5 1.1-.4l2.3.4c.5.1.9.5.9 1v2.6c0 .6-.5 1.1-1.1 1C10.2 18.4 5.6 13.8 5.2 4.9c0-.6.5-1.1 1-1.1Z" />
    </Icon>
  );
}

function MailIcon({ size }: { size?: "sm" | "md" }) {
  return (
    <Icon size={size}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.2" />
      <path d="m5 8 7 5.2L19 8" />
    </Icon>
  );
}

function WhatsAppIcon({ size }: { size?: "sm" | "md" }) {
  return (
    <Icon size={size}>
      <path d="M7.2 19.4 4.8 20l.7-2.5A8.2 8.2 0 1 1 12 20.2a8.1 8.1 0 0 1-4.8-.8Z" />
      <path d="M9.1 9.4c.2-.5.3-.5.6-.5h.5c.2 0 .4.1.5.4.2.5.7 1.7.7 1.8s0 .3-.2.5l-.4.4c-.2.2-.2.3 0 .6.3.5.8 1 1.4 1.4.3.2.5.2.6 0l.4-.4c.2-.2.4-.2.6-.1.4.2 1.1.5 1.3.6s.3.3.2.5c-.1.4-.6 1.1-1.2 1.2-.5.1-1.1.1-1.8-.2-1.8-.7-3.2-2.1-3.8-3.3-.4-.8-.5-1.5-.4-2 .1-.5.7-1.1 1-1.4Z" />
    </Icon>
  );
}

function GlobeIcon({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <Icon size={size}>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M3.8 12h16.4M12 3.8c2.4 2.4 3.6 5.2 3.6 8.2s-1.2 5.8-3.6 8.2c-2.4-2.4-3.6-5.2-3.6-8.2s1.2-5.8 3.6-8.2Z" />
    </Icon>
  );
}

function CalcIcon({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <Icon size={size}>
      <rect x="5.2" y="3.5" width="13.6" height="17" rx="2" />
      <path d="M8.2 7.6h7.6" />
      <path d="M8.4 12.2h.01M12 12.2h.01M15.6 12.2h.01M8.4 16h.01M12 16h.01M15.6 16h.01" />
    </Icon>
  );
}

function ArrowIcon() {
  return (
    <Icon>
      <path d="M7 17 17 7M9 7h8v8" />
    </Icon>
  );
}

function ContactIcon() {
  return (
    <Icon>
      <circle cx="9" cy="8" r="3.1" />
      <path d="M4.6 18.2c.6-2.5 2.4-3.9 4.4-3.9s3.8 1.4 4.4 3.9" />
      <path d="M17 8.2v5.6M14.2 11h5.6" />
    </Icon>
  );
}

function ShareIcon() {
  return (
    <Icon>
      <circle cx="18" cy="5.5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="18.5" r="2.2" />
      <path d="m8 12.8 7.2 4.2M15.2 6.9 8 11.2" />
    </Icon>
  );
}

async function copyPageUrl(url: string) {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = url;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-9999px";
    document.body.appendChild(field);
    field.select();
    const ok = document.execCommand("copy");
    field.remove();
    return ok;
  }
}

export default function CarteVisite() {
  const [shareMessage, setShareMessage] = useState("");

  useEffect(() => {
    if (!shareMessage) return;
    const timer = window.setTimeout(() => setShareMessage(""), 2800);
    return () => window.clearTimeout(timer);
  }, [shareMessage]);

  async function shareCard() {
    const url = window.location.href;
    const payload = { title: SHARE_TITLE, text: SHARE_TEXT, url };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(payload);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    const copied = await copyPageUrl(url);
    setShareMessage(
      copied
        ? "Lien de la carte copié dans le presse-papiers."
        : "Copie impossible — sélectionnez l’adresse de la page manuellement.",
    );
  }

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Sylvain Lembelembe — Carte de visite | ENERGIA CONSEIL IA®";

    const fontId = "cv-google-fonts";
    let fontLink = document.getElementById(fontId) as HTMLLinkElement | null;
    if (!fontLink) {
      fontLink = document.createElement("link");
      fontLink.id = fontId;
      fontLink.rel = "stylesheet";
      fontLink.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(fontLink);
    }

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="cv-page relative min-h-dvh overflow-x-hidden text-[#f7f3e8]">
      <style>{`
        .cv-page {
          font-family: Outfit, "Segoe UI", sans-serif;
          background:
            radial-gradient(1200px 700px at 50% -10%, rgba(212, 175, 55, 0.16), transparent 55%),
            radial-gradient(800px 500px at 110% 80%, rgba(80, 120, 180, 0.18), transparent 50%),
            linear-gradient(180deg, #06101c 0%, #0a1a32 45%, #071224 100%);
          overflow-x: hidden;
          max-width: 100vw;
        }
        .cv-page *,
        .cv-page *::before,
        .cv-page *::after {
          box-sizing: border-box;
        }
        .cv-name {
          font-family: "Cormorant Garamond", Georgia, serif;
          overflow-wrap: anywhere;
        }
        .cv-glass {
          background: linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.035));
          border: 1px solid rgba(212, 175, 55, 0.28);
          box-shadow:
            0 18px 50px -24px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
        }
        .cv-avatar {
          background: linear-gradient(160deg, #1a2d4d 0%, #0c1a2e 100%);
          box-shadow:
            0 0 0 1px rgba(212, 175, 55, 0.55),
            0 0 28px rgba(212, 175, 55, 0.28),
            inset 0 1px 0 rgba(255,255,255,0.18);
          animation: cv-glow 3.6s ease-in-out infinite;
        }
        .cv-btn {
          transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease;
        }
        .cv-btn:hover {
          transform: translateY(-2px);
        }
        .cv-btn:active {
          transform: translateY(0);
        }
        @keyframes cv-glow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(212,175,55,0.5), 0 0 22px rgba(212,175,55,0.22), inset 0 1px 0 rgba(255,255,255,0.18); }
          50% { box-shadow: 0 0 0 1px rgba(232,212,139,0.8), 0 0 36px rgba(212,175,55,0.42), inset 0 1px 0 rgba(255,255,255,0.22); }
        }
        @media (max-width: 380px) {
          .cv-brand {
            letter-spacing: 0.16em !important;
          }
          .cv-action-label {
            font-size: 0.65rem !important;
          }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-[#1e3a6e]/40 blur-3xl" />
        <div className="absolute -right-16 bottom-20 h-80 w-80 rounded-full bg-[#d4af37]/10 blur-3xl" />
      </div>

      <main className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-4 py-8 sm:max-w-[480px] sm:px-6 md:max-w-[520px] lg:max-w-[560px] lg:py-14">
        <motion.p
          custom={0}
          variants={fade}
          initial="hidden"
          animate="visible"
          className="cv-brand mb-7 text-center text-[11px] font-medium uppercase tracking-[0.32em] text-[#d4af37]"
        >
          ENERGIA CONSEIL IA®
        </motion.p>

        <motion.div
          custom={1}
          variants={fade}
          initial="hidden"
          animate="visible"
              className="cv-glass w-full max-w-full overflow-hidden rounded-[2rem] px-4 pb-7 pt-8 sm:px-8"
        >
          <div className="flex flex-col items-center text-center">
            <div
              className="cv-avatar mb-5 flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full sm:h-24 sm:w-24"
              aria-hidden
            >
              <span className="cv-name text-[1.85rem] font-semibold tracking-[0.08em] text-[#f3e6b8] sm:text-[2rem]">
                SL
              </span>
            </div>

            <h1 className="cv-name max-w-full px-1 text-[1.85rem] font-semibold leading-tight tracking-wide text-white sm:text-[2.35rem]">
              Sylvain Lembelembe
            </h1>
            <p className="mt-2 max-w-[18rem] px-1 text-[0.92rem] font-light leading-snug text-[#d8d2c4] sm:max-w-none sm:text-base">
              Président &amp; Contractant Général Digital
            </p>
            <p className="cv-brand mt-3 px-1 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-[#d4af37]">
              ENERGIA CONSEIL IA®
            </p>
          </div>

          <motion.div
            custom={2}
            variants={fade}
            initial="hidden"
            animate="visible"
            className="mt-8 grid grid-cols-3 gap-2 sm:gap-3"
          >
            <a
              href={PHONE_HREF}
              aria-label="Appeler Sylvain Lembelembe"
              className="cv-btn flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl bg-[#d4af37] px-1.5 text-[#0a1628] shadow-[0_10px_24px_-10px_rgba(212,175,55,0.7)] sm:px-2"
            >
              <PhoneIcon />
              <span className="cv-action-label text-[0.72rem] font-semibold tracking-wide sm:text-sm">Appeler</span>
            </a>
            <a
              href={EMAIL_HREF}
              aria-label="Envoyer un e-mail"
              className="cv-btn flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#d4af37]/45 bg-white/10 px-1.5 text-[#f3e6b8] sm:px-2"
            >
              <MailIcon />
              <span className="cv-action-label text-[0.72rem] font-semibold tracking-wide sm:text-sm">Email</span>
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir WhatsApp"
              className="cv-btn flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-[#d4af37]/45 bg-white/10 px-1.5 text-[#f3e6b8] sm:px-2"
            >
              <WhatsAppIcon />
              <span className="cv-action-label text-[0.72rem] font-semibold tracking-wide sm:text-sm">WhatsApp</span>
            </a>
          </motion.div>

          <motion.div
            custom={3}
            variants={fade}
            initial="hidden"
            animate="visible"
            className="mt-5 space-y-3"
          >
            <a
              href={SITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir le site officiel ENERGIA CONSEIL IA"
              className="cv-btn group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3.5 sm:gap-4 sm:px-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                <GlobeIcon />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold text-white">Site officiel</span>
                <span className="block truncate text-xs text-[#c8c0b0]">energia-conseil-ia.com</span>
              </span>
              <span className="shrink-0 text-[#d4af37] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowIcon />
              </span>
            </a>

            <a
              href={CALCULATOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Ouvrir le calculateur Rénov’Optim IA"
              className="cv-btn group flex min-w-0 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-3.5 sm:gap-4 sm:px-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d4af37]/15 text-[#d4af37]">
                <CalcIcon />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold leading-snug text-white">Calculateur Rénov’Optim IA</span>
                <span className="block truncate text-xs text-[#c8c0b0]">renovoptim-ia.com</span>
              </span>
              <span className="shrink-0 text-[#d4af37] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowIcon />
              </span>
            </a>
          </motion.div>

          <motion.div
            custom={4}
            variants={fade}
            initial="hidden"
            animate="visible"
            className="mt-5 space-y-3"
          >
            <button
              type="button"
              onClick={downloadVCard}
              className="cv-btn flex w-full min-h-12 items-center justify-center gap-2 rounded-full border border-[#d4af37] bg-transparent px-3 py-3 text-center text-sm font-semibold leading-snug tracking-wide text-[#f3e6b8] hover:bg-[#d4af37]/12"
            >
              <ContactIcon />
              Ajouter aux contacts
            </button>
            <button
              type="button"
              onClick={shareCard}
              className="cv-btn flex w-full min-h-12 items-center justify-center gap-2 rounded-full bg-[#d4af37] px-3 py-3 text-center text-sm font-semibold leading-snug tracking-wide text-[#0a1628] shadow-[0_10px_24px_-10px_rgba(212,175,55,0.7)] hover:bg-[#e0c15a]"
            >
              <ShareIcon />
              Partager ma carte
            </button>
            {shareMessage ? (
              <p role="status" className="text-center text-xs text-[#d4af37]">
                {shareMessage}
              </p>
            ) : null}
          </motion.div>
        </motion.div>

        <motion.footer
          custom={5}
          variants={fade}
          initial="hidden"
          animate="visible"
          className="mt-8 pb-2 text-center"
        >
          <p className="cv-brand text-[11px] font-medium uppercase tracking-[0.28em] text-[#d4af37]">
            ENERGIA CONSEIL IA®
          </p>
          <p className="mt-2 text-[0.82rem] font-light text-[#d8d2c4]">
            Président &amp; Contractant Général Digital
          </p>
          <address className="mt-3 not-italic">
            <ul className="space-y-1.5 text-[0.8rem] text-[#b8b0a0]">
              <li>
                <a href={PHONE_HREF} className="hover:text-[#d4af37]">
                  {PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={EMAIL_HREF} className="break-all hover:text-[#d4af37]">
                  {EMAIL}
                </a>
              </li>
              <li className="px-2">{ADDRESS}</li>
            </ul>
          </address>
        </motion.footer>
      </main>
    </div>
  );
}
