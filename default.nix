{ pkgs ? import ./nix }:
let
  callPackage = pkgs.callPackage;
  lib = pkgs.lib;
  # On filtre la source pour enlever les états, le node_modules et autres impuretés non souhaitables.
  filteredSrc = lib.cleanSourceWith {
    filter = name: type: let baseName = baseNameOf (toString name); in ! (baseName == "state" || baseName == "node_modules");
    src = lib.cleanSource ./.;
  };
  # On charge le module backend.
  backend = callPackage ./nix/backend.nix {};
  # On charge le module frontend.
  frontend = callPackage ./nix/frontend.nix {
    projectSrc = filteredSrc;
  };
  # On crée un environnement de développement à destination de TRISTAN
  mkTristanEnv = { ... }:
  pkgs.mkShell {
      src = filteredSrc;
      buildInputs = with pkgs; [
        # L'environnement du backend
        # TODO: inutilisé
        # backend.env

        # Node.js ≥ 16.x
        nodejs-16_x

        # Outils en vrac
        # jq-like tool for XML
        yq
        # LEGACY: Lanceur d'applications (Procfile)
        foreman
        # Docker-Compose pour Nix
        arion
        docker-client # Required when using podman

        # For SPS mock
        nodePackages.json-server

        # Vulnerabilities assessments
        nodePackages.snyk
      ];

      # On fournit un navigateur Chromium depuis Nix à Puppeteer.
      PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium.outPath}/bin/chromium";
      # TODO: faire pareil avec Cypress par ex.

      # Pour l'application Django.
      # Paramètres par défaut.
      DJANGO_SETTINGS_MODULE = "common.settings";
      # On se place en mode DEBUG, par défaut: False. Permet d'avoir les traces et des informations utiles.
      DEBUG = "True";

      # L'URL du frontend TRISTAN en mode développement.
      TRISTAN_FRONTEND = "http://localhost:4200";
    };
in rec {
  inherit backend frontend;

  # Conteneurs de développement à la Docker-Compose avec Arion
  dev-containers = pkgs.arion.build {
    modules = [ ./nix/arion-compose.nix ];
    pkgs = import ./nix/arion-pkgs.nix;
  };

  # Ce qui est construit en CI: 
  # - les conteneurs backend.
  # TODO: - les conteneurs frontend.
  ci = [ 
    docker.backend-app 
    docker.backend-worker
  ];
  docker = callPackage ./nix/docker.nix {
    projectSrc = filteredSrc;
  };

  shell = mkTristanEnv { };

  # Le shell du CI pour faire les tests end to end, unitaire, etc.
  ciShell = mkTristanEnv { };
}
