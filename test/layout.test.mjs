// Browser test (Chromium through Playwright) of the cards' layout: at their minimum width (8 columns of a sections
// view on a phone for the full card, 6 for the mini card) and wider, in long languages and both themes, with and
// without the illustration, connected and cut off: nothing leaves the card, no text lies under the scene, the header
// icon keeps its 40 px, and the service popup opens at the top of the card.
// Skipped when Playwright or Chromium is not installed, except in CI, where it must run.
import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { LATENCY, mockHass, NOW } from "../scripts/screenshots/mock.mjs";
import { source } from "./source.mjs";

const src = source;
const THEMES = {
  light: { "--card-background-color": "#fff", "--secondary-background-color": "#f1f1f1", "--primary-text-color": "#212121", "--secondary-text-color": "#727272" },
  dark: { "--card-background-color": "#1c1c1c", "--secondary-background-color": "#282828", "--primary-text-color": "#e1e1e1", "--secondary-text-color": "#9b9b9b" },
};
const HA_CARD = `customElements.define("ha-card", class extends HTMLElement { constructor() { super();
  this.attachShadow({ mode: "open" }).innerHTML = "<style>:host{display:block;overflow:hidden;background:var(--card-background-color);color:var(--primary-text-color)}</style><slot></slot>"; } });`;

let browser;
let skip = false;
before(async () => {
  try {
    const { chromium } = await import("playwright");
    browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  } catch (err) {
    if (process.env.CI) throw err;
    skip = `Chromium not available: ${err.message.split("\n")[0]}`;
  }
});
after(() => browser?.close());

const TEXTS = [".name", ".stats span", ".chip", ".hst", ".renew", ".lbl", ".val", ".tile", ".tname", ".tstate", ".btn", ".mtitle", ".st", ".r", ".modal"];

const measure = async (cases) => {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.setFixedTime(new Date(NOW));
  await page.setContent("<!doctype html><body style='margin:0;font-family:Roboto,Arial,sans-serif'></body>");
  await page.addScriptTag({ content: HA_CARD });
  await page.addScriptTag({ content: src });
  await page.evaluate((ms) => {
    customElements.get("cloud-card").probe = async () => ms;
  }, LATENCY);
  const hass = { connected: mockHass(), disconnected: mockHass({ variant: "disconnected" }) };
  const out = await page.evaluate(
    async ({ cases, hass, THEMES, TEXTS }) => {
      const results = [];
      for (const c of cases) {
        const box = document.createElement("div");
        box.style.cssText = `width:${c.width}px;${Object.entries(THEMES[c.theme]).map(([k, v]) => `${k}:${v}`).join(";")}`;
        document.body.appendChild(box);
        const el = document.createElement(c.type);
        el.setConfig({ type: `custom:${c.type}`, language: c.lang, ...c.config });
        const h = hass[c.variant || "connected"];
        el.hass = { ...h, themes: { darkMode: c.theme === "dark" }, callWS: async (m) => h.__ws[m.type], callApi: async () => ({}) };
        box.appendChild(el);
        for (let i = 0; i < 10; i++) await new Promise((r) => setTimeout(r, 10));
        const sr = el.shadowRoot;
        const click = (sel) => sr.querySelector(sel)?.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true, detail: 1 }));
        if (c.zoom) click(".zoom");
        if (c.detail) click(".tile");
        const card = sr.querySelector("ha-card").getBoundingClientRect();
        const shown = (n) => n.getClientRects().length > 0 && getComputedStyle(n).display !== "none";
        const out = [];
        for (const sel of TEXTS) {
          for (const n of sr.querySelectorAll(sel)) {
            if (!shown(n)) continue;
            const r = n.getBoundingClientRect();
            if (r.left < card.left - 1 || r.right > card.right + 1) out.push(`${sel} [${Math.round(r.left)}..${Math.round(r.right)}] out of [${Math.round(card.left)}..${Math.round(card.right)}]`);
          }
        }
        const head = sr.querySelector(".head");
        const scene = sr.querySelector(".scene");
        let underScene = false;
        if (head && scene && shown(scene)) {
          const sl = scene.getBoundingClientRect().left;
          for (const n of head.querySelectorAll(".name, .stats span, .hst")) if (shown(n) && n.getBoundingClientRect().right > sl + 1) underScene = true;
        }
        // The status pill after the title: its whole label from 245 px, the title keeping a few characters.
        const pill = sr.querySelector(".hst");
        const txt = pill?.querySelector(".txt");
        const pillLabel = pill ? txt.getBoundingClientRect().width > 1 && txt.scrollWidth <= txt.clientWidth + 0.5 : null;
        const nameW = pill ? Math.round(sr.querySelector(".trow .name").getBoundingClientRect().width) : null;
        const badge = sr.querySelector(".badge")?.getBoundingClientRect();
        const modal = sr.querySelector(".modal")?.getBoundingClientRect();
        results.push({
          name: `${c.type} ${c.width}px ${c.lang} ${c.theme} ${JSON.stringify(c.config)}${c.zoom ? " zoom" : ""}${c.detail ? " detail" : ""} ${c.variant || ""}`,
          out,
          underScene,
          badge: badge ? [Math.round(badge.width), Math.round(badge.height)] : null,
          modalTop: modal ? Math.round(modal.top - card.top) : null,
          tiles: sr.querySelectorAll(".tile").length,
          width: c.width,
          pillLabel,
          nameW,
        });
        box.remove();
      }
      return results;
    },
    { cases, hass, THEMES, TEXTS },
  );
  await page.close();
  return { out, errors };
};

const matrix = () => {
  const cases = [];
  for (const theme of ["light", "dark"]) {
    for (const lang of ["en", "de", "el"]) {
      for (const width of [208, 300, 460]) {
        for (const variant of ["connected", "disconnected"]) {
          cases.push({ type: "cloud-card", width, lang, theme, variant, config: {} });
        }
        cases.push({ type: "cloud-card", width, lang, theme, config: { illustration: false } });
        cases.push({ type: "cloud-card", width, lang, theme, config: {}, detail: true });
      }
      for (const width of [156, 380]) {
        for (const variant of ["connected", "disconnected"]) cases.push({ type: "cloud-mini-card", width, lang, theme, variant, config: {} });
        cases.push({ type: "cloud-mini-card", width: width + 52, lang, theme, config: {}, zoom: true });
      }
    }
  }
  return cases;
};

test("nothing leaves the card, no text under the scene, 40 px header icon, popup at the top", async (t) => {
  if (skip) return t.skip(skip);
  const { out, errors } = await measure(matrix());
  assert.deepEqual(errors, []);
  const bad = [];
  for (const r of out) {
    if (r.out.length) bad.push(`${r.name}: ${r.out.join("; ")}`);
    if (r.underScene) bad.push(`${r.name}: text under the scene`);
    if (r.badge && (r.badge[0] !== 40 || r.badge[1] !== 40) && !r.name.includes("detail")) bad.push(`${r.name}: badge ${r.badge}`);
    if (r.modalTop !== null && r.modalTop > 20) bad.push(`${r.name}: popup ${r.modalTop}px from the top`);
    if (r.name.startsWith("cloud-card") && r.tiles !== 6) bad.push(`${r.name}: ${r.tiles} tiles`);
    if (r.pillLabel === null) bad.push(`${r.name}: no status pill`);
    else if (r.width >= 245 && !r.pillLabel) bad.push(`${r.name}: status pill label cut`);
    if (r.nameW !== null && r.nameW < 30) bad.push(`${r.name}: title ${r.nameW}px`);
  }
  assert.deepEqual(bad, []);
});
