import './styles/tokens.css';
import './styles/base.css';
import './styles/nav.css';
import './styles/cursor.css';
import './styles/sections/loader.css';
import './styles/sections/hero.css';
import './styles/sections/paradox.css';
import './styles/sections/supermarket.css';
import './styles/sections/fridge.css';
import './styles/sections/solutions.css';
import './styles/sections/outro.css';
import './styles/sections/footer.css';

import { initSmoothScroll } from './lib/lenis';
import { initCursor } from './lib/cursor';
import { initMagnetic } from './lib/magnetic';
import { initReveals } from './lib/reveal';
import { initCounters } from './lib/counter';
import { initAudio } from './lib/audio';
import { SceneManager } from './three/SceneManager';
import { initHero } from './sections/Hero';
import { initParadox } from './sections/Paradox';
import { initSupermarket } from './sections/Supermarket';
import { initFridge } from './sections/Fridge';
import { initSolutions } from './sections/Solutions';
import { initLoadingScreen } from './sections/LoadingScreen';

const onReady = (cb: () => void): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  } else {
    cb();
  }
};

const mountSite = (): void => {
  initSmoothScroll();

  const sceneManager = new SceneManager();
  initHero(sceneManager);
  initParadox(sceneManager);
  initSupermarket(sceneManager);
  initFridge(sceneManager);
  initSolutions();

  initCursor();
  initMagnetic();
  initReveals();
  initCounters();
  initAudio();

  // Scroll progress bar
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (bar) {
    const update = (): void => {
      const sh = document.documentElement.scrollHeight - window.innerHeight;
      const p = sh > 0 ? window.scrollY / sh : 0;
      bar.style.width = `${p * 100}%`;
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  // Nav shrink
  const nav = document.querySelector<HTMLElement>('.nav');
  if (nav) {
    const onScroll = (): void => {
      nav.classList.toggle('scrolled', window.scrollY > 40);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Back to top
  document.querySelectorAll<HTMLAnchorElement>('[data-back-to-top]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
};

onReady(() => {
  initLoadingScreen(() => {
    mountSite();
  });
});
