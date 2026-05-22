import type { Scene } from "../types";
import { buildCastle, buildGanonRoom, buildOverworld } from "./map";

export const OVERWORLD_ID = "overworld";
export const CASTLE_ID = "thecode-castle";
export const GANON_ID = "ganon-room";

/**
 * Themed overworld. TheCode is a castle; the other projects are landmarks
 * scattered across the biomes, alongside coins, an NPC and two enemies.
 */
const overworld: Scene = {
  id: OVERWORLD_ID,
  width: 20,
  height: 14,
  tiles: buildOverworld(),
  heroStart: { x: 10, y: 9, facing: "up" },
  landmarks: [
    { x: 10, y: 7, kind: "castle", ref: "thecode" },
    { x: 3, y: 3, kind: "project", ref: "codexio" },
    { x: 6, y: 4, kind: "project", ref: "rimbot" },
    { x: 13, y: 3, kind: "project", ref: "lilianastrade" },
    { x: 7, y: 10, kind: "project", ref: "exif-tools" },
    { x: 6, y: 11, kind: "project", ref: "speciarium" },
    { x: 12, y: 11, kind: "project", ref: "jimi" },
    { x: 8, y: 7, kind: "npc", ref: "sage" },
    { x: 10, y: 3, kind: "coin", ref: "coin-ow-1", pickup: true },
    { x: 3, y: 7, kind: "coin", ref: "coin-ow-2", pickup: true },
    { x: 16, y: 7, kind: "coin", ref: "coin-ow-3", pickup: true },
    { x: 10, y: 11, kind: "coin", ref: "coin-ow-4", pickup: true },
  ],
  decor: [
    { x: 2, y: 2, icon: "🌵" },
    { x: 5, y: 2, icon: "🌵" },
  ],
  rocks: [
    { id: "rock-1", x: 14, y: 7 },
    { id: "rock-2", x: 8, y: 9 },
  ],
  enemies: [
    { id: "bat", x: 13, y: 5, axis: "h", min: 11, max: 16, icon: "🦇" },
    { id: "scorpion", x: 4, y: 3, axis: "v", min: 2, max: 5, icon: "🦂" },
  ],
};

/**
 * Inside the TheCode castle: a throne room with one pedestal per member
 * project. The crown hides behind the throne; grabbing it reveals the door
 * to Ganon's lair (injected in App once crowned).
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
    { x: 6, y: 9, kind: "exit", ref: OVERWORLD_ID, spawn: { x: 10, y: 9, facing: "down" } },
    { x: 6, y: 1, kind: "crown", ref: "crown" },
  ],
  decor: [
    { x: 1, y: 1, icon: "🔥", hazard: true },
    { x: 11, y: 1, icon: "🔥", hazard: true },
    { x: 1, y: 8, icon: "🔥", hazard: true },
    { x: 11, y: 8, icon: "🔥", hazard: true },
  ],
};

/** The secret boss chamber behind the crown. Touching Ganon is fatal. */
const ganonRoom: Scene = {
  id: GANON_ID,
  width: 11,
  height: 8,
  tiles: buildGanonRoom(),
  heroStart: { x: 5, y: 6, facing: "up" },
  landmarks: [
    { x: 5, y: 3, kind: "ganon", ref: "ganon" },
    { x: 5, y: 7, kind: "exit", ref: CASTLE_ID, spawn: { x: 6, y: 3, facing: "down" } },
    { x: 1, y: 6, kind: "coin", ref: "coin-gn-1", pickup: true },
    { x: 9, y: 6, kind: "coin", ref: "coin-gn-2", pickup: true },
  ],
  decor: [
    { x: 1, y: 1, icon: "🔥", hazard: true },
    { x: 9, y: 1, icon: "🔥", hazard: true },
  ],
};

export const SCENES: Record<string, Scene> = {
  [OVERWORLD_ID]: overworld,
  [CASTLE_ID]: castle,
  [GANON_ID]: ganonRoom,
};

/** Map a castle id to the scene that holds its member projects. */
export const castleSceneId = (castleId: string): string =>
  castleId === "thecode" ? CASTLE_ID : OVERWORLD_ID;
