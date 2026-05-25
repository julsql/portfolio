import type { Scene } from "../types";
import {
  buildBossRoom,
  buildCastle,
  buildFountain,
  buildGanonRoom,
  buildOverworld,
  buildSecretCave,
  buildShop,
} from "./map";
import { SPRITES } from "./sprites";

export const OVERWORLD_ID = "overworld";
export const CASTLE_ID = "thecode-castle";
export const GANON_ID = "ganon-room";
export const CAVE_ID = "secret-cave";
export const FOUNTAIN_ID = "fairy-fountain";
export const BOSS_ID = "secret-boss-room";
export const SHOP_ID = "shop";

/**
 * Themed overworld. TheCode is a castle; the other projects are landmarks
 * scattered across the biomes, alongside rupees, an NPC, the sword pedestal
 * and two patrolling enemies. A small cave mouth in the NE mountains opens
 * onto the side quest (bow, bombs, fairy fountain, triforce piece).
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
    { x: 11, y: 11, kind: "project", ref: "speciarium" },
    { x: 16, y: 11, kind: "project", ref: "jimi" },
    { x: 6, y: 7, kind: "npc", ref: "sage" },
    { x: 3, y: 5, kind: "sword", ref: "sword" },
    {
      x: 17,
      y: 4,
      kind: "cave",
      ref: CAVE_ID,
      spawn: { x: 6, y: 8, facing: "up" },
    },
  ],
  decor: [
    { x: 2, y: 2, icon: SPRITES.cactusFlower },
    { x: 5, y: 3, icon: SPRITES.cactus },
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

/**
 * The secret boss chamber behind the heart. Ganondorf needs 6 sword hits
 * and throws fireballs (see SceneView). Recovery hearts on the side floor
 * re-spawn every visit so the fight stays survivable.
 */
const ganonRoom: Scene = {
  id: GANON_ID,
  width: 11,
  height: 8,
  tiles: buildGanonRoom(),
  heroStart: { x: 5, y: 6, facing: "up" },
  landmarks: [
    { x: 5, y: 7, kind: "exit", ref: CASTLE_ID, spawn: { x: 6, y: 1, facing: "down" } },
    { x: 1, y: 6, kind: "recoveryHeart", ref: "heart-gn-1", pickup: true },
    { x: 9, y: 6, kind: "recoveryHeart", ref: "heart-gn-2", pickup: true },
  ],
  decor: [
    { x: 1, y: 1, icon: SPRITES.fire, hazard: true },
    { x: 9, y: 1, icon: SPRITES.fire, hazard: true },
  ],
  enemies: [{ id: "ganondorf", x: 5, y: 3, random: true, hp: 6, sprites: SPRITES.ganondorf }],
};

/**
 * The secret cave: an antechamber to the side quest. Pots hide rupees and a
 * small key, two chests hand out the bow and a few bombs, the locked chest
 * holds an empty bottle, the south-east wall is bombable (reveals the
 * fountain), and the north door leads to a mini-boss guarding the triforce.
 */
const secretCave: Scene = {
  id: CAVE_ID,
  width: 13,
  height: 10,
  tiles: buildSecretCave(),
  heroStart: { x: 6, y: 8, facing: "up" },
  music: "dungeon",
  landmarks: [
    // South exit back to the overworld (right next to the cave mouth).
    { x: 6, y: 9, kind: "exit", ref: OVERWORLD_ID, spawn: { x: 17, y: 5, facing: "down" } },
    // Trove chests: bow + arrows on the left, bombs on the right, small key
    // tucked in a side alcove (needed to open the chained chest below).
    { x: 1, y: 3, kind: "chest", ref: "chest-key", drop: { kind: "smallKey" } },
    { x: 3, y: 4, kind: "chest", ref: "chest-bow", drop: { kind: "bow" } },
    { x: 9, y: 4, kind: "chest", ref: "chest-bombs", drop: { kind: "bombs", amount: 5 } },
    // Locked chest holding the empty bottle.
    { x: 6, y: 4, kind: "lockedChest", ref: "chest-bottle", drop: { kind: "bottle" } },
    // The boss door — only the boss key opens it. Sits inside the north wall.
    { x: 6, y: 0, kind: "bossDoor", ref: BOSS_ID, spawn: { x: 5, y: 6, facing: "up" } },
    // Side passage to the shop — east wall.
    { x: 12, y: 5, kind: "exit", ref: SHOP_ID, spawn: { x: 5, y: 6, facing: "up" } },
    // Side passage to the fountain — west wall.
    { x: 0, y: 5, kind: "exit", ref: FOUNTAIN_ID, spawn: { x: 5, y: 7, facing: "up" } },
  ],
  decor: [
    { x: 1, y: 1, icon: SPRITES.fire, hazard: true },
    { x: 11, y: 1, icon: SPRITES.fire, hazard: true },
  ],
  // Pots respawn every time you re-enter the cave and drop a random rupee.
  pots: [
    { id: "pot-1", x: 2, y: 7 },
    { id: "pot-2", x: 4, y: 7 },
    { id: "pot-3", x: 8, y: 7 },
    { id: "pot-4", x: 10, y: 7 },
  ],
};

/** The fairy fountain: catch a fairy with an empty bottle to bring it home. */
const fountain: Scene = {
  id: FOUNTAIN_ID,
  width: 11,
  height: 9,
  tiles: buildFountain(),
  heroStart: { x: 5, y: 7, facing: "up" },
  music: "fairy",
  landmarks: [
    { x: 5, y: 8, kind: "exit", ref: CAVE_ID, spawn: { x: 1, y: 5, facing: "right" } },
    // The basin altar — purely decorative, but bumping it triggers a sparkle.
    { x: 5, y: 3, kind: "fountain", ref: "fountain" },
    // Two fairies fluttering on the shores of the pool.
    { x: 2, y: 3, kind: "fairy", ref: "fairy-1", pickup: true },
    { x: 8, y: 3, kind: "fairy", ref: "fairy-2", pickup: true },
  ],
  decor: [],
};

/** The mini-boss room hidden behind the boss door. A monster guards the triforce. */
const bossRoom: Scene = {
  id: BOSS_ID,
  width: 11,
  height: 8,
  tiles: buildBossRoom(),
  heroStart: { x: 5, y: 6, facing: "up" },
  music: "dungeon",
  landmarks: [
    { x: 5, y: 7, kind: "exit", ref: CAVE_ID, spawn: { x: 6, y: 1, facing: "down" } },
    { x: 5, y: 1, kind: "triforce", ref: "triforce-piece", pickup: true },
  ],
  decor: [
    { x: 1, y: 1, icon: SPRITES.fire, hazard: true },
    { x: 9, y: 1, icon: SPRITES.fire, hazard: true },
  ],
  enemies: [
    {
      id: "monster",
      x: 5,
      y: 3,
      random: true,
      hp: 4,
      sprites: [SPRITES.scorpion, SPRITES.bat],
    },
  ],
};

/** The shop: a small NPC merchant peddling tools for rupees. */
const shop: Scene = {
  id: SHOP_ID,
  width: 11,
  height: 8,
  tiles: buildShop(),
  heroStart: { x: 5, y: 6, facing: "up" },
  music: "dungeon",
  landmarks: [
    { x: 5, y: 7, kind: "exit", ref: CAVE_ID, spawn: { x: 11, y: 5, facing: "left" } },
    { x: 5, y: 2, kind: "npc", ref: "merchant" },
    // Five wares — bombs, arrows and red potion restock on every visit; the
    // bottle and the boss key are one-time purchases.
    {
      x: 1,
      y: 4,
      kind: "shopItem",
      ref: "shop-bombs",
      price: 10,
      drop: { kind: "bombs", amount: 4 },
    },
    {
      x: 3,
      y: 4,
      kind: "shopItem",
      ref: "shop-arrows",
      price: 15,
      drop: { kind: "arrows", amount: 10 },
    },
    {
      x: 5,
      y: 4,
      kind: "shopItem",
      ref: "shop-potion",
      price: 30,
      drop: { kind: "potion" },
    },
    {
      x: 7,
      y: 4,
      kind: "shopItem",
      ref: "shop-bottle",
      price: 40,
      drop: { kind: "bottle" },
    },
    {
      x: 9,
      y: 4,
      kind: "shopItem",
      ref: "shop-boss-key",
      price: 30,
      drop: { kind: "bossKey" },
    },
  ],
  decor: [],
};

/** Shop refs that restock on every visit (bombs, arrows, red potion). */
export const CONSUMABLE_SHOP_REFS: ReadonlyArray<string> = [
  "shop-bombs",
  "shop-arrows",
  "shop-potion",
];

/** Recovery hearts that re-spawn each time the hero enters Ganon's room. */
export const GANON_RECOVERY_HEART_REFS: ReadonlyArray<string> = ["heart-gn-1", "heart-gn-2"];

/**
 * Fairies that live in the fountain pool. Used to keep the world's fairy
 * count steady: whenever one is consumed (auto-revive or manual potion),
 * one ref is released from the "captured" set so a fairy reappears at the
 * fountain. Two fairies always exist — bottled or fluttering.
 */
export const FAIRY_REFS: ReadonlyArray<string> = ["fairy-1", "fairy-2"];

export const SCENES: Record<string, Scene> = {
  [OVERWORLD_ID]: overworld,
  [CASTLE_ID]: castle,
  [GANON_ID]: ganonRoom,
  [CAVE_ID]: secretCave,
  [FOUNTAIN_ID]: fountain,
  [BOSS_ID]: bossRoom,
  [SHOP_ID]: shop,
};

/** Map a castle id to the scene that holds its member projects. */
export const castleSceneId = (castleId: string): string =>
  castleId === "thecode" ? CASTLE_ID : OVERWORLD_ID;
