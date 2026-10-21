# Statische Seite mit nginx (non-root, Port 8080). Nur index.html, impressum.html und assets/ landen im Image.
FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html impressum.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/

# Cache-Busting: jede Asset-URL in den HTML-Dateien bekommt ?v=<Hash des Dateiinhalts>. Hintergrund (21.10.2026): ein
# vorgeschalteter CDN/Proxy (Cloudflare) setzt für .js/.css einen Browser-Cache von 4 Stunden, unabhängig vom
# "Cache-Control: no-cache" dieses nginx -- Safari zeigte dadurch ein neues index.html mit altem app.js. Mit dem Hash in
# der URL holt jeder Browser nach einem Deploy sofort die passende Datei; die HTML selbst wird weiter bei jedem Laden
# per ETag revalidiert. Läuft beim Build (als root), zur Laufzeit ist das Dateisystem read-only.
USER root
RUN cd /usr/share/nginx/html \
 && for f in assets/app.js assets/data.js assets/theme.js assets/app.css assets/fonts.css; do \
      h=$(md5sum "$f" | cut -c1-8); \
      sed -i "s#\"$f\"#\"$f?v=$h\"#g" index.html impressum.html; \
    done \
 && grep -c '?v=' index.html impressum.html
USER 101
