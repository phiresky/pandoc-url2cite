{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  outputs = { self, nixpkgs, flake-utils }:
    (flake-utils.lib.eachDefaultSystem (system: let
        pkgs = nixpkgs.legacyPackages.${system};
        pkgJson = pkgs.lib.importJSON ./package.json;
        # Build package with yarn
        # (then fix up shebangs for nix-friendliness)
        jsExe = pkgs.mkYarnPackage {
          src = ./.;
          buildPhase = ''
            yarn --offline build
            chmod +x deps/${pkgJson.name}/dist/${pkgJson.name}.js
            patchShebangs --host deps/${pkgJson.name}/dist/
          '';
        };
      in {
        # What 'nix build' builds by default, and what 'nix shell' puts into PATH
        packages.default = jsExe;
      }
    ));
}
