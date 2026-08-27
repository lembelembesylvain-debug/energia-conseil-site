#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Crée un nouveau dossier client à partir du modèle (structure + JSON vide).

Usage:
    python scripts/new_client_dossier.py --name DUPONT_Marie
    python scripts/new_client_dossier.py --name DUPONT_Marie --from-royer
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def slug_folder(name: str) -> str:
    s = re.sub(r"[^\w\-]+", "_", name.strip(), flags=re.UNICODE)
    return s.strip("_") or "NOUVEAU_CLIENT"


def main() -> int:
    parser = argparse.ArgumentParser(description="Scaffold dossier client ENERGIA V26")
    parser.add_argument("--name", "-n", required=True, help="Nom dossier : NOM_Prenom")
    parser.add_argument(
        "--from-royer",
        action="store_true",
        help="Copie la structure ROYER (attention : données ROYER à remplacer)",
    )
    args = parser.parse_args()

    folder = slug_folder(args.name)
    dest = ROOT / "clients" / folder
    if dest.exists():
        print(f"ERREUR : le dossier existe déjà : {dest}")
        return 1

    if args.from_royer:
        src = ROOT / "clients" / "ROYER_Maixent"
        if not src.is_dir():
            print(f"ERREUR : source introuvable : {src}")
            return 1
        shutil.copytree(
            src,
            dest,
            ignore=shutil.ignore_patterns("output", "*.pdf", "__pycache__"),
        )
        (dest / "output").mkdir(exist_ok=True)
        print(f"OK — structure copiée depuis ROYER → {dest}")
        print("ATTENTION : remplacez immédiatement les données dans client_data.json")
    else:
        dest.mkdir(parents=True)
        for sub in ("devis", "attestations", "photos", "output"):
            (dest / sub).mkdir()
            (dest / sub / ".gitkeep").write_text("", encoding="utf-8")
        template = ROOT / "templates" / "client_data_template.json"
        data = json.loads(template.read_text(encoding="utf-8"))
        data["nom"] = folder.replace("_", " ")
        data["reference"] = f"AUDIT-2026-{folder.upper()}"
        data["dossier_client"] = f"clients/{folder}"
        (dest / "client_data.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print(f"OK — nouveau dossier créé depuis le modèle → {dest}")

    print()
    print("Étapes suivantes :")
    print(f"  1. Éditer {dest / 'client_data.json'}")
    print(f"  2. Déposer devis / attestations / photos")
    print("  3. Générer :")
    print(
        f"     python generate_audit_report.py "
        f"--client clients/{folder}/client_data.json --verify-pages"
    )
    return 0


if __name__ == "__main__":
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
    sys.exit(main())
