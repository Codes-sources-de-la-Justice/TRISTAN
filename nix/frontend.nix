{ npmlock2nix, lib, projectSrc }:
{
  dependencies = npmlock2nix.node_modules {
    src = projectSrc;
  };
  production-bundle = npmlock2nix.build {
    src = projectSrc;
    node_modules_attrs = {
      PUPPETEER_SKIP_DOWNLOAD = "1";
    };
    installPhase = "cp -r src/frontend/dist $out";
    buildCommands = [ "npm run build" ];
  };
}
