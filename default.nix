{ pkgs ? import <nixpkgs> { } }:
let
  env = pkgs.poetry2nix.mkPoetryEnv {
    projectDir = ./.;
    overrides = pkgs.poetry2nix.overrides.withDefaults (self: super: {
      pymupdf = super.pymupdf.overrideAttrs (old: {
        postPatch = ''
          substituteInPlace setup.py \
          --replace '/usr/include/mupdf' ${pkgs.mupdf.dev}/include/mupdf
        '';
        nativeBuildInputs = [ pkgs.swig ];
      });
    });
  };
in {
  shell = with pkgs;
    mkShell {
      buildInputs = [ env yarn2nix yarn nodejs ];
      DJANGO_SETTINGS_MODULE = "common.settings";
    };
}
