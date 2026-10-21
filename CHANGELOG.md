# Changelog

Alle nennenswerten Änderungen an Bandplan DL. Versionen nach [Semantic Versioning](https://semver.org/lang/de/): Patch für Korrekturen (auch an Bandplan-Daten), Minor für neue Funktionen, Major für grundlegende Umbauten.

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

[1.0.0]: https://github.com/mooxle/bandplan-dl/releases/tag/v1.0.0
