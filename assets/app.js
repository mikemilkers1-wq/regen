const menuButton=document.getElementById("menuButton"),navLinks=document.getElementById("navLinks"),drawerShade=document.getElementById("drawerShade"),drawerClose=document.getElementById("drawerClose");
function setMenu(open){if(!navLinks)return;navLinks.classList.toggle("open",open);drawerShade?.classList.toggle("open",open);document.body.classList.toggle("menu-open",open);menuButton?.setAttribute("aria-expanded",String(open))}
menuButton?.addEventListener("click",()=>setMenu(!navLinks.classList.contains("open")));drawerClose?.addEventListener("click",()=>setMenu(false));drawerShade?.addEventListener("click",()=>setMenu(false));navLinks?.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>setMenu(false)));
if("IntersectionObserver" in window){const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");obs.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll(".reveal").forEach(e=>obs.observe(e))}else document.querySelectorAll(".reveal").forEach(e=>e.classList.add("visible"));
const form=document.getElementById("joinForm");if(form){form.addEventListener("submit",async e=>{e.preventDefault();const status=document.getElementById("formStatus"),button=form.querySelector('button[type="submit"]');status.textContent="Wird gesendet …";button.disabled=true;try{const response=await fetch("/api/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(form).entries()))});const result=await response.json();if(!response.ok)throw new Error(result.error||"Die Anmeldung konnte nicht gespeichert werden.");status.textContent="Danke. Wir melden uns bei Ihnen.";form.reset()}catch(error){status.textContent=error.message||"Die Anmeldung konnte nicht gespeichert werden."}finally{button.disabled=false}})}

const quickForm=document.getElementById("quickJoinForm");
if(quickForm){quickForm.addEventListener("submit",async e=>{e.preventDefault();const status=document.getElementById("quickFormStatus"),button=quickForm.querySelector('button[type="submit"]');status.textContent="Wird gesendet …";button.disabled=true;try{const response=await fetch("/api/applications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(Object.fromEntries(new FormData(quickForm).entries()))});const result=await response.json();if(!response.ok)throw new Error(result.error||"Die Anmeldung konnte nicht gespeichert werden.");status.textContent="Danke. Wir melden uns über Discord bei Ihnen.";quickForm.reset()}catch(error){status.textContent=error.message||"Die Anmeldung konnte nicht gespeichert werden."}finally{button.disabled=false}})}


// Aktuelle Bekanntmachung auf der Startseite
(async function loadAnnouncement(){
  const hero=document.getElementById('announcementHero');
  if(!hero)return;
  const title=document.getElementById('announcementTitle');
  const text=document.getElementById('announcementText');
  const backgrounds=document.getElementById('announcementBackgrounds');
  const controls=document.getElementById('announcementControls');
  const dots=document.getElementById('announcementDots');
  const fallback='https://commons.wikimedia.org/wiki/Special:Redirect/file/C25642-13.jpg';
  try{
    const response=await fetch('/api/announcements',{headers:{Accept:'application/json'}});
    if(!response.ok)throw new Error('Bekanntmachung nicht verfügbar');
    const data=await response.json();
    const announcement=data.announcement;
    if(!announcement)return;
    title.textContent=announcement.title;
    text.textContent=announcement.body;
    const uploadedImages=Array.isArray(announcement.images)?announcement.images.filter(Boolean):[];
    const images=uploadedImages.length?uploadedImages:[fallback];
    backgrounds.innerHTML=images.map((src,i)=>`<div class="announcement-bg${i===0?' active':''}" style="background-image:url('${String(src).replace(/'/g,'%27')}')"></div>`).join('');
    controls.hidden=true;
    controls.style.display='none';
    dots.innerHTML='';
    if(uploadedImages.length>1){
      controls.hidden=false;
      controls.style.display='flex';
      dots.innerHTML=images.map((_,i)=>`<button type="button" class="announcement-dot${i===0?' active':''}" data-announcement-index="${i}" aria-label="Bild ${i+1}"></button>`).join('');
      let index=0,timer=null;
      const paint=n=>{index=(n+images.length)%images.length;document.querySelectorAll('.announcement-bg').forEach((el,i)=>el.classList.toggle('active',i===index));document.querySelectorAll('.announcement-dot').forEach((el,i)=>el.classList.toggle('active',i===index))};
      const start=()=>{clearInterval(timer);timer=setInterval(()=>paint(index+1),6000)};
      const show=n=>{paint(n);start()};
      document.getElementById('announcementPrev')?.addEventListener('click',()=>show(index-1));
      document.getElementById('announcementNext')?.addEventListener('click',()=>show(index+1));
      dots.addEventListener('click',e=>{const b=e.target.closest('[data-announcement-index]');if(b)show(Number(b.dataset.announcementIndex))});
      document.addEventListener('visibilitychange',()=>{if(document.hidden)clearInterval(timer);else start()});
      start();
    }
  }catch(err){
    controls.hidden=true; controls.style.display='none';
    backgrounds.innerHTML=`<div class="announcement-bg active" style="background-image:url('${fallback}')"></div>`;
    console.warn(err);
  }
})();


// Interaction polish ---------------------------------------------------------
requestAnimationFrame(()=>document.body.classList.add('page-ready'));
const setScrolledState=()=>document.body.classList.toggle('has-scrolled',window.scrollY>12);
setScrolledState();
window.addEventListener('scroll',setScrolledState,{passive:true});

// A small stagger keeps grids from appearing as one rigid block.
document.querySelectorAll('.featured-grid,.cards,.teamgrid,.footer-connect,.stats-grid').forEach(group=>{
  [...group.children].forEach((child,index)=>{
    if(child.classList.contains('reveal')) child.style.setProperty('--reveal-delay',`${Math.min(index*70,210)}ms`);
  });
});

// Pointer feedback on primary interactive surfaces.
const rippleTargets='.button,.header-action,.dark-button,.small-btn,.quick-join button,.home-signup-button,.red-callout a,.announcement-actions a,.drawer-portal';
document.querySelectorAll(rippleTargets).forEach(el=>{
  el.addEventListener('pointerdown',event=>{
    if(event.button!==undefined&&event.button!==0)return;
    const rect=el.getBoundingClientRect();
    const ripple=document.createElement('span');
    ripple.className='qol-ripple';
    ripple.style.left=`${event.clientX-rect.left}px`;
    ripple.style.top=`${event.clientY-rect.top}px`;
    el.appendChild(ripple);
    ripple.addEventListener('animationend',()=>ripple.remove(),{once:true});
  });
});

// Discord welcome prompt (once per browser session)
(()=>{
 const gate=document.getElementById('discordGate');if(!gate)return;
 let seen=false;try{seen=sessionStorage.getItem('rbDiscordPromptSeen')==='1'}catch{}
 if(!seen){setTimeout(()=>{gate.hidden=false;requestAnimationFrame(()=>gate.classList.add('open'))},650)}
 const close=()=>{gate.classList.remove('open');setTimeout(()=>gate.hidden=true,220);try{sessionStorage.setItem('rbDiscordPromptSeen','1')}catch{}};
 document.getElementById('discordAlready')?.addEventListener('click',close);
 document.getElementById('discordJoin')?.addEventListener('click',close);
 gate.addEventListener('click',e=>{if(e.target===gate)close()});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!gate.hidden)close()});
})();
