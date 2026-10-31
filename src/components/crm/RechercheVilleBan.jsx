import { useEffect, useId, useRef, useState } from "react";
import { rechercherAdressesBan, rechercherVillesBan } from "../../lib/crm/rechercheVilleBan";

function IconeLoupe() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function RechercheVilleBan({ onChoisir, latProximite, lngProximite, mode = "ville" }) {
  const listeId = useId();
  const racineRef = useRef(null);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const [saisie, setSaisie] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [ouvert, setOuvert] = useState(false);
  const [actif, setActif] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState("");
  const ignoreRechercheRef = useRef(false);

  useEffect(() => {
    const q = saisie.trim();
    if (ignoreRechercheRef.current) {
      ignoreRechercheRef.current = false;
      setChargement(false);
      return undefined;
    }
    if (q.length < 3) {
      setSuggestions([]);
      setChargement(false);
      setErreur("");
      return undefined;
    }

    const chercher = mode === "adresse" ? rechercherAdressesBan : rechercherVillesBan;
    setChargement(true);
    debounceRef.current = window.setTimeout(() => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      chercher(q, {
        signal: ac.signal,
        lat: latProximite,
        lng: lngProximite,
      })
        .then((liste) => {
          setSuggestions(liste);
          setActif(0);
          setErreur(liste.length ? "" : mode === "adresse" ? "Aucune adresse trouvée." : "Aucune ville trouvée.");
          setOuvert(true);
        })
        .catch((err) => {
          if (err?.name === "AbortError") return;
          setSuggestions([]);
          setErreur(err?.message || "Recherche BAN indisponible.");
          setOuvert(true);
        })
        .finally(() => {
          if (!ac.signal.aborted) setChargement(false);
        });
    }, 280);

    return () => {
      window.clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
  }, [saisie, latProximite, lngProximite, mode]);

  useEffect(() => {
    const fermer = (event) => {
      if (!racineRef.current?.contains(event.target)) setOuvert(false);
    };
    document.addEventListener("mousedown", fermer);
    return () => document.removeEventListener("mousedown", fermer);
  }, []);

  const valider = (item) => {
    if (!item) return;
    ignoreRechercheRef.current = true;
    window.clearTimeout(debounceRef.current);
    abortRef.current?.abort();
    setSaisie(item.label || `${item.nom}${item.codePostal ? ` (${item.codePostal})` : ""}`);
    setSuggestions([]);
    setOuvert(false);
    onChoisir(item);
  };

  const onKeyDown = (event) => {
    if (event.key === "Escape") {
      setOuvert(false);
      return;
    }
    if (!ouvert || suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActif((n) => (n + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActif((n) => (n - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      valider(suggestions[actif]);
    }
  };

  return (
    <div ref={racineRef} className="relative min-w-[16rem] flex-[1.4]">
      <label className="block">
        <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-300">
          Sniper — {mode === "adresse" ? "adresse ou parcelle" : "ville ou code postal"}
        </span>
        <span className="relative block">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-emerald-400/90">
            <IconeLoupe />
          </span>
          <input
            type="text"
            value={saisie}
            onChange={(e) => {
              setSaisie(e.target.value);
              setOuvert(true);
            }}
            onFocus={() => {
              if (suggestions.length || erreur) setOuvert(true);
            }}
            onKeyDown={onKeyDown}
            placeholder={mode === "adresse" ? "12 rue de la République, Chagny" : "Rechercher une ville ou un code postal"}
            autoComplete="off"
            role="combobox"
            aria-expanded={ouvert && (suggestions.length > 0 || Boolean(erreur))}
            aria-controls={listeId}
            aria-autocomplete="list"
            className="w-full rounded-xl border border-slate-700 bg-slate-900 py-2 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400/60 focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
          />
          {chargement ? (
            <span className="absolute inset-y-0 right-3 flex items-center text-[10px] uppercase tracking-wide text-emerald-300">
              BAN…
            </span>
          ) : null}
        </span>
      </label>

      {ouvert && (suggestions.length > 0 || erreur) ? (
        <ul
          id={listeId}
          role="listbox"
          className="absolute z-[2100] mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-700 bg-slate-950/98 py-1 shadow-2xl"
        >
          {erreur && suggestions.length === 0 ? (
            <li className="px-3 py-2 text-xs text-slate-400">{erreur}</li>
          ) : (
            suggestions.map((item, index) => (
              <li key={item.id} role="option" aria-selected={index === actif}>
                <button
                  type="button"
                  onMouseEnter={() => setActif(index)}
                  onClick={() => valider(item)}
                  className={`flex w-full items-start justify-between gap-3 px-3 py-2 text-left text-sm ${
                    index === actif ? "bg-emerald-500/15 text-white" : "text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  <span>
                    <span className="font-medium">{item.label || item.nom}</span>
                    <span className="mt-0.5 block text-[11px] text-slate-400">{item.contexte || item.nom}</span>
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-emerald-300">
                    {item.codePostal || item.departement}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}
    </div>
  );
}
