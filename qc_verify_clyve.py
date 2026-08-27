#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Contrôle qualité — double PDF Clyve Andriot
  - synthese_decisionnelle_clyve_andriot.pdf  (8–12 pages)
  - dossier_technique_annexes_clyve_andriot.pdf (complet, pas de plafond)
"""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUTPUT = ROOT / "clients" / "ANDRIOT_Clyve" / "output"

SYN = "synthese_decisionnelle_clyve_andriot.pdf"
TECH = "dossier_technique_annexes_clyve_andriot.pdf"

FORBIDDEN = [
    "certifié ANAH",
    "certifie ANAH",
    "95 % de précision",
    "95% de précision",
    "95 % de precision",
    "aides garanties",
    "ROI garanti",
    "calcul au centime près",
    "calcul au centime pres",
    "48h garanties",
    "48 h garanties",
]

REQUIRED_SYN = {
    "logement": ["logement"],
    "priorites": ["priorit"],
    "scenarios": ["scénario", "scenario", "SCÉNARIO"],
    "budget": ["budget"],
    "aides": ["aide"],
    "financement": ["financ"],
    "recommandation": ["recommand"],
    "plan_action": ["plan d"],
    "contact": ["contact@energia-conseil-ia.com", "Contact"],
}


def count_pages(path: Path) -> int:
    try:
        from pypdf import PdfReader
        return len(PdfReader(str(path)).pages)
    except Exception:
        try:
            import fitz
            return fitz.open(str(path)).page_count
        except Exception:
            return -1


def pdf_text(path: Path) -> str:
    import fitz
    doc = fitz.open(str(path))
    try:
        return "".join((doc.load_page(i).get_text("text") or "") for i in range(doc.page_count))
    finally:
        doc.close()


def main() -> int:
    errors: list[str] = []
    print("=" * 70)
    print("QC VERIFY CLYVE — double PDF")
    print("=" * 70)

    syn_paths = [OUTPUT / SYN, ROOT / SYN]
    tech_paths = [OUTPUT / TECH, ROOT / TECH]
    syn = next((p for p in syn_paths if p.is_file()), None)
    tech = next((p for p in tech_paths if p.is_file()), None)

    if syn is None:
        errors.append(f"Synthese introuvable : {SYN}")
        print(f"[!] Synthese introuvable : {SYN}")
    else:
        n = count_pages(syn)
        print(f"[i] Synthese : {syn} — {n} page(s)")
        if not (8 <= n <= 12):
            errors.append(f"Synthese hors 8-12 pages ({n})")
            print(f"[!] Hors cible 8-12 : {n}")
        else:
            print("[OK] Pages synthese dans la cible")
        txt = pdf_text(syn)
        missing = []
        low = txt.lower()
        for label, needles in REQUIRED_SYN.items():
            if not any(n.lower() in low for n in needles):
                missing.append(label)
        if missing:
            errors.append(f"Sections manquantes synthese : {missing}")
            print(f"[!] Sections manquantes : {missing}")
        else:
            print("[OK] Sections obligatoires presentes")
        hits = [f for f in FORBIDDEN if f.lower() in low]
        if hits:
            errors.append(f"Formulations interdites : {hits}")
            print(f"[!] Formulations interdites : {hits}")
        else:
            print("[OK] Aucune formulation interdite")
        if "dossier technique" not in low:
            errors.append("Mention dossier technique absente")
            print("[!] Mention dossier technique absente")
        else:
            print("[OK] Mention dossier technique presente")

    if tech is None:
        errors.append(f"Dossier technique introuvable : {TECH}")
        print(f"[!] Dossier technique introuvable : {TECH}")
    else:
        n = count_pages(tech)
        print(f"[i] Dossier technique : {tech} — {n} page(s) (pas de plafond)")
        if n < 50:
            errors.append(f"Dossier technique trop court ({n})")
            print(f"[!] Dossier technique suspectement court : {n}")
        else:
            print("[OK] Dossier technique genere (complet)")

    print("=" * 70)
    if errors:
        print(f"ECHEC — {len(errors)} erreur(s)")
        for e in errors:
            print(f"  ! {e}")
        print("=" * 70)
        return 1
    print("SUCCES — QC double PDF OK")
    print("=" * 70)
    return 0


if __name__ == "__main__":
    sys.exit(main())
