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

  // Branding lives in the document title (the full-bleed UI has no <h1>).
  await expect(page).toHaveTitle(/Mr\. Capy/);

  // Phaser injects a <canvas> once the game boots.
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible({ timeout: 10_000 });

  const box = await canvas.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThan(0);
  expect(box?.height ?? 0).toBeGreaterThan(0);

  // Regression guard: the canvas must be inside the viewport, not pushed below
  // the fold (the bug where Phaser appended it to <body> after a full-height
  // div, leaving players staring at just the title).
  const viewport = page.viewportSize();
  if (viewport && box) {
    expect(box.y).toBeLessThan(viewport.height);
    expect(box.y + box.height).toBeGreaterThan(0);
  }

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

/**
 * Quest/dialogue smoke test: walk to the first NPC, open the multiple-choice
 * dialogue, accept a quest, and confirm it auto-completes when its goal is met.
 */
test('NPC dialogue starts a quest that completes when its goal is met', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.waitForTimeout(1200);

  type Probe = {
    inDialogue: boolean;
    near: string | null;
    active: string[];
    done: string[];
  };
  const read = () =>
    page.evaluate((): Probe => {
      // @ts-expect-error test-only globals
      const s = window.game.scene.keys.main;
      return {
        inDialogue: s.inDialogue,
        near: s.nearNpc ? s.nearNpc.getData('name') : null,
        active: [...s.activeQuests],
        done: [...s.doneQuests],
      };
    });

  // Walk right until standing next to the first NPC (poll for robustness
  // against headless framerate variance).
  await page.keyboard.down('ArrowRight');
  await expect
    .poll(async () => (await read()).near, { timeout: 5000 })
    .not.toBeNull();
  await page.keyboard.up('ArrowRight');

  // Talk and walk the dialogue: help -> accept -> close.
  await page.keyboard.press('KeyE');
  await page.waitForTimeout(250);
  expect((await read()).inDialogue).toBe(true);
  await page.keyboard.press('2');
  await page.waitForTimeout(200);
  await page.keyboard.press('1');
  await page.waitForTimeout(200);
  expect((await read()).active).toContain('coins5');
  await page.keyboard.press('1');
  await page.waitForTimeout(200);
  expect((await read()).inDialogue).toBe(false);

  // Meet the goal -> quest auto-completes.
  await page.evaluate(() => {
    // @ts-expect-error test-only globals
    window.game.scene.keys.main.score = 5;
  });
  await page.waitForTimeout(300);
  expect((await read()).done).toContain('coins5');

  expect(errors, errors.join(' | ')).toEqual([]);
});
