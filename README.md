# TRISTAN

[![Built (code & containers) and cached in Cachix](https://github.com/Codes-sources-de-la-Justice/TRISTAN/actions/workflows/build.yml/badge.svg)](https://github.com/Codes-sources-de-la-Justice/TRISTAN/actions/workflows/build.yml)
[![Project tests](https://github.com/Codes-sources-de-la-Justice/TRISTAN/actions/workflows/test.yml/badge.svg)](https://github.com/Codes-sources-de-la-Justice/TRISTAN/actions/workflows/test.yml)

## Qu'est que c'est ?

TRISTAN est un [défi EIG (Entrepreneur d'Intérêt Général)](https://eig.etalab.gouv.fr/defis/tristan/) qui cherche à aider les magistrats dans la préparation dans leur audience.

Il se compose de plusieurs pièces :

- Une API REST Django qui expose des analyseurs ;
- Des workers Celery qui exécutent des analyseurs ;
- Un frontend React.js qui fait le rendu des résultats d'analyse ;
- Un bouchon SPS qui permet de servir des affaires et des pièces à partir d'un dossier de données (que vous devez fournir !)

## Instructions pour lancer le projet

Pour les détails de variables d'environnement, se référer à la section ci-dessous.

### Sans Nix

Il faut installer Node.js ≥ 12 au moins, Yarn, Python ≥ 3.8, Poetry, foreman au besoin.

Ensuite: `yarn install && poetry install` devrait installer toutes les dépendances, certaines peuvent échouer en raison de dépendances natives cachés.

### Avec Docker

#### Conteneurs pour la production

Il est possible de produire un conteneur compatible OCI pour le backend en effectuant :

```
$ nix-build -A docker.backend-app
$ nix-build -A docker.backend-worker # Actuellement les mêmes images pour le moment.
$ nix-build -A docker.frontend-static
```

Les chemins produits sont des tarballs qui peuvent être chargés et minimales, elles ne contiennent que la clôture transitive des dépendances de l'application.

#### Conteneurs pour le développement (à la Docker-Compose)

Est utilisé: <https://github.com/hercules-ci/arion> — qui peut produire un authentique fichier YAML Docker Compose au besoin.

On peut lire le fichier dans `nix/arion-compose.nix` et effectuer les ajustements, PostgreSQL stocke les données dans `./state/postgres-data` avec des permissions différentes de l'utilisateur courant (!).

Cela démarre :

- le backend Django ;
- un worker Celery ;
- un Redis ;
- un PostgreSQL ;
- une API mock de SPS ;

en faisant simplement :

```console
$ arion up -d
```

Attention, il est nécessaire de fournir un fichier de base de données JSON valide pour l'API mock de SPS, conformément aux instructions plus bas, sinon le mock ne démarrera pas et les analyseurs et le frontend sera en échec.

### Avec Nix

Il suffit de :

```console
$ nix-shell
[nix-shell] $ foreman start
```


## Du bon usage du mock SPS

Le mock SPS est la donnée de deux choses :

- une base de données JSON qui renvoie les métadonnées des affaires et des pièces ;
- un emplacement où se trouve les véritables fichiers pour que le mock les serve ;

### Générer la base de donnée

Le script `generate_from_files.py` dans `contrib/sps-mock` s'utilise de la façon suivante :

```console
$ ./generate_from_files emplacement_avec_les_fichiers > db.json
```

### Placer l'emplacement

Il suffit de placer un lien symbolique `public` dans `contrib/sps-mock` :

```console
$ ln -s $pwd/emplacement_avec_les_fichiers contrib/sps-mock/public
```

## Documentation des variables d'environnement

|         Variable        |                     Valeur par défaut                    |                 Documentation                |
|:-----------------------:|:--------------------------------------------------------:|:--------------------------------------------:|
|    `SPS_API_URL_BASE`   |                  `http://localhost:3000`                 |          Base des URLs de l'API SPS          |
|    `TRISTAN_FRONTEND`   |                  `http://localhost:5201`                 |       Base des URLs du frontend TRISTAN      |
|         `DEBUG`         |                          `True`                          |            DEBUG pour l'API Django           |
|     `ALLOWED_HOSTS`     |              n/a si DEBUG sinon obligatoire              |       Hôtes autorisés pour l'API Django      |
|       `SECRET_KEY`      | clef par défaut non sécurisée si DEBUG sinon obligatoire |        Clef secrète pour l'API Django        |
|      `DATABASE_URL`     |                   db.sqlite3 par défaut                  |       Base de données pour l'API Django      |
|        `TIMEZONE`       |                            UTC                           |                                              |
|       `REDIS_URL`       |                `redis://localhost:6379/0`                |     URL de broker pour les workers Celery    |
| `CELERY_RESULT_BACKEND` |                          `redis`                         | Backend de résultats pour les workers Celery |
