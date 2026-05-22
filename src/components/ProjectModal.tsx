import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Project, ProjectLink } from "../types";
import { sound } from "../audio/sound";
import { EXTENSION_URL, getBrowser } from "../data/browser";

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
  // The extension points to the store for the visitor's current browser.
  if (project.id === "thecode-extension") {
    const b = getBrowser();
    return [
      { kind: "store", labelKey: `ext_${b}`, url: EXTENSION_URL[b] },
      { kind: "code", labelKey: "code", url: project.repoUrl },
    ];
  }
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
  const actionsRef = useRef<HTMLDivElement>(null);

  // How many links sit on the first row (the layout can be 1 or 2 rows).
  const columns = () => {
    const btns = actionsRef.current?.querySelectorAll<HTMLElement>("a.btn");
    if (!btns || btns.length < 2) return 1;
    const top0 = btns[0].offsetTop;
    let c = 0;
    for (const b of btns) {
      if (b.offsetTop === top0) c++;
      else break;
    }
    return Math.max(c, 1);
  };

  useEffect(() => {
    const n = ordered.length;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sound.sfx("select");
        window.open(ordered[sel].url, "_blank", "noopener,noreferrer");
        return;
      }
      const cols = columns();
      let next = sel;
      if (e.key === "ArrowRight") next = Math.min(sel + 1, n - 1);
      else if (e.key === "ArrowLeft") next = Math.max(sel - 1, 0);
      else if (e.key === "ArrowDown") next = Math.min(sel + cols, n - 1);
      else if (e.key === "ArrowUp") next = Math.max(sel - cols, 0);
      else return;
      e.preventDefault();
      if (next !== sel) {
        sound.sfx("cursor");
        setSel(next);
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

        <div className="modal-actions" ref={actionsRef}>
          {ordered.length <= 2 ? (
            <div className="modal-row">{ordered.map(renderLink)}</div>
          ) : (
            <>
              <div className="modal-row">
                {links.filter((l) => l.kind !== "code").map(renderLink)}
              </div>
              <div className="modal-row">
                {links.filter((l) => l.kind === "code").map(renderLink)}
              </div>
            </>
          )}
        </div>

        <p className="modal-hint">{t("modal.keys")}</p>
      </div>
    </div>
  );
}
