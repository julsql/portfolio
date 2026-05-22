import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildMap } from "./data/map";
import type { Project } from "./types";
import TitleScreen from "./components/TitleScreen";
import Overworld from "./components/Overworld";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
import Hud from "./components/Hud";

type View = "map" | "list";

export default function App() {
  const { i18n } = useTranslation();
  const grid = useMemo(() => buildMap(), []);
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("map");
  const [active, setActive] = useState<Project | null>(null);

  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");

  if (!started) {
    return <TitleScreen onStart={() => setStarted(true)} onToggleLang={toggleLang} />;
  }

  return (
    <div className="screen">
      <Hud view={view} onView={setView} onToggleLang={toggleLang} />
      <main className="stage">
        {view === "map" ? (
          <Overworld grid={grid} onOpen={setActive} paused={active !== null} />
        ) : (
          <ListView onOpen={setActive} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
    </div>
  );
}
