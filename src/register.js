// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------
import { pickerDefine } from "./card-picker.js";
import { VERSION } from "./core.js";
import { CloudCard } from "./full-card.js";
import { CloudMiniCard } from "./mini-card.js";
import { CloudCardEditor, CloudMiniCardEditor } from "./visual-editors.js";

export const define = (name, cls) => {
  if (!customElements.get(name)) pickerDefine(name, cls);
};
define("cloud-card", CloudCard);
define("cloud-mini-card", CloudMiniCard);
define("cloud-card-editor", CloudCardEditor);
define("cloud-mini-card-editor", CloudMiniCardEditor);

window.customCards = window.customCards || [];
for (const card of [
  {
    type: "cloud-card",
    name: "Cloud Card",
    description: "Home Assistant Cloud (Nabu Casa) and remote access: connection, latency, availability, certificate and services, under an animated banner.",
  },
  {
    type: "cloud-mini-card",
    name: "Cloud Mini Card",
    description: "Home Assistant Cloud at a glance (connection, latency, certificate, what needs a look), with a detail button to the full card.",
  },
]) {
  if (!window.customCards.some((c) => c.type === card.type))
    window.customCards.push({ ...card, preview: true, documentationURL: "https://github.com/juju35/ha-cloud-card" });
}

console.info(
  `%c CLOUD-CARD %c v${VERSION} `,
  "color: white; background: #2f80ed; font-weight: 700;",
  "color: #2f80ed; background: white; font-weight: 700;",
);
