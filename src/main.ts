import './styles/tokens.css';
import './styles/base.css';
import './styles/nav.css';
import './styles/cursor.css';
import './styles/sections/hero.css';

import { initSmoothScroll } from './lib/lenis';
import { initCursor } from './lib/cursor';
import { initMagnetic } from './lib/magnetic';
import { initReveals } from './lib/reveal';
import { initCounters } from './lib/counter';
import { initAudio } from './lib/audio';
import { SceneManager } from './three/SceneManager';
import { initHero } from './sections/Hero';

const onReady = (cb: () => void): void => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cb, { once: true });
  } else {
    cb();
  }
};

onReady(() => {
  initSmoothScroll();

  const sceneManager = new SceneManager();
  initHero(sceneManager);

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
});
