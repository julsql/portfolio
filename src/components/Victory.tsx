import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { SPRITES } from "../data/sprites";
import { sound } from "../audio/sound";

interface Props {
  onClose: () => void;
  /** When true, celebrate the Triforce piece instead of defeating Ganon. */
  triforce?: boolean;
}

/** How long the victory screen stays locked (so spammed key presses from
 * attacking Ganondorf can't dismiss it before it's seen). */
const LOCK_MS = 3000;

/** Shown when Ganondorf is defeated: Zelda appears and thanks the player. */
export default function Victory({ onClose, triforce = false }: Props) {
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
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        sound.sfx("close");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ready, onClose]);

  const titleKey = triforce ? "victory.triforce_title" : "victory.title";
  const thanksKey = triforce ? "victory.triforce_thanks" : "victory.thanks";
  const closeKey = triforce ? "victory.triforce_close" : "victory.close";
  const img = triforce ? SPRITES.linkTriforce : SPRITES.zelda;

  return (
    <div className="victory" onClick={ready ? onClose : undefined}>
      <img className="victory-zelda" src={img} alt="" />
      <h1 className="victory-title">{t(titleKey)}</h1>
      <p className="victory-thanks">{t(thanksKey)}</p>
      {/* Always rendered (reserves its space) — just hidden until unlocked,
          so nothing already on screen shifts when it appears. */}
      <button
        className={`btn btn-primary victory-close${ready ? " ready" : ""}`}
        onClick={ready ? onClose : undefined}
        disabled={!ready}
      >
        ★ {t(closeKey)}
      </button>
    </div>
  );
}
