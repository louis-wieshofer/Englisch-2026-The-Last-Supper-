import { Supermarket } from '../three/Supermarket';
import type { SceneManager } from '../three/SceneManager';

const fmt = new Intl.NumberFormat('en-US');

export const initSupermarket = (sceneManager: SceneManager): void => {
  const el = document.querySelector<HTMLElement>('#supermarket-scene');
  const counter = document.querySelector<HTMLElement>('[data-waste-count]');
  if (!el) return;
  const sm = new Supermarket();
  if (counter) {
    sm.setWasteListener((n) => {
      counter.textContent = fmt.format(n);
    });
  }
  sceneManager.register(el, sm);
};
