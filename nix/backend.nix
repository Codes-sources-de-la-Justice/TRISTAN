{ poetry2nix, pkg-config, poppler }:
let
  overrides = poetry2nix.overrides.withDefaults (self: super: {
      pdftotext = super.pdftotext.overridePythonAttrs (old: {
        buildInputs = (old.buildInputs or []) ++ [ pkg-config poppler ];
      });
    });
in
  {
    # With development dependencies
    env = poetry2nix.mkPoetryEnv {
      projectDir = ../.;
      inherit overrides;
    };

    # Non-development dependencies
    app = poetry2nix.mkPoetryApplication {
      projectDir = ../.;
      inherit overrides;
    };
  }
