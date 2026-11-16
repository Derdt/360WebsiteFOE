// ---------------------------------------------------------------------------
//  Language switcher data + helpers.  Goes next to config.js  ->  js/i18n.js
//
//  * To change a word, edit it in STR below.
//  * To add a language: add it to LANGS, then add a block with the same keys to STR
//    (a missing key falls back to English, so a half-finished language still works).
//  * Building names: edit them in PLACES (keyed by the building `id` from config.js, or by its
//    English name when it has no id). A building that is not listed keeps its English name.
// ---------------------------------------------------------------------------
const LS_KEY = 'campus-lang';

export const LANGS = [
  { id: 'en', label: 'English', short: 'EN' },
  { id: 'th', label: 'ไทย', short: 'TH' },
  { id: 'lo', label: 'ລາວ', short: 'LO' }
];

const STR = {
  en: {
    title: 'Campus — Faculty of Engineering, NUOL',
    hint: 'Drag to look around, scroll or pinch to zoom, tap a pin',
    overview: 'Overview',
    viewModel: 'View model', backOverview: 'Back to overview',
    panorama: 'Panorama', panoSoon: 'Panorama (coming soon)',
    menu: 'Menu', ground: 'Ground', language: 'Language',
    night: '🌙 Night', day: '☀️ Day', fireworks: '🎆 Fireworks',
    myLocation: '📍 My location', stop: '📍 Stop',
    you: 'You', askName: 'Your name on the map?',
    finding: 'Finding your position…',
    outside: 'You are outside the campus map ({d} from it).',
    err1: 'Location permission was denied. Allow it in the browser settings to use this.',
    err2: 'Your position is not available right now.',
    err3: 'Getting your position took too long. Try again outdoors.',
    errX: 'Could not get your position.',
    noGeo: 'This browser cannot read your location.',
    needHttps: 'Location only works on a secure (https) page.',
    'theme.grass': 'Green grass', 'theme.spring': 'Spring', 'theme.summer': 'Summer (dry)',
    'theme.autumn': 'Autumn', 'theme.winter': 'Winter (snow)', 'theme.desert': 'Desert',
    'wx.spring': '🌸 Petals', 'wx.autumn': '🍂 Leaves', 'wx.winter': '❄️ Snow', 'wx.desert': '🌬️ Dust'
  },
  th: {
    title: 'แผนที่คณะ — คณะวิศวกรรมศาสตร์ NUOL',
    hint: 'ลากเพื่อมองรอบ เลื่อนเมาส์หรือบีบนิ้วเพื่อซูม แตะที่หมุด',
    overview: 'ภาพรวม',
    viewModel: 'ดูโมเดล', backOverview: 'กลับไปภาพรวม',
    panorama: 'พาโนรามา', panoSoon: 'พาโนรามา (เร็วๆ นี้)',
    menu: 'เมนู', ground: 'พื้น', language: 'ภาษา',
    night: '🌙 กลางคืน', day: '☀️ กลางวัน', fireworks: '🎆 พลุ',
    myLocation: '📍 ตำแหน่งของฉัน', stop: '📍 หยุด',
    you: 'คุณ', askName: 'ชื่อของคุณบนแผนที่?',
    finding: 'กำลังหาตำแหน่งของคุณ…',
    outside: 'คุณอยู่นอกแผนที่คณะ (ห่าง {d})',
    err1: 'ไม่ได้รับอนุญาตให้ใช้ตำแหน่ง กรุณาเปิดสิทธิ์ในการตั้งค่าเบราว์เซอร์',
    err2: 'ตอนนี้ยังหาตำแหน่งของคุณไม่ได้',
    err3: 'หาตำแหน่งนานเกินไป ลองใหม่อีกครั้งในที่โล่ง',
    errX: 'ไม่สามารถหาตำแหน่งของคุณได้',
    noGeo: 'เบราว์เซอร์นี้อ่านตำแหน่งไม่ได้',
    needHttps: 'ตำแหน่งใช้ได้เฉพาะบนหน้าเว็บ https เท่านั้น',
    'theme.grass': 'หญ้าสีเขียว', 'theme.spring': 'ฤดูใบไม้ผลิ', 'theme.summer': 'ฤดูร้อน (แห้ง)',
    'theme.autumn': 'ฤดูใบไม้ร่วง', 'theme.winter': 'ฤดูหนาว (หิมะ)', 'theme.desert': 'ทะเลทราย',
    'wx.spring': '🌸 กลีบดอกไม้', 'wx.autumn': '🍂 ใบไม้', 'wx.winter': '❄️ หิมะ', 'wx.desert': '🌬️ ฝุ่น'
  },
  lo: {
    title: 'ແຜນທີ່ຄະນະ — ຄະນະວິສະວະກຳສາດ NUOL',
    hint: 'ລາກເພື່ອເບິ່ງອ້ອມ, ໝູນລໍ້ ຫຼື ຖ່າງນິ້ວເພື່ອຊູມ, ແຕະທີ່ໝຸດ',
    overview: 'ພາບລວມ',
    viewModel: 'ເບິ່ງໂມເດວ', backOverview: 'ກັບຄືນພາບລວມ',
    panorama: 'ພາໂນຣາມາ', panoSoon: 'ພາໂນຣາມາ (ໄວໆນີ້)',
    menu: 'ເມນູ', ground: 'ພື້ນ', language: 'ພາສາ',
    night: '🌙 ກາງຄືນ', day: '☀️ ກາງເວັນ', fireworks: '🎆 ດອກໄມ້ໄຟ',
    myLocation: '📍 ຕຳແໜ່ງຂອງຂ້ອຍ', stop: '📍 ຢຸດ',
    you: 'ທ່ານ', askName: 'ຊື່ຂອງທ່ານໃນແຜນທີ່?',
    finding: 'ກຳລັງຊອກຫາຕຳແໜ່ງຂອງທ່ານ…',
    outside: 'ທ່ານຢູ່ນອກແຜນທີ່ຄະນະ (ຫ່າງ {d})',
    err1: 'ບໍ່ອະນຸຍາດໃຫ້ໃຊ້ຕຳແໜ່ງ ກະລຸນາເປີດສິດໃນການຕັ້ງຄ່າຂອງບຣາວເຊີ',
    err2: 'ຕອນນີ້ຍັງບໍ່ສາມາດຫາຕຳແໜ່ງຂອງທ່ານໄດ້',
    err3: 'ຫາຕຳແໜ່ງດົນເກີນໄປ ລອງໃໝ່ອີກຄັ້ງໃນບ່ອນໂລ່ງ',
    errX: 'ບໍ່ສາມາດຫາຕຳແໜ່ງຂອງທ່ານໄດ້',
    noGeo: 'ບຣາວເຊີນີ້ບໍ່ສາມາດອ່ານຕຳແໜ່ງໄດ້',
    needHttps: 'ຕຳແໜ່ງໃຊ້ໄດ້ສະເພາະໜ້າເວັບ https ເທົ່ານັ້ນ',
    'theme.grass': 'ຫຍ້າສີຂຽວ', 'theme.spring': 'ລະດູໃບໄມ້ປົ່ງ', 'theme.summer': 'ລະດູຮ້ອນ (ແຫ້ງ)',
    'theme.autumn': 'ລະດູໃບໄມ້ຫຼົ່ນ', 'theme.winter': 'ລະດູໜາວ (ຫິມະ)', 'theme.desert': 'ທະເລຊາຍ',
    'wx.spring': '🌸 ກີບດອກໄມ້', 'wx.autumn': '🍂 ໃບໄມ້', 'wx.winter': '❄️ ຫິມະ', 'wx.desert': '🌬️ ຝຸ່ນ'
  }
};

// Building names:  key = building id (or English name) -> { en, th: [name, short], lo: [name, short] }
const PLACES = {
  dean: { en: 'Electronic', th: ['อิเล็กทรอนิกส์', 'EN'], lo: ['ເອເລັກໂຕຣນິກ', 'EN'] },
  'telecom-annex': { en: 'Electronic and Telecommunications', th: ['อิเล็กทรอนิกส์และโทรคมนาคม', 'EN ต่อเติม'], lo: ['ເອເລັກໂຕຣນິກ ແລະ ໂທລະຄົມມະນາຄົມ', 'EN ຕໍ່ເຕີມ'] },
  samosone: { en: 'Academie building', th: ['อาคารอะคาเดมี', 'อะคาเดมี'], lo: ['ຕຶກອາກາເດມີ', 'ອາກາເດມີ'] },
  jica: { en: 'CEIT', th: ['CEIT', 'CEIT'], lo: ['CEIT', 'CEIT'] },
  dorm: { en: 'Dormitory building', th: ['อาคารหอพัก', 'หอพัก'], lo: ['ຕຶກຫໍພັກ', 'ຫໍພັກ'] },
  Parking: { en: 'Parking road', th: ['ถนนจอดรถ', 'ที่จอดรถ'], lo: ['ທາງຈອດລົດ', 'ບ່ອນຈອດລົດ'] },
  Football: { en: 'Field of football', th: ['สนามฟุตบอล', 'ฟุตบอล'], lo: ['ສະໜາມບານເຕະ', 'ບານເຕະ'] },
  Basketball: { en: 'Field of basketball', th: ['สนามบาสเกตบอล', 'บาสเกตบอล'], lo: ['ສະໜາມບານສົ້ມ', 'ບານສົ້ມ'] },
  library: { en: 'Electronics Library', th: ['หอสมุดอิเล็กทรอนิกส์', 'หอสมุด'], lo: ['ຫໍສະໝຸດເອເລັກໂຕຣນິກ', 'ຫໍສະໝຸດ'] },
  Center_engineering: { en: 'Center for Engineering', th: ['ศูนย์วิศวกรรม', 'ศูนย์วิศวะ'], lo: ['ສູນວິສະວະກຳ', 'ສູນວິສະວະກຳ'] },
  Faculty_building: { en: 'Faculty Building', th: ['อาคารคณะ', 'อาคารคณะ'], lo: ['ຕຶກຄະນະ', 'ຕຶກຄະນະ'] },
  'mech-lab': { en: 'Mechanical Engineering LAB', th: ['ห้องปฏิบัติการวิศวกรรมเครื่องกล', 'แล็บเครื่องกล'], lo: ['ຫ້ອງທົດລອງວິສະວະກຳຈັກກົນ', 'ແລັບຈັກກົນ'] },
  monument: { en: 'Monument', th: ['อนุสาวรีย์', 'อนุสาวรีย์'], lo: ['ອະນຸສາວະລີ', 'ອະນຸສາວະລີ'] }
};
const BY_EN = {};
Object.values(PLACES).forEach((v) => { BY_EN[v.en] = v; });

/* ---------- state ---------- */
const ids = LANGS.map((l) => l.id);
function initial() {
  try { const s = localStorage.getItem(LS_KEY); if (s && ids.includes(s)) return s; } catch (e) { /* ignore */ }
  const nav = ((typeof navigator !== 'undefined' && (navigator.language || '')) || '').toLowerCase().slice(0, 2);
  return ids.includes(nav) ? nav : 'en';
}
let lang = initial();
const listeners = [];
const apply = () => { try { document.documentElement.lang = lang; document.title = t('title'); } catch (e) { /* ignore */ } };

export const getLang = () => lang;
export function setLang(id) {
  if (!ids.includes(id) || id === lang) return;
  lang = id;
  try { localStorage.setItem(LS_KEY, id); } catch (e) { /* ignore */ }
  apply();
  listeners.forEach((f) => f(lang));
}
export const onLang = (f) => { listeners.push(f); };

// t('key', { d: '5 m' }); missing key -> English -> the optional fallback -> the key itself
export function t(key, vars, fallback) {
  let s = STR[lang] && STR[lang][key];
  if (s === undefined) s = STR.en[key];
  if (s === undefined) s = fallback !== undefined ? fallback : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}
// A building's name in the current language.  p = anything with id / name / short
export function placeText(p, field) {
  const own = p[field] !== undefined ? p[field] : p.name;
  if (lang === 'en') return own;
  const e = PLACES[p.id] || BY_EN[p.name];
  const v = e && e[lang];
  return v ? (field === 'short' ? v[1] : v[0]) : own;
}
apply();