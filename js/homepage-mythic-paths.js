import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const modelLoader = new GLTFLoader();

function stagedSway(elapsed) {
  const phase = (elapsed % 16) / 16;
  if (!Number.isFinite(phase)) return 0;
  const ease = (progress) => progress * progress * (3 - 2 * progress);
  if (phase < 0.16) return -ease(phase / 0.16);
  if (phase < 0.28) return -1;
  if (phase < 0.44) return -1 + ease((phase - 0.28) / 0.16);
  if (phase < 0.56) return 0;
  if (phase < 0.72) return ease((phase - 0.56) / 0.16);
  if (phase < 0.84) return 1;
  return 1 - ease((phase - 0.84) / 0.16);
}

function metal(colour, metalness = 0.72, roughness = 0.26) {
  return new THREE.MeshStandardMaterial({ color: colour, metalness, roughness });
}

function tube(points, radius, colour) {
  const curve = new THREE.CatmullRomCurve3(points);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, 44, radius, 8, false), metal(colour));
}

function hermesRoseGoldMaterial(sourceMaterial, { metalness = sourceMaterial?.metalness ?? 0.64, roughness = sourceMaterial?.roughness ?? 0.28, burnished = false } = {}) {
  const canvas = document.createElement('canvas');
  const sourceImage = sourceMaterial?.map?.image;
  canvas.width = sourceImage?.width || 768;
  canvas.height = sourceImage?.height || (burnished ? 192 : 8);
  const context = canvas.getContext('2d');
  if (sourceImage) context.drawImage(sourceImage, 0, 0, canvas.width, canvas.height);
  const gradient = context.createLinearGradient(0, 0, canvas.width, 0);
  [
    [0, '#92725F'], [0.20, '#8D715D'], [0.40, '#8E7260'], [0.55, '#B99F8B'],
    [0.70, '#BFA693'], [0.85, '#DDC9B4'], [1, '#E8D8C5']
  ].forEach(([stop, colour]) => gradient.addColorStop(stop, colour));
  // Apply the approved seven-stop gold in colour blend mode, retaining the GLB's surface value detail.
  context.globalCompositeOperation = sourceImage ? 'color' : 'source-over';
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'source-over';
  if (burnished) {
    const burnish = context.createLinearGradient(0, canvas.height, canvas.width, 0);
    burnish.addColorStop(0, 'rgba(50, 30, 20, 0.14)');
    burnish.addColorStop(0.34, 'rgba(255, 242, 219, 0.16)');
    burnish.addColorStop(0.58, 'rgba(65, 40, 28, 0.11)');
    burnish.addColorStop(1, 'rgba(255, 240, 210, 0.12)');
    context.fillStyle = burnish;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = sourceMaterial?.map?.flipY ?? true;
  const material = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    map: texture,
    normalMap: sourceMaterial?.normalMap || null,
    roughnessMap: sourceMaterial?.roughnessMap || null,
    metalnessMap: sourceMaterial?.metalnessMap || null,
    aoMap: sourceMaterial?.aoMap || null,
    metalness,
    roughness,
    side: THREE.DoubleSide
  });
  if (sourceMaterial?.normalScale) material.normalScale.copy(sourceMaterial.normalScale);
  return material;
}

function translucentMazeBacking(opacity) {
  return new THREE.MeshStandardMaterial({
    color: '#020405',
    metalness: 0,
    roughness: 0.72,
    transparent: true,
    opacity,
    side: THREE.DoubleSide,
    depthWrite: false
  });
}

async function addSuppliedModel(group, assetPath, { rotation = [0, 0, 0], outerRotation = [0, 0, 0], targetSize = 2.4, shapeScale = [1, 1, 1], hiddenMaterialNames = [], hiddenNodeNames = [], materialOverrides = {} } = {}) {
  const gltf = await modelLoader.loadAsync(assetPath);
  const model = gltf.scene;
  const logoGold = hermesRoseGoldMaterial();
  model.traverse((node) => {
    if (!node.isMesh) return;
    node.frustumCulled = false;
    if (hiddenMaterialNames.includes(node.material?.name) || hiddenNodeNames.includes(node.name)) {
      node.visible = false;
      return;
    }
    const materialFactory = materialOverrides[node.material?.name];
    node.material = materialFactory ? materialFactory(node.material) : hermesRoseGoldMaterial(node.material);
  });
  model.rotation.set(...rotation);
  model.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(model);
  const dimensions = bounds.getSize(new THREE.Vector3());
  const centre = bounds.getCenter(new THREE.Vector3());
  const largestDimension = Math.max(dimensions.x, dimensions.y, dimensions.z);
  const fitScale = targetSize / largestDimension;
  model.scale.set(fitScale * shapeScale[0], fitScale * shapeScale[1], fitScale * shapeScale[2]);
  model.position.set(
    -centre.x * fitScale * shapeScale[0],
    -centre.y * fitScale * shapeScale[1],
    -centre.z * fitScale * shapeScale[2]
  );
  const pose = new THREE.Group();
  pose.rotation.set(...outerRotation);
  pose.add(model);
  group.add(pose);
}

const builders = {
  caduceus: (group) => addSuppliedModel(group, 'assets/models/hermes-trismegistus-caduceus.glb', {
    rotation: [-Math.PI / 2, 0, 0],
    targetSize: 1.86,
    materialOverrides: {
      material_0: (sourceMaterial) => hermesRoseGoldMaterial(sourceMaterial, { metalness: 0.68, roughness: 0.27, burnished: true })
    }
  }),
  // The supplied maze was authored flat on its X/Z plane; turn its face towards the viewer.
  labyrinth: (group) => addSuppliedModel(group, 'assets/models/toy-maze.glb', {
    rotation: [Math.PI / 2, 0, 0],
    // Keep the supplied base and cover as a faint black backing visible from either side.
    materialOverrides: {
      Base: () => translucentMazeBacking(0.12),
      Cover: () => translucentMazeBacking(0.05)
    },
    targetSize: 2.05
  }),
  scales: (group) => addSuppliedModel(group, 'assets/models/scales.glb', { targetSize: 2.1, hiddenMaterialNames: ['Ring_material'] }),
  courier: (group) => addSuppliedModel(group, 'assets/models/winged-helmet.glb', {
    // The supplied front orientation sends both wing tips towards the upper card corners.
    rotation: [0, 0, 0],
    outerRotation: [0.305, 0.22, 0],
    targetSize: 1.9,
    shapeScale: [0.86, 1.1, 1]
  })
};

async function mountScene(host) {
  const kind = host.dataset.mythicModel;
  const card = host.closest('.homepage-path-card');
  if (!builders[kind] || !card) return;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  host.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0.1, 4.2);
  const key = new THREE.DirectionalLight('#ffe4b5', 2.1);
  key.position.set(2.8, 3, 4);
  const rim = new THREE.PointLight('#b9d9c9', 11, 8);
  rim.position.set(-2, 1.5, 2);
  scene.add(new THREE.HemisphereLight('#dbe8ff', '#080c12', 1.7), key, rim);
  if (kind === 'courier') {
    const helmetFill = new THREE.DirectionalLight('#ffe9c3', 2.4);
    helmetFill.position.set(0.4, 1.8, 4.6);
    scene.add(helmetFill);
  }
  const model = new THREE.Group();
  // Each supplied model starts facing front; movement is limited to a gentle sway.
  model.rotation.set(-0.08, 0, 0);
  try {
    await builders[kind](model);
  } catch (error) {
    renderer.dispose();
    renderer.domElement.remove();
    console.error('Could not load homepage model:', error);
    return;
  }
  scene.add(model);
  host.classList.add('is-rendered');

  let visible = true;
  let hovered = false;
  let pointerX = 0;
  let pointerY = 0;
  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, width), Math.max(1, height), false);
    camera.aspect = Math.max(1, width) / Math.max(1, height);
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { threshold: 0.08 }).observe(host);
  resize();
  const wake = () => { hovered = true; host.classList.add('is-awake'); };
  const rest = () => { hovered = false; pointerX = 0; pointerY = 0; host.classList.remove('is-awake'); };
  card.addEventListener('pointerenter', wake);
  card.addEventListener('pointerleave', rest);
  card.addEventListener('focusin', wake);
  card.addEventListener('focusout', rest);
  card.addEventListener('pointermove', (event) => {
    const rect = host.getBoundingClientRect();
    pointerX = ((event.clientX - rect.left) / rect.width - 0.5) * 0.7;
    pointerY = ((event.clientY - rect.top) / rect.height - 0.5) * 0.32;
  });
  const start = performance.now();
  function render(now) {
    if (visible) {
      const elapsed = (now - start) / 1000;
      const sway = reducedMotion ? 0 : stagedSway(elapsed) * 0.8;
      const hoverYaw = hovered ? pointerX * 0.035 : 0;
      model.rotation.y += (sway + hoverYaw - model.rotation.y) * 0.055;
      model.rotation.x += (-0.08 + (hovered ? -pointerY * 0.2 : 0) - model.rotation.x) * 0.045;
      const targetScale = hovered ? 1.12 : 1;
      model.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.07);
      model.position.y = reducedMotion ? 0 : Math.sin(elapsed * 0.95) * (hovered ? 0.035 : 0.022);
      renderer.render(scene, camera);
    }
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

document.querySelectorAll('[data-mythic-model]').forEach(mountScene);
