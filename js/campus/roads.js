import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { scene } from "../scene.js";

// export function createRoads(){

//     const material = new THREE.MeshStandardMaterial({

//         color:0x4d4d4d

//     });

//     //----------------------------------

//     const road1 = new THREE.Mesh(

//         new THREE.BoxGeometry(
//             320,
//             0.2,
//             18
//         ),

//         material

//     );

//     road1.position.y = 0.1;

//     scene.add(road1);

//     //----------------------------------

//     const road2 = new THREE.Mesh(

//         new THREE.BoxGeometry(
//             18,
//             0.2,
//             320
//         ),

//         material

//     );

//     road2.position.y = 0.1;

//     scene.add(road2);

// }