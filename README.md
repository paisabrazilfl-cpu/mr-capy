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

## Tech

- **Phaser 3.90** — arcade physics, camera follow, tweened animations
- **Vite 7** — dev server and bundler
- **TypeScript 5.9** — strict mode, single `MainScene` class
