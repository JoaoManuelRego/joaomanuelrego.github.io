import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/controls/OrbitControls.js';
import { STLLoader } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/loaders/STLLoader.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/dat.gui@0.7.9/build/dat.gui.module.js';

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 40); // start zoom

// Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Lights
const directionalLights = [];
function addDirectionalLight(x, y, z, intensity=1) {
  const light = new THREE.DirectionalLight(0xffffff, intensity);
  light.position.set(x, y, z);
  scene.add(light);
  directionalLights.push(light);
}

// Multiple lights
addDirectionalLight(5,10,7.5);
addDirectionalLight(-5,10,-7.5);
addDirectionalLight(0,10,0);

// Mesh placeholder
let mesh = null;

// Load STL
const loader = new STLLoader();
loader.load('model.stl', geometry => {
  const material = new THREE.MeshStandardMaterial({color: 0xff69b4}); // pink
  mesh = new THREE.Mesh(geometry, material);
  centerMesh(mesh);
  scene.add(mesh);
});

// Auto-center function
function centerMesh(mesh) {
  const box = new THREE.Box3().setFromObject(mesh);
  const center = box.getCenter(new THREE.Vector3());
  mesh.position.sub(center); // center at origin
}

// GUI controls
const gui = new GUI();
const params = {
  autoCenter: () => { if(mesh) centerMesh(mesh); },
  zoom: 40,
  color: 0xff69b4,
  lightIntensity: 1,
  autoRotate: false,
  backgroundColor: '#ffffff'
};

// Auto-center button
gui.add(params, 'autoCenter').name('Auto Center');

// Zoom slider
gui.add(params, 'zoom', 5, 100, 1).name('Camera Zoom').onChange(value => {
  camera.position.set(camera.position.x, camera.position.y, value);
});

// Mesh color picker
gui.addColor(params, 'color').name('Model Color').onChange(value => {
  if(mesh) mesh.material.color.set(value);
});

// Light intensity
gui.add(params, 'lightIntensity', 0, 5).name('Lights Intensity').onChange(value => {
  directionalLights.forEach(light => light.intensity = value);
});

// Auto-rotate toggle
gui.add(params, 'autoRotate').name('Auto Rotate');

// Background color
gui.addColor(params, 'backgroundColor').name('Background Color').onChange(value => {
  scene.background.set(value);
});

// Resize handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  if(params.autoRotate && mesh) {
    mesh.rotation.y += 0.01;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();
