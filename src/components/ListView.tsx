import { useTranslation } from "react-i18next";
import type { Project } from "../types";
import { PROJECTS } from "../data/projects";

interface Props {
  onOpen: (p: Project) => void;
}

/** Accessible / mobile-friendly grid of every project — also good for SEO. */
export default function ListView({ onOpen }: Props) {
  const { t } = useTranslation();
  return (
    <section className="list-view">
      <header className="list-head">
        <h2>{t("list.title")}</h2>
        <p>{t("list.intro")}</p>
      </header>

      <div className="card-grid">
        {PROJECTS.map((p) => (
          <button key={p.id} className={`p-card cat-${p.category}`} onClick={() => onOpen(p)}>
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
    </section>
  );
}
