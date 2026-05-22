import type { Scene } from "../types";
import { buildCastle, buildGanonRoom, buildOverworld } from "./map";
import { SPRITES } from "./sprites";

export const OVERWORLD_ID = "overworld";
export const CASTLE_ID = "thecode-castle";
export const GANON_ID = "ganon-room";

/**
 * Themed overworld. TheCode is a castle; the other projects are landmarks
 * scattered across the biomes, alongside rupees, an NPC, the sword pedestal
 * and two patrolling enemies.
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
    { x: 6, y: 7, kind: "npc", ref: "sage" },
    { x: 3, y: 5, kind: "sword", ref: "sword" },
    { x: 10, y: 3, kind: "rupee", ref: "rupee-ow-1", pickup: true, rupee: "green" },
    { x: 3, y: 7, kind: "rupee", ref: "rupee-ow-2", pickup: true, rupee: "blue" },
    { x: 16, y: 7, kind: "rupee", ref: "rupee-ow-3", pickup: true, rupee: "red" },
    { x: 10, y: 11, kind: "rupee", ref: "rupee-ow-4", pickup: true, rupee: "green" },
  ],
  decor: [
    { x: 2, y: 2, icon: SPRITES.cactusFlower },
    { x: 5, y: 2, icon: SPRITES.cactus },
    { x: 8, y: 3, icon: SPRITES.cactusFlower },
  ],
  rocks: [
    { id: "rock-1", x: 14, y: 7 },
    { id: "rock-2", x: 8, y: 9 },
  ],
  enemies: [
    { id: "bat", x: 13, y: 5, axis: "h", min: 11, max: 16, sprites: [SPRITES.bat] },
    { id: "scorpion", x: 8, y: 3, axis: "v", min: 2, max: 5, sprites: [SPRITES.scorpion] },
  ],
};

/**
 * Inside the TheCode castle: one pedestal per member project. A heart hides
 * behind the throne; grabbing it heals you and reveals the door to Ganon's
 * lair (injected in App once taken).
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
    { x: 6, y: 1, kind: "heart", ref: "heart" },
  ],
  decor: [
    { x: 1, y: 1, icon: SPRITES.fire, hazard: true },
    { x: 11, y: 1, icon: SPRITES.fire, hazard: true },
    { x: 1, y: 8, icon: SPRITES.fire, hazard: true },
    { x: 11, y: 8, icon: SPRITES.fire, hazard: true },
  ],
};

/** The secret boss chamber behind the heart. Ganondorf needs 3 sword hits. */
const ganonRoom: Scene = {
  id: GANON_ID,
  width: 11,
  height: 8,
  tiles: buildGanonRoom(),
  heroStart: { x: 5, y: 6, facing: "up" },
  landmarks: [
    { x: 5, y: 7, kind: "exit", ref: CASTLE_ID, spawn: { x: 6, y: 3, facing: "down" } },
    { x: 1, y: 6, kind: "rupee", ref: "rupee-gn-1", pickup: true, rupee: "blue" },
    { x: 9, y: 6, kind: "rupee", ref: "rupee-gn-2", pickup: true, rupee: "red" },
  ],
  decor: [
    { x: 1, y: 1, icon: SPRITES.fire, hazard: true },
    { x: 9, y: 1, icon: SPRITES.fire, hazard: true },
  ],
  enemies: [{ id: "ganondorf", x: 5, y: 3, random: true, hp: 3, sprites: SPRITES.ganondorf }],
};

export const SCENES: Record<string, Scene> = {
  [OVERWORLD_ID]: overworld,
  [CASTLE_ID]: castle,
  [GANON_ID]: ganonRoom,
};

/** Map a castle id to the scene that holds its member projects. */
export const castleSceneId = (castleId: string): string =>
  castleId === "thecode" ? CASTLE_ID : OVERWORLD_ID;
