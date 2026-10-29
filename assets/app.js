/* Bandplan DL – Logik (Rendering, Frequenz-Check, Zustand). Daten kommen aus data.js. */

const VERSION='1.3.1';  // bei jedem Release erhöhen, zusammen mit CHANGELOG.md (siehe README, „Release erstellen“)

/* ---------- Helfer ---------- */
const fwOf=(b,s)=>(FW[b.id]||{})[s.lo];
const fmt=k=>{let s=(k/1000).toFixed(4);s=s.replace(/0$/,'');return s.replace('.',',')};
const rng=(a,b)=>fmt(a)+'–'+fmt(b);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const store={get(k,d){try{const v=localStorage.getItem('bp_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('bp_'+k,JSON.stringify(v))}catch(e){}}};
const $=id=>document.getElementById(id);

const state={cls:store.get('cls','A'),modes:store.get('modes',['cw','ssb','ft8','fm']),band:store.get('band','40'),view:store.get('view','band'),hit:null};
if(!['A','E','N'].includes(state.cls))state.cls='A';
state.modes=Array.isArray(state.modes)?state.modes.filter(m=>MODES.some(x=>x.id===m)):[];
if(!state.modes.length)state.modes=MODES.map(m=>m.id);
if(!BANDS.find(b=>b.id===state.band))state.band='40';
if(!['band','sheet'].includes(state.view))state.view='band';

const active=()=>state.modes;
const allowed=b=>!!b.cls[state.cls];

/* Eingabe → kHz. Werte < 1000 gelten als MHz, ab 1 000 000 als Hz, sonst kHz. Komma und Punkt als Dezimaltrenner.
   Liegt dieser Wert in keinem Band, gilt die erste andere Lesart (kHz, MHz, Hz), die in einem Band liegt
   (z. B. 1296,2 → MHz und 1296174 → kHz für 23 cm). */
function parseFreq(raw){
  const t=raw.trim().replace(/\s/g,'').replace(/(k|m)?hz$/i,'').replace(',','.');
  if(!/^\d+(\.\d+)?$/.test(t)) return NaN;
  const v=parseFloat(t);
  if(v<=0) return NaN;
  const k=v<1000?v*1000:v>=1e6?v/1000:v;
  const inBand=x=>BANDS.some(b=>x>=b.lo&&x<=b.hi);
  return inBand(k)?k:[v,v*1000,v/1000].find(inBand)||k;
}

/* ---------- Deep-Links: #40 (Band), #f=7.074 (Frequenz), #spick (Spickzettel) ---------- */
function readHash(){
  const h=decodeURIComponent(location.hash.slice(1));
  if(!h) return;
  const f=h.match(/^f=(.+)$/);
  if(f){$('chk').value=f[1].replace('.',',');return}
  $('chk').value='';
  if(h==='spick') state.view='sheet';
  else if(BANDS.find(b=>b.id===h)){state.band=h;state.view='band'}
}
function writeHash(){
  const v=$('chk').value.trim();
  const h=v&&!isNaN(parseFreq(v))?'f='+v.replace(',','.'):state.view==='sheet'?'spick':state.band;
  try{history.replaceState(null,'','#'+h)}catch(e){}
}

/* ---------- Auswertung ---------- */
function merge(segs){const out=[];segs.forEach(s=>{const l=out[out.length-1];if(l&&Math.abs(l.hi-s.lo)<0.01)l.hi=s.hi;else out.push({lo:s.lo,hi:s.hi})});return out}
function summary(b){
  const res={};
  res.cw={ranges:merge(b.segs.filter(s=>s.k==='cw'))};
  res.ssb={ranges:merge(b.segs.filter(s=>s.k==='ssb'||s.k==='allmode'))};
  res.fm={ranges:merge(b.segs.filter(s=>s.k==='fm'||s.k==='allmode'))};
  res.ft8={freqs:b.mk.filter(m=>m.t==='ft8').map(m=>m.f)};
  ['cw','ssb','fm'].forEach(md=>res[md].calls=b.mk.filter(m=>m.t==='call'&&m.mode===md));
  return res;
}
function relevant(b,s){
  const K=KINDS[s.k]; if(K.ex) return 'ex';
  const a=active(); if(K.modes.some(m=>a.includes(m))) return 'on';
  if(a.includes('ft8')&&b.mk.some(m=>m.t==='ft8'&&m.f>=s.lo&&m.f<s.hi)) return 'on';
  return 'dim';
}
function showMarker(m){
  const a=active();
  if(m.t==='ft8') return a.includes('ft8');
  if(m.t==='call') return a.includes(m.mode);
  if(m.t==='dial') return a.includes('ssb');
  return true;
}
/* Dial-Grenze für SSB-Sprache (DIAL in data.js) als Marke in der Leiter und als Hinweis bei SSB */
function dialMarks(b){
  const d=DIAL[b.id]; if(!d) return [];
  const m=d.sb==='LSB'?M(d.min,'dial','LSB-Sprache: Dial nicht tiefer'):M(d.max,'dial','USB-Sprache: Dial nicht höher');
  m.title=dialWhy(b);
  return [m];
}
/* Warum: Das Gerät zeigt die (unterdrückte) Trägerfrequenz, das Seitenband liegt bis ca. 2,7 kHz daneben. */
function dialWhy(b){
  const d=DIAL[b.id]; if(!d) return '';
  if(d.sb==='LSB') return `Warum? Bei SSB zeigt das Gerät die Trägerfrequenz, das LSB-Signal liegt bis ca. 2,7 kHz darunter. Auf ${fmt(d.min-2)} sendest du also ab ${fmt(d.min-4.7)} MHz, unterhalb des Phonie-Bereichs ab ${fmt(d.min-3)}. Deshalb Dial nicht unter ${fmt(d.min)}.`;
  return `Warum? Bei SSB zeigt das Gerät die Trägerfrequenz, das USB-Signal liegt bis ca. 2,7 kHz darüber. Auf ${fmt(b.hi)} sendest du also bis ${fmt(b.hi+2.7)} MHz, außerhalb des Bandes. Deshalb Dial höchstens ${fmt(d.max)}.`;
}
function dialHint(b,compact){
  const d=DIAL[b.id]; if(!d) return '';
  if(d.sb==='LSB') return compact?`<em>LSB · Dial ab ${fmt(d.min)}</em>`:`<em>LSB · Dial nicht unter ${fmt(d.min)}, das Signal liegt bis ca. 3 kHz darunter</em>`;
  return compact?`<em>USB · Dial bis ${fmt(d.max)}</em>`:`<em>USB · Dial höchstens ${fmt(d.max)}, sonst ragt das Signal über die Bandgrenze ${fmt(b.hi)}</em>`;
}
function fwBadge(b,s){const f=fwOf(b,s);if(!f||!active().includes('fm'))return '';return `<div class="fwb ${f[0]}">${esc(f[1])}</div>`}
function fmWidth(b){
  if(!FW[b.id]) return '';
  const w=b.segs.filter(s=>{const f=fwOf(b,s);return f&&f[0]==='w'});
  if(Object.values(FW[b.id]).every(f=>f[0]==='w')) return '<em>FM bis 20 kHz Bandbreite, Breit-FM (±5 kHz) zulässig</em>';
  return w.length?`<em>Schmalband-FM (NBFM); Breit-FM nur ${w.map(s=>rng(s.lo,s.hi)).join(', ')}</em>`:'<em>Nur Schmalband-FM (NBFM, ±2,5 kHz Hub)</em>';
}
const pill=m=>`<span class="pill t-${m.t}"${m.title?` title="${esc(m.title)}"`:''}><b>${fmt(m.f)}</b>${esc(m.l)}</span>`;

function goRows(b,compact){
  const sm=summary(b),a=active();
  return MODES.filter(m=>a.includes(m.id)).map(m=>{
    let val='';
    if(m.id==='ft8'){val=sm.ft8.freqs.length?sm.ft8.freqs.map(f=>`<span>${fmt(f)}</span>`).join('')+(compact?'':'<em>Dial-Frequenz, USB</em>'):''}
    else{
      const r=sm[m.id];
      if(r.ranges.length){val=r.ranges.map(x=>`<span>${rng(x.lo,x.hi)}</span>`).join('');
        if(m.id==='ssb') val+=dialHint(b,compact);
        if(r.calls.length) val+=`<em>Anruf ${r.calls.map(c=>fmt(c.f)).join(', ')}</em>`;
        if(m.id==='fm') val+=fmWidth(b);
        if(m.id==='cw'&&!compact) val+='<em>CW ist überall erlaubt, außer in Bakenbereichen</em>';
      }else if(m.id==='cw'){val='<span class="none">überall außer Baken</span>'}
    }
    if(!val) val='<span class="none">'+(m.id==='ssb'&&b.id==='30'?'nicht erlaubt':'nicht vorgesehen')+'</span>';
    return `<div class="row"><div class="md" style="--c:var(${m.c})"><i></i>${m.n}</div><div class="val">${val}</div></div>`;
  }).join('');
}
const keepList=b=>b.mk.filter(m=>m.t==='notfunk'||m.t==='bake').map(pill).join('');

/* ---------- Render ---------- */
function openBand(id){
  state.band=id;state.view='band';store.set('band',id);store.set('view','band');
  render();window.scrollTo({top:0});
}
function renderControls(){
  document.querySelectorAll('#cls button').forEach(bt=>bt.setAttribute('aria-pressed',String(bt.dataset.c===state.cls)));
  const mc=$('modes');
  if(!mc.querySelector('.mode')){
    MODES.forEach(m=>{const bt=document.createElement('button');bt.className='mode';bt.id='mode_'+m.id;bt.style.setProperty('--c',`var(${m.c})`);bt.innerHTML=`<i></i>${m.n}`;bt.dataset.m=m.id;
      bt.onclick=()=>{
        const i=state.modes.indexOf(m.id);
        if(i>=0){if(state.modes.length===1)return;state.modes.splice(i,1)}  // mindestens eine Betriebsart bleibt aktiv
        else state.modes.push(m.id);
        store.set('modes',state.modes);render();
      };
      mc.appendChild(bt)});
  }
  MODES.forEach(m=>{const bt=$('mode_'+m.id),on=active().includes(m.id);bt.setAttribute('aria-pressed',String(on));bt.title=on&&state.modes.length===1?'Mindestens eine Betriebsart bleibt aktiv':''});
  $('tabBand').setAttribute('aria-pressed',String(state.view==='band'));
  $('tabSheet').setAttribute('aria-pressed',String(state.view==='sheet'));
}
function renderBands(){
  const el=$('bands');let g='',h='';
  BANDS.forEach(b=>{
    if(b.g!==g){g=b.g;h+=`<span class="grp">${g}</span>`}
    const [n,u]=b.name.split(' ');
    h+=`<button class="bchip${allowed(b)?'':' off'}" data-b="${b.id}" aria-current="${state.view==='band'&&b.id===state.band}" title="${allowed(b)?'':'nicht für Klasse '+state.cls}">${n}<small>${u}</small></button>`;
  });
  el.innerHTML=h;
  el.querySelectorAll('.bchip').forEach(bt=>bt.onclick=()=>openBand(bt.dataset.b));
  // aktiven Chip in der Leiste mittig zeigen; nur waagerecht scrollen (scrollIntoView würde ggf. die ganze Seite verschieben)
  const cur=el.querySelector('[aria-current="true"]');
  if(cur)el.scrollLeft+=cur.getBoundingClientRect().left-el.getBoundingClientRect().left-(el.clientWidth-cur.offsetWidth)/2;
}
function legend(){
  const ks=['cw','schmal','ssb','allmode','fm','relais','bake','sat'];
  return ks.map(k=>`<div class="${KINDS[k].ex?'ex':''}" style="--k:var(${KINDS[k].c})"><i></i>${KINDS[k].n}</div>`).join('')
    +`<div><span class="fwb n">NBFM</span>Schmal, ±2,5 kHz Hub</div><div><span class="fwb w">Breit</span>Breit-FM, ±5 kHz zulässig</div>`
    +`<div><i style="background:none;border:1.5px dashed var(--accent);border-radius:999px"></i>Dial-Grenze SSB-Sprache</div>`;
}
function renderBand(){
  const b=BANDS.find(x=>x.id===state.band), span=b.hi-b.lo;
  const last=b.segs[b.segs.length-1], marks=b.mk.concat(dialMarks(b));
  let lad='';
  b.segs.forEach(s=>{
    const K=KINDS[s.k], r=relevant(b,s), h=46+Math.round((s.hi-s.lo)/span*300);
    const mk=marks.filter((m,i)=>m.f>=s.lo&&(m.f<s.hi||(m.f===s.hi&&s===last))&&showMarker(m)
      &&!marks.slice(0,i).some(o=>o.f===m.f&&o.l===m.l&&showMarker(o)));  // gleiche Marke für mehrere Betriebsarten nur einmal
    const hit=state.hit&&state.hit.band===b.id&&state.hit.k>=s.lo&&(state.hit.k<s.hi||s===last);
    lad+=`<div role="listitem" class="rung ${K.ex?'ex':''} ${r==='dim'?'dim':''} ${hit?'hit':''}" style="--k:var(${K.c});min-height:${h}px">
      <div class="rf">${fmt(s.lo)}</div><div class="rbar"></div>
      <div class="rbody"><div class="rl">${esc(s.l)}</div><div class="rk"><span class="mono">${rng(s.lo,s.hi)}</span> · ${K.n}</div>${fwBadge(b,s)}
      ${mk.length?`<div class="pills">${mk.map(pill).join('')}</div>`:''}</div></div>`;
  });
  lad+=`<div class="rung end" aria-hidden="true"><div class="rf">${fmt(b.hi)}</div><div></div><div class="rbody"></div></div>`;
  const mini=b.segs.map(s=>`<div class="${KINDS[s.k].ex?'ex':''}" style="--k:var(${KINDS[s.k].c});flex:${s.hi-s.lo} 0 0" title="${esc(s.l)}"></div>`).join('');
  const pw=b.cls[state.cls], cl=Object.keys(b.cls).join(' · ');
  const notes=b.notes.concat(DIAL[b.id]&&active().includes('ssb')?[dialWhy(b)]:[]);
  const keep=keepList(b);
  return `<section class="bandview">
    <div class="bandhead"><h2>${b.name}</h2><span class="range">${rng(b.lo,b.hi)} MHz</span>
      <div class="pwr">${pw?`<span class="tag">Klasse ${state.cls}: ${pw}</span>`:`<span class="tag warn">Nicht für Klasse ${state.cls}</span>`}
      <span class="cls">Zugelassen: ${cl}</span></div></div>
    ${pw?'':`<div class="notice">Mit Klasse ${state.cls} darfst du auf ${b.name} nicht senden. Zugelassen: Klasse ${Object.keys(b.cls).join(', ')}.</div>`}
    <div class="minimap" aria-hidden="true">${mini}</div>
    <div class="ladder" role="list" aria-label="Bandsegmente ${b.name}">${lad}</div>
    <aside class="side">
      <div class="card"><h3>Hier kannst du funken · MHz</h3><div class="go">${goRows(b,false)}</div></div>
      ${keep?`<div class="card"><h3>Freihalten</h3><div class="keep">${keep}</div></div>`:''}
      ${notes.length?`<div class="card"><h3>Hinweise ${b.name}</h3><ul class="notes">${notes.map(n=>`<li>${esc(n)}</li>`).join('')}</ul></div>`:''}
      <div class="card"><h3>Legende</h3><div class="legend">${legend()}</div></div>
    </aside></section>`;
}
function renderSheet(){
  return `<section class="sheet">${BANDS.map(b=>{
    const pw=b.cls[state.cls], keep=keepList(b);
    return `<button class="scard${pw?'':' off'}" data-b="${b.id}">
      <div class="sh"><b>${b.name}</b><span class="mono">${rng(b.lo,b.hi)}</span><span class="tag ${pw?'':'warn'}">${pw?pw:'nicht Kl. '+state.cls}</span></div>
      <div class="go">${goRows(b,true)}</div>
      ${keep?`<div class="keep">${keep}</div>`:''}</button>`}).join('')}</section>`;
}
function render(){
  renderControls();renderBands();
  const main=$('main');
  main.innerHTML=state.view==='band'?renderBand():renderSheet();
  main.querySelectorAll('.scard').forEach(c=>c.onclick=()=>openBand(c.dataset.b));
  writeHash();
}

/* ---------- Frequenz prüfen ---------- */
function check(raw){
  const out=$('chkRes');
  const prevHit=state.hit;
  state.hit=null;
  const redraw=()=>{if(state.view==='band'&&(prevHit||state.hit))render();else writeHash()};
  if(!raw.trim()){out.innerHTML='';redraw();return}
  const k=parseFreq(raw);
  if(isNaN(k)){out.innerHTML=`<div class="result" style="margin-bottom:6px">Bitte eine Zahl eingeben, z.B. <span class="mono">14074</span> (kHz) oder <span class="mono">145,500</span> (MHz).</div>`;redraw();return}
  const b=BANDS.find(x=>k>=x.lo&&k<=x.hi);
  if(!b){
    const near=BANDS.reduce((a,x)=>{const d=Math.min(Math.abs(k-x.lo),Math.abs(k-x.hi));return d<a.d?{d,x}:a},{d:Infinity}).x;
    out.innerHTML=`<div class="result" style="--k:var(--k-bake);margin-bottom:6px"><strong>${fmt(k)} MHz liegt außerhalb der Bänder auf dieser Seite.</strong><span class="okline">Nächstes Band: ${near.name} (${rng(near.lo,near.hi)} MHz).</span></div>`;
    redraw();return;
  }
  const s=b.segs.find(x=>k>=x.lo&&k<x.hi)||b.segs[b.segs.length-1];
  const K=KINDS[s.k];
  const tol=b.g==='KW'?3:12.5;
  const warns=b.mk.filter(m=>(m.t==='notfunk'||m.t==='bake')&&Math.abs(m.f-k)<=tol).map(m=>m.t==='notfunk'?`Notfunk-Frequenz ${fmt(m.f)} in der Nähe – nur im Notfall belegen.`:`Bake auf ${fmt(m.f)} – nicht senden.`);
  const d=DIAL[b.id];
  if(d&&d.max&&k>d.max) warns.push(`USB-Sprache: Dial höchstens ${fmt(d.max)} – auf ${fmt(k)} ragt das Signal über die Bandgrenze ${fmt(b.hi)}.`);
  if(d&&d.min&&k<d.min&&k>=d.min-10) warns.push(`LSB-Sprache: Dial nicht unter ${fmt(d.min)} – auf ${fmt(k)} liegt das Signal unterhalb des Phonie-Bereichs.`);
  if(!allowed(b)) warns.unshift(`${b.name} ist für Klasse ${state.cls} nicht zugelassen.`);
  const modes=K.ex?'Hier kein eigener Betrieb.':'Passend für: '+K.modes.map(m=>MODES.find(x=>x.id===m).n).join(', ')+(b.mk.some(m=>m.t==='ft8'&&m.f>=s.lo&&m.f<s.hi)?', FT8':'');
  const fw=fwOf(b,s);
  out.innerHTML=`<div class="result" style="--k:var(${K.c});margin-bottom:6px">
    <strong>${fmt(k)} MHz · ${b.name} · ${esc(s.l)}</strong><span class="mono">${rng(s.lo,s.hi)} MHz</span>
    <button class="linkbtn" id="chkGo">Im Band zeigen</button>
    <span class="okline">${K.n}. ${modes}</span>
    ${fw?`<span class="okline">FM-Bandbreite: ${esc(fw[1])}</span>`:''}
    ${warns.map(w=>`<span class="warnline">${esc(w)}</span>`).join('')}</div>`;
  state.hit={band:b.id,k};
  $('chkGo').onclick=showHit;
  redraw();
}
function showHit(){
  if(!state.hit) return;
  state.band=state.hit.band;state.view='band';store.set('band',state.band);store.set('view','band');render();
  const h=document.querySelector('.rung.hit');if(h)h.scrollIntoView({block:'center',behavior:'smooth'});
}

/* ---------- Start ---------- */
document.querySelectorAll('#cls button').forEach(bt=>bt.onclick=()=>{state.cls=bt.dataset.c;store.set('cls',state.cls);render();check($('chk').value)});
document.querySelectorAll('.tabs button').forEach(bt=>bt.onclick=()=>{state.view=bt.dataset.v;store.set('view',state.view);render()});
$('chk').addEventListener('input',e=>check(e.target.value));
$('chk').addEventListener('keydown',e=>{if(e.key==='Enter')showHit();if(e.key==='Escape'){e.target.value='';check('')}});
function applyHash(){
  readHash();render();check($('chk').value);
  if(state.hit) showHit();
}
/* ---------- Kopf: Version, Uhr, Hell/Dunkel (wie bei MUF Muncher) ---------- */
$('versionHeader').textContent='v'+VERSION;
$('versionFoot').textContent='Bandplan DL v'+VERSION;

const fmtDate=new Intl.DateTimeFormat('de-DE',{timeZone:'UTC',weekday:'short',day:'numeric',month:'short',year:'numeric'});
function tick(){
  const now=new Date();
  $('utcClock').textContent=now.toISOString().slice(11,19);
  $('clockDate').textContent=fmtDate.format(now);
  $('localClock').textContent=now.toLocaleTimeString('de-DE',{hour12:false});
  const tz=new Intl.DateTimeFormat('de-DE',{timeZoneName:'short'}).formatToParts(now).find(p=>p.type==='timeZoneName');
  $('localTz').textContent=tz?tz.value:'';
}
tick();setInterval(tick,1000);

/* Explizite Wahl liegt in localStorage 'bp_theme' und wird schon in theme.js (im <head>) gesetzt; ohne Wahl gilt prefers-color-scheme. */
const prefersDark=matchMedia('(prefers-color-scheme: dark)');
const effectiveTheme=()=>{const t=document.documentElement.dataset.theme;return t==='light'||t==='dark'?t:(prefersDark.matches?'dark':'light')};
const syncThemeIcon=()=>$('themeToggle').classList.toggle('is-dark',effectiveTheme()==='dark');
$('themeToggle').onclick=()=>{const next=effectiveTheme()==='dark'?'light':'dark';document.documentElement.dataset.theme=next;store.set('theme',next);syncThemeIcon()};
prefersDark.addEventListener('change',syncThemeIcon);
syncThemeIcon();

addEventListener('hashchange',applyHash);
applyHash();
