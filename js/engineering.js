import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { OrbitControls } from "https://unpkg.com/three@0.179.1/examples/jsm/controls/OrbitControls.js";
import { rooms } from "./data/engineeringData.js";

// ==========================
// Scene
// ==========================

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1100
);

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

const backButton =
document.getElementById("backToCampus");

backButton.addEventListener("click",()=>{

    window.location.href="../campus.html";

});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document
    .getElementById("viewer")
    .appendChild(renderer.domElement);

// ==========================
// Controls
// ==========================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enablePan = false;
controls.enableZoom = false;
controls.enableRotate = true;

camera.position.set(0,0,0.1);

// ==========================
// Texture Loader
// ==========================

const textureLoader = new THREE.TextureLoader();

// ==========================
// Panorama
// ==========================

const geometry = new THREE.SphereGeometry(
    500,
    60,
    40
);

geometry.scale(-1,1,1);

const material = new THREE.MeshBasicMaterial({

    map:textureLoader.load("../E-image/Engineering1.jpg")

});

const panorama = new THREE.Mesh(
    geometry,
    material
);

scene.add(panorama);

// ==========================
// Animate
// ==========================

function animate(){

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(
        scene,
        camera
    );

}

animate();

// ==========================
// Resize
// ==========================

window.addEventListener("resize",()=>{

    camera.aspect=
    window.innerWidth/window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});