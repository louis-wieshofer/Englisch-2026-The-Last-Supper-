import * as THREE from 'three';
import { gsap } from 'gsap';
import type { ManagedScene } from './SceneManager';

interface Drawer {
  group: THREE.Group;
  labels: THREE.Sprite[];
  open: boolean;
}

const FOOD_PER_DRAWER: Array<[string, string][]> = [
  [
    ['Spinach', 'forgotten 14 days'],
    ['Yogurt', 'expired 3 days'],
    ['Lemon', 'dried out'],
  ],
  [
    ['Milk', 'forgotten 8 days'],
    ['Cheese', 'moldy edge'],
    ['Bread', 'hardened'],
  ],
  [
    ['Raspberries', 'forgotten 9 days'],
    ['Leftovers', 'from Sunday'],
    ['Butter', 'unopened'],
  ],
];

const makeLabelTexture = (name: string, note: string): THREE.CanvasTexture => {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = 'rgba(10,9,8,0.75)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FAF0CA';
  ctx.font = '600 36px "Inter", sans-serif';
  ctx.fillText(name, 24, 52);
  ctx.fillStyle = '#F4A259';
  ctx.font = '400 26px "JetBrains Mono", monospace';
  ctx.fillText(note, 24, 96);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
};

export class Fridge implements ManagedScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 0.6, 0.1, 100);
  private renderer!: THREE.WebGLRenderer;
  private drawers: Drawer[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private ro?: ResizeObserver;
  private raf = 0;
  private running = false;
  private container?: HTMLElement;

  constructor() {
    this.camera.position.set(0, 0, 3.4);
  }

  mount(container: HTMLElement): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    this.container = container;
    const w = container.clientWidth;
    const h = container.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    container.appendChild(this.renderer.domElement);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));
    const key = new THREE.DirectionalLight(0xfaf0ca, 0.9);
    key.position.set(2, 3, 4);
    this.scene.add(key);
    const warm = new THREE.PointLight(0xf4a259, 0.6, 6);
    warm.position.set(-1, 1, 2);
    this.scene.add(warm);

    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd9cfa6, roughness: 0.45, metalness: 0.35 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.4, 2.4, 1.1), bodyMat);
    this.scene.add(body);

    // Interior cavity (slightly darker back face)
    const interiorMat = new THREE.MeshStandardMaterial({ color: 0x2a2622, roughness: 1 });
    const interior = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.3, 1.0), interiorMat);
    interior.position.z = -0.05;
    this.scene.add(interior);

    // Top compartment door (non-draggable decorative)
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xe4dab2, roughness: 0.4, metalness: 0.35 });
    const topDoor = new THREE.Mesh(new THREE.BoxGeometry(1.38, 0.8, 0.08), doorMat);
    topDoor.position.set(0, 0.7, 0.55);
    this.scene.add(topDoor);
    this.addHandle(topDoor, 0.5, 0, 0);

    // 3 drawers
    const drawerGeo = new THREE.BoxGeometry(1.38, 0.44, 0.08);
    const drawerYs = [0.18, -0.32, -0.82];
    drawerYs.forEach((y, idx) => {
      const g = new THREE.Group();
      const d = new THREE.Mesh(drawerGeo, doorMat.clone());
      d.name = `drawer-${idx}`;
      g.add(d);
      this.addHandle(d, 0, 0.15, 0);
      g.position.set(0, y, 0.55);

      // Labeled food item sprites (hidden until drawer opens)
      const labels: THREE.Sprite[] = [];
      FOOD_PER_DRAWER[idx].forEach(([name, note], i) => {
        const spriteMat = new THREE.SpriteMaterial({
          map: makeLabelTexture(name, note),
          transparent: true,
          opacity: 0,
          depthTest: false,
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.9, 0.22, 1);
        sprite.position.set(-0.4 + i * 0.4, 0, 0.2);
        g.add(sprite);
        labels.push(sprite);
      });

      this.scene.add(g);
      this.drawers.push({ group: g, labels, open: false });
    });

    this.ro = new ResizeObserver(() => {
      if (!this.container) return;
      const W = this.container.clientWidth;
      const H = this.container.clientHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H, false);
    });
    this.ro.observe(container);

    this.renderer.domElement.addEventListener('click', this.onClick);
    this.renderer.domElement.style.cursor = 'pointer';

    this.resume();
  }

  private addHandle(parent: THREE.Mesh, _x: number, y: number, _z: number): void {
    const h = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: 0x1a1814, roughness: 0.6, metalness: 0.4 })
    );
    h.position.set(0, y, 0.05);
    parent.add(h);
  }

  private onClick = (e: MouseEvent): void => {
    if (!this.container) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.raycaster.setFromCamera(this.mouse, this.camera);

    const drawerMeshes = this.drawers.map((d) => d.group.children[0]);
    const hits = this.raycaster.intersectObjects(drawerMeshes, false);
    if (!hits.length) return;

    const idx = drawerMeshes.indexOf(hits[0].object as THREE.Mesh);
    if (idx < 0) return;
    this.toggleDrawer(idx);
  };

  private toggleDrawer(i: number): void {
    const d = this.drawers[i];
    d.open = !d.open;
    const targetZ = d.open ? 1.2 : 0.55;
    gsap.to(d.group.position, {
      z: targetZ,
      duration: 0.5,
      ease: 'expo.out',
    });
    if (d.open) {
      d.labels.forEach((s, li) => {
        gsap.to(s.material, {
          opacity: 1,
          duration: 0.4,
          delay: 0.3 + li * 0.08,
          ease: 'expo.out',
        });
      });
    } else {
      d.labels.forEach((s) => {
        gsap.to(s.material, { opacity: 0, duration: 0.25, ease: 'expo.in' });
      });
    }
  }

  private tick = (): void => {
    if (!this.running) return;
    this.renderer.render(this.scene, this.camera);
    this.raf = requestAnimationFrame(this.tick);
  };

  pause(): void { this.running = false; if (this.raf) cancelAnimationFrame(this.raf); }
  resume(): void { if (this.running) return; this.running = true; this.raf = requestAnimationFrame(this.tick); }

  dispose(): void {
    this.pause();
    this.ro?.disconnect();
    this.renderer.domElement.removeEventListener('click', this.onClick);
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose?.();
      const mat = m.material;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else (mat as THREE.Material | undefined)?.dispose?.();
    });
    this.container = undefined;
  }
}
