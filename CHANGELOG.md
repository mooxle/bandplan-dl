# Changelog

Alle nennenswerten Änderungen an Bandplan DL. Versionen nach [Semantic Versioning](https://semver.org/lang/de/): Patch für Korrekturen (auch an Bandplan-Daten), Minor für neue Funktionen, Major für grundlegende Umbauten.

## [1.2.0] - 2026-10-22
### Neu
- Dial-Grenzen für SSB-Sprache nach IARU-R1-KW-Bandplan: höchste USB-Dial-Frequenz 3 kHz unter der oberen Bandgrenze (20 m 14,347 · 17 m 18,165 · 15 m 21,447 · 12 m 24,987 · 10 m 29,697 MHz; 60 m 5,363 MHz), tiefste LSB-Dial-Frequenz wie bisher (1,843 · 3,603 · 7,053 MHz). Sichtbar als gestrichelte Marke in der Frequenzleiter, unter „Hier kannst du funken“ und im Spickzettel; der Frequenz-Check warnt, wenn das Signal über die Bandgrenze bzw. unter den Phonie-Bereich ragen würde. Danke an Heinz, DK5UR, für die Anregung („Wie oft sieht man Kollegen auf 14.350 …“).

### Geändert
- Die Dial-Hinweise stehen jetzt als Daten (`DIAL` in `assets/data.js`, von `tools/validate.js` geprüft) statt als Freitext in den Band-Hinweisen; leere Hinweis-Karten werden ausgeblendet.

## [1.1.0] - 2026-10-22
### Neu
- Eigenes Icon: Bandbalken aus vier farbigen Segmenten mit Frequenz-Zeiger, als Favicon (SVG), Apple-Touch-Icon für den Homescreen und als Marke vor dem Schriftzug im Kopf von Seite und Impressum. Ersetzt das bisherige Platzhalter-Favicon. Design, Farben und Pflege: [`docs/ICON.md`](docs/ICON.md).

### Geändert
- Cache-Busting im Build gilt jetzt auch für SVG- und PNG-Dateien in `assets/`.
- Bandleiste: Der aktive Band-Chip wird jetzt mittig gezeigt und die Leiste nur noch waagerecht gescrollt. Vorher konnte `scrollIntoView` je nach Umgebung die ganze Seite senkrecht verschieben.

## [1.0.0] - 2026-10-21
Erstes Release.

### Funktionen
- Interaktiver Bandplan für 160 m bis 10 m, 6 m, 2 m und 70 cm nach IARU Region 1 (KW-Plan 2020, VHF Handbook 10.03), Klassen und Leistungen nach AFuV Anlage 1.
- Filter nach Lizenzklasse (A, E, N) und Betriebsart (CW, SSB, FT8, FM). Nicht zugelassene Bänder sind durchgestrichen.
- Frequenzleiter pro Band mit schraffierten Relais-, Baken-, Satelliten- und Datenbereichen, Notfunk-, Anruf- und FT8-Frequenzen sowie NBFM-/Breit-FM-Kennung.
- „Hier kannst du funken“ pro Betriebsart, Spickzettel aller Bänder (druckbar auf A4).
- Frequenz-Check für kHz, MHz und Hz mit Warnung vor Notfunk- und Bakenfrequenzen.
- Direktlinks (`#40`, `#f=7.074`, `#spick`).
- Kopfbereich wie bei MUF Muncher: UTC-Uhr mit Datum und Ortszeit, Hell/Dunkel-Umschalter, Version mit Link zum Quellcode.

### Betrieb
- Statische Seite ohne Abhängigkeiten zu Dritten: Schriften selbst gehostet, keine Cookies, kein Tracking, strenge CSP.
- Produktion auf Cloudflare Pages, automatischer Deploy bei jedem Push auf `main` (GitHub Actions), vorher Datenprüfung mit `tools/validate.js`.
- Docker-Image (nginx, non-root) für den eigenen Betrieb.
- Cache-Busting per Inhalts-Hash an jeder JS/CSS-Referenz, Build-Stempel (Commit und Datum) im Footer.

[1.2.0]: https://github.com/mooxle/bandplan-dl/releases/tag/v1.2.0
[1.1.0]: https://github.com/mooxle/bandplan-dl/releases/tag/v1.1.0
[1.0.0]: https://github.com/mooxle/bandplan-dl/releases/tag/v1.0.0
