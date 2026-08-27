#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Générateur multi-client — Rapport de synthèse énergétique ENERGIA CONSEIL IA® V26
85 pages — validation + contrôle dossier + nom PDF automatique

Usage:
    python generate_audit_report.py --client clients/ROYER_Maixent/client_data.json --verify-pages
    python generate_audit_report.py --client clients/DEMO_INCOMPLET/client_data.json --verify-pages
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any, Optional, Sequence

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "scripts"))

from generate_audit_auto import (  # noqa: E402
    GENERATOR_VERSION,
    TOTAL_PAGES,
    generate_audit_auto,
    slug_client,
    verify_page_count,
)
from prepare_client_dossier import prepare_dossier  # noqa: E402
from validate_client_data import load_json, validate_client_data  # noqa: E402


def load_energia_profile() -> dict[str, Any]:
    path = ROOT / "config" / "energia_profile.json"
    if not path.is_file():
        return {}
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def default_output_path(client: dict[str, Any], client_path: Path) -> Path:
    """audit_[NOM_CLIENT]_[REFERENCE].pdf dans output/ du dossier client si possible."""
    slug = slug_client(client.get("nom", "CLIENT"))
    ref = client.get("reference") or f"AUDIT-2026-{slug}"
    ref_safe = re.sub(r"[^\w\-]+", "_", str(ref))
    dossier = client_path.parent
    if (dossier / "output").is_dir() or dossier.name not in (".", ""):
        out_dir = dossier / "output"
        out_dir.mkdir(parents=True, exist_ok=True)
        return out_dir / f"audit_{slug}_{ref_safe}.pdf"
    return ROOT / f"audit_{slug}_{ref_safe}.pdf"


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            f"Génère un rapport de synthèse énergétique PDF {TOTAL_PAGES} pages — "
            f"ENERGIA CONSEIL IA® v{GENERATOR_VERSION}"
        ),
    )
    parser.add_argument(
        "--client", "-c",
        type=Path,
        default=ROOT / "clients" / "ROYER_Maixent" / "client_data.json",
        help="Fichier JSON client (ex. clients/NOM/client_data.json)",
    )
    parser.add_argument(
        "--output", "-o",
        type=Path,
        default=None,
        help="Chemin PDF (défaut : clients/NOM/output/audit_NOM_REF.pdf)",
    )
    parser.add_argument(
        "--verify-pages",
        action="store_true",
        default=True,
        help=f"Vérifie exactement {TOTAL_PAGES} pages (défaut : activé)",
    )
    parser.add_argument(
        "--no-verify-pages",
        action="store_false",
        dest="verify_pages",
        help="Désactive la vérification du nombre de pages",
    )
    parser.add_argument(
        "--skip-controle",
        action="store_true",
        help="Ne pas écrire controle_dossier.json",
    )
    parser.add_argument(
        "--strict-totals",
        action="store_true",
        help="Bloque si somme lignes ≠ TTC (sauf autoriser_ecart_lignes)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[Sequence[str]] = None) -> int:
    args = parse_args(argv)
    client_path = args.client if args.client.is_absolute() else (ROOT / args.client)

    if not client_path.is_file():
        # Rétrocompatibilité racine
        alt = ROOT / "client_data.json"
        if args.client.name == "client_data.json" and alt.is_file():
            client_path = alt
        else:
            print(f"❌ Fichier client introuvable : {args.client}")
            return 1

    try:
        client_data = load_json(client_path)
    except (json.JSONDecodeError, ValueError) as exc:
        print(f"❌ Erreur lecture JSON : {exc}")
        return 1

    profile = load_energia_profile()
    client_data["_energia_profile"] = profile
    client_data["_client_dir"] = str(client_path.parent)

    report = validate_client_data(
        client_data,
        client_path,
        apply_defaults=True,
        strict_totals=True,
    )
    if not report["ok"]:
        print("❌ Validation client_data.json échouée :")
        for err in report["errors"]:
            print(f"   • {err}")
        return 1
    for w in report.get("warnings") or []:
        print(f"⚠️  {w}")
    for a in report.get("alerts") or []:
        print(f"   · {a}")

    if not args.skip_controle:
        try:
            controle = prepare_dossier(client_path)
            print(f"📋 Contrôle dossier : {controle.get('output_file')}")
        except Exception as exc:
            print(f"⚠️  Contrôle dossier non généré : {exc}")

    output = args.output or default_output_path(client_data, client_path)
    if not output.is_absolute():
        output = ROOT / output
    output.parent.mkdir(parents=True, exist_ok=True)

    titre = client_data.get("titre_document") or profile.get("mentions_legales", {}).get(
        "titre_document",
        "Rapport de synthèse énergétique et financière personnalisé",
    )
    print(f"⚡ ENERGIA CONSEIL IA® — Génération v{GENERATOR_VERSION} ({TOTAL_PAGES} pages)")
    print(f"   Document : {titre}")
    print(f"   Client : {client_data.get('nom', 'N/A')}")
    print(f"   Profil : {client_data.get('profil_anah', '—')}")
    print(f"   Réf.   : {client_data.get('reference') or 'AUDIT-2026-' + slug_client(client_data.get('nom', ''))}")
    print(f"   Entrée : {client_path}")
    print(f"   Sortie : {output}")

    try:
        pdf_path = generate_audit_auto(client_data, output)
    except Exception as exc:
        print(f"❌ Erreur génération PDF : {exc}")
        return 1

    print(f"✅ PDF généré : {pdf_path}")

    if args.verify_pages:
        n = verify_page_count(pdf_path)
        if n == TOTAL_PAGES:
            print(f"✅ Vérification OK — {n} pages exactement")
        elif n < 0:
            print("⚠️  Vérification ignorée (installez pypdf : pip install pypdf)")
        else:
            print(f"❌ Erreur : {n} pages (attendu {TOTAL_PAGES})")
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
