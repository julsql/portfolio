import type { Project } from "../types";

/**
 * The 12 production projects, curated from JulSql's "🧨 In production"
 * starred list. Each one is a landmark placed on the overworld map.
 * Positions are tile coordinates (see map.ts for the grid).
 */
export const PROJECTS: Project[] = [
  // ── Web realm (north) — castles ──────────────────────────────────────────
  {
    id: "codexio",
    name: "Codexio",
    category: "web",
    icon: "📚",
    tech: ["Django", "Python", "Hexagonal", "Docker"],
    pos: { x: 3, y: 2 },
    liveUrl: "http://codexio.julsql.fr",
    repoUrl: "https://github.com/julsql/codexio",
  },
  {
    id: "rimbot",
    name: "Rimbot",
    category: "web",
    icon: "🪶",
    tech: ["Flask", "React", "PostgreSQL", "Docker", "CI/CD"],
    pos: { x: 6, y: 2 },
    liveUrl: "http://rimbot.julsql.fr",
    repoUrl: "https://github.com/julsql/rimbot",
  },
  {
    id: "thecode-website",
    name: "TheCode",
    category: "web",
    icon: "🔐",
    tech: ["Vue", "TypeScript", "SHA-256"],
    pos: { x: 9, y: 2 },
    liveUrl: "https://thecode.julsql.fr",
    repoUrl: "https://github.com/TheCodeDevLab/thecode-website",
  },
  {
    id: "speciarium",
    name: "Speciarium",
    category: "web",
    icon: "🦋",
    tech: ["Django 6", "PostgreSQL", "Channels", "Redis", "GBIF"],
    pos: { x: 12, y: 2 },
    liveUrl: "https://speciarium.julsql.fr",
    repoUrl: "https://github.com/julsql/speciarium",
  },
  {
    id: "lilianastrade",
    name: "Liliana's Trade",
    category: "web",
    icon: "🃏",
    tech: ["Symfony", "PHP", "Doctrine", "Deployer"],
    pos: { x: 16, y: 2 },
    liveUrl: "http://lilianastrade.h.minet.net",
    repoUrl: "https://github.com/julsql/lilianastrade",
  },

  // ── Apps realm (east) — devices & statues ────────────────────────────────
  {
    id: "jimi-api",
    name: "JIMI API",
    category: "app",
    icon: "🗿",
    tech: ["Spring Boot 3", "Java", "MariaDB", "LLM"],
    pos: { x: 16, y: 5 },
    repoUrl: "https://github.com/JIMIDevLab/jimi_api",
  },
  {
    id: "jimi-app",
    name: "JIMI App",
    category: "app",
    icon: "🤖",
    tech: ["React Native", "Expo", "TypeScript"],
    pos: { x: 16, y: 8 },
    storeUrl: "https://play.google.com/store/apps/details?id=fr.tsp.jimithechatbot",
    repoUrl: "https://github.com/JIMIDevLab/jimi_app",
  },
  {
    id: "thecode-apple",
    name: "TheCode Apple",
    category: "app",
    icon: "🍏",
    tech: ["Swift", "iOS", "macOS", "Safari Extension"],
    pos: { x: 16, y: 11 },
    repoUrl: "https://github.com/TheCodeDevLab/thecode-apple",
  },
  {
    id: "thecode-android",
    name: "TheCode Android",
    category: "app",
    icon: "📱",
    tech: ["Java", "Material 3", "Autofill"],
    pos: { x: 13, y: 11 },
    repoUrl: "https://github.com/TheCodeDevLab/thecode-android",
  },
  {
    id: "thecode-extension",
    name: "TheCode Extension",
    category: "app",
    icon: "🧩",
    tech: ["JavaScript", "WebExtension", "Chrome", "Firefox"],
    pos: { x: 10, y: 11 },
    repoUrl: "https://github.com/TheCodeDevLab/thecode-extension",
  },

  // ── Tools realm (west) — coins & items ───────────────────────────────────
  {
    id: "thecode-cli",
    name: "TheCode CLI",
    category: "tool",
    icon: "⌨️",
    tech: ["Python", "CLI", "MIT"],
    pos: { x: 3, y: 11 },
    repoUrl: "https://github.com/TheCodeDevLab/thecode-cli",
  },
  {
    id: "exif-tools",
    name: "Exif Tools",
    category: "tool",
    icon: "🗺️",
    tech: ["Python", "PyInstaller", "Desktop"],
    pos: { x: 6, y: 11 },
    repoUrl: "https://github.com/julsql/exif-tools",
  },
];
