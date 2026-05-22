export type Category = "web" | "app" | "tool";

/** A project shown as a landmark in the overworld. */
export interface Project {
  /** Stable id, also used as the i18n key for name/description. */
  id: string;
  /** Display name (not translated — proper nouns). */
  name: string;
  category: Category;
  /** Emoji rendered on the landmark tile. */
  icon: string;
  /** Tech stack badges. */
  tech: string[];
  /** Position on the tile map (column, row). */
  pos: { x: number; y: number };
  /** Live website / online demo, when deployed. */
  liveUrl?: string;
  /** Source code repository. */
  repoUrl: string;
  /** App store / Play Store link, when published. */
  storeUrl?: string;
}

export type TileKind = "grass" | "path" | "tree" | "water" | "sand" | "flower" | "rock";

export interface Hero {
  x: number;
  y: number;
  facing: "up" | "down" | "left" | "right";
}
