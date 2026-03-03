{
  description = "Anki PWA - A progressive web app for flashcards";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages.default = pkgs.buildNpmPackage {
          pname = "anki-pwa";
          version = "0.1.0";
          src = ./.;

          npmDepsHash = "sha256-cvrYuQYGuz3il5mflTfvmGJbt36nGcQI7nDIsoT2ud8=";

          npmFlags = [ "--ignore-scripts" ];

          env = {
            GITHUB_REPOSITORY = "only1thor/anki-pwa";
            NODE_ENV = "production";
          };

          buildPhase = ''
            runHook preBuild
            export PATH="$PWD/node_modules/.bin:$PATH"
            tsc && vite build
            runHook postBuild
          '';

          installPhase = ''
            runHook preInstall
            cp -r dist $out
            runHook postInstall
          '';
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_20
            nodePackages.npm
            nodePackages.typescript
            nodePackages.typescript-language-server
          ];

          shellHook = ''
            echo "🚀 Anki PWA Development Environment"
            echo "Node version: $(node --version)"
            echo "NPM version: $(npm --version)"
            echo ""
            echo "Available commands:"
            echo "  npm install    - Install dependencies"
            echo "  npm run dev    - Start development server"
            echo "  npm run build  - Build for production"
            echo "  npm run preview - Preview production build"
            echo ""
          '';
        };
      }
    );
}
