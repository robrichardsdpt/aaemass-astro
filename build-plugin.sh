#!/usr/bin/env bash
# Builds the Astro site for WordPress and packages it as the installable aa30-home plugin (aa30-home.zip).
#
#   ./build-plugin.sh                 pages live under /a30-preview/
#   WP_PREFIX=my-secret ./build-plugin.sh   pick another private prefix
#
# The build is always noindex, has an empty sitemap, and sends its forms to the plugin's own
# endpoints (/wp-json/aa30/v1/...), so no API key is needed anywhere.
set -euo pipefail
cd "$(dirname "$0")"

PREFIX="${WP_PREFIX:-a30-preview}"
if ! [[ "$PREFIX" =~ ^[A-Za-z0-9._~-]+$ ]] || [[ "$PREFIX" == "." || "$PREFIX" == ".." ]]; then
  echo "WP_PREFIX may only contain letters, numbers, dots, dashes, underscores and tildes." >&2
  exit 1
fi

export WP_BUILD=1 WP_PREFIX="$PREFIX" PUBLIC_NOINDEX=1 PUBLIC_FORMS_ENDPOINT=/wp-json/aa30/v1
npm run build

PLUGIN=wp-plugin/aa30-home
rm -rf "$PLUGIN/dist" "$PLUGIN/_astro" "$PLUGIN/index.html"
mkdir -p "$PLUGIN/dist"
cp -R dist/. "$PLUGIN/dist/"
# The CMS login page has no use inside WordPress and would only add surface.
rm -rf "$PLUGIN/dist/admin"
printf '%s\n' "$PREFIX" > "$PLUGIN/prefix.txt"

(cd wp-plugin && rm -f ../aa30-home.zip && zip -qr ../aa30-home.zip aa30-home -x '*.DS_Store')
echo "Built aa30-home.zip. After installing, the site is at /$PREFIX/"
