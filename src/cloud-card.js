/*
 * Cloud Card for Home Assistant
 * https://github.com/juju35/ha-cloud-card
 *
 * Home Assistant Cloud (Nabu Casa) and remote access at a glance, under an animated illustration: the cloud
 * connection, the remote UI, its certificate, the subscription, cloud backups, Alexa, Google Assistant, cloudhooks
 * and cloud text-to-speech. The data comes from the cloud integration's websocket commands (`cloud/status` for every
 * user; `cloud/subscription`, `backup/info` and `homeassistant/expose_entity/list` for administrators only), from the
 * recorder history of its « Remote UI » binary sensor, and from the backup integration's sensors.
 */

const VERSION = "__VERSION__";

// mdi icon paths (@mdi/js, checked by the tests): the cards draw their icons themselves, nothing to load.
const ICONS = {
  // mdi:cloud: the header badge, connected.
  cloud: "M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.88 6.85 7.75 5.43 9.63 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20Z",
  // mdi:cloud-off-outline: the header badge, disconnected.
  cloudOff: "M19.8 22.6L17.15 20H6.5Q4.2 20 2.6 18.4T1 14.5Q1 12.58 2.19 11.08 3.38 9.57 5.25 9.15 5.33 8.95 5.4 8.76 5.5 8.57 5.55 8.35L1.4 4.2L2.8 2.8L21.2 21.2M6.5 18H15.15L7.1 9.95Q7.05 10.23 7.03 10.5 7 10.73 7 11H6.5Q5.05 11 4.03 12.03 3 13.05 3 14.5 3 15.95 4.03 17 5.05 18 6.5 18M11.13 14M21.6 18.75L20.15 17.35Q20.58 17 20.79 16.54 21 16.08 21 15.5 21 14.45 20.27 13.73 19.55 13 18.5 13H17V11Q17 8.93 15.54 7.46 14.08 6 12 6 11.33 6 10.7 6.16 10.07 6.33 9.5 6.68L8.05 5.23Q8.93 4.63 9.91 4.31 10.9 4 12 4 14.93 4 16.96 6.04 19 8.07 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 16.5 22.63 17.31 22.25 18.15 21.6 18.75M14.83 12.03Z",
  // mdi:shield-check: Remote access.
  remote: "M10,17L6,13L7.41,11.59L10,14.17L16.59,7.58L18,9M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1Z",
  // mdi:shield-off: Remote access, down.
  remoteOff: "M1,4.27L2.28,3L20.5,21.22L19.23,22.5L17,20.25C15.57,21.57 13.87,22.54 12,23C6.84,21.74 3,16.55 3,11V6.27L1,4.27M12,1L21,5V11C21,13.28 20.35,15.5 19.23,17.41L5.65,3.82L12,1Z",
  // mdi:lock: the certificate.
  lock: "M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z",
  // mdi:microphone: Alexa and Google Assistant.
  mic: "M12,2A3,3 0 0,1 15,5V11A3,3 0 0,1 12,14A3,3 0 0,1 9,11V5A3,3 0 0,1 12,2M19,11C19,14.53 16.39,17.44 13,17.93V21H11V17.93C7.61,17.44 5,14.53 5,11H7A5,5 0 0,0 12,16A5,5 0 0,0 17,11H19Z",
  // mdi:webhook: Webhooks.
  webhook: "M10.46,19C9,21.07 6.15,21.59 4.09,20.15C2.04,18.71 1.56,15.84 3,13.75C3.87,12.5 5.21,11.83 6.58,11.77L6.63,13.2C5.72,13.27 4.84,13.74 4.27,14.56C3.27,16 3.58,17.94 4.95,18.91C6.33,19.87 8.26,19.5 9.26,18.07C9.57,17.62 9.75,17.13 9.82,16.63V15.62L15.4,15.58L15.47,15.47C16,14.55 17.15,14.23 18.05,14.75C18.95,15.27 19.26,16.43 18.73,17.35C18.2,18.26 17.04,18.58 16.14,18.06C15.73,17.83 15.44,17.46 15.31,17.04L11.24,17.06C11.13,17.73 10.87,18.38 10.46,19M17.74,11.86C20.27,12.17 22.07,14.44 21.76,16.93C21.45,19.43 19.15,21.2 16.62,20.89C15.13,20.71 13.9,19.86 13.19,18.68L14.43,17.96C14.92,18.73 15.75,19.28 16.75,19.41C18.5,19.62 20.05,18.43 20.26,16.76C20.47,15.09 19.23,13.56 17.5,13.35C16.96,13.29 16.44,13.36 15.97,13.53L15.12,13.97L12.54,9.2H12.32C11.26,9.16 10.44,8.29 10.47,7.25C10.5,6.21 11.4,5.4 12.45,5.44C13.5,5.5 14.33,6.35 14.3,7.39C14.28,7.83 14.11,8.23 13.84,8.54L15.74,12.05C16.36,11.85 17.04,11.78 17.74,11.86M8.25,9.14C7.25,6.79 8.31,4.1 10.62,3.12C12.94,2.14 15.62,3.25 16.62,5.6C17.21,6.97 17.09,8.47 16.42,9.67L15.18,8.95C15.6,8.14 15.67,7.15 15.27,6.22C14.59,4.62 12.78,3.85 11.23,4.5C9.67,5.16 8.97,7 9.65,8.6C9.93,9.26 10.4,9.77 10.97,10.11L11.36,10.32L8.29,15.31C8.32,15.36 8.36,15.42 8.39,15.5C8.88,16.41 8.54,17.56 7.62,18.05C6.71,18.54 5.56,18.18 5.06,17.24C4.57,16.31 4.91,15.16 5.83,14.67C6.22,14.46 6.65,14.41 7.06,14.5L9.37,10.73C8.9,10.3 8.5,9.76 8.25,9.14Z",
  // mdi:cloud-download: Cloud backup.
  backup: "M6.5 20Q4.22 20 2.61 18.43 1 16.85 1 14.58 1 12.63 2.17 11.1 3.35 9.57 5.25 9.15 5.83 7.13 7.39 5.75 8.95 4.38 11 4.08V12.15L9.4 10.6L8 12L12 16L16 12L14.6 10.6L13 12.15V4.08Q15.58 4.43 17.29 6.39 19 8.35 19 11 20.73 11.2 21.86 12.5 23 13.78 23 15.5 23 17.38 21.69 18.69 20.38 20 18.5 20Z",
  // mdi:volume-high: Cloud TTS.
  tts: "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z",
  // mdi:timer-outline: the latency chip.
  timer: "M12,20A7,7 0 0,1 5,13A7,7 0 0,1 12,6A7,7 0 0,1 19,13A7,7 0 0,1 12,20M19.03,7.39L20.45,5.97C20,5.46 19.55,5 19.04,4.56L17.62,6C16.07,4.74 14.12,4 12,4A9,9 0 0,0 3,13A9,9 0 0,0 12,22C17,22 21,17.97 21,13C21,10.88 20.26,8.93 19.03,7.39M11,14H13V8H11M15,1H9V3H15V1Z",
  // mdi:alert-circle: the chip of the services to check.
  alert: "M13,13H11V7H13M13,17H11V15H13M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z",
  // mdi:arrow-expand: the mini card detail button.
  expand: "M10,21V19H6.41L10.91,14.5L9.5,13.09L5,17.59V14H3V21H10M14.5,10.91L19,6.41V10H21V3H14V5H17.59L13.09,9.5L14.5,10.91Z",
  // mdi:arrow-collapse: the mini card detail button, unfolded.
  collapse: "M19.5,3.09L15,7.59V4H13V11H20V9H16.41L20.91,4.5L19.5,3.09M4,13V15H7.59L3.09,19.5L4.5,20.91L9,16.41V20H11V13H4Z",
  // mdi:close: the popup close button.
  close: "M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z",
};

const STRINGS = {
  en: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Loading…",
    connected: "Connected",
    connecting: "Connecting",
    disconnected: "Disconnected",
    signed_out: "Signed out",
    not_set_up: "Not set up",
    sub_expired: "Subscription expired",
    check_one: "{n} to check",
    check_other: "{n} to check",
    renews: "Renews {date}",
    ends: "Ends {date}",
    remote_on: "Remote on",
    remote_off: "Remote off",
    remote_down: "Remote down",
    remote_down_for: "Remote down · {d}",
    latency: "Latency",
    latency_help: "Round trip from this browser to Home Assistant through the remote URL",
    uptime: "Uptime {n} d",
    uptime_help: "Time the remote connection was up, from the recorder history of the Remote UI sensor",
    certificate: "Certificate",
    cert_short: "Cert {n} d",
    cert_help: "Days left before the remote access certificate expires",
    unit_days: "d",
    remote: "Remote access",
    backup: "Cloud backup",
    webhooks: "Webhooks",
    tts: "Cloud TTS",
    st_off: "Off",
    st_on: "On",
    st_down: "Down · {d}",
    st_cert_error: "Certificate error",
    st_cert_wait: "Preparing certificate",
    st_linked: "Linked",
    st_not_linked: "Not linked",
    st_relink: "Link needed",
    entities_one: "{n} entity",
    entities_other: "{n} entities",
    active_one: "{n} active",
    active_other: "{n} active",
    st_none: "None",
    st_ready: "Ready",
    st_offline: "Offline",
    st_no_backup: "No cloud backup",
    st_backup_error: "Upload failed",
    today: "Today {time}",
    yesterday: "Yesterday {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Sync voice assistants",
    syncing: "Syncing…",
    synced: "Voice assistants synced",
    sync_failed: "Sync failed: {error}",
    open_url: "Open remote URL",
    settings: "Cloud settings",
    close: "Close",
    msg_not_set_up: "Home Assistant Cloud is not set up on this instance.",
    msg_signed_out: "Sign in to Home Assistant Cloud to use remote access, cloud backups and the voice assistants.",
    f_url: "Remote URL",
    f_status: "Status",
    f_cert: "Certificate",
    f_expires: "Expires",
    f_allow: "Can be turned on from the account",
    f_last: "Last cloud backup",
    f_size: "Size",
    f_count: "Backups in the cloud",
    f_next: "Next automatic backup",
    f_report: "Report state",
    f_entities: "Exposed entities",
    f_local: "Local fulfilment",
    f_webhooks: "Cloudhooks",
    f_managed: "Managed by integrations",
    f_language: "Language",
    f_voice: "Voice",
    yes: "Yes",
    no: "No",
    cs_ready: "Valid",
    cs_generating: "Generating",
    cs_loading: "Loading",
    cs_loaded: "Loaded",
    cs_error: "Error",
    zoom_in: "Show the full card",
    zoom_out: "Back to the compact view",
    ed_title: "Title",
    ed_remote_entity: "Remote UI sensor",
    ed_illustration: "Illustrated banner",
    ed_illustration_theme: "Banner theme",
    theme_auto: "Automatic (follows the theme)",
    theme_day: "Day",
    theme_night: "Night",
    ed_uptime_days: "Uptime period (days)",
    ed_show_indicators: "Indicators",
    ed_show_services: "Services",
    ed_show_buttons: "Buttons",
    ed_latency: "Measure the latency",
    ed_hide_url: "Mask the remote URL",
    ed_zoom: "Zoom button",
    ed_language: "Language",
    lang_auto: "Automatic",
  },
  fr: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Chargement…",
    connected: "Connecté",
    connecting: "Connexion",
    disconnected: "Déconnecté",
    signed_out: "Non connecté",
    not_set_up: "Non configuré",
    sub_expired: "Abonnement expiré",
    check_one: "{n} à vérifier",
    check_other: "{n} à vérifier",
    renews: "Renouvelé le {date}",
    ends: "Se termine le {date}",
    remote_on: "Accès distant actif",
    remote_off: "Accès distant coupé",
    remote_down: "Accès distant en panne",
    remote_down_for: "Distant en panne · {d}",
    latency: "Latence",
    latency_help: "Aller-retour de ce navigateur vers Home Assistant par l'adresse distante",
    uptime: "Disponibilité {n} j",
    uptime_help: "Temps de connexion de l'accès distant, d'après l'historique du capteur Remote UI",
    certificate: "Certificat",
    cert_short: "Cert. {n} j",
    cert_help: "Jours restants avant l'expiration du certificat de l'accès distant",
    unit_days: "j",
    remote: "Accès distant",
    backup: "Sauvegarde cloud",
    webhooks: "Webhooks",
    tts: "Synthèse vocale cloud",
    st_off: "Désactivé",
    st_on: "Activé",
    st_down: "En panne · {d}",
    st_cert_error: "Erreur de certificat",
    st_cert_wait: "Certificat en préparation",
    st_linked: "Associé",
    st_not_linked: "Non associé",
    st_relink: "À réassocier",
    entities_one: "{n} entité",
    entities_other: "{n} entités",
    active_one: "{n} actif",
    active_other: "{n} actifs",
    st_none: "Aucun",
    st_ready: "Prêt",
    st_offline: "Hors ligne",
    st_no_backup: "Aucune sauvegarde cloud",
    st_backup_error: "Envoi échoué",
    today: "Aujourd'hui {time}",
    yesterday: "Hier {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} j",
    sync: "Synchroniser les assistants",
    syncing: "Synchronisation…",
    synced: "Assistants vocaux synchronisés",
    sync_failed: "Échec de la synchronisation : {error}",
    open_url: "Ouvrir l'adresse distante",
    settings: "Réglages du cloud",
    close: "Fermer",
    msg_not_set_up: "Home Assistant Cloud n'est pas configuré sur cette instance.",
    msg_signed_out: "Connecte-toi à Home Assistant Cloud pour utiliser l'accès distant, les sauvegardes cloud et les assistants vocaux.",
    f_url: "Adresse distante",
    f_status: "État",
    f_cert: "Certificat",
    f_expires: "Expire le",
    f_allow: "Activable depuis le compte",
    f_last: "Dernière sauvegarde cloud",
    f_size: "Taille",
    f_count: "Sauvegardes dans le cloud",
    f_next: "Prochaine sauvegarde automatique",
    f_report: "Remontée d'état",
    f_entities: "Entités exposées",
    f_local: "Exécution locale",
    f_webhooks: "Cloudhooks",
    f_managed: "Gérés par des intégrations",
    f_language: "Langue",
    f_voice: "Voix",
    yes: "Oui",
    no: "Non",
    cs_ready: "Valide",
    cs_generating: "En création",
    cs_loading: "En chargement",
    cs_loaded: "Chargé",
    cs_error: "Erreur",
    zoom_in: "Afficher la carte complète",
    zoom_out: "Revenir à la vue compacte",
    ed_title: "Titre",
    ed_remote_entity: "Capteur Remote UI",
    ed_illustration: "Bandeau illustré",
    ed_illustration_theme: "Thème du bandeau",
    theme_auto: "Automatique (suit le thème)",
    theme_day: "Jour",
    theme_night: "Nuit",
    ed_uptime_days: "Période de disponibilité (jours)",
    ed_show_indicators: "Indicateurs",
    ed_show_services: "Services",
    ed_show_buttons: "Boutons",
    ed_latency: "Mesurer la latence",
    ed_hide_url: "Masquer l'adresse distante",
    ed_zoom: "Bouton zoom",
    ed_language: "Langue",
    lang_auto: "Automatique",
  },
  de: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Wird geladen…",
    connected: "Verbunden",
    connecting: "Verbindet",
    disconnected: "Getrennt",
    signed_out: "Abgemeldet",
    not_set_up: "Nicht eingerichtet",
    sub_expired: "Abo abgelaufen",
    check_one: "{n} zu prüfen",
    check_other: "{n} zu prüfen",
    renews: "Verlängert am {date}",
    ends: "Endet am {date}",
    remote_on: "Fernzugriff an",
    remote_off: "Fernzugriff aus",
    remote_down: "Fernzugriff gestört",
    remote_down_for: "Fernzugriff gestört · {d}",
    latency: "Latenz",
    latency_help: "Umlaufzeit von diesem Browser zu Home Assistant über die Fernzugriffs-URL",
    uptime: "Verfügbarkeit {n} T",
    uptime_help: "Verbindungszeit des Fernzugriffs, aus dem Recorder-Verlauf des Remote-UI-Sensors",
    certificate: "Zertifikat",
    cert_short: "Zert. {n} T",
    cert_help: "Verbleibende Tage bis zum Ablauf des Fernzugriffszertifikats",
    unit_days: "T",
    remote: "Fernzugriff",
    backup: "Cloud-Backup",
    webhooks: "Webhooks",
    tts: "Cloud-TTS",
    st_off: "Aus",
    st_on: "An",
    st_down: "Gestört · {d}",
    st_cert_error: "Zertifikatsfehler",
    st_cert_wait: "Zertifikat wird erstellt",
    st_linked: "Verknüpft",
    st_not_linked: "Nicht verknüpft",
    st_relink: "Neu verknüpfen",
    entities_one: "{n} Entität",
    entities_other: "{n} Entitäten",
    active_one: "{n} aktiv",
    active_other: "{n} aktiv",
    st_none: "Keine",
    st_ready: "Bereit",
    st_offline: "Offline",
    st_no_backup: "Kein Cloud-Backup",
    st_backup_error: "Upload fehlgeschlagen",
    today: "Heute {time}",
    yesterday: "Gestern {time}",
    minutes: "{n} Min.",
    hours: "{n} Std.",
    days: "{n} T",
    sync: "Sprachassistenten synchronisieren",
    syncing: "Synchronisiert…",
    synced: "Sprachassistenten synchronisiert",
    sync_failed: "Synchronisierung fehlgeschlagen: {error}",
    open_url: "Fernzugriffs-URL öffnen",
    settings: "Cloud-Einstellungen",
    close: "Schließen",
    msg_not_set_up: "Home Assistant Cloud ist auf dieser Instanz nicht eingerichtet.",
    msg_signed_out: "Melde dich bei Home Assistant Cloud an, um Fernzugriff, Cloud-Backups und die Sprachassistenten zu nutzen.",
    f_url: "Fernzugriffs-URL",
    f_status: "Status",
    f_cert: "Zertifikat",
    f_expires: "Läuft ab",
    f_allow: "Über das Konto aktivierbar",
    f_last: "Letztes Cloud-Backup",
    f_size: "Größe",
    f_count: "Backups in der Cloud",
    f_next: "Nächstes automatisches Backup",
    f_report: "Status melden",
    f_entities: "Freigegebene Entitäten",
    f_local: "Lokale Ausführung",
    f_webhooks: "Cloudhooks",
    f_managed: "Von Integrationen verwaltet",
    f_language: "Sprache",
    f_voice: "Stimme",
    yes: "Ja",
    no: "Nein",
    cs_ready: "Gültig",
    cs_generating: "Wird erstellt",
    cs_loading: "Wird geladen",
    cs_loaded: "Geladen",
    cs_error: "Fehler",
    zoom_in: "Vollständige Karte anzeigen",
    zoom_out: "Zurück zur kompakten Ansicht",
    ed_title: "Titel",
    ed_remote_entity: "Remote-UI-Sensor",
    ed_illustration: "Illustriertes Banner",
    ed_illustration_theme: "Banner-Design",
    theme_auto: "Automatisch (folgt dem Design)",
    theme_day: "Tag",
    theme_night: "Nacht",
    ed_uptime_days: "Verfügbarkeitszeitraum (Tage)",
    ed_show_indicators: "Kennzahlen",
    ed_show_services: "Dienste",
    ed_show_buttons: "Schaltflächen",
    ed_latency: "Latenz messen",
    ed_hide_url: "Fernzugriffs-URL maskieren",
    ed_zoom: "Zoom-Schaltfläche",
    ed_language: "Sprache",
    lang_auto: "Automatisch",
  },
  es: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Cargando…",
    connected: "Conectado",
    connecting: "Conectando",
    disconnected: "Desconectado",
    signed_out: "Sesión cerrada",
    not_set_up: "Sin configurar",
    sub_expired: "Suscripción caducada",
    check_one: "{n} por revisar",
    check_other: "{n} por revisar",
    renews: "Se renueva el {date}",
    ends: "Termina el {date}",
    remote_on: "Acceso remoto activo",
    remote_off: "Acceso remoto desactivado",
    remote_down: "Acceso remoto caído",
    remote_down_for: "Remoto caído · {d}",
    latency: "Latencia",
    latency_help: "Ida y vuelta de este navegador a Home Assistant por la URL remota",
    uptime: "Disponibilidad {n} d",
    uptime_help: "Tiempo de conexión del acceso remoto, según el historial del sensor Remote UI",
    certificate: "Certificado",
    cert_short: "Cert. {n} d",
    cert_help: "Días que faltan para que caduque el certificado del acceso remoto",
    unit_days: "d",
    remote: "Acceso remoto",
    backup: "Copia en la nube",
    webhooks: "Webhooks",
    tts: "TTS en la nube",
    st_off: "Desactivado",
    st_on: "Activado",
    st_down: "Caído · {d}",
    st_cert_error: "Error de certificado",
    st_cert_wait: "Preparando el certificado",
    st_linked: "Vinculado",
    st_not_linked: "Sin vincular",
    st_relink: "Volver a vincular",
    entities_one: "{n} entidad",
    entities_other: "{n} entidades",
    active_one: "{n} activo",
    active_other: "{n} activos",
    st_none: "Ninguno",
    st_ready: "Listo",
    st_offline: "Sin conexión",
    st_no_backup: "Sin copia en la nube",
    st_backup_error: "Error al subir",
    today: "Hoy {time}",
    yesterday: "Ayer {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Sincronizar asistentes de voz",
    syncing: "Sincronizando…",
    synced: "Asistentes de voz sincronizados",
    sync_failed: "Error al sincronizar: {error}",
    open_url: "Abrir la URL remota",
    settings: "Ajustes de la nube",
    close: "Cerrar",
    msg_not_set_up: "Home Assistant Cloud no está configurado en esta instancia.",
    msg_signed_out: "Inicia sesión en Home Assistant Cloud para usar el acceso remoto, las copias en la nube y los asistentes de voz.",
    f_url: "URL remota",
    f_status: "Estado",
    f_cert: "Certificado",
    f_expires: "Caduca",
    f_allow: "Activable desde la cuenta",
    f_last: "Última copia en la nube",
    f_size: "Tamaño",
    f_count: "Copias en la nube",
    f_next: "Próxima copia automática",
    f_report: "Informar del estado",
    f_entities: "Entidades expuestas",
    f_local: "Ejecución local",
    f_webhooks: "Cloudhooks",
    f_managed: "Gestionados por integraciones",
    f_language: "Idioma",
    f_voice: "Voz",
    yes: "Sí",
    no: "No",
    cs_ready: "Válido",
    cs_generating: "Generándose",
    cs_loading: "Cargando",
    cs_loaded: "Cargado",
    cs_error: "Error",
    zoom_in: "Mostrar la tarjeta completa",
    zoom_out: "Volver a la vista compacta",
    ed_title: "Título",
    ed_remote_entity: "Sensor Remote UI",
    ed_illustration: "Cabecera ilustrada",
    ed_illustration_theme: "Tema de la cabecera",
    theme_auto: "Automático (sigue el tema)",
    theme_day: "Día",
    theme_night: "Noche",
    ed_uptime_days: "Periodo de disponibilidad (días)",
    ed_show_indicators: "Indicadores",
    ed_show_services: "Servicios",
    ed_show_buttons: "Botones",
    ed_latency: "Medir la latencia",
    ed_hide_url: "Ocultar la URL remota",
    ed_zoom: "Botón de zoom",
    ed_language: "Idioma",
    lang_auto: "Automático",
  },
  sr: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Учитавање…",
    connected: "Повезано",
    connecting: "Повезивање",
    disconnected: "Веза прекинута",
    signed_out: "Одјављено",
    not_set_up: "Није подешено",
    sub_expired: "Претплата је истекла",
    check_one: "За проверу: {n}",
    check_other: "За проверу: {n}",
    renews: "Обнова {date}",
    ends: "Истиче {date}",
    remote_on: "Даљински приступ укључен",
    remote_off: "Даљински приступ искључен",
    remote_down: "Даљински приступ не ради",
    remote_down_for: "Даљински не ради · {d}",
    latency: "Кашњење",
    latency_help: "Повратно време од овог прегледача до Home Assistant-а преко удаљене адресе",
    uptime: "Доступност {n} д",
    uptime_help: "Време рада даљинске везе, из историје сензора Remote UI",
    certificate: "Сертификат",
    cert_short: "Серт. {n} д",
    cert_help: "Преостали дани до истека сертификата за даљински приступ",
    unit_days: "д",
    remote: "Даљински приступ",
    backup: "Резервна копија у облаку",
    webhooks: "Webhooks",
    tts: "TTS у облаку",
    st_off: "Искључено",
    st_on: "Укључено",
    st_down: "Не ради · {d}",
    st_cert_error: "Грешка сертификата",
    st_cert_wait: "Припрема сертификата",
    st_linked: "Повезан",
    st_not_linked: "Није повезан",
    st_relink: "Потребно поновно повезивање",
    entities_one: "Ентитета: {n}",
    entities_other: "Ентитета: {n}",
    active_one: "Активних: {n}",
    active_other: "Активних: {n}",
    st_none: "Нема",
    st_ready: "Спремно",
    st_offline: "Ван мреже",
    st_no_backup: "Нема копије у облаку",
    st_backup_error: "Отпремање није успело",
    today: "Данас {time}",
    yesterday: "Јуче {time}",
    minutes: "{n} мин",
    hours: "{n} ч",
    days: "{n} д",
    sync: "Синхронизуј гласовне асистенте",
    syncing: "Синхронизација…",
    synced: "Гласовни асистенти су синхронизовани",
    sync_failed: "Синхронизација није успела: {error}",
    open_url: "Отвори удаљену адресу",
    settings: "Подешавања облака",
    close: "Затвори",
    msg_not_set_up: "Home Assistant Cloud није подешен на овој инстанци.",
    msg_signed_out: "Пријавите се на Home Assistant Cloud да бисте користили даљински приступ, резервне копије у облаку и гласовне асистенте.",
    f_url: "Удаљена адреса",
    f_status: "Стање",
    f_cert: "Сертификат",
    f_expires: "Истиче",
    f_allow: "Може се укључити са налога",
    f_last: "Последња копија у облаку",
    f_size: "Величина",
    f_count: "Копије у облаку",
    f_next: "Следећа аутоматска копија",
    f_report: "Пријављивање стања",
    f_entities: "Изложени ентитети",
    f_local: "Локално извршавање",
    f_webhooks: "Cloudhooks",
    f_managed: "Којима управљају интеграције",
    f_language: "Језик",
    f_voice: "Глас",
    yes: "Да",
    no: "Не",
    cs_ready: "Важећи",
    cs_generating: "Прави се",
    cs_loading: "Учитава се",
    cs_loaded: "Учитан",
    cs_error: "Грешка",
    zoom_in: "Прикажи целу картицу",
    zoom_out: "Назад на компактни приказ",
    ed_title: "Наслов",
    ed_remote_entity: "Сензор Remote UI",
    ed_illustration: "Илустровани банер",
    ed_illustration_theme: "Тема банера",
    theme_auto: "Аутоматски (прати тему)",
    theme_day: "Дан",
    theme_night: "Ноћ",
    ed_uptime_days: "Период доступности (дани)",
    ed_show_indicators: "Показатељи",
    ed_show_services: "Услуге",
    ed_show_buttons: "Дугмад",
    ed_latency: "Мери кашњење",
    ed_hide_url: "Сакриј удаљену адресу",
    ed_zoom: "Дугме за увећање",
    ed_language: "Језик",
    lang_auto: "Аутоматски",
  },
  "sr-Latn": {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Učitavanje…",
    connected: "Povezano",
    connecting: "Povezivanje",
    disconnected: "Veza prekinuta",
    signed_out: "Odjavljeno",
    not_set_up: "Nije podešeno",
    sub_expired: "Pretplata je istekla",
    check_one: "Za proveru: {n}",
    check_other: "Za proveru: {n}",
    renews: "Obnova {date}",
    ends: "Ističe {date}",
    remote_on: "Daljinski pristup uključen",
    remote_off: "Daljinski pristup isključen",
    remote_down: "Daljinski pristup ne radi",
    remote_down_for: "Daljinski ne radi · {d}",
    latency: "Kašnjenje",
    latency_help: "Povratno vreme od ovog pregledača do Home Assistant-a preko udaljene adrese",
    uptime: "Dostupnost {n} d",
    uptime_help: "Vreme rada daljinske veze, iz istorije senzora Remote UI",
    certificate: "Sertifikat",
    cert_short: "Sert. {n} d",
    cert_help: "Preostali dani do isteka sertifikata za daljinski pristup",
    unit_days: "d",
    remote: "Daljinski pristup",
    backup: "Rezervna kopija u oblaku",
    webhooks: "Webhooks",
    tts: "TTS u oblaku",
    st_off: "Isključeno",
    st_on: "Uključeno",
    st_down: "Ne radi · {d}",
    st_cert_error: "Greška sertifikata",
    st_cert_wait: "Priprema sertifikata",
    st_linked: "Povezan",
    st_not_linked: "Nije povezan",
    st_relink: "Potrebno ponovno povezivanje",
    entities_one: "Entiteta: {n}",
    entities_other: "Entiteta: {n}",
    active_one: "Aktivnih: {n}",
    active_other: "Aktivnih: {n}",
    st_none: "Nema",
    st_ready: "Spremno",
    st_offline: "Van mreže",
    st_no_backup: "Nema kopije u oblaku",
    st_backup_error: "Otpremanje nije uspelo",
    today: "Danas {time}",
    yesterday: "Juče {time}",
    minutes: "{n} min",
    hours: "{n} č",
    days: "{n} d",
    sync: "Sinhronizuj glasovne asistente",
    syncing: "Sinhronizacija…",
    synced: "Glasovni asistenti su sinhronizovani",
    sync_failed: "Sinhronizacija nije uspela: {error}",
    open_url: "Otvori udaljenu adresu",
    settings: "Podešavanja oblaka",
    close: "Zatvori",
    msg_not_set_up: "Home Assistant Cloud nije podešen na ovoj instanci.",
    msg_signed_out: "Prijavite se na Home Assistant Cloud da biste koristili daljinski pristup, rezervne kopije u oblaku i glasovne asistente.",
    f_url: "Udaljena adresa",
    f_status: "Stanje",
    f_cert: "Sertifikat",
    f_expires: "Ističe",
    f_allow: "Može se uključiti sa naloga",
    f_last: "Poslednja kopija u oblaku",
    f_size: "Veličina",
    f_count: "Kopije u oblaku",
    f_next: "Sledeća automatska kopija",
    f_report: "Prijavljivanje stanja",
    f_entities: "Izloženi entiteti",
    f_local: "Lokalno izvršavanje",
    f_webhooks: "Cloudhooks",
    f_managed: "Kojima upravljaju integracije",
    f_language: "Jezik",
    f_voice: "Glas",
    yes: "Da",
    no: "Ne",
    cs_ready: "Važeći",
    cs_generating: "Pravi se",
    cs_loading: "Učitava se",
    cs_loaded: "Učitan",
    cs_error: "Greška",
    zoom_in: "Prikaži celu karticu",
    zoom_out: "Nazad na kompaktni prikaz",
    ed_title: "Naslov",
    ed_remote_entity: "Senzor Remote UI",
    ed_illustration: "Ilustrovani baner",
    ed_illustration_theme: "Tema banera",
    theme_auto: "Automatski (prati temu)",
    theme_day: "Dan",
    theme_night: "Noć",
    ed_uptime_days: "Period dostupnosti (dani)",
    ed_show_indicators: "Pokazatelji",
    ed_show_services: "Usluge",
    ed_show_buttons: "Dugmad",
    ed_latency: "Meri kašnjenje",
    ed_hide_url: "Sakrij udaljenu adresu",
    ed_zoom: "Dugme za uvećanje",
    ed_language: "Jezik",
    lang_auto: "Automatski",
  },
  it: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Caricamento…",
    connected: "Connesso",
    connecting: "Connessione",
    disconnected: "Disconnesso",
    signed_out: "Non connesso",
    not_set_up: "Non configurato",
    sub_expired: "Abbonamento scaduto",
    check_one: "{n} da controllare",
    check_other: "{n} da controllare",
    renews: "Rinnovo il {date}",
    ends: "Termina il {date}",
    remote_on: "Accesso remoto attivo",
    remote_off: "Accesso remoto disattivato",
    remote_down: "Accesso remoto non disponibile",
    remote_down_for: "Remoto non disponibile · {d}",
    latency: "Latenza",
    latency_help: "Andata e ritorno da questo browser a Home Assistant tramite l'URL remoto",
    uptime: "Disponibilità {n} g",
    uptime_help: "Tempo di connessione dell'accesso remoto, dalla cronologia del sensore Remote UI",
    certificate: "Certificato",
    cert_short: "Cert. {n} g",
    cert_help: "Giorni rimanenti prima della scadenza del certificato dell'accesso remoto",
    unit_days: "g",
    remote: "Accesso remoto",
    backup: "Backup nel cloud",
    webhooks: "Webhook",
    tts: "TTS nel cloud",
    st_off: "Disattivato",
    st_on: "Attivo",
    st_down: "Non disponibile · {d}",
    st_cert_error: "Errore del certificato",
    st_cert_wait: "Preparazione del certificato",
    st_linked: "Collegato",
    st_not_linked: "Non collegato",
    st_relink: "Da ricollegare",
    entities_one: "{n} entità",
    entities_other: "{n} entità",
    active_one: "{n} attivo",
    active_other: "{n} attivi",
    st_none: "Nessuno",
    st_ready: "Pronto",
    st_offline: "Offline",
    st_no_backup: "Nessun backup nel cloud",
    st_backup_error: "Caricamento non riuscito",
    today: "Oggi {time}",
    yesterday: "Ieri {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} g",
    sync: "Sincronizza gli assistenti vocali",
    syncing: "Sincronizzazione…",
    synced: "Assistenti vocali sincronizzati",
    sync_failed: "Sincronizzazione non riuscita: {error}",
    open_url: "Apri l'URL remoto",
    settings: "Impostazioni del cloud",
    close: "Chiudi",
    msg_not_set_up: "Home Assistant Cloud non è configurato su questa istanza.",
    msg_signed_out: "Accedi a Home Assistant Cloud per usare l'accesso remoto, i backup nel cloud e gli assistenti vocali.",
    f_url: "URL remoto",
    f_status: "Stato",
    f_cert: "Certificato",
    f_expires: "Scade",
    f_allow: "Attivabile dall'account",
    f_last: "Ultimo backup nel cloud",
    f_size: "Dimensione",
    f_count: "Backup nel cloud",
    f_next: "Prossimo backup automatico",
    f_report: "Segnalazione dello stato",
    f_entities: "Entità esposte",
    f_local: "Esecuzione locale",
    f_webhooks: "Cloudhook",
    f_managed: "Gestiti dalle integrazioni",
    f_language: "Lingua",
    f_voice: "Voce",
    yes: "Sì",
    no: "No",
    cs_ready: "Valido",
    cs_generating: "In creazione",
    cs_loading: "In caricamento",
    cs_loaded: "Caricato",
    cs_error: "Errore",
    zoom_in: "Mostra la scheda completa",
    zoom_out: "Torna alla vista compatta",
    ed_title: "Titolo",
    ed_remote_entity: "Sensore Remote UI",
    ed_illustration: "Intestazione illustrata",
    ed_illustration_theme: "Tema dell'intestazione",
    theme_auto: "Automatico (segue il tema)",
    theme_day: "Giorno",
    theme_night: "Notte",
    ed_uptime_days: "Periodo di disponibilità (giorni)",
    ed_show_indicators: "Indicatori",
    ed_show_services: "Servizi",
    ed_show_buttons: "Pulsanti",
    ed_latency: "Misura la latenza",
    ed_hide_url: "Nascondi l'URL remoto",
    ed_zoom: "Pulsante zoom",
    ed_language: "Lingua",
    lang_auto: "Automatica",
  },
  nl: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Laden…",
    connected: "Verbonden",
    connecting: "Verbinden",
    disconnected: "Verbroken",
    signed_out: "Afgemeld",
    not_set_up: "Niet ingesteld",
    sub_expired: "Abonnement verlopen",
    check_one: "{n} te controleren",
    check_other: "{n} te controleren",
    renews: "Verlengt op {date}",
    ends: "Eindigt op {date}",
    remote_on: "Externe toegang aan",
    remote_off: "Externe toegang uit",
    remote_down: "Externe toegang gestoord",
    remote_down_for: "Extern gestoord · {d}",
    latency: "Latentie",
    latency_help: "Retourtijd van deze browser naar Home Assistant via de externe URL",
    uptime: "Beschikbaarheid {n} d",
    uptime_help: "Verbindingstijd van de externe toegang, uit de recordergeschiedenis van de Remote UI-sensor",
    certificate: "Certificaat",
    cert_short: "Cert. {n} d",
    cert_help: "Dagen tot het certificaat van de externe toegang verloopt",
    unit_days: "d",
    remote: "Externe toegang",
    backup: "Cloudback-up",
    webhooks: "Webhooks",
    tts: "Cloud-TTS",
    st_off: "Uit",
    st_on: "Aan",
    st_down: "Gestoord · {d}",
    st_cert_error: "Certificaatfout",
    st_cert_wait: "Certificaat wordt voorbereid",
    st_linked: "Gekoppeld",
    st_not_linked: "Niet gekoppeld",
    st_relink: "Opnieuw koppelen",
    entities_one: "{n} entiteit",
    entities_other: "{n} entiteiten",
    active_one: "{n} actief",
    active_other: "{n} actief",
    st_none: "Geen",
    st_ready: "Klaar",
    st_offline: "Offline",
    st_no_backup: "Geen cloudback-up",
    st_backup_error: "Uploaden mislukt",
    today: "Vandaag {time}",
    yesterday: "Gisteren {time}",
    minutes: "{n} min",
    hours: "{n} u",
    days: "{n} d",
    sync: "Spraakassistenten synchroniseren",
    syncing: "Synchroniseren…",
    synced: "Spraakassistenten gesynchroniseerd",
    sync_failed: "Synchroniseren mislukt: {error}",
    open_url: "Externe URL openen",
    settings: "Cloudinstellingen",
    close: "Sluiten",
    msg_not_set_up: "Home Assistant Cloud is niet ingesteld op deze instantie.",
    msg_signed_out: "Meld je aan bij Home Assistant Cloud om externe toegang, cloudback-ups en de spraakassistenten te gebruiken.",
    f_url: "Externe URL",
    f_status: "Status",
    f_cert: "Certificaat",
    f_expires: "Verloopt",
    f_allow: "Vanuit het account in te schakelen",
    f_last: "Laatste cloudback-up",
    f_size: "Grootte",
    f_count: "Back-ups in de cloud",
    f_next: "Volgende automatische back-up",
    f_report: "Status melden",
    f_entities: "Blootgestelde entiteiten",
    f_local: "Lokale uitvoering",
    f_webhooks: "Cloudhooks",
    f_managed: "Beheerd door integraties",
    f_language: "Taal",
    f_voice: "Stem",
    yes: "Ja",
    no: "Nee",
    cs_ready: "Geldig",
    cs_generating: "Wordt aangemaakt",
    cs_loading: "Wordt geladen",
    cs_loaded: "Geladen",
    cs_error: "Fout",
    zoom_in: "Volledige kaart tonen",
    zoom_out: "Terug naar de compacte weergave",
    ed_title: "Titel",
    ed_remote_entity: "Remote UI-sensor",
    ed_illustration: "Geïllustreerde banner",
    ed_illustration_theme: "Thema van de banner",
    theme_auto: "Automatisch (volgt het thema)",
    theme_day: "Dag",
    theme_night: "Nacht",
    ed_uptime_days: "Beschikbaarheidsperiode (dagen)",
    ed_show_indicators: "Indicatoren",
    ed_show_services: "Diensten",
    ed_show_buttons: "Knoppen",
    ed_latency: "Latentie meten",
    ed_hide_url: "Externe URL maskeren",
    ed_zoom: "Zoomknop",
    ed_language: "Taal",
    lang_auto: "Automatisch",
  },
  pt: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "A carregar…",
    connected: "Ligado",
    connecting: "A ligar",
    disconnected: "Desligado",
    signed_out: "Sessão terminada",
    not_set_up: "Não configurado",
    sub_expired: "Subscrição expirada",
    check_one: "{n} a verificar",
    check_other: "{n} a verificar",
    renews: "Renova a {date}",
    ends: "Termina a {date}",
    remote_on: "Acesso remoto ativo",
    remote_off: "Acesso remoto desativado",
    remote_down: "Acesso remoto em baixo",
    remote_down_for: "Remoto em baixo · {d}",
    latency: "Latência",
    latency_help: "Ida e volta deste navegador ao Home Assistant pelo URL remoto",
    uptime: "Disponibilidade {n} d",
    uptime_help: "Tempo de ligação do acesso remoto, segundo o histórico do sensor Remote UI",
    certificate: "Certificado",
    cert_short: "Cert. {n} d",
    cert_help: "Dias até o certificado do acesso remoto expirar",
    unit_days: "d",
    remote: "Acesso remoto",
    backup: "Cópia na nuvem",
    webhooks: "Webhooks",
    tts: "TTS na nuvem",
    st_off: "Desativado",
    st_on: "Ativado",
    st_down: "Em baixo · {d}",
    st_cert_error: "Erro de certificado",
    st_cert_wait: "A preparar o certificado",
    st_linked: "Associado",
    st_not_linked: "Não associado",
    st_relink: "Associar novamente",
    entities_one: "{n} entidade",
    entities_other: "{n} entidades",
    active_one: "{n} ativo",
    active_other: "{n} ativos",
    st_none: "Nenhum",
    st_ready: "Pronto",
    st_offline: "Offline",
    st_no_backup: "Sem cópia na nuvem",
    st_backup_error: "Falha no envio",
    today: "Hoje {time}",
    yesterday: "Ontem {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Sincronizar assistentes de voz",
    syncing: "A sincronizar…",
    synced: "Assistentes de voz sincronizados",
    sync_failed: "Falha na sincronização: {error}",
    open_url: "Abrir o URL remoto",
    settings: "Definições da nuvem",
    close: "Fechar",
    msg_not_set_up: "O Home Assistant Cloud não está configurado nesta instância.",
    msg_signed_out: "Inicie sessão no Home Assistant Cloud para usar o acesso remoto, as cópias na nuvem e os assistentes de voz.",
    f_url: "URL remoto",
    f_status: "Estado",
    f_cert: "Certificado",
    f_expires: "Expira",
    f_allow: "Ativável a partir da conta",
    f_last: "Última cópia na nuvem",
    f_size: "Tamanho",
    f_count: "Cópias na nuvem",
    f_next: "Próxima cópia automática",
    f_report: "Comunicar o estado",
    f_entities: "Entidades expostas",
    f_local: "Execução local",
    f_webhooks: "Cloudhooks",
    f_managed: "Geridos por integrações",
    f_language: "Idioma",
    f_voice: "Voz",
    yes: "Sim",
    no: "Não",
    cs_ready: "Válido",
    cs_generating: "A gerar",
    cs_loading: "A carregar",
    cs_loaded: "Carregado",
    cs_error: "Erro",
    zoom_in: "Mostrar o cartão completo",
    zoom_out: "Voltar à vista compacta",
    ed_title: "Título",
    ed_remote_entity: "Sensor Remote UI",
    ed_illustration: "Faixa ilustrada",
    ed_illustration_theme: "Tema da faixa",
    theme_auto: "Automático (segue o tema)",
    theme_day: "Dia",
    theme_night: "Noite",
    ed_uptime_days: "Período de disponibilidade (dias)",
    ed_show_indicators: "Indicadores",
    ed_show_services: "Serviços",
    ed_show_buttons: "Botões",
    ed_latency: "Medir a latência",
    ed_hide_url: "Ocultar o URL remoto",
    ed_zoom: "Botão de zoom",
    ed_language: "Idioma",
    lang_auto: "Automático",
  },
  pl: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Ładowanie…",
    connected: "Połączono",
    connecting: "Łączenie",
    disconnected: "Rozłączono",
    signed_out: "Wylogowano",
    not_set_up: "Nieskonfigurowane",
    sub_expired: "Subskrypcja wygasła",
    check_one: "Do sprawdzenia: {n}",
    check_other: "Do sprawdzenia: {n}",
    renews: "Odnowienie {date}",
    ends: "Kończy się {date}",
    remote_on: "Dostęp zdalny włączony",
    remote_off: "Dostęp zdalny wyłączony",
    remote_down: "Dostęp zdalny nie działa",
    remote_down_for: "Zdalny nie działa · {d}",
    latency: "Opóźnienie",
    latency_help: "Czas przesyłu tam i z powrotem z tej przeglądarki do Home Assistanta przez zdalny adres URL",
    uptime: "Dostępność {n} d",
    uptime_help: "Czas działania połączenia zdalnego, z historii rejestratora czujnika Remote UI",
    certificate: "Certyfikat",
    cert_short: "Cert. {n} d",
    cert_help: "Dni do wygaśnięcia certyfikatu dostępu zdalnego",
    unit_days: "d",
    remote: "Dostęp zdalny",
    backup: "Kopia w chmurze",
    webhooks: "Webhooki",
    tts: "TTS w chmurze",
    st_off: "Wyłączone",
    st_on: "Włączone",
    st_down: "Nie działa · {d}",
    st_cert_error: "Błąd certyfikatu",
    st_cert_wait: "Przygotowanie certyfikatu",
    st_linked: "Połączone konto",
    st_not_linked: "Konto niepołączone",
    st_relink: "Wymaga ponownego połączenia",
    entities_one: "Encje: {n}",
    entities_other: "Encje: {n}",
    active_one: "Aktywne: {n}",
    active_other: "Aktywne: {n}",
    st_none: "Brak",
    st_ready: "Gotowe",
    st_offline: "Offline",
    st_no_backup: "Brak kopii w chmurze",
    st_backup_error: "Wysyłanie nie powiodło się",
    today: "Dziś {time}",
    yesterday: "Wczoraj {time}",
    minutes: "{n} min",
    hours: "{n} godz.",
    days: "{n} d",
    sync: "Synchronizuj asystentów głosowych",
    syncing: "Synchronizacja…",
    synced: "Asystenci głosowi zsynchronizowani",
    sync_failed: "Synchronizacja nie powiodła się: {error}",
    open_url: "Otwórz zdalny adres URL",
    settings: "Ustawienia chmury",
    close: "Zamknij",
    msg_not_set_up: "Home Assistant Cloud nie jest skonfigurowany w tej instancji.",
    msg_signed_out: "Zaloguj się do Home Assistant Cloud, aby korzystać z dostępu zdalnego, kopii w chmurze i asystentów głosowych.",
    f_url: "Zdalny adres URL",
    f_status: "Stan",
    f_cert: "Certyfikat",
    f_expires: "Wygasa",
    f_allow: "Można włączyć z konta",
    f_last: "Ostatnia kopia w chmurze",
    f_size: "Rozmiar",
    f_count: "Kopie w chmurze",
    f_next: "Następna automatyczna kopia",
    f_report: "Raportowanie stanu",
    f_entities: "Udostępnione encje",
    f_local: "Wykonywanie lokalne",
    f_webhooks: "Cloudhooki",
    f_managed: "Zarządzane przez integracje",
    f_language: "Język",
    f_voice: "Głos",
    yes: "Tak",
    no: "Nie",
    cs_ready: "Ważny",
    cs_generating: "Tworzenie",
    cs_loading: "Ładowanie",
    cs_loaded: "Załadowany",
    cs_error: "Błąd",
    zoom_in: "Pokaż pełną kartę",
    zoom_out: "Wróć do widoku kompaktowego",
    ed_title: "Tytuł",
    ed_remote_entity: "Czujnik Remote UI",
    ed_illustration: "Ilustrowany baner",
    ed_illustration_theme: "Motyw banera",
    theme_auto: "Automatycznie (według motywu)",
    theme_day: "Dzień",
    theme_night: "Noc",
    ed_uptime_days: "Okres dostępności (dni)",
    ed_show_indicators: "Wskaźniki",
    ed_show_services: "Usługi",
    ed_show_buttons: "Przyciski",
    ed_latency: "Mierz opóźnienie",
    ed_hide_url: "Ukryj zdalny adres URL",
    ed_zoom: "Przycisk powiększenia",
    ed_language: "Język",
    lang_auto: "Automatyczny",
  },
  ro: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Se încarcă…",
    connected: "Conectat",
    connecting: "Se conectează",
    disconnected: "Deconectat",
    signed_out: "Neautentificat",
    not_set_up: "Neconfigurat",
    sub_expired: "Abonament expirat",
    check_one: "De verificat: {n}",
    check_other: "De verificat: {n}",
    renews: "Se reînnoiește pe {date}",
    ends: "Se încheie pe {date}",
    remote_on: "Acces la distanță activ",
    remote_off: "Acces la distanță oprit",
    remote_down: "Acces la distanță căzut",
    remote_down_for: "La distanță căzut · {d}",
    latency: "Latență",
    latency_help: "Dus-întors din acest browser la Home Assistant prin URL-ul la distanță",
    uptime: "Disponibilitate {n} z",
    uptime_help: "Timpul de funcționare al conexiunii la distanță, din istoricul senzorului Remote UI",
    certificate: "Certificat",
    cert_short: "Cert. {n} z",
    cert_help: "Zile rămase până la expirarea certificatului accesului la distanță",
    unit_days: "z",
    remote: "Acces la distanță",
    backup: "Backup în cloud",
    webhooks: "Webhook-uri",
    tts: "TTS în cloud",
    st_off: "Oprit",
    st_on: "Pornit",
    st_down: "Căzut · {d}",
    st_cert_error: "Eroare de certificat",
    st_cert_wait: "Se pregătește certificatul",
    st_linked: "Asociat",
    st_not_linked: "Neasociat",
    st_relink: "Necesită reasociere",
    entities_one: "Entități: {n}",
    entities_other: "Entități: {n}",
    active_one: "Active: {n}",
    active_other: "Active: {n}",
    st_none: "Niciunul",
    st_ready: "Pregătit",
    st_offline: "Offline",
    st_no_backup: "Niciun backup în cloud",
    st_backup_error: "Încărcare eșuată",
    today: "Azi {time}",
    yesterday: "Ieri {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} z",
    sync: "Sincronizează asistenții vocali",
    syncing: "Se sincronizează…",
    synced: "Asistenții vocali au fost sincronizați",
    sync_failed: "Sincronizare eșuată: {error}",
    open_url: "Deschide URL-ul la distanță",
    settings: "Setări cloud",
    close: "Închide",
    msg_not_set_up: "Home Assistant Cloud nu este configurat pe această instanță.",
    msg_signed_out: "Autentifică-te în Home Assistant Cloud pentru a folosi accesul la distanță, backupurile în cloud și asistenții vocali.",
    f_url: "URL la distanță",
    f_status: "Stare",
    f_cert: "Certificat",
    f_expires: "Expiră",
    f_allow: "Poate fi pornit din cont",
    f_last: "Ultimul backup în cloud",
    f_size: "Dimensiune",
    f_count: "Backupuri în cloud",
    f_next: "Următorul backup automat",
    f_report: "Raportarea stării",
    f_entities: "Entități expuse",
    f_local: "Execuție locală",
    f_webhooks: "Cloudhook-uri",
    f_managed: "Gestionate de integrări",
    f_language: "Limbă",
    f_voice: "Voce",
    yes: "Da",
    no: "Nu",
    cs_ready: "Valid",
    cs_generating: "Se generează",
    cs_loading: "Se încarcă",
    cs_loaded: "Încărcat",
    cs_error: "Eroare",
    zoom_in: "Afișează cardul complet",
    zoom_out: "Înapoi la vizualizarea compactă",
    ed_title: "Titlu",
    ed_remote_entity: "Senzor Remote UI",
    ed_illustration: "Banner ilustrat",
    ed_illustration_theme: "Tema bannerului",
    theme_auto: "Automat (urmează tema)",
    theme_day: "Zi",
    theme_night: "Noapte",
    ed_uptime_days: "Perioada de disponibilitate (zile)",
    ed_show_indicators: "Indicatori",
    ed_show_services: "Servicii",
    ed_show_buttons: "Butoane",
    ed_latency: "Măsoară latența",
    ed_hide_url: "Ascunde URL-ul la distanță",
    ed_zoom: "Buton de zoom",
    ed_language: "Limbă",
    lang_auto: "Automată",
  },
  da: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Indlæser…",
    connected: "Forbundet",
    connecting: "Forbinder",
    disconnected: "Afbrudt",
    signed_out: "Logget ud",
    not_set_up: "Ikke konfigureret",
    sub_expired: "Abonnement udløbet",
    check_one: "{n} at tjekke",
    check_other: "{n} at tjekke",
    renews: "Fornyes {date}",
    ends: "Slutter {date}",
    remote_on: "Fjernadgang til",
    remote_off: "Fjernadgang fra",
    remote_down: "Fjernadgang nede",
    remote_down_for: "Fjernadgang nede · {d}",
    latency: "Latens",
    latency_help: "Tur-retur fra denne browser til Home Assistant via fjern-URL'en",
    uptime: "Oppetid {n} d",
    uptime_help: "Tid fjernforbindelsen var oppe, fra recorder-historikken for Remote UI-sensoren",
    certificate: "Certifikat",
    cert_short: "Cert. {n} d",
    cert_help: "Dage tilbage før fjernadgangens certifikat udløber",
    unit_days: "d",
    remote: "Fjernadgang",
    backup: "Cloud-backup",
    webhooks: "Webhooks",
    tts: "Cloud-TTS",
    st_off: "Fra",
    st_on: "Til",
    st_down: "Nede · {d}",
    st_cert_error: "Certifikatfejl",
    st_cert_wait: "Certifikat forberedes",
    st_linked: "Tilknyttet",
    st_not_linked: "Ikke tilknyttet",
    st_relink: "Skal tilknyttes igen",
    entities_one: "{n} enhed",
    entities_other: "{n} enheder",
    active_one: "{n} aktiv",
    active_other: "{n} aktive",
    st_none: "Ingen",
    st_ready: "Klar",
    st_offline: "Offline",
    st_no_backup: "Ingen cloud-backup",
    st_backup_error: "Upload mislykkedes",
    today: "I dag {time}",
    yesterday: "I går {time}",
    minutes: "{n} min",
    hours: "{n} t",
    days: "{n} d",
    sync: "Synkroniser stemmeassistenter",
    syncing: "Synkroniserer…",
    synced: "Stemmeassistenter synkroniseret",
    sync_failed: "Synkronisering mislykkedes: {error}",
    open_url: "Åbn fjern-URL",
    settings: "Cloud-indstillinger",
    close: "Luk",
    msg_not_set_up: "Home Assistant Cloud er ikke konfigureret på denne instans.",
    msg_signed_out: "Log ind på Home Assistant Cloud for at bruge fjernadgang, cloud-backups og stemmeassistenterne.",
    f_url: "Fjern-URL",
    f_status: "Status",
    f_cert: "Certifikat",
    f_expires: "Udløber",
    f_allow: "Kan slås til fra kontoen",
    f_last: "Seneste cloud-backup",
    f_size: "Størrelse",
    f_count: "Backups i skyen",
    f_next: "Næste automatiske backup",
    f_report: "Rapportér tilstand",
    f_entities: "Eksponerede enheder",
    f_local: "Lokal udførelse",
    f_webhooks: "Cloudhooks",
    f_managed: "Styret af integrationer",
    f_language: "Sprog",
    f_voice: "Stemme",
    yes: "Ja",
    no: "Nej",
    cs_ready: "Gyldigt",
    cs_generating: "Oprettes",
    cs_loading: "Indlæses",
    cs_loaded: "Indlæst",
    cs_error: "Fejl",
    zoom_in: "Vis hele kortet",
    zoom_out: "Tilbage til den kompakte visning",
    ed_title: "Titel",
    ed_remote_entity: "Remote UI-sensor",
    ed_illustration: "Illustreret banner",
    ed_illustration_theme: "Bannertema",
    theme_auto: "Automatisk (følger temaet)",
    theme_day: "Dag",
    theme_night: "Nat",
    ed_uptime_days: "Oppetidsperiode (dage)",
    ed_show_indicators: "Indikatorer",
    ed_show_services: "Tjenester",
    ed_show_buttons: "Knapper",
    ed_latency: "Mål latensen",
    ed_hide_url: "Skjul fjern-URL'en",
    ed_zoom: "Zoomknap",
    ed_language: "Sprog",
    lang_auto: "Automatisk",
  },
  sv: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Läser in…",
    connected: "Ansluten",
    connecting: "Ansluter",
    disconnected: "Frånkopplad",
    signed_out: "Utloggad",
    not_set_up: "Inte konfigurerad",
    sub_expired: "Prenumerationen har gått ut",
    check_one: "{n} att kontrollera",
    check_other: "{n} att kontrollera",
    renews: "Förnyas {date}",
    ends: "Upphör {date}",
    remote_on: "Fjärråtkomst på",
    remote_off: "Fjärråtkomst av",
    remote_down: "Fjärråtkomst nere",
    remote_down_for: "Fjärråtkomst nere · {d}",
    latency: "Latens",
    latency_help: "Tur och retur från den här webbläsaren till Home Assistant via fjärr-URL:en",
    uptime: "Drifttid {n} d",
    uptime_help: "Tid som fjärranslutningen var uppe, från inspelarens historik för Remote UI-sensorn",
    certificate: "Certifikat",
    cert_short: "Cert. {n} d",
    cert_help: "Dagar kvar innan fjärråtkomstens certifikat går ut",
    unit_days: "d",
    remote: "Fjärråtkomst",
    backup: "Molnsäkerhetskopia",
    webhooks: "Webhooks",
    tts: "Moln-TTS",
    st_off: "Av",
    st_on: "På",
    st_down: "Nere · {d}",
    st_cert_error: "Certifikatfel",
    st_cert_wait: "Certifikatet förbereds",
    st_linked: "Länkad",
    st_not_linked: "Inte länkad",
    st_relink: "Behöver länkas igen",
    entities_one: "{n} entitet",
    entities_other: "{n} entiteter",
    active_one: "{n} aktiv",
    active_other: "{n} aktiva",
    st_none: "Inga",
    st_ready: "Redo",
    st_offline: "Offline",
    st_no_backup: "Ingen molnsäkerhetskopia",
    st_backup_error: "Uppladdningen misslyckades",
    today: "I dag {time}",
    yesterday: "I går {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Synkronisera röstassistenter",
    syncing: "Synkroniserar…",
    synced: "Röstassistenterna synkroniserade",
    sync_failed: "Synkroniseringen misslyckades: {error}",
    open_url: "Öppna fjärr-URL",
    settings: "Molninställningar",
    close: "Stäng",
    msg_not_set_up: "Home Assistant Cloud är inte konfigurerat på den här instansen.",
    msg_signed_out: "Logga in på Home Assistant Cloud för att använda fjärråtkomst, molnsäkerhetskopior och röstassistenterna.",
    f_url: "Fjärr-URL",
    f_status: "Status",
    f_cert: "Certifikat",
    f_expires: "Går ut",
    f_allow: "Kan slås på från kontot",
    f_last: "Senaste molnsäkerhetskopia",
    f_size: "Storlek",
    f_count: "Säkerhetskopior i molnet",
    f_next: "Nästa automatiska säkerhetskopia",
    f_report: "Rapportera tillstånd",
    f_entities: "Exponerade entiteter",
    f_local: "Lokal körning",
    f_webhooks: "Cloudhooks",
    f_managed: "Hanteras av integrationer",
    f_language: "Språk",
    f_voice: "Röst",
    yes: "Ja",
    no: "Nej",
    cs_ready: "Giltigt",
    cs_generating: "Skapas",
    cs_loading: "Läses in",
    cs_loaded: "Inläst",
    cs_error: "Fel",
    zoom_in: "Visa hela kortet",
    zoom_out: "Tillbaka till kompakt vy",
    ed_title: "Titel",
    ed_remote_entity: "Remote UI-sensor",
    ed_illustration: "Illustrerad banner",
    ed_illustration_theme: "Bannerns tema",
    theme_auto: "Automatiskt (följer temat)",
    theme_day: "Dag",
    theme_night: "Natt",
    ed_uptime_days: "Drifttidsperiod (dagar)",
    ed_show_indicators: "Indikatorer",
    ed_show_services: "Tjänster",
    ed_show_buttons: "Knappar",
    ed_latency: "Mät latensen",
    ed_hide_url: "Dölj fjärr-URL:en",
    ed_zoom: "Zoomknapp",
    ed_language: "Språk",
    lang_auto: "Automatiskt",
  },
  bg: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Зареждане…",
    connected: "Свързано",
    connecting: "Свързване",
    disconnected: "Прекъснато",
    signed_out: "Излязъл",
    not_set_up: "Не е настроено",
    sub_expired: "Абонаментът е изтекъл",
    check_one: "За проверка: {n}",
    check_other: "За проверка: {n}",
    renews: "Подновяване на {date}",
    ends: "Изтича на {date}",
    remote_on: "Отдалечен достъп включен",
    remote_off: "Отдалечен достъп изключен",
    remote_down: "Отдалеченият достъп не работи",
    remote_down_for: "Отдалечен не работи · {d}",
    latency: "Закъснение",
    latency_help: "Време за отиване и връщане от този браузър до Home Assistant през отдалечения адрес",
    uptime: "Достъпност {n} д",
    uptime_help: "Време на работа на отдалечената връзка, от историята на сензора Remote UI",
    certificate: "Сертификат",
    cert_short: "Серт. {n} д",
    cert_help: "Оставащи дни до изтичане на сертификата за отдалечен достъп",
    unit_days: "д",
    remote: "Отдалечен достъп",
    backup: "Резервно копие в облака",
    webhooks: "Webhooks",
    tts: "TTS в облака",
    st_off: "Изключено",
    st_on: "Включено",
    st_down: "Не работи · {d}",
    st_cert_error: "Грешка в сертификата",
    st_cert_wait: "Подготовка на сертификата",
    st_linked: "Свързан акаунт",
    st_not_linked: "Несвързан акаунт",
    st_relink: "Нужно е повторно свързване",
    entities_one: "Обекти: {n}",
    entities_other: "Обекти: {n}",
    active_one: "Активни: {n}",
    active_other: "Активни: {n}",
    st_none: "Няма",
    st_ready: "Готово",
    st_offline: "Офлайн",
    st_no_backup: "Няма копие в облака",
    st_backup_error: "Неуспешно качване",
    today: "Днес {time}",
    yesterday: "Вчера {time}",
    minutes: "{n} мин",
    hours: "{n} ч",
    days: "{n} д",
    sync: "Синхронизирай гласовите асистенти",
    syncing: "Синхронизиране…",
    synced: "Гласовите асистенти са синхронизирани",
    sync_failed: "Неуспешна синхронизация: {error}",
    open_url: "Отвори отдалечения адрес",
    settings: "Настройки на облака",
    close: "Затвори",
    msg_not_set_up: "Home Assistant Cloud не е настроен в тази инсталация.",
    msg_signed_out: "Влезте в Home Assistant Cloud, за да използвате отдалечения достъп, резервните копия в облака и гласовите асистенти.",
    f_url: "Отдалечен адрес",
    f_status: "Състояние",
    f_cert: "Сертификат",
    f_expires: "Изтича",
    f_allow: "Може да се включи от акаунта",
    f_last: "Последно копие в облака",
    f_size: "Размер",
    f_count: "Копия в облака",
    f_next: "Следващо автоматично копие",
    f_report: "Докладване на състоянието",
    f_entities: "Изложени обекти",
    f_local: "Локално изпълнение",
    f_webhooks: "Cloudhooks",
    f_managed: "Управлявани от интеграции",
    f_language: "Език",
    f_voice: "Глас",
    yes: "Да",
    no: "Не",
    cs_ready: "Валиден",
    cs_generating: "Създава се",
    cs_loading: "Зарежда се",
    cs_loaded: "Зареден",
    cs_error: "Грешка",
    zoom_in: "Покажи пълната карта",
    zoom_out: "Обратно към компактния изглед",
    ed_title: "Заглавие",
    ed_remote_entity: "Сензор Remote UI",
    ed_illustration: "Илюстриран банер",
    ed_illustration_theme: "Тема на банера",
    theme_auto: "Автоматично (следва темата)",
    theme_day: "Ден",
    theme_night: "Нощ",
    ed_uptime_days: "Период на достъпност (дни)",
    ed_show_indicators: "Показатели",
    ed_show_services: "Услуги",
    ed_show_buttons: "Бутони",
    ed_latency: "Измервай закъснението",
    ed_hide_url: "Скрий отдалечения адрес",
    ed_zoom: "Бутон за увеличение",
    ed_language: "Език",
    lang_auto: "Автоматично",
  },
  ru: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Загрузка…",
    connected: "Подключено",
    connecting: "Подключение",
    disconnected: "Отключено",
    signed_out: "Вход не выполнен",
    not_set_up: "Не настроено",
    sub_expired: "Подписка истекла",
    check_one: "Проверить: {n}",
    check_other: "Проверить: {n}",
    renews: "Продление {date}",
    ends: "Заканчивается {date}",
    remote_on: "Удалённый доступ включён",
    remote_off: "Удалённый доступ выключен",
    remote_down: "Удалённый доступ не работает",
    remote_down_for: "Удалённый не работает · {d}",
    latency: "Задержка",
    latency_help: "Время туда и обратно от этого браузера до Home Assistant через удалённый адрес",
    uptime: "Доступность {n} д",
    uptime_help: "Время работы удалённого подключения по истории датчика Remote UI",
    certificate: "Сертификат",
    cert_short: "Серт. {n} д",
    cert_help: "Дней до истечения сертификата удалённого доступа",
    unit_days: "д",
    remote: "Удалённый доступ",
    backup: "Копия в облаке",
    webhooks: "Webhooks",
    tts: "Облачный TTS",
    st_off: "Выключено",
    st_on: "Включено",
    st_down: "Не работает · {d}",
    st_cert_error: "Ошибка сертификата",
    st_cert_wait: "Подготовка сертификата",
    st_linked: "Аккаунт связан",
    st_not_linked: "Аккаунт не связан",
    st_relink: "Нужно связать заново",
    entities_one: "Объектов: {n}",
    entities_other: "Объектов: {n}",
    active_one: "Активных: {n}",
    active_other: "Активных: {n}",
    st_none: "Нет",
    st_ready: "Готово",
    st_offline: "Не в сети",
    st_no_backup: "Нет копии в облаке",
    st_backup_error: "Ошибка загрузки",
    today: "Сегодня {time}",
    yesterday: "Вчера {time}",
    minutes: "{n} мин",
    hours: "{n} ч",
    days: "{n} д",
    sync: "Синхронизировать голосовых ассистентов",
    syncing: "Синхронизация…",
    synced: "Голосовые ассистенты синхронизированы",
    sync_failed: "Ошибка синхронизации: {error}",
    open_url: "Открыть удалённый адрес",
    settings: "Настройки облака",
    close: "Закрыть",
    msg_not_set_up: "Home Assistant Cloud не настроен на этом экземпляре.",
    msg_signed_out: "Войдите в Home Assistant Cloud, чтобы пользоваться удалённым доступом, облачными копиями и голосовыми ассистентами.",
    f_url: "Удалённый адрес",
    f_status: "Состояние",
    f_cert: "Сертификат",
    f_expires: "Истекает",
    f_allow: "Можно включить из аккаунта",
    f_last: "Последняя копия в облаке",
    f_size: "Размер",
    f_count: "Копий в облаке",
    f_next: "Следующая автоматическая копия",
    f_report: "Передача состояния",
    f_entities: "Открытые объекты",
    f_local: "Локальное выполнение",
    f_webhooks: "Cloudhooks",
    f_managed: "Управляются интеграциями",
    f_language: "Язык",
    f_voice: "Голос",
    yes: "Да",
    no: "Нет",
    cs_ready: "Действителен",
    cs_generating: "Создаётся",
    cs_loading: "Загружается",
    cs_loaded: "Загружен",
    cs_error: "Ошибка",
    zoom_in: "Показать полную карточку",
    zoom_out: "Вернуться к компактному виду",
    ed_title: "Заголовок",
    ed_remote_entity: "Датчик Remote UI",
    ed_illustration: "Иллюстрированный баннер",
    ed_illustration_theme: "Тема баннера",
    theme_auto: "Автоматически (следует теме)",
    theme_day: "День",
    theme_night: "Ночь",
    ed_uptime_days: "Период доступности (дни)",
    ed_show_indicators: "Показатели",
    ed_show_services: "Сервисы",
    ed_show_buttons: "Кнопки",
    ed_latency: "Измерять задержку",
    ed_hide_url: "Скрыть удалённый адрес",
    ed_zoom: "Кнопка масштаба",
    ed_language: "Язык",
    lang_auto: "Автоматически",
  },
  uk: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Завантаження…",
    connected: "Підключено",
    connecting: "Підключення",
    disconnected: "Відключено",
    signed_out: "Вхід не виконано",
    not_set_up: "Не налаштовано",
    sub_expired: "Підписка закінчилася",
    check_one: "Перевірити: {n}",
    check_other: "Перевірити: {n}",
    renews: "Поновлення {date}",
    ends: "Закінчується {date}",
    remote_on: "Віддалений доступ увімкнено",
    remote_off: "Віддалений доступ вимкнено",
    remote_down: "Віддалений доступ не працює",
    remote_down_for: "Віддалений не працює · {d}",
    latency: "Затримка",
    latency_help: "Час туди й назад від цього браузера до Home Assistant через віддалену адресу",
    uptime: "Доступність {n} д",
    uptime_help: "Час роботи віддаленого підключення за історією датчика Remote UI",
    certificate: "Сертифікат",
    cert_short: "Серт. {n} д",
    cert_help: "Днів до завершення дії сертифіката віддаленого доступу",
    unit_days: "д",
    remote: "Віддалений доступ",
    backup: "Копія в хмарі",
    webhooks: "Webhooks",
    tts: "Хмарний TTS",
    st_off: "Вимкнено",
    st_on: "Увімкнено",
    st_down: "Не працює · {d}",
    st_cert_error: "Помилка сертифіката",
    st_cert_wait: "Підготовка сертифіката",
    st_linked: "Обліковий запис пов'язано",
    st_not_linked: "Обліковий запис не пов'язано",
    st_relink: "Потрібно пов'язати знову",
    entities_one: "Об'єктів: {n}",
    entities_other: "Об'єктів: {n}",
    active_one: "Активних: {n}",
    active_other: "Активних: {n}",
    st_none: "Немає",
    st_ready: "Готово",
    st_offline: "Не в мережі",
    st_no_backup: "Немає копії в хмарі",
    st_backup_error: "Помилка завантаження",
    today: "Сьогодні {time}",
    yesterday: "Учора {time}",
    minutes: "{n} хв",
    hours: "{n} год",
    days: "{n} д",
    sync: "Синхронізувати голосових асистентів",
    syncing: "Синхронізація…",
    synced: "Голосових асистентів синхронізовано",
    sync_failed: "Помилка синхронізації: {error}",
    open_url: "Відкрити віддалену адресу",
    settings: "Налаштування хмари",
    close: "Закрити",
    msg_not_set_up: "Home Assistant Cloud не налаштовано на цьому екземплярі.",
    msg_signed_out: "Увійдіть у Home Assistant Cloud, щоб користуватися віддаленим доступом, хмарними копіями та голосовими асистентами.",
    f_url: "Віддалена адреса",
    f_status: "Стан",
    f_cert: "Сертифікат",
    f_expires: "Закінчується",
    f_allow: "Можна увімкнути з облікового запису",
    f_last: "Остання копія в хмарі",
    f_size: "Розмір",
    f_count: "Копій у хмарі",
    f_next: "Наступна автоматична копія",
    f_report: "Передавання стану",
    f_entities: "Відкриті об'єкти",
    f_local: "Локальне виконання",
    f_webhooks: "Cloudhooks",
    f_managed: "Керуються інтеграціями",
    f_language: "Мова",
    f_voice: "Голос",
    yes: "Так",
    no: "Ні",
    cs_ready: "Дійсний",
    cs_generating: "Створюється",
    cs_loading: "Завантажується",
    cs_loaded: "Завантажено",
    cs_error: "Помилка",
    zoom_in: "Показати повну картку",
    zoom_out: "Повернутися до компактного вигляду",
    ed_title: "Заголовок",
    ed_remote_entity: "Датчик Remote UI",
    ed_illustration: "Ілюстрований банер",
    ed_illustration_theme: "Тема банера",
    theme_auto: "Автоматично (за темою)",
    theme_day: "День",
    theme_night: "Ніч",
    ed_uptime_days: "Період доступності (дні)",
    ed_show_indicators: "Показники",
    ed_show_services: "Сервіси",
    ed_show_buttons: "Кнопки",
    ed_latency: "Вимірювати затримку",
    ed_hide_url: "Приховати віддалену адресу",
    ed_zoom: "Кнопка масштабу",
    ed_language: "Мова",
    lang_auto: "Автоматично",
  },
  hu: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Betöltés…",
    connected: "Csatlakozva",
    connecting: "Csatlakozás",
    disconnected: "Leválasztva",
    signed_out: "Kijelentkezve",
    not_set_up: "Nincs beállítva",
    sub_expired: "Lejárt előfizetés",
    check_one: "Ellenőrizendő: {n}",
    check_other: "Ellenőrizendő: {n}",
    renews: "Megújul: {date}",
    ends: "Lejár: {date}",
    remote_on: "Távoli elérés be",
    remote_off: "Távoli elérés ki",
    remote_down: "Távoli elérés nem működik",
    remote_down_for: "Távoli elérés nem működik · {d}",
    latency: "Késleltetés",
    latency_help: "Oda-vissza idő ebből a böngészőből a Home Assistantig a távoli URL-en át",
    uptime: "Rendelkezésre állás {n} n",
    uptime_help: "A távoli kapcsolat üzemideje a Remote UI érzékelő előzményei alapján",
    certificate: "Tanúsítvány",
    cert_short: "Tan. {n} n",
    cert_help: "Hátralévő napok a távoli elérés tanúsítványának lejártáig",
    unit_days: "n",
    remote: "Távoli elérés",
    backup: "Felhőmentés",
    webhooks: "Webhookok",
    tts: "Felhős TTS",
    st_off: "Ki",
    st_on: "Be",
    st_down: "Nem működik · {d}",
    st_cert_error: "Tanúsítványhiba",
    st_cert_wait: "Tanúsítvány előkészítése",
    st_linked: "Összekapcsolva",
    st_not_linked: "Nincs összekapcsolva",
    st_relink: "Újra össze kell kapcsolni",
    entities_one: "{n} entitás",
    entities_other: "{n} entitás",
    active_one: "{n} aktív",
    active_other: "{n} aktív",
    st_none: "Nincs",
    st_ready: "Kész",
    st_offline: "Offline",
    st_no_backup: "Nincs felhőmentés",
    st_backup_error: "Sikertelen feltöltés",
    today: "Ma {time}",
    yesterday: "Tegnap {time}",
    minutes: "{n} perc",
    hours: "{n} óra",
    days: "{n} n",
    sync: "Hangasszisztensek szinkronizálása",
    syncing: "Szinkronizálás…",
    synced: "Hangasszisztensek szinkronizálva",
    sync_failed: "Sikertelen szinkronizálás: {error}",
    open_url: "Távoli URL megnyitása",
    settings: "Felhőbeállítások",
    close: "Bezárás",
    msg_not_set_up: "A Home Assistant Cloud nincs beállítva ezen a példányon.",
    msg_signed_out: "Jelentkezz be a Home Assistant Cloudba a távoli elérés, a felhőmentések és a hangasszisztensek használatához.",
    f_url: "Távoli URL",
    f_status: "Állapot",
    f_cert: "Tanúsítvány",
    f_expires: "Lejár",
    f_allow: "A fiókból bekapcsolható",
    f_last: "Utolsó felhőmentés",
    f_size: "Méret",
    f_count: "Mentések a felhőben",
    f_next: "Következő automatikus mentés",
    f_report: "Állapotjelentés",
    f_entities: "Megosztott entitások",
    f_local: "Helyi végrehajtás",
    f_webhooks: "Cloudhookok",
    f_managed: "Integrációk által kezelt",
    f_language: "Nyelv",
    f_voice: "Hang",
    yes: "Igen",
    no: "Nem",
    cs_ready: "Érvényes",
    cs_generating: "Létrehozás alatt",
    cs_loading: "Betöltés alatt",
    cs_loaded: "Betöltve",
    cs_error: "Hiba",
    zoom_in: "Teljes kártya megjelenítése",
    zoom_out: "Vissza a kompakt nézethez",
    ed_title: "Cím",
    ed_remote_entity: "Remote UI érzékelő",
    ed_illustration: "Illusztrált fejléc",
    ed_illustration_theme: "Fejléc témája",
    theme_auto: "Automatikus (a témát követi)",
    theme_day: "Nappal",
    theme_night: "Éjszaka",
    ed_uptime_days: "Rendelkezésre állási időszak (nap)",
    ed_show_indicators: "Mutatók",
    ed_show_services: "Szolgáltatások",
    ed_show_buttons: "Gombok",
    ed_latency: "Késleltetés mérése",
    ed_hide_url: "Távoli URL elrejtése",
    ed_zoom: "Nagyítás gomb",
    ed_language: "Nyelv",
    lang_auto: "Automatikus",
  },
  sk: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Načítava sa…",
    connected: "Pripojené",
    connecting: "Pripája sa",
    disconnected: "Odpojené",
    signed_out: "Odhlásené",
    not_set_up: "Nenastavené",
    sub_expired: "Predplatné vypršalo",
    check_one: "Na kontrolu: {n}",
    check_other: "Na kontrolu: {n}",
    renews: "Obnoví sa {date}",
    ends: "Končí {date}",
    remote_on: "Vzdialený prístup zapnutý",
    remote_off: "Vzdialený prístup vypnutý",
    remote_down: "Vzdialený prístup nefunguje",
    remote_down_for: "Vzdialený nefunguje · {d}",
    latency: "Odozva",
    latency_help: "Čas tam a späť z tohto prehliadača do Home Assistanta cez vzdialenú adresu",
    uptime: "Dostupnosť {n} d",
    uptime_help: "Čas, keď bolo vzdialené pripojenie aktívne, z histórie snímača Remote UI",
    certificate: "Certifikát",
    cert_short: "Cert. {n} d",
    cert_help: "Zostávajúce dni do vypršania certifikátu vzdialeného prístupu",
    unit_days: "d",
    remote: "Vzdialený prístup",
    backup: "Záloha v cloude",
    webhooks: "Webhooky",
    tts: "TTS v cloude",
    st_off: "Vypnuté",
    st_on: "Zapnuté",
    st_down: "Nefunguje · {d}",
    st_cert_error: "Chyba certifikátu",
    st_cert_wait: "Príprava certifikátu",
    st_linked: "Prepojené",
    st_not_linked: "Neprepojené",
    st_relink: "Treba znova prepojiť",
    entities_one: "Entity: {n}",
    entities_other: "Entity: {n}",
    active_one: "Aktívne: {n}",
    active_other: "Aktívne: {n}",
    st_none: "Žiadne",
    st_ready: "Pripravené",
    st_offline: "Offline",
    st_no_backup: "Žiadna záloha v cloude",
    st_backup_error: "Nahrávanie zlyhalo",
    today: "Dnes {time}",
    yesterday: "Včera {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Synchronizovať hlasových asistentov",
    syncing: "Synchronizuje sa…",
    synced: "Hlasoví asistenti synchronizovaní",
    sync_failed: "Synchronizácia zlyhala: {error}",
    open_url: "Otvoriť vzdialenú adresu",
    settings: "Nastavenia cloudu",
    close: "Zavrieť",
    msg_not_set_up: "Home Assistant Cloud nie je na tejto inštancii nastavený.",
    msg_signed_out: "Prihláste sa do Home Assistant Cloud, aby ste mohli používať vzdialený prístup, zálohy v cloude a hlasových asistentov.",
    f_url: "Vzdialená adresa",
    f_status: "Stav",
    f_cert: "Certifikát",
    f_expires: "Platí do",
    f_allow: "Dá sa zapnúť z účtu",
    f_last: "Posledná záloha v cloude",
    f_size: "Veľkosť",
    f_count: "Zálohy v cloude",
    f_next: "Ďalšia automatická záloha",
    f_report: "Hlásenie stavu",
    f_entities: "Sprístupnené entity",
    f_local: "Lokálne vykonávanie",
    f_webhooks: "Cloudhooky",
    f_managed: "Spravované integráciami",
    f_language: "Jazyk",
    f_voice: "Hlas",
    yes: "Áno",
    no: "Nie",
    cs_ready: "Platný",
    cs_generating: "Vytvára sa",
    cs_loading: "Načítava sa",
    cs_loaded: "Načítaný",
    cs_error: "Chyba",
    zoom_in: "Zobraziť celú kartu",
    zoom_out: "Späť na kompaktné zobrazenie",
    ed_title: "Názov",
    ed_remote_entity: "Snímač Remote UI",
    ed_illustration: "Ilustrovaný banner",
    ed_illustration_theme: "Téma bannera",
    theme_auto: "Automaticky (podľa témy)",
    theme_day: "Deň",
    theme_night: "Noc",
    ed_uptime_days: "Obdobie dostupnosti (dni)",
    ed_show_indicators: "Ukazovatele",
    ed_show_services: "Služby",
    ed_show_buttons: "Tlačidlá",
    ed_latency: "Merať odozvu",
    ed_hide_url: "Skryť vzdialenú adresu",
    ed_zoom: "Tlačidlo priblíženia",
    ed_language: "Jazyk",
    lang_auto: "Automaticky",
  },
  cs: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Načítání…",
    connected: "Připojeno",
    connecting: "Připojování",
    disconnected: "Odpojeno",
    signed_out: "Odhlášeno",
    not_set_up: "Nenastaveno",
    sub_expired: "Předplatné vypršelo",
    check_one: "Ke kontrole: {n}",
    check_other: "Ke kontrole: {n}",
    renews: "Obnovení {date}",
    ends: "Končí {date}",
    remote_on: "Vzdálený přístup zapnut",
    remote_off: "Vzdálený přístup vypnut",
    remote_down: "Vzdálený přístup nefunguje",
    remote_down_for: "Vzdálený nefunguje · {d}",
    latency: "Odezva",
    latency_help: "Doba tam a zpět z tohoto prohlížeče do Home Assistantu přes vzdálenou adresu",
    uptime: "Dostupnost {n} d",
    uptime_help: "Doba, po kterou bylo vzdálené připojení aktivní, z historie senzoru Remote UI",
    certificate: "Certifikát",
    cert_short: "Cert. {n} d",
    cert_help: "Zbývající dny do vypršení certifikátu vzdáleného přístupu",
    unit_days: "d",
    remote: "Vzdálený přístup",
    backup: "Záloha v cloudu",
    webhooks: "Webhooky",
    tts: "TTS v cloudu",
    st_off: "Vypnuto",
    st_on: "Zapnuto",
    st_down: "Nefunguje · {d}",
    st_cert_error: "Chyba certifikátu",
    st_cert_wait: "Příprava certifikátu",
    st_linked: "Propojeno",
    st_not_linked: "Nepropojeno",
    st_relink: "Nutné znovu propojit",
    entities_one: "Entity: {n}",
    entities_other: "Entity: {n}",
    active_one: "Aktivní: {n}",
    active_other: "Aktivní: {n}",
    st_none: "Žádné",
    st_ready: "Připraveno",
    st_offline: "Offline",
    st_no_backup: "Žádná záloha v cloudu",
    st_backup_error: "Nahrání selhalo",
    today: "Dnes {time}",
    yesterday: "Včera {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Synchronizovat hlasové asistenty",
    syncing: "Synchronizace…",
    synced: "Hlasoví asistenti synchronizováni",
    sync_failed: "Synchronizace selhala: {error}",
    open_url: "Otevřít vzdálenou adresu",
    settings: "Nastavení cloudu",
    close: "Zavřít",
    msg_not_set_up: "Home Assistant Cloud není na této instanci nastaven.",
    msg_signed_out: "Přihlaste se do Home Assistant Cloud a používejte vzdálený přístup, zálohy v cloudu a hlasové asistenty.",
    f_url: "Vzdálená adresa",
    f_status: "Stav",
    f_cert: "Certifikát",
    f_expires: "Platí do",
    f_allow: "Lze zapnout z účtu",
    f_last: "Poslední záloha v cloudu",
    f_size: "Velikost",
    f_count: "Zálohy v cloudu",
    f_next: "Další automatická záloha",
    f_report: "Hlášení stavu",
    f_entities: "Zpřístupněné entity",
    f_local: "Místní vykonávání",
    f_webhooks: "Cloudhooky",
    f_managed: "Spravované integracemi",
    f_language: "Jazyk",
    f_voice: "Hlas",
    yes: "Ano",
    no: "Ne",
    cs_ready: "Platný",
    cs_generating: "Vytváří se",
    cs_loading: "Načítá se",
    cs_loaded: "Načten",
    cs_error: "Chyba",
    zoom_in: "Zobrazit celou kartu",
    zoom_out: "Zpět na kompaktní zobrazení",
    ed_title: "Název",
    ed_remote_entity: "Senzor Remote UI",
    ed_illustration: "Ilustrovaný banner",
    ed_illustration_theme: "Motiv banneru",
    theme_auto: "Automaticky (podle motivu)",
    theme_day: "Den",
    theme_night: "Noc",
    ed_uptime_days: "Období dostupnosti (dny)",
    ed_show_indicators: "Ukazatele",
    ed_show_services: "Služby",
    ed_show_buttons: "Tlačítka",
    ed_latency: "Měřit odezvu",
    ed_hide_url: "Skrýt vzdálenou adresu",
    ed_zoom: "Tlačítko přiblížení",
    ed_language: "Jazyk",
    lang_auto: "Automaticky",
  },
  sl: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Nalaganje…",
    connected: "Povezano",
    connecting: "Povezovanje",
    disconnected: "Prekinjeno",
    signed_out: "Odjavljeno",
    not_set_up: "Ni nastavljeno",
    sub_expired: "Naročnina je potekla",
    check_one: "Za preverjanje: {n}",
    check_other: "Za preverjanje: {n}",
    renews: "Podaljšanje {date}",
    ends: "Poteče {date}",
    remote_on: "Oddaljeni dostop vklopljen",
    remote_off: "Oddaljeni dostop izklopljen",
    remote_down: "Oddaljeni dostop ne deluje",
    remote_down_for: "Oddaljeni ne deluje · {d}",
    latency: "Zakasnitev",
    latency_help: "Čas tja in nazaj iz tega brskalnika do Home Assistanta prek oddaljenega naslova",
    uptime: "Razpoložljivost {n} d",
    uptime_help: "Čas delovanja oddaljene povezave, iz zgodovine senzorja Remote UI",
    certificate: "Potrdilo",
    cert_short: "Potr. {n} d",
    cert_help: "Preostali dnevi do poteka potrdila oddaljenega dostopa",
    unit_days: "d",
    remote: "Oddaljeni dostop",
    backup: "Varnostna kopija v oblaku",
    webhooks: "Webhooki",
    tts: "TTS v oblaku",
    st_off: "Izklopljeno",
    st_on: "Vklopljeno",
    st_down: "Ne deluje · {d}",
    st_cert_error: "Napaka potrdila",
    st_cert_wait: "Pripravljanje potrdila",
    st_linked: "Povezano",
    st_not_linked: "Ni povezano",
    st_relink: "Potrebna ponovna povezava",
    entities_one: "Entitete: {n}",
    entities_other: "Entitete: {n}",
    active_one: "Aktivni: {n}",
    active_other: "Aktivni: {n}",
    st_none: "Brez",
    st_ready: "Pripravljeno",
    st_offline: "Brez povezave",
    st_no_backup: "Ni kopije v oblaku",
    st_backup_error: "Nalaganje ni uspelo",
    today: "Danes {time}",
    yesterday: "Včeraj {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Sinhroniziraj glasovne pomočnike",
    syncing: "Sinhroniziranje…",
    synced: "Glasovni pomočniki so sinhronizirani",
    sync_failed: "Sinhronizacija ni uspela: {error}",
    open_url: "Odpri oddaljeni naslov",
    settings: "Nastavitve oblaka",
    close: "Zapri",
    msg_not_set_up: "Home Assistant Cloud v tej namestitvi ni nastavljen.",
    msg_signed_out: "Prijavite se v Home Assistant Cloud za oddaljeni dostop, varnostne kopije v oblaku in glasovne pomočnike.",
    f_url: "Oddaljeni naslov",
    f_status: "Stanje",
    f_cert: "Potrdilo",
    f_expires: "Poteče",
    f_allow: "Vklop mogoč iz računa",
    f_last: "Zadnja kopija v oblaku",
    f_size: "Velikost",
    f_count: "Kopije v oblaku",
    f_next: "Naslednja samodejna kopija",
    f_report: "Poročanje stanja",
    f_entities: "Izpostavljene entitete",
    f_local: "Lokalno izvajanje",
    f_webhooks: "Cloudhooki",
    f_managed: "Upravljajo jih integracije",
    f_language: "Jezik",
    f_voice: "Glas",
    yes: "Da",
    no: "Ne",
    cs_ready: "Veljavno",
    cs_generating: "Ustvarjanje",
    cs_loading: "Nalaganje",
    cs_loaded: "Naloženo",
    cs_error: "Napaka",
    zoom_in: "Prikaži celotno kartico",
    zoom_out: "Nazaj na strnjen pogled",
    ed_title: "Naslov",
    ed_remote_entity: "Senzor Remote UI",
    ed_illustration: "Ilustrirana pasica",
    ed_illustration_theme: "Tema pasice",
    theme_auto: "Samodejno (sledi temi)",
    theme_day: "Dan",
    theme_night: "Noč",
    ed_uptime_days: "Obdobje razpoložljivosti (dnevi)",
    ed_show_indicators: "Kazalniki",
    ed_show_services: "Storitve",
    ed_show_buttons: "Gumbi",
    ed_latency: "Merjenje zakasnitve",
    ed_hide_url: "Skrij oddaljeni naslov",
    ed_zoom: "Gumb za povečavo",
    ed_language: "Jezik",
    lang_auto: "Samodejno",
  },
  lv: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Ielādē…",
    connected: "Savienots",
    connecting: "Savienojas",
    disconnected: "Atvienots",
    signed_out: "Izrakstījies",
    not_set_up: "Nav iestatīts",
    sub_expired: "Abonements beidzies",
    check_one: "Jāpārbauda: {n}",
    check_other: "Jāpārbauda: {n}",
    renews: "Atjaunojas {date}",
    ends: "Beidzas {date}",
    remote_on: "Attālā piekļuve ieslēgta",
    remote_off: "Attālā piekļuve izslēgta",
    remote_down: "Attālā piekļuve nedarbojas",
    remote_down_for: "Attālā nedarbojas · {d}",
    latency: "Latentums",
    latency_help: "Turp un atpakaļ laiks no šīs pārlūkprogrammas līdz Home Assistant caur attālo URL",
    uptime: "Pieejamība {n} d",
    uptime_help: "Attālā savienojuma darbības laiks pēc sensora Remote UI vēstures",
    certificate: "Sertifikāts",
    cert_short: "Sert. {n} d",
    cert_help: "Atlikušās dienas līdz attālās piekļuves sertifikāta derīguma beigām",
    unit_days: "d",
    remote: "Attālā piekļuve",
    backup: "Mākoņa dublējums",
    webhooks: "Tīmekļa āķi",
    tts: "Mākoņa TTS",
    st_off: "Izslēgts",
    st_on: "Ieslēgts",
    st_down: "Nedarbojas · {d}",
    st_cert_error: "Sertifikāta kļūda",
    st_cert_wait: "Sertifikāts tiek gatavots",
    st_linked: "Sasaistīts",
    st_not_linked: "Nav sasaistīts",
    st_relink: "Jāsasaista atkārtoti",
    entities_one: "Vienības: {n}",
    entities_other: "Vienības: {n}",
    active_one: "Aktīvi: {n}",
    active_other: "Aktīvi: {n}",
    st_none: "Nav",
    st_ready: "Gatavs",
    st_offline: "Bezsaistē",
    st_no_backup: "Nav mākoņa dublējuma",
    st_backup_error: "Augšupielāde neizdevās",
    today: "Šodien {time}",
    yesterday: "Vakar {time}",
    minutes: "{n} min",
    hours: "{n} h",
    days: "{n} d",
    sync: "Sinhronizēt balss palīgus",
    syncing: "Sinhronizē…",
    synced: "Balss palīgi sinhronizēti",
    sync_failed: "Sinhronizācija neizdevās: {error}",
    open_url: "Atvērt attālo URL",
    settings: "Mākoņa iestatījumi",
    close: "Aizvērt",
    msg_not_set_up: "Home Assistant Cloud šajā instancē nav iestatīts.",
    msg_signed_out: "Pierakstieties Home Assistant Cloud, lai izmantotu attālo piekļuvi, mākoņa dublējumus un balss palīgus.",
    f_url: "Attālais URL",
    f_status: "Stāvoklis",
    f_cert: "Sertifikāts",
    f_expires: "Derīgs līdz",
    f_allow: "Var ieslēgt no konta",
    f_last: "Pēdējais mākoņa dublējums",
    f_size: "Izmērs",
    f_count: "Dublējumi mākonī",
    f_next: "Nākamais automātiskais dublējums",
    f_report: "Stāvokļa ziņošana",
    f_entities: "Atklātās vienības",
    f_local: "Lokālā izpilde",
    f_webhooks: "Cloudhooks",
    f_managed: "Pārvalda integrācijas",
    f_language: "Valoda",
    f_voice: "Balss",
    yes: "Jā",
    no: "Nē",
    cs_ready: "Derīgs",
    cs_generating: "Tiek veidots",
    cs_loading: "Tiek ielādēts",
    cs_loaded: "Ielādēts",
    cs_error: "Kļūda",
    zoom_in: "Rādīt pilno karti",
    zoom_out: "Atpakaļ uz kompakto skatu",
    ed_title: "Virsraksts",
    ed_remote_entity: "Sensors Remote UI",
    ed_illustration: "Ilustrēts baneris",
    ed_illustration_theme: "Banera motīvs",
    theme_auto: "Automātiski (pēc tēmas)",
    theme_day: "Diena",
    theme_night: "Nakts",
    ed_uptime_days: "Pieejamības periods (dienas)",
    ed_show_indicators: "Rādītāji",
    ed_show_services: "Pakalpojumi",
    ed_show_buttons: "Pogas",
    ed_latency: "Mērīt latentumu",
    ed_hide_url: "Slēpt attālo URL",
    ed_zoom: "Tālummaiņas poga",
    ed_language: "Valoda",
    lang_auto: "Automātiski",
  },
  el: {
    title: "Home Assistant Cloud",
    title_short: "Cloud",
    loading: "Φόρτωση…",
    connected: "Συνδεδεμένο",
    connecting: "Σύνδεση",
    disconnected: "Αποσυνδεδεμένο",
    signed_out: "Αποσυνδεδεμένος λογαριασμός",
    not_set_up: "Δεν έχει ρυθμιστεί",
    sub_expired: "Η συνδρομή έληξε",
    check_one: "Για έλεγχο: {n}",
    check_other: "Για έλεγχο: {n}",
    renews: "Ανανέωση {date}",
    ends: "Λήγει {date}",
    remote_on: "Απομακρυσμένη πρόσβαση ενεργή",
    remote_off: "Απομακρυσμένη πρόσβαση ανενεργή",
    remote_down: "Η απομακρυσμένη πρόσβαση δεν λειτουργεί",
    remote_down_for: "Απομακρυσμένη εκτός · {d}",
    latency: "Καθυστέρηση",
    latency_help: "Χρόνος μετάβασης και επιστροφής από αυτό το πρόγραμμα περιήγησης στο Home Assistant μέσω της απομακρυσμένης διεύθυνσης",
    uptime: "Διαθεσιμότητα {n} η",
    uptime_help: "Χρόνος λειτουργίας της απομακρυσμένης σύνδεσης, από το ιστορικό του αισθητήρα Remote UI",
    certificate: "Πιστοποιητικό",
    cert_short: "Πιστ. {n} η",
    cert_help: "Ημέρες μέχρι τη λήξη του πιστοποιητικού απομακρυσμένης πρόσβασης",
    unit_days: "η",
    remote: "Απομακρυσμένη πρόσβαση",
    backup: "Αντίγραφο στο cloud",
    webhooks: "Webhooks",
    tts: "TTS στο cloud",
    st_off: "Ανενεργό",
    st_on: "Ενεργό",
    st_down: "Εκτός λειτουργίας · {d}",
    st_cert_error: "Σφάλμα πιστοποιητικού",
    st_cert_wait: "Προετοιμασία πιστοποιητικού",
    st_linked: "Συνδεδεμένος λογαριασμός",
    st_not_linked: "Μη συνδεδεμένος λογαριασμός",
    st_relink: "Απαιτείται νέα σύνδεση",
    entities_one: "Οντότητες: {n}",
    entities_other: "Οντότητες: {n}",
    active_one: "Ενεργά: {n}",
    active_other: "Ενεργά: {n}",
    st_none: "Κανένα",
    st_ready: "Έτοιμο",
    st_offline: "Εκτός σύνδεσης",
    st_no_backup: "Κανένα αντίγραφο στο cloud",
    st_backup_error: "Η αποστολή απέτυχε",
    today: "Σήμερα {time}",
    yesterday: "Χθες {time}",
    minutes: "{n} λεπ.",
    hours: "{n} ώ.",
    days: "{n} η",
    sync: "Συγχρονισμός φωνητικών βοηθών",
    syncing: "Συγχρονισμός…",
    synced: "Οι φωνητικοί βοηθοί συγχρονίστηκαν",
    sync_failed: "Ο συγχρονισμός απέτυχε: {error}",
    open_url: "Άνοιγμα απομακρυσμένης διεύθυνσης",
    settings: "Ρυθμίσεις cloud",
    close: "Κλείσιμο",
    msg_not_set_up: "Το Home Assistant Cloud δεν έχει ρυθμιστεί σε αυτή την εγκατάσταση.",
    msg_signed_out: "Συνδεθείτε στο Home Assistant Cloud για απομακρυσμένη πρόσβαση, αντίγραφα στο cloud και φωνητικούς βοηθούς.",
    f_url: "Απομακρυσμένη διεύθυνση",
    f_status: "Κατάσταση",
    f_cert: "Πιστοποιητικό",
    f_expires: "Λήγει",
    f_allow: "Ενεργοποίηση από τον λογαριασμό",
    f_last: "Τελευταίο αντίγραφο στο cloud",
    f_size: "Μέγεθος",
    f_count: "Αντίγραφα στο cloud",
    f_next: "Επόμενο αυτόματο αντίγραφο",
    f_report: "Αναφορά κατάστασης",
    f_entities: "Εκτεθειμένες οντότητες",
    f_local: "Τοπική εκτέλεση",
    f_webhooks: "Cloudhooks",
    f_managed: "Διαχειρίζονται από ενσωματώσεις",
    f_language: "Γλώσσα",
    f_voice: "Φωνή",
    yes: "Ναι",
    no: "Όχι",
    cs_ready: "Έγκυρο",
    cs_generating: "Δημιουργείται",
    cs_loading: "Φορτώνεται",
    cs_loaded: "Φορτώθηκε",
    cs_error: "Σφάλμα",
    zoom_in: "Εμφάνιση πλήρους κάρτας",
    zoom_out: "Επιστροφή στη συμπαγή προβολή",
    ed_title: "Τίτλος",
    ed_remote_entity: "Αισθητήρας Remote UI",
    ed_illustration: "Εικονογραφημένο banner",
    ed_illustration_theme: "Θέμα του banner",
    theme_auto: "Αυτόματο (ακολουθεί το θέμα)",
    theme_day: "Μέρα",
    theme_night: "Νύχτα",
    ed_uptime_days: "Περίοδος διαθεσιμότητας (ημέρες)",
    ed_show_indicators: "Δείκτες",
    ed_show_services: "Υπηρεσίες",
    ed_show_buttons: "Κουμπιά",
    ed_latency: "Μέτρηση καθυστέρησης",
    ed_hide_url: "Απόκρυψη απομακρυσμένης διεύθυνσης",
    ed_zoom: "Κουμπί μεγέθυνσης",
    ed_language: "Γλώσσα",
    lang_auto: "Αυτόματο",
  },
};

// Brand names, never translated.
const BRANDS = { alexa: "Alexa", google: "Google Assistant" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// The width of an element's whole text in fractional pixels, even while it is cut with an ellipsis (0 when hidden).
const textWidth = (el) => {
  if (!el?.getClientRects?.().length || typeof document.createRange !== "function") return 0;
  const range = document.createRange();
  range.selectNodeContents(el);
  return range.getBoundingClientRect().width;
};

const lang = (hass, config) => {
  const l = config?.language || (hass && (hass.locale?.language || hass.language)) || "en";
  return STRINGS[l] ? l : STRINGS[l.split("-")[0]] ? l.split("-")[0] : "en";
};

// Locale for Intl: Home Assistant's full locale when its base matches the card's resolved language (keeps the
// region, e.g. pt-BR or de-CH), otherwise the resolved language. Home Assistant's "pt" is European Portuguese,
// which Intl would format as Brazilian, so bare "pt" becomes "pt-PT".
const fmtLang = (hass, config) => {
  const l = lang(hass, config);
  const ha = hass && (hass.locale?.language || hass.language);
  const loc = ha && ha.split("-")[0] === l.split("-")[0] && l !== "sr-Latn" ? ha : l;
  return loc === "pt" ? "pt-PT" : loc;
};

// A text of the card's language, English when missing, with its {placeholders} filled.
const t = (hass, config, key, vars = {}) => {
  const s = STRINGS[lang(hass, config)][key] ?? STRINGS.en[key] ?? key;
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
};

// "38 entities": the plural form of the card's language (Intl.PluralRules), the `_other` form when the language has
// no text for that form.
const plural = (hass, config, key, n) => {
  let cat = "other";
  try {
    cat = new Intl.PluralRules(fmtLang(hass, config)).select(n);
  } catch (_e) {
    /* default form */
  }
  const table = STRINGS[lang(hass, config)];
  const k = `${key}_${cat}` in table ? `${key}_${cat}` : `${key}_other`;
  return t(hass, config, k, { n });
};

const svgIcon = (path, cls = "") => `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;

const DAY = 86400000;
const num = (v) => (v === null || v === undefined || v === "" || !Number.isFinite(Number(v)) ? null : Number(v));
const clamp = (v, lo, hi, def) => Math.min(hi, Math.max(lo, Math.round(num(v) ?? def)));
// A date of the API (ISO string, or Unix seconds) in milliseconds, or null.
const toMs = (v) => {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number") return v < 1e12 ? v * 1000 : v;
  const ms = Date.parse(v);
  return Number.isFinite(ms) ? ms : null;
};

// The remote URL with its instance part masked, as Home Assistant's own cloud settings do.
const maskUrl = (url) => url.replace(/^(https:\/\/)([^.]+)/, (_m, p, host) => p + "•".repeat(host.length));

// ---------------------------------------------------------------------------
// Home Assistant Cloud data
// ---------------------------------------------------------------------------

// Backup agent of Home Assistant Cloud (backup integration: `<domain>.<unique_id>` of the cloud agent).
const CLOUD_AGENT = "cloud.cloud";
// Assistant ids of the exposed entities (homeassistant/exposed_entities.py).
const ASSISTANTS = { alexa: "cloud.alexa", google: "cloud.google_assistant" };
const SERVICES = ["remote", "backup", "alexa", "google", "webhooks", "tts"];
// Let's Encrypt certificates of the remote UI: the ring is full at 90 days.
const CERT_SPAN = 90;
// A cloud backup older than this is worth a look (Home Assistant warns after three days as well).
const BACKUP_STALE = 3 * DAY;
// How often each source is read again (ms).
const EVERY = { status: 60000, subscription: 6 * 3600000, backups: 300000, exposed: 300000, uptime: 900000, latency: 60000 };

// The cloud integration's « Remote UI » binary sensor (platform cloud, unique id cloud-remote-ui-connectivity) and the
// backup integration's « last successful automatic backup » sensors, found in the entity registry whatever their
// names, else by their default entity ids. Computed once per registry (hass.entities is replaced only when it changes).
const _found = new WeakMap();
const discover = (hass, config = {}) => {
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
const certDays = (cert, now) => {
  const ms = toMs(cert?.expire_date);
  return ms === null ? null : Math.floor((ms - now) / DAY);
};

// Share of time a connectivity sensor was on between `start` and `end` (ms), from history/history_during_period with
// minimal_response (compressed states: `s`, and `lc` or `lu` in seconds). Time unknown or unavailable (a restart)
// is left out. `days` is the span the recorder actually covers, at most the period asked.
const uptimeOf = (list, start, end) => {
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
const cloudBackup = (info) => {
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
const exposedCount = (exposed, assistant) =>
  exposed?.exposed_entities ? Object.values(exposed.exposed_entities).filter((x) => x?.[assistant]).length : null;

const worst = (levels) => (levels.includes("alert") ? "alert" : levels.includes("warn") ? "warn" : levels.includes("ok") ? "ok" : "idle");

// Everything the cards show, from the data read (`d`), the entities and the configuration. `f` formats texts, dates,
// sizes and durations in the card's language.
const buildModel = (d, hass, config, now, f) => {
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

// ---------------------------------------------------------------------------
// Shadow DOM patching (kept nodes keep their focus, hover and running animations)
// ---------------------------------------------------------------------------

const patchAttrs = (cur, next) => {
  for (const { name } of [...cur.attributes]) if (!next.hasAttribute(name)) cur.removeAttribute(name);
  for (const { name, value } of next.attributes) if (cur.getAttribute(name) !== value) cur.setAttribute(name, value);
};
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute("data-key") : null);
const sameNode = (a, b) => !!a && a.nodeType === b.nodeType && a.nodeName === b.nodeName;
const patchChildren = (cur, next) => {
  const old = [...cur.childNodes];
  const fresh = [...next.childNodes];
  const byKey = new Map();
  for (const o of old) {
    const k = keyOf(o);
    if (k !== null && !byKey.has(k)) byKey.set(k, o);
  }
  const used = new Set();
  fresh.forEach((n, i) => {
    const k = keyOf(n);
    let o = k !== null ? byKey.get(k) : old[i];
    if (!sameNode(o, n) || used.has(o) || (k === null && keyOf(o) !== null)) o = null;
    const ref = cur.childNodes[i] ?? null;
    if (!o) {
      cur.insertBefore(n, ref);
      return;
    }
    used.add(o);
    if (o !== ref) cur.insertBefore(o, ref);
    if (n.nodeType === 1) {
      patchAttrs(o, n);
      patchChildren(o, n);
    } else if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue;
  });
  while (cur.childNodes.length > fresh.length) cur.removeChild(cur.lastChild);
};
const morph = (root, html) => {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  patchChildren(root, tpl.content);
};

// A click inside a dialog (more-info opened from the card) is not a click outside the card.
const inDialog = (ev) => ev.composedPath().some((n) => ["ha-more-info-dialog", "ha-dialog", "dialog"].includes(n.localName));

// "A click elsewhere" is caught on the pointer, not only on the click event: on iOS (Safari and the companion app)
// a tap on something that is not clickable sends no click to the page. The handler runs when the press and the
// release are both outside the card; keyboard clicks (no click count) still go through the click event.
const watchOutside = (card, handler) => {
  let downOutside = false;
  const outside = (ev) => !ev.composedPath().includes(card);
  const onDown = (ev) => {
    downOutside = outside(ev);
  };
  const onUp = (ev) => {
    if (downOutside && outside(ev)) handler(ev);
    downOutside = false;
  };
  const onClick = (ev) => {
    if (ev.detail === 0 && outside(ev)) handler(ev);
  };
  return {
    on() {
      document.addEventListener("pointerdown", onDown, true);
      document.addEventListener("pointerup", onUp, true);
      document.addEventListener("click", onClick, true);
    },
    off() {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("pointerup", onUp, true);
      document.removeEventListener("click", onClick, true);
    },
    tap(ev) {
      onDown(ev);
      onUp(ev);
    },
  };
};

const navigate = (path) => {
  history.pushState(null, "", path);
  window.dispatchEvent(new CustomEvent("location-changed", { detail: { replace: false } }));
};

// ---------------------------------------------------------------------------
// The illustration: sky, a house linked to the cloud, linked to a phone
// ---------------------------------------------------------------------------

// Every animation of the illustration lasts a divisor of 8 s, so a recording of 8 s loops. The scene is drawn in a
// 200 × 80 box whose bottom edge stands on the strip; only its right part (x 80 to 200) is shown, the sky and the
// texts take the rest of the banner.
const STARS = [[84, 6, 0.6], [100, 22, 0.5], [118, 4, 0.6], [138, 14, 0.5], [182, 4, 0.6], [196, 30, 0.5], [92, 40, 0.4], [126, 30, 0.4]];
// The state colour of the link: green (connected), amber (connecting), red (cut off), grey (signed out).
const LINK_COLORS = { ok: "#43a047", wait: "#f5b400", down: "#e5484d", off: "#9aa3ae" };
const P_UP = "M118 58 Q126 30 148 24";
const P_DOWN = "M176 24 Q190 30 190 54";
// The house (left, on the ground), the cloud with its padlock (top), the phone away (right), linked by the encrypted
// tunnel whose dots flow while connected (slower while connecting); cut off, the tunnel breaks with a red cross.
// The pill above shows the latency. uid keeps the ids apart when several cards share a page.
const sceneSvg = (link, night, uid, pill) => {
  const n = night;
  const c = LINK_COLORS[link] ?? LINK_COLORS.off;
  const live = link === "ok" || link === "wait";
  const sky = n
    ? `<g class="stars">${STARS.map(([x, y, r], i) => `<circle class="${i % 3 === 0 ? "tw" : ""}" cx="${x}" cy="${y}" r="${r}"/>`).join("")}</g>
       <mask id="cc-moon-${uid}"><rect x="80" width="120" height="80" fill="#fff"/><circle cx="133.4" cy="7.6" r="3.6" fill="#000"/></mask>
       <circle cx="130.5" cy="9.5" r="6.5" fill="#f3eed2" opacity=".12"/>
       <circle cx="130.5" cy="9.5" r="4" fill="#f3eed2" mask="url(#cc-moon-${uid})"/>`
    : `<g class="clouds"><path class="cloud" d="M118 11a3.6 3.6 0 0 1 .6-7.1A5 5 0 0 1 128 3.4a3.3 3.3 0 0 1-.4 7.6z"/></g>`;
  const links = live
    ? [P_UP, P_DOWN]
        .map((d) => `<path class="tube" d="${d}" stroke="${c}"/><path class="dots ${link}" d="${d}" stroke="${c}"/><path class="dots core ${link}" d="${d}"/>`)
        .join("")
    : `<path class="cut" d="${P_UP}"/><path class="cut" d="${P_DOWN}"/>${
        link === "down" ? '<g transform="translate(133 36)"><circle r="5.4" fill="#e5484d"/><path d="M-2.4 -2.4l4.8 4.8M2.4 -2.4l-4.8 4.8" stroke="#fff" stroke-width="1.5"/></g>' : ""
      }`;
  return `<svg class="scene" viewBox="80 0 120 80" preserveAspectRatio="xMaxYMax meet" aria-hidden="true" focusable="false">
    ${sky}
    <path d="M80 80 C100 72 120 71 140 71.5 C160 72 180 71 200 72 H240 V80Z" fill="${n ? "#17303d" : "#86c27f"}"/>
    <g class="house" transform="translate(104 56)">
      <path d="M-4 1 L14 -12 L32 1Z" fill="${n ? "#3a2a2a" : "#c0603a"}"/>
      <rect y="0" width="28" height="24" fill="${n ? "#2a3646" : "#f3e6d3"}"/>
      <rect x="4" y="6" width="7" height="6" fill="${n ? "#ffcf6e" : "#86b9de"}"/>
      <rect x="15" y="10" width="8" height="14" fill="#8a5a3a"/>
      <rect x="18" y="-8" width="6" height="5" rx="1" fill="#2a3038"/>
      <circle class="${live ? "blink" : ""}" cx="21" cy="-5.5" r=".9" fill="${c}"/>
    </g>
    ${links}
    <g class="hub" transform="translate(162 22)">
      <path d="M-16 6a10 10 0 0 1 18-10a8 8 0 0 1 14 4a7 7 0 0 1 0 14h-30a7 7 0 0 1-2-8z" fill="${n ? "#3d475c" : "#fff"}" stroke="${c}" stroke-width="1.6"/>
      <g transform="translate(0 6)"><rect x="-4" y="-2" width="8" height="6" rx="1" fill="${c}"/><path d="M-2.6 -2v-2a2.6 2.6 0 0 1 5.2 0v2" stroke="${c}" stroke-width="1.2" fill="none"/></g>
    </g>
    <g class="phone" transform="translate(190 68)">
      <rect x="-6" y="-12" width="12" height="22" rx="2.4" fill="#22262b"/>
      <rect x="-4.6" y="-10" width="9.2" height="16" rx="1" fill="${live ? (n ? "#3d5a8a" : "#86b9de") : "#3a3f48"}"/>
      <path d="M-2 -4l2-2l2 2v4h-4z" fill="#fff" opacity="${live ? 0.9 : 0.3}"/>
    </g>
    ${
      pill
        ? `<g class="pill" transform="translate(97 16)"><rect x="-15" y="-7" width="30" height="13" rx="6.5" fill="${n ? "#2a3446" : "#fff"}" stroke="${c}"/>
      <text y="2.4" text-anchor="middle" font-size="6.4" font-weight="700" font-family="sans-serif" fill="${c}">${esc(pill)}</text></g>`
        : ""
    }
  </svg>`;
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const STYLE = `
  :host { --cc-accent: #2f80ed; --cc-ok: var(--success-color, #43a047); --cc-warn: var(--warning-color, #ffa600);
          --cc-alert: var(--error-color, #db4437); --cc-idle: var(--secondary-text-color, #9e9e9e);
          --cc-primary: var(--primary-color, #03a9f4); display: block; }
  ha-card { overflow: hidden; position: relative; container: cc-card / inline-size; }
  /* A size container has no width of its own content: in a parent sized by its content the card would fall to a
     few pixels. This empty grid gives it a natural width of 400 px without any minimum. */
  :host::before { content: ""; display: grid; grid-template-columns: minmax(0, 400px); height: 0; }
  .icon { width: 18px; height: 18px; fill: currentColor; flex: none; }
  button:focus-visible, [role="button"]:focus-visible { outline: 2px solid var(--primary-color, #03a9f4); outline-offset: 2px; }
  .ok { --c: var(--cc-ok); } .warn { --c: var(--cc-warn); } .alert { --c: var(--cc-alert); } .idle { --c: var(--cc-idle); }
  /* Status pill: the state colour on a tint, the text mixed with the text colour to stay readable. */
  .chip { display: inline-flex; align-items: center; gap: 4px; padding: 1px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
          line-height: 16px; white-space: nowrap; min-width: 0; max-width: 100%; box-sizing: border-box; overflow: hidden;
          background: color-mix(in srgb, var(--c) 15%, transparent); color: color-mix(in srgb, var(--c) 40%, var(--primary-text-color, #212121)); }
  .chip .txt { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--c); flex: none; }

  /* ── Illustrated header: 90 px, the scene on the right standing on a 10 px network strip ── */
  .banner { position: relative; height: 90px; overflow: hidden; --strip-h: 10px; --scene-w: min(120px, 46%);
            --sky-text: #0d2a45; --sky-muted: #3b5b78;
            background: linear-gradient(90deg, #f1f8ff 0%, #e2f1fd 34%, #b9def8 70%, #9fd0f3 100%); }
  .banner.night { --sky-text: #ffffff; --sky-muted: rgba(255,255,255,.78);
                  background: linear-gradient(90deg, #1b2f52 0%, #15284a 36%, #0f1f3d 72%, #0a1830 100%); }
  .banner .scene { position: absolute; right: 0; bottom: var(--strip-h); height: calc(100% - var(--strip-h)); width: var(--scene-w); overflow: hidden; }
  /* The network strip: cyan packets on a navy cable, running while the cloud is reached; cut off, red dashes on grey. */
  .strip { position: absolute; left: 0; right: 0; bottom: 0; height: var(--strip-h); background-color: #1e3a5f;
           background-image: linear-gradient(90deg, #4fc3f7 0 14px, transparent 14px); background-size: 22px 2px;
           background-repeat: repeat-x; background-position: 0 50%; box-shadow: inset 0 2px 0 #2f5a8a; }
  .night .strip { background-color: #0f1d33; box-shadow: inset 0 2px 0 #1e3a5f; }
  .strip.down { background-color: #5a6370; background-image: linear-gradient(90deg, #e5484d 0 6px, transparent 6px);
                background-size: 16px 2px;
                box-shadow: inset 0 2px 0 #77808c; }
  .night .strip.down { background-color: #2c323b; box-shadow: inset 0 2px 0 #3a414c; }
  .strip.ok { animation: cc-packets 1s linear infinite; } .strip.wait { animation: cc-packets 2s linear infinite; }
  .strip.off { opacity: .75; }
  .head { position: absolute; z-index: 1; left: 0; top: 0; bottom: var(--strip-h); right: var(--scene-w); box-sizing: border-box;
          display: flex; align-items: center; gap: 10px; padding: 6px 8px 6px 14px; min-width: 0; color: var(--sky-text); }
  /* The header icon: its colour is the cloud's state (blue connected, amber connecting, red cut off, grey signed out). */
  .badge { width: 40px; height: 40px; flex: none; border-radius: 50%; display: grid; place-items: center; color: var(--c, var(--cc-idle)); }
  .banner .badge.ok, .header .badge.ok { --c: var(--cc-accent); }
  .banner .badge { background: rgba(255,255,255,.62); box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c) 22%, transparent); }
  .night .badge { background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.14); }
  .night .badge.ok { --c: #8fbaff; } .night .badge.warn { --c: #ffc94d; } .night .badge.alert { --c: #ff8a80; } .night .badge.idle { --c: #9aa5b1; }
  .badge .icon { width: 24px; height: 24px; }
  .titles { flex: 1 1 0; min-width: 0; overflow: hidden; container: cc-titles / inline-size; display: flex; flex-direction: column; align-items: flex-start; }
  .titles > * { max-width: 100%; }
  /* The status pill sits on the title line, right after the title, when the whole title and its whole label fit there;
     otherwise it goes on its own line under the statistics (then kept to one line), and when even that is too tight
     only its dot is left (the label stays in its tooltip and for screen readers). Decided by measure (see _fitPill). */
  .trow { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .trow .name { flex: 0 1 auto; min-width: 0; }
  .trow .hst { flex: none; max-width: none; }
  .titles .stats { align-self: stretch; }
  .titles.pill-below .trow { display: contents; }
  .titles.pill-below .trow .name, .titles.pill-below .trow .hst { max-width: 100%; }
  .titles.pill-below .trow .hst { order: 3; margin-top: 3px; }
  .titles.pill-below .stats { max-height: 16px; }
  .titles.pill-dot .hst { padding: 5px; }
  .titles.pill-dot .hst .txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
  @container cc-card (max-width: 200px) { .hst { padding: 5px; } .hst .txt { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); } }
  .hst { position: relative; }
  /* Its colour is the header icon's. */
  .hst.ok { --c: var(--cc-accent); }
  .banner .hst { background: color-mix(in srgb, var(--c) 18%, rgba(255,255,255,.78)); color: color-mix(in srgb, var(--c) 45%, #0d2a45); }
  .banner.night .hst { background: color-mix(in srgb, var(--c) 30%, rgba(8,18,38,.55)); color: color-mix(in srgb, var(--c) 35%, #ffffff); }
  .night .hst.ok { --c: #8fbaff; } .night .hst.warn { --c: #ffc94d; } .night .hst.alert { --c: #ff8a80; } .night .hst.idle { --c: #9aa5b1; }
  .name { font-size: 16px; font-weight: 500; line-height: 1.25; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  /* The statistics on two lines at most; the "·" that starts a line sits in the negative margin, clipped. */
  .stats { display: flex; flex-wrap: wrap; max-height: 32px; overflow: hidden; margin-left: -10px; font-size: 12px; line-height: 16px; color: var(--sky-muted); }
  /* A part longer than the line (a long language) ends with an ellipsis. */
  .stats span { white-space: nowrap; min-width: 0; max-width: 100%; overflow: hidden; text-overflow: ellipsis; box-sizing: border-box; }
  .stats span::before { content: "·"; display: inline-block; width: 10px; text-align: center; }
  /* Scene: sky details and the tunnel. */
  .scene .clouds { fill: #ffffff; opacity: .92; }
  .scene .stars { fill: #ffffff; opacity: .85; }
  .scene .tube { fill: none; stroke-width: 2; opacity: .55; }
  .scene .dots { fill: none; stroke-width: 4; stroke-linecap: round; stroke-dasharray: 0 9; animation: cc-flow 1s linear infinite; }
  .scene .dots.core { stroke: #ffffff; stroke-width: 2; }
  .scene .dots.wait { animation-duration: 2s; }
  .scene .cut { fill: none; stroke: #9aa3ae; stroke-width: 1.6; stroke-dasharray: 3 3; }
  /* ── Animations (each one a divisor of 8 s) ── */
  .scene .cloud { animation: cc-drift 4s ease-in-out infinite alternate; }
  .scene .stars .tw { animation: cc-twinkle 4s ease-in-out infinite; }
  .scene .stars .tw:nth-child(2n) { animation-delay: -2s; }
  .scene .blink { animation: cc-twinkle 2s ease-in-out infinite; }
  @keyframes cc-flow { to { stroke-dashoffset: -18; } }
  @keyframes cc-drift { from { transform: translateX(0); } to { transform: translateX(6px); } }
  @keyframes cc-packets { from { background-position: 0 50%; } to { background-position: 22px 50%; } }
  @keyframes cc-twinkle { 0%, 100% { opacity: 1; } 50% { opacity: .25; } }
  @media (prefers-reduced-motion: reduce) {
    .scene *, .strip { animation: none !important; }
  }
  /* The mini card's detail button sits in the top-right corner (5 + 24 px): the scene steps left of it at full size,
     its cloud no longer under the button. The hill runs on past the scene's right edge (x 240), under the button. */
  @container (min-width: 301px) {
    .banner:has(> .zoom) .scene { right: 34px; overflow: visible; }
    .banner:has(> .zoom) .head { right: calc(var(--scene-w) + 34px); }
  }
  /* A narrow card keeps the sky and the strip for its texts: no scene. */
  @container (max-width: 300px) {
    .banner .scene { display: none; }
    .head { right: 0; }
  }

  /* ── Classic header (illustration: false) ── */
  .header { display: flex; align-items: center; gap: 10px; padding: 12px 14px 0; }
  .header .badge { color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: none; }
  .header .name { color: var(--primary-text-color); }
  .header .stats { color: var(--secondary-text-color); }

  /* ── Status chips, indicators, services and buttons ── */
  .chips { display: flex; align-items: center; flex-wrap: wrap; gap: 6px 8px; padding: 10px 12px 0; }
  .chips .renew { margin-left: auto; font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; }
  .content { padding: 10px 12px 12px; display: flex; flex-direction: column; gap: 8px; }
  .inds { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
  .ind { min-width: 0; box-sizing: border-box; display: flex; align-items: center; gap: 8px; padding: 8px 10px; border-radius: 12px;
         background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .ind > div { min-width: 0; }
  .ind .lbl { font-size: 12px; line-height: 16px; color: var(--secondary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ind .val { font-size: 18px; font-weight: 500; line-height: 24px; color: var(--primary-text-color); white-space: nowrap; }
  .ind .unit { font-size: 12px; font-weight: 400; color: var(--secondary-text-color); }
  .ind.warn .val, .ind.alert .val { color: var(--c); }
  .ring { flex: none; width: 32px; height: 32px; }
  .ring circle { fill: none; stroke-width: 4; }
  .ring .track { stroke: color-mix(in srgb, var(--c) 18%, transparent); }
  .ring .arc { stroke: var(--c); stroke-linecap: round; }
  @container (max-width: 380px) { .ring { display: none; } .ind { padding: 8px; } }
  .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  @container (max-width: 260px) { .grid, .inds { grid-template-columns: minmax(0, 1fr); } }
  /* Service tiles, the size of Home Assistant's Tile card: a healthy service stays neutral, only an issue is coloured
     (icon badge, state line and dot), the background never tinted. */
  .tile { all: unset; position: relative; box-sizing: border-box; cursor: pointer; min-width: 0; min-height: 56px;
          display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 8px; border-radius: 12px; --t: var(--cc-ok);
          background: var(--secondary-background-color, rgba(127,127,127,.08)); transition: background .2s; }
  .tile.warn { --t: var(--cc-warn); } .tile.alert { --t: var(--cc-alert); } .tile.idle { --t: var(--cc-idle); }
  .tile:hover { background: color-mix(in srgb, var(--t) 13%, var(--secondary-background-color, transparent)); }
  .tile .ic { position: relative; flex: none; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center;
              color: var(--primary-text-color); background: color-mix(in srgb, var(--cc-idle) 14%, transparent); }
  .tile .ic .icon { width: 24px; height: 24px; }
  .tile.warn .ic, .tile.alert .ic { color: var(--t); background: color-mix(in srgb, var(--t) 16%, transparent); }
  .tile .tdot { position: absolute; right: -1px; bottom: -1px; width: 10px; height: 10px; border-radius: 50%; background: var(--t);
                box-shadow: 0 0 0 2px var(--secondary-background-color, #f1f1f1); }
  .tile .txt { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
  .tile .tname { font-size: 14px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .tile .tstate { font-size: 12px; line-height: 1.25; color: var(--secondary-text-color); overflow-wrap: break-word; }
  .tile.warn .tstate, .tile.alert .tstate { color: var(--t); }
  /* Buttons: tinted, never filled. */
  .actions { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 8px; margin-top: 2px; }
  .btn { all: unset; box-sizing: border-box; cursor: pointer; max-width: 100%; border-radius: 8px; padding: 8px 14px; font-size: 13px; font-weight: 500;
         line-height: 1.25; text-align: center; color: var(--primary-text-color); background: var(--secondary-background-color, rgba(127,127,127,.08)); }
  .btn:hover { background: color-mix(in srgb, var(--primary-text-color) 8%, var(--secondary-background-color, transparent)); }
  .btn.tint { color: color-mix(in srgb, var(--cc-primary) 70%, var(--primary-text-color)); background: color-mix(in srgb, var(--cc-primary) 16%, transparent); }
  .btn.tint:hover { background: color-mix(in srgb, var(--cc-primary) 24%, transparent); }
  .btn[aria-disabled="true"] { cursor: default; opacity: .6; }
  .msg { padding: 14px 16px 16px; font-size: 13px; line-height: 1.45; color: var(--secondary-text-color); }
  .msg .btn { margin-top: 10px; }

  /* ── Detail popup, at the top of the card ── */
  .backdrop { position: absolute; inset: 0; background: rgba(0,0,0,.4); display: flex; align-items: flex-start; justify-content: center;
              padding-top: 10px; box-sizing: border-box; z-index: 9; border-radius: inherit; }
  .modal { background: var(--card-background-color, #fff); color: var(--primary-text-color); width: min(94%, 380px); max-height: calc(100% - 20px);
           overflow: auto; box-sizing: border-box; border-radius: 14px; padding: 14px; box-shadow: 0 8px 30px rgba(0,0,0,.35);
           display: flex; flex-direction: column; gap: 10px; }
  .mhead { display: flex; align-items: center; gap: 10px; }
  .mhead .badge { width: 36px; height: 36px; color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: none; }
  .mhead .badge .icon { width: 20px; height: 20px; }
  .mhead h3 { flex: 1 1 auto; min-width: 0; margin: 0; font-size: 16px; font-weight: 500; line-height: 1.3; overflow-wrap: anywhere; }
  .close { all: unset; flex: none; cursor: pointer; width: 28px; height: 28px; border-radius: 50%; display: grid; place-items: center;
           color: var(--secondary-text-color); box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); }
  .close:hover { color: var(--primary-text-color); background: color-mix(in srgb, var(--secondary-text-color) 12%, transparent); }
  .close .icon { width: 16px; height: 16px; }
  .facts { display: grid; grid-template-columns: fit-content(42%) minmax(0, 1fr); gap: 5px 12px; margin: 0; font-size: 13px; }
  .facts dt { color: var(--secondary-text-color); }
  .facts dd { margin: 0; overflow-wrap: anywhere; }
  .modal .actions { margin-top: 0; }
`;

// The mini card: badge, title and status, then the chips; its detail button unfolds the full card.
const MINI_STYLE = `
  ha-card.minic { padding: 12px; }
  .mini { display: flex; align-items: flex-start; gap: 10px; }
  .mini .badge { color: var(--c); background: color-mix(in srgb, var(--c) 16%, transparent); box-shadow: none; }
  .mbody { flex: 1; min-width: 0; min-height: 40px; display: flex; flex-direction: column; justify-content: center; gap: 4px; }
  .mrow { display: flex; align-items: center; gap: 8px; }
  .mtitle { flex: 1 1 0; min-width: 5ch; font-size: 16px; font-weight: 500; line-height: 1.25; color: var(--primary-text-color);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .st { flex: 0 1 auto; min-width: 0; font-size: 11px; font-weight: 500; color: var(--c); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .rs { display: flex; flex-wrap: wrap; gap: 2px 4px; margin-left: -4px; }
  .rs:empty { display: none; }
  /* A chip is plain (icon and text) until it needs a look: then a tinted pill. It never runs past the card. */
  .r { display: inline-flex; align-items: center; gap: 1px; padding: 0 5px 0 4px; box-sizing: border-box; min-width: 0; max-width: 100%;
       overflow: hidden; border-radius: 999px; font-size: 12px; font-weight: 500; line-height: 18px; white-space: nowrap;
       --t: var(--cc-ok); color: var(--primary-text-color); }
  .r.warn { --t: var(--cc-warn); } .r.alert { --t: var(--cc-alert); } .r.idle { --t: var(--cc-idle); }
  .r .icon { width: 13px; height: 13px; color: var(--t); margin-right: 2px; }
  .r > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
  .r.pill { color: var(--t); background: color-mix(in srgb, var(--t) 14%, transparent); }
  .zoom { all: unset; flex: none; cursor: pointer; width: 24px; height: 24px; margin: -4px -4px -4px 0; border-radius: 50%;
          display: grid; place-items: center; color: var(--secondary-text-color); }
  .zoom .icon { width: 16px; height: 16px; }
  .zoom:hover { background: color-mix(in srgb, var(--cc-idle) 16%, transparent); color: var(--primary-text-color); }
  /* Banner (illustration on): the detail button in the banner's top-right corner, as on the unfolded card. */
  .banner .zoom { position: absolute; z-index: 2; top: 5px; right: 5px; margin: 0; color: #33506b; background: rgba(255,255,255,.55);
                  box-shadow: inset 0 0 0 1px rgba(255,255,255,.7); backdrop-filter: blur(4px); }
  .banner .zoom:hover { background: rgba(255,255,255,.75); }
  .banner .zoom.on-night { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .banner .zoom.on-night:hover { background: rgba(255,255,255,.22); }
  /* A narrow mini card (no scene): its texts stop before the button. */
  @container cc-card (max-width: 300px) { .banner .head { right: 34px; } }
  .mchips { padding: 8px 12px 10px; }
`;

// The unfolded mini card: the full card, with the detail button over its banner.
const ZOOM_STYLE = `
  .zoom { all: unset; position: absolute; z-index: 2; top: 5px; right: 5px; cursor: pointer; width: 24px; height: 24px; border-radius: 50%;
          display: grid; place-items: center; color: #33506b; background: rgba(255,255,255,.55); box-shadow: inset 0 0 0 1px rgba(255,255,255,.7);
          backdrop-filter: blur(4px); }
  .zoom:hover { background: rgba(255,255,255,.75); }
  .zoom.on-night { color: #ffffff; background: rgba(255,255,255,.12); box-shadow: inset 0 0 0 1px rgba(255,255,255,.2); }
  .zoom.on-night:hover { background: rgba(255,255,255,.22); }
  .zoom.plain { color: var(--secondary-text-color); background: none; box-shadow: inset 0 0 0 1px var(--divider-color, rgba(127,127,127,.3)); top: 18px; right: 12px; }
  .zoom .icon { width: 16px; height: 16px; }
  .header { position: relative; padding-right: 48px; }
  /* A narrow card (no scene): the banner's texts stop before the button. */
  @container cc-card (max-width: 300px) { .banner .head { right: 34px; } }
`;

// ---------------------------------------------------------------------------
// The full card
// ---------------------------------------------------------------------------

let _ccUid = 0;

const TILE_ICONS = { remote: "remote", backup: "backup", alexa: "mic", google: "mic", webhooks: "webhook", tts: "tts" };

class CloudCard extends HTMLElement {
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

  // A size in bytes, base 1024 as in Home Assistant's backup settings.
  _size(bytes) {
    const units = ["B", "KB", "MB", "GB", "TB"];
    let v = bytes;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
      v /= 1024;
      i++;
    }
    return `${this._number(v, i && v < 10 ? 1 : 0)} ${units[i]}`;
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

// ---------------------------------------------------------------------------
// The mini card: status and chips; its detail button unfolds the full card
// ---------------------------------------------------------------------------

class CloudMiniCard extends CloudCard {
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

// ---------------------------------------------------------------------------
// Visual editors (ha-form)
// ---------------------------------------------------------------------------

// Options on by default (left out of the YAML while on), and off by default (left out while off).
const ON_BY_DEFAULT = ["illustration", "show_indicators", "show_services", "show_buttons", "latency", "zoom"];
const OFF_BY_DEFAULT = ["hide_url"];
const LANGUAGES = [
  ["en", "English"], ["fr", "Français"], ["de", "Deutsch"], ["es", "Español"], ["sr", "Српски"], ["sr-Latn", "Srpski (latinica)"],
  ["it", "Italiano"], ["nl", "Nederlands"], ["pt", "Português (Portugal)"], ["pl", "Polski"], ["ro", "Română"], ["da", "Dansk"],
  ["sv", "Svenska"], ["bg", "Български"], ["ru", "Русский"], ["uk", "Українська"], ["hu", "Magyar"], ["sk", "Slovenčina"],
  ["cs", "Čeština"], ["sl", "Slovenščina"], ["lv", "Latviešu"], ["el", "Ελληνικά"],
];

class CloudCardEditor extends HTMLElement {
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
    const data = { illustration_theme: "auto", uptime_days: 30, ...this._config };
    for (const k of ON_BY_DEFAULT) if (data[k] === undefined) data[k] = true;
    for (const k of OFF_BY_DEFAULT) if (data[k] === undefined) data[k] = false;
    this._form.hass = this._hass;
    this._form.data = data;
    this._form.schema = this._schema();
  }
}

class CloudMiniCardEditor extends CloudCardEditor {
  static get mini() {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

const define = (name, cls) => {
  if (!customElements.get(name)) customElements.define(name, cls);
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
