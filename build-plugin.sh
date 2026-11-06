#!/usr/bin/env bash
# Builds the Astro site and packages it as an installable WordPress plugin zip.
set -euo pipefail
cd "$(dirname "$0")"
WP_BUILD=1 npm run build
rm -rf wp-plugin/aa30-home/dist wp-plugin/aa30-home/_astro
cp dist/index.html wp-plugin/aa30-home/ 2>/dev/null || true
mkdir -p wp-plugin/aa30-home/dist
cp dist/index.html wp-plugin/aa30-home/dist/index.html
cp -R dist/_astro wp-plugin/aa30-home/_astro
rm -f wp-plugin/aa30-home/index.html
(cd wp-plugin && rm -f ../aa30-home.zip && zip -qr ../aa30-home.zip aa30-home)
echo "Built aa30-home.zip"
