import { describe, expect, it } from "vitest";
import { CASTLES, projectById, PROJECTS } from "./projects";
import fr from "../i18n/locales/fr.json";
import en from "../i18n/locales/en.json";

describe("projects data", () => {
  it("contains the 12 curated production projects with unique ids", () => {
    expect(PROJECTS).toHaveLength(12);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(12);
  });

  it("always has a repo url and a non-empty tech stack", () => {
    for (const p of PROJECTS) {
      expect(p.repoUrl).toMatch(/^https:\/\/github\.com\//);
      expect(p.tech.length).toBeGreaterThan(0);
    }
  });

  it.each(["fr", "en"] as const)("has a %s tagline and description for every project", (lng) => {
    const dict = (lng === "fr" ? fr : en).projects as Record<
      string,
      { tagline: string; description: string }
    >;
    for (const p of PROJECTS) {
      expect(dict[p.id]?.tagline?.length).toBeGreaterThan(0);
      expect(dict[p.id]?.description?.length).toBeGreaterThan(0);
    }
  });
});

describe("castles", () => {
  it("only reference existing projects that are tagged with the matching group", () => {
    for (const castle of CASTLES) {
      expect(castle.memberIds.length).toBeGreaterThan(0);
      for (const id of castle.memberIds) {
        const p = projectById(id);
        expect(p, `missing project ${id}`).toBeDefined();
        expect(p?.group).toBe(castle.id);
      }
    }
  });
});
