import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { SPRITES } from "../data/sprites";

export type Item = "heart" | "sword";

interface Props {
  item: Item;
  onDone: () => void;
}

const IMG: Record<Item, string> = {
  heart: SPRITES.linkHeart,
  sword: SPRITES.swordStrike,
};

/** Zelda-style "item get" celebration; auto-dismisses. */
export default function ItemGet({ item, onDone }: Props) {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDone, 1600);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Escape") onDone();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDone]);

  return (
    <div className="itemget" onClick={onDone}>
      <img className="itemget-img" src={IMG[item]} alt="" />
      <p className="itemget-text">{t(`item.${item}`)}</p>
    </div>
  );
}
