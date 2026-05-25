/**
 * Audio engine. Every short SFX is mapped to an Ocarina of Time sample
 * shipped under public/sound/. When a mapping is an array we pick a random
 * sample each call — that lets footsteps (4 variants per surface), the
 * sword swing (4 attack shouts) and Link's hurts (3 variants) cycle through
 * small variants for a far more authentic Zelda feel.
 *
 * SFX play through Web Audio AudioBufferSourceNode so they fire with zero
 * decode latency once preloaded — the engine fetches and decodes every
 * sample exactly once at init() time, then schedules cheap source nodes on
 * every call. The previous `new Audio(url)` per call paid for a fresh HTTP
 * fetch + decode in production every time, which is what made every shop
 * purchase and every footstep audibly late on slow links.
 *
 * Music keeps a single looping <audio> tag (streaming a long file beats
 * decoding it whole into memory).
 *
 * Sound credits: every sample in public/sound/ comes from HelpTheWretched
 * https://noproblo.dayjo.org/zeldasounds/ — sourced from
 * The Legend of Zelda: Ocarina of Time.
 */

type Track = "overworld" | "dungeon" | "ganon" | "fairy" | "gameOver";
export type Sfx =
  // Per-surface footsteps — the caller picks the right one based on the
  // tile under Link's feet.
  | "stepGrass"
  | "stepDirt"
  | "stepSand"
  | "stepWood"
  | "stepStone"
  | "stepCarpet"
  // Combat
  | "attack"
  | "attackShout"
  | "enemyHit"
  | "enemyDie"
  | "bossHit"
  | "bowShoot"
  | "arrowHit"
  | "bombDrop"
  | "explosion"
  | "potBreak"
  | "fireballShoot"
  | "fireballBurn"
  // Link state
  | "hurt"
  | "hurtBoss"
  | "fall"
  | "drown"
  | "splash"
  | "rockPush"
  | "burn"
  | "gameover"
  | "lowHealth"
  | "victory"
  // Pickups & containers
  | "pickup"
  | "heart"
  | "heartRefill"
  | "item"
  | "chest"
  | "buy"
  | "drink"
  | "triforceGet"
  | "fairyRevive"
  // Doors & secrets
  | "unlock"
  | "puzzleSolved"
  | "door"
  | "enterLair"
  | "lockedNo"
  // UI
  | "cursor"
  | "select"
  | "close";

const S = "/sound";
const MUSIC: Record<Track, string> = {
  overworld: `${S}/music-overworld.mp3`,
  dungeon: `${S}/music-castle.mp3`,
  ganon: `${S}/music-ganon.wav`,
  fairy: `${S}/fairy-fountain.wav`,
  gameOver: `${S}/gameover.wav`,
};

/** A single sample, or a list of variants picked at random on each call. */
const FILES: Partial<Record<Sfx, string | string[]>> = {
  // Footsteps — randomized within each surface (so consecutive steps don't
  // sound identical) and selected per tile by the caller.
  stepGrass: [
    `${S}/step-grass-1.wav`,
    `${S}/step-grass-2.wav`,
    `${S}/step-grass-3.wav`,
    `${S}/step-grass-4.wav`,
  ],
  stepDirt: [
    `${S}/step-dirt-1.wav`,
    `${S}/step-dirt-2.wav`,
    `${S}/step-dirt-3.wav`,
    `${S}/step-dirt-4.wav`,
  ],
  stepSand: [`${S}/step-sand-1.wav`, `${S}/step-sand-2.wav`, `${S}/step-sand-3.wav`],
  stepWood: [`${S}/step-wood-1.wav`, `${S}/step-wood-2.wav`, `${S}/step-wood-3.wav`],
  stepStone: [`${S}/step-stone-1.wav`, `${S}/step-stone-2.wav`, `${S}/step-stone-3.wav`],
  stepCarpet: [`${S}/step-carpet-1.wav`, `${S}/step-carpet-2.wav`, `${S}/step-carpet-3.wav`],

  // Sword swing — swoosh + one of Young Link's 4 attack shouts (the shout
  // is fired alongside the swoosh by the caller).
  attack: `${S}/sword-swing.wav`,
  attackShout: [
    `${S}/attack-shout-1.wav`,
    `${S}/attack-shout-2.wav`,
    `${S}/attack-shout-3.wav`,
    `${S}/attack-shout-4.wav`,
  ],
  enemyHit: `${S}/enemy-hit.wav`,
  enemyDie: `${S}/enemy-die.wav`,
  bossHit: `${S}/boss-hit.wav`,
  bowShoot: `${S}/arrow-shoot.wav`,
  arrowHit: `${S}/arrow-hit.wav`,
  bombDrop: `${S}/bomb-drop.wav`,
  explosion: `${S}/bomb-blow.wav`,
  potBreak: `${S}/pot-shatter.wav`,
  fireballShoot: `${S}/fireball-shoot.wav`,
  fireballBurn: `${S}/fireball-burn.wav`,

  // Link state — 3 variants for each so successive hits don't repeat.
  hurt: [`${S}/link-hurt-1.wav`, `${S}/link-hurt-2.wav`, `${S}/link-hurt-3.wav`],
  hurtBoss: [`${S}/link-fall-1.wav`, `${S}/link-fall-2.wav`, `${S}/link-fall-3.wav`],
  // Tumbling into a cave / hole — the long-fall scream picked at random
  // between the two variants so successive plunges don't sound identical.
  fall: [`${S}/link-scream-1.wav`, `${S}/link-scream-2.wav`],
  drown: `${S}/link-splash.wav`,
  splash: `${S}/link-splash.wav`,
  rockPush: `${S}/rock-push.wav`,
  burn: [`${S}/link-hurt-1.wav`, `${S}/link-hurt-2.wav`, `${S}/link-hurt-3.wav`],
  gameover: `${S}/link-die.wav`,
  lowHealth: `${S}/low-health.wav`,
  victory: `${S}/fanfare-item.wav`,

  // Pickups & containers.
  pickup: `${S}/rupee.wav`,
  heart: `${S}/fanfare-heart.wav`,
  heartRefill: `${S}/heart-refill.wav`,
  item: `${S}/fanfare-item.wav`,
  chest: `${S}/fanfare-item.wav`,
  buy: `${S}/fanfare-item.wav`,
  drink: `${S}/link-drink.wav`,
  triforceGet: `${S}/fanfare-item.wav`,
  fairyRevive: `${S}/fairy.wav`,

  // Doors & secrets.
  unlock: `${S}/door-unlock.wav`,
  puzzleSolved: `${S}/puzzle-solved.wav`,
  door: `${S}/door-open.wav`,
  enterLair: `${S}/door-boss.wav`,
  lockedNo: `${S}/error.wav`,

  // UI.
  cursor: `${S}/menu-cursor.wav`,
  select: `${S}/menu-select.wav`,
  close: `${S}/dialog-done.wav`,
};

const MUSIC_VOL = 0.4;
const SFX_VOL = 0.7;

class SoundEngine {
  private muted = false;
  private music_el?: HTMLAudioElement;
  private track?: Track;
  /** Per-name audio element for SFX that need to keep playing (low-health). */
  private loops = new Map<Sfx, HTMLAudioElement>();
  private ctx?: AudioContext;
  private master?: GainNode;
  /** Decoded sample cache, keyed by URL — populated by preloadAllSfx(). */
  private buffers = new Map<string, AudioBuffer>();
  /** In-flight decode promises so concurrent callers don't fetch twice. */
  private loading = new Map<string, Promise<AudioBuffer | undefined>>();

  init() {
    if (typeof window === "undefined") return;
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 0.85;
        this.master.connect(this.ctx.destination);
        void this.ctx.resume();
        // Fire-and-forget: fetch + decode every SFX in parallel. The browser
        // honors HTTP caching, so this is a one-time cost on first visit
        // (and instant on every subsequent visit thanks to the immutable
        // Cache-Control on /sound/).
        void this.preloadAllSfx();
      }
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) this.music_el?.pause();
        else if (this.track && this.music_el && !this.muted)
          void this.music_el.play().catch(() => {});
      });
      const resume = () => void this.ctx?.resume();
      window.addEventListener("pointerdown", resume);
      window.addEventListener("keydown", resume);
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.music_el) this.music_el.muted = m;
    this.loops.forEach((el) => (el.muted = m));
    if (this.master) this.master.gain.value = m ? 0 : 0.85;
  }

  /** Start (on=true) or stop a looping SFX on top of the music. */
  loopSfx(name: Sfx, on: boolean) {
    const url = pickFile(FILES[name]);
    if (!url) return;
    let el = this.loops.get(name);
    if (on) {
      if (!el) {
        el = new Audio(url);
        el.loop = true;
        el.volume = SFX_VOL;
        el.muted = this.muted;
        this.loops.set(name, el);
      }
      if (el.paused) void el.play().catch(() => {});
    } else if (el) {
      el.pause();
      el.currentTime = 0;
    }
  }

  sfx(name: Sfx) {
    if (this.muted) return;
    const ctx = this.ctx;
    const master = this.master;
    const url = pickFile(FILES[name]);
    if (!url) return;
    // Fast path: AudioContext ready + buffer decoded → schedule a source.
    if (ctx && master) {
      void ctx.resume();
      const buf = this.buffers.get(url);
      if (buf) {
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        gain.gain.value = SFX_VOL;
        src.connect(gain).connect(master);
        src.start(0);
        return;
      }
      // Buffer not ready yet — kick off the decode for next time, fall back
      // to the HTMLAudioElement path so the SFX still fires now.
      void this.loadBuffer(url);
    }
    // Fallback for the brief window before Web Audio init / decode lands.
    const a = new Audio(url);
    a.volume = SFX_VOL;
    void a.play().catch(() => {});
  }

  /**
   * Drinking a red potion in OOT: Link gulps, then hearts refill one by one
   * with a rapid cascade of "ting" sounds. We approximate it by playing the
   * gulp, then scheduling N heart-refill tings spaced ~140ms apart.
   */
  drinkPotion() {
    if (this.muted) return;
    this.sfx("drink");
    const TINGS = 4;
    const START = 450;
    const GAP = 140;
    for (let i = 0; i < TINGS; i++) {
      setTimeout(() => this.sfx("heartRefill"), START + i * GAP);
    }
  }

  music(track: Track) {
    this.init();
    if (this.track === track && this.music_el && !this.music_el.paused) return;
    this.track = track;
    if (!this.music_el) {
      const el = new Audio();
      el.loop = true;
      el.volume = MUSIC_VOL;
      el.addEventListener("ended", () => {
        el.currentTime = 0;
        void el.play().catch(() => {});
      });
      this.music_el = el;
    }
    this.music_el.loop = true;
    this.music_el.muted = this.muted;
    this.music_el.src = MUSIC[track];
    void this.music_el.play().catch(() => {});
  }

  stopMusic() {
    this.music_el?.pause();
    this.track = undefined;
  }

  /** Fetch and decode a single SFX, caching the result. Tolerant of failures. */
  private async loadBuffer(url: string): Promise<AudioBuffer | undefined> {
    const ctx = this.ctx;
    if (!ctx) return undefined;
    const cached = this.buffers.get(url);
    if (cached) return cached;
    const inflight = this.loading.get(url);
    if (inflight) return inflight;
    const p = (async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) return undefined;
        const data = await res.arrayBuffer();
        const buf = await ctx.decodeAudioData(data);
        this.buffers.set(url, buf);
        return buf;
      } catch {
        return undefined;
      } finally {
        this.loading.delete(url);
      }
    })();
    this.loading.set(url, p);
    return p;
  }

  /** Walk the FILES map and decode every sample once. */
  private async preloadAllSfx(): Promise<void> {
    const urls = new Set<string>();
    for (const entry of Object.values(FILES)) {
      if (!entry) continue;
      if (typeof entry === "string") urls.add(entry);
      else entry.forEach((u) => urls.add(u));
    }
    await Promise.all(Array.from(urls).map((u) => this.loadBuffer(u)));
  }
}

/** Resolve a FILES entry (string or string[]) to one URL, picking at random. */
function pickFile(entry: string | string[] | undefined): string | undefined {
  if (!entry) return undefined;
  if (typeof entry === "string") return entry;
  return entry[Math.floor(Math.random() * entry.length)];
}

// Cache the engine on the global scope so HMR module reloads reuse the same
// instance (and its single <audio> element) instead of stacking a second
// background track over the old one.
const scope = (typeof window !== "undefined" ? window : globalThis) as unknown as {
  __portfolioSound?: SoundEngine;
};
export const sound: SoundEngine =
  scope.__portfolioSound ?? (scope.__portfolioSound = new SoundEngine());

/**
 * Warm the HTTP cache for the SFX that fire in the very first second of
 * play — the START click in particular has nowhere to hide: it triggers
 * sound.sfx("select") synchronously, before the AudioContext-backed
 * preload (which can only start on the user gesture) has had a chance to
 * decode anything. Fetching these files now means the `new Audio()`
 * fallback inside sfx() finds them already in browser cache and plays
 * within milliseconds instead of waiting on a network round-trip.
 */
const CRITICAL_PREFETCH = [
  `${S}/menu-select.wav`,
  `${S}/menu-cursor.wav`,
  `${S}/dialog-done.wav`,
  `${S}/error.wav`,
];
if (typeof fetch !== "undefined") {
  for (const url of CRITICAL_PREFETCH) {
    fetch(url, { cache: "force-cache" }).catch(() => {});
  }
}
