import {
  MODE_FOURNITURE_POSE,
  MODE_POSE_SEULE,
} from "../../lib/crm/sousTraitanceDoubleMode";

const pill =
  "rounded-lg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide transition";

export default function ToggleSousTraitance({
  mode = MODE_FOURNITURE_POSE,
  onChange,
  disabled = false,
}) {
  const actif = mode === MODE_POSE_SEULE ? MODE_POSE_SEULE : MODE_FOURNITURE_POSE;
  return (
    <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950 p-0.5">
      <button
        type="button"
        disabled={disabled}
        className={`${pill} ${actif === MODE_FOURNITURE_POSE ? "bg-emerald-600 text-white" : "text-slate-400 hover:text-white"}`}
        onClick={() => onChange?.(MODE_FOURNITURE_POSE)}
      >
        Fourniture &amp; Pose
      </button>
      <button
        type="button"
        disabled={disabled}
        className={`${pill} ${actif === MODE_POSE_SEULE ? "bg-sky-600 text-white" : "text-slate-400 hover:text-white"}`}
        onClick={() => onChange?.(MODE_POSE_SEULE)}
      >
        Pose seule
      </button>
    </div>
  );
}
