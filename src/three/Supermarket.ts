import * as THREE from 'three';
import { gsap } from 'gsap';
import type { ManagedScene } from './SceneManager';

interface ShelfItem {
  mesh: THREE.Mesh;
  home: THREE.Vector3;
  shelfIndex: number;
  slotIndex: number;
  dropped: boolean;
}

const ITEM_COLORS = [0xbc4749, 0xf4a259, 0xe0ca3c, 0xfaf0ca, 0x588157, 0x7a6a3f];

export class Supermarket implements ManagedScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  private renderer!: THREE.WebGLRenderer;
  private items: ShelfItem[] = [];
  private dumpster!: THREE.Mesh;
  private ro?: ResizeObserver;
  private raf = 0;
  private running = false;
  private dropTimer = 0;
  private wasteCount = 0;
  private onWaste?: (count: number) => void;

  constructor() {
    this.camera.position.set(0, 0.8, 6.2);
    this.camera.lookAt(0, 0, 0);
  }

  setWasteListener(cb: (count: number) => void): void {
    this.onWaste = cb;
  }

  mount(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xfaf0ca, 1.1);
    key.position.set(3, 5, 4);
    this.scene.add(key);
    const amber = new THREE.PointLight(0xf4a259, 0.6, 12);
    amber.position.set(-2, 2, 2);
    this.scene.add(amber);

    // Backdrop (subtle gradient plane)
    const back = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e1c19, roughness: 1 })
    );
    back.position.z = -3;
    this.scene.add(back);

    // Aisle floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 4),
      new THREE.MeshStandardMaterial({ color: 0x161513, roughness: 0.9 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.8;
    this.scene.add(floor);

    // 3 shelf rows
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3a3530, roughness: 0.85 });
    const shelfGeo = new THREE.BoxGeometry(8, 0.08, 1.1);
    const shelfYs = [1.2, 0.2, -0.8];
    shelfYs.forEach((y) => {
      const s = new THREE.Mesh(shelfGeo, shelfMat);
      s.position.set(0, y, 0);
      this.scene.add(s);
    });

    // ~30 grocery items spread across shelves
    const itemGeos = [
      new THREE.BoxGeometry(0.3, 0.5, 0.3),
      new THREE.CylinderGeometry(0.18, 0.18, 0.5, 16),
      new THREE.CylinderGeometry(0.14, 0.14, 0.32, 16),
      new THREE.BoxGeometry(0.4, 0.28, 0.3),
      new THREE.SphereGeometry(0.2, 12, 10),
    ];
    shelfYs.forEach((y, shelfIdx) => {
      const count = 10;
      for (let i = 0; i < count; i++) {
        const slotX = -3.6 + (i / (count - 1)) * 7.2;
        const geo = itemGeos[Math.floor(Math.random() * itemGeos.length)];
        const color = ITEM_COLORS[Math.floor(Math.random() * ITEM_COLORS.length)];
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1 });
        const mesh = new THREE.Mesh(geo, mat);
        const sizeY = (geo as THREE.BufferGeometry).boundingBox?.max.y ?? 0.3;
        mesh.position.set(slotX, y + 0.04 + 0.28 - sizeY, 0);
        mesh.rotation.y = Math.random() * Math.PI;
        // Give items semantic names for a11y/debugging
        mesh.name = `item-shelf${shelfIdx}-slot${i}`;
        this.scene.add(mesh);
        this.items.push({
          mesh,
          home: mesh.position.clone(),
          shelfIndex: shelfIdx,
          slotIndex: i,
          dropped: false,
        });
      }
    });

    // Dumpster in front
    const dumpGeo = new THREE.BoxGeometry(2, 1, 1.2);
    const dumpMat = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 0.9 });
    this.dumpster = new THREE.Mesh(dumpGeo, dumpMat);
    this.dumpster.position.set(0, -1.3, 2.2);
    this.scene.add(this.dumpster);

    this.ro = new ResizeObserver(() => {
      if (!container.isConnected) return;
      const W = container.clientWidth;
      const H = container.clientHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H, false);
    });
    this.ro.observe(container);

    this.resume();
  }

  private dropRandom(): void {
    const available = this.items.filter((i) => !i.dropped);
    if (!available.length) return;
    const item = available[Math.floor(Math.random() * available.length)];
    item.dropped = true;
    this.wasteCount++;
    this.onWaste?.(this.wasteCount);

    const target = new THREE.Vector3(
      this.dumpster.position.x + (Math.random() - 0.5) * 0.8,
      this.dumpster.position.y + 0.3,
      this.dumpster.position.z
    );
    const arcPeak = { y: item.home.y + 1.4 };

    // Parabolic arc via timeline
    const tl = gsap.timeline();
    tl.to(item.mesh.position, {
      x: (item.home.x + target.x) / 2,
      y: arcPeak.y,
      z: (item.home.z + target.z) / 2,
      duration: 0.45,
      ease: 'sine.out',
    })
      .to(item.mesh.position, {
        x: target.x,
        y: target.y,
        z: target.z,
        duration: 0.45,
        ease: 'sine.in',
      });
    gsap.to(item.mesh.rotation, { x: Math.PI * 2, y: Math.PI, duration: 0.9, ease: 'none' });
    // After landing, fade out and hide
    gsap.to(item.mesh.position, { y: target.y - 0.6, duration: 0.4, delay: 0.95, ease: 'sine.in' });
    gsap.to(item.mesh.scale, { x: 0, y: 0, z: 0, duration: 0.3, delay: 1.1, ease: 'expo.in' });
  }

  private tick = (): void => {
    if (!this.running) return;
    this.dropTimer += 16;
    // between 600ms and 1500ms
    if (this.dropTimer > 600 + Math.random() * 900) {
      this.dropTimer = 0;
      this.dropRandom();
    }
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
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else (mat as THREE.Material | undefined)?.dispose?.();
    });
  }
}
