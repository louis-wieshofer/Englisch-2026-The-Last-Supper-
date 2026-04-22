import { Scale } from '../three/Scale';
import type { SceneManager } from '../three/SceneManager';

export const initParadox = (sceneManager: SceneManager): void => {
  const sceneEl = document.querySelector<HTMLElement>('#paradox-scene');
  const section = document.querySelector<HTMLElement>('#paradox');
  if (!sceneEl || !section) return;

  const scale = new Scale();
  sceneManager.register(sceneEl, scale);

  // Tilt driven by scroll progress through the section
  const onScroll = (): void => {
    const rect = section.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
    scale.setTilt(-0.1 - p * 0.34);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
};
