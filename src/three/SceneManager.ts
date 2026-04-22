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
}

export class SceneManager {
  private entries: Entry[] = [];
  private io: IntersectionObserver;

  constructor() {
    this.io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const e = this.entries.find((x) => x.el === entry.target);
          if (!e) return;
          if (entry.isIntersecting) {
            if (!e.mounted) {
              e.scene.mount(e.el);
              e.mounted = true;
            }
            if (!e.active) {
              e.scene.resume?.();
              e.active = true;
            }
          } else if (e.active) {
            e.scene.pause?.();
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
      if (!e.mounted) {
        e.scene.mount(e.el);
        e.mounted = true;
        e.active = true;
      }
    });
  }

  disposeAll(): void {
    this.io.disconnect();
    this.entries.forEach((e) => e.scene.dispose());
    this.entries = [];
  }
}
