import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Hero, LandmarkRef, Project } from "./types";
import { castleSceneId, OVERWORLD_ID, SCENES } from "./data/scenes";
import { projectById } from "./data/projects";
import TitleScreen from "./components/TitleScreen";
import SceneView from "./components/SceneView";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
import GameOver from "./components/GameOver";
import Hud from "./components/Hud";

type View = "map" | "list";

export default function App() {
  const { i18n } = useTranslation();
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("map");
  const [active, setActive] = useState<Project | null>(null);

  // Current scene + the hero spawn to use when (re)entering it.
  const [sceneId, setSceneId] = useState(OVERWORLD_ID);
  const [spawn, setSpawn] = useState<Hero>(SCENES[OVERWORLD_ID].heroStart);
  // Easter egg: grabbing the crown in the castle changes the avatar.
  const [crowned, setCrowned] = useState(false);
  // Hazard system: burning on a fire tile ends the run.
  const [gameOver, setGameOver] = useState(false);
  // Bumping this forces SceneView to remount so the hero respawns.
  const [runId, setRunId] = useState(0);

  // Once grabbed, the crown vanishes from the room (and stays gone).
  const scene = useMemo(() => {
    const base = SCENES[sceneId];
    if (!crowned) return base;
    return { ...base, landmarks: base.landmarks.filter((l) => l.kind !== "crown") };
  }, [sceneId, crowned]);

  const goToScene = (id: string, where: Hero) => {
    setSpawn(where);
    setSceneId(id);
  };

  const onInteract = (l: LandmarkRef) => {
    if (l.kind === "project") {
      const p = projectById(l.ref);
      if (p) setActive(p);
    } else if (l.kind === "castle") {
      const target = castleSceneId(l.ref);
      goToScene(target, SCENES[target].heroStart);
    } else if (l.kind === "exit") {
      goToScene(l.ref, l.spawn ?? SCENES[l.ref].heroStart);
    } else if (l.kind === "crown") {
      setCrowned(true);
    }
  };

  const onGameOver = useCallback(() => setGameOver(true), []);

  const retry = () => {
    setGameOver(false);
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
            // Re-mount on scene change (or retry) so the hero respawns.
            key={`${sceneId}-${runId}`}
            scene={scene}
            initialHero={spawn}
            onInteract={onInteract}
            onGameOver={onGameOver}
            paused={active !== null || gameOver}
            crowned={crowned}
          />
        ) : (
          <ListView onOpen={setActive} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      {gameOver && <GameOver onRetry={retry} />}
    </div>
  );
}
