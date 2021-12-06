let
  sources = import ./sources.nix;
in
  import <nixpkgs> {
    overlays = [
      (self: super: {
        npmlock2nix = super.callPackage sources.npmlock2nix { };
      })
    ];
  }
