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

// Buildings.  Only entries with an `id` are clickable places (pin + button + info panel).
//   f      = number of floors
//   flat   = flat roof (otherwise a pitched roof)
//   vrPage = file inside VR_DIR opened by "Enter VR"; use null while a page is not ready
export const BUILDINGS = [
  {
    id: 'engineering',
    name: 'Faculty of Engineering (NUOL)',
    short: 'Faculty of Eng.',
    icon: 'book',

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
    id:'unknownown',
    name: 'Unidentified building',
    short: '...',
    icon: 'book',

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
    id:'unknown',
    name: 'Unidentified building',
    short: '...',
    icon: 'book',

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
    name: 'JICA ITSD',
    short: 'JICA ITSD',
    icon: 'desk',

    description: 'JICA ITSD building on campus.',
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
    id: 'department',
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

    description: 'Faculty Building — position/model not yet confirmed, shown as a placeholder block.',
    vrPage: 'KanaBorDee.html',
    placeholder: true,

    model: 'Facuty_building.glb',

    modelScale: 0.30,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    x: -450, y: -135, w: 60, h: 30, f: 1, flat: true,
    roof: 0xbfe3f5, wall: 0xbfe3f5
  },
  
  { 
    // no id on purpose: name-only label, not clickable
    name: 'Chemical',

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
    // no id on purpose: name-only label, not clickable
    name: 'Logistics',

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
    // no id on purpose: name-only label, not clickable
    name: 'Road building',

    model: 'Road_building.glb',

    modelScale: 0.22,
    modelRotation:Math.PI / -2,
    modelYOffset: 0,

    description: 'Road building.',
    vrPage: null,

    x: -130, y: 0, w: 60, h: 30, f: 1,
    roof: '#b95a3a'
  },

  

  { 
    name: 'Department of Electrical Engineering',

    description: 'Department of Electrical Engineering.',
    vrPage: null,

    modelScale: 0.21,
    modelRotation: 0,
    modelYOffset: 0,

    model: 'ASIVA2_building.glb',

    x: 298, y: 250, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  { 
    // no id on purpose: name-only label, not clickable
    name: 'Electrical Engineering (Annex)',

    description: 'Department of Electrical Engineering.',
    vrPage: null,

    modelScale: 0.12,
    modelRotation: 0,
    modelYOffset: 0,

    model: 'ASIVA1_UD.glb',

    x: 298, y: 430, w: 78, h: 38, f: 2, flat: true,

    roof: 0xa9aeb4,
    wall: 0xdcd9d0
  },

  { 
    id: 'mech-lab',
    name: 'Mechanical Engineering LAB',
    short: 'Mech Lab',
    icon: 'cap',

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
    // no id on purpose: name-only label, not clickable
    name: 'Sathabun Phutthana',

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
    // no id on purpose: name-only label, not clickable
    name: 'K-Lab',

    description: 'Identity not fully confirmed — named after its model file.',
    vrPage: null,

    modelScale: 1.5,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'Untitled.glb',

    x: -400, y: 100, w: 150, h: 38, f: 2, flat: true,

  },

  { 
    // no id on purpose: name-only label, not clickable
    name: '?',

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
    // no id on purpose: name-only label, not clickable
    name: '?',

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
    // no id on purpose: name-only label, not clickable
    name: '?',

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
    // no id on purpose: name-only label, not clickable
    name: '?',

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


  //Roed in side of the campus
  {
    modelScale: 0.12,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 380, y: 470, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.12,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 380, y: 580, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.12,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 380, y: 340, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.12,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 380, y: 218, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 320, y: 160, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 290, y: 110, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 3,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 260, y: 110, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2.1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 225, y: 215, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2.1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 220, y: 270, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.08,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 240, y: 60, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.08,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 190, y: 60, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 310, y: 335, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1.01,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 200, y: 333, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 115, y: 332, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 290, y: 0, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 290, y: -100, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 290, y: -170, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / -1.02,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 240, y: -190, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1.1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 240, y: -230, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1.01,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 130, y: -250, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 50, y: -250, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / -1.03,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 130, y: -181, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.07,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 130, y: -210, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / -1.01,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 23, y: -174, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.08,
    modelRotation: Math.PI / 2.08,
    modelYOffset: 0,

    model: 'block1.glb',

    x: -20, y: -210, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -260, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -305, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -360, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -420, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -460, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -425, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -490, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -530, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',
    x: 335, y: -590, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 335, y: -640, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 300, y: -520, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 240, y: -520, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 185, y: -520, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 130, y: -520, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 60, y: -520, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.05,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 0, y: -520, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: -15, y: -460, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: -15, y: -390, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 2,
    modelYOffset: 0,

    model: 'block1.glb',

    x: -15, y: -295, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.04,
    modelRotation: Math.PI / -1.5,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 240, y: -160, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 350, y: -215, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 460, y: -215, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 570, y: -215, w: 78, h: 38, f: 0, flat: true
  },

  {
    modelScale: 0.1,
    modelRotation: Math.PI / 1,
    modelYOffset: 0,

    model: 'block1.glb',

    x: 610, y: -215, w: 78, h: 38, f: 0, flat: true
  },
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