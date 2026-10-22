#!/usr/bin/env node
/* Konsistenzprüfung für assets/data.js: node tools/validate.js
   Prüft: Segmente lückenlos und aufsteigend über das ganze Band, bekannte Segmentarten,
   Marken innerhalb des Bandes, FW-Schlüssel passen zu einer Segment-Untergrenze, Klassen gültig,
   DIAL-Grenzen (SSB-Sprache) im Band und mit passendem Seitenband. */
const path=require('path');
const {KINDS,BANDS,FW,DIAL}=require(path.join(__dirname,'..','assets','data.js'));

const errors=[];
const err=(b,msg)=>errors.push(`${b}: ${msg}`);
const ids=new Set();

for(const b of BANDS){
  if(ids.has(b.id)) err(b.id,'doppelte Band-ID');
  ids.add(b.id);
  if(!(b.lo<b.hi)) err(b.id,`lo ${b.lo} >= hi ${b.hi}`);
  if(!Object.keys(b.cls).length) err(b.id,'keine Lizenzklasse');
  for(const c of Object.keys(b.cls)) if(!['A','E','N'].includes(c)) err(b.id,`unbekannte Klasse ${c}`);

  let pos=b.lo;
  for(const s of b.segs){
    if(!KINDS[s.k]) err(b.id,`unbekannte Segmentart "${s.k}" bei ${s.lo}`);
    if(Math.abs(s.lo-pos)>1e-6) err(b.id,`Lücke/Überlappung: erwartet ${pos}, Segment beginnt bei ${s.lo}`);
    if(!(s.lo<s.hi)) err(b.id,`leeres Segment ${s.lo}–${s.hi}`);
    pos=s.hi;
  }
  if(Math.abs(pos-b.hi)>1e-6) err(b.id,`Segmente enden bei ${pos}, Band bei ${b.hi}`);

  for(const m of b.mk){
    if(m.f<b.lo||m.f>b.hi) err(b.id,`Marke ${m.l} (${m.f}) außerhalb des Bandes`);
    if(m.t==='call'&&!['cw','ssb','fm'].includes(m.mode)) err(b.id,`Anrufmarke ${m.f} ohne Betriebsart`);
  }
}

for(const [id,map] of Object.entries(FW)){
  const b=BANDS.find(x=>x.id===id);
  if(!b){err(id,'FW für unbekanntes Band');continue}
  for(const [lo,[w]] of Object.entries(map)){
    if(!b.segs.some(s=>s.lo===Number(lo))) err(id,`FW-Schlüssel ${lo} ist keine Segment-Untergrenze`);
    if(!['n','w'].includes(w)) err(id,`FW-Typ "${w}" bei ${lo}`);
  }
}

for(const [id,d] of Object.entries(DIAL)){
  const b=BANDS.find(x=>x.id===id);
  if(!b){err(id,'DIAL für unbekanntes Band');continue}
  if(d.sb==='LSB'&&!(d.min>b.lo&&d.min<b.hi)) err(id,`DIAL LSB min ${d.min} nicht im Band`);
  else if(d.sb==='USB'&&!(d.max>b.lo&&d.max<b.hi)) err(id,`DIAL USB max ${d.max} nicht im Band`);
  else if(!['LSB','USB'].includes(d.sb)) err(id,`DIAL-Seitenband "${d.sb}"`);
}

if(errors.length){console.error(errors.join('\n'));console.error(`\n${errors.length} Fehler`);process.exit(1)}
console.log(`OK: ${BANDS.length} Bänder, ${BANDS.reduce((n,b)=>n+b.segs.length,0)} Segmente, ${BANDS.reduce((n,b)=>n+b.mk.length,0)} Marken`);
