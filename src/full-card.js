// ---------------------------------------------------------------------------
// The full card
// ---------------------------------------------------------------------------
import { BRANDS, ICONS } from "./core.js";
import { DAY, clamp, esc, fmtLang, maskUrl, plural, svgIcon, t, textWidth } from "./helpers.js";
import { ASSISTANTS, CERT_SPAN, EVERY, buildModel, cloudBackup, discover, exposedCount, uptimeOf } from "./home-assistant-cloud.js";
import { inDialog, morph, navigate, watchOutside } from "./shadow-dom-patching.js";
import { sceneSvg } from "./illustration.js";
import { STYLE } from "./styles.js";

export let _ccUid = 0;

export const TILE_ICONS = { remote: "remote", backup: "backup", alexa: "mic", google: "mic", webhooks: "webhook", tts: "tts" };

export class CloudCard extends HTMLElement {
  // Round trip (ms) from the browser to Home Assistant through its remote URL: Home Assistant does not expose any
  // latency of its own. The first request opens the connection (DNS, TLS through the relay), the best of the next two
  // is kept. An opaque (no-cors) GET of the public manifest, without credentials. Replaced in the screenshots.
  static async probe(url) {
    const once = async () => {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), 5000);
      const t0 = performance.now();
      try {
        await fetch(`${url}/manifest.json?cc=${Date.now()}`, { mode: "no-cors", cache: "no-store", credentials: "omit", signal: ctl.signal });
        return performance.now() - t0;
      } finally {
        clearTimeout(timer);
      }
    };
    await once();
    return Math.round(Math.min(await once(), await once()));
  }

  constructor() {
    super();
    this._uid = ++_ccUid;
    this.attachShadow({ mode: "open" });
    this._html = "";
    this._data = { status: null, statusError: null, subscription: null, backups: null, exposed: null, uptime: null, latency: null };
    this._at = {};
    this._busy = {};
    this._detail = null;
    this._syncing = false;
    this.shadowRoot.addEventListener("click", (ev) => this._click(ev));
    this._onKey = (ev) => {
      if (this._detail && ev.key === "Escape") {
        ev.stopPropagation();
        this._closeDetail(true);
      }
    };
    // A click elsewhere on the page closes the popup (and only that: a zoomed mini card stays zoomed).
    this._onOutside = (ev) => {
      if (this._detail && !inDialog(ev)) {
        this._detailClosedBy = ev;
        this._closeDetail(false);
      }
    };
  }

  static getConfigElement() {
    return document.createElement("cloud-card-editor");
  }

  static getStubConfig() {
    return {};
  }

  getCardSize() {
    return 7;
  }

  // 8 columns: 208 px on a phone.
  getGridOptions() {
    return { columns: 12, min_columns: 8 };
  }

  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = { ...config };
    this._html = "";
    this._update();
  }

  set hass(hass) {
    const prev = this._hass;
    this._hass = hass;
    if (!this._config) return;
    // The Remote UI sensor changed: the cloud status is read again at once.
    const id = discover(hass, this._config).remote;
    if (prev && id && prev.states?.[id] !== hass.states?.[id]) this._at.status = 0;
    this._refresh();
    const sig = this._signature();
    if (this._sig && sig.length === this._sig.length && sig.every((v, i) => v === this._sig[i])) return;
    this._update(sig);
  }

  get hass() {
    return this._hass;
  }

  connectedCallback() {
    this._live = true;
    (this._outsideWatch ??= watchOutside(this, (ev) => this._onOutside(ev))).on();
    // A new width (or the web font loaded): the status pill is fitted again, in the next frame.
    if (typeof ResizeObserver === "function") {
      this._pillResize ??= new ResizeObserver((entries) => {
        const w = Math.round(entries.at(-1).contentRect.width);
        if (w === this._pillWidth) return;
        this._pillWidth = w;
        cancelAnimationFrame(this._pillFrame);
        this._pillFrame = requestAnimationFrame(() => this._fitPill());
      });
      this._pillResize.observe(this);
    }
    document.fonts?.ready?.then(() => this._fitPill());
    // The sources are read again on their own schedule (EVERY), the durations follow the clock: checked every 30 s.
    clearInterval(this._timer);
    this._timer = setInterval(() => {
      this._refresh();
      this._update();
    }, 30000);
    this._refresh();
    this._update();
  }

  disconnectedCallback() {
    this._live = false;
    this._pillResize?.disconnect();
    this._pillWidth = null;
    if (this._pillFrame) cancelAnimationFrame(this._pillFrame);
    this._pillFrame = null;
    this._outsideWatch?.off();
    clearInterval(this._timer);
    // Left (another view, a conditional card hidden): the popup closes without anything else.
    this._detail = null;
    window.removeEventListener("keydown", this._onKey);
  }

  _t(key, vars) {
    return t(this._hass, this._config, key, vars);
  }

  _loc() {
    return fmtLang(this._hass, this._config);
  }

  _now() {
    return Date.now();
  }

  _admin() {
    return this._hass?.user?.is_admin === true;
  }

  // ── Data ──

  // Reads every source that is due. Administrators only for the subscription, the backups and the exposed entities
  // (Home Assistant refuses them to other users): the others see what cloud/status and the entities tell.
  _refresh() {
    const h = this._hass;
    if (!this._live || !h?.callWS || !this._config) return;
    const now = this._now();
    const due = (k) => !this._busy[k] && now - (this._at[k] ?? -Infinity) >= EVERY[k];
    if (due("status")) this._fetch("status", () => h.callWS({ type: "cloud/status" }));
    const s = this._data.status;
    if (s?.logged_in && h.user?.is_admin !== false) {
      if (due("subscription")) this._fetch("subscription", () => h.callWS({ type: "cloud/subscription" }));
      if (due("backups")) this._fetch("backups", () => h.callWS({ type: "backup/info" }));
      if (due("exposed")) this._fetch("exposed", () => h.callWS({ type: "homeassistant/expose_entity/list" }));
    }
    const remote = discover(h, this._config).remote;
    if (remote && due("uptime")) this._fetch("uptime", () => this._history(remote));
    const visible = typeof document === "undefined" || document.visibilityState !== "hidden";
    if (s?.remote_connected && s.remote_domain && this._config.latency !== false && visible && due("latency")) {
      this._fetch("latency", () => this.constructor.probe(`https://${s.remote_domain}`));
    }
  }

  _fetch(key, fn) {
    this._busy[key] = true;
    this._at[key] = this._now();
    Promise.resolve()
      .then(fn)
      .then(
        (v) => {
          this._data[key] = v ?? null;
          if (key === "status") this._data.statusError = null;
        },
        (err) => {
          // No cloud integration: its commands are unknown. Any other error keeps the last values read.
          if (key === "status" && err?.code === "unknown_command") {
            this._data.status = null;
            this._data.statusError = "not_loaded";
          }
          if (key === "latency") this._data.latency = null;
        },
      )
      .finally(() => {
        this._busy[key] = false;
        // The status tells what else to read (signed in, remote connected): read it now rather than at the next tick.
        if (key === "status") this._refresh();
        this._update();
      });
  }

  async _history(id) {
    const end = this._now();
    const start = end - clamp(this._config.uptime_days, 1, 30, 30) * DAY;
    const res = await this._hass.callWS({
      type: "history/history_during_period",
      start_time: new Date(start).toISOString(),
      end_time: new Date(end).toISOString(),
      entity_ids: [id],
      minimal_response: true,
      no_attributes: true,
      significant_changes_only: false,
    });
    return uptimeOf(res?.[id] || [], start, end);
  }

  // ── Formatting ──

  _tz() {
    const h = this._hass;
    return h?.locale?.time_zone === "local" ? undefined : h?.config?.time_zone;
  }

  _fmt(opts, ms) {
    const tz = this._tz();
    try {
      return new Intl.DateTimeFormat(this._loc(), { ...opts, ...(tz ? { timeZone: tz } : {}) }).format(new Date(ms));
    } catch (_e) {
      return new Date(ms).toISOString().slice(0, 16).replace("T", " ");
    }
  }

  _clock(ms) {
    const tf = this._hass?.locale?.time_format;
    return this._fmt({ hour: "2-digit", minute: "2-digit", ...(tf === "12" ? { hour12: true } : tf === "24" ? { hourCycle: "h23" } : {}) }, ms);
  }

  // "Today 03:12", "Yesterday 03:12", else the date.
  _when(ms) {
    const day = (x) => this._fmt({ year: "numeric", month: "2-digit", day: "2-digit" }, x);
    const now = this._now();
    if (day(ms) === day(now)) return this._t("today", { time: this._clock(ms) });
    if (day(ms) === day(now - DAY)) return this._t("yesterday", { time: this._clock(ms) });
    return this._fmt({ day: "numeric", month: "short" }, ms);
  }

  _date(ms) {
    return this._fmt({ day: "numeric", month: "short", year: "numeric" }, ms);
  }

  _number(v, digits) {
    try {
      return new Intl.NumberFormat(this._loc(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v);
    } catch (_e) {
      return v.toFixed(digits);
    }
  }

  // A size in bytes, base 1024 with IEC units (ha-* convention):
  // 2 decimals under 10, 1 under 100, none above ("1.46 GiB", "48.9 MiB", "512 KiB").
  _size(bytes) {
    const units = ["B", "KiB", "MiB", "GiB", "TiB"];
    let v = Math.max(0, bytes);
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${this._number(v, i === 0 || v >= 100 ? 0 : v >= 10 ? 1 : 2)} ${units[i]}`;
  }

  _duration(ms) {
    const min = Math.max(1, Math.round(ms / 60000));
    if (min < 60) return this._t("minutes", { n: min });
    if (min < 48 * 60) return this._t("hours", { n: Math.round(min / 60) });
    return this._t("days", { n: Math.round(min / 1440) });
  }

  _language(tag) {
    try {
      const name = new Intl.DisplayNames([this._loc()], { type: "language" }).of(String(tag).split("-")[0]);
      return name ? name.charAt(0).toLocaleUpperCase(this._loc()) + name.slice(1) : tag;
    } catch (_e) {
      return tag;
    }
  }

  _model() {
    const f = {
      t: (k, v) => this._t(k, v),
      plural: (k, n) => plural(this._hass, this._config, k, n),
      date: (ms) => this._when(ms),
      size: (b) => this._size(b),
      duration: (ms) => this._duration(ms),
      language: (tag) => this._language(tag),
    };
    return buildModel(this._data, this._hass, this._config, this._now(), f);
  }

  // ── Render ──

  // What the render depends on besides the data read: language, dark mode (also the night picture), the entities and
  // the minute.
  _signature() {
    const h = this._hass;
    const e = discover(h, this._config);
    return [
      h.language,
      h.locale,
      h.themes?.darkMode,
      h.user?.is_admin,
      ...Object.values(e).map((id) => (id ? h.states?.[id] : undefined)),
      Math.floor(this._now() / 60000),
    ];
  }

  _update(sig) {
    if (!this._hass || !this._config) return;
    this._sig = sig ?? this._signature();
    const html = this._render();
    if (html !== this._html) {
      this._html = html;
      morph(this.shadowRoot, html);
    }
    this._fitPill();
  }

  // The status pill goes on the title row, right after the title, only when the whole title and the pill's whole
  // label fit there; otherwise it takes its own line under the subtitle (.pill-below) and the title keeps its row
  // (cut only when it does not fit alone). The subtitle then keeps one line (its whole text in its tooltip), and when
  // the block still runs out of the banner or into its ground strip, or the label does not fit its own line, the pill
  // keeps its dot alone (.pill-dot, the label in its tooltip and aria-label). Measured after each render and on each
  // new width, never by a fixed width, so that every language fits.
  _fitPill() {
    for (const t of this.shadowRoot?.querySelectorAll?.(".titles") || []) {
      const chips = [...t.querySelectorAll(".hst")];
      if (!chips[0]?.getBoundingClientRect) continue;
      t.classList.remove("pill-below", "pill-dot");
      const sub = t.querySelector(".stats");
      sub?.removeAttribute("title");
      if (!chips[0].querySelector(".txt")?.getClientRects().length) continue;
      const avail = t.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(chips[0].parentElement).columnGap) || 0;
      const widths = chips.map((c) => {
        const cs = getComputedStyle(c);
        return c.getBoundingClientRect().width + (parseFloat(cs.marginLeft) || 0) + (parseFloat(cs.marginRight) || 0);
      });
      if (textWidth(t.querySelector(".name")) + widths.reduce((w, c) => w + gap + c, 0) <= avail + 0.01) continue;
      t.classList.add("pill-below");
      if (sub && (sub.scrollWidth > sub.clientWidth || sub.scrollHeight > sub.clientHeight + 1)) sub.title = [...sub.children].map((c) => c.textContent).join(" · ");
      const banner = t.closest(".banner");
      const box = banner?.getBoundingClientRect();
      const floor = banner?.querySelector(".strip")?.getBoundingClientRect().top ?? box?.bottom;
      const r = t.getBoundingClientRect();
      const out = box && (r.top < box.top - 0.5 || r.bottom > floor + 0.5);
      const room = avail;
      if (out || widths.some((w) => w > room + 0.01)) t.classList.add("pill-dot");
    }
  }

  // Night illustration: forced by illustration_theme, else the theme alone (a light theme keeps the day after sunset).
  _night() {
    const mode = this._config.illustration_theme;
    if (mode === "night") return true;
    if (mode === "day") return false;
    return !!this._hass?.themes?.darkMode;
  }

  _status(m) {
    if (m.expired) return { cls: "alert", text: this._t("sub_expired") };
    const key = { connected: "connected", connecting: "connecting", disconnected: "disconnected", signed_out: "signed_out", not_set_up: "not_set_up" }[m.kind];
    const cls = { connected: "ok", connecting: "warn", disconnected: "alert" }[m.kind] ?? "idle";
    return { cls, text: this._t(key ?? "loading") };
  }

  _remoteText(m) {
    const r = m.remote;
    if (!r?.enabled) return this._t("remote_off");
    return this._t(r.connected ? "remote_on" : "remote_down");
  }

  // The line under the title; the status itself is in the pill after the title.
  _stats(m) {
    if (m.kind === "unknown" || m.kind === "not_set_up" || m.kind === "signed_out") return [];
    const parts = [this._remoteText(m)];
    if (m.latency !== null && m.latency !== undefined) parts.push(`${this._number(m.latency, 0)} ms`);
    return parts;
  }

  _title(short = false) {
    return this._config.title || this._t(short ? "title_short" : "title");
  }

  _badgeIcon(m) {
    return m.link === "ok" || m.link === "wait" ? ICONS.cloud : ICONS.cloudOff;
  }

  // The status pill of the title line, in the colour of the header icon; its label stays in its tooltip and for
  // screen readers when only its dot shows.
  _statusPill(m) {
    const st = this._status(m);
    return `<span class="chip hst ${st.cls}" title="${esc(st.text)}"><span class="dot"></span><span class="txt">${esc(st.text)}</span></span>`;
  }

  // The header's texts: the title with the status pill right after it, then the statistics (none on the mini card).
  _titleBlock(m, short = false) {
    const stats = short ? [] : this._stats(m);
    return `<div class="badge ${this._status(m).cls}" title="${esc(this._status(m).text)}">${svgIcon(this._badgeIcon(m))}</div>
      <div class="titles">
        <div class="trow"><div class="name">${esc(this._title(short))}</div>${this._statusPill(m)}</div>
        ${stats.length ? `<div class="stats">${stats.map((s) => `<span>${esc(s)}</span>`).join("")}</div>` : ""}
      </div>`;
  }

  // The pill over the scene: the latency while connected, dots while connecting, a dash when cut off.
  _pill(m) {
    if (m.link === "ok") return m.latency !== null && m.latency !== undefined ? `${this._number(m.latency, 0)} ms` : "";
    return { wait: "···", down: "—" }[m.link] ?? "";
  }

  // The banner: sky, scene and network strip, with the given texts on the left.
  _banner(m, head, zoom = true) {
    const night = this._night();
    const strip = m.link === "down" ? "down" : m.link;
    return `<div class="banner${night ? " night" : ""}${m.link === "ok" ? "" : " still"}">
      ${sceneSvg(m.link, night, this._uid, this._pill(m))}
      <div class="strip ${strip}"></div>
      <div class="head">${head}</div>
      ${zoom ? this._zoomButton(night ? "on-night" : "") : ""}
    </div>`;
  }

  _header(m) {
    if (this._config.illustration === false) return `<div class="header">${this._titleBlock(m)}${this._zoomButton("plain")}</div>`;
    return this._banner(m, this._titleBlock(m));
  }

  _chips(m) {
    // The status is in the header's pill: here, the services to check and the renewal date.
    const chips = [];
    if (m.issues) {
      const cls = m.tiles.some((x) => x.level === "alert") ? "alert" : "warn";
      chips.push(`<span class="chip ${cls}"><span class="dot"></span><span class="txt">${esc(plural(this._hass, this._config, "check", m.issues))}</span></span>`);
    }
    if (m.renewal) chips.push(`<span class="renew">${esc(this._t(m.renewal.ends ? "ends" : "renews", { date: this._date(m.renewal.date) }))}</span>`);
    return chips.length ? `<div class="chips">${chips.join("")}</div>` : "";
  }

  _indicators(m) {
    const none = "—";
    const lat = m.latency !== null && m.latency !== undefined;
    const up = m.uptime;
    const days = clamp(this._config.uptime_days, 1, 30, 30);
    const c = m.cert;
    const r = 14;
    const len = 2 * Math.PI * r;
    const arc = c ? (Math.min(CERT_SPAN, c.days) / CERT_SPAN) * len : 0;
    const certLabel = c ? `${this._t("certificate")}: ${c.days} ${this._t("unit_days")}` : this._t("certificate");
    return `<div class="inds">
      <div class="ind" title="${esc(this._t("latency_help"))}"><div>
        <div class="lbl">${esc(this._t("latency"))}</div>
        <div class="val">${lat ? `${esc(this._number(m.latency, 0))} <span class="unit">ms</span>` : none}</div>
      </div></div>
      <div class="ind" title="${esc(this._t("uptime_help"))}"><div>
        <div class="lbl">${esc(this._t("uptime", { n: up ? up.days : days }))}</div>
        <div class="val">${up ? `${esc(this._number(Math.floor(up.pct * 10) / 10, up.pct >= 100 ? 0 : 1))} <span class="unit">%</span>` : none}</div>
      </div></div>
      <div class="ind ${c ? c.level : "idle"}" title="${esc(this._t("cert_help"))}">
        <svg class="ring" viewBox="0 0 36 36" role="img" aria-label="${esc(certLabel)}">
          <circle class="track" cx="18" cy="18" r="${r}"/>
          ${c ? `<circle class="arc" cx="18" cy="18" r="${r}" stroke-dasharray="${arc.toFixed(1)} ${len.toFixed(1)}" transform="rotate(-90 18 18)"/>` : ""}
        </svg>
        <div>
          <div class="lbl">${esc(this._t("certificate"))}</div>
          <div class="val">${c ? `${c.days} <span class="unit">${esc(this._t("unit_days"))}</span>` : none}</div>
        </div>
      </div>
    </div>`;
  }

  _tileName(key) {
    return BRANDS[key] ?? this._t(key);
  }

  _tiles(m) {
    if (!m.tiles.length) return "";
    return `<div class="grid">${m.tiles
      .map((x) => {
        const icon = x.key === "remote" && x.level === "alert" ? ICONS.remoteOff : ICONS[TILE_ICONS[x.key]];
        const name = this._tileName(x.key);
        return `<button class="tile ${x.level}" data-tile="${x.key}" data-key="tile-${x.key}" title="${esc(`${name} — ${x.state}`)}">
          <span class="ic">${svgIcon(icon)}<span class="tdot"></span></span>
          <span class="txt"><span class="tname">${esc(name)}</span><span class="tstate">${esc(x.state)}</span></span>
        </button>`;
      })
      .join("")}</div>`;
  }

  _url(m) {
    const url = m.remote?.url;
    return url && this._config.hide_url === true ? maskUrl(url) : url;
  }

  _actions(m) {
    if (this._config.show_buttons === false) return "";
    const s = this._data.status;
    const buttons = [];
    if (this._admin() && m.kind === "connected" && (s?.prefs?.alexa_enabled || s?.prefs?.google_enabled)) {
      const busy = this._syncing;
      buttons.push(
        `<button class="btn" data-action="sync" data-key="sync"${busy ? ' aria-disabled="true"' : ""}>${esc(this._t(busy ? "syncing" : "sync"))}</button>`,
      );
    }
    if (m.remote?.url && m.remote.enabled) {
      buttons.push(`<button class="btn tint" data-action="open" data-key="open" title="${esc(this._url(m))}">${esc(this._t("open_url"))}</button>`);
    }
    return buttons.length ? `<div class="actions">${buttons.join("")}</div>` : "";
  }

  _message(m) {
    const key = m.kind === "not_set_up" ? "msg_not_set_up" : m.kind === "signed_out" ? "msg_signed_out" : null;
    if (!key) return `<div class="msg">${esc(this._t("loading"))}</div>`;
    const link = this._admin() ? `<div><button class="btn tint" data-action="settings">${esc(this._t("settings"))}</button></div>` : "";
    return `<div class="msg">${esc(this._t(key))}${link}</div>`;
  }

  _body(m) {
    if (!["connected", "connecting", "disconnected"].includes(m.kind)) return this._message(m);
    const c = this._config;
    return `${this._chips(m)}<div class="content">
      ${c.show_indicators === false ? "" : this._indicators(m)}
      ${c.show_services === false ? "" : this._tiles(m)}
      ${this._actions(m)}
    </div>`;
  }

  _render() {
    const m = this._model();
    return `<style>${STYLE}${this._extraStyle()}</style>
      <ha-card>
        ${this._header(m)}
        ${this._body(m)}
        ${this._detailHtml(m)}
      </ha-card>`;
  }

  _extraStyle() {
    return "";
  }

  // The full card has no detail button.
  _zoomButton() {
    return "";
  }

  // ── Detail popup ──

  _facts(key, m) {
    const s = this._data.status || {};
    const p = s.prefs || {};
    const yes = (v) => this._t(v ? "yes" : "no");
    const time = (ms) => (ms ? `${this._date(ms)} ${this._clock(ms)}` : null);
    switch (key) {
      case "remote":
        return [
          [this._t("f_url"), this._url(m)?.replace(/^https:\/\//, "")],
          [this._t("f_status"), m.tiles.find((x) => x.key === "remote")?.state],
          [this._t("f_cert"), s.remote_certificate_status ? this._t(`cs_${s.remote_certificate_status}`) : null],
          [this._t("f_expires"), m.remote.certExpires ? this._date(m.remote.certExpires) : null],
          [this._t("uptime", { n: m.uptime?.days ?? clamp(this._config.uptime_days, 1, 30, 30) }), m.uptime ? `${this._number(Math.floor(m.uptime.pct * 10) / 10, 1)} %` : null],
          [this._t("f_allow"), "remote_allow_remote_enable" in p ? yes(p.remote_allow_remote_enable) : null],
        ];
      case "backup": {
        const b = cloudBackup(this._data.backups);
        return [
          [this._t("f_last"), b?.date ? time(b.date) : m.tiles.find((x) => x.key === "backup")?.state],
          [this._t("f_size"), b?.size ? this._size(b.size) : null],
          [this._t("f_count"), b ? String(b.count) : null],
          [this._t("f_next"), b?.next ? time(b.next) : null],
        ];
      }
      case "alexa":
      case "google": {
        const n = exposedCount(this._data.exposed, ASSISTANTS[key]);
        return [
          [this._t("f_status"), m.tiles.find((x) => x.key === key)?.state],
          [this._t("f_report"), yes(p[`${key}_report_state`])],
          [this._t("f_entities"), n === null ? null : String(n)],
          ...(key === "google" && p.google_enabled ? [[this._t("f_local"), yes(s.google_local_connected)]] : []),
        ];
      }
      case "webhooks": {
        const hooks = Object.values(p.cloudhooks || {});
        return [
          [this._t("f_webhooks"), String(hooks.length)],
          [this._t("f_managed"), String(hooks.filter((x) => x?.managed).length)],
        ];
      }
      case "tts": {
        const [language, voice] = Array.isArray(p.tts_default_voice) ? p.tts_default_voice : [];
        return [
          [this._t("f_status"), m.tiles.find((x) => x.key === "tts")?.state],
          [this._t("f_language"), language ? `${this._language(language)} (${language})` : null],
          [this._t("f_voice"), voice ? String(voice).replace(/Neural$/, "") : null],
        ];
      }
      default:
        return [];
    }
  }

  _detailHtml(m) {
    const key = this._detail;
    const tile = key && m.tiles.find((x) => x.key === key);
    if (!tile) return "";
    const facts = this._facts(key, m).filter(([, v]) => v);
    const icon = key === "remote" && tile.level === "alert" ? ICONS.remoteOff : ICONS[TILE_ICONS[key]];
    const settings = this._admin() ? `<div class="actions"><button class="btn tint" data-action="settings">${esc(this._t("settings"))}</button></div>` : "";
    return `<div class="backdrop" data-action="backdrop">
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="cc-dlg-title">
        <div class="mhead">
          <div class="badge ${tile.level === "idle" ? "idle" : tile.level}">${svgIcon(icon)}</div>
          <h3 id="cc-dlg-title">${esc(this._tileName(key))}</h3>
          <button class="close" data-action="close" title="${esc(this._t("close"))}" aria-label="${esc(this._t("close"))}">${svgIcon(ICONS.close)}</button>
        </div>
        <dl class="facts">${facts.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
        ${settings}
      </div>
    </div>`;
  }

  // Opens a service's popup; from the keyboard (no click count), the focus goes to its close button.
  _openDetail(key, keyboard = false) {
    this._detail = key;
    window.addEventListener("keydown", this._onKey);
    this._update(this._sig);
    if (keyboard) this.shadowRoot.querySelector?.(".modal .close")?.focus({ preventScroll: true });
  }

  _closeDetail(refocus) {
    if (!this._detail) return;
    const key = this._detail;
    this._detail = null;
    window.removeEventListener("keydown", this._onKey);
    this._update(this._sig);
    if (refocus) this.shadowRoot.querySelector?.(`.tile[data-tile="${key}"]`)?.focus({ preventScroll: true });
  }

  _toast(message) {
    this.dispatchEvent(new CustomEvent("hass-notification", { detail: { message }, bubbles: true, composed: true }));
  }

  // Alexa (websocket cloud/alexa/sync) and Google Assistant (POST /api/cloud/google_actions/sync), the enabled ones.
  async _sync() {
    const h = this._hass;
    const p = this._data.status?.prefs || {};
    if (this._syncing || !h) return;
    this._syncing = true;
    this._update(this._sig);
    const jobs = [];
    if (p.alexa_enabled) jobs.push(h.callWS({ type: "cloud/alexa/sync" }));
    if (p.google_enabled) jobs.push(h.callApi("POST", "cloud/google_actions/sync"));
    const res = await Promise.allSettled(jobs);
    this._syncing = false;
    const failed = res.find((r) => r.status === "rejected");
    this._toast(failed ? this._t("sync_failed", { error: failed.reason?.message || failed.reason?.body?.message || String(failed.reason) }) : this._t("synced"));
    this._update(this._sig);
  }

  _click(ev) {
    const path = ev.composedPath();
    const action = path.find((n) => n.dataset?.action)?.dataset.action;
    if (this._detail) {
      // While the popup is open, its close button and the backdrop close it, its settings button opens the settings.
      if (action === "close" || (action === "backdrop" && path[0]?.dataset?.action === "backdrop")) this._closeDetail(true);
      else if (action === "settings") navigate("/config/cloud/account");
      return;
    }
    if (action === "sync") {
      this._sync();
      return;
    }
    if (action === "open") {
      const url = this._data.status?.remote_domain;
      if (url) window.open(`https://${url}`, "_blank", "noopener,noreferrer");
      return;
    }
    if (action === "settings") {
      navigate(this._data.status?.logged_in === false ? "/config/cloud/login" : "/config/cloud/account");
      return;
    }
    const tile = path.find((n) => n.dataset?.tile);
    if (tile) this._openDetail(tile.dataset.tile, ev.detail === 0);
  }
}
