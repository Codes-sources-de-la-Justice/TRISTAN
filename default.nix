{ pkgs ? import <nixpkgs> { } }:
let
  callPackage = pkgs.callPackage;
  backend = callPackage ./nix/backend.nix {};
  frontend = callPackage ./nix/frontend.nix {};
in rec {
  ci = [ docker.backend-app docker.backend-worker ];
  docker = callPackage ./nix/docker.nix {};
  shell = with pkgs;
    mkShell {
      buildInputs = [ 
        # Python's backend
        backend.env

        # Node.js
        # TODO: add frontend.dependencies so that yarn install is not necessary.
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
      # Use common settings.
      DJANGO_SETTINGS_MODULE = "common.settings";
      # Development shell is in debug.
      DEBUG = "True";

      # TODO: once react-scripts buggy behavior with caching is fixed, use Nix for frontend.
      # node_modules = "${jsDeps}/node_modules";
      CACHE_DIR = "/var/cache/";
      /* shellHook = ''
        # ${yarn2nix-moretea.linkNodeModulesHook}
      '' ; */
    };
}
