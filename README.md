# Backend PHP — Wafa Assurance Ahl Al Khair

Implémentation du serveur en **PHP** (langage backend), conforme au cahier des charges
(PHP + base de données relationnelle). Il expose exactement la même API REST que le backend Node,
donc le frontend React fonctionne sans aucune modification.

## Prérequis

- **PHP 8.1 ou plus** (`php -v` pour vérifier), avec l'extension **PDO SQLite** (activée par défaut).

## Démarrage

Depuis la racine du projet :

```bash
npm run dev:php
```

Cette commande lance **le serveur PHP (port 3001)** et **le frontend Vite (port 5173)** ensemble.
Ouvrez http://localhost:5173.

> Le frontend appelle `/api`, redirigé vers `http://localhost:3001` — c'est le port du serveur PHP,
> donc rien d'autre à configurer.

Pour lancer uniquement l'API PHP :

```bash
php -S localhost:3001 backend-php/index.php
```

## Base de données

Par défaut, le backend PHP utilise **SQLite** : le fichier `backend-php/data.sqlite` est créé
automatiquement au premier démarrage et rempli avec les données de démonstration.
C'est une vraie base de données SQL, sans aucune installation.

### Passer à MySQL (comme dans le cahier des charges)

Deux possibilités :

1. Modifier `backend-php/config.php` : mettre `'driver' => 'mysql'` et renseigner les identifiants.
2. Ou définir des variables d'environnement avant de lancer :

```bash
DB_DRIVER=mysql DB_HOST=127.0.0.1 DB_NAME=gestion_assurance DB_USER=root DB_PASS=secret \
  php -S localhost:3001 backend-php/index.php
```

Les tables sont créées automatiquement. Pour la version relationnelle complète (clés étrangères,
contraintes), utilisez le script `database/schema_mysql.sql` fourni.

## Architecture du code

```
backend-php/
├── index.php     Point d'entrée : routage des requêtes /api/* et réponses JSON
├── db.php        Couche d'accès aux données (PDO) : schéma, mapping base <-> API
├── config.php    Configuration de la base (SQLite par défaut, MySQL en option)
└── seed.php      Données initiales
```

## Routes de l'API

```
POST   /api/login                 Authentification
GET    /api/state                 Toutes les collections
PUT    /api/state                 Sauvegarde de toutes les collections
GET    /api/dashboard/stats       Indicateurs du tableau de bord
POST   /api/reset                 Réinitialisation de la base

GET    /api/{ressource}           Liste     (clients, contrats, sinistres, paiements, users, notifs)
POST   /api/{ressource}           Création
GET    /api/{ressource}/{id}      Détail
PUT    /api/{ressource}/{id}      Modification
DELETE /api/{ressource}/{id}      Suppression
```

Exemple : `curl http://localhost:3001/api/dashboard/stats`
