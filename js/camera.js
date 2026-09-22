import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export const camera = new THREE.PerspectiveCamera(

    60,

    window.innerWidth / window.innerHeight,

    0.1,

    1000

);

camera.position.set(0, 120, 140);

camera.lookAt(0,0,0);