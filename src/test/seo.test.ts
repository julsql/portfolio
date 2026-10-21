import { describe, expect, it } from "vitest";
import html from "../../index.html?raw";
import robots from "../../public/robots.txt?raw";
import sitemapXml from "../../public/sitemap.xml?raw";

const publicFiles = Object.keys(import.meta.glob("../../public/*.{png,svg}")).map((k) =>
  k.replace("../../public", ""),
);
const doc = new DOMParser().parseFromString(html, "text/html");

const meta = (sel: string) => doc.querySelector(sel)?.getAttribute("content") ?? "";

describe("index.html SEO metadata", () => {
  it("declares lang, title and description within recommended lengths", () => {
    expect(doc.documentElement.lang).toBe("fr");
    const title = doc.title;
    expect(title.length).toBeGreaterThanOrEqual(50);
    expect(title.length).toBeLessThanOrEqual(60);
    const desc = meta('meta[name="description"]');
    expect(desc.length).toBeGreaterThanOrEqual(140);
    expect(desc.length).toBeLessThanOrEqual(160);
  });

  it("has canonical, icons and theme-color, and no noindex", () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
      "https://julsql.fr/",
    );
    expect(doc.querySelector('link[rel="icon"]')).not.toBeNull();
    expect(doc.querySelector('link[rel="apple-touch-icon"]')).not.toBeNull();
    expect(meta('meta[name="theme-color"]')).not.toBe("");
    expect(html).not.toMatch(/noindex/i);
  });

  it("has Open Graph and Twitter Card tags with absolute image URLs", () => {
    for (const p of ["og:title", "og:description", "og:image", "og:url", "og:type", "og:locale"]) {
      expect(meta(`meta[property="${p}"]`), p).not.toBe("");
    }
    expect(meta('meta[property="og:image"]')).toMatch(/^https:\/\/julsql\.fr\/.+\.png$/);
    expect(meta('meta[name="twitter:card"]')).toBe("summary_large_image");
    expect(meta('meta[name="twitter:image"]')).toMatch(/^https:\/\//);
  });

  it("references image files that exist in public/", () => {
    const paths = [
      meta('meta[property="og:image"]').replace("https://julsql.fr", ""),
      doc.querySelector('link[rel="apple-touch-icon"]')!.getAttribute("href")!,
      doc.querySelector('link[rel="icon"]')!.getAttribute("href")!,
    ];
    for (const p of paths) expect(publicFiles, p).toContain(p);
  });

  it("embeds valid JSON-LD with Person and WebSite", () => {
    const raw = doc.querySelector('script[type="application/ld+json"]')?.textContent ?? "";
    const data = JSON.parse(raw);
    const types = data["@graph"].map((n: { "@type": string }) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Person", "WebSite"]));
  });

  it("ships robots.txt and sitemap.xml pointing at the canonical host", () => {
    expect(robots).toContain("Sitemap: https://julsql.fr/sitemap.xml");
    const sitemap = new DOMParser().parseFromString(sitemapXml, "application/xml");
    expect(sitemap.querySelector("parsererror")).toBeNull();
    const locs = [...sitemap.getElementsByTagName("loc")].map((l) => l.textContent);
    expect(locs).toContain("https://julsql.fr/");
  });
});
