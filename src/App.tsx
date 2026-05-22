import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Hero, LandmarkRef, Project } from "./types";
import { castleSceneId, CASTLE_ID, GANON_ID, OVERWORLD_ID, SCENES } from "./data/scenes";
import { projectById } from "./data/projects";
import { RUPEE_VALUE } from "./data/sprites";
import { transposeHero, transposeScene } from "./data/transpose";
import { sound } from "./audio/sound";
import TitleScreen from "./components/TitleScreen";
import SceneView from "./components/SceneView";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
import DialogBox from "./components/DialogBox";
import ItemGet, { type Item } from "./components/ItemGet";
import GameOver from "./components/GameOver";
import Victory from "./components/Victory";
import Hud from "./components/Hud";

type View = "map" | "list";
const START_HEALTH = 6; // 3 hearts × 2 half-units
const INVULN_MS = 800;

export default function App() {
  const { i18n } = useTranslation();
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("map");
  const [active, setActive] = useState<Project | null>(null);
  const [dialogue, setDialogue] = useState(false);
  const [itemGet, setItemGet] = useState<Item | null>(null);

  const [sceneId, setSceneId] = useState(OVERWORLD_ID);
  const [spawn, setSpawn] = useState<Hero>(SCENES[OVERWORLD_ID].heroStart);
  const [runId, setRunId] = useState(0);

  // Progress / survival.
  const [heartTaken, setHeartTaken] = useState(false);
  const [hasSword, setHasSword] = useState(false);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [rupees, setRupees] = useState(0);
  const [maxHealth, setMaxHealth] = useState(START_HEALTH);
  const [health, setHealth] = useState(START_HEALTH);
  const [invuln, setInvuln] = useState(false);
  const invulnRef = useRef(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [muted, setMuted] = useState(false);

  // Portrait windows get a transposed (taller-than-wide) map.
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const onChange = () => setPortrait(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Live scene: drop the grabbed heart, the taken sword and collected rupees;
  // once the heart is taken, reveal the door to Ganon's lair behind the throne.
  // In portrait, transpose the whole scene so it fits a tall window.
  const scene = useMemo(() => {
    const base = SCENES[sceneId];
    let landmarks = base.landmarks;
    if (heartTaken) landmarks = landmarks.filter((l) => l.kind !== "heart");
    if (hasSword) landmarks = landmarks.filter((l) => l.kind !== "sword");
    if (collected.size) {
      landmarks = landmarks.filter((l) => !(l.kind === "rupee" && collected.has(l.ref)));
    }
    if (heartTaken && sceneId === CASTLE_ID) {
      landmarks = [
        ...landmarks,
        { x: 6, y: 1, kind: "door", ref: GANON_ID, spawn: SCENES[GANON_ID].heroStart },
      ];
    }
    const built = { ...base, landmarks };
    return portrait ? transposeScene(built) : built;
  }, [sceneId, heartTaken, hasSword, collected, portrait]);

  const goToScene = (id: string, where: Hero) => {
    setSpawn(where);
    setSceneId(id);
    setRunId((r) => r + 1);
  };

  // A single half-heart of damage, with a brief invulnerability window.
  const takeHit = useCallback(() => {
    if (invulnRef.current) return;
    invulnRef.current = true;
    setInvuln(true);
    setTimeout(() => {
      invulnRef.current = false;
      setInvuln(false);
    }, INVULN_MS);
    setHealth((h) => Math.max(h - 1, 0));
  }, []);

  useEffect(() => {
    if (started && health <= 0) setGameOver(true);
    // Warn when down to the last full heart.
    else if (started && health === 2) sound.sfx("lowHealth");
  }, [started, health]);

  const onBossDefeated = useCallback(() => {
    sound.stopMusic();
    sound.sfx("victory");
    setVictory(true);
  }, []);

  // Background music follows the current scene.
  useEffect(() => {
    if (!started || gameOver) return;
    sound.music(sceneId === GANON_ID ? "ganon" : sceneId === CASTLE_ID ? "dungeon" : "overworld");
  }, [started, sceneId, gameOver]);

  useEffect(() => sound.setMuted(muted), [muted]);

  // Global keyboard shortcuts: Tab = Map/List, s = sound, l = language.
  useEffect(() => {
    if (!started) return;
    const overlayOpen = active !== null || dialogue || itemGet !== null || gameOver || victory;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (!overlayOpen) setView((v) => (v === "map" ? "list" : "map"));
      } else if (e.key === "m" || e.key === "M") {
        setMuted((m) => !m);
      } else if (e.key === "l" || e.key === "L") {
        i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, active, dialogue, itemGet, gameOver, victory, i18n]);

  useEffect(() => {
    if (gameOver) {
      sound.stopMusic();
      sound.sfx("gameover");
    }
  }, [gameOver]);

  const onInteract = (l: LandmarkRef) => {
    switch (l.kind) {
      case "project": {
        const p = projectById(l.ref);
        if (p) setActive(p);
        break;
      }
      case "castle": {
        const target = castleSceneId(l.ref);
        goToScene(target, SCENES[target].heroStart);
        break;
      }
      case "exit":
      case "door":
        goToScene(l.ref, l.spawn ?? SCENES[l.ref].heroStart);
        break;
      case "npc":
        setDialogue(true);
        break;
      case "heart": {
        // A heart container: one more heart AND a full refill.
        setHeartTaken(true);
        const next = maxHealth + 2;
        setMaxHealth(next);
        setHealth(next);
        setItemGet("heart");
        break;
      }
      case "sword":
        setHasSword(true);
        setItemGet("sword");
        break;
    }
  };

  const onPickup = (l: LandmarkRef) => {
    if (l.kind !== "rupee" || collected.has(l.ref)) return;
    setCollected((c) => new Set(c).add(l.ref));
    setRupees((n) => n + RUPEE_VALUE[l.rupee ?? "green"]);
  };

  // Game over wipes all progress — start a fresh run.
  const retry = () => {
    setGameOver(false);
    setVictory(false);
    setActive(null);
    setDialogue(false);
    setItemGet(null);
    setHasSword(false);
    setHeartTaken(false);
    setCollected(new Set());
    setRupees(0);
    setMaxHealth(START_HEALTH);
    setHealth(START_HEALTH);
    invulnRef.current = false;
    setInvuln(false);
    setSceneId(OVERWORLD_ID);
    setSpawn(SCENES[OVERWORLD_ID].heroStart);
    setRunId((r) => r + 1);
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");

  // Audio must be unlocked by a user gesture, so init + start music on START.
  const start = () => {
    sound.init();
    sound.music("overworld");
    setStarted(true);
  };

  if (!started) {
    return (
      <TitleScreen
        onStart={start}
        onToggleLang={toggleLang}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
    );
  }

  const paused = active !== null || gameOver || dialogue || itemGet !== null || victory;

  return (
    <div className="screen">
      <Hud
        view={view}
        onView={setView}
        onToggleLang={toggleLang}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
      <main className="stage">
        {view === "map" ? (
          <SceneView
            key={`${sceneId}-${runId}-${portrait ? "p" : "l"}`}
            scene={scene}
            initialHero={portrait ? transposeHero(spawn) : spawn}
            onInteract={onInteract}
            onPickup={onPickup}
            onHit={takeHit}
            onBossDefeated={onBossDefeated}
            paused={paused}
            hasSword={hasSword}
            health={health}
            maxHearts={maxHealth / 2}
            rupees={rupees}
            invulnerable={invuln}
          />
        ) : (
          <ListView onOpen={setActive} paused={active !== null} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      {dialogue && <DialogBox onClose={() => setDialogue(false)} />}
      {itemGet && <ItemGet item={itemGet} onDone={() => setItemGet(null)} />}
      {gameOver && <GameOver onRetry={retry} />}
      {victory && (
        <Victory
          onClose={() => {
            setVictory(false);
            sound.music(sceneId === GANON_ID ? "ganon" : "overworld");
          }}
        />
      )}
    </div>
  );
}
