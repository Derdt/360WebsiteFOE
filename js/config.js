// ---------------------------------------------------------------------------
//  Campus configuration — everything you are likely to edit lives in this file.
// ---------------------------------------------------------------------------

// Folder (relative to campus.html) that holds your VR pages:
// engineering.html, monument.html, ...  Change it if your folder has another name.
export const VR_DIR = 'pages/';

// The layout was traced from the Google Maps screenshot (676 x 500 px).
// A building is described in screenshot pixels: x, y = top-left corner, w, h = size.
export const MAP_SCALE = 20;                 // screenshot pixels per 3D unit
export const MAP_CENTER = { x: 290, y: 200 }; // screenshot pixel that becomes the 3D origin

export const CAMPUS = { x0: -24, x1: 16, z0: -14, z1: 17.5 };       // flat campus ground (3D units)
export const ROAD_RIGHT = { from: [780, -300], to: [780, 900], width: 2.6 }; // main road on the right (angled, as in the aerial photo)
export const ROAD_BOTTOM = {y: 690, width: 1.8 };                  // road along the bottom
export const LAKE = { x: -21, z: 25, rx: 12, rz: 9, waterY: -0.85 };

// Effects shown when the page opens (visitors can still switch them with the buttons on screen).
//   night / fireworks / weather : true = on, false = off   (weather = what falls with the ground theme: snow, petals, leaves, dust)
//   theme    : ground when the page opens: 'grass' | 'spring' | 'summer' | 'autumn' | 'winter' | 'desert'
//              (visitors change it with the hamburger button; add your own themes at the top of world.js)
//   ui       : show the on-screen buttons
//   uiCorner : 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
//   remember : keep the visitor's last choice in the browser (set false to always start from these values)
export const EFFECTS = { night: true, fireworks: true, weather: false, theme: 'winter', ui: true, uiCorner: 'bottom-left', remember: true };

// Real-world GPS -> position on this map  (the "My location" button, bottom-right of the page).
//   refs : known real points. Each is a GPS position plus the spot on the map where it is:
//            model: 'File.glb'  = the centre of that building's model (first match in BUILDINGS)
//            or give map pixels directly:  x: 123, y: 456
//          1 ref   -> the position is exact at that point; the size and direction come from the two estimates below
//          2+ refs -> size and direction are worked out from the points themselves (more points = more accurate)
//   Get a point's GPS in Google Maps: press and hold on the spot, then copy the two numbers shown.
//   Try it without walking: open  campus.html?gpstest  and click on the map to place yourself.
export const GPS = {
  enabled: true,
  refs: [
    { lat: 17.939896024230634, lng: 102.62491889372168, model: 'Road_Building.glb' },
    // { lat: 0, lng: 0, model: 'EN.glb' },          // <- add a 2nd point here to make positions accurate
  ],
  metersPerPixel: 0.5,   // only used while there is ONE ref: real metres per map pixel (an estimate!)
  rotationDeg: 0,        // only used while there is ONE ref: 0 = north is up on the map
  defaultName: 'You'     // name on the marker (visitors are asked for their own name)
};

// ---------------------------------------------------------------------------
// Inner campus road pieces (block1.glb).  One row per piece: [x, y, scale, rot]
//   x, y  = screenshot pixels,  scale = modelScale,  rot = Math.PI / rot
// ---------------------------------------------------------------------------
const ROAD_PIECES = [
  [380, 470, 0.12, 2],
  [380, 580, 0.12, 2],
  [380, 340, 0.12, 2],
  [380, 218, 0.12, 2],
  [320, 160, 0.1, 1],
  [290, 110, 0.1, 2],
  [260, 110, 0.1, 3],
  [225, 215, 0.1, 2.1],
  [220, 270, 0.1, 2.1],
  [240, 60, 0.08, 1],
  [190, 60, 0.08, 1],
  [310, 335, 0.1, 1],
  [200, 333, 0.1, 1.01],
  [115, 332, 0.1, 1],
  [290, 0, 0.1, 2],
  [290, -100, 0.1, 2],
  [290, -170, 0.1, 2],
  [240, -190, 0.1, -1.02],
  [240, -230, 0.1, 1.1],
  [130, -250, 0.1, 1.01],
  [50, -250, 0.1, 1],
  [130, -181, 0.1, -1.03],
  [130, -210, 0.07, 2],
  [23, -174, 0.1, -1.01],
  [-20, -225, 0.08, 2.09],
  [335, -260, 0.05, 2],
  [335, -305, 0.05, 2],
  [335, -360, 0.05, 2],
  [335, -420, 0.05, 2],
  [335, -460, 0.05, 2],
  [335, -425, 0.05, 2],
  [335, -490, 0.05, 2],
  [335, -530, 0.05, 2],
  [335, -590, 0.05, 2],
  [335, -640, 0.05, 2],
  [300, -560, 0.05, 1],
  [240, -560, 0.05, 1],
  [185, -560, 0.05, 1],
  [130, -560, 0.05, 1],
  [80, -560, 0.05, 1],
  [20, -560, 0.05, 1],
  [-15, -500, 0.1, 2],
  [-15, -390, 0.1, 2],
  [-15, -295, 0.1, 2],
  [240, -160, 0.04, -1.5],
  [350, -215, 0.1, 1],
  [460, -215, 0.1, 1],
  [570, -215, 0.1, 1],
  [610, -215, 0.1, 1],
  [-50, -260, 0.1, 1.04],
  [-150, -268, 0.1, 1.01],
  [-190, -270, 0.1, 1.01],
  [-250, -285, 0.05, 1.11],
  [-300, -301, 0.05, 1.11],
  [-350, -317, 0.05, 1.11],
  [-400, -333, 0.05, 1.11],
  [-450, -349, 0.05, 1.11],
  [-500, -365, 0.05, 1.11],
  [-550, -381, 0.05, 1.11],
  [-600, -397, 0.05, 1.11],
  [-450, -320, 0.05, 2],
  [-260, -230, 0.1, 2],
  [-260, -120, 0.1, 2],
  [-300, -230, 0.05, 1],
  [-260, -10, 0.1, 2],
  [-260, 100, 0.1, 2],
  [-260, 210, 0.1, 2],
  [-260, 320, 0.1, 2],
  [-260, 430, 0.1, 2],
  [-260, 540, 0.1, 2],
  [-260, 590, 0.1, 2],
];

const road = (x, y, s, r) => ({
  model: 'block1.glb',
  modelScale: s,
  modelRotation: Math.PI / r,
  modelYOffset: 0,
  x, y, w: 78, h: 38, f: 0, flat: true
});

// Buildings.  Only entries with an `id` are clickable places (pin + button + info panel).
//   f      = number of floors
//   flat   = flat roof (otherwise a pitched roof)
//   vrPage = file inside VR_DIR opened by "Enter VR"; use null while a page is not ready
//   pinHeight = height of THIS building's pin icon above its roof (3D units, one floor is about 0.6):
//               0 = default,  3 = higher,  -0.5 = lower.  Only buildings with an `id` have a pin.
export const BUILDINGS = [
  {

    description: 'Faculty of Engineering, National University of Laos.',
    vrPage: 'engineering.html',

    model: 'Agriculture_building.glb',

    // ปรับโมเดลได้จากตรงนี้
    modelScale: 0.2,
    modelRotation: Math.PI / -2,
    modelYOffset: 0,

    // ตำแหน่งบนแผนที่เดิม
    x: 345,
    y: 120,
    w: 54,
    h: 40,

    f: 3,
    roof: '#c23a2b',
    wall: 0xf8edd2
  },

  { 
    id: 'dean', 
    name: "Electronic", 
    short: "EN",
    icon: 'cap',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'Dept of Electronic and Telecommunications (EN) building.',
    vrPage: 'EN_Building.html',

    model: 'EN.glb',

    // ปรับโมเดลได้จากตรงนี้
    modelScale: 0.15,
    modelRotation: Math.PI / -1,
    modelYOffset: 0,

    x: 480, 
    y: 370, 
    w: 80, 
    h: 42,

    f: 2, 
    roof: '#b83a2e'
  },

  { 
    id: 'telecom-annex', 
    name: "Electronic and Telecommunications", 
    short: "EN Annex",
    icon: 'cap',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'Dept of Electronic and Telecommunications (EN) building.',
    vrPage: null,

    model: 'Electronic.glb',

    // ปรับโมเดลได้จากตรงนี้
    modelScale: 0.15,
    modelRotation: Math.PI / -1,
    modelYOffset: 0,

    x: 480, 
    y: 500, 
    w: 80, 
    h: 42,

    f: 2, 
    roof: '#b83a2e'
  },
  
  {

    description: 'Not yet matched to a real building — shown as a placeholder block until confirmed.',
    vrPage: null,
    placeholder: true,

    model: 'R7.glb',

    modelScale: 0.20,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    x: 90, y: -620, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },

  {

    description: 'Not yet matched to a real building — shown as a placeholder block until confirmed.',
    vrPage: null,
    placeholder: true,

    model: 'R1andR2_buiding.glb',

    modelScale: 0.15,
    modelRotation: 0,
    modelYOffset: 0,

    x: 450, y: -680, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },
  
  { 
    id:'samosone',
    name: 'Academie building',
    short: 'Academie',
    icon: 'star',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'Academie building — position/model not yet confirmed, shown as a placeholder block.',
    vrPage: null,
    placeholder: true,

    model: 'SAMOSONE_Building.glb',

    modelScale: 0.20,
    modelRotation: 0,
    modelYOffset: 0,

    x: 270, y: -700, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },

  {
    id: 'jica',
    name: 'CEIT',
    short: 'CEIT',
    icon: 'desk',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'CEIT building on campus.',
    vrPage: 'CEIT_Building.html',

    model: 'CEIT_BUILDING.glb',

    modelScale: 0.15,
    modelRotation: 0,
    modelYOffset: 0,

    x: 490, y: 260, w: 76, h: 34, f: 2, flat: true,
    roof: 0x8d939a,
    wall: 0xd8d5cd
  },

  { 
    name: 'Dormitory building',
    short: 'Dormitory',
    icon: 'home',

    description: 'Dormitory building.',
    vrPage: null,
    
    model: 'Dormitory_1.glb',
    
    modelScale: 0.18,
    modelRotation: Math.PI / -1,
    modelYOffset: 0,

    x: 560, y: 175, w: 84, h: 56, f: 2,
    roof: '#b73c2d'
  },

  { 
    id:'Parking',
    name: 'Parking road',
    short: 'Parking',
    icon: 'book',
    pinHeight: 0,        // pin icon height: + higher, - lower

    model: 'Parking.glb',

    modelScale: 0.13,
    modelRotation: Math.PI / -2,
    modelYOffset: 0,

    description: 'All Sports buildings.',
    vrPage: null,

    x: 560, y: 105, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  { 
    id:'Football',
    name: 'Field of football',
    short: 'Football',
    icon: 'book',
    pinHeight: 0,        // pin icon height: + higher, - lower

    model: 'Football.glb',

    modelScale: 0.22,
    modelRotation: Math.PI / -2,
    modelYOffset: 0,

    description: 'All Sports buildings.',
    vrPage: null,

    x: 500, y: -60, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  { 
    id:'Basketball',
    name: 'Field of basketball',
    short: 'Basketball',
    icon: 'book',
    pinHeight: 0,        // pin icon height: + higher, - lower

    model: 'Basketball.glb',

    modelScale: 0.20,
    modelRotation: Math.PI / -2,
    modelYOffset: -0.2,

    description: 'All Sports buildings.',
    vrPage: null,

    x: 200, y: 0, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  { 
    id:'library',
    name: 'Electronics Library',
    short: 'Library',
    icon: 'book',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'Electronics Library building — position/model not yet confirmed, shown as a placeholder block.',
    vrPage: 'Centrual_Library.html',
    placeholder: true,

    model: 'library_faifa_building.glb',

    modelScale: 0.20,
    modelRotation: Math.PI / -2,
    modelYOffset: 0,

    x: 190, y: -400, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },

  { 
    id:'Center_engineering',
    name: 'Center for Engineering',
    short: 'Engineering',
    icon: 'book',
    pinHeight: -4.5,        // pin icon height: + higher, - lower

    description: 'Center for Engineering building — position/model not yet confirmed, shown as a placeholder block.',
    vrPage: 'TheCircleOne.html',
    placeholder: true,

    model: 'Center_engineering.glb',

    modelScale: 0.02,
    modelRotation: Math.PI / 8,
    modelYOffset: 0,

    x: -150, y: -135, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },

  { 
    id:'Faculty_building',
    name: 'Faculty Building',
    short: 'Faculty',
    icon: 'book',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'Faculty Building — position/model not yet confirmed, shown as a placeholder block.',
    vrPage: 'KanaBorDee.html',
    placeholder: true,

    model: 'Facuty_building.glb',

    modelScale: 0.30,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    x: -450, y: -110, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },
  
  { 

    model: 'Chemical_update.glb',

    modelScale: 0.15,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    description: 'Chemical building.',
    vrPage: null,

    x: 0, y: 120, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  {

    model: 'logistics.glb',

    modelScale: 0.18,
    modelRotation: 0,
    modelYOffset: 0,

    description: 'Logistics building.',
    vrPage: null,

    x: -120, y: 320, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  

  { 

    model: 'Road_Building.glb',

    modelScale: 0.22,
    modelRotation:Math.PI / -2,
    modelYOffset: 0,

    description: 'Road building.',
    vrPage: null,

    x: -130, y: 50, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  

  {

    modelScale: 0.21,
    modelRotation: 0,
    modelYOffset: 0,

    model: 'ASIVA2_building.glb',

    x: 298, y: 250, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  {

    modelScale: 0.12,
    modelRotation: 0,
    modelYOffset: 0,

    model: 'Asiva1_UD.glb',

    x: 298, y: 430, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  { 
    id: 'mech-lab',
    name: 'Mechanical Engineering LAB',
    short: 'Mech Lab',
    icon: 'cap',
    pinHeight: 0,        // pin icon height: + higher, - lower

    description: 'Mechanical Engineering laboratory building.',
    vrPage: null,

    modelScale: 0.25,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'Laboratory_Blocks.glb',

    x: 560, y: -350, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  {

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 0.21,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Sathabun_phutthana_asiva.glb',

    x: 130, y: 200, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  { 

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 1.5,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Untitled.glb',

    x: -400, y: 100, w: 150, h: 38, f: 2, flat: true,

  },

  {

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 1.5,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Untitled.glb',

    x: -560, y: 135, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  {

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 1.5,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Untitled.glb',

    x: 100, y: 460, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  { 

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 1.5,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Untitled.glb',

    x: -460, y: 300, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  {

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 3,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Untitled.glb',

    x: -400, y: -450, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },


  // ---- Inner campus roads --------------------------------------------------
  // One road piece = one short row:  [x, y, scale, rot]
  //   x, y  = screenshot pixels (same as buildings)
  //   scale = size of the road model (modelScale)
  //   rot   = angle divisor: the piece is turned by Math.PI / rot
  //           (1 = 180deg, 2 = 90deg, -2 = -90deg, 3 = 60deg ...)
  // To add a road just add one row to ROAD_PIECES at the top of this file.
  ...ROAD_PIECES.map(([x, y, s, r]) => road(x, y, s, r)),

  // Decorative buildings (no id = not clickable)
  // { x: 156, y: 205, w: 38, h: 34, f: 2, flat: true, roof: 0xd9d4c8, wall: 0xf4f1ea },
  // { x: 98,  y: 154, w: 58, h: 32, f: 2, roof: '#c8442f' },
  // { x: 22,  y: 252, w: 62, h: 95, f: 2, roof: '#b53a2c' },
  // { x: 108, y: 332, w: 46, h: 64, f: 1, roof: '#c0402f' },
  // { x: 230, y: 228, w: 66, h: 32, f: 2, roof: '#c2412e' },
  // { x: 342, y: 222, w: 62, h: 44, f: 2, roof: '#c0402f' },
  // { x: 420, y: 214, w: 78, h: 76, f: 3, roof: '#d4562b' },
  // { x: 346, y: 292, w: 48, h: 44, f: 2, roof: '#e0703a' },
  // { x: 456, y: 304, w: 42, h: 78, f: 2, roof: '#c2412e' },
  // { x: 346, y: 352, w: 40, h: 56, f: 1, roof: '#b83a2e' },
  // { x: 500, y: 148, w: 124, h: 54, f: 3, roof: '#3f78a6', wall: 0xe9e4d8 },
  // { x: 520, y: 302, w: 80, h: 60, f: 2, flat: true, roof: 0x8d939a, wall: 0xd8d5cd },
  // { x: 520, y: 392, w: 76, h: 34, f: 1, flat: true, roof: 0x8d939a, wall: 0xd8d5cd },
  // { x: 535, y: 0,   w: 60, h: 24, f: 1, flat: true, roof: 0xa9aeb4, wall: 0xdcd9d0 },
  // { x: 14,  y: 88,  w: 86, h: 30, f: 1, roof: '#a94a3a' },
  // { x: 14,  y: 124, w: 80, h: 26, f: 1, roof: '#c0402f' },
  // { x: 104, y: 2,   w: 40, h: 24, f: 1, flat: true, roof: 0xa9aeb4, wall: 0xdcd9d0 },
  // { x: 208, y: 162, w: 90, h: 32, f: 2, roof: '#a3452f' },
  // { x: 350, y: 186, w: 76, h: 26, f: 2, roof: '#8e3a2a' },
  // { x: 0,   y: 196, w: 80, h: 44, f: 2, roof: '#8a3b2b' },
  // { x: 18,  y: 356, w: 54, h: 40, f: 1, roof: '#b83a2e' },
  // { x: 28,  y: 408, w: 52, h: 36, f: 1, roof: '#4c7a4a' }
];

// The monument stands on the courtyard circle (position in screenshot pixels).
export const MONUMENT = {
  id: 'monument', name: 'Monument', short: 'Monument', icon: 'star',
  description: 'The campus monument.',
  vrPage: 'monument.html',
  x: 270, y: 110
};