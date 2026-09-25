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

const material = new THREE.MeshBasicMaterial();

const panorama = new THREE.Mesh(
    geometry,
    material
);

scene.add(panorama);

// ==========================
// Floor-dot navigation (Street-View style)
// ==========================

const hotspotLayer = document.createElement("div");
hotspotLayer.id = "hotspots";
document.getElementById("viewer").appendChild(hotspotLayer);

const roomById = Object.fromEntries(rooms.map((r) => [r.id, r]));
const activeHotspots = [];   // { el, point } for the currently loaded room
const projected = new THREE.Vector3();

function yawPitchToPoint(yawDeg, pitchDeg, distance) {
    const yaw = THREE.MathUtils.degToRad(yawDeg);
    const pitch = THREE.MathUtils.degToRad(pitchDeg);
    return new THREE.Vector3(
        distance * Math.cos(pitch) * Math.sin(yaw),
        distance * Math.sin(pitch),
        -distance * Math.cos(pitch) * Math.cos(yaw)
    );
}

function loadRoom(id) {
    const room = roomById[id];
    if (!room) { console.error("Unknown room id:", id); return; }

    textureLoader.load(
        room.image,
        (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            material.map = tex;
            material.needsUpdate = true;
        },
        undefined,
        (err) => console.error("Could not load panorama image:", room.image, err)
    );

    activeHotspots.forEach((h) => h.el.remove());
    activeHotspots.length = 0;

    (room.hotspots || []).forEach((h) => {
        const el = document.createElement("button");
        el.type = "button";
        el.className = "hotspot";
        el.setAttribute("aria-label", h.label || ("Go to " + h.target));
        el.addEventListener("click", () => loadRoom(h.target));
        hotspotLayer.appendChild(el);
        activeHotspots.push({
            el,
            point: yawPitchToPoint(h.yaw || 0, h.pitch ?? -10, h.distance ?? 60)
        });
    });

    try { history.replaceState(null, "", "#" + id); } catch (e) { /* ignore */ }
}

const wantedId = rooms.some((r) => r.id === location.hash.slice(1)) ? location.hash.slice(1) : rooms[0].id;
loadRoom(wantedId);

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

    const winW = window.innerWidth, winH = window.innerHeight;
    for (const h of activeHotspots) {
        projected.copy(h.point).project(camera);
        const visible = projected.z < 1 && Math.abs(projected.x) < 1.15 && Math.abs(projected.y) < 1.15;
        h.el.style.display = visible ? "" : "none";
        if (!visible) continue;
        const x = (projected.x * 0.5 + 0.5) * winW;
        const y = (-projected.y * 0.5 + 0.5) * winH;
        h.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    }

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