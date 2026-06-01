import { createVoxelWorld } from './world';

const mount = document.getElementById('app');
if (mount) {
  createVoxelWorld(mount);
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
}
