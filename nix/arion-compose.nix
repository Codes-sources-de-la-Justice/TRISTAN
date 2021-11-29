{ pkgs, ... }:
let
  backend = pkgs.callPackage ./backend.nix {};
in
{
  config.services = {
    backend-app = {
      service.useHostStore = true;
      service.command = [
        "gunicorn"
        "api.wsgi:application"
      ];
      service.container_name = "tristan_backend_app";
      service.depends_on = [
        "postgres"
        "backend-worker"
      ];
      image.contents = [ backend.app.dependencyEnv ];
      image.name = "tristan-backend";
      service.environment = {
        DEBUG = "True";
        DJANGO_SETTINGS_MODULE = "common.settings";
        DATABASE_URL = "postgres://postgres:just1c3@postgres/tristan";
      };
    };

    backend-worker = {
      service.useHostStore = true;
      service.command = [
        "celery"
        "-A"
        "analyzer:celery_app"
        "worker"
        "-E"
        "-l"
        "INFO"
      ];
      service.container_name = "tristan_backend_worker";
      service.depends_on = [
        "redis"
        "postgres"
        "sps-api-mock"
      ];
      image.contents = [ backend.app.dependencyEnv ];
      image.name = "tristan-backend";
      service.environment = {
        REDIS_URL = "redis://redis:6379/0";
        SPS_API_URL_BASE = "http://sps-api-mock:3000";
      };
    };

    sps-api-mock = {
      service.useHostStore = true;
      service.command = [
        "${pkgs.nodePackages.json-server}/bin/json-server"
      ];
      service.container_name = "tristan_sps_api_mock";
      # TODO: finish this.
    };

    postgres = {
      service.image = "docker.io/library/postgres:14.1-alpine";
      service.volumes = [ "${toString ../state}/postgres-data:/var/lib/postgresql/data" ];
      service.environment = {
        POSTGRES_PASSWORD = "just1c3";
        POSTGRES_DB = "tristan";
      };
      service.container_name = "tristan_postgres";
    };

    redis = {
      service.image = "docker.io/library/redis:6.2.6-alpine";
      service.container_name = "tristan_redis";
    };
  };
}
