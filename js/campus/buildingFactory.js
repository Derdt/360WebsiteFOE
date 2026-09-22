import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { scene } from "../../../js copy/scene.js";

export function createWing(x,z,w,d,h,color){

    const mesh = new THREE.Mesh(

        new THREE.BoxGeometry(
            w,
            h,
            d
        ),

        new THREE.MeshStandardMaterial({
            color
        })

    );

    mesh.position.set(
        x,
        h/2,
        z
    );

    mesh.castShadow = true;

    scene.add(mesh);

    return mesh;
}