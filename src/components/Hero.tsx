import type { Hero as HeroType } from "../types";

interface Props {
  hero: HeroType;
}

/** The little pixel adventurer. CSS-drawn, faces the last movement direction. */
export default function Hero({ hero }: Props) {
  return (
    <div
      className={`hero face-${hero.facing}`}
      style={{ left: `calc(${hero.x} * var(--tile))`, top: `calc(${hero.y} * var(--tile))` }}
      aria-hidden="true"
    >
      <div className="hero-sprite">
        <span className="hero-cap" />
        <span className="hero-face" />
        <span className="hero-body" />
        <span className="hero-feet" />
      </div>
    </div>
  );
}
