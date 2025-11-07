/* =========================
   Blind Box — script.js
   Weighted random + Discord ping
   ========================= */

/* --------- CONFIG --------- */
const PASSWORD = "チェン";
const STORAGE_KEY = "met2_auth";
const VIEW_KEY = "presentViews";              // localStorage key for per-present view counts
const WEBHOOK_URL = "https://discord.com/api/webhooks/1435995830069760110/XqPp37xJIgXpZptmXyaj_Smye0CWNP7p8QaCfEHuBAio_vmEMKlYN53pOpl0VwF7fD8B"; // keep or replace
/* -------------------------- */

/* --------- Fonts everywhere (safety if CSS loads late) --------- */
document.documentElement.style.fontFamily = "'Pacifico', cursive";

/* ---------- Small helpers ---------- */
function htmlEscape(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function getViews() {
  try { return JSON.parse(localStorage.getItem(VIEW_KEY) || "{}"); }
  catch { return {}; }
}
function setViews(v) {
  try { localStorage.setItem(VIEW_KEY, JSON.stringify(v)); } catch {}
}

/* Build full present HTML (for Today reveal) */
function renderPresentHTML(p) {
  const lines = (p.message || "").split('\n').map(l => l.trim()).filter(Boolean);
  const htmlMsg = lines.map(l => `${htmlEscape(l)}<br>`).join('');
  const img = p.image?.src
    ? `<figure class="polaroid">
         <img src="${htmlEscape(p.image.src)}" alt="${htmlEscape(p.image.alt || '')}" loading="lazy">
         ${p.image.caption ? `<figcaption>${htmlEscape(p.image.caption)}</figcaption>` : ``}
       </figure>`
    : ``;
  return `
    <h2 class="section-title">${htmlEscape(p.title || '')}</h2>
    <p>${htmlMsg}</p>
    ${img}
  `;
}

/* Build memory card HTML (for Memories grid) */
function renderMemoryCardHTML(p) {
  const img = p.image?.src
    ? `<figure class="polaroid">
         <img src="${htmlEscape(p.image.src)}" alt="${htmlEscape(p.image.alt || '')}" loading="lazy">
         ${p.image.caption ? `<figcaption>${htmlEscape(p.image.caption)}</figcaption>` : ``}
       </figure>`
    : ``;
  const firstLine = (p.message || "").split('\n').map(l => l.trim()).find(Boolean) || '';
  return `
    <article class="memory card glass neon-soft fade-in" data-id="${htmlEscape(p.id)}">
      <h3>${htmlEscape(p.title || p.id)}</h3>
      ${img}
      ${firstLine ? `<p class="muted">${htmlEscape(firstLine)}</p>` : ``}
    </article>
  `;
}

/* ---------- Login workflow (index.html) ---------- */
const form = document.getElementById('loginForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const pw = document.getElementById('pw').value.trim();
    const remember = document.getElementById('remember').checked;
    if (pw === PASSWORD) {
      if (remember) localStorage.setItem(STORAGE_KEY, 'true');
      else sessionStorage.setItem(STORAGE_KEY, 'true'); // until tab closes
      location.href = 'home.html';
    } else {
      alert('Wrong password 😿');
    }
  });
}

/* ---------- Guards + Logout ---------- */
function authGuard(){
  const ok = localStorage.getItem(STORAGE_KEY) === 'true' || sessionStorage.getItem(STORAGE_KEY) === 'true';
  if (!ok) location.href = 'index.html';
}
function bindLogout(){
  const btn = document.getElementById('logout');
  if (!btn) return;
  btn.addEventListener('click', ()=>{
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    location.href = 'index.html';
  });
}
window.authGuard = authGuard;
window.bindLogout = bindLogout;

/* ---------- Weighted selection ---------- */
/*
  Weights are computed as: weight = 1 / (1 + views[id])
  - unseen (0 views) → weight 1.0
  - seen 1x → 0.5
  - seen 5x → ~0.166
  You can add a floor if you want old ones to still have a tiny chance (e.g. Math.max(weight, 0.05))
*/
function pickWeightedRandom(presents, views) {
  const live = presents.filter(p => !p.archived); // optional "archived" flag support
  if (!live.length) return null;

  const weights = live.map(p => {
    const v = +((views && views[p.id]) || 0);
    const w = 1 / (1 + v);
    return Math.max(w, 0.02); // tiny floor so nothing disappears entirely
  });

  const total = weights.reduce((a,b)=>a+b,0);
  let r = Math.random() * total;
  for (let i = 0; i < live.length; i++) {
    r -= weights[i];
    if (r <= 0) return live[i];
  }
  return live[live.length - 1]; // fallback
}

/* ---------- Home & Memories logic ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('blindBox3D');
  const revealZone = document.getElementById('today-reveal');
  const todayContainer = document.getElementById('today-content'); // if you use this wrapper
  const popup = document.getElementById('present-popup');
  const cta = document.getElementById('ctaPresent');
  const tiny = document.getElementById('tiny');
  const memGrid = document.getElementById('memories-grid');

  // If on Memories page: render everything (except ones you hide explicitly)
  if (memGrid && Array.isArray(window.PRESENTS)) {
    const cards = PRESENTS
      .filter(p => p.showInMemories !== false) // allow hiding from memories
      .map(renderMemoryCardHTML)
      .join('');
    memGrid.innerHTML = cards || `<p class="muted">No memories yet — soon ✨</p>`;
  }

  // If not on Home page, stop here.
  if (!box || !revealZone || !popup || !cta) return;

  // Hidden on load
  revealZone.hidden = true;
  popup.hidden = true;

  // Weighted pick for *this session open*
  const views = getViews();
  const chosen = pickWeightedRandom(PRESENTS || [], views);
  if (!chosen) return; // no presents defined

  // Keep chosen id on container for Discord ping
  if (todayContainer) todayContainer.dataset.presentId = chosen.id;

  // Cube spin → return to front → show popup
  const easing = 'cubic-bezier(.25,.8,.25,1)';
  const minSpinTime = 1.6;  // s
  const maxSpinTime = 3.0;  // s
  const returnTime  = 0.8;  // s
  let isOpening = false, isOpened = false;

  const trigger = () => {
    if (isOpening) return;
    if (!isOpened) {
      isOpening = true;

      const randX = 360 * (2 + Math.random() * 3);
      const randY = 360 * (2 + Math.random() * 3);
      const randZ = 360 * (Math.random() * 2);
      const spinSeconds = minSpinTime + Math.random() * (maxSpinTime - minSpinTime);
      const backTime = Math.min(returnTime, spinSeconds * 0.9);

      // reset to neutral
      box.style.transition = 'none';
      box.style.transform  = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      void box.offsetWidth;

      // random spin
      box.style.transition = `transform ${spinSeconds}s ${easing}`;
      box.style.transform  = `rotateX(${randX}deg) rotateY(${randY}deg) rotateZ(${randZ}deg)`;

      // return to front
      setTimeout(() => {
        box.style.transition = `transform ${backTime}s ${easing}`;
        box.style.transform  = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      }, (spinSeconds - backTime) * 1000);

      // after return finishes, show popup
      const onReturnEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        box.removeEventListener('transitionend', onReturnEnd);
        setTimeout(() => { popup.hidden = false; isOpening = false; }, 200);
      };
      box.addEventListener('transitionend', onReturnEnd);
    }
  };

  box.addEventListener('click', trigger);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
  });

  // CTA → Discord ping → reveal chosen present → increment views
  cta.addEventListener('click', () => {
    popup.hidden = true;

    // Discord notification (kept!)
    if (WEBHOOK_URL) {
    const presentId = (todayContainer?.dataset?.presentId) || chosen.id;

    // calculate weight at open time
    const v = (views && views[chosen.id]) || 0;
    const weight = (1 / (1 + v)).toFixed(3);

    fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        content:
            `🎁 **Blind Box opened!**\n` +
            `• ID: \`${presentId}\`\n` +
            `• Weight: \`${weight}\`\n` +
            `• Views so far: \`${v}\`\n` +
            `• Time: \`${new Date().toLocaleString()}\``
        })
    }).catch(() => {});
    }

    // Render chosen present
    const target = todayContainer || revealZone;
    target.innerHTML = renderPresentHTML(chosen);

    revealZone.hidden = false;
    if (tiny) tiny.hidden = true;
    revealZone.classList.remove('fade-in-present');
    void revealZone.offsetWidth; // reflow
    revealZone.classList.add('fade-in-present');

    isOpened = true;

    // Increment view count + persist
    const v = getViews();
    v[chosen.id] = (v[chosen.id] || 0) + 1;
    setViews(v);
  });
});
