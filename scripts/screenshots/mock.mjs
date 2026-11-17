// Mock Home Assistant Cloud for the screenshots and the browser tests: a neutral account (fake remote URL, no real
// address or name) on a fixed clock (NOW), so that every run renders the same values. `variant` picks the state:
// "connected" (default), "disconnected" (the cloud cut off, the remote access down for 12 minutes).
export const NOW = Date.parse("2026-06-12T09:41:00+02:00");
export const TIME_ZONE = "Europe/Paris";
export const DOMAIN = "abcd1234efgh.ui.nabu.casa";
export const LATENCY = 18;
const DAY = 86400000;
const iso = (ms) => new Date(ms).toISOString();

const cloudhooks = Object.fromEntries(
  ["mobile_app_phone", "mobile_app_tablet", "owntracks", "garage_door"].map((id, i) => [
    id,
    { webhook_id: id, cloudhook_id: `hook${i}`, cloudhook_url: `https://hooks.nabu.casa/mock-${i}`, managed: i < 2 },
  ]),
);

export const cloudStatus = (variant = "connected") => {
  const up = variant !== "disconnected";
  return {
    logged_in: true,
    auto_login: null,
    cloud: up ? "connected" : "disconnected",
    cloud_last_disconnect_reason: up ? null : { clean: false, reason: "Connection closed" },
    email: "user@example.com",
    alexa_entities: { include_domains: [], include_entity_globs: [], include_entities: [], exclude_domains: [], exclude_entity_globs: [], exclude_entities: [] },
    alexa_registered: true,
    google_entities: { include_domains: [], include_entity_globs: [], include_entities: [], exclude_domains: [], exclude_entity_globs: [], exclude_entities: [] },
    google_registered: false,
    google_local_connected: false,
    logged_in_since: null,
    prefs: {
      alexa_default_expose: null,
      alexa_report_state: true,
      cloudhooks,
      alexa_enabled: true,
      cloud_ice_servers_enabled: true,
      google_enabled: true,
      remote_enabled: true,
      google_default_expose: null,
      google_report_state: true,
      google_secure_devices_pin: null,
      onboarded_items: ["remote", "backup", "voice", "streaming"],
      onboarding_postponed_until: null,
      remote_allow_remote_enable: true,
      tts_default_voice: ["en-US", "JennyNeural"],
    },
    onboarding_completed: true,
    onboarding_postponed: false,
    remote_certificate: {
      common_name: `*.${DOMAIN}`,
      expire_date: iso(NOW + 54 * DAY + 3 * 3600000),
      fingerprint: "00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff",
      alternative_names: null,
    },
    remote_certificate_status: "ready",
    remote_connected: up,
    remote_domain: DOMAIN,
    http_use_ssl: false,
    active_subscription: true,
  };
};

const subscription = {
  human_description: "Monthly subscription",
  provider: "stripe",
  plan_renewal_date: Date.parse("2027-03-12T12:00:00Z") / 1000,
  renewal_active: true,
  subscription: { status: "active", cancel_at_period_end: false },
};

// Today 03:12 local time: the last automatic backup, uploaded to the cloud (1.4 GB).
const backupAt = Date.parse("2026-06-12T03:12:00+02:00");
const backups = {
  agent_errors: {},
  backups: [
    {
      backup_id: "a1b2c3d4",
      name: "Automatic backup 2026.6.1",
      date: iso(backupAt),
      agents: { "cloud.cloud": { protected: true, size: 1.4 * 1024 ** 3 }, "backup.local": { protected: true, size: 1.4 * 1024 ** 3 } },
      with_automatic_settings: true,
    },
    {
      backup_id: "e5f6a7b8",
      name: "Automatic backup 2026.6.1",
      date: iso(backupAt - DAY),
      agents: { "cloud.cloud": { protected: true, size: 1.38 * 1024 ** 3 } },
      with_automatic_settings: true,
    },
  ],
  last_attempted_automatic_backup: iso(backupAt),
  last_completed_automatic_backup: iso(backupAt),
  next_automatic_backup: iso(backupAt + DAY),
  state: "idle",
};

const exposed = { exposed_entities: {} };
for (let i = 0; i < 41; i++) exposed.exposed_entities[`light.mock_${i}`] = { "cloud.google_assistant": true, ...(i < 38 ? { "cloud.alexa": true } : {}), conversation: true };

// 30 days of the Remote UI sensor: on, with one cut of 43 minutes (99.9 %); off for the last 12 minutes when cut off.
const history = (variant) => {
  const start = NOW - 30 * DAY;
  const cut = NOW - 9 * DAY;
  const list = [
    { s: "on", lu: (start - DAY) / 1000 },
    { s: "off", lu: cut / 1000 },
    { s: "on", lu: (cut + 43 * 60000) / 1000 },
  ];
  if (variant === "disconnected") list.push({ s: "off", lu: (NOW - 12 * 60000) / 1000 });
  return { "binary_sensor.remote_ui": list };
};

// The websocket answers, by command; serialisable (the browser builds callWS from them).
export const mockWs = (variant = "connected") => ({
  "cloud/status": cloudStatus(variant),
  "cloud/subscription": subscription,
  "backup/info": backups,
  "homeassistant/expose_entity/list": exposed,
  "history/history_during_period": history(variant),
  "cloud/alexa/sync": null,
});

export const mockHass = ({ dark = false, variant = "connected", admin = true } = {}) => {
  const remoteOn = variant !== "disconnected";
  const since = remoteOn ? NOW - 9 * DAY + 43 * 60000 : NOW - 12 * 60000;
  const state = (entity_id, s, attributes = {}, changed = NOW - 3600000) => ({
    entity_id,
    state: s,
    attributes,
    last_changed: iso(changed),
    last_updated: iso(changed),
  });
  return {
    language: "en",
    locale: { language: "en", number_format: "language", time_format: "24", time_zone: "server" },
    config: { time_zone: TIME_ZONE },
    themes: { darkMode: dark },
    user: { id: "mock", name: "User", is_admin: admin },
    entities: {
      "binary_sensor.remote_ui": { entity_id: "binary_sensor.remote_ui", platform: "cloud", entity_category: "diagnostic" },
      "sensor.backup_last_successful_automatic_backup": {
        entity_id: "sensor.backup_last_successful_automatic_backup",
        platform: "backup",
        translation_key: "last_successful_automatic_backup",
      },
      "sensor.backup_last_successful_automatic_backup_size": {
        entity_id: "sensor.backup_last_successful_automatic_backup_size",
        platform: "backup",
        translation_key: "last_successful_automatic_backup_size",
      },
    },
    states: {
      "sun.sun": state("sun.sun", "above_horizon"),
      "binary_sensor.remote_ui": state("binary_sensor.remote_ui", remoteOn ? "on" : "off", { device_class: "connectivity", friendly_name: "Remote UI" }, since),
      "sensor.backup_last_successful_automatic_backup": state("sensor.backup_last_successful_automatic_backup", iso(backupAt), { device_class: "timestamp" }),
      "sensor.backup_last_successful_automatic_backup_size": state("sensor.backup_last_successful_automatic_backup_size", "1434", {
        device_class: "data_size",
        unit_of_measurement: "MiB",
      }),
    },
    __ws: mockWs(variant),
  };
};
