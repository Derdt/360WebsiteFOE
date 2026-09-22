// ---------------------------------------------------------------------------
//  Campus viewer: renderer, camera controls, map pins, hover tooltip, info panel.
//  Loaded by campus.html.
// ---------------------------------------------------------------------------
import * as THREE from 'three';
import { createWorld } from './world.js';
import { VR_DIR } from './config.js';

const $ = (id) => document.getElementById(id);
const stage = $('stage'), pinLayer = $('pins'), chipBar = $('chips'), panel = $('infoPanel');
const titleEl = $('buildingTitle'), descEl = $('buildingDesc'), enterVR = $('enterVR'), vrNote = $('vrNote');
const tooltip = $('tooltip'), hint = $('hint'), fallback = $('fallback');

function fail(message, err) {
  if (err) console.error(err);
  fallback.textContent = message; fallback.hidden = false;
}

const ICONS = {
  cap: '<svg viewBox="0 0 24 24"><path d="M12 3 1 9l11 6 9-4.9V17h2V9L12 3zM5 13.2v4L12 21l7-3.8v-4L12 17l-7-3.8z"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51C12.96 17.55 11 21 11 21z"/></svg>',
  desk: '<svg viewBox="0 0 24 24"><path d="M21 2H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7v2H8v2h8v-2h-2v-2h7a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>',
  flask: '<svg viewBox="0 0 24 24"><path d="M9 2v2h1v5.2L4.6 18.5C4 19.6 4.8 21 6.1 21h11.8c1.3 0 2.1-1.4 1.5-2.5L14 9.2V4h1V2H9z"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14h-6v-6h-4v6H4z"/></svg>',
  book: '<svg viewBox="0 0 24 24"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 2l3 6.9 7.5.7-5.7 5 1.7 7.4L12 18l-6.5 4 1.7-7.4-5.7-5 7.5-.7z"/></svg>'
};

function start() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (err) { fail('This 3D campus needs WebGL. Please try another browser or device.', err); return; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // keeps the demo's look (see world.js)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(52, 1, 1, 900);
  const world = createWorld(scene);
  const places = world.places;

  /* ---------- pins and chips ---------- */
  places.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'pin' + (p.main ? ' main' : '');
    el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', p.name);
    el.innerHTML = '<span class="bob"><span class="drop">' + (ICONS[p.icon] || ICONS.home) + '</span><span class="tag"></span></span>';
    el.querySelector('.tag').textContent = p.short;
    el.addEventListener('click', () => select(sel === p.id ? null : p.id));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(sel === p.id ? null : p.id); } });
    pinLayer.appendChild(el); p.el = el;

    const chip = document.createElement('button');
    chip.className = 'chip'; chip.type = 'button'; chip.textContent = p.short;
    chip.addEventListener('click', () => select(sel === p.id ? null : p.id));
    chipBar.appendChild(chip); p.chip = chip;
  });
  const overview = document.createElement('button');
  overview.className = 'chip overview'; overview.type = 'button'; overview.textContent = 'Overview';
  overview.addEventListener('click', () => select(null));
  chipBar.insertBefore(overview, chipBar.firstChild);
  $('closePanel').addEventListener('click', () => select(null));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') select(null); });

  /* ---------- camera state ---------- */
  const home = { theta: 0.12, e: 0.3, r: 40, tx: 0, ty: 1, tz: -1 };
  const cam = { theta: 0.7, e: 0.06, r: 66, tx: 0, ty: 7, tz: -8 };    // start values: the intro swoops into `goal`
  const goal = { ...home };
  let sel = null, hover = null, lastInput = -10, time = 0, fit = 1;

  function select(id) {
    sel = id;
    places.forEach((p) => { p.el.classList.toggle('on', p.id === id); p.chip.classList.toggle('on', p.id === id); });
    overview.classList.toggle('on', !id);
    if (id) {
      const p = places.find((q) => q.id === id);
      titleEl.textContent = p.name; descEl.textContent = p.description;
      if (p.vrPage) { enterVR.href = VR_DIR + p.vrPage; enterVR.hidden = false; vrNote.hidden = true; }
      else { enterVR.removeAttribute('href'); enterVR.hidden = true; vrNote.hidden = false; }
      panel.hidden = false;
      goal.tx = p.anchor.x; goal.ty = 0.8; goal.tz = p.anchor.z; goal.r = 20; goal.e = Math.max(goal.e, 0.48);
    } else {
      panel.hidden = true;
      goal.tx = home.tx; goal.ty = home.ty; goal.tz = home.tz; goal.r = home.r;
    }
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) { /* ignore */ }
  }
  overview.classList.add('on');

  /* ---------- pointer input: drag = look around, click = pick a building ---------- */
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pointers = new Map();
  let pinch = 0, downAt = null;
  const touched = () => { lastInput = time; hint.classList.add('gone'); };
  function pick(e) {
    const r = stage.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(world.buildingMeshes, false)[0];
    return hit ? places.find((p) => p.id === hit.object.userData.id) : null;
  }
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    downAt = pointers.size === 1 ? { x: e.clientX, y: e.clientY } : null;
    if (pointers.size === 2) { const a = [...pointers.values()]; pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
    tooltip.style.opacity = 0; touched();
  });
  stage.addEventListener('pointermove', (e) => {
    const p = pointers.get(e.pointerId);
    if (!p) {                                      // hovering (mouse only)
      const hit = e.pointerType === 'mouse' ? pick(e) : null;
      hover = hit ? hit.id : null;
      stage.style.cursor = hit ? 'pointer' : '';
      if (hit) { tooltip.textContent = hit.name; tooltip.style.transform = `translate(${e.clientX + 16}px, ${e.clientY + 16}px)`; tooltip.style.opacity = 1; }
      else tooltip.style.opacity = 0;
      return;
    }
    if (pointers.size === 1) {
      goal.theta -= (e.clientX - p.x) * 0.005;
      goal.e += (e.clientY - p.y) * 0.004;
      goal.theta = Math.max(-0.85, Math.min(0.85, goal.theta));
      goal.e = Math.max(0.1, Math.min(1.15, goal.e));
    }
    p.x = e.clientX; p.y = e.clientY;
    if (pointers.size === 2) {
      const a = [...pointers.values()], d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (pinch > 0) goal.r = Math.max(12, Math.min(75, goal.r * (pinch / d)));
      pinch = d;
    }
    touched();
  });
  const endPointer = (e) => { pointers.delete(e.pointerId); pinch = 0; };
  stage.addEventListener('pointerup', (e) => {
    const wasClick = downAt && pointers.size === 1 && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6;
    endPointer(e);
    if (wasClick) { const hit = pick(e); if (hit) select(hit.id); else if (sel) select(null); }
    downAt = null;
  });
  stage.addEventListener('pointercancel', (e) => { endPointer(e); downAt = null; });
  stage.addEventListener('pointerleave', () => { hover = null; tooltip.style.opacity = 0; });
  stage.addEventListener('wheel', (e) => { e.preventDefault(); goal.r = Math.max(12, Math.min(75, goal.r * Math.exp(e.deltaY * 0.001))); touched(); }, { passive: false });

  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    fit = camera.aspect < 1.7 ? Math.pow(1.7 / camera.aspect, 0.6) : 1;   // pull back on narrow screens
  }
  window.addEventListener('resize', resize); resize();

  /* ---------- main loop ---------- */
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const v3 = new THREE.Vector3();
  let prev = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - prev) / 1000); prev = now; time += dt;
    const k = 1 - Math.exp(-dt * (reduce ? 20 : 3.2));
    for (const key of ['theta', 'e', 'r', 'tx', 'ty', 'tz']) cam[key] += (goal[key] - cam[key]) * k;

    const idle = smooth(4, 7, time - lastInput) * (sel ? 0 : 1) * (reduce ? 0 : 1);
    const th = cam.theta + Math.sin(time * 0.22) * 0.16 * idle, dist = cam.r * fit;
    camera.position.set(cam.tx + dist * Math.sin(th) * Math.cos(cam.e), cam.ty + dist * Math.sin(cam.e), cam.tz + dist * Math.cos(th) * Math.cos(cam.e));
    camera.lookAt(cam.tx, cam.ty, cam.tz); camera.updateMatrixWorld();

    world.update(dt, time, camera);
    for (const p of places) {                                   // soft glow on hovered / selected building
      const target = (p.id === hover || p.id === sel) ? 0.2 : 0, m = p.hit.material;
      m.opacity += (target - m.opacity) * Math.min(1, dt * 10);
    }
    renderer.render(scene, camera);

    const w = window.innerWidth, h = window.innerHeight;
    for (const p of places) {
      v3.copy(p.anchor).project(camera);
      const vis = v3.z < 1 && Math.abs(v3.x) < 1.15 && Math.abs(v3.y) < 1.15;
      p.el.style.display = vis ? '' : 'none';
      if (!vis) continue;
      const x = (v3.x * 0.5 + 0.5) * w, y = (-v3.y * 0.5 + 0.5) * h;
      const s = Math.max(0.7, Math.min(1.25, 48 / camera.position.distanceTo(p.anchor)));
      p.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
      p.el.style.zIndex = Math.round(y);
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.body.classList.add('ready');

  // Open a place straight from the address, e.g. campus.html#engineering
  // (handy for the "Back" button of a VR page).
  const wanted = decodeURIComponent(location.hash.slice(1));
  if (places.some((p) => p.id === wanted)) setTimeout(() => select(wanted), 1200);
}

try { start(); } catch (err) { fail('Something went wrong while loading the campus. Check the browser console for details.', err); }
