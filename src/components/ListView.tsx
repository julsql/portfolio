import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Project } from "../types";
import { PROJECTS } from "../data/projects";
import { sound } from "../audio/sound";
import Footer from "./Footer";

interface Props {
  onOpen: (p: Project) => void;
  /** A card modal is open — let it own the keyboard. */
  paused: boolean;
}

/** Grid of every project, navigable by mouse and keyboard (arrows + Enter). */
export default function ListView({ onOpen, paused }: Props) {
  const { t } = useTranslation();
  const gridRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState(0);

  // Number of cards per row (depends on the responsive grid width).
  const columns = () => {
    const cards = gridRef.current?.children;
    if (!cards || cards.length < 2) return 1;
    const top0 = (cards[0] as HTMLElement).offsetTop;
    let c = 0;
    for (const el of cards) {
      if ((el as HTMLElement).offsetTop === top0) c++;
      else break;
    }
    return Math.max(c, 1);
  };

  useEffect(() => {
    if (paused) return;
    const n = PROJECTS.length;
    const onKey = (e: KeyboardEvent) => {
      let next = sel;
      if (e.key === "ArrowRight") next = Math.min(sel + 1, n - 1);
      else if (e.key === "ArrowLeft") next = Math.max(sel - 1, 0);
      else if (e.key === "ArrowDown") next = Math.min(sel + columns(), n - 1);
      else if (e.key === "ArrowUp") next = Math.max(sel - columns(), 0);
      else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sound.sfx("select");
        onOpen(PROJECTS[sel]);
        return;
      } else return;
      e.preventDefault();
      if (next !== sel) sound.sfx("cursor");
      setSel(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, paused, onOpen]);

  // Keep the selected card visible.
  useEffect(() => {
    (gridRef.current?.children[sel] as HTMLElement | undefined)?.scrollIntoView({
      block: "nearest",
    });
  }, [sel]);

  return (
    <section className="list-view">
      <header className="list-head">
        <h2>{t("list.title")}</h2>
        <p>{t("list.intro")}</p>
      </header>

      <div className="card-grid" ref={gridRef}>
        {PROJECTS.map((p, i) => (
          <button
            key={p.id}
            className={`p-card cat-${p.category}${i === sel ? " sel" : ""}`}
            onClick={() => onOpen(p)}
            onMouseEnter={() => setSel(i)}
          >
            <span className="p-card-icon">{p.icon}</span>
            <span className="p-card-cat">{t(`modal.category.${p.category}`)}</span>
            <h3>{p.name}</h3>
            <p>{t(`projects.${p.id}.tagline`)}</p>
            <ul className="p-card-tech">
              {p.tech.slice(0, 3).map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <Footer />
    </section>
  );
}
