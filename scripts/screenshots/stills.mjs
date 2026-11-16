// Renders the cards with the mock account (scripts/screenshots/mock.mjs) into screenshots/*.png, light and dark.
// Usage: npm install && npm run build && node scripts/screenshots/stills.mjs
// The animations are paused at a chosen moment of their cycle (`at`).
import { cardClip, freeze, launch, mountCard, openPage, pair, root, writeIfChanged } from "./harness.mjs";
import { STILLS } from "./list.mjs";

const FULL = 460;
const MINI = 380;
const shots = [
  // Connected, day sky: the data flowing house → cloud → phone.
  ...pair("card", { tag: "cloud-card", config: { illustration_theme: "day" } }),
  // The cloud cut off: red cross, the flow stopped, the remote access down.
  ...pair("card-disconnected", { tag: "cloud-card", config: { illustration_theme: "day" }, variant: "disconnected" }),
  // Night sky.
  ...pair("card-night", { tag: "cloud-card", config: { illustration_theme: "night" } }),
  // The popup of a service, at the top of the card.
  ...pair("card-detail", { tag: "cloud-card", config: { illustration_theme: "day", hide_url: true }, clicks: ['.tile[data-tile="remote"]'] }),
  // Without the illustration: the classic header.
  ...pair("card-classic", { tag: "cloud-card", config: { illustration: false } }),
  // The mini card, connected and cut off, and unfolded by its detail button.
  ...pair("mini-card", { tag: "cloud-mini-card", config: {}, width: MINI }),
  ...pair("mini-card-disconnected", { tag: "cloud-mini-card", config: {}, variant: "disconnected", width: MINI }),
  ...pair("mini-card-zoom", { tag: "cloud-mini-card", config: { illustration_theme: "day" }, clicks: [".zoom"] }),
];
if (shots.length !== STILLS.length * 2 || shots.some((s) => !STILLS.includes(s.file.replace(/-dark$/, "")))) throw new Error("stills: list.mjs out of date");

const browser = await launch();
for (const s of shots) {
  const width = s.width ?? FULL;
  const page = await openPage(browser, { theme: s.theme, width, label: s.file });
  await mountCard(page, { tag: s.tag, config: s.config, dark: s.theme === "dark", variant: s.variant, clicks: s.clicks });
  await page.waitForTimeout(300);
  await freeze(page, s.at ?? 0.3);
  const out = `screenshots/${s.file}.png`;
  const png = await page.screenshot({ clip: await cardClip(page, width), animations: "allow" });
  console.log(`${out}${(await writeIfChanged(page, `${root}${out}`, png)) ? "" : " (unchanged)"}`);
  await page.close();
}
await browser.close();
