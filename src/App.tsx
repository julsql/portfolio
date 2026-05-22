import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Hero, LandmarkRef, Project } from "./types";
import { castleSceneId, OVERWORLD_ID, SCENES } from "./data/scenes";
import { projectById } from "./data/projects";
import TitleScreen from "./components/TitleScreen";
import SceneView from "./components/SceneView";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
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

  const scene = SCENES[sceneId];

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
    }
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
            // Re-mount on scene change so the hero respawns at the right spot.
            key={sceneId}
            scene={scene}
            initialHero={spawn}
            onInteract={onInteract}
            paused={active !== null}
          />
        ) : (
          <ListView onOpen={setActive} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </div>
  );
}
