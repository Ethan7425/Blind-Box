/* --------- CONFIG --------- */
const PASSWORD = "チェン";
const STORAGE_KEY = "met2_auth";

/* Optional: Discord webhook. Leave empty "" to disable. */
const WEBHOOK_URL = "https://discord.com/api/webhooks/1435995830069760110/XqPp37xJIgXpZptmXyaj_Smye0CWNP7p8QaCfEHuBAio_vmEMKlYN53pOpl0VwF7fD8B";
/* -------------------------- */



/* --------- Fonts everywhere (in case CSS loads later) --------- */
document.documentElement.style.fontFamily = "'Pacifico', cursive";

/* ---------- Helpers for presents ---------- */
function getPresentById(id) {
  return (Array.isArray(PRESENTS) ? PRESENTS.find(p => p.id === id) : null) || null;
}
function htmlEscape(s){ return (s||"").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
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
    <p class="muted">Saved on ${htmlEscape(p.date || p.id)}</p>
  `;
}
function renderMemoryCardHTML(p) {
  const img = p.image?.src
    ? `<figure class="polaroid">
         <img src="${htmlEscape(p.image.src)}" alt="${htmlEscape(p.image.alt || '')}" loading="lazy">
         ${p.image.caption ? `<figcaption>${htmlEscape(p.image.caption)}</figcaption>` : ``}
       </figure>`
    : ``;
  const firstLine = (p.message || "").split('\n').map(l => l.trim()).find(Boolean) || '';
  return `
    <article class="memory card glass neon-soft fade-in" data-date="${htmlEscape(p.date || p.id)}">
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

/* ---------- Home & Memories logic ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('blindBox3D');
  const revealZone = document.getElementById('today-reveal');
  const todayContainer = document.getElementById('today-content');
  const popup = document.getElementById('present-popup');
  const cta = document.getElementById('ctaPresent');
  const tiny = document.getElementById('tiny');
  const memGrid = document.getElementById('memories-grid');

  // If on memories page: render all except CURRENT_ID
  if (memGrid && typeof CURRENT_ID !== 'undefined') {
    const cards = (PRESENTS || [])
      .filter(p => p.id !== CURRENT_ID && p.showInMemories !== false)
      .sort((a,b) => (b.date || b.id).localeCompare(a.date || a.id))
      .map(renderMemoryCardHTML)
      .join('');
    memGrid.innerHTML = cards || `<p class="muted">No memories yet — soon ✨</p>`;
  }

  // If on home page: prepare current present; do not show until CTA
  if (!box || !revealZone || !popup || !cta || !todayContainer) return;

  const current = getPresentById(CURRENT_ID);
  if (current) {
    todayContainer.dataset.presentId = current.id;
  }

  // Hidden on load
  revealZone.hidden = true;
  popup.hidden = true;

  let isOpening = false;
  let isOpened  = false;

  // Spin config (random spin that returns to front)
  const easing = 'cubic-bezier(.25,.8,.25,1)';
  const minSpinTime = 1.6;  // s
  const maxSpinTime = 3.0;  // s
  const returnTime  = 0.8;  // s

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

      // show popup after return finishes (+ tiny pause)
      const onReturnEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        box.removeEventListener('transitionend', onReturnEnd);
        setTimeout(() => { popup.hidden = false; isOpening = false; }, 200);
      };
      box.addEventListener('transitionend', onReturnEnd);

    } else {
      box.classList.add('opened');
      setTimeout(() => box.classList.remove('opened'), 500);
    }
  };

  box.addEventListener('click', trigger);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
  });

  // CTA → optional Discord ping → render present
  cta.addEventListener('click', () => {
    popup.hidden = true;

    // Notify Discord (optional)
    if (WEBHOOK_URL) {
      const presentId = todayContainer?.dataset?.presentId || CURRENT_ID;
      fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `🎁 **Blind Box opened!**\n• presentId: \`${presentId}\`\n• time: \`${new Date().toLocaleString()}\`\n`
        })
      }).catch(() => {});
    }

    // Render the current present into the container
    const p = getPresentById(CURRENT_ID);
    if (p) {
      todayContainer.innerHTML = renderPresentHTML(p);
      todayContainer.dataset.presentId = p.id;
    }

    revealZone.hidden = false;
    if (tiny) tiny.hidden = true;
    revealZone.classList.remove('fade-in-present');
    void revealZone.offsetWidth; // reflow
    revealZone.classList.add('fade-in-present');

    isOpened = true;
  });
});

/* Expose guards to HTML inline calls */
window.authGuard = authGuard;
window.bindLogout = bindLogout;
