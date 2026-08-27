#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Préparation dossier client — référence devis, attestations, photos.
Produit : clients/NOM/output/controle_dossier.json
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path
from typing import Any, Optional, Sequence

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))

from validate_client_data import load_json, validate_client_data  # noqa: E402

DOC_EXT = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}


def list_docs(folder: Path) -> list[str]:
    if not folder.is_dir():
        return []
    return sorted(
        str(p.relative_to(folder.parent.parent) if False else p.name)
        for p in folder.iterdir()
        if p.is_file() and p.suffix.lower() in DOC_EXT and p.name != ".gitkeep"
    )


def prepare_dossier(client_json: Path) -> dict[str, Any]:
    data = load_json(client_json)
    dossier = client_json.parent
    devis_dir = dossier / "devis"
    att_dir = dossier / "attestations"
    photos_dir = dossier / "photos"
    output_dir = dossier / "output"
    output_dir.mkdir(parents=True, exist_ok=True)

    validation = validate_client_data(data, client_json, apply_defaults=True, strict_totals=True)

    devis_files = list_docs(devis_dir)
    att_files = list_docs(att_dir)
    photo_files = list_docs(photos_dir)

    confirmed = [k for k, v in (data.get("field_status") or {}).items() if v == "verified"]
    estimated = [k for k, v in (data.get("field_status") or {}).items() if v == "estimated"]
    pending = [k for k, v in (data.get("field_status") or {}).items() if v == "pending"]

    missing_docs: list[str] = []
    if not devis_files and not (data.get("devis_references") or []):
        missing_docs.append("Aucun devis dans devis/ ni devis_references[]")
    if not att_files:
        missing_docs.append("Aucune attestation dans attestations/")
    if len(photo_files) < 4 and len(data.get("photos_logement") or []) < 4:
        missing_docs.append("Photos logement < 4")

    certs_to_check = []
    for j in data.get("justificatifs") or []:
        if j.get("status") in ("pending", "estimated"):
            certs_to_check.append(j.get("type") or j.get("libelle") or "inconnu")
    if data.get("certification_sylvain"):
        certs_to_check.append("certification_sylvain (mention JSON)")

    controle = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "client": data.get("nom"),
        "reference": data.get("reference") or f"AUDIT-2026-{(data.get('nom') or 'CLIENT').replace(' ', '_').upper()}",
        "dossier": str(dossier),
        "validation": validation,
        "documents": {
            "devis": devis_files,
            "attestations": att_files,
            "photos": photo_files,
        },
        "donnees_confirmees": confirmed,
        "donnees_estimatives": estimated,
        "donnees_pending": pending,
        "documents_manquants": missing_docs,
        "certifications_a_verifier": certs_to_check,
        "photos_manquantes": max(0, 4 - max(len(photo_files), len(data.get("photos_logement") or []))),
        "incoherences_calcul": validation.get("errors") or [],
        "pages_impactees": [
            "p.1–3 identité / mentions",
            "p.11 déperditions",
            "p.15 avant/après",
            "p.18–19 photos",
            "p.22/33/45 scénarios",
            "p.60 aides",
            "p.68 récap paiement",
            "p.82 accompagnement / certifications",
        ],
        "points_a_valider": data.get("points_a_valider") or validation.get("alerts") or [],
    }

    out = output_dir / "controle_dossier.json"
    out.write_text(json.dumps(controle, ensure_ascii=False, indent=2), encoding="utf-8")
    controle["output_file"] = str(out)
    return controle


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description="Prépare le contrôle documentaire d'un dossier client")
    parser.add_argument("--client", "-c", type=Path, required=True)
    args = parser.parse_args(argv)

    if not args.client.is_file():
        print(f"❌ Fichier introuvable : {args.client}")
        return 1

    try:
        controle = prepare_dossier(args.client)
    except Exception as exc:
        print(f"❌ Erreur préparation : {exc}")
        return 1

    print(f"✅ Contrôle dossier généré : {controle.get('output_file')}")
    print(f"   Client : {controle.get('client')}")
    print(f"   Docs manquants : {len(controle.get('documents_manquants') or [])}")
    print(f"   Photos manquantes (cible 4) : {controle.get('photos_manquantes')}")
    if controle.get("incoherences_calcul"):
        print("   ❌ Incohérences :")
        for e in controle["incoherences_calcul"]:
            print(f"      • {e}")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
