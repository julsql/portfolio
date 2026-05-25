# 🎵 Sounds catalogue

All sound effects shipped under `public/sound/` come from **HelpTheWretched** —
[`noproblo.dayjo.org/zeldasounds/`](https://noproblo.dayjo.org/zeldasounds/) —
sourced from **The Legend of Zelda: Ocarina of Time**.

The mapping `event → file` lives in [`src/audio/sound.ts`](src/audio/sound.ts).
Direct download URLs use the pattern
`https://noproblo.dayjo.org/zeldasounds/OOT/<OOT_Name>.wav`.

## 🦶 Footsteps (per surface)

`useMovement.onStep(tile)` reports the tile under Link's feet; `SceneView`
picks the matching bank and `sound.sfx()` plays one variant at random.

| File in `public/sound/` | Description | OOT source |
| --- | --- | --- |
| `step-grass-1.wav` | Walking on grass (variant 1) | [`OOT_Steps_Grass1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Grass1.wav) |
| `step-grass-2.wav` | Walking on grass (variant 2) | [`OOT_Steps_Grass2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Grass2.wav) |
| `step-grass-3.wav` | Walking on grass (variant 3) | [`OOT_Steps_Grass3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Grass3.wav) |
| `step-grass-4.wav` | Walking on grass (variant 4) | [`OOT_Steps_Grass4.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Grass4.wav) |
| `step-dirt-1.wav` | Walking on dirt / castle plaza (variant 1) | [`OOT_Steps_Dirt1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Dirt1.wav) |
| `step-dirt-2.wav` | Walking on dirt (variant 2) | [`OOT_Steps_Dirt2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Dirt2.wav) |
| `step-dirt-3.wav` | Walking on dirt (variant 3) | [`OOT_Steps_Dirt3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Dirt3.wav) |
| `step-dirt-4.wav` | Walking on dirt (variant 4) | [`OOT_Steps_Dirt4.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Dirt4.wav) |
| `step-sand-1.wav` | Walking on sand / desert (variant 1) | [`OOT_Steps_Sand1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Sand1.wav) |
| `step-sand-2.wav` | Walking on sand (variant 2) | [`OOT_Steps_Sand2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Sand2.wav) |
| `step-sand-3.wav` | Walking on sand (variant 3) | [`OOT_Steps_Sand3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Sand3.wav) |
| `step-wood-1.wav` | Walking on the wooden pier (variant 1) | [`OOT_Steps_Wood1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Wood1.wav) |
| `step-wood-2.wav` | Walking on wood (variant 2) | [`OOT_Steps_Wood2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Wood2.wav) |
| `step-wood-3.wav` | Walking on wood (variant 3) | [`OOT_Steps_Wood3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Wood3.wav) |
| `step-stone-1.wav` | Walking on stone floor — caves, castle, dungeons (variant 1) | [`OOT_Steps_Stone1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Stone1.wav) |
| `step-stone-2.wav` | Walking on stone (variant 2) | [`OOT_Steps_Stone2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Stone2.wav) |
| `step-stone-3.wav` | Walking on stone (variant 3) | [`OOT_Steps_Stone3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Stone3.wav) |
| `step-carpet-1.wav` | Walking on the castle carpet (variant 1) | [`OOT_Steps_Carpet1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Carpet1.wav) |
| `step-carpet-2.wav` | Walking on carpet (variant 2) | [`OOT_Steps_Carpet2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Carpet2.wav) |
| `step-carpet-3.wav` | Walking on carpet (variant 3) | [`OOT_Steps_Carpet3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Steps_Carpet3.wav) |

## ⚔️ Combat

| File in `public/sound/` | Description | OOT source |
| --- | --- | --- |
| `sword-swing.wav` | Sword swoosh (Kokiri / Master Sword) | [`OOT_Sword1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Sword1.wav) |
| `attack-shout-1.wav` | Young Link "Haa!" shout (variant 1) | [`OOT_YoungLink_Attack1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Attack1.wav) |
| `attack-shout-2.wav` | Young Link attack shout (variant 2) | [`OOT_YoungLink_Attack2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Attack2.wav) |
| `attack-shout-3.wav` | Young Link attack shout (variant 3) | [`OOT_YoungLink_Attack3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Attack3.wav) |
| `attack-shout-4.wav` | Young Link attack shout (variant 4) | [`OOT_YoungLink_Attack4.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Attack4.wav) |
| `enemy-hit.wav` | An enemy getting hit | [`OOT_Enemy_Hit.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Enemy_Hit.wav) |
| `enemy-die.wav` | An enemy bouncing on the ground after death | [`OOT_Enemy_Bounce_Long.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Enemy_Bounce_Long.wav) |
| `boss-hit.wav` | Ganondorf getting hit (used for the cave guardian too) | [`OOT_Ganondorf_HitX.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Ganondorf_HitX.wav) |
| `arrow-shoot.wav` | Shooting an arrow from the Hero's Bow | [`OOT_Arrow_Shoot.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Arrow_Shoot.wav) |
| `arrow-hit.wav` | An arrow snapping off a wall | [`OOT_Arrow_Hit.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Arrow_Hit.wav) |
| `bomb-drop.wav` | A bomb hitting the ground | [`OOT_Bomb_Drop.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Bomb_Drop.wav) |
| `bomb-blow.wav` | A bomb exploding | [`OOT_Bomb_Blow.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Bomb_Blow.wav) |
| `pot-shatter.wav` | A pot shattering | [`OOT_Pot_Shatter.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Pot_Shatter.wav) |
| `rock-push.wav` | Heaving a pushable rock one tile across the floor — Deku Scrub crumble (also heard on Octorok) | [`OOT_DekuScrub_Crumble.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_DekuScrub_Crumble.wav) |
| `fireball-shoot.wav` | Ganondorf throwing a fireball in his lair | [`OOT_Anubis_Fire_Shoot.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Anubis_Fire_Shoot.wav) |
| `fireball-burn.wav` | A fireball hitting a wall / Link | [`OOT_Anubis_Fire_Burn.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Anubis_Fire_Burn.wav) |

## 💔 Link

| File in `public/sound/` | Description | OOT source |
| --- | --- | --- |
| `link-hurt-1.wav` | Link getting hurt (variant 1) | [`OOT_YoungLink_Hurt1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Hurt1.wav) |
| `link-hurt-2.wav` | Link getting hurt (variant 2) — also used when burning | [`OOT_YoungLink_Hurt2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Hurt2.wav) |
| `link-hurt-3.wav` | Link getting hurt (variant 3) | [`OOT_YoungLink_Hurt3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Hurt3.wav) |
| `link-fall-1.wav` | Link getting knocked to the ground by a boss (variant 1) | [`OOT_YoungLink_FallDown1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_FallDown1.wav) |
| `link-fall-2.wav` | Link knocked down (variant 2) | [`OOT_YoungLink_FallDown2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_FallDown2.wav) |
| `link-fall-3.wav` | Link knocked down (variant 3) | [`OOT_YoungLink_FallDown3.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_FallDown3.wav) |
| `link-splash.wav` | Link splashing into water (drowning) | [`OOT_Link_Splash_In.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Link_Splash_In.wav) |
| `link-scream-1.wav` | Link's long-fall scream — layered on top of the splash when he drowns (variant 1) | [`OOT_YoungLink_Scream1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Scream1.wav) |
| `link-scream-2.wav` | Link's long-fall scream (variant 2) | [`OOT_YoungLink_Scream2.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Scream2.wav) |
| `link-die.wav` | Link's death scream | [`OOT_YoungLink_ChokeFull.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_ChokeFull.wav) |
| `low-health.wav` | Low health beep (looped) | [`OOT_LowHealth.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_LowHealth.wav) |

## 🪙 Pickups & containers

| File in `public/sound/` | Description | OOT source |
| --- | --- | --- |
| `rupee.wav` | Picking up a rupee | [`OOT_Get_Rupee.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Get_Rupee.wav) |
| `fanfare-heart.wav` | "Get Heart Container" fanfare | [`OOT_Fanfare_HeartContainer.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Fanfare_HeartContainer.wav) |
| `heart-refill.wav` | A heart refilling — played in cascade after drinking a red potion | [`OOT_Get_Heart.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Get_Heart.wav) |
| `fanfare-item.wav` | "Get Item" fanfare — sword pedestal, Triforce piece, Ganon victory, shop purchase, chest opens | [`OOT_Fanfare_Item.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Fanfare_Item.wav) |
| `chest-open.wav` | Opening a small chest (no longer wired — kept for fallback) | [`OOT_Chest_Small.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Chest_Small.wav) |
| `get-small-item.wav` | "Get small item" jingle (no longer wired — kept for fallback) | [`OOT_Get_SmallItem1.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Get_SmallItem1.wav) |
| `link-drink.wav` | Link gulping a drink — played when emptying a red potion bottle | [`OOT_YoungLink_Gulp.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_YoungLink_Gulp.wav) |
| `fairy.wav` | Catching a fairy / fairy auto-revive | [`OOT_Fairy.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Fairy.wav) |

## 🚪 Doors & secrets

| File in `public/sound/` | Description | OOT source |
| --- | --- | --- |
| `door-unlock.wav` | Unlocking a chained chest | [`OOT_Door_Unlock.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Door_Unlock.wav) |
| `puzzle-solved.wav` | "Riddle solved" jingle — first open of a boss / mini-boss door | [`OOT_Secret.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Secret.wav) |
| `door-open.wav` | Opening a regular door (scene transitions) | [`OOT_Door_Regular_Open.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Door_Regular_Open.wav) |
| `door-boss.wav` | Unlocking a boss-room door (Ganon's lair entry) | [`OOT_Door_Boss_Unlock.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Door_Boss_Unlock.wav) |
| `error.wav` | Error sound — no key, not enough rupees, no empty bottle… | [`OOT_MainMenu_Error.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_MainMenu_Error.wav) |

## 🖱️ UI

| File in `public/sound/` | Description | OOT source |
| --- | --- | --- |
| `menu-select.wav` | Making a selection on the pause menu — every UI click in the app | [`OOT_PauseMenu_Select.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_PauseMenu_Select.wav) |
| `menu-cursor.wav` | Moving the cursor on the pause menu (reserved for menu nav) | [`OOT_PauseMenu_Cursor.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_PauseMenu_Cursor.wav) |
| `dialog-done.wav` | Finishing a dialogue box — closes any dialog / modal / item-get | [`OOT_Dialogue_Done.wav`](https://noproblo.dayjo.org/zeldasounds/OOT/OOT_Dialogue_Done.wav) |

## 🎼 Music (background loops)

The four music tracks are not from this catalogue — they predate the audio
overhaul and are kept as the ambient background.

| File in `public/sound/` | Description |
| --- | --- |
| `music-overworld.mp3` | Overworld theme (looped) |
| `music-castle.mp3` | TheCode castle + dungeon theme |
| `music-ganon.wav` | Ganon's lair theme |
| `fairy-fountain.wav` | Fairy fountain ambient |
| `gameover.wav` | Game Over dirge (looped on the Game Over screen, layered after Link's death cry) — Ocarina of Time rip |

---

**Counts** — 63 SFX samples (OOT) + 5 music tracks.
**Multi-variant banks** — 6 footstep banks (3-4 variants each) + `attackShout`
(4) + `hurt` / `hurtBoss` / `burn` (3 each) + `scream` (2).
