import { OrbitControls } from 'https://unpkg.com/three@0.179.1/examples/jsm/controls/OrbitControls.js';

import { camera } from "./camera.js";
import { renderer } from "./scene.js";

export const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;
controls.dampingFactor = 0.08;

controls.enableZoom = true;
controls.zoomSpeed = 0.9;

controls.enablePan = false;

controls.rotateSpeed = 0.5;