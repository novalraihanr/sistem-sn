{
	description = "Laravel + Next.js dev environment";

	inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

	outputs = { self, nixpkgs }:
	let
		system = "x86_64-linux";
		pkgs = nixpkgs.legacyPackages.${system};
	in {
		devShells.${system}.default = pkgs.mkShell {
			buildInputs = [
				# Backend - Laravel
				pkgs.php83
				pkgs.php83Packages.composer
				pkgs.phpactor

				# Frontend - Next.js
				pkgs.nodejs_22
				pkgs.pnpm

				pkgs.unzip
				pkgs.gnumake
			];

			shellHook = ''
				echo "Dev shell loaded ✅"
				echo "PHP:	$(php -v | head -n1)"
				echo "Composer:	$(composer --version)"
				echo "Node:	$(node -v)"
				echo "PNPM:	$(pnpm -v)"
			'';
		};
	};
}
