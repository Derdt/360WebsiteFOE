import * as THREE from "https://unpkg.com/three@0.179.1/build/three.module.js";
import { scene } from "../../../js copy/scene.js";
import { BUILDINGS } from "../data/buildings.js";
import { createWing } from "./buildingFactory.js";

export function createBuildings(){

    BUILDINGS.forEach(data=>{

        const mesh = new THREE.Mesh(

            new THREE.BoxGeometry(

                data.width,

                data.height,

                data.depth

            ),

            new THREE.MeshStandardMaterial({

                color:data.color

            })

        );

        mesh.position.set(

            data.x,

            data.height/2,

            data.z

        );

        mesh.userData = {

            id:"science",

            title:"Faculty of Science",

            description:"อาคารคณะวิทยาศาสตร์"

        };

        mesh.castShadow=true;

        mesh.userData=data;

        mesh.userData.id = data.id;

        mesh.userData.name = data.name;

        scene.add(mesh);

        buildingMeshes.push(mesh);

        

    });


}

export const buildingMeshes = [];

