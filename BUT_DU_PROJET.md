Voici le fichier Markdown demandé. Tu peux le déposer à la racine du repo sous le nom : `BUT_DU_PROJET.md`.

---

# BUT\_DU\_PROJET — Webapp JDR avec MJ IA

## 1) Résumé exécutif

Créer une **application web de jeu de rôle (JDR)** où un **Maître du Jeu (MJ) piloté par IA** propose une narration riche, cohérente et improvisée **dans n’importe quel univers**, avec **n’importe quel système de règles**, pour **1 à 6 joueurs**.
L’IA **raconte et orchestre** ; **le moteur de règles (code)** tranche **strictement** tous les calculs (jets de dés, dégâts, états…). L’objectif est d’offrir une **expérience la plus proche d’une vraie table** : immersion, cohérence, progression, décisions impactantes — **sans tricherie mécanique**.

---

## 2) Principes fondamentaux (non négociables)

1. **Séparation IA / règles**

   * **IA** = narration, ambiance, PNJ, propositions d’actions, génération d’univers & scénarios.
   * **Moteur de règles** (code) = **seul arbitre** des jets, modificateurs, succès/échec, application d’états, loot, etc.
2. **Respect strict des règles**

   * Par défaut : **strict**.
   * Option “**assouplir les règles**” **à la demande** (ex. ignorer l’encombrement, soins simplifiés…), **ciblée et traçable**.
3. **Règles par partie (pas globales)**

   * Chaque **partie** choisit/importer/génère son **RuleSet**.
   * Possibilité de **règles de base** fournies, mais la **référence est locale à la partie**.
4. **Sauvegarde robuste**

   * **Après chaque action** (ou au moins très fréquemment), snapshot de l’état pour tolérer les pannes.
5. **Neutralité & transparence**

   * L’IA **ne simule pas** les calculs — elle **demande** un jet et **attend** le résultat du moteur.

---

## 3) Utilisateurs & contexte d’usage

* **Hôte** (joueur qui crée la partie), **joueurs** (jusqu’à 6), et **MJ IA**.
* Sessions **privées**, 18+, **modération minimale**.
* Langue **fr** en priorité (puis **en**).
* Latence cible : **< 2 s** pour les échanges textuels ; transitions de scènes peuvent tolérer un peu plus.

---

## 4) Objectifs détaillés

### 4.1 Immersion & narration

* L’IA **met en scène** : descriptions d’environnements, PNJ crédibles, dialogues, dilemmes.
* **Cohérence** avec l’univers (lore), **continuité narrative** (éviter de “perdre le fil”).
* Possibilité de **générer** un **début de partie** : amorce (intro), **quête initiale**, **cadre/ambiance**.

### 4.2 Fidélité aux règles

* Tous les jets (initiative, attaque, compétences…) sont **calculés par le moteur**.
* L’IA **propose** le jet requis (ex. “Faites un jet d’ATT+DEX contre 12”), puis **décrit le résultat** après retour du moteur.
* **Équilibrage** souhaité (rencontres, loot) en fonction du groupe et de la difficulté choisie.

### 4.3 Personnalisation complète

* **Univers** : import d’un JDR existant, univers maison, ou **génération IA**.
* **Règles** : import/génération ; **compatibles multi-systèmes** (d20, PBTA, etc.) via un **modèle de règles** générique.
* **Personnages** : création manuelle ou par IA ; fiches flexibles (stats libres, compétences, inventaire, conditions).

### 4.4 Multi-joueurs & gestion de partie

* **1 à 6 joueurs** (IA et/ou humains).
* **Sessions** multiples par partie (une campagne).
* **Historique des actions** consultable.
* **Overlay combat** avec **ordre d’initiative** ; affichage des HP **selon les règles** (parfois cachés).

### 4.5 I/O & multimédia (progressif)

* **Texte** MJ + **voix** (TTS) et **commande vocale** (STT) **activables par joueur**.
* **Images** de scènes/carte (plus tard).
* Intégration **Discord** (vocal, jets, relais) **en option**.

---

## 5) Parcours utilisateur (expérience attendue)

1. **Créer une partie**

   * Renseigner : nom, univers (ou laisser IA), règles (ou laisser IA), difficulté, joueurs (IA/humains).
   * L’IA peut **proposer** un setup (intro, quête, ambiance) **sans** imposer de mécanique.
2. **Créer/Importer son personnage**

   * Fiche flexible (stats/compétences/inventaire/conditions).
   * Option IA pour générer un **concept + lore** cohérents.
3. **Jouer**

   * Les joueurs **décrivent** leurs actions (texte ou vocal).
   * Le **MJ IA** réagit, **propose** les **jets requis**.
   * Le **moteur** calcule → **résultat** → **narration** MJ → **état** mis à jour.
   * **Sauvegarde** après chaque action.
   * **Combat** : overlay initiative, tours, application d’effets/états ; sortie/entrée de combat claire.
4. **Assouplir les règles (si besoin)**

   * L’hôte (ou dédié) indique **quelle règle** assouplir → le moteur active le **mode** correspondant **uniquement** pour cette règle.
5. **Clore/Reprendre**

   * Système reprend sur le **dernier snapshot**.

---

## 6) Interface — principes d’ergonomie

* **Grande zone centrale** : **sortie MJ** (narration/dialogues/événements).
* **Colonne droite** :

  * **Chat joueurs** (métagame/coordination).
  * **Zone d’instructions au MJ** (prompts).
* **Barre d’actions** (en bas) :

  * **Voir mon personnage** (fiche : stats, inventaire, compétences, lore, conditions).
  * **Historique** des actions/jets.
  * **Bouton d’action** (lancer dés, utiliser compétence) — **toujours visible ou contextuel** (activé par MJ selon demande).
* **Overlay combat** (affiché uniquement en combat) : **ordre d’initiative**, HP visibles/cachés selon **règles**.
* **Clarté des états** : retours explicites (succès/échec, dégâts, effets), sans noyer le joueur.

---

## 7) Données — attentes métier

* **Partie** : contient le **RuleSet** de référence (ou lien), **difficulté**, **mode** (strict/relaxed), **statut** (préparation, actif, etc.).
* **Session** : période de jeu (début/fin, résumé).
* **Personnage** : fiche **souple** (stats/skills/inventaire en tableaux d’objets), **conditions** (malus, états), **tags** libres.
* **Événement (event)** : trace **immuable** d’une action **résolue** (type, jets, résultat, auteur, horodatage).
* **Snapshot** : image cohérente de l’état de la partie à un instant t (pour reprise).
* **RuleSet** : définitions d’actions/dés, échelles de difficulté, validateurs des champs requis, tables de loot, etc.

---

## 8) Contraintes & critères de qualité

* **Cohérence narrative** : l’IA **garde le fil** de l’histoire ; quêtes **pertinentes** et reliées à la trame.
* **Lisibilité mécanique** : les joueurs **comprennent** pourquoi un jet est demandé et comment le résultat est appliqué.
* **Robustesse** : **snapshot** fréquent ; reprise fiable.
* **Temps de réponse** : **< 2 s** pour les échanges textuels courants.
* **Neutralité règles** : pas de “magie noire” IA côté mécanique ; tout calcul est **vérifiable**.
* **Accessibilité** : interface simple, utilisable en **solo** ou **multi** sans friction.
* **Confidentialité** : usage **privé**, modération **minimale** (18+).

---

## 9) Hors périmètre (pour éviter la dérive)

* **IA qui calcule ou modifie des états “en douce”** : interdit.
* **Dépendance à un seul système de règles** : le projet doit rester **agnostique**.
* **MMO/Serveur public** : on vise **des parties privées**.
* **Anti-cheat complexe** : pas d’objectif compétitif.
* **Économie/monétisation** : non prioritaire (peut être envisagée plus tard).

---

## 10) Indicateurs de succès (vision produit)

* Une table peut **démarrer une partie** (univers + règles **au choix**) en quelques minutes.
* Les joueurs ressentent une **expérience de “vrai MJ”** : PNJ crédibles, ambiance, improvisation, **sans incohérences mécaniques**.
* Le **moteur** reste **la source de vérité** : chaque résultat est traçable (événements, jets, modifs d’état).
* **Reprise** de partie **instantanée** sur dernier snapshot.
* **Évolutivité** : ajout d’univers/règles sans refonte.

---

## 11) Vision d’évolution (à haute altitude)

* **IA vocale** (voix MJ + commandes vocales joueurs).
* **Génération d’images** (scènes, cartes).
* **Discord** (vocal, jets, relais).
* **Équilibrage** auto plus fin (rencontres, loot dynamique).
* **Outils de création** (assistants pour univers, PNJ, objets, quêtes) utilisables par l’hôte **entre** les sessions.

---

### TL;DR

> Une webapp de JDR **centrée sur l’IA MJ** pour l’**immersion** et la **souplesse d’univers**,
> où la **mécanique** est **garantie** par un **moteur de règles** strict et transparent,
> afin de **jouer comme à une vraie table**, en **solo ou à plusieurs**, avec **sauvegardes robustes** et une **UI claire**.
