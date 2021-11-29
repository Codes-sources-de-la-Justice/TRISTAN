{ yarn2nix-moretea }:
{
  dependencies = yarn2nix-moretea.mkYarnModules {
    pname = "tristan-frontend";
    packageJSON = ../package.json;
    yarnLock = ../yarn.lock;
    yarnNix = ../yarn.nix;
  };
}
