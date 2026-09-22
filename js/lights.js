import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { scene } from "./scene.js";

const ambient = new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambient);

const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    100,
    150,
    80
);

sun.castShadow = true;

scene.add(sun);