import { Globe } from '../three/Globe';
import { HeroParticles } from '../three/HeroParticles';
import type { SceneManager } from '../three/SceneManager';

export const initHero = (sceneManager: SceneManager): void => {
  const particlesEl = document.querySelector<HTMLElement>('#hero-particles');
  const globeEl = document.querySelector<HTMLElement>('#hero-globe');
  if (!particlesEl || !globeEl) return;

  sceneManager.register(particlesEl, new HeroParticles(500));
  sceneManager.register(globeEl, new Globe());
};
