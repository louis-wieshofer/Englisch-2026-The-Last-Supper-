// Silent-by-default audio controller. When MP3 files exist under src/assets/audio/*,
// drop their URLs into AUDIO_SOURCES and the toggle will play/pause them. Until then
// the toggle is a visible but harmless no-op — it never throws.

interface AudioSource { id: string; url?: string; }

const AUDIO_SOURCES: AudioSource[] = [
  { id: 'hero' },
  { id: 'supermarket' },
  { id: 'fridge' },
];

const elements = new Map<string, HTMLAudioElement>();

export const initAudio = (): void => {
  const btn = document.querySelector<HTMLButtonElement>('[data-audio-toggle]');
  if (!btn) return;

  AUDIO_SOURCES.forEach(({ id, url }) => {
    if (!url) return;
    const a = new Audio(url);
    a.loop = true;
    a.volume = 0.25;
    elements.set(id, a);
  });

  let on = false;
  btn.addEventListener('click', () => {
    on = !on;
    btn.setAttribute('aria-pressed', String(on));
    elements.forEach((el) => {
      if (on) {
        void el.play().catch(() => { /* ignore autoplay block */ });
      } else {
        el.pause();
      }
    });
  });
};
