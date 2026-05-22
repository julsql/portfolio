import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Hero, LandmarkRef, Project } from "./types";
import { castleSceneId, CASTLE_ID, GANON_ID, OVERWORLD_ID, SCENES } from "./data/scenes";
import { projectById } from "./data/projects";
import { RUPEE_VALUE } from "./data/sprites";
import TitleScreen from "./components/TitleScreen";
import SceneView from "./components/SceneView";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
import DialogBox from "./components/DialogBox";
import ItemGet, { type Item } from "./components/ItemGet";
import GameOver from "./components/GameOver";
import Hud from "./components/Hud";

type View = "map" | "list";
const MAX_HEALTH = 6; // 3 hearts × 2 half-units
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
  const [health, setHealth] = useState(MAX_HEALTH);
  const [invuln, setInvuln] = useState(false);
  const invulnRef = useRef(false);
  const [gameOver, setGameOver] = useState(false);

  // Live scene: drop the grabbed heart, the taken sword and collected rupees;
  // once the heart is taken, reveal the door to Ganon's lair behind the throne.
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
    return { ...base, landmarks };
  }, [sceneId, heartTaken, hasSword, collected]);

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
  }, [started, health]);

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
      case "heart":
        setHeartTaken(true);
        setHealth((h) => Math.min(h + 2, MAX_HEALTH));
        setItemGet("heart");
        break;
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

  const retry = () => {
    setGameOver(false);
    setHealth(MAX_HEALTH);
    invulnRef.current = false;
    setInvuln(false);
    setSceneId(OVERWORLD_ID);
    setSpawn(SCENES[OVERWORLD_ID].heroStart);
    setRunId((r) => r + 1);
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");

  if (!started) {
    return <TitleScreen onStart={() => setStarted(true)} onToggleLang={toggleLang} />;
  }

  const paused = active !== null || gameOver || dialogue || itemGet !== null;

  return (
    <div className="screen">
      <Hud view={view} onView={setView} onToggleLang={toggleLang} />
      <main className="stage">
        {view === "map" ? (
          <SceneView
            key={`${sceneId}-${runId}`}
            scene={scene}
            initialHero={spawn}
            onInteract={onInteract}
            onPickup={onPickup}
            onHit={takeHit}
            paused={paused}
            hasSword={hasSword}
            health={health}
            rupees={rupees}
            invulnerable={invuln}
          />
        ) : (
          <ListView onOpen={setActive} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      {dialogue && <DialogBox onClose={() => setDialogue(false)} />}
      {itemGet && <ItemGet item={itemGet} onDone={() => setItemGet(null)} />}
      {gameOver && <GameOver onRetry={retry} />}
    </div>
  );
}
