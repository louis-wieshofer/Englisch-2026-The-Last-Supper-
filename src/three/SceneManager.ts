export interface ManagedScene {
  mount(el: HTMLElement): void;
  pause?(): void;
  resume?(): void;
  dispose(): void;
}

interface Entry {
  el: HTMLElement;
  scene: ManagedScene;
  mounted: boolean;
  active: boolean;
  failed?: boolean;
}

export class SceneManager {
  private entries: Entry[] = [];
  private io: IntersectionObserver;

  constructor() {
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const e = this.entries.find((x) => x.el === entry.target);
          if (!e || e.failed) return;
          if (entry.isIntersecting) {
            if (!e.mounted) {
              try {
                e.scene.mount(e.el);
                e.mounted = true;
              } catch (err) {
                e.failed = true;
                console.warn('[SceneManager] scene mount failed, skipping:', err);
                return;
              }
            }
            if (!e.active) {
              try { e.scene.resume?.(); } catch { /* ignore */ }
              e.active = true;
            }
          } else if (e.active) {
            try { e.scene.pause?.(); } catch { /* ignore */ }
            e.active = false;
          }
        });
      },
      { rootMargin: '150% 0% 150% 0%', threshold: 0 }
    );
  }

  register(el: HTMLElement, scene: ManagedScene): void {
    this.entries.push({ el, scene, mounted: false, active: false });
    this.io.observe(el);
  }

  mountAllEagerly(): void {
    this.entries.forEach((e) => {
      if (e.failed || e.mounted) return;
      try {
        e.scene.mount(e.el);
        e.mounted = true;
        e.active = true;
      } catch (err) {
        e.failed = true;
        console.warn('[SceneManager] eager mount failed:', err);
      }
    });
  }

  disposeAll(): void {
    this.io.disconnect();
    this.entries.forEach((e) => e.scene.dispose());
    this.entries = [];
  }
}
