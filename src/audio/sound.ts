/**
 * Audio engine. Plays the project's own sound files (public/sound/) for music
 * and most effects, and falls back to a tiny Web Audio synth for the few
 * events that have no file (footsteps, sword swing, generic door, game over).
 */

type Track = "overworld" | "dungeon" | "ganon";
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
  | "select";

const S = "/sound";
const MUSIC: Record<Track, string> = {
  overworld: `${S}/music-overworld.mp3`,
  dungeon: `${S}/music-castle.mp3`,
  ganon: `${S}/music-ganon.wav`,
};
const FILES: Partial<Record<Sfx, string>> = {
  pickup: `${S}/rupee.wav`,
  item: `${S}/sword.wav`,
  heart: `${S}/heart.wav`,
  hurt: `${S}/hurt.wav`,
  hurtBoss: `${S}/hurt-boss.wav`,
  bossHit: `${S}/boss-hit.wav`,
  drown: `${S}/drown.wav`,
  enterLair: `${S}/enter-lair.wav`,
  victory: `${S}/victory.wav`,
  lowHealth: `${S}/low-health.wav`,
  gameover: `${S}/gameover.wav`,
};
const MUSIC_VOL = 0.4;
const SFX_VOL = 0.7;

class SoundEngine {
  private muted = false;
  private music_el?: HTMLAudioElement;
  private track?: Track;
  // Web Audio is only used for the synthesized fallback blips.
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
      }
      // Pause music when the tab is hidden (background timers/throttling) and
      // resume the same track when it comes back.
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
    if (this.master) this.master.gain.value = m ? 0 : 0.85;
  }

  sfx(name: Sfx) {
    if (this.muted) return;
    const url = FILES[name];
    if (url) {
      const a = new Audio(url);
      a.volume = SFX_VOL;
      void a.play().catch(() => {});
      return;
    }
    this.synth(name);
  }

  music(track: Track) {
    this.init();
    if (this.track === track && this.music_el && !this.music_el.paused) return;
    this.track = track;
    if (!this.music_el) {
      const el = new Audio();
      el.loop = true;
      el.volume = MUSIC_VOL;
      // Fallback if `loop` isn't honored: restart from the top when it ends.
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

  // ── Synth fallback (step / attack / door / burn / gameover) ───────────────
  private synth(name: Sfx) {
    this.init();
    void this.ctx?.resume();
    switch (name) {
      case "step":
        this.tone(130, 0.05, "square", 0.04);
        break;
      case "attack":
        this.tone(680, 0.07, "square", 0.16);
        this.tone(430, 0.07, "square", 0.1, 0.04);
        break;
      case "door":
        this.tone(180, 0.16, "square", 0.16);
        break;
      case "burn":
        this.noise(0.28, 0.12);
        break;
      case "cursor":
        this.tone(880, 0.04, "square", 0.12);
        break;
      case "select":
        this.tone(660, 0.04, "square", 0.14);
        this.tone(990, 0.06, "square", 0.12, 0.04);
        break;
    }
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, at = 0) {
    if (!this.ctx || !this.master || freq <= 0) return;
    const t = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(this.master);
    osc.start(t);
    osc.stop(t + dur + 0.03);
  }

  private noise(dur: number, vol: number) {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    src.connect(g).connect(this.master);
    src.start(t);
    src.stop(t + dur);
  }
}

// Cache the engine on the global scope so HMR module reloads reuse the same
// instance (and its single <audio> element) instead of stacking a second
// background track over the old one.
const scope = (typeof window !== "undefined" ? window : globalThis) as unknown as {
  __portfolioSound?: SoundEngine;
};
export const sound: SoundEngine =
  scope.__portfolioSound ?? (scope.__portfolioSound = new SoundEngine());
