import type { Hero as HeroType } from "../types";

interface Props {
  hero: HeroType;
  crowned: boolean;
}

/** The little pixel adventurer. CSS-drawn, faces the last movement direction. */
export default function Hero({ hero, crowned }: Props) {
  return (
    <div
      className={`hero face-${hero.facing}${crowned ? " crowned" : ""}`}
      style={{ left: `calc(${hero.x} * var(--tile))`, top: `calc(${hero.y} * var(--tile))` }}
      aria-hidden="true"
    >
      <div className="hero-sprite">
        {crowned && <span className="hero-crown">👑</span>}
        <span className="hero-cap" />
        <span className="hero-face" />
        <span className="hero-body" />
        <span className="hero-feet" />
      </div>
    </div>
  );
}
