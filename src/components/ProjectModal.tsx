import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Project, ProjectLink } from "../types";
import { sound } from "../audio/sound";

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

function projectLinks(project: Project): ProjectLink[] {
  if (project.links) return project.links;
  const links: ProjectLink[] = [];
  if (project.liveUrl) links.push({ kind: "live", labelKey: "live", url: project.liveUrl });
  if (project.storeUrl) links.push({ kind: "store", labelKey: "store", url: project.storeUrl });
  links.push({ kind: "code", labelKey: "code", url: project.repoUrl });
  return links;
}

export default function ProjectModal({ project, onClose }: Props) {
  const { t } = useTranslation();

  // Ordered links: primary (live/demo/store) first, then code — this is the
  // order arrow-key selection walks through.
  const links = useMemo(() => projectLinks(project), [project]);
  const ordered = useMemo(
    () => [...links.filter((l) => l.kind !== "code"), ...links.filter((l) => l.kind === "code")],
    [links],
  );
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const n = ordered.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        sound.sfx("cursor");
        setSel((s) => (s + 1) % n);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        sound.sfx("cursor");
        setSel((s) => (s - 1 + n) % n);
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        window.open(ordered[sel].url, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ordered, sel, onClose]);

  const renderLink = (link: ProjectLink) => {
    const i = ordered.indexOf(link);
    const base = link.kind === "code" ? "btn btn-ghost" : "btn btn-primary";
    return (
      <a
        key={link.url}
        className={`${base}${i === sel ? " sel" : ""}`}
        href={link.url}
        target="_blank"
        rel="noreferrer"
        onMouseEnter={() => setSel(i)}
      >
        {LINK_ICON[link.kind]} {t(`modal.${link.labelKey}`)}
      </a>
    );
  };

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
          <div className="modal-row">{links.filter((l) => l.kind !== "code").map(renderLink)}</div>
          <div className="modal-row">{links.filter((l) => l.kind === "code").map(renderLink)}</div>
        </div>

        <p className="modal-hint">{t("modal.keys")}</p>
      </div>
    </div>
  );
}
