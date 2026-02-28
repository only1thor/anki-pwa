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
