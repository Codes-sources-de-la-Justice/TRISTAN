{ dockerTools, callPackage }:
let
  backend = callPackage ./backend.nix {};
  mkBackendContainer = { name, cmd, ports ? {}, ... }: dockerTools.buildLayeredImage {
    inherit name;
    contents = [ backend.app.dependencyEnv ];
    config = {
      Cmd = cmd;
      ExposedPorts = ports;
    };
  };
in
  {
    backend-app = mkBackendContainer {
      name = "tristan-backend-app";
      cmd = "gunicorn api.wsgi:application";
      ports = { "8000/tcp" = {}; };
    };

    backend-worker = mkBackendContainer {
      name = "tristan-backend-worker";
      cmd = "celery -A analyzer:celery_app worker -E -l INFO";
    };
  }
