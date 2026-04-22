const INTERACTIVE = 'a, button, .flip-card, .fridge-drawer, [data-magnetic]';

export const initCursor = (): void => {
  if (window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 900) return;

  const root = document.createElement('div');
  root.className = 'cursor';
  root.innerHTML = `<div class="cursor-ring"></div><div class="cursor-dot"></div>`;
  document.body.appendChild(root);
  root.style.display = 'block';
  document.documentElement.classList.add('has-custom-cursor');

  const ring = root.querySelector<HTMLDivElement>('.cursor-ring')!;
  const dot = root.querySelector<HTMLDivElement>('.cursor-dot')!;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let rx = mx;
  let ry = my;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
  }, { passive: true });

  const tick = () => {
    rx += (mx - rx) * 0.18;
    ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  document.addEventListener('mouseover', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest?.(INTERACTIVE)) {
      document.documentElement.classList.add('cursor-interactive');
    }
  });
  document.addEventListener('mouseout', (e) => {
    const t = e.target as HTMLElement;
    if (t.closest?.(INTERACTIVE)) {
      document.documentElement.classList.remove('cursor-interactive');
    }
  });
};
