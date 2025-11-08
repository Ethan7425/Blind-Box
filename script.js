/* =========================
   Blind Box — script.js
   Unseen-only → Memories on open
   ========================= */

/* --------- CONFIG --------- */
const PASSWORD   = "チェン";
const STORAGE_KEY= "met2_auth";
const SEEN_KEY   = "presentSeen"; // { [id]: ISO timestamp }
const WEBHOOK_URL = "https://discord.com/api/webhooks/1435995830069760110/XqPp37xJIgXpZptmXyaj_Smye0CWNP7p8QaCfEHuBAio_vmEMKlYN53pOpl0VwF7fD8B";
/* -------------------------- */

/* font safety */
document.documentElement.style.fontFamily = "'Pacifico', cursive";

/* utils */
const escapeHTML = s => (s||"").replace(/[&<>"']/g,m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const loadSeen = () => { try { return JSON.parse(localStorage.getItem(SEEN_KEY) || "{}"); } catch { return {}; } };
const saveSeen = (obj) => { try { localStorage.setItem(SEEN_KEY, JSON.stringify(obj)); } catch {} };

/* render helpers */
function renderPresentHTML(p){
  const lines = (p.message||"").split('\n').map(l=>l.trim()).filter(Boolean);
  const msg = lines.map(l=>`${escapeHTML(l)}<br>`).join('');
  const img = p.image?.src ? `
    <figure class="polaroid">
      <img src="${escapeHTML(p.image.src)}" alt="${escapeHTML(p.image.alt||'')}" loading="lazy">
      ${p.image?.caption ? `<figcaption>${escapeHTML(p.image.caption)}</figcaption>` : ``}
    </figure>` : ``;
  return `<h2 class="section-title">${escapeHTML(p.title||'')}</h2><p>${msg}</p>${img}`;
}
function renderMemoryCardHTML(p, ts){
  const img = p.image?.src ? `
    <figure class="polaroid">
      <img src="${escapeHTML(p.image.src)}" alt="${escapeHTML(p.image.alt||'')}" loading="lazy">
      ${p.image?.caption ? `<figcaption>${escapeHTML(p.image.caption)}</figcaption>` : ``}
    </figure>` : ``;
  const when = ts ? new Date(ts).toLocaleString() : "";
  const first = (p.message||"").split('\n').map(l=>l.trim()).find(Boolean)||"";
  return `
    <article class="memory card glass neon-soft fade-in" data-id="${escapeHTML(p.id)}">
      <h3>${escapeHTML(p.title||p.id)}</h3>
      ${img}
      ${first ? `<p class="muted">${escapeHTML(first)}</p>` : ``}
      ${when ? `<p class="muted">opened: ${escapeHTML(when)}</p>` : ``}
    </article>`;
}

/* login */
const form = document.getElementById('loginForm');
if (form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const pw = document.getElementById('pw').value.trim();
    const remember = document.getElementById('remember').checked;
    if (pw === PASSWORD){
      if (remember) localStorage.setItem(STORAGE_KEY,'true'); else sessionStorage.setItem(STORAGE_KEY,'true');
      location.href='home.html';
    } else alert('Wrong password 😿');
  });
}

/* guards */
function authGuard(){
  const ok = localStorage.getItem(STORAGE_KEY)==='true' || sessionStorage.getItem(STORAGE_KEY)==='true';
  if (!ok) location.href='index.html';
}
function bindLogout(){
  const btn = document.getElementById('logout');
  if (!btn) return;
  btn.addEventListener('click', ()=>{
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    location.href='index.html';
  });
}
window.authGuard = authGuard;
window.bindLogout = bindLogout;

/* main */
document.addEventListener('DOMContentLoaded', () => {
  const box   = document.getElementById('blindBox3D');
  const popup = document.getElementById('present-popup');
  const cta   = document.getElementById('ctaPresent');
  const hint  = document.getElementById('tiny');
  const revealZone    = document.getElementById('today-reveal');
  const todayContainer= document.getElementById('today-content');
  const memGrid       = document.getElementById('memories-grid');
  const resetSeenBtn  = document.getElementById('resetSeen');

  /* Memories page: render seen */
  if (memGrid){
    const seen = loadSeen(); // { id: iso }
    const entries = Object.entries(seen); // [[id, ts], ...]
    if (!entries.length){
      memGrid.innerHTML = `<p class="muted">no memories yet — soon ✨</p>`;
    } else {
      // newest first
      entries.sort((a,b)=> new Date(b[1]) - new Date(a[1]));
      const cards = entries.map(([id,ts])=>{
        const p = (PRESENTS||[]).find(x=>x.id===id);
        return p ? renderMemoryCardHTML(p, ts) : '';
      }).join('');
      memGrid.innerHTML = cards;
    }
    if (resetSeenBtn){
      resetSeenBtn.addEventListener('click', ()=>{
        localStorage.removeItem(SEEN_KEY);
        location.reload();
      });
    }
  }

  /* Home page: choose from UNSEEN only */
  if (!box || !popup || !cta || !revealZone) return;

  const seen = loadSeen();
  const unseenPool = (PRESENTS||[]).filter(p => !p.archived && !seen[p.id]);
  let chosen = null;

  if (unseenPool.length){
    // simple fair random among unseen
    chosen = unseenPool[Math.floor(Math.random() * unseenPool.length)];
  } else {
    // all seen: show a friendly message card instead of spin flow
    const allCaughtUp = `
      <article class="card glass neon-soft fade-in-present">
        <h2 class="section-title">all caught up ✨</h2>
        <p>you’ve opened every present so far on this device.<br>check <a href="memories.html">memories</a> to revisit your favorites.</p>
        <p class="muted">ps: you can reset local memories on the memories page.</p>
      </article>`;
    revealZone.hidden = false;
    if (todayContainer) todayContainer.innerHTML = allCaughtUp; else revealZone.innerHTML = allCaughtUp;
    if (hint) hint.hidden = true;
    return;
  }

  // keep chosen id on container (for Discord ping)
  if (todayContainer) todayContainer.dataset.presentId = chosen.id;

  // start hidden
  revealZone.hidden = true; popup.hidden = true;

  // Spin → return → popup
  const easing='cubic-bezier(.25,.8,.25,1)', minSpin=1.6, maxSpin=3.0, returnTime=0.8;
  let isOpening=false, isOpened=false;

  const trigger = () => {
    if (isOpening || isOpened) return;
    isOpening = true;

    const rx = 360 * (2 + Math.random()*3);
    const ry = 360 * (2 + Math.random()*3);
    const rz = 360 * (Math.random()*2);
    const spin = minSpin + Math.random()*(maxSpin-minSpin);
    const back = Math.min(returnTime, spin*0.9);

    box.style.transition='none';
    box.style.transform ='rotateX(0deg) rotateY(0deg) rotateZ(0deg)'; void box.offsetWidth;

    box.style.transition = `transform ${spin}s ${easing}`;
    box.style.transform  = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;

    setTimeout(()=>{
      box.style.transition = `transform ${back}s ${easing}`;
      box.style.transform  = `rotateX(0deg) rotateY(0deg) rotateZ(0deg)`;
    }, (spin - back)*1000);

    const onEnd = (ev)=>{
      if (ev.propertyName!=='transform') return;
      box.removeEventListener('transitionend', onEnd);
      setTimeout(()=>{ popup.hidden=false; isOpening=false; }, 200);
    };
    box.addEventListener('transitionend', onEnd);
  };

  box.addEventListener('click', trigger);
  box.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); trigger(); }});

  // CTA → ping → reveal → mark seen
  cta.addEventListener('click', ()=>{
    popup.hidden = true;

    // Discord ping with id
    if (WEBHOOK_URL){
      const idForPing = (todayContainer?.dataset?.presentId) || chosen.id;
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          content:
            `🎁 **Blind Box opened!**\n` +
            `• ID: \`${idForPing}\`\n` +
            `• Time: \`${new Date().toLocaleString()}\``
        })
      }).catch(()=>{});
    }

    const html = renderPresentHTML(chosen);
    if (todayContainer) todayContainer.innerHTML = html; else revealZone.innerHTML = html;

    revealZone.hidden = false;
    if (hint) hint.hidden = true;
    revealZone.classList.remove('fade-in-present'); void revealZone.offsetWidth;
    revealZone.classList.add('fade-in-present');

    // Save to memories: mark as seen (first time)
    const now = new Date().toISOString();
    const seenMap = loadSeen();
    if (!seenMap[chosen.id]) {
      seenMap[chosen.id] = now;
      saveSeen(seenMap);
    }
    isOpened = true;
  });
});
