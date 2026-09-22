import "./lights.js";
import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";

import { scene, renderer } from "./scene.js";
import { camera } from "./camera.js";
import { createCampus } from "./campus/campus.js";
import { createBuildings, buildingMeshes } from "./campus/buildings.js";
import { controls } from "./controls.js";
import { createMarker } from "./helpers/marker.js";
import { raycaster, mouse } from "./interaction/buildingHover.js";

// ---------------------
// Scale for loop
// ---------------------
const backButton = document.getElementById("backButton");
const normalScale = new THREE.Vector3(1, 1, 1);
const hoverScale = new THREE.Vector3(
    1.25,
    1.25,
    1.25
);

const infoPanel = document.getElementById("infoPanel");

const buildingTitle = document.getElementById("buildingTitle");

const buildingDesc = document.getElementById("buildingDesc");

const enterVR = document.getElementById("enterVR");

const closePanel = document.getElementById("closePanel");

let isFocused = false;

const savedCameraPosition = new THREE.Vector3(0, 150, 380);
const savedTarget = new THREE.Vector3();

let selectedBuilding = null;

let isFlying = false;

const flyOffset = new THREE.Vector3(0, 25, 35);

const targetPosition = new THREE.Vector3();

const targetLookAt = new THREE.Vector3();

window.addEventListener("click", () => {

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(buildingMeshes);

    if (intersects.length > 0) {
        
        savedCameraPosition.copy(camera.position);
        savedTarget.copy(controls.target);

        selectedBuilding = intersects[0].object;

        targetLookAt.copy(selectedBuilding.position);

        targetPosition.copy(selectedBuilding.position).add(flyOffset);

        isFlying = true;

        isFocused = true;

        controls.enabled = false;

        backButton.style.display = "block";

    }

});

backButton.addEventListener("click", () => {

    isFocused = false;

    isFlying = false;

    selectedBuilding = null;

    targetLookAt.copy(savedTarget);

    controls.enabled = true;

    infoPanel.style.display = "none";

});

closePanel.addEventListener("click",()=>{

    infoPanel.style.display="none";

});

enterVR.addEventListener("click",()=>{

    

    window.location.href =
    `buildings/${selectedBuilding.userData.id}.html`;

});

function animate() {

    requestAnimationFrame(animate);

    // Raycaster
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(buildingMeshes);

    // Rset scale and emissive color for all buildings
    buildingMeshes.forEach(mesh => {

        mesh.scale.lerp(normalScale, 0.15);

        if (mesh.material.emissive) {
            mesh.material.emissive.setHex(0x000000);
        }

    });

    // Hover

    if (isFlying) {

        camera.position.lerp(targetPosition, 0.05);

        controls.target.lerp(targetLookAt, 0.05);

        if (camera.position.distanceTo(targetPosition) < 0.5) {

            isFlying = false;

            controls.enabled = true;

            infoPanel.style.display = "block";

            buildingTitle.innerHTML = selectedBuilding.userData.title;

            buildingDesc.innerHTML = selectedBuilding.userData.description;

        }

    }

    if (!isFocused) {

        if (intersects.length > 0) {

            const mesh = intersects[0].object;

            mesh.scale.lerp(hoverScale, 0.15);

            if (mesh.material.emissive) {

                mesh.material.emissive.setHex(0x444444);

            }

            document.body.style.cursor = "pointer";

        }
        else {

            document.body.style.cursor = "default";

        }
        
        camera.position.lerp(
        savedCameraPosition,
        0.05
        );

        controls.target.lerp(
            savedTarget,
            0.05
        );

        if (
            selectedBuilding &&
            isFocused &&
            !isFlying
        ) {

            infoPanel.style.display = "block";

            buildingTitle.innerHTML =
                selectedBuilding.userData.title;

            buildingDesc.innerHTML =
                selectedBuilding.userData.description;

        }
        else{

            infoPanel.style.display = "none";

        }

    }

    controls.update();
    renderer.render(scene, camera);

}

// ---------------------
// Create Scene
// ---------------------

createCampus();

createBuildings();

// createMarker(
//     35,
//     60,
//     0x00ff00
// );

animate();