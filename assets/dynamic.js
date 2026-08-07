
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fmtDate=v=>new Intl.DateTimeFormat('de-DE',{dateStyle:'long',timeStyle:'short'}).format(new Date(v));
async function getJSON(url){const r=await fetch(url);const d=await r.json();if(!r.ok)throw new Error(d.error||'Daten konnten nicht geladen werden.');return d}

async function loadNews(){
 const current=document.getElementById('currentNews'),archive=document.getElementById('newsArchive');if(!current||!archive)return;
 try{
  const {announcements=[]}=await getJSON('/api/announcements?history=1');
  if(!announcements.length){current.innerHTML='<div class="empty-state">Noch keine Meldungen.</div>';archive.innerHTML='';return}
  const active=announcements.find(a=>a.active)||announcements[0],past=announcements.filter(a=>a.id!==active.id);
  const image=(active.images||[])[0];
  current.innerHTML=`<article class="news-current-card">${image?`<div class="news-current-image" style="background-image:url('${image}')"></div>`:''}<div class="news-current-copy"><span class="news-tag">AKTUELL</span><time>${fmtDate(active.created_at)}</time><h2>${esc(active.title)}</h2><p>${esc(active.body)}</p></div></article>`;
  archive.innerHTML=past.length?past.map(a=>`<details class="news-archive-item"><summary><span><time>${fmtDate(a.created_at)}</time><strong>${esc(a.title)}</strong></span><b>+</b></summary><div class="news-archive-body">${(a.images||[])[0]?`<img src="${(a.images||[])[0]}" alt="">`:''}<p>${esc(a.body)}</p></div></details>`).join(''):'<div class="empty-state">Noch keine älteren Meldungen im Archiv.</div>';
 }catch(e){current.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`}
}
async function loadEvents(){
 const upcoming=document.getElementById('upcomingEvents'),past=document.getElementById('pastEvents');if(!upcoming)return;
 try{
  const {events=[]}=await getJSON('/api/events');const now=Date.now();
  const next=events.filter(e=>new Date(e.starts_at).getTime()>=now);
  const old=events.filter(e=>new Date(e.starts_at).getTime()<now).reverse();
  const card=e=>`<article class="event-card"><div class="event-date"><strong>${new Date(e.starts_at).toLocaleDateString('de-DE',{day:'2-digit'})}</strong><span>${new Date(e.starts_at).toLocaleDateString('de-DE',{month:'short'}).replace('.','')}</span></div><div><time>${fmtDate(e.starts_at)}</time><h3>${esc(e.title)}</h3><p class="event-place">${esc(e.location)}${e.state_code?' · '+esc(e.state_code):''}</p>${e.description?`<p>${esc(e.description)}</p>`:''}${e.link?`<a class="more" href="${esc(e.link)}" target="_blank" rel="noopener">Weitere Informationen →</a>`:''}</div></article>`;
  upcoming.innerHTML=next.length?next.map(card).join(''):'<div class="empty-state">Zurzeit sind noch keine kommenden Veranstaltungen eingetragen.</div>';
  if(past)past.innerHTML=old.length?old.map(card).join(''):'<div class="empty-state">Noch keine vergangenen Veranstaltungen im Archiv.</div>';
  const home=document.getElementById('homeNextEvent');if(home){home.innerHTML=next.length?`<strong>${esc(next[0].title)}</strong><span>${fmtDate(next[0].starts_at)} · ${esc(next[0].location)}</span>`:'<strong>Neue Termine folgen</strong><span>Veranstaltungen werden hier bekanntgegeben.</span>'}
 }catch(e){upcoming.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`}
}
async function loadStates(){
 const grid=document.getElementById('stateGrid');if(!grid)return;
 try{
  const {states=[]}=await getJSON('/api/states');
  const by=Object.fromEntries(states.map(s=>[s.code,s]));
  grid.innerHTML=states.map(s=>`<article class="state-card" id="state-${s.code}"><div class="state-card-head"><span>${esc(s.code)}</span><h3>${esc(s.name)}</h3></div><dl><dt>Landesvorsitz</dt><dd>${s.chairman?esc(s.chairman):'<em>Noch nicht besetzt</em>'}</dd><dt>Stellvertretung</dt><dd>${s.deputy?esc(s.deputy):'<em>Noch nicht besetzt</em>'}</dd></dl>${s.discord?`<a href="${esc(s.discord)}" target="_blank" rel="noopener">Landesverband kontaktieren →</a>`:''}${s.note?`<p>${esc(s.note)}</p>`:''}</article>`).join('');
  document.querySelectorAll('[data-state-code]').forEach(el=>{
    const s=by[el.dataset.stateCode];if(!s)return;
    el.classList.toggle('filled',!!s.chairman);
    el.addEventListener('click',()=>document.getElementById('state-'+el.dataset.stateCode)?.scrollIntoView({behavior:'smooth',block:'center'}));
  });
 }catch(e){grid.innerHTML=`<div class="empty-state">${esc(e.message)}</div>`}
}
loadNews();loadEvents();loadStates();
