import assert from "node:assert/strict";
import { test } from "node:test";
import * as mdi from "@mdi/js";
import { DOMAIN, LATENCY, mockHass, NOW } from "../scripts/screenshots/mock.mjs";
import { load } from "./load.mjs";

const cc = load([
  "ICONS",
  "STRINGS",
  "discover",
  "certDays",
  "uptimeOf",
  "cloudBackup",
  "exposedCount",
  "maskUrl",
  "CloudCard",
  "CloudMiniCard",
  "CloudCardEditor",
  "CloudMiniCardEditor",
  "document",
  "window",
]);
cc.CloudCard.probe = async () => LATENCY;
// Values made in the card's context: compared as plain JSON.
const plain = (v) => JSON.parse(JSON.stringify(v));
const DAY = 86400000;
const tick = async (n = 6) => {
  for (let i = 0; i < n; i++) await new Promise((r) => setTimeout(r, 0));
};

// A card on the mock account, connected to the page: it reads its sources, every websocket call recorded.
const card = async (Cls, config = {}, { variant, admin = true, ws = {}, hass: extra = {} } = {}) => {
  const el = new Cls();
  el._now = () => NOW;
  const hass = { ...mockHass({ variant, admin }), ...extra };
  const answers = { ...hass.__ws, ...ws };
  el.calls = [];
  hass.callWS = async (msg) => {
    el.calls.push(msg);
    const a = answers[msg.type];
    if (a instanceof Error || a?.code) throw a;
    if (!(msg.type in answers)) throw { code: "unknown_command" };
    return a;
  };
  hass.callApi = async (method, path) => {
    el.calls.push({ api: `${method} ${path}` });
    return {};
  };
  el.setConfig({ type: "custom:x", ...config });
  el.hass = hass;
  el.connectedCallback();
  await tick();
  return el;
};
const types = (el) => el.calls.map((c) => c.type ?? c.api);

const LANGS = ["en", "fr", "de", "es", "sr", "sr-Latn", "it", "nl", "pt", "pl", "ro", "da", "sv", "bg", "ru", "uk", "hu", "sk", "cs", "sl", "lv", "el"];

test("i18n: the 22 languages, each with every key of English and the same placeholders", () => {
  assert.deepEqual(Object.keys(cc.STRINGS), LANGS);
  const vars = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join();
  const ref = Object.keys(cc.STRINGS.en).sort();
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(cc.STRINGS[l]).sort(), ref, l);
    for (const k of ref) {
      assert.ok(String(cc.STRINGS[l][k]).trim(), `${l}.${k} empty`);
      assert.equal(vars(cc.STRINGS[l][k]), vars(cc.STRINGS.en[k]), `${l}.${k} placeholders`);
    }
  }
});

test("icons are the real Material Design Icons paths", () => {
  const names = {
    cloud: "mdiCloud",
    cloudOff: "mdiCloudOffOutline",
    remote: "mdiShieldCheck",
    remoteOff: "mdiShieldOff",
    lock: "mdiLock",
    mic: "mdiMicrophone",
    webhook: "mdiWebhook",
    backup: "mdiCloudDownload",
    tts: "mdiVolumeHigh",
    timer: "mdiTimerOutline",
    alert: "mdiAlertCircle",
    expand: "mdiArrowExpand",
    collapse: "mdiArrowCollapse",
    close: "mdiClose",
  };
  assert.deepEqual(Object.keys(cc.ICONS).sort(), Object.keys(names).sort());
  for (const [k, n] of Object.entries(names)) assert.equal(cc.ICONS[k], mdi[n], k);
});

test("discover: the Remote UI sensor by its platform whatever its name, else its default id; remote_entity wins", () => {
  const hass = mockHass();
  assert.equal(cc.discover(hass).remote, "binary_sensor.remote_ui");
  const renamed = {
    ...hass,
    entities: { "binary_sensor.acces_distant": { platform: "cloud" } },
    states: { "binary_sensor.acces_distant": { state: "on" } },
  };
  assert.equal(cc.discover(renamed).remote, "binary_sensor.acces_distant");
  assert.equal(cc.discover({ states: { "binary_sensor.remote_ui": { state: "on" } } }).remote, "binary_sensor.remote_ui");
  assert.equal(cc.discover(hass, { remote_entity: "binary_sensor.other" }).remote, "binary_sensor.other");
  assert.equal(cc.discover(hass).backup_last, "sensor.backup_last_successful_automatic_backup");
  assert.equal(cc.discover({ states: {} }).remote, undefined);
});

test("certificate days: floor of the time left, null without a certificate", () => {
  assert.equal(cc.certDays({ expire_date: new Date(NOW + 54 * DAY + 3600000).toISOString() }, NOW), 54);
  assert.equal(cc.certDays({ expire_date: new Date(NOW - DAY).toISOString() }, NOW), -1);
  assert.equal(cc.certDays(null, NOW), null);
});

test("uptime: on time over known time, unavailable left out, the covered span in days", () => {
  const s = (st, ms) => ({ s: st, lu: ms / 1000 });
  const start = NOW - 30 * DAY;
  // On before the period, off one day, unavailable one day, on again.
  const u = cc.uptimeOf([s("on", start - DAY), s("off", NOW - 10 * DAY), s("unavailable", NOW - 9 * DAY), s("on", NOW - 8 * DAY)], start, NOW);
  assert.equal(Math.round(u.pct * 100) / 100, Math.round((28 / 29) * 10000) / 100);
  assert.equal(u.days, 30);
  // A recorder keeping 10 days only: 10 days covered.
  assert.equal(cc.uptimeOf([s("on", NOW - 10 * DAY)], start, NOW).days, 10);
  // `lc` (last changed) wins over `lu`.
  assert.equal(cc.uptimeOf([{ s: "off", lu: (NOW - DAY) / 1000, lc: (NOW - 2 * DAY) / 1000 }, s("on", NOW - DAY)], NOW - 2 * DAY, NOW).pct, 50);
  assert.equal(cc.uptimeOf([], start, NOW), null);
  assert.equal(cc.uptimeOf([s("unavailable", start)], start, NOW), null);
});

test("cloud backup: the newest backup stored on the cloud agent, its size, the count and the next one", () => {
  const b = cc.cloudBackup(mockHass().__ws["backup/info"]);
  assert.equal(b.count, 2);
  assert.equal(b.date, Date.parse("2026-06-12T03:12:00+02:00"));
  assert.equal(b.size, 1.4 * 1024 ** 3);
  assert.equal(cc.cloudBackup({ backups: [{ date: "2026-01-01", agents: { "backup.local": { size: 1 } } }] }).date, null);
  assert.equal(cc.cloudBackup(null), null);
});

test("exposed entities are counted per assistant", () => {
  const e = mockHass().__ws["homeassistant/expose_entity/list"];
  assert.equal(cc.exposedCount(e, "cloud.alexa"), 38);
  assert.equal(cc.exposedCount(e, "cloud.google_assistant"), 41);
  assert.equal(cc.exposedCount(null, "cloud.alexa"), null);
});

test("the remote URL is masked like Home Assistant's settings do", () => {
  assert.equal(cc.maskUrl(`https://${DOMAIN}`), `https://${"•".repeat(12)}.ui.nabu.casa`);
});

test("an administrator's card reads the status, subscription, backups, exposed entities, history and latency", async () => {
  const el = await card(cc.CloudCard);
  assert.deepEqual(plain(types(el)).sort(), [
    "backup/info",
    "cloud/status",
    "cloud/subscription",
    "history/history_during_period",
    "homeassistant/expose_entity/list",
  ]);
  const h = el.calls.find((c) => c.type === "history/history_during_period");
  assert.deepEqual(plain(h.entity_ids), ["binary_sensor.remote_ui"]);
  assert.equal(h.minimal_response, true);
  assert.equal(Date.parse(h.end_time) - Date.parse(h.start_time), 30 * DAY);
  const m = el._model();
  assert.equal(m.kind, "connected");
  assert.equal(m.latency, LATENCY);
  assert.equal(Math.floor(m.uptime.pct * 10) / 10, 99.9);
  assert.equal(m.cert.days, 54);
  assert.equal(m.cert.level, "ok");
  assert.equal(m.renewal.date, Date.parse("2027-03-12T12:00:00Z"));
  const tiles = Object.fromEntries(m.tiles.map((x) => [x.key, `${x.level} ${x.state}`]));
  assert.deepEqual(plain(tiles), {
    remote: "ok Connected",
    backup: "ok Today 03:12 · 1.4 GB",
    alexa: "ok Linked · 38 entities",
    google: "warn Not linked",
    webhooks: "ok 4 active",
    tts: "ok Ready · English",
  });
  assert.equal(m.issues, 1);
  const html = el._render();
  for (const s of ["Home Assistant Cloud", "Remote on", "18 ms", "Connected", "1 to check", "Renews Mar 12, 2027", "Uptime 30 d", "99.9", "Sync voice assistants", "Open remote URL"]) {
    assert.ok(html.includes(s), s);
  }
  // The flow runs: check mark and moving links.
  assert.ok(html.includes('class="mark ok"') && html.includes("link flow"));
});

test("cut off: red cross, flow stopped, the remote access down for 12 minutes, no latency", async () => {
  const el = await card(cc.CloudCard, {}, { variant: "disconnected" });
  const m = el._model();
  assert.equal(m.kind, "disconnected");
  assert.equal(m.level, "alert");
  assert.equal(m.latency, null);
  assert.ok(!types(el).includes("latency"));
  const remote = m.tiles.find((x) => x.key === "remote");
  assert.equal(remote.level, "alert");
  assert.equal(remote.state, "Down · 12 min");
  assert.equal(m.tiles.find((x) => x.key === "tts").level, "idle");
  const html = el._render();
  assert.ok(html.includes('class="mark down"') && !html.includes("link flow") && html.includes("banner still"));
  assert.ok(html.includes("Disconnected") && !html.includes("Sync voice assistants"));
});

test("a user who is not an administrator: no admin-only command, the backup from the backup sensors, no sync button", async () => {
  const el = await card(cc.CloudCard, {}, { admin: false });
  assert.deepEqual(plain(types(el)).sort(), ["cloud/status", "history/history_during_period"]);
  const m = el._model();
  assert.equal(m.renewal, null);
  const tiles = Object.fromEntries(m.tiles.map((x) => [x.key, x.state]));
  assert.equal(tiles.backup, "Today 03:12 · 1.4 GB");
  assert.equal(tiles.alexa, "Linked");
  const html = el._render();
  assert.ok(!html.includes("Sync voice assistants") && html.includes("Open remote URL"));
});

test("no cloud integration: the card says it is not set up; signed out: it asks to sign in", async () => {
  const none = await card(cc.CloudCard, {}, { ws: { "cloud/status": { code: "unknown_command" } } });
  assert.equal(none._model().kind, "not_set_up");
  assert.ok(none._render().includes("not set up on this instance"));
  const out = await card(cc.CloudCard, {}, { ws: { "cloud/status": { logged_in: false, cloud: "disconnected", http_use_ssl: false, auto_login: null } } });
  assert.equal(out._model().kind, "signed_out");
  assert.ok(out._render().includes("Sign in to Home Assistant Cloud"));
  assert.ok(!types(out).includes("cloud/subscription"));
});

test("certificate: amber under 14 days, red under 3 days or on error; the ring follows", async () => {
  const at = (days, status = "ready") => {
    const s = mockHass().__ws["cloud/status"];
    return { "cloud/status": { ...s, remote_certificate_status: status, remote_certificate: { ...s.remote_certificate, expire_date: new Date(NOW + days * DAY + 1000).toISOString() } } };
  };
  assert.equal((await card(cc.CloudCard, {}, { ws: at(10) }))._model().cert.level, "warn");
  assert.equal((await card(cc.CloudCard, {}, { ws: at(2) }))._model().cert.level, "alert");
  const err = (await card(cc.CloudCard, {}, { ws: at(60, "error") }))._model();
  assert.equal(err.cert.level, "alert");
  assert.equal(err.tiles.find((x) => x.key === "remote").state, "Certificate error");
});

test("options: services order and subset, indicators, buttons, latency off, masked URL", async () => {
  const el = await card(cc.CloudCard, { services: ["tts", "remote", "nope", "tts"], show_indicators: false, show_buttons: false, latency: false, hide_url: true });
  const m = el._model();
  assert.deepEqual(plain(m.tiles.map((x) => x.key)), ["tts", "remote"]);
  assert.equal(m.latency, null);
  const html = el._render();
  assert.ok(!html.includes('class="inds"') && !html.includes("Open remote URL"));
  const facts = plain(el._facts("remote", m));
  assert.equal(facts[0][1], `${"•".repeat(12)}.ui.nabu.casa`);
});

test("the popup opens from a tile, closes with Escape, and closes without anything else when the card leaves the page", async () => {
  const el = await card(cc.CloudCard);
  const click = (data) => el._click({ composedPath: () => [{ dataset: data }], detail: 1, stopPropagation() {} });
  click({ tile: "backup" });
  assert.equal(el._detail, "backup");
  const html = el._render();
  assert.ok(html.includes('role="dialog"') && html.includes("Last cloud backup") && html.includes("Backups in the cloud"));
  cc.window.on_keydown({ key: "Escape", stopPropagation() {} });
  assert.equal(el._detail, null);
  click({ tile: "remote" });
  el.disconnectedCallback();
  assert.equal(el._detail, null);
  assert.equal(cc.window.on_keydown, undefined);
});

test("sync: Alexa over the websocket and Google through the cloud API, then a toast", async () => {
  const el = await card(cc.CloudCard);
  el._click({ composedPath: () => [{ dataset: { action: "sync" } }], detail: 1 });
  await tick();
  assert.ok(types(el).includes("cloud/alexa/sync"));
  assert.ok(types(el).includes("POST cloud/google_actions/sync"));
  const toast = el.events.find((e) => e.type === "hass-notification");
  assert.equal(toast.detail.message, "Voice assistants synced");
  el._click({ composedPath: () => [{ dataset: { action: "open" } }], detail: 1 });
  assert.equal(cc.window.opened.at(-1)[0], `https://${DOMAIN}`);
});

test("mini card: status, latency, certificate and services to check; cut off, the remote access down chip", async () => {
  const el = await card(cc.CloudMiniCard);
  let html = el._render();
  for (const s of ["Cloud", "Connected", "18 ms", "Cert 54 d", "1 to check", 'class="zoom']) assert.ok(html.includes(s), s);
  assert.ok(!html.includes('class="banner'));
  const down = await card(cc.CloudMiniCard, {}, { variant: "disconnected" });
  html = down._render();
  assert.ok(html.includes("Remote down · 12 min") && html.includes("Disconnected") && !html.includes(" ms<"));
  assert.ok(html.includes(cc.ICONS.cloudOff));
});

test("mini card: the zoom button unfolds the full card, a click elsewhere folds it back, leaving the page too", async () => {
  const el = await card(cc.CloudMiniCard);
  el._click({ composedPath: () => [{ classList: { contains: (c) => c === "zoom" } }], detail: 1, stopPropagation() {} });
  assert.equal(el._zoomed, true);
  assert.ok(el._render().includes('class="banner'));
  el._foldWatch.tap({ composedPath: () => [] });
  assert.equal(el._zoomed, false);
  el._zoomed = true;
  el.disconnectedCallback();
  assert.equal(el._zoomed, false);
  assert.equal(el.getCardSize(), 1);
});

test("editors: a minimal YAML, the mini editor with the full card's options and its zoom", () => {
  const clean = plain(cc.CloudCardEditor.clean({ illustration: true, hide_url: false, latency: false, illustration_theme: "auto", uptime_days: 30, title: "" }));
  assert.deepEqual(clean, { latency: false });
  const names = (Ed) => {
    const ed = new Ed();
    ed._config = {};
    return ed._schema().flatMap((s) => (s.schema ? s.schema.map((x) => x.name) : [s.name]));
  };
  const full = names(cc.CloudCardEditor);
  const mini = names(cc.CloudMiniCardEditor);
  assert.ok(!full.includes("zoom") && mini.includes("zoom"));
  for (const n of full) assert.ok(mini.includes(n), n);
  for (const n of ["title", "remote_entity", "illustration_theme", "uptime_days", "illustration", "show_indicators", "show_services", "show_buttons", "latency", "hide_url", "language"]) {
    assert.ok(full.includes(n), n);
  }
});

test("the card answers in the user's language", async () => {
  const el = await card(cc.CloudCard, { language: "fr" });
  const html = el._render();
  assert.ok(html.includes("Connecté") && html.includes("Accès distant") && html.includes("Latence"));
});
