import * as THREE from 'three';
import type { ManagedScene } from './SceneManager';

interface Faller { mesh: THREE.Mesh; vy: number; startY: number; }

export class Scale implements ManagedScene {
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  private renderer!: THREE.WebGLRenderer;
  private beamGroup = new THREE.Group();
  private fallers: Faller[] = [];
  private ro?: ResizeObserver;
  private raf = 0;
  private running = false;
  private t = 0;
  private tilt = 0;
  private targetTilt = -0.1;
  private container?: HTMLElement;

  constructor() {
    this.camera.position.set(0, 0.2, 6.2);
    this.camera.lookAt(0, -0.1, 0);
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

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    const key = new THREE.DirectionalLight(0xfaf0ca, 1.0);
    key.position.set(2, 3, 2);
    this.scene.add(key);
    const amberL = new THREE.PointLight(0xf4a259, 1.2, 8);
    amberL.position.set(-1.5, 0.5, 1);
    this.scene.add(amberL);
    const crimsonL = new THREE.PointLight(0xbc4749, 0.8, 8);
    crimsonL.position.set(1.5, 0.5, 1);
    this.scene.add(crimsonL);

    const material = new THREE.MeshStandardMaterial({ color: 0xfaf0ca, roughness: 0.8, metalness: 0.1 });
    const amberMat = new THREE.MeshStandardMaterial({
      color: 0xf4a259, roughness: 0.6, metalness: 0.15, emissive: 0xf4a259, emissiveIntensity: 0.15,
    });
    const crimsonMat = new THREE.MeshStandardMaterial({
      color: 0xbc4749, roughness: 0.5, emissive: 0xbc4749, emissiveIntensity: 0.1,
    });

    const rig = new THREE.Group();
    rig.scale.setScalar(0.48);
    rig.position.y = 0.1;
    this.scene.add(rig);

    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.4, 16), material);
    post.position.y = -0.4;
    rig.add(post);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 24), material);
    base.position.y = -1.6;
    rig.add(base);

    this.beamGroup.position.y = 0.8;
    rig.add(this.beamGroup);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.08), material);
    this.beamGroup.add(beam);

    // Left pan (wheat)
    const leftPan = new THREE.Group();
    leftPan.position.set(-1.4, -0.4, 0);
    const lChain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6), material);
    lChain.position.y = 0.25;
    leftPan.add(lChain);
    const lBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.35, 0.12, 24), material);
    leftPan.add(lBowl);
    const heap = new THREE.Group();
    heap.position.y = 0.08;
    const grainGeo = new THREE.SphereGeometry(0.04, 8, 6);
    for (let i = 0; i < 60; i++) {
      const m = new THREE.Mesh(grainGeo, amberMat);
      const r = Math.random() * 0.5;
      const a = Math.random() * Math.PI * 2;
      m.position.set(Math.cos(a) * r, Math.random() * 0.35, Math.sin(a) * r);
      m.scale.set(0.6 + Math.random() * 0.8, 1.6 + Math.random() * 1.2, 0.6 + Math.random() * 0.8);
      m.rotation.set(Math.random(), Math.random(), Math.random());
      heap.add(m);
    }
    leftPan.add(heap);
    this.beamGroup.add(leftPan);

    // Right pan (empty bowl)
    const rightPan = new THREE.Group();
    rightPan.position.set(1.4, -0.4, 0);
    const rChain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6), material);
    rChain.position.y = 0.25;
    rightPan.add(rChain);
    const rBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.14, 24), crimsonMat);
    rightPan.add(rBowl);
    const rBowlInner = new THREE.Mesh(
      new THREE.CylinderGeometry(0.42, 0.24, 0.11, 24),
      new THREE.MeshStandardMaterial({ color: 0x0a0908, roughness: 1 })
    );
    rBowlInner.position.y = 0.02;
    rightPan.add(rBowlInner);
    this.beamGroup.add(rightPan);

    // Falling grains
    const fallerGeo = new THREE.SphereGeometry(0.035, 6, 4);
    for (let i = 0; i < 18; i++) {
      const g = new THREE.Mesh(fallerGeo, amberMat);
      g.scale.set(0.6, 1.8, 0.6);
      g.position.set(-1.4 + (Math.random() - 0.5) * 0.6, Math.random() * 2, (Math.random() - 0.5) * 0.3);
      rig.add(g);
      this.fallers.push({ mesh: g, vy: -0.01 - Math.random() * 0.02, startY: Math.random() * 2 + 0.5 });
    }

    this.ro = new ResizeObserver(() => {
      if (!this.container) return;
      const W = this.container.clientWidth;
      const H = this.container.clientHeight;
      this.camera.aspect = W / H;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(W, H, false);
    });
    this.ro.observe(container);

    this.resume();
  }

  setTilt(v: number): void {
    this.targetTilt = v;
  }

  private tick = (): void => {
    if (!this.running) return;
    this.t += 0.016;
    this.tilt += (this.targetTilt - this.tilt) * 0.03;
    this.tilt += Math.sin(this.t * 0.8) * 0.0008;
    this.beamGroup.rotation.z = this.tilt;
    this.fallers.forEach((f) => {
      f.mesh.position.y += f.vy;
      f.mesh.rotation.x += 0.08;
      if (f.mesh.position.y < -1.6) {
        f.mesh.position.y = f.startY;
        f.mesh.position.x = -1.4 + (Math.random() - 0.5) * 0.6;
      }
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
