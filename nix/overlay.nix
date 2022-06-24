let
  sources = import ./sources.nix;
in
  (self: super: {
    poetry2nix = super.callPackage sources.poetry2nix { };
    npmlock2nix = super.callPackage sources.npmlock2nix { };
  })
