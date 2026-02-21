# Configuration Supabase pour la page d'upload audit

## 1. Créer le bucket "audits"

Dans le dashboard Supabase : **Storage** → **New bucket**

- **Nom** : `audits`
- **Public** : activé (pour accéder aux URLs des fichiers uploadés)
- **File size limit** : 10 Mo (correspond à la limite des photos)

## 2. Politiques RLS (Row Level Security)

Pour autoriser les uploads anonymes depuis la page publique, configurez les politiques :

```sql
-- Permettre l'upload pour tous (page publique)
CREATE POLICY "Allow public upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'audits');

-- Permettre la lecture publique (pour afficher les photos)
CREATE POLICY "Allow public read" ON storage.objects
FOR SELECT USING (bucket_id = 'audits');
```

## 3. Configuration des clés

Créez `public/config.upload.js` à partir de l'exemple :

```bash
cp public/config.upload.example.js public/config.upload.js
```

Remplissez avec vos `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (depuis votre `.env`).
