// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------
import { lang, t } from "./helpers.js";

// Options on by default (left out of the YAML while on), and off by default (left out while off).
export const ON_BY_DEFAULT = ["illustration", "show_indicators", "show_services", "show_buttons", "latency", "zoom"];
export const OFF_BY_DEFAULT = ["hide_url"];
export const LANGUAGES = [
  ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["sr", "Српски"], ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português (Portugal)"], ["pl", "Polski"], ["ro", "Română"], ["da", "Dansk"],
  ["sv", "Svenska"], ["bg", "Български"], ["ru", "Русский"], ["uk", "Українська"], ["hu", "Magyar"], ["sk", "Slovenčina"],
  ["cs", "Čeština"], ["sl", "Slovenščina"], ["lv", "Latviešu"], ["el", "Ελληνικά"],
];

export class CloudCardEditor extends HTMLElement {
  static get mini() {
    return false;
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // The mini card's editor has the full card's options too: its unfolded view uses them.
  _schema() {
    const tr = (k) => t(this._hass, this._config, k);
    const toggles = ["illustration", "show_indicators", "show_services", "show_buttons", "latency", "hide_url"];
    if (this.constructor.mini) toggles.unshift("zoom");
    return [
      { name: "title", selector: { text: {} } },
      { name: "remote_entity", selector: { entity: { domain: "binary_sensor", integration: "cloud" } } },
      {
        type: "grid",
        name: "",
        schema: [
          {
            name: "illustration_theme",
            selector: { select: { mode: "dropdown", options: ["auto", "day", "night"].map((v) => ({ value: v, label: tr(`theme_${v}`) })) } },
          },
          { name: "uptime_days", selector: { number: { min: 1, max: 30, step: 1, mode: "box" } } },
        ],
      },
      { type: "grid", name: "", schema: toggles.map((name) => ({ name, selector: { boolean: {} } })) },
      {
        name: "language",
        selector: { select: { mode: "dropdown", options: [{ value: "", label: tr("lang_auto") }, ...LANGUAGES.map(([value, label]) => ({ value, label }))] } },
      },
    ];
  }

  // A minimal YAML: no empty values, no options left at their default.
  static clean(value) {
    const config = { ...value };
    for (const [k, v] of Object.entries(config)) {
      if (
        v === "" ||
        v === undefined ||
        v === null ||
        (ON_BY_DEFAULT.includes(k) && v === true) ||
        (OFF_BY_DEFAULT.includes(k) && v === false) ||
        (k === "illustration_theme" && v === "auto") ||
        (k === "uptime_days" && v === 30)
      )
        delete config[k];
    }
    return config;
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (!this._form) {
      this._form = document.createElement("ha-form");
      this._form.computeLabel = (s) => t(this._hass, this._config, `ed_${s.name}`);
      this._form.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        const config = CloudCardEditor.clean(ev.detail.value);
        this._config = config;
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
      });
      this.appendChild(this._form);
    }
    this._form.hass = this._hass;
    // Home Assistant sets hass on every state change: the form gets new data and a new schema only when the
    // configuration or the language changed, not a fresh redraw each time.
    if (this._formConfig !== this._config) {
      this._formConfig = this._config;
      const data = { illustration_theme: "auto", uptime_days: 30, ...this._config };
      for (const k of ON_BY_DEFAULT) if (data[k] === undefined) data[k] = true;
      for (const k of OFF_BY_DEFAULT) if (data[k] === undefined) data[k] = false;
      this._form.data = data;
    }
    const l = lang(this._hass, this._config);
    if (this._schemaLang !== l || !this._form.schema) {
      this._schemaLang = l;
      this._form.schema = this._schema();
    }
  }
}

export class CloudMiniCardEditor extends CloudCardEditor {
  static get mini() {
    return true;
  }
}
