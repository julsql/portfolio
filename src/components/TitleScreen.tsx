import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onStart: () => void;
  onToggleLang: () => void;
  muted: boolean;
  onToggleMute: () => void;
}

export default function TitleScreen({ onStart, onToggleLang, muted, onToggleMute }: Props) {
  const { t } = useTranslation();

  // Enter / Space start the game from anywhere on the title screen.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onStart();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onStart]);

  return (
    <div className="title-screen" onClick={onStart} role="button" tabIndex={0}>
      <div className="title-controls">
        <button
          className="lang-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          aria-label={t("hud.sound")}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button
          className="lang-btn"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLang();
          }}
        >
          {t("hud.lang")}
        </button>
      </div>

      <div className="triforce">
        <span />
        <span />
        <span />
      </div>

      <h1 className="title-main">{t("title")}</h1>
      <p className="title-sub">{t("subtitle")}</p>

      <p className="press-start blink">{t("press_start")}</p>
    </div>
  );
}
