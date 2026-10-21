#!/bin/sh
# Baut die auslieferbare Seite nach <Zielordner> (Standard: dist): nur index.html, impressum.html und assets/.
# Genutzt vom Dockerfile und vom Cloudflare-Pages-Workflow (.github/workflows/deploy.yml).
#
# Cache-Busting: jede Referenz auf assets/*.js und assets/*.css in den HTML-Dateien bekommt ?v=<Hash des Inhalts>.
# Hintergrund (21.10.2026): Cloudflare setzt für .js/.css einen Browser-Cache von 4 Stunden, unabhängig von den
# Cache-Headern des Servers -- Safari zeigte dadurch ein neues index.html mit altem app.js. Mit dem Hash in der URL
# holt jeder Browser nach einem Deploy sofort die passende Datei.
set -eu

out=${1:-dist}
cd "$(dirname "$0")/.."

rm -rf "$out"
mkdir -p "$out"
cp index.html impressum.html "$out/"
cp -R assets "$out/assets"

hash8() {
  if command -v md5sum >/dev/null 2>&1; then md5sum "$1" | cut -c1-8; else md5 -q "$1" | cut -c1-8; fi
}

for f in "$out"/assets/*.js "$out"/assets/*.css; do
  rel=${f#"$out"/}
  h=$(hash8 "$f")
  for html in "$out/index.html" "$out/impressum.html"; do
    sed "s#\"$rel\"#\"$rel?v=$h\"#g" "$html" > "$html.tmp" && mv "$html.tmp" "$html"
  done
done

# jede lokale Asset-Referenz muss jetzt einen Hash tragen
if grep -E -o '"assets/[^"?]+\.(js|css)"' "$out/index.html" "$out/impressum.html"; then
  echo "build.sh: Asset-Referenz ohne ?v= gefunden (siehe oben)" >&2
  exit 1
fi
echo "build.sh: $out fertig ($(grep -o '?v=' "$out/index.html" "$out/impressum.html" | wc -l | tr -d ' ') Asset-Referenzen versioniert)"
