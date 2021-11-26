# TRISTAN

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

TODO.

### Avec Nix

Il suffit de :

```console
$ nix-shell
[nix-shell] $ yarn install
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
