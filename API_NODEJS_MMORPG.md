# SPÉCIFICATION API NODE.JS
## LES ARCHANGES vs LES DÉMONS

**Stack :** Node.js + Express + MongoDB  
**Auth :** JWT (access + refresh)  
**Temps réel :** WebSocket (Socket.io)  
**Base URL :** `/api`

---

## 1) Conventions globales

### 1.1 Headers
- `Authorization: Bearer <access_token>` (si route protégée)
- `Content-Type: application/json`
- `X-Request-Id` (optionnel, recommandé)

### 1.2 Format réponse standard
```json
{
  "success": true,
  "data": {},
  "meta": {
    "request_id": "req_123",
    "timestamp": "2026-03-23T10:30:00Z"
  }
}
```

Erreur standard:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "details": [{"field": "email", "reason": "invalid_format"}]
  }
}
```

### 1.3 Codes d’erreur communs
- `400` validation
- `401` non authentifié
- `403` interdit
- `404` introuvable
- `409` conflit
- `429` rate limit
- `500` erreur interne

### 1.4 Rate limiting (base)
- Auth: `10 req/min/ip`
- Routes gameplay: `60 req/min/player`
- Market buy: `20 req/min/player`
- Chat via WS: `30 msg/30s/player`

---

## 2) AUTHENTICATION

## POST `/api/auth/register`
- **Auth requise :** non
- **Body**
```json
{
  "username": "DavidSlayer",
  "email": "david.slayer@example.com",
  "password": "StrongPass!2026",
  "faction": "LIGHT"
}
```
- **Réponse 201**
```json
{
  "success": true,
  "data": {
    "player_id": "8d5fdc53-70f4-4a74-89fd-0b0ed3912f8c",
    "username": "DavidSlayer"
  }
}
```
- **Erreurs :** `400`, `409`

## POST `/api/auth/login`
- **Body**
```json
{"email": "david.slayer@example.com", "password": "StrongPass!2026"}
```
- **Réponse 200**
```json
{
  "success": true,
  "data": {
    "access_token": "<jwt_access>",
    "refresh_token": "<jwt_refresh>",
    "expires_in": 900
  }
}
```
- **Erreurs :** `400`, `401`

## POST `/api/auth/logout`
- **Auth requise :** oui
- **Body** `{ "refresh_token": "<jwt_refresh>" }`
- **Réponse 200** `{ "success": true, "data": { "revoked": true } }`

## GET `/api/auth/verify-token`
- **Auth requise :** oui
- **Réponse 200**
```json
{"success": true, "data": {"valid": true, "player_id": "8d5f..."}}
```

## POST `/api/auth/refresh-token`
- **Auth requise :** non (refresh token requis)
- **Body** `{ "refresh_token": "<jwt_refresh>" }`
- **Réponse 200** nouveaux tokens

---

## 3) CHARACTERS

## GET `/api/characters/:id`
- **Auth requise :** oui (owner/admin)
- **Path** `id=character_id`
- **Réponse**
```json
{
  "success": true,
  "data": {
    "character_id": "char_01",
    "name": "MoisePrime",
    "class": "MOISE",
    "level": 58
  }
}
```

## POST `/api/characters`
- **Body**
```json
{"name": "MoisePrime", "class": "MOISE", "faction": "LIGHT"}
```
- **Réponse 201** objet personnage minimal

## PUT `/api/characters/:id`
- **Body** (champs autorisés)
```json
{"title": "Libérateur", "cosmetic_loadout": "set_seraph_02"}
```
- **Erreurs :** `400`, `403`, `404`

## DELETE `/api/characters/:id`
- Soft delete recommandé.

## GET `/api/characters/:id/stats`
- Retourne stats calculées + base + buffs.

## GET `/api/characters/:id/inventory`
- Query: `page`, `limit`, `type`
- Retour paginé.

---

## 4) GAMEPLAY

## POST `/api/gameplay/attack`
- **Body**
```json
{
  "character_id": "char_01",
  "target_id": "mob_991",
  "skill_id": "basic_attack",
  "client_ts": 1711189801000
}
```
- **Réponse**
```json
{
  "success": true,
  "data": {
    "combat_id": "cmb_1302",
    "damage": 842,
    "target_hp_remaining": 12058
  }
}
```

## POST `/api/gameplay/cast-spell`
- Validation: cooldown, ressources, portée, LoS.

## POST `/api/gameplay/use-item`
- Validation: possession item, cooldown item, état combat.

## GET `/api/gameplay/world-state`
- Query: `zone`, `since`
- Retourne état dynamique zone (events, contrôles, météo gameplay).

## POST `/api/gameplay/movement`
- Body: position + velocity + seq number.
- Serveur corrige et renvoie position autoritaire.

---

## 5) QUESTS

## GET `/api/quests/:characterId`
- Query: `status=active|completed|all`

## POST `/api/quests/:questId/accept`
- Body: `{ "character_id": "char_01" }`

## POST `/api/quests/:questId/complete`
- Vérifie objectifs et récompenses.

## GET `/api/quests/:questId/progress`
- Retourne progression détaillée et objectifs restants.

---

## 6) MARKET

## GET `/api/market/listings`
- Query: `item_id`, `rarity`, `min_price`, `max_price`, `page`

## POST `/api/market/listings`
- Body
```json
{"character_id":"char_01","item_id":"it_rune_light_03","quantity":12,"price_per_unit":18500}
```

## POST `/api/market/buy/:listingId`
- Body: `{ "character_id": "char_99", "quantity": 3 }`
- Transaction atomique requise.

## DELETE `/api/market/listings/:id`
- Annulation listing (owner uniquement).

## GET `/api/market/price-history/:itemId`
- Query: `range=24h|7d|30d`
- Retour courbe agrégée.

---

## 7) SOCIAL

## GET `/api/social/friends/:id`
- Retour liste amis + statuts.

## POST `/api/social/friends/add`
- Body: `{ "target_player_id": "uuid" }`

## DELETE `/api/social/friends/:id`
- Retrait ami ou blocage selon query mode.

## GET `/api/social/guilds/:guildId`
- Détails guilde, membres, territoires.

## POST `/api/social/guilds`
- Body: `{ "name": "Alliance des Trompettes" }`

## POST `/api/social/guilds/:id/join`
- Requête adhésion.

---

## 8) PVP

## POST `/api/pvp/duel/challenge`
- Body: challenger/target + règles.

## POST `/api/pvp/duel/accept`
- Body: challenge_id

## GET `/api/pvp/rankings`
- Query: `mode`, `season`, `page`

## GET `/api/pvp/arena-matchmaking`
- Query: `mode=5v5|10v10`
- Retour statut file/temps estimé.

---

## 9) RAIDS

## GET `/api/raids/:raidId`
- Détails instance raid.

## POST `/api/raids/:raidId/join`
- Vérifie conditions d’entrée.

## POST `/api/raids/:raidId/leave`
- Sortie raid.

## GET `/api/raids/:raidId/progress`
- Boss phase, objectifs, timers.

---

## 10) WEBSOCKET (Socket.io)

Namespace recommandé: `/ws/game`

### 10.1 Events serveur -> client
- `character.moved`
```json
{"character_id":"char_01","position":{"x":10.2,"y":5.3,"z":2.1},"seq":4431}
```
- `combat.started`
- `combat.ended`
- `item.looted`
- `quest.completed`
- `chat.message`
- `world.event`

### 10.2 Events client -> serveur
- `character.move`
- `combat.cast`
- `chat.send`
- `raid.ready`

### 10.3 Ack modèle
```json
{"ok":true,"event_id":"evt_9981","server_ts":1711189801000}
```

---

## 11) Validation des données

### 11.1 Recommandation stack
- `zod` ou `joi` pour validation schema.
- Validation stricte body/query/path.
- Sanitization anti-injection.

### 11.2 Exemples de règles
- Username: 3-24 chars, alphanum + underscore.
- Class: enum restreint.
- Prix market > 0 et < plafond dynamique.

---

## 12) Sécurité API

- JWT signé RS256.
- Refresh token rotatif.
- Blacklist token compromis.
- CORS whitelist.
- Helmet + rate limiter + anti brute force.
- Audit logs sur routes sensibles.

---

## 13) Compatibilité OpenAPI (gabarit)

```yaml
openapi: 3.0.3
info:
  title: LES ARCHANGES vs LES DÉMONS API
  version: 1.0.0
paths:
  /api/auth/login:
    post:
      summary: Login joueur
      requestBody:
        required: true
      responses:
        "200":
          description: OK
        "401":
          description: Unauthorized
```

---

## 14) Exemples d’erreurs fonctionnelles

- `CHARACTER_NOT_OWNER`
- `COOLDOWN_ACTIVE`
- `INSUFFICIENT_RESOURCE`
- `MARKET_LISTING_EXPIRED`
- `QUEST_PREREQUISITE_MISSING`
- `PVP_MATCHMAKING_UNAVAILABLE`

---

## 15) Checklist implementation

- [ ] Middlewares auth/roles/rate-limit
- [ ] Validation schemas par route
- [ ] Swagger/OpenAPI généré
- [ ] Tests unitaires + intégration
- [ ] Logs structurés + tracing
- [ ] Monitoring latence et erreurs

---

## 16) Conclusion

Cette spécification API fournit une base complète REST + WebSocket pour couvrir authentification, gameplay, économie, social, PvP et raids, avec un format immédiatement exploitable par les équipes frontend/backend.
