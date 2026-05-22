import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { Project } from "../types";

interface Props {
  project: Project;
  onClose: () => void;
}

const LINK_ICON: Record<string, string> = {
  live: "▶",
  demo: "▶",
  store: "⬇",
  code: "⌥",
};

export default function ProjectModal({ project, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal cat-${project.category}`}
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label={t("modal.close")}>
          ✕
        </button>

        <div className="modal-head">
          <span className="modal-icon">{project.icon}</span>
          <div>
            <span className="modal-cat">{t(`modal.category.${project.category}`)}</span>
            <h2 className="modal-title">{project.name}</h2>
            <p className="modal-tagline">{t(`projects.${project.id}.tagline`)}</p>
          </div>
        </div>

        <p className="modal-desc">{t(`projects.${project.id}.description`)}</p>

        <div className="modal-stack">
          <span className="stack-label">{t("modal.stack")}</span>
          <ul>
            {project.tech.map((tech) => (
              <li key={tech} className="badge">
                {tech}
              </li>
            ))}
          </ul>
        </div>

        <div className="modal-actions">
          {project.links ? (
            <>
              <div className="modal-row">
                {project.links
                  .filter((l) => l.kind !== "code")
                  .map((link) => (
                    <a
                      key={link.url}
                      className="btn btn-primary"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {LINK_ICON[link.kind]} {t(`modal.${link.labelKey}`)}
                    </a>
                  ))}
              </div>
              <div className="modal-row">
                {project.links
                  .filter((l) => l.kind === "code")
                  .map((link) => (
                    <a
                      key={link.url}
                      className="btn btn-ghost"
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {LINK_ICON[link.kind]} {t(`modal.${link.labelKey}`)}
                    </a>
                  ))}
              </div>
            </>
          ) : (
            <div className="modal-row">
              {project.liveUrl && (
                <a
                  className="btn btn-primary"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  ▶ {t("modal.live")}
                </a>
              )}
              {project.storeUrl && (
                <a
                  className="btn btn-primary"
                  href={project.storeUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  ⬇ {t("modal.store")}
                </a>
              )}
              <a className="btn btn-ghost" href={project.repoUrl} target="_blank" rel="noreferrer">
                ⌥ {t("modal.code")}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
