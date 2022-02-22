let
  sources = import ./sources.nix;
in
  (self: super: {
    npmlock2nix = super.callPackage sources.npmlock2nix { };
  })
