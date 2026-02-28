#!/usr/bin/env python3
"""
Génération de 6 maisons 3D pour ENERGIA-CONSEIL IA®
Format OBJ + MTL compatible Twinmotion 2025.2
"""

import math
import os
from pathlib import Path

# --- DONNÉES D'EXTRACTION (estimées Google Earth / Street View) ---
MAISONS = [
    {
        "id": "richard",
        "nom": "M_RICHARD_UNIAS",
        "adresse": "600 Route de la Goutte, 42210 UNIAS",
        "gps": "45.5986°N, 4.2267°E",
        "longueur": 9.0,
        "largeur": 8.0,
        "hauteur_etage": 2.7,
        "niveaux": 2,
        "pente_toit": 38,
        "toit": "2_pans",
        "materiaux": "Pierre et moellons",
        "fenetres": [(1.2, 1.2), (1.2, 1.2), (1.2, 1.2), (0.9, 2.1)],  # façade par façade
        "porte": (1.0, 2.2),
    },
    {
        "id": "fontanay",
        "nom": "MME_FONTANAY_MONTROND",
        "adresse": "167 Rue des Acacias, 42210 MONTROND-LES-BAINS",
        "gps": "45.6408°N, 4.2480°E",
        "longueur": 9.5,
        "largeur": 8.0,
        "hauteur_etage": 2.7,
        "niveaux": 2,
        "pente_toit": 40,
        "toit": "2_pans",
        "materiaux": "Enduit / maçonnerie traditionnelle",
        "fenetres": [(1.2, 1.2), (1.2, 1.2), (1.2, 1.2), (0.9, 2.1)],
        "porte": (1.0, 2.2),
    },
    {
        "id": "royer",
        "nom": "M_ROYER_CHALAIN",
        "adresse": "6 route de Marcilly, 42600 CHALAIN-D'UZORE",
        "gps": "45.6743°N, 4.0689°E",
        "longueur": 9.5,
        "largeur": 8.0,
        "hauteur_etage": 2.7,
        "niveaux": 2,
        "pente_toit": 42,
        "toit": "2_pans",
        "materiaux": "Pierre et moellons 40cm",
        "fenetres": [(1.2, 1.2), (1.2, 1.2), (1.2, 1.2), (0.9, 2.1)],
        "porte": (1.0, 2.2),
    },
    {
        "id": "seux",
        "nom": "M_SEUX_RICAMARIE",
        "adresse": "4 Rue Georges Laurent, 42150 LA RICAMARIE",
        "gps": "45.4018°N, 4.3592°E",
        "longueur": 10.0,
        "largeur": 9.6,
        "hauteur_etage": 2.7,
        "niveaux": 2,
        "pente_toit": 35,
        "toit": "2_pans",
        "materiaux": "Blocs béton creux",
        "fenetres": [(1.2, 1.2), (1.2, 1.2), (1.2, 1.2), (1.0, 2.1)],
        "porte": (1.0, 2.2),
    },
    {
        "id": "guion",
        "nom": "M_GUION",
        "adresse": "(Adresse à compléter - bien en acquisition)",
        "gps": "Non défini",
        "longueur": 10.0,
        "largeur": 10.0,
        "hauteur_etage": 2.7,
        "niveaux": 2,
        "pente_toit": 38,
        "toit": "2_pans",
        "materiaux": "À déterminer (ITE fibre bois/ouate prévu)",
        "fenetres": [(1.2, 1.2), (1.2, 1.2), (1.2, 1.2), (1.0, 2.1)],
        "porte": (1.0, 2.2),
    },
    {
        "id": "yang",
        "nom": "M_YANG_COLLONGES",
        "adresse": "18 Parc des Chavannes, 69660 COLLONGES-AU-MONT-D'OR",
        "gps": "45.8259°N, 4.8431°E",
        "longueur": 13.0,
        "largeur": 12.0,
        "hauteur_etage": 2.7,
        "niveaux": 2,
        "pente_toit": 38,
        "toit": "2_pans",
        "garage": True,
        "garage_largeur": 3.5,
        "garage_profondeur": 6.0,
        "materiaux": "Pierre calcaire / enduit",
        "fenetres": [(1.4, 1.4), (1.4, 1.4), (1.4, 1.4), (1.2, 2.2)],
        "porte": (1.2, 2.3),
    },
]


def add_quad(vertices, faces, v0, v1, v2, v3, offset):
    """Ajoute un quad (2 triangles) et retourne le nouvel offset."""
    n = offset
    vertices.extend([v0, v1, v2, v3])
    # Normale (cross product)
    a = [v1[i] - v0[i] for i in range(3)]
    b = [v2[i] - v0[i] for i in range(3)]
    nx = a[1] * b[2] - a[2] * b[1]
    ny = a[2] * b[0] - a[0] * b[2]
    nz = a[0] * b[1] - a[1] * b[0]
    normals = [(nx, ny, nz)] * 4
    # Faces (CCW pour extérieur)
    faces.append((n, n + 1, n + 2))
    faces.append((n, n + 2, n + 3))
    return offset + 4, vertices, faces, normals


def generate_house_obj(m):
    """Génère la géométrie OBJ d'une maison."""
    L = m["longueur"] / 2
    W = m["largeur"] / 2
    H = m["hauteur_etage"] * m["niveaux"]
    pente_deg = m["pente_toit"]
    pente_rad = math.radians(pente_deg)
    # Hauteur du faîte (au centre)
    half_span = W
    hauteur_faite = half_span * math.tan(pente_rad)
    H_total = H + hauteur_faite

    vertices = []
    normals = []
    faces = []
    offset = 1  # OBJ indices start at 1

    # Origine au centre de la base
    # Sol (optionnel, base)
    z0 = 0
    v_sol = [
        (-L, -W, z0),
        (L, -W, z0),
        (L, W, z0),
        (-L, W, z0),
    ]
    for v in v_sol:
        vertices.append(v)
    n_sol = (0, 0, -1)
    for _ in range(4):
        normals.append(n_sol)
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Murs (4 façades) - sans ouvertures pour simplifier
    # Façade -Y (avant)
    v_f1 = [
        (-L, -W, z0),
        (L, -W, z0),
        (L, -W, H),
        (-L, -W, H),
    ]
    for v in v_f1:
        vertices.append(v)
    n1 = (0, -1, 0)
    for _ in range(4):
        normals.append(n1)
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Façade +Y (arrière)
    v_f2 = [
        (L, W, z0),
        (-L, W, z0),
        (-L, W, H),
        (L, W, H),
    ]
    for v in v_f2:
        vertices.append(v)
    n2 = (0, 1, 0)
    for _ in range(4):
        normals.append(n2)
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Façade -X (gauche)
    v_f3 = [
        (-L, W, z0),
        (-L, -W, z0),
        (-L, -W, H),
        (-L, W, H),
    ]
    for v in v_f3:
        vertices.append(v)
    n3 = (-1, 0, 0)
    for _ in range(4):
        normals.append(n3)
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Façade +X (droite)
    v_f4 = [
        (L, -W, z0),
        (L, W, z0),
        (L, W, H),
        (L, -W, H),
    ]
    for v in v_f4:
        vertices.append(v)
    n4 = (1, 0, 0)
    for _ in range(4):
        normals.append(n4)
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Toit 2 pans
    # Pan gauche (-Y vers centre)
    cx, cy, cz = 0, 0, H + hauteur_faite
    v_pan1 = [
        (-L, -W, H),
        (L, -W, H),
        (L, 0, cz),
        (-L, 0, cz),
    ]
    for v in v_pan1:
        vertices.append(v)
    # Normale pan incliné
    e1 = (L - (-L), -W - (-W), H - H)
    e2 = (L - (-L), 0 - (-W), cz - H)
    nx = e1[1] * e2[2] - e1[2] * e2[1]
    ny = e1[2] * e2[0] - e1[0] * e2[2]
    nz = e1[0] * e2[1] - e1[1] * e2[0]
    ln = math.sqrt(nx * nx + ny * ny + nz * nz)
    nx, ny, nz = nx / ln, ny / ln, nz / ln
    for _ in range(4):
        normals.append((nx, ny, nz))
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Pan droit (+Y vers centre)
    v_pan2 = [
        (L, W, H),
        (-L, W, H),
        (-L, 0, cz),
        (L, 0, cz),
    ]
    for v in v_pan2:
        vertices.append(v)
    e1 = (-L - L, W - W, H - H)
    e2 = (-L - L, 0 - W, cz - H)
    nx = e1[1] * e2[2] - e1[2] * e2[1]
    ny = e1[2] * e2[0] - e1[0] * e2[2]
    nz = e1[0] * e2[1] - e1[1] * e2[0]
    ln = math.sqrt(nx * nx + ny * ny + nz * nz)
    nx, ny, nz = nx / ln, ny / ln, nz / ln
    for _ in range(4):
        normals.append((nx, ny, nz))
    faces.append((offset, offset + 1, offset + 2))
    faces.append((offset, offset + 2, offset + 3))
    offset += 4

    # Pignons (extrémités toit)
    # Pignon -X
    v_pg1 = [
        (-L, -W, H),
        (-L, 0, cz),
        (-L, W, H),
    ]
    for v in v_pg1:
        vertices.append(v)
    for _ in range(3):
        normals.append((-1, 0, 0))
    faces.append((offset, offset + 1, offset + 2))
    offset += 3

    # Pignon +X
    v_pg2 = [
        (L, -W, H),
        (L, W, H),
        (L, 0, cz),
    ]
    for v in v_pg2:
        vertices.append(v)
    for _ in range(3):
        normals.append((1, 0, 0))
    faces.append((offset, offset + 1, offset + 2))

    return vertices, normals, faces


def write_obj(vertices, normals, faces, obj_path, mtl_name):
    """Écrit le fichier OBJ."""
    with open(obj_path, "w", encoding="utf-8") as f:
        f.write(f"# Maison 3D - ENERGIA-CONSEIL IA®\n")
        f.write(f"# Format OBJ - Compatible Twinmotion\n")
        f.write(f"# Unités: mètres\n\n")
        f.write(f"mtllib {mtl_name}\n\n")
        for v in vertices:
            f.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        f.write("\n")
        for n in normals:
            f.write(f"vn {n[0]:.4f} {n[1]:.4f} {n[2]:.4f}\n")
        f.write("\nusemtl murs\n")
        # On envoie tout en un groupe "murs" pour simplifier
        for face in faces:
            f.write("f")
            for i in face:
                f.write(f" {i}//{i}")
            f.write("\n")


def write_mtl(mtl_path, materiau_type="pierre"):
    """Écrit le fichier MTL avec matériaux de base."""
    colors = {
        "pierre": (0.75, 0.68, 0.58),
        "enduit": (0.92, 0.88, 0.82),
        "beton": (0.72, 0.70, 0.68),
        "toit": (0.45, 0.35, 0.30),  # tuiles
    }
    if "pierre" in materiau_type.lower():
        col = colors["pierre"]
    elif "béton" in materiau_type.lower() or "bloc" in materiau_type.lower():
        col = colors["beton"]
    else:
        col = colors["enduit"]

    with open(mtl_path, "w", encoding="utf-8") as f:
        f.write("# Matériaux de base - Twinmotion\n")
        f.write("# Remplacer par textures dans Twinmotion\n\n")
        f.write("newmtl murs\n")
        f.write(f"Kd {col[0]:.2f} {col[1]:.2f} {col[2]:.2f}\n")
        f.write("Ka 0.2 0.2 0.2\n")
        f.write("Ks 0.1 0.1 0.1\n")
        f.write("Ns 10\n\n")
        f.write("newmtl toit\n")
        f.write(f"Kd {colors['toit'][0]:.2f} {colors['toit'][1]:.2f} {colors['toit'][2]:.2f}\n")
        f.write("Ka 0.2 0.2 0.2\n")
        f.write("Ks 0.05 0.05 0.05\n")
        f.write("Ns 5\n\n")
        f.write("newmtl sol\n")
        f.write("Kd 0.5 0.5 0.5\n")
        f.write("Ka 0.2 0.2 0.2\n")


def write_infos(m, base_path):
    """Écrit infos_extraction.txt"""
    path = base_path / "infos_extraction.txt"
    s = m.get("garage", False)
    garage_txt = f"Garage intégré: {m.get('garage_largeur', 0)}x{m.get('garage_profondeur', 0)} m" if s else "Non"
    txt = f"""══════════════════════════════════════════════════════════
EXTRACTION DONNÉES - {m['nom']}
══════════════════════════════════════════════════════════

ADRESSE: {m['adresse']}
COORDONNÉES GPS: {m['gps']}

DIMENSIONS EXTRAITES:
- Longueur: {m['longueur']} m
- Largeur: {m['largeur']} m
- Hauteur (murs): {m['hauteur_etage'] * m['niveaux']} m
- Niveaux: {m['niveaux']}
- Pente toit: {m['pente_toit']}°
- {garage_txt}

MATÉRIAUX: {m['materiaux']}
TYPE TOIT: {m['toit']}

SOURCES:
- Google Earth / Street View (estimations)
- Nominatim OpenStreetMap (coordonnées)
- Géoportail (cadastre - à vérifier sur place)

OBSERVATIONS:
- Modèle 3D généré à partir des dimensions estimées
- Appliquer textures réalistes dans Twinmotion
- Ajuster ouvertures (fenêtres/portes) si besoin

DATE EXTRACTION: 2025-02-22
"""
    with open(path, "w", encoding="utf-8") as f:
        f.write(txt)


def main():
    base = Path(__file__).parent.parent
    for m in MAISONS:
        dossier = base / m["nom"]
        dossier.mkdir(parents=True, exist_ok=True)
        vertices, normals, faces = generate_house_obj(m)
        obj_name = f"maison_{m['id']}.obj"
        mtl_name = f"maison_{m['id']}.mtl"
        write_obj(vertices, normals, faces, dossier / obj_name, mtl_name)
        write_mtl(dossier / mtl_name, m["materiaux"])
        write_infos(m, dossier)
        print(f"✓ {m['nom']}: {obj_name}, {mtl_name}, infos_extraction.txt")
    print("\nGénération terminée.")


if __name__ == "__main__":
    main()
