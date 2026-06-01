import { test, expect } from '@playwright/test';

/**
 * Smoke test for the 3D voxel world (3d.html): the terrain builds, the canvas
 * renders without console errors, and the hero moves on input.
 */
test('Voxel world builds terrain and the hero moves', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/3d.html');
  await page.waitForTimeout(1500);

  // A WebGL canvas exists and is visible.
  const canvas = page.locator('#app canvas');
  await expect(canvas).toBeVisible();

  type Probe = { blocks: number; x: number; z: number };
  const read = () =>
    page.evaluate((): Probe => {
      // @ts-expect-error test-only global
      const v = window.voxel;
      return { blocks: v.blockCount, x: v.hero.position.x, z: v.hero.position.z };
    });

  // Terrain actually generated a meaningful number of blocks.
  const start = await read();
  expect(start.blocks).toBeGreaterThan(1000);

  // Pressing forward moves the hero through the world. Poll the travelled
  // distance so a slow headless framerate doesn't flake the test.
  await page.evaluate(() => {
    // @ts-expect-error test-only global
    window.voxel.pressKey('w');
  });
  await expect
    .poll(
      async () => {
        const now = await read();
        return Math.hypot(now.x - start.x, now.z - start.z);
      },
      { timeout: 5000 },
    )
    .toBeGreaterThan(0.5);
  await page.evaluate(() => {
    // @ts-expect-error test-only global
    window.voxel.releaseKey('w');
  });

  expect(errors, errors.join(' | ')).toEqual([]);
});
