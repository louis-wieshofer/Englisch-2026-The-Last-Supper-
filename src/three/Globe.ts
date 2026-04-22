import * as THREE from 'three';
import type { ManagedScene } from './SceneManager';

const latLonToXYZ = (lat: number, lon: number, r = 1.005): THREE.Vector3 => {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
     r * Math.cos(phi),
     r * Math.sin(phi) * Math.sin(theta)
  );
};

export class Globe implements ManagedScene {
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private globe!: THREE.Mesh;
  private dotsGroup = new THREE.Group();
  private hotspots: Array<{ mesh: THREE.Mesh; sev: number; seed: number }> = [];
  private ro?: ResizeObserver;
  private raf = 0;
  private running = false;
  private t0 = performance.now();

  constructor() {
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.z = 3.2;
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  mount(container: HTMLElement): void {
    const size = Math.min(container.clientWidth, container.clientHeight) || 200;
    this.renderer.setSize(size, size, false);
    container.appendChild(this.renderer.domElement);

    const geo = new THREE.SphereGeometry(1, 64, 64);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x161513,
      roughness: 0.85,
      metalness: 0.05,
      emissive: 0x1a1816,
      emissiveIntensity: 0.4,
    });
    this.globe = new THREE.Mesh(geo, baseMat);
    this.globe.rotation.z = THREE.MathUtils.degToRad(23.5);
    this.scene.add(this.globe);
    this.globe.add(this.dotsGroup);

    this.buildHotspots();
    this.buildRing();
    this.buildLights();

    this.ro = new ResizeObserver(() => {
      const s = Math.min(container.clientWidth, container.clientHeight) || 200;
      this.renderer.setSize(s, s, false);
    });
    this.ro.observe(container);

    this.resume();
  }

  private buildHotspots(): void {
    const clusters: Array<[number, number, number, number, number, number, number]> = [
      // [lat0, latRange, lon0, lonRange, count, sevMin, sevMax]
      [-15, 30, 0, 50, 80, 0.7, 1.0],
      [5, 25, 65, 30, 50, 0.6, 1.0],
      [-5, 20, 95, 30, 25, 0.4, 0.8],
      [-20, 30, -80, 30, 30, 0.3, 0.7],
      [-80, 160, -180, 360, 120, 0.1, 0.3],
    ];
    const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);
    clusters.forEach(([lat0, latR, lon0, lonR, count, sMin, sMax]) => {
      for (let i = 0; i < count; i++) {
        const lat = lat0 + Math.random() * latR;
        const lon = lon0 + Math.random() * lonR;
        const sev = sMin + Math.random() * (sMax - sMin);
        const pos = latLonToXYZ(lat, lon, 1.01);
        const color = new THREE.Color(
          sev > 0.6 ? 0xbc4749 : sev > 0.35 ? 0xf4a259 : 0xe0ca3c
        );
        const mat = new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.4 + sev * 0.6,
        });
        const m = new THREE.Mesh(dotGeo, mat);
        m.position.copy(pos);
        this.dotsGroup.add(m);
        this.hotspots.push({ mesh: m, sev, seed: Math.random() * Math.PI * 2 });
      }
    });
  }

  private buildRing(): void {
    const ringGeo = new THREE.RingGeometry(1.08, 1.1, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xf4a259,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2.2;
    this.scene.add(ring);
  }

  private buildLights(): void {
    const key = new THREE.DirectionalLight(0xf4a259, 1.4);
    key.position.set(-2, 1.2, 2);
    this.scene.add(key);
    const rim = new THREE.DirectionalLight(0xbc4749, 0.7);
    rim.position.set(2, -1, -1);
    this.scene.add(rim);
    this.scene.add(new THREE.AmbientLight(0x3a3530, 0.5));
  }

  private tick = (): void => {
    if (!this.running) return;
    const t = (performance.now() - this.t0) / 1000;
    this.globe.rotation.y += 0.0035;
    this.globe.rotation.x = THREE.MathUtils.degToRad(23.5) + Math.sin(t * 0.4) * 0.05;
    this.hotspots.forEach((h, i) => {
      const mat = h.mesh.material as THREE.MeshBasicMaterial;
      const base = 0.4 + h.sev * 0.6;
      mat.opacity = base + Math.sin(t * 1.4 + h.seed + i * 0.1) * 0.12;
    });
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  pause(): void {
    this.running = false;
    if (this.raf) cancelAnimationFrame(this.raf);
  }

  resume(): void {
    if (this.running) return;
    this.running = true;
    this.raf = requestAnimationFrame(this.tick);
  }

  dispose(): void {
    this.pause();
    this.ro?.disconnect();
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.scene.traverse((obj) => {
      const m = obj as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else (mat as THREE.Material | undefined)?.dispose?.();
    });
  }
}
