export type Browser = "chrome" | "firefox" | "safari" | "edge";

/** Best-effort current-browser detection (order matters: Edge & Chrome UAs
 * both contain "Chrome"; Chrome's UA also contains "Safari"). */
export function getBrowser(): Browser {
  if (typeof navigator === "undefined") return "chrome";
  const ua = navigator.userAgent;
  if (/firefox|fxios/i.test(ua)) return "firefox";
  if (/edg\//i.test(ua)) return "edge";
  if (/chrome|chromium|crios/i.test(ua)) return "chrome";
  if (/safari/i.test(ua)) return "safari";
  return "chrome";
}

/** TheCode extension store listing per browser (Edge runs Chrome extensions;
 * Safari ships the extension inside the Apple app). */
export const EXTENSION_URL: Record<Browser, string> = {
  chrome: "https://chromewebstore.google.com/detail/thecode/jeknefpalcipdlnbeboefonmnlejepen",
  edge: "https://chromewebstore.google.com/detail/thecode/jeknefpalcipdlnbeboefonmnlejepen",
  firefox: "https://addons.mozilla.org/fr/firefox/addon/thecode/",
  safari: "https://apps.apple.com/app/thecode-password-manager/id6753169043",
};
