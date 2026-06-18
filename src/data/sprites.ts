const B = "/sprites";

export type Dir = "up" | "down" | "left" | "right";
export type RupeeColor = "red" | "blue" | "green";

export const RUPEE_VALUE: Record<RupeeColor, number> = { red: 20, blue: 5, green: 1 };

export const SPRITES = {
  swordPedestal: `${B}/sword-pedestal.png`,
  swordStrike: `${B}/sword-strike.png`,
  mountain: `${B}/mountain.png`,
  cactus: `${B}/cactus.png`,
  cactusFlower: `${B}/cactus-flower.png`,
  rock: `${B}/pierre.png`,
  fire: `${B}/fire.svg`,
  tree: `${B}/tree.svg`,
  bat: `${B}/bat.png`,
  scorpion: `${B}/scorpion.png`,
  linkHeart: `${B}/link-heart.svg`,
  linkTriforce: `${B}/link-triforce.png`,
  zelda: `${B}/zelda.png`,
  npc: `${B}/npc.png`,
  merchant: `${B}/merchant.png`,
  castle: `${B}/castle.png`,
  doorDungeon: `${B}/door-dungeon.png`,
  doorDungeonOpen: `${B}/door-dungeon-open.png`,
  doorOpen: `${B}/door-open.png`,
  doorBossLocked: `${B}/door-boss-locked.png`,
  ladder: `${B}/ladder.svg`,
  heart: {
    full: `${B}/heart-full.png`,
    half: `${B}/heart-half.png`,
    empty: `${B}/heart-empty.png`,
  },
  rupee: {
    red: `${B}/rupee-red.svg`,
    blue: `${B}/rupee-blue.svg`,
    green: `${B}/rupee-green.svg`,
  } as Record<RupeeColor, string>,
  ganondorf: [`${B}/ganondorf-1.png`, `${B}/ganondorf-2.png`, `${B}/ganondorf-3.png`],

  // ── New items, props and scene assets ───────────────────────────────────
  arrow: `${B}/arrow.svg`,
  bow: [`${B}/bow-1.svg`, `${B}/bow-2.svg`, `${B}/bow-3.svg`, `${B}/bow-4.svg`],
  bowIcon: `${B}/bow.png`,
  bomb: `${B}/bomb.png`,
  explosion: `${B}/explosion.svg`,
  bottleEmpty: `${B}/bottle-empty.png`,
  bottleFairy: `${B}/bottle-fairy.png`,
  fairy: `${B}/fairy.svg`,
  potion: `${B}/potion-red.svg`,
  keySmall: `${B}/key-small.png`,
  keyBoss: `${B}/key-boss.png`,
  chest: `${B}/chest.png`,
  chestOpen: `${B}/chest-open.png`,
  chestLocked: `${B}/chest-locked.png`,
  pot: `${B}/pot.svg`,
  fountain: `${B}/fountain.png`,
  triforcePiece: `${B}/triforce-piece.svg`,
};

/** Walking-frame sprite for Link: direction × frame (1|2) × with/without sword. */
export function linkFrame(dir: Dir, frame: 1 | 2, sword: boolean): string {
  return `${B}/link-${dir}-${frame}${sword ? "-sword" : ""}.svg`;
}

/**
 * Prime the browser cache with every sprite the player will see in the
 * first few seconds — chiefly the 16 Link walk frames (4 dirs × 2 frames
 * × with/without sword) plus the HUD icons. Without this, on a slow link
 * Link's first dash through the overworld renders stale frames while the
 * browser races to fetch them on demand. Idempotent and fire-and-forget.
 */
let spritesPreloaded = false;
export function preloadSprites(): void {
  if (spritesPreloaded || typeof Image === "undefined") return;
  spritesPreloaded = true;
  const dirs: Dir[] = ["up", "down", "left", "right"];
  const urls: string[] = [];
  for (const d of dirs) {
    for (const f of [1, 2] as const) {
      urls.push(linkFrame(d, f, false));
      urls.push(linkFrame(d, f, true));
    }
  }
  urls.push(
    SPRITES.heart.full,
    SPRITES.heart.half,
    SPRITES.heart.empty,
    SPRITES.rupee.green,
    SPRITES.rupee.blue,
    SPRITES.rupee.red,
    SPRITES.castle,
    SPRITES.npc,
    SPRITES.merchant,
    SPRITES.bat,
    SPRITES.scorpion,
    SPRITES.rock,
    SPRITES.pot,
    SPRITES.chest,
    SPRITES.chestOpen,
    SPRITES.chestLocked,
    SPRITES.swordPedestal,
    SPRITES.doorOpen,
    SPRITES.ladder,
  );
  for (const url of urls) {
    const img = new Image();
    img.src = url;
  }
}

// Kick the preload off as soon as the module loads — the main bundle is
// already in flight at this point and HTTP/2 multiplexes the sprites
// alongside it, so they land in cache before the user even hits START.
preloadSprites();
