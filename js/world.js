// ---------------------------------------------------------------------------
//  The 3D campus: terrain, lake, roads, buildings, trees, mountains, sky, traffic.
//  createWorld(scene) fills a THREE.Scene and returns what the viewer needs.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {
  MAP_SCALE as S,
  MAP_CENTER,
  CAMPUS as CR,
  ROAD_RIGHT,
  ROAD_BOTTOM,
  LAKE,
  BUILDINGS,
  MONUMENT
} from './config.js';
import * as CFG from './config.js';

// Effect defaults. Override them by exporting EFFECTS from config.js (see config.js).
const FX = Object.assign(
  { night: true, fireworks: true, snow: false, ui: true, uiCorner: 'bottom-left', remember: true },
  CFG.EFFECTS || {}
);

// Same colours and lighting as the approved demo (which used the classic three.js look).
THREE.ColorManagement.enabled = false;

const mx = (px) => (px - MAP_CENTER.x) / S;
const mz = (py) => (py - MAP_CENTER.y) / S;

const ROAD_R = { ax: mx(ROAD_RIGHT.from[0]), az: mz(ROAD_RIGHT.from[1]), bx: mx(ROAD_RIGHT.to[0]), bz: mz(ROAD_RIGHT.to[1]) };
const ROAD_B_Z = mz(ROAD_BOTTOM.y);

/* ---------- math helpers (no three.js objects are created at import time) ---------- */
function mulberry32(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function smoothstep(a, b, x) { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
function hash(x, y) { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { return vnoise(x, y) * 0.6 + vnoise(x * 2.1, y * 2.1) * 0.28 + vnoise(x * 4.3, y * 4.3) * 0.12; }
function distLine(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, t = ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz);
  return Math.hypot(px - (ax + dx * t), pz - (az + dz * t));
}
function rectDist(x, z) { return Math.hypot(Math.max(CR.x0 - x, 0, x - CR.x1), Math.max(CR.z0 - z, 0, z - CR.z1)); }
// Flat footprint (in world units, with a margin) around EVERY building, wherever it's
// placed — not just inside the original CAMPUS rectangle. Without this, a building
// positioned outside that rectangle (e.g. far off at an odd x/y) sits on real hill
// height instead of flat ground.
const BUILDING_PAD = 2.2;
const buildingPads = BUILDINGS.filter((b) => b.w && b.h).map((b) => ({
  cx: mx(b.x + b.w / 2), cz: mz(b.y + b.h / 2),
  hx: (b.w / S) / 2 + BUILDING_PAD, hz: (b.h / S) / 2 + BUILDING_PAD
}));
function buildingDist(x, z) {
  let best = Infinity;
  for (const p of buildingPads) {
    const d = Math.hypot(Math.max(Math.abs(x - p.cx) - p.hx, 0), Math.max(Math.abs(z - p.cz) - p.hz, 0));
    if (d < best) best = d;
  }
  return best;
}
function flatMask(x, z) {
  const dRect = Math.min(rectDist(x, z), buildingDist(x, z));
  const dRoad = Math.min(distLine(x, z, ROAD_R.ax, ROAD_R.az, ROAD_R.bx, ROAD_R.bz), Math.abs(z - ROAD_B_Z));
  return Math.min(smoothstep(1.5, 9, dRect), smoothstep(2.3, 7, dRoad));
}
function lakeF() { return 0; }                 // lake removed — ground is level everywhere now
function hillsAt() { return 0; }                // no hills/mountains — flat, satellite-style ground
export function heightAt() { return 0; }        // the whole map sits at one flat level

  /* =========================================================================== */
  export function createWorld(scene) {

    THREE.ColorManagement.enabled = false;
    const gltfLoader = new GLTFLoader();
    const rnd = mulberry32(20260921);
    const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
    const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
    const add = (o) => { scene.add(o); return o; };

    // Effect switches (night / fireworks / snow). The last choice is remembered in the browser.
    const FX_KEY = 'campus-effects-v1';
    const fxState = { night: !!FX.night, fireworks: !!FX.fireworks, snow: !!FX.snow };
    if (FX.remember) {
      try {
        const saved = JSON.parse(localStorage.getItem(FX_KEY) || 'null');
        if (saved) for (const k of ['night', 'fireworks', 'snow']) if (typeof saved[k] === 'boolean') fxState[k] = saved[k];
      } catch (e) { /* no storage available: just use the defaults */ }
    }
    const cloudMats = [];

/* ---------- soft fog: hide the map edges ---------- */
scene.fog = new THREE.Fog(
  0x131b3a, // night fog colour (matches the horizon)
  70,      // เริ่มเห็นหมอก
  150      // ระยะที่หมอกกลืนวัตถุจนเกือบหมด
);


  /* ---------- sky, sun, lights ---------- */
  const sunDir = new THREE.Vector3(-0.15, 0.62, -0.77).normalize();
  const skyGroup = new THREE.Group();
  scene.add(skyGroup);
  const skyUniforms = {
    sunDir: { value: sunDir },
    c0: { value: new THREE.Vector3() }, c1: { value: new THREE.Vector3() }, c2: { value: new THREE.Vector3() }, c3: { value: new THREE.Vector3() },
    g1: { value: new THREE.Vector3() }, g2: { value: new THREE.Vector3() }, p1: { value: 10 }, p2: { value: 140 }
  };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: skyUniforms,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'varying vec3 vP; uniform vec3 sunDir; uniform vec3 c0; uniform vec3 c1; uniform vec3 c2; uniform vec3 c3;',
      'uniform vec3 g1; uniform vec3 g2; uniform float p1; uniform float p2;',
      'void main(){',
      ' vec3 d = normalize(vP); float h = clamp(d.y, 0.0, 1.0);',
      ' vec3 col = mix(c0, c1, smoothstep(0.0, 0.12, h));',
      ' col = mix(col, c2, smoothstep(0.08, 0.4, h));',
      ' col = mix(col, c3, smoothstep(0.35, 0.9, h));',
      ' float s = max(dot(d, sunDir), 0.0);',
      ' col += g1 * pow(s, p1) + g2 * pow(s, p2);',
      ' gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  skyGroup.add(sky);

  // sun (day) / moon (night): the same disc, recoloured and resized by applyTime()
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(13, 48), new THREE.MeshBasicMaterial({ color: 0xeef2ff, fog: false, depthWrite: false }));
  sunDisc.position.copy(sunDir).multiplyScalar(430); sunDisc.lookAt(0, 0, 0); sunDisc.renderOrder = -9;
  skyGroup.add(sunDisc);

  const halo = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.25)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, transparent: true }));
    h.position.copy(sunDir).multiplyScalar(425); h.renderOrder = -8;
    skyGroup.add(h);
    return h;
  })();

  const starPts = (() => {                                             // stars (only visible at night)
    const n = 1100, sp = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const y = 0.06 + rnd() * 0.94, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - y * y);
      sp[i * 3] = Math.cos(a) * r * 520; sp[i * 3 + 1] = y * 520; sp[i * 3 + 2] = Math.sin(a) * r * 520;
    }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    const pts = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xdfe8ff, size: 1.8, sizeAttenuation: false, fog: false, depthWrite: false, transparent: true, opacity: 0.85 }));
    pts.frustumCulled = false; pts.renderOrder = -9;
    skyGroup.add(pts);
    return pts;
  })();

  // Intensities are multiplied by PI to match the classic three.js lighting the demo used.
  const hemi = new THREE.HemisphereLight(0xcfe8ff, 0xaab4c4, 0.85 * Math.PI);
  const amb = new THREE.AmbientLight(0xffffff, 0.2 * Math.PI);
  const sun = new THREE.DirectionalLight(0xfff8e8, 1.05 * Math.PI);   // sunlight by day, moonlight at night
  scene.add(hemi, amb);
  sun.position.set(-10, 40, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 24, bottom: -24, near: 5, far: 90 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);

  /* ---------- day / night presets: edit the numbers here to change the mood ---------- */
  const TIME = {
    day: {
      sky: [[0.81, 0.91, 0.97], [0.60, 0.82, 0.98], [0.32, 0.62, 0.95], [0.16, 0.45, 0.88]],   // horizon -> zenith
      g1: [0.18, 0.18, 0.162], p1: 10, g2: [0.6, 0.6, 0.57], p2: 140,                           // sun glow (wide, tight)
      fog: 0xcfe8f8,
      hemi: [0xcfe8ff, 0xaab4c4, 0.85], amb: [0xffffff, 0.2], sun: [0xfff8e8, 1.05],            // [colour(s), intensity]
      disc: [0xffffee, 30 / 13], halo: [0xffffeb, 300, 0.85], stars: false, clouds: [0xf4f9ff, 0xffffff]
    },
    night: {
      sky: [[0.075, 0.105, 0.23], [0.04, 0.065, 0.17], [0.02, 0.035, 0.11], [0.008, 0.015, 0.06]],
      g1: [0.07, 0.087, 0.14], p1: 12, g2: [0.72, 0.76, 0.8], p2: 300,                          // moon glow
      fog: 0x131b3a,
      hemi: [0x6f86c8, 0x1c2438, 0.45], amb: [0x8090c0, 0.14], sun: [0xaec4ff, 0.45],
      disc: [0xeef2ff, 1], halo: [0xbcd0ff, 150, 0.65], stars: true, clouds: [0x1a2240, 0x232d52]
    }
  };
  function applyTime(night) {
    const T = night ? TIME.night : TIME.day;
    ['c0', 'c1', 'c2', 'c3'].forEach((k, i) => skyUniforms[k].value.set(T.sky[i][0], T.sky[i][1], T.sky[i][2]));
    skyUniforms.g1.value.set(T.g1[0], T.g1[1], T.g1[2]); skyUniforms.g2.value.set(T.g2[0], T.g2[1], T.g2[2]);
    skyUniforms.p1.value = T.p1; skyUniforms.p2.value = T.p2;
    scene.fog.color.setHex(T.fog);
    hemi.color.setHex(T.hemi[0]); hemi.groundColor.setHex(T.hemi[1]); hemi.intensity = T.hemi[2] * Math.PI;
    amb.color.setHex(T.amb[0]); amb.intensity = T.amb[1] * Math.PI;
    sun.color.setHex(T.sun[0]); sun.intensity = T.sun[1] * Math.PI;
    sunDisc.material.color.setHex(T.disc[0]); sunDisc.scale.setScalar(T.disc[1]);
    halo.material.color.setHex(T.halo[0]); halo.scale.set(T.halo[1], T.halo[1], 1); halo.material.opacity = T.halo[2];
    starPts.visible = T.stars;
    if (cloudMats.length >= 2) { cloudMats[0].color.setHex(T.clouds[0]); cloudMats[1].color.setHex(T.clouds[1]); }
  }
  applyTime(fxState.night);

  /* ---------- terrain and lake ---------- */
  {
    const g = new THREE.PlaneGeometry(300, 300, 260, 176);
    g.rotateX(-Math.PI / 2); g.translate(0, 0, -10);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    // Snow ground. These values are darker than the snow looks on screen because the scene
    // lights add up to roughly 2x brightness (so 0x807a78 renders as near-white and shadows
    // stay visible). Lighter values = flatter, brighter snow; darker = greyer, more contrast.
    const lime = new THREE.Color(0x807a78),   // fresh snow (main colour)
      green = new THREE.Color(0x767577),      // slightly shaded patches
      deep = new THREE.Color(0x6a6b71),       // blue-ish drifts
      rock = new THREE.Color(0x5f6269),       // (only used if hills come back)
      sand = new THREE.Color(0x807a78),       // lake-shore tint -> snow too
      wet = new THREE.Color(0x6c6e73);        // low ground -> icy
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      const terrainH = heightAt(x, z);
      pos.setY(i, terrainH);

      const n = fbm(x * 0.09 + 11, z * 0.09 + 5);

      c.copy(lime).lerp(
        green,
        smoothstep(0.3, 0.75, n)
      );

      c.lerp(
        deep,
        smoothstep(1.5, 5, terrainH) * 0.8
      );

      c.lerp(
        rock,
        smoothstep(5.5, 9, terrainH) * 0.6
      );

      c.lerp(
        sand,
        (1 - smoothstep(0.0, 0.9, terrainH)) *
        smoothstep(0.0, 0.12, lakeF(x, z))
      );

      if (terrainH < -0.7) {
        c.lerp(wet, 0.8);
      }

      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const t = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    t.receiveShadow = true; scene.add(t);

    // const skirt = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshBasicMaterial({ color: 0x6f9a3c }));
    // skirt.rotation.x = -Math.PI / 2; skirt.position.y = -3.2; scene.add(skirt);
  }

  /* ---------- roads and footpaths ---------- */
  {
    const asphalt = lam(0x4c4a52), curbMat = lam(0xd8caa8), dashMat = new THREE.MeshBasicMaterial({ color: 0xf6e6a8 });
    const rdx = ROAD_R.bx - ROAD_R.ax, rdz = ROAD_R.bz - ROAD_R.az, rot = -Math.atan2(rdz, rdx);
    const cx = (ROAD_R.ax + ROAD_R.bx) / 2, cz = (ROAD_R.az + ROAD_R.bz) / 2;
    const curb = box(500, 0.04, ROAD_RIGHT.width + 0.7, curbMat, cx, 0.02, cz); curb.rotation.y = rot; curb.receiveShadow = true; scene.add(curb);
    const road = box(500, 0.06, ROAD_RIGHT.width, asphalt, cx, 0.045, cz); road.rotation.y = rot; road.receiveShadow = true; scene.add(road);
    const curb2 = box(500, 0.04, ROAD_BOTTOM.width + 0.6, curbMat, 0, 0.02, ROAD_B_Z); curb2.receiveShadow = true; scene.add(curb2);
    const road2 = box(500, 0.06, ROAD_BOTTOM.width, asphalt, 0, 0.045, ROAD_B_Z); road2.receiveShadow = true; scene.add(road2);

    /* ---- campus perimeter fence: a larger, rounded (chamfered) outline, with two gates ---- */
    {
      const postMat = lam(0xdcd6c4), railMat = lam(0xb8a67e), FH = 2, segLen = 1.0;
      const EX0 = CR.x0 - 20, EX1 = CR.x1 + 5, EZ0 = CR.z0 - 40, EZ1 = CR.z1 + 5, CH = 4.5;
      const poly = [
        [EX0 + CH, EZ0], [EX1 - CH, EZ0], [EX1, EZ0 + CH], [EX1, EZ1 - CH],
        [EX1 - CH, EZ1], [EX0 + CH, EZ1], [EX0, EZ1 - CH], [EX0, EZ0 + CH]
      ];
      const gates = [{ x: 6, z: EZ1, r: 2.2 }, { x: -25, z: EZ1, r: 2.2 }, { x: EX1, z: -4, r: 2.2 }, { x: EX1, z: -20, r: 2.2 }]; // south = main entrance, east = side gate
      const nearGate = (x, z) => gates.some((g) => Math.hypot(x - g.x, z - g.z) < g.r);
      for (let i = 0; i < poly.length; i++) {
        const [x0, z0] = poly[i], [x1, z1] = poly[(i + 1) % poly.length];
        const len = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.round(len / segLen));
        const rot = -Math.atan2(z1 - z0, x1 - x0), segW = len / n;
        for (let s = 0; s < n; s++) {
          const t = (s + 0.5) / n, mxp = x0 + (x1 - x0) * t, mzp = z0 + (z1 - z0) * t;
          if (nearGate(mxp, mzp)) continue;
          const rail = box(segW, 0.06, 0.08, railMat, mxp, FH, mzp); rail.rotation.y = rot; rail.castShadow = true; scene.add(rail);
          const post = box(0.1, FH, 0.1, postMat, mxp, FH / 2, mzp); post.castShadow = true; scene.add(post);
        }
      }
    }

    const N = 60, dm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.02, 0.09), dashMat, N * 2), d = new THREE.Object3D();
    const len = Math.hypot(rdx, rdz), ux = rdx / len, uz = rdz / len;
    let k = 0;
    for (let i = 0; i < N; i++) {
      const s = (i - N / 2) * 1.5;
      d.position.set(cx + ux * s, 0.085, cz + uz * s); d.rotation.set(0, rot, 0); d.updateMatrix(); dm.setMatrixAt(k++, d.matrix);
      d.position.set(s - 12, 0.09, ROAD_B_Z); d.rotation.set(0, 0, 0); d.updateMatrix(); dm.setMatrixAt(k++, d.matrix);
    }
    scene.add(dm);

    // const pathMat = lam(0xeadbb2);
    // const pathBox = (x0, z0, x1, z1, w) => {
    //   const m = box(Math.abs(x1 - x0) + (x0 === x1 ? w : 0), 0.03, Math.abs(z1 - z0) + (z0 === z1 ? w : 0), pathMat, (x0 + x1) / 2, 0.03, (z0 + z1) / 2);
    //   m.receiveShadow = true; scene.add(m);
    // };
    // pathBox(mx(100), mz(278), mx(425), mz(278), 0.9);
    // pathBox(mx(425), mz(278), mx(425), mz(468), 0.9);
  }

  /* ---------- buildings ---------- */
  const roofCache = {};
  function roofTexture(color, reps) {
    let base = roofCache[color];
    if (!base) {
      const c = document.createElement('canvas'); c.width = c.height = 32;
      const g = c.getContext('2d');
      g.fillStyle = color; g.fillRect(0, 0, 32, 32);
      g.fillStyle = 'rgba(255,255,255,0.15)'; g.fillRect(0, 0, 32, 5);
      g.fillStyle = 'rgba(0,0,0,0.2)'; g.fillRect(0, 26, 32, 6);
      base = roofCache[color] = new THREE.CanvasTexture(c);
      base.wrapS = base.wrapT = THREE.RepeatWrapping;
    }
    const t = base.clone(); t.needsUpdate = true; t.repeat.set(1, reps); return t;
  }
  const glassMat = new THREE.MeshLambertMaterial({ color: 0x35506b, emissive: 0x4a2a06 });
  const blockers = [];   // rectangles (screenshot pixels) where no trees are planted
  const places = [];     // clickable places: buildings with an id, plus the monument
  const buildingMeshes = [];
  const labels = [];     // name-only tags: buildings with a name but no id (not clickable, no icon)

  // Invisible box that receives clicks/hover for a place. Its opacity is used as a hover glow.
  function makeHit(place, w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(x, y, z);
    m.userData = { id: place.id, name: place.name, title: place.name, description: place.description, vrPage: place.vrPage };
    scene.add(m); buildingMeshes.push(m);
    place.hit = m;
  }

  function loadGLBModel(o, group, place, W, D, topYRef) {
    if (!o.model) return;

    const url = `./models/${o.model}`;

    console.log('[GLB] Loading:', url);

    gltfLoader.load(
      url,

      (gltf) => {
        const model = gltf.scene;

        model.traverse((child) => {
          if (!child.isMesh) return;

          child.castShadow = true;
          child.receiveShadow = true;
          child.userData.buildingId = o.id || null;
        });

        const originalBox = new THREE.Box3().setFromObject(model);
        const originalSize = originalBox.getSize(new THREE.Vector3());

        const userScale =
          Number.isFinite(o.modelScale)
            ? o.modelScale
            : 1;

        let autoScale = 1;

        // if (originalSize.x > 0 && originalSize.z > 0) {
        //   autoScale = Math.min(
        //     W / originalSize.x,
        //     D / originalSize.z
        //   );
        // }

        const finalScale = autoScale * userScale;

        model.scale.setScalar(finalScale);

        model.rotation.y = o.modelRotation || 0;

        // Center model
        const scaledBox =
          new THREE.Box3().setFromObject(model);

        const scaledCenter =
          scaledBox.getCenter(new THREE.Vector3());

        model.position.x -= scaledCenter.x;
        model.position.z -= scaledCenter.z;

        // Put model on ground
        const groundedBox =
          new THREE.Box3().setFromObject(model);

        const groundY =
          heightAt(
            group.position.x,
            group.position.z
          );

        const yOffset =
          Number.isFinite(o.modelYOffset)
            ? o.modelYOffset
            : 0;

        model.position.y +=
          groundY -
          groundedBox.min.y +
          yOffset;

        group.add(model);

        const finalBox =
          new THREE.Box3().setFromObject(model);

        if (place) {
          place.anchor.set(
            group.position.x,
            finalBox.max.y + 0.35,
            group.position.z
          );
        }

        console.log('[GLB] Loaded:', o.model);
        console.log('Original size:', originalSize);
        console.log('Auto scale:', autoScale);
        console.log('Final scale:', finalScale);
      },

      undefined,

      (error) => {
        console.error(
          '[GLB] Failed:',
          url,
          error
        );
      }
    );
}

  function makeBuilding(o) {

    const W = o.w / S;
    const D = o.h / S;

    const fh = 0.6;
    const floors = o.f || 2;
    const wallH = floors * fh;

    const cx =
      mx(o.x + o.w / 2);

    const cz =
      mz(o.y + o.h / 2);

    // --------------------------------------------------
    // Group หลักของอาคาร
    // --------------------------------------------------

    const g = new THREE.Group();

    g.position.set(
      cx,
      0,
      cz
    );

    scene.add(g);

    // --------------------------------------------------
    // กันต้นไม้ไม่ให้เกิดในบริเวณอาคาร
    // --------------------------------------------------

    blockers.push([
      o.x - 8,
      o.y - 8,
      o.w + 16,
      o.h + 16
    ]);

    // Buildings with a name but no id: just a floating text tag, no icon/click.
    if (!o.id && o.name) {
      labels.push({ name: o.name, anchor: new THREE.Vector3(cx, wallH + 0.35, cz) });
    }

    // --------------------------------------------------
    // ถ้ามี GLB ให้โหลดโมเดลจริง
    // --------------------------------------------------
    console.log(
      '[BUILDING]',
      o.name,
      'model =',
      o.model
    );

    if (o.model) {

      const place = o.id
        ? {
          id: o.id,
          name: o.name,
          short: o.short || o.name,
          description: o.description || '',
          icon: o.icon || 'home',
          vrPage: o.vrPage || null,
          main: !!o.main,

          anchor: new THREE.Vector3(
            cx,
            wallH + 0.35,
            cz
          ),

          group: g
        }
        : null;

      // ------------------------------------------------
      // Hitbox
      // ------------------------------------------------

      if (place) {

        makeHit(
          place,

          W + 0.5,
          Math.max(wallH + 1, 2),
          D + 0.5,

          cx,
          Math.max(wallH / 2, 1),
          cz
        );

        places.push(place);

      }

      // ------------------------------------------------
      // โหลด GLB
      // ------------------------------------------------

      loadGLBModel(
        o,
        g,
        place,
        W,
        D
      );

      return {
        cx,
        cz,
        topY: wallH
      };

    }

    // ==================================================
    // ถ้าไม่มี GLB → ใช้อาคาร procedural แบบเดิม
    // ==================================================

    const wallMat =
      lam(o.wall || 0xf3e6c8);

    const alongX = W >= D;
    const L = alongX ? W : D;
    const Sp = alongX ? D : W;

    const sub = new THREE.Group();

    let topY;

    if (o.flat) {

      const body = box(
        Sp,
        wallH,
        L,
        wallMat,
        0,
        wallH / 2,
        0
      );

      const roof = box(
        Sp + 0.14,
        0.12,
        L + 0.14,
        lam(o.roof),
        0,
        wallH + 0.06,
        0
      );

      const ac = box(
        Math.min(0.7, Sp * 0.3),
        0.22,
        0.5,
        lam(0xb9b9b4),
        0,
        wallH + 0.23,
        0
      );

      [body, roof, ac].forEach((m) => {

        m.castShadow = true;
        m.receiveShadow = true;

        sub.add(m);

      });

      topY =
        wallH + 0.14;

    }

    else {

      const rh =
        Math.min(1.15, Sp * 0.24);

      const shape =
        new THREE.Shape();

      shape.moveTo(
        -Sp / 2,
        0
      );

      shape.lineTo(
        Sp / 2,
        0
      );

      shape.lineTo(
        Sp / 2,
        wallH
      );

      shape.lineTo(
        0,
        wallH + rh
      );

      shape.lineTo(
        -Sp / 2,
        wallH
      );

      shape.closePath();

      const geo =
        new THREE.ExtrudeGeometry(
          shape,
          {
            depth: L,
            bevelEnabled: false
          }
        );

      geo.translate(
        0,
        0,
        -L / 2
      );

      const wall =
        new THREE.Mesh(
          geo,
          wallMat
        );

      wall.castShadow = true;
      wall.receiveShadow = true;

      sub.add(wall);

      const th =
        Math.atan2(
          rh,
          Sp / 2
        );

      const sl =
        Math.hypot(
          Sp / 2,
          rh
        ) + 0.22;

      for (const s of [-1, 1]) {

        const slab =
          new THREE.Mesh(
            new THREE.BoxGeometry(
              sl,
              0.09,
              L + 0.3
            ),
            new THREE.MeshLambertMaterial({
              map: roofTexture(
                o.roof,
                Math.max(
                  2,
                  L * 1.7
                )
              )
            })
          );

        slab.position.set(
          s * Sp / 4,
          wallH + rh / 2 + 0.03,
          0
        );

        slab.rotation.z =
          -s * th;

        slab.castShadow = true;
        slab.receiveShadow = true;

        sub.add(slab);

      }

      topY =
        wallH + rh;

    }

    // windows

    for (
      let f = 0;
      f < floors;
      f++
    ) {

      for (
        const side of [-1, 1]
      ) {

        sub.add(
          box(
            0.03,
            0.17,
            L * 0.86,
            glassMat,
            side *
            (Sp / 2 + 0.012),
            fh *
            (f + 0.58),
            0
          )
        );

      }

    }

    sub.rotation.y =
      alongX
        ? Math.PI / 2
        : 0;

    g.add(sub);

    // --------------------------------------------------
    // Clickable place
    // --------------------------------------------------

    if (o.id) {

      const place = {

        id: o.id,

        name: o.name,

        short:
          o.short || o.name,

        description:
          o.description || '',

        icon:
          o.icon || 'home',

        vrPage:
          o.vrPage || null,

        main:
          !!o.main,

        anchor:
          new THREE.Vector3(
            cx,
            topY + 0.35,
            cz
          ),

        group: g

      };

      makeHit(
        place,
        W + 0.25,
        topY + 0.3,
        D + 0.25,
        cx,
        (topY + 0.3) / 2,
        cz
      );

      places.push(place);

    }

    return {
      cx,
      cz,
      topY
    };

  }

  const built = {};

  BUILDINGS.forEach((b) => {
    const r = makeBuilding(b);

    if (b.id) {
      built[b.id] = r;
    }
  });

  /* ---------- trees (instanced) ---------- */
  const dummy = new THREE.Object3D();
  const trunkM = [], roundM = [], roundC = [], pineL = [[], [], []], pineC = [], pineTrunkM = [];
  const roundCols = [0x9cc43c, 0x84b230, 0xb6cb48, 0x6fa32b].map((c) => new THREE.Color(c));
  const pineCols = [0x155a3a, 0x0f4d33, 0x1e6b3f, 0x18563a].map((c) => new THREE.Color(c));
  const pushM = (list, x, y, z, sx, sy, sz, ry) => { dummy.position.set(x, y, z); dummy.rotation.set(0, ry || 0, 0); dummy.scale.set(sx, sy, sz); dummy.updateMatrix(); list.push(dummy.matrix.clone()); };
  const addRound = (x, y, z, k) => {
    pushM(trunkM, x, y, z, k, k, k, 0);
    pushM(roundM, x, y, z, k * (0.9 + rnd() * 0.3), k * (0.9 + rnd() * 0.25), k * (0.9 + rnd() * 0.3), rnd() * 6.28);
    roundC.push(roundCols[(rnd() * 4) | 0]);
  };
  const addPine = (x, y, z, k) => {
    pushM(pineTrunkM, x, y, z, k, k, k, 0);
    const ry = rnd() * 6.28;
    for (let i = 0; i < 3; i++) pushM(pineL[i], x, y + (0.45 + i * 0.5) * k, z, k * (1 - 0.24 * i), k * (1 - 0.1 * i), k * (1 - 0.24 * i), ry);
    pineC.push(pineCols[(rnd() * 4) | 0]);
  };
  const inBlocker = (px, py) => blockers.some((b) => px > b[0] && px < b[0] + b[2] && py > b[1] && py < b[1] + b[3]);

  /* ---------- surrounding neighborhood: a city-block grid, not a random scatter ---------- */
  {
    const roofCols = ['#b53a2c', '#c23a2b', '#a94a3a', '#c0402f', '#8e3a2a', '#b83a2e', '#a3452f', '#c2412e'];
    const wallCols = [0xf4f1ea, 0xe9e4d8, 0xd8d5cd, 0xf3e6c8, 0xf6efe0];
    const CELL = 2.3, MARGIN = 0.4;   // MARGIN leaves a visible street gap between rows/columns
    // Build every candidate cell first, then shuffle so the placement cap (below) doesn't
    // bias toward whichever side the loop reaches first — otherwise one side (e.g. north)
    // can end up empty just because the cap was hit before the loop got there.
    const cells = [];
    for (let gx = -100; gx <= 35; gx++) for (let gz = -100; gz <= 17; gz++) cells.push([gx, gz]);
    for (let i = cells.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0;[cells[i], cells[j]] = [cells[j], cells[i]]; }
    let placed = 0;
    for (const [gx, gz] of cells) {
      if (placed >= 450) break;
      const x = gx * CELL + (rnd() - 0.5) * 0.5;
      const z = gz * CELL + (rnd() - 0.5) * 0.5;
      if (rectDist(x, z) < 4.5) continue;                                    // keep clear of the campus + fence
      if (buildingDist(x, z) < 1.2) continue;                                // no overlap with real buildings
      if (distLine(x, z, ROAD_R.ax, ROAD_R.az, ROAD_R.bx, ROAD_R.bz) < ROAD_RIGHT.width / 2 + 0.7) continue;
      if (Math.abs(z - ROAD_B_Z) < ROAD_BOTTOM.width / 2 + 0.7) continue;     // keep the road clear
      if (flatMask(x, z) < 0.7) continue;
      if (rnd() < 0.18) continue;                                            // occasional empty lot — not a rigid checkerboard
      const w = (CELL - MARGIN) * (0.55 + rnd() * 0.4), d = (CELL - MARGIN) * (0.55 + rnd() * 0.4);
      const h = 0.55 + (rnd() < 0.3 ? 0.5 : 0);
      const wallMat = lam(wallCols[(rnd() * wallCols.length) | 0]);
      const roofMat = lam(roofCols[(rnd() * roofCols.length) | 0]);
      const ry = (rnd() < 0.5 ? 0 : Math.PI / 2) + (rnd() - 0.5) * 0.1;       // grid-aligned, like real city blocks
      const y0 = heightAt(x, z);
      const body = box(w, h, d, wallMat, x, y0 + h / 2, z);
      body.rotation.y = ry; body.castShadow = true; body.receiveShadow = true; scene.add(body);
      const roof = box(w + 0.12, 0.1, d + 0.12, roofMat, x, y0 + h + 0.05, z);
      roof.rotation.y = ry; roof.castShadow = true; scene.add(roof);
      placed++;
    }
  }

  /* ---- internal loop road, in the open band between the buildings and the fence ----
     (earlier version guessed straight lines through the building cluster and mostly ended up
     hidden underneath buildings; this band is guaranteed clear, so it actually renders.) ---- */
  {
    const asphalt2 = lam(0x4c4a52), curbMat2 = lam(0xd8caa8), W = 1.6;
    const RX0 = CR.x0 - 1.5, RX1 = CR.x1 + 1.5, RZ0 = CR.z0 - 1.5, RZ1 = CR.z1 + 1.5, CH = 3.5;
    const ring = [
      [RX0 + CH, RZ0], [RX1 - CH, RZ0], [RX1, RZ0 + CH], [RX1, RZ1 - CH],
      [RX1 - CH, RZ1], [RX0 + CH, RZ1], [RX0, RZ1 - CH], [RX0, RZ0 + CH]
    ];
    for (let i = 0; i < ring.length; i++) {
      const [x0, z0] = ring[i], [x1, z1] = ring[(i + 1) % ring.length];
      const len = Math.hypot(x1 - x0, z1 - z0), rot = -Math.atan2(z1 - z0, x1 - x0);
      const mxp = (x0 + x1) / 2, mzp = (z0 + z1) / 2;
      // const curb = box(len, 0.04, W + 0.5, curbMat2, mxp, 0.02, mzp); curb.rotation.y = rot; curb.receiveShadow = true; scene.add(curb);
      // const road = box(len, 0.06, W, asphalt2, mxp, 0.045, mzp); road.rotation.y = rot; road.receiveShadow = true; scene.add(road);
    }

    const parkMat = lam(0x9a9589);
    const lot = (x, z, w, d) => { const m = box(w, 0.04, d, parkMat, x, 0.025, z); m.receiveShadow = true; scene.add(m); };
    // lot(6, RZ1 - 2, 4, 2.6);    // flanking the south entrance
    // lot(-6, RZ1 - 2, 4, 2.6);
  }

  { // campus trees
    // const placedXZ = [];
    // let placed = 0, tries = 0;
    // while (placed < 42 && tries < 5000) {
    //   tries++;
    //   const px = rnd() * 640 + 4, py = rnd() * 456 + 4;
    //   if (inBlocker(px, py)) continue;
    //   if (Math.abs(py - 278) < 14 && px > 90 && px < 435) continue;
    //   if (Math.abs(px - 425) < 14 && py > 278) continue;
    //   const x = mx(px), z = mz(py);
    //   if (distLine(x, z, ROAD_R.ax, ROAD_R.az, ROAD_R.bx, ROAD_R.bz) < 3.2) continue;   // stay clear of the right/diagonal road
    //   if (Math.abs(z - ROAD_B_Z) < 3.2) continue;                                       // stay clear of the bottom road
    //   if (placedXZ.some((q) => Math.hypot(x - q[0], z - q[1]) < 2.1)) continue;         // keep trees from crowding each other
    //   placedXZ.push([x, z]);
    //   if (rnd() < 0.5) addRound(x, 0, z, 0.9 + rnd() * 0.6); else addPine(x, 0, z, 0.8 + rnd() * 0.5);
    //   placed++;
    // }
  }
  { // hillside forest
    let placed = 0, tries = 0;
    // while (placed < 420 && tries < 8000) {
    //   tries++;
    //   const x = (rnd() - 0.5) * 200, z = -78 + rnd() * 104;
    //   if (flatMask(x, z) < 0.9 || lakeF(x, z) > 0 || rectDist(x, z) < 6) continue;
    //   const h = heightAt(x, z);
    //   if (h < -0.1) continue;
    //   const back = smoothstep(0, -50, z);
    //   if (rnd() < 0.72) addPine(x, h - 0.05, z, 0.9 + rnd() * 0.8 + back * 0.6);
    //   else addRound(x, h - 0.05, z, 0.9 + rnd() * 0.7);
    //   placed++;
    // }
  }
  const instanced = (geo, mat, mats, cols, shadow) => {
    if (!mats.length) return;
    const im = new THREE.InstancedMesh(geo, mat, mats.length);
    for (let i = 0; i < mats.length; i++) { im.setMatrixAt(i, mats[i]); if (cols) im.setColorAt(i, cols[i]); }
    im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true;
    im.castShadow = !!shadow; scene.add(im);
  };
  {
    const trunkGeo = new THREE.CylinderGeometry(0.07, 0.1, 0.8, 6); trunkGeo.translate(0, 0.4, 0);
    const trunkMat = lam(0x6b4a2b);
    instanced(trunkGeo, trunkMat, trunkM, null, true);
    instanced(trunkGeo, trunkMat, pineTrunkM, null, false);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0, flatShading: true });
    const roundGeo = new THREE.IcosahedronGeometry(0.62, 1); roundGeo.translate(0, 1.15, 0);
    instanced(roundGeo, leafMat, roundM, roundC, true);
    const pineGeo = new THREE.ConeGeometry(0.62, 1.0, 7); pineGeo.translate(0, 0.5, 0);
    for (let i = 0; i < 3; i++) instanced(pineGeo, leafMat, pineL[i], pineC, i === 0);
  }

  /* rocks, dock and sailboat */
  // {
  //   const mat = new THREE.MeshStandardMaterial({ color: 0x8a8f86, roughness: 1, flatShading: true });
  //   for (let i = 0; i < 16; i++) {
  //     const x = i < 9 ? LAKE.x + 12 + rnd() * 8 : 20 + rnd() * 18, z = i < 9 ? LAKE.z - 6 + rnd() * 10 : -20 + rnd() * 40;
  //     if (flatMask(x, z) < 0.9) continue;
  //     const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + rnd() * 0.7, 0), mat);
  //     r.position.set(x, heightAt(x, z) + 0.15, z); r.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); r.scale.y = 0.7; r.castShadow = true; scene.add(r);
  //   }
  // }
  const boat = new THREE.Group();
  // {
  //   const wood = lam(0xa9784a);
  //   for (let i = 0; i < 9; i++) { const b = box(0.75, 0.06, 1.1, wood, -12.5 - i * 0.78, -0.5, 19); b.castShadow = true; b.receiveShadow = true; scene.add(b); }
  //   for (const p of [[-13, 18.5], [-13, 19.5], [-18, 18.5], [-18, 19.5]]) scene.add(box(0.1, 0.9, 0.1, wood, p[0], -0.7, p[1]));
  //   const hull = box(1.5, 0.26, 0.55, lam(0xf6efe0), 0, 0.15, 0); hull.castShadow = true; boat.add(hull);
  //   boat.add(box(0.05, 1.5, 0.05, lam(0x6b4a2b), 0, 0.95, 0));
  //   const sailGeo = new THREE.BufferGeometry();
  //   sailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.3, 0, 0, 1.65, 0, 0.75, 0.3, 0]), 3));
  //   sailGeo.computeVertexNormals();
  //   const sail = new THREE.Mesh(sailGeo, new THREE.MeshLambertMaterial({ color: 0xfff3e0, side: THREE.DoubleSide })); sail.castShadow = true; boat.add(sail);
  //   boat.position.set(-25, LAKE.waterY, 28); scene.add(boat);
  // }

  /* ---------- mountains and clouds ---------- */
  function mountain(x, z, r, h) {
    // const g = new THREE.ConeGeometry(r, h, 8, 9, true), p = g.attributes.position, col = new Float32Array(p.count * 3);
    // const low = new THREE.Color(0x4e6b3a), low2 = new THREE.Color(0x6e8f44), rock = new THREE.Color(0x7c8a68),
    //   hi = new THREE.Color(0x96a08c), snow = new THREE.Color(0xeef4ee), c = new THREE.Color();
    // for (let i = 0; i < p.count; i++) {
    //   const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), t0 = (py + h / 2) / h;
    //   const jx = hash(px * 3.7 + py * 1.3, pz * 5.1 + py * 2.9) - 0.5, jz = hash(pz * 2.3 + py, px * 4.1 + py * 0.7) - 0.5;
    //   if (t0 < 0.985) p.setXYZ(i, px + jx * r * 0.22, py + jx * h * 0.06, pz + jz * r * 0.22);
    //   const tt = t0 + (hash(px * 1.7, pz * 2.3 + py) - 0.5) * 0.12;
    //   const mottle = hash(px * 0.5 + 4.2, pz * 0.5 - 1.7);                 // breaks up the green so it isn't one flat tone
    //   c.copy(low).lerp(low2, mottle);
    //   c.lerp(rock, smoothstep(0.26, 0.52, tt));
    //   c.lerp(hi, smoothstep(0.54, 0.7, tt));
    //   c.lerp(snow, smoothstep(0.82, 0.93, tt));                           // snow only right near the tip now
    //   col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    // }
    // g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    // const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true }));
    // m.position.set(x, -3 + h / 2, z); m.rotation.y = hash(x, z) * 6; scene.add(m);
  }
  // const MOUNTAIN_HEIGHT_SCALE = 0.7;   // turn this up/down to make the whole range taller/shorter
  // [[-88, -72, 38, 42], [-52, -62, 26, 26], [-20, -70, 22, 13], [16, -70, 32, 36], [55, -64, 34, 44], [92, -70, 38, 38],
  // [125, -52, 30, 32], [-120, -55, 34, 32], [-32, -105, 40, 46], [70, -105, 44, 52], [0, -125, 50, 40]]
  //   .forEach((m) => mountain(m[0], m[1], m[2], m[3] * MOUNTAIN_HEIGHT_SCALE));

  const clouds = [];
  {
    const m1 = new THREE.MeshBasicMaterial({ color: 0x1a2240, fog: false }), m2 = new THREE.MeshBasicMaterial({ color: 0x232d52, fog: false });
    cloudMats.push(m1, m2);
    const blobs = [[0, 0, 0, 1, 0], [1.15, -0.1, 0.1, 0.8, 0], [-1.15, -0.15, 0, 0.75, 0], [0.5, 0.55, 0, 0.75, 1], [-0.4, 0.5, 0.1, 0.6, 1]];
    const geo = new THREE.SphereGeometry(1, 14, 10);
    [[-70, 44, -120, 14], [-30, 56, -135, 11], [20, 40, -125, 12], [62, 52, -130, 16], [105, 42, -115, 13], [-105, 38, -100, 12], [0, 66, -140, 15], [40, 30, -100, 8], [-52, 30, -105, 9]].forEach((s) => {
      const g = new THREE.Group();
      blobs.forEach((b) => { const m = new THREE.Mesh(geo, b[4] ? m2 : m1); m.position.set(b[0] * s[3], b[1] * s[3], b[2] * s[3]); m.scale.set(b[3] * s[3], b[3] * s[3] * 0.72, b[3] * s[3] * 0.8); g.add(m); });
      g.position.set(s[0], s[1], s[2]); scene.add(g); clouds.push(g);
    });
  }

  /* ---------- traffic ---------- */
  const cars = [];
  {
    const cols = [0xf2c14e, 0xe4572e, 0x3a86ff, 0xf7f7f2, 0x2a9d8f, 0xff7b9c, 0x8e5bd8, 0xfff0a0];
    const makeCar = (c) => {
      const g = new THREE.Group();
      const b = box(1.0, 0.3, 0.5, lam(c), 0, 0.27, 0), t = box(0.5, 0.24, 0.44, lam(0xf6efe0), -0.05, 0.52, 0);
      b.castShadow = true; t.castShadow = true; g.add(b, t);
      for (const w of [[-0.3, -0.26], [-0.3, 0.26], [0.3, -0.26], [0.3, 0.26]]) g.add(box(0.2, 0.2, 0.08, lam(0x222222), w[0], 0.12, w[1]));
      scene.add(g); return g;
    };
    const rdx = ROAD_R.bx - ROAD_R.ax, rdz = ROAD_R.bz - ROAD_R.az, rl = Math.hypot(rdx, rdz);
    const R = { cx: (ROAD_R.ax + ROAD_R.bx) / 2, cz: (ROAD_R.az + ROAD_R.bz) / 2, ux: rdx / rl, uz: rdz / rl };
    for (let i = 0; i < 6; i++) cars.push({ m: makeCar(cols[i % cols.length]), road: 'R', s: -45 + i * 15 + rnd() * 6, v: (i % 2 ? 1 : -1) * (5 + rnd() * 3), lane: i % 2 ? 0.6 : -0.6, R });
    for (let j = 0; j < 4; j++) cars.push({ m: makeCar(cols[(j + 3) % cols.length]), road: 'B', s: -45 + j * 24 + rnd() * 8, v: (j % 2 ? 1 : -1) * (4.5 + rnd() * 3), lane: j % 2 ? 0.4 : -0.4 });
  }

  /* ---------- fireworks: rockets rise, burst in the sky, sparks fade ---------- */
  const fireworks = { enabled: fxState.fireworks, update() {}, setEnabled() {} };
  {
    // ---- look & feel: change these numbers ----
    const LAUNCH_EVERY = [0.5, 1.6];      // seconds between launches (min, max)
    const SALVO_CHANCE = 0.25;            // chance a launch fires 3 rockets together
    const BURST_HEIGHT = [16, 28];        // how high the shells explode (kept low so they stay inside the view)
    const BURST_SPEED = 22;               // bigger = bigger bursts
    const FLASH = 2500;                   // how strongly a burst lights the ground/buildings
    const SPARK_SIZE = 1.6;               // size of one spark (world units)
    const HEAD_SIZE = 5;                  // size of the glowing rocket head / burst core
    const SPREAD = 24;                    // rockets launch within this distance of the spot the camera is looking at
    const PALETTE = [0xff3b3b, 0xffb42e, 0xffe36b, 0x4dffb0, 0x4db8ff, 0xc45cff, 0xff6fd0, 0xffffff];

    // soft round sprite (bright centre, transparent edge)
    const tc = document.createElement('canvas'); tc.width = tc.height = 64;
    const tg = tc.getContext('2d'), tgr = tg.createRadialGradient(32, 32, 0, 32, 32, 32);
    tgr.addColorStop(0, 'rgba(255,255,255,1)'); tgr.addColorStop(0.3, 'rgba(255,255,255,0.7)'); tgr.addColorStop(1, 'rgba(255,255,255,0)');
    tg.fillStyle = tgr; tg.fillRect(0, 0, 64, 64);
    const sprite = new THREE.CanvasTexture(tc);

    // A pool = one THREE.Points object holding many particles (plain PointsMaterial, no custom shader).
    function makePool(MAX, size) {
      const P = new Float32Array(MAX * 3), C = new Float32Array(MAX * 3), BC = new Float32Array(MAX * 3), V = new Float32Array(MAX * 3);
      const AGE = new Float32Array(MAX), LIFE = new Float32Array(MAX), DRAG = new Float32Array(MAX), GRAV = new Float32Array(MAX), TWK = new Float32Array(MAX);
      for (let i = 0; i < MAX; i++) P[i * 3 + 1] = -1000;
      const geo = new THREE.BufferGeometry();
      const aPos = new THREE.BufferAttribute(P, 3), aCol = new THREE.BufferAttribute(C, 3);
      aPos.setUsage(THREE.DynamicDrawUsage); aCol.setUsage(THREE.DynamicDrawUsage);
      geo.setAttribute('position', aPos); geo.setAttribute('color', aCol);
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        map: sprite, size, sizeAttenuation: true, vertexColors: true, transparent: true,
        depthWrite: false, blending: THREE.AdditiveBlending, fog: false
      }));
      pts.frustumCulled = false; pts.visible = fxState.fireworks; scene.add(pts);
      let head = 0;
      return {
        pts,
        clear() { LIFE.fill(0); C.fill(0); for (let i = 0; i < MAX; i++) P[i * 3 + 1] = -1000; aPos.needsUpdate = true; aCol.needsUpdate = true; },
        spawn(x, y, z, vx, vy, vz, r, g, b, life, drag, grav, twk) {
          const i = head; head = (head + 1) % MAX; const k = i * 3;
          P[k] = x; P[k + 1] = y; P[k + 2] = z; V[k] = vx; V[k + 1] = vy; V[k + 2] = vz;
          BC[k] = r; BC[k + 1] = g; BC[k + 2] = b; C[k] = r; C[k + 1] = g; C[k + 2] = b;
          AGE[i] = 0; LIFE[i] = life; DRAG[i] = drag; GRAV[i] = grav; TWK[i] = twk;
        },
        step(dt, time) {
          for (let i = 0; i < MAX; i++) {
            const L = LIFE[i]; if (L <= 0) continue;
            const k = i * 3, age = AGE[i] + dt;
            if (age >= L) { LIFE[i] = 0; C[k] = C[k + 1] = C[k + 2] = 0; continue; }
            AGE[i] = age; const damp = Math.exp(-DRAG[i] * dt);
            V[k] *= damp; V[k + 1] = V[k + 1] * damp - GRAV[i] * dt; V[k + 2] *= damp;
            P[k] += V[k] * dt; P[k + 1] += V[k + 1] * dt; P[k + 2] += V[k + 2] * dt;
            let a = 1 - age / L; a *= a;                                          // additive blending: fade = darken
            if (TWK[i]) a *= 0.55 + 0.45 * Math.sin(time * 35 + i);              // twinkle
            a *= 1.4;
            C[k] = BC[k] * a; C[k + 1] = BC[k + 1] * a; C[k + 2] = BC[k + 2] * a;
          }
          aPos.needsUpdate = true; aCol.needsUpdate = true;
        }
      };
    }
    const small = makePool(6500, SPARK_SIZE), big = makePool(800, HEAD_SIZE);
    // size >= 2 -> goes to the "big" pool (rocket head, burst core), otherwise small sparks
    const spawn = (x, y, z, vx, vy, vz, r, g, b, life, size, drag, grav, twk) =>
      (size >= 2 ? big : small).spawn(x, y, z, vx, vy, vz, r, g, b, life, drag, grav, twk);

    // a few point lights, reused, that flash in the colour of each burst
    const flashes = [];
    for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(0xffffff, 0, 0, 2); l.position.set(0, 40, 0); scene.add(l); flashes.push({ l, k: 0 }); }
    let flashI = 0, bursts = 0;

    const sphereDir = () => { const z = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = Math.sqrt(1 - z * z); return [Math.cos(a) * r, z, Math.sin(a) * r]; };
    const mixWhite = (c, t) => [c.r + (1 - c.r) * t, c.g + (1 - c.g) * t, c.b + (1 - c.b) * t];

    function explode(x, y, z) {
      if (bursts++ === 0) console.log('[FIREWORKS] first burst at', x.toFixed(1), y.toFixed(1), z.toFixed(1));
      const c1 = new THREE.Color(PALETTE[(rnd() * PALETTE.length) | 0]), c2 = new THREE.Color(PALETTE[(rnd() * PALETTE.length) | 0]);
      const f = flashes[flashI++ % flashes.length]; f.l.position.set(x, y, z); f.l.color.copy(c1); f.k = 1;
      spawn(x, y, z, 0, 0, 0, 1, 1, 1, 0.3, 7, 0, 0, 0);                        // bright core flash
      const type = rnd(), SP = BURST_SPEED;
      if (type < 0.4) {                                                          // peony: round ball
        for (let i = 0; i < 300; i++) {
          const d = sphereDir(), s = SP * (0.72 + rnd() * 0.28), col = mixWhite(rnd() < 0.35 ? c2 : c1, rnd() * 0.35);
          spawn(x, y, z, d[0] * s, d[1] * s, d[2] * s, col[0], col[1], col[2], 1.7 + rnd() * 0.8, 1, 1.7, 4, rnd() < 0.4 ? 1 : 0);
        }
      } else if (type < 0.65) {                                                  // ring: tilted circle
        const n = sphereDir(), u = [-n[2], 0, n[0]], ul = Math.hypot(u[0], u[2]) || 1;
        u[0] /= ul; u[2] /= ul;
        const w = [n[1] * u[2] - n[2] * u[1], n[2] * u[0] - n[0] * u[2], n[0] * u[1] - n[1] * u[0]];
        for (let i = 0; i < 150; i++) {
          const a = (i / 150) * Math.PI * 2, s = SP * 1.05, ca = Math.cos(a) * s, sa = Math.sin(a) * s, col = mixWhite(c1, 0.2);
          spawn(x, y, z, u[0] * ca + w[0] * sa, u[1] * ca + w[1] * sa, u[2] * ca + w[2] * sa, col[0], col[1], col[2], 1.8 + rnd() * 0.3, 1, 1.8, 3, 0);
        }
      } else if (type < 0.85) {                                                  // willow: long golden drooping trails
        for (let i = 0; i < 230; i++) {
          const d = sphereDir(), s = SP * (0.5 + rnd() * 0.4);
          spawn(x, y, z, d[0] * s, d[1] * s, d[2] * s, 1, 0.74, 0.3, 3.2 + rnd() * 1.0, 1, 1.1, 6, 1);
        }
      } else {                                                                   // double: ball inside a ball
        for (let i = 0; i < 170; i++) { const d = sphereDir(), s = SP * 1.1, col = mixWhite(c1, 0.15); spawn(x, y, z, d[0] * s, d[1] * s, d[2] * s, col[0], col[1], col[2], 1.9 + rnd() * 0.5, 1, 1.8, 4, 0); }
        for (let i = 0; i < 120; i++) { const d = sphereDir(), s = SP * 0.55, col = mixWhite(c2, 0.4); spawn(x, y, z, d[0] * s, d[1] * s, d[2] * s, col[0], col[1], col[2], 1.6 + rnd() * 0.5, 1, 1.8, 4, 1); }
      }
    }

    const shells = [];
    // Fireworks follow the camera: they are launched around the ground spot the camera looks at
    // (pulled a little toward the camera) so the bursts always land inside the screen.
    const _dir = new THREE.Vector3(), focus = { x: -5, z: 0 };
    const updateFocus = (camera) => {
      camera.getWorldDirection(_dir);
      const cp = camera.position, t = Math.min(_dir.y < -0.05 ? -cp.y / _dir.y : 60, 160);
      const gx = cp.x + _dir.x * t, gz = cp.z + _dir.z * t;
      focus.x = gx + (cp.x - gx) * 0.25; focus.z = gz + (cp.z - gz) * 0.25;
    };
    const launch = () => {
      const H = BURST_HEIGHT[0] + rnd() * (BURST_HEIGHT[1] - BURST_HEIGHT[0]), a = 10;
      shells.push({
        x: focus.x + (rnd() - 0.5) * 2 * SPREAD, y: 1, z: focus.z + (rnd() - 0.5) * 2 * SPREAD,
        vx: (rnd() - 0.5) * 2, vz: (rnd() - 0.5) * 2, vy: Math.sqrt(2 * a * H), a, acc: 0
      });
    };
    let nextLaunch = 0.4;

    fireworks.update = (dt, time, camera) => {
      if (!fireworks.enabled) return;
      dt = Math.min(dt, 0.05);
      if (camera) updateFocus(camera);
      nextLaunch -= dt;
      if (nextLaunch <= 0) {
        const n = rnd() < SALVO_CHANCE ? 3 : 1;
        for (let i = 0; i < n; i++) launch();
        nextLaunch = LAUNCH_EVERY[0] + rnd() * (LAUNCH_EVERY[1] - LAUNCH_EVERY[0]);
      }
      for (let s = shells.length - 1; s >= 0; s--) {
        const sh = shells[s];
        sh.vy -= sh.a * dt; sh.x += sh.vx * dt; sh.y += sh.vy * dt; sh.z += sh.vz * dt;
        spawn(sh.x, sh.y, sh.z, 0, 0, 0, 1, 0.95, 0.8, 0.14, 5, 0, 0, 0);          // glowing rocket head
        sh.acc += dt * 160;
        while (sh.acc >= 1) {                                                       // long spark trail = the "line" behind the rocket
          sh.acc -= 1;
          spawn(sh.x, sh.y, sh.z, (rnd() - 0.5) * 1.2, -0.5 - rnd() * 1.5, (rnd() - 0.5) * 1.2, 1, 0.65, 0.28, 0.9 + rnd() * 0.6, 1, 1.2, 1.5, 0);
        }
        if (sh.vy <= 1) { explode(sh.x, sh.y, sh.z); shells.splice(s, 1); }
      }
      small.step(dt, time); big.step(dt, time);
      for (const f of flashes) { f.k *= Math.exp(-dt * 2.5); f.l.intensity = FLASH * f.k * f.k; }
    };
    fireworks.setEnabled = (on) => {
      fireworks.enabled = on; small.pts.visible = big.pts.visible = on;
      if (!on) { shells.length = 0; small.clear(); big.clear(); for (const f of flashes) { f.k = 0; f.l.intensity = 0; } }
      else nextLaunch = 0.3;
    };
  }

  /* ---------- falling snow: soft, fluffy flakes in two depth layers (toggle with effects.setSnow) ---------- */
  const snowfall = { enabled: fxState.snow, layers: [], update() {}, setEnabled() {} };
  {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,0.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
    const flakeTex = new THREE.CanvasTexture(c);

    const SNOW = { w: 70, h: 40, d: 70 };    // size of the snow box that follows the camera
    const defs = [                           // tweak these to change the look
      { n: 1400, size: 0.22, fall: 1.1, sway: 0.35, opacity: 0.85 },   // small, far flakes
      { n: 500,  size: 0.55, fall: 1.7, sway: 0.6,  opacity: 0.9 }     // big fluffy flakes
    ];
    for (const d of defs) {
      const pos = new Float32Array(d.n * 3), seed = new Float32Array(d.n), spd = new Float32Array(d.n);
      for (let i = 0; i < d.n; i++) {
        pos[i * 3] = (rnd() - 0.5) * SNOW.w;
        pos[i * 3 + 1] = rnd() * SNOW.h;
        pos[i * 3 + 2] = (rnd() - 0.5) * SNOW.d - 10;
        seed[i] = rnd() * 6.283; spd[i] = 0.7 + rnd() * 0.6;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({
        map: flakeTex, size: d.size, sizeAttenuation: true, transparent: true,
        opacity: d.opacity, depthWrite: false, color: 0xffffff
      }));
      pts.frustumCulled = false; pts.visible = snowfall.enabled;
      scene.add(pts);
      snowfall.layers.push({ pts, pos, seed, spd, d });
    }
    snowfall.update = (dt, time, camera) => {
      if (!snowfall.enabled) return;
      dt = Math.min(dt, 0.05);
      const cam = camera.position;
      for (const { pts, pos, seed, spd, d } of snowfall.layers) {
        for (let i = 0; i < spd.length; i++) {
          const k = i * 3;
          pos[k + 1] -= d.fall * spd[i] * dt;                                  // fall
          pos[k] += Math.sin(time * 0.7 + seed[i]) * d.sway * dt;              // sway left/right
          pos[k + 2] += Math.cos(time * 0.5 + seed[i]) * d.sway * 0.6 * dt;
          if (pos[k + 1] < 0) pos[k + 1] += SNOW.h;                            // reached ground -> back to the top
          if (pos[k] < cam.x - SNOW.w / 2) pos[k] += SNOW.w; else if (pos[k] > cam.x + SNOW.w / 2) pos[k] -= SNOW.w;
          if (pos[k + 2] < cam.z - SNOW.d / 2) pos[k + 2] += SNOW.d; else if (pos[k + 2] > cam.z + SNOW.d / 2) pos[k + 2] -= SNOW.d;
        }
        pts.geometry.attributes.position.needsUpdate = true;
      }
    };
    snowfall.setEnabled = (on) => { snowfall.enabled = on; for (const L of snowfall.layers) L.pts.visible = on; };
  }

  /* ---------- per-frame animation ---------- */
  function update(dt, time, camera) {
    skyGroup.position.copy(camera.position);
    for (const c of cars) {
      c.s += c.v * dt; if (c.s > 52) c.s = -52; if (c.s < -52) c.s = 52;
      let fx, fz;
      if (c.road === 'R') {
        fx = c.R.ux * Math.sign(c.v); fz = c.R.uz * Math.sign(c.v);
        c.m.position.set(c.R.cx + c.R.ux * c.s + c.R.uz * c.lane, 0.08, c.R.cz + c.R.uz * c.s - c.R.ux * c.lane);
      } else {
        fx = Math.sign(c.v); fz = 0;
        c.m.position.set(c.s, 0.08, ROAD_B_Z + c.lane);
      }
      c.m.rotation.y = -Math.atan2(fz, fx);
    }
    fireworks.update(dt, time, camera);
    snowfall.update(dt, time, camera);
    boat.position.y = LAKE.waterY + Math.sin(time * 1.3) * 0.05; boat.rotation.z = Math.sin(time * 1.1) * 0.05; boat.rotation.y = 0.5 + Math.sin(time * 0.2) * 0.2;
    clouds.forEach((c, i) => { c.position.x += dt * (0.5 + (i % 3) * 0.25); if (c.position.x > 140) c.position.x = -140; });
  }

  /* ---------- effects switches: night / fireworks / snow ---------- */
  applyTime(fxState.night);        // again, now that the clouds exist
  const listeners = [];
  const changed = () => {
    if (FX.remember) { try { localStorage.setItem(FX_KEY, JSON.stringify(fxState)); } catch (e) { /* ignore */ } }
    listeners.forEach((fn) => fn({ ...fxState }));
  };
  const effects = {
    get state() { return { ...fxState }; },
    setNight(on) { fxState.night = !!on; applyTime(fxState.night); changed(); },
    setFireworks(on) { fxState.fireworks = !!on; fireworks.setEnabled(fxState.fireworks); changed(); },
    setSnow(on) { fxState.snow = !!on; snowfall.setEnabled(fxState.snow); changed(); },
    toggleNight() { this.setNight(!fxState.night); },
    toggleFireworks() { this.setFireworks(!fxState.fireworks); },
    toggleSnow() { this.setSnow(!fxState.snow); },
    onChange(fn) { listeners.push(fn); }
  };

  if (FX.ui && typeof document !== 'undefined') {
    const pos = { 'bottom-left': 'bottom:16px;left:16px', 'bottom-right': 'bottom:16px;right:16px', 'top-left': 'top:16px;left:16px', 'top-right': 'top:16px;right:16px' }[FX.uiCorner] || 'bottom:16px;left:16px';
    const bar = document.createElement('div');
    bar.style.cssText = 'position:fixed;z-index:30;display:flex;gap:8px;font:600 13px system-ui,sans-serif;' + pos;
    const mk = (onClick) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.cssText = 'cursor:pointer;border:1px solid rgba(255,255,255,0.35);border-radius:999px;padding:8px 14px;backdrop-filter:blur(6px);font:inherit;transition:background .15s,color .15s';
      b.addEventListener('pointerdown', (e) => e.stopPropagation());     // don't start a camera drag
      b.addEventListener('click', (e) => { e.stopPropagation(); onClick(); });
      bar.appendChild(b); return b;
    };
    const style = (b, on) => { b.style.background = on ? 'rgba(255,255,255,0.92)' : 'rgba(20,28,50,0.72)'; b.style.color = on ? '#16203a' : '#fff'; b.setAttribute('aria-pressed', String(!!on)); };
    const bTime = mk(() => effects.toggleNight());
    const bFire = mk(() => effects.toggleFireworks());
    const bSnow = mk(() => effects.toggleSnow());
    const paint = (st) => {
      bTime.textContent = st.night ? '\u{1F319} Night' : '\u2600\uFE0F Day'; style(bTime, !st.night);
      bFire.textContent = '\u{1F386} Fireworks'; style(bFire, st.fireworks);
      bSnow.textContent = '\u2744\uFE0F Snow'; style(bSnow, st.snow);
    };
    effects.onChange(paint); paint(fxState);
    document.body.appendChild(bar);
  }

  return { places, buildingMeshes, labels, update, effects };
}