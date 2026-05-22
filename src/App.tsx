import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Hero, LandmarkRef, Project } from "./types";
import { castleSceneId, CASTLE_ID, GANON_ID, OVERWORLD_ID, SCENES } from "./data/scenes";
import { projectById } from "./data/projects";
import TitleScreen from "./components/TitleScreen";
import SceneView from "./components/SceneView";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
import DialogBox from "./components/DialogBox";
import GameOver from "./components/GameOver";
import Hud from "./components/Hud";

type View = "map" | "list";
const MAX_HEARTS = 3;

export default function App() {
  const { i18n } = useTranslation();
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("map");
  const [active, setActive] = useState<Project | null>(null);
  const [dialogue, setDialogue] = useState(false);

  // Current scene + the hero spawn to use when (re)entering it.
  const [sceneId, setSceneId] = useState(OVERWORLD_ID);
  const [spawn, setSpawn] = useState<Hero>(SCENES[OVERWORLD_ID].heroStart);
  const [runId, setRunId] = useState(0);

  // Progress / survival state.
  const [crowned, setCrowned] = useState(false);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [hearts, setHearts] = useState(MAX_HEARTS);
  const [gameOver, setGameOver] = useState(false);

  // Derive the live scene: drop grabbed crown & collected coins, and once
  // crowned reveal the door to Ganon's lair behind the throne.
  const scene = useMemo(() => {
    const base = SCENES[sceneId];
    let landmarks = base.landmarks;
    if (crowned) landmarks = landmarks.filter((l) => l.kind !== "crown");
    if (collected.size) {
      landmarks = landmarks.filter((l) => !(l.kind === "coin" && collected.has(l.ref)));
    }
    if (crowned && sceneId === CASTLE_ID) {
      landmarks = [
        ...landmarks,
        { x: 6, y: 1, kind: "door", ref: GANON_ID, spawn: SCENES[GANON_ID].heroStart },
      ];
    }
    return { ...base, landmarks };
  }, [sceneId, crowned, collected]);

  const goToScene = (id: string, where: Hero) => {
    setSpawn(where);
    setSceneId(id);
    setRunId((r) => r + 1);
  };

  const takeHit = useCallback(
    (fatal: boolean) => {
      if (fatal) {
        setHearts(0);
        return;
      }
      setHearts((h) => Math.max(h - 1, 0));
      // Knock the hero back to the start of the current scene.
      setSpawn(SCENES[sceneId].heroStart);
      setRunId((r) => r + 1);
    },
    [sceneId],
  );

  useEffect(() => {
    if (started && hearts <= 0) setGameOver(true);
  }, [started, hearts]);

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
      case "crown":
        setCrowned(true);
        break;
      case "npc":
        setDialogue(true);
        break;
      case "ganon":
        takeHit(true);
        break;
    }
  };

  const onPickup = (l: LandmarkRef) => {
    if (l.kind !== "coin" || collected.has(l.ref)) return;
    setCollected((c) => new Set(c).add(l.ref));
  };

  const retry = () => {
    setGameOver(false);
    setHearts(MAX_HEARTS);
    setSceneId(OVERWORLD_ID);
    setSpawn(SCENES[OVERWORLD_ID].heroStart);
    setRunId((r) => r + 1);
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");

  if (!started) {
    return <TitleScreen onStart={() => setStarted(true)} onToggleLang={toggleLang} />;
  }

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
            paused={active !== null || gameOver || dialogue}
            crowned={crowned}
            hearts={hearts}
            coins={collected.size}
          />
        ) : (
          <ListView onOpen={setActive} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      {dialogue && <DialogBox onClose={() => setDialogue(false)} />}
      {gameOver && <GameOver onRetry={retry} />}
    </div>
  );
}
