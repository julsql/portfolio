import type { Castle, Project } from "../types";

/**
 * The 12 production projects, curated from JulSql's "🧨 In production"
 * starred list. Projects with a `group` live inside a castle (see CASTLES
 * and scenes.ts); the rest are standalone landmarks on the overworld.
 */
export const PROJECTS: Project[] = [
  // ── Web realm ──────────────────────────────────────────────────────────
  {
    id: "codexio",
    name: "Codexio",
    category: "web",
    icon: "📚",
    tech: ["Django", "Python", "Hexagonal", "Docker"],
    liveUrl: "http://codexio.julsql.fr",
    repoUrl: "https://github.com/julsql/codexio",
  },
  {
    id: "rimbot",
    name: "Rimbot",
    category: "web",
    icon: "🪶",
    tech: ["Flask", "React", "PostgreSQL", "Docker", "CI/CD"],
    liveUrl: "http://rimbot.julsql.fr",
    repoUrl: "https://github.com/julsql/rimbot",
  },
  {
    id: "speciarium",
    name: "Speciarium",
    category: "web",
    icon: "🦋",
    tech: ["Django 6", "PostgreSQL", "Channels", "Redis", "GBIF"],
    liveUrl: "https://speciarium.julsql.fr",
    repoUrl: "https://github.com/julsql/speciarium",
  },
  {
    id: "lilianastrade",
    name: "Liliana's Trade",
    category: "web",
    icon: "🃏",
    tech: ["Symfony", "PHP", "Doctrine", "Deployer"],
    liveUrl: "http://lilianastrade.h.minet.net",
    repoUrl: "https://github.com/julsql/lilianastrade",
  },

  // ── Apps realm ───────────────────────────────────────────────────────────
  {
    id: "jimi",
    name: "JIMI",
    category: "app",
    icon: "🤖",
    tech: ["Spring Boot 3", "React Native", "Expo", "MariaDB", "LLM"],
    repoUrl: "https://github.com/JIMIDevLab/jimi_api",
    links: [
      {
        kind: "live",
        labelKey: "api",
        url: "https://jimi-api.julsql.fr/swagger-ui/index.html#/",
      },
      {
        kind: "store",
        labelKey: "android",
        url: "https://play.google.com/store/apps/details?id=fr.tsp.jimithechatbot",
      },
      { kind: "code", labelKey: "code_api", url: "https://github.com/JIMIDevLab/jimi_api" },
      { kind: "code", labelKey: "code_app", url: "https://github.com/JIMIDevLab/jimi_app" },
    ],
  },

  // ── Tools realm ──────────────────────────────────────────────────────────
  {
    id: "exif-tools",
    name: "Exif Tools",
    category: "tool",
    icon: "🗺️",
    tech: ["Python", "PyInstaller", "Desktop"],
    repoUrl: "https://github.com/julsql/exif-tools",
  },

  // ── TheCode castle (entered from the overworld) ──────────────────────────
  {
    id: "thecode-website",
    name: "TheCode Web",
    category: "web",
    icon: "🔐",
    tech: ["Vue", "TypeScript", "SHA-256"],
    group: "thecode",
    liveUrl: "https://thecode.julsql.fr",
    repoUrl: "https://github.com/TheCodeDevLab/thecode-website",
  },
  {
    id: "thecode-extension",
    name: "TheCode Extension",
    category: "app",
    icon: "🧩",
    tech: ["JavaScript", "WebExtension", "Chrome", "Firefox"],
    group: "thecode",
    repoUrl: "https://github.com/TheCodeDevLab/thecode-extension",
  },
  {
    id: "thecode-apple",
    name: "TheCode Apple",
    category: "app",
    icon: "🍏",
    tech: ["Swift", "iOS", "macOS", "Safari Extension"],
    group: "thecode",
    repoUrl: "https://github.com/TheCodeDevLab/thecode-apple",
  },
  {
    id: "thecode-android",
    name: "TheCode Android",
    category: "app",
    icon: "📱",
    tech: ["Java", "Material 3", "Autofill"],
    group: "thecode",
    repoUrl: "https://github.com/TheCodeDevLab/thecode-android",
  },
  {
    id: "thecode-cli",
    name: "TheCode CLI",
    category: "tool",
    icon: "⌨️",
    tech: ["Python", "CLI", "MIT"],
    group: "thecode",
    repoUrl: "https://github.com/TheCodeDevLab/thecode-cli",
  },
];

export const CASTLES: Castle[] = [
  {
    id: "thecode",
    name: "TheCode",
    icon: "🏰",
    memberIds: [
      "thecode-website",
      "thecode-extension",
      "thecode-apple",
      "thecode-android",
      "thecode-cli",
    ],
  },
];

export const projectById = (id: string): Project | undefined => PROJECTS.find((p) => p.id === id);

export const castleById = (id: string): Castle | undefined => CASTLES.find((c) => c.id === id);
