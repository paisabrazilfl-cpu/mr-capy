import * as THREE from 'three';

/**
 * Mr. Capy 3D — a Minecraft-style voxel world (first slice).
 *
 * This module builds a procedurally-generated block terrain, a capybara hero,
 * and third-person WASD + drag-to-look controls. Everything is generated in
 * code (colored block faces), so no texture assets are required — matching the
 * project's zero-assets design.
 *
 * Scope note: this is the foundation for a 12-level voxel adventure. It renders
 * real terrain you can walk on and explore; later slices add mining/placing,
 * biomes, NPCs and quests on top of this base.
 */

const CHUNK = 32; // world is CHUNK x CHUNK blocks
const BLOCK = 1;

type BlockType = 'grass' | 'dirt' | 'stone' | 'water' | 'sand';

const BLOCK_COLORS: Record<BlockType, number> = {
  grass: 0x5bb450,
  dirt: 0x9c5a2c,
  stone: 0x8a8d91,
  water: 0x3a8ed6,
  sand: 0xe6d39a,
};

/** Simple value-noise height field so the terrain has gentle hills. */
function heightAt(x: number, z: number): number {
  const n =
    Math.sin(x * 0.25) * 1.6 +
    Math.cos(z * 0.22) * 1.6 +
    Math.sin((x + z) * 0.15) * 1.2;
  return Math.round(3 + n);
}

export interface VoxelWorld {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dispose(): void;
}

export function createVoxelWorld(parent: HTMLElement): VoxelWorld {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x8fd0ff);
  scene.fog = new THREE.Fog(0x8fd0ff, 20, 60);

  const camera = new THREE.PerspectiveCamera(
    65,
    parent.clientWidth / Math.max(1, parent.clientHeight),
    0.1,
    200,
  );

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(parent.clientWidth, parent.clientHeight);
  renderer.shadowMap.enabled = true;
  parent.appendChild(renderer.domElement);

  // Lighting — warm sun + soft sky fill.
  const sun = new THREE.DirectionalLight(0xffffff, 1.1);
  sun.position.set(20, 30, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -40;
  sun.shadow.camera.right = 40;
  sun.shadow.camera.top = 40;
  sun.shadow.camera.bottom = -40;
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xbfe9ff, 0x4a6b3a, 0.7));

  // Build terrain using one InstancedMesh per block type (fast, few draw calls).
  const geo = new THREE.BoxGeometry(BLOCK, BLOCK, BLOCK);
  const buckets: Record<BlockType, THREE.Matrix4[]> = {
    grass: [],
    dirt: [],
    stone: [],
    water: [],
    sand: [],
  };
  const tmp = new THREE.Matrix4();
  const half = CHUNK / 2;
  const heightOf = new Map<string, number>();

  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const h = heightAt(x, z);
      heightOf.set(`${x},${z}`, h);
      for (let y = 0; y <= h; y++) {
        let type: BlockType;
        if (y === h) type = h <= 2 ? 'sand' : 'grass';
        else if (y > h - 2) type = 'dirt';
        else type = 'stone';
        tmp.makeTranslation(x, y, z);
        buckets[type].push(tmp.clone());
      }
    }
  }
  // A flat water plane in the low areas.
  for (let x = -half; x < half; x++) {
    for (let z = -half; z < half; z++) {
      const h = heightOf.get(`${x},${z}`)!;
      if (h <= 2) {
        tmp.makeTranslation(x, 2.4, z);
        buckets.water.push(tmp.clone());
      }
    }
  }

  const meshes: THREE.InstancedMesh[] = [];
  (Object.keys(buckets) as BlockType[]).forEach((type) => {
    const mats = buckets[type];
    if (!mats.length) return;
    const material = new THREE.MeshStandardMaterial({
      color: BLOCK_COLORS[type],
      transparent: type === 'water',
      opacity: type === 'water' ? 0.7 : 1,
      roughness: 0.9,
    });
    const inst = new THREE.InstancedMesh(geo, material, mats.length);
    inst.castShadow = type !== 'water';
    inst.receiveShadow = true;
    mats.forEach((m, i) => inst.setMatrixAt(i, m));
    inst.instanceMatrix.needsUpdate = true;
    scene.add(inst);
    meshes.push(inst);
  });

  // The capybara hero — a chunky little block-creature.
  const hero = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x9b6a43, roughness: 0.8 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x7d5435, roughness: 0.8 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(1, 0.8, 1.6), bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  hero.add(body);
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), bodyMat);
  head.position.set(0, 0.9, 0.9);
  head.castShadow = true;
  hero.add(head);
  for (const dx of [-0.35, 0.35]) {
    for (const dz of [-0.5, 0.5]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.5, 0.25), darkMat);
      leg.position.set(dx, 0.25, dz);
      leg.castShadow = true;
      hero.add(leg);
    }
  }
  const startH = heightAt(0, 0) + 1;
  hero.position.set(0, startH, 0);
  scene.add(hero);

  // ---- Controls: WASD move (relative to look), drag to orbit, hero faces dir.
  const keys = new Set<string>();
  const onKeyDown = (e: KeyboardEvent) => keys.add(e.key.toLowerCase());
  const onKeyUp = (e: KeyboardEvent) => keys.delete(e.key.toLowerCase());
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);

  let yaw = 0.6;
  let pitch = 0.5;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  const dom = renderer.domElement;
  const onDown = (e: PointerEvent) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    yaw -= (e.clientX - lastX) * 0.005;
    pitch = Math.min(1.2, Math.max(0.15, pitch - (e.clientY - lastY) * 0.005));
    lastX = e.clientX;
    lastY = e.clientY;
  };
  const onUp = () => (dragging = false);
  dom.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);

  const moveState = { x: 0, z: 0 }; // exposed for tests

  const clock = new THREE.Clock();
  let raf = 0;
  const tick = () => {
    const dt = Math.min(0.05, clock.getDelta());
    const speed = 6 * dt;

    // Movement relative to camera yaw.
    let mx = 0;
    let mz = 0;
    if (keys.has('w') || keys.has('arrowup')) mz -= 1;
    if (keys.has('s') || keys.has('arrowdown')) mz += 1;
    if (keys.has('a') || keys.has('arrowleft')) mx -= 1;
    if (keys.has('d') || keys.has('arrowright')) mx += 1;
    const len = Math.hypot(mx, mz) || 1;
    mx /= len;
    mz /= len;
    const sin = Math.sin(yaw);
    const cos = Math.cos(yaw);
    const worldX = mx * cos - mz * sin;
    const worldZ = mx * sin + mz * cos;
    moveState.x = worldX;
    moveState.z = worldZ;

    if (worldX || worldZ) {
      hero.position.x += worldX * speed;
      hero.position.z += worldZ * speed;
      hero.rotation.y = Math.atan2(worldX, worldZ);
    }
    // Stick the hero to the terrain surface.
    const gx = Math.round(hero.position.x);
    const gz = Math.round(hero.position.z);
    const gh = heightOf.get(`${gx},${gz}`);
    hero.position.y = (gh ?? heightAt(gx, gz)) + 1;

    // Third-person camera orbiting the hero.
    const dist = 8;
    camera.position.set(
      hero.position.x - Math.sin(yaw) * Math.cos(pitch) * dist,
      hero.position.y + Math.sin(pitch) * dist + 2,
      hero.position.z - Math.cos(yaw) * Math.cos(pitch) * dist,
    );
    camera.lookAt(hero.position.x, hero.position.y + 1, hero.position.z);

    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  const onResize = () => {
    camera.aspect = parent.clientWidth / Math.max(1, parent.clientHeight);
    camera.updateProjectionMatrix();
    renderer.setSize(parent.clientWidth, parent.clientHeight);
  };
  window.addEventListener('resize', onResize);

  // Expose state for smoke tests / debugging.
  (window as unknown as { voxel: unknown }).voxel = {
    hero,
    camera,
    blockCount: meshes.reduce((n, m) => n + m.count, 0),
    moveState,
    pressKey: (k: string) => keys.add(k),
    releaseKey: (k: string) => keys.delete(k),
  };

  return {
    scene,
    camera,
    renderer,
    dispose() {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
