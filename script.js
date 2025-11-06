/* --------- CONFIG: set your password here --------- */
const PASSWORD = "チェン";
const STORAGE_KEY = "met2_auth";
/* -------------------------------------------------- */

// Login workflow (index.html)
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

// Protect inner pages
function authGuard(){
  const ok = localStorage.getItem(STORAGE_KEY) === 'true' || sessionStorage.getItem(STORAGE_KEY) === 'true';
  if (!ok) location.href = 'index.html';
}

// Logout
function bindLogout(){
  const btn = document.getElementById('logout');
  if (!btn) return;
  btn.addEventListener('click', ()=>{
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    location.href = 'index.html';
  });
}

/* ---------- Blind box: random spin → return to front → popup → CTA reveals present ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const box = document.getElementById('blindBox3D');
  const revealZone = document.getElementById('today-reveal');
  const popup = document.getElementById('present-popup');
  const cta = document.getElementById('ctaPresent');
  const tiny = document.getElementById('tiny');

  if (!box || !revealZone || !popup || !cta) return;

  // always start hidden on load/refresh
  revealZone.hidden = true;
  popup.hidden = true;

  let isOpening = false;
  let isOpened  = false;

  // spin config
  const easing = 'cubic-bezier(.25,.8,.25,1)';
  const minSpinTime = 1.6;  // seconds
  const maxSpinTime = 3.0;  // seconds
  const returnTime  = 0.8;  // seconds (glide back to neutral)

  const trigger = () => {
    if (isOpening) return;

    if (!isOpened) {
      isOpening = true;

      // random total turns
      const randX = 360 * (2 + Math.random() * 3);
      const randY = 360 * (2 + Math.random() * 3);
      const randZ = 360 * (Math.random() * 2);
      const spinSeconds = minSpinTime + Math.random() * (maxSpinTime - minSpinTime);
      const backTime = Math.min(returnTime, spinSeconds * 0.9);

      // reset
      box.style.transition = 'none';
      box.style.transform  = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      void box.offsetWidth;

      // STEP 1: random spin
      box.style.transition = `transform ${spinSeconds}s ${easing}`;
      box.style.transform  = `rotateX(${randX}deg) rotateY(${randY}deg) rotateZ(${randZ}deg)`;

      // STEP 2: return to front near the end
      setTimeout(() => {
        box.style.transition = `transform ${backTime}s ${easing}`;
        box.style.transform  = 'rotateX(0deg) rotateY(0deg) rotateZ(0deg)';
      }, (spinSeconds - backTime) * 1000);

      // When the return finishes, show popup
      const onReturnEnd = (ev) => {
        if (ev.propertyName !== 'transform') return;
        box.removeEventListener('transitionend', onReturnEnd);

        popup.hidden = false; // show CTA popup
        isOpening = false;
        // not marking isOpened yet — only after CTA click
      };
      box.addEventListener('transitionend', onReturnEnd);

    } else {
      // optional: tiny bounce if opened already
      box.classList.add('opened');
      setTimeout(() => box.classList.remove('opened'), 500);
    }
  };

  // CTA reveals present
  cta.addEventListener('click', () => {
    popup.hidden = true;
    revealZone.hidden = false;
    tiny.hidden = true;
    revealZone.classList.remove('fade-in-present');
    // play the entrance animation
    void revealZone.offsetWidth;
    revealZone.classList.add('fade-in-present');

    isOpened = true; // mark opened for this session (not persisted)
  });

  // tap / keyboard to spin
  box.addEventListener('click', trigger);
  box.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); trigger(); }
  });
});
