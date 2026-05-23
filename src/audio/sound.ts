/**
 * Audio engine. Every short SFX is mapped to an Ocarina of Time sample
 * shipped under public/sound/. When a mapping is an array we pick a random
 * sample each call — that lets footsteps (4 variants per surface), the
 * sword swing (4 attack shouts) and Link's hurts (3 variants) cycle through
 * small variants for a far more authentic Zelda feel. Music streams a
 * single looping <audio> tag.
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
  // Link state
  | "hurt"
  | "hurtBoss"
  | "drown"
  | "burn"
  | "gameover"
  | "lowHealth"
  | "victory"
  // Pickups & containers
  | "pickup"
  | "heart"
  | "item"
  | "chest"
  | "buy"
  | "triforceGet"
  | "fairyRevive"
  // Doors & secrets
  | "unlock"
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

  // Link state — 3 variants for each so successive hits don't repeat.
  hurt: [`${S}/link-hurt-1.wav`, `${S}/link-hurt-2.wav`, `${S}/link-hurt-3.wav`],
  hurtBoss: [`${S}/link-fall-1.wav`, `${S}/link-fall-2.wav`, `${S}/link-fall-3.wav`],
  drown: `${S}/link-splash.wav`,
  burn: [`${S}/link-hurt-1.wav`, `${S}/link-hurt-2.wav`, `${S}/link-hurt-3.wav`],
  gameover: `${S}/link-die.wav`,
  lowHealth: `${S}/low-health.wav`,
  victory: `${S}/fanfare-item.wav`,

  // Pickups & containers.
  pickup: `${S}/rupee.wav`,
  heart: `${S}/fanfare-heart.wav`,
  item: `${S}/fanfare-item.wav`,
  chest: `${S}/chest-open.wav`,
  buy: `${S}/chest-open.wav`,
  triforceGet: `${S}/fanfare-item.wav`,
  fairyRevive: `${S}/fairy.wav`,

  // Doors & secrets.
  unlock: `${S}/door-unlock.wav`,
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
  // Web Audio is only used to unlock playback on the first gesture.
  private ctx?: AudioContext;
  private master?: GainNode;

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
    void this.ctx?.resume();
    const url = pickFile(FILES[name]);
    if (!url) return;
    const a = new Audio(url);
    a.volume = SFX_VOL;
    void a.play().catch(() => {});
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
