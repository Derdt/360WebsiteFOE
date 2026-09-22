import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { scene } from "../scene.js";

export function createMarker(x,z,color=0xff0000){

    const mesh = new THREE.Mesh(

        new THREE.SphereGeometry(

            1.5,

            16,

            16

        ),

        new THREE.MeshBasicMaterial({

            color

        })

    );

    mesh.position.set(

        x,

        1,

        z

    );

    scene.add(mesh);

}