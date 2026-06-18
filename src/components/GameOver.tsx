import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { sound } from "../audio/sound";

interface Props {
  onRetry: () => void;
}

// Like the NES original, the player can't skip past the Game Over screen
// straight away: input stays locked long enough to read the panel and let the
// dirge play, so a fast key-mash on death doesn't blow through it unseen.
export const GAMEOVER_LOCKOUT_MS = 2500;

export default function GameOver({ onRetry }: Props) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setReady(true), GAMEOVER_LOCKOUT_MS);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        sound.sfx("select");
        onRetry();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onRetry]);

  return (
    <div className="gameover" role="alertdialog" aria-label={t("gameover.title")}>
      <h1 className="gameover-title">{t("gameover.title")}</h1>
      <p className="gameover-msg">🔥 {t("gameover.burned")}</p>
      <button
        className="btn btn-primary gameover-retry"
        onClick={onRetry}
        disabled={!ready}
      >
        ⟳ {t("gameover.retry")}
      </button>
    </div>
  );
}
