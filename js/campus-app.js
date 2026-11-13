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

  // Bounding box of the actual campus, worked out from the buildings themselves (plus a small
  // margin for the fence/grounds around them) — used to keep zoom-to-cursor from wandering off
  // into open ground or sky, so zooming always stays "inside the fence".
  const BOUNDS_MARGIN = 10;
  const campusBounds = places.reduce((b, p) => ({
    minX: Math.min(b.minX, p.anchor.x), maxX: Math.max(b.maxX, p.anchor.x),
    minZ: Math.min(b.minZ, p.anchor.z), maxZ: Math.max(b.maxZ, p.anchor.z)
  }), { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity });
  campusBounds.minX -= BOUNDS_MARGIN; campusBounds.maxX += BOUNDS_MARGIN;
  campusBounds.minZ -= BOUNDS_MARGIN; campusBounds.maxZ += BOUNDS_MARGIN;

  /* ---------- extra UI: compass + "explored" markers (self-contained, no campus.css needed) ---------- */
  const extraCSS = document.createElement('style');
  extraCSS.textContent = `
    .compass-wrap { position: fixed; top: 16px; left: 16px; z-index: 30; width: 56px; height: 56px;
      pointer-events: none; font: 700 10px/1 system-ui, sans-serif; color: #fff; }
    .compass-pointer { position: absolute; left: 50%; top: -5px; width: 0; height: 0; margin-left: -5px;
      border-left: 5px solid transparent; border-right: 5px solid transparent; border-bottom: 8px solid #4da3ff; }
    .compass-ring { position: absolute; inset: 0; border-radius: 50%; background: rgba(15,20,30,0.55);
      border: 1px solid rgba(255,255,255,0.25); }
    .compass-ring b { position: absolute; }
    .pin.explored .drop { position: relative; box-shadow: 0 0 0 2px #2ecc71 inset; }
    .pin.explored .drop::after { content: ''; position: absolute; top: -2px; right: -2px; width: 7px; height: 7px;
      border-radius: 50%; background: #2ecc71; border: 1px solid rgba(0,0,0,0.4); }
    .chip.explored { box-shadow: inset 0 0 0 2px #2ecc71; }
  `;
  document.head.appendChild(extraCSS);

  // "Explored" tracker: remembers (via localStorage) which buildings have been opened before.
  const EXPLORED_KEY = 'campus-explored-v1';
  let explored;
  try { explored = new Set(JSON.parse(localStorage.getItem(EXPLORED_KEY) || '[]')); }
  catch (e) { explored = new Set(); }
  function markExplored(id) {
    if (!id || explored.has(id)) return;
    explored.add(id);
    try { localStorage.setItem(EXPLORED_KEY, JSON.stringify([...explored])); } catch (e) { /* ignore */ }
    const p = places.find((q) => q.id === id);
    if (p) { p.el.classList.add('explored'); p.chip.classList.add('explored'); }
  }

  /* ---------- pins and chips ---------- */
  places.forEach((p) => {
    const el = document.createElement('div');
    el.className = 'pin' + (p.main ? ' main' : '');
    el.setAttribute('role', 'button'); el.tabIndex = 0; el.setAttribute('aria-label', p.name);
    el.innerHTML = '<span class="bob"><span class="drop">' + (ICONS[p.icon] || ICONS.home) + '</span><span class="tag"></span></span>';
    const tagEl = el.querySelector('.tag');
    tagEl.textContent = p.short;
    tagEl.style.opacity = '1';          // names visible at all times by default
    tagEl.style.visibility = 'visible';
    el.addEventListener('click', () => select(sel === p.id ? null : p.id));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(sel === p.id ? null : p.id); } });
    pinLayer.appendChild(el); p.el = el;

    const chip = document.createElement('button');
    chip.className = 'chip'; chip.type = 'button'; chip.textContent = p.short;
    chip.addEventListener('click', () => select(sel === p.id ? null : p.id));
    chipBar.appendChild(chip); p.chip = chip;

    if (explored.has(p.id)) { el.classList.add('explored'); chip.classList.add('explored'); }
  });
  /* ---------- name-only labels: no icon, no click, just the building's name ---------- */
  const nameLabels = world.labels || [];
  nameLabels.forEach((p) => {
    const el = document.createElement('div');
    el.textContent = p.name;
    el.setAttribute('aria-hidden', 'true');
    Object.assign(el.style, {
      position: 'absolute', left: '0', top: '0', pointerEvents: 'none',
      background: 'rgba(15,20,30,0.72)', color: '#fff', font: '600 12px/1.3 system-ui, sans-serif',
      padding: '2px 7px', borderRadius: '10px', whiteSpace: 'nowrap'
    });
    pinLayer.appendChild(el); p.el = el;
  });

  const overview = document.createElement('button');
  overview.className = 'chip overview'; overview.type = 'button'; overview.textContent = 'Overview';
  overview.addEventListener('click', () => select(null));
  chipBar.insertBefore(overview, chipBar.firstChild);
  $('closePanel').addEventListener('click', () => select(null));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') select(null); });

  /* ---------- camera state ---------- */
  const home = { theta: 0.22, e: 0.55, r: 56, tx: 0, ty: 1, tz: -1 };   // default overview angle, pulled back to show the fence + neighborhood
  const cam = { theta: 0.7, e: 0.06, r: 66, tx: 0, ty: 7, tz: -8 };    // start values: the intro swoops into `goal`
  const goal = { ...home };
  let sel = null, hover = null, lastInput = -10, time = 0, fit = 1;

  function select(id) {
    sel = id;
    places.forEach((p) => {
      p.el.classList.toggle('on', p.id === id);
      p.chip.classList.toggle('on', p.id === id);
      const tagEl = p.el.querySelector('.tag');
      if (tagEl) tagEl.style.visibility = (p.id === id) ? 'hidden' : 'visible';
    });
    overview.classList.toggle('on', !id);
    if (id) {
      const p = places.find((q) => q.id === id);
      titleEl.textContent = p.name; descEl.textContent = p.description;
      if (p.vrPage) { enterVR.href = VR_DIR + p.vrPage; enterVR.hidden = false; vrNote.hidden = true; }
      else { enterVR.removeAttribute('href'); enterVR.hidden = true; vrNote.hidden = false; }
      panel.hidden = false;
      goal.tx = p.anchor.x; goal.ty = 0.8; goal.tz = p.anchor.z; goal.r = 20; goal.e = Math.max(goal.e, 0.48);
      markExplored(id);
    } else {
      panel.hidden = true;
      goal.tx = home.tx; goal.ty = home.ty; goal.tz = home.tz; goal.r = home.r;
    }
    try { history.replaceState(null, '', id ? '#' + id : location.pathname + location.search); } catch (e) { /* ignore */ }
  }
  overview.classList.add('on');

  /* ---------- compass: ring carries N/E/S/W and turns with the view; the pointer marks "forward" ---------- */
  const compassWrap = document.createElement('div');
  compassWrap.className = 'compass-wrap';
  compassWrap.innerHTML =
    '<div class="compass-pointer"></div>' +
    '<div class="compass-ring" id="compassRing">' +
    '<b style="top:3px;left:50%;transform:translateX(-50%);">N</b>' +
    '<b style="top:50%;right:4px;transform:translateY(-50%);">E</b>' +
    '<b style="bottom:3px;left:50%;transform:translateX(-50%);">S</b>' +
    '<b style="top:50%;left:4px;transform:translateY(-50%);">W</b>' +
    '</div>';
  document.body.appendChild(compassWrap);
  const compassRing = compassWrap.querySelector('#compassRing');

  /* ---------- pointer input: drag = look around (full 360°), wheel/pinch = small zoom ---------- */
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pointers = new Map();
  let pinch = 0, downAt = null;
  const touched = () => { lastInput = time; hint.classList.add('gone'); };
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ROT_X = 0.006, ROT_Y = 0.004;           // drag-to-rotate sensitivity (theta / elevation)
  const ELEV_MIN = 0.12, ELEV_MAX = 0.85;       // keep the look angle from flipping over the top/bottom
  const WHEEL_SENS = 0.02, PINCH_SENS = 0.04;   // deliberately gentle — this is a nudge, not a dive into the model
  const ZOOM_FOCUS_PULL = 0.08;                 // each zoom tick nudges the target toward the point under the cursor
  const INERTIA_DECAY = 0.92, INERTIA_STOP = 0.00005; // how fast a drag's spin settles after release
  // Overview can pull back/push in a bit; a selected building gets its own tighter window
  // so zooming never reaches all the way down onto the model's surface.
  function zoomRange() { return sel ? [15, 26] : [45, 70]; }
  function pick(e) {
    const r = stage.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(world.buildingMeshes, false)[0];
    return hit ? places.find((p) => p.id === hit.object.userData.id) : null;
  }
  // "Ground" point under a screen position, at the current look-at height — used so zooming nudges
  // the view toward wherever the cursor/pinch is, instead of always zooming on the dead centre.
  const focusPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), focusHit = new THREE.Vector3();
  function groundPointAt(x, y) {
    const r = stage.getBoundingClientRect();
    ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    focusPlane.constant = -cam.ty;
    return raycaster.ray.intersectPlane(focusPlane, focusHit) ? focusHit : null;
  }
  function insideCampus(x, z) {
    return x >= campusBounds.minX && x <= campusBounds.maxX && z >= campusBounds.minZ && z <= campusBounds.maxZ;
  }
  function pullTargetToward(x, y) {
    if (sel) return;   // zoom-to-cursor is overview-only; a selected building stays centred on itself
    const hit = groundPointAt(x, y);
    if (!hit || !insideCampus(hit.x, hit.z)) return;   // cursor outside the fence — zoom normally, no pull
    goal.tx = clamp(goal.tx + (hit.x - goal.tx) * ZOOM_FOCUS_PULL, campusBounds.minX, campusBounds.maxX);
    goal.tz = clamp(goal.tz + (hit.z - goal.tz) * ZOOM_FOCUS_PULL, campusBounds.minZ, campusBounds.maxZ);
  }
  let velTheta = 0, velE = 0;                   // drag speed, carried into inertia on release
  const inertia = { theta: 0, e: 0 };
  function resetView() {                        // double-click/double-tap: snap back to the start angle
    select(null);
    goal.theta = home.theta; goal.e = home.e;
    inertia.theta = 0; inertia.e = 0; velTheta = 0; velE = 0;
    touched();
  }
  let lastTap = { time: 0, x: 0, y: 0 };
  stage.addEventListener('pointerdown', (e) => {
    stage.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    downAt = pointers.size === 1 ? { x: e.clientX, y: e.clientY } : null;
    if (pointers.size === 2) { const a = [...pointers.values()]; pinch = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y); }
    inertia.theta = 0; inertia.e = 0; velTheta = 0; velE = 0;   // grabbing the view cancels any ongoing spin
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
    if (pointers.size === 2) {                 // two fingers: pinch to zoom a little, toward the pinch point
      p.x = e.clientX; p.y = e.clientY;
      const a = [...pointers.values()];
      const dist = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
      if (pinch > 0) {
        const [minR, maxR] = zoomRange();
        goal.r = clamp(goal.r - (dist - pinch) * PINCH_SENS, minR, maxR);
        pullTargetToward((a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2);
      }
      pinch = dist;
      touched();
      return;
    }
    // one finger / mouse drag: orbit the look direction — full 360° rotation, tilt clamped
    const dx = e.clientX - p.x, dy = e.clientY - p.y;
    p.x = e.clientX; p.y = e.clientY;
    velTheta = -dx * ROT_X; velE = -dy * ROT_Y;     // remembered in case the drag ends here (inertia)
    cam.theta += velTheta; goal.theta = cam.theta;
    cam.e = clamp(cam.e + velE, ELEV_MIN, ELEV_MAX); goal.e = cam.e;
    touched();
  });
  const endPointer = (e) => { pointers.delete(e.pointerId); pinch = 0; };
  stage.addEventListener('pointerup', (e) => {
    const wasClick = downAt && pointers.size === 1 && Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y) < 6;
    const wasRotateDrag = downAt && !wasClick;  // single-finger/mouse drag that actually moved (not a pinch release)
    endPointer(e);
    if (wasRotateDrag) {                        // a drag just ended — let it coast to a stop
      inertia.theta = velTheta; inertia.e = velE;
    } else if (wasClick && e.pointerType !== 'mouse') {     // touch: a tap — check whether it's the second of a double-tap
      const now = performance.now();
      const isDouble = now - lastTap.time < 320 && Math.hypot(e.clientX - lastTap.x, e.clientY - lastTap.y) < 30;
      lastTap = { time: now, x: e.clientX, y: e.clientY };
      if (isDouble) { resetView(); downAt = null; return; }
    }
    if (wasClick) { const hit = pick(e); if (hit) select(hit.id); else if (sel) select(null); }
    downAt = null;
  });
  stage.addEventListener('pointercancel', (e) => { endPointer(e); downAt = null; });
  stage.addEventListener('pointerleave', () => { hover = null; tooltip.style.opacity = 0; });
  stage.addEventListener('dblclick', (e) => { e.preventDefault(); resetView(); });   // mouse: double-click to reset
  stage.addEventListener('wheel', (e) => {     // mouse wheel / trackpad: small clamped zoom, toward the cursor
    e.preventDefault();
    const [minR, maxR] = zoomRange();
    goal.r = clamp(goal.r + e.deltaY * WHEEL_SENS, minR, maxR);
    pullTargetToward(e.clientX, e.clientY);
    touched();
  }, { passive: false });

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
    if (!reduce && (Math.abs(inertia.theta) > INERTIA_STOP || Math.abs(inertia.e) > INERTIA_STOP)) {
      cam.theta += inertia.theta; goal.theta = cam.theta;
      cam.e = clamp(cam.e + inertia.e, ELEV_MIN, ELEV_MAX); goal.e = cam.e;
      inertia.theta *= INERTIA_DECAY; inertia.e *= INERTIA_DECAY;
    } else { inertia.theta = 0; inertia.e = 0; }
    const k = 1 - Math.exp(-dt * (reduce ? 20 : 3.2));
    for (const key of ['theta', 'e', 'r', 'tx', 'ty', 'tz']) cam[key] += (goal[key] - cam[key]) * k;

    const idle = 0;   // no automatic sway — rotation is drag/pinch-driven only
    const th = cam.theta + Math.sin(time * 0.22) * 0.16 * idle, dist = cam.r * fit;
    camera.position.set(cam.tx + dist * Math.sin(th) * Math.cos(cam.e), cam.ty + dist * Math.sin(cam.e), cam.tz + dist * Math.cos(th) * Math.cos(cam.e));
    camera.lookAt(cam.tx, cam.ty, cam.tz); camera.updateMatrixWorld();
    compassRing.style.transform = `rotate(${(-cam.theta * 180 / Math.PI).toFixed(1)}deg)`;

    world.update(dt, time, camera);
    // for (const p of places) {
    //   const m = p.hit.material;
    //   m.opacity = 0;
    // }
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
    for (const p of nameLabels) {
      v3.copy(p.anchor).project(camera);
      const vis = v3.z < 1 && Math.abs(v3.x) < 1.15 && Math.abs(v3.y) < 1.15;
      p.el.style.display = vis ? '' : 'none';
      if (!vis) continue;
      const x = (v3.x * 0.5 + 0.5) * w, y = (-v3.y * 0.5 + 0.5) * h;
      const s = Math.max(0.7, Math.min(1.1, 44 / camera.position.distanceTo(p.anchor)));
      p.el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${s.toFixed(3)})`;
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