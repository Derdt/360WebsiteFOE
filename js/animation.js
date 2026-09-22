let angle = 0;

export function updateCamera(camera){

    angle += 0.002;

    const radius = 140;

    camera.position.x = Math.cos(angle) * radius;

    camera.position.z = Math.sin(angle) * radius;

    camera.position.y = 70;

    camera.lookAt(0,0,0);

}