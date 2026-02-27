# MAISONS_3D_ENERGIA_CLIENTS

Modèles 3D de 6 maisons clients pour ENERGIA-CONSEIL IA® — présentations commerciales et visualisations « Avant / Après » travaux.

## Contenu

| Dossier | Client | Adresse |
|---------|--------|---------|
| M_RICHARD_UNIAS | M. Richard | 600 Route de la Goutte, 42210 Unias |
| MME_FONTANAY_MONTROND | Mme Fontanay | 167 Rue des Acacias, 42210 Montrond-les-Bains |
| M_ROYER_CHALAIN | M. Royer | 6 route de Marcilly, 42600 Chalain-d'Uzore |
| M_SEUX_RICAMARIE | M. Seux | 4 Rue Georges Laurent, 42150 La Ricamarie |
| M_GUION | M. Guion | (À compléter - bien en acquisition) |
| M_YANG_COLLONGES | M. Yang | 18 Parc des Chavannes, 69660 Collonges-au-Mont-d'Or |

## Fichiers par maison

- `maison_[client].obj` — géométrie 3D (format Wavefront)
- `maison_[client].mtl` — matériaux de base
- `infos_extraction.txt` — dimensions, coordonnées GPS, observations

## Logiciel cible

**Twinmotion 2025.2** — import direct des fichiers OBJ/MTL.

## Guides

- **Guide_Import_Twinmotion.html** — import des modèles dans Twinmotion
- **Guide_Finalisation_Rendu.html** — textures, éclairage, rendus 4K, visites 360°

## Régénération des modèles

### Node.js (recommandé)
```bash
node scripts/generate_maisons_3d.mjs
```

### Python
```bash
pip install -r scripts/requirements.txt  # optionnel, pas de dépendances externes
python scripts/generate_maisons_3d.py
```

## Sources des données

- Google Earth / Street View (dimensions et forme)
- Nominatim OpenStreetMap (coordonnées GPS)
- Géoportail (cadastre, à vérifier sur place)

## Spécifications techniques

- **Format :** OBJ + MTL (Wavefront)
- **Unités :** mètres (1:1)
- **Origine :** centre de la base de la maison
- **Géométrie :** murs, toit 2 pans, sol — optimisée pour Twinmotion
