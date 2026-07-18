# CLAUDE.md — Portfolio JulSql

Portfolio interactif **façon Zelda (NES)** : un overworld pixel-art explorable où chaque
projet en production est un lieu à découvrir. Bilingue **FR/EN**, React + TS + Vite.

## Commandes

```bash
npm run dev       # serveur de dev (Vite)
npm run build     # tsc -b && vite build → dist/
npm run test      # Vitest (tests unitaires)
npm run preview   # sert le build
npm run format    # Prettier (100 colonnes)
```

Toujours faire passer `npm run test` **et** `npm run build` avant de commiter.

## Architecture

- **`src/data/`** — la donnée et le « moteur de monde »
  - `projects.ts` : les projets (`PROJECTS`) et les châteaux (`CASTLES`). TheCode est un
    château regroupant ses sous-projets (`group: "thecode"`).
  - `scenes.ts` : les scènes (`SCENES`) — `overworld`, `thecode-castle`, `ganon-room`.
    Chaque scène = tuiles + landmarks + décor + rocks + enemies.
  - `map.ts` : génération des grilles de tuiles (`buildOverworld`, `buildCastle`,
    `buildGanonRoom`) et `BLOCKED` (tuiles infranchissables ; l'eau est gérée à part = noyade).
  - `sprites.ts` : URLs des sprites (`SPRITES`) servis depuis `public/sprites/`, et
    `RUPEE_VALUE`.
- **`src/hooks/useMovement.ts`** — déplacement du héros, collisions, ramassages (rubis),
  poussée de rochers (qui coulent dans l'eau), noyade. **Aucun effet de bord dans l'updater
  `setHero`** (React 18 StrictMode double-invoque les updaters → doublons) : la position est
  suivie via une `ref`.
- **`src/components/`** — `TitleScreen`, `SceneView` (rendu + IA ennemis + combat + dégâts),
  `Hero`, `ProjectModal`, `ListView`, `DialogBox`, `ItemGet`, `Victory`, `GameOver`, `Hud`,
  `TouchControls`, `Footer`.
- **`src/audio/sound.ts`** — moteur chiptune **synthétisé** en Web Audio (musique par scène +
  SFX). Aucun asset audio embarqué ; démarre au geste START ; se suspend quand l'onglet est
  masqué.
- **`src/i18n/`** — `react-i18next`, locales `fr.json` / `en.json`.
- **`src/styles/`** — `global.css` (variables, `--tile`) + `zelda.css`. Taille des cases via
  `--tile` calculée pour que l'overworld 20×14 tienne dans la fenêtre (`dvh`).

## Sons (`public/sound/`)

À **chaque** ajout, suppression ou remplacement d'un fichier sous `public/sound/`
(ou modification du mapping `événement → fichier` dans `src/audio/sound.ts`), tu
dois **mettre à jour `SOUNDS.md`** dans la même opération :

- ajouter / retirer la ligne correspondante dans la bonne section (Footsteps,
  Combat, Link, Pickups & containers, Doors & secrets, UI, Music)
- renseigner le nom local (`public/sound/...`), la description courte et le
  lien direct vers la source (par défaut HelpTheWretched
  `https://noproblo.dayjo.org/zeldasounds/<GAME>/<File>.wav`)
- mettre à jour les **compteurs** en fin de fichier
  (« 54 SFX + N music tracks », etc.)

Les crédits restent groupés dans le footer (`src/components/Footer.tsx` +
clés `footer.sounds_*` des locales), dans la section "🎵 Crédits sons" du
README et dans l'en-tête du fichier `src/audio/sound.ts`. Si tu ajoutes un
sample qui vient d'une autre source que HTW, ajoute aussi un second crédit
à ces trois endroits.

## Conventions importantes

- **Sprites** : déposer dans `public/sprites/` (noms en kebab-case, sans accents/espaces) et
  référencer via `SPRITES`. Les images source sont dans `images/` (NE PAS committer de
  modifications de ce dossier : la normalisation Unicode macOS y crée du bruit git).
- **Pas de contenu sous copyright** : musiques, bruitages et textes sont **originaux** (pas
  ceux de Nintendo/Zelda). Les sprites Zelda/Link/etc. sont les images fournies par JulSql.
- **Effets de bord & StrictMode** : ne jamais déclencher d'effet (son, dégâts, ramassage) à
  l'intérieur d'un updater `setState` — les sortir (cf. `useMovement`).
- **Ajouter un projet** : une entrée dans `PROJECTS` + un landmark dans la scène voulue
  (`scenes.ts`) + ses textes sous `projects.<id>` dans les deux locales. Les tests de
  `scenes.test.ts` valident le placement (case marchable, pas de chevauchement, ennemis/rochers).

## Tests

Vitest. Couvre l'intégrité des scènes (`scenes.test.ts`), le déplacement/collisions/poussée
(`useMovement.test.ts`) et la donnée projets + traductions (`projects.test.ts`).

## Déploiement

Docker multi-stage (Node build → nginx). CI GitHub Actions :

- `tests.yml` — lint / test / build (validation)
- `docker.yml` — build & push de l'image sur GHCR (`ghcr.io/julsql/portfolio:latest`,
  + tag `sha-<long>`). C'est le **seul** artefact produit par la CI ; elle ne touche
  pas au cluster.

Le site tourne sur **k3s** (VPS OVH `julsql-vps`, manifests dans `~/dev/server/k3s/`,
namespace `portfolio`, sert `portfolio.julsql.fr` + `julsql.fr`). La CI ne fait que
pousser l'image : c'est **Keel** (installé sur le cluster, cf. `~/dev/server/k3s/keel.yaml`)
qui poll GHCR et **redéploie automatiquement** dès que le digest de `:latest` change —
grâce aux annotations `keel.sh/*` sur le Deployment (`portfolio.yaml`).

> Le workflow historique `deploy.yml` (SSH `git pull` + `docker-compose up`) et le port
> `8011` ont disparu avec la migration docker-compose → k3s.

## Style commits

Conventional commits, messages en anglais.
