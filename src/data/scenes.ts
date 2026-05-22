import type { Scene } from "../types";
import { buildCastle, buildOverworld } from "./map";

export const OVERWORLD_ID = "overworld";
export const CASTLE_ID = "thecode-castle";

/**
 * The open-air overworld. TheCode is a castle (entered to reveal its
 * member projects); everything else is a standalone project landmark.
 */
const overworld: Scene = {
  id: OVERWORLD_ID,
  width: 20,
  height: 14,
  tiles: buildOverworld(),
  heroStart: { x: 9, y: 9, facing: "up" },
  landmarks: [
    { x: 3, y: 2, kind: "project", ref: "codexio" },
    { x: 6, y: 2, kind: "project", ref: "rimbot" },
    { x: 9, y: 2, kind: "castle", ref: "thecode" },
    { x: 12, y: 2, kind: "project", ref: "speciarium" },
    { x: 16, y: 2, kind: "project", ref: "lilianastrade" },
    { x: 16, y: 6, kind: "project", ref: "jimi" },
    { x: 6, y: 11, kind: "project", ref: "exif-tools" },
  ],
  decor: [],
};

/**
 * Inside the TheCode castle: a throne room where each member project sits on
 * a pedestal. The door at the bottom returns to the overworld, just south of
 * the castle gate.
 */
const castle: Scene = {
  id: CASTLE_ID,
  width: 13,
  height: 10,
  tiles: buildCastle(),
  heroStart: { x: 6, y: 8, facing: "up" },
  landmarks: [
    { x: 6, y: 2, kind: "project", ref: "thecode-website" },
    { x: 3, y: 4, kind: "project", ref: "thecode-extension" },
    { x: 9, y: 4, kind: "project", ref: "thecode-apple" },
    { x: 3, y: 6, kind: "project", ref: "thecode-android" },
    { x: 9, y: 6, kind: "project", ref: "thecode-cli" },
    { x: 6, y: 9, kind: "exit", ref: OVERWORLD_ID, spawn: { x: 9, y: 3, facing: "down" } },
    { x: 3, y: 2, kind: "crown", ref: "crown" },
  ],
  decor: [
    { x: 1, y: 1, icon: "🔥" },
    { x: 11, y: 1, icon: "🔥" },
    { x: 1, y: 8, icon: "🔥" },
    { x: 11, y: 8, icon: "🔥" },
  ],
};

export const SCENES: Record<string, Scene> = {
  [OVERWORLD_ID]: overworld,
  [CASTLE_ID]: castle,
};

/** Map a castle id to the scene that holds its member projects. */
export const castleSceneId = (castleId: string): string =>
  castleId === "thecode" ? CASTLE_ID : OVERWORLD_ID;
