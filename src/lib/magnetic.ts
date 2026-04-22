import { gsap } from 'gsap';
import { reducedMotion } from './motion';

export const initMagnetic = (): void => {
  if (reducedMotion()) return;
  const els = document.querySelectorAll<HTMLElement>('[data-magnetic]');
  els.forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '16');
    const radius = 60;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const d = Math.min(1, Math.hypot(dx, dy) / (Math.max(rect.width, rect.height) / 2 + radius));
      gsap.to(el, {
        x: (dx / rect.width) * strength * (1 - d * 0.2),
        y: (dy / rect.height) * strength * (1 - d * 0.2),
        duration: 0.4,
        ease: 'expo.out',
      });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'expo.out' });
    });
  });
};
