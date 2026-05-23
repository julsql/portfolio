import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SPRITES } from "../data/sprites";
import { sound } from "../audio/sound";

export type Item =
  | "heart"
  | "sword"
  | "bow"
  | "arrow"
  | "bomb"
  | "smallKey"
  | "bossKey"
  | "bottle"
  | "potion"
  | "fairy"
  | "triforce";

interface Props {
  item: Item;
  onDone: () => void;
}

const IMG: Record<Item, string> = {
  heart: SPRITES.linkHeart,
  sword: SPRITES.swordStrike,
  bow: SPRITES.bow[1],
  arrow: SPRITES.arrow,
  bomb: SPRITES.bomb,
  smallKey: SPRITES.keySmall,
  bossKey: SPRITES.keyBoss,
  bottle: SPRITES.bottleEmpty,
  potion: SPRITES.potion,
  fairy: SPRITES.bottleFairy,
  triforce: SPRITES.triforcePiece,
};

/** Zelda-style "item get" celebration; auto-dismisses. */
export default function ItemGet({ item, onDone }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDone, 1600);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
        sound.sfx("close");
        onDone();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);

  return (
    <div
      className="itemget"
      onClick={() => {
        sound.sfx("close");
        onDone();
      }}
    >
      <img className="itemget-img" src={IMG[item]} alt="" />
      <p className="itemget-text">{t(`item.${item}`)}</p>
    </div>
  );
}
