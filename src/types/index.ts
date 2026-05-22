export type Category = "web" | "app" | "tool";

/** One action button in a project modal. */
export interface ProjectLink {
  kind: "live" | "demo" | "store" | "code";
  /** i18n key under `modal.*` for the button label. */
  labelKey: string;
  url: string;
}

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
  /** Explicit list of action buttons; overrides liveUrl/storeUrl/repoUrl when set. */
  links?: ProjectLink[];
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
  kind: "project" | "castle" | "exit" | "crown";
  /** project id, castle id, target scene id (for exits), or "crown". */
  ref: string;
  /** Where the hero should spawn after an exit transition. */
  spawn?: Hero;
}

/** Decorative sprite placed on a tile. When `hazard`, standing on it burns. */
export interface Decor {
  x: number;
  y: number;
  icon: string;
  /** Standing on this tile too long triggers a game over (e.g. fire). */
  hazard?: boolean;
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
