{ poetry2nix, pkg-config, poppler }:
let
  overrides = poetry2nix.overrides.withDefaults (self: super: {
      pdftotext = super.pdftotext.overridePythonAttrs (old: {
        buildInputs = (old.buildInputs or []) ++ [ pkg-config poppler ];
      });
      celery = super.celery.overridePythonAttrs (old: {
        propagatedBuildInputs = (old.propagatedBuildInputs or [ ]) ++ [ self.setuptools ];
      });
      click-didyoumean = super.click-didyoumean.overridePythonAttrs (old: {
        buildInputs = (old.buildInputs or []) ++ [ self.poetry ];
      });
      jsonschema = super.jsonschema.overridePythonAttrs (old: {
        buildInputs = (old.buildInputs or []) ++ [ self.hatchling ];
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
