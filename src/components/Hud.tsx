import { useTranslation } from "react-i18next";

type View = "map" | "list";

interface Props {
  view: View;
  onView: (v: View) => void;
  onToggleLang: () => void;
}

export default function Hud({ view, onView, onToggleLang }: Props) {
  const { t } = useTranslation();
  return (
    <header className="hud">
      <div className="hud-brand">
        <span className="hud-tri" aria-hidden="true" />
        <span className="hud-name">{t("title")}</span>
        <span className="hud-sub">{t("subtitle")}</span>
      </div>

      <nav className="hud-controls">
        <div className="seg">
          <button
            className={view === "map" ? "seg-btn active" : "seg-btn"}
            onClick={() => onView("map")}
          >
            🗺️ {t("hud.view_map")}
          </button>
          <button
            className={view === "list" ? "seg-btn active" : "seg-btn"}
            onClick={() => onView("list")}
          >
            📜 {t("hud.view_list")}
          </button>
        </div>
        <button className="lang-btn" onClick={onToggleLang}>
          {t("hud.lang")}
        </button>
      </nav>
    </header>
  );
}
