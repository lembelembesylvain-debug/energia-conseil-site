# Rapport d’audit énergétique premium — ENERGIA CONSEIL IA®

Dossier **isolé** : `rapport-audit-energia/`.  
Il ne modifie aucun fichier du simulateur, du site web ni du kit Damien.

## Objectif

Générer un rapport client professionnel **imprimable A4** (~**85 pages**), en français, à partir d’un **fichier JSON client unique**, réutilisable pour tous les futurs dossiers.

## Contenu du dossier

```
rapport-audit-energia/
├── index.html                 # Accueil
├── rapport.html               # Rapport A4 + bouton Imprimer / Exporter PDF
├── parametrage.html           # Formulaire de paramétrage
├── README.md
├── css/
│   ├── rapport.css
│   └── parametrage.css
├── js/
│   ├── utils.js
│   ├── content-pedagogique.js
│   ├── rapport-engine.js
│   └── parametrage.js
├── data/
│   ├── rapport-client-royer.json   # Dossier test ROYER
│   └── rapport-client-demo.json    # Mode DEMO
└── assets/                    # Logo / pièces à ajouter si besoin
```

## Démarrage rapide

Le chargement des JSON nécessite un serveur local (pas d’ouverture directe `file://` pour `fetch`).

### Option PowerShell (Python)

```powershell
cd C:\Users\lembe\energia-conseil-site\energia-conseil-site\rapport-audit-energia
python -m http.server 8765
```

Puis ouvrir : [http://localhost:8765/](http://localhost:8765/)

### Option Node

```powershell
npx --yes serve -p 8765
```

## Utilisation

| Action | URL |
|--------|-----|
| Accueil | `/` ou `index.html` |
| Rapport ROYER | `rapport.html?mode=royer` |
| Mode DEMO | `rapport.html?mode=demo` |
| Paramétrage | `parametrage.html` |
| Rapport depuis paramétrage | `rapport.html?from=param` |

### Exporter en PDF

1. Ouvrir le rapport.
2. Cliquer sur **Imprimer / Exporter PDF**.
3. Choisir **Enregistrer au format PDF**.
4. Format : **A4**, marges **aucune** / **minimales**, activer **graphiques d’arrière-plan**.

Pied de page sur chaque page (hors couverture) : **Généré par Limova**.  
Pagination : **Page X / 85**.

## Personnaliser un nouveau client

1. Dupliquer `data/rapport-client-royer.json` → `data/rapport-client-NOM.json`.
2. Remplir uniquement les données **vérifiées**.
3. Pour toute donnée absente : laisser `null` / `""` ou la chaîne  
   `À confirmer / sous réserve de validation`.
4. Ouvrir `parametrage.html`, coller le JSON (onglet **JSON brut**) ou charger le fichier via le serveur.
5. **Enregistrer** puis **Prévisualiser**.

Vous pouvez aussi ouvrir :

`rapport.html?data=data/rapport-client-NOM.json`

## Règles métier (non négociables)

- **Ne jamais inventer** : aide, performance thermique, qualification RGE, assurance, montant, donnée client.
- Donnée absente → **« À confirmer / sous réserve de validation »**.
- Aides toujours **indicatives** et conditionnées à l’instruction des organismes compétents.
- Aides **non déduites** du devis sauf mention contractuelle explicite.
- Le rapport **ne remplace pas** : audit réglementaire, MAR, étude structurelle, décision d’attribution d’aides.
- Acompte 30 % : statut **EN COURS** — ne jamais écrire « payé » / « encaissé » sans mise à jour explicite du JSON.
- Prestation **MAR séparée**, non comprise dans le devis principal.
- Conditions commerciales : **reprise des éléments validés du devis** uniquement (pas de nouvelle clause inventée).

## Mode DEMO

Fichier : `data/rapport-client-demo.json`  
Bandeau / sous-titre : **Données de démonstration**.  
Aucun montant réel d’aides ; lots et entreprises fictifs ou en placeholder.

## Dossier ROYER (préchargé)

- Client : M. Maixent ROYER  
- Bien : maison individuelle, 77 m², avant 1948 — Chalain-d’Uzore  
- Objectif : G → C, conso cible indicative 117 kWhEP/m².an  
- Budget travaux : **52 000 € TTC** (détail HT/TVA issu du devis)  
- Paiement : 30 / 40 / 30 — acompte **EN COURS**  
- Travaux : sécurisation, isolation rampants, couverture, zinguerie, PAC air/air, CET, menuiseries, coordination  

## Sources analysées

| Source demandée | Statut dans le dépôt |
|-----------------|----------------------|
| Devis rectificatif ROYER PDF nommé | Non trouvé sous ce nom exact — données reprises du devis / dossier `clients/ROYER_Maixent` et devis HTML révision TVA |
| Articles DOCX 01 à 09 | **Non trouvés** dans le workspace — contenus pédagogiques généraux utilisés dans `js/content-pedagogique.js` |

Pour enrichir les focus techniques : déposer les DOCX dans `assets/sources/` et demander une mise à jour du module pédagogique (sans inventer de chiffres).

## Structure du rapport (12 blocs)

1. Page de garde  
2. Synthèse exécutive  
3. Profil du logement  
4. Diagnostic énergétique détaillé  
5. Scénarios Essentiel / Optimal / Excellence  
6. Programme de travaux retenu  
7. Focus technique par poste  
8. Aides financières et financement  
9. Planning  
10. Entreprises, RGE et assurances  
11. Conditions commerciales (issues du devis)  
12. Annexes + prochaines étapes  

## Identité visuelle

- Bleu nuit `#0b1f33`  
- Vert energia `#0f766e` / `#14b8a6`  
- Blanc / gris clair  
- Design aéré, tableaux structurés, graphiques simples  

## Support

ENERGIA CONSEIL IA® — 16 Rue Cuvier, 69006 Lyon — 06 10 59 68 98 — contact@energia-conseil-ia.com
