import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onRetry: () => void;
}

export default function GameOver({ onRetry }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onRetry();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onRetry]);

  return (
    <div className="gameover" role="alertdialog" aria-label={t("gameover.title")}>
      <h1 className="gameover-title">{t("gameover.title")}</h1>
      <p className="gameover-msg">🔥 {t("gameover.burned")}</p>
      <button className="btn btn-primary gameover-retry" onClick={onRetry}>
        ⟳ {t("gameover.retry")}
      </button>
    </div>
  );
}
