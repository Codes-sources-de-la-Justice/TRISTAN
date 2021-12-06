{ pkgs ? import ./nix }:
let
  callPackage = pkgs.callPackage;
  lib = pkgs.lib;
  filteredSrc = lib.cleanSourceWith {
    filter = name: type: let baseName = baseNameOf (toString name); in ! (baseName == "state" || baseName == "node_modules");
    src = lib.cleanSource ./.;
  };
  backend = callPackage ./nix/backend.nix {};
  frontend = callPackage ./nix/frontend.nix {
    src = filteredSrc;
  };
in rec {
  inherit backend frontend;
  dev-containers = pkgs.arion.build {
    modules = [ ./nix/arion-compose.nix ];
    pkgs = import ./nix/arion-pkgs.nix;
  };
  ci = [ docker.backend-app docker.backend-worker frontend.production-bundle dev-containers ];
  docker = callPackage ./nix/docker.nix {};
  shell = pkgs.npmlock2nix.shell {
    src = filteredSrc;
    buildInputs = with pkgs; [
      # Python's backend
      backend.env

      # Node.js
      nodejs
      yarn2nix
      yarn

      # jq-like tool for XML
      yq

      # Development app/worker runner
      foreman
      # Docker-Compose on steroids
      arion
      docker-client # Required when using podman

      # For SPS mock
      nodePackages.json-server

      # Vulnerabilities assessments
      nodePackages.snyk
    ];

    # Ensure Puppeteer can find a Chromium browser.
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium.outPath}/bin/chromium";
    # Do not symlink the initial node_modules, otherwise, it will not be possible to interactively edit the package(-lock).json.
    node_modules_mode = "copy";
    node_modules_attrs = {
      PUPPETEER_SKIP_DOWNLOAD = "true";
    };
    # Use common settings.
    DJANGO_SETTINGS_MODULE = "common.settings";
    # Development shell is in debug.
    DEBUG = "True";
    # TRISTAN frontend
    TRISTAN_FRONTEND = "http://localhost:3000";
  };
}
