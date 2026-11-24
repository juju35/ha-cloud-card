// ---------------------------------------------------------------------------
// The mini card: status and chips; its detail button unfolds the full card
// ---------------------------------------------------------------------------
import { ICONS } from "./core.js";
import { esc, plural, svgIcon } from "./helpers.js";
import { inDialog, watchOutside } from "./shadow-dom-patching.js";
import { MINI_STYLE, STYLE, ZOOM_STYLE } from "./styles.js";
import { CloudCard } from "./full-card.js";

export class CloudMiniCard extends CloudCard {
  constructor() {
    super();
    this._zoomed = false;
    this._onFold = (ev) => {
      // The click that closed the popup only closes the popup.
      if (this._detailClosedBy === ev) return;
      if (this._zoomed && !inDialog(ev)) this._setZoom(false);
    };
  }

  static getConfigElement() {
    return document.createElement("cloud-mini-card-editor");
  }

  connectedCallback() {
    super.connectedCallback();
    (this._foldWatch ??= watchOutside(this, (ev) => this._onFold(ev))).on();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this._foldWatch?.off();
    this._zoomed = false;
  }

  getCardSize() {
    return this._zoomed ? super.getCardSize() : this._config?.illustration === false ? 1 : 2;
  }

  getGridOptions() {
    return this._zoomed ? super.getGridOptions() : { columns: 6, min_columns: 6 };
  }

  _setZoom(zoomed) {
    this._zoomed = zoomed;
    if (!zoomed) {
      this._detail = null;
      window.removeEventListener("keydown", this._onKey);
    }
    this._update(this._sig);
  }

  _click(ev) {
    if (!this._detail && ev.composedPath().some((n) => n.classList?.contains("zoom"))) {
      ev.stopPropagation();
      this._setZoom(!this._zoomed);
      if (ev.detail === 0) this.shadowRoot.querySelector(".zoom")?.focus({ preventScroll: true });
      return;
    }
    super._click(ev);
  }

  _extraStyle() {
    return this._zoomed ? ZOOM_STYLE : "";
  }

  _zoomButton(cls = "") {
    if (this._config.zoom === false) return "";
    const z = this._zoomed;
    const label = esc(this._t(z ? "zoom_out" : "zoom_in"));
    return `<button class="zoom ${cls}" title="${label}" aria-label="${label}" aria-expanded="${z}">${svgIcon(z ? ICONS.collapse : ICONS.expand)}</button>`;
  }

  // Latency, certificate days, then what needs a look: the remote access down, the services to check.
  _miniChips(m) {
    const chip = (icon, text, level = "ok", pill = false) =>
      `<span class="r ${level}${pill ? " pill" : ""}" title="${esc(text)}">${svgIcon(icon)}<span>${esc(text)}</span></span>`;
    const out = [];
    const r = m.remote;
    if (r?.enabled && !r.connected && m.kind !== "unknown") {
      out.push(chip(ICONS.remoteOff, r.since ? this._t("remote_down_for", { d: this._duration(this._now() - r.since) }) : this._t("remote_down"), "alert", true));
    }
    if (m.latency !== null && m.latency !== undefined) out.push(chip(ICONS.timer, `${this._number(m.latency, 0)} ms`));
    if (m.cert) out.push(chip(ICONS.lock, this._t("cert_short", { n: m.cert.days }), m.cert.level, m.cert.level !== "ok"));
    const others = m.tiles.filter((x) => x.key !== "remote" && (x.level === "warn" || x.level === "alert"));
    if (others.length) {
      const level = others.some((x) => x.level === "alert") ? "alert" : "warn";
      out.push(chip(ICONS.alert, plural(this._hass, this._config, "check", others.length), level, true));
    }
    return out.join("");
  }

  _render() {
    if (this._zoomed) return super._render();
    const m = this._model();
    const st = this._status(m);
    const chips = this._miniChips(m);
    if (this._config.illustration !== false) {
      // The same banner as the full card, with the short title and the status pill; the chips below it.
      return `<style>${STYLE}${MINI_STYLE}</style>
      <ha-card class="minib">
        ${this._banner(m, this._titleBlock(m, true))}
        ${chips ? `<div class="mchips"><div class="rs">${chips}</div></div>` : ""}
      </ha-card>`;
    }
    return `<style>${STYLE}${MINI_STYLE}</style>
      <ha-card class="minic">
        <div class="mini">
          <div class="badge ${st.cls}" title="${esc(st.text)}">${svgIcon(this._badgeIcon(m))}</div>
          <div class="mbody">
            <div class="mrow">
              <div class="mtitle">${esc(this._title(true))}</div>
              <span class="st ${st.cls}">${esc(st.text)}</span>
              ${this._zoomButton()}
            </div>
            <div class="rs">${chips}</div>
          </div>
        </div>
      </ha-card>`;
  }
}
