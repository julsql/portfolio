import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { Drop, Hero, LandmarkRef, Project } from "./types";
import {
  BOSS_ID,
  CASTLE_ID,
  CONSUMABLE_SHOP_REFS,
  GANON_ID,
  OVERWORLD_ID,
  SCENES,
  SHOP_ID,
  castleSceneId,
} from "./data/scenes";
import { projectById } from "./data/projects";
import { RUPEE_VALUE, type RupeeColor } from "./data/sprites";
import { transposeHero, transposeScene } from "./data/transpose";
import { sound } from "./audio/sound";
import TitleScreen from "./components/TitleScreen";
import SceneView from "./components/SceneView";
import ListView from "./components/ListView";
import ProjectModal from "./components/ProjectModal";
import DialogBox, { type DialogKind } from "./components/DialogBox";
import ItemGet, { type Item } from "./components/ItemGet";
import GameOver from "./components/GameOver";
import Victory from "./components/Victory";
import Hud from "./components/Hud";

type View = "map" | "list";
type Bottle = "empty" | "potion" | "fairy";

const START_HEALTH = 6; // 3 hearts × 2 half-units
const INVULN_MS = 800;
const MAX_BOTTLES = 2;
const FAIRY_REVIVE_HEALTH = 6;

export default function App() {
  const { i18n } = useTranslation();
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<View>("map");
  const [active, setActive] = useState<Project | null>(null);
  const [itemGet, setItemGet] = useState<Item | null>(null);

  const [sceneId, setSceneId] = useState(OVERWORLD_ID);
  const [spawn, setSpawn] = useState<Hero>(SCENES[OVERWORLD_ID].heroStart);
  const [runId, setRunId] = useState(0);

  // Progress / survival.
  const [heartTaken, setHeartTaken] = useState(false);
  const [hasSword, setHasSword] = useState(false);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [rupees, setRupees] = useState(0);
  const [maxHealth, setMaxHealth] = useState(START_HEALTH);
  const [health, setHealth] = useState(START_HEALTH);
  const [invuln, setInvuln] = useState(false);
  const invulnRef = useRef(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [triforceWon, setTriforceWon] = useState(false);
  const [muted, setMuted] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);

  // Side-quest inventory.
  const [hasBow, setHasBow] = useState(false);
  const [arrows, setArrows] = useState(0);
  const [bombs, setBombs] = useState(0);
  const [smallKeys, setSmallKeys] = useState(0);
  const [hasBossKey, setHasBossKey] = useState(false);
  const [hasTriforce, setHasTriforce] = useState(false);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  /** Refs of chests/shop items/triforce already opened (across scenes). */
  const [opened, setOpened] = useState<Set<string>>(new Set());
  /** Mini-boss (cave guardian) defeated — unlocks the triforce piece. */
  const [miniBossDefeated, setMiniBossDefeated] = useState(false);
  /** Ganondorf has been beaten — keep his room empty on subsequent visits. */
  const [ganonDefeated, setGanonDefeated] = useState(false);
  /** Boss-door refs the hero has already unlocked (the door stays open). */
  const [unlockedDoors, setUnlockedDoors] = useState<Set<string>>(new Set());

  // Portrait windows get a transposed (taller-than-wide) map.
  const [portrait, setPortrait] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(orientation: portrait)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(orientation: portrait)");
    const onChange = () => setPortrait(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Live scene: drop the grabbed heart, the taken sword and collected rupees;
  // once the heart is taken, reveal the door to Ganon's lair behind the throne.
  // In portrait, transpose the whole scene so it fits a tall window.
  const scene = useMemo(() => {
    const base = SCENES[sceneId];
    let landmarks = base.landmarks;
    if (heartTaken) landmarks = landmarks.filter((l) => l.kind !== "heart");
    if (hasSword) landmarks = landmarks.filter((l) => l.kind !== "sword");
    if (collected.size) {
      landmarks = landmarks.filter((l) => !(l.kind === "rupee" && collected.has(l.ref)));
    }
    if (opened.size) {
      // Picked-up items vanish; opened chests/locked chests stay but render
      // as their open variant (handled in SceneView via the `opened` set).
      landmarks = landmarks.filter(
        (l) =>
          !(
            (l.kind === "shopItem" || l.kind === "triforce" || l.kind === "fairy") &&
            opened.has(l.ref)
          ),
      );
    }
    // The Triforce fragment is only revealed once the mini-boss is dead.
    if (!miniBossDefeated) {
      landmarks = landmarks.filter((l) => l.kind !== "triforce");
    }
    if (heartTaken && sceneId === CASTLE_ID) {
      // Ganon's door is gated by the Triforce fragment — kill the cave
      // guardian, take the piece, then come back to face him.
      landmarks = [
        ...landmarks,
        { x: 6, y: 1, kind: "bossDoor", ref: GANON_ID, spawn: SCENES[GANON_ID].heroStart },
      ];
    }
    // Bosses stay dead — wipe their spawn from the scene on subsequent visits.
    let enemies = base.enemies ?? [];
    if (miniBossDefeated && sceneId === BOSS_ID) {
      enemies = enemies.filter((e) => e.id !== "monster");
    }
    if (ganonDefeated && sceneId === GANON_ID) {
      enemies = enemies.filter((e) => e.id !== "ganondorf");
    }
    const built = { ...base, landmarks, enemies };
    return portrait ? transposeScene(built) : built;
  }, [sceneId, heartTaken, hasSword, collected, opened, miniBossDefeated, ganonDefeated, portrait]);

  // Consumable wares restock every time the player walks back into the shop.
  useEffect(() => {
    if (sceneId !== SHOP_ID) return;
    setOpened((s) => {
      let changed = false;
      const next = new Set(s);
      for (const ref of CONSUMABLE_SHOP_REFS) {
        if (next.delete(ref)) changed = true;
      }
      return changed ? next : s;
    });
  }, [sceneId]);

  const goToScene = (id: string, where: Hero) => {
    setSpawn(where);
    setSceneId(id);
    setRunId((r) => r + 1);
  };

  // A single half-heart of damage, with a brief invulnerability window.
  const takeHit = useCallback(() => {
    if (invulnRef.current) return;
    invulnRef.current = true;
    setInvuln(true);
    setTimeout(() => {
      invulnRef.current = false;
      setInvuln(false);
    }, INVULN_MS);
    setHealth((h) => Math.max(h - 1, 0));
  }, []);

  useEffect(() => {
    if (!started) return;
    if (health <= 0) {
      // Auto-revive: if a fairy is bottled, she escapes and refills you.
      const slot = bottles.findIndex((b) => b === "fairy");
      if (slot >= 0) {
        sound.sfx("fairyRevive");
        setBottles((bs) => bs.map((b, i) => (i === slot ? "empty" : b)));
        setHealth(Math.min(maxHealth, FAIRY_REVIVE_HEALTH));
        invulnRef.current = true;
        setInvuln(true);
        setTimeout(() => {
          invulnRef.current = false;
          setInvuln(false);
        }, INVULN_MS);
        return;
      }
      setGameOver(true);
    } else if (health === 2) {
      sound.sfx("lowHealth");
    }
  }, [started, health, bottles, maxHealth]);

  const onBossDefeated = useCallback(() => {
    sound.stopMusic();
    sound.sfx("victory");
    setGanonDefeated(true);
    setVictory(true);
  }, []);

  // Background music follows the current scene.
  useEffect(() => {
    if (!started || gameOver) return;
    const override = SCENES[sceneId].music;
    if (override) sound.music(override);
    else
      sound.music(sceneId === GANON_ID ? "ganon" : sceneId === CASTLE_ID ? "dungeon" : "overworld");
  }, [started, sceneId, gameOver]);

  useEffect(() => sound.setMuted(muted), [muted]);

  // Retro "select" blip on every UI action (clicking a button/link/card/place),
  // except the movement D-pad / attack button.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      // Menu/UI actions only — game places (.landmark) and movement buttons
      // already have their own sounds.
      const el = (e.target as HTMLElement | null)?.closest(
        "button:not(.dpad-btn):not(.attack-btn):not(.landmark), a.btn, .p-card",
      );
      if (el) sound.sfx("select");
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  // Global keyboard shortcuts: Tab = Map/List, s = sound, l = language.
  useEffect(() => {
    if (!started) return;
    const overlayOpen =
      active !== null || dialog !== null || itemGet !== null || gameOver || victory;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (!overlayOpen) {
          sound.sfx("select");
          setView((v) => (v === "map" ? "list" : "map"));
        }
      } else if (e.key === "m" || e.key === "M") {
        sound.sfx("select");
        setMuted((m) => !m);
      } else if (e.key === "l" || e.key === "L") {
        sound.sfx("select");
        i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, active, dialog, itemGet, gameOver, victory, i18n]);

  useEffect(() => {
    if (gameOver) {
      sound.stopMusic();
      sound.sfx("gameover");
    }
  }, [gameOver]);

  /** Add a chest/shop/pot drop to the inventory and return the item-get card. */
  const applyDrop = useCallback((drop: Drop): Item | null => {
    switch (drop.kind) {
      case "bow":
        setHasBow(true);
        setArrows((n) => n + 10);
        return "bow";
      case "arrows":
        setArrows((n) => n + (drop.amount ?? 5));
        return "arrow";
      case "bombs":
        setBombs((n) => n + (drop.amount ?? 1));
        return "bomb";
      case "smallKey":
        setSmallKeys((n) => n + 1);
        return "smallKey";
      case "bossKey":
        setHasBossKey(true);
        return "bossKey";
      case "bottle":
        setBottles((bs) => (bs.length < MAX_BOTTLES ? [...bs, "empty"] : bs));
        return "bottle";
      case "potion":
        // Pour the potion into the first empty slot the hero is carrying.
        setBottles((bs) => {
          const slot = bs.findIndex((b) => b === "empty");
          return slot < 0 ? bs : bs.map((b, i) => (i === slot ? "potion" : b));
        });
        return "potion";
      case "triforce":
        setHasTriforce(true);
        return "triforce";
      case "rupee":
        setRupees((n) => n + RUPEE_VALUE[drop.rupee ?? "green"]);
        return null;
    }
  }, []);

  const onInteract = (l: LandmarkRef) => {
    switch (l.kind) {
      case "project": {
        const p = projectById(l.ref);
        if (p) setActive(p);
        break;
      }
      case "castle": {
        const target = castleSceneId(l.ref);
        goToScene(target, SCENES[target].heroStart);
        break;
      }
      case "exit":
      case "door":
      case "cave":
        goToScene(l.ref, l.spawn ?? SCENES[l.ref].heroStart);
        break;
      case "bossDoor": {
        // Ganon's door asks for the Triforce; every other boss door asks for
        // the Boss Key. The door keeps its locked look until the hero bumps
        // into it with the right key — only then does it actually open, with
        // the riddle-solved jingle.
        const ganon = l.ref === GANON_ID;
        const hasKey = ganon ? hasTriforce : hasBossKey;
        const alreadyOpen = unlockedDoors.has(l.ref);
        if (alreadyOpen) {
          sound.sfx("door");
          goToScene(l.ref, l.spawn ?? SCENES[l.ref].heroStart);
        } else if (hasKey) {
          sound.sfx("unlock");
          setUnlockedDoors((s) => new Set(s).add(l.ref));
          goToScene(l.ref, l.spawn ?? SCENES[l.ref].heroStart);
        } else {
          sound.sfx("lockedNo");
          setDialog(ganon ? "ganonLocked" : "bossLocked");
        }
        break;
      }
      case "chest":
        if (!opened.has(l.ref) && l.drop) {
          sound.sfx("chest");
          setOpened((s) => new Set(s).add(l.ref));
          const item = applyDrop(l.drop);
          if (item) setItemGet(item);
        }
        break;
      case "lockedChest":
        if (opened.has(l.ref)) break;
        if (smallKeys > 0 && l.drop) {
          sound.sfx("unlock");
          setSmallKeys((n) => n - 1);
          setOpened((s) => new Set(s).add(l.ref));
          const item = applyDrop(l.drop);
          if (item) setItemGet(item);
        } else {
          sound.sfx("lockedNo");
          setDialog("needsKey");
        }
        break;
      case "shopItem": {
        if (opened.has(l.ref) || !l.drop) break;
        const price = l.price ?? 0;
        if (rupees < price) {
          sound.sfx("lockedNo");
          setDialog("notEnoughRupees");
          break;
        }
        // Pouring a potion needs an empty bottle to hold it.
        if (l.drop.kind === "potion" && !bottles.some((b) => b === "empty")) {
          sound.sfx("lockedNo");
          setDialog("needsBottle");
          break;
        }
        sound.sfx("chest");
        setRupees((n) => n - price);
        setOpened((s) => new Set(s).add(l.ref));
        const item = applyDrop(l.drop);
        if (item) setItemGet(item);
        break;
      }
      case "fountain":
        setDialog("fountain");
        break;
      case "npc":
        setDialog(l.ref === "merchant" ? "merchant" : "sage");
        break;
      case "heart": {
        setHeartTaken(true);
        const next = maxHealth + 2;
        setMaxHealth(next);
        setHealth(next);
        setItemGet("heart");
        break;
      }
      case "sword":
        setHasSword(true);
        setItemGet("sword");
        break;
    }
  };

  const onPickup = (l: LandmarkRef) => {
    if (l.kind === "rupee") {
      if (collected.has(l.ref)) return;
      setCollected((c) => new Set(c).add(l.ref));
      setRupees((n) => n + RUPEE_VALUE[l.rupee ?? "green"]);
      return;
    }
    if (l.kind === "fairy") {
      if (opened.has(l.ref)) return;
      const slot = bottles.findIndex((b) => b === "empty");
      if (slot < 0) {
        sound.sfx("lockedNo");
        setDialog("needsBottle");
        return;
      }
      sound.sfx("fairyRevive");
      setBottles((bs) => bs.map((b, i) => (i === slot ? "fairy" : b)));
      setOpened((s) => new Set(s).add(l.ref));
      setItemGet("fairy");
      return;
    }
    if (l.kind === "triforce") {
      if (opened.has(l.ref)) return;
      sound.sfx("chest");
      setOpened((s) => new Set(s).add(l.ref));
      setHasTriforce(true);
      setItemGet("triforce");
      setTriforceWon(true);
      return;
    }
  };

  /** Walk-onto rupee pickup, dropped by a broken pot (random colour). */
  const onRupee = useCallback((color: RupeeColor) => setRupees((n) => n + RUPEE_VALUE[color]), []);

  /** Mini-boss took its last hit — unblock the Triforce fragment. */
  const onMonsterDefeated = useCallback(() => setMiniBossDefeated(true), []);

  /** Use a bottle slot. Drinks a potion (heal) or releases a fairy (heal). */
  const useBottle = useCallback(
    (slot: number) => {
      const content = bottles[slot];
      if (!content || content === "empty") return;
      if (content === "potion" || content === "fairy") {
        sound.sfx(content === "fairy" ? "fairyRevive" : "heart");
        setHealth(maxHealth);
        setBottles((bs) => bs.map((b, i) => (i === slot ? "empty" : b)));
      }
    },
    [bottles, maxHealth],
  );

  // Quick "use bottle" shortcuts: U for slot 1, I for slot 2.
  useEffect(() => {
    if (!started) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "u" || e.key === "U") useBottle(0);
      else if (e.key === "i" || e.key === "I") useBottle(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, useBottle]);

  // Game over wipes all progress — start a fresh run.
  const retry = () => {
    setGameOver(false);
    setVictory(false);
    setTriforceWon(false);
    setActive(null);
    setDialog(null);
    setItemGet(null);
    setHasSword(false);
    setHeartTaken(false);
    setCollected(new Set());
    setOpened(new Set());
    setUnlockedDoors(new Set());
    setMiniBossDefeated(false);
    setGanonDefeated(false);
    setRupees(0);
    setMaxHealth(START_HEALTH);
    setHealth(START_HEALTH);
    setHasBow(false);
    setArrows(0);
    setBombs(0);
    setSmallKeys(0);
    setHasBossKey(false);
    setHasTriforce(false);
    setBottles([]);
    invulnRef.current = false;
    setInvuln(false);
    setSceneId(OVERWORLD_ID);
    setSpawn(SCENES[OVERWORLD_ID].heroStart);
    setRunId((r) => r + 1);
  };

  const toggleLang = () => i18n.changeLanguage(i18n.language.startsWith("fr") ? "en" : "fr");

  // Audio must be unlocked by a user gesture, so init + start music on START.
  const start = () => {
    sound.init();
    sound.sfx("select");
    sound.music("overworld");
    setStarted(true);
  };

  if (!started) {
    return (
      <TitleScreen
        onStart={start}
        onToggleLang={toggleLang}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
    );
  }

  const paused = active !== null || gameOver || dialog !== null || itemGet !== null || victory;

  return (
    <div className="screen">
      <Hud
        view={view}
        onView={setView}
        onToggleLang={toggleLang}
        muted={muted}
        onToggleMute={() => setMuted((m) => !m)}
      />
      <main className="stage">
        {view === "map" ? (
          <SceneView
            key={`${sceneId}-${runId}-${portrait ? "p" : "l"}`}
            scene={scene}
            initialHero={portrait ? transposeHero(spawn) : spawn}
            onInteract={onInteract}
            onPickup={onPickup}
            onHit={takeHit}
            onBossDefeated={onBossDefeated}
            onMonsterDefeated={onMonsterDefeated}
            onRupee={onRupee}
            useBottle={useBottle}
            paused={paused}
            hasSword={hasSword}
            hasBow={hasBow}
            arrows={arrows}
            bombs={bombs}
            smallKeys={smallKeys}
            hasBossKey={hasBossKey}
            hasTriforce={hasTriforce}
            bottles={bottles}
            opened={opened}
            unlockedDoors={unlockedDoors}
            consumeArrow={() => setArrows((n) => Math.max(0, n - 1))}
            consumeBomb={() => setBombs((n) => Math.max(0, n - 1))}
            health={health}
            maxHearts={maxHealth / 2}
            rupees={rupees}
            invulnerable={invuln}
          />
        ) : (
          <ListView onOpen={setActive} paused={active !== null} />
        )}
      </main>
      {active && <ProjectModal project={active} onClose={() => setActive(null)} />}
      {dialog && <DialogBox kind={dialog} onClose={() => setDialog(null)} />}
      {itemGet && <ItemGet item={itemGet} onDone={() => setItemGet(null)} />}
      {gameOver && <GameOver onRetry={retry} />}
      {(victory || triforceWon) && (
        <Victory
          triforce={triforceWon && !victory}
          onClose={() => {
            setVictory(false);
            setTriforceWon(false);
            sound.music(SCENES[sceneId].music ?? (sceneId === GANON_ID ? "ganon" : "overworld"));
          }}
        />
      )}
    </div>
  );
}
