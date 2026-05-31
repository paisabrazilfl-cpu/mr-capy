# 🦫 Mr. Capy

A small Mario-style platformer starring Mr. Capybara, built with
[Phaser 3](https://phaser.io/) + [Vite](https://vitejs.dev/) + TypeScript.

All artwork is **generated procedurally at runtime** — there are no image files
to download, so it just works after `npm install`.

## Setup

```bash
git clone https://github.com/paisabrazilfl-cpu/mr-capy.git
cd mr-capy
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Scripts

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Start the dev server with HMR            |
| `npm run build`     | Type-check + production build to `dist/` |
| `npm run preview`   | Preview the production build             |
| `npm run typecheck` | Type-check only (`tsc --noEmit`)         |
| `npm run test:e2e`  | Playwright browser smoke test            |

## Controls

- **← / →** or **A / D** — move
- **↑** / **W** / **Space** — jump
- **R** — restart

## How to play

- Run and jump across the level, collecting **coins** for points.
- **Stomp** enemies from above to defeat them (and bounce). Touching one from
  the side costs a life.
- You have **3 lives**. Falling into a pit also costs a life.
- Reach the **flag** at the far right to win — grab every coin for a `PERFECT!`.

## Testing

A Playwright smoke test (`tests/smoke.spec.ts`) boots the game and verifies the
canvas renders, the run loop advances, and the console stays error-free.

```bash
npm install -D @playwright/test   # if not already installed
npx playwright install chromium   # downloads the browser (needs network)
npm run test:e2e
```

> Running browsers requires the usual system libraries (`libnss3`, `libgbm1`,
> `libasound2`, …). On minimal/sandboxed hosts install them with
> `npx playwright install-deps chromium`.

## Deployment (Render)

Two paths, both keep secrets out of source:

**1. Dashboard (simplest).** `render.yaml` defines a static-site deploy. Connect
the repo in the [Render dashboard](https://dashboard.render.com/) — Render reads
`render.yaml`, runs `npm ci && npm run build`, and serves `./dist`.

**2. Automated via GitHub Actions.** `.github/workflows/deploy.yml` triggers a
Render deploy on every push to `main`. It requires two repository secrets
(Settings → Secrets and variables → Actions):

| Secret | Value |
| ------ | ----- |
| `RENDER_API_KEY` | A Render API key (rotate immediately if ever exposed) |
| `RENDER_SERVICE_ID` | The target service id, e.g. `srv-xxxxxxxx` |

The workflow fails loudly if either secret is missing — it never deploys with
hard-coded or pasted credentials.

## Tech

- **Phaser 3.90** — arcade physics, camera follow, tweened animations
- **Vite 7** — dev server and bundler
- **TypeScript 5.9** — strict mode, single `MainScene` class
