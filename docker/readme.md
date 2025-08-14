# JDR Docker Pack (MVP)

## Contenu
- `docker-compose.yml` : Mongo, Ollama, Whisper (STT) et Piper (TTS) en option, backend (placeholder).
- `.env.example` : variables d’environnement.
- `backend/` : squelette serveur Node/TS minimal (endpoint `/health`).
- `scripts/mongo/01_indexes.js` : index recommandés.
- `scripts/mongo/02_validators.js` : validateurs $jsonSchema (characters, events, rulesets).

## Démarrage
1. Copier `.env.example` → `.env` et ajuster si besoin.
2. `docker compose up -d --build`
3. Vérifier la santé : `curl http://localhost:4000/health` (quand backend compilé) ou `curl http://localhost:11434/api/tags`.
4. Tirer un modèle dans Ollama : `docker exec -it <prefix>_ollama_1 ollama pull llama3:8b`.

## Initialiser Mongo (index + validateurs)
```bash
docker exec -it <prefix>_mongo_1 mongosh /scripts/01_indexes.js
docker exec -it <prefix>_mongo_1 mongosh /scripts/02_validators.js

## Monte les scripts via volume si besoin, ou copie-les avec docker cp 
docker cp scripts/mongo/01_indexes.js <prefix>_mongo_1:/scripts/01_indexes.js
docker cp scripts/mongo/02_validators.js <prefix>_mongo_1:/scripts/02_validators.js


## Notes
Pour dev, garde OLLAMA_MODEL=llama3:8b. Tu pourras changer pour llama3.1:70b quand tu auras le GPU adéquat.

Les services whisper et piper sont optionnels : supprime-les si tu ne les utilises pas.

Sécurité (prod) : n’expose pas Mongo/Ollama publiquement; utilise des réseaux internes + reverse proxy sécurisé.

## Notes rapides :

Exécute-le avec : mongosh /scripts/02_validators.js (ou colle-le dans mongosh après t’être connecté à ta base).

Il crée les collections si elles n’existent pas, puis applique collMod avec validationLevel approprié.

characters en moderate (flexibilité pour itérer), events/rulesets en strict (critiques).

Tu peux ajuster les required et additionalProperties selon ton degré de rigidité.