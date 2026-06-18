import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { sound } from "../audio/sound";
import { SPRITES } from "../data/sprites";

export type DialogKind =
  | null
  | "sage"
  | "merchant"
  | "fountain"
  | "bossLocked"
  | "ganonLocked"
  | "needsKey"
  | "needsBottlePotion"
  | "needsBow"
  | "needsBombs"
  | "notEnoughRupees";

interface Props {
  kind: DialogKind;
  onClose: () => void;
}

const FACE: Record<NonNullable<DialogKind>, string> = {
  sage: SPRITES.npc,
  merchant: SPRITES.merchant,
  fountain: SPRITES.fountain,
  bossLocked: SPRITES.keyBoss,
  ganonLocked: SPRITES.triforcePiece,
  needsKey: SPRITES.keySmall,
  needsBottlePotion: SPRITES.potion,
  needsBow: SPRITES.bowIcon,
  needsBombs: SPRITES.bomb,
  notEnoughRupees: SPRITES.rupee.red,
};

/** A Zelda-style NPC / system text box. */
export default function DialogBox({ kind, onClose }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        e.preventDefault();
        sound.sfx("close");
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!kind) return null;

  const key = `dialog.${kind}`;

  return (
    <div
      className="dialog-overlay"
      onClick={() => {
        sound.sfx("close");
        onClose();
      }}
    >
      <div
        className="dialog-box"
        role="dialog"
        aria-label={t(`${key}.name`)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-head">
          <img className="dialog-face" src={FACE[kind]} alt="" />
          <span className="dialog-name">{t(`${key}.name`)}</span>
        </div>
        <p className="dialog-text">{t(`${key}.text`)}</p>
        <button
          className="btn btn-primary dialog-ok"
          onClick={() => {
            sound.sfx("close");
            onClose();
          }}
        >
          ▶ {t(`${key}.ok`, { defaultValue: t("npc.ok") })}
        </button>
      </div>
    </div>
  );
}
