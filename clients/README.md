# Dossiers clients — ENERGIA CONSEIL IA® V26

## Nouveau client (recommandé)

```bash
python scripts/new_client_dossier.py --name NOM_Prenom
```

Puis éditer `clients/NOM_Prenom/client_data.json`, déposer les pièces, et :

```bash
python generate_audit_report.py \
  --client clients/NOM_Prenom/client_data.json \
  --verify-pages
```

PDF auto : `clients/NOM_Prenom/output/audit_[NOM]_[REFERENCE].pdf`

## Alternative — copier ROYER

**PowerShell (Windows) :**
```powershell
Copy-Item -Recurse clients\ROYER_Maixent clients\NOM_CLIENT
# Remplacer TOUT le contenu de client_data.json
python generate_audit_report.py `
  --client clients/NOM_CLIENT/client_data.json `
  --output clients/NOM_CLIENT/output/audit_NOM_CLIENT.pdf `
  --verify-pages
```

**Linux / macOS :**
```bash
cp -r clients/ROYER_Maixent clients/NOM_CLIENT
# Éditer client_data.json
python generate_audit_report.py \
  --client clients/NOM_CLIENT/client_data.json \
  --output clients/NOM_CLIENT/output/audit_NOM_CLIENT.pdf \
  --verify-pages
```

## Contrôles

```bash
python scripts/validate_client_data.py --client clients/NOM_CLIENT/client_data.json
python scripts/prepare_client_dossier.py --client clients/NOM_CLIENT/client_data.json
```
