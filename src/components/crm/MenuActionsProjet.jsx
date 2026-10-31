import { useEffect, useId, useRef, useState } from "react";
import { peutEditerProjetLocal, estDossierOfficiel } from "../../lib/crm/projetsManuels";

/**
 * Menu d'actions rapides sur une ligne projet CRM (édition, statut, fiche, archive).
 */
export default function MenuActionsProjet({
  projet,
  peutEditer = false,
  onModifier,
  onStatutExpress,
  onVoirFiche,
  onArchiver,
  compact = false,
}) {
  const [ouvert, setOuvert] = useState(false);
  const rootRef = useRef(null);
  const menuId = useId();
  const editable = peutEditer && peutEditerProjetLocal(projet);

  useEffect(() => {
    if (!ouvert) return undefined;
    const onDoc = (event) => {
      if (!rootRef.current?.contains(event.target)) setOuvert(false);
    };
    const onKey = (event) => {
      if (event.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [ouvert]);

  if (!projet) return null;

  const actions = [
    editable
      ? {
          id: "modifier",
          label: "Modifier manuellement",
          onClick: () => onModifier?.(projet),
        }
      : null,
    editable
      ? {
          id: "statut",
          label: "Changer Statut express",
          onClick: () => onStatutExpress?.(projet),
        }
      : null,
    {
      id: "fiche",
      label: "Voir Fiche Présentation",
      onClick: () => onVoirFiche?.(projet),
    },
    editable
      ? {
          id: "archiver",
          label: estDossierOfficiel(projet.id) ? "Archiver" : "Archiver / Supprimer",
          danger: true,
          onClick: () => onArchiver?.(projet),
        }
      : null,
  ].filter(Boolean);

  return (
    <div className="relative inline-flex" ref={rootRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={ouvert}
        aria-controls={menuId}
        onClick={() => setOuvert((v) => !v)}
        className={
          compact
            ? "rounded-lg border border-slate-600 bg-slate-950/80 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:border-sky-400/50 hover:text-sky-200"
            : "rounded-lg border border-slate-600 bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-sky-400/50 hover:text-sky-200"
        }
      >
        Actions ▾
      </button>
      {ouvert ? (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 z-30 mt-1 min-w-[14rem] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl shadow-black/40"
        >
          {actions.map((action) => (
            <button
              key={action.id}
              type="button"
              role="menuitem"
              className={`block w-full px-3 py-2 text-left text-xs font-medium hover:bg-slate-800 ${
                action.danger ? "text-rose-300 hover:text-rose-200" : "text-slate-200"
              }`}
              onClick={() => {
                setOuvert(false);
                action.onClick();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
