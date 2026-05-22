const B = "/sprites";

export type Dir = "up" | "down" | "left" | "right";
export type RupeeColor = "red" | "blue" | "green";

export const RUPEE_VALUE: Record<RupeeColor, number> = { red: 20, blue: 5, green: 1 };

export const SPRITES = {
  swordPedestal: `${B}/sword-pedestal.png`,
  swordStrike: `${B}/sword-strike.png`,
  mountain: `${B}/mountain.svg`,
  cactus: `${B}/cactus.svg`,
  rock: `${B}/pierre.png`,
  fire: `${B}/fire.svg`,
  tree: `${B}/tree.svg`,
  door: `${B}/door.svg`,
  bat: `${B}/bat.svg`,
  scorpion: `${B}/scorpion.svg`,
  linkHeart: `${B}/link-heart.svg`,
  linkTriforce: `${B}/link-triforce.png`,
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
};

/** Walking-frame sprite for Link: direction × frame (1|2) × with/without sword. */
export function linkFrame(dir: Dir, frame: 1 | 2, sword: boolean): string {
  return `${B}/link-${dir}-${frame}${sword ? "-sword" : ""}.svg`;
}
