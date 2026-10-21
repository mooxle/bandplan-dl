# Statische Seite mit nginx (non-root, Port 8080). Nur index.html, impressum.html und assets/ landen im Image.
FROM nginxinc/nginx-unprivileged:1.28-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html impressum.html /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
