// ---------------------------------------------------------------------------
//  Real-world GPS  <->  position on the campus map (in map pixels, same units as config.js).
//  Pure maths, no three.js.  Uses a "similarity" transform (shift + rotate + one scale), which is
//  right for a flat top-down map:   map = a * (metres east + i * metres north) + b   (complex numbers)
// ---------------------------------------------------------------------------
const R = 6371000, D2R = Math.PI / 180;
const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
const mul = (p, q) => [p[0] * q[0] - p[1] * q[1], p[0] * q[1] + p[1] * q[0]];
const sub = (p, q) => [p[0] - q[0], p[1] - q[1]];
const add = (p, q) => [p[0] + q[0], p[1] + q[1]];
const div = (p, q) => { const d = q[0] * q[0] + q[1] * q[1]; return [(p[0] * q[0] + p[1] * q[1]) / d, (p[1] * q[0] - p[0] * q[1]) / d]; };

export function createGeoMapper(cfg, buildings) {
  // 1) turn every ref into (lat, lng, map x, map y)
  const refs = [];
  for (const r of (cfg.refs || [])) {
    if (!Number.isFinite(r.lat) || !Number.isFinite(r.lng)) continue;
    let x = r.x, y = r.y;
    if (!(Number.isFinite(x) && Number.isFinite(y))) {
      const b = buildings.find((q) => q.model === r.model);
      if (!b) { console.warn('[GPS] no building uses model', r.model); continue; }
      x = b.x + b.w / 2; y = b.y + b.h / 2;                       // centre of that building's model
    }
    refs.push({ lat: r.lat, lng: r.lng, x, y, label: r.model || `${x},${y}` });
  }
  if (!refs.length) throw new Error('GPS.refs has no usable point');

  // 2) local metres around the refs
  const lat0 = mean(refs.map((r) => r.lat)), lng0 = mean(refs.map((r) => r.lng));
  const kN = R * D2R, kE = R * D2R * Math.cos(lat0 * D2R);        // metres per degree (north, east)
  const toZ = (lat, lng) => [(lng - lng0) * kE, (lat - lat0) * kN];
  const zs = refs.map((r) => toZ(r.lat, r.lng)), ws = refs.map((r) => [r.x, -r.y]);   // map y points down -> flip
  const zbar = [mean(zs.map((z) => z[0])), mean(zs.map((z) => z[1]))], wbar = [mean(ws.map((w) => w[0])), mean(ws.map((w) => w[1]))];

  // 3) a = scale + rotation.  Two or more spread-out refs -> least-squares fit; otherwise the config estimate.
  let a, mode = 'estimate', num = [0, 0], den = 0;
  for (let i = 0; i < refs.length; i++) {
    const zc = sub(zs[i], zbar), wc = sub(ws[i], wbar);
    num[0] += zc[0] * wc[0] + zc[1] * wc[1]; num[1] += zc[0] * wc[1] - zc[1] * wc[0]; den += zc[0] * zc[0] + zc[1] * zc[1];
  }
  if (refs.length >= 2 && den > 4) { a = [num[0] / den, num[1] / den]; mode = 'fit'; }
  else {
    const s = 1 / (cfg.metersPerPixel || 0.5), th = (cfg.rotationDeg || 0) * D2R;   // th = bearing of the map's "up", clockwise from north
    a = [s * Math.cos(th), s * Math.sin(th)];
  }
  const b = sub(wbar, mul(a, zbar));

  const toPixel = (lat, lng) => { const w = add(mul(a, toZ(lat, lng)), b); return { x: w[0], y: -w[1] }; };
  const toLatLng = (x, y) => { const z = div(sub([x, -y], b), a); return { lat: lat0 + z[1] / kN, lng: lng0 + z[0] / kE }; };
  const distanceMeters = (lat, lng) => {                           // from the first ref (haversine)
    const p = refs[0], dLat = (lat - p.lat) * D2R, dLng = (lng - p.lng) * D2R;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(p.lat * D2R) * Math.cos(lat * D2R) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  };
  const scale = Math.hypot(a[0], a[1]);                            // map pixels per metre
  const info = {
    mode, metersPerPixel: 1 / scale, rotationDeg: Math.atan2(a[1], a[0]) / D2R,
    refs: refs.map((r) => { const p = toPixel(r.lat, r.lng); return { label: r.label, x: r.x, y: r.y, errorMeters: Math.hypot(p.x - r.x, p.y - r.y) / scale }; })
  };
  return { toPixel, toLatLng, distanceMeters, info };
}