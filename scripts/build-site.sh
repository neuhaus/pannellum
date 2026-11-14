#!/bin/sh
#
# Build the minified viewer and assemble the GitHub Pages site in _site/:
# the built files under build/, the bundled examples and the source they use,
# plus the landing page. Run with ./scripts/build-site.sh from anywhere.
#
# The examples reference each other with relative paths, so the layout below
# keeps build/, examples/ and src/ as siblings, matching the repository root.
#
set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
SITE="$ROOT/_site"

# Build build/pannellum.{htm,js,css} and build/pannellum.xr.js.
(cd "$ROOT/utils/build" && ./build.sh)

# Version shown on the landing page (the release build embeds the same value
# in the built files' headers).
version=$(git -C "$ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)

rm -rf "$SITE"
mkdir -p "$SITE"

for f in build examples src; do
    cp -R "$ROOT/$f" "$SITE/"
done

sed "s/@VERSION@/$version/g" "$ROOT/index.html" > "$SITE/index.html"

echo "wrote $SITE (version $version)"
