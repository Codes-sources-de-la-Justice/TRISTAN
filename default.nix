{ pkgs ? import <nixpkgs> { } }:
let
  env = pkgs.poetry2nix.mkPoetryEnv {
    projectDir = ./.;
    overrides = pkgs.poetry2nix.overrides.withDefaults (self: super: {
      pdftotext = super.pdftotext.overridePythonAttrs (old: {
        buildInputs = (old.buildInputs or []) ++ (with pkgs; [ pkg-config poppler ]);
      });

      pymupdf = super.pymupdf.overrideAttrs (old: {
        postPatch = ''
          substituteInPlace setup.py \
          --replace '/usr/include/mupdf' ${pkgs.mupdf.dev}/include/mupdf
        '';
        nativeBuildInputs = [ pkgs.swig ];
      });
    });
  };
  jsDeps = pkgs.yarn2nix-moretea.mkYarnModules {
    pname = "tristan-frontend";
    version = "0.1.0";
    packageJSON = ./package.json;
    yarnLock = ./yarn.lock;
    yarnNix = ./yarn.nix;
  };
in {
  shell = with pkgs;
    mkShell {
      buildInputs = [ env yarn2nix yarn nodejs yq nodePackages.json-server ];
      DJANGO_SETTINGS_MODULE = "common.settings";
      # node_modules = "${jsDeps}/node_modules";
      CACHE_DIR = "/var/cache/";
      /* shellHook = ''
        # ${yarn2nix-moretea.linkNodeModulesHook}
      '' ; */
    };
}
