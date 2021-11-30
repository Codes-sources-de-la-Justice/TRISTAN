{ yarn2nix-moretea, lib }:
{
  dependencies = yarn2nix-moretea.mkYarnModules {
    pname = "tristan-frontend";
    packageJSON = ../package.json;
    yarnLock = ../yarn.lock;
    yarnNix = ../yarn.nix;
  };
  production-bundle = yarn2nix-moretea.mkYarnPackage {
    pname = "tristan-frontend";
    src = lib.cleanSourceWith {
      filter = name: type: let baseName = baseNameOf (toString name); in ! (baseName == "state" || baseName == "node_modules");
      src = lib.cleanSource ../.;
    };
    yarnNix = ./yarn.nix;

    installPhase = ''
      yarn build
    '';
  };
}
