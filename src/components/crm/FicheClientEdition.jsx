import { euro } from "../../lib/crm/mockData";
import { STATUTS_OCCUPATION } from "../../lib/crm/editionDossier";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-500";

function Champ({ id, label, value, onChange, type = "text", disabled, children }) {
  return (
    <label className={labelClass} htmlFor={id}>
      {label}
      {children || (
        <input
          id={id}
          type={type}
          className={inputClass}
          value={value ?? ""}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export default function FicheClientEdition({ client, onChange, editable = false, dossier }) {
  const patch = (cle, valeur) => onChange?.({ ...client, [cle]: valeur });

  if (!editable) {
    return (
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className={labelClass}>Nom</dt>
          <dd className="mt-1 text-lg text-white">{client?.nom || dossier?.nom || "—"}</dd>
        </div>
        <div>
          <dt className={labelClass}>Prénom</dt>
          <dd className="mt-1 text-lg text-white">{client?.prenom || dossier?.prenoms || "—"}</dd>
        </div>
        <div>
          <dt className={labelClass}>Téléphone</dt>
          <dd className="mt-1 text-lg text-white">{client?.telephone || dossier?.telephone || "—"}</dd>
        </div>
        <div>
          <dt className={labelClass}>E-mail</dt>
          <dd className="mt-1 text-lg text-white">{client?.email || dossier?.email || "—"}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className={labelClass}>Mandant</dt>
          <dd className="mt-1 text-lg text-white">{client?.mandant || "—"}</dd>
        </div>
        {client?.cadreJuridique ? (
          <div className="sm:col-span-2">
            <dt className={labelClass}>Cadre juridique</dt>
            <dd className="mt-1 text-lg text-white">{client.cadreJuridique}</dd>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <dt className={labelClass}>Adresse complète du bien</dt>
          <dd className="mt-1 text-lg text-white">{client?.adresse || dossier?.adresse || "—"}</dd>
        </div>
        {client?.adresseDomicile ? (
          <div className="sm:col-span-2">
            <dt className={labelClass}>Adresse du mandant</dt>
            <dd className="mt-1 text-lg text-white">{client.adresseDomicile}</dd>
          </div>
        ) : null}
        <div>
          <dt className={labelClass}>Année de construction</dt>
          <dd className="mt-1 text-lg text-white">{client?.anneeConstruction || "—"}</dd>
        </div>
        <div>
          <dt className={labelClass}>Surface habitable</dt>
          <dd className="mt-1 text-lg text-white">
            {client?.surfaceHabitable ? `${client.surfaceHabitable} m²` : "—"}
          </dd>
        </div>
        <div>
          <dt className={labelClass}>Statut</dt>
          <dd className="mt-1 text-lg text-white">
            {STATUTS_OCCUPATION.find((s) => s.id === client?.statutOccupation)?.label || "—"}
          </dd>
        </div>
        {dossier?.caTtc ? (
          <div>
            <dt className={labelClass}>Budget client (dossier)</dt>
            <dd className="mt-1 text-lg text-white">{euro(dossier.caTtc)} TTC</dd>
          </div>
        ) : null}
      </dl>
    );
  }

  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <Champ id="fiche-nom" label="Nom" value={client?.nom} onChange={(v) => patch("nom", v)} />
      <Champ id="fiche-prenom" label="Prénom" value={client?.prenom} onChange={(v) => patch("prenom", v)} />
      <label className={`${labelClass} sm:col-span-2`} htmlFor="fiche-mandant">
        Mandant
        <input
          id="fiche-mandant"
          className={inputClass}
          value={client?.mandant ?? ""}
          onChange={(event) => patch("mandant", event.target.value)}
        />
      </label>
      {client?.cadreJuridique ? (
        <p className="sm:col-span-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
          {client.cadreJuridique}
        </p>
      ) : null}
      <Champ
        id="fiche-tel"
        label="Téléphone"
        type="tel"
        value={client?.telephone}
        onChange={(v) => patch("telephone", v)}
      />
      <Champ
        id="fiche-email"
        label="E-mail"
        type="email"
        value={client?.email}
        onChange={(v) => patch("email", v)}
      />
      <label className={`${labelClass} sm:col-span-2`} htmlFor="fiche-adresse">
        Adresse complète du bien
        <input
          id="fiche-adresse"
          className={inputClass}
          value={client?.adresse ?? ""}
          onChange={(event) => patch("adresse", event.target.value)}
        />
      </label>
      <Champ
        id="fiche-annee"
        label="Année de construction"
        type="number"
        value={client?.anneeConstruction}
        onChange={(v) => patch("anneeConstruction", v)}
      />
      <Champ
        id="fiche-surface"
        label="Surface habitable (m²)"
        type="number"
        value={client?.surfaceHabitable}
        onChange={(v) => patch("surfaceHabitable", v)}
      />
      <label className={labelClass} htmlFor="fiche-statut">
        Statut
        <select
          id="fiche-statut"
          className={inputClass}
          value={client?.statutOccupation ?? ""}
          onChange={(event) => patch("statutOccupation", event.target.value)}
        >
          <option value="">Choisir…</option>
          {STATUTS_OCCUPATION.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <p className="sm:col-span-2 text-[11px] text-emerald-300/80">Sauvegarde automatique à chaque modification.</p>
    </div>
  );
}
