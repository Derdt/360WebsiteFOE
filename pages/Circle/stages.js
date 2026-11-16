import * as THREE from 'three';

export const stages = {
  // ==========================================
  // FLOOR 1st
  // ==========================================
  
  f1_stage1: { // Start point (E1)[cite: 7]
    image: '../images/CircleOne/F1_E1.jpg',
    heading: -109,
    links: [
      { targetStageId: 'f1_E2', position: new THREE.Vector3(0, -2, -10) }
    ]
  },

  f1_E2: {
    image: '../images/CircleOne/F1_E2.jpg',
    heading: 293,
    links: [
      { targetStageId: 'f1_stage1', position: new THREE.Vector3(0, -2, 7) },
      { targetStageId: 'f1_A2', position: new THREE.Vector3(0.1, -2, -6) }
    ]
  },

  f1_A2: {
    image: '../images/CircleOne/F1_A2.jpg',
    heading: 275,
    links: [
      { targetStageId: 'f1_E2', position: new THREE.Vector3(0, -2, 5) },
      { targetStageId: 'f1_A1', position: new THREE.Vector3(-8, -2, -4) },
      { targetStageId: 'f1_C1', position: new THREE.Vector3(-2, -2, -4) },
      { targetStageId: 'f1_A3', position: new THREE.Vector3(7, -2, -2) },
      { targetStageId: 'f1_B', position: new THREE.Vector3(0.7, -2, -10) }
    ]
  },

  f1_A1: {
    image: '../images/CircleOne/F1_A1.jpg',
    heading: 0,
    links: [
      { targetStageId: 'f1_A2', position: new THREE.Vector3(4, -2, 6) },
      { targetStageId: 'f1_EN', position: new THREE.Vector3(-2, -2, 5) },
      { targetStageId: 'f1_S', position: new THREE.Vector3(6, -2, -5) } // Connects to Floor 1's Spot S (Bridge to Floor 2 A1)[cite: 7, 9]
    ]
  },

  f1_EN: {
    image: '../images/CircleOne/F1_EN.jpg',
    heading: -20,
    links: [
      { targetStageId: 'f1_A1', position: new THREE.Vector3(6, -2, 0) }
    ]
  },

  f1_S: { // Bridge spot S connecting Floor 1 A1 to Floor 2 A1[cite: 7, 9]
    image: '../images/CircleOne/S.jpg',
    heading: 30,
    links: [
      { targetStageId: 'f1_A1', position: new THREE.Vector3(-2, -2, 3) },
      { targetStageId: 'f2_A1', position: new THREE.Vector3(-3, -2, 0) }
    ]
  },

  f1_C1: {
    image: '../images/CircleOne/C1.jpg',
    heading: -90,
    links: [
      { targetStageId: 'f1_A2', position: new THREE.Vector3(0.5, -2, 3) },
      { targetStageId: 'f1_B', position: new THREE.Vector3(4, -2, -6.5) },
      { targetStageId: 'f1_C2', position: new THREE.Vector3(-3.5, -2, -5) }
    ]
  },

  f1_B: {
    image: '../images/CircleOne/F1_B.jpg',
    heading: -62,
    links: [
      { targetStageId: 'f1_C1', position: new THREE.Vector3(-2, -2, 6) },
      { targetStageId: 'f1_A2', position: new THREE.Vector3(0, -2, 9) }
    ]
  },

  f1_C2: {
    image: '../images/CircleOne/C2.jpg',
    heading: -105,
    links: [
      { targetStageId: 'f1_C1', position: new THREE.Vector3(5, -2, 1) },
      { targetStageId: 'f1_C3', position: new THREE.Vector3(-3.5, -2, -5.5) }
    ]
  },

  f1_C3: {
    image: '../images/CircleOne/C3.jpg',
    heading: -100,
    links: [
      { targetStageId: 'f1_C2', position: new THREE.Vector3(5, -2, 1.5) },
      { targetStageId: 'f1_C4', position: new THREE.Vector3(-3.5, -2, -5.5) } // Connected to C4[cite: 7]
    ]
  },

  f1_C4: { // Merged Bridge spot C4 connecting C3, B, and Floor 2 C5[cite: 7, 9]
    image: '../images/CircleOne/C4.jpg',
    heading: 240,
    links: [
      { targetStageId: 'f1_C3', position: new THREE.Vector3(4, -2, 2) },
      { targetStageId: 'f2_C5', position: new THREE.Vector3(-2.5, -2, -6) } // Connects to Floor 2 C5[cite: 7, 9]
    ]
  },

  f1_A3: {
    image: '../images/CircleOne/F1_A3.jpg',
    heading: 225,
    links: [
      { targetStageId: 'f1_A2', position: new THREE.Vector3(-6, -2, 2) },
      { targetStageId: 'f1_P1', position: new THREE.Vector3(0, -2, 4) },
      { targetStageId: 'f1_A4', position: new THREE.Vector3(5, -2, -5) }
    ]
  },

  f1_P1: {
    image: '../images/CircleOne/F1_P1.jpg',
    heading: 157,
    links: [
      { targetStageId: 'f1_A3', position: new THREE.Vector3(-3, -2, -3) },
      { targetStageId: 'f1_P2', position: new THREE.Vector3(5, -2, -4) }
    ]
  },

  f1_P2: {
    image: '../images/CircleOne/F1_P2.jpg',
    heading: 165,
    links: [
      { targetStageId: 'f1_P1', position: new THREE.Vector3(-6, -2, 4) },
      { targetStageId: 'f1_A4', position: new THREE.Vector3(-1, -2, -4) }
    ]
  },

  f1_A4: {
    image: '../images/CircleOne/F1_A4.jpg',
    heading: -136,
    links: [
      { targetStageId: 'f1_A3', position: new THREE.Vector3(-6, -2, 4) },
      { targetStageId: 'f1_P2', position: new THREE.Vector3(-3, -2, 6) },
      { targetStageId: 'f1_XR', position: new THREE.Vector3(-5, -2, -1) }
    ]
  },

  f1_XR: {
    image: '../images/CircleOne/F1_XR.jpg',
    heading: 117,
    links: [
      { targetStageId: 'f1_A4', position: new THREE.Vector3(2, -2, 4) }
    ]
  },


  // ==========================================
  // FLOOR 2[cite: 9]
  // ==========================================

  f2_A1: {
    image: '../images/CircleOne/F2_A1.jpg',
    heading: 32
    ,
    links: [
      { targetStageId: 'f1_S', position: new THREE.Vector3(4, -2, -3) }, // Connects back to Floor 1 S[cite: 7, 9]
      { targetStageId: 'f2_A2', position: new THREE.Vector3(2, -2, 4) }
    ]
  },

  f2_A2: {
    image: '../images/CircleOne/F2_A2.jpg',
    heading: 140,
    links: [
      { targetStageId: 'f2_A1', position: new THREE.Vector3(-3, -2, -4.4) },
      { targetStageId: 'f2_A3', position: new THREE.Vector3(3.2, -2, 5) },
      { targetStageId: 'f2_C6', position: new THREE.Vector3(6, -2, -6) }
    ]
  },

  f2_C6: {
    image: '../images/CircleOne/C6.jpg',
    heading: 167,
    links: [
      { targetStageId: 'f2_A2', position: new THREE.Vector3(-6, -2, 6) },
      { targetStageId: 'f2_C5', position: new THREE.Vector3(0, -2, 3.5) }
    ]
  },

  f2_C5: {
    image: '../images/CircleOne/C5.jpg',
    heading: 90,
    links: [
      { targetStageId: 'f2_C6', position: new THREE.Vector3(-3.5, -2, -7.5) },
      { targetStageId: 'f1_C4', position: new THREE.Vector3(5, -2, 1.5) } // Connects to Floor 1 C4[cite: 7, 9]
    ]
  },

  f2_A3: {
    image: '../images/CircleOne/F2_A3.jpg',
    heading: 130,
    links: [
      { targetStageId: 'f2_A2', position: new THREE.Vector3(-5, -2, -7.5) },
      { targetStageId: 'f2_A4', position: new THREE.Vector3(8, -2, 5) }
    ]
  },

  f2_A4: {
    image: '../images/CircleOne/F2_A4.jpg',
    heading: 190,
    links: [
      { targetStageId: 'f2_A3', position: new THREE.Vector3(-8, -2, -4) },
      { targetStageId: 'f2_A5', position: new THREE.Vector3(7, -2, 0) }
    ]
  },

  f2_A5: {
    image: '../images/CircleOne/F2_A5.jpg',
    heading: 96,
    links: [
      { targetStageId: 'f2_A4', position: new THREE.Vector3(-8, -2, 0) },
      { targetStageId: 'f2_A6', position: new THREE.Vector3(6, -2, 0) }
    ]
  },

  f2_A6: {
    image: '../images/CircleOne/F2_A6.jpg',
    heading: -46,
    links: [
      { targetStageId: 'f2_A5', position: new THREE.Vector3(-6, -2, 0) }
    ]
  }
};