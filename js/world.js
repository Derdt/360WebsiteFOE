// ---------------------------------------------------------------------------
//  The 3D campus: terrain, lake, roads, buildings, trees, mountains, sky, traffic.
//  createWorld(scene) fills a THREE.Scene and returns what the viewer needs.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { MAP_SCALE as S, MAP_CENTER, CAMPUS as CR, ROAD_RIGHT, ROAD_BOTTOM, LAKE, BUILDINGS, MONUMENT } from './config.js';

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
function flatMask(x, z) {
  const dRect = rectDist(x, z);
  const dRoad = Math.min(distLine(x, z, ROAD_R.ax, ROAD_R.az, ROAD_R.bx, ROAD_R.bz), Math.abs(z - ROAD_B_Z));
  return Math.min(smoothstep(1.5, 9, dRect), smoothstep(2.3, 7, dRoad));
}
function lakeF(x, z) { const d = Math.hypot((x - LAKE.x) / LAKE.rx, (z - LAKE.z) / LAKE.rz); return 1 - smoothstep(0.35, 1.15, d); }
function hillsAt(x, z) {
  const back = smoothstep(-8, -42, z), side = smoothstep(16, 42, Math.abs(x));
  const amp = 0.9 + 3.0 * back + side * 1.6;
  return (fbm(x * 0.055 + 3.1, z * 0.055 + 7.7) - 0.35) * 2 * amp + back * 4.2 + side * 2.2;
}
export function heightAt(x, z) { return hillsAt(x, z) * flatMask(x, z) - lakeF(x, z) * 2.6; }

/* =========================================================================== */
export function createWorld(scene) {
  THREE.ColorManagement.enabled = false;
  const rnd = mulberry32(20260921);
  const lam = (c) => new THREE.MeshLambertMaterial({ color: c });
  const box = (w, h, d, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); return m; };
  const add = (o) => { scene.add(o); return o; };

  scene.fog = new THREE.Fog(0xcfe8f8, 110, 300);

  /* ---------- sky, sun, lights ---------- */
  const sunDir = new THREE.Vector3(-0.15, 0.62, -0.77).normalize();
  const skyGroup = new THREE.Group();
  scene.add(skyGroup);
  const sky = new THREE.Mesh(new THREE.SphereGeometry(600, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { sunDir: { value: sunDir } },
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: [
      'varying vec3 vP; uniform vec3 sunDir;',
      'void main(){',
      ' vec3 d = normalize(vP); float h = clamp(d.y, 0.0, 1.0);',
      ' vec3 c0 = vec3(0.81, 0.91, 0.97); vec3 c1 = vec3(0.60, 0.82, 0.98); vec3 c2 = vec3(0.32, 0.62, 0.95); vec3 c3 = vec3(0.16, 0.45, 0.88);',
      ' vec3 col = mix(c0, c1, smoothstep(0.0, 0.12, h));',
      ' col = mix(col, c2, smoothstep(0.08, 0.4, h));',
      ' col = mix(col, c3, smoothstep(0.35, 0.9, h));',
      ' float s = max(dot(d, sunDir), 0.0);',
      ' col += vec3(1.0, 1.0, 0.9) * pow(s, 10.0) * 0.18 + vec3(1.0, 1.0, 0.95) * pow(s, 140.0) * 0.6;',
      ' gl_FragColor = vec4(col, 1.0);',
      '}'
    ].join('\n')
  }));
  sky.renderOrder = -10; sky.frustumCulled = false;
  skyGroup.add(sky);

  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(30, 48), new THREE.MeshBasicMaterial({ color: 0xffffee, fog: false, depthWrite: false }));
  sunDisc.position.copy(sunDir).multiplyScalar(430); sunDisc.lookAt(0, 0, 0); sunDisc.renderOrder = -9;
  skyGroup.add(sunDisc);

  {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, 'rgba(255,255,235,0.85)'); gr.addColorStop(0.35, 'rgba(255,255,220,0.25)'); gr.addColorStop(1, 'rgba(255,255,220,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), blending: THREE.AdditiveBlending, fog: false, depthWrite: false, transparent: true }));
    halo.scale.set(300, 300, 1); halo.position.copy(sunDir).multiplyScalar(425); halo.renderOrder = -8;
    skyGroup.add(halo);
  }

  // Intensities are multiplied by PI to match the classic three.js lighting the demo used.
  scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x4f6f2a, 0.85 * Math.PI));
  scene.add(new THREE.AmbientLight(0xffffff, 0.2 * Math.PI));
  const sun = new THREE.DirectionalLight(0xfff8e8, 1.05 * Math.PI);
  sun.position.set(-10, 40, 12);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 24, bottom: -24, near: 5, far: 90 });
  sun.shadow.camera.updateProjectionMatrix();
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);

  /* ---------- terrain and lake ---------- */
  {
    const g = new THREE.PlaneGeometry(220, 150, 260, 176);
    g.rotateX(-Math.PI / 2); g.translate(0, 0, -10);
    const pos = g.attributes.position, col = new Float32Array(pos.count * 3), c = new THREE.Color();
    const lime = new THREE.Color(0x9acb3c), green = new THREE.Color(0x63a72d), deep = new THREE.Color(0x3e7d27),
          rock = new THREE.Color(0x7c8a5a), sand = new THREE.Color(0xf2dca6), wet = new THREE.Color(0xd8bf86);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = heightAt(x, z);
      pos.setY(i, h);
      const n = fbm(x * 0.09 + 11, z * 0.09 + 5);
      c.copy(lime).lerp(green, smoothstep(0.3, 0.75, n));
      c.lerp(deep, smoothstep(1.5, 5, h) * 0.8);
      c.lerp(rock, smoothstep(5.5, 9, h) * 0.6);
      c.lerp(sand, (1 - smoothstep(0.0, 0.9, h)) * smoothstep(0.0, 0.12, lakeF(x, z)));
      if (h < -0.7) c.lerp(wet, 0.8);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    const t = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }));
    t.receiveShadow = true; scene.add(t);

    const skirt = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshBasicMaterial({ color: 0x6f9a3c }));
    skirt.rotation.x = -Math.PI / 2; skirt.position.y = -3.2; scene.add(skirt);

    const water = new THREE.Mesh(new THREE.PlaneGeometry(64, 44), new THREE.MeshPhongMaterial({ color: 0x22b5e8, shininess: 90, specular: 0xffffff, transparent: true, opacity: 0.9 }));
    water.rotation.x = -Math.PI / 2; water.position.set(LAKE.x, LAKE.waterY, LAKE.z);
    scene.add(water);
  }

  /* ---------- roads and footpaths ---------- */
  {
    const asphalt = lam(0x4c4a52), curbMat = lam(0xd8caa8), dashMat = new THREE.MeshBasicMaterial({ color: 0xf6e6a8 });
    const rdx = ROAD_R.bx - ROAD_R.ax, rdz = ROAD_R.bz - ROAD_R.az, rot = -Math.atan2(rdz, rdx);
    const cx = (ROAD_R.ax + ROAD_R.bx) / 2, cz = (ROAD_R.az + ROAD_R.bz) / 2;
    const curb = box(220, 0.04, ROAD_RIGHT.width + 0.7, curbMat, cx, 0.02, cz); curb.rotation.y = rot; curb.receiveShadow = true; scene.add(curb);
    const road = box(220, 0.06, ROAD_RIGHT.width, asphalt, cx, 0.045, cz); road.rotation.y = rot; road.receiveShadow = true; scene.add(road);
    const curb2 = box(220, 0.04, ROAD_BOTTOM.width + 0.7, curbMat, 0, 0.02, ROAD_B_Z); curb2.receiveShadow = true; scene.add(curb2);
    const road2 = box(220, 0.06, ROAD_BOTTOM.width, asphalt, 0, 0.05, ROAD_B_Z); road2.receiveShadow = true; scene.add(road2);

    const N = 60, dm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 0.02, 0.09), dashMat, N * 2), d = new THREE.Object3D();
    const len = Math.hypot(rdx, rdz), ux = rdx / len, uz = rdz / len;
    let k = 0;
    for (let i = 0; i < N; i++) {
      const s = (i - N / 2) * 1.5;
      d.position.set(cx + ux * s, 0.085, cz + uz * s); d.rotation.set(0, rot, 0); d.updateMatrix(); dm.setMatrixAt(k++, d.matrix);
      d.position.set(s - 12, 0.09, ROAD_B_Z); d.rotation.set(0, 0, 0); d.updateMatrix(); dm.setMatrixAt(k++, d.matrix);
    }
    scene.add(dm);

    const pathMat = lam(0xeadbb2);
    const pathBox = (x0, z0, x1, z1, w) => {
      const m = box(Math.abs(x1 - x0) + (x0 === x1 ? w : 0), 0.03, Math.abs(z1 - z0) + (z0 === z1 ? w : 0), pathMat, (x0 + x1) / 2, 0.03, (z0 + z1) / 2);
      m.receiveShadow = true; scene.add(m);
    };
    pathBox(mx(100), mz(278), mx(425), mz(278), 0.9);
    pathBox(mx(425), mz(278), mx(425), mz(468), 0.9);
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

  // Invisible box that receives clicks/hover for a place. Its opacity is used as a hover glow.
  function makeHit(place, w, h, d, x, y, z) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: 0x7cc4ff, transparent: true, opacity: 0, depthWrite: false }));
    m.position.set(x, y, z);
    m.userData = { id: place.id, name: place.name, title: place.name, description: place.description, vrPage: place.vrPage };
    scene.add(m); buildingMeshes.push(m);
    place.hit = m;
  }

  function makeBuilding(o) {
    const W = o.w / S, D = o.h / S, fh = 0.6, floors = o.f || 2, wallH = floors * fh;
    const cx = mx(o.x + o.w / 2), cz = mz(o.y + o.h / 2);
    const g = new THREE.Group(); g.position.set(cx, 0, cz);
    const wallMat = lam(o.wall || 0xf3e6c8);
    const alongX = W >= D, L = alongX ? W : D, Sp = alongX ? D : W;
    const sub = new THREE.Group();
    let topY;
    if (o.flat) {
      const body = box(Sp, wallH, L, wallMat, 0, wallH / 2, 0);
      const roof = box(Sp + 0.14, 0.12, L + 0.14, lam(o.roof), 0, wallH + 0.06, 0);
      const ac = box(Math.min(0.7, Sp * 0.3), 0.22, 0.5, lam(0xb9b9b4), 0, wallH + 0.23, 0);
      [body, roof, ac].forEach((m) => { m.castShadow = true; m.receiveShadow = true; sub.add(m); });
      topY = wallH + 0.14;
    } else {
      const rh = Math.min(1.15, Sp * 0.24);
      const shape = new THREE.Shape();
      shape.moveTo(-Sp / 2, 0); shape.lineTo(Sp / 2, 0); shape.lineTo(Sp / 2, wallH); shape.lineTo(0, wallH + rh); shape.lineTo(-Sp / 2, wallH); shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: L, bevelEnabled: false }); geo.translate(0, 0, -L / 2);
      const wall = new THREE.Mesh(geo, wallMat); wall.castShadow = true; wall.receiveShadow = true; sub.add(wall);
      const th = Math.atan2(rh, Sp / 2), sl = Math.hypot(Sp / 2, rh) + 0.22;
      for (const s of [-1, 1]) {
        const slab = new THREE.Mesh(new THREE.BoxGeometry(sl, 0.09, L + 0.3), new THREE.MeshLambertMaterial({ map: roofTexture(o.roof, Math.max(2, L * 1.7)) }));
        slab.position.set(s * Sp / 4, wallH + rh / 2 + 0.03, 0);
        slab.rotation.z = -s * th; slab.castShadow = true; slab.receiveShadow = true; sub.add(slab);
      }
      topY = wallH + rh;
    }
    for (let f = 0; f < floors; f++) {
      for (const side of [-1, 1]) sub.add(box(0.03, 0.17, L * 0.86, glassMat, side * (Sp / 2 + 0.012), fh * (f + 0.58), 0));
    }
    sub.rotation.y = alongX ? Math.PI / 2 : 0;
    g.add(sub); scene.add(g);
    blockers.push([o.x - 8, o.y - 8, o.w + 16, o.h + 16]);

    if (o.id) {
      const place = { id: o.id, name: o.name, short: o.short || o.name, description: o.description || '', icon: o.icon || 'home', vrPage: o.vrPage || null, main: !!o.main,
                      anchor: new THREE.Vector3(cx, topY + 0.35, cz), group: g };
      makeHit(place, W + 0.25, topY + 0.3, D + 0.25, cx, (topY + 0.3) / 2, cz);
      places.push(place);
    }
    return { cx, cz, topY };
  }
  const built = {};
  BUILDINGS.forEach((b) => { const r = makeBuilding(b); if (b.id) built[b.id] = r; });

  /* entrance sign in front of the main building */
  {
    const main = BUILDINGS.find((b) => b.main), t = built[main.id];
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const tex = new THREE.CanvasTexture(c);
    const draw = () => {
      const g = c.getContext('2d');
      g.fillStyle = '#e8562a'; g.fillRect(0, 0, 512, 128);
      g.strokeStyle = '#ffd9c2'; g.lineWidth = 6; g.strokeRect(8, 8, 496, 112);
      g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.font = '600 46px Fredoka, system-ui, sans-serif'; g.fillText('Faculty of Engineering', 256, 52);
      g.font = '500 30px Fredoka, system-ui, sans-serif'; g.fillText('NUOL', 256, 94);
      tex.needsUpdate = true;
    };
    draw();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    const side = lam(0xb8401f);
    const board = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 0.06), [side, side, side, side, new THREE.MeshLambertMaterial({ map: tex }), side]);
    board.position.set(t.cx, 0.75, t.cz + 1.6); board.castShadow = true; scene.add(board);
    for (const dx of [-0.8, 0.8]) { const p = box(0.07, 0.75, 0.07, lam(0x6b4a2b), t.cx + dx, 0.37, t.cz + 1.6); p.castShadow = true; scene.add(p); }
  }

  /* ---------- courtyard with the monument, playground, dirt field ---------- */
  {
    const cxw = mx(MONUMENT.x), czw = mz(MONUMENT.y);
    const stone = lam(0xd9cfba), gold = lam(0xf3b63a);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.05, 40), lam(0xefe2c1)); disc.position.set(cxw, 0.03, czw); disc.receiveShadow = true; scene.add(disc);
    const step1 = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 1.05, 0.16, 8), stone); step1.position.set(cxw, 0.13, czw);
    const step2 = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.75, 0.2, 8), stone); step2.position.set(cxw, 0.31, czw);
    const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.3, 2.5, 4), stone); pillar.position.set(cxw, 1.66, czw); pillar.rotation.y = Math.PI / 4;
    const cap = new THREE.Mesh(new THREE.OctahedronGeometry(0.3, 0), gold); cap.position.set(cxw, 3.15, czw); cap.scale.y = 1.5;
    [step1, step2, pillar, cap].forEach((m) => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
    blockers.push([MONUMENT.x - 34, MONUMENT.y - 34, 68, 68]);
    const place = { id: MONUMENT.id, name: MONUMENT.name, short: MONUMENT.short || MONUMENT.name, description: MONUMENT.description || '', icon: MONUMENT.icon || 'star',
                    vrPage: MONUMENT.vrPage || null, main: false, anchor: new THREE.Vector3(cxw, 3.75, czw) };
    makeHit(place, 1.8, 3.6, 1.8, cxw, 1.8, czw);
    places.push(place);

    // playground
    const pxw = mx(410), pzw = mz(155);
    const pad = box(2.0, 0.03, 1.5, lam(0xf2c94c), pxw, 0.03, pzw); pad.receiveShadow = true; scene.add(pad);
    const slide = box(0.5, 0.06, 1.0, lam(0xe8562a), pxw - 0.5, 0.4, pzw); slide.rotation.x = 0.55; slide.castShadow = true; scene.add(slide);
    for (const o of [[-0.65, -0.45], [-0.65, 0.45]]) { const q = box(0.06, 0.8, 0.06, lam(0x3a86ff), pxw + o[0], 0.4, pzw + o[1]); q.castShadow = true; scene.add(q); }
    for (const o of [[0.35, -0.45], [0.35, 0.45]]) { const q = box(0.06, 0.9, 0.06, lam(0x2a9d8f), pxw + o[0], 0.45, pzw + o[1]); q.castShadow = true; scene.add(q); }
    const bar = box(0.06, 0.06, 1.0, lam(0x2a9d8f), pxw + 0.35, 0.9, pzw); bar.castShadow = true; scene.add(bar);
    blockers.push([386, 136, 48, 38]);

    // dirt field with two goals
    const fx = mx(452 + 83), fz = mz(44 + 50);
    const rim = box(8.8, 0.02, 5.4, lam(0xb4b24c), fx, 0.015, fz); rim.receiveShadow = true; scene.add(rim);
    const dirt = box(8.3, 0.03, 5.0, lam(0xc9a267), fx, 0.025, fz); dirt.receiveShadow = true; scene.add(dirt);
    const white = lam(0xffffff);
    for (const s of [-1, 1]) {
      const gx = fx + s * 3.9;
      for (const dz of [-0.5, 0.5]) { const p = box(0.05, 0.5, 0.05, white, gx, 0.27, fz + dz); p.castShadow = true; scene.add(p); }
      const cb = box(0.05, 0.05, 1.05, white, gx, 0.52, fz); cb.castShadow = true; scene.add(cb);
    }
    blockers.push([442, 34, 186, 120]);
  }

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

  { // campus trees
    const placedXZ = [];
    let placed = 0, tries = 0;
    while (placed < 42 && tries < 5000) {
      tries++;
      const px = rnd() * 640 + 4, py = rnd() * 456 + 4;
      if (inBlocker(px, py)) continue;
      if (Math.abs(py - 278) < 14 && px > 90 && px < 435) continue;
      if (Math.abs(px - 425) < 14 && py > 278) continue;
      const x = mx(px), z = mz(py);
      if (distLine(x, z, ROAD_R.ax, ROAD_R.az, ROAD_R.bx, ROAD_R.bz) < 3.2) continue;   // stay clear of the right/diagonal road
      if (Math.abs(z - ROAD_B_Z) < 3.2) continue;                                       // stay clear of the bottom road
      if (placedXZ.some((q) => Math.hypot(x - q[0], z - q[1]) < 2.1)) continue;         // keep trees from crowding each other
      placedXZ.push([x, z]);
      if (rnd() < 0.5) addRound(x, 0, z, 0.9 + rnd() * 0.6); else addPine(x, 0, z, 0.8 + rnd() * 0.5);
      placed++;
    }
  }
  { // hillside forest
    let placed = 0, tries = 0;
    while (placed < 420 && tries < 8000) {
      tries++;
      const x = (rnd() - 0.5) * 200, z = -78 + rnd() * 104;
      if (flatMask(x, z) < 0.9 || lakeF(x, z) > 0 || rectDist(x, z) < 6) continue;
      const h = heightAt(x, z);
      if (h < -0.1) continue;
      const back = smoothstep(0, -50, z);
      if (rnd() < 0.72) addPine(x, h - 0.05, z, 0.9 + rnd() * 0.8 + back * 0.6);
      else addRound(x, h - 0.05, z, 0.9 + rnd() * 0.7);
      placed++;
    }
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
  {
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a8f86, roughness: 1, flatShading: true });
    for (let i = 0; i < 16; i++) {
      const x = i < 9 ? LAKE.x + 12 + rnd() * 8 : 20 + rnd() * 18, z = i < 9 ? LAKE.z - 6 + rnd() * 10 : -20 + rnd() * 40;
      if (flatMask(x, z) < 0.9) continue;
      const r = new THREE.Mesh(new THREE.DodecahedronGeometry(0.4 + rnd() * 0.7, 0), mat);
      r.position.set(x, heightAt(x, z) + 0.15, z); r.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); r.scale.y = 0.7; r.castShadow = true; scene.add(r);
    }
  }
  const boat = new THREE.Group();
  {
    const wood = lam(0xa9784a);
    for (let i = 0; i < 9; i++) { const b = box(0.75, 0.06, 1.1, wood, -12.5 - i * 0.78, -0.5, 19); b.castShadow = true; b.receiveShadow = true; scene.add(b); }
    for (const p of [[-13, 18.5], [-13, 19.5], [-18, 18.5], [-18, 19.5]]) scene.add(box(0.1, 0.9, 0.1, wood, p[0], -0.7, p[1]));
    const hull = box(1.5, 0.26, 0.55, lam(0xf6efe0), 0, 0.15, 0); hull.castShadow = true; boat.add(hull);
    boat.add(box(0.05, 1.5, 0.05, lam(0x6b4a2b), 0, 0.95, 0));
    const sailGeo = new THREE.BufferGeometry();
    sailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0.3, 0, 0, 1.65, 0, 0.75, 0.3, 0]), 3));
    sailGeo.computeVertexNormals();
    const sail = new THREE.Mesh(sailGeo, new THREE.MeshLambertMaterial({ color: 0xfff3e0, side: THREE.DoubleSide })); sail.castShadow = true; boat.add(sail);
    boat.position.set(-25, LAKE.waterY, 28); scene.add(boat);
  }

  /* ---------- mountains and clouds ---------- */
  function mountain(x, z, r, h) {
    const g = new THREE.ConeGeometry(r, h, 8, 9, true), p = g.attributes.position, col = new Float32Array(p.count * 3);
    const low = new THREE.Color(0x4e6b3a), rock = new THREE.Color(0x76837c), hi = new THREE.Color(0x8a9690), snow = new THREE.Color(0xe4f0f2), c = new THREE.Color();
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i), py = p.getY(i), pz = p.getZ(i), t0 = (py + h / 2) / h;
      const jx = hash(px * 3.7 + py * 1.3, pz * 5.1 + py * 2.9) - 0.5, jz = hash(pz * 2.3 + py, px * 4.1 + py * 0.7) - 0.5;
      if (t0 < 0.985) p.setXYZ(i, px + jx * r * 0.22, py + jx * h * 0.06, pz + jz * r * 0.22);
      const tt = t0 + (hash(px * 1.7, pz * 2.3 + py) - 0.5) * 0.12;
      c.copy(low).lerp(rock, smoothstep(0.15, 0.45, tt)).lerp(hi, smoothstep(0.45, 0.62, tt)).lerp(snow, smoothstep(0.62, 0.7, tt));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0, flatShading: true }));
    m.position.set(x, -3 + h / 2, z); m.rotation.y = hash(x, z) * 6; scene.add(m);
  }
  [[-88, -72, 38, 42], [-52, -62, 26, 26], [-20, -70, 22, 13], [16, -70, 32, 36], [55, -64, 34, 44], [92, -70, 38, 38],
   [125, -52, 30, 32], [-120, -55, 34, 32], [-32, -105, 40, 46], [70, -105, 44, 52], [0, -125, 50, 40]].forEach((m) => mountain(m[0], m[1], m[2], m[3]));

  const clouds = [];
  {
    // const m1 = new THREE.MeshBasicMaterial({ color: 0xf4f9ff, fog: false }), m2 = new THREE.MeshBasicMaterial({ color: 0xffffff, fog: false });
    // const blobs = [[0, 0, 0, 1, 0], [1.15, -0.1, 0.1, 0.8, 0], [-1.15, -0.15, 0, 0.75, 0], [0.5, 0.55, 0, 0.75, 1], [-0.4, 0.5, 0.1, 0.6, 1]];
    // const geo = new THREE.SphereGeometry(1, 14, 10);
    // [[-70, 44, -120, 14], [-30, 56, -135, 11], [20, 40, -125, 12], [62, 52, -130, 16], [105, 42, -115, 13], [-105, 38, -100, 12], [0, 66, -140, 15], [40, 30, -100, 8], [-52, 30, -105, 9]].forEach((s) => {
    //   const g = new THREE.Group();
    //   blobs.forEach((b) => { const m = new THREE.Mesh(geo, b[4] ? m2 : m1); m.position.set(b[0] * s[3], b[1] * s[3], b[2] * s[3]); m.scale.set(b[3] * s[3], b[3] * s[3] * 0.72, b[3] * s[3] * 0.8); g.add(m); });
    //   g.position.set(s[0], s[1], s[2]); scene.add(g); clouds.push(g);
    // });
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
    boat.position.y = LAKE.waterY + Math.sin(time * 1.3) * 0.05; boat.rotation.z = Math.sin(time * 1.1) * 0.05; boat.rotation.y = 0.5 + Math.sin(time * 0.2) * 0.2;
    clouds.forEach((c, i) => { c.position.x += dt * (0.5 + (i % 3) * 0.25); if (c.position.x > 140) c.position.x = -140; });
  }

  return { places, buildingMeshes, update };
}