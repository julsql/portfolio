import { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface Props {
  onClose: () => void;
}

/** A Zelda-style NPC text box. */
export default function DialogBox({ onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div
        className="dialog-box"
        role="dialog"
        aria-label={t("npc.name")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head">
          <span className="dialog-face">🧙</span>
          <span className="dialog-name">{t("npc.name")}</span>
        </div>
        <p className="dialog-text">{t("npc.hint")}</p>
        <button className="btn btn-primary dialog-ok" onClick={onClose}>
          ▶ {t("npc.ok")}
        </button>
      </div>
    </div>
  );
}
