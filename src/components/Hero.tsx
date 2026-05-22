import type { Hero as HeroType } from "../types";
import { linkFrame, SPRITES } from "../data/sprites";

interface Props {
  hero: HeroType;
  frame: 1 | 2;
  hasSword: boolean;
  attacking: boolean;
  burning: boolean;
  invulnerable: boolean;
}

/**
 * Link, drawn from the pixel sprites. Walking alternates between frame 1 and 2;
 * while attacking he switches to the swordless skin and the strike sprite
 * appears in the facing direction.
 */
export default function Hero({ hero, frame, hasSword, attacking, burning, invulnerable }: Props) {
  const showSword = hasSword && !attacking;
  const cls = [
    "hero",
    `face-${hero.facing}`,
    attacking ? "attacking" : "",
    invulnerable ? "invuln" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      style={{ left: `calc(${hero.x} * var(--tile))`, top: `calc(${hero.y} * var(--tile))` }}
      aria-hidden="true"
    >
      {attacking && (
        <img className={`strike strike-${hero.facing}`} src={SPRITES.swordStrike} alt="" />
      )}
      {burning && <img className="hero-flame" src={SPRITES.fire} alt="" />}
      <img className="hero-img" src={linkFrame(hero.facing, frame, showSword)} alt="" />
    </div>
  );
}
