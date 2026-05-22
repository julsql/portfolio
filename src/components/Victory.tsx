import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SPRITES } from "../data/sprites";

interface Props {
  onClose: () => void;
}

/** Shown when Ganondorf is defeated: Zelda appears and thanks the player. */
export default function Victory({ onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="victory" onClick={onClose}>
      <img className="victory-zelda" src={SPRITES.zelda} alt="Zelda" />
      <h1 className="victory-title">{t("victory.title")}</h1>
      <p className="victory-thanks">{t("victory.thanks")}</p>
      <button className="btn btn-primary victory-close" onClick={onClose}>
        ★ {t("victory.close")}
      </button>
    </div>
  );
}
