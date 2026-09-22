import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { scene } from "../../../js copy/scene.js";
import { DEBUG } from "../../../js copy/config.js";

const loader = new THREE.TextureLoader();

const blueprint = loader.load(
    "textures/grass.jpg"
);

blueprint.colorSpace = THREE.SRGBColorSpace;

export function createGround(){

    const ground = new THREE.Mesh(

        new THREE.PlaneGeometry(

            450,

            450

        ),

        new THREE.MeshBasicMaterial({

            color:0x4d4d4d
            // map: blueprint

        })

    );

    ground.rotation.x = -Math.PI/2;
    ground.visible = DEBUG.blueprint;
    scene.add(ground);

}
