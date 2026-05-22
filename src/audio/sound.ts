/**
 * Tiny Web Audio chiptune engine — original synthesized music & SFX (no
 * copyrighted material). One looping melody per scene plus short blips for
 * gameplay events. Everything is generated, so there are no audio assets to
 * ship; drop your own files and swap this out if you have the rights.
 */

type Track = "overworld" | "dungeon" | "ganon";
export type Sfx =
  | "step"
  | "attack"
  | "pickup"
  | "item"
  | "heart"
  | "hurt"
  | "door"
  | "burn"
  | "gameover";

interface Pattern {
  stepMs: number;
  type: OscillatorType;
  vol: number;
  notes: number[];
  bass?: number[];
}

// Original loops (frequencies in Hz; 0 = rest) — not transcriptions.
const PATTERNS: Record<Track, Pattern> = {
  overworld: {
    stepMs: 200,
    type: "square",
    vol: 0.05,
    notes: [523, 659, 784, 659, 587, 784, 587, 523, 659, 784, 1046, 784, 587, 659, 784, 0],
    bass: [131, 131, 196, 196, 147, 147, 196, 196, 165, 165, 131, 131, 196, 196, 131, 0],
  },
  dungeon: {
    stepMs: 320,
    type: "triangle",
    vol: 0.06,
    notes: [440, 0, 523, 0, 587, 0, 440, 0, 415, 0, 523, 0, 392, 0, 440, 0],
    bass: [110, 0, 0, 0, 117, 0, 0, 0, 104, 0, 0, 0, 98, 0, 0, 0],
  },
  ganon: {
    stepMs: 360,
    type: "sawtooth",
    vol: 0.06,
    notes: [98, 0, 104, 0, 92, 0, 98, 0, 110, 0, 104, 0, 98, 0, 87, 0],
    bass: [49, 0, 0, 0, 52, 0, 0, 0, 46, 0, 0, 0, 49, 0, 0, 0],
  },
};

class SoundEngine {
  private ctx?: AudioContext;
  private master?: GainNode;
  private muted = false;
  private timer?: number;
  private track?: Track;

  init() {
    if (this.ctx || typeof window === "undefined") return;
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.85;
    this.master.connect(this.ctx.destination);

    // Browsers suspend the context on tab-switch / focus loss; resume it on
    // any interaction or when the tab becomes visible again.
    const resume = () => void this.ctx?.resume();
    window.addEventListener("pointerdown", resume);
    window.addEventListener("keydown", resume);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) resume();
    });
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.85;
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

  sfx(name: Sfx) {
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
      case "pickup":
        this.tone(880, 0.06, "square", 0.14);
        this.tone(1320, 0.08, "square", 0.14, 0.06);
        break;
      case "heart":
        [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.1, "triangle", 0.16, i * 0.08));
        break;
      case "item":
        [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.12, "square", 0.15, i * 0.1));
        break;
      case "hurt":
        this.tone(220, 0.16, "sawtooth", 0.18);
        this.tone(150, 0.2, "sawtooth", 0.16, 0.05);
        break;
      case "door":
        this.tone(180, 0.16, "square", 0.16);
        break;
      case "burn":
        this.noise(0.28, 0.12);
        break;
      case "gameover":
        [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.3, "triangle", 0.2, i * 0.24));
        break;
    }
  }

  music(track: Track) {
    this.init();
    void this.ctx?.resume();
    if (this.track === track && this.timer) return;
    this.stopMusic();
    if (!this.ctx) return;
    this.track = track;
    const cfg = PATTERNS[track];
    let i = 0;
    const tick = () => {
      this.tone(cfg.notes[i % cfg.notes.length], (cfg.stepMs / 1000) * 0.9, cfg.type, cfg.vol);
      if (cfg.bass) {
        this.tone(
          cfg.bass[i % cfg.bass.length],
          (cfg.stepMs / 1000) * 1.3,
          "triangle",
          cfg.vol * 0.7,
        );
      }
      i++;
    };
    tick();
    this.timer = window.setInterval(tick, cfg.stepMs);
  }

  stopMusic() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    this.track = undefined;
  }
}

export const sound = new SoundEngine();
