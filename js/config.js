// ---------------------------------------------------------------------------
//  Campus configuration — everything you are likely to edit lives in this file.
// ---------------------------------------------------------------------------

// Folder (relative to campus.html) that holds your VR pages:
// engineering.html, monument.html, ...  Change it if your folder has another name.
export const VR_DIR = 'pages/';

// The layout was traced from the Google Maps screenshot (676 x 500 px).
// A building is described in screenshot pixels: x, y = top-left corner, w, h = size.
export const MAP_SCALE = 20;                 // screenshot pixels per 3D unit
export const MAP_CENTER = { x: 338, y: 250 }; // screenshot pixel that becomes the 3D origin

export const CAMPUS = { x0: -17, x1: 17.5, z0: -13, z1: 12.5 };       // flat campus ground (3D units)
export const ROAD_RIGHT = { from: [650, 0], to: [658, 500], width: 2.6 }; // main road on the right
export const ROAD_BOTTOM = { y: 468, width: 1.8 };                    // road along the bottom
export const LAKE = { x: -21, z: 25, rx: 12, rz: 9, waterY: -0.85 };

// Buildings.  Only entries with an `id` are clickable places (pin + button + info panel).
//   f      = number of floors
//   flat   = flat roof (otherwise a pitched roof)
//   vrPage = file inside VR_DIR opened by "Enter VR"; use null while a page is not ready
export const BUILDINGS = [
  { id: 'engineering', name: 'Faculty of Engineering', short: 'Faculty of Engineering', icon: 'cap', main: true,
    description: 'The Faculty of Engineering was established in 1995, with the name Faculty of Engineering and Architecture (FEA) as one of the 11 faculties of Lao National University according to Prime Minister’s Decree No.',
    vrPage: 'engineering.html',
    x: 98, y: 190, w: 54, h: 40, f: 3, roof: '#c23a2b', wall: 0xf8edd2 },
  { id: 'dean', name: "Dean's office", short: "Dean's office", icon: 'home',
    description: 'Faculty administration and the dean\'s office.',
    vrPage: null,
    x: 118, y: 110, w: 80, h: 42, f: 2, roof: '#b83a2e' },
  { id: 'electrical', name: 'Department of Electrical Engineering', short: 'Electrical Engineering', icon: 'bolt',
    description: 'Department of Electrical Engineering.',
    vrPage: null,
    x: 298, y: 0, w: 78, h: 38, f: 2, flat: true, roof: 0xa9aeb4, wall: 0xdcd9d0 },
  { id: 'jica', name: 'JICA ITSD', short: 'JICA ITSD', icon: 'desk',
    description: 'JICA ITSD building on campus.',
    vrPage: null,
    x: 526, y: 250, w: 76, h: 34, f: 2, flat: true, roof: 0x8d939a, wall: 0xd8d5cd },
  { id: 'department', name: 'Academic department', short: 'Department', icon: 'flask',
    description: 'Academic department building.',
    vrPage: null,                              // set to 'building2.html' when that page is ready
    x: 216, y: 296, w: 84, h: 56, f: 2, roof: '#b73c2d' },
  { id: 'institute', name: 'Vocational education institute', short: 'Institute', icon: 'book',
    description: 'Vocational education institute.',
    vrPage: null,
    x: 440, y: 420, w: 60, h: 30, f: 1, roof: '#b95a3a' },

  // Decorative buildings (no id = not clickable)
  { x: 156, y: 205, w: 38, h: 34, f: 2, flat: true, roof: 0xd9d4c8, wall: 0xf4f1ea },
  { x: 98,  y: 154, w: 58, h: 32, f: 2, roof: '#c8442f' },
  { x: 22,  y: 252, w: 62, h: 95, f: 2, roof: '#b53a2c' },
  { x: 108, y: 332, w: 46, h: 64, f: 1, roof: '#c0402f' },
  { x: 230, y: 228, w: 66, h: 32, f: 2, roof: '#c2412e' },
  { x: 342, y: 222, w: 62, h: 44, f: 2, roof: '#c0402f' },
  { x: 420, y: 214, w: 78, h: 76, f: 3, roof: '#d4562b' },
  { x: 346, y: 292, w: 48, h: 44, f: 2, roof: '#e0703a' },
  { x: 456, y: 304, w: 42, h: 78, f: 2, roof: '#c2412e' },
  { x: 346, y: 352, w: 40, h: 56, f: 1, roof: '#b83a2e' },
  { x: 500, y: 148, w: 124, h: 54, f: 3, roof: '#3f78a6', wall: 0xe9e4d8 },
  { x: 520, y: 302, w: 80, h: 60, f: 2, flat: true, roof: 0x8d939a, wall: 0xd8d5cd },
  { x: 520, y: 392, w: 76, h: 34, f: 1, flat: true, roof: 0x8d939a, wall: 0xd8d5cd },
  { x: 535, y: 0,   w: 60, h: 24, f: 1, flat: true, roof: 0xa9aeb4, wall: 0xdcd9d0 },
  { x: 14,  y: 88,  w: 86, h: 30, f: 1, roof: '#a94a3a' },
  { x: 14,  y: 124, w: 80, h: 26, f: 1, roof: '#c0402f' },
  { x: 104, y: 2,   w: 40, h: 24, f: 1, flat: true, roof: 0xa9aeb4, wall: 0xdcd9d0 },
  { x: 208, y: 162, w: 90, h: 32, f: 2, roof: '#a3452f' },
  { x: 350, y: 186, w: 76, h: 26, f: 2, roof: '#8e3a2a' },
  { x: 0,   y: 196, w: 80, h: 44, f: 2, roof: '#8a3b2b' },
  { x: 18,  y: 356, w: 54, h: 40, f: 1, roof: '#b83a2e' },
  { x: 28,  y: 408, w: 52, h: 36, f: 1, roof: '#4c7a4a' }
];

// The monument stands on the courtyard circle (position in screenshot pixels).
export const MONUMENT = {
  id: 'monument', name: 'Monument', short: 'Monument', icon: 'star',
  description: 'The campus monument.',
  vrPage: 'monument.html',
  x: 250, y: 110
};
