import * as THREE from 'three';

export const stages = {
  // ==========================================
  // FLOOR 1 (10 Spots Total)[cite: 1]
  // ==========================================
  
  // Start Spot (Red Outline)[cite: 1]
  f1_1: {
    image: '/images/CEIT/HallWay_1_Entrance.jpg',
    heading: 90,
    links: [
      { targetStageId: 'f1_2', position: new THREE.Vector3(-6, -2, -1.5) },
      { targetStageId: 'f1_10', position: new THREE.Vector3(0, -2, 6) } // Bridge down to Floor 2
    ]
  },

  f1_2: {
    image: '/images/CEIT/HallWay_1_DMid.jpg',
    heading: 73,
    links: [
      { targetStageId: 'f1_1', position: new THREE.Vector3(6, -2, 0) },
      { targetStageId: 'f1_3', position: new THREE.Vector3(-6, -2, 0) }
    ]
  },

  f1_3: {
    image: '/images/CEIT/HallWay_1_con.jpg',
    heading: 45,
    links: [
      { targetStageId: 'f1_2', position: new THREE.Vector3(6, -2, 0) },
      { targetStageId: 'f1_4', position: new THREE.Vector3(2, -2, 6) }
    ]
  },

  f1_4: {
    image: '/images/CEIT/ConADown_1.jpg',
    heading: -40,
    links: [
      { targetStageId: 'f1_3', position: new THREE.Vector3(-2, -2, -6) },
      { targetStageId: 'f1_5', position: new THREE.Vector3(-4, -2, 4) },
      { targetStageId: 'f1_9', position: new THREE.Vector3(-6, -2, -2) }
    ]
  },

  f1_5: {
    image: '/images/CEIT/ConMid_A2.jpg',
    heading: 225,
    links: [
      { targetStageId: 'f1_4', position: new THREE.Vector3(4, -2, -4) },
      { targetStageId: 'f1_6', position: new THREE.Vector3(-4, -2, 0) }
    ]
  },

  f1_6: {
    image: '/images/CEIT/ConMid_A1.jpg',
    heading: 0,
    links: [
      { targetStageId: 'f1_5', position: new THREE.Vector3(4, -2, 0) },
      { targetStageId: 'f1_7', position: new THREE.Vector3(-4, -2, -4) }
    ]
  },

  f1_7: {
    image: '/images/CEIT/ConAtop_1.jpg',
    heading: 0,
    links: [
      { targetStageId: 'f1_6', position: new THREE.Vector3(4, -2, 2) },
      { targetStageId: 'f1_8', position: new THREE.Vector3(4, -2, -4) }
    ]
  },

  f1_8: {
    image: '/images/CEIT/ConMid_B1.jpg',
    heading: 0,
    links: [
      { targetStageId: 'f1_7', position: new THREE.Vector3(-6, -2, 2) },
      { targetStageId: 'f1_9', position: new THREE.Vector3(6, -2, 0) }
    ]
  },

  f1_9: {
    image: '/images/CEIT/ConMid_B2.jpg',
    heading: 180,
    links: [
      { targetStageId: 'f1_8', position: new THREE.Vector3(-6, -2, 0) },
      { targetStageId: 'f1_4', position: new THREE.Vector3(6, -2, 2) }
    ]
  },

  // Bridge Spot A- (Floor 1 to Floor 2 connector)[cite: 1]
  f1_10: {
    image: '/images/CEIT/HallWay_Stair_1.jpg',
    heading: 20,
    links: [
      { targetStageId: 'f1_1', position: new THREE.Vector3(0, -2, -2) },
      { targetStageId: 'f2_1', position: new THREE.Vector3(-6, -2, 0) } // Connects to Floor 2 (A+)[cite: 1, 2]
    ]
  },


  // ==========================================
  // FLOOR 2 (14 Spots Total)[cite: 2]
  // ==========================================

  // Bridge Spot A+ (Floor 2 connector)[cite: 2]
  f2_1: {
    image: '/images/CEIT/HallWay_Stair_2.jpg',
    heading: -60,
    links: [
      { targetStageId: 'f1_10', position: new THREE.Vector3(3, -2, 0) }, // Connects back to Floor 1 (A-)[cite: 1, 2]
      { targetStageId: 'f2_2', position: new THREE.Vector3(0, -2, -6) }
    ]
  },

  f2_2: {
    image: '/images/CEIT/HallWay_2_Library.jpg',
    heading: -21,
    links: [
      { targetStageId: 'f2_1', position: new THREE.Vector3(1, -2, 5) },
      { targetStageId: 'f2_3', position: new THREE.Vector3(-3, -2, -6) },
      { targetStageId: 'f2_8', position: new THREE.Vector3(-6, -2, -1.75) }
    ]
  },

  f2_3: {
    image: '/images/CEIT/Library_AEntrance.jpg',
    heading: 0,
    links: [
      { targetStageId: 'f2_2', position: new THREE.Vector3(0, -2, 6) },
      { targetStageId: 'f2_4', position: new THREE.Vector3(-4, -2, 2) },
      { targetStageId: 'f2_7', position: new THREE.Vector3(-4, -2, -2) }
    ]
  },

  f2_4: {
    image: '/images/CEIT/Library_IN_B1.jpg',
    heading: -23,
    links: [
      { targetStageId: 'f2_3', position: new THREE.Vector3(6, -2, -2) },
      { targetStageId: 'f2_5', position: new THREE.Vector3(-4, -2, 0) }
    ]
  },

  f2_5: {
    image: '/images/CEIT/Library_IN_B2.jpg',
    heading: 160,
    links: [
      { targetStageId: 'f2_4', position: new THREE.Vector3(6, -2, -1) },
      { targetStageId: 'f2_6', position: new THREE.Vector3(1.5, -2, -5) }
    ]
  },

  f2_6: {
    image: '/images/CEIT/Library_IN_A2.jpg',
    heading: 45,
    links: [
      { targetStageId: 'f2_5', position: new THREE.Vector3(0, -2, 6) },
      { targetStageId: 'f2_7', position: new THREE.Vector3(4, -2, 0) }
    ]
  },

  f2_7: {
    image: '/images/CEIT/Library_IN_A1.jpg',
    heading: 0,
    links: [
      { targetStageId: 'f2_6', position: new THREE.Vector3(-4, -2, 0) },
      { targetStageId: 'f2_3', position: new THREE.Vector3(4, -2, 2) }
    ]
  },

  f2_8: {
    image: '/images/CEIT/HallWay_2_Library2.jpg',
    heading: -100,
    links: [
      { targetStageId: 'f2_2', position: new THREE.Vector3(6, -2, 0) },
      { targetStageId: 'f2_9', position: new THREE.Vector3(-6, -2, 0) }
    ]
  },

  f2_9: {
    image: '/images/CEIT/HallWay_2_Library3.jpg',
    heading: 90,
    links: [
      { targetStageId: 'f2_8', position: new THREE.Vector3(6, -2, 0) },
      { targetStageId: 'f2_10', position: new THREE.Vector3(-6, -2, 0) }
    ]
  },

  f2_10: {
    image: '/images/CEIT/HallWay_2_Library4.jpg',
    heading: 15,
    links: [
      { targetStageId: 'f2_9', position: new THREE.Vector3(6, -2, 0) },
      { targetStageId: 'f2_11', position: new THREE.Vector3(0, -2, -6) },
      { targetStageId: 'f2_12', position: new THREE.Vector3(-6, -2, 0) }
    ]
  },

  f2_11: {
    image: '/images/CEIT/Cyber_Entrance.jpg',
    heading: 110,
    links: [
      { targetStageId: 'f2_10', position: new THREE.Vector3(2.5, -2, 5) }
    ]
  },

  f2_12: {
    image: '/images/CEIT/HallWay_2_TheEnd.jpg',
    heading: -55,
    links: [
      { targetStageId: 'f2_10', position: new THREE.Vector3(6, -2, 0) },
      { targetStageId: 'f2_13', position: new THREE.Vector3(0, -2, -6) }
    ]
  },

  f2_13: {
    image: '/images/CEIT/IMG_20261021_163733_00_076.jpg',
    heading: 60,
    links: [
      { targetStageId: 'f2_12', position: new THREE.Vector3(1.5, -2, 4) },
      { targetStageId: 'f2_14', position: new THREE.Vector3(0, -2, -6) }
    ]
  },

  f2_14: {
    image: '/images/CEIT/IMG_20261021_163656_00_075.jpg',
    heading: 240,
    links: [
      { targetStageId: 'f2_13', position: new THREE.Vector3(0, -2, 6) }
    ]
  }
};