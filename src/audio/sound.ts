/**
 * Audio engine. Every short SFX is mapped to a Zelda sample shipped under
 * public/sound/ (LOZ / LTTP rips from noproblo.dayjo.org/zeldasounds). When a
 * mapping is an array we pick a random sample each call — that lets the
 * sword swing and the footsteps cycle through small variants for a far more
 * authentic feel. Background music streams a single looping <audio> tag.
 */

type Track = "overworld" | "dungeon" | "ganon" | "fairy";
export type Sfx =
  | "step"
  | "attack"
  | "pickup"
  | "item"
  | "heart"
  | "hurt"
  | "hurtBoss"
  | "bossHit"
  | "drown"
  | "enterLair"
  | "door"
  | "burn"
  | "gameover"
  | "victory"
  | "lowHealth"
  | "cursor"
  | "select"
  | "close"
  | "bowShoot"
  | "arrowHit"
  | "bombDrop"
  | "explosion"
  | "chest"
  | "potBreak"
  | "lockedNo"
  | "unlock"
  | "buy"
  | "fairyRevive"
  | "triforceGet"
  | "enemyHit"
  | "enemyDie";

const S = "/sound";
const MUSIC: Record<Track, string> = {
  overworld: `${S}/music-overworld.mp3`,
  dungeon: `${S}/music-castle.mp3`,
  ganon: `${S}/music-ganon.wav`,
  fairy: `${S}/fairy-fountain.wav`,
};

/** A Zelda sample (or a list of variants picked at random on each call). */
const FILES: Partial<Record<Sfx, string | string[]>> = {
  // Movement — alternate two LTTP samples so successive steps don't feel
  // identical (grass-walk = soft brush, link-land = harder thump).
  step: [`${S}/lttp-grass-walk.wav`, `${S}/lttp-link-land.wav`],

  // Sword — three LTTP swing variants for randomized attacks.
  attack: [`${S}/lttp-sword-1.wav`, `${S}/lttp-sword-2.wav`, `${S}/lttp-sword-3.wav`],

  // Pickups & UI fanfares.
  pickup: `${S}/loz-get-rupee.wav`,
  heart: `${S}/loz-get-heart.wav`,
  item: `${S}/loz-fanfare.wav`,
  chest: `${S}/lttp-chest.wav`,
  buy: `${S}/lttp-chest.wav`,
  triforceGet: `${S}/loz-fanfare.wav`,
  fairyRevive: `${S}/lttp-get-fairy.wav`,

  // Combat — Link.
  hurt: `${S}/loz-link-hurt.wav`,
  hurtBoss: `${S}/lttp-link-hurt.wav`,
  drown: `${S}/lttp-link-fall.wav`,
  burn: `${S}/lttp-fire-rod.wav`,
  gameover: `${S}/loz-link-die.wav`,
  lowHealth: `${S}/loz-low-health.wav`,
  victory: `${S}/lttp-item-fanfare.wav`,

  // Combat — enemies / bosses.
  enemyHit: `${S}/loz-enemy-hit.wav`,
  enemyDie: `${S}/loz-enemy-die.wav`,
  bossHit: `${S}/lttp-boss-hit.wav`,
  potBreak: `${S}/lttp-shatter.wav`,

  // Bow & bombs.
  bowShoot: `${S}/loz-arrow.wav`,
  arrowHit: `${S}/lttp-arrow-hit.wav`,
  bombDrop: `${S}/loz-bomb-drop.wav`,
  explosion: `${S}/loz-bomb-blow.wav`,

  // Doors & secrets.
  door: `${S}/loz-stairs.wav`,
  enterLair: `${S}/loz-boss-scream.wav`,
  unlock: `${S}/loz-secret.wav`,
  lockedNo: `${S}/lttp-error.wav`,

  // Menus / dialogs.
  cursor: `${S}/lttp-menu-cursor.wav`,
  select: `${S}/lttp-menu-select.wav`,
  close: `${S}/lttp-text-done.wav`,
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
