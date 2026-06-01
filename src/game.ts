import Phaser from 'phaser';

/**
 * Mr. Capy — a small Mario-style platformer starring a capybara.
 *
 * All artwork is generated procedurally at runtime (see TextureFactory), so the
 * game is fully self-contained and needs no external image assets.
 */

const WIDTH = 800;
const HEIGHT = 600;
const WORLD_WIDTH = 3200;
const TILE = 64;

const COLORS = {
  sky: 0x6ec6ff,
  skyBottom: 0xbfe9ff,
  cloud: 0xffffff,
  dirt: 0x9c5a2c,
  dirtDark: 0x7c4420,
  grass: 0x4caf50,
  grassDark: 0x3d8b41,
  brick: 0xc97b3c,
  brickEdge: 0x8a5223,
  capyBody: 0x9b6a43,
  capyDark: 0x7d5435,
  capyBelly: 0xc79a72,
  coin: 0xffd54a,
  coinEdge: 0xe0a800,
  enemy: 0x6d4c9f,
  enemyDark: 0x4e3576,
  flagPole: 0xcfd8dc,
  flagCloth: 0xe53935,
};

/** Draws all sprites/tiles into named textures so no asset files are required. */
class TextureFactory {
  constructor(private scene: Phaser.Scene) {}

  private g(): Phaser.GameObjects.Graphics {
    return this.scene.make.graphics({ x: 0, y: 0 }, false);
  }

  build(): void {
    this.cloud();
    this.ground();
    this.brick();
    this.coin();
    this.enemy();
    this.flag();
    this.capy('capy-idle', 0);
    this.capy('capy-walk-a', 4);
    this.capy('capy-walk-b', -4);
    this.capy('capy-jump', 0, true);
  }

  private cloud(): void {
    const g = this.g();
    g.fillStyle(COLORS.cloud, 1);
    g.fillCircle(26, 30, 22);
    g.fillCircle(58, 24, 28);
    g.fillCircle(92, 30, 22);
    g.fillRect(26, 30, 66, 22);
    g.generateTexture('cloud', 118, 56);
    g.destroy();
  }

  private ground(): void {
    const g = this.g();
    g.fillStyle(COLORS.dirt, 1);
    g.fillRect(0, 0, TILE, TILE);
    g.fillStyle(COLORS.dirtDark, 1);
    for (let i = 0; i < 6; i++) {
      const x = (i * 23) % (TILE - 8);
      const y = 18 + ((i * 13) % (TILE - 24));
      g.fillRect(x, y, 6, 6);
    }
    g.fillStyle(COLORS.grass, 1);
    g.fillRect(0, 0, TILE, 16);
    g.fillStyle(COLORS.grassDark, 1);
    for (let x = 0; x < TILE; x += 8) g.fillRect(x, 14, 4, 6);
    g.generateTexture('ground', TILE, TILE);
    g.destroy();
  }

  private brick(): void {
    const g = this.g();
    g.fillStyle(COLORS.brickEdge, 1);
    g.fillRect(0, 0, TILE, 24);
    g.fillStyle(COLORS.brick, 1);
    g.fillRect(2, 2, TILE - 4, 20);
    g.fillStyle(COLORS.brickEdge, 1);
    g.fillRect(TILE / 2 - 1, 2, 2, 20);
    g.generateTexture('brick', TILE, 24);
    g.destroy();
  }

  private coin(): void {
    const g = this.g();
    g.fillStyle(COLORS.coinEdge, 1);
    g.fillCircle(16, 16, 14);
    g.fillStyle(COLORS.coin, 1);
    g.fillCircle(16, 16, 11);
    g.fillStyle(COLORS.coinEdge, 1);
    g.fillRect(14, 8, 4, 16);
    g.generateTexture('coin', 32, 32);
    g.destroy();
  }

  private enemy(): void {
    const g = this.g();
    g.fillStyle(COLORS.enemyDark, 1);
    g.fillRoundedRect(2, 6, 36, 28, 10);
    g.fillStyle(COLORS.enemy, 1);
    g.fillRoundedRect(4, 4, 32, 26, 10);
    // angry eyes
    g.fillStyle(0xffffff, 1);
    g.fillCircle(14, 16, 5);
    g.fillCircle(26, 16, 5);
    g.fillStyle(0x000000, 1);
    g.fillCircle(15, 17, 2);
    g.fillCircle(27, 17, 2);
    // feet
    g.fillStyle(COLORS.enemyDark, 1);
    g.fillRect(8, 32, 8, 6);
    g.fillRect(24, 32, 8, 6);
    g.generateTexture('enemy', 40, 40);
    g.destroy();
  }

  private flag(): void {
    const g = this.g();
    g.fillStyle(COLORS.flagPole, 1);
    g.fillRect(6, 0, 6, 96);
    g.fillStyle(COLORS.flagCloth, 1);
    g.fillTriangle(12, 6, 12, 36, 44, 21);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 21, 4);
    g.generateTexture('flag', 48, 96);
    g.destroy();
  }

  /** A chunky little capybara. legOffset animates the stride; jump tucks legs. */
  private capy(key: string, legOffset: number, jump = false): void {
    const w = 48;
    const h = 40;
    const g = this.g();

    // body
    g.fillStyle(COLORS.capyDark, 1);
    g.fillRoundedRect(4, 12, 40, 22, 9);
    g.fillStyle(COLORS.capyBody, 1);
    g.fillRoundedRect(5, 11, 38, 20, 9);
    // belly
    g.fillStyle(COLORS.capyBelly, 1);
    g.fillRoundedRect(10, 20, 26, 10, 6);
    // head
    g.fillStyle(COLORS.capyBody, 1);
    g.fillRoundedRect(30, 4, 18, 18, 7);
    // ear
    g.fillStyle(COLORS.capyDark, 1);
    g.fillCircle(34, 6, 3);
    g.fillCircle(44, 6, 3);
    // snout
    g.fillStyle(COLORS.capyDark, 1);
    g.fillRoundedRect(42, 12, 6, 8, 3);
    // eye
    g.fillStyle(0x000000, 1);
    g.fillCircle(40, 11, 2);
    // legs
    g.fillStyle(COLORS.capyDark, 1);
    if (jump) {
      g.fillRect(12, 30, 7, 5);
      g.fillRect(30, 30, 7, 5);
    } else {
      g.fillRect(10, 31 - legOffset / 2, 7, 8 + legOffset);
      g.fillRect(30, 31 + legOffset / 2, 7, 8 - legOffset);
    }

    g.generateTexture(key, w, h);
    g.destroy();
  }
}

/** Level layout data: ground gaps, floating platforms, coins, enemies. */
interface LevelData {
  groundGaps: Array<[number, number]>; // [startX, endX] gaps with no ground
  platforms: Array<[number, number, number]>; // x, y, widthInTiles
  coins: Array<[number, number]>;
  enemies: Array<[number, number, number]>; // x, y, patrolRange
}

const LEVEL: LevelData = {
  groundGaps: [
    [640, 820],
    [1450, 1620],
    [2300, 2460],
  ],
  platforms: [
    [420, 430, 2],
    [620, 330, 2],
    [980, 400, 3],
    [1280, 300, 2],
    [1700, 420, 2],
    [1980, 320, 3],
    [2520, 400, 2],
    [2820, 300, 2],
  ],
  coins: [
    [300, 480],
    [440, 380],
    [480, 380],
    [660, 280],
    [1020, 350],
    [1060, 350],
    [1320, 250],
    [1740, 370],
    [2040, 270],
    [2080, 270],
    [2560, 350],
    [2860, 250],
    [3050, 470],
    [3090, 470],
  ],
  enemies: [
    [900, 450, 160],
    [1080, 350, 120],
    [2020, 270, 160],
    [2700, 450, 200],
  ],
};

/**
 * Procedurally-generated happy chiptune via the Web Audio API — no audio files
 * required, matching the project's zero-assets design. A bouncy major-key
 * melody plays over a cheerful bassline. Must be started from a user gesture to
 * satisfy browser autoplay policies.
 */
class AudioManager {
  private ctx: AudioContext;
  private master: GainNode;
  private muted = false;
  private started = false;
  private step = 0;

  // Upbeat melody in C major (Hz), 16 eighth-notes; 0 = rest. Cheerful and
  // sing-song, looping over a I–V–vi–IV feel.
  private readonly melody = [
    523.25, 659.25, 783.99, 659.25, 523.25, 587.33, 659.25, 0,
    698.46, 659.25, 587.33, 523.25, 587.33, 659.25, 523.25, 0,
  ];
  // Simple bouncing bass, one note per two melody steps (root motion C-G-A-F).
  private readonly bass = [130.81, 196.0, 220.0, 174.61];
  private readonly stepMs = 200; // ~150 BPM eighth-notes — lively

  constructor() {
    const Ctor =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.16;
    this.master.connect(this.ctx.destination);
  }

  /** Begin the music loop (idempotent). Call from a user gesture. */
  start(): void {
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    if (this.started) return;
    this.started = true;
    this.tick();
    window.setInterval(() => this.tick(), this.stepMs);
  }

  private tick(): void {
    if (this.muted || this.ctx.state !== 'running') return;
    const i = this.step % this.melody.length;

    // Lead melody — bright triangle pluck.
    const note = this.melody[i];
    if (note > 0) this.pluck(note, 'triangle', 0.18, this.stepMs / 1000);

    // Bouncing bass on every other step — round sine.
    if (i % 2 === 0) {
      const b = this.bass[(i / 2) % this.bass.length];
      this.pluck(b, 'sine', 0.22, (this.stepMs * 2) / 1000);
    }

    this.step++;
  }

  /** A short plucked note with a quick attack and gentle decay. */
  private pluck(freq: number, type: OscillatorType, vol: number, dur: number): void {
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(vol, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.9);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(now);
    osc.stop(now + dur);
  }

  /** A short, pleasant chime (e.g. coin pickup). */
  chime(freq = 880): void {
    if (this.muted || this.ctx.state !== 'running') return;
    this.pluck(freq, 'triangle', 0.25, 0.3);
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    this.master.gain.value = this.muted ? 0 : 0.16;
    if (!this.muted) this.start();
    return this.muted;
  }

  get isMuted(): boolean {
    return this.muted;
  }
}

// Single audio instance shared across scene restarts (avoids stacked loops).
let audio: AudioManager | undefined;

class MainScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: Record<'left' | 'right' | 'jump', Phaser.Input.Keyboard.Key>;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private coins!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private goal!: Phaser.Physics.Arcade.Image;

  private score = 0;
  private lives = 3;
  private totalCoins = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private gameEnded = false;
  private paused = false;
  private pauseText?: Phaser.GameObjects.Text;
  private invulnUntil = 0;
  private facing: 1 | -1 = 1;

  // Responsive-jump helpers (in ms). Coyote time lets you jump just after
  // walking off a ledge; the buffer lets a slightly-early press still fire.
  private static readonly COYOTE_MS = 90;
  private static readonly JUMP_BUFFER_MS = 110;
  private lastGroundedAt = -Infinity;
  private jumpPressedAt = -Infinity;
  private jumpWasDown = false;

  // On-screen touch controls (mobile). Each flag mirrors a held button.
  private touch = { left: false, right: false, jump: false };

  constructor() {
    super('main');
  }

  preload(): void {
    new TextureFactory(this).build();
  }

  create(): void {
    this.score = 0;
    this.lives = 3;
    this.gameEnded = false;
    this.paused = false;
    this.invulnUntil = 0;
    this.lastGroundedAt = -Infinity;
    this.jumpPressedAt = -Infinity;
    this.jumpWasDown = false;
    this.touch = { left: false, right: false, jump: false };

    this.physics.world.setBounds(0, 0, WORLD_WIDTH, HEIGHT);
    this.cameras.main.setBounds(0, 0, WORLD_WIDTH, HEIGHT);

    this.createBackground();
    this.createPlatforms();
    this.createPlayer();
    this.createCoins();
    this.createEnemies();
    this.createGoal();
    this.createColliders();
    this.createInput();
    this.createHud();
    this.createTouchControls();
    this.createAudio();

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setDeadzone(180, 120);
  }

  /** Create/reuse the shared audio manager, start it on first input, and add a
   *  mute toggle to the HUD. */
  private createAudio(): void {
    if (!audio) audio = new AudioManager();
    const mgr = audio;
    (window as unknown as { audio?: AudioManager }).audio = mgr;

    // Browser autoplay policy: only resume on a genuine user gesture.
    this.input.once('pointerdown', () => mgr.start());
    this.input.keyboard!.once('keydown', () => mgr.start());

    const muteBtn = this.add
      .text(WIDTH - 22, 28, mgr.isMuted ? '🔇' : '🔊', { fontSize: '26px' })
      .setOrigin(1, 0.5)
      .setScrollFactor(0)
      .setDepth(41)
      .setInteractive({ useHandCursor: true });
    muteBtn.on('pointerdown', () => {
      const muted = mgr.toggleMute();
      muteBtn.setText(muted ? '🔇' : '🔊');
    });
  }

  private createBackground(): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(COLORS.sky, COLORS.sky, COLORS.skyBottom, COLORS.skyBottom, 1);
    bg.fillRect(0, 0, WIDTH, HEIGHT);
    bg.setScrollFactor(0);

    // Parallax clouds spread across the world.
    for (let i = 0; i < 14; i++) {
      const x = 120 + i * 230 + Phaser.Math.Between(-60, 60);
      const y = Phaser.Math.Between(40, 220);
      const scale = Phaser.Math.FloatBetween(0.6, 1.3);
      this.add
        .image(x, y, 'cloud')
        .setScrollFactor(0.3)
        .setScale(scale)
        .setAlpha(0.9);
    }
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    // Ground row with gaps.
    const inGap = (x: number) =>
      LEVEL.groundGaps.some(([s, e]) => x + TILE > s && x < e);
    for (let x = 0; x < WORLD_WIDTH; x += TILE) {
      if (inGap(x)) continue;
      const tile = this.platforms.create(x + TILE / 2, HEIGHT - TILE / 2, 'ground');
      tile.refreshBody();
    }

    // Floating brick platforms.
    for (const [x, y, widthTiles] of LEVEL.platforms) {
      for (let i = 0; i < widthTiles; i++) {
        const brick = this.platforms.create(x + i * TILE, y, 'brick');
        brick.refreshBody();
      }
    }
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(80, HEIGHT - TILE - 40, 'capy-idle');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.05);
    this.player.body!.setSize(38, 28).setOffset(5, 11);

    this.anims.create({ key: 'idle', frames: [{ key: 'capy-idle' }], frameRate: 1 });
    this.anims.create({
      key: 'walk',
      frames: [{ key: 'capy-walk-a' }, { key: 'capy-idle' }, { key: 'capy-walk-b' }],
      frameRate: 10,
      repeat: -1,
    });
    this.anims.create({ key: 'jump', frames: [{ key: 'capy-jump' }], frameRate: 1 });
    this.player.play('idle');
  }

  private createCoins(): void {
    this.coins = this.physics.add.group({ allowGravity: false });
    for (const [x, y] of LEVEL.coins) {
      const coin = this.coins.create(x, y, 'coin') as Phaser.Physics.Arcade.Sprite;
      coin.setCircle(11, 5, 5);
      this.tweens.add({
        targets: coin,
        y: y - 8,
        duration: 700,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut',
        delay: Phaser.Math.Between(0, 400),
      });
    }
    this.totalCoins = LEVEL.coins.length;
  }

  private createEnemies(): void {
    this.enemies = this.physics.add.group();
    for (const [x, y, range] of LEVEL.enemies) {
      const enemy = this.enemies.create(x, y, 'enemy') as Phaser.Physics.Arcade.Sprite;
      enemy.setBounce(0);
      enemy.setCollideWorldBounds(true);
      enemy.setVelocityX(60);
      enemy.body!.setSize(32, 30).setOffset(4, 6);
      enemy.setData('originX', x);
      enemy.setData('range', range);
    }
  }

  private createGoal(): void {
    this.goal = this.physics.add.staticImage(WORLD_WIDTH - 80, HEIGHT - TILE - 48, 'flag');
    this.goal.setScale(1.4);
    this.goal.refreshBody();
    this.tweens.add({
      targets: this.goal,
      angle: { from: -2, to: 2 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });
  }

  private createColliders(): void {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this);
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this);
    this.physics.add.overlap(this.player, this.goal, this.reachGoal, undefined, this);
  }

  private createInput(): void {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.keys = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      jump: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
    this.input.keyboard!.on('keydown-R', () => this.scene.restart());
    this.input.keyboard!.on('keydown-P', () => this.togglePause());
  }

  /**
   * On-screen D-pad + jump button for touch devices. Buttons are fixed to the
   * camera (HUD layer) and feed the same movement flags as the keyboard, so
   * gameplay logic stays in one place. They are interactive on all platforms
   * (harmless with a mouse) but only shown when the device reports touch.
   */
  private createTouchControls(): void {
    // Controls live in a DOM bar BELOW the canvas (#controls in index.html),
    // not painted over the play area. Shown only on touch devices.
    const hasTouch = this.sys.game.device.input.touch;
    const bar = document.getElementById('controls');
    if (!bar) return;
    if (!hasTouch) {
      bar.style.display = 'none';
      return;
    }
    bar.style.display = 'flex';

    const bind = (id: string, set: (v: boolean) => void): void => {
      const el = document.getElementById(id);
      if (!el) return;
      const down = (e: Event) => {
        e.preventDefault();
        set(true);
        el.classList.add('active');
      };
      const up = (e: Event) => {
        e.preventDefault();
        set(false);
        el.classList.remove('active');
      };
      // Pointer events cover touch + mouse; up/cancel/leave all release.
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('pointerleave', up);
    };

    bind('btn-left', (v) => (this.touch.left = v));
    bind('btn-right', (v) => (this.touch.right = v));
    bind('btn-jump', (v) => (this.touch.jump = v));

    // Clear held buttons if the game loses focus mid-press.
    this.game.events.on(Phaser.Core.Events.BLUR, () => {
      this.touch.left = this.touch.right = this.touch.jump = false;
    });
  }

  private togglePause(): void {
    if (this.gameEnded) return;
    this.paused = !this.paused;
    if (this.paused) {
      this.physics.pause();
      this.player.anims.pause();
      this.pauseText = this.add
        .text(WIDTH / 2, HEIGHT / 2, 'PAUSED\n\npress P to resume', {
          fontFamily: 'monospace',
          fontSize: '40px',
          color: '#ffffff',
          stroke: '#000000',
          strokeThickness: 6,
          align: 'center',
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(30);
    } else {
      this.physics.resume();
      this.player.anims.resume();
      this.pauseText?.destroy();
      this.pauseText = undefined;
    }
  }

  private createHud(): void {
    // Rounded translucent panel so the HUD reads cleanly over any background.
    const panel = this.add.graphics().setScrollFactor(0).setDepth(10);
    panel.fillStyle(0x0d2b45, 0.55);
    panel.fillRoundedRect(12, 12, 230, 72, 12);
    panel.lineStyle(2, 0xffffff, 0.25);
    panel.strokeRoundedRect(12, 12, 230, 72, 12);

    const style: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#ffffff',
    };
    this.add.text(28, 24, '🪙', { fontSize: '22px' }).setScrollFactor(0).setDepth(11);
    this.add.text(28, 52, '❤️', { fontSize: '20px' }).setScrollFactor(0).setDepth(11);
    this.scoreText = this.add.text(60, 24, '', style).setScrollFactor(0).setDepth(11);
    this.livesText = this.add.text(60, 52, '', style).setScrollFactor(0).setDepth(11);
    this.updateHud();
  }

  private updateHud(): void {
    this.scoreText.setText(`${this.score} / ${this.totalCoins}`);
    this.livesText.setText(`${'♥'.repeat(Math.max(0, this.lives))}${'·'.repeat(Math.max(0, 3 - this.lives))}`);
  }

  private collectCoin: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_p, c) => {
    const coin = c as Phaser.Physics.Arcade.Sprite;
    coin.disableBody(true, true);
    this.score += 1;
    this.updateHud();
    audio?.chime(880);
  };

  private hitEnemy: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = (_p, e) => {
    if (this.gameEnded) return;
    const enemy = e as Phaser.Physics.Arcade.Sprite;
    const player = this.player;
    const stomping =
      player.body!.velocity.y > 0 && player.body!.bottom <= enemy.body!.top + 16;

    if (stomping) {
      enemy.disableBody(true, true);
      player.setVelocityY(-350);
      this.score += 2;
      this.updateHud();
      audio?.chime(660);
    } else if (this.time.now > this.invulnUntil) {
      this.loseLife();
    }
  };

  private loseLife(): void {
    this.lives -= 1;
    this.updateHud();
    this.invulnUntil = this.time.now + 1500;

    if (this.lives <= 0) {
      this.endGame('GAME OVER', '#ff5252');
      return;
    }

    // Knockback + brief blink, then respawn at the start.
    this.player.setVelocity(this.facing * -160, -260);
    this.cameras.main.shake(200, 0.01);
    this.tweens.add({
      targets: this.player,
      alpha: 0.2,
      duration: 120,
      yoyo: true,
      repeat: 5,
      onComplete: () => this.player.setAlpha(1),
    });
  }

  private reachGoal: Phaser.Types.Physics.Arcade.ArcadePhysicsCallback = () => {
    if (this.gameEnded) return;
    const bonus = this.score === this.totalCoins ? '  PERFECT!' : '';
    this.endGame(`YOU WIN!${bonus}`, '#69f0ae');
  };

  private endGame(message: string, color: string): void {
    this.gameEnded = true;
    this.player.setVelocity(0, 0);
    this.player.anims.play('idle');
    this.physics.pause();

    const cam = this.cameras.main;
    this.add
      .rectangle(cam.midPoint.x, cam.midPoint.y, WIDTH, HEIGHT, 0x000000, 0.45)
      .setScrollFactor(0)
      .setDepth(20);

    this.add
      .text(WIDTH / 2, HEIGHT / 2 - 20, message, {
        fontFamily: 'monospace',
        fontSize: '56px',
        color,
        stroke: '#000000',
        strokeThickness: 8,
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);

    this.add
      .text(WIDTH / 2, HEIGHT / 2 + 50, 'Press R to play again', {
        fontFamily: 'monospace',
        fontSize: '24px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(21);
  }

  update(time: number): void {
    if (this.gameEnded || this.paused) return;

    // Fell into a pit.
    if (this.player.y > HEIGHT + 40) {
      this.player.setPosition(80, HEIGHT - TILE - 40);
      this.player.setVelocity(0, 0);
      if (this.time.now > this.invulnUntil) this.loseLife();
      return;
    }

    const onGround = this.player.body!.blocked.down || this.player.body!.touching.down;
    if (onGround) this.lastGroundedAt = time;

    const left = this.cursors.left.isDown || this.keys.left.isDown || this.touch.left;
    const right = this.cursors.right.isDown || this.keys.right.isDown || this.touch.right;
    const jumpDown =
      this.cursors.up.isDown ||
      this.cursors.space.isDown ||
      this.keys.jump.isDown ||
      this.touch.jump;

    // Record the moment of a fresh jump press (rising edge) for buffering.
    if (jumpDown && !this.jumpWasDown) this.jumpPressedAt = time;
    this.jumpWasDown = jumpDown;

    if (left && !right) {
      this.player.setVelocityX(-200);
      this.player.setFlipX(true);
      this.facing = -1;
    } else if (right && !left) {
      this.player.setVelocityX(200);
      this.player.setFlipX(false);
      this.facing = 1;
    } else {
      this.player.setVelocityX(0);
    }

    // Jump if a recent press (buffer) coincides with recent ground contact
    // (coyote time). This makes controls feel responsive without double jumps.
    const buffered = time - this.jumpPressedAt <= MainScene.JUMP_BUFFER_MS;
    const coyote = time - this.lastGroundedAt <= MainScene.COYOTE_MS;
    if (buffered && coyote) {
      this.player.setVelocityY(-560);
      this.jumpPressedAt = -Infinity;
      this.lastGroundedAt = -Infinity;
    }

    if (!onGround) {
      this.player.anims.play('jump', true);
    } else if (left || right) {
      this.player.anims.play('walk', true);
    } else {
      this.player.anims.play('idle', true);
    }

    this.updateEnemies();
  }

  private updateEnemies(): void {
    this.enemies.children.iterate((child) => {
      const enemy = child as Phaser.Physics.Arcade.Sprite | null;
      if (!enemy || !enemy.active) return true;
      const originX = enemy.getData('originX') as number;
      const range = enemy.getData('range') as number;
      const vx = enemy.body!.velocity.x;

      if (enemy.x <= originX - range && vx <= 0) {
        enemy.setVelocityX(60);
      } else if (enemy.x >= originX + range && vx >= 0) {
        enemy.setVelocityX(-60);
      } else if (enemy.body!.blocked.left) {
        enemy.setVelocityX(60);
      } else if (enemy.body!.blocked.right) {
        enemy.setVelocityX(-60);
      }
      enemy.setFlipX(enemy.body!.velocity.x < 0);
      return true;
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#6ec6ff',
  pixelArt: false,
  // Mount inside the #game container so the canvas renders within the visible
  // page area instead of being appended to <body> below the fold. Falls back to
  // <body> if the element is absent (keeps the game robust if the shell HTML
  // changes).
  parent: document.getElementById('game') ? 'game' : undefined,
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1200 }, debug: false },
  },
  scale: {
    // FIT keeps the 4:3 play area centered and crisp; expandParent + the
    // full-viewport #game container make it auto-resize across phone, tablet
    // and desktop, and re-fit on orientation change / window resize.
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: WIDTH,
    height: HEIGHT,
    expandParent: true,
  },
  scene: [MainScene],
};

const game = new Phaser.Game(config);

// Hide the HTML pre-boot loader once the first scene is ready.
game.events.once(Phaser.Core.Events.READY, () => {
  const loader = document.getElementById('loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 500);
  }
});

// Keep the canvas matched to the viewport on resize / rotate.
window.addEventListener('resize', () => game.scale.refresh());

// Expose the instance for smoke tests / debugging.
(window as unknown as { game: Phaser.Game }).game = game;
