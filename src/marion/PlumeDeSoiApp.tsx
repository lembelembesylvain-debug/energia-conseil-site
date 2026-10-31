import { useEffect, useState } from "react";
import SalesPage from "./components/SalesPage";
import StudentPortal from "./components/StudentPortal";
import { BRAND } from "./data/courseData";

type PageId = "vente" | "eleve";

const serif = '"Cormorant Garamond", Georgia, "Times New Roman", serif';
const sans = '"Outfit", "Avenir Next", "Segoe UI", sans-serif';

function PlumeMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        d="M10 36c8-2 14-10 16-22 6 8 10 14 14 22-8 2-18 4-30 0Z"
        fill="#6E7F62"
      />
      <path
        d="M24 14c2 8 2 16 0 24"
        fill="none"
        stroke="#F7F3EC"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function pageFromHash(): PageId {
  return window.location.hash === "#eleve" ? "eleve" : "vente";
}

export default function PlumeDeSoiApp() {
  const [page, setPage] = useState<PageId>(pageFromHash);

  function show(next: PageId) {
    const hash = next === "eleve" ? "#eleve" : "";
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", `${window.location.pathname}${hash}`);
    }
    setPage(next);
  }

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${BRAND.name} — ${BRAND.formation}`;

    const id = "plume-de-soi-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Outfit:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div
      className="min-h-screen text-[#2F2A26]"
      style={{
        fontFamily: sans,
        background:
          "radial-gradient(1200px 500px at 10% -10%, #E7EFE4 0%, transparent 55%), radial-gradient(900px 420px at 110% 0%, #F3E4DC 0%, transparent 50%), #F4EFE6",
      }}
    >
      <header className="sticky top-0 z-40 border-b border-[#E3D8C8]/80 bg-[#F7F3EC]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
          <button
            type="button"
            onClick={() => show("vente")}
            className="flex items-center gap-2.5 text-left"
          >
            <PlumeMark />
            <span className="leading-tight">
              <span className="block text-[1.35rem] text-[#3F4F3C]" style={{ fontFamily: serif }}>
                {BRAND.name}
              </span>
              <span className="block text-[10px] uppercase tracking-[0.22em] text-[#8A8178]">
                {BRAND.discipline}
              </span>
            </span>
          </button>

          <nav className="flex items-center gap-1 rounded-full border border-[#E3D8C8] bg-white/70 p-1 shadow-sm">
            <NavButton active={page === "vente"} onClick={() => show("vente")}>
              La formation
            </NavButton>
            <NavButton active={page === "eleve"} onClick={() => show("eleve")}>
              Espace élève
            </NavButton>
          </nav>
        </div>
      </header>

      {page === "vente" ? (
        <SalesPage onEnterPortal={() => show("eleve")} />
      ) : (
        <StudentPortal onBackToOffer={() => show("vente")} />
      )}

      <footer className="border-t border-[#E3D8C8] px-5 py-10 text-center text-sm text-[#6E655C] sm:px-8">
        <p style={{ fontFamily: serif }} className="text-2xl text-[#3F4F3C]">
          {BRAND.name}
        </p>
        <p className="mt-2">
          {BRAND.formation} · {BRAND.formatrice}
        </p>
        <p className="mt-1">
          <a className="underline decoration-[#C4846A]/60 underline-offset-4" href={`mailto:${BRAND.email}`}>
            {BRAND.email}
          </a>
        </p>
        <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#8A8178]">
          Pratique de bien-être. Cette formation ne constitue ni un acte médical, ni un diplôme d'État.
        </p>
      </footer>
    </div>
  );
}

function NavButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-2 text-sm transition sm:px-4 ${
        active ? "bg-[#3F4F3C] text-[#F7F3EC]" : "text-[#4E463F] hover:bg-[#E7EFE4]"
      }`}
    >
      {children}
    </button>
  );
}
