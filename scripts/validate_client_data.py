#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Validation client_data.json — ENERGIA CONSEIL IA® V26
Statuts : verified | estimated | pending | not_applicable
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any, Optional, Sequence

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

VALID_STATUSES = ("verified", "estimated", "pending", "not_applicable")
CRITICAL_FIELDS = (
    "nom",
    "adresse",
    "surface",
    "dpe_actuel",
    "profil_anah",
    "budget_travaux",
)
# Champs dont l'absence n'empêche pas la génération (→ « À confirmer »)
SOFT_CRITICAL = (
    "adresse",
    "surface",
    "dpe_actuel",
    "profil_anah",
    "budget_travaux",
)
PAYMENT_STATUSES = (
    "encaissé",
    "appelé_en_attente",
    "à_appeler",
    "prévisionnel",
    "aide_attendue",
)


def load_json(path: Path) -> dict[str, Any]:
    with path.open(encoding="utf-8") as f:
        data = json.load(f)
    if not isinstance(data, dict):
        raise ValueError("Le JSON client doit être un objet")
    return data


def _is_empty(val: Any) -> bool:
    return val is None or val == "" or val == "À confirmer"


def apply_pending_defaults(data: dict[str, Any]) -> list[str]:
    """Remplace les absents critiques par 'À confirmer' — n'invente aucune donnée numérique."""
    alerts: list[str] = []
    for field in CRITICAL_FIELDS:
        if _is_empty(data.get(field)):
            if field in ("surface", "budget_travaux"):
                alerts.append(f"Champ critique numérique manquant : {field}")
            else:
                data[field] = "À confirmer"
                alerts.append(f"Champ critique absent → affiché « À confirmer » : {field}")
    if not data.get("points_a_valider"):
        data["points_a_valider"] = []
    for a in alerts:
        if a not in data["points_a_valider"]:
            data["points_a_valider"].append(a)
    return alerts


def check_scenario_totals(data: dict[str, Any]) -> list[str]:
    """Bloque si somme des lignes travaux ≠ total TTC déclaré (tolérance 1 €)."""
    errors: list[str] = []
    scenarios = data.get("scenarios") or {}
    for key, sc in scenarios.items():
        if not isinstance(sc, dict):
            continue
        travaux = sc.get("travaux") or []
        if not travaux:
            continue
        total_lignes = sum(float(t.get("cout") or 0) for t in travaux)
        budget = sc.get("budget")
        if budget is None:
            continue
        if abs(total_lignes - float(budget)) > 1.0:
            # Scénario excellence = renovation + option : sum of travaux may equal renovation only
            option = float(sc.get("option_pv_ttc") or 0)
            reno = float(sc.get("budget_renovation") or 0)
            if key == "excellence" and reno and abs((reno + option) - float(budget)) <= 1.0:
                if travaux and abs(total_lignes - reno) > 1.0:
                    errors.append(
                        f"Scénario {key} : somme travaux ({total_lignes:.0f}) ≠ "
                        f"budget_renovation ({reno:.0f})"
                    )
                continue
            errors.append(
                f"Scénario {key} : somme des lignes ({total_lignes:.0f} €) ≠ "
                f"budget TTC ({float(budget):.0f} €) — écart {abs(total_lignes - float(budget)):.0f} €"
            )
    return errors


def validate_client_data(
    data: dict[str, Any],
    client_path: Optional[Path] = None,
    *,
    apply_defaults: bool = True,
    strict_totals: bool = True,
) -> dict[str, Any]:
    """
    Retourne un rapport de validation :
    { ok, errors, warnings, alerts, field_status }
    """
    errors: list[str] = []
    warnings: list[str] = []
    alerts: list[str] = []

    if apply_defaults:
        alerts.extend(apply_pending_defaults(data))

    for field in CRITICAL_FIELDS:
        if _is_empty(data.get(field)):
            status = (data.get("field_status") or {}).get(field, "pending")
            if field in SOFT_CRITICAL or status == "pending":
                warnings.append(f"Champ à confirmer : {field}")
                alerts.append(f"Champ critique absent → « À confirmer » : {field}")
            else:
                errors.append(f"Champ obligatoire manquant : {field}")

    if _is_empty(data.get("nom")):
        errors.append("Champ obligatoire manquant : nom")

    profil = str(data.get("profil_anah", "")).upper()
    if profil and profil not in ("BLEU", "JAUNE", "VIOLET", "ROSE", "À CONFIRMER"):
        if data.get("profil_anah") != "À confirmer":
            errors.append(f"profil_anah invalide : {profil}")

    if data.get("scenarios") is not None and not isinstance(data.get("scenarios"), dict):
        errors.append("'scenarios' doit être un objet")

    field_status = data.get("field_status") or {}
    for k, v in field_status.items():
        if v not in VALID_STATUSES:
            warnings.append(f"field_status[{k}] invalide : {v}")

    # Justificatifs
    for j in data.get("justificatifs") or []:
        if not isinstance(j, dict):
            warnings.append("justificatif mal formé")
            continue
        st = j.get("status", "pending")
        if st not in VALID_STATUSES:
            warnings.append(f"justificatif {j.get('type')} status invalide")
        fichier = j.get("fichier")
        if fichier and client_path:
            base = client_path.parent
            fp = base / fichier if not Path(fichier).is_absolute() else Path(fichier)
            if st == "verified" and not fp.is_file():
                warnings.append(f"Justificatif déclaré verified absent : {fichier}")
                alerts.append(f"Document manquant : {fichier}")

    # MAR
    mar = data.get("mar_document") or {}
    if mar.get("present") and not mar.get("fichier"):
        warnings.append("MAR déclaré présent sans fichier joint")

    # Photos
    photos = data.get("photos_logement") or []
    if len(photos) < 4:
        alerts.append(f"Photos logement : {len(photos)}/4 — galerie à compléter")

    # Paiements — ne jamais « versé » sans preuve
    ech = data.get("echeancier") or {}
    if ech.get("acompte_30_verse") and not any(
        j.get("type") == "preuve_paiement_acompte" and j.get("status") == "verified"
        for j in (data.get("justificatifs") or [])
    ):
        warnings.append(
            "acompte_30_verse=true sans justificatif preuve_paiement_acompte verified"
        )

    if strict_totals:
        tot_errs = check_scenario_totals(data)
        if data.get("autoriser_ecart_lignes"):
            for e in tot_errs:
                warnings.append(e + " — écart autorisé (total devis signé fait foi)")
                alerts.append(e)
        else:
            errors.extend(tot_errs)

    # Certification claims without docs
    cert = data.get("certification_sylvain")
    if cert and not any(
        j.get("type") in ("certibat", "diplome_auditeur", "assurance_rc")
        for j in (data.get("justificatifs") or [])
    ):
        alerts.append(
            "Mention certification présente sans justificatif dans justificatifs[] — "
            "à restreindre selon energia_profile.json"
        )

    ok = len(errors) == 0
    return {
        "ok": ok,
        "errors": errors,
        "warnings": warnings,
        "alerts": alerts,
        "field_status": field_status,
        "points_a_valider": data.get("points_a_valider") or alerts,
    }


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Valide un client_data.json ENERGIA V26")
    parser.add_argument("--client", "-c", type=Path, required=True)
    parser.add_argument("--json-out", type=Path, default=None, help="Écrit le rapport JSON")
    args = parser.parse_args(argv)

    if not args.client.is_file():
        print(f"❌ Fichier introuvable : {args.client}")
        return 1

    try:
        data = load_json(args.client)
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"❌ JSON invalide : {exc}")
        return 1

    report = validate_client_data(data, args.client)

    print(f"{'✅' if report['ok'] else '❌'} Validation — {args.client}")
    for e in report["errors"]:
        print(f"   ✖ {e}")
    for w in report["warnings"]:
        print(f"   ⚠ {w}")
    for a in report["alerts"]:
        print(f"   • {a}")

    if args.json_out:
        args.json_out.parent.mkdir(parents=True, exist_ok=True)
        args.json_out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"→ Rapport écrit : {args.json_out}")

    return 0 if report["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
