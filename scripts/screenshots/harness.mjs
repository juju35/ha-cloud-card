// Shared by the screenshot scripts: theme variables, the <ha-card> stand-in, a fixed clock and the render loop.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { LATENCY, mockHass, NOW } from "./mock.mjs";

export const root = fileURLToPath(new URL("../..", import.meta.url));
// Read on first use: the tests import writeIfChanged without a built bundle.
let bundle;
const cardJs = () => (bundle ??= readFileSync(`${root}dist/cloud-card.js`, "utf8"));

const THEMES = {
  light: {
    "--primary-background-color": "#e8eaed", "--secondary-background-color": "#f1f1f1", "--card-background-color": "#ffffff",
    "--primary-text-color": "#212121", "--secondary-text-color": "#727272", "--divider-color": "rgba(0,0,0,.12)",
  },
  dark: {
    "--primary-background-color": "#111111", "--secondary-background-color": "#282828", "--card-background-color": "#1c1c1c",
    "--primary-text-color": "#e1e1e1", "--secondary-text-color": "#9b9b9b", "--divider-color": "rgba(225,225,225,.12)",
  },
};
const COMMON = { "--primary-color": "#03a9f4", "--success-color": "#43a047", "--warning-color": "#ffa600", "--error-color": "#db4437" };

export const HA_CARD = `customElements.define("ha-card", class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" }).innerHTML =
      "<style>:host{display:block;background:var(--ha-card-background,var(--card-background-color));" +
      "border-radius:var(--ha-card-border-radius,12px);border:1px solid var(--divider-color);color:var(--primary-text-color);overflow:hidden}</style><slot></slot>";
  }
});`;

const pageHtml = (theme, width) => `<!doctype html><html><head><meta charset="utf-8">
<style>
  :root { ${Object.entries({ ...THEMES[theme], ...COMMON }).map(([k, v]) => `${k}:${v};`).join("")} }
  body { margin: 0; padding: 16px; background: var(--primary-background-color); color: var(--primary-text-color);
         font-family: Roboto, "Segoe UI", Helvetica, Arial, sans-serif; width: ${width}px; }
</style></head><body><div id="root"></div></body></html>`;

// A light shot and its dark twin, both in English.
export const pair = (file, extra = {}) => [
  { file, theme: "light", ...extra },
  { file: `${file}-dark`, theme: "dark", ...extra },
];

export const launch = () => chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

// A page ready to host a card, its clock fixed at the mock's NOW (the timers keep running) and the latency probe
// answering the mock's value (no network).
export const openPage = async (browser, { theme, width, label = "" }) => {
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 1400 } });
  page.on("pageerror", (err) => console.error(`pageerror${label ? ` (${label})` : ""}: ${err.message}`));
  await page.clock.setFixedTime(new Date(NOW));
  await page.setContent(pageHtml(theme, width));
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: cardJs() });
  await page.evaluate((ms) => {
    customElements.get("cloud-card").probe = async () => ms;
  }, LATENCY);
  return page;
};

// Creates the card in the page (its callWS answering the mock's websocket answers), then clicks each selector of
// `clicks` (a mouse click: no focus ring in the shot).
export const mountCard = (page, { tag, config, dark = false, variant, clicks = [] }) =>
  page.evaluate(
    async ({ tag, config, hass, clicks }) => {
      const ws = hass.__ws;
      const el = document.createElement(tag);
      el.setConfig({ type: `custom:${tag}`, ...config });
      el.hass = {
        ...hass,
        callWS: async (msg) => (msg.type in ws ? ws[msg.type] : Promise.reject({ code: "unknown_command" })),
        callApi: async () => ({}),
        callService: async () => {},
      };
      document.getElementById("root").appendChild(el);
      // The answers come in over a few ticks: let them all land before clicking.
      for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 20));
      for (const sel of clicks) el.shadowRoot.querySelector(sel).dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
    },
    { tag, config, hass: mockHass({ dark, variant }), clicks },
  );

// The card on the theme background, with the body's 16px padding around it; `banner` clips to the illustration.
export const cardClip = async (page, width, { banner = false } = {}) => {
  const box = await page.locator("#root").boundingBox();
  if (!banner) return { x: 0, y: 0, width: width + 32, height: Math.ceil(box.height) + 32 };
  const h = await page.evaluate(() => {
    const el = document.querySelector("#root > *");
    const b = el.shadowRoot.querySelector(".banner") || el.shadowRoot.querySelector("ha-card");
    return b.getBoundingClientRect().bottom;
  });
  return { x: 0, y: 0, width: width + 32, height: Math.ceil(h) };
};

// The period every animation of the cards divides.
export const PERIOD = 8000;

// Pauses every CSS animation of the page at `frac` of the 8 s period (every animation of the cards lasts a divisor
// of it, so a recording stepped this way loops seamlessly at its real speed). The cards' shadow trees are walked by hand.
export const freeze = (page, frac) =>
  page.evaluate(
    ({ f, period }) => {
      const anims = [];
      const walk = (root) => {
        for (const el of root.querySelectorAll("*")) {
          anims.push(...el.getAnimations());
          if (el.shadowRoot) walk(el.shadowRoot);
        }
      };
      walk(document);
      for (const a of anims) {
        a.pause();
        a.currentTime = 3 * period + f * period;
      }
    },
    { f: frac, period: PERIOD },
  );

// Writes a PNG screenshot to `path` only when its pixels differ from the file already there. PNG encoding is not
// byte-stable from one run (or machine) to the next: comparing bytes would commit pictures that did not change.
export const writeIfChanged = async (page, path, png) => {
  if (existsSync(path)) {
    const same = await page.evaluate(
      async ([a, b]) => {
        const pixels = async (b64) => {
          const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
          const bmp = await createImageBitmap(blob, { colorSpaceConversion: "none", premultiplyAlpha: "none" });
          const ctx = new OffscreenCanvas(bmp.width, bmp.height).getContext("2d");
          ctx.drawImage(bmp, 0, 0);
          return { w: bmp.width, h: bmp.height, d: ctx.getImageData(0, 0, bmp.width, bmp.height).data };
        };
        const [x, y] = await Promise.all([pixels(a), pixels(b)]);
        if (x.w !== y.w || x.h !== y.h) return false;
        for (let i = 0; i < x.d.length; i++) if (x.d[i] !== y.d[i]) return false;
        return true;
      },
      [readFileSync(path).toString("base64"), png.toString("base64")],
    );
    if (same) return false;
  }
  // A new repository has no screenshots/ yet.
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, png);
  return true;
};
