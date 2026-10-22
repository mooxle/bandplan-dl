/* Bandplan DL – Daten
   Alle Frequenzen in kHz. Quellen und Datenmodell: docs/DATA.md.
   Nach Änderungen: node tools/validate.mjs */

const S=(lo,hi,k,l)=>({lo,hi,k,l});      // Segment: [lo, hi) mit Art k und Bezeichnung l
const M=(f,t,l,mode)=>({f,t,l,mode});    // Marke: Frequenz f, Typ t (ft8|call|notfunk|bake|qrp|info), bei call die Betriebsart

/* Segmentarten. ex = keine eigene Simplex-Nutzung (schraffiert), modes = für welche Betriebsart das Segment relevant ist */
const KINDS={
  cw:{n:'CW',c:'--k-cw',modes:['cw']},
  schmal:{n:'Schmalband · Digimodes',c:'--k-digi',modes:['cw','ft8']},
  auto:{n:'Digimodes · automatische Stationen',c:'--k-digi',modes:['cw']},
  ssb:{n:'Alle Modes · Phonie (SSB)',c:'--k-ssb',modes:['ssb','cw']},
  allmode:{n:'All Mode inkl. FM',c:'--k-all',modes:['ssb','cw','fm']},
  fm:{n:'FM Simplex',c:'--k-fm',modes:['fm']},
  relais:{n:'Relais · kein Simplex',c:'--k-ex',ex:true},
  daten:{n:'Daten · keine Sprache',c:'--k-ex',ex:true},
  andere:{n:'Sonstige Nutzung',c:'--k-ex',ex:true},
  guard:{n:'Schutzband',c:'--k-ex',ex:true},
  bake:{n:'Baken · nicht senden',c:'--k-bake',ex:true},
  sat:{n:'Satellit · kein Erdfunk',c:'--k-sat',ex:true}
};
const MODES=[{id:'cw',n:'CW',c:'--k-cw'},{id:'ssb',n:'SSB',c:'--k-ssb'},{id:'ft8',n:'FT8',c:'--k-digi'},{id:'fm',n:'FM',c:'--k-fm'}];

/* cls: Leistung je Lizenzklasse laut AFuV Anlage 1; fehlende Klasse = Band nicht zugelassen */
const BANDS=[
{id:'160',name:'160 m',g:'KW',lo:1810,hi:2000,cls:{A:'750 / 75 / 10 W PEP',E:'100 / 75 / 10 W PEP'},
 segs:[S(1810,1838,'cw','CW'),S(1838,1840,'schmal','Schmalband'),S(1840,1843,'schmal','Digimodes'),S(1843,2000,'ssb','Alle Modes · SSB')],
 mk:[M(1836,'qrp','CW QRP'),M(1840,'ft8','FT8')],
 notes:['Leistung: 1810–1850 kHz A 750 W / E 100 W · 1850–1890 kHz 75 W · 1890–2000 kHz 10 W. Am Wochenende auch oberhalb 1850 kHz A 750 W / E 100 W.','1850–2000 kHz sekundär, werktags kein Contest.','Max. 2,7 kHz Bandbreite.','1907,5–1912,5 kHz (japanisches DX-Fenster) freihalten.']},
{id:'80',name:'80 m',g:'KW',lo:3500,hi:3800,cls:{A:'750 W PEP',E:'100 W PEP'},
 segs:[S(3500,3510,'cw','CW · DX-Vorrang'),S(3510,3560,'cw','CW · Contest bevorzugt'),S(3560,3570,'cw','CW'),S(3570,3580,'schmal','Digimodes (200 Hz)'),S(3580,3590,'schmal','Digimodes'),S(3590,3600,'auto','Digimodes · automatisch'),S(3600,3620,'ssb','Alle Modes · auch Digimodes'),S(3620,3775,'ssb','Alle Modes · SSB'),S(3775,3800,'ssb','SSB · DX-Vorrang')],
 mk:[M(3555,'qrp','CW QRS'),M(3560,'qrp','CW QRP'),M(3573,'ft8','FT8'),M(3630,'info','Digital Voice'),M(3690,'qrp','SSB QRP'),M(3735,'info','SSTV/Bild'),M(3760,'notfunk','Notfunk')],
 notes:[]},
{id:'60',name:'60 m',g:'KW',lo:5351.5,hi:5366.5,cls:{A:'9,14 W ERP'},
 segs:[S(5351.5,5354,'schmal','CW · Schmalband'),S(5354,5366,'ssb','Alle Modes · USB'),S(5366,5366.5,'schmal','Weak Signal (20 Hz)')],
 mk:[M(5357,'ft8','FT8')],
 notes:['Nur Klasse A, max. 9,14 W ERP (≈ 15 W EIRP), sekundär.','Kein Contest. Lange Runden besser auf 80 oder 40 m.']},
{id:'40',name:'40 m',g:'KW',lo:7000,hi:7200,cls:{A:'750 W PEP'},
 segs:[S(7000,7040,'cw','CW'),S(7040,7047,'schmal','Digimodes'),S(7047,7053,'auto','Digimodes · automatisch'),S(7053,7060,'ssb','Alle Modes · bevorzugt Digimodes'),S(7060,7175,'ssb','Alle Modes · SSB'),S(7175,7200,'ssb','SSB · DX-Vorrang')],
 mk:[M(7030,'qrp','CW QRP'),M(7070,'info','Digital Voice'),M(7074,'ft8','FT8'),M(7090,'qrp','SSB QRP'),M(7110,'notfunk','Notfunk'),M(7165,'info','SSTV/Bild')],
 notes:[]},
{id:'30',name:'30 m',g:'KW',lo:10100,hi:10150,cls:{A:'150 W PEP'},
 segs:[S(10100,10130,'cw','CW'),S(10130,10150,'schmal','Digimodes')],
 mk:[M(10116,'qrp','CW QRP'),M(10136,'ft8','FT8')],
 notes:['Kein SSB: AFuV erlaubt max. 800 Hz Bandbreite.','Sekundär, kein Contest.']},
{id:'20',name:'20 m',g:'KW',lo:14000,hi:14350,cls:{A:'750 W PEP'},
 segs:[S(14000,14060,'cw','CW · Contest bevorzugt'),S(14060,14070,'cw','CW'),S(14070,14089,'schmal','Digimodes'),S(14089,14099,'auto','Digimodes · automatisch'),S(14099,14101,'bake','IBP-Baken'),S(14101,14112,'auto','Digimodes · automatisch'),S(14112,14125,'ssb','Alle Modes'),S(14125,14300,'ssb','Alle Modes · SSB'),S(14300,14350,'ssb','Alle Modes')],
 mk:[M(14055,'qrp','CW QRS'),M(14060,'qrp','CW QRP'),M(14074,'ft8','FT8'),M(14100,'bake','IBP-Bake'),M(14130,'info','Digital Voice'),M(14195,'info','DXpeditionen ±5'),M(14230,'info','SSTV/Bild'),M(14285,'qrp','SSB QRP'),M(14300,'notfunk','Notfunk (global)')],
 notes:['14 190–14 200 kHz bei DXpeditionen freihalten.']},
{id:'17',name:'17 m',g:'KW',lo:18068,hi:18168,cls:{A:'750 W PEP'},
 segs:[S(18068,18095,'cw','CW'),S(18095,18105,'schmal','Digimodes'),S(18105,18109,'auto','Digimodes · automatisch'),S(18109,18111,'bake','IBP-Baken'),S(18111,18120,'auto','Digimodes · automatisch'),S(18120,18168,'ssb','Alle Modes · SSB')],
 mk:[M(18086,'qrp','CW QRP'),M(18100,'ft8','FT8'),M(18110,'bake','IBP-Bake'),M(18130,'qrp','SSB QRP'),M(18150,'info','Digital Voice'),M(18160,'notfunk','Notfunk')],
 notes:['Contestfreies Band.']},
{id:'15',name:'15 m',g:'KW',lo:21000,hi:21450,cls:{A:'750 W PEP',E:'100 W PEP'},
 segs:[S(21000,21070,'cw','CW'),S(21070,21090,'schmal','Digimodes'),S(21090,21120,'auto','Digimodes · automatisch'),S(21120,21149,'schmal','Schmalband'),S(21149,21151,'bake','IBP-Baken'),S(21151,21450,'ssb','Alle Modes · SSB')],
 mk:[M(21055,'qrp','CW QRS'),M(21060,'qrp','CW QRP'),M(21074,'ft8','FT8'),M(21150,'bake','IBP-Bake'),M(21180,'info','Digital Voice'),M(21285,'qrp','SSB QRP'),M(21340,'info','SSTV/Bild'),M(21360,'notfunk','Notfunk (global)')],
 notes:[]},
{id:'12',name:'12 m',g:'KW',lo:24890,hi:24990,cls:{A:'750 W PEP'},
 segs:[S(24890,24915,'cw','CW'),S(24915,24925,'schmal','Digimodes'),S(24925,24929,'auto','Digimodes · automatisch'),S(24929,24931,'bake','IBP-Baken'),S(24931,24940,'auto','Digimodes · automatisch'),S(24940,24990,'ssb','Alle Modes · SSB')],
 mk:[M(24906,'qrp','CW QRP'),M(24915,'ft8','FT8'),M(24930,'bake','IBP-Bake'),M(24950,'qrp','SSB QRP'),M(24960,'info','Digital Voice')],
 notes:['Contestfreies Band.']},
{id:'10',name:'10 m',g:'KW',lo:28000,hi:29700,cls:{A:'750 W PEP',E:'100 W PEP',N:'10 W ERP'},
 segs:[S(28000,28070,'cw','CW'),S(28070,28120,'schmal','Digimodes'),S(28120,28150,'auto','Digimodes · automatisch'),S(28150,28190,'schmal','Schmalband'),S(28190,28225,'bake','IBP- und Dauerbaken'),S(28225,28300,'bake','Bakenbereich (alle Modes)'),S(28300,28320,'auto','Digimodes · automatisch'),S(28320,29000,'ssb','Alle Modes · SSB'),S(29000,29100,'allmode','Alle Modes · auch AM/FM'),S(29100,29200,'fm','FM Simplex · 10-kHz-Raster'),S(29200,29300,'auto','Digimodes · automatisch'),S(29300,29510,'sat','Satelliten'),S(29510,29520,'guard','Schutzkanal'),S(29520,29590,'relais','Relais-Eingaben RH1–RH8'),S(29590,29605,'fm','FM-Anrufkanal'),S(29605,29615,'relais','Simplex-Papagei 29,610'),S(29615,29700,'relais','Relais-Ausgaben RH1–RH8')],
 mk:[M(28055,'qrp','CW QRS'),M(28060,'qrp','CW QRP'),M(28074,'ft8','FT8'),M(28200,'bake','IBP-Bake'),M(28330,'info','Digital Voice'),M(28360,'qrp','SSB QRP'),M(28680,'info','SSTV/Bild'),M(29600,'call','FM-Anruf','fm')],
 notes:['Klasse N: ganzes Band, max. 10 W ERP.','Bandbreite: unter 29 MHz max. 7 kHz, darüber max. 40 kHz.','USB unterhalb 29 MHz; FM ab 29 MHz (NBFM, Relaisablage −100 kHz).']},
{id:'6',name:'6 m',g:'UKW',lo:50000,hi:52000,cls:{A:'750 / 25 W PEP'},
 segs:[S(50000,50030,'bake','Synchron-Baken'),S(50030,50100,'cw','CW exklusiv'),S(50100,50130,'ssb','SSB/CW · Interkontinental'),S(50130,50200,'ssb','SSB/CW · International'),S(50200,50300,'ssb','SSB/CW · allgemein'),S(50300,50400,'schmal','MGM · Digimodes'),S(50400,50500,'bake','Baken exklusiv'),S(50500,50700,'allmode','All Mode · Digital'),S(50700,50900,'relais','Relais-Ausgaben'),S(50900,51200,'andere','Breitband-Experimente'),S(51200,51400,'relais','Relais-Eingaben'),S(51400,51600,'fm','FM/DV Simplex'),S(51600,51800,'allmode','All Mode'),S(51800,52000,'relais','Relais-Ausgaben')],
 mk:[M(50050,'info','CW-Zentrum'),M(50090,'info','CW DX'),M(50110,'info','DX-Anruf, nicht innerhalb EU'),M(50150,'call','SSB-Anruf','ssb'),M(50313,'ft8','FT8'),M(50630,'info','DV-Anruf'),M(51510,'call','FM-Anruf','fm')],
 notes:['Nur Klasse A, sekundär.','50,0–50,4 MHz: 750 W PEP · 50,4–52 MHz: 25 W PEP.','Nur ortsfeste Stationen, nur horizontale Polarisation, max. 12 kHz Bandbreite.']},
{id:'2',name:'2 m',g:'UKW',lo:144000,hi:146000,cls:{A:'750 W PEP',E:'75 W PEP',N:'6,1 W ERP'},
 segs:[S(144000,144025,'sat','Satelliten-Downlinks'),S(144025,144100,'cw','CW exklusiv'),S(144100,144150,'schmal','CW & MGM · EME'),S(144150,144400,'ssb','SSB · CW · MGM'),S(144400,144490,'bake','Baken exklusiv'),S(144490,144500,'bake','Experimentelle MGM-Baken'),S(144500,144794,'allmode','All Mode · nur Simplex'),S(144794,144962.5,'daten','Digitale Kommunikation'),S(144962.5,144975,'guard','Schutzband'),S(144975,145194,'relais','Relais-Eingaben'),S(145194,145206,'sat','Raumfahrt · ISS-Uplink'),S(145206,145562.5,'fm','FM/DV Simplex'),S(145562.5,145575,'guard','Schutzband'),S(145575,145793.5,'relais','Relais-Ausgaben'),S(145793.5,145806,'sat','Raumfahrt · ISS-Downlink'),S(145806,146000,'sat','Satelliten exklusiv')],
 mk:[M(144050,'call','CW-Anruf','cw'),M(144174,'ft8','FT8'),M(144260,'notfunk','Notfunk USB (DL)'),M(144300,'call','SSB-Anruf','ssb'),M(144500,'info','SSTV'),M(144800,'info','APRS'),M(145375,'info','DV-Anruf'),M(145500,'call','FM-Anruf','fm'),M(145500,'notfunk','Notfunk = FM-Anruf')],
 notes:['Unterhalb 144,794 MHz keine Relais.','All-Mode-Bereich 144,500–144,794: nur Simplex, keine Gateways, FM erlaubt.','FM-Raster 12,5 kHz; Relaisablage −600 kHz.','145,500 MHz ist FM-Anruf und zugleich Notfunk-Frequenz: kurz anrufen, dann auf einen freien Simplexkanal wechseln.','Notfunk in SSB liegt auf 144,260 MHz USB, nicht auf dem SSB-Anruf 144,300.']},
{id:'70',name:'70 cm',g:'UKW',lo:430000,hi:440000,cls:{A:'750 W PEP',E:'75 W PEP',N:'6,1 W ERP'},
 segs:[S(430000,432000,'relais','Relais-Eingaben (7,6 MHz) · Packet · Links'),S(432000,432100,'cw','Schmalband · CW bevorzugt'),S(432100,432400,'ssb','Schmalband · SSB · FT8'),S(432400,432500,'bake','Baken exklusiv'),S(432500,432600,'daten','APRS · Transponder'),S(432600,433000,'relais','Relais-Eingaben (2 MHz)'),S(433000,433400,'relais','Relais-Eingaben (1,6 MHz)'),S(433400,433600,'fm','FM/DV Simplex'),S(433600,434000,'daten','Digital · LoRa · Experimente'),S(434000,434600,'andere','All Mode · DATV/Digital'),S(434600,435000,'relais','Relais-Ausgaben (1,6/2 MHz)'),S(435000,438000,'sat','Satelliten'),S(438000,438650,'daten','Digitale Kommunikation · Packet'),S(438650,439600,'relais','Relais-Ausgaben (−7,6 MHz)'),S(439600,440000,'daten','Digital-Links · Funkruf')],
 mk:[M(432050,'call','CW-Anruf','cw'),M(432174,'ft8','FT8'),M(432200,'call','SSB-Anruf','ssb'),M(432500,'info','APRS'),M(433450,'info','DV-Anruf'),M(433500,'call','FM-Anruf','fm'),M(433500,'notfunk','Notfunk = FM-Anruf'),M(433775,'info','LoRa APRS'),M(439987.5,'info','POCSAG')],
 notes:['FM-Simplex im 25-kHz-Raster: 433,400–433,575 MHz.','DL-Relais meist Ausgabe 438,650–439,575 MHz, Eingabe 7,6 MHz tiefer.','435–438 MHz nur Satellitenbetrieb.','IARU führt 432,000–432,400 als einen Schmalbandbereich; CW-Zentrum 432,050.','433,500 MHz ist FM-Anruf und zugleich Notfunk-Frequenz: kurz anrufen, dann auf einen freien Simplexkanal wechseln.']},
{id:'23',name:'23 cm',g:'UKW',lo:1240000,hi:1300000,cls:{A:'750 W PEP',E:'75 W PEP'},
 segs:[S(1240000,1241000,'daten','Digitale Kommunikation · Reserve Schmalband'),S(1241000,1243250,'relais','Relais-Ausgaben RS1–RS28 · Digital'),S(1243250,1260000,'andere','ATV · Digital-ATV'),S(1260000,1270000,'sat','Satelliten'),S(1270000,1272000,'relais','Relais-Eingaben RS1–RS28 · Digital'),S(1272000,1290994,'andere','ATV · Digital-ATV'),S(1290994,1291494,'relais','FM/DV-Relais-Eingaben RM0–RM19'),S(1291494,1296000,'andere','All Modes · DATV-Relais-Eingaben'),S(1296000,1296150,'cw','CW · MGM · EME'),S(1296150,1296800,'ssb','SSB · CW · MGM'),S(1296800,1296994,'bake','Baken exklusiv'),S(1296994,1297494,'relais','FM/DV-Relais-Ausgaben RM0–RM19'),S(1297494,1298000,'fm','FM/DV Simplex SM20–SM39'),S(1298000,1299000,'allmode','All Mode · 25-kHz-Kanäle'),S(1299000,1299750,'daten','Highspeed-Daten · 5 × 150 kHz'),S(1299750,1300000,'fm','FM/DV · 8 Kanäle')],
 mk:[M(1296000,'info','EME 1296,000–1296,025'),M(1296174,'ft8','FT8'),M(1296200,'call','CW/SSB-Anruf','cw'),M(1296200,'call','CW/SSB-Anruf','ssb'),M(1296500,'info','SSTV/Bild'),M(1296600,'info','Schmalband-Daten'),M(1297500,'call','FM-Anruf','fm'),M(1297725,'info','DV-Anruf')],
 notes:['Sekundär: Primärnutzer sind Ortungsfunk und Satellitennavigation – Störungen unbedingt vermeiden.','1247–1263 MHz: max. 3,05 W ERP, dort keine fernbedienten oder automatischen Stationen (AFuV).','Bandbreite max. 2 MHz (ATV 7 bzw. 18 MHz).','Lokaler Schmalbandverkehr bei Contesten und Überreichweiten: 1296,500–1296,800 MHz.','FM-Raster 25 kHz. Relais RM: Ausgabe 1297,000–1297,475, Eingabe 6 MHz tiefer; RS: Ausgabe 1242,025–1242,700, Eingabe 28 MHz höher.','1297,900–1297,975 MHz: Simplex-Internet-Gateways.']}
];

/* FM-Bandbreite je Segment (Schlüssel = Segment-Untergrenze): n = Schmalband-FM (NBFM, ±2,5 kHz Hub), w = Breit-FM (±5 kHz) zulässig */
const FW={
  '10':{29000:['w','Breit-FM möglich · AFuV bis 40 kHz'],29100:['n','NBFM · 10-kHz-Raster'],29520:['n','NBFM · max. 6 kHz'],29590:['n','NBFM · max. 6 kHz'],29605:['n','NBFM · max. 6 kHz'],29615:['n','NBFM · max. 6 kHz']},
  '6':{50500:['n','nur NBFM · AFuV max. 12 kHz'],50700:['n','nur NBFM · AFuV max. 12 kHz'],51200:['n','nur NBFM · AFuV max. 12 kHz'],51400:['n','nur NBFM · AFuV max. 12 kHz'],51600:['n','nur NBFM · AFuV max. 12 kHz'],51800:['n','nur NBFM · AFuV max. 12 kHz']},
  '2':{144500:['w','Breit-FM möglich · bis 20 kHz'],144975:['n','NBFM · 12,5-kHz-Raster'],145206:['n','NBFM · 12,5-kHz-Raster'],145575:['n','NBFM · 12,5-kHz-Raster']},
  '23':{1290994:['w','FM bis 20 kHz Bandbreite · 25-kHz-Raster'],1296994:['w','FM bis 20 kHz Bandbreite · 25-kHz-Raster'],1297494:['w','FM bis 20 kHz Bandbreite · 25-kHz-Raster'],1298000:['w','bis 20 kHz Bandbreite · 25-kHz-Kanäle'],1299750:['w','FM bis 20 kHz Bandbreite · 25-kHz-Kanäle']},
  '70':{430000:['n','NBFM · 12,5-kHz-Raster'],433000:['n','NBFM · max. 12 kHz'],433400:['n','NBFM · 25-kHz-Raster, max. 12 kHz'],434600:['n','NBFM · 12,5-kHz-Raster'],438650:['n','NBFM · ältere Relais teils noch breit, Relaisliste prüfen']}
};

/* Grenzen der Dial-Frequenz für SSB-Sprache (IARU R1 KW-Bandplan 2020, Notes): Das Seitenband liegt bis etwa 2,7–3 kHz
   neben der angezeigten Frequenz. LSB: Dial nicht tiefer als min, sonst liegt das Signal unterhalb des Phonie-Bereichs.
   USB: Dial nicht höher als max (3 kHz unter der oberen Bandgrenze, 20–10 m; 60 m: 5363), sonst ragt es aus dem Band. */
const DIAL={
  '160':{sb:'LSB',min:1843},'80':{sb:'LSB',min:3603},'40':{sb:'LSB',min:7053},
  '60':{sb:'USB',max:5363},'20':{sb:'USB',max:14347},'17':{sb:'USB',max:18165},'15':{sb:'USB',max:21447},
  '12':{sb:'USB',max:24987},'10':{sb:'USB',max:29697}
};

if(typeof module!=='undefined') module.exports={KINDS,MODES,BANDS,FW,DIAL};
