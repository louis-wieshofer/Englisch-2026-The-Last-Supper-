// Three.js hero globe + paradox scale
// Requires global THREE (loaded via CDN before this file)

export function initGlobe(container, opts = {}) {
  const size = opts.size || Math.min(container.clientWidth, container.clientHeight) || 200;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.z = 3.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size, size, false);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  // Base sphere — warm near-black with subtle wireframe "continents"
  const geo = new THREE.SphereGeometry(1, 64, 64);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x161513,
    roughness: 0.85,
    metalness: 0.05,
    emissive: 0x1a1816,
    emissiveIntensity: 0.4,
  });
  const globe = new THREE.Mesh(geo, baseMat);
  scene.add(globe);

  // Hunger heatmap — scatter crimson->amber glowing dots weighted toward Sub-Saharan Africa & South Asia
  const dotsGroup = new THREE.Group();
  globe.add(dotsGroup);

  function latLonToXYZ(lat, lon, r = 1.005) {
    const phi = (90 - lat) * Math.PI / 180;
    const theta = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(theta),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(theta)
    );
  }

  // Hotspots: [lat, lon, severity 0-1]
  const hotspots = [];
  // Sub-Saharan Africa cluster
  for (let i = 0; i < 80; i++) {
    hotspots.push([
      Math.random() * 30 - 15,         // -15 to 15
      Math.random() * 50 + 0,          // 0 to 50 E
      0.7 + Math.random() * 0.3,
    ]);
  }
  // South Asia cluster
  for (let i = 0; i < 50; i++) {
    hotspots.push([
      Math.random() * 25 + 5,          // 5 to 30
      Math.random() * 30 + 65,         // 65 to 95 E
      0.6 + Math.random() * 0.4,
    ]);
  }
  // Southeast Asia
  for (let i = 0; i < 25; i++) {
    hotspots.push([ Math.random()*20 - 5, Math.random()*30 + 95, 0.4 + Math.random()*0.4 ]);
  }
  // Latin America
  for (let i = 0; i < 30; i++) {
    hotspots.push([ Math.random()*30 - 20, Math.random()*30 - 80, 0.3 + Math.random()*0.4 ]);
  }
  // Ambient coverage — low severity
  for (let i = 0; i < 120; i++) {
    hotspots.push([ Math.random()*160 - 80, Math.random()*360 - 180, 0.1 + Math.random()*0.2 ]);
  }

  const dotGeo = new THREE.SphereGeometry(0.018, 8, 8);
  hotspots.forEach(([lat, lon, sev]) => {
    const pos = latLonToXYZ(lat, lon, 1.01);
    // Color lerp: low severity = dim cream, mid = amber, high = crimson
    const c = new THREE.Color();
    if (sev > 0.6) c.setHex(0xBC4749);
    else if (sev > 0.35) c.setHex(0xF4A259);
    else c.setHex(0xE0CA3C);
    const m = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0.4 + sev * 0.6 });
    const dot = new THREE.Mesh(dotGeo, m);
    dot.position.copy(pos);
    dot.scale.setScalar(0.5 + sev * 1.2);
    dotsGroup.add(dot);
  });

  // Subtle glow ring
  const ringGeo = new THREE.RingGeometry(1.08, 1.10, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xF4A259, transparent: true, opacity: 0.25, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2.2;
  scene.add(ring);

  // Lights — warm key, cool rim
  const key = new THREE.DirectionalLight(0xF4A259, 1.4);
  key.position.set(3, 2, 3); scene.add(key);
  const rim = new THREE.DirectionalLight(0xBC4749, 0.7);
  rim.position.set(-3, -1, -2); scene.add(rim);
  scene.add(new THREE.AmbientLight(0x3a3530, 0.5));

  let raf = null;
  let paused = false;
  let t = 0;
  function render() {
    raf = requestAnimationFrame(render);
    if (paused) return;
    t += 0.004;
    globe.rotation.y += 0.0035;
    globe.rotation.x = Math.sin(t * 0.4) * 0.05;
    ring.rotation.z += 0.0015;
    // Pulse hotspot opacity subtly
    dotsGroup.children.forEach((d, i) => {
      const base = d.material.opacity;
      d.material.opacity = Math.max(0.15, base + Math.sin(t * 2 + i) * 0.002);
    });
    renderer.render(scene, camera);
  }
  render();

  const ro = new ResizeObserver(() => {
    const w = container.clientWidth;
    renderer.setSize(w, w, false);
  });
  ro.observe(container);

  return {
    pause() { paused = true; },
    resume() { paused = false; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); container.removeChild(renderer.domElement); },
  };
}

// ─────────────────────────────────────────────
// PARADOX SCALE — tilted balance with wheat pour
// ─────────────────────────────────────────────

export function initScale(container) {
  const w = container.clientWidth;
  const h = container.clientHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
  camera.position.set(0, 0.2, 6.2);
  camera.lookAt(0, -0.1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(w, h, false);
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.3));
  const key = new THREE.DirectionalLight(0xFAF0CA, 1.0);
  key.position.set(2, 3, 2); scene.add(key);
  const amberL = new THREE.PointLight(0xF4A259, 1.2, 8);
  amberL.position.set(-1.5, 0.5, 1); scene.add(amberL);
  const crimsonL = new THREE.PointLight(0xBC4749, 0.8, 8);
  crimsonL.position.set(1.5, 0.5, 1); scene.add(crimsonL);

  const material = new THREE.MeshStandardMaterial({ color: 0xFAF0CA, roughness: 0.8, metalness: 0.1 });
  const amberMat = new THREE.MeshStandardMaterial({ color: 0xF4A259, roughness: 0.6, metalness: 0.15, emissive: 0xF4A259, emissiveIntensity: 0.15 });
  const crimsonMat = new THREE.MeshStandardMaterial({ color: 0xBC4749, roughness: 0.5, emissive: 0xBC4749, emissiveIntensity: 0.1 });

  // Fit whole rig inside the box — slightly shrunk group
  const rig = new THREE.Group();
  rig.scale.setScalar(0.48);
  rig.position.y = 0.1;
  scene.add(rig);

  // Vertical post
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.4, 16), material);
  post.position.y = -0.4; rig.add(post);
  // Base
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 0.12, 24), material);
  base.position.y = -1.6; rig.add(base);

  // Beam pivot group
  const beamGroup = new THREE.Group();
  beamGroup.position.y = 0.8;
  rig.add(beamGroup);

  const beam = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.06, 0.08), material);
  beamGroup.add(beam);

  // Left pan (waste, overflowing)
  const leftPan = new THREE.Group();
  leftPan.position.set(-1.4, -0.4, 0);
  const lChain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6), material);
  lChain.position.y = 0.25;
  leftPan.add(lChain);
  const lBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.35, 0.12, 24), material);
  leftPan.add(lBowl);
  // Wheat heap — many small ellipsoids
  const heap = new THREE.Group();
  heap.position.y = 0.08;
  for (let i = 0; i < 60; i++) {
    const g = new THREE.SphereGeometry(0.04, 8, 6);
    const m = new THREE.Mesh(g, amberMat);
    const r = Math.random() * 0.5;
    const a = Math.random() * Math.PI * 2;
    m.position.set(Math.cos(a) * r, Math.random() * 0.35, Math.sin(a) * r);
    m.scale.set(0.6 + Math.random() * 0.8, 1.6 + Math.random() * 1.2, 0.6 + Math.random() * 0.8);
    m.rotation.set(Math.random(), Math.random(), Math.random());
    heap.add(m);
  }
  leftPan.add(heap);
  beamGroup.add(leftPan);

  // Right pan (hunger, empty bowl)
  const rightPan = new THREE.Group();
  rightPan.position.set(1.4, -0.4, 0);
  const rChain = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.5, 6), material);
  rChain.position.y = 0.25;
  rightPan.add(rChain);
  const rBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.3, 0.14, 24), crimsonMat);
  rightPan.add(rBowl);
  const rBowlInner = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.24, 0.11, 24), new THREE.MeshStandardMaterial({ color: 0x0A0908, roughness: 1 }));
  rBowlInner.position.y = 0.02;
  rightPan.add(rBowlInner);
  beamGroup.add(rightPan);

  // Falling grains (overflowing left pan)
  const fallers = [];
  for (let i = 0; i < 18; i++) {
    const g = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), amberMat);
    g.scale.set(0.6, 1.8, 0.6);
    g.position.set(-1.4 + (Math.random() - 0.5) * 0.6, Math.random() * 2, (Math.random() - 0.5) * 0.3);
    rig.add(g);
    fallers.push({ mesh: g, vy: -0.01 - Math.random() * 0.02, startY: Math.random() * 2 + 0.5 });
  }

  let raf = null, paused = false, t = 0;
  let tilt = 0, targetTilt = -0.28;
  function render() {
    raf = requestAnimationFrame(render);
    if (paused) return;
    t += 0.016;
    // Gentle overshoot toward target tilt
    tilt += (targetTilt - tilt) * 0.03;
    tilt += Math.sin(t * 0.8) * 0.0008;
    beamGroup.rotation.z = tilt;

    fallers.forEach(f => {
      f.mesh.position.y += f.vy;
      f.mesh.rotation.x += 0.08;
      if (f.mesh.position.y < -1.6) {
        f.mesh.position.y = f.startY;
        f.mesh.position.x = -1.4 + (Math.random() - 0.5) * 0.6;
      }
    });

    renderer.render(scene, camera);
  }
  render();

  const ro = new ResizeObserver(() => {
    const W = container.clientWidth, H = container.clientHeight;
    camera.aspect = W / H; camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  });
  ro.observe(container);

  return {
    setTilt(v) { targetTilt = v; },
    pause() { paused = true; },
    resume() { paused = false; },
    destroy() { cancelAnimationFrame(raf); ro.disconnect(); renderer.dispose(); },
  };
}

// ─────────────────────────────────────────────
// LOADING SCREEN — grains assembling into a globe
// ─────────────────────────────────────────────

export function initLoader(container, onComplete) {
  const size = 240;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.z = 3.4;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(size, size, false);
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xFAF0CA, 1.2);
  key.position.set(2, 3, 2); scene.add(key);
  const warm = new THREE.PointLight(0xF4A259, 1.4, 6);
  warm.position.set(0, 0, 2); scene.add(warm);

  // 400 grain meshes distributed on target sphere; start far and random
  const N = 280;
  const grains = [];
  const grainGeo = new THREE.SphereGeometry(0.022, 6, 4);
  const grainMat = new THREE.MeshStandardMaterial({ color: 0xF4A259, roughness: 0.6, emissive: 0xF4A259, emissiveIntensity: 0.2 });

  const globe = new THREE.Group();
  scene.add(globe);

  for (let i = 0; i < N; i++) {
    // Fibonacci sphere for even distribution
    const y = 1 - (i / (N - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = Math.PI * (3 - Math.sqrt(5)) * i;
    const target = new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);

    const m = new THREE.Mesh(grainGeo, grainMat);
    m.scale.set(0.7, 2, 0.7);
    // Start far out on a random direction
    const dir = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();
    const startDist = 3 + Math.random() * 3;
    m.position.copy(dir).multiplyScalar(startDist);
    m.userData.target = target;
    m.userData.delay = Math.random() * 0.4;
    globe.add(m);
    grains.push(m);
  }

  const start = performance.now();
  const duration = 2600;
  let raf = null;
  let done = false;

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function render() {
    raf = requestAnimationFrame(render);
    const elapsed = (performance.now() - start) / duration;
    grains.forEach(g => {
      const p = Math.max(0, Math.min(1, (elapsed - g.userData.delay) / (1 - g.userData.delay)));
      const e = ease(p);
      const dir = g.position.clone().normalize();
      const startPos = dir.multiplyScalar(3 + 1);
      g.position.lerpVectors(startPos, g.userData.target, e);
    });
    globe.rotation.y += 0.01;
    renderer.render(scene, camera);

    if (elapsed >= 1 && !done) {
      done = true;
      setTimeout(() => onComplete && onComplete(), 400);
    }
  }
  render();

  return {
    destroy() { cancelAnimationFrame(raf); renderer.dispose(); if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement); },
    progress() {
      return Math.min(1, (performance.now() - start) / duration);
    },
  };
}
