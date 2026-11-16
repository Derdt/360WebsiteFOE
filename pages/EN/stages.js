import * as THREE from 'three';

export const stages = {
  // ==========================================
  // FLOOR 1st
  // ==========================================
  
  f1_stage1: { // Start point (E1)[cite: 7]
    image: '../images/EN_Building/OutdoorEN.jpg',
    heading: 71,
    links: [
      { targetStageId: 'f1_E2', position: new THREE.Vector3(0, -2, -10) }
    ]
  },

  f1_E2: {
    image: '../images/EN_Building/InDoorEN.jpg',
    heading: 260,
    links: [
      { targetStageId: 'f1_stage1', position: new THREE.Vector3(0, -2, 7) }
    ]
  }
};