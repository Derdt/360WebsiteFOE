import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { DEBUG } from "./config.js";

export const scene = new THREE.Scene();

scene.background = new THREE.Color(0x87CEEB);

export const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);

renderer.shadowMap.enabled = true;

document.body.appendChild(renderer.domElement);

window.addEventListener("resize", () => {

    renderer.setSize(window.innerWidth, window.innerHeight);

});

const grid = new THREE.GridHelper(

    450,

    45,

    0xffffff,

    0x666666

);

grid.visible = DEBUG.grid;
scene.add(grid);