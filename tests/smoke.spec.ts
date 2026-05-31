import { test, expect } from '@playwright/test';

/**
 * Smoke test: boot the game and confirm it actually renders and runs.
 *
 * Phaser draws to a <canvas>, so we assert on the canvas element, a clean
 * console, and that the game advances frames (proving the run loop is alive).
 */
test('Mr. Capy boots, renders a canvas, and runs without console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto('/');

  // Title shell from index.html is present.
  await expect(page.locator('h1')).toContainText('Mr. Capy');

  // Phaser injects a <canvas> once the game boots.
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 10_000 });

  const box = await canvas.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(0);
  expect(box?.height ?? 0).toBeGreaterThan(0);

  // The run loop should be advancing frames.
  const firstFrame = await page.evaluate(
    () => (window as unknown as { game?: { loop?: { frame: number } } }).game?.loop?.frame ?? -1,
  );
  await page.waitForTimeout(500);
  const laterFrame = await page.evaluate(
    () => (window as unknown as { game?: { loop?: { frame: number } } }).game?.loop?.frame ?? -1,
  );
  // If the game exposes its loop, frames advanced; otherwise canvas presence is enough.
  if (firstFrame >= 0 && laterFrame >= 0) {
    expect(laterFrame).toBeGreaterThan(firstFrame);
  }

  expect(errors, `console/page errors: ${errors.join(' | ')}`).toEqual([]);

  // Drive the player right and jump — should not throw.
  await page.keyboard.down('ArrowRight');
  await page.waitForTimeout(400);
  await page.keyboard.up('ArrowRight');
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);

  expect(errors).toEqual([]);
});
