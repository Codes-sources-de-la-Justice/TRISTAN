{ poetry2nix }:
let
  overrides = poetry2nix.overrides.withDefaults (self: super: {
      pdftotext = super.pdftotext.overridePythonAttrs (old: {
        buildInputs = (old.buildInputs or []) ++ (with pkgs; [ pkg-config poppler ]);
      });
    });
in
  {
    env = poetry2nix.mkPoetryEnv {
      projectDir = ../.;
      inherit overrides;
    };
  }
