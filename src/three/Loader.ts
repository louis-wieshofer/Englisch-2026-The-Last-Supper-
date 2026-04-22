import * as THREE from 'three';

export class Loader {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  private renderer!: THREE.WebGLRenderer;
  private globe = new THREE.Group();
  private grains: Array<{ mesh: THREE.Mesh; target: THREE.Vector3; delay: number; start: THREE.Vector3 }> = [];
  private startTime = performance.now();
  private duration = 2600;
  private raf = 0;
  private done = false;
  private onComplete?: () => void;

  constructor() {
    this.camera.position.z = 3.4;
  }

  mount(container: HTMLElement, onComplete?: () => void): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(240, 240, false);
    this.onComplete = onComplete;
    container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const key = new THREE.DirectionalLight(0xfaf0ca, 1.2);
    key.position.set(2, 3, 2);
    this.scene.add(key);
    const warm = new THREE.PointLight(0xf4a259, 1.4, 6);
    warm.position.set(0, 0, 2);
    this.scene.add(warm);

    this.scene.add(this.globe);

    const N = 280;
    const geo = new THREE.SphereGeometry(0.022, 6, 4);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xf4a259, roughness: 0.6, emissive: 0xf4a259, emissiveIntensity: 0.2,
    });
    for (let i = 0; i < N; i++) {
      const y = 1 - (i / (N - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = Math.PI * (3 - Math.sqrt(5)) * i;
      const target = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);

      const m = new THREE.Mesh(geo, mat);
      m.scale.set(0.7, 2, 0.7);
      const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
      const startDist = 3 + Math.random() * 3;
      const start = dir.clone().multiplyScalar(startDist);
      m.position.copy(start);
      this.globe.add(m);
      this.grains.push({ mesh: m, target, delay: Math.random() * 0.4, start });
    }

    this.startTime = performance.now();
    this.tick();
  }

  private ease(t: number): number { return 1 - Math.pow(1 - t, 3); }

  private tick = (): void => {
    const elapsed = (performance.now() - this.startTime) / this.duration;
    this.grains.forEach((g) => {
      const p = Math.max(0, Math.min(1, (elapsed - g.delay) / (1 - g.delay)));
      const e = this.ease(p);
      g.mesh.position.lerpVectors(g.start, g.target, e);
    });
    this.globe.rotation.y += 0.01;
    this.renderer.render(this.scene, this.camera);
    if (elapsed >= 1 && !this.done) {
      this.done = true;
      setTimeout(() => this.onComplete?.(), 400);
    }
    if (elapsed < 1.2) {
      this.raf = requestAnimationFrame(this.tick);
    }
  };

  progress(): number {
    return Math.min(1, (performance.now() - this.startTime) / this.duration);
  }

  dispose(): void {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else (mat as THREE.Material | undefined)?.dispose?.();
    });
  }
}
