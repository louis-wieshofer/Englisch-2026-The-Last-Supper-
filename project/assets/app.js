// Main prototype orchestrator
import { initGlobe, initScale, initLoader } from './three-scenes.js';

// ───────── Loader ─────────
const loaderEl = document.getElementById('loader');
const loaderCanvas = document.getElementById('loader-canvas');
const loaderBar = document.getElementById('loader-bar');
let loader = null;
if (loaderCanvas) {
  loader = initLoader(loaderCanvas, () => {
    loaderEl.classList.add('hidden');
    document.body.classList.add('ready');
    // Trigger hero reveal
    setTimeout(() => {
      document.querySelectorAll('.hero .reveal, .hero .word-reveal').forEach(el => el.classList.add('in'));
    }, 120);
  });
  const tick = () => {
    if (loader) loaderBar.style.width = (loader.progress() * 100) + '%';
    if (!loaderEl.classList.contains('hidden')) requestAnimationFrame(tick);
  };
  tick();
}

// ───────── Hero globe ─────────
const globeSlot = document.getElementById('hero-globe');
let heroGlobe = null;
if (globeSlot) {
  heroGlobe = initGlobe(globeSlot);
}

// ───────── Paradox scale ─────────
const scaleContainer = document.getElementById('paradox-scale');
let scaleInst = null;
if (scaleContainer) {
  scaleInst = initScale(scaleContainer);
}

// ───────── Counters ─────────
function animateCounter(el, target, duration = 2500) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const e = 1 - Math.pow(1 - t, 4); // ease-out-quart
    const val = Math.floor(target * e);
    el.textContent = val.toLocaleString('en-US');
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ───────── IntersectionObserver for reveals & counters ─────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    if (el.classList.contains('reveal') || el.classList.contains('word-reveal')) {
      el.classList.add('in');
    }
    if (el.dataset.counter && !el.dataset.counted) {
      el.dataset.counted = '1';
      animateCounter(el, parseInt(el.dataset.counter, 10));
    }
    io.unobserve(el);
  });
}, { threshold: 0.25, rootMargin: '0px 0px -10% 0px' });

document.querySelectorAll('.reveal, .word-reveal, [data-counter]').forEach(el => io.observe(el));

// Wrap paragraphs for word-by-word reveals (already done in HTML via .word-reveal class)
document.querySelectorAll('[data-split-words]').forEach(el => {
  const text = el.textContent;
  el.innerHTML = text.split(/\s+/).map(w =>
    `<span class="w"><span style="transition-delay:${Math.random() * 80}ms">${w}&nbsp;</span></span>`
  ).join('');
});

// ───────── Scroll progress bar ─────────
const progBar = document.getElementById('scroll-progress');
function updateProgress() {
  const h = document.documentElement;
  const p = h.scrollTop / (h.scrollHeight - h.clientHeight);
  if (progBar) progBar.style.width = (p * 100) + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// ───────── Nav shrink on scroll ─────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (!nav) return;
  if (window.scrollY > 40) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
}, { passive: true });

// ───────── Custom cursor ─────────
(function() {
  if (window.matchMedia('(pointer: coarse)').matches) return;
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.innerHTML = `
    <span class="cursor-dot-inner">
    <svg viewBox="0 0 32 36" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <!-- handle -->
      <path class="handle" d="M12 3 Q16 0.5 20 3"/>
      <!-- lid -->
      <rect class="lid"  x="3"  y="5"  width="26" height="5" rx="1.6"/>
      <rect class="lid2" x="5"  y="5.8" width="22" height="1.4" rx="0.7"/>
      <!-- body -->
      <path class="body" d="M5.5 10 L7 33 Q7.1 34.6 8.8 34.6 L23.2 34.6 Q24.9 34.6 25 33 L26.5 10 Z"/>
      <!-- ribs -->
      <path class="rib" d="M12 13 L12 31"/>
      <path class="rib" d="M16 13 L16 31"/>
      <path class="rib" d="M20 13 L20 31"/>
    </svg>
    </span>`;
  document.body.appendChild(dot);
  document.body.classList.add('custom-cursor');

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  window.addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
  function loop() {
    dot.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%)`;
    requestAnimationFrame(loop);
  }
  loop();

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest('a, button, .flip-card, .fridge .door, .nav-icon-btn, .tweaks .pill, .tweaks .sw')) {
      document.body.classList.add('cursor-interactive');
    }
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest('a, button, .flip-card, .fridge .door, .nav-icon-btn, .tweaks .pill, .tweaks .sw')) {
      document.body.classList.remove('cursor-interactive');
    }
  });
})();

// ───────── Hero particle field ─────────
(function() {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  function resize() {
    w = canvas.width = canvas.offsetWidth * devicePixelRatio;
    h = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 70; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
      vy: (Math.random() - 0.5) * 0.1 * devicePixelRatio,
      len: 4 + Math.random() * 10,
      alpha: 0.2 + Math.random() * 0.4,
    });
  }
  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mx = (e.clientX - r.left) * devicePixelRatio;
    my = (e.clientY - r.top) * devicePixelRatio;
  });
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      const dx = p.x - mx, dy = p.y - my;
      const d = Math.sqrt(dx*dx + dy*dy);
      const force = Math.max(0, 120 * devicePixelRatio - d) / (120 * devicePixelRatio);
      const ox = (dx / (d || 1)) * force * 5 * devicePixelRatio;
      const oy = (dy / (d || 1)) * force * 5 * devicePixelRatio;
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.strokeStyle = `rgba(244, 162, 89, ${p.alpha})`;
      ctx.lineWidth = 1.4 * devicePixelRatio;
      ctx.beginPath();
      ctx.moveTo(p.x + ox, p.y + oy);
      ctx.lineTo(p.x + ox, p.y + oy + p.len * devicePixelRatio);
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ───────── Supermarket scene — items fall, counter increments ─────────
(function() {
  const scene = document.querySelector('.market-scene');
  if (!scene) return;
  const items = scene.querySelectorAll('.item');
  const counterEl = scene.querySelector('.overlay-hud .n');
  let count = 0;
  let idx = 0;
  function dropOne() {
    const available = [...items].filter(i => !i.classList.contains('falling'));
    if (available.length === 0) {
      // Reset them
      items.forEach(i => i.classList.remove('falling'));
      return setTimeout(dropOne, 400);
    }
    const pick = available[Math.floor(Math.random() * available.length)];
    pick.classList.add('falling');
    count++;
    if (counterEl) counterEl.textContent = count.toLocaleString('en-US');
    setTimeout(dropOne, 600 + Math.random() * 900);
  }
  // Only run when visible
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(dropOne, 400);
        obs.disconnect();
      }
    });
  }, { threshold: 0.3 });
  obs.observe(scene);
})();

// ───────── Fridge doors ─────────
document.querySelectorAll('.fridge .door').forEach(d => {
  d.addEventListener('click', () => {
    d.classList.toggle('open');
  });
});

// ───────── Flip cards ─────────
document.querySelectorAll('.flip-card').forEach(card => {
  card.addEventListener('click', () => card.classList.toggle('flipped'));
  // Magnetic hover
  card.addEventListener('mousemove', (e) => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / r.width;
    const dy = (e.clientY - cy) / r.height;
    card.querySelector('.inner').style.transform = (card.classList.contains('flipped')
      ? `rotateY(180deg) translate3d(${-dx * 6}px, ${-dy * 6}px, 0)`
      : `translate3d(${dx * 6}px, ${dy * 6}px, 0)`);
  });
  card.addEventListener('mouseleave', () => {
    card.querySelector('.inner').style.transform = '';
  });
});

// ───────── Paradox scale scroll interaction ─────────
(function() {
  if (!scaleInst) return;
  const section = document.querySelector('.paradox');
  if (!section) return;
  window.addEventListener('scroll', () => {
    const r = section.getBoundingClientRect();
    const vh = window.innerHeight;
    // Progress as section moves from bottom of viewport to top
    const p = Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height)));
    // Tilt grows from -0.1 to -0.42 as user scrolls through section
    const target = -0.1 - p * 0.34;
    scaleInst.setTilt(target);
  }, { passive: true });
})();

// ───────── Tweaks panel (edit mode) ─────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "dark",
  "accent": "amber",
  "motion": "full"
}/*EDITMODE-END*/;

let tweaks = { ...TWEAK_DEFAULTS };

const accentMap = {
  amber: '#F4A259',
  crimson: '#BC4749',
  gold: '#E0CA3C',
};

function applyTweaks() {
  document.documentElement.dataset.theme = tweaks.theme;
  document.documentElement.dataset.motion = tweaks.motion;
  document.documentElement.style.setProperty('--accent', accentMap[tweaks.accent]);
  // Update pills
  document.querySelectorAll('.tweaks .pill, .tweaks .sw').forEach(el => {
    const group = el.dataset.group;
    const val = el.dataset.value;
    if (group && val !== undefined) {
      el.classList.toggle('active', tweaks[group] === val);
    }
  });
  // Notify host if present
  try {
    window.parent.postMessage({ type: '__edit_mode_set_keys', edits: tweaks }, '*');
  } catch (e) {}
}

const tweaksPanel = document.getElementById('tweaks');
function setTweaksOpen(open) { tweaksPanel.classList.toggle('open', open); }

document.querySelectorAll('.tweaks .pill, .tweaks .sw').forEach(el => {
  el.addEventListener('click', () => {
    const group = el.dataset.group;
    const val = el.dataset.value;
    if (!group) return;
    tweaks[group] = val;
    applyTweaks();
  });
});

// Register edit-mode listener FIRST, then announce
window.addEventListener('message', (e) => {
  if (!e.data || typeof e.data !== 'object') return;
  if (e.data.type === '__activate_edit_mode') setTweaksOpen(true);
  if (e.data.type === '__deactivate_edit_mode') setTweaksOpen(false);
});
try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch (e) {}

// Local theme toggle button
const themeBtn = document.getElementById('theme-toggle');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    tweaks.theme = tweaks.theme === 'dark' ? 'light' : 'dark';
    applyTweaks();
  });
}

const tweaksClose = document.getElementById('tweaks-close');
if (tweaksClose) tweaksClose.addEventListener('click', () => setTweaksOpen(false));

applyTweaks();

// Initial reveal for above-the-fold if loader already gone
setTimeout(() => {
  document.querySelectorAll('.hero .reveal, .hero .word-reveal').forEach(el => el.classList.add('in'));
  updateProgress();
}, 50);
