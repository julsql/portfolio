# JulSql — Portfolio 🗡️

> Portfolio interactif **façon Zelda (NES)** : explore un overworld pixel-art où chaque
> projet en production est un lieu à découvrir. Bilingue **FR / EN**, React + TypeScript + Vite.

[![Tests](https://github.com/julsql/portfolio/actions/workflows/tests.yml/badge.svg)](https://github.com/julsql/portfolio/actions/workflows/tests.yml)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)

## ✨ Concept

- **Overworld explorable** : déplace ton héros (flèches / ZQSD / WASD, ou croix tactile).
  Marche sur un lieu pour ouvrir la fiche du projet (interaction « bump » à la Zelda).
- **3 royaumes** : 🏰 Sites web · 🗿 Applications · 🪙 Outils.
- **Vue liste** alternative (accessible, mobile, SEO) via le bouton 📜.
- **i18n FR/EN** avec détection automatique de la langue (`react-i18next`).
- **12 projets** issus de ma liste GitHub starred « 🧨 In production ».

## 🛠️ Stack

| Couche       | Techno                                  |
| ------------ | --------------------------------------- |
| UI           | React 18 + TypeScript                   |
| Build        | Vite 5                                   |
| i18n         | i18next + react-i18next                  |
| Tests        | Vitest + Testing Library                 |
| Style        | CSS pur (pixel-art, polices NES)         |
| Prod         | Docker (multi-stage) → nginx             |

## 🚀 Développement

```bash
npm install
npm run dev        # http://localhost:5173
```

Autres scripts :

```bash
npm run test       # tests unitaires (Vitest)
npm run build      # build de production dans dist/
npm run preview    # prévisualise le build
npm run format     # Prettier (100 colonnes)
```

## 🐳 Docker

```bash
# Build + run en local (sert le site sur http://localhost:8011)
docker compose -f docker-compose-local.yml up --build
```

L'image est multi-stage : Node build le site statique, puis nginx le sert (avec
fallback SPA, gzip et cache des assets fingerprintés).

## 📦 Architecture

```
src/
├── components/      # TitleScreen, Overworld, Hero, ProjectModal, ListView, Hud, Legend, TouchControls
├── data/
│   ├── projects.ts  # les 12 projets + leur position sur la carte
│   └── map.ts       # génération de la grille de tuiles
├── hooks/
│   └── useMovement.ts  # déplacement du héros + collisions + ouverture des projets
├── i18n/            # config + locales fr.json / en.json
├── styles/          # global.css + zelda.css
└── types/
```

Ajouter un projet = une entrée dans `src/data/projects.ts` (avec sa position `pos`)
et ses textes dans `src/i18n/locales/{fr,en}.json` sous la clé `projects.<id>`.

## 🤖 CI/CD

- **`tests.yml`** : à chaque push / PR → lint, tests Vitest, build, build de l'image Docker.
- **`docker.yml`** : sur `main`, build & push de l'image sur **GHCR**
  (`ghcr.io/julsql/portfolio:latest`). C'est le seul artefact produit par la CI ;
  elle ne touche jamais au cluster.

Le site tourne sur **k3s**. Le déploiement est automatique : après le push, la CI
notifie le serveur (webhook Keel), qui met à jour ses pods. Pas de SSH ni de
`kubectl` manuel. Les manifests vivent dans le repo privé **`k3s-manifests`**.

## 🎵 Crédits sons

Tous les effets sonores (`public/sound/*.wav`) sont fournis par
**HelpTheWretched** — [noproblo.dayjo.org/zeldasounds](https://noproblo.dayjo.org/zeldasounds/) —
issus de **The Legend of Zelda: Ocarina of Time**. Voir `src/audio/sound.ts` pour
le mapping complet `événement → fichier`.

## 👤 Auteur

**JulSql** — développeur web fullstack · [github.com/julsql](https://github.com/julsql)
