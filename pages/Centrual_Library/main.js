import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { stages } from './stages1.js';

// --- 1. SCENE & CAMERA SETUP ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = false;
controls.rotateSpeed = -0.5;

const textureLoader = new THREE.TextureLoader();

// --- 2. CREATE SPHERE MESH FOR PANORAMA ---
// Large sphere inverted inside-out (BackSide) so texture renders on the interior
const sphereGeo = new THREE.SphereGeometry(500, 60, 40);
sphereGeo.scale(-1, 1, 1); // Flip normals inward
const sphereMat = new THREE.MeshBasicMaterial();
const panoramaSphere = new THREE.Mesh(sphereGeo, sphereMat);
scene.add(panoramaSphere);

// --- 3. INVISIBLE GROUND PLANE FOR MOUSE RAYCASTING ---
const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshBasicMaterial({ visible: false });
const groundPlane = new THREE.Mesh(groundGeo, groundMat);
groundPlane.rotation.x = -Math.PI / 2;
groundPlane.position.y = -2;
scene.add(groundPlane);

// --- 4. DYNAMIC CURSOR ARROW ---
function createStreetViewArrow() {
  const group = new THREE.Group();

  const diskGeom = new THREE.RingGeometry(0, 0.8, 32);
  const diskMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide
  });
  group.add(new THREE.Mesh(diskGeom, diskMat));

  const shape = new THREE.Shape();
  shape.moveTo(0, -0.5);
  shape.lineTo(-0.35, 0.2);
  shape.lineTo(0, -0.05);
  shape.lineTo(0.35, 0.2);
  shape.closePath();

  const arrowGeom = new THREE.ShapeGeometry(shape);
  const arrowMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide
  });
  const arrow = new THREE.Mesh(arrowGeom, arrowMat);
  arrow.position.z = 0.01;
  group.add(arrow);

  group.rotation.x = -Math.PI / 2;
  group.visible = false;
  return group;
}

const cursorArrow = createStreetViewArrow();
scene.add(cursorArrow);


// --- 5. STATIC "X" INDICATOR MESH ---
function createXIndicatorMesh(position) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(25, 25); ctx.lineTo(103, 103);
  ctx.moveTo(103, 25); ctx.lineTo(25, 103);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    opacity: 0.7,
    depthTest: true
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.2), mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.copy(position);
  mesh.position.y = -1.98;
  return mesh;
}

// --- 6. STAGE LOADER (Async / Await) ---
let currentStageId = 'f1_stage1';
let stageLinks = [];
let xIndicators = [];

async function loadStage(stageId) {
  currentStageId = stageId;
  const stageData = stages[stageId];

  try {
    const texture = await textureLoader.loadAsync(stageData.image);
    texture.colorSpace = THREE.SRGBColorSpace;
    
    // Apply texture to sphere material
    sphereMat.map = texture;
    sphereMat.needsUpdate = true;
  } catch (error) {
    // console.error(`Failed to load texture for ${stageId}:`, error);
  }

  // --- ROTATE SPHERE MESH USING HEADING ---
  if (stageData.heading !== undefined) {
    // Rotate sphere mesh around Y-axis based on heading degrees
    panoramaSphere.rotation.y = THREE.MathUtils.degToRad(stageData.heading);
  } else {
    panoramaSphere.rotation.y = 0;
  }

  // Clear previous stage meshes
  stageLinks.forEach((m) => scene.remove(m));
  xIndicators.forEach((m) => scene.remove(m));
  stageLinks = [];
  xIndicators = [];

  // Build target hitboxes & static X markers
  stageData.links.forEach((link) => {
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hitMat);
    hitMesh.rotation.x = -Math.PI / 2;
    hitMesh.position.copy(link.position);
    hitMesh.userData = { targetStageId: link.targetStageId };
    
    scene.add(hitMesh);
    stageLinks.push(hitMesh);

    const xMesh = createXIndicatorMesh(link.position);
    scene.add(xMesh);
    xIndicators.push(xMesh);
  });
}

// Load stage_1
loadStage(currentStageId);

// --- 7. RAYCASTING & MOUSE INTERACTION ---
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const groundIntersects = raycaster.intersectObject(groundPlane);

  if (groundIntersects.length > 0) {
    const point = groundIntersects[0].point;

    cursorArrow.position.set(point.x, -1.95, point.z);
    cursorArrow.visible = true;

    // Updated: Point cursor arrow outward from center (0,0) toward the mouse position
    const angle = Math.atan2(point.x, point.z);
    cursorArrow.rotation.z = angle;

    const linkIntersects = raycaster.intersectObjects(stageLinks);
    document.body.style.cursor = linkIntersects.length > 0 ? 'pointer' : 'default';
  } else {
    cursorArrow.visible = false;
  }
});

window.addEventListener('click', async () => {
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(stageLinks);

  if (intersects.length > 0) {
    const nextStageId = intersects[0].object.userData.targetStageId;
    cursorArrow.visible = false;
    await loadStage(nextStageId);
  }
});

// --- 8. ANIMATION LOOP & RESIZE ---
function animate() {
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});