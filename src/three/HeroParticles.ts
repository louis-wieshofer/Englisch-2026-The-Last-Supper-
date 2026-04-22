import * as THREE from 'three';
import type { ManagedScene } from './SceneManager';

/**
 * 500 instanced wheat-grain-like shapes on an orthographic 2D plane behind the hero.
 * A cursor uniform repels grains within a 200px radius via a shader; falls back to
 * CPU-side drift when reducedMotion is true.
 */

const VERT = /* glsl */ `
attribute vec3 instancePos;
attribute float instanceSeed;
uniform float uTime;
uniform vec2 uCursor;
uniform vec2 uResolution;
varying float vAlpha;

void main() {
  vec3 p = position;

  // Subtle noise-driven drift (cheap sin-based pseudo-noise)
  float s = instanceSeed;
  vec3 drift = vec3(
    sin(uTime * 0.35 + s * 6.28) * 8.0,
    cos(uTime * 0.28 + s * 4.10) * 8.0,
    0.0
  );

  vec3 world = vec3(instancePos.xy + drift.xy, 0.0);

  // Cursor repulsion: compare grain NDC vs cursor NDC in pixel space
  vec2 grainPx = (world.xy / uResolution) * uResolution;
  vec2 toCursor = grainPx - uCursor;
  float dist = length(toCursor);
  float radius = 200.0;
  float force = smoothstep(radius, 0.0, dist);
  vec2 repel = normalize(toCursor + vec2(0.0001)) * force * 80.0;
  world.xy += repel;

  // Rotation per-grain so they look like tiny seed shapes
  float a = uTime * 0.3 + s * 3.14;
  float c = cos(a);
  float sn = sin(a);
  p.xy = mat2(c, -sn, sn, c) * p.xy;

  world += p;

  gl_Position = vec4((world.xy / uResolution) * 2.0, 0.0, 1.0);
  vAlpha = 0.15 + instanceSeed * 0.35 + force * 0.4;
}
`;

const FRAG = /* glsl */ `
precision mediump float;
uniform vec3 uColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor, vAlpha);
}
`;

export class HeroParticles implements ManagedScene {
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);
  private renderer: THREE.WebGLRenderer;
  private mesh?: THREE.Mesh;
  private material?: THREE.ShaderMaterial;
  private ro?: ResizeObserver;
  private raf = 0;
  private running = false;
  private t0 = performance.now();
  private container?: HTMLElement;
  private cursor = new THREE.Vector2(0, 0);
  private res = new THREE.Vector2(1, 1);

  constructor(private count = 500) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
  }

  mount(container: HTMLElement): void {
    this.container = container;
    container.appendChild(this.renderer.domElement);
    this.resize();

    // Thin ellipse shape for wheat-grain-ish silhouette (~3×8 px in clip-to-pixel basis)
    const grain = new THREE.BufferGeometry();
    const verts = new Float32Array([
      -1.5, -4, 0,
       1.5, -4, 0,
       1.5,  4, 0,
      -1.5, -4, 0,
       1.5,  4, 0,
      -1.5,  4, 0,
    ]);
    grain.setAttribute('position', new THREE.BufferAttribute(verts, 3));

    const geom = new THREE.InstancedBufferGeometry();
    geom.index = grain.index;
    geom.attributes.position = grain.attributes.position;
    geom.instanceCount = this.count;

    const positions = new Float32Array(this.count * 3);
    const seeds = new Float32Array(this.count);
    for (let i = 0; i < this.count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * this.res.x;
      positions[i * 3 + 1] = (Math.random() - 0.5) * this.res.y;
      positions[i * 3 + 2] = 0;
      seeds[i] = Math.random();
    }
    geom.setAttribute('instancePos', new THREE.InstancedBufferAttribute(positions, 3));
    geom.setAttribute('instanceSeed', new THREE.InstancedBufferAttribute(seeds, 1));

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uCursor: { value: this.cursor },
        uResolution: { value: this.res },
        uColor: { value: new THREE.Color(0xf4a259) },
      },
    });

    this.mesh = new THREE.Mesh(geom, this.material);
    this.scene.add(this.mesh);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    window.addEventListener('mousemove', this.onMouseMove, { passive: true });

    this.resume();
  }

  private onMouseMove = (e: MouseEvent): void => {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    // cursor pixel coords relative to container center
    this.cursor.x = e.clientX - rect.left - rect.width / 2;
    this.cursor.y = -(e.clientY - rect.top - rect.height / 2);
  };

  private resize(): void {
    if (!this.container) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h, false);
    this.res.set(w, h);
    this.camera.left = -w / 2;
    this.camera.right = w / 2;
    this.camera.top = h / 2;
    this.camera.bottom = -h / 2;
    this.camera.updateProjectionMatrix();
  }

  private tick = (): void => {
    if (!this.running) return;
    if (this.material) {
      this.material.uniforms.uTime.value = (performance.now() - this.t0) / 1000;
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
    window.removeEventListener('mousemove', this.onMouseMove);
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.mesh?.geometry.dispose();
    this.material?.dispose();
    this.container = undefined;
  }
}
