export type Category = "web" | "app" | "tool";

/** A project shown as a landmark in a scene. */
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
  /** When set, this project lives inside a castle instead of on the overworld. */
  group?: string;
  /** Live website / online demo, when deployed. */
  liveUrl?: string;
  /** Source code repository. */
  repoUrl: string;
  /** App store / Play Store link, when published. */
  storeUrl?: string;
}

/** A castle on the overworld that, once entered, reveals its member projects. */
export interface Castle {
  id: string;
  name: string;
  icon: string;
  /** Project ids displayed inside the castle. */
  memberIds: string[];
}

export type TileKind =
  | "grass"
  | "path"
  | "tree"
  | "water"
  | "sand"
  | "flower"
  | "rock"
  | "floor"
  | "wall"
  | "carpet";

export interface Hero {
  x: number;
  y: number;
  facing: "up" | "down" | "left" | "right";
}

/** Something the hero can bump into within a scene. */
export interface LandmarkRef {
  x: number;
  y: number;
  kind: "project" | "castle" | "exit";
  /** project id, castle id, or target scene id (for exits). */
  ref: string;
  /** Where the hero should spawn after an exit transition. */
  spawn?: Hero;
}

/** Purely decorative, non-interactive sprite placed on a tile. */
export interface Decor {
  x: number;
  y: number;
  icon: string;
}

export interface Scene {
  id: string;
  width: number;
  height: number;
  tiles: TileKind[][];
  heroStart: Hero;
  landmarks: LandmarkRef[];
  decor: Decor[];
}
