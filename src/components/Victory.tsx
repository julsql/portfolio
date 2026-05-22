import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SPRITES } from "../data/sprites";

interface Props {
  onClose: () => void;
}

/** How long the victory screen stays locked (so spammed key presses from
 * attacking Ganondorf can't dismiss it before it's seen). */
const LOCK_MS = 3000;

/** Shown when Ganondorf is defeated: Zelda appears and thanks the player. */
export default function Victory({ onClose }: Props) {
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), LOCK_MS);
    return () => clearTimeout(timer);
  }, []);

  // Only allow dismissing once the lock has elapsed.
  useEffect(() => {
    if (!ready) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onClose]);

  return (
    <div className="victory" onClick={ready ? onClose : undefined}>
      <img className="victory-zelda" src={SPRITES.zelda} alt="Zelda" />
      <h1 className="victory-title">{t("victory.title")}</h1>
      <p className="victory-thanks">{t("victory.thanks")}</p>
      {ready && (
        <button className="btn btn-primary victory-close" onClick={onClose}>
          ★ {t("victory.close")}
        </button>
      )}
    </div>
  );
}
