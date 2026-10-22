# Datenmodell und Quellen

Alle Daten stehen in [`assets/data.js`](../assets/data.js). Frequenzen sind in **kHz** angegeben (`144500` = 144,500 MHz). Die Datei läuft unverändert im Browser und in Node (`module.exports` am Ende, für `tools/validate.js`).

## Strukturen

### `BANDS[]`

| Feld | Bedeutung |
|---|---|
| `id` | Kurzname, zugleich Direktlink (`#40`) |
| `name` | Anzeigename (`"40 m"`), Zahl und Einheit durch Leerzeichen getrennt |
| `g` | Gruppe in der Bandleiste: `KW` oder `UKW` |
| `lo`, `hi` | Bandgrenzen laut AFuV |
| `cls` | Leistung je Lizenzklasse, z. B. `{A:'750 W PEP', E:'100 W PEP'}`. Fehlt eine Klasse, ist das Band für sie nicht zugelassen. |
| `segs[]` | Segmente `S(lo, hi, kind, label)`, aufsteigend und lückenlos von `lo` bis `hi`. Intervall ist `[lo, hi)`. |
| `mk[]` | Marken `M(f, typ, label, mode?)` |
| `notes[]` | Freitext-Hinweise für die Seitenleiste |

### Segmentarten (`KINDS`)

| Art | Bedeutung | gilt für Betriebsart |
|---|---|---|
| `cw` | CW | CW |
| `schmal` | Schmalband / Digimodes | CW, FT8 |
| `auto` | Digimodes, automatische Stationen | CW |
| `ssb` | Alle Modes, Phonie | SSB, CW |
| `allmode` | All Mode inkl. FM | SSB, CW, FM |
| `fm` | FM Simplex | FM |
| `relais`, `daten`, `andere`, `guard`, `bake`, `sat` | keine eigene Simplex-Nutzung (schraffiert) | – |

Die Zuordnung steuert, welche Segmente beim Filtern nach Betriebsart hervorgehoben bleiben und was unter „Hier kannst du funken“ erscheint (`ssb` + `allmode` → SSB-Bereiche, `fm` + `allmode` → FM-Bereiche).

### Markentypen

| Typ | Darstellung | Bemerkung |
|---|---|---|
| `ft8` | lila | FT8-Dial-Frequenz (USB) |
| `call` | orange hinterlegt | Anruffrequenz; `mode` (`cw`/`ssb`/`fm`) ist Pflicht |
| `notfunk` | rot | erscheint unter „Freihalten“, Warnung im Frequenz-Check |
| `bake` | rot umrandet | wie `notfunk` |
| `qrp`, `info` | grau | nur Information |

Der Frequenz-Check warnt bei Notfunk/Baken im Abstand von ±3 kHz (KW) bzw. ±12,5 kHz (UKW).

### `FW` – FM-Bandbreite

`FW[bandId][segmentLo] = ['n' | 'w', text]`. `n` = nur Schmalband-FM (NBFM, ±2,5 kHz Hub), `w` = Breit-FM (±5 kHz) zulässig. Schlüssel muss exakt die Untergrenze eines Segments sein (prüft `tools/validate.js`).

### `DIAL` – Dial-Grenzen für SSB-Sprache

`DIAL[bandId] = {sb:'LSB', min}` oder `{sb:'USB', max}`. Ein SSB-Signal liegt bis etwa 2,7–3 kHz neben der angezeigten Frequenz: bei LSB darunter, bei USB darüber. Deshalb nennt der IARU-R1-KW-Bandplan in seinen Notes

- die **tiefste** LSB-Dial-Frequenz: 1843, 3603, 7053 kHz (darunter läge das Signal außerhalb des Phonie-Bereichs),
- die **höchste** USB-Dial-Frequenz: 3 kHz unter der oberen Bandgrenze auf 20–10 m (14 347, 18 165, 21 447, 24 987, 29 697 kHz) und 5363 kHz auf 60 m.

Die Seite zeigt die Grenze als gestrichelte Marke in der Frequenzleiter, unter „Hier kannst du funken“ und im Spickzettel (jeweils nur bei aktivem SSB) und warnt im Frequenz-Check, wenn eine Eingabe darüber bzw. knapp darunter liegt. Die Begründung steht als „Warum?“ in der Karte „Hinweise“ des Bandes und als Tooltip auf der Marke. Angeregt von Heinz, DK5UR.

## Quellen und Stand

| Bereich | Quelle | Stand |
|---|---|---|
| KW-Segmente | IARU R1 HF Bandplan | gültig ab 16.10.2020 |
| 6 m, 2 m | IARU R1 VHF Handbook 10.03 | Feb. 2026 |
| 70 cm | IARU R1 VHF Handbook 10.03 / UHF-Bandplan 2020 | Feb. 2026 |
| 23 cm | IARU R1 VHF Handbook 10.03, Abschnitt 1200–1300 MHz | Feb. 2026 |
| Klassen, Leistungen, Bandbreiten | AFuV Anlage 1 | Fassung 2024, geprüft 21.10.2026 |
| Notfunk | DARC-Notfunkreferat | 13.09.2022 |

## Bewusste Vereinfachungen

- **23 cm:** Die drei für die Zukunft reservierten Schmalband-Teile 1240,000–1241,000 MHz (All Mode, CW/MGM/Baken, FM/DV) sind zusammen mit der dort genannten digitalen Kommunikation als ein Datensegment geführt. Die ATV-Bereiche (inkl. ATV-Relais-Ausgaben 1258,150–1259,350 und -Eingaben 1293,150–1294,350 MHz) erscheinen als „Sonstige Nutzung“. FM-Segmente sind als bis 20 kHz Bandbreite (Breit-FM zulässig) gekennzeichnet, entsprechend der IARU-Angabe. Vorgeschlagen von Nils, DB6NL.
- **70 cm, 432,000–432,400 MHz:** Die IARU führt das als einen Schmalbandbereich. Hier geteilt in „CW bevorzugt“ (bis 432,100) und „SSB/FT8“, damit die Leiter lesbarer ist.
- **Automatische Digi-Stationen** (IARU „automatically controlled data stations“) sind als `auto` unter Digimodes eingeordnet; 40 m 7,047–7,053 ist zu einem Segment zusammengefasst.
- **10 m, 28,190–28,225 MHz:** IBP-Baken (28,199–28,201) und Dauerbaken sind zu einem Bakensegment zusammengefasst.
- **160 m Leistung:** Am Wochenende gilt laut AFuV Anlage 1, Fußnote 15, auch 1850–2000 kHz A 750 W / E 100 W PEP, Conteste sind dann erlaubt. Die Klassen-Plakette zeigt die Werktagswerte.
- **60 m:** Die AFuV gibt 9,14 W ERP an; das entspricht etwa 15 W EIRP (WRC-15).
- **6 m:** Laut AFuV nur ortsfeste Stationen, horizontale Polarisation, max. 12 kHz Bandbreite – daher dort nur NBFM.

## Bekannte offene Punkte

- 70-cm-Relaisraster in DL weicht teils vom IARU-Plan ab (ältere Relais 25 kHz/Breit-FM). Die Seite verweist dafür auf die Relaisliste.
- Die 2-m-Satelliten-/ISS-Segmentgrenzen sind auf die Kanalmitten gerundet (145,194/145,206, 145,7935/145,806).
