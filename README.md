# SportLink — API

API de SportLink, une plateforme de suivi sportif qui réunit sportifs, coachs, médecins du sport et entreprises partenaires.

Ce dépôt contient l'API. L'application web et mobile est dans [hyperion-connect-frontend](https://github.com/AlexPst-Dev/hyperion-connect-frontend).

## Histoire du projet

Le projet a été développé en freelance pour une start-up, sous le nom « Hyperion Connect ». L'application a été livrée, mais la société a fermé avant le lancement public.

Le code est publié ici sous le nom SportLink, avec une démo et des données entièrement fictives. Il a été nettoyé après coup : sécurité, dépendances, déploiement Docker et démo.

## Ce que fait l'application

| Rôle | Ce qu'il fait |
| --- | --- |
| Sportif | Suit son programme, ses séances, ses objectifs et ses rendez-vous médicaux. Accède aux offres partenaires. |
| Coach | Crée des exercices et des séances, les assigne à ses sportifs et suit leur progression et leurs retours. |
| Médecin | Suit ses patients, planifie les bilans et rédige des comptes rendus. |
| Partenaire | Gère son entreprise et publie des réductions ou des sponsorings pour les membres. |
| Compte découverte | Explore la plateforme avant de choisir un accompagnement. |
| Administrateur | Gère les utilisateurs, les catégories, les événements, les abonnements et les statistiques. |

## Stack

- Node.js, Express 4 et TypeScript.
- TypeORM et MySQL 8. Le schéma est géré uniquement par les migrations.
- Authentification JWT, mots de passe hachés avec bcrypt.
- Helmet, CORS restreint aux origines déclarées, rate limiting renforcé sur la connexion.
- Envoi d'e-mails avec Nodemailer (facultatif). Fichiers stockés en base.
- Tests avec Jest et Supertest.
- Bun pour les dépendances et les scripts. Image Docker exécutée par Node 22, sans droits root.

## Lancer le projet

Docker lance tout : MySQL, l'API et l'application web.

```bash
git clone https://github.com/AlexPst-Dev/hyperion-connect-backend.git
git clone https://github.com/AlexPst-Dev/hyperion-connect-frontend.git
cd hyperion-connect-backend
cp .env.example .env   # remplir DB_PASS, JWT_SECRET et JWT_RESET_SECRET
docker compose up -d --build
```

- Application web : <http://localhost:8080>
- API : <http://localhost:3000/api>

Avec `DEMO_MODE=true`, la base est remplie de données fictives au premier démarrage.

### Sans Docker

Il faut un serveur MySQL et un fichier `.env`.

```bash
bun install
bun run dev          # API avec rechargement automatique
bun run test         # tests
bun run typecheck
```

## Mode démo

Activé avec `DEMO_MODE=true` :

- **Données** : un compte par rôle, des sportifs avec leurs programmes, des événements, des offres partenaires (`src/demo/seed.ts`). Toutes les données sont inventées.
- **Comptes** : listés par `GET /api/demo/accounts`. L'écran de connexion les affiche sous forme de boutons.
- **Remise à zéro** : chaque nuit à 03:00, heure de Paris, l'API efface la base, rejoue les migrations et remet les données. Sans service supplémentaire. À la main : `bun run build && bun run demo:reset`.
- **Protections** : le changement de mot de passe ou d'e-mail et la suppression de compte sont désactivés, pour qu'aucun visiteur ne bloque les autres.

## Organisation du code

```
src/
  config/        variables d'environnement (les secrets sont obligatoires)
  controllers/   logique de chaque ressource
  routes/        routes Express et contrôles de rôle
  middleware/    authentification et rôles
  models/        entités TypeORM
  migrations/    schéma de la base
  demo/          données fictives, remise à zéro, protections de la démo
  tests/
```

## Ce que je referais aujourd'hui

- **Droits sur chaque ressource.** Les routes vérifient la connexion et le rôle. En revanche, elles ne vérifient pas toujours que la ressource appartient à l'utilisateur : un coach peut modifier un événement qui n'est pas le sien. Je centraliserais ces vérifications dans une couche de politiques d'accès.
- **Relations en base.** Plusieurs listes d'identifiants sont stockées sous forme de texte (`"3;5;7"`). Des tables de liaison donneraient l'intégrité référentielle et des requêtes plus simples.
- **Validation des entrées.** Un schéma (Zod, par exemple) par route, au lieu de vérifications à la main dans les contrôleurs.
- **Fichiers.** Les fichiers sont stockés en base. Un stockage objet (S3 ou équivalent) serait plus adapté.
- **Tests.** Plus de tests d'intégration sur les parcours complets de chaque rôle.
