import { gsap } from 'gsap';
import 'gsap/ScrollTrigger';
import { reducedMotion } from './motion';

const fmt = new Intl.NumberFormat('en-US');

export const initCounters = (): void => {
  const els = document.querySelectorAll<HTMLElement>('[data-counter]');
  const reduced = reducedMotion();

  els.forEach((el) => {
    const target = parseInt(el.dataset.counter ?? '0', 10);
    if (reduced) {
      el.textContent = fmt.format(target);
      return;
    }

    const state = { v: 0 };
    gsap.to(state, {
      v: target,
      duration: 2.5,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true,
      },
      onUpdate: () => {
        el.textContent = fmt.format(Math.floor(state.v));
      },
    });
  });
};
