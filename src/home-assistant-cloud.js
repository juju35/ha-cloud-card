// ---------------------------------------------------------------------------
// Home Assistant Cloud data
// ---------------------------------------------------------------------------
import { DAY, num, toMs } from "./helpers.js";

// Backup agent of Home Assistant Cloud (backup integration: `<domain>.<unique_id>` of the cloud agent).
export const CLOUD_AGENT = "cloud.cloud";
// Assistant ids of the exposed entities (homeassistant/exposed_entities.py).
export const ASSISTANTS = { alexa: "cloud.alexa", google: "cloud.google_assistant" };
export const SERVICES = ["remote", "backup", "alexa", "google", "webhooks", "tts"];
// Let's Encrypt certificates of the remote UI: the ring is full at 90 days.
export const CERT_SPAN = 90;
// A cloud backup older than this is worth a look (Home Assistant warns after three days as well).
export const BACKUP_STALE = 3 * DAY;
// How often each source is read again (ms).
export const EVERY = { status: 60000, subscription: 6 * 3600000, backups: 300000, exposed: 300000, uptime: 900000, latency: 60000 };

// The cloud integration's « Remote UI » binary sensor (platform cloud, unique id cloud-remote-ui-connectivity) and the
// backup integration's « last successful automatic backup » sensors, found in the entity registry whatever their
// names, else by their default entity ids. Computed once per registry (hass.entities is replaced only when it changes).
export const _found = new WeakMap();
export const discover = (hass, config = {}) => {
  const reg = hass?.entities;
  let found = reg && _found.get(reg);
  if (!found) {
    found = {};
    for (const [id, e] of Object.entries(reg || {})) {
      if (e?.platform === "cloud" && id.startsWith("binary_sensor.")) found.remote ??= id;
      if (e?.platform === "backup" && e.translation_key === "last_successful_automatic_backup") found.backup_last ??= id;
      if (e?.platform === "backup" && e.translation_key === "last_successful_automatic_backup_size") found.backup_size ??= id;
    }
    if (reg) _found.set(reg, found);
  }
  const st = hass?.states || {};
  const pick = (own, def) => own ?? (st[def] ? def : undefined);
  return {
    remote: config.remote_entity || pick(found.remote, "binary_sensor.remote_ui"),
    backup_last: pick(found.backup_last, "sensor.backup_last_successful_automatic_backup"),
    backup_size: pick(found.backup_size, "sensor.backup_last_successful_automatic_backup_size"),
  };
};

// Days left before the remote certificate expires (negative once expired), or null.
export const certDays = (cert, now) => {
  const ms = toMs(cert?.expire_date);
  return ms === null ? null : Math.floor((ms - now) / DAY);
};

// Share of time a connectivity sensor was on between `start` and `end` (ms), from history/history_during_period with
// minimal_response (compressed states: `s`, and `lc` or `lu` in seconds). Time unknown or unavailable (a restart)
// is left out. `days` is the span the recorder actually covers, at most the period asked.
export const uptimeOf = (list, start, end) => {
  if (!Array.isArray(list) || !list.length) return null;
  const at = (e) => {
    const v = num(e?.lc ?? e?.lu);
    return v === null ? null : v * 1000;
  };
  let on = 0;
  let known = 0;
  for (let i = 0; i < list.length; i++) {
    const from = Math.max(start, at(list[i]) ?? start);
    const to = Math.min(end, i + 1 < list.length ? (at(list[i + 1]) ?? end) : end);
    if (to <= from) continue;
    if (list[i].s === "on") on += to - from;
    if (list[i].s === "on" || list[i].s === "off") known += to - from;
  }
  if (!known) return null;
  const covered = end - Math.max(start, at(list[0]) ?? start);
  return { pct: (on / known) * 100, days: Math.max(1, Math.round(covered / DAY)) };
};

// The newest backup stored in Home Assistant Cloud, from backup/info.
export const cloudBackup = (info) => {
  if (!info || !Array.isArray(info.backups)) return null;
  const list = info.backups.filter((b) => b?.agents && CLOUD_AGENT in b.agents).sort((a, b) => (toMs(b.date) ?? 0) - (toMs(a.date) ?? 0));
  const last = list[0];
  return {
    count: list.length,
    date: last ? toMs(last.date) : null,
    size: last ? num(last.agents[CLOUD_AGENT]?.size) : null,
    error: info.agent_errors?.[CLOUD_AGENT] || null,
    next: toMs(info.next_automatic_backup),
  };
};

// Entities exposed to an assistant, from homeassistant/expose_entity/list, or null.
export const exposedCount = (exposed, assistant) =>
  exposed?.exposed_entities ? Object.values(exposed.exposed_entities).filter((x) => x?.[assistant]).length : null;

export const worst = (levels) => (levels.includes("alert") ? "alert" : levels.includes("warn") ? "warn" : levels.includes("ok") ? "ok" : "idle");

// Everything the cards show, from the data read (`d`), the entities and the configuration. `f` formats texts, dates,
// sizes and durations in the card's language.
export const buildModel = (d, hass, config, now, f) => {
  const ids = discover(hass, config);
  const remoteSt = ids.remote ? hass?.states?.[ids.remote] : undefined;
  const s = d.status;
  const m = { kind: "unknown", expired: false, tiles: [], issues: 0, latency: null, uptime: null, renewal: null, link: "off" };
  if (!s) m.kind = d.statusError === "not_loaded" ? "not_set_up" : "unknown";
  else if (!s.logged_in) m.kind = "signed_out";
  else m.kind = s.cloud === "connected" ? "connected" : s.cloud === "connecting" ? "connecting" : "disconnected";
  const live = s?.logged_in === true;
  const prefs = (live && s.prefs) || {};
  m.expired = live && s.active_subscription === false;
  m.link = m.kind === "connected" && !m.expired ? "ok" : m.kind === "connecting" ? "wait" : live ? "down" : "off";

  // Remote access: the cloud status, else the Remote UI sensor alone (status not read yet).
  const enabled = live ? !!prefs.remote_enabled : remoteSt ? !["unavailable", "unknown"].includes(remoteSt.state) : false;
  const connected = live ? !!s.remote_connected : remoteSt?.state === "on";
  const since = remoteSt && remoteSt.state !== "on" ? toMs(remoteSt.last_changed) : null;
  const domain = live ? s.remote_domain || null : null;
  const certStatus = live ? s.remote_certificate_status || null : null;
  const days = live ? certDays(s.remote_certificate, now) : null;
  m.remote = { enabled, connected, since, domain, url: domain ? `https://${domain}` : null, certStatus, certExpires: live ? toMs(s.remote_certificate?.expire_date) : null };
  m.cert = days === null ? null : { days: Math.max(0, days), level: certStatus === "error" || days < 3 ? "alert" : days < 14 ? "warn" : "ok" };
  m.latency = connected && config.latency !== false ? d.latency : null;
  m.uptime = d.uptime;
  const sub = d.subscription;
  const renew = toMs(sub?.plan_renewal_date);
  if (renew) m.renewal = { date: renew, ends: sub.renewal_active === false || sub.subscription?.cancel_at_period_end === true };

  if (live) {
    const down = since ? f.duration(now - since) : "";
    const tiles = {
      remote: () =>
        !enabled
          ? ["idle", f.t("st_off")]
          : certStatus === "error"
            ? ["alert", f.t("st_cert_error")]
            : connected
              ? ["ok", f.t("connected")]
              : certStatus && certStatus !== "ready"
                ? ["warn", f.t("st_cert_wait")]
                : ["alert", down ? f.t("st_down", { d: down }) : f.t("remote_down")],
      backup: () => {
        const b = cloudBackup(d.backups);
        if (b) {
          if (b.error) return ["alert", f.t("st_backup_error")];
          if (!b.date) return ["idle", f.t("st_no_backup")];
          const text = [f.date(b.date), b.size ? f.size(b.size) : ""].filter(Boolean).join(" · ");
          return [now - b.date > BACKUP_STALE ? "warn" : "ok", text];
        }
        // Without backup/info (a user who is not an administrator): the backup integration's sensors.
        const last = toMs(hass?.states?.[ids.backup_last]?.state);
        if (!last) return ["idle", f.t("st_no_backup")];
        const size = hass.states[ids.backup_size];
        const bytes = size ? num(size.state) : null;
        const unit = size?.attributes?.unit_of_measurement;
        const mult = { B: 1, kB: 1e3, KB: 1e3, KiB: 1024, MB: 1e6, MiB: 1048576, GB: 1e9, GiB: 1073741824 }[unit] ?? null;
        const text = [f.date(last), bytes !== null && mult ? f.size(bytes * mult) : ""].filter(Boolean).join(" · ");
        return [now - last > BACKUP_STALE ? "warn" : "ok", text];
      },
      alexa: () => {
        if (!prefs.alexa_enabled) return ["idle", f.t("st_off")];
        if (prefs.alexa_report_state && !s.alexa_registered) return ["warn", f.t("st_relink")];
        const n = exposedCount(d.exposed, ASSISTANTS.alexa);
        const head = f.t(s.alexa_registered ? "st_linked" : "st_on");
        return ["ok", n === null ? head : `${head} · ${f.plural("entities", n)}`];
      },
      google: () => {
        if (!prefs.google_enabled) return ["idle", f.t("st_off")];
        if (!s.google_registered) return ["warn", f.t("st_not_linked")];
        const n = exposedCount(d.exposed, ASSISTANTS.google);
        return ["ok", n === null ? f.t("st_linked") : `${f.t("st_linked")} · ${f.plural("entities", n)}`];
      },
      webhooks: () => {
        const n = Object.keys(prefs.cloudhooks || {}).length;
        return n ? ["ok", f.plural("active", n)] : ["idle", f.t("st_none")];
      },
      tts: () => {
        if (m.kind !== "connected" || m.expired) return ["idle", f.t("st_offline")];
        const language = Array.isArray(prefs.tts_default_voice) ? prefs.tts_default_voice[0] : null;
        return ["ok", language ? `${f.t("st_ready")} · ${f.language(language)}` : f.t("st_ready")];
      },
    };
    const keys = Array.isArray(config.services) ? config.services.filter((k) => SERVICES.includes(k)) : SERVICES;
    m.tiles = [...new Set(keys)].map((key) => {
      const [level, state] = tiles[key]();
      return { key, level, state };
    });
    m.issues = m.tiles.filter((x) => x.level === "warn" || x.level === "alert").length;
  }
  const kindLevel = { connected: "ok", connecting: "warn", disconnected: "alert" }[m.kind] ?? "idle";
  m.level = m.expired ? "alert" : worst([kindLevel, ...m.tiles.map((x) => x.level)]);
  if (m.kind === "connected" && !m.expired && m.level === "idle") m.level = "ok";
  return m;
};
