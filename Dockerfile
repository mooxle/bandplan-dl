# Statische Seite mit nginx (non-root, Port 8080). tools/build.sh erzeugt die Auslieferung (index.html, impressum.html,
# assets/ mit ?v=<Hash> an jeder JS/CSS-Referenz, siehe Kommentar dort) -- dasselbe Skript wie beim Cloudflare-Pages-Deploy.
FROM nginxinc/nginx-unprivileged:1.28-alpine AS build
USER root
WORKDIR /src
COPY . .
RUN sh tools/build.sh /out

FROM nginxinc/nginx-unprivileged:1.28-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /out/ /usr/share/nginx/html/
