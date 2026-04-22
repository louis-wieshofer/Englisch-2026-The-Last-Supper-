import { Fridge } from '../three/Fridge';
import type { SceneManager } from '../three/SceneManager';

export const initFridge = (sceneManager: SceneManager): void => {
  const el = document.querySelector<HTMLElement>('#fridge-scene');
  if (!el) return;
  sceneManager.register(el, new Fridge());
};
