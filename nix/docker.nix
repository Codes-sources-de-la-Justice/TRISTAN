{ thttpd, dockerTools, callPackage, projectSrc }:
let
  frontend = callPackage ./frontend.nix { inherit projectSrc; };
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
    # TODO: use other users than root.
    frontend-static = dockerTools.buildLayeredImage {
      name = "tristan-static-frontend";
      contents = [ ];
      config = {
        Cmd = "${thttpd}/bin/thttpd -D -h 0.0.0.0 -p 3000 -d ${frontend.production-bundle} -l - -M 60";
        ExposedPorts = { "3000/tcp" = {}; };
      };
    };

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
