import { gsap } from 'gsap';
import 'gsap/ScrollTrigger';
import { reducedMotion } from './motion';

const prepare = (el: HTMLElement): HTMLSpanElement[] => {
  if (el.dataset.revealPrepared === '1') {
    return Array.from(el.querySelectorAll<HTMLSpanElement>('.w > span'));
  }
  const text = el.textContent ?? '';
  el.textContent = '';
  el.classList.add('word-reveal');
  const spans: HTMLSpanElement[] = [];
  text.split(/(\s+)/).forEach((token) => {
    if (/^\s+$/.test(token)) {
      el.appendChild(document.createTextNode(token));
      return;
    }
    const word = document.createElement('span');
    word.className = 'w';
    const inner = document.createElement('span');
    inner.textContent = token;
    word.appendChild(inner);
    el.appendChild(word);
    spans.push(inner);
  });
  el.dataset.revealPrepared = '1';
  return spans;
};

export const initReveals = (): void => {
  const els = document.querySelectorAll<HTMLElement>('[data-reveal]');
  const reduced = reducedMotion();

  els.forEach((el) => {
    const spans = prepare(el);
    const stagger = parseFloat(el.dataset.revealStagger ?? '30') / 1000;
    const duration = parseFloat(el.dataset.revealDuration ?? '800') / 1000;

    if (reduced) {
      spans.forEach((s) => { s.style.transform = 'translateY(0)'; });
      return;
    }

    gsap.fromTo(
      spans,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration,
        ease: 'expo.out',
        stagger,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      }
    );
  });
};
