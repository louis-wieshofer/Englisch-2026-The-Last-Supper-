import { Loader } from '../three/Loader';

export const initLoadingScreen = (onComplete: () => void): void => {
  const overlay = document.querySelector<HTMLElement>('#loader');
  const canvasEl = document.querySelector<HTMLElement>('#loader-canvas');
  const bar = document.querySelector<HTMLElement>('#loader-bar');
  if (!overlay || !canvasEl) {
    onComplete();
    return;
  }

  let fired = false;
  const finish = (loader?: Loader): void => {
    if (fired) return;
    fired = true;
    overlay.classList.add('is-hidden');
    setTimeout(() => {
      overlay.style.display = 'none';
      loader?.dispose();
      onComplete();
    }, 650);
  };

  // Safety timeout: always proceed after 3.4s even if WebGL failed to init
  const safety = setTimeout(() => finish(), 3400);

  try {
    const loader = new Loader();
    loader.mount(canvasEl, () => {
      clearTimeout(safety);
      finish(loader);
    });

    if (bar) {
      const upd = (): void => {
        bar.style.width = `${Math.floor(loader.progress() * 100)}%`;
        if (loader.progress() < 1 && !fired) requestAnimationFrame(upd);
      };
      requestAnimationFrame(upd);
    }
  } catch {
    clearTimeout(safety);
    finish();
  }
};
