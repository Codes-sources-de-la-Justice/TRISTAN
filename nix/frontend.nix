{ npmlock2nix, lib, src }:
{
  dependencies = npmlock2nix.node_modules {
    inherit src;
  };
  production-bundle = npmlock2nix.build {
    inherit src;
    node_modules_attrs = {
      PUPPETEER_SKIP_DOWNLOAD = "1";
    };
    installPhase = "cp -r src/frontend/dist $out";
    buildCommands = [ "npm run build" ];
  };
}
