import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

export const raycaster = new THREE.Raycaster();
export const mouse = new THREE.Vector2();

export let mousePixelX = 0;
export let mousePixelY = 0;

window.addEventListener("mousemove", (event) => {

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    mousePixelX = event.clientX;
    mousePixelY = event.clientY;

});